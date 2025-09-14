import { graphql, useLazyLoadQuery } from "react-relay"
import { FilmPeopleFragmentQuery } from "./__generated__/FilmPeopleFragmentQuery.graphql"
import { FilmPeople } from "./FilmPeople"
import { useParams } from "wouter"

const FilmPeopleFragmentQueryGraphQL = graphql`
  query FilmPeopleFragmentQuery($id: ID!) {
    film(id: $id) {
      ...FilmPeopleFragment
    }
  }
`

export const FilmPeopleFragmentComponent = () => {
  const { id } = useParams<{ id: string }>()
  if (!id) throw new Error("Film ID is required")

  const data = useLazyLoadQuery<FilmPeopleFragmentQuery>(FilmPeopleFragmentQueryGraphQL, { id })

  if (!data.film) return <div>Film not found</div>
  return <FilmPeople film={data.film} />
}
