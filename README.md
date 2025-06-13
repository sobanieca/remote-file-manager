# Remote File Manager

A web-based file management system that provides HTTP server functionality for
browsing and managing files on remote machines. The application creates a
`/file-explorer` endpoint that enables comprehensive file operations within the
working directory.

## Overview

Remote File Manager is designed to streamline file management operations on
remote servers through a web interface. The tool combines static HTTP server
capabilities with dynamic file management features, making it particularly
valuable for remote server administration and development workflows.

## Key Features

- **Web-based File Explorer**: Intuitive interface for browsing directory
  structures
- **File Management Operations**: Create, delete, rename, and organize files and
  folders
- **Text File Editing**: Built-in editor for modifying text-based files
- **Static File Serving**: Serves HTML files and other static content
- **Remote Access**: Optimized for SSH port forwarding scenarios

## Installation

### Prerequisites

- Deno runtime environment

### Install Command

```bash
deno install -g --allow-net --allow-read -f -r -n rmf jsr:@sobanieca/remote-file-manager
```

To update to the latest version, run the same installation command.

## Usage

Navigate to your desired working directory and execute:

```bash
rmf
```

The server will start and provide access to the file management interface
through your web browser on default port (8000).

To change port execute:

```bash
rmf -p 5432
```
