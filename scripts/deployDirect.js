const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

async function main() {
  console.log("=========================================");
  console.log("Compiling UsageVault.sol with solc 0.8.20...");
  
  const sourcePath = path.resolve(__dirname, '../contracts/UsageVault.sol');
  const source = fs.readFileSync(sourcePath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'UsageVault.sol': {
        content: source,
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasFatal = false;
    output.errors.forEach((err) => {
      console.log(err.formattedMessage);
      if (err.severity === 'error') hasFatal = true;
    });
    if (hasFatal) {
      throw new Error("Compilation failed.");
    }
  }

  const contractData = output.contracts['UsageVault.sol']['UsageVault'];
  const abi = contractData.abi;
  const bytecode = '0x' + contractData.evm.bytecode.object;

  console.log("Compilation successful!");

  const rpcUrl = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const privateKey = process.env.PRIVATE_KEY || '870e6be616b1cda533399d6bb87dcec7a0e3e9000103bc7e02ec6329851c46a9';
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying to Arc Testnet from:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "USDC");

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  console.log("Submitting deployment transaction...");
  const deployment = await factory.deploy();
  const txHash = deployment.deploymentTransaction().hash;
  console.log("Deployment Tx Hash:", txHash);
  console.log("Waiting for block confirmation on Arc Testnet...");

  await deployment.waitForDeployment();
  const vaultAddress = await deployment.getAddress();

  console.log("=========================================");
  console.log(">>> UsageVault DEPLOYED TO:", vaultAddress);
  console.log(">>> View on Explorer: https://testnet.arcscan.app/address/" + vaultAddress);
  console.log("=========================================");

  // Output ABI for application usage
  fs.writeFileSync(
    path.resolve(__dirname, '../lib/UsageVaultABI.json'),
    JSON.stringify(abi, null, 2)
  );

  return { vaultAddress, txHash, abi };
}

main().catch((err) => {
  console.error("Deployment error:", err);
  process.exit(1);
});
