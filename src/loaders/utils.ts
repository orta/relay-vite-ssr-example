import {
  PreloadedQuery,
  loadQuery,
  usePreloadedQuery,
  Environment,
  useLazyLoadQuery,
  useRelayEnvironment,
} from "react-relay"
type Params = Record<string, string | undefined>
import { OperationType, GraphQLTaggedNode } from "relay-runtime"
import { useWouterLoaderData } from "../components/WouterLoaderContext"

export interface LoaderArgs {
  params: Params
  request: Request
}

export type LoaderFn = (args: LoaderArgs) => PreloadedData<OperationType>

export interface PreloadedData<TQuery extends OperationType> {
  graphql: GraphQLTaggedNode
  variables: TQuery["variables"]
  query: PreloadedQuery<TQuery>
}

export const preload = <TQuery extends OperationType>(
  environment: Environment,
  graphql: GraphQLTaggedNode,
  variables: TQuery["variables"] = {},
): PreloadedData<TQuery> => {
  return {
    graphql,
    variables,
    query: loadQuery<TQuery>(environment, graphql, variables),
  }
}

export const reload = <TQuery extends OperationType>(
  environment: Environment,
  preloaded: PreloadedData<TQuery>,
): PreloadedData<TQuery> => {
  const { graphql, variables, ...rest } = preloaded
  return {
    graphql,
    variables,
    ...rest,
    query: loadQuery<TQuery>(environment, graphql, variables),
  }
}

export const usePreloaded = <TQuery extends OperationType>() => {
  const loaderData = useWouterLoaderData()
  const environment = useRelayEnvironment()

  console.log("🔍 usePreloaded called:", {
    hasLoaderData: !!loaderData,
    isClient: typeof window !== "undefined",
  })

  if (!loaderData) {
    throw new Error("No loader data available. This component must be rendered within a route that has a loader.")
  }

  const { variables, graphql } = loaderData as { variables: any; graphql: GraphQLTaggedNode }

  console.log("🔧 Creating fresh PreloadedQuery from current environment")

  // Always create a fresh PreloadedQuery from the current environment
  // This ensures we use the environment's record source data (populated from __RECORD_SOURCE)
  const query = loadQuery<TQuery>(environment, graphql, variables || {})

  return {
    variables: variables || {},
    query: usePreloadedQuery<TQuery>(graphql, query),
  }
}
