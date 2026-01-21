/**
 * @module extensions/ArcChainNFTExtension
 * Arc Chain NFT Minter Extension
 *
 * Extension module for minting Faicey personas as iNFT and dNFT on Arc Chain testnet.
 * Provides one-click NFT minting functionality with right-click context menu integration.
 */

import { ethers } from 'ethers';

// Default Arc Chain Testnet Configuration (can be overridden by config file)
const DEFAULT_ARC_CHAIN_CONFIG = {
  chainId: '0x4cee8a', // 5042002 in hex
  chainName: 'Arc Chain Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app'],
};

// Standard ERC-721 ABI for Faicey NFTs
const FAICEY_NFT_ABI = [
  // ERC-721 Standard
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool _approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data)",

  // ERC-721 Metadata
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",

  // ERC-721 Enumerable
  "function totalSupply() view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",

  // Faicey-specific functions
  "function mintPersona(address to, string memory personaId, string memory metadataURI) returns (uint256)",
  "function getPersonaId(uint256 tokenId) view returns (string)",
  "function updatePersona(uint256 tokenId, string memory newMetadataURI)",
  "function evolvePersona(uint256 tokenId, uint256 newLevel)",
  "function getPersonaLevel(uint256 tokenId) view returns (uint256)",
  "function getPersonaXP(uint256 tokenId) view returns (uint256)",

  // Dynamic NFT functions
  "function setDynamicTraits(uint256 tokenId, string memory traitName, uint256 value)",
  "function getDynamicTrait(uint256 tokenId, string memory traitName) view returns (uint256)",
  "function triggerEvolution(uint256 tokenId)",

  // Events
  "event PersonaMinted(uint256 indexed tokenId, string indexed personaId, address indexed owner)",
  "event PersonaEvolved(uint256 indexed tokenId, uint256 newLevel)",
  "event TraitUpdated(uint256 indexed tokenId, string traitName, uint256 value)"
];

export default class ArcChainNFTExtension {
  constructor(options = {}) {
    this.name = 'ArcChainNFTExtension';
    this.version = '1.0.0';
    this.description = 'One-click NFT minting for Faicey personas on Arc Chain testnet';

    // Load configuration
    this.config = this.loadConfig();

    // Override with provided options
    Object.assign(this.config, options);

    // Extract frequently used config
    this.contractAddress = this.config.contracts.faiceyNFT.testnet;
    this.ipfsGateway = this.config.ipfs.gateway;
    this.pinataApiKey = this.config.ipfs.pinata.apiKey;
    this.pinataSecretKey = this.config.ipfs.pinata.secretKey;

    // State
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
    this.currentAccount = null;

    // Initialize UI integration from config
    this.contextMenuItems = this.config.ui.contextMenu.enabled ?
      this.config.ui.contextMenu.items.map(item => ({
        ...item,
        action: (personaId) => this.executeMenuAction(item.id, personaId),
        condition: (personaId) => this.canExecuteAction(item.id, personaId)
      })) : [];

    console.log('🎨 Arc Chain NFT Extension initialized');
  }

