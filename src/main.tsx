import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { RecordSource } from "relay-runtime";
import { createEnvironment } from "./environment";
import { RelayEnvironmentProvider } from "react-relay";
import { ErrorBoundary } from "react-error-boundary";
import { WouterApp } from "./components/WouterApp";
import { HelmetProvider } from "react-helmet-async";

interface InjectedWindow extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __RECORD_SOURCE: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __LOADER_DATA: any;
}

const recordSource = new RecordSource(
  (window as unknown as InjectedWindow).__RECORD_SOURCE
);
const environment = createEnvironment(
  "http://localhost:8082/graphql",
  recordSource
);

const loaderData = (window as unknown as InjectedWindow).__LOADER_DATA;

ReactDOM.hydrateRoot(
  document.getElementById("root")!,
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <WouterApp environment={environment} loaderData={loaderData} />
    </Suspense>
  </React.StrictMode>
);
