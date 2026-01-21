# Faicey NFT Minter - Arc Chain Integration

Complete iNFT and dNFT minting system for Faicey personas on Arc Chain testnet with one-click right-click context menu integration.

## 🎯 Overview

The Faicey NFT Minter provides seamless integration for minting AI personas as intelligent NFTs (iNFTs) and dynamic NFTs (dNFTs) on the Arc Chain testnet. Features include:

- **One-click minting** via right-click context menu
- **iNFT support** with embedded AI prompts and personality
- **dNFT capabilities** with evolving traits and metadata
- **Arc Chain testnet** integration with USDC gas token
- **IPFS metadata** storage with Pinata integration
- **Smart contract** deployment and interaction

## 🏗️ Architecture

### Core Components

1. **ArcChainNFTExtension** - Main extension module
2. **FaiceyNFT.sol** - ERC-721 smart contract
3. **FaiceyNFTUI** - Browser UI integration
4. **Deployment scripts** - Hardhat-based deployment

### File Structure

```
extensions/
├── ArcChainNFTExtension.js    # Main extension module

contracts/
├── FaiceyNFT.sol              # ERC-721 smart contract

ui/
├── faicey-nft-ui.js          # Browser UI integration

scripts/
├── deploy-nft.js             # Deployment script

config/
├── nft-config.json           # NFT configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:
```bash
PRIVATE_KEY=your_private_key_here
ARCSCAN_API_KEY=your_arcscan_api_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

### 3. Deploy Smart Contract

```bash
# Deploy to Arc Chain testnet
npm run nft:deploy

# Deploy with test minting
npm run nft:deploy:test
```

### 4. Update Configuration

Edit `config/nft-config.json`:
```json
{
  "contracts": {
    "faiceyNFT": {
      "testnet": "0xYourDeployedContractAddress"
    }
  },
  "ipfs": {
    "pinata": {
      "apiKey": "your_pinata_api_key",
      "secretKey": "your_pinata_secret_key"
    }
  }
}
```

### 5. Start Server

```bash
npm run serve
```

### 6. Use NFT Minter

1. Open `http://localhost:8080/original` or `http://localhost:8080/local`
2. Select a persona from the dropdown
3. **Right-click** on the face display area
4. Choose "Mint as iNFT" from the context menu
5. Confirm the transaction in MetaMask

## 🎨 UI Integration

### Right-Click Context Menu

The NFT minter integrates seamlessly with the existing Faicey UI:

- **Right-click detection** on persona display areas
- **Context-aware menus** based on persona state
- **Visual feedback** with notifications and modals
- **Transaction progress** tracking

### Available Actions

- **Mint as iNFT**: Mint the current persona as an intelligent NFT
- **View on ArcScan**: Open the NFT on the blockchain explorer
- **Evolve NFT**: Trigger evolution for dynamic NFTs

### Visual Feedback

- **Loading notifications** during transactions
- **Success modals** with transaction details
- **Error handling** with user-friendly messages
- **Progress indicators** for multi-step processes

## 🛠️ Smart Contract Features

### ERC-721 Compliance

- Standard NFT interface
- Metadata support via `tokenURI()`
- Transfer and approval mechanisms
- Owner and balance queries

### iNFT Capabilities

- **Embedded AI prompts** in metadata
- **Personality preservation** across interactions
- **Context awareness** for adaptive behavior
- **Interaction logging** for analytics

### dNFT Features

- **Dynamic traits** that evolve over time
- **XP and leveling system** for progression
- **Trait modification** by authorized parties
- **Evolution triggers** based on usage patterns

### Key Functions

```solidity
// Mint a new persona NFT
function mintPersona(address to, string memory personaId, string memory metadataURI) returns (uint256)

// Update NFT metadata (for dynamic NFTs)
function updatePersona(uint256 tokenId, string memory newMetadataURI)

// Set dynamic trait values
function setDynamicTraits(uint256 tokenId, string memory traitName, uint256 value)

// Trigger evolution
function triggerEvolution(uint256 tokenId)

// Get persona data
function getPersonaData(uint256 tokenId) returns (PersonaData memory)
```

## 📊 Configuration

### NFT Configuration (`config/nft-config.json`)

```json
{
  "arcChain": {
    "testnet": {
      "chainId": "0x4cee8a",
      "rpcUrl": "https://rpc.testnet.arc.network",
      "explorerUrl": "https://testnet.arcscan.app"
    }
  },
  "contracts": {
    "faiceyNFT": {
      "testnet": "0x..."
    }
  },
  "ipfs": {
    "pinata": {
      "apiKey": "...",
      "secretKey": "..."
    }
  },
  "ui": {
    "contextMenu": {
      "enabled": true,
      "items": [...]
    }
  }
}
```

