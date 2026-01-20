/**
 * @module config/ConfigurationManager
 * ConfigurationManager - Manages Faicey configuration and persona definitions
 *
 * Handles loading, validation, and management of configuration files
 * including persona definitions, renderer settings, and plugin configurations.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Logger } from '../utils/Logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ConfigurationManager {
  constructor(options = {}) {
    this.logger = options.logger || new Logger();
    this.configs = new Map();
    this.personas = new Map();
    this.defaultConfig = {
      renderer: {
        width: 800,
        height: 600,
        backgroundColor: 0x000000,
        wireframe: true,
        expressions: true
      },
      personas: {
        'default': {
          name: 'Default',
          color: 0x00ff00,
          wireframe: {
            enabled: true,
            color: '0x00ff00',
            thickness: 1.5
          },
          defaultExpression: 'neutral'
        }
      }
    };
  }

  /**
   * Load configuration from file or object
   * @param {string|Object} config - Configuration file path or config object
   * @returns {Promise<Object>} - Loaded configuration
   */
  async load(config = {}) {
    try {
      let loadedConfig = {};

      if (typeof config === 'string') {
        // Load from file
        loadedConfig = await this.loadFromFile(config);
      } else if (typeof config === 'object') {
        // Use provided config object
        loadedConfig = config;
      }

      // Merge with defaults
      const finalConfig = this.mergeConfigs(this.defaultConfig, loadedConfig);

      // Validate configuration
      await this.validateConfig(finalConfig);

      // Store configuration
      this.configs.set('main', finalConfig);

      // Load personas
      if (finalConfig.personas) {
        await this.loadPersonas(finalConfig.personas);
      }

      this.logger.info('Configuration loaded successfully');
      return finalConfig;

    } catch (error) {
      this.logger.error('Failed to load configuration:', error);
      throw error;
    }
  }

  /**
   * Load configuration from file
   * @param {string} filePath - Path to configuration file
   * @returns {Promise<Object>} - Parsed configuration
   */
  async loadFromFile(filePath) {
    try {
      if (!existsSync(filePath)) {
        throw new Error(`Configuration file not found: ${filePath}`);
      }

      const content = readFileSync(filePath, 'utf-8');
      const config = JSON.parse(content);

      this.logger.debug(`Loaded configuration from: ${filePath}`);
      return config;

    } catch (error) {
      this.logger.error(`Failed to load config file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Load personas from configuration
   * @param {Object} personasConfig - Personas configuration object
   * @returns {Promise<void>}
   */
  async loadPersonas(personasConfig) {
    try {
      for (const [name, config] of Object.entries(personasConfig)) {
        await this.validatePersonaConfig(config);
        this.personas.set(name, {
          ...config,
          loaded: new Date(),
          source: 'config'
        });
      }

      this.logger.info(`Loaded ${this.personas.size} personas from configuration`);

    } catch (error) {
      this.logger.error('Failed to load personas:', error);
      throw error;
    }
  }

  /**
   * Get persona configuration by name
   * @param {string} name - Persona name
   * @returns {Promise<Object>} - Persona configuration
   */
  async getPersonaConfig(name) {
    const persona = this.personas.get(name);
    if (!persona) {
      throw new Error(`Persona not found: ${name}`);
    }
    return { ...persona };
  }

  /**
   * Get all available personas
   * @returns {Array<Object>} - Array of persona configurations
   */
  getAllPersonas() {
    return Array.from(this.personas.values());
  }

  /**
   * Get main configuration
   * @returns {Object} - Main configuration object
   */
  getMainConfig() {
    return this.configs.get('main') || this.defaultConfig;
  }

  /**
   * Update persona configuration
   * @param {string} name - Persona name
   * @param {Object} updates - Configuration updates
   * @returns {Promise<Object>} - Updated persona configuration
   */
  async updatePersonaConfig(name, updates) {
    try {
      const persona = this.personas.get(name);
      if (!persona) {
        throw new Error(`Persona not found: ${name}`);
      }

      // Validate updates
      await this.validatePersonaConfig({ ...persona, ...updates });

      // Apply updates
      Object.assign(persona, updates, { updated: new Date() });

      this.logger.info(`Updated persona configuration: ${name}`);
      return { ...persona };

    } catch (error) {
      this.logger.error(`Failed to update persona ${name}:`, error);
      throw error;
    }
  }

  /**
   * Validate configuration structure
   * @param {Object} config - Configuration to validate
   * @returns {Promise<boolean>} - Validation result
   */
  async validateConfig(config) {
    const required = ['renderer'];
    const missing = required.filter(key => !config[key]);

    if (missing.length > 0) {
      throw new Error(`Invalid configuration: missing ${missing.join(', ')}`);
    }

    // Validate renderer config
    if (config.renderer) {
      const rendererRequired = ['width', 'height'];
      const rendererMissing = rendererRequired.filter(key => !config.renderer[key]);
      if (rendererMissing.length > 0) {
        throw new Error(`Invalid renderer config: missing ${rendererMissing.join(', ')}`);
      }
    }

    return true;
  }

  /**
   * Validate persona configuration
   * @param {Object} config - Persona configuration to validate
   * @returns {Promise<boolean>} - Validation result
   */
  async validatePersonaConfig(config) {
    const required = ['name'];
    const missing = required.filter(key => !config[key]);

    if (missing.length > 0) {
      throw new Error(`Invalid persona config: missing ${missing.join(', ')}`);
    }

    // Validate wireframe config if present
    if (config.wireframe && typeof config.wireframe === 'object') {
      if (config.wireframe.color && typeof config.wireframe.color === 'string') {
        // Convert hex string to number if needed
        if (config.wireframe.color.startsWith('0x')) {
          config.wireframe.color = parseInt(config.wireframe.color, 16);
        }
      }
    }

    return true;
  }

  /**
   * Merge two configuration objects
   * @param {Object} base - Base configuration
   * @param {Object} override - Override configuration
   * @returns {Object} - Merged configuration
   */
  mergeConfigs(base, override) {
    return this.deepMerge({ ...base }, override);
  }

  /**
   * Deep merge two objects
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} - Merged object
   */
  deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Save current configuration to file
   * @param {string} filePath - Path to save configuration
   * @returns {Promise<void>}
   */
  async saveConfig(filePath) {
    try {
      const config = this.getMainConfig();
      const json = JSON.stringify(config, null, 2);

      // Note: In a real implementation, you'd write to file here
      // For now, we'll just log it
      this.logger.info(`Configuration would be saved to: ${filePath}`);
      this.logger.debug('Config content:', json);

    } catch (error) {
      this.logger.error('Failed to save configuration:', error);
      throw error;
    }
  }

  /**
   * Reset configuration to defaults
   * @returns {Promise<void>}
   */
  async resetConfig() {
    this.configs.clear();
    this.personas.clear();
    await this.load(this.defaultConfig);
    this.logger.info('Configuration reset to defaults');
  }
}