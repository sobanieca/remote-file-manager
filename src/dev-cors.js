const DEV_ORIGIN_VARIABLE = "RFM_DEV_UI_ORIGIN";

/**
 * Reads the origin of the imp dev server that may call the API while the user
 * interface is developed. Without the variable no cross-origin call is allowed
 * @returns {string|null} - The allowed origin, or null
 */
export function readDevOrigin() {
  try {
    return Deno.env.get(DEV_ORIGIN_VARIABLE) || null;
  } catch (_error) {
    return null;
  }
}

/**
 * Builds a middleware that lets exactly one origin call the API
 * @param {string} origin - The allowed origin
 * @returns {Function} - The Hono middleware
 */
export function devCors(origin) {
  return async (c, next) => {
    if (c.req.header("Origin") !== origin) {
      return next();
    }
    const headers = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, X-Request-Id",
      "Vary": "Origin",
    };
    if (c.req.method === "OPTIONS") {
      return c.body(null, 204, headers);
    }
    await next();
    for (const [name, value] of Object.entries(headers)) {
      c.res.headers.set(name, value);
    }
  };
}
