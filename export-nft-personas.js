#!/usr/bin/env node
/**
 * NFT Persona Export Script
 * Exports Faicey personas to NFT-compatible metadata format
 * Supports iNFT and dNFT standards with dynamic trait evolution
 */

import fs from 'fs';
import path from 'path';
import { createNFTExporter, createVersionManager } from './core/index.js';

// Load personas data
const personasPath = './config/personas.json';
const personasData = JSON.parse(fs.readFileSync(personasPath, 'utf8'));

async function exportPersonasToNFT() {
  console.log('🎨 Faicey NFT Export Tool');
  console.log('=========================\n');

  // Create NFT exporter
  const nftExporter = createNFTExporter({
    outputDir: './exports/nft',
    baseURI: 'ipfs://QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/',
    contractAddress: '0x1234567890123456789012345678901234567890'
  });

  // Create version manager
  const versionManager = createVersionManager();

  console.log('📦 Exporting personas to NFT format...\n');

  // Export each persona
  const personas = Object.values(personasData.personas);
  const exportResults = [];

  for (const persona of personas) {
    console.log(`🚀 Exporting ${persona.core.name} (${persona.core.id})...`);

    try {
      // Validate persona for NFT export
      const validation = versionManager.validatePersonaVersion(persona);
      if (!validation.valid) {
        console.error(`❌ Validation failed for ${persona.core.id}:`);
        validation.errors.forEach(error => console.error(`   - ${error}`));
        continue;
      }

      // Export to NFT metadata
      const metadata = nftExporter.exportToNFT(persona, {
        includeDynamic: true,
        includePrivate: false,
        version: persona.core.version
      });

      // Validate NFT metadata
      const nftValidation = nftExporter.validateMetadata(metadata);
      if (!nftValidation.valid) {
        console.error(`❌ NFT validation failed for ${persona.core.id}:`);
        nftValidation.errors.forEach(error => console.error(`   - ${error}`));
        continue;
      }

      // Save metadata
      const filename = `${persona.core.id}.json`;
      const outputPath = path.join('./exports/nft', filename);
      await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.promises.writeFile(outputPath, JSON.stringify(metadata, null, 2));

      exportResults.push({
        id: persona.core.id,
        name: persona.core.name,
        file: filename,
        validation_score: nftValidation.score
      });

      console.log(`✅ Exported ${persona.core.name} (Score: ${nftValidation.score}/100)`);

      if (nftValidation.warnings.length > 0) {
        console.log(`⚠️ Warnings:`);
        nftValidation.warnings.forEach(warning => console.log(`   - ${warning}`));
      }

    } catch (error) {
      console.error(`❌ Failed to export ${persona.core.id}:`, error.message);
    }
  }

  // Export collection metadata
  console.log('\n📚 Exporting collection metadata...');
  try {
    const collectionMetadata = nftExporter.exportCollection(personas);
    const collectionPath = './exports/nft/collection.json';
    await fs.promises.mkdir(path.dirname(collectionPath), { recursive: true });
    await fs.promises.writeFile(collectionPath, JSON.stringify(collectionMetadata, null, 2));
    console.log('✅ Collection metadata exported');
  } catch (error) {
    console.error('❌ Failed to export collection metadata:', error.message);
  }

  // Export on-chain data
  console.log('⛓️ Exporting on-chain data...');
  try {
    const onChainData = nftExporter.generateOnChainData(personas[0]);
    const onChainPath = './exports/nft/on-chain-data.json';
    await fs.promises.mkdir(path.dirname(onChainPath), { recursive: true });
    await fs.promises.writeFile(onChainPath, JSON.stringify(onChainData, null, 2));
    console.log('✅ On-chain data exported');
  } catch (error) {
    console.error('❌ Failed to export on-chain data:', error.message);
  }

  // Generate summary report
  console.log('\n📊 Export Summary');
  console.log('================');
  console.log(`Total personas: ${personas.length}`);
  console.log(`Successfully exported: ${exportResults.length}`);

  if (exportResults.length > 0) {
    console.log('\nExported Personas:');
    exportResults.forEach(result => {
      console.log(`  • ${result.name} (${result.id}) - Score: ${result.validation_score}/100`);
    });
  }

  console.log('\n📁 Files created in ./exports/nft/:');
  console.log('  • Individual persona metadata (*.json)');
  console.log('  • collection.json - Collection metadata');
  console.log('  • on-chain-data.json - Smart contract data');

  console.log('\n🔗 Next Steps:');
  console.log('  1. Upload images to IPFS/Arweave');
  console.log('  2. Update IPFS hashes in metadata');
  console.log('  3. Deploy NFT smart contract');
  console.log('  4. Mint personas as NFTs');

  console.log('\n🎉 NFT export completed!');
}

// Run the export if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exportPersonasToNFT().catch(console.error);
}

export { exportPersonasToNFT };