// Theme: Setup
// Example: Import a 3MF and save

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
    batch_name: "import_3mf.3mf"
});

// Import a single 3MF
amis.part_import({
    file_path: "../In/shelled_Practice1.3mf",
    part_number: "Practice_1"
});

// Save the batch
amis.batch_save_as({
    file_path: "../Out/import_3mf.3mf"
});

// Execute all queued commands
amis.execute();
