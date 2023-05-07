const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Token contract", function () {
    let owner, seller, buyer;
    let contract;
    let listingPrice;

    const uri = "/";
    const nftPrice = ethers.utils.parseEther('0.01');

    beforeEach(async function () {
        [owner, seller, buyer] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("MarketContract");
        contract = await Token.deploy();
        listingPrice = await contract.getListPrice();
    });

    it('Should return the next token ID to mint', async function () {
        const tx = await contract.getNextId();
        expect(tx).to.equal(1);
    });

    it("Minted token should be owned by account", async function () {
        await contract.createToken(seller.address, uri);
        const tx = await contract.ownerOf(1);
        expect(tx).to.equal(seller.address);
    });

    it("Listing should be transferred to contract", async function () {
        await contract.createToken(seller.address, uri);
        await contract.connect(seller).listToken(1, '/new', nftPrice, { value: listingPrice });

        const tx = await contract.ownerOf(1);
        expect(tx).to.equal(contract.address);
    });

    it("Token should be transferred to buyer on sale", async function () {
        await contract.createToken(seller.address, uri);
        await contract.connect(seller).listToken(1, uri, nftPrice, { value: listingPrice });
        await contract.connect(buyer).executeSale(1, uri, { value: nftPrice});

        const tx = await contract.ownerOf(1);
        expect(tx).to.equal(buyer.address);
    });

    it("Should get all tokens in an array", async function () {
        await contract.createToken(seller.address, uri);
        await contract.connect(seller).listToken(1, uri, nftPrice, { value: listingPrice });
        await contract.connect(buyer).executeSale(1, uri, { value: nftPrice});
        await contract.createToken(seller.address, uri);

        const tx = await contract.getAllTokens();
        expect(tx.length).to.equal(2);
    });
});