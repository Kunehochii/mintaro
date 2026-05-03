// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title AffixNFT
 * @notice ERC-721 with paid mint, pseudo-random rarity affixes, URI reveal, and fusion crafting.
 * @dev Randomness uses `block.timestamp` and `block.prevrandao`, which validators can bias or predict.
 *      For manipulation-resistant randomness, integrate Chainlink VRF (or similar) before mainnet use.
 */
contract AffixNFT is ERC721URIStorage, Ownable {
  /// @dev Rarity tier encoded in each affix slot (see NatSpec on randomness).
  uint8 internal constant RARITY_COMMON = 0;
  uint8 internal constant RARITY_RARE = 1;
  uint8 internal constant RARITY_SPLENDID = 2;
  uint8 internal constant RARITY_DIVINE = 3;

  uint256 private _nextTokenId;
  uint256 public mintPrice;

  mapping(uint256 tokenId => uint8[] affixes) private _affixesByToken;
  mapping(uint256 tokenId => bool revealed) private _tokenUriRevealed;

  event MintRequested(uint256 indexed tokenId, address indexed minter, uint256 seed);
  event AffixesAssigned(uint256 indexed tokenId, uint8[] affixes);
  event TokenRevealed(uint256 indexed tokenId, string uri);
  event Fused(uint256[5] burnedTokenIds, uint256 indexed newTokenId, address indexed minter);

  constructor(address initialOwner, uint256 initialMintPrice) ERC721('AffixNFT', 'AFFIX') Ownable(initialOwner) {
    mintPrice = initialMintPrice;
  }

  /**
   * @notice Payable mint; affixes assigned immediately using on-chain pseudo-randomness.
   * @dev See contract-level NatSpec about randomness risks.
   */
  function mint() external payable {
    require(msg.value == mintPrice, 'AffixNFT: incorrect mint payment');
    uint256 tokenId = _nextTokenId++;
    _safeMint(msg.sender, tokenId);
    uint256 seed = uint256(
      keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, tokenId))
    );
    emit MintRequested(tokenId, msg.sender, seed);
    _assignAffixes(tokenId, false);
  }

  /**
   * @notice Owner-only metadata URI for post-mint reveal (e.g. after off-chain image generation).
   * @dev Each token can only be revealed once.
   */
  function setTokenURI(uint256 tokenId, string calldata uri) external onlyOwner {
    require(_ownerOf(tokenId) != address(0), 'AffixNFT: nonexistent token');
    require(!_tokenUriRevealed[tokenId], 'AffixNFT: already revealed');
    _setTokenURI(tokenId, uri);
    _tokenUriRevealed[tokenId] = true;
    emit TokenRevealed(tokenId, uri);
  }

  function setMintPrice(uint256 newPrice) external onlyOwner {
    mintPrice = newPrice;
  }

  /**
   * @notice Burn five Common/Rare NFTs you own to mint one new NFT with no Common affixes.
   * @dev Uses `uint256[]` with length 5 so tests (and callers) can revert on fewer than five ids;
   *      fixed-size `uint256[5]` in the ABI would always pass five words and could not express that case.
   */
  function fuse(uint256[] calldata tokenIds) external {
    require(tokenIds.length == 5, 'AffixNFT: fuse requires exactly 5 tokens');
    for (uint256 i = 0; i < 5; ) {
      for (uint256 j = i + 1; j < 5; ) {
        require(tokenIds[i] != tokenIds[j], 'AffixNFT: duplicate fuse inputs');
        unchecked {
          ++j;
        }
      }
      unchecked {
        ++i;
      }
    }
    for (uint256 i = 0; i < 5; ) {
      uint256 tid = tokenIds[i];
      require(_ownerOf(tid) == msg.sender, 'AffixNFT: fuse requires ownership');
      require(!_hasSplendidOrDivine(tid), 'AffixNFT: cannot fuse high-tier token');
      unchecked {
        ++i;
      }
    }
    uint256[5] memory burnedMem;
    for (uint256 i = 0; i < 5; ) {
      burnedMem[i] = tokenIds[i];
      _burn(tokenIds[i]);
      unchecked {
        ++i;
      }
    }
    uint256 newTokenId = _nextTokenId++;
    _safeMint(msg.sender, newTokenId);
    uint256 seed = uint256(
      keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, newTokenId))
    );
    emit MintRequested(newTokenId, msg.sender, seed);
    _assignAffixes(newTokenId, true);
    emit Fused(burnedMem, newTokenId, msg.sender);
  }

  function getAffixes(uint256 tokenId) external view returns (uint8[] memory) {
    require(_ownerOf(tokenId) != address(0), 'AffixNFT: nonexistent token');
    uint8[] storage stored = _affixesByToken[tokenId];
    uint256 len = stored.length;
    uint8[] memory out_ = new uint8[](len);
    for (uint256 i = 0; i < len; ) {
      out_[i] = stored[i];
      unchecked {
        ++i;
      }
    }
    return out_;
  }

  function totalMinted() external view returns (uint256) {
    return _nextTokenId;
  }

  /// @dev Extra `nonce` mixes sequential rolls without changing the base entropy inputs from the epic.
  function _entropy(uint256 tokenId, uint256 nonce) internal view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, tokenId, nonce)));
  }

  function _assignAffixes(uint256 tokenId, bool excludeCommon) internal {
    uint256 count = 1 + (_entropy(tokenId, 0) % 3);
    uint8[] memory affixes = new uint8[](count);
    for (uint256 i = 0; i < count; ) {
      uint256 roll = _entropy(tokenId, i + 1) % (excludeCommon ? 30 : 100);
      if (excludeCommon) {
        if (roll < 20) affixes[i] = RARITY_RARE;
        else if (roll < 28) affixes[i] = RARITY_SPLENDID;
        else affixes[i] = RARITY_DIVINE;
      } else {
        if (roll < 70) affixes[i] = RARITY_COMMON;
        else if (roll < 90) affixes[i] = RARITY_RARE;
        else if (roll < 98) affixes[i] = RARITY_SPLENDID;
        else affixes[i] = RARITY_DIVINE;
      }
      unchecked {
        ++i;
      }
    }
    delete _affixesByToken[tokenId];
    for (uint256 i = 0; i < count; ) {
      _affixesByToken[tokenId].push(affixes[i]);
      unchecked {
        ++i;
      }
    }
    emit AffixesAssigned(tokenId, affixes);
  }

  function _hasSplendidOrDivine(uint256 tokenId) internal view returns (bool) {
    uint8[] storage aff = _affixesByToken[tokenId];
    uint256 len = aff.length;
    for (uint256 i = 0; i < len; ) {
      uint8 a = aff[i];
      if (a == RARITY_SPLENDID || a == RARITY_DIVINE) return true;
      unchecked {
        ++i;
      }
    }
    return false;
  }
}