### Extension Configuration

```javascript
const extension = new ArcChainNFTExtension({
  contractAddress: '0x...',
  ipfsGateway: 'https://ipfs.io/ipfs/',
  pinataApiKey: '...',
  pinataSecretKey: '...'
});
```

## 🔧 Development

### Contract Development

```bash
# Compile contracts
npm run hardhat:compile

# Run tests
npm run hardhat:test

# Deploy to testnet
npm run hardhat:deploy:arc
```

### Extension Development

```javascript
// Initialize extension
const extension = new ArcChainNFTExtension(config);
await extension.initialize();

// Mint NFT
const result = await extension.mintPersonaNFT('professor-codephreak');
console.log('Minted NFT:', result.tokenId);
```

### UI Development

```javascript
// Initialize UI
const nftUI = new FaiceyNFTUI({
  arcExtension: extension
});

// Handle persona changes
nftUI.updateCurrentPersona('mindx-base');
```

## 🌐 Arc Chain Integration

### Network Details

- **Chain ID**: 5042002 (testnet)
- **RPC URL**: `https://rpc.testnet.arc.network`
- **Explorer**: `https://testnet.arcscan.app`
- **Gas Token**: USDC (18 decimals)
- **EVM Compatible**: Full Ethereum compatibility

### Wallet Integration

- **MetaMask support** with automatic network switching
- **USDC gas fees** (Circle's stablecoin)
- **Transaction monitoring** and status updates
- **Error handling** for network issues

### Contract Deployment

```javascript
// Using ethers.js
const factory = new ethers.ContractFactory(abi, bytecode, signer);
const contract = await factory.deploy();
await contract.deployed();
console.log('Contract deployed at:', contract.address);
```

## 📦 API Reference

### ArcChainNFTExtension

#### Methods

- `initialize()` - Initialize the extension
- `connectToArcChain()` - Connect wallet to Arc Chain
- `mintPersonaNFT(personaId)` - Mint persona as NFT
- `updatePersonaMetadata(tokenId, metadata)` - Update NFT metadata
- `evolvePersona(tokenId)` - Trigger NFT evolution
- `viewPersonaOnExplorer(personaId)` - Open NFT in explorer

#### Properties

- `isConnected` - Connection status
- `currentAccount` - Connected wallet address
- `contract` - Contract instance
- `contextMenuItems` - UI menu items

### FaiceyNFTUI

#### Methods

- `showContextMenu(x, y, personaId)` - Display context menu
- `showNotification(message, type)` - Show user notification
- `updateCurrentPersona(personaId)` - Update active persona

## 🔐 Security Considerations

### Smart Contract Security

- **Access controls** for sensitive operations
- **Reentrancy protection** in payable functions
- **Input validation** for all parameters
- **Emergency pause** functionality

### Frontend Security

- **Wallet connection** verification
- **Transaction confirmation** before execution
- **Error boundary** handling
- **Input sanitization** for user data

### IPFS Security

- **Content addressing** for immutable metadata
- **Pinata authentication** for reliable storage
- **Fallback gateways** for redundancy

## 🚀 Deployment Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Configure environment variables
- [ ] Compile smart contracts (`npm run hardhat:compile`)
- [ ] Deploy to testnet (`npm run nft:deploy`)
- [ ] Update configuration with contract address
- [ ] Test minting functionality
- [ ] Verify on ArcScan explorer
- [ ] Update frontend configuration
- [ ] Test UI integration

## 📈 Future Enhancements

### Planned Features

1. **Batch Minting** - Mint multiple personas at once
2. **NFT Trading** - Marketplace integration
3. **Cross-Chain Bridge** - Support for other EVM chains
4. **Advanced Evolution** - Complex evolution algorithms
5. **Social Features** - NFT ownership communities
6. **Governance** - DAO-style persona governance

### Technical Improvements

1. **Gas Optimization** - Reduce minting costs
2. **Layer 2 Support** - Integration with L2 solutions
3. **Oracle Integration** - Real-world data for traits
4. **AI Evolution** - ML-driven trait progression
5. **Multi-Sig Support** - Enhanced security options

---

**Ready to mint your first Faicey iNFT? Right-click on any persona and select "Mint as iNFT"!** 🎨⚡🚀