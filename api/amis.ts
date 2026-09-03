import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";

export enum DefaultPaths {
    MAC = "/Applications/AMIS Pro.app/Contents/MacOS/AMIS Pro",
    WINDOWS = "C:\\Program Files\\AMIS Pro\\AMIS Pro.exe"
}

export class Amis {
    constructor(
        private amisPath: string = DefaultPaths.MAC,
        private commands: string[] = [],
    ) { }

    /** Takes list of commands and executes them. */
    public execute() {
        const recFile = `execute_${randomUUID()}.rec`;
        let writeData = this.commands.join("");
        writeFileSync(recFile, writeData);

        const command = `"${this.amisPath}" replay ${recFile}`;
        const result = execSync(command);
        console.log(result.toString("utf8"));

        unlinkSync(recFile);
        this.commands = [];
    }

    public returnCurrentState() {
        if (!existsSync("./tmp")) {
            mkdirSync("./tmp");
        }

        const tempJsonFilePath = "./tmp/__TempJson.json";
        const temp3mfFilePath = "./tmp/__TempFile.3mf";

        this.batch_save_as({ file_path: temp3mfFilePath });
        this.slicer_parts_list({ part_list_format: PartFileFormat.JSON, file_path: tempJsonFilePath, part_list_unplaced: true, part_list_batch: true });
        this.execute();

        const jsonData = readFileSync(tempJsonFilePath, "utf8");
        const parsedData = JSON.parse(jsonData);
        unlinkSync(tempJsonFilePath);

        //Open the tmp file, don't remove it yet, because the file is needed until the execute is called.
        this.batch_open({ file_name: temp3mfFilePath });
        return parsedData;
    }

    private addCommand<T extends object>(functionName: string, parameters?: T) {
        this.commands.push(JSON.stringify({ function: functionName, parameters: parameters ?? {} }) + "\n");
    }

    public batch_create = (params: BatchCreateParams): void => this.addCommand('batch_create', params);
    public batch_open = (params: BatchOpenParams): void => this.addCommand('batch_open', params);
    public batch_recover = (params: BatchRecoverParams): void => this.addCommand('batch_recover', params);
    public batch_resize = (params?: BatchResizeParams): void => this.addCommand('batch_resize', params);
    public batch_save_as = (params: BatchSaveAsParams): void => this.addCommand('batch_save_as', params);
    public batch_settings_save = (params?: BatchSettingsSaveParams): void => this.addCommand('batch_settings_save', params);
    public batch_unplaced = (params?: BatchUnplacedParams): void => this.addCommand('batch_unplaced', params);
    public mesh_orient = (params: MeshOrientParams): void => this.addCommand('mesh_orient', params);
    public nest_box_parts = (params?: NestBoxPartsParams): void => this.addCommand('nest_box_parts', params);
    public nest_clear = (): void => this.addCommand('nest_clear');
    public nest_delete_unplaced = (): void => this.addCommand('nest_delete_unplaced');
    public nest_execute = (params?: NestExecuteParams): void => this.addCommand('nest_execute', params);
    public nest_lock = (): void => this.addCommand('nest_lock');
    public nest_settings_save = (params?: NestSettingsSaveParams): void => this.addCommand('nest_settings_save', params);
    public nest_unlock = (): void => this.addCommand('nest_unlock');
    public part_center = (params: PartCenterParams): void => this.addCommand('part_center', params);
    public part_delete = (params: PartDeleteParams): void => this.addCommand('part_delete', params);
    public part_duplicate = (params: PartDuplicateParams): void => this.addCommand('part_duplicate', params);
    public part_import = (params: PartImportParams): void => this.addCommand('part_import', params);
    public part_priority = (params?: PartPriorityParams): void => this.addCommand('part_priority', params);
    public part_settings_save = (params: PartSettingsSaveParams): void => this.addCommand('part_settings_save', params);
    public part_shelling_execute = (params: PartShellingExecuteParams): void => this.addCommand('part_shelling_execute', params);
    public part_show_log = (params: PartShowLogParams): void => this.addCommand('part_show_log', params);
    public slicer_execute = (params: SlicerExecuteParams): void => this.addCommand('slicer_execute', params);
    public slicer_export_3mf = (params: SlicerExport3mfParams): void => this.addCommand('slicer_export_3mf', params);
    public slicer_export_stl = (params: SlicerExportStlParams): void => this.addCommand('slicer_export_stl', params);
    public slicer_parts_list = (params: SlicerPartsListParams): void => this.addCommand('slicer_parts_list', params);
}

