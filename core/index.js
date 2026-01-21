/**
 * @module Faicey
 * Main entry point for the Faicey platform
 *
 * Exports all core modules and provides factory functions
 * for creating Faicey instances and components.
 */

// Main Faicey class
export { default as Faicey, createFaicey } from './Faicey.js';

// Renderers
export { FaceRenderer } from './renderers/FaceRenderer.js';

// Geometry
export { default as FaceGeometry } from './geometry/FaceGeometry.js';

// Controllers
export { default as ExpressionController } from './controllers/ExpressionController.js';
export { default as WireframeController } from './controllers/WireframeController.js';

// Configuration
export { ConfigurationManager } from './config/ConfigurationManager.js';

// Plugins
export { PluginManager } from './plugins/PluginManager.js';

// Personas
export { PersonaManager } from '../personas/PersonaManager.js';
export { BasePersona } from '../personas/templates/BasePersona.js';
export { ProfessorCodephreakPersona } from '../personas/templates/professor-codephreak.js';

// Utilities
export { Logger } from './utils/Logger.js';
export { EventEmitter } from './utils/EventEmitter.js';
export { MorphTarget } from './utils/MorphTargets.js';
export { default as NFTExporter, createNFTExporter, validatePersonaForNFT } from './utils/NFTExporter.js';
export { default as VersionManager, createVersionManager } from './utils/VersionManager.js';

// Version information
export const VERSION = '0.1.0-modular';
export const NAME = 'Faicey - Definitive Agent Persona & Face Cloning Software';

// Factory functions for common use cases
export function createBasicFaicey(options = {}) {
  return createFaicey({
    renderer: 'webgl',
    mode: 'browser',
    logging: false,
    personas: ['professor-codephreak'],
    ...options
  });
}

export function createDevelopmentFaicey(options = {}) {
  return createFaicey({
    renderer: 'webgl',
    mode: 'browser',
    logging: true,
    debug: true,
    personas: ['professor-codephreak'],
    ...options
  });
}

export function createNodeFaicey(options = {}) {
  return createFaicey({
    renderer: 'ascii',
    mode: 'node',
    logging: true,
    personas: ['professor-codephreak'],
    ...options
  });
}

// Plugin system exports
export const Plugins = {
  // Plugin types will be added here as they are created
};

// Default configurations
export const DEFAULT_CONFIG = {
  renderer: {
    width: 800,
    height: 600,
    backgroundColor: 0x000000,
    wireframe: true,
    expressions: true
  },
  personas: {
    'professor-codephreak': {
      name: 'Professor Codephreak',
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
        glowEffect: true
      },
      defaultExpression: 'coding'
    },
    'mindx-base': {
      name: 'mindX Base',
      color: 0x00aaff,
      wireframe: {
        enabled: true,
        color: '0x00aaff',
        style: 'neon',
        thickness: 1.0
      },
      defaultExpression: 'neutral'
    }
  }
};

// Note: Individual exports are preferred for tree-shaking
// Default export provided for compatibility
export default {
  VERSION,
  NAME,
  DEFAULT_CONFIG
};