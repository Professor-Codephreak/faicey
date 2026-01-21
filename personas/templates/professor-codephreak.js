/**
 * @module personas/templates/professor-codephreak
 * Professor Codephreak Persona Template
 *
 * Complete agent persona for Professor Codephreak - AI coding expert
 * This serves as the foundational template for creating other agent personas
 */

import FaceGeometry from '../../core/geometry/FaceGeometry.js';
import ExpressionController from '../../core/controllers/ExpressionController.js';
import WireframeController from '../../core/controllers/WireframeController.js';
import { Logger } from '../../core/utils/Logger.js';

/**
 * Professor Codephreak Persona Template
 * Defines the complete configuration, behavior, and capabilities
 * of the Professor Codephreak agent persona
 */
export class ProfessorCodephreakPersona {
  constructor(options = {}) {
    this.name = 'Professor Codephreak';
    this.id = 'professor-codephreak';
    this.version = '1.0.0';

    // Initialize logger
    this.logger = options.logger || new Logger({
      prefix: `Persona:${this.name}`,
      enabled: options.logging !== false
    });

    // Core persona configuration
    this.config = {
      // Visual appearance
      appearance: {
        color: 0x00ff00,
        wireframe: {
          enabled: true,
          color: '0x00ff00',
          style: 'skull-cyber',
          thickness: 1.5,
          skullMode: true,
          anatomicalMarkers: true,
          depthVisualization: true,
          layers: 3,
          glowEffect: true,
          animationSpeed: 2.0
        },
        geometry: 'skull' // 'skull' or 'spherical'
      },

      // Personality traits
      personality: {
        traits: ['analytical', 'focused', 'helpful', 'precise', 'teaching'],
        expertise: ['python', 'javascript', 'ai', 'algorithms', 'debugging'],
        communicationStyle: 'technical',
        humorLevel: 'nerdy',
        patienceLevel: 'high'
      },

      // Behavioral patterns
      behavior: {
        defaultExpression: 'coding',
        idleExpressions: ['thinking', 'concentrated'],
        blinkFrequency: 0.15, // blinks per second
        autonomousActions: true,
        interactionTimeout: 5000 // ms before going autonomous
      },

      // Expression mappings
      expressions: {
        // Core expressions
        neutral: { intensity: 0.5 },
        thinking: { intensity: 0.8, duration: 2000 },
        coding: { intensity: 0.7, duration: 3000 },
        happy: { intensity: 1.0, duration: 1500 },
        confused: { intensity: 0.7, duration: 2000 },
        eureka: { intensity: 1.0, duration: 2500 },
        speaking: { intensity: 0.8, phonemeSync: true },
        blink: { intensity: 1.0, duration: 150 },
        wink: { intensity: 1.0, duration: 200 },

        // Specialized expressions
        debugging: { intensity: 0.6, expression: 'concentrated' },
        explaining: { intensity: 0.9, expression: 'speaking' },
        success: { intensity: 1.0, expression: 'eureka' },
        error: { intensity: 0.8, expression: 'confused' },
        processing: { intensity: 0.7, expression: 'thinking' }
      },

      // Activity mappings (what triggers expressions)
      activities: {
        idle: {
          expressions: ['neutral', 'thinking'],
          transitions: ['blink', 'look_around']
        },
        coding: {
          expressions: ['coding', 'concentrated'],
          transitions: ['thinking', 'eureka', 'blink']
        },
        thinking: {
          expressions: ['thinking', 'eyebrows_furrowed'],
          transitions: ['concentrated', 'eureka']
        },
        teaching: {
          expressions: ['speaking', 'happy'],
          transitions: ['smile', 'blink']
        },
        debugging: {
          expressions: ['concentrated', 'confused'],
          transitions: ['thinking', 'eureka', 'error']
        }
      },

      // Voice and speech characteristics
      voice: {
        pitch: 'medium',
        speed: 'moderate',
        accent: 'technical',
        fillers: ['hmm', 'let me think', 'interesting'],
        emphasis: ['algorithms', 'logic', 'optimization']
      },

      // Interaction patterns
      interactions: {
        greeting: {
          expression: 'happy',
          text: 'Hello! I\'m Professor Codephreak. How can I help you with your code today?'
        },
        thinking: {
          expression: 'thinking',
          text: 'Let me analyze this...'
        },
        success: {
          expression: 'eureka',
          text: 'Perfect! That\'s the solution.'
        },
        confusion: {
          expression: 'confused',
          text: 'Hmm, this is interesting. Let me think about this differently.'
        },
        teaching: {
          expression: 'speaking',
          text: 'Let me explain this step by step...'
        }
      },

      // Animation timings
      timings: {
        expressionTransition: 300, // ms
        blinkDuration: 150, // ms
        autonomousActionInterval: [8000, 12000], // min/max ms
        phonemeSyncDelay: 50 // ms
      }
    };

    // Runtime state
    this.currentActivity = 'idle';
    this.currentExpression = this.config.behavior.defaultExpression;
    this.lastInteraction = Date.now();
    this.isAutonomous = false;

    // Component references
    this.faceGeometry = null;
    this.expressionController = null;
    this.wireframeController = null;
    this.renderer = null;

    this.logger.info(`Professor Codephreak persona template initialized v${this.version}`);
  }

