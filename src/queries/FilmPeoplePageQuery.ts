import { graphql, Environment } from "react-relay"
import { LoaderArgs, preload, usePreloaded } from "./utils"
import { FilmPeoplePageQuery as FilmPeoplePageQueryType } from "./__generated__/FilmPeoplePageQuery.graphql"

const FilmPeoplePageQuery = graphql`
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
    return preload<FilmPeoplePageQueryType>(environment, FilmPeoplePageQuery, { id })
  }
}

export const useFilmPeoplePageQuery = () => usePreloaded<FilmPeoplePageQueryType>()
