/**
 * ============================================================================
 * app.js - Main Application Entrypoint
 * ============================================================================
 * Reads project definitions from `projects-data.js` and dynamically builds
 * vertical cards with title/description above a 50vh Three.js STL viewer.
 */

document.addEventListener('DOMContentLoaded', () => {
  const projectsContainer = document.getElementById('projects-container');

  if (!PROJECTS_REGISTRY || PROJECTS_REGISTRY.length === 0) {
    projectsContainer.innerHTML = '<p class="project-description" style="padding: 32px;"><i>No projects found in projects-data.js. Add your project objects to showcase them!</i></p>';
    return;
  }

  // Render each project defined in projects-data.js
  PROJECTS_REGISTRY.forEach((project) => {
    const projectElement = renderProjectCard(project);
    projectsContainer.appendChild(projectElement);
  });
});

/**
 * Creates and mounts a project section for a given project object.
 * 
 * @param {Object} project - The project definition object from PROJECTS_REGISTRY
 * @returns {HTMLElement} The created DOM element for the project
 */
function renderProjectCard(project) {
  const section = document.createElement('article');
  section.className = 'project-card';
  section.id = `project-${project.id}`;

  const githubBtnHtml = project.githubUrl 
    ? `
      <a href="${project.githubUrl}" target="_blank" class="github-btn">
        <svg viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        View on GitHub
      </a>
    `
    : ``;

  const projectYearHtml = project.year
    ? `<div class="project-year">${project.year}</div>`
    : ``;

  const parsedDescriptionHtml = window.marked 
    ? marked.parse(project.description || 'No description provided.')
    : `<p>${project.description || 'No description provided.'}</p>`;

  section.innerHTML = `
    <!-- Top Header Details (Title & Description Above STL) -->
      <div class="project-header-section">
      <div class="section-label">Project</div>
      <h2 class="project-title">${project.title || 'Untitled Project'}</h2>
      ${projectYearHtml}
      <div class="project-description">${parsedDescriptionHtml}</div>
      
      <div class="project-meta">
        ${githubBtnHtml}
      </div>
    </div>

    <!-- Bottom 3D Viewport Area (50vh Height) -->
    <div class="viewer-wrapper">
      <canvas id="canvas-${project.id}" class="viewport-canvas"></canvas>
      
      <div class="viewer-controls-hint">
        <span class="control-item"><span class="key-badge">Left Click + Drag</span> Rotate</span>
        <span class="control-item"><span class="key-badge">Scroll Wheel</span> Zoom</span>
        <span class="control-item"><span class="key-badge">Right Click + Drag</span> Pan</span>
      </div>
    </div>
  `;

  // Initialize the WebGL 3D STL Viewer for this project canvas
  setTimeout(() => {
    const canvas = document.getElementById(`canvas-${project.id}`);
    const wrapper = canvas ? canvas.parentElement : null;
    if (!canvas || !wrapper) return;

    const controlsHint = wrapper.querySelector('.viewer-controls-hint');
    const getViewportHeight = () => Math.max(
      1,
      wrapper.clientHeight - (controlsHint ? controlsHint.offsetHeight : 0)
    );
    const viewer = new STLViewer(canvas, wrapper.clientWidth, getViewportHeight());
    viewer.setColor(project.modelColor);

    // Keep the canvas sized to the remaining space when the responsive
    // controls panel changes between one and two lines.
    const resizeViewer = () => {
      viewer.resize(wrapper.clientWidth, getViewportHeight());
    };
    const resizeObserver = new ResizeObserver(resizeViewer);
    resizeObserver.observe(wrapper);
    if (controlsHint) resizeObserver.observe(controlsHint);
    window.addEventListener('resize', resizeViewer);

    // Fetch and render the STL file specified in projects-data.js
    if (project.stlUrl) {
      fetch(project.stlUrl)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then(buffer => viewer.loadSTLBuffer(buffer))
        .catch(err => console.warn(`Could not load STL from ${project.stlUrl}:`, err));
    }
  }, 0);

  return section;
}
