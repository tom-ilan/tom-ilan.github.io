/**
 * ============================================================================
 * projects-data.js - Project Configuration Registry
 * ============================================================================
 * Add, edit, or remove project objects in the `PROJECTS_REGISTRY` array below.
 * 
 * Each project object must follow this structure:
 * {
 *   id: "unique-project-id",          // String: Unique identifier for DOM elements
 *   title: "Project Title",           // String: Name/title of your project
 *   year: "2025",                     // String or number (Optional): Year the project was made
 *   description: "Project summary..", // String: Detailed project description
 *   githubUrl: "https://...",        // String: Link to your GitHub repository/article
 *   stlUrl: "path/to/model.stl",      // String (Optional): URL or relative path to a default .stl file
 *   modelColor: "#0ea5e9",            // String (Optional): Hex colour for the 3D model
 * }
 */

const PROJECTS_REGISTRY = [
  /* 
   * EXAMPLE / TEMPLATE PROJECT
   * Fill out the fields below or copy-paste this block to add a new project.
   * Use \n for newlines in the description to write multi-line Markdown.
   */
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
    stlUrl: "models/disk_v3_3_2_1 copy.stl", // Optional: path to an .stl file (e.g., "models/part.stl")
    modelColor: "#1e1e1e"
  },
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
    stlUrl: "models/Robotic_arm_final_1 copy.stl", // Add a path to an STL file if available, e.g. "models/arm.stl"
    modelColor: "#1e1e1e"
  }
];
