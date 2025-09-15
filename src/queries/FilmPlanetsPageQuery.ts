import { graphql, Environment } from "react-relay"
import { useParams } from "wouter"
import { LoaderArgs, preload, useGetMainPageQuery } from "./utils"
import { FilmPlanetsPageQuery as FilmPlanetsPageQueryType } from "./__generated__/FilmPlanetsPageQuery.graphql"

const Query = graphql`
  query FilmPlanetsPageQuery($id: ID!) {
    film(id: $id) {
      ...FilmPlanetsFragment
    }
  }
`

export const loadFilmPlanetsPageQuery = (environment: Environment) => {
  return ({ params: { id } }: LoaderArgs) => {
    if (!id) {
      throw new Response("Not Found", { status: 404 })
    }
    return preload<FilmPlanetsPageQueryType>(environment, Query, {
      id,
    })
  }
}

export const useFilmPlanetsPageQuery = () => {
  const params = useParams<{ id: string }>()
  const fallbackVariables = { id: params.id! }

  return useGetMainPageQuery<FilmPlanetsPageQueryType>(Query, fallbackVariables)
}
