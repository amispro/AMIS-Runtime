// Theme: Nesting
// Example: Nest with a prioritized part

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
    batch_name: "nest_with_priority.3mf"
});

// Import two parts
amis.part_import({
    file_path: "../In/Letter_A.stl",
    part_number: "Letter_A"
});

amis.part_import({
    file_path: "../In/Letter_B.stl",
    part_number: "Letter_B"
});

// Favor Letter_A during nesting (priority 0-100)
amis.part_priority({
    part_number: "Letter_A",
    priority_value: 100
});

amis.part_priority({
    part_number: "Letter_B",
    priority_value: 0
});

amis.nest_execute({
    stop_at_iteration: 100
});

// Save the batch
amis.batch_save_as({
    file_path: "../Out/nest_with_priority.3mf"
});

// Execute all queued commands
amis.execute();
