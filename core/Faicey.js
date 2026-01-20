/**
 * @module Faicey
 * Faicey - Definitive Agent Persona & Face Cloning Software
 *
 * Main orchestration class for the Faicey platform. Provides unified API
 * for creating, managing, and controlling agent personas with advanced
 * facial expressions and wireframe rendering capabilities.
 */

import * as THREE from 'three';
import { FaceRenderer } from './renderers/FaceRenderer.js';
import { ConfigurationManager } from './config/ConfigurationManager.js';
import { PluginManager } from './plugins/PluginManager.js';
import { PersonaManager } from '../personas/PersonaManager.js';
import { Logger } from './utils/Logger.js';
import { EventEmitter } from './utils/EventEmitter.js';

/**
 * Main Faicey class - orchestrates all modules and provides unified API
 */
export class Faicey extends EventEmitter {
  constructor(options = {}) {
    super();

    // Core configuration
    this.options = {
      renderer: 'webgl', // 'webgl', 'canvas', 'ascii'
      mode: 'browser', // 'browser', 'node'
      logging: options.logging || false,
      debug: options.debug || false,
      plugins: options.plugins || [],
      ...options
    };

    // Initialize logger
    this.logger = new Logger({
      enabled: this.options.logging,
      level: this.options.debug ? 'debug' : 'info'
    });

    // Core managers
    this.configManager = new ConfigurationManager();
    this.pluginManager = new PluginManager(this);
    this.personaManager = new PersonaManager({ logger: this.logger });

    // Runtime state
    this.renderers = new Map();
    this.personas = new Map();
    this.activeRenderer = null;
    this.isInitialized = false;

    this.logger.info('Faicey initialized with options:', this.options);
  }

  /**
   * Initialize the Faicey platform
   * @param {Object} config - Configuration options
   * @returns {Promise<Faicey>} - Initialized Faicey instance
   */
  async initialize(config = {}) {
    try {
      this.logger.info('Initializing Faicey platform...');

      // Load configuration
      await this.configManager.load(config);

      // Initialize plugin system
      await this.pluginManager.initialize();

      // Initialize persona system
      await this.personaManager.initialize();

      // Create default renderer
      await this.createRenderer('default', this.options.renderer);

      // Load default personas
      await this.loadDefaultPersonas();

      this.isInitialized = true;
      this.emit('initialized', this);

      this.logger.info('Faicey platform initialized successfully');
      return this;

    } catch (error) {
      this.logger.error('Failed to initialize Faicey:', error);
      throw error;
    }
  }

