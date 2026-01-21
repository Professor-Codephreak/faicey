/**
 * @module utils/VersionManager
 * VersionManager - Handles versioning and forward compatibility for dNFT personas
 * Ensures personas can evolve and maintain compatibility across versions
 */

import semver from 'semver';

export default class VersionManager {
  constructor(options = {}) {
    this.currentVersion = options.version || '1.0.0';
    this.compatibilityMatrix = options.compatibilityMatrix || this.getDefaultCompatibilityMatrix();
    this.migrationScripts = new Map();
  }

  /**
   * Default compatibility matrix for persona versions
   */
  getDefaultCompatibilityMatrix() {
    return {
      '1.0.0': {
        compatible_versions: ['1.0.0', '1.1.0'],
        breaking_changes: [],
        new_features: ['basic_dynamic_traits', 'nft_metadata'],
        deprecated_features: []
      },
      '1.1.0': {
        compatible_versions: ['1.0.0', '1.1.0', '1.2.0'],
        breaking_changes: [],
        new_features: ['advanced_animations', 'interaction_tracking'],
        deprecated_features: []
      },
      '1.2.0': {
        compatible_versions: ['1.1.0', '1.2.0', '2.0.0'],
        breaking_changes: [],
        new_features: ['quantum_integration', 'real_time_collaboration'],
        deprecated_features: ['legacy_morph_targets']
      },
      '2.0.0': {
        compatible_versions: ['2.0.0'],
        breaking_changes: ['expression_system_rewrite'],
        new_features: ['unified_intelligence', 'cross_persona_collaboration'],
        deprecated_features: ['old_animation_system']
      }
    };
  }

  /**
   * Check if two versions are compatible
   * @param {string} version1 - First version
   * @param {string} version2 - Second version
   * @returns {boolean} - Whether versions are compatible
   */
  areVersionsCompatible(version1, version2) {
    const matrix = this.compatibilityMatrix;

    if (!matrix[version1] || !matrix[version2]) {
      return false;
    }

    return matrix[version1].compatible_versions.includes(version2) ||
           matrix[version2].compatible_versions.includes(version1);
  }

  /**
   * Migrate persona data from one version to another
   * @param {Object} personaData - Persona data to migrate
   * @param {string} targetVersion - Target version
   * @returns {Object} - Migrated persona data
   */
  migratePersona(personaData, targetVersion) {
    const currentVersion = personaData.core?.version || personaData.version || '1.0.0';
    const migrationPath = this.calculateMigrationPath(currentVersion, targetVersion);

    if (!migrationPath.length) {
      return personaData; // Already at target version
    }

    let migratedData = { ...personaData };

    for (const step of migrationPath) {
      const migrationScript = this.migrationScripts.get(step);
      if (migrationScript) {
        migratedData = migrationScript(migratedData);
        console.log(`✅ Applied migration: ${step}`);
      } else {
        console.warn(`⚠️ No migration script found for: ${step}`);
      }
    }

    // Update version
    if (migratedData.core) {
      migratedData.core.version = targetVersion;
    }
    migratedData.version = targetVersion;
    migratedData.last_migrated = new Date().toISOString();

    return migratedData;
  }

  /**
   * Calculate migration path between versions
   * @param {string} fromVersion - Starting version
   * @param {string} toVersion - Target version
   * @returns {Array<string>} - Array of migration steps
   */
  calculateMigrationPath(fromVersion, toVersion) {
    if (semver.eq(fromVersion, toVersion)) {
      return [];
    }

    // For now, return a simple path - in production this would be more sophisticated
    const steps = [];
    const fromMajor = semver.major(fromVersion);
    const toMajor = semver.major(toVersion);

    if (fromMajor !== toMajor) {
      steps.push(`major_${fromMajor}_to_${toMajor}`);
    }

    const fromMinor = semver.minor(fromVersion);
    const toMinor = semver.minor(toVersion);

    if (fromMinor !== toMinor) {
      steps.push(`minor_${fromMinor}_to_${toMinor}`);
    }

    return steps;
  }

  /**
   * Register a migration script
   * @param {string} migrationId - Unique migration identifier
   * @param {Function} script - Migration function
   */
  registerMigration(migrationId, script) {
    this.migrationScripts.set(migrationId, script);
  }

