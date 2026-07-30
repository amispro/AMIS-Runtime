// Theme: Nesting
// Example: Nest a boxed part

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
    batch_name: "nest_box_parts.3mf"
});

// Import a single STL
amis.part_import({
    file_path: "../In/Letter_A.stl",
    part_number: "Letter_A"
});

// Create a sinterbox around the part
amis.nest_box_parts({
    part_numbers: ["Letter_A"],
    box_type: "cube"
});

// Nest the boxed part
amis.nest_execute({
    stop_at_iteration: 100
});

// Save the batch
amis.batch_save_as({
    file_path: "../Out/nest_box_parts.3mf"
});

// Execute all queued commands
amis.execute();
