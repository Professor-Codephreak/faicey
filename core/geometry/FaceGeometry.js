/**
 * FaceGeometry - Creates 3D geometry for humanoid face
 * Defines vertices, faces, and morph targets for expressions
 */

import * as THREE from 'three';

/**
 * @module geometry/FaceGeometry
 * Handles 3D face geometry creation and morph targets
 */

export default class FaceGeometry {
  constructor() {
    this.morphTargets = [];
  }

  /**
   * Create face geometry with eyes, nose, mouth, and head outline
   */
  createFaceGeometry() {
    const geometry = new THREE.BufferGeometry();

    // Define face vertices (simplified humanoid face)
    const vertices = new Float32Array([
      // Head outline (ellipse)
      0.0, 1.2, 0.0,    // 0: top
      0.7, 1.0, 0.0,    // 1: top-right
      1.0, 0.5, 0.0,    // 2: right-top
      1.0, 0.0, 0.0,    // 3: right-middle
      1.0, -0.5, 0.0,   // 4: right-bottom
      0.5, -1.0, 0.0,   // 5: bottom-right
      0.0, -1.2, 0.0,   // 6: bottom
      -0.5, -1.0, 0.0,  // 7: bottom-left
      -1.0, -0.5, 0.0,  // 8: left-bottom
      -1.0, 0.0, 0.0,   // 9: left-middle
      -1.0, 0.5, 0.0,   // 10: left-top
      -0.7, 1.0, 0.0,   // 11: top-left

      // Left eye (circle)
      -0.5, 0.4, 0.0,   // 12: left eye center
      -0.3, 0.4, 0.0,   // 13: left eye right
      -0.5, 0.6, 0.0,   // 14: left eye top
      -0.7, 0.4, 0.0,   // 15: left eye left
      -0.5, 0.2, 0.0,   // 16: left eye bottom

      // Right eye (circle)
      0.5, 0.4, 0.0,    // 17: right eye center
      0.7, 0.4, 0.0,    // 18: right eye right
      0.5, 0.6, 0.0,    // 19: right eye top
      0.3, 0.4, 0.0,    // 20: right eye left
      0.5, 0.2, 0.0,    // 21: right eye bottom

      // Nose (simple triangle)
      0.0, 0.2, 0.1,    // 22: nose tip
      -0.1, 0.0, 0.0,   // 23: nose left
      0.1, 0.0, 0.0,    // 24: nose right

      // Mouth (ellipse)
      0.0, -0.4, 0.0,   // 25: mouth center
      0.3, -0.4, 0.0,   // 26: mouth right
      0.2, -0.3, 0.0,   // 27: mouth top-right
      0.0, -0.3, 0.0,   // 28: mouth top
      -0.2, -0.3, 0.0,  // 29: mouth top-left
      -0.3, -0.4, 0.0,  // 30: mouth left
      -0.2, -0.5, 0.0,  // 31: mouth bottom-left
      0.0, -0.5, 0.0,   // 32: mouth bottom
      0.2, -0.5, 0.0,   // 33: mouth bottom-right

      // Eyebrows
      -0.7, 0.7, 0.0,   // 34: left eyebrow left
      -0.3, 0.7, 0.0,   // 35: left eyebrow right
      0.3, 0.7, 0.0,    // 36: right eyebrow left
      0.7, 0.7, 0.0,    // 37: right eyebrow right
    ]);

    return this.createSkullGeometry(geometry);
  }

