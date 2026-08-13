#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { z } = require('zod');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

const amis = require('../api/amis.js');

const server = new McpServer({
	name: 'amis-runtime',
	version: '1.0.0'
});

function ok(text) {
	return { content: [{ type: 'text', text }] };
}

function fail(error) {
	const message = error instanceof Error ? error.message : String(error);
	return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
}

// Commands queue up in amis.js and are only sent to AMIS Pro when execute() (or
// returnCurrentState()) runs, so each "queue_" tool below just reports what was queued.
function registerQueuedTool(name, description, inputSchema) {
	server.registerTool(
		name,
		{ title: name, description, inputSchema },
		async (args) => {
			try {
				amis[name](args ?? {});
				return ok(`Queued "${name}" with parameters: ${JSON.stringify(args ?? {})}\nCall "execute" to run all queued commands, or "get_current_state" to run them and inspect the resulting batch.`);
			} catch (error) {
				return fail(error);
			}
		}
	);
}

server.registerTool(
	'initialize',
	{
		title: 'initialize',
		description: 'Set the path to the AMIS Pro application executable. Call this once before running other commands if AMIS Pro is not installed at the default macOS location.',
		inputSchema: {
			application_path: z.string().describe('Full path to the AMIS Pro executable, e.g. "/Applications/AMIS Pro.app/Contents/MacOS/AMIS Pro" or "C:\\\\Program Files\\\\AMIS Pro\\\\AMIS Pro.exe"')
		}
	},
	async ({ application_path }) => {
		try {
			amis.initialize(application_path);
			return ok(`Initialized AMIS Pro application path: ${application_path}`);
		} catch (error) {
			return fail(error);
		}
	}
);

server.registerTool(
	'set_working_directory',
	{
		title: 'set_working_directory',
		description: 'Change the working directory used for resolving relative file paths (part imports, exports, batch files) and for the temporary files AMIS Runtime creates while executing.',
		inputSchema: {
			directory: z.string().describe('Absolute or relative path to the directory to use as the working directory')
		}
	},
	async ({ directory }) => {
		try {
			const resolved = path.resolve(process.cwd(), directory);
			process.chdir(resolved);
			return ok(`Working directory set to: ${resolved}`);
		} catch (error) {
			return fail(error);
		}
	}
);

server.registerTool(
	'execute',
	{
		title: 'execute',
		description: 'Run all commands queued so far against AMIS Pro. Queued commands have no effect until this (or "get_current_state") is called.',
		inputSchema: {}
	},
	async () => {
		try {
			amis.execute();
			return ok('Executed all queued commands.');
		} catch (error) {
			return fail(error);
		}
	}
);

server.registerTool(
	'get_current_state',
	{
		title: 'get_current_state',
		description: 'Run all queued commands and return the current batch state (batch info and the full part list, including unplaced parts) as JSON. Useful for inspecting nesting density, part positions, etc. mid-script.',
		inputSchema: {}
	},
	async () => {
		try {
			const state = amis.returnCurrentState();
			return ok(JSON.stringify(state, null, 2));
		} catch (error) {
			return fail(error);
		}
	}
);

registerQueuedTool('batch_create', 'Create a new empty batch with specified dimensions and settings.', {
	batch_name: z.string().optional().describe('Name of the batch (default: empty)'),
	batch_width: z.number().optional().describe('Width of the batch in millimeters (default: 0.0)'),
	batch_depth: z.number().optional().describe('Depth of the batch in millimeters (default: 0.0)'),
	batch_height: z.number().optional().describe('Height of the batch in millimeters (default: 0.0)'),
	slice_resolution: z.number().optional().describe('Slice resolution in DPI (default: 300.0)'),
	slice_thickness: z.number().optional().describe('Slice thickness in millimeters (default: 0.1)')
});

registerQueuedTool('batch_open', 'Open a 3MF or CAMSPEC batch file into the current context.', {
	file_name: z.string().describe('Name of the file to open')
});

registerQueuedTool('batch_recover', 'Recover a batch that has partially failed during printing by removing all parts that are completely below a specified height.', {
	failure_height: z.number().optional().describe('The height in mm below which parts will be removed (default: 0.0)')
});

registerQueuedTool('batch_resize', 'Resize the current batch to match the dimensions of a different printer.', {
	batch_width: z.number().optional().describe('Width of the batch in millimeters (default: 0.0)'),
	batch_depth: z.number().optional().describe('Depth of the batch in millimeters (default: 0.0)'),
	batch_height: z.number().optional().describe('Height of the batch in millimeters (default: 0.0)')
});

registerQueuedTool('batch_save_as', 'Save the current batch to a 3MF file, overwriting any existing file.', {
	file_path: z.string().describe('The path to save the batch to')
});

registerQueuedTool('batch_settings_save', 'Save the output settings for this batch.', {
	slice_resolution: z.number().optional().describe('Slice resolution in DPI (default: 300.0)'),
	slice_thickness: z.number().optional().describe('Slice thickness in millimeters (default: 0.1)')
});

