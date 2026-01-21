/**
 * @module controllers/ExpressionController
 * ExpressionController - Manages facial expressions and morph target animations
 * Handles complex expression combinations and smooth transitions
 */

export default class ExpressionController {
  constructor(faceMesh, options = {}) {
    this.faceMesh = faceMesh;
    this.wireframeController = options.wireframeController;
    this.currentExpressions = {};
    this.animations = [];
    this.baseColor = options.baseColor || 0x00ff00;
    this.currentColor = this.baseColor;

    // Visual expression presets using color and glow effects
    this.expressions = {
      neutral: {
        color: 0x00ff00,
        glowColor: 0x00ff88,
        glowSpeed: 1.0,
        intensity: 0.5
      },
      thinking: {
        color: 0x0088ff,
        glowColor: 0x00aaff,
        glowSpeed: 1.2,
        intensity: 0.8,
        pulse: true
      },
      coding: {
        color: 0x00ff00,
        glowColor: 0x00ff88,
        glowSpeed: 1.5,
        intensity: 0.7,
        wave: true
      },
      happy: {
        color: 0xffff00,
        glowColor: 0xffffff,
        glowSpeed: 2.0,
        intensity: 1.0,
        sparkle: true
      },
      confused: {
        color: 0xff8800,
        glowColor: 0xffaa00,
        glowSpeed: 0.8,
        intensity: 0.7,
        flicker: true
      },
      eureka: {
        color: 0xff00ff,
        glowColor: 0xffffff,
        glowSpeed: 3.0,
        intensity: 1.0,
        burst: true
      },
      speaking: {
        color: 0x00ffff,
        glowColor: 0xaaffff,
        glowSpeed: 2.5,
        intensity: 0.8,
        talk: true
      },
      blink: {
        color: 0x666666,
        glowColor: 0x999999,
        glowSpeed: 0.5,
        intensity: 0.2,
        blink: true,
        duration: 150
      },
      wink: {
        color: 0x00ff00,
        glowColor: 0x00ff88,
        glowSpeed: 1.0,
        intensity: 0.6,
        wink: true,
        duration: 200
      },
      surprise: {
        color: 0xffffff,
        glowColor: 0xffffff,
        glowSpeed: 4.0,
        intensity: 1.0,
        flash: true,
        duration: 500
      }
    };

    // Legacy morph target support (for backward compatibility)
    this.morphTargetInfluences = faceMesh.morphTargetInfluences || [];
    this.morphMap = {};
    if (faceMesh.geometry && faceMesh.geometry.morphAttributes.position) {
      faceMesh.geometry.morphAttributes.position.forEach((attr, index) => {
        const name = this.getMorphNameByIndex(index);
        if (name) {
          this.morphMap[name] = index;
        }
      });
    }
  }

  /**
   * Get morph target name by index (from FaceGeometry)
   */
  getMorphNameByIndex(index) {
    const morphNames = [
      'smile',
      'frown',
      'mouth_open',
      'blink',
      'wink_left',
      'wink_right',
      'eyebrows_raised',
      'eyebrows_furrowed',
    ];
    return morphNames[index];
  }

  /**
   * Set a specific expression using visual effects
   * @param {string} expressionName - Name of expression preset
   * @param {number} intensity - Overall intensity (0-1)
   * @param {number} duration - Transition duration in ms
   */
  setExpression(expressionName, intensity = 1.0, duration = 300) {
    const expression = this.expressions[expressionName];
    if (!expression) {
      console.warn(`Unknown expression: ${expressionName}`);
      return;
    }

    // Apply visual expression effects
    this.applyVisualExpression(expression, intensity, duration);

    // Legacy morph target support (disabled by default for wireframe separation)
    if (this.wireframeController && false) { // Set to false to disable morph targets
      this.applyMorphExpression(expression, intensity, duration);
    }

    this.currentExpressions = { ...expression };
    console.log(`Expression set to: ${expressionName} (intensity: ${intensity})`);
  }

