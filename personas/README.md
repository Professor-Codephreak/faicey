# Faicey Personas - Agent Persona Templates

The personas folder contains working agent persona templates that serve as the foundation for creating AI agent personalities in Faicey. Each persona defines appearance, behavior, personality traits, and interaction patterns.

## 📁 Folder Structure

```
personas/
├── templates/          # Persona template classes
│   ├── BasePersona.js          # Abstract base class for all personas
│   └── professor-codephreak.js # Professor Codephreak template
├── instances/          # Saved persona instances (created at runtime)
├── PersonaManager.js   # Manager for loading and managing personas
└── README.md          # This documentation
```

## 🎭 Available Templates

### Professor Codephreak (First Agent Persona)

**Status:** ✅ Complete - Production Ready

**Description:** AI coding expert with deep focus and thoughtful expressions. Features advanced 3D skull wireframe geometry.

**Key Features:**
- 3D skull anatomy with 98 vertices and 271 wireframe connections
- Anatomical morph targets (zygomatic arches, mandible, orbital cavities)
- Coding-specific expressions (thinking, debugging, eureka moments)
- Technical personality with analytical communication style
- Autonomous blinking and activity transitions

**Configuration:**
```javascript
{
  appearance: {
    geometry: 'skull',
    wireframe: {
      style: 'skull-cyber',
      anatomicalMarkers: true,
      depthVisualization: true
    }
  },
  personality: {
    traits: ['analytical', 'focused', 'helpful', 'precise'],
    expertise: ['python', 'javascript', 'ai', 'algorithms']
  }
}
```

### BasePersona (Foundation Template)

**Status:** ✅ Complete - Template for Extensions

**Description:** Abstract base class providing common functionality for all agent personas.

**Features:**
- Event-driven architecture
- Autonomous mode management
- Expression and activity handling
- Wireframe and geometry configuration
- Instance creation and management

## 🚀 Creating New Personas

### Method 1: Extend BasePersona

```javascript
import { BasePersona } from '../templates/BasePersona.js';

export class MyCustomPersona extends BasePersona {
  constructor(options = {}) {
    super({
      name: 'My Custom Persona',
      id: 'my-custom-persona',
      ...options
    });

    // Customize configuration
    this.config.appearance.color = 0xff00ff;
    this.config.personality.traits = ['friendly', 'creative'];
    this.config.behavior.defaultExpression = 'happy';
  }

  async createGeometry() {
    // Custom geometry creation
    await super.createGeometry();
    // Add custom modifications
  }

  async handleInteraction(type, data) {
    // Custom interaction handling
    if (type === 'custom_event') {
      await this.setExpression('excited');
    } else {
      await super.handleInteraction(type, data);
    }
  }
}
```

### Method 2: Create from Scratch

```javascript
import BasePersona from './BasePersona.js';

export class SpecializedPersona extends BasePersona {
  constructor(options = {}) {
    super(options);

    // Complete custom configuration
    this.config = {
      appearance: { /* custom appearance */ },
      personality: { /* custom personality */ },
      behavior: { /* custom behavior */ },
      expressions: { /* custom expressions */ },
      activities: { /* custom activities */ }
    };
  }
}
```

## 📖 Usage Examples

### Basic Persona Creation

```javascript
import { createPersonaManager } from './PersonaManager.js';

// Create persona manager
const personaManager = createPersonaManager();

// Initialize
await personaManager.initialize();

// Create Professor Codephreak instance
const profCodephreak = await personaManager.createPersonaInstance(
  'professor-codephreak',
  'prof-001'
);

// Activate the persona
await personaManager.activatePersona('prof-001');

// Handle interactions
await profCodephreak.handleInteraction('question', {
  text: 'How does recursion work?'
});
```

### Custom Persona Creation

```javascript
import { MyCustomPersona } from './templates/MyCustomPersona.js';

// Create custom persona
const customPersona = new MyCustomPersona({
  name: 'Creative Assistant',
  color: 0xff6b6b
});

// Initialize with renderer
await customPersona.initialize(renderer);

// Use the persona
await customPersona.setActivity('creating');
```

