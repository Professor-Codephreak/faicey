/**
 * @module personas/templates/BasePersona
 * Base Persona Template
 *
 * Abstract base class for all agent personas in Faicey
 * Provides common functionality and structure for persona development
 */

import { Logger } from '../../core/utils/Logger.js';
import { EventEmitter } from '../../core/utils/EventEmitter.js';

/**
 * Base Persona Template
 * All agent personas should extend this class
 */
export class BasePersona extends EventEmitter {
  constructor(options = {}) {
    super();

    // Basic persona metadata
    this.name = options.name || 'Base Persona';
    this.id = options.id || 'base-persona';
    this.version = options.version || '1.0.0';
    this.description = options.description || 'Base agent persona template';

    // Initialize logger
    this.logger = options.logger || new Logger({
      prefix: `Persona:${this.name}`,
      enabled: options.logging !== false
    });

    // Core configuration structure
    this.config = {
      appearance: {
        color: 0x00ff00,
        wireframe: {
          enabled: true,
          color: '0x00ff00',
          style: 'cyber',
          thickness: 1.5,
          skullMode: false,
          anatomicalMarkers: false,
          depthVisualization: false,
          layers: 2,
          glowEffect: true,
          animationSpeed: 1.0
        },
        geometry: 'spherical' // 'skull' or 'spherical'
      },

      personality: {
        traits: ['neutral'],
        expertise: [],
        communicationStyle: 'neutral',
        humorLevel: 'moderate',
        patienceLevel: 'moderate'
      },

      behavior: {
        defaultExpression: 'neutral',
        idleExpressions: ['neutral'],
        blinkFrequency: 0.2,
        autonomousActions: true,
        interactionTimeout: 5000
      },

      expressions: {
        neutral: { intensity: 0.5 },
        blink: { intensity: 1.0, duration: 150 }
      },

      activities: {
        idle: {
          expressions: ['neutral'],
          transitions: ['blink']
        }
      },

      interactions: {
        greeting: {
          expression: 'neutral',
          text: 'Hello!'
        }
      },

      timings: {
        expressionTransition: 300,
        blinkDuration: 150,
        autonomousActionInterval: [10000, 15000]
      }
    };

    // Runtime state
    this.currentActivity = 'idle';
    this.currentExpression = this.config.behavior.defaultExpression;
    this.lastInteraction = Date.now();
    this.isAutonomous = false;
    this.isInitialized = false;

    // Component references
    this.renderer = null;
    this.faceGeometry = null;
    this.expressionController = null;
    this.wireframeController = null;

    this.logger.info(`Base persona template initialized: ${this.name} v${this.version}`);
  }

