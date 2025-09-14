import { useFilmPlanetsPageQuery } from "../queries/FilmPlanetsPageQuery"
import { FilmPlanets } from "../components/FilmPlanets"

export const FilmPlanetsPage = () => {
  const res = useFilmPlanetsPageQuery()
  if (!res.query.film) throw new Response("Not Found", { status: 404 })

  return <FilmPlanets film={res.query.film} />
}
