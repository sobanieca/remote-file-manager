import { MarkdownRenderer } from "../deps.js";
import { isMarkdownFile } from "./utils.js";

const EXTERNAL_URL_PATTERN = /^([a-z][a-z0-9+.-]*:|\/\/)/i;
const QUERY_OR_FRAGMENT_PATTERN = /[?#]/;

function resolveWithinRoot(baseDirectory, linkPath) {
  const resolvedSegments = [];

  for (const segment of `${baseDirectory}/${linkPath}`.split("/")) {
    if (segment === "" || segment === ".") {
      continue;
    }
    if (segment === "..") {
      if (resolvedSegments.length === 0) {
        return null;
      }
      resolvedSegments.pop();
      continue;
    }
    resolvedSegments.push(segment);
  }

  return resolvedSegments.join("/");
}

function isDirectory(path) {
  try {
    return Deno.statSync(path).isDirectory;
  } catch (_error) {
    return false;
  }
}

export class MarkdownLinkRenderer extends MarkdownRenderer {
  #currentDirectory;

  constructor(currentDirectory, options = {}) {
    super(options);
    this.#currentDirectory = currentDirectory;
  }

  link(token) {
    return super.link({ ...token, href: this.#toExplorerHref(token.href) });
  }

  #toExplorerHref(href) {
    if (!href || href.startsWith("#") || EXTERNAL_URL_PATTERN.test(href)) {
      return href;
    }

    const suffixIndex = href.search(QUERY_OR_FRAGMENT_PATTERN);
    const linkPath = suffixIndex === -1 ? href : href.slice(0, suffixIndex);
    const suffix = suffixIndex === -1 ? "" : href.slice(suffixIndex);

    if (!linkPath) {
      return href;
    }

    const baseDirectory = linkPath.startsWith("/")
      ? ""
      : this.#currentDirectory;
    const resolvedPath = resolveWithinRoot(baseDirectory, linkPath);

    if (resolvedPath === null) {
      return href;
    }

    const encodedPath = encodeURIComponent(resolvedPath || ".");

    if (linkPath.endsWith("/") || isDirectory(resolvedPath || ".")) {
      return `/file-explorer?path=${encodedPath}`;
    }

    if (isMarkdownFile(resolvedPath)) {
      return `/markdown?path=${encodedPath}${suffix}`;
    }

    return `/${resolvedPath}${suffix}`;
  }
}
