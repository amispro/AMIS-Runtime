// Theme: Nesting
// Example: Nest with increased wall distance

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
    batch_name: "nest_with_wall_distance.3mf"
});

// Import a part with several copies
amis.part_import({
    file_path: "../In/Letter_A.stl",
    part_number: "Letter_A"
});

amis.part_settings_save({
    part_number: "Letter_A",
    copies: 5
});

// Increase the gap between parts and the build box wall
amis.nest_settings_save({
    box_gap: 4.0
});

// Nest with the updated wall distance
amis.nest_execute({
    stop_at_iteration: 100
});

// Save the batch
amis.batch_save_as({
    file_path: "../Out/nest_with_wall_distance.3mf"
});

// Execute all queued commands
amis.execute();
