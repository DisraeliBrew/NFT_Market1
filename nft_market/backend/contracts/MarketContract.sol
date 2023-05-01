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

    // Mint a token and list it with tokenURI from IPFS and returns the token id
    function createToken(string memory tokenURI, uint256 price) public payable returns (uint) {
        _tokenIds.increment(); // first token id == 1
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId); // mints a token for caller

        listToken(newTokenId, tokenURI, price);

        emit TokenCreated(newTokenId, msg.sender, tokenURI);

        return newTokenId;
    }

    // List a token
    function listToken(uint256 tokenId, string memory tokenURI, uint256 price) private {
        require(tokenId > 0, "Token ID can not be 0");
        require(tokenId <= _tokenIds.current(), "Token ID not in range");
        require(msg.value == _listPrice, "Must pay for listing price");
        require(price > 0, "Token price must be positive");

        _setTokenURI(tokenId, tokenURI);
        _tokens[tokenId].owner = payable(msg.sender);
        _tokens[tokenId].price = price;
        _tokens[tokenId].listing = true;


        _transfer(msg.sender, address(this), tokenId); // transfer to this contract for permission to sell

        emit TokenListing(
            tokenId,
            msg.sender,
            price
        );
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
    function executeSale(uint256 tokenId) public payable {
        require(tokenId <= _tokenIds.current(), "Token ID not in range");

        uint price = _tokens[tokenId].price;
        address payable seller = _tokens[tokenId].owner;
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        _tokens[tokenId].listing = false;
        _tokens[tokenId].owner = payable(msg.sender);

        _transfer(address(this), msg.sender, tokenId);
        approve(address(this), tokenId);

        payable(_owner).transfer(_listPrice);
        payable(seller).transfer(msg.value);
    }
}