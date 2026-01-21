/**
 * @module utils/NFTExporter
 * NFTExporter - Handles export of personas to NFT-compatible formats
 * Supports iNFT and dNFT standards with dynamic trait evolution
 */

import fs from 'fs';
import path from 'path';

export default class NFTExporter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || './exports/nft';
    this.baseURI = options.baseURI || 'ipfs://';
    this.contractAddress = options.contractAddress || '0x0000000000000000000000000000000000000000';
    this.chainId = options.chainId || 1; // Ethereum mainnet
  }

  /**
   * Export a persona to NFT metadata format
   * @param {Object} personaData - Complete persona configuration
   * @param {Object} options - Export options
   * @returns {Object} - NFT metadata
   */
  exportToNFT(personaData, options = {}) {
    const { includeDynamic = true, includePrivate = false, version = '1.0.0' } = options;

    // Base NFT metadata structure
    const metadata = {
      name: personaData.nft.name,
      description: personaData.nft.description,
      image: personaData.nft.image,
      external_url: personaData.nft.external_url,
      animation_url: personaData.nft.animation_url,
      interactive_url: personaData.nft.interactive_url,
      attributes: this.processAttributes(personaData, includeDynamic),
      properties: {
        category: 'persona',
        creators: [{
          address: this.contractAddress,
          share: 100
        }],
        files: [
          {
            uri: personaData.nft.image,
            type: 'image/png',
            cdn: true
          },
          {
            uri: personaData.nft.animation_url,
            type: 'text/html',
            cdn: true
          }
        ]
      },
      faicey: {
        version: version,
        id: personaData.core.id,
        type: 'intelligent-nft',
        dynamic: includeDynamic,
        evolution_capable: true,
        last_updated: new Date().toISOString()
      }
    };

    // Add dynamic properties if enabled
    if (includeDynamic && personaData.dynamic) {
      metadata.dynamic_properties = this.processDynamicProperties(personaData.dynamic);
      metadata.evolution_rules = this.processEvolutionRules(personaData);
    }

    // Add AI prompts for iNFT functionality
    const aiPrompts = personaData.ai_prompts || personaData.appearance?.ai_prompts;
    if (aiPrompts) {
      metadata.ai_capabilities = this.processAICapabilities(aiPrompts);
    }

    // Add private data if requested (for owner-only access)
    if (includePrivate) {
      metadata.private_data = this.processPrivateData(personaData);
    }

    return metadata;
  }

  /**
   * Process NFT attributes for OpenSea/Opensea-like marketplaces
   */
  processAttributes(personaData, includeDynamic) {
    const attributes = [...personaData.nft.attributes];

    // Add dynamic attributes if enabled
    if (includeDynamic && personaData.dynamic?.traits) {
      Object.entries(personaData.dynamic.traits).forEach(([traitName, traitData]) => {
        const dynamicAttr = {
          trait_type: this.formatTraitName(traitName),
          value: traitData.current,
          max_value: traitData.max,
          dynamic: true,
          evolution_rate: traitData.growth_rate,
          decay_rate: traitData.decay_rate
        };

        // Add display value for numeric traits
        if (typeof traitData.current === 'number') {
          dynamicAttr.display_type = 'number';
        } else if (Array.isArray(traitData.levels)) {
          dynamicAttr.display_type = 'level';
          dynamicAttr.levels = traitData.levels;
        }

        attributes.push(dynamicAttr);
      });
    }

    // Add evolution attributes
    if (personaData.evolution) {
      attributes.push({
        trait_type: 'Level',
        value: personaData.evolution.level,
        max_value: 100,
        dynamic: true
      });
      attributes.push({
        trait_type: 'Experience',
        value: personaData.evolution.total_xp,
        display_type: 'number',
        dynamic: true
      });
    }

    return attributes;
  }

  /**
   * Process dynamic properties for dNFT functionality
   */
  processDynamicProperties(dynamicData) {
    return {
      traits: Object.entries(dynamicData.traits).map(([name, data]) => ({
        name: this.formatTraitName(name),
        current_value: data.current,
        min_value: data.min,
        max_value: data.max,
        growth_rate: data.growth_rate,
        decay_rate: data.decay_rate,
        triggers: data.triggers || [],
        last_updated: new Date().toISOString()
      })),
      animations: Object.entries(dynamicData.animations || {}).map(([name, anim]) => ({
        name,
        sequence: anim.sequence,
        duration: anim.duration,
        interruptible: anim.interruptible || false,
        triggers: anim.triggers || []
      })),
      interactions: dynamicData.interactions || {},
      mood_system: dynamicData.traits.mood ? {
        current: dynamicData.traits.mood.current,
        states: dynamicData.traits.mood.states,
        transitions: dynamicData.traits.mood.transitions,
        decay_time: dynamicData.traits.mood.decay_time
      } : null
    };
  }

  /**
   * Process evolution rules for dNFT progression
   */
  processEvolutionRules(personaData) {
    const rules = {
      xp_system: {
        base_xp_rate: 10,
        multipliers: {
          rare_interaction: 2.0,
          milestone: 5.0,
          collaboration: 1.5
        }
      },
      level_progression: {
        xp_required: personaData.evolution?.xp_required || [0, 100, 500, 1500, 5000],
        unlocks_per_level: [
          'new_expression',
          'enhanced_animation',
          'special_ability',
          'visual_upgrade'
        ]
      }
    };

    if (personaData.evolution?.evolution_triggers) {
      rules.triggers = personaData.evolution.evolution_triggers.map(trigger => ({
        event: trigger,
        xp_reward: 50,
        trait_boost: ['intelligence', 'experience']
      }));
    }

    return rules;
  }

  /**
   * Process AI capabilities for iNFT functionality
   */
  processAICapabilities(aiPrompts) {
    return {
      system_prompt: aiPrompts.system,
      interaction_modes: Object.keys(aiPrompts.interaction || {}),
      context_awareness: aiPrompts.context_awareness ? Object.keys(aiPrompts.context_awareness) : [],
      personality_traits: aiPrompts.personality_driven ? Object.keys(aiPrompts.personality_driven) : [],
      evolution_capabilities: aiPrompts.evolution_prompts ? Object.keys(aiPrompts.evolution_prompts) : [],
      intelligent_features: {
        conversation_memory: true,
        adaptive_communication: true,
        personality_driven_responses: true,
        context_aware_interactions: true,
        continuous_learning: true
      }
    };
  }

  /**
   * Process private/owner-only data
   */
  processPrivateData(personaData) {
    return {
      full_personality: personaData.personality,
      complete_capabilities: personaData.capabilities,
      evolution_history: [],
      interaction_logs: [],
      customization_options: {
        color_themes: ['default', 'cyber', 'neon', 'mystical', 'warm'],
        expression_sets: ['basic', 'advanced', 'custom'],
        animation_styles: ['subtle', 'dynamic', 'intense']
      },
      owner_exclusive: {
        direct_voice_access: true,
        custom_training: true,
        evolution_accelerators: true
      }
    };
  }

  /**
   * Export persona collection metadata for contract deployment
   * @param {Array} personas - Array of persona data
   * @returns {Object} - Collection metadata
   */
  exportCollection(personas) {
    return {
      name: 'Faicey AI Personas',
      description: 'Dynamic AI personas that evolve with interaction. Each persona is an intelligent NFT (iNFT) capable of learning, adapting, and providing unique AI experiences.',
      image: 'ipfs://QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/collection-image.png',
      external_link: 'https://faicey.ai',
      seller_fee_basis_points: 250, // 2.5%
      fee_recipient: this.contractAddress,
      properties: {
        category: 'collectibles',
        subcategory: 'ai-personas',
        total_supply: personas.length,
        dynamic: true,
        intelligent: true
      },
      attributes: [
        {
          trait_type: 'Type',
          values: ['AI Persona']
        },
        {
          trait_type: 'Rarity',
          values: ['Common', 'Rare', 'Epic', 'Legendary']
        },
        {
          trait_type: 'Specialty',
          values: ['Coding Expert', 'General Intelligence', 'Customer Service', 'Wisdom & Insight', 'Multimodal Intelligence']
        },
        {
          trait_type: 'Dynamic Traits',
          values: ['Intelligence', 'Experience', 'Mood', 'Energy', 'Adaptability']
        }
      ]
    };
  }

  /**
   * Generate on-chain data for dNFT contract
   * @param {Object} personaData - Persona data
   * @returns {Object} - On-chain compatible data
   */
  generateOnChainData(personaData) {
    return {
      baseURI: this.baseURI,
      contractURI: `${this.baseURI}collection.json`,
      maxSupply: 10000,
      royaltyInfo: {
        recipient: this.contractAddress,
        bps: 250
      },
      dynamicTraits: Object.keys(personaData.dynamic?.traits || {}),
      evolutionEnabled: true,
      interactionTracking: true,
      ownerBenefits: [
        'direct_interaction',
        'custom_evolution',
        'exclusive_content',
        'governance_rights'
      ]
    };
  }

  /**
   * Save NFT metadata to file system
   * @param {Object} metadata - NFT metadata
   * @param {string} filename - Output filename
   */
  async saveToFile(metadata, filename) {
    const outputPath = path.join(this.outputDir, filename);

    // Ensure output directory exists
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

    // Write metadata as JSON
    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(metadata, null, 2),
      'utf8'
    );

    console.log(`✅ NFT metadata saved to: ${outputPath}`);
    return outputPath;
  }

  /**
   * Export all personas as NFT collection
   * @param {Object} personasData - All personas data
   * @returns {Promise<Array>} - Array of exported metadata files
   */
  async exportPersonaCollection(personasData) {
    const exportedFiles = [];
    const personas = Object.values(personasData.personas);

    // Export individual persona metadata
    for (const persona of personas) {
      const metadata = this.exportToNFT(persona);
      const filename = `${persona.core.id}.json`;
      await this.saveToFile(metadata, filename);
      exportedFiles.push(filename);
    }

    // Export collection metadata
    const collectionMetadata = this.exportCollection(personas);
    await this.saveToFile(collectionMetadata, 'collection.json');
    exportedFiles.push('collection.json');

    // Export on-chain data
    const onChainData = this.generateOnChainData(personas[0]); // Use first persona as template
    await this.saveToFile(onChainData, 'on-chain-data.json');
    exportedFiles.push('on-chain-data.json');

    console.log(`✅ Exported ${exportedFiles.length} NFT metadata files`);
    return exportedFiles;
  }

  /**
   * Format trait names for display
   */
  formatTraitName(traitName) {
    return traitName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Validate NFT metadata against standards
   * @param {Object} metadata - NFT metadata to validate
   * @returns {Object} - Validation result
   */
  validateMetadata(metadata) {
    const errors = [];
    const warnings = [];

    // Required fields
    const required = ['name', 'description', 'image'];
    required.forEach(field => {
      if (!metadata[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Attributes validation
    if (metadata.attributes) {
      metadata.attributes.forEach((attr, index) => {
        if (!attr.trait_type || attr.value === undefined) {
          warnings.push(`Attribute ${index} missing trait_type or value`);
        }
      });
    }

    // Dynamic properties validation
    if (metadata.dynamic_properties) {
      if (!metadata.evolution_rules) {
        warnings.push('Dynamic properties present but no evolution rules defined');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5))
    };
  }
}

// Export utility functions
export function createNFTExporter(options = {}) {
  return new NFTExporter(options);
}

export function validatePersonaForNFT(personaData) {
  const requiredSections = ['nft', 'core', 'appearance'];
  const missing = requiredSections.filter(section => !personaData[section]);

  return {
    valid: missing.length === 0,
    missing_sections: missing,
    has_dynamic: !!personaData.dynamic,
    nft_ready: !!personaData.nft?.attributes
  };
}