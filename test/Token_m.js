const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AITU_SE2324_KV Contract", function () {
  let AITUContract;
  let aitu;
  let owner;
  let addr1;
  let addr2;
  const initialSupply = ethers.utils.parseUnits("1000", 18);

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const AITUFactory = await ethers.getContractFactory("AITU_SE2324_KV");
    aitu = await AITUFactory.deploy(initialSupply, owner.address);
    await aitu.deployed();
  });

  it("Should deploy with the correct initial supply", async function () {
    const ownerBalance = await aitu.balanceOf(owner.address);
    expect(ownerBalance).to.equal(initialSupply);
  });

  it("Should allow the owner to mint tokens", async function () {
    const mintAmount = ethers.utils.parseUnits("500", 18);
    await aitu.mint(addr1.address, mintAmount);
    const balance = await aitu.balanceOf(addr1.address);
    expect(balance).to.equal(mintAmount);
  });

  it("Should prevent non-owners from minting tokens", async function () {
    const mintAmount = ethers.utils.parseUnits("100", 18);
    await expect(aitu.connect(addr1).mint(addr1.address, mintAmount)).to.be.revertedWith("Only the owner can call this function");
  });

  it("Should update the latest transaction on transfer", async function () {
    const transferAmount = ethers.utils.parseUnits("50", 18);
    await aitu.transfer(addr1.address, transferAmount);

    const latestTransaction = await aitu.latestTransaction();

    expect(latestTransaction.sender).to.equal(owner.address);
    expect(latestTransaction.receiver).to.equal(addr1.address);
    expect(latestTransaction.amount).to.equal(transferAmount);
  });

  it("Should correctly return the latest transaction timestamp", async function () {
    const transferAmount = ethers.utils.parseUnits("10", 18);

    const tx = await aitu.transfer(addr1.address, transferAmount);
    const blockTimestamp = (await ethers.provider.getBlock(tx.blockNumber)).timestamp;

    const latestTransaction = await aitu.latestTransaction();

    expect(latestTransaction.timestamp).to.equal(blockTimestamp);
  });

  it("Should correctly handle transferFrom and update latest transaction", async function () {
    const approveAmount = ethers.utils.parseUnits("100", 18);
    const transferAmount = ethers.utils.parseUnits("50", 18);

    await aitu.approve(addr1.address, approveAmount);
    await aitu.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);

    const latestTransaction = await aitu.latestTransaction();

    expect(latestTransaction.sender).to.equal(owner.address);
    expect(latestTransaction.receiver).to.equal(addr2.address);
    expect(latestTransaction.amount).to.equal(transferAmount);
  });

  it("Should fail for timestamp-related errors (e.g., future timestamps)", async function () {
    const timestampFuture = Math.floor(Date.now() / 1000) + 1000;
    await expect(aitu.timestampToString(timestampFuture)).to.be.revertedWith("Timestamp cannot be in the future");
  });

  it("Should convert timestamp to a string correctly", async function () {
    const currentTime = Math.floor(Date.now() / 1000);
    const result = await aitu.timestampToString(currentTime);
    expect(result).to.include("0 seconds ago");
  });
});
