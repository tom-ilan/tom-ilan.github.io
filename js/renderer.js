/**
 * ============================================================================
 * js/renderer.js — Project Card HTML Builder
 * ============================================================================
 * Contains the single function responsible for turning a project data object
 * from PROJECTS_REGISTRY into a fully-mounted DOM element (article card).
 *
 * Kept separate from app.js so the rendering logic can be read, tested,
 * and modified without touching the application bootstrap code.
 *
 * Depends on:
 *   • STLViewer class  (js/stl-viewer.js)
 *   • marked library   (CDN, window.marked) for Markdown → HTML
 * ============================================================================
 */

/**
 * Builds a project card <article> element and initialises its 3D viewer.
 *
 * The card layout is:
 *   ┌─────────────────────────────┬──────────────────────────────────┐
 *   │  .project-header-section    │  .viewer-wrapper                 │
 *   │    section-label            │    <canvas>  ← Three.js viewport │
 *   │    h2.project-title         │    .viewer-controls-hint         │
 *   │    .project-year            └──────────────────────────────────┘
 *   │    .project-description
 *   │    .project-meta (GitHub btn)
 *   └──────────────────────────────
 *
 * @param {Object} project - A project entry from PROJECTS_REGISTRY.
 * @returns {HTMLElement} The fully constructed <article> element.
 */
function renderProjectCard(project) {

  // ── Outer article element ─────────────────────────────────────────────────
  const section = document.createElement('article');
  section.className = 'project-card';
  section.id = `project-${project.id}`;

  // ── Optional: GitHub button HTML ──────────────────────────────────────────
  // Only rendered when the project defines a githubUrl.
  const githubBtnHtml = project.githubUrl
    ? `
      <a href="${project.githubUrl}" target="_blank" class="github-btn">
        <svg viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        View on GitHub
      </a>
    `
    : '';  // Empty string hides the button completely

  // ── Optional: year badge HTML ─────────────────────────────────────────────
  const projectYearHtml = project.year
    ? `<div class="project-year">${project.year}</div>`
    : '';

  // ── Markdown → HTML conversion ────────────────────────────────────────────
  // Use marked.js if available (loaded from CDN). Falls back to a plain <p>
  // wrapping the raw string if the library somehow didn't load.
  const parsedDescriptionHtml = window.marked
    ? marked.parse(project.description || 'No description provided.')
    : `<p>${project.description || 'No description provided.'}</p>`;

  // ── Inject the full card HTML ─────────────────────────────────────────────
  section.innerHTML = `
    <!-- Left column: project metadata and description -->
    <div class="project-header-section">
      <div class="section-label">Project</div>
      <h2 class="project-title">${project.title || 'Untitled Project'}</h2>
      ${projectYearHtml}
      <div class="project-description">${parsedDescriptionHtml}</div>

      <div class="project-meta">
        ${githubBtnHtml}
      </div>
    </div>

    <!-- Right column: interactive 3D STL viewer -->
    <div class="viewer-wrapper">
      <canvas id="canvas-${project.id}" class="viewport-canvas"></canvas>

      <!-- Mouse / trackpad control hints shown at the bottom of the viewer -->
      <div class="viewer-controls-hint">
        <span class="control-item"><span class="key-badge">Left Click + Drag</span> Rotate</span>
        <span class="control-item"><span class="key-badge">Scroll Wheel</span> Zoom</span>
        <span class="control-item"><span class="key-badge">Right Click + Drag</span> Pan</span>
      </div>
    </div>
  `;

  // ── Initialise the Three.js viewer ────────────────────────────────────────
  // setTimeout(fn, 0) defers execution until after this element has been
  // inserted into the DOM by the caller, so clientWidth/clientHeight are valid.
  setTimeout(() => {
    const canvas  = document.getElementById(`canvas-${project.id}`);
    const wrapper = canvas ? canvas.parentElement : null;
    if (!canvas || !wrapper) return;

    const controlsHint = wrapper.querySelector('.viewer-controls-hint');

    // Height available for the canvas = wrapper height minus hint bar height
    const getViewportHeight = () => Math.max(
      1,
      wrapper.clientHeight - (controlsHint ? controlsHint.offsetHeight : 0)
    );

    // Create the viewer at the current container size
    const viewer = new STLViewer(canvas, wrapper.clientWidth, getViewportHeight());
    viewer.setColor(project.modelColor);  // Apply project-specific material colour

    // ── Responsive resize handling ─────────────────────────────────────────
    // ResizeObserver fires when the wrapper OR hint bar changes size
    // (e.g. on window resize or when the hint bar wraps to two lines).
    const resizeViewer = () => {
      viewer.resize(wrapper.clientWidth, getViewportHeight());
    };

    const resizeObserver = new ResizeObserver(resizeViewer);
    resizeObserver.observe(wrapper);                     // Watch wrapper size
    if (controlsHint) resizeObserver.observe(controlsHint); // Watch hint height

    // Also listen to window resize as a fallback for older browsers
    window.addEventListener('resize', resizeViewer);

    // ── Fetch and load the STL file ────────────────────────────────────────
    // Uses fetch() instead of the Three.js FileLoader so we get a real
    // Promise chain and can handle HTTP errors cleanly.
    if (project.stlUrl) {
      fetch(project.stlUrl)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();  // STLLoader expects a raw ArrayBuffer
        })
        .then(buffer => viewer.loadSTLBuffer(buffer))
        .catch(err => console.warn(`Could not load STL from "${project.stlUrl}":`, err));
    }
  }, 0);

  return section;
}
