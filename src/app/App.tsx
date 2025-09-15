import React, { useEffect, useState, Suspense } from "react"
import { Router, Route, Switch, useLocation } from "wouter"
import { RelayEnvironmentProvider } from "react-relay"
import { Environment } from "react-relay"
import { ErrorBoundary } from "react-error-boundary"
import { HelmetProvider } from "react-helmet-async"

// Components
import { Scaffold } from "../components/Scaffold"
import { WouterLoaderProvider } from "./useSSRDataContext"

// Route matching
import { matchRoute, createRouteElements } from "../wouter-routes"
import { createWouterRoutes } from "./routes"

import "../components/Scaffold.css"

interface AppProps {
  environment: Environment
  helmetContext?: any
  ssrPath?: string // For SSR path
  loaderData?: any // Data from route loader
}

const AppContent: React.FC<{ environment: Environment; initialLoaderData?: any }> = (props) => {
  const { environment, initialLoaderData } = props
  const [location] = useLocation()
  const [currentLoaderData, setCurrentLoaderData] = useState(initialLoaderData)

  // Track the initial location to know when we've navigated away
  const [initialLocation] = useState(typeof window !== "undefined" ? window.location.pathname : location)

  // Debug: only log when location changes
  if (typeof window !== "undefined") {
    console.log("🔍 Client navigation - Wouter location:", location, "Window location:", window.location.pathname)
  }

  useEffect(() => {
    console.log("🚀 AppContent useEffect triggered:", {
      location,
      initialLocation,
      hasInitialLoaderData: !!initialLoaderData,
      isServer: typeof window === "undefined",
    })

    // Skip if we're on the server
    if (typeof window === "undefined") {
      console.log("⏭️ Skipping: server-side")
      return
    }

    // If we have initial loader data and we're still on the initial location, use it
    if (initialLoaderData && location === initialLocation) {
      console.log("🎯 Using initial loader data for initial location")
      setCurrentLoaderData(initialLoaderData)
      return
    }

    const loadRouteDataForLocation = () => {
      console.log(`🔄 Client-side: Setting up route context for location: ${location}`)

      const routes = createWouterRoutes(environment)
      const routeMatch = matchRoute(location, routes)

      console.log(`🎯 Route match:`, routeMatch)

      if (routeMatch && routeMatch.route.loader) {
        console.log(`📊 Client-side: Creating route context for: ${routeMatch.route.path}`)

        // For client-side navigation, we don't need to execute the loader
        // Just create the minimal context data that usePreloaded needs
        const loaderFunction = routeMatch.route.loader

        // Get the graphql and variables that the loader would use
        // We need to peek into what the loader function would create
        try {
          const tempLoaderData = loaderFunction({
            params: routeMatch.params,
            request: new Request(window.location.origin + location),
          })

          // Extract just the metadata, not the actual query
          const contextData = {
            graphql: tempLoaderData.graphql,
            variables: tempLoaderData.variables,
            // Don't include the query - usePreloaded will create it fresh
          }

          console.log(`✅ Created route context:`, contextData)
          setCurrentLoaderData(contextData)
        } catch (error) {
          console.error("💥 Failed to create route context:", error)
          // Fallback: set null and let the component handle it
          setCurrentLoaderData(null)
        }
      } else {
        console.log(`❌ No loader found for route: ${location}`)
        setCurrentLoaderData(null)
      }
    }

    loadRouteDataForLocation()
  }, [location, environment, initialLoaderData, initialLocation])

  return (
    <WouterLoaderProvider loaderData={currentLoaderData}>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f0f0f0",
          margin: "10px 0",
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 1000,
        }}
      >
        <p>🧭 Wouter location: {location}</p>
        <p>📊 Has loader data: {currentLoaderData ? "✅" : "❌"}</p>
        <p>🔧 Loader data type: {currentLoaderData?.graphql?.params?.name || "none"}</p>
      </div>
      <ErrorBoundary
        fallback={
          <div style={{ padding: "20px", backgroundColor: "#ffebee", border: "1px solid #f44336", margin: "10px 0" }}>
            <h3>🚨 Route Component Error</h3>
            <p>
              <strong>Current location:</strong> {location}
            </p>
            <p>
              <strong>Loader data available:</strong> {currentLoaderData ? "Yes" : "No"}
            </p>
            <p>
              <strong>Loader data type:</strong> {currentLoaderData?.graphql?.params?.name || "Unknown"}
            </p>
            <details>
              <summary>Loader data details</summary>
              <pre>{JSON.stringify(currentLoaderData, null, 2)}</pre>
            </details>
          </div>
        }
      >
        <Suspense fallback={<div>Loading route data...</div>}>
          <Scaffold>
            <Switch>
              {createRouteElements(createWouterRoutes(environment))}
              <Route>{() => <div>404 - Page not found</div>}</Route>
            </Switch>
          </Scaffold>
        </Suspense>
      </ErrorBoundary>
    </WouterLoaderProvider>
  )
}

export const App: React.FC<AppProps> = ({ environment, helmetContext, ssrPath, loaderData }) => {
  return (
    <HelmetProvider context={helmetContext}>
      <ErrorBoundary fallback={<div>Something went wrong!</div>}>
        <RelayEnvironmentProvider environment={environment}>
          <Router ssrPath={ssrPath}>
            <AppContent environment={environment} initialLoaderData={loaderData} />
          </Router>
        </RelayEnvironmentProvider>
      </ErrorBoundary>
    </HelmetProvider>
  )
}