  /**
   * Apply visual expression effects through wireframe controller
   */
  applyVisualExpression(expression, intensity = 1.0, duration = 300) {
    if (!this.wireframeController) return;

    const adjustedIntensity = intensity * (expression.intensity || 1.0);
    const targetColor = this.interpolateColor(this.baseColor, expression.color, adjustedIntensity);
    const targetGlowColor = this.interpolateColor(this.baseColor, expression.glowColor, adjustedIntensity);

    // Animate color transition
    this.animateColorChange(targetColor, targetGlowColor, expression.glowSpeed || 1.0, duration);

    // Apply special effects
    if (expression.pulse) {
      this.startPulseEffect(adjustedIntensity);
    }
    if (expression.wave) {
      this.startWaveEffect(adjustedIntensity);
    }
    if (expression.sparkle) {
      this.startSparkleEffect(adjustedIntensity);
    }
    if (expression.flicker) {
      this.startFlickerEffect(adjustedIntensity);
    }
    if (expression.burst) {
      this.startBurstEffect(adjustedIntensity);
    }
    if (expression.talk) {
      this.startTalkEffect(adjustedIntensity);
    }
    if (expression.blink) {
      this.startBlinkEffect(expression.duration || 150);
    }
    if (expression.wink) {
      this.startWinkEffect(expression.duration || 200);
    }
    if (expression.flash) {
      this.startFlashEffect(expression.duration || 500);
    }
  }

  /**
   * Apply legacy morph target expression (for backward compatibility)
   */
  applyMorphExpression(expression, intensity = 1.0, duration = 300) {
    // Reset all morph targets to 0 first
    Object.keys(this.morphMap).forEach(morphName => {
      if (!expression[morphName]) {
        this.animateMorph(morphName, 0, duration);
      }
    });

    // Apply expression morphs
    Object.entries(expression).forEach(([morphName, value]) => {
      if (typeof value === 'number') {
        this.animateMorph(morphName, value * intensity, duration);
      }
    });
  }

  /**
   * Animate a specific morph target
   * @param {string} morphName - Morph target name
   * @param {number} targetValue - Target value (0-1)
   * @param {number} duration - Animation duration in ms
   */
  animateMorph(morphName, targetValue, duration = 300) {
    const morphIndex = this.morphMap[morphName];
    if (morphIndex === undefined) {
      console.warn(`Unknown morph target: ${morphName}`);
      return;
    }

    const startValue = this.morphTargetInfluences[morphIndex] || 0;
    const startTime = Date.now();

    // Add animation to queue
    this.animations.push({
      morphIndex,
      morphName,
      startValue,
      targetValue,
      startTime,
      duration,
    });
  }

  /**
   * Set morph target directly (no animation)
   * @param {string} morphName - Morph target name
   * @param {number} value - Value (0-1)
   */
  setMorphDirect(morphName, value) {
    const morphIndex = this.morphMap[morphName];
    if (morphIndex !== undefined) {
      this.morphTargetInfluences[morphIndex] = Math.max(0, Math.min(1, value));
    }
  }

  /**
   * Update animation loop (called from FaceRenderer)
   */
  update() {
    const now = Date.now();

    // Update legacy morph target animations (if enabled)
    this.animations = this.animations.filter(anim => {
      const elapsed = now - anim.startTime;
      const progress = Math.min(elapsed / anim.duration, 1.0);

      // Ease-in-out interpolation
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentValue = anim.startValue + (anim.targetValue - anim.startValue) * eased;
      this.morphTargetInfluences[anim.morphIndex] = currentValue;

      // Remove animation if complete
      return progress < 1.0;
    });

    // Update visual effects animations
    this.updateVisualEffects();
  }

  /**
   * Update visual effects (called each frame)
   */
  updateVisualEffects() {
    // Visual effects are handled by setInterval/setTimeout in their respective methods
    // This method can be extended for frame-based visual updates if needed
  }

  /**
   * Blend multiple expressions
   * @param {Object} expressionWeights - Map of expression names to weights
   * @param {number} duration - Transition duration
   */
  blendExpressions(expressionWeights, duration = 300) {
    const combinedMorphs = {};

    // Combine all expression morphs with weights
    Object.entries(expressionWeights).forEach(([exprName, weight]) => {
      const expression = this.expressions[exprName];
      if (expression) {
        Object.entries(expression).forEach(([morphName, value]) => {
          combinedMorphs[morphName] = (combinedMorphs[morphName] || 0) + value * weight;
        });
      }
    });

    // Normalize and apply
    Object.entries(combinedMorphs).forEach(([morphName, value]) => {
      this.animateMorph(morphName, Math.min(value, 1.0), duration);
    });
  }