  /**
   * Load configuration from file
   */
  loadConfig() {
    try {
      // In browser environment, config might be injected differently
      if (typeof window !== 'undefined' && window.faiceyNFTConfig) {
        return { ...window.faiceyNFTConfig };
      }

      // For Node.js or if config is available
      if (typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        const configPath = path.join(process.cwd(), 'config', 'nft-config.json');
        if (fs.existsSync(configPath)) {
          return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
      }

      // Fallback to default config
      return {
        contracts: { faiceyNFT: { testnet: '0x0000000000000000000000000000000000000000' } },
        ipfs: { gateway: 'https://ipfs.io/ipfs/' },
        ui: {
          contextMenu: {
            enabled: true,
            items: [
              {
                id: 'mint-nft',
                label: 'Mint as iNFT',
                icon: '🎨'
              },
              {
                id: 'view-nft',
                label: 'View on ArcScan',
                icon: '🔍'
              }
            ]
          }
        }
      };
    } catch (error) {
      console.warn('Failed to load NFT config, using defaults:', error);
      return {};
    }
  }

  /**
   * Execute context menu action
   */
  async executeMenuAction(actionId, personaId) {
    switch (actionId) {
      case 'mint-nft':
        return await this.mintPersonaNFT(personaId);
      case 'view-nft':
        return await this.viewPersonaOnExplorer(personaId);
      case 'evolve-nft':
        return await this.evolvePersonaNFT(personaId);
      default:
        throw new Error(`Unknown action: ${actionId}`);
    }
  }

  /**
   * Check if action can be executed
   */
  canExecuteAction(actionId, personaId) {
    switch (actionId) {
      case 'mint-nft':
        return this.canMintNFT(personaId);
      case 'view-nft':
        return this.isPersonaMinted(personaId);
      case 'evolve-nft':
        return this.isPersonaMinted(personaId) && this.canEvolveNFT(personaId);
      default:
        return false;
    }
  }

  /**
   * Check if persona NFT can evolve
   */
  async canEvolveNFT(personaId) {
    if (!this.contract) return false;

    try {
      const tokenId = await this.contract.getPersonaTokenId(personaId);
      if (!tokenId || !tokenId.gt(0)) return false;

      const xp = await this.contract.getPersonaXP(tokenId);
      const level = await this.contract.getPersonaLevel(tokenId);

      // Simple evolution check: can evolve every 1000 XP
      return xp >= (level * 1000);
    } catch (error) {
      return false;
    }
  }

  /**
   * Evolve persona NFT
   */
  async evolvePersonaNFT(personaId) {
    try {
      const tokenId = await this.contract.getPersonaTokenId(personaId);
      if (!tokenId || !tokenId.gt(0)) {
        throw new Error('Persona not minted yet');
      }

      console.log(`⚡ Evolving ${personaId} NFT...`);
      const tx = await this.contract.triggerEvolution(tokenId);
      await tx.wait();

      return {
        success: true,
        tokenId: tokenId.toString(),
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('❌ Failed to evolve NFT:', error);
      throw error;
    }
  }

  /**
   * Initialize the extension
   */
  async initialize() {
    try {
      await this.connectToArcChain();
      await this.initializeContract();
      this.registerContextMenu();
      console.log('✅ Arc Chain NFT Extension ready');
    } catch (error) {
      console.error('❌ Failed to initialize Arc Chain extension:', error);
      throw error;
    }
  }

  /**
   * Connect to Arc Chain testnet
   */
  async connectToArcChain() {
    try {
      // Check if MetaMask or similar wallet is available
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Switch to Arc Chain testnet
        await this.switchToArcChain();

        // Create ethers provider and signer
        const networkConfig = this.config.arcChain?.testnet || DEFAULT_ARC_CHAIN_CONFIG;
        this.provider = new ethers.providers.JsonRpcProvider(networkConfig.rpcUrls[0]);
        // For browser, use Web3Provider
        if (typeof window !== 'undefined') {
          this.provider = new ethers.providers.Web3Provider(window.ethereum);
        }
        this.signer = this.provider.getSigner();
        this.currentAccount = await this.signer.getAddress();
        this.isConnected = true;

        console.log('✅ Connected to Arc Chain testnet:', this.currentAccount);
      } else {
        throw new Error('No Ethereum wallet detected. Please install MetaMask or similar.');
      }
    } catch (error) {
      console.error('❌ Failed to connect to Arc Chain:', error);
      throw error;
    }
  }

  /**
   * Switch MetaMask to Arc Chain testnet
   */
  async switchToArcChain() {
    const networkConfig = this.config.arcChain?.testnet || DEFAULT_ARC_CHAIN_CONFIG;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
    } catch (switchError) {
      // If chain doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig],
        });
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Initialize the NFT contract
   */
  async initializeContract() {
    if (!this.provider || !this.signer) {
      throw new Error('Not connected to Arc Chain');
    }

    this.contract = new ethers.Contract(
      this.contractAddress,
      FAICEY_NFT_ABI,
      this.signer
    );

    console.log('✅ NFT Contract initialized:', this.contractAddress);
  }

