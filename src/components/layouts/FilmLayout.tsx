import { graphql, useFragment } from "react-relay"
import { Link } from "wouter"
import { FilmLayout$key } from "../__generated__/FilmLayout.graphql"

interface Props {
  film: FilmLayout$key
  children: React.ReactNode
}

export const FilmLayout = (props: Props) => {
  const film = useFragment(
    graphql`
      fragment FilmLayout on Film {
        id
        title
      }
    `,
    props.film,
  )
  const { id } = film || {}

  if (!film) throw new Response("Film not Found", { status: 404 })

  return (
    <>
      <Link href="/">Home</Link>
      <h1>{film.title}</h1>
      <div className="nav">
        <Link href={`/film/${id}/people`}>People</Link>
        <Link href={`/film/${id}/planets`}>Planets</Link>
      </div>
      {props.children}
    </>
  )
}
