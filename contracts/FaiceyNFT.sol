// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title FaiceyNFT
 * @dev ERC-721 contract for Faicey AI Personas - supporting both iNFT and dNFT functionality
 * Implements intelligent and dynamic NFT features for AI persona evolution
 */
contract FaiceyNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Structs
    struct PersonaData {
        string personaId;
        uint256 level;
        uint256 xp;
        uint256 createdAt;
        uint256 lastInteraction;
        bool isDynamic;
    }

    struct DynamicTrait {
        string name;
        uint256 value;
        uint256 maxValue;
        uint256 lastUpdated;
    }

    // State variables
    mapping(string => uint256) public personaIdToTokenId;
    mapping(uint256 => PersonaData) public personaData;
    mapping(uint256 => mapping(string => DynamicTrait)) public dynamicTraits;
    mapping(uint256 => string[]) public personaTraitNames;

    // Events
    event PersonaMinted(uint256 indexed tokenId, string indexed personaId, address indexed owner);
    event PersonaEvolved(uint256 indexed tokenId, uint256 newLevel);
    event TraitUpdated(uint256 indexed tokenId, string traitName, uint256 value);
    event InteractionLogged(uint256 indexed tokenId, string interactionType);

    /**
     * @dev Constructor
     */
    constructor() ERC721("Faicey AI Personas", "FAICEY") {}

    /**
     * @dev Mint a new Faicey persona NFT
     * @param to Address to mint the NFT to
     * @param personaId Unique identifier for the persona
     * @param metadataURI IPFS URI for the NFT metadata
     * @return tokenId The ID of the newly minted token
     */
    function mintPersona(
        address to,
        string memory personaId,
        string memory metadataURI
    ) public onlyOwner returns (uint256) {
        require(bytes(personaId).length > 0, "Persona ID cannot be empty");
        require(personaIdToTokenId[personaId] == 0, "Persona already minted");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Initialize persona data
        personaData[tokenId] = PersonaData({
            personaId: personaId,
            level: 1,
            xp: 0,
            createdAt: block.timestamp,
            lastInteraction: block.timestamp,
            isDynamic: true
        });

        personaIdToTokenId[personaId] = tokenId;

        emit PersonaMinted(tokenId, personaId, to);
        return tokenId;
    }

    /**
     * @dev Get the token ID for a persona
     * @param personaId The persona identifier
     * @return tokenId The token ID, or 0 if not minted
     */
    function getPersonaTokenId(string memory personaId) public view returns (uint256) {
        return personaIdToTokenId[personaId];
    }

    /**
     * @dev Get persona ID for a token
     * @param tokenId The token ID
     * @return personaId The persona identifier
     */
    function getPersonaId(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return personaData[tokenId].personaId;
    }

    /**
     * @dev Update persona metadata (for dynamic NFTs)
     * @param tokenId The token ID to update
     * @param newMetadataURI New IPFS URI for metadata
     */
    function updatePersona(uint256 tokenId, string memory newMetadataURI) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner(), "Not authorized");

        _setTokenURI(tokenId, newMetadataURI);
        personaData[tokenId].lastInteraction = block.timestamp;

        emit InteractionLogged(tokenId, "metadata_update");
    }

    /**
     * @dev Set a dynamic trait value
     * @param tokenId The token ID
     * @param traitName The trait name
     * @param value The new trait value
     */
    function setDynamicTraits(uint256 tokenId, string memory traitName, uint256 value) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner(), "Not authorized");
        require(personaData[tokenId].isDynamic, "Persona is not dynamic");

        // Add trait name to list if not already present
        bool traitExists = false;
        for (uint i = 0; i < personaTraitNames[tokenId].length; i++) {
            if (keccak256(bytes(personaTraitNames[tokenId][i])) == keccak256(bytes(traitName))) {
                traitExists = true;
                break;
            }
        }

        if (!traitExists) {
            personaTraitNames[tokenId].push(traitName);
        }

        dynamicTraits[tokenId][traitName] = DynamicTrait({
            name: traitName,
            value: value,
            maxValue: 100, // Default max
            lastUpdated: block.timestamp
        });

        personaData[tokenId].lastInteraction = block.timestamp;

        emit TraitUpdated(tokenId, traitName, value);
    }

    /**
     * @dev Get a dynamic trait value
     * @param tokenId The token ID
     * @param traitName The trait name
     * @return value The trait value
     */
    function getDynamicTrait(uint256 tokenId, string memory traitName) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return dynamicTraits[tokenId][traitName].value;
    }

    /**
     * @dev Get all trait names for a persona
     * @param tokenId The token ID
     * @return traitNames Array of trait names
     */
    function getPersonaTraitNames(uint256 tokenId) public view returns (string[] memory) {
        require(_exists(tokenId), "Token does not exist");
        return personaTraitNames[tokenId];
    }

    /**
     * @dev Trigger persona evolution
     * @param tokenId The token ID to evolve
     */
    function triggerEvolution(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner(), "Not authorized");

        PersonaData storage persona = personaData[tokenId];
        require(persona.isDynamic, "Persona is not dynamic");

        // Simple evolution logic: level up every 1000 XP
        uint256 newLevel = (persona.xp / 1000) + 1;
        if (newLevel > persona.level) {
            persona.level = newLevel;
            emit PersonaEvolved(tokenId, newLevel);
        }

        persona.lastInteraction = block.timestamp;
        emit InteractionLogged(tokenId, "evolution");
    }

    /**
     * @dev Add XP to a persona (for evolution)
     * @param tokenId The token ID
     * @param xpAmount Amount of XP to add
     */
    function addXP(uint256 tokenId, uint256 xpAmount) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner(), "Not authorized");

        personaData[tokenId].xp += xpAmount;
        personaData[tokenId].lastInteraction = block.timestamp;

        emit InteractionLogged(tokenId, "xp_gain");
    }

    /**
     * @dev Get persona level
     * @param tokenId The token ID
     * @return level The persona level
     */
    function getPersonaLevel(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return personaData[tokenId].level;
    }

    /**
     * @dev Get persona XP
     * @param tokenId The token ID
     * @return xp The persona XP
     */
    function getPersonaXP(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return personaData[tokenId].xp;
    }

    /**
     * @dev Log an interaction (for analytics and evolution)
     * @param tokenId The token ID
     * @param interactionType Type of interaction
     */
    function logInteraction(uint256 tokenId, string memory interactionType) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner(), "Not authorized");

        personaData[tokenId].lastInteraction = block.timestamp;
        emit InteractionLogged(tokenId, interactionType);
    }

    /**
     * @dev Get persona data
     * @param tokenId The token ID
     * @return persona The complete persona data
     */
    function getPersonaData(uint256 tokenId) public view returns (PersonaData memory) {
        require(_exists(tokenId), "Token does not exist");
        return personaData[tokenId];
    }

    /**
     * @dev Toggle dynamic status (admin only)
     * @param tokenId The token ID
     * @param isDynamic New dynamic status
     */
    function setDynamicStatus(uint256 tokenId, bool isDynamic) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        personaData[tokenId].isDynamic = isDynamic;
    }

    // Override functions required by Solidity
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}