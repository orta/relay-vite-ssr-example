import React, { Suspense } from "react";
import {
  type RenderToPipeableStreamOptions,
  renderToPipeableStream,
} from "react-dom/server";
import { RouteObject } from "react-router-dom";
import {
  createStaticHandler,
  StaticHandlerContext,
} from "react-router-dom/server";
import { routes } from "./routes";
import { RecordSource } from "relay-runtime";
import { Environment } from "react-relay";
import { createEnvironment } from "./environment";
import { FastifyRequest, FastifyReply } from "fastify";

import { HelmetProvider } from "react-helmet-async";
import { ServerRouter } from "./components/ServerRouter";
import { RelayEnvironmentProvider } from "react-relay";
import { ErrorBoundary } from "react-error-boundary";

const createFetchRequest = (req: FastifyRequest, res: FastifyReply) => {
  debugger;
  const origin = `${req.protocol}://${req.host}`;
  // Note: This had to take originalUrl into account for presumably vite's proxying
  const url = new URL(req.url, origin);
  console.log("SSR: Fetching URL", url.href);

  const controller = new AbortController();
  res.raw.on("close", () => controller.abort());

  const headers = new Headers();

  for (const [key, values] of Object.entries(req.headers)) {
    if (values) {
      if (Array.isArray(values)) {
        for (const value of values) {
          headers.append(key, value);
        }
      } else if (typeof values === "string") {
        headers.set(key, values);
      }
    }
  }

  const init = {
    method: req.method,
    headers,
    signal: controller.signal,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
  };

  console.log("SSR: Fetch request init", init);

  return new Request(url.href, init);
};

interface Context {
  routes: RouteObject[];
  environment: Environment;
  staticHandlerContext: StaticHandlerContext;
  helmetContext: object;
  recordSource: RecordSource;
}

export const createContext = async (
  graphqlUrl: string,
  req: FastifyRequest,
  res: FastifyReply
): Promise<Context> => {
  const recordSource = new RecordSource();
  const environment = createEnvironment(graphqlUrl, recordSource);

  const { query, dataRoutes } = createStaticHandler(routes(environment));
  const fetchRequest = createFetchRequest(req, res);
  const staticHandlerContext = await query(fetchRequest);

  if (staticHandlerContext instanceof Response) {
    throw staticHandlerContext;
  }
  console.log("SSR: Created context for ", req.url);
  console.log("SSR: Static handler context", staticHandlerContext);

  return {
    routes: dataRoutes,
    staticHandlerContext,
    environment,
    helmetContext: {},
    recordSource,
  };
};

export function render(
  { environment, routes, staticHandlerContext, helmetContext }: Context,
  options: RenderToPipeableStreamOptions
) {
  return renderToPipeableStream(
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <ErrorBoundary fallback={<div>Something went wrong!</div>}>
          <RelayEnvironmentProvider environment={environment}>
            <Suspense fallback={<div>Loading...</div>}>
              <ServerRouter routes={routes} context={staticHandlerContext} />
            </Suspense>
          </RelayEnvironmentProvider>
        </ErrorBoundary>
      </HelmetProvider>
    </React.StrictMode>,
    options
  );
}
