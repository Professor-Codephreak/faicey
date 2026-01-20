/**
 * Test script for the Faicey persona system
 */

import { createFaicey } from './core/index.js';

async function testPersonas() {
  console.log('🧪 Testing Faicey Persona System...\n');

  try {
    // Create Faicey instance
    const faicey = createFaicey({
      renderer: 'ascii',
      logging: true
    });

    // Initialize
    console.log('1. Initializing Faicey...');
    await faicey.initialize();
    console.log('✅ Faicey initialized\n');

    // Check persona templates
    console.log('2. Checking available persona templates...');
    const templates = faicey.getPersonaTemplates();
    console.log('Available templates:', templates.map(t => t.name));
    console.log('');

    // Create Professor Codephreak persona
    console.log('3. Creating Professor Codephreak persona instance...');
    const profPersona = await faicey.createPersona('professor-codephreak', 'test-prof');
    console.log('✅ Created persona:', profPersona.name);
    console.log('   Personality traits:', profPersona.config.personality.traits);
    console.log('');

    // Activate persona
    console.log('4. Activating persona...');
    await faicey.activatePersona('test-prof');
    console.log('✅ Persona activated\n');

    // Test expressions
    console.log('5. Testing expressions...');
    await faicey.setExpression('thinking');
    console.log('   Set expression: thinking');

    await new Promise(resolve => setTimeout(resolve, 1000));

    await faicey.setExpression('happy');
    console.log('   Set expression: happy');
    console.log('');

    // Check status
    console.log('6. System status:');
    const status = faicey.getStatus();
    console.log('   Templates:', status.personas.templates.count);
    console.log('   Instances:', status.personas.instances.count);
    console.log('   Active persona:', status.personas.instances.active);
    console.log('');

    // Cleanup
    console.log('7. Cleaning up...');
    await faicey.shutdown();
    console.log('✅ Cleanup complete\n');

    console.log('🎉 Persona system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testPersonas();