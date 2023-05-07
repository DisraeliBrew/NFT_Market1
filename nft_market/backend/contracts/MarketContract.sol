// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MarketContract is ERC721URIStorage {
    using Counters for Counters.Counter;

    struct Token {
        address payable owner;
        uint256 price;
        bool listing;
    }

    event TokenCreated (
        uint256 indexed tokenId,
        address owner,
        string tokenURI
    );

    event TokenListing (
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );

    event TokenSale (
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    Counters.Counter private _tokenIds;
    address payable _owner;
    uint256 _listPrice = 0.01 ether;

    mapping(uint256 => Token) private _tokens;

    constructor() ERC721("MarketContract", "MAR") {
        _owner = payable(msg.sender);
    }

    // Get the listing price of this market
    function getListPrice() public view returns (uint256) {
        return _listPrice;
    }

    // Get the next token ID to mint
    function getNextId() public view returns (uint256) {
        return _tokenIds.current() + 1;
    }

    // Mint a token for a specific address
    function createToken(address creator, string memory tokenURI) public returns (uint) {
        require(msg.sender == _owner, "Only contract owner can mint token");
        _tokenIds.increment(); // first token id == 1
        uint256 newTokenId = _tokenIds.current();

        _safeMint(creator, newTokenId); // mints a token for creator

        _setTokenURI(newTokenId, tokenURI);
        _tokens[newTokenId].owner = payable(creator);

        emit TokenCreated(newTokenId, creator, tokenURI);

        return newTokenId;
    }

    // List a token
    function listToken(uint256 tokenId, string memory tokenURI, uint256 price) public payable returns (uint) {
        require(tokenId > 0, "Token ID can not be 0");
        require(tokenId <= _tokenIds.current(), "Token ID not in range");
        require(_tokens[tokenId].owner == msg.sender, "Only token owner can list");
        require(msg.value == _listPrice, "Must pay for listing price");
        require(price > 0, "Token price must be positive");

        if (!_tokens[tokenId].listing) {
            _transfer(msg.sender, address(this), tokenId); // transfer to this contract for permission to sell
        }
        _setTokenURI(tokenId, tokenURI);
        _tokens[tokenId].price = price;
        _tokens[tokenId].listing = true;

        emit TokenListing(
            tokenId,
            msg.sender,
            price
        );

        return tokenId;
    }

    // Get all tokens of this market
    function getAllTokens() public view returns (Token[] memory) {
        uint nftCount = _tokenIds.current();
        Token[] memory tokens = new Token[](nftCount);

        for(uint i = 0; i < nftCount; i++)
        {
            Token storage currentItem = _tokens[i + 1];
            tokens[i] = currentItem;
        }

        return tokens;
    }

    // Buy a token
    function executeSale(uint256 tokenId, string memory tokenURI) public payable {
        require(tokenId <= _tokenIds.current(), "Token ID not in range");

        uint price = _tokens[tokenId].price;
        address payable seller = _tokens[tokenId].owner;
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        _tokens[tokenId].listing = false;
        _tokens[tokenId].owner = payable(msg.sender);

        _setTokenURI(tokenId, tokenURI);
        _transfer(address(this), msg.sender, tokenId);
        approve(address(this), tokenId);

        payable(_owner).transfer(_listPrice);
        payable(seller).transfer(msg.value);
    }
}