const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UsageVault Smart Contract", function () {
  let UsageVault;
  let vault;
  let owner;
  let seller;
  let payer;
  let gateway;

  const PRICE = ethers.parseEther("0.05"); // 0.05 USDC
  const THRESHOLD = ethers.parseEther("0.1"); // 0.1 USDC

  beforeEach(async function () {
    [owner, seller, payer, gateway] = await ethers.getSigners();
    UsageVault = await ethers.getContractFactory("UsageVault");
    vault = await UsageVault.deploy();
    await vault.waitForDeployment();
  });

  it("Should set the deployer as owner and authorize as initial gateway", async function () {
    expect(await vault.owner()).to.equal(owner.address);
    expect(await vault.authorizedGateways(owner.address)).to.be.true;
  });

  it("Should record payment and credit seller balance with native USDC", async function () {
    const tx = await vault.connect(payer).recordPayment(
      seller.address,
      payer.address,
      PRICE,
      "summarize/v1",
      { value: PRICE }
    );

    await expect(tx)
      .to.emit(vault, "UsageRecorded")
      .withArgs(seller.address, payer.address, PRICE, (await ethers.provider.getBlock(tx.blockNumber)).timestamp, "summarize/v1");

    const balance = await vault.balanceOf(seller.address);
    expect(balance).to.equal(PRICE);

    const info = await vault.getSellerInfo(seller.address);
    expect(info.balance).to.equal(PRICE);
    expect(info.totalCalls).to.equal(1n);
    expect(info.totalEarned).to.equal(PRICE);
    expect(await vault.totalPlatformCalls()).to.equal(1n);
    expect(await vault.totalPlatformVolume()).to.equal(PRICE);
  });

  it("Should allow seller to set custom withdraw threshold", async function () {
    await vault.connect(seller).setWithdrawThreshold(THRESHOLD);
    const info = await vault.getSellerInfo(seller.address);
    expect(info.threshold).to.equal(THRESHOLD);
  });

  it("Should revert withdraw if threshold is not met", async function () {
    await vault.connect(seller).setWithdrawThreshold(THRESHOLD);
    
    // Deposit 0.05 USDC (less than 0.1 threshold)
    await vault.connect(payer).recordPayment(
      seller.address,
      payer.address,
      PRICE,
      "summarize/v1",
      { value: PRICE }
    );

    await expect(vault.connect(seller).withdraw()).to.be.revertedWithCustomError(
      vault,
      "ThresholdNotMet"
    );
  });

  it("Should allow withdraw once threshold is met and transfer native USDC", async function () {
    await vault.connect(seller).setWithdrawThreshold(THRESHOLD);

    // Call 1 (0.05)
    await vault.connect(payer).recordPayment(
      seller.address,
      payer.address,
      PRICE,
      "summarize/v1",
      { value: PRICE }
    );

    // Call 2 (0.05) -> Total 0.10, meets threshold!
    await vault.connect(payer).recordPayment(
      seller.address,
      payer.address,
      PRICE,
      "summarize/v1",
      { value: PRICE }
    );

    const sellerInitialBalance = await ethers.provider.getBalance(seller.address);
    const tx = await vault.connect(seller).withdraw();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;

    const sellerFinalBalance = await ethers.provider.getBalance(seller.address);
    expect(await vault.balanceOf(seller.address)).to.equal(0n);
    expect(sellerFinalBalance).to.be.closeTo(
      sellerInitialBalance + THRESHOLD - gasUsed,
      ethers.parseEther("0.001")
    );
  });
});
