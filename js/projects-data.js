/**
 * ============================================================================
 * js/projects-data.js — Project Registry
 * ============================================================================
 * This is the only file you need to edit to add or update projects.
 *
 * Each object in PROJECTS_REGISTRY becomes one scrollable project card
 * on the page, rendered by js/renderer.js.
 *
 * Project object schema:
 * ─────────────────────────────────────────────────────────────────────────
 *   id          {string}  — Unique slug used for DOM element IDs.
 *                           Use lowercase-with-hyphens, e.g. "my-project".
 *
 *   title       {string}  — Display name shown as the card heading.
 *
 *   year        {string}  — (Optional) Year shown below the title in
 *                           monospace. E.g. "2026".
 *
 *   description {string}  — Markdown-formatted project write-up. Rendered
 *                           by marked.js, so ## headings, **bold**,
 *                           bullet lists, and `code` all work.
 *
 *   githubUrl   {string}  — (Optional) Full URL to the GitHub repo.
 *                           Omit this key to hide the GitHub button.
 *
 *   stlUrl      {string}  — (Optional) Relative path to a .stl file that
 *                           will be loaded into the Three.js viewer.
 *                           Omit to display an empty viewport.
 *
 *   modelColor  {string}  — (Optional) Hex colour applied to the 3D model
 *                           material. Defaults to the STLViewer's built-in
 *                           dark slate if omitted.
 * ─────────────────────────────────────────────────────────────────────────
 */

const PROJECTS_REGISTRY = [

  /* ── Cycloidal Gearbox ─────────────────────────────────────────────────── */
  {
    id: "cycloidal-gearbox",
    title: "A 3D Printed Cycloidal Gearbox",
    year: "2026",
    description: `
This is my cycloidal gearbox I built, and the python script I created to generate it! A cycloidal gearbox is a type of gearbox that allows you to turn rotational speed into torque.

## Design Process

### Version 1

This gearbox was a handcranked gearbox specifically meant to test the validity of the python cycloidal generator. It had a gear ratio of 1:9.

### Version 2

This design was a micro cycloidal gearbox with a ratio of 1:9, meant to only take up the same footprint as a NEMA 17. Due to the tight tolerances needed for a small cycloidal drive and the lack of precision offered by 3D printing, this design did not work.

### Version 3

This gearbox was the first working version to run on a NEMA 17. It has a larger footprint compared to Version 2 allowing greater tolerances and a fully functional design.`,
    githubUrl: "https://github.com/tom-ilan/cycloidal_gearbox",
    stlUrl: "models/disk_v3_3_2_1 copy.stl",
    modelColor: "#1e1e1e",
  },

  /* ── 3-Axis Robotic Arm ─────────────────────────────────────────────────── */
  {
    id: "robotic-arm",
    title: "3-Axis Robotic Arm",
    year: "2026",
    description: `
A fully 3D-printable 3-axis robotic arm designed in **Fusion 360**, controlled via **Arduino**, and programmed in **Python**.

## Design

The arm was designed to be fully printable with no support structures required. Each joint uses servo motors with a custom bracket system allowing smooth, repeatable motion across all 3 axes.
`,
    githubUrl: "https://github.com/tom-ilan/robotic_arm",
    stlUrl: "models/Robotic_arm_final_1 copy.stl",
    modelColor: "#1e1e1e",
  },

];
