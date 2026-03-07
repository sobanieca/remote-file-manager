export async function update(args) {
  const denoFlag = args.includes("--deno");

  if (denoFlag) {
    console.log("Updating Remote File Manager to the latest version...");
    console.log("");

    const command = new Deno.Command("deno", {
      args: [
        "install",
        "-g",
        "--allow-net",
        "--allow-read",
        "--allow-write",
        "--allow-run",
        "--allow-env=TERM",
        "-f",
        "-r",
        "-n",
        "rfm",
        "jsr:@sobanieca/remote-file-manager",
      ],
      stdout: "inherit",
      stderr: "inherit",
    });

    const { code } = await command.output();

    if (code === 0) {
      console.log("");
      console.log("Remote File Manager has been updated successfully!");
    } else {
      console.log("");
      console.error("ERROR: Failed to update Remote File Manager");
      Deno.exit(1);
    }
  } else {
    console.log("To update Remote File Manager to the latest version, run:");
    console.log("");
    console.log(
      "  deno install -g --allow-net --allow-read --allow-write --allow-run --allow-env=TERM -f -r -n rfm jsr:@sobanieca/remote-file-manager",
    );
    console.log("");
    console.log("Or use deno updater:");
    console.log("  rfm update --deno");
    console.log(
      "  (This will ask for run permission and perform the update)",
    );
    console.log("");
    console.log("For standalone binaries, run the install script:");
    console.log(
      "  curl -fsSL sobanieca.github.io/remote-file-manager/install.sh | bash",
    );
    console.log("");
    console.log("Or download manually from:");
    console.log(
      "  https://github.com/sobanieca/remote-file-manager/releases/latest",
    );
  }
}
