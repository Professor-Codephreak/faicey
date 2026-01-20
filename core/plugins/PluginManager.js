/**
 * @module plugins/PluginManager
 * PluginManager - Manages Faicey plugins and extensions
 *
 * Provides plugin loading, unloading, and lifecycle management
 * for extending Faicey functionality.
 */

import { Logger } from '../utils/Logger.js';

export class PluginManager {
  constructor(faicey, options = {}) {
    this.faicey = faicey;
    this.logger = options.logger || new Logger();
    this.plugins = new Map();
    this.loadedPlugins = [];
    this.pluginConfigs = new Map();
  }

  /**
   * Initialize the plugin system
   * @returns {Promise<void>}
   */
  async initialize() {
    this.logger.info('Initializing plugin system...');

    // Load built-in plugins
    await this.loadBuiltinPlugins();

    this.logger.info('Plugin system initialized');
  }

  /**
   * Load a plugin
   * @param {string|Object} plugin - Plugin name/path or plugin object
   * @param {Object} config - Plugin configuration
   * @returns {Promise<Object>} - Loaded plugin instance
   */
  async loadPlugin(plugin, config = {}) {
    try {
      let pluginModule;

      if (typeof plugin === 'string') {
        // Load plugin by name/path
        pluginModule = await this.resolvePlugin(plugin);
      } else if (typeof plugin === 'object') {
        // Plugin object provided directly
        pluginModule = plugin;
      } else {
        throw new Error('Invalid plugin specification');
      }

      // Validate plugin structure
      await this.validatePlugin(pluginModule);

      // Create plugin instance
      const pluginInstance = await this.instantiatePlugin(pluginModule, config);

      // Initialize plugin
      if (pluginInstance.initialize) {
        await pluginInstance.initialize(this.faicey, config);
      }

      // Register plugin
      const pluginName = pluginInstance.name || pluginModule.name;
      this.plugins.set(pluginName, pluginInstance);
      this.loadedPlugins.push(pluginName);

      // Store configuration
      this.pluginConfigs.set(pluginName, config);

      this.faicey.emit('pluginLoaded', { name: pluginName, plugin: pluginInstance });

      this.logger.info(`Plugin loaded: ${pluginName}`);
      return pluginInstance;

    } catch (error) {
      this.logger.error('Failed to load plugin:', error);
      throw error;
    }
  }

