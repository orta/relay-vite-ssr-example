import { Environment } from "react-relay"
import { WouterRoute } from "../wouter-routes"

import { FilmsPage } from "../pages/FilmsPage"
import { loadFilmsPageQuery } from "../queries/FilmsPageQuery"

import { FilmPeoplePage } from "../pages/FilmPeoplePage"
import { loadFilmPeoplePageQuery } from "../queries/FilmPeoplePageQuery"

import { FilmPlanetsPage } from "../pages/FilmPlanetsPage"
import { loadFilmPlanetsPageQuery } from "../queries/FilmPlanetsPageQuery"

export const createWouterRoutes = (environment: Environment): WouterRoute[] => [
  {
    path: "/film/:id/people",
    component: FilmPeoplePage,
    loader: loadFilmPeoplePageQuery(environment),
  },
  {
    path: "/film/:id/planets",
    component: FilmPlanetsPage,
    loader: loadFilmPlanetsPageQuery(environment),
  },
  {
    path: "/",
    component: FilmsPage,
    loader: loadFilmsPageQuery(environment),
  },
]