/** Create a new empty batch with specified dimensions and settings. */
export interface BatchCreateParams {
    /** Name of batch */
    batch_name?: string,
    /** Width of the batch in millimeters */
    batch_width?: number,
    /** Depth of the batch in millimeters */
    batch_depth?: number,
    /** Height of the batch in millimeters */
    batch_height?: number,
    /** Slice resolution in DPI */
    slice_resolution?: number,
    /** Slice thickness in millimeters */
    slice_thickness?: number
}

/** Open a 3MF or CAMSPEC batch file into the current context. */
export interface BatchOpenParams {
    /** Name of the file to open */
    file_name: string
}

/** This action allows you to recover a batch that has partially failed during printing by removing all parts that are completely below a specified height. */
export interface BatchRecoverParams {
    /** The height in mm below which parts will be removed */
    failure_height: number,
}

/** Resize the current batch to match the dimensions of a different printer. */
export interface BatchResizeParams {
    /** Width of the batch in millimeters */
    batch_width?: number,
    /** Depth of the batch in millimeters */
    batch_depth?: number,
    /** Height of the batch in millimeters */
    batch_height?: number,
}

/** Save the current batch to a 3MF file. The function will overwrite any existing file. */
export interface BatchSaveAsParams {
    /** The path to save the batch to */
    file_path: string
}

/** Save the output settings for this batch. */
export interface BatchSettingsSaveParams {
    /** Slice resolution in DPI */
    slice_resolution?: number,
    /** Slice thickness in millimeters */
    slice_thickness?: number
}

/** This action creates a new batch containing all parts that are currently outside the build area. Unsaved changes to the current batch will be lost. */
export interface BatchUnplacedParams {
    /** The name of the new batch file */
    name?: string
}

/** Rotate the specified part so the volume of its axis aligned bounding box is as small as possible. */
export interface MeshOrientParams {
    /** The part number of the part to orient. */
    part_number: string
}

export enum BoxType {
    CUBE = 'cube',
    FREE = 'free'
}

export enum CalculationMethod {
    AUTO = 'auto',
    MANUAL = 'manual'
}
/** This function will create a sinterbox around the currently selected parts. */
export interface NestBoxPartsParams {
    /** An array of part numbers to box */
    part_numbers?: string[],
    /** The type of box to create, either 'cube' or 'free' */
    box_type?: BoxType,
    /** The method to use to calculate the box, either 'auto' or 'manual' */
    box_calculation_method?: CalculationMethod,
    /** The thickness of the beams in mm to use when 'manual' box calculation is selected */
    beam_thickness?: number,
    /** The maximum hole size in mm to use when 'manual' box calculation is selected */
    max_hole_size?: number,
    /** If true, a label will be created on the box */
    create_label?: boolean,
    /** The text to use for the label on the box */
    label_text?: string
}

/** This action will arrange all parts inside the print box in an optimal way to minimize wasted space. */
export interface NestExecuteParams {
    /** The iteration at which to stop nesting (for resuming interrupted nestings) */
    stop_at_iteration?: number,
    /** The time-out after which we stop nesting (in seconds, 0 = no time-out) */
    time_out?: number
}

/** Store the settings to use for the nesting operation, omitting a parameter will leave it unchanged. */
export interface NestSettingsSaveParams {
    /** The gap between nested parts in mm */
    nest_gap?: number,
    /** The gap between nested parts and the build box in mm */
    box_gap?: number,
    /** Enable nesting to density */
    nest_to_density_active?: boolean,
    /** The target density to reach when nesting to density (in %) */
    nest_to_density?: number,
    /** Enable layer density control */
    nest_layer_density_active?: boolean,
    /** The maximum layer density to allow (in %) */
    nest_layer_density?: number,
    /** The maximum height to use for nesting (0 = use entire buildbox) */
    nest_height_limit?: number,
    /** Enable spreading of parts in the build box to reduce density */
    nest_spread_parts?: boolean
}

/** Center the specified part in the active batch. */
export interface PartCenterParams {
    /** The part number of the part to center. */
    part_number: string,
    /** Zero-based index of the instance to center, if not specified, all instances will be centered. */
    instance_idx?: number
}

/** Delete the specified part from the batch. */
export interface PartDeleteParams {
    /** The part number of the part to delete. */
    part_number: string,
    /** Zero-based index of the instance to delete, if not specified, all instances will be deleted. */
    instance_idx?: number
}

/** This action will create a copy of the selected part. */
export interface PartDuplicateParams {
    /** The part number of the part to duplicate */
    part_number: string,
    /** The part number to assign to the duplicated part (optional) */
    new_part_number?: string
}

