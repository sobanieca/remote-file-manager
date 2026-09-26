import { MarkdownRenderer } from "../deps.js";
import { isMarkdownFile, toUrlPath } from "./utils.js";

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

  image(token) {
    return super.image({ ...token, href: this.#toServedFileHref(token.href) });
  }

  #toExplorerHref(href) {
    const target = this.#resolveTarget(href);

    if (!target) {
      return href;
    }

    const encodedPath = encodeURIComponent(target.path || ".");

    if (target.isDirectory) {
      return `/file-explorer?path=${encodedPath}`;
    }

    if (isMarkdownFile(target.path)) {
      return `/markdown?path=${encodedPath}${target.suffix}`;
    }

    return `/${toUrlPath(target.path)}${target.suffix}`;
  }

  #toServedFileHref(href) {
    const target = this.#resolveTarget(href);

    if (!target) {
      return href;
    }

    return `/${toUrlPath(target.path)}${target.suffix}`;
  }

  #resolveTarget(href) {
    if (!href || href.startsWith("#") || EXTERNAL_URL_PATTERN.test(href)) {
      return null;
    }

    const suffixIndex = href.search(QUERY_OR_FRAGMENT_PATTERN);
    const linkPath = suffixIndex === -1 ? href : href.slice(0, suffixIndex);
    const suffix = suffixIndex === -1 ? "" : href.slice(suffixIndex);

    if (!linkPath) {
      return null;
    }

    const baseDirectory = linkPath.startsWith("/")
      ? ""
      : this.#currentDirectory;
    const resolvedPath = resolveWithinRoot(baseDirectory, linkPath);

    if (resolvedPath === null) {
      return null;
    }

    return {
      path: resolvedPath,
      suffix,
      isDirectory: linkPath.endsWith("/") || isDirectory(resolvedPath || "."),
    };
  }
}
