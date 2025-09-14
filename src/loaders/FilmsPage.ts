import { graphql, Environment, useLazyLoadQuery } from "react-relay"
import { preload, usePreloaded } from "./utils"
import { FilmsPageQuery as FilmsPageQueryType } from "./__generated__/FilmsPageQuery.graphql"
import { useWouterLoaderData } from "../components/WouterLoaderContext"

const FilmsPageQuery = graphql`
  query FilmsPageQuery {
    ...FilmsFragment
  }
`

export const loadFilmsPageQuery = (environment: Environment) => {
  return () => preload<FilmsPageQueryType>(environment, FilmsPageQuery)
}

export const useFilmsPageQuery = () => {
  const loaderData = useWouterLoaderData()

  try {
    if (loaderData) {
      // SSR context - use preloaded query
      return usePreloaded<FilmsPageQueryType>()
    }
  } catch (error) {
    // If preloaded fails, fall back to lazy loading
    console.log("Falling back to lazy loading:", error.message)
  }

  // Client-side hydration or fallback - use lazy query
  const query = useLazyLoadQuery<FilmsPageQueryType>(FilmsPageQuery, {})
  return {
    query,
    variables: {},
  }
}