  /**
   * Initialize the persona with renderer components
   * @param {FaceRenderer} renderer - The face renderer instance
   * @returns {Promise<void>}
   */
  async initialize(renderer) {
    try {
      this.renderer = renderer;
      this.logger.info('Initializing Professor Codephreak persona...');

      // Initialize controllers
      await this.initializeControllers();

      // Set initial state
      await this.setActivity('idle');
      await this.setExpression(this.config.behavior.defaultExpression);

      this.logger.info('Professor Codephreak persona initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize Professor Codephreak persona:', error);
      throw error;
    }
  }


  /**
   * Initialize expression and wireframe controllers
   * @returns {Promise<void>}
   */
  async initializeControllers() {
    // Initialize wireframe controller first
    this.wireframeController = new WireframeController(this.renderer.face, {
      thickness: this.config.appearance.wireframe.thickness,
      logger: this.logger
    });

    // Initialize expression controller with wireframe controller for visual effects
    this.expressionController = new ExpressionController(this.renderer.face, {
      wireframeController: this.wireframeController,
      baseColor: this.config.appearance.color,
      logger: this.logger
    });

    // Apply wireframe settings
    if (this.config.appearance.wireframe.enabled) {
      this.wireframeController.createSkullWireframe();
      this.wireframeController.setSkullStyle(this.config.appearance.wireframe.style);

      if (this.config.appearance.wireframe.glowEffect) {
        this.wireframeController.animateGlow(
          this.config.appearance.color,
          this.config.appearance.wireframe.glowColor || 0x00ff88,
          this.config.appearance.wireframe.animationSpeed
        );
      }
    }

    this.logger.debug('Initialized controllers for Professor Codephreak');
  }

  /**
   * Set the current activity and update expression accordingly
   * @param {string} activity - Activity name
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  async setActivity(activity, options = {}) {
    try {
      this.currentActivity = activity;
      const activityConfig = this.config.activities[activity];

      if (!activityConfig) {
        this.logger.warn(`Unknown activity: ${activity}`);
        return;
      }

      // Set primary expression for activity
      const primaryExpression = activityConfig.expressions[0] || activityConfig.expressions;
      await this.setExpression(primaryExpression, { activity });

      // Schedule activity transitions
      if (activityConfig.transitions && options.autonomous !== false) {
        this.scheduleActivityTransitions(activityConfig.transitions);
      }

      this.logger.debug(`Set activity to: ${activity}`);

    } catch (error) {
      this.logger.error(`Failed to set activity ${activity}:`, error);
      throw error;
    }
  }

  /**
   * Set facial expression
   * @param {string} expression - Expression name
   * @param {Object} options - Expression options
   * @returns {Promise<void>}
   */
  async setExpression(expression, options = {}) {
    try {
      const expressionConfig = this.config.expressions[expression];

      if (!expressionConfig) {
        this.logger.warn(`Unknown expression: ${expression}`);
        return;
      }

      // Handle expression aliases
      const actualExpression = expressionConfig.expression || expression;
      const intensity = options.intensity || expressionConfig.intensity || 1.0;

      // Set expression on controller
      if (this.expressionController) {
        await this.expressionController.setExpression(actualExpression, intensity);
      }

      this.currentExpression = actualExpression;
      this.lastInteraction = Date.now();

      // Handle expression duration
      if (expressionConfig.duration && options.autoReset !== false) {
        setTimeout(() => {
          if (this.currentExpression === actualExpression) {
            this.resetToDefaultExpression();
          }
        }, expressionConfig.duration);
      }

      this.logger.debug(`Set expression: ${actualExpression} (${intensity})`);

    } catch (error) {
      this.logger.error(`Failed to set expression ${expression}:`, error);
      throw error;
    }
  }