  /**
   * Validate persona data against version requirements
   * @param {Object} personaData - Persona data to validate
   * @returns {Object} - Validation result
   */
  validatePersonaVersion(personaData) {
    const version = personaData.core?.version || personaData.version;
    const matrix = this.compatibilityMatrix[version];

    if (!matrix) {
      return {
        valid: false,
        errors: [`Unknown version: ${version}`],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    // Check required sections based on version
    const requiredSections = this.getRequiredSections(version);
    const missingSections = requiredSections.filter(section => !personaData[section]);

    if (missingSections.length > 0) {
      errors.push(`Missing required sections for v${version}: ${missingSections.join(', ')}`);
    }

    // Check deprecated features
    if (matrix.deprecated_features.length > 0) {
      warnings.push(`Version ${version} has deprecated features: ${matrix.deprecated_features.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      version_info: matrix
    };
  }

  /**
   * Get required sections for a specific version
   * @param {string} version - Version string
   * @returns {Array<string>} - Required sections
   */
  getRequiredSections(version) {
    const baseSections = ['core', 'appearance'];

    if (semver.gte(version, '1.0.0')) {
      baseSections.push('nft');
    }

    if (semver.gte(version, '1.1.0')) {
      baseSections.push('dynamic');
    }

    if (semver.gte(version, '2.0.0')) {
      baseSections.push('quantum');
    }

    return baseSections;
  }

  /**
   * Create a new version with enhanced features
   * @param {Object} personaData - Base persona data
   * @param {string} newVersion - New version string
   * @param {Object} enhancements - New features to add
   * @returns {Object} - Enhanced persona data
   */
  createVersion(personaData, newVersion, enhancements = {}) {
    const newPersonaData = { ...personaData };

    // Update version
    if (newPersonaData.core) {
      newPersonaData.core.version = newVersion;
    }
    newPersonaData.version = newVersion;

    // Add enhancements
    Object.assign(newPersonaData, enhancements);

    // Add version metadata
    newPersonaData.version_history = newPersonaData.version_history || [];
    newPersonaData.version_history.push({
      version: newVersion,
      created: new Date().toISOString(),
      changes: Object.keys(enhancements)
    });

    return newPersonaData;
  }

  /**
   * Get version compatibility report
   * @param {string} version - Version to check
   * @returns {Object} - Compatibility report
   */
  getCompatibilityReport(version) {
    const matrix = this.compatibilityMatrix[version];

    if (!matrix) {
      return {
        compatible: false,
        reason: 'Version not found in compatibility matrix'
      };
    }

    return {
      compatible: true,
      version,
      compatible_versions: matrix.compatible_versions,
      breaking_changes: matrix.breaking_changes,
      new_features: matrix.new_features,
      deprecated_features: matrix.deprecated_features,
      recommended_upgrade: this.getRecommendedUpgrade(version)
    };
  }

  /**
   * Get recommended upgrade path
   * @param {string} currentVersion - Current version
   * @returns {string|null} - Recommended version or null
   */
  getRecommendedUpgrade(currentVersion) {
    const versions = Object.keys(this.compatibilityMatrix).sort(semver.rcompare);
    const currentIndex = versions.indexOf(currentVersion);

    if (currentIndex > 0) {
      return versions[0]; // Latest version
    }

    return null; // Already latest
  }

  /**
   * Create a persona fork for custom evolution
   * @param {Object} personaData - Original persona data
   * @param {Object} customizations - Custom modifications
   * @returns {Object} - Forked persona data
   */
  createPersonaFork(personaData, customizations = {}) {
    const forkedData = { ...personaData };

    // Generate unique ID for fork
    const forkId = `${personaData.core.id}_fork_${Date.now()}`;
    forkedData.core.id = forkId;
    forkedData.core.forked_from = personaData.core.id;
    forkedData.core.fork_date = new Date().toISOString();

    // Apply customizations
    Object.assign(forkedData, customizations);

    // Update NFT metadata
    if (forkedData.nft) {
      forkedData.nft.name = `${forkedData.nft.name} (Fork)`;
      forkedData.nft.description += `\n\nForked from ${personaData.nft.name}`;
    }

    return forkedData;
  }
}

// Default migration scripts
const migrationScripts = new Map();

// Migration: Add dynamic traits to 1.0.0 personas
migrationScripts.set('dynamic_traits_1.0_to_1.1', (personaData) => {
  if (!personaData.dynamic) {
    personaData.dynamic = {
      traits: {},
      animations: {},
      interactions: {}
    };
  }

  // Add basic dynamic traits if missing
  if (!personaData.dynamic.traits.intelligence) {
    personaData.dynamic.traits.intelligence = {
      current: 80,
      min: 60,
      max: 100,
      growth_rate: 0.1,
      decay_rate: -0.05,
      triggers: ['successful_interaction']
    };
  }

  return personaData;
});

// Migration: Major rewrite for 2.0.0
migrationScripts.set('major_1_to_2', (personaData) => {
  // Remove deprecated morph target system
  if (personaData.appearance?.expressions) {
    Object.keys(personaData.appearance.expressions).forEach(exprName => {
      const expr = personaData.appearance.expressions[exprName];
      if (expr.morph_targets) {
        delete expr.morph_targets;
        expr.visual_only = true;
      }
    });
  }

  // Add quantum integration placeholder
  personaData.quantum = {
    enabled: false,
    capabilities: [],
    integration_points: []
  };

  return personaData;
});

// Register default migrations
export function setupDefaultMigrations(versionManager) {
  migrationScripts.forEach((script, id) => {
    versionManager.registerMigration(id, script);
  });
}

export function createVersionManager(options = {}) {
  const manager = new VersionManager(options);
  setupDefaultMigrations(manager);
  return manager;
}