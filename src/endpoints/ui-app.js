import { decodeBase64 } from "../deps.js";
import { UI_ASSETS } from "../ui-assets.js";

export const UI_PREFIX = "/file-explorer";

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

function contentTypeOf(assetPath) {
  const extension = assetPath.slice(assetPath.lastIndexOf("."));
  return CONTENT_TYPES[extension] || "application/octet-stream";
}

function assetResponse(c, assetPath) {
  const asset = UI_ASSETS[assetPath];
  const body = asset.base64 === undefined
    ? asset.text
    : decodeBase64(asset.base64);
  return c.body(body, 200, {
    "Content-Type": contentTypeOf(assetPath),
    "Cache-Control": assetPath.startsWith("chunks/")
      ? IMMUTABLE_CACHE
      : "no-cache",
  });
}

// The app routes in the URL fragment, so a link from an older version that
// carries its state in the query string is moved into the fragment
function legacyRedirect(c) {
  const query = new URL(c.req.url).search;
  if (!query) {
    return null;
  }
  return c.redirect(`${UI_PREFIX}/#/${query}`);
}

export function serveUiApp(c) {
  const assetPath = c.req.path.slice(UI_PREFIX.length).replace(/^\/+/, "");

  if (assetPath && Object.hasOwn(UI_ASSETS, assetPath)) {
    return assetResponse(c, assetPath);
  }
  if (assetPath) {
    return c.text("Not found", 404);
  }
  if (!Object.hasOwn(UI_ASSETS, "index.html")) {
    return c.text(
      "The user interface is not built. Run `deno task build-ui` first.",
      503,
    );
  }
  return legacyRedirect(c) || assetResponse(c, "index.html");
}
