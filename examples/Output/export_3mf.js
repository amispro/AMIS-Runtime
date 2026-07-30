// Theme: Output
// Example: Export as 3MF

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
    batch_name: "export_3mf.3mf"
});

// Import a single STL
amis.part_import({
    file_path: "../In/Letter_A.stl",
    part_number: "Letter_A"
});

// Nest so the part is inside the build volume before export
amis.nest_execute({
    stop_at_iteration: 100
});

// Export placed parts as a 3MF (no unplaced parts, metadata stripped)
amis.slicer_export_3mf({
    "3mf_file": "../Out/export_3mf.3mf"
});

// Execute all queued commands
amis.execute();
