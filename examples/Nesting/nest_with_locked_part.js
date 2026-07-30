// Theme: Nesting
// Example: Nest with a locked part

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
    batch_name: "nest_with_locked_part.3mf"
});

// Import and place the first part
amis.part_import({
    file_path: "../In/Letter_A.stl",
    part_number: "Letter_A"
});

amis.part_center({
    part_number: "Letter_A"
});

// Lock all currently placed parts so nesting will not move them
amis.nest_lock({});

// Import more parts and nest around the locked part
amis.part_import({
    file_path: "../In/Letter_B.stl",
    part_number: "Letter_B"
});

amis.part_settings_save({
    part_number: "Letter_B",
    copies: 5
});

amis.nest_execute({
    stop_at_iteration: 100
});

// Save the batch
amis.batch_save_as({
    file_path: "../Out/nest_with_locked_part.3mf"
});

// Execute all queued commands
amis.execute();
