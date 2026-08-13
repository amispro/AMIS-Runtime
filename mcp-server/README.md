# AMIS Runtime MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) server that exposes the AMIS Runtime API ([`api/amis.js`](../api/amis.js)) as tools, so an AI agent (Claude, Copilot Chat, etc.) can drive AMIS Pro directly: import parts, nest, shell, slice, and export.

## Installation

```bash
cd mcp-server
npm install
```

## Running

```bash
node server.js
```

The server communicates over stdio, so it's normally launched by an MCP client rather than run directly.

### Register with an MCP client

Example client configuration (e.g. `mcp.json` / Claude Desktop config):

```json
{
  "mcpServers": {
    "amis-runtime": {
      "command": "node",
      "args": ["/absolute/path/to/amis_runtime/mcp-server/server.js"]
    }
  }
}
```

## How it maps to the AMIS Runtime API

Every exported function of `api/amis.js` is available as a tool of the same name (`batch_create`, `part_import`, `nest_execute`, `slicer_export_stl`, etc.), with the same parameters described in [`documentation/api_documentation.html`](../documentation/api_documentation.html).

Like the underlying API, commands are **queued** and only sent to AMIS Pro when you call:

- `execute` – runs all queued commands, or
- `get_current_state` – runs all queued commands and returns the resulting batch/part list as JSON (mirrors `amis.returnCurrentState()`)

Additional tools not present in `amis.js`:

- `initialize` – set a custom path to the AMIS Pro executable (defaults to the macOS install location)
- `set_working_directory` – change the directory used to resolve relative file paths (part files, batch files, exports) and temporary files

### Typical tool sequence

1. `initialize` (optional, only if AMIS Pro isn't at the default path)
2. `set_working_directory` (optional, so relative paths like `In/part.stl` resolve correctly)
3. `batch_create` or `batch_open`
4. `part_import` (one or more times), `part_settings_save`, etc.
5. `nest_execute`
6. `get_current_state` to inspect nesting density / part positions, or `execute` to just run everything
7. `batch_save_as`, `slicer_export_stl`, `slicer_export_3mf`, or `slicer_parts_list` to produce output
