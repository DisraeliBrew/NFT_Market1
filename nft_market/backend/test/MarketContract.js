const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Token contract", function () {
    let owner, seller, buyer;
    let contract;

    const listingPrice = ethers.utils.parseEther('0.01');
    const uri = "/";
    const nftPrice = ethers.utils.parseEther('0.01');

    beforeEach(async function () {
        [owner, seller, buyer] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("MarketContract");
        contract = await Token.deploy();
    });

    it("Minted token should be owned by account", async function () {
        await contract.connect(seller).createToken(uri);
        const tx = await contract.ownerOf(1);
        expect(tx).to.equal(seller.address);
    });

    it("Listing should be transferred to contract", async function () {
        await contract.connect(seller).createToken(uri);
        await contract.connect(seller).listToken(1, uri, nftPrice, { value: listingPrice });

        const tx = await contract.ownerOf(1);
        expect(tx).to.equal(contract.address);
    });

    it("Token should be transferred to buyer on sale", async function () {
        await contract.connect(seller).createToken(uri, { value: listingPrice });
        await contract.connect(seller).listToken(1, uri, nftPrice, { value: listingPrice });
        await contract.connect(buyer).executeSale(1, { value: nftPrice});

        const tx = await contract.ownerOf(1);
        expect(tx).to.equal(buyer.address);
    });

    it("Should get all tokens in an array", async function () {
        await contract.connect(seller).createToken(uri, { value: listingPrice });
        await contract.connect(seller).listToken(1, uri, nftPrice, { value: listingPrice });
        await contract.connect(buyer).executeSale(1, { value: nftPrice});
        await contract.connect(seller).createToken(uri, { value: listingPrice });

        const tx = await contract.getAllTokens();
        expect(tx.length).to.equal(2);
    });
});