  /**
   * Create periodic animation (like idle breathing)
   * @param {string} morphName - Morph target to animate
   * @param {number} frequency - Frequency in Hz
   * @param {number} amplitude - Amplitude (0-1)
   */
  createPeriodicAnimation(morphName, frequency, amplitude) {
    const morphIndex = this.morphMap[morphName];
    if (morphIndex === undefined) return;

    const animate = () => {
      const time = Date.now() / 1000;
      const value = (Math.sin(time * frequency * Math.PI * 2) + 1) / 2 * amplitude;
      this.morphTargetInfluences[morphIndex] = value;
    };

    setInterval(animate, 16); // ~60fps
  }

  /**
   * Blink animation sequence
   */
  async blink() {
    this.animateMorph('blink', 1.0, 100);
    await this.sleep(100);
    this.animateMorph('blink', 0.0, 100);
  }

  /**
   * Random blink behavior (natural)
   */
  startRandomBlinks() {
    const blinkInterval = () => {
      this.blink();
      const nextBlink = 2000 + Math.random() * 4000; // 2-6 seconds
      setTimeout(blinkInterval, nextBlink);
    };
    blinkInterval();
  }

  /**
   * Speaking animation (mouth movement)
   * @param {string} text - Text being spoken (for future phoneme mapping)
   */
  speak(text) {
    // Simple mouth movement for speaking
    const syllables = text.split(' ').length;
    const baseDelay = 150;

    for (let i = 0; i < syllables; i++) {
      setTimeout(() => {
        this.animateMorph('mouth_open', 0.3 + Math.random() * 0.2, 100);
        setTimeout(() => {
          this.animateMorph('mouth_open', 0, 100);
        }, 100);
      }, i * baseDelay);
    }
  }

  /**
   * Get current expression state
   */
  getCurrentState() {
    return {
      currentExpressions: this.currentExpressions,
      morphInfluences: this.morphTargetInfluences.map((val, idx) => ({
        name: this.getMorphNameByIndex(idx),
        value: val,
      })),
      activeAnimations: this.animations.length,
    };
  }