  /**
   * Handle user interaction
   * @param {string} type - Interaction type
   * @param {Object} data - Interaction data
   * @returns {Promise<void>}
   */
  async handleInteraction(type, data = {}) {
    try {
      this.lastInteraction = Date.now();
      this.isAutonomous = false;

      switch (type) {
        case 'message':
          await this.handleMessage(data);
          break;

        case 'question':
          await this.setActivity('thinking');
          break;

        case 'success':
          await this.setExpression('eureka');
          break;

        case 'error':
          await this.setExpression('confused');
          break;

        case 'teaching':
          await this.setActivity('teaching');
          break;

        case 'coding':
          await this.setActivity('coding');
          break;

        default:
          await this.setExpression('neutral');
      }

      this.logger.debug(`Handled interaction: ${type}`);

    } catch (error) {
      this.logger.error(`Failed to handle interaction ${type}:`, error);
      throw error;
    }
  }

  /**
   * Handle incoming messages
   * @param {Object} messageData - Message data
   * @returns {Promise<void>}
   */
  async handleMessage(messageData) {
    const { text, sentiment } = messageData;

    // Analyze message content and set appropriate expression
    if (text.includes('?') || text.toLowerCase().includes('how') || text.toLowerCase().includes('why')) {
      await this.setActivity('thinking');
    } else if (sentiment === 'positive' || text.toLowerCase().includes('thank')) {
      await this.setExpression('happy');
    } else if (sentiment === 'negative' || text.includes('error') || text.includes('bug')) {
      await this.setActivity('debugging');
    } else {
      await this.setExpression('speaking');
    }
  }

  /**
   * Schedule activity transitions for autonomous behavior
   * @param {Array<string>} transitions - Transition expressions
   * @returns {void}
   */
  scheduleActivityTransitions(transitions) {
    if (!transitions || transitions.length === 0) return;

    const [minInterval, maxInterval] = this.config.timings.autonomousActionInterval;
    const interval = minInterval + Math.random() * (maxInterval - minInterval);

    setTimeout(async () => {
      if (this.isAutonomous && transitions.length > 0) {
        const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];
        await this.setExpression(randomTransition);
        this.scheduleActivityTransitions(transitions);
      }
    }, interval);
  }

  /**
   * Enter autonomous mode
   * @returns {Promise<void>}
   */
  async enterAutonomousMode() {
    this.isAutonomous = true;
    this.logger.debug('Entered autonomous mode');

    // Start autonomous activity cycle
    const idleTransitions = this.config.activities.idle.transitions || ['blink'];
    this.scheduleActivityTransitions(idleTransitions);
  }

  /**
   * Exit autonomous mode
   * @returns {Promise<void>}
   */
  async exitAutonomousMode() {
    this.isAutonomous = false;
    this.logger.debug('Exited autonomous mode');

    // Reset to default expression
    await this.resetToDefaultExpression();
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

    // Handle blinking
    if (this.expressionController) {
      this.expressionController.update();
    }
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
      currentActivity: this.currentActivity,
      currentExpression: this.currentExpression,
      isAutonomous: this.isAutonomous,
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
        created: new Date(),
        type: 'persona-template'
      }
    };
  }

  /**
   * Create a new instance of this persona
   * @param {string} instanceId - Unique instance identifier
   * @param {Object} overrides - Configuration overrides
   * @returns {ProfessorCodephreakPersona} - New persona instance
   */
  createInstance(instanceId, overrides = {}) {
    const instanceConfig = {
      ...this.config,
      ...overrides,
      instanceId,
      created: new Date()
    };

    const instance = new ProfessorCodephreakPersona({
      logger: this.logger,
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
    this.logger.info('Disposing Professor Codephreak persona');

    if (this.expressionController) {
      this.expressionController.stopAllEffects();
    }

    if (this.wireframeController) {
      this.wireframeController.dispose();
    }

    this.renderer = null;
    this.faceGeometry = null;
    this.expressionController = null;
    this.wireframeController = null;
  }
}

// Export default instance factory
export function createProfessorCodephreakPersona(options = {}) {
  return new ProfessorCodephreakPersona(options);
}

// Export for CommonJS compatibility
export default ProfessorCodephreakPersona;