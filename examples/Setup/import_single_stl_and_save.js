// Theme: Setup
// Example: Import a single STL and save

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
    batch_name: "import_single_stl.3mf"
});

// Import a single STL
amis.part_import({
    file_path: "../In/Letter_A.stl",
    part_number: "Letter_A"
});

// Save the batch
amis.batch_save_as({
    file_path: "../Out/import_single_stl.3mf"
});

// Execute all queued commands
amis.execute();
