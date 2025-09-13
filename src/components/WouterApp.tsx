import React from "react";
import { Router, Route, Switch } from "wouter";
import { RelayEnvironmentProvider } from "react-relay";
import { Environment } from "react-relay";
import { ErrorBoundary } from "react-error-boundary";
import { HelmetProvider } from "react-helmet-async";

// Components
import { Scaffold } from "./Scaffold";
import { FilmsPage } from "./FilmsPage";
import { FilmPeoplePage } from "./FilmPeoplePage";
import { FilmPlanetsPage } from "./FilmPlanetsPage";
import { WouterLoaderProvider } from "./WouterLoaderContext";

interface WouterAppProps {
  environment: Environment;
  helmetContext?: any;
  ssrPath?: string; // For SSR path
  loaderData?: any; // Data from route loader
}

export const WouterApp: React.FC<WouterAppProps> = ({ 
  environment, 
  helmetContext,
  ssrPath,
  loaderData
}) => {
  return (
    <HelmetProvider context={helmetContext}>
      <ErrorBoundary fallback={<div>Something went wrong!</div>}>
        <RelayEnvironmentProvider environment={environment}>
          <WouterLoaderProvider loaderData={loaderData}>
            <Router ssrPath={ssrPath}>
              <Scaffold>
                <Switch>
                  <Route path="/" component={FilmsPage} />
                  <Route path="/film/:id/people" component={FilmPeoplePage} />
                  <Route path="/film/:id/planets" component={FilmPlanetsPage} />
                  <Route>
                    {() => <div>404 - Page not found</div>}
                  </Route>
                </Switch>
              </Scaffold>
            </Router>
          </WouterLoaderProvider>
        </RelayEnvironmentProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
};