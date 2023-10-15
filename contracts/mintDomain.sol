// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 < 0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";  
import "@openzeppelin/contracts/utils/Counters.sol";

import { Base64 } from "./Base64.sol";


contract DymensionNameNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenId;
   
    string public collectionName;
    string public collectionSymbol;
    uint256 public nftCreationFee = 0.01 ether;
    address public feeRecipient = 0x3510C7949420Aa49634bafC619f65290356E5815;

    constructor() ERC721("DymensionDomain", "ENFT") {
        collectionName = name();
        collectionSymbol = symbol();
    }

    function createDymensionNameNFT(string memory name, string memory imageUri) public payable {
        require(msg.value >= nftCreationFee, "Insufficient fee");

        address payable recipient = payable(feeRecipient);
        recipient.transfer(msg.value);

        uint256 newItemId = _tokenId.current();

        string memory combinedWord = string(abi.encodePacked(name));

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                    '{"name": "',
                        combinedWord,
                        '", "description": "This is dymension domain, congratulations on owning it!", "image": "',
                        imageUri,
                    '"}'
                    )
                )
            )
        );

        string memory finalTokenURI = string(abi.encodePacked(
            "data:application/json;base64,", json
        ));

    
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, finalTokenURI);

        _tokenId.increment();
    }
}

