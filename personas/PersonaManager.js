/**
 * @module personas/PersonaManager
 * Persona Manager
 *
 * Manages loading, creating, and managing agent personas
 * Provides interface for working with persona templates and instances
 */

import { Logger } from '../core/utils/Logger.js';
import { EventEmitter } from '../core/utils/EventEmitter.js';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Persona Manager
 * Handles persona template loading and instance management
 */
export class PersonaManager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.logger = options.logger || new Logger({
      prefix: 'PersonaManager',
      enabled: options.logging !== false
    });

    // Persona collections
    this.templates = new Map();
    this.instances = new Map();
    this.activePersona = null;

    // Configuration
    this.templatesPath = options.templatesPath || join(__dirname, 'templates');
    this.instancesPath = options.instancesPath || join(__dirname, 'instances');

    // Built-in templates
    this.builtInTemplates = [
      'BasePersona',
      'professor-codephreak'
    ];

    this.logger.info('Persona Manager initialized');
  }

  /**
   * Initialize the persona manager
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      this.logger.info('Initializing Persona Manager...');

      // Load built-in templates
      await this.loadBuiltInTemplates();

      // Load custom templates from templates directory
      await this.loadTemplatesFromDirectory();

      this.logger.info(`Persona Manager initialized with ${this.templates.size} templates`);

    } catch (error) {
      this.logger.error('Failed to initialize Persona Manager:', error);
      throw error;
    }
  }

  /**
   * Load built-in persona templates
   * @returns {Promise<void>}
   */
  async loadBuiltInTemplates() {
    for (const templateName of this.builtInTemplates) {
      try {
        const templatePath = join(this.templatesPath, `${templateName}.js`);
        if (existsSync(templatePath)) {
          await this.loadTemplateFromFile(templatePath);
        } else {
          this.logger.warn(`Built-in template not found: ${templateName}`);
        }
      } catch (error) {
        this.logger.warn(`Failed to load built-in template ${templateName}:`, error.message);
      }
    }
  }

  /**
   * Load templates from templates directory
   * @returns {Promise<void>}
   */
  async loadTemplatesFromDirectory() {
    // This would scan the templates directory for .js files
    // For now, we'll rely on explicit loading
    this.logger.debug('Template directory scanning not yet implemented');
  }

  /**
   * Load a persona template from file
   * @param {string} filePath - Path to template file
   * @returns {Promise<Object>} - Loaded template
   */
  async loadTemplateFromFile(filePath) {
    try {
      const templateModule = await import(filePath);
      const TemplateClass = templateModule.default || templateModule;

      if (!TemplateClass) {
        throw new Error('No valid template class found in file');
      }

      // Create template metadata
      const fileName = filePath.split('/').pop().replace('.js', '');
      const template = {
        name: fileName, // Use filename as template name
        className: TemplateClass.name,
        class: TemplateClass,
        path: filePath,
        loaded: new Date(),
        createInstance: (options = {}) => new TemplateClass(options)
      };

      this.templates.set(template.name, template);
      this.emit('templateLoaded', template);

      this.logger.info(`Loaded template: ${template.name}`);
      return template;

    } catch (error) {
      this.logger.error(`Failed to load template from ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Get a persona template by name
   * @param {string} name - Template name
   * @returns {Object|null} - Template object or null
   */
  getTemplate(name) {
    return this.templates.get(name) || null;
  }

  /**
   * Get all available templates
   * @returns {Array<Object>} - Array of template objects
   */
  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  /**
   * Create a persona instance from template
   * @param {string} templateName - Name of template to use
   * @param {string} instanceId - Unique instance identifier
   * @param {Object} options - Instance options
   * @returns {Promise<Object>} - Created persona instance
   */
  async createPersonaInstance(templateName, instanceId, options = {}) {
    try {
      const template = this.getTemplate(templateName);
      if (!template) {
        throw new Error(`Template not found: ${templateName}`);
      }

      // Create instance
      const instance = template.createInstance({
        ...options,
        instanceId,
        logger: this.logger
      });

      // Store instance
      this.instances.set(instanceId, {
        id: instanceId,
        template: templateName,
        persona: instance,
        created: new Date(),
        active: false
      });

      this.emit('instanceCreated', { instanceId, template: templateName, persona: instance });
      this.logger.info(`Created persona instance: ${instanceId} from template: ${templateName}`);

      return instance;

    } catch (error) {
      this.logger.error(`Failed to create persona instance ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Get a persona instance by ID
   * @param {string} instanceId - Instance identifier
   * @returns {Object|null} - Instance object or null
   */
  getInstance(instanceId) {
    const instance = this.instances.get(instanceId);
    return instance ? instance.persona : null;
  }

  /**
   * Get all persona instances
   * @returns {Array<Object>} - Array of instance objects
   */
  getAllInstances() {
    return Array.from(this.instances.values()).map(inst => inst.persona);
  }

  /**
   * Activate a persona instance
   * @param {string} instanceId - Instance identifier
   * @returns {Promise<boolean>} - Success status
   */
  async activatePersona(instanceId) {
    try {
      const instance = this.instances.get(instanceId);
      if (!instance) {
        throw new Error(`Instance not found: ${instanceId}`);
      }

      // Deactivate current active persona
      if (this.activePersona) {
        const currentInstance = this.instances.get(this.activePersona);
        if (currentInstance) {
          currentInstance.active = false;
          this.emit('personaDeactivated', { instanceId: this.activePersona, persona: currentInstance.persona });
        }
      }

      // Activate new persona
      instance.active = true;
      this.activePersona = instanceId;

      this.emit('personaActivated', { instanceId, persona: instance.persona });
      this.logger.info(`Activated persona instance: ${instanceId}`);

      return true;

    } catch (error) {
      this.logger.error(`Failed to activate persona ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate the currently active persona
   * @returns {Promise<boolean>} - Success status
   */
  async deactivateCurrentPersona() {
    if (this.activePersona) {
      const instance = this.instances.get(this.activePersona);
      if (instance) {
        instance.active = false;
        this.emit('personaDeactivated', { instanceId: this.activePersona, persona: instance.persona });
        this.activePersona = null;
        this.logger.info('Deactivated current persona');
        return true;
      }
    }
    return false;
  }

  /**
   * Get the currently active persona
   * @returns {Object|null} - Active persona instance or null
   */
  getActivePersona() {
    return this.activePersona ? this.getInstance(this.activePersona) : null;
  }

  /**
   * Remove a persona instance
   * @param {string} instanceId - Instance identifier
   * @returns {Promise<boolean>} - Success status
   */
  async removePersonaInstance(instanceId) {
    try {
      const instance = this.instances.get(instanceId);
      if (!instance) {
        return false;
      }

      // Deactivate if active
      if (this.activePersona === instanceId) {
        await this.deactivateCurrentPersona();
      }

      // Dispose persona
      if (instance.persona.dispose) {
        await instance.persona.dispose();
      }

      // Remove from collection
      this.instances.delete(instanceId);

      this.emit('instanceRemoved', { instanceId, persona: instance.persona });
      this.logger.info(`Removed persona instance: ${instanceId}`);

      return true;

    } catch (error) {
      this.logger.error(`Failed to remove persona instance ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Save a persona instance to file
   * @param {string} instanceId - Instance identifier
   * @param {string} filePath - Path to save instance
   * @returns {Promise<void>}
   */
  async savePersonaInstance(instanceId, filePath) {
    try {
      const instance = this.instances.get(instanceId);
      if (!instance) {
        throw new Error(`Instance not found: ${instanceId}`);
      }

      const config = instance.persona.exportConfig();

      // In a real implementation, you'd write to file here
      this.logger.info(`Would save persona instance ${instanceId} to: ${filePath}`);
      this.logger.debug('Instance config:', config);

    } catch (error) {
      this.logger.error(`Failed to save persona instance ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Load a persona instance from file
   * @param {string} filePath - Path to instance file
   * @param {string} instanceId - Instance identifier
   * @returns {Promise<Object>} - Loaded persona instance
   */
  async loadPersonaInstance(filePath, instanceId) {
    try {
      // In a real implementation, you'd read from file here
      this.logger.info(`Would load persona instance from: ${filePath}`);

      // For now, create a basic instance
      return await this.createPersonaInstance('BasePersona', instanceId);

    } catch (error) {
      this.logger.error(`Failed to load persona instance from ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Get persona manager status
   * @returns {Object} - Status information
   */
  getStatus() {
    return {
      templates: {
        count: this.templates.size,
        names: Array.from(this.templates.keys())
      },
      instances: {
        count: this.instances.size,
        names: Array.from(this.instances.keys()),
        active: this.activePersona
      },
      templatesPath: this.templatesPath,
      instancesPath: this.instancesPath
    };
  }

  /**
   * Clean up all persona instances
   * @returns {Promise<void>}
   */
  async cleanup() {
    this.logger.info('Cleaning up Persona Manager...');

    // Deactivate active persona
    await this.deactivateCurrentPersona();

    // Dispose all instances
    for (const [instanceId, instance] of this.instances) {
      try {
        if (instance.persona.dispose) {
          await instance.persona.dispose();
        }
      } catch (error) {
        this.logger.warn(`Error disposing instance ${instanceId}:`, error);
      }
    }

    // Clear collections
    this.templates.clear();
    this.instances.clear();
    this.activePersona = null;

    this.logger.info('Persona Manager cleanup complete');
  }
}

// Export default instance factory
export function createPersonaManager(options = {}) {
  return new PersonaManager(options);
}

// Export for CommonJS compatibility
export default PersonaManager;