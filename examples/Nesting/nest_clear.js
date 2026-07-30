// Theme: Nesting
// Example: Clear the batch

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
    batch_name: "nest_clear.3mf"
});

// Import and nest a part
amis.part_import({
    file_path: "../In/Letter_A.stl",
    part_number: "Letter_A"
});

amis.part_settings_save({
    part_number: "Letter_A",
    copies: 3
});

amis.nest_execute({
    stop_at_iteration: 100
});

// Clear unlocked parts from the build area (they become unplaced)
amis.nest_clear({});

// Save the batch
amis.batch_save_as({
    file_path: "../Out/nest_clear.3mf"
});

// Execute all queued commands
amis.execute();
