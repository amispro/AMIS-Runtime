// Theme: Output
// Example: Export as STL

const amis = require('../../api/amis.js');
const fs = require('fs');

// Ensure output directory exists
if (!fs.existsSync("../Out")) {
    fs.mkdirSync("../Out");
}

// Initialize AMIS Pro
amis.initialize("/Applications/AMIS Pro.app/Contents/MacOS/AMIS Pro");
// amis.initialize("C:\\Program Files\\AMIS Pro\\AMIS Pro.exe");

// Create a new empty batch
amis.batch_create({
    batch_width: 380.0,
    batch_depth: 284.0,
    batch_height: 380.0,
    batch_name: "export_stl.3mf"
});

// Import a STEP file
amis.part_import({
    file_path: "../In/wire_clip.step",
    part_number: "Wire_Clip"
});

// Nest so the part is inside the build volume before export
amis.nest_execute({
    stop_at_iteration: 100
});

// Export the batch as a single STL
amis.slicer_export_stl({
    stl_file: "../Out/export_stl.stl"
});

// Execute all queued commands
amis.execute();