  /**
   * Unload a plugin
   * @param {string} name - Plugin name
   * @returns {Promise<boolean>} - Success status
   */
  async unloadPlugin(name) {
    try {
      const plugin = this.plugins.get(name);
      if (!plugin) {
        this.logger.warn(`Plugin not found: ${name}`);
        return false;
      }

      // Call plugin shutdown
      if (plugin.shutdown) {
        await plugin.shutdown();
      }

      // Remove from collections
      this.plugins.delete(name);
      this.pluginConfigs.delete(name);
      const index = this.loadedPlugins.indexOf(name);
      if (index > -1) {
        this.loadedPlugins.splice(index, 1);
      }

      this.faicey.emit('pluginUnloaded', { name, plugin });
      this.logger.info(`Plugin unloaded: ${name}`);
      return true;

    } catch (error) {
      this.logger.error(`Failed to unload plugin ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get a loaded plugin by name
   * @param {string} name - Plugin name
   * @returns {Object|null} - Plugin instance or null
   */
  getPlugin(name) {
    return this.plugins.get(name) || null;
  }

  /**
   * Get all loaded plugins
   * @returns {Array<string>} - Array of loaded plugin names
   */
  getLoadedPlugins() {
    return [...this.loadedPlugins];
  }

  /**
   * Get plugin configuration
   * @param {string} name - Plugin name
   * @returns {Object|null} - Plugin configuration or null
   */
  getPluginConfig(name) {
    return this.pluginConfigs.get(name) || null;
  }

  /**
   * Update plugin configuration
   * @param {string} name - Plugin name
   * @param {Object} config - New configuration
   * @returns {Promise<boolean>} - Success status
   */
  async updatePluginConfig(name, config) {
    try {
      const plugin = this.getPlugin(name);
      if (!plugin) {
        throw new Error(`Plugin not found: ${name}`);
      }

      if (plugin.updateConfig) {
        await plugin.updateConfig(config);
      }

      this.pluginConfigs.set(name, config);
      this.logger.info(`Updated configuration for plugin: ${name}`);
      return true;

    } catch (error) {
      this.logger.error(`Failed to update plugin config ${name}:`, error);
      throw error;
    }
  }

  /**
   * Load built-in plugins
   * @returns {Promise<void>}
   */
  async loadBuiltinPlugins() {
    const builtinPlugins = [
      // Add built-in plugins here as they are created
    ];

    for (const plugin of builtinPlugins) {
      try {
        await this.loadPlugin(plugin);
      } catch (error) {
        this.logger.warn(`Failed to load built-in plugin:`, error.message);
      }
    }
  }

  /**
   * Resolve plugin by name/path
   * @param {string} pluginRef - Plugin reference
   * @returns {Promise<Object>} - Resolved plugin module
   */
  async resolvePlugin(pluginRef) {
    try {
      // Try different resolution strategies
      if (pluginRef.startsWith('./') || pluginRef.startsWith('../') || pluginRef.startsWith('/')) {
        // Absolute or relative path
        const plugin = await import(pluginRef);
        return plugin.default || plugin;
      } else {
        // Plugin name - try built-in plugins first
        const builtinPath = `./builtin/${pluginRef}.js`;
        try {
          const plugin = await import(builtinPath);
          return plugin.default || plugin;
        } catch {
          // Try external plugin
          const plugin = await import(pluginRef);
          return plugin.default || plugin;
        }
      }
    } catch (error) {
      throw new Error(`Cannot resolve plugin: ${pluginRef} - ${error.message}`);
    }
  }

  /**
   * Validate plugin structure
   * @param {Object} plugin - Plugin to validate
   * @returns {Promise<boolean>} - Validation result
   */
  async validatePlugin(plugin) {
    if (!plugin || typeof plugin !== 'object') {
      throw new Error('Plugin must be an object');
    }

    const required = ['name'];
    const missing = required.filter(key => !plugin[key]);

    if (missing.length > 0) {
      throw new Error(`Plugin missing required properties: ${missing.join(', ')}`);
    }

    return true;
  }

  /**
   * Instantiate plugin with configuration
   * @param {Object} pluginModule - Plugin module
   * @param {Object} config - Plugin configuration
   * @returns {Promise<Object>} - Plugin instance
   */
  async instantiatePlugin(pluginModule, config) {
    try {
      if (typeof pluginModule === 'function') {
        // Constructor function
        return new pluginModule(config);
      } else if (pluginModule.createInstance) {
        // Factory method
        return await pluginModule.createInstance(config);
      } else {
        // Direct object
        return { ...pluginModule, config };
      }
    } catch (error) {
      throw new Error(`Failed to instantiate plugin: ${error.message}`);
    }
  }

  /**
   * Call a method on all loaded plugins
   * @param {string} method - Method name
   * @param {Array} args - Arguments to pass
   * @returns {Promise<Array>} - Array of results
   */
  async callPluginMethod(method, ...args) {
    const results = [];

    for (const plugin of this.plugins.values()) {
      if (typeof plugin[method] === 'function') {
        try {
          const result = await plugin[method](...args);
          results.push({ plugin: plugin.name, result });
        } catch (error) {
          this.logger.error(`Plugin ${plugin.name} method ${method} failed:`, error);
          results.push({ plugin: plugin.name, error: error.message });
        }
      }
    }

    return results;
  }

  /**
   * Shutdown all plugins
   * @returns {Promise<void>}
   */
  async shutdown() {
    this.logger.info('Shutting down plugin system...');

    // Unload all plugins
    const pluginNames = [...this.loadedPlugins];
    for (const name of pluginNames) {
      try {
        await this.unloadPlugin(name);
      } catch (error) {
        this.logger.warn(`Error unloading plugin ${name}:`, error);
      }
    }

    this.logger.info('Plugin system shutdown complete');
  }
}