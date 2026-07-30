// Theme: Parts
// Example: Rotate a part (X / Y / Z)

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
    batch_name: "rotate_part.3mf"
});

// Import a single STL
amis.part_import({
    file_path: "../In/Letter_A.stl",
    part_number: "Letter_A"
});

// Rotate the part around X, Y, and Z (degrees)
amis.part_settings_save({
    part_number: "Letter_A",
    rotation_x: 45.0,
    rotation_y: 30.0,
    rotation_z: 90.0
});

// Save the batch
amis.batch_save_as({
    file_path: "../Out/rotate_part.3mf"
});

// Execute all queued commands
amis.execute();
