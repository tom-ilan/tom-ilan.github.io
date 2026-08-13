/**
 * ============================================================================
 * stl-viewer.js - WebGL 3D Viewer & STL File Controller
 * ============================================================================
 * Manages Three.js WebGL canvas rendering, studio lighting, camera controls,
 * and handles user STL file loading.
 */

class STLViewer {
  /**
   * Initializes the Three.js viewport scene.
   * 
   * @param {HTMLCanvasElement} canvasElement - Target canvas DOM element
   * @param {number} width - Viewport width in pixels
   * @param {number} height - Viewport height in pixels
   */
  constructor(canvasElement, width = 800, height = 480) {
    this.canvas = canvasElement;
    this.width = width;
    this.height = height;

    this.currentMesh = null;
    this.stlLoader = new THREE.STLLoader();

    // Boxy white/grey theme CAD material (Dark slate / gunmetal finish for maximum contrast on grey background)
    this.cadMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.3,
      metalness: 0.2,
      flatShading: false
    });

    this._initScene();
    this._initLighting();
    this._startRenderLoop();
  }

  /**
   * Configures Scene, Camera, Renderer, and OrbitControls.
   * @private
   */
  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf1f5f9);

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 40, 70);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    
    // Scale for high-DPI (Retina) displays
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Interactive mouse rotation/pan/zoom
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
  }

  /**
   * Sets up 3-point studio lighting for realistic CAD surfaces.
   * @private
   */
  _initLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(50, 80, 50);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xcbd5e1, 0.5);
    fillLight.position.set(-50, 40, -50);
    this.scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
    backLight.position.set(0, -50, 50);
    this.scene.add(backLight);
  }

  /**
   * Resizes viewport when container size changes.
   * 
   * @param {number} width 
   * @param {number} height 
   */
  resize(width, height) {
    if (!width || !height) return;
    this.width = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Updates the CAD material colour.
   *
   * @param {string|number} color - A CSS/Three.js-compatible colour value
   */
  setColor(color) {
    if (!color) return;
    this.cadMaterial.color.set(color);
  }

  /**
   * Sets or replaces the actively rendered 3D model/group.
   * 
   * @param {THREE.Mesh|THREE.Group} object - The Three.js mesh or group to display
   */
  setModel(object) {
    if (this.currentMesh) {
      this.scene.remove(this.currentMesh);
    }

    this.currentMesh = object;
    this.currentMesh.rotation.x = -Math.PI / 3; // Tilt model forward for better viewing angle
    this.scene.add(this.currentMesh);
  }

  /**
   * Parses binary or ASCII ArrayBuffer content from an STL file and loads it into the viewport.
   * 
   * @param {ArrayBuffer} buffer - File buffer content
   */
  loadSTLBuffer(buffer) {
    const geometry = this.stlLoader.parse(buffer);

    // Compute smooth vertex normals to eliminate faceted appearance
    geometry.computeVertexNormals();
    geometry.center();

    const mesh = new THREE.Mesh(geometry, this.cadMaterial);
    this.setModel(mesh);
  }

  /**
   * Starts the continuous WebGL render loop.
   * @private
   */
  _startRenderLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }
}
