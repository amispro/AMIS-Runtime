const amis = require('../api/amis.js');
const fs = require('fs');

// Ensure output directory exists
if (!fs.existsSync("./Out")) {
    fs.mkdirSync("./Out");
}

// Initialize AMIS Pro
amis.initialize("/Applications/AMIS Pro.app/Contents/MacOS/AMIS Pro");

// Create a new batch
amis.batch_create({
    batch_width: 380.0,
    batch_depth: 284.0,
    batch_height: 380.0,
    batch_name: "my_batch.3mf"
});

// Import a part
amis.part_import({
    file_path: "In/brakedisk.stl",
    part_number: "Part_001"
});

// Save the batch
amis.batch_save_as({
    file_path: "Out/output.3mf"
});

// Execute all commands
amis.execute();