registerQueuedTool('batch_unplaced', 'Create a new batch containing all parts that are currently outside the build area. Unsaved changes to the current batch will be lost.', {
	name: z.string().optional().describe('The name of the new batch file (default: empty)')
});

registerQueuedTool('mesh_orient', 'Rotate the specified part so the volume of its axis aligned bounding box is as small as possible.', {
	part_number: z.string().describe('The part number of the part to orient')
});

registerQueuedTool('nest_box_parts', 'Create a sinterbox around the currently selected parts.', {
	part_numbers: z.array(z.string()).optional().describe('An array of part numbers to box (default: [])'),
	box_type: z.enum(['cube', 'free']).optional().describe('The type of box to create (default: "cube")'),
	box_calculation_method: z.enum(['auto', 'manual']).optional().describe('The method to use to calculate the box (default: "auto")'),
	beam_thickness: z.number().optional().describe('The thickness of the beams in mm when "manual" box calculation is selected (default: 1.5)'),
	max_hole_size: z.number().optional().describe('The maximum hole size in mm when "manual" box calculation is selected (default: 10.0)'),
	create_label: z.boolean().optional().describe('If true, a label will be created on the box (default: false)'),
	label_text: z.string().optional().describe('The text to use for the label on the box (default: "")')
});

registerQueuedTool('nest_clear', 'Remove all unlocked parts from the build area, allowing you to start a fresh nesting session.', {});

registerQueuedTool('nest_delete_unplaced', 'Delete all unplaced instances from the batch. Parts with no placed instances at all will be removed as well.', {});

registerQueuedTool('nest_execute', 'Arrange all parts inside the print box in an optimal way to minimize wasted space, taking part dimensions, gaps, and the print bed dimensions into account. Unplaced parts remain outside the buildbox.', {
	stop_at_iteration: z.number().int().optional().describe('The iteration at which to stop nesting, for resuming interrupted nestings (default: MAX_INT)'),
	time_out: z.number().optional().describe('The time-out after which we stop nesting, in seconds; 0 = no time-out (default: 0.0)')
});

registerQueuedTool('nest_lock', 'Lock the position of all parts currently placed inside the build box. Locked parts cannot be moved or modified and stay in place during subsequent nesting operations.', {});

registerQueuedTool('nest_settings_save', 'Store the settings to use for the nesting operation. Omitting a parameter leaves it unchanged.', {
	nest_gap: z.number().optional().describe('The gap between nested parts in mm (default: 4.0)'),
	box_gap: z.number().optional().describe('The gap between nested parts and the build box in mm (default: 2.0)'),
	nest_to_density_active: z.boolean().optional().describe('Enable nesting to density (default: false)'),
	nest_to_density: z.number().optional().describe('The target density to reach when nesting to density, in % (default: 11.0)'),
	nest_layer_density_active: z.boolean().optional().describe('Enable layer density control (default: false)'),
	nest_layer_density: z.number().optional().describe('The maximum layer density to allow, in % (default: 13.0)'),
	nest_height_limit: z.number().optional().describe('The maximum height to use for nesting; 0 = use entire buildbox (default: 0.0)'),
	nest_spread_parts: z.boolean().optional().describe('Enable spreading of parts in the build box to reduce density (default: false)')
});

registerQueuedTool('nest_unlock', 'Unlock all parts currently locked in position inside the build box, allowing them to be moved again during the next nesting operation.', {});

registerQueuedTool('part_center', 'Center the specified part in the active batch.', {
	part_number: z.string().describe('The part number of the part to center'),
	instance_idx: z.number().int().optional().describe('Zero-based index of the instance to center; if omitted, all instances will be centered')
});

registerQueuedTool('part_delete', 'Delete the specified part from the batch.', {
	part_number: z.string().describe('The part number of the part to delete'),
	instance_idx: z.number().int().optional().describe('Zero-based index of the instance to delete; if omitted, all instances will be deleted')
});

registerQueuedTool('part_duplicate', 'Create a copy of the selected part with the same transformation and properties. If new_part_number is already in use, the duplicate will fail for that part.', {
	part_number: z.string().describe('The part number of the part to duplicate'),
	new_part_number: z.string().optional().describe('The part number to assign to the duplicated part (optional, auto-assigned if omitted)')
});

registerQueuedTool('part_import', 'Import one or more parts into the current build area from STL, STEP or 3MF files. Imported parts are automatically repaired and prepared for nesting. If part_number is already in use, the import will fail for that part.', {
	file_path: z.string().describe('The file path of the part to import'),
	part_number: z.string().optional().describe('The part number to assign to the imported part (optional, auto-assigned if omitted)')
});

