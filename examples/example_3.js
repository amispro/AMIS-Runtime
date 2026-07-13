var amis=require('../api/amis.js');
var fs=require('fs');

var input_list=[
	{
		part_number: "Part_A",
		file_path:"In/brakedisk.stl",
		copies:1
	},
	{
		part_number: "Part_B",
		file_path:"In/caliper.stl",
		allow_z_rotation:true,
		rotation_x:45,
		copies:20
	}
];

if (!fs.existsSync("./Out")){
	fs.mkdirSync("./Out");
}

amis.initialize("/Applications/AMIS Pro.app/Contents/MacOS/AMIS Pro");
// amis.initialize("C:\\Program Files\\AMIS Pro\\AMIS Pro.exe");

amis.batch_create({"batch_depth":284.0,"batch_height":380.0,"batch_name":"test_batch.3mf","batch_width":380.0});

input_list.forEach(element => {
	amis.part_import({"file_path":element.file_path, "part_number":element.part_number});
	amis.part_settings_save(element);
});

// Get current state of the batch
var currentState = amis.returnCurrentState();

// Loop over the unplaced parts and remember the part with the biggest box_area
var biggestPart = null;
Object.values(currentState.unplaced_parts).forEach(part => {
	if (biggestPart === null || part.box_area > biggestPart.box_area) {
		biggestPart = part;
	}
});

// If we found a biggest part, center it and lock its position
if (biggestPart !== null) {
	amis.part_center({"part_number": biggestPart.part_number});
	amis.part_settings_save({"part_number": biggestPart.part_number, "instance_idx": 0, "lock_position": true});
}

amis.nest_execute({"stop_at_iteration":100});
amis.batch_save_as({"file_path":"Out/example_output_1.3mf"});

amis.execute();