  /**
   * Register context menu items with the UI
   */
  registerContextMenu() {
    // This would integrate with the Faicey UI system
    // For now, we'll expose the functionality globally
    if (typeof window !== 'undefined') {
      window.faiceyArcChainExtension = this;
    }
  }

  /**
   * Check if a persona can be minted as NFT
   */
  canMintNFT(personaId) {
    // Check if persona exists and hasn't been minted yet
    return this.isConnected && !this.isPersonaMinted(personaId);
  }

  /**
   * Check if a persona has already been minted
   */
  async isPersonaMinted(personaId) {
    if (!this.contract) return false;

    try {
      const tokenId = await this.contract.getPersonaTokenId(personaId);
      return tokenId && tokenId.gt(0);
    } catch (error) {
      return false;
    }
  }

  /**
   * Mint a persona as an iNFT on Arc Chain
   */
  async mintPersonaNFT(personaId) {
    try {
      if (!this.canMintNFT(personaId)) {
        throw new Error('Cannot mint NFT: persona not eligible or already minted');
      }

      console.log(`🎨 Minting ${personaId} as iNFT...`);

      // Get persona data
      const personaData = await this.getPersonaData(personaId);

      // Upload metadata to IPFS
      const metadataURI = await this.uploadMetadataToIPFS(personaData);

      // Mint the NFT
      const tx = await this.contract.mintPersona(
        this.currentAccount,
        personaId,
        metadataURI
      );

      console.log('📝 Transaction submitted:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ NFT minted successfully!');

      // Extract token ID from event
      const tokenId = this.extractTokenIdFromReceipt(receipt);

      return {
        success: true,
        tokenId,
        transactionHash: tx.hash,
        metadataURI,
        explorerUrl: `${ARC_CHAIN_CONFIG.blockExplorerUrls[0]}/token/${this.contractAddress}?a=${tokenId}`
      };

    } catch (error) {
      console.error('❌ Failed to mint NFT:', error);
      throw error;
    }
  }

  /**
   * Get persona data for NFT metadata
   */
  async getPersonaData(personaId) {
    // This would integrate with the Faicey persona system
    // For now, return mock data based on persona ID
    const personaConfigs = {
      'professor-codephreak': {
        name: 'Professor Codephreak #001',
        description: 'Dynamic AI persona representing Professor Codephreak - the ultimate coding mentor.',
        attributes: [
          { trait_type: 'Type', value: 'AI Persona' },
          { trait_type: 'Specialty', value: 'Coding Expert' },
          { trait_type: 'Rarity', value: 'Legendary' }
        ]
      },
      'mindx-base': {
        name: 'mindX Base Persona #002',
        description: 'The foundational mindX AI persona - adaptable, intelligent, and always learning.',
        attributes: [
          { trait_type: 'Type', value: 'AI Persona' },
          { trait_type: 'Specialty', value: 'General Intelligence' },
          { trait_type: 'Rarity', value: 'Common' }
        ]
      }
    };

    return personaConfigs[personaId] || {
      name: `${personaId} Persona`,
      description: `Dynamic AI persona: ${personaId}`,
      attributes: [
        { trait_type: 'Type', value: 'AI Persona' },
        { trait_type: 'Specialty', value: personaId },
        { trait_type: 'Rarity', value: 'Common' }
      ]
    };
  }

