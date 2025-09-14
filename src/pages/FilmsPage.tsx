import { useFilmsPageQuery } from "../queries/FilmsPageQuery"
import { Films } from "../components/Films"

export const FilmsPage = () => {
  const { query } = useFilmsPageQuery()
  return <Films query={query} />
}
