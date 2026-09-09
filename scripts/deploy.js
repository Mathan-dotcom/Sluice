const hre = require("hardhat");

async function main() {
  console.log("=========================================");
  console.log("Deploying UsageVault to Arc Network...");
  console.log("Network Name:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  console.log("=========================================");

  const [deployer] = await hre.ethers.getSigners();
  if (deployer) {
    console.log("Deploying from account:", deployer.address);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "USDC (Native Gas)");
  }

  const UsageVault = await hre.ethers.getContractFactory("UsageVault");
  const vault = await UsageVault.deploy();
  await vault.waitForDeployment();

  const vaultAddress = await vault.getAddress();
  console.log(">>> UsageVault successfully deployed to:", vaultAddress);
  console.log(">>> View on Explorer: https://testnet.arcscan.app/address/" + vaultAddress);
  console.log("=========================================");
  console.log("Next steps:");
  console.log("1. Add NEXT_PUBLIC_USAGE_VAULT_ADDRESS=" + vaultAddress + " to your .env.local");
  console.log("2. Set GATEWAY_PRIVATE_KEY in .env.local if relaying payments on Arc");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