registerQueuedTool('part_priority', 'Set the nesting priority of the selected parts. Parts with a higher priority will be favored during the nesting process.', {
	priority_value: z.number().int().min(0).max(100).optional().describe('The priority value to set for the selected parts, 0-100 (default: 50)')
});

registerQueuedTool('part_settings_save', 'Save part settings such as rotation, scaling, copies, nesting behavior, and (optionally, via instance_idx) a specific instance\'s position and lock state. Optional values left out remain unchanged.', {
	part_number: z.string().describe('The part number of the part to modify'),
	rotation_x: z.number().optional().describe('The rotation around the X axis, in degrees (default: 0.0)'),
	rotation_y: z.number().optional().describe('The rotation around the Y axis, in degrees (default: 0.0)'),
	rotation_z: z.number().optional().describe('The rotation around the Z axis, in degrees (default: 0.0)'),
	scale_x: z.number().optional().describe('The scaling along the X axis, in percent (default: 100.0)'),
	scale_y: z.number().optional().describe('The scaling along the Y axis, in percent (default: 100.0)'),
	scale_z: z.number().optional().describe('The scaling along the Z axis, in percent (default: 100.0)'),
	copies: z.number().int().optional().describe('The number of copies to create for this part; reducing it may remove already-placed instances (default: 1)'),
	nest_gap: z.number().optional().describe('The gap to use when nesting this part (default: 4)'),
	allow_x_rotation: z.boolean().optional().describe('Allow rotation around the X axis when nesting (default: false)'),
	allow_y_rotation: z.boolean().optional().describe('Allow rotation around the Y axis when nesting (default: false)'),
	allow_z_rotation: z.boolean().optional().describe('Allow rotation around the Z axis when nesting (default: false)'),
	instance_idx: z.number().int().optional().describe('The index of the instance to modify (default: 0)'),
	instance_x: z.number().optional().describe('The X position of the instance to modify (ignored if instance_idx not provided)'),
	instance_y: z.number().optional().describe('The Y position of the instance to modify (ignored if instance_idx not provided)'),
	instance_z: z.number().optional().describe('The Z position of the instance to modify (ignored if instance_idx not provided)'),
	lock_position: z.boolean().optional().describe('Lock the position of the instance to modify (ignored if instance_idx not provided) (default: false)')
});

registerQueuedTool('part_shelling_execute', 'Create a shell around the selected part, with an optional internal lattice structure for added strength.', {
	part_number: z.string().describe('The part number of the part to shell'),
	create_shell: z.boolean().optional().describe('Whether to create a shell around the part; if false, an existing shell will be removed (default: false)'),
	shell_thickness: z.number().optional().describe('The thickness of the shell in mm (default: 4.0)'),
	create_lattice: z.boolean().optional().describe('Whether to create a lattice structure inside the shell (default: false)'),
	lattice_beam_length: z.number().optional().describe('The length of the lattice beams in mm (default: 8.0)'),
	lattice_beam_thickness: z.number().optional().describe('The thickness of the lattice beams in mm (default: 2.0)')
});

registerQueuedTool('part_show_log', 'Show the healer log entries for all meshes in the specified part.', {
	part_number: z.string().describe('The part number of the part whose mesh log to display')
});

registerQueuedTool('slicer_execute', 'Slice the current batch. Resolution and slice thickness are taken from the batch settings. Depending on output_type, output_location must be a folder (tiff) or a file path (svg, cli, sli, 3mf).', {
	output_type: z.enum(['tiff', 'svg', 'cli', 'sli', '3mf']).optional().describe('Type of output to generate (default: "tiff")'),
	output_location: z.string().describe('The output location for the sliced files (folder for tiff, filepath for others)')
});

registerQueuedTool('slicer_export_3mf', 'Export the current batch as a 3MF file for use in other slicing applications. Parts outside the batch are not saved and metadata is stripped.', {
	'3mf_file': z.string().describe('The path to the 3MF file to export to'),
	hp_format: z.boolean().optional().describe('Set to true to export this file in the HP3MF format (default: false)')
});

registerQueuedTool('slicer_export_stl', 'Export the complete batch as a single STL file for use in other slicing applications.', {
	stl_file: z.string().describe('The path to the STL file to export to')
});

registerQueuedTool('slicer_parts_list', 'Export a file containing the list of parts in the current batch along with their dimensions and volumes.', {
	file_path: z.string().describe('The filepath to export the parts list to'),
	part_list_format: z.enum(['csv', 'html', 'json']).describe('The format to use for the parts list'),
	part_list_unplaced: z.boolean().optional().describe('Whether to include unplaced parts in the parts list (json format only) (default: false)'),
	part_list_batch: z.boolean().optional().describe('Whether to include batch information in the parts list (json format only) (default: false)'),
	part_list_density: z.boolean().optional().describe('Whether to include density information in the parts list (only if batch info is requested; slower) (default: false)')
});

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((error) => {
	console.error('Fatal error starting AMIS Runtime MCP server:', error);
	process.exit(1);
});
