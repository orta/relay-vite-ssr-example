import {
  PreloadedQuery,
  loadQuery,
  usePreloadedQuery,
  Environment,
  useRelayEnvironment,
  useLazyLoadQuery,
} from "react-relay"
type Params = Record<string, string | undefined>
import { OperationType, GraphQLTaggedNode } from "relay-runtime"
import { useSSRData } from "../app/useSSRDataContext"

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
    query: loadQuery<TQuery>(environment, graphql, variables, {
      fetchPolicy: "store-or-network", // Prefer cache when available
    }),
  }
}

export const usePreloaded = <TQuery extends OperationType>() => {
  const loaderData = useSSRData()
  const environment = useRelayEnvironment()

  const { variables, graphql } = loaderData as { variables: TQuery["variables"]; graphql: GraphQLTaggedNode }

  // Always create a fresh PreloadedQuery from the current environment
  // This ensures we use the environment's record source data (populated from __RECORD_SOURCE)
  const query = loadQuery<TQuery>(environment, graphql, variables || {})

  return {
    variables: variables || {},
    query: usePreloadedQuery<TQuery>(graphql, query),
  }
}

export const useGetMainPageQuery = <TQuery extends OperationType>(
  querySDL: GraphQLTaggedNode,
  vars?: TQuery["variables"],
) => {
  const loaderData = useSSRData()

  const hasLoaderData = !!loaderData
  const finalVars = hasLoaderData ? (loaderData.variables as TQuery["variables"]) : vars

  // Use lazy loading with proper cache policy to handle both SSR and client navigation
  const lazyResult = useLazyLoadQuery<TQuery>(querySDL, finalVars || {}, {
    fetchPolicy: "store-or-network", // Always check cache first, fallback to network
  })

  return {
    variables: finalVars || {},
    query: lazyResult,
  }
}
