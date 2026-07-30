var amis=require('../api/amis.js');
var fs=require('fs');

var input_list=[
	{
		part_number: "Part_A",
		file_path:"In/brakedisk.stl",
		copies:45
	},
	{
		part_number: "Part_B",
		file_path:"In/caliper.stl",
		allow_z_rotation:true,
		rotation_x:45,
		copies:60
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

amis.nest_execute({"stop_at_iteration":100});
parts = amis.returnCurrentState();

if (parts["batch"]["nesting_density"] > 0.15) {
	// Our nesting is very dense, let's increase the gap and try again
	console.log("Nesting density too high: " + parts["batch"]["nesting_density"] + ", re-nesting with larger gap.");

	amis.nest_settings_save({"nest_gap":6.0});
	amis.nest_execute({"stop_at_iteration":200});
	amis.batch_save_as({"file_path":"Out/example_output_2.3mf"});
	parts = amis.returnCurrentState();
	console.log("New nesting density: " + parts["batch"]["nesting_density"]);
} else {
	console.log("Nesting density is acceptable: " + parts["batch"]["nesting_density"]);
}

// Only needed when this script runs alone; skip if it's part of a larger script sequence
amis.execute();
	
