import { useFilmsPageQuery, useNewFilmsPageQuery } from "../queries/FilmsPageQuery"
import { Films } from "../components/Films"

export const FilmsPage = () => {
  // const { query } = useFilmsPageQuery()
  const { query } = useNewFilmsPageQuery()
  return <Films query={query} />
}
