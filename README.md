# Relay Vite SSR Example

A complete example of server-side rendering with React, Relay, and Vite using Wouter for routing. This demonstrates the Puzzmo tech stack / Artsy Omakase approach to SSR.

**Special thanks to the excellent guide at [aqora.io](https://aqora.io/blog/implementing-streaming-ssr-with-react-relay-and-vite-899908) which provided the foundation for this implementation.**

## Uses

- **Vite** for fast development and building
- **Fastify** server with streaming SSR
- **React Relay** for GraphQL data management
- **Wouter** for routing
- **Store hydration** from server to client

## Try it

```bash
yarn install
yarn dev
```

Then open <http://localhost:8082> to see the app. It's not too pretty but the links work.

## Architecture Overview

### Route System

All routes are centrally defined in [`src/app/routes.ts`](src/app/routes.ts) and used by both:

- **Client-side routing**: Dynamic route generation in the React app
- **Server-side matching**: Route resolution for SSR and data loading

### Data Loading Pattern

Each page uses `useGetMainPageQuery` which handles both:

- **SSR hydration**: Uses preloaded data when available
- **Client navigation**: Falls back to cache-first GraphQL queries

---

## How It Works

### Server-Side Rendering (Initial `/` Request)

When you first visit `/`, here's what happens:

#### 1. **Route Matching & Data Loading**

```text
Browser → GET / → Fastify Server
                     ↓
              createWouterRoutes(environment)
                     ↓
              matchRoute('/', routes)
                     ↓
              Found: FilmsPage + loadFilmsPageQuery
                     ↓
              Execute loader → GraphQL query → SWAPI
                     ↓
              loaderData = { graphql, variables, query }
```

#### 2. **SSR Rendering**

```text
Server creates RelayEnvironment with fresh RecordSource
         ↓
renderToPipeableStream(<App />)
         ↓
FilmsPage renders → useNewFilmsPageQuery()
         ↓
useGetMainPageQuery finds SSR data → useLazyLoadQuery with store data
         ↓
Relay renders with preloaded fragments
         ↓
HTML streams to browser with:
- Rendered React components
- <script>window.__RECORD_SOURCE = {...}</script>
- <script>window.__LOADER_DATA = {...}</script>
```

#### 3. **Client Hydration**

```text
Browser loads JavaScript
         ↓
Client creates RelayEnvironment
         ↓
RecordSource.fromJSON(window.__RECORD_SOURCE)
         ↓
<App initialLoaderData={window.__LOADER_DATA} />
         ↓
React hydrates → FilmsPage → useNewFilmsPageQuery()
         ↓
useGetMainPageQuery finds loaderData → uses cached store data
         ↓
No additional network requests needed
```

### Client-Side Navigation (e.g., `/` → `/film/1/people`)

When navigating between pages after initial load:

#### 1. **Route Change Detection**

```text
User clicks link → Wouter updates location
         ↓
WouterApp.tsx useEffect detects location change
         ↓
createWouterRoutes(environment)
         ↓
matchRoute('/film/1/people', routes)
         ↓
Found: FilmPeoplePage + loadFilmPeoplePageQuery
```

#### 2. **Client-Side Data Context**

```text
Extract loader metadata:
- graphql: FilmPeoplePageQuery
- variables: { id: "1" }
         ↓
setCurrentLoaderData({ graphql, variables })
         ↓
WouterLoaderProvider updates context
```

#### 3. **Component Rendering**

```text
FilmPeoplePage renders
         ↓
useFilmPeoplePageQuery()
         ↓
useParams() gets { id: "1" } from router
         ↓
useGetMainPageQuery(Query, { id: "1" })
         ↓
useLazyLoadQuery with fetchPolicy: "store-or-network"
         ↓
Cache miss → GraphQL request → SWAPI
         ↓
New data renders, fragments stay connected
```

### Key Benefits

- **No conditional hooks**: All query hooks follow React's rules consistently
- **Fragment preservation**: Navigation doesn't break fragment ownership chains
- **Cache-first**: Relay checks store before making network requests
- **Unified routing**: Same route definitions power both SSR and client routing
- **Type safety**: Full TypeScript support throughout the data loading pipeline

### File Structure

```text
src/
├── app/
│   ├── routes.ts           # Central route definitions
│   ├── App.tsx            # Main app component
│   └── useSSRDataContext.tsx  # SSR data context
├── components/            # React components with fragments
├── pages/                # Route components
├── queries/              # GraphQL queries & generated types
├── wouter-routes.tsx     # Route matching utilities
├── wouter-server.tsx     # SSR rendering logic
└── environment.ts        # Relay environment setup
```

This architecture ensures that both SSR and client-side navigation work seamlessly while maintaining proper GraphQL fragment relationships and avoiding unnecessary network requests.
