import fs from "node:fs/promises";
import Fastify from "fastify";
import { Transform } from "node:stream";

// Constants
const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 8082;
const base = process.env.BASE || "/";
const ABORT_DELAY = 10000;
const GRAPHQL_URL = new URL("https://swapi-graphql.netlify.app/graphql");

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile("./dist/client/index.html", "utf-8")
  : "";

// Create http server
const fastify = Fastify({
  logger: {
    level: "info",
    customLogLevel: function (req, res, err) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return "warn";
      } else if (res.statusCode >= 500 || err) {
        return "error";
      }
      return "silent";
    },
  },
});

// Add Vite or respective production middlewares
let vite;
if (!isProduction) {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });

  // Register middie for Express middleware compatibility
  await fastify.register(import("@fastify/middie"));
  console.log("🚀 Vite dev server starting");

  // Use Vite's middleware directly with middie, but configure it to not handle HTML requests
  fastify.use((req, res, next) => {
    // Don't let Vite handle HTML pages - pass them to our SSR handler
    if (req.url === '/' || !req.url.includes('.')) {
      next();
      return;
    }
    vite.middlewares(req, res, next);
  });
} else {
  await fastify.register(import("@fastify/compress"));
  await fastify.register(import("@fastify/static"), {
    root: "./dist/client",
    prefix: base,
  });
}

await fastify.register(import("@fastify/http-proxy"), {
  upstream: GRAPHQL_URL.origin,
  prefix: "/graphql",
  rewritePrefix: GRAPHQL_URL.pathname,
});

// Serve HTML
fastify.get("*", (request, reply) => {
  console.log("Route handler called for:", request.url);
  const url = request.url.replace(base, "");

  let template;
  let serverModule;
  
  Promise.resolve()
    .then(async () => {
      console.log("Loading modules...");
      if (!isProduction) {
        // Always read fresh template in development
        template = await fs.readFile("./index.html", "utf-8");
        template = await vite.transformIndexHtml(url, template);
        serverModule = await vite.ssrLoadModule("/src/server.tsx");
      } else {
        template = templateHtml;
        serverModule = await import("./dist/server/server.js");
      }
      console.log("Modules loaded, creating context...");

      const { render, createContext } = serverModule;
      const [htmlStart, restHtml] = template.split(`<!--app-head-->`);
      const [bodyStart, htmlEnd] = restHtml.split(`<!--app-html-->`);

      const context = await createContext(GRAPHQL_URL, request, reply);
      console.log("Context created, rendering...");

      let didError = false;

      const { pipe, abort } = render(context, {
        onShellError() {
          console.log("onShellError called");
          if (!reply.sent) {
            reply.code(500);
            reply.header("Content-Type", "text/html");
            reply.send("<h1>Something went wrong</h1>");
          }
        },
        onAllReady() {
          console.log("onAllReady called");
          // Hijack the response to prevent Fastify from sending headers
          reply.hijack();
          const response = reply.raw;
          
          response.statusCode = didError ? 500 : 200;
          response.setHeader("Content-Type", "text/html");

          const transformStream = new Transform({
            transform(chunk, encoding, callback) {
              response.write(chunk, encoding);
              callback();
            },
          });

          response.write(htmlStart);

          const { helmet } = context.helmetContext;
          if (helmet) {
            response.write(helmet.title.toString());
            response.write(helmet.priority.toString());
            response.write(helmet.meta.toString());
            response.write(helmet.link.toString());
            response.write(helmet.script.toString());
          }

          const { recordSource } = context;
          response.write(
            `<script>window.__RECORD_SOURCE = ${JSON.stringify(
              recordSource.toJSON()
            )}</script>`
          );

          response.write(bodyStart);

          transformStream.on("finish", () => {
            response.end(htmlEnd);
          });

          pipe(transformStream);
        },
        onError(error) {
          didError = true;
          console.error("Render error:", error);
        },
      });

      setTimeout(() => {
        abort();
      }, ABORT_DELAY);
    })
    .catch((e) => {
      console.error("Route handler error:", e);
      vite?.ssrFixStacktrace(e);
      console.error(e.stack);
      if (!reply.sent) {
        reply.code(500).send(e.stack);
      }
    });
});

// Start http server
fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
  console.log(`🚀 Server started at ${address}`);
  console.log(`🔗 GraphQL host: ${GRAPHQL_URL}`);
});
