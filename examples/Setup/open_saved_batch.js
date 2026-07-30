// Theme: Setup
// Example: Open a saved batch

const amis = require('../../api/amis.js');
const fs = require('fs');

// Ensure output directory exists
if (!fs.existsSync("../Out")) {
    fs.mkdirSync("../Out");
}

// Initialize AMIS Pro
amis.initialize("/Applications/AMIS Pro.app/Contents/MacOS/AMIS Pro");
// amis.initialize("C:\\Program Files\\AMIS Pro\\AMIS Pro.exe");

// Open an existing 3MF batch
amis.batch_open({
    file_name: "../In/shelled_Practice1.3mf"
});

// Save the opened batch under a new name
amis.batch_save_as({
    file_path: "../Out/open_saved_batch.3mf"
});

// Execute all queued commands
amis.execute();