  /**
   * Create 3D skull geometry with wireframe overlay
   */
  createSkullGeometry(geometry) {
    // Define comprehensive skull vertices (3D structure)
    const skullVertices = new Float32Array([
      // CRANIUM (skull cap) - Outer surface
      0.0, 1.4, 0.0,     // 0: cranial vertex (top of skull)
      0.8, 1.2, 0.0,     // 1: frontal right
      1.0, 0.8, 0.0,     // 2: temporal right
      1.0, 0.0, 0.0,     // 3: parietal right
      0.8, -0.8, 0.0,    // 4: occipital right
      0.0, -1.0, 0.0,    // 5: occipital base
      -0.8, -0.8, 0.0,   // 6: occipital left
      -1.0, 0.0, 0.0,    // 7: parietal left
      -1.0, 0.8, 0.0,    // 8: temporal left
      -0.8, 1.2, 0.0,    // 9: frontal left

      // CRANIUM - Inner depth (back of skull)
      0.0, 1.2, -0.3,    // 10: cranial vertex inner
      0.7, 1.0, -0.3,    // 11: frontal right inner
      0.8, 0.6, -0.3,    // 12: temporal right inner
      0.8, -0.2, -0.3,   // 13: parietal right inner
      0.6, -0.6, -0.3,   // 14: occipital right inner
      0.0, -0.8, -0.3,   // 15: occipital base inner
      -0.6, -0.6, -0.3,  // 16: occipital left inner
      -0.8, -0.2, -0.3,  // 17: parietal left inner
      -0.8, 0.6, -0.3,   // 18: temporal left inner
      -0.7, 1.0, -0.3,   // 19: frontal left inner

      // ORBITAL CAVITIES (eye sockets) - Outer rims
      -0.8, 0.5, 0.2,    // 20: left orbit top-left
      -0.3, 0.7, 0.2,    // 21: left orbit top-right
      -0.2, 0.4, 0.2,    // 22: left orbit right
      -0.5, 0.2, 0.2,    // 23: left orbit bottom
      -0.8, 0.3, 0.2,    // 24: left orbit left
      0.8, 0.5, 0.2,     // 25: right orbit top-right
      0.3, 0.7, 0.2,     // 26: right orbit top-left
      0.2, 0.4, 0.2,     // 27: right orbit left
      0.5, 0.2, 0.2,     // 28: right orbit bottom
      0.8, 0.3, 0.2,     // 29: right orbit right

      // ORBITAL CAVITIES - Inner depth
      -0.6, 0.5, 0.0,    // 30: left orbit inner top-left
      -0.3, 0.6, 0.0,    // 31: left orbit inner top-right
      -0.2, 0.4, 0.0,    // 32: left orbit inner right
      -0.4, 0.3, 0.0,    // 33: left orbit inner bottom
      -0.6, 0.4, 0.0,    // 34: left orbit inner left
      0.6, 0.5, 0.0,     // 35: right orbit inner top-right
      0.3, 0.6, 0.0,     // 36: right orbit inner top-left
      0.2, 0.4, 0.0,     // 37: right orbit inner left
      0.4, 0.3, 0.0,     // 38: right orbit inner bottom
      0.6, 0.4, 0.0,     // 39: right orbit inner right

      // NASAL CAVITY
      0.0, 0.4, 0.3,     // 40: nasal bridge top
      0.0, 0.1, 0.4,     // 41: nasal tip
      -0.15, 0.3, 0.25,  // 42: nasal left top
      0.15, 0.3, 0.25,   // 43: nasal right top
      -0.12, 0.0, 0.3,   // 44: nasal left base
      0.12, 0.0, 0.3,    // 45: nasal right base
      0.0, -0.1, 0.2,    // 46: nasal septum bottom

      // ZYGOMATIC ARCHES (cheekbones)
      -0.9, 0.1, 0.0,    // 47: left zygomatic arch back
      -1.0, 0.3, 0.0,    // 48: left zygomatic arch up
      -0.7, 0.4, 0.1,    // 49: left zygomatic arch front
      -0.5, 0.1, 0.2,    // 50: left zygomatic body
      0.9, 0.1, 0.0,     // 51: right zygomatic arch back
      1.0, 0.3, 0.0,     // 52: right zygomatic arch up
      0.7, 0.4, 0.1,     // 53: right zygomatic arch front
      0.5, 0.1, 0.2,     // 54: right zygomatic body

      // MANDIBLE (lower jaw)
      0.0, -0.8, 0.1,    // 55: mandible symphysis
      0.6, -0.6, 0.1,    // 56: mandible right body
      0.8, -0.4, 0.1,    // 57: mandible right ramus
      0.7, -0.2, 0.0,    // 58: mandible right condyle
      0.5, -0.8, 0.1,    // 59: mandible right angle
      -0.6, -0.6, 0.1,   // 60: mandible left body
      -0.8, -0.4, 0.1,   // 61: mandible left ramus
      -0.7, -0.2, 0.0,   // 62: mandible left condyle
      -0.5, -0.8, 0.1,   // 63: mandible left angle

      // TEMPORAL BONES
      -0.9, 0.5, -0.1,   // 64: left temporal bone
      -0.8, 0.2, -0.2,   // 65: left temporal process
      0.9, 0.5, -0.1,    // 66: right temporal bone
      0.8, 0.2, -0.2,    // 67: right temporal process

      // MAXILLA (upper jaw)
      0.0, -0.2, 0.3,    // 68: maxillary midline
      -0.4, -0.1, 0.25,  // 69: left maxilla
      0.4, -0.1, 0.25,   // 70: right maxilla
      -0.3, -0.4, 0.2,   // 71: left maxillary process
      0.3, -0.4, 0.2,    // 72: right maxillary process

      // FORAMEN MAGNUM (base of skull)
      0.0, -0.6, -0.4,   // 73: foramen magnum center
      -0.2, -0.5, -0.3,  // 74: foramen magnum left
      0.2, -0.5, -0.3,   // 75: foramen magnum right
      0.0, -0.4, -0.3,   // 76: foramen magnum anterior
      0.0, -0.8, -0.3,   // 77: foramen magnum posterior

      // OCCIPITAL BONE
      0.0, -0.9, -0.2,   // 78: external occipital protuberance
      -0.4, -0.7, -0.2,  // 79: left occipital
      0.4, -0.7, -0.2,   // 80: right occipital

      // PARIETAL BONES
      -0.6, 0.8, -0.1,   // 81: left parietal eminence
      0.6, 0.8, -0.1,    // 82: right parietal eminence
      0.0, 0.6, -0.1,    // 83: sagittal suture

      // FRONTAL BONE
      0.0, 1.1, 0.1,     // 84: glabella
      -0.5, 1.0, 0.1,    // 85: left frontal eminence
      0.5, 1.0, 0.1,     // 86: right frontal eminence

      // SUTURES (bone junctions - for anatomical accuracy)
      0.0, 0.9, 0.0,     // 87: coronal suture center
      -0.7, 0.6, 0.0,    // 88: coronal suture left
      0.7, 0.6, 0.0,     // 89: coronal suture right
      0.0, -0.7, 0.0,    // 90: lambdoid suture center
      -0.6, -0.5, 0.0,   // 91: lambdoid suture left
      0.6, -0.5, 0.0,    // 92: lambdoid suture right

      // ADDITIONAL SKULL FEATURES
      -0.4, 0.8, 0.2,    // 93: left superciliary arch
      0.4, 0.8, 0.2,     // 94: right superciliary arch
      0.0, -0.3, 0.4,    // 95: anterior nasal spine
      -0.3, -0.6, 0.15,  // 96: left mental foramen
      0.3, -0.6, 0.15,   // 97: right mental foramen
    ]);

    // Define comprehensive skull wireframe indices
    const skullIndices = [
      // CRANIUM OUTLINE (outer)
      0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 0,

      // CRANIUM DEPTH CONNECTIONS
      0, 10, 1, 11, 2, 12, 3, 13, 4, 14, 5, 15, 6, 16, 7, 17, 8, 18, 9, 19,

      // INNER CRANIUM CIRCLE
      10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 10,

      // ORBITAL CAVITIES (eye sockets) - LEFT
      20, 21, 21, 22, 22, 23, 23, 24, 24, 20,  // outer rim
      30, 31, 31, 32, 32, 33, 33, 34, 34, 30,  // inner depth
      20, 30, 21, 31, 22, 32, 23, 33, 24, 34,  // rim connections

      // ORBITAL CAVITIES (eye sockets) - RIGHT
      25, 26, 26, 27, 27, 28, 28, 29, 29, 25,  // outer rim
      35, 36, 36, 37, 37, 38, 38, 39, 39, 35,  // inner depth
      25, 35, 26, 36, 27, 37, 28, 38, 29, 39,  // rim connections

      // NASAL CAVITY
      40, 41, 41, 46, 40, 42, 42, 44, 40, 43, 43, 45,  // bridge and septum
      42, 43, 44, 45, 44, 46, 45, 46,  // nasal base

      // ZYGOMATIC ARCHES (cheekbones)
      47, 48, 48, 49, 49, 50, 50, 47,  // left zygomatic
      51, 52, 52, 53, 53, 54, 54, 51,  // right zygomatic

      // MANDIBLE (lower jaw)
      55, 56, 56, 57, 57, 58, 58, 59, 59, 55,  // right side
      55, 60, 60, 61, 61, 62, 62, 63, 63, 55,  // left side
      56, 60, 57, 61, 58, 62, 59, 63,  // cross connections

      // TEMPORAL BONES
      64, 65, 64, 18, 65, 17,  // left temporal connections
      66, 67, 66, 12, 67, 13,  // right temporal connections

      // MAXILLA (upper jaw)
      68, 69, 69, 71, 68, 70, 70, 72, 69, 70, 71, 72,  // maxillary structure

      // FORAMEN MAGNUM
      73, 74, 74, 75, 75, 76, 76, 77, 77, 73, 74, 76, 75, 77,  // base opening

      // OCCIPITAL BONE
      78, 79, 79, 80, 78, 15, 79, 16, 80, 14,  // occipital structure

      // PARIETAL BONES
      81, 82, 81, 19, 82, 11, 81, 17, 82, 13, 83, 81, 83, 82,  // parietal connections

      // FRONTAL BONE
      84, 85, 85, 86, 84, 10, 85, 19, 86, 11,  // frontal connections

      // SUTURES
      87, 88, 88, 89, 87, 83,  // coronal suture
      90, 91, 91, 92, 90, 78,  // lambdoid suture

      // SUPERCILIARY ARCHES
      93, 94, 93, 85, 94, 86,  // brow ridges

      // MENTAL FORAMINA
      96, 63, 97, 59,  // jaw foramina
    ];

    geometry.setAttribute('position', new THREE.BufferAttribute(skullVertices, 3));
    geometry.setIndex(skullIndices);
    geometry.computeBoundingSphere();

    // Create morph targets for skull expressions
    this.createSkullMorphTargets(geometry, skullVertices);

    return geometry;
  }

  /**
   * Create morph targets for facial expressions
   */
  createMorphTargets(geometry, baseVertices) {
    // For backward compatibility, keep the original morph targets
    // but also create skull morph targets
    this.createSkullMorphTargets(geometry, baseVertices);
  }

  /**
   * Create morph targets for skull-based expressions
   */
  createSkullMorphTargets(geometry, baseVertices) {
    const vertexCount = baseVertices.length / 3;

    // Helper to create morph target
    const createMorph = (name, modifications) => {
      const morphVertices = new Float32Array(baseVertices);

      modifications.forEach(({ index, x, y, z, dx, dy, dz }) => {
        if (dx !== undefined) morphVertices[index * 3] += dx;
        else if (x !== undefined) morphVertices[index * 3] = x;

        if (dy !== undefined) morphVertices[index * 3 + 1] += dy;
        else if (y !== undefined) morphVertices[index * 3 + 1] = y;

        if (dz !== undefined) morphVertices[index * 3 + 2] += dz;
        else if (z !== undefined) morphVertices[index * 3 + 2] = z;
      });

      return {
        name,
        vertices: morphVertices,
      };
    };

    // Smile expression (zygomatic movement)
    this.morphTargets.push(createMorph('smile', [
      // Zygomatic arches lift slightly
      { index: 49, dy: 0.05, dz: 0.02 }, // left zygomatic front
      { index: 53, dy: 0.05, dz: 0.02 }, // right zygomatic front
      // Maxilla movement for smile
      { index: 69, dy: -0.03 }, // left maxilla
      { index: 70, dy: -0.03 }, // right maxilla
      { index: 71, dy: -0.03 }, // left maxillary process
      { index: 72, dy: -0.03 }, // right maxillary process
    ]));

    // Frown expression (glabellar contraction)
    this.morphTargets.push(createMorph('frown', [
      { index: 84, dz: -0.05 }, // glabella inward
      { index: 93, dy: -0.05 }, // left superciliary arch down
      { index: 94, dy: -0.05 }, // right superciliary arch down
      // Maxilla slight downturn
      { index: 68, dy: -0.02 }, // maxillary midline
    ]));

    // Mouth open (mandibular depression)
    this.morphTargets.push(createMorph('mouth_open', [
      // Mandible rotation and depression
      { index: 55, dy: -0.15, dz: 0.05 }, // mandible symphysis down
      { index: 56, dy: -0.1, dz: 0.03 },  // mandible right body down
      { index: 57, dy: -0.08, dz: 0.02 }, // mandible right ramus down
      { index: 60, dy: -0.1, dz: 0.03 },  // mandible left body down
      { index: 61, dy: -0.08, dz: 0.02 }, // mandible left ramus down
      // Maxilla slight compensation
      { index: 68, dy: 0.02 }, // maxillary midline up
    ]));

    // Blink (orbital closure)
    this.morphTargets.push(createMorph('blink', [
      // Left orbital closure
      { index: 30, dy: -0.08 }, { index: 31, dy: -0.08 }, { index: 32, dy: -0.08 },
      { index: 33, dy: 0.08 }, { index: 34, dy: -0.08 },
      // Right orbital closure
      { index: 35, dy: -0.08 }, { index: 36, dy: -0.08 }, { index: 37, dy: -0.08 },
      { index: 38, dy: 0.08 }, { index: 39, dy: -0.08 },
    ]));

    // Wink left
    this.morphTargets.push(createMorph('wink_left', [
      { index: 30, dy: -0.08 }, { index: 31, dy: -0.08 }, { index: 32, dy: -0.08 },
      { index: 33, dy: 0.08 }, { index: 34, dy: -0.08 },
    ]));

    // Wink right
    this.morphTargets.push(createMorph('wink_right', [
      { index: 35, dy: -0.08 }, { index: 36, dy: -0.08 }, { index: 37, dy: -0.08 },
      { index: 38, dy: 0.08 }, { index: 39, dy: -0.08 },
    ]));

    // Raised eyebrows (surprised - frontal bone movement)
    this.morphTargets.push(createMorph('eyebrows_raised', [
      { index: 84, dy: 0.08 }, // glabella up
      { index: 85, dy: 0.08 }, // left frontal eminence up
      { index: 86, dy: 0.08 }, // right frontal eminence up
      { index: 93, dy: 0.06 }, // left superciliary arch up
      { index: 94, dy: 0.06 }, // right superciliary arch up
    ]));

    // Furrowed eyebrows (thinking - frontal contraction)
    this.morphTargets.push(createMorph('eyebrows_furrowed', [
      { index: 84, dz: -0.05, dy: -0.03 }, // glabella inward and down
      { index: 93, dx: -0.03, dy: -0.04 }, // left superciliary arch inward
      { index: 94, dx: 0.03, dy: -0.04 }, // right superciliary arch inward
    ]));

    // Coding expression (focused concentration)
    this.morphTargets.push(createMorph('coding', [
      // Slight squint (orbital narrowing)
      { index: 30, dx: 0.02 }, { index: 31, dx: -0.02 }, { index: 34, dx: 0.02 },
      { index: 35, dx: -0.02 }, { index: 36, dx: 0.02 }, { index: 39, dx: -0.02 },
      // Slight frown
      { index: 84, dz: -0.02 },
      // Mouth slight compression
      { index: 68, dz: -0.01 },
    ]));

    // Thinking expression (contemplative)
    this.morphTargets.push(createMorph('thinking', [
      // Raised left eyebrow
      { index: 93, dy: 0.05, dx: -0.02 },
      // Slight mouth asymmetry
      { index: 69, dy: 0.02 }, // left maxilla up
      { index: 71, dy: 0.02 }, // left maxillary process up
    ]));

    // Eureka expression (sudden realization)
    this.morphTargets.push(createMorph('eureka', [
      // Wide open orbitals (surprise)
      { index: 30, dy: 0.05 }, { index: 31, dy: 0.05 }, { index: 34, dy: 0.05 },
      { index: 35, dy: 0.05 }, { index: 36, dy: 0.05 }, { index: 39, dy: 0.05 },
      // Mouth opening
      { index: 55, dy: -0.08, dz: 0.03 },
      { index: 68, dy: 0.02 },
    ]));

    // Confused expression (bewildered)
    this.morphTargets.push(createMorph('confused', [
      // Asymmetrical eyebrow movement
      { index: 93, dy: 0.03, dx: -0.03 }, // left brow up and inward
      { index: 94, dy: -0.02, dx: 0.02 }, // right brow down and outward
      // Mouth slight asymmetry
      { index: 69, dx: -0.02 }, // left maxilla inward
    ]));

    // Happy expression
    this.morphTargets.push(createMorph('happy', [
      // Broad smile with zygomatic activation
      { index: 49, dy: 0.08, dz: 0.03 }, // left zygomatic front up
      { index: 53, dy: 0.08, dz: 0.03 }, // right zygomatic front up
      { index: 69, dy: -0.02, dx: -0.03 }, // left maxilla down and out
      { index: 70, dy: -0.02, dx: 0.03 }, // right maxilla down and out
      { index: 71, dy: -0.02 }, // left maxillary process down
      { index: 72, dy: -0.02 }, // right maxillary process down
    ]));

    // Concentrated expression (intense focus)
    this.morphTargets.push(createMorph('concentrated', [
      // Orbital narrowing (squint)
      { index: 30, dx: 0.03 }, { index: 31, dx: -0.03 },
      { index: 35, dx: -0.03 }, { index: 36, dx: 0.03 },
      // Jaw clench
      { index: 55, dz: -0.02 }, // mandible symphysis forward
      { index: 96, dz: -0.01 }, { index: 97, dz: -0.01 }, // mental foramina
    ]));

    // Store morph targets on geometry
    geometry.morphAttributes.position = this.morphTargets.map(m =>
      new THREE.BufferAttribute(m.vertices, 3)
    );
    geometry.morphTargetsRelative = false;

    console.log(`Created ${this.morphTargets.length} skull-based morph targets`);
  }

  /**
   * Get list of available morph targets
   */
  getMorphTargets() {
    return this.morphTargets.map(m => m.name);
  }
}
