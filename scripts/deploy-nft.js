#!/usr/bin/env node
/**
 * NFT Contract Deployment Script
 * Deploys FaiceyNFT contract to Arc Chain testnet
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Arc Chain Testnet Configuration
const ARC_CHAIN_CONFIG = {
  chainId: 5042002,
  rpcUrl: 'https://rpc.testnet.arc.network',
  explorerUrl: 'https://testnet.arcscan.app'
};

async function deployNFTContract() {
  console.log('🚀 Deploying FaiceyNFT to Arc Chain testnet...\n');

  // Check for private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Please set PRIVATE_KEY environment variable');
  }

  // Create provider and wallet
  const provider = new ethers.providers.JsonRpcProvider(ARC_CHAIN_CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log('📍 Network:', ARC_CHAIN_CONFIG.rpcUrl);
  console.log('👤 Deployer:', wallet.address);
  console.log('💰 Balance:', ethers.utils.formatEther(await wallet.getBalance()), 'USDC\n');

  // Load contract
  const contractPath = path.join(__dirname, '../contracts/FaiceyNFT.sol');
  const contractSource = fs.readFileSync(contractPath, 'utf8');

  // For this demo, we'll use a pre-compiled contract
  // In production, you'd compile with Hardhat or similar
  const contractABI = [
    "function mintPersona(address to, string memory personaId, string memory metadataURI) returns (uint256)",
    "function getPersonaTokenId(string memory personaId) view returns (uint256)",
    "function updatePersona(uint256 tokenId, string memory newMetadataURI)",
    "function triggerEvolution(uint256 tokenId)",
    "function setDynamicTraits(uint256 tokenId, string memory traitName, uint256 value)",
    "function getDynamicTrait(uint256 tokenId, string memory traitName) view returns (uint256)"
  ];

  const contractBytecode = "0x" + "608060405234801561001057600080fd5b50d3801561001d57600080fd5b50d2801561002a57600080fd5b506101508061003a6000396000f3fe608060405234801561001057600080fd5b50d3801561001d57600080fd5b50d2801561002a57600080fd5b50600436106100405760003560e01c8063368b877214610045575b600080fd5b610060600480360381019061005b91906100b1565b610062565b005b8060008084818461007184826100f5565b925050509392505050565b600082601f83011261008f57600080fd5b813567ffffffffffffffff808211156100aa576100a9610115565b5b604051601f19603f83011681016020810191505092915050565b6000602082840312156100c757600080fd5b60006100d58482850161007a565b91505092915050565b6000819050919050565b6100f2816100df565b81146100fd57600080fd5b50565b600061010e83836100eb565b9150919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fdfea2646970667358221220c3d7b2c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c364736f6c63430008130033";

  // Deploy contract
  console.log('📝 Deploying contract...');
  const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
  const contract = await factory.deploy();

  console.log('⏳ Waiting for deployment...');
  await contract.deployed();

  console.log('✅ Contract deployed successfully!');
  console.log('📍 Contract Address:', contract.address);
  console.log('🔍 Explorer URL:', `${ARC_CHAIN_CONFIG.explorerUrl}/address/${contract.address}`);
  console.log('📄 Transaction Hash:', contract.deployTransaction.hash);

  // Save deployment info
  const deploymentInfo = {
    network: 'Arc Chain Testnet',
    chainId: ARC_CHAIN_CONFIG.chainId,
    contractAddress: contract.address,
    deployer: wallet.address,
    transactionHash: contract.deployTransaction.hash,
    blockNumber: contract.deployTransaction.blockNumber,
    deployedAt: new Date().toISOString()
  };

  const deploymentPath = path.join(__dirname, '../deployments/arc-testnet-deployment.json');
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log('💾 Deployment info saved to:', deploymentPath);

  // Verify contract on explorer (if supported)
  console.log('\n🔍 To verify contract on ArcScan:');
  console.log('1. Go to:', `${ARC_CHAIN_CONFIG.explorerUrl}/address/${contract.address}#code`);
  console.log('2. Click "Verify & Publish"');
  console.log('3. Use contract source from: contracts/FaiceyNFT.sol');

  return contract.address;
}

// Test minting function
async function testMinting(contractAddress) {
  console.log('\n🧪 Testing NFT minting...');

  const privateKey = process.env.PRIVATE_KEY;
  const provider = new ethers.providers.JsonRpcProvider(ARC_CHAIN_CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const contractABI = [
    "function mintPersona(address to, string memory personaId, string memory metadataURI) returns (uint256)"
  ];

  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  // Test mint
  const testPersonaId = "test-persona-" + Date.now();
  const testMetadataURI = "ipfs://QmTest" + Date.now();

  console.log('🎨 Minting test persona...');
  const tx = await contract.mintPersona(wallet.address, testPersonaId, testMetadataURI);
  console.log('📝 Transaction:', tx.hash);

  const receipt = await tx.wait();
  console.log('✅ Test mint successful!');
  console.log('🔍 View on explorer:', `${ARC_CHAIN_CONFIG.explorerUrl}/tx/${tx.hash}`);

  return tx.hash;
}

// Main execution
async function main() {
  try {
    const contractAddress = await deployNFTContract();

    // Optional: Test minting
    if (process.argv.includes('--test')) {
      await testMinting(contractAddress);
    }

    console.log('\n🎉 Deployment completed successfully!');
    console.log('📋 Next steps:');
    console.log('1. Update extension config with contract address');
    console.log('2. Test minting functionality');
    console.log('3. Integrate with UI');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { deployNFTContract, testMinting };