  /**
   * Create a new renderer instance
   * @param {string} name - Renderer name
   * @param {string} type - Renderer type ('webgl', 'canvas', 'ascii')
   * @param {Object} options - Renderer options
   * @returns {Promise<FaceRenderer>} - Created renderer
   */
  async createRenderer(name, type = 'webgl', options = {}) {
    try {
      this.logger.debug(`Creating ${type} renderer: ${name}`);

      const rendererOptions = {
        ...this.options,
        ...options,
        logger: this.logger
      };

      const renderer = new FaceRenderer(rendererOptions);
      renderer.init();

      this.renderers.set(name, renderer);

      // Set as active if it's the first renderer
      if (!this.activeRenderer) {
        this.activeRenderer = renderer;
      }

      this.emit('rendererCreated', { name, renderer });
      return renderer;

    } catch (error) {
      this.logger.error(`Failed to create renderer ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get a renderer by name
   * @param {string} name - Renderer name
   * @returns {FaceRenderer|null} - Renderer instance or null
   */
  getRenderer(name = 'default') {
    return this.renderers.get(name) || null;
  }

  /**
   * Set the active renderer
   * @param {string} name - Renderer name
   * @returns {boolean} - Success status
   */
  setActiveRenderer(name) {
    const renderer = this.getRenderer(name);
    if (renderer) {
      this.activeRenderer = renderer;
      this.emit('activeRendererChanged', { name, renderer });
      return true;
    }
    return false;
  }

  /**
   * Create a new agent persona
   * @param {string} name - Persona name
   * @param {Object} config - Persona configuration
   * @returns {Promise<Object>} - Created persona
   */
  async createPersona(name, config = {}) {
    try {
      this.logger.info(`Creating persona: ${name}`);

      // Merge with default configuration
      const defaultConfig = await this.configManager.getPersonaConfig('default');
      const personaConfig = {
        ...defaultConfig,
        ...config,
        name
      };

      // Validate configuration
      await this.validatePersonaConfig(personaConfig);

      // Create persona instance
      const persona = {
        name,
        config: personaConfig,
        renderer: null,
        created: new Date(),
        active: false
      };

      // Create dedicated renderer for this persona if needed
      if (config.dedicatedRenderer) {
        persona.renderer = await this.createRenderer(`${name}-renderer`, this.options.renderer);
      }

      this.personas.set(name, persona);
      this.emit('personaCreated', persona);

      this.logger.info(`Persona ${name} created successfully`);
      return persona;

    } catch (error) {
      this.logger.error(`Failed to create persona ${name}:`, error);
      throw error;
    }
  }

  /**
   * Load a persona from configuration
   * @param {string} name - Persona name
   * @returns {Promise<Object>} - Loaded persona
   */
  async loadPersona(name) {
    try {
      const config = await this.configManager.getPersonaConfig(name);
      return await this.createPersona(name, config);
    } catch (error) {
      this.logger.error(`Failed to load persona ${name}:`, error);
      throw error;
    }
  }

  /**
   * Activate a persona
   * @param {string} name - Persona name
   * @returns {Promise<boolean>} - Success status
   */
  async activatePersona(name) {
    try {
      const persona = this.personas.get(name);
      if (!persona) {
        throw new Error(`Persona ${name} not found`);
      }

      // Deactivate current persona
      const currentActive = Array.from(this.personas.values()).find(p => p.active);
      if (currentActive) {
        currentActive.active = false;
        this.emit('personaDeactivated', currentActive);
      }

      // Activate new persona
      persona.active = true;

      // Switch renderer if persona has dedicated renderer
      if (persona.renderer) {
        this.activeRenderer = persona.renderer;
      }

      // Load persona's default expression
      if (this.activeRenderer) {
        await this.activeRenderer.setPersona(persona.config);
      }

      this.emit('personaActivated', persona);
      this.logger.info(`Persona ${name} activated`);
      return true;

    } catch (error) {
      this.logger.error(`Failed to activate persona ${name}:`, error);
      throw error;
    }
  }

  /**
   * Set expression on active persona
   * @param {string} expression - Expression name
   * @param {number} intensity - Expression intensity (0-1)
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} - Success status
   */
  async setExpression(expression, intensity = 1.0, options = {}) {
    // Try persona-based expression first
    const activePersona = this.personaManager.getActivePersona();
    if (activePersona) {
      try {
        await activePersona.setExpression(expression, { ...options, intensity });
        this.emit('expressionChanged', { expression, intensity, options, persona: activePersona });
        return true;
      } catch (error) {
        this.logger.warn(`Persona expression failed, falling back to renderer:`, error.message);
      }
    }

    // Fallback to renderer
    if (!this.activeRenderer) {
      throw new Error('No active renderer available');
    }

    try {
      await this.activeRenderer.setExpression(expression, intensity, options);
      this.emit('expressionChanged', { expression, intensity, options });
      return true;
    } catch (error) {
      this.logger.error(`Failed to set expression ${expression}:`, error);
      throw error;
    }
  }

  /**
   * Create a new persona instance
   * @param {string} templateName - Template name
   * @param {string} instanceId - Instance ID
   * @param {Object} options - Persona options
   * @returns {Promise<Object>} - Created persona
   */
  async createPersona(templateName, instanceId, options = {}) {
    const persona = await this.personaManager.createPersonaInstance(templateName, instanceId, {
      logger: this.logger,
      ...options
    });

    // Initialize persona with renderer if available
    if (this.activeRenderer) {
      await persona.initialize(this.activeRenderer);
    }

    return persona;
  }

  /**
   * Activate a persona by instance ID
   * @param {string} instanceId - Persona instance ID
   * @returns {Promise<boolean>} - Success status
   */
  async activatePersona(instanceId) {
    const success = await this.personaManager.activatePersona(instanceId);
    if (success) {
      const persona = this.personaManager.getActivePersona();
      this.emit('personaActivated', { instanceId, persona });
    }
    return success;
  }

  /**
   * Get the active persona
   * @returns {Object|null} - Active persona or null
   */
  getActivePersona() {
    return this.personaManager.getActivePersona();
  }

  /**
   * Get available persona templates
   * @returns {Array<Object>} - Array of template objects
   */
  getPersonaTemplates() {
    return this.personaManager.getAllTemplates();
  }

  /**
   * Get all persona instances
   * @returns {Array<Object>} - Array of persona instances
   */
  getPersonaInstances() {
    return this.personaManager.getAllInstances();
  }

  /**
   * Load default personas from configuration
   * @returns {Promise<void>}
   */
  async loadDefaultPersonas() {
    try {
      const defaultPersonas = ['professor-codephreak', 'mindx-base', 'jaimla'];

      for (const personaName of defaultPersonas) {
        try {
          await this.loadPersona(personaName);
          this.logger.debug(`Loaded default persona: ${personaName}`);
        } catch (error) {
          this.logger.warn(`Failed to load default persona ${personaName}:`, error.message);
        }
      }
    } catch (error) {
      this.logger.error('Failed to load default personas:', error);
    }
  }

  /**
   * Validate persona configuration
   * @param {Object} config - Persona configuration
   * @returns {Promise<boolean>} - Validation result
   */
  async validatePersonaConfig(config) {
    const required = ['name'];
    const missing = required.filter(key => !config[key]);

    if (missing.length > 0) {
      throw new Error(`Invalid persona config: missing ${missing.join(', ')}`);
    }

    return true;
  }

  /**
   * Get platform status
   * @returns {Object} - Platform status
   */
  getStatus() {
    const personaStatus = this.personaManager.getStatus();
    return {
      initialized: this.isInitialized,
      renderers: Array.from(this.renderers.keys()),
      activeRenderer: this.activeRenderer ? 'available' : 'none',
      personas: {
        templates: personaStatus.templates,
        instances: personaStatus.instances
      },
      plugins: this.pluginManager.getLoadedPlugins()
    };
  }

  /**
   * Shutdown the Faicey platform
   * @returns {Promise<void>}
   */
  async shutdown() {
    try {
      this.logger.info('Shutting down Faicey platform...');

      // Shutdown all renderers
      for (const [name, renderer] of this.renderers) {
        try {
          await renderer.dispose();
          this.logger.debug(`Renderer ${name} disposed`);
        } catch (error) {
          this.logger.warn(`Error disposing renderer ${name}:`, error);
        }
      }

      // Shutdown plugin manager
      await this.pluginManager.shutdown();

      // Shutdown persona manager
      await this.personaManager.cleanup();

      this.isInitialized = false;
      this.emit('shutdown', this);

      this.logger.info('Faicey platform shutdown complete');

    } catch (error) {
      this.logger.error('Error during Faicey shutdown:', error);
      throw error;
    }
  }

  // Convenience methods for common operations
  async smile(intensity = 1.0) { return this.setExpression('smile', intensity); }
  async frown(intensity = 1.0) { return this.setExpression('frown', intensity); }
  async think(intensity = 1.0) { return this.setExpression('thinking', intensity); }
  async speak(text) { return this.setExpression('speaking', 1.0, { text }); }
}

// Export default instance factory
export function createFaicey(options = {}) {
  return new Faicey(options);
}

// Export for CommonJS compatibility
export default Faicey;