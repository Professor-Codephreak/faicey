/**
 * @module controllers/WireframeController
 * WireframeController - Manages wireframe rendering styles and effects
 * Provides advanced wireframe customization for faces
 */

import * as THREE from 'three';

export default class WireframeController {
  constructor(faceMesh, thickness = 1) {
    this.faceMesh = faceMesh;
    this.thickness = thickness;
    this.originalMaterial = faceMesh.material;
    this.wireframeLines = null;
  }

  /**
   * Enable basic wireframe mode
   */
  enableBasicWireframe() {
    if (this.faceMesh.material) {
      this.faceMesh.material.wireframe = true;
    }
  }

  /**
   * Disable wireframe mode
   */
  disableWireframe() {
    if (this.faceMesh.material) {
      this.faceMesh.material.wireframe = false;
    }
  }

  /**
   * Create enhanced wireframe with custom line thickness
   * Uses LineSegments for more control
   */
  createEnhancedWireframe() {
    const geometry = this.faceMesh.geometry;
    const wireframeGeometry = new THREE.WireframeGeometry(geometry);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: this.faceMesh.material.color,
      linewidth: this.thickness,
    });

    this.wireframeLines = new THREE.LineSegments(wireframeGeometry, lineMaterial);

    // Copy position and rotation from face mesh
    this.wireframeLines.position.copy(this.faceMesh.position);
    this.wireframeLines.rotation.copy(this.faceMesh.rotation);

    return this.wireframeLines;
  }

  /**
   * Update wireframe color
   * @param {number} color - Hex color value
   */
  setColor(color) {
    if (this.faceMesh.material) {
      this.faceMesh.material.color.setHex(color);
    }
    if (this.wireframeLines) {
      this.wireframeLines.material.color.setHex(color);
    }
    // Update all wireframe layers
    if (this.wireframeLayers) {
      this.wireframeLayers.forEach(layer => {
        layer.material.color.setHex(color);
      });
    }
  }

  /**
   * Set wireframe opacity
   * @param {number} opacity - Opacity value (0-1)
   */
  setOpacity(opacity) {
    if (this.faceMesh.material) {
      this.faceMesh.material.opacity = opacity;
      this.faceMesh.material.transparent = opacity < 1.0;
    }
    if (this.wireframeLines) {
      this.wireframeLines.material.opacity = opacity;
      this.wireframeLines.material.transparent = opacity < 1.0;
    }
    // Update all wireframe layers
    if (this.wireframeLayers) {
      this.wireframeLayers.forEach((layer, index) => {
        const layerOpacity = opacity * (1 - index * 0.2); // Decreasing opacity for depth layers
        layer.material.opacity = layerOpacity;
        layer.material.transparent = layerOpacity < 1.0;
      });
    }
  }

  /**
   * Animate wireframe color with glow effect
   * @param {number} baseColor - Base color
   * @param {number} glowColor - Glow color
   * @param {number} frequency - Pulse frequency
   */
  animateGlow(baseColor, glowColor, frequency = 1.0) {
    const baseRGB = new THREE.Color(baseColor);
    const glowRGB = new THREE.Color(glowColor);

    const animate = () => {
      const time = Date.now() / 1000;
      const pulse = (Math.sin(time * frequency * Math.PI * 2) + 1) / 2;

      const currentColor = new THREE.Color();
      currentColor.r = baseRGB.r + (glowRGB.r - baseRGB.r) * pulse;
      currentColor.g = baseRGB.g + (glowRGB.g - baseRGB.g) * pulse;
      currentColor.b = baseRGB.b + (glowRGB.b - baseRGB.b) * pulse;

      this.setColor(currentColor.getHex());
    };

    setInterval(animate, 16); // ~60fps
  }

  /**
   * Create scanline effect (retro style)
   */
  createScanlineEffect() {
    // This would add horizontal scanlines to the wireframe
    // Implementation would depend on shader materials
    console.log('Scanline effect would require custom shaders');
  }

  /**
   * Apply matrix/cyber aesthetic
   */
  applyCyberStyle() {
    this.setColor(0x00ff00); // Matrix green
    this.animateGlow(0x00ff00, 0x00ff88, 2.0);
  }

  /**
   * Apply neon style
   */
  applyNeonStyle(color = 0xff00ff) {
    this.setColor(color);
    this.animateGlow(color, 0xffffff, 1.5);
  }

  /**
   * Create 3D skull wireframe with anatomical overlay
   * Creates static wireframe unaffected by morph targets
   */
  createSkullWireframe() {
    // Create wireframe from base geometry without morph target deformation
    const baseGeometry = this.createStaticBaseGeometry();
    const wireframeGeometry = new THREE.WireframeGeometry(baseGeometry);

    // Create multiple wireframe layers for 3D effect
    this.createWireframeLayers(wireframeGeometry);

    // Add anatomical labels and depth indicators
    this.addAnatomicalOverlays();

    return this.wireframeLines;
  }

  /**
   * Create static base geometry for wireframe (unaffected by morph targets)
   */
  createStaticBaseGeometry() {
    // Clone the geometry to avoid affecting the original
    const staticGeometry = this.faceMesh.geometry.clone();

    // Reset all morph target influences to create static base
    if (staticGeometry.morphAttributes && staticGeometry.morphAttributes.position) {
      // Create base geometry by applying zero morph influences
      const basePositions = staticGeometry.attributes.position.array.slice();

      // Reset morph influences
      staticGeometry.morphTargetInfluences = new Array(staticGeometry.morphAttributes.position.length).fill(0);

      // Apply the base positions (no morph deformation)
      staticGeometry.attributes.position.array.set(basePositions);
      staticGeometry.attributes.position.needsUpdate = true;
    }

    return staticGeometry;
  }

  /**
   * Create multiple wireframe layers for 3D depth
   */
  createWireframeLayers(wireframeGeometry) {
    const layers = [
      { color: 0x00ff00, opacity: 1.0, scale: 1.0 },     // Main layer
      { color: 0x00aa00, opacity: 0.6, scale: 1.02 },    // Depth layer 1
      { color: 0x005500, opacity: 0.3, scale: 1.04 },    // Depth layer 2
    ];

    this.wireframeLayers = [];

    layers.forEach((layer, index) => {
      const lineMaterial = new THREE.LineBasicMaterial({
        color: layer.color,
        transparent: layer.opacity < 1.0,
        opacity: layer.opacity,
        linewidth: this.thickness * (1 - index * 0.2),
      });

      const wireframeLines = new THREE.LineSegments(wireframeGeometry, lineMaterial);

      // Scale for depth effect
      wireframeLines.scale.setScalar(layer.scale);

      // Copy position and rotation from face mesh
      wireframeLines.position.copy(this.faceMesh.position);
      wireframeLines.rotation.copy(this.faceMesh.rotation);

      this.wireframeLayers.push(wireframeLines);

      // Add to scene if face mesh has a parent
      if (this.faceMesh.parent) {
        this.faceMesh.parent.add(wireframeLines);
      }
    });

    this.wireframeLines = this.wireframeLayers[0]; // Main layer
  }

  /**
   * Add anatomical overlays and depth indicators
   */
  addAnatomicalOverlays() {
    // Create anatomical markers
    this.createAnatomicalMarkers();

    // Add depth visualization
    this.createDepthVisualization();

    // Add wireframe animation
    this.createWireframeAnimation();
  }

  /**
   * Create anatomical markers for skull features
   */
  createAnatomicalMarkers() {
    const markers = [
      { name: 'Cranium', position: [0, 1.0, -0.1], color: 0x00ff00 },
      { name: 'Mandible', position: [0, -0.7, 0.1], color: 0xffaa00 },
      { name: 'Orbits', position: [-0.5, 0.5, 0.1], color: 0x00aaff },
      { name: 'Nasal', position: [0, 0.2, 0.3], color: 0xff00ff },
    ];

    this.anatomicalMarkers = [];

    markers.forEach(marker => {
      const geometry = new THREE.SphereGeometry(0.02, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: marker.color,
        transparent: true,
        opacity: 0.8
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(...marker.position);

      this.anatomicalMarkers.push(sphere);

      if (this.faceMesh.parent) {
        this.faceMesh.parent.add(sphere);
      }
    });
  }

  /**
   * Create depth visualization lines
   */
  createDepthVisualization() {
    const depthLines = [];

    // Create lines showing depth from front to back
    const depthPoints = [
      // Front to back connections
      [[-0.5, 0.5, 0.2], [-0.5, 0.5, 0.0]], // Left orbit
      [[0.5, 0.5, 0.2], [0.5, 0.5, 0.0]],   // Right orbit
      [[0, 0.2, 0.4], [0, 0.2, 0.0]],        // Nasal
      [[0, -0.4, 0.2], [0, -0.4, 0.0]],      // Mouth
    ];

    depthPoints.forEach(([start, end]) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...start),
        new THREE.Vector3(...end)
      ]);

      const material = new THREE.LineBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.4,
        linewidth: 1
      });

      const line = new THREE.Line(geometry, material);
      depthLines.push(line);

      if (this.faceMesh.parent) {
        this.faceMesh.parent.add(line);
      }
    });

    this.depthLines = depthLines;
  }

  /**
   * Create wireframe animation for dynamic effect
   */
  createWireframeAnimation() {
    this.wireframeAnimation = {
      phase: 0,
      speed: 0.02,
      animate: () => {
        this.phase += this.wireframeAnimation.speed;

        // Animate wireframe layers
        if (this.wireframeLayers) {
          this.wireframeLayers.forEach((layer, index) => {
            const offset = index * 0.5;
            const opacity = 0.3 + 0.7 * Math.sin(this.phase + offset);
            layer.material.opacity = opacity;
          });
        }

        // Animate anatomical markers
        if (this.anatomicalMarkers) {
          this.anatomicalMarkers.forEach((marker, index) => {
            const offset = index * Math.PI / 2;
            const scale = 1.0 + 0.2 * Math.sin(this.phase * 2 + offset);
            marker.scale.setScalar(scale);
          });
        }
      }
    };
  }

  /**
   * Update skull wireframe (call in animation loop)
   */
  updateSkullWireframe() {
    if (this.wireframeAnimation) {
      this.wireframeAnimation.animate();
    }

    // Update layer positions to match face mesh
    if (this.wireframeLayers) {
      this.wireframeLayers.forEach(layer => {
        layer.position.copy(this.faceMesh.position);
        layer.rotation.copy(this.faceMesh.rotation);
      });
    }

    // Update anatomical markers
    if (this.anatomicalMarkers) {
      this.anatomicalMarkers.forEach(marker => {
        // Keep markers relative to skull position
        marker.position.add(this.faceMesh.position);
      });
    }
  }

  /**
   * Set skull wireframe style
   */
  setSkullStyle(style) {
    const styles = {
      'anatomical': {
        color: 0x00ff00,
        glowColor: 0x00ff88,
        thickness: 1.5,
        showMarkers: true,
        showDepth: true
      },
      'cyber': {
        color: 0x00ff00,
        glowColor: 0x00ff88,
        thickness: 2.0,
        showMarkers: false,
        showDepth: true
      },
      'neon': {
        color: 0xff0080,
        glowColor: 0xffffff,
        thickness: 1.8,
        showMarkers: false,
        showDepth: false
      },
      'minimal': {
        color: 0x666666,
        glowColor: 0x999999,
        thickness: 1.0,
        showMarkers: false,
        showDepth: false
      }
    };

    const config = styles[style] || styles.anatomical;

    this.setColor(config.color);
    this.animateGlow(config.color, config.glowColor, 1.0);

    // Update thickness
    if (this.wireframeLines) {
      this.wireframeLines.material.linewidth = config.thickness;
    }

    // Toggle markers and depth lines
    this.toggleAnatomicalFeatures(config.showMarkers, config.showDepth);
  }

  /**
   * Toggle anatomical features visibility
   */
  toggleAnatomicalFeatures(showMarkers, showDepth) {
    if (this.anatomicalMarkers) {
      this.anatomicalMarkers.forEach(marker => {
        marker.visible = showMarkers;
      });
    }

    if (this.depthLines) {
      this.depthLines.forEach(line => {
        line.visible = showDepth;
      });
    }
  }

  /**
   * Dispose wireframe resources
   */
  dispose() {
    // Dispose main wireframe
    if (this.wireframeLines) {
      this.wireframeLines.geometry.dispose();
      this.wireframeLines.material.dispose();
    }

    // Dispose wireframe layers
    if (this.wireframeLayers) {
      this.wireframeLayers.forEach(layer => {
        if (layer.geometry) layer.geometry.dispose();
        if (layer.material) layer.material.dispose();
        if (layer.parent) layer.parent.remove(layer);
      });
      this.wireframeLayers = [];
    }

    // Dispose anatomical markers
    if (this.anatomicalMarkers) {
      this.anatomicalMarkers.forEach(marker => {
        if (marker.geometry) marker.geometry.dispose();
        if (marker.material) marker.material.dispose();
        if (marker.parent) marker.parent.remove(marker);
      });
      this.anatomicalMarkers = [];
    }

    // Dispose depth lines
    if (this.depthLines) {
      this.depthLines.forEach(line => {
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
        if (line.parent) line.parent.remove(line);
      });
      this.depthLines = [];
    }

    // Clear animation
    if (this.wireframeAnimation) {
      this.wireframeAnimation = null;
    }
  }
}
