const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Token contract", function () {
    it("Minted token should emit events", async function () {
        const [owner, seller] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("MarketContract");
        const contract = await Token.deploy();

        const uri = "/";
        const price = ethers.utils.parseEther('0.01');

        const tx = contract.connect(seller).createToken(uri, price, { value: ethers.utils.parseEther('0.01') });
        await expect(tx)
            .to.emit(contract, "TokenCreated")
            .withArgs(1, seller.address, uri);
        await expect(tx)
            .to.emit(contract, "TokenListing")
            .withArgs(1, seller.address, price);
    });

    it("Listing should be transferred to contract", async function () {
        const [owner, seller] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("MarketContract");
        const contract = await Token.deploy();

        const uri = "/";
        const price = ethers.utils.parseEther('0.01');

        await contract.connect(seller).createToken(uri, price, { value: ethers.utils.parseEther('0.01') });

        const tx = await contract.ownerOf(1);
        expect(tx).to.equal(contract.address);
    });

    it("Token should be transferred to buyer on sale", async function () {
        const [owner, seller, buyer] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("MarketContract");
        const contract = await Token.deploy();

        const uri = "/";
        const price = ethers.utils.parseEther('0.01');

        await contract.connect(seller).createToken(uri, price, { value: ethers.utils.parseEther('0.01') });
        await contract.connect(buyer).executeSale(1, { value: price});

        const tx = await contract.ownerOf(1);
        expect(tx).to.equal(buyer.address);
    });
});