/** Import one or more parts into the current build area from STL, STEP or 3MF files. */
export interface PartImportParams {
    /** The file path of the part to import */
    file_path: string,
    /** The part number to assign to the imported part (optional) */
    part_number?: string
}

/** This action will set the nesting priority of the selected parts in a range of 0-100. */
export interface PartPriorityParams {
    /** The priority value to set for the selected parts (0-100) */
    priority_value?: number
}

/** Save any of the settings of the parts. All optional values can be omitted, and they will leave that setting unchanged. */
export interface PartSettingsSaveParams {
    /** The part number of the part to modify */
    part_number: string,
    /** The rotation around the X axis (in degrees) (optional) */
    rotation_x?: number,
    /** The rotation around the Y axis (in degrees) (optional) */
    rotation_y?: number,
    /** The rotation around the Z axis (in degrees) (optional) */
    rotation_z?: number,
    /** The scaling along the X axis (in percent) (optional) */
    scale_x?: number,
    /** The scaling along the Y axis (in percent) (optional) */
    scale_y?: number,
    /** The scaling along the Z axis (in percent) (optional) */
    scale_z?: number,
    /** The number of copies to create for this part (reducing it may remove instances of the part that are already placed) (optional) */
    copies?: number,
    /** The gap to use when nesting this part (optional) */
    nest_gap?: number,
    /** Allow rotation around the X axis when nesting (optional) */
    allow_x_rotation?: boolean,
    /** Allow rotation around the Y axis when nesting (optional) */
    allow_y_rotation?: boolean,
    /** Allow rotation around the Z axis when nesting (optional) */
    allow_z_rotation?: boolean,
    /** The index of the instance to modify (optional) */
    instance_idx?: number,
    /** The X position of the instance to modify (optional, ignored if instance_idx not provided) */
    instance_x?: number,
    /** The Y position of the instance to modify (optional, ignored if instance_idx not provided) */
    instance_y?: number,
    /** The Z position of the instance to modify (optional, ignored if instance_idx not provided) */
    instance_z?: number,
    /** Lock the position of the instance to modify (optional, ignored if instance_idx not provided) */
    lock_position?: boolean
}

/** This action will create a shell around the selected part. */
export interface PartShellingExecuteParams {
    /** The part number of the part to shell */
    part_number: string,
    /** Whether to create a shell around the part, if set to false, an existing shell will be removed */
    create_shell?: boolean,
    /** The thickness of the shell in mm */
    shell_thickness?: number,
    /** Whether to create a lattice structure inside the shell */
    create_lattice?: boolean,
    /** The length of the lattice beams in mm */
    lattice_beam_length?: number,
    /** The thickness of the lattice beams in mm */
    lattice_beam_thickness?: number
}

/** Show the healer log entries for all meshes in the specified part. */
export interface PartShowLogParams {
    /** The part number of the part whose mesh log to display */
    part_number: string
}

export enum OutputType {
    TIFF = 'tiff',
    SVG = 'svg',
    CLI = 'cli',
    SLI = 'sli',
    "3MF" = '3mf',
}

/** This action will slice the current batch. Depending on the output type, you need to specify a folder or a filepath as output location. */
export interface SlicerExecuteParams {
    /** Type of output to generate (tiff, svg, cli, sli, 3mf) */
    output_type?: string,
    /** The output location for the sliced files (folder for tiff, filepath for others) */
    output_location: string
}

/** This action will export the current batch as a 3MF file that can be used in other slicing applications. */
export interface SlicerExport3mfParams {
    /** The path to the 3MF file to export to */
    "3mf_file": string,
    /** Set to true to export this file in the HP3MF format */
    hp_format?: boolean
}

/** This action will export the complete batch as a single STL file that can be used in other slicing applications. */
export interface SlicerExportStlParams {
    /** The path to the STL file to export to */
    stl_file: string
}

export enum PartFileFormat {
    CSV = 'csv',
    HTML = 'html',
    JSON = 'json'
}
/** This action will export a file containing the list of parts in the current batch along with their dimensions and volumes. */
export interface SlicerPartsListParams {
    /** The filepath to export the parts list to */
    file_path: string,
    /** The format to use for the parts list ('csv', 'html' or 'json') */
    part_list_format: PartFileFormat,
    /** Whether to include unplaced parts in the parts list (only for json format) */
    part_list_unplaced?: boolean,
    /** Whether to include batch information in the parts list (only for json format) */
    part_list_batch?: boolean,
    /** Whether to include density information in the parts list (only if batch info is requested), this will make the export slower */
    part_list_density?: boolean
}