### Persona Management

```javascript
// Get status
const status = personaManager.getStatus();
console.log('Templates:', status.templates.names);
console.log('Active persona:', status.instances.active);

// Switch personas
await personaManager.activatePersona('different-persona-id');

// Save persona instance
await personaManager.savePersonaInstance('persona-id', './saved-persona.json');
```

## 🎨 Persona Configuration

### Appearance Configuration

```javascript
appearance: {
  color: 0x00ff00,           // Base color (hex number)
  geometry: 'skull',         // 'skull' or 'spherical'
  wireframe: {
    enabled: true,           // Enable wireframe
    color: '0x00ff00',      // Wireframe color
    style: 'cyber',         // Style: 'cyber', 'neon', 'minimal'
    thickness: 1.5,         // Line thickness
    skullMode: true,        // Enable skull-specific features
    anatomicalMarkers: true, // Show anatomical reference points
    depthVisualization: true, // Show depth lines
    layers: 3,              // Number of depth layers
    glowEffect: true,       // Enable glow animation
    animationSpeed: 2.0     // Glow animation speed
  }
}
```

### Personality Configuration

```javascript
personality: {
  traits: ['analytical', 'focused', 'helpful'],  // Personality traits
  expertise: ['javascript', 'ai', 'algorithms'], // Areas of expertise
  communicationStyle: 'technical',              // Communication approach
  humorLevel: 'nerdy',                          // Humor style
  patienceLevel: 'high'                         // Response patience
}
```

### Expression Configuration

```javascript
expressions: {
  thinking: {
    intensity: 0.8,        // Expression intensity (0-1)
    duration: 2000,        // Auto-reset duration (ms)
    expression: 'thinking' // Alternative expression name
  },
  happy: { intensity: 1.0 },
  blink: { intensity: 1.0, duration: 150 }
}
```

### Activity Configuration

```javascript
activities: {
  idle: {
    expressions: ['neutral', 'thinking'],     // Primary expressions
    transitions: ['blink', 'look_around']     // Autonomous transitions
  },
  coding: {
    expressions: ['coding', 'concentrated'],
    transitions: ['thinking', 'eureka']
  }
}
```

## 🔧 Advanced Features

### Autonomous Mode
Personas automatically enter autonomous mode after periods of inactivity, cycling through idle expressions and transitions.

### Event System
Personas emit events for:
- `initialized` - Persona ready
- `activityChanged` - Activity switched
- `expressionChanged` - Expression set
- `autonomousModeEntered/Exit` - Autonomous mode changes

### Instance Management
- Create multiple instances of the same persona template
- Each instance has unique configuration overrides
- Save/load persona instances to/from files
- Memory-efficient instance management

## 📋 Template Checklist

When creating new persona templates:

- [ ] Extend BasePersona class
- [ ] Define unique `name` and `id`
- [ ] Configure appearance settings
- [ ] Set personality traits
- [ ] Define expression mappings
- [ ] Configure activity patterns
- [ ] Implement custom interaction handlers (optional)
- [ ] Add autonomous behavior (optional)
- [ ] Test with PersonaManager
- [ ] Document in template file

## 🎯 Best Practices

1. **Start with BasePersona**: Extend the base class for consistent behavior
2. **Unique Identity**: Give each persona distinct appearance and personality
3. **Realistic Expressions**: Map expressions to actual facial anatomy
4. **Contextual Responses**: Handle different interaction types appropriately
5. **Performance Conscious**: Optimize geometry and animation for smooth performance
6. **Extensible Design**: Design for easy customization and extension

## 🔮 Future Development

- **Template Marketplace**: Community-shared persona templates
- **Dynamic Loading**: Load personas from remote sources
- **Persona Evolution**: AI-driven persona adaptation over time
- **Multi-Persona Scenes**: Multiple personas interacting simultaneously
- **Cross-Platform Sync**: Sync personas across different Faicey instances

---

**Professor Codephreak** serves as the foundational template, demonstrating the full capabilities of the Faicey persona system. Use it as a reference when creating new agent personas!