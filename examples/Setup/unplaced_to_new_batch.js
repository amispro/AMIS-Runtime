// Theme: Setup
// Example: Move unplaced parts into a new batch

const amis = require('../../api/amis.js');
const fs = require('fs');

// Ensure output directory exists
if (!fs.existsSync("../Out")) {
    fs.mkdirSync("../Out");
}

// Initialize AMIS Pro
amis.initialize("/Applications/AMIS Pro.app/Contents/MacOS/AMIS Pro");
// amis.initialize("C:\\Program Files\\AMIS Pro\\AMIS Pro.exe");

// Create a small batch so not every copy will fit
amis.batch_create({
    batch_width: 55.0,
    batch_depth: 55.0,
    batch_height: 25.0,
    batch_name: "unplaced_source.3mf"
});

// Import a part and request two copies
amis.part_import({
    file_path: "../In/Letter_A.stl",
    part_number: "Letter_A"
});

amis.part_settings_save({
    part_number: "Letter_A",
    copies: 2
});

// Nest — one copy should place, one should remain unplaced
amis.nest_execute({
    stop_at_iteration: 100
});

// Move all unplaced parts into a new batch
amis.batch_unplaced({
    name: "unplaced_parts.3mf"
});

// Save the new batch that holds the unplaced parts
amis.batch_save_as({
    file_path: "../Out/unplaced_to_new_batch.3mf"
});

// Execute all queued commands
amis.execute();