  /**
   * Upload metadata to IPFS
   */
  async uploadMetadataToIPFS(metadata) {
    try {
      // If Pinata is configured, use it
      if (this.pinataApiKey && this.pinataSecretKey) {
        return await this.uploadToPinata(metadata);
      }

      // Otherwise, use a simple IPFS upload (would need implementation)
      console.warn('⚠️ No IPFS upload service configured. Using placeholder URI.');
      return `ipfs://QmPlaceholder${Date.now()}`;

    } catch (error) {
      console.error('❌ Failed to upload to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload to Pinata IPFS
   */
  async uploadToPinata(metadata) {
    const data = JSON.stringify(metadata);
    const formData = new FormData();
    formData.append('file', new Blob([data], { type: 'application/json' }));

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': this.pinataApiKey,
        'pinata_secret_api_key': this.pinataSecretKey,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return `ipfs://${result.IpfsHash}`;
  }

  /**
   * Extract token ID from transaction receipt
   */
  extractTokenIdFromReceipt(receipt) {
    // Look for PersonaMinted event
    const personaMintedEvent = receipt.events?.find(
      event => event.event === 'PersonaMinted'
    );

    if (personaMintedEvent) {
      return personaMintedEvent.args.tokenId.toString();
    }

    // Fallback: assume token ID is in logs
    return 'unknown';
  }

  /**
   * View persona NFT on ArcScan explorer
   */
  async viewPersonaOnExplorer(personaId) {
    try {
      const tokenId = await this.contract.getPersonaTokenId(personaId);
      if (tokenId && tokenId.gt(0)) {
        const networkConfig = this.config.arcChain?.testnet || DEFAULT_ARC_CHAIN_CONFIG;
        const url = `${networkConfig.blockExplorerUrls[0]}/token/${this.contractAddress}?a=${tokenId}`;
        window.open(url, '_blank');
      } else {
        throw new Error('Persona not minted yet');
      }
    } catch (error) {
      console.error('❌ Failed to view on explorer:', error);
      throw error;
    }
  }

  /**
   * Update persona NFT metadata (for dynamic NFTs)
   */
  async updatePersonaMetadata(tokenId, newMetadata) {
    try {
      const metadataURI = await this.uploadMetadataToIPFS(newMetadata);
      const tx = await this.contract.updatePersona(tokenId, metadataURI);
      await tx.wait();
      console.log('✅ Persona metadata updated');
      return tx.hash;
    } catch (error) {
      console.error('❌ Failed to update metadata:', error);
      throw error;
    }
  }

  /**
   * Evolve persona NFT (level up)
   */
  async evolvePersona(tokenId) {
    try {
      const tx = await this.contract.triggerEvolution(tokenId);
      await tx.wait();
      console.log('✅ Persona evolved');
      return tx.hash;
    } catch (error) {
      console.error('❌ Failed to evolve persona:', error);
      throw error;
    }
  }

  /**
   * Get extension context menu items
   */
  getContextMenuItems() {
    return this.contextMenuItems;
  }

  /**
   * Get extension status
   */
  getStatus() {
    return {
      name: this.name,
      version: this.version,
      connected: this.isConnected,
      account: this.currentAccount,
      contract: this.contractAddress,
      network: ARC_CHAIN_CONFIG.chainName
    };
  }

  /**
   * Clean up resources
   */
  async dispose() {
    this.contract = null;
    this.signer = null;
    this.provider = null;
    this.isConnected = false;
    console.log('🧹 Arc Chain extension disposed');
  }
}

// Factory function
export function createArcChainNFTExtension(options = {}) {
  return new ArcChainNFTExtension(options);
}

// Make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.createArcChainNFTExtension = createArcChainNFTExtension;
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  console.log('🔌 Initializing Arc Chain NFT Extension...');

  // Make extension available globally
  window.faiceyArcChainExtension = new ArcChainNFTExtension();
  console.log('✅ Arc Chain extension created and available on window');

  // Auto-initialize when Ethereum is available
  if (window.ethereum) {
    console.log('🔗 Ethereum wallet detected, will auto-initialize extension');
    // Delay initialization to allow page to load
    setTimeout(async () => {
      try {
        console.log('🚀 Auto-initializing Arc Chain extension...');
        await window.faiceyArcChainExtension.initialize();
        console.log('✅ Arc Chain extension auto-initialized successfully');
      } catch (error) {
        console.warn('Arc Chain extension auto-initialization failed:', error.message);
        // Continue without extension - UI will show limited functionality
      }
    }, 1000);
  } else {
    console.log('⚠️ No Ethereum wallet detected - extension will need manual initialization');
  }
}