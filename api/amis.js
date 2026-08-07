const fs = require('node:fs');

module.exports = {
	initialize,
	execute,
	returnCurrentState,
	batch_create:function(){addline(arguments.callee.name,arguments[0]);},
	batch_open:function(){addline(arguments.callee.name,arguments[0]);},
	batch_recover:function(){addline(arguments.callee.name,arguments[0]);},
	batch_resize:function(){addline(arguments.callee.name,arguments[0]);},
	batch_save_as:function(){addline(arguments.callee.name,arguments[0]);},
	batch_settings_save:function(){addline(arguments.callee.name,arguments[0]);},
	batch_unplaced:function(){addline(arguments.callee.name,arguments[0]);},
	mesh_orient:function(){addline(arguments.callee.name,arguments[0]);},
	nest_box_parts:function(){addline(arguments.callee.name,arguments[0]);},
	nest_clear:function(){addline(arguments.callee.name,arguments[0]);},
	nest_delete_unplaced:function(){addline(arguments.callee.name,arguments[0]);},
	nest_execute:function(){addline(arguments.callee.name,arguments[0]);},
	nest_lock:function(){addline(arguments.callee.name,arguments[0]);},
	nest_settings_save:function(){addline(arguments.callee.name,arguments[0]);},
	nest_unlock:function(){addline(arguments.callee.name,arguments[0]);},
	part_center:function(){addline(arguments.callee.name,arguments[0]);},
	part_delete:function(){addline(arguments.callee.name,arguments[0]);},
	part_duplicate:function(){addline(arguments.callee.name,arguments[0]);},
	part_import:function(){addline(arguments.callee.name,arguments[0]);},
	part_priority:function(){addline(arguments.callee.name,arguments[0]);},
	part_settings_save:function(){addline(arguments.callee.name,arguments[0]);},
	part_shelling_execute:function(){addline(arguments.callee.name,arguments[0]);},
	part_show_log:function(){addline(arguments.callee.name,arguments[0]);},
	slicer_execute:function(){addline(arguments.callee.name,arguments[0]);},
	slicer_export_3mf:function(){addline(arguments.callee.name,arguments[0]);},
	slicer_export_stl:function(){addline(arguments.callee.name,arguments[0]);},
	slicer_parts_list:function(){addline(arguments.callee.name,arguments[0]);}
};

var amis_cmd='"/Applications/AMIS Pro.app/Contents/MacOS/AMIS Pro"';
var mList="";

function initialize(pApplicationPath)
{
	amis_cmd='"'+pApplicationPath+'"';
}

function execute()
{
	const fs = require('node:fs');
	const crypto = require('node:crypto');
	const recFile = 'execute_' + crypto.randomUUID() + '.rec';
	fs.writeFileSync(recFile, mList);	
	const command= amis_cmd+ ' replay ' + recFile;
	const execSync = require("child_process").execSync;
	const result = execSync(command);
	console.log(result.toString("utf8"));
	fs.unlinkSync(recFile);
	mList="";
}

function returnCurrentState() {
	if (!fs.existsSync("./tmp")) {
		fs.mkdirSync("./tmp");
	}
	addline("batch_save_as", {"file_path":"./tmp/__TempFile.3mf"});
	addline("slicer_parts_list", {"part_list_format":"json", "file_path":"./tmp/__TempJson.json", "part_list_unplaced": true, "part_list_batch": true});
	execute();

	const jsonData = fs.readFileSync("./tmp/__TempJson.json", "utf8");
	const parsedData = JSON.parse(jsonData);
	fs.unlinkSync("./tmp/__TempJson.json");

	// Open the tmp file, don't remove it yet, because the file is needed until the execute is called
	addline("batch_open", {"file_name":"./tmp/__TempFile.3mf"});
	return parsedData;
}

function addline(pFunction,pParameters)
{
	mList+='{ "function": "'+pFunction+'", "parameters": '+JSON.stringify(pParameters)+' }\n';
}

