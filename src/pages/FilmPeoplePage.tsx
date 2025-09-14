import { useFilmPeoplePageQuery } from "../queries/FilmPeoplePageQuery"
import { FilmPeople } from "../components/FilmPeople"
import { FilmLayout } from "../components/layouts/FilmLayout"

export const FilmPeoplePage = () => {
  const queryResult = useFilmPeoplePageQuery()
  const film = queryResult.query.film

  // With Suspense boundary, we should either have data or suspend
  // If we reach here but film is null, it means the query returned null data (not loading)
  if (!film) return <div>Film not found</div>

  return (
    <FilmLayout film={film}>
      <FilmPeople film={film} />
    </FilmLayout>
  )
}
