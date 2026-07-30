// Theme: Parts
// Example: Reset rotation

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
    batch_name: "reset_rotation.3mf"
});

// Import a single STL
amis.part_import({
    file_path: "../In/Letter_A.stl",
    part_number: "Letter_A"
});

// Apply a rotation first
amis.part_settings_save({
    part_number: "Letter_A",
    rotation_x: 45.0,
    rotation_y: 30.0,
    rotation_z: 90.0
});

// Reset rotation back to zero on all axes
amis.part_settings_save({
    part_number: "Letter_A",
    rotation_x: 0.0,
    rotation_y: 0.0,
    rotation_z: 0.0
});

// Save the batch
amis.batch_save_as({
    file_path: "../Out/reset_rotation.3mf"
});

// Execute all queued commands
amis.execute();