  /**
   * Initialize the persona with renderer components
   * @param {FaceRenderer} renderer - The face renderer instance
   * @returns {Promise<void>}
   */
  async initialize(renderer) {
    try {
      this.renderer = renderer;
      this.logger.info(`Initializing persona: ${this.name}`);

      // Create geometry
      await this.createGeometry();

      // Initialize controllers
      await this.initializeControllers();

      // Set initial state
      await this.setActivity('idle');

      this.isInitialized = true;
      this.emit('initialized', this);

      this.logger.info(`Persona initialized successfully: ${this.name}`);

    } catch (error) {
      this.logger.error(`Failed to initialize persona ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Create face geometry based on persona configuration
   * Override in subclasses for custom geometry
   * @returns {Promise<void>}
   */
  async createGeometry() {
    // Default implementation - override in subclasses
    this.logger.debug(`Creating geometry for ${this.name}`);
  }

  /**
   * Initialize expression and wireframe controllers
   * @returns {Promise<void>}
   */
  async initializeControllers() {
    // Expression controller initialization
    if (this.renderer && this.renderer.expressionController) {
      this.expressionController = this.renderer.expressionController;
    }

    // Wireframe controller initialization
    if (this.renderer && this.renderer.wireframeController) {
      this.wireframeController = this.renderer.wireframeController;

      // Apply wireframe settings
      const wireframeConfig = this.config.appearance.wireframe;
      if (wireframeConfig.enabled) {
        this.wireframeController.setColor(this.config.appearance.color);
        this.wireframeController.setOpacity(wireframeConfig.visible !== false ? 1.0 : 0.0);

        if (wireframeConfig.glowEffect) {
          this.wireframeController.animateGlow(
            this.config.appearance.color,
            this.parseColor(wireframeConfig.glowColor) || 0xffffff,
            wireframeConfig.animationSpeed
          );
        }
      }
    }

    this.logger.debug(`Initialized controllers for ${this.name}`);
  }

  /**
   * Set the current activity
   * @param {string} activity - Activity name
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  async setActivity(activity, options = {}) {
    this.currentActivity = activity;
    const activityConfig = this.config.activities[activity];

    if (activityConfig && activityConfig.expressions) {
      const primaryExpression = Array.isArray(activityConfig.expressions)
        ? activityConfig.expressions[0]
        : activityConfig.expressions;

      await this.setExpression(primaryExpression, options);
    }

    this.emit('activityChanged', { activity, options });
    this.logger.debug(`Activity set to: ${activity}`);
  }

  /**
   * Set facial expression
   * @param {string} expression - Expression name
   * @param {Object} options - Expression options
   * @returns {Promise<void>}
   */
  async setExpression(expression, options = {}) {
    const expressionConfig = this.config.expressions[expression];

    if (expressionConfig && this.expressionController) {
      const actualExpression = expressionConfig.expression || expression;
      const intensity = options.intensity || expressionConfig.intensity || 1.0;

      await this.expressionController.setExpression(actualExpression, intensity);
      this.currentExpression = actualExpression;
      this.lastInteraction = Date.now();

      // Auto-reset after duration
      if (expressionConfig.duration && options.autoReset !== false) {
        setTimeout(() => {
          if (this.currentExpression === actualExpression) {
            this.resetToDefaultExpression();
          }
        }, expressionConfig.duration);
      }

      this.emit('expressionChanged', { expression: actualExpression, intensity, options });
      this.logger.debug(`Expression set to: ${actualExpression} (${intensity})`);
    }
  }

  /**
   * Handle user interaction
   * @param {string} type - Interaction type
   * @param {Object} data - Interaction data
   * @returns {Promise<void>}
   */
  async handleInteraction(type, data = {}) {
    this.lastInteraction = Date.now();
    this.isAutonomous = false;

    // Override in subclasses
    this.logger.debug(`Interaction handled: ${type}`);
  }

  /**
   * Enter autonomous mode
   * @returns {Promise<void>}
   */
  async enterAutonomousMode() {
    this.isAutonomous = true;
    this.emit('autonomousModeEntered');
    this.logger.debug('Entered autonomous mode');
  }

  /**
   * Exit autonomous mode
   * @returns {Promise<void>}
   */
  async exitAutonomousMode() {
    this.isAutonomous = false;
    this.emit('autonomousModeExited');
    this.logger.debug('Exited autonomous mode');
  }

  /**
   * Reset to default expression
   * @returns {Promise<void>}
   */
  async resetToDefaultExpression() {
    await this.setExpression(this.config.behavior.defaultExpression);
  }

  /**
   * Update persona state (called in animation loop)
   * @param {number} deltaTime - Time since last update
   * @returns {void}
   */
  update(deltaTime) {
    // Check for autonomous mode timeout
    const timeSinceInteraction = Date.now() - this.lastInteraction;
    const timeout = this.config.behavior.interactionTimeout;

    if (!this.isAutonomous && timeSinceInteraction > timeout) {
      this.enterAutonomousMode();
    } else if (this.isAutonomous && timeSinceInteraction < timeout) {
      this.exitAutonomousMode();
    }
  }

  /**
   * Parse color from string or number
   * @param {string|number} color - Color value
   * @returns {number} - Parsed color number
   */
  parseColor(color) {
    if (typeof color === 'string' && color.startsWith('0x')) {
      return parseInt(color, 16);
    }
    return color;
  }

  /**
   * Get persona status
   * @returns {Object} - Persona status
   */
  getStatus() {
    return {
      name: this.name,
      id: this.id,
      version: this.version,
      description: this.description,
      currentActivity: this.currentActivity,
      currentExpression: this.currentExpression,
      isAutonomous: this.isAutonomous,
      isInitialized: this.isInitialized,
      lastInteraction: this.lastInteraction,
      personality: this.config.personality,
      appearance: this.config.appearance
    };
  }

  /**
   * Export persona configuration
   * @returns {Object} - Complete persona configuration
   */
  exportConfig() {
    return {
      ...this.config,
      metadata: {
        name: this.name,
        id: this.id,
        version: this.version,
        description: this.description,
        created: new Date(),
        type: 'persona-template'
      }
    };
  }

  /**
   * Create a new instance of this persona
   * @param {string} instanceId - Unique instance identifier
   * @param {Object} overrides - Configuration overrides
   * @returns {BasePersona} - New persona instance
   */
  createInstance(instanceId, overrides = {}) {
    const instanceConfig = {
      ...this.config,
      ...overrides,
      instanceId,
      created: new Date()
    };

    const instance = new this.constructor({
      ...this.options,
      instanceId
    });

    instance.config = instanceConfig;
    instance.id = instanceId;

    return instance;
  }

  /**
   * Clean up persona resources
   * @returns {Promise<void>}
   */
  async dispose() {
    this.logger.info(`Disposing persona: ${this.name}`);

    this.renderer = null;
    this.faceGeometry = null;
    this.expressionController = null;
    this.wireframeController = null;
    this.isInitialized = false;

    this.emit('disposed', this);
  }
}

// Export default instance factory
export function createBasePersona(options = {}) {
  return new BasePersona(options);
}

// Export for CommonJS compatibility
export default BasePersona;