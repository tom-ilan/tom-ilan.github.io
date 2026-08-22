/**
 * ============================================================================
 * js/stl-viewer.js — WebGL 3D Viewer (Three.js)
 * ============================================================================
 * Wraps Three.js into a reusable STLViewer class.
 * Each project card creates one STLViewer instance bound to its <canvas>.
 *
 * Dependencies (loaded via CDN in index.html before this script):
 *   • three.min.js      — Core Three.js engine
 *   • STLLoader.js      — Parses binary and ASCII .stl files
 *   • OrbitControls.js  — Mouse / touch rotate, zoom, pan
 * ============================================================================
 */

class STLViewer {

  /**
   * Sets up a new Three.js scene on the given canvas element.
   *
   * @param {HTMLCanvasElement} canvasElement - The <canvas> to render into.
   * @param {number} width  - Initial canvas width in px.
   * @param {number} height - Initial canvas height in px.
   */
  constructor(canvasElement, width = 800, height = 480) {
    this.canvas = canvasElement;
    this.width  = width;
    this.height = height;

    /** @type {THREE.Mesh|null} The currently displayed model (null if empty). */
    this.currentMesh = null;

    /** STLLoader instance shared across all load calls for this viewer. */
    this.stlLoader = new THREE.STLLoader();

    // Gunmetal/dark-slate material — high contrast on the light-grey bg
    this.cadMaterial = new THREE.MeshStandardMaterial({
      color:       0x334155,
      roughness:   0.3,
      metalness:   0.2,
      flatShading: false,  // Smooth normals for a polished look
    });

    // Initialise subsystems in order
    this._initScene();
    this._initLighting();
    this._startRenderLoop();
  }

  // ── Private: Scene, Camera, Renderer, Controls ────────────────────────────

  /**
   * Creates and wires together the core Three.js primitives:
   * Scene → Camera → WebGLRenderer → OrbitControls.
   * @private
   */
  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf1f5f9);  // Match --bg-viewport

    // 45° FOV perspective camera starting slightly above and in front of origin
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 40, 70);

    // WebGL renderer — antialiased, high-performance GPU hint, retina-aware
    this.renderer = new THREE.WebGLRenderer({
      canvas:          this.canvas,
      antialias:       true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));  // Cap at 2× for perf
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type   = THREE.PCFSoftShadowMap;  // Soft shadow edges

    // Orbit controls let the user drag to rotate, scroll to zoom, right-drag to pan
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;   // Adds inertia to rotation
    this.controls.dampingFactor = 0.05;
  }

  /**
   * Adds a 3-point studio lighting rig to the scene:
   *   • Ambient  — flat fill so no part is completely black
   *   • Key      — main bright light (top-right-front)
   *   • Fill     — softer opposing light (top-left-rear, cool tint)
   *   • Back     — rim/separation light (from below-rear)
   * @private
   */
  _initLighting() {
    // Soft global fill — prevents pitch-black shadows
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Key light — dominant, casts shadows
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(50, 80, 50);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    // Fill light — softer, cool-toned, from the opposite side
    const fillLight = new THREE.DirectionalLight(0xcbd5e1, 0.5);
    fillLight.position.set(-50, 40, -50);
    this.scene.add(fillLight);

    // Back/rim light — separates the model from the background
    const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
    backLight.position.set(0, -50, 50);
    this.scene.add(backLight);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Resizes the renderer and updates the camera aspect ratio.
   * Call this whenever the container element changes size.
   *
   * @param {number} width  - New width in pixels.
   * @param {number} height - New height in pixels.
   */
  resize(width, height) {
    if (!width || !height) return;
    this.width  = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Changes the colour of the 3D model material.
   * Accepts any value Three.js Color.set() understands (hex string, number, etc.).
   *
   * @param {string|number} color - e.g. "#1e1e1e" or 0x1e1e1e
   */
  setColor(color) {
    if (!color) return;
    this.cadMaterial.color.set(color);
  }

  /**
   * Replaces the currently displayed model.
   * The old mesh is removed from the scene before the new one is added.
   *
   * @param {THREE.Mesh|THREE.Group} object - Pre-built Three.js object to display.
   */
  setModel(object) {
    // Remove the previous model if one exists
    if (this.currentMesh) {
      this.scene.remove(this.currentMesh);
    }

    this.currentMesh = object;
    // Tilt the model forward so the top face is visible from the default camera angle
    this.currentMesh.rotation.x = -Math.PI / 3;
    this.scene.add(this.currentMesh);
  }

  /**
   * Parses an STL file from an ArrayBuffer and loads it into the viewer.
   * Works with both binary and ASCII STL formats.
   *
   * @param {ArrayBuffer} buffer - Raw file data (e.g. from fetch().arrayBuffer()).
   */
  loadSTLBuffer(buffer) {
    const geometry = this.stlLoader.parse(buffer);

    // Recompute smooth normals to eliminate the flat-faceted look of raw STL geometry
    geometry.computeVertexNormals();

    // Translate geometry so its bounding-box centre sits at the scene origin
    geometry.center();

    const mesh = new THREE.Mesh(geometry, this.cadMaterial);
    this.setModel(mesh);
  }

  // ── Private: Render Loop ──────────────────────────────────────────────────

  /**
   * Kicks off the requestAnimationFrame render loop.
   * OrbitControls.update() must be called each frame when damping is enabled.
   * @private
   */
  _startRenderLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.controls.update();                       // Apply damping inertia
      this.renderer.render(this.scene, this.camera); // Draw the frame
    };
    animate();
  }
}
