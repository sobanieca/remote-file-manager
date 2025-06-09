# remote-file-manager

Static HTTP server for browsing files on remote server.
Once run, creates `/file-explorer` endpoint that allows to manage files in working directory.

## Use case

This tool is especially useful in SSH scenarios. You can do port forwarding to expose remote port on your local machine and manage files on target machine. It
also serves as static HTTP server so it should serve files like `html` without issues and allow rendering web pages.

## Installation

You need to have `deno` installed. Then run following command:

`deno install -g -n rmf @jsr:@sobanieca/remote-file-manager`

Use the same command to update the tool.

## Examples

To use the tool navigate to the desired working directory where you wsnt to browse/manage files and run:

`rmf`
