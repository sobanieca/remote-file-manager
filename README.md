# remote-file-manager

Static HTTP server for browsing files on remote server.
Once run, creates `/file-explorer` endpoint that allows to manage files in working directory.

## Use case

This tool is especially useful in SSH scenarios. You can do port forwarding to expose remote port on your local machine and manage files on target machine. 
It also serves as static HTTP server so it should serve `html` files allowing to render web pages.

## Installation

You need to have `deno` installed. Then run following command:

`deno install -g --allow-net --allow-read -n rmf jsr:@sobanieca/remote-file-manager`

Use the same command to update the tool.

## Usage

To use the tool navigate to the desired working directory where you wsnt to browse/manage files and run:

`rmf`

