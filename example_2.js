var amis=require('./api/amis.js');
var fs=require('fs');

var input_list=[
	{
		part_number: "Part_A",
		file_path:"In/brakedisk.stl",
		shell: true
	},
	{
		part_number: "Part_B",
		file_path:"In/caliper.stl",
		shell: false
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
	if (element.shell) amis.part_shelling_execute({"part_number":element.part_number,"create_shell":true});
});

amis.nest_execute({"stop_at_iteration":1000});
amis.batch_save_as({"file_path":"Out/example_output_2.3mf"});

amis.execute();

