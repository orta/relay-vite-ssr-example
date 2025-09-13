import React, { Suspense } from "react";
import {
  type RenderToPipeableStreamOptions,
  renderToPipeableStream,
} from "react-dom/server";
import { RecordSource } from "relay-runtime";
import { Environment } from "react-relay";
import { createEnvironment } from "./environment";
import { FastifyRequest, FastifyReply } from "fastify";
// No need to import memoryLocation for SSR

import { WouterApp } from "./components/WouterApp";
import { 
  createWouterRoutes, 
  matchRoute, 
  loadRouteData,
  type WouterSSRContext,
  type RouteMatch 
} from "./wouter-routes";

// Create fetch request for loaders
const createFetchRequest = (req: FastifyRequest, res: FastifyReply) => {
  const origin = `${req.protocol}://${req.host}`;
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
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body as BodyInit : undefined,
  };

  console.log("SSR: Fetch request init", init);

  return new Request(url.href, init);
};

interface WouterContext {
  environment: Environment;
  helmetContext: object;
  recordSource: RecordSource;
  routeMatch: RouteMatch | null;
  loaderData: any;
  pathname: string;
}

export const createWouterContext = async (
  graphqlUrl: string,
  req: FastifyRequest,
  res: FastifyReply
): Promise<WouterContext> => {
  const recordSource = new RecordSource();
  const environment = createEnvironment(graphqlUrl, recordSource);

  // Parse pathname
  const url = new URL(req.url, `${req.protocol}://${req.host}`);
  const pathname = url.pathname;

  // Create routes
  const routes = createWouterRoutes(environment);
  
  // Match route
  const routeMatch = matchRoute(pathname, routes);
  
  // Load data if route has loader
  let loaderData = null;
  if (routeMatch && routeMatch.route.loader) {
    try {
      const fetchRequest = createFetchRequest(req, res);
      loaderData = await loadRouteData(routeMatch, fetchRequest);
      console.log("SSR: Loaded route data for", pathname);
    } catch (error) {
      console.error("SSR: Failed to load route data", error);
      throw error;
    }
  }

  console.log("SSR: Created Wouter context for", pathname);

  return {
    environment,
    helmetContext: {},
    recordSource,
    routeMatch,
    loaderData,
    pathname,
  };
};

export function renderWouter(
  { environment, helmetContext, pathname, loaderData }: WouterContext,
  options: RenderToPipeableStreamOptions
) {
  return renderToPipeableStream(
    <React.StrictMode>
      <Suspense fallback={<div>Loading...</div>}>
        <WouterApp 
          environment={environment} 
          helmetContext={helmetContext}
          ssrPath={pathname}
          loaderData={loaderData}
        />
      </Suspense>
    </React.StrictMode>,
    options
  );
}