  /**
   * Animate color change for expressions
   */
  animateColorChange(targetColor, targetGlowColor, glowSpeed, duration) {
    if (!this.wireframeController) return;

    const startColor = this.currentColor;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      const currentColor = this.interpolateColor(startColor, targetColor, progress);
      this.currentColor = currentColor;

      // Apply to wireframe
      this.wireframeController.setColor(currentColor);

      // Apply glow effect
      if (this.wireframeController.animateGlow) {
        this.wireframeController.animateGlow(currentColor, targetGlowColor, glowSpeed);
      }

      if (progress < 1.0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Color interpolation utility
   */
  interpolateColor(color1, color2, factor) {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    const result = new THREE.Color();

    result.r = c1.r + (c2.r - c1.r) * factor;
    result.g = c1.g + (c2.g - c1.g) * factor;
    result.b = c1.b + (c2.b - c1.b) * factor;

    return result.getHex();
  }

  /**
   * Pulse effect - rhythmic color intensity changes
   */
  startPulseEffect(intensity) {
    if (this.pulseAnimation) clearInterval(this.pulseAnimation);

    this.pulseAnimation = setInterval(() => {
      const time = Date.now() / 1000;
      const pulse = (Math.sin(time * 2) + 1) / 2;
      const pulsedColor = this.interpolateColor(this.baseColor, this.currentColor, intensity * pulse);

      if (this.wireframeController) {
        this.wireframeController.setColor(pulsedColor);
      }
    }, 16);
  }

  /**
   * Wave effect - flowing color waves across wireframe
   */
  startWaveEffect(intensity) {
    if (this.waveAnimation) clearInterval(this.waveAnimation);

    this.waveAnimation = setInterval(() => {
      const time = Date.now() / 1000;
      // Create wave pattern across wireframe layers
      if (this.wireframeController && this.wireframeController.wireframeLayers) {
        this.wireframeController.wireframeLayers.forEach((layer, index) => {
          const wave = Math.sin(time * 2 + index * 0.5) * 0.5 + 0.5;
          const waveColor = this.interpolateColor(this.baseColor, this.currentColor, intensity * wave);
          layer.material.color.setHex(waveColor);
        });
      }
    }, 16);
  }

  /**
   * Sparkle effect - random bright flashes
   */
  startSparkleEffect(intensity) {
    if (this.sparkleAnimation) clearInterval(this.sparkleAnimation);

    this.sparkleAnimation = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance each frame
        const flashColor = this.interpolateColor(this.currentColor, 0xffffff, intensity);
        if (this.wireframeController) {
          this.wireframeController.setColor(flashColor);
          setTimeout(() => {
            this.wireframeController.setColor(this.currentColor);
          }, 50);
        }
      }
    }, 100);
  }

  /**
   * Flicker effect - irregular brightness changes
   */
  startFlickerEffect(intensity) {
    if (this.flickerAnimation) clearInterval(this.flickerAnimation);

    this.flickerAnimation = setInterval(() => {
      const flicker = Math.random() * intensity;
      const flickerColor = this.interpolateColor(this.baseColor, this.currentColor, flicker);

      if (this.wireframeController) {
        this.wireframeController.setColor(flickerColor);
      }
    }, 50);
  }

  /**
   * Burst effect - rapid color bursts
   */
  startBurstEffect(intensity) {
    if (this.burstAnimation) clearTimeout(this.burstAnimation);

    let burstCount = 0;
    const maxBursts = 5;

    const burst = () => {
      if (burstCount >= maxBursts) return;

      const burstColor = this.interpolateColor(this.currentColor, 0xffffff, intensity);
      if (this.wireframeController) {
        this.wireframeController.setColor(burstColor);
        setTimeout(() => {
          this.wireframeController.setColor(this.currentColor);
        }, 100);
      }

      burstCount++;
      this.burstAnimation = setTimeout(burst, 150 + Math.random() * 200);
    };

    burst();
  }

  /**
   * Talk effect - rhythmic color changes for speaking
   */
  startTalkEffect(intensity) {
    if (this.talkAnimation) clearInterval(this.talkAnimation);

    this.talkAnimation = setInterval(() => {
      const time = Date.now() / 1000;
      const talk = (Math.sin(time * 8) + 1) / 2; // Faster rhythm for talking
      const talkColor = this.interpolateColor(this.baseColor, this.currentColor, intensity * talk);

      if (this.wireframeController) {
        this.wireframeController.setColor(talkColor);
      }
    }, 16);
  }

  /**
   * Blink effect - temporary color dimming
   */
  startBlinkEffect(duration) {
    if (this.blinkAnimation) clearTimeout(this.blinkAnimation);

    const blinkColor = this.interpolateColor(this.currentColor, 0x000000, 0.8);
    if (this.wireframeController) {
      this.wireframeController.setColor(blinkColor);
      this.blinkAnimation = setTimeout(() => {
        this.wireframeController.setColor(this.currentColor);
      }, duration);
    }
  }

  /**
   * Wink effect - partial blink effect
   */
  startWinkEffect(duration) {
    if (this.winkAnimation) clearTimeout(this.winkAnimation);

    // Wink affects only part of the wireframe (simplified)
    const winkColor = this.interpolateColor(this.currentColor, this.baseColor, 0.3);
    if (this.wireframeController) {
      this.wireframeController.setColor(winkColor);
      this.winkAnimation = setTimeout(() => {
        this.wireframeController.setColor(this.currentColor);
      }, duration);
    }
  }

  /**
   * Flash effect - bright momentary flash
   */
  startFlashEffect(duration) {
    if (this.flashAnimation) clearTimeout(this.flashAnimation);

    if (this.wireframeController) {
      this.wireframeController.setColor(0xffffff);
      this.flashAnimation = setTimeout(() => {
        this.wireframeController.setColor(this.currentColor);
      }, duration);
    }
  }

  /**
   * Stop all visual effects
   */
  stopAllEffects() {
    ['pulseAnimation', 'waveAnimation', 'sparkleAnimation', 'flickerAnimation',
     'burstAnimation', 'talkAnimation', 'blinkAnimation', 'winkAnimation', 'flashAnimation'].forEach(effect => {
      if (this[effect]) {
        clearInterval(this[effect]);
        clearTimeout(this[effect]);
        this[effect] = null;
      }
    });
  }

  /**
   * Reset to neutral expression
   */
  resetToNeutral() {
    this.stopAllEffects();
    this.setExpression('neutral', 1.0, 500);
  }

  /**
   * Utility sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
