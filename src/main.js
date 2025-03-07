import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/serve-static";
import { serve } from "@std/http/server";
import { parse } from "@std/flags";

const app = new Hono();

// Serve static files from current working directory
app.use("/*", serveStatic({ root: Deno.cwd() }));

// Parse command line arguments
const args = parse(Deno.args, {
  default: {
    port: 8000,
  },
  string: ["port"],
});

const port = parseInt(args.port);

console.log(`Server running at http://localhost:${port}`);
await serve(app.fetch, { port });
