# AMIS Runtime API Manual

## Introduction

The AMIS Runtime API provides a comprehensive Node.js interface for automating 3D printing workflows. This API allows you to programmatically control AMIS Pro, enabling batch processing, automated nesting, part manipulation, and slicing operations for additive manufacturing.

### Key Features

- **Batch Management**: Create, open, save, and modify 3D printing batches
- **Part Import & Manipulation**: Import STL, STEP, and 3MF files with full transformation support
- **Automated Nesting**: Intelligent part arrangement to maximize build volume utilization
- **Shelling & Latticing**: Create hollow parts with optional lattice support structures
- **Slicing**: Export sliced data in multiple formats (TIFF, SVG, CLI, SLI, 3MF)
- **Batch Processing**: Process multiple parts with custom settings in a single workflow

### System Requirements

- **Node.js**: v12.0 or higher
- **AMIS Pro**: Installed and licensed
- **Operating System**: macOS, Windows
- **Memory**: 16GB RAM Minimum (more can be needed for complex nesting jobs)

---

## Installation

### Step 1: Install Node.js

Download and install Node.js from [nodejs.org](https://nodejs.org/) if not already installed.

On Mac you can use homebrew to install node as well:

```bash
brew install node
```

Verify your installation:

```bash
node --version
npm --version
```

### Step 2: Install Required Dependencies

Navigate to your the AMIS Runtime directory and run:

```bash
cd API
npm install
```

### Step 3: Configure AMIS Pro Path

Locate your AMIS Pro installation path:

- **macOS**: `/Applications/AMIS Pro.app/Contents/MacOS/AMIS Pro`
- **Windows**: `C:\Program Files\AMIS Pro\AMIS Pro.exe`

You'll need this path to initialize the API in your scripts.

## Getting Started

### Basic Workflow

A typical AMIS Runtime script follows this pattern:

1. **Initialize** the AMIS Pro application path
2. **Create or open** a batch
3. **Import** parts into the batch
4. **Configure** part settings (rotation, scaling, copies)
5. **Execute** nesting operation
6. **Save** the batch
7. **Export** results (CSV, STL, sliced data)
8. **Execute** all queued commands

### Minimal Example

```javascript
const amis = require('./amis.js');
const fs = require('fs');

// Ensure output directory exists
if (!fs.existsSync("./Out")) {
    fs.mkdirSync("./Out");
}

// Initialize AMIS Pro
amis.initialize("C:\\Program Files\\AMIS Pro\\AMIS Pro.exe");

// Create a new batch
amis.batch_create({
    batch_width: 380.0,
    batch_depth: 284.0,
    batch_height: 380.0,
    batch_name: "my_batch.3mf"
});

// Import a part
amis.part_import({
    file_path: "In/part.stl",
    part_number: "Part_001"
});

// Save the batch
amis.batch_save_as({
    file_path: "Out/output.3mf"
});

// Execute all commands
amis.execute();
```

### Important Note on Execution

All API calls are **queued** and executed only when `amis.execute()` is called. This allows you to build complex workflows efficiently.

## Execute your script

Navigate to the folder where your script is located and execute it using node:

```bash
node example_1.js
```

## Examples

Beginner scripts live under `examples/`, grouped by theme:

| Theme | Folder | Covers |
|-------|--------|--------|
| Setup | `examples/Setup/` | Create/open a batch, import STL or 3MF, save, move unplaced parts |
| Parts | `examples/Parts/` | Scale, rotate, reset rotation, position, center |
| Nesting | `examples/Nesting/` | Default nest, gaps, density, height limit, lock, clear, priority, boxing |
| Output | `examples/Output/` | Export as 3MF, STL, or HTML parts list |

Run each script from its theme folder so the relative `../In` and `../Out` paths resolve correctly:

```bash
cd examples/Setup
node import_single_stl_and_save.js
```

The full function reference is in `documentation/api_documentation.html`.
