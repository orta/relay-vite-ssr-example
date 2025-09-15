import { graphql, Environment } from "react-relay"
import { preload, useGetMainPageQuery } from "./utils"
import { FilmsPageQuery } from "./__generated__/FilmsPageQuery.graphql"

const Query = graphql`
  query FilmsPageQuery {
    ...FilmsFragment
  }
`

export const loadFilmsPageQuery = (environment: Environment) => {
  return () => preload<FilmsPageQuery>(environment, Query)
}

export const useNewFilmsPageQuery = () => useGetMainPageQuery<FilmsPageQuery>(Query)
