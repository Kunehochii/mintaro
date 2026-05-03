// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract AffixNFT is ERC721URIStorage, Ownable {
  uint256 private _nextTokenId;
  uint256 public mintPrice = 0.01 ether;

  event MintRequested(uint256 indexed tokenId, address indexed minter, uint256 seed);
  event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);

  constructor(address initialOwner) ERC721('AffixNFT', 'AFFIX') Ownable(initialOwner) {}

  function mint() external payable {
    require(msg.value == mintPrice, 'Incorrect ETH amount');
    uint256 tokenId = _nextTokenId++;
    uint256 seed = block.prevrandao;

    _safeMint(msg.sender, tokenId);

    emit MintRequested(tokenId, msg.sender, seed);
  }

  function setMintPrice(uint256 _newPrice) external onlyOwner {
    uint256 oldPrice = mintPrice;
    mintPrice = _newPrice;
    emit MintPriceUpdated(oldPrice, _newPrice);
  }

  function setTokenURI(uint256 tokenId, string calldata uri) external onlyOwner {
    _setTokenURI(tokenId, uri);
  }

  function totalMinted() external view returns (uint256) {
    return _nextTokenId;
  }
}
