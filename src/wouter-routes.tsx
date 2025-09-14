import { Environment } from "react-relay"
import { LoaderFn } from "./queries/utils"

// Route definition for Wouter
export interface WouterRoute {
  path: string
  component: React.ComponentType<any>
  loader?: LoaderFn
  children?: WouterRoute[]
}

// Route matching result
export interface RouteMatch {
  route: WouterRoute
  params: Record<string, string>
  pathname: string
}

// Import components and loaders
import { FilmsPage } from "./pages/FilmsPage"
import { loadFilmsPageQuery } from "./queries/FilmsPageQuery"

import { FilmPeoplePage } from "./pages/FilmPeoplePage"
import { loadFilmPeoplePageQuery } from "./queries/FilmPeoplePageQuery"

import { FilmPlanetsPage } from "./pages/FilmPlanetsPage"
import { loadFilmPlanetsPageQuery } from "./queries/FilmPlanetsPageQuery"

export const createWouterRoutes = (environment: Environment): WouterRoute[] => [
  {
    path: "/film/:id/people",
    component: FilmPeoplePage,
    loader: loadFilmPeoplePageQuery(environment),
  },
  {
    path: "/film/:id/planets",
    component: FilmPlanetsPage,
    loader: loadFilmPlanetsPageQuery(environment),
  },
  {
    path: "/",
    component: FilmsPage,
    loader: loadFilmsPageQuery(environment),
  },
]

// Simple path-to-regexp style matcher
function pathToRegexp(path: string): [RegExp, string[]] {
  const keys: string[] = []
  const pattern = path
    .replace(/\/:([^\/]+)/g, (_, key) => {
      keys.push(key)
      return "/([^/]+)"
    })
    .replace(/\//g, "\\/")

  return [new RegExp(`^${pattern}$`), keys]
}

// Match URL to routes and extract params
export function matchRoute(pathname: string, routes: WouterRoute[]): RouteMatch | null {
  for (const route of routes) {
    // Try to match current route
    const [regex, keys] = pathToRegexp(route.path)
    const match = pathname.match(regex)

    if (match) {
      const params: Record<string, string> = {}
      keys.forEach((key, index) => {
        params[key] = match[index + 1]
      })

      // If there are children, try to find a more specific match first
      if (route.children) {
        const childMatch = matchRoute(pathname, route.children)
        if (childMatch) {
          return childMatch
        }
      }

      // Return this route if no child match found
      return { route, params, pathname }
    }
  }

  return null
}

// Load data for a matched route
export async function loadRouteData(match: RouteMatch, request: Request): Promise<any> {
  if (!match.route.loader) {
    return null
  }

  try {
    return await match.route.loader({
      request,
      params: match.params,
    })
  } catch (error) {
    console.error("Route loader error:", error)
    throw error
  }
}

// Context type for SSR
export interface WouterSSRContext {
  route: RouteMatch
  loaderData: any
  environment: Environment
  pathname: string
}
