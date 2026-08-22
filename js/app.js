/**
 * ============================================================================
 * js/app.js — Application Entrypoint
 * ============================================================================
 * The main bootstrap file. Runs after the DOM is fully parsed, reads the
 * project list from PROJECTS_REGISTRY (js/projects-data.js), and calls
 * renderProjectCard() (js/renderer.js) for each entry.
 *
 * Script load order in index.html matters:
 *   1. projects-data.js  — defines PROJECTS_REGISTRY
 *   2. stl-viewer.js     — defines STLViewer class
 *   3. renderer.js       — defines renderProjectCard()
 *   4. app.js            — this file, consumes all of the above
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // Target container where project cards will be appended
  const projectsContainer = document.getElementById('projects-container');

  // Guard: show a friendly message if the registry is empty or missing
  if (!PROJECTS_REGISTRY || PROJECTS_REGISTRY.length === 0) {
    projectsContainer.innerHTML = `
      <p class="project-description" style="padding: 32px;">
        <i>No projects found in js/projects-data.js. Add your project objects to showcase them!</i>
      </p>`;
    return;
  }

  // Render each project in the order they appear in PROJECTS_REGISTRY
  PROJECTS_REGISTRY.forEach((project) => {
    const cardElement = renderProjectCard(project); // Defined in js/renderer.js
    projectsContainer.appendChild(cardElement);
  });

});
