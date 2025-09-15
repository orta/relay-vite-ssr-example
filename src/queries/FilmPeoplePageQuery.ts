import { graphql, Environment } from "react-relay"
import { useParams } from "wouter"
import { LoaderArgs, preload, useGetMainPageQuery } from "./utils"
import { FilmPeoplePageQuery as FilmPeoplePageQueryType } from "./__generated__/FilmPeoplePageQuery.graphql"

const Query = graphql`
  query FilmPeoplePageQuery($id: ID!) {
    film(id: $id) {
      ...FilmLayout
      ...FilmPeopleFragment
    }
  }
`

export const loadFilmPeoplePageQuery = (environment: Environment) => {
  return ({ params: { id } }: LoaderArgs) => {
    if (!id) throw new Response("id was not given for ", { status: 404 })
    return preload<FilmPeoplePageQueryType>(environment, Query, { id })
  }
}

export const useFilmPeoplePageQuery = () => {
  const params = useParams<{ id: string }>()
  const fallbackVariables = { id: params.id! }

  return useGetMainPageQuery<FilmPeoplePageQueryType>(Query, fallbackVariables)
}
