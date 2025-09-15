import { PreloadedQuery, loadQuery, usePreloadedQuery, Environment, useRelayEnvironment } from "react-relay"
type Params = Record<string, string | undefined>
import { OperationType, GraphQLTaggedNode } from "relay-runtime"
import { useWouterLoaderData } from "../app/WouterLoaderContext"

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

export const usePreloaded = <TQuery extends OperationType>() => {
  const loaderData = useWouterLoaderData()
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
  const loaderData = useWouterLoaderData()
  const environment = useRelayEnvironment()

  if (loaderData) {
    vars = loaderData.variables as TQuery["variables"]
    querySDL = loaderData.graphql
    // const { variables, graphql } = loaderData as { variables: TQuery["variables"]; graphql: GraphQLTaggedNode }
    // Always create a fresh PreloadedQuery from the current environment
    // This ensures we use the environment's record source data (populated from __RECORD_SOURCE)
  }

  // TODO: Maybe we need to memoize the vars?

  const query = loadQuery<TQuery>(environment, querySDL, vars || {})
  return {
    variables: vars || {},
    query: usePreloadedQuery<TQuery>(querySDL, query),
  }
}
