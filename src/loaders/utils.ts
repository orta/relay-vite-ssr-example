import {
  PreloadedQuery,
  loadQuery,
  usePreloadedQuery,
  Environment,
  useLazyLoadQuery,
  useRelayEnvironment,
} from "react-relay";
type Params = Record<string, string | undefined>;
import { OperationType, GraphQLTaggedNode } from "relay-runtime";
import { useWouterLoaderData } from "../components/WouterLoaderContext";

export interface LoaderArgs {
  params: Params;
  request: Request;
}

export type LoaderFn = (args: LoaderArgs) => PreloadedData<OperationType>;

export interface PreloadedData<TQuery extends OperationType> {
  graphql: GraphQLTaggedNode;
  variables: TQuery["variables"];
  query: PreloadedQuery<TQuery>;
}

export const preload = <TQuery extends OperationType>(
  environment: Environment,
  graphql: GraphQLTaggedNode,
  variables: TQuery["variables"] = {}
): PreloadedData<TQuery> => {
  return {
    graphql,
    variables,
    query: loadQuery<TQuery>(environment, graphql, variables),
  };
};

export const reload = <TQuery extends OperationType>(
  environment: Environment,
  preloaded: PreloadedData<TQuery>
): PreloadedData<TQuery> => {
  const { graphql, variables, ...rest } = preloaded;
  return {
    graphql,
    variables,
    ...rest,
    query: loadQuery<TQuery>(environment, graphql, variables),
  };
};

export const usePreloaded = <TQuery extends OperationType>() => {
  const loaderData = useWouterLoaderData();
  const environment = useRelayEnvironment();

  if (!loaderData) {
    // During client-side hydration, loader data might not be available
    // In this case, we should fall back to a client-side query
    // For now, throw a more descriptive error
    throw new Error(
      "No loader data available during hydration. " +
        "This suggests the server-side loader data wasn't properly serialized to the client, " +
        "or this component is being rendered without proper route loader setup."
    );
  }

  const { variables, query, graphql, ...rest } =
    loaderData as PreloadedData<TQuery>;
  
  // Check if we're on the client side and the query environment doesn't match
  const isClient = typeof window !== 'undefined';
  if (isClient && query.environment !== environment) {
    // Reload the query with the current client environment
    const reloadedData = reload(environment, loaderData as PreloadedData<TQuery>);
    return {
      variables: reloadedData.variables,
      query: usePreloadedQuery<TQuery>(reloadedData.graphql, reloadedData.query),
      ...rest,
    };
  }

  return {
    variables,
    query: usePreloadedQuery<TQuery>(graphql, query),
    ...rest,
  };
};
