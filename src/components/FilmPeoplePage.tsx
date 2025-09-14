import { useFilmPeoplePageQuery } from "../loaders/FilmPeoplePage"
import { FilmPeople } from "./FilmPeople"

export const FilmPeoplePage = () => {
  console.log("🎬 FilmPeoplePage rendering...")

  const queryResult = useFilmPeoplePageQuery()
  console.log("🎬 Query result:", queryResult)

  const {
    query: { film },
  } = queryResult
  console.log("🎬 Film data:", film)

  // With Suspense boundary, we should either have data or suspend
  // If we reach here but film is null, it means the query returned null data (not loading)
  if (!film) {
    console.error("🎬 Film not found in query result")
    return <div>Film not found</div>
  }

  console.log("🎬 Rendering FilmPeople with film:", film.title)
  return <FilmPeople film={film} />
}
