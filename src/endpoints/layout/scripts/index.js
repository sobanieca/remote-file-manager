import { coreScript } from "./core-script.js";
import { explorerScript } from "./explorer-script.js";
import { clipboardScript } from "./clipboard-script.js";
import { codeScript } from "./code-script.js";
import { editorScript } from "./editor-script.js";
import { gitScript } from "./git-script.js";

export const scripts = [
  coreScript,
  explorerScript,
  clipboardScript,
  codeScript,
  editorScript,
  gitScript,
].join("\n");
