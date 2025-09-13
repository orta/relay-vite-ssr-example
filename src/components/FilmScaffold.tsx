import { useFilmScaffoldQuery } from "../loaders/FilmScaffold";
import { Link } from "wouter";
// Note: Wouter doesn't have Outlet, we'll need to handle this differently

export const FilmScaffold = () => {
  const {
    query: { film },
    variables: { id },
  } = useFilmScaffoldQuery();
  if (!film) {
    throw new Response("Not Found", { status: 404 });
  }
  return (
    <>
      <Link href="/">Home</Link>
      <h1>{film.title}</h1>
      <div className="nav">
        <Link href={`/film/${id}/people`}>People</Link>
        <Link href={`/film/${id}/planets`}>Planets</Link>
      </div>
      {/* TODO: Handle nested routing without Outlet */}
    </>
  );
};
