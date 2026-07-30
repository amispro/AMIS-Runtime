// Theme: Output
// Example: Export HTML parts list

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
    batch_name: "export_html_parts_list.3mf"
});

// Import parts
amis.part_import({
    file_path: "../In/Letter_A.stl",
    part_number: "Letter_A"
});

amis.part_import({
    file_path: "../In/Letter_B.stl",
    part_number: "Letter_B"
});

// Nest so the parts list reflects a placed batch
amis.nest_execute({
    stop_at_iteration: 100
});

// Export an HTML parts list
amis.slicer_parts_list({
    file_path: "../Out/export_html_parts_list.html",
    part_list_format: "html"
});

// Execute all queued commands
amis.execute();
