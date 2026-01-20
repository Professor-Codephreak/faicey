/**
 * Modular Faicey Demo
 * Demonstrates the new modular Faicey architecture
 * with plugin system, multiple renderers, and persona management
 */

import { createFaicey, createDevelopmentFaicey } from '../core/index.js';

/**
 * Modular Faicey demonstration class
 */
class ModularFaiceyDemo {
  constructor() {
    this.faicey = null;
    this.professorPersona = null;
    this.jaimlaPersona = null;
  }

  /**
   * Initialize the modular Faicey system
   */
  async initialize() {
    console.log('🚀 Initializing Modular Faicey System...\n');

    // Create Faicey instance with development settings
    this.faicey = createDevelopmentFaicey({
      renderer: 'ascii', // Use ASCII renderer for demo
      plugins: ['expression-manager', 'persona-switcher']
    });

    // Listen to Faicey events
    this.setupEventListeners();

    // Initialize Faicey platform
    await this.faicey.initialize();

    console.log('✅ Modular Faicey System Initialized\n');
    console.log('📊 System Status:', this.faicey.getStatus());
    console.log('');
  }

  /**
   * Setup event listeners for Faicey events
   */
  setupEventListeners() {
    this.faicey.on('initialized', () => {
      console.log('🎉 Faicey platform initialized');
    });

    this.faicey.on('personaCreated', (persona) => {
      console.log(`👤 Persona created: ${persona.name}`);
    });

    this.faicey.on('personaActivated', (persona) => {
      console.log(`🎭 Persona activated: ${persona.name}`);
    });

    this.faicey.on('expressionChanged', (data) => {
      console.log(`😊 Expression changed: ${data.expression} (${data.intensity})`);
    });

    this.faicey.on('pluginLoaded', (data) => {
      console.log(`🔌 Plugin loaded: ${data.name}`);
    });
  }

  /**
   * Demonstrate persona creation and management
   */
  async demonstratePersonas() {
    console.log('🎭 Demonstrating Persona Management...\n');

    // Create Professor Codephreak persona
    console.log('1. Creating Professor Codephreak persona...');
    this.professorPersona = await this.faicey.createPersona('professor-codephreak-demo', {
      name: 'Professor Codephreak',
      color: 0x00ff00,
      wireframe: {
        enabled: true,
        color: '0x00ff00',
        style: 'cyber',
        thickness: 1.5
      },
      defaultExpression: 'thinking',
      personality: ['analytical', 'focused', 'helpful']
    });

    // Create Jaimla persona
    console.log('2. Creating Jaimla persona...');
    this.jaimlaPersona = await this.faicey.createPersona('jaimla-demo', {
      name: 'Jaimla',
      color: 0xff0080,
      wireframe: {
        enabled: true,
        color: '0xff0080',
        style: 'neon',
        thickness: 1.2
      },
      defaultExpression: 'happy',
      personality: ['intelligent', 'collaborative', 'adaptive']
    });

    console.log('✅ Personas created successfully\n');

    // Demonstrate persona switching
    console.log('3. Activating Professor Codephreak...');
    await this.faicey.activatePersona('professor-codephreak-demo');

    await this.delay(1000);

    console.log('4. Switching to Jaimla...');
    await this.faicey.activatePersona('jaimla-demo');

    console.log('✅ Persona switching demonstrated\n');
  }

  /**
   * Demonstrate expression system
   */
  async demonstrateExpressions() {
    console.log('😊 Demonstrating Expression System...\n');

    const expressions = [
      { name: 'thinking', duration: 2000 },
      { name: 'happy', duration: 1500 },
      { name: 'coding', duration: 2500 },
      { name: 'confused', duration: 2000 },
      { name: 'eureka', duration: 3000 }
    ];

    for (const expr of expressions) {
      console.log(`Setting expression: ${expr.name}`);
      await this.faicey.setExpression(expr.name, 1.0);
      await this.delay(expr.duration);
    }

    // Demonstrate intensity variations
    console.log('6. Demonstrating expression intensity...');
    for (let intensity = 0.1; intensity <= 1.0; intensity += 0.2) {
      await this.faicey.setExpression('smile', intensity);
      console.log(`   Smile intensity: ${(intensity * 100).toFixed(0)}%`);
      await this.delay(500);
    }

    console.log('✅ Expression system demonstrated\n');
  }

  /**
   * Demonstrate renderer management
   */
  async demonstrateRenderers() {
    console.log('🎨 Demonstrating Renderer Management...\n');

    // Create additional renderer
    console.log('1. Creating additional renderer...');
    const renderer2 = await this.faicey.createRenderer('secondary', 'ascii', {
      width: 400,
      height: 300
    });

    console.log('2. Available renderers:', Array.from(this.faicey.renderers.keys()));

    // Switch active renderer
    console.log('3. Switching to secondary renderer...');
    this.faicey.setActiveRenderer('secondary');

    console.log('✅ Renderer management demonstrated\n');
  }

  /**
   * Demonstrate plugin system
   */
  async demonstratePlugins() {
    console.log('🔌 Demonstrating Plugin System...\n');

    console.log('Loaded plugins:', this.faicey.pluginManager.getLoadedPlugins());

    // Demonstrate plugin method calls
    console.log('2. Calling plugin methods...');
    const results = await this.faicey.pluginManager.callPluginMethod('getStatus');
    console.log('Plugin statuses:', results);

    console.log('✅ Plugin system demonstrated\n');
  }

  /**
   * Run the complete demonstration
   */
  async run() {
    try {
      await this.initialize();
      await this.demonstratePersonas();
      await this.demonstrateExpressions();
      await this.demonstrateRenderers();
      await this.demonstratePlugins();

      console.log('🎊 Modular Faicey Demo Complete!');
      console.log('Final system status:', this.faicey.getStatus());

      // Cleanup
      await this.faicey.shutdown();

    } catch (error) {
      console.error('❌ Demo failed:', error);
      process.exit(1);
    }
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║              Modular Faicey Demonstration                   ║');
  console.log('║     Definitive Agent Persona & Face Cloning Software       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const demo = new ModularFaiceyDemo();
  demo.run().catch(console.error);
}