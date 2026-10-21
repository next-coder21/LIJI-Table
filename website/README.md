# LIJI Table Website

Marketing site, documentation, live playground and changelog for [LIJI Table](https://github.com/next-coder21/LIJI-Table), the framework-agnostic data table for React, Angular and Vanilla JS.

Built with Next.js (App Router), React and Tailwind CSS, and deployed as a static export under `/liji-table`.

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing page: hero, framework support, feature overview and comparison |
| `/docs` | Full documentation with a searchable sidebar and a mobile docs menu |
| `/playground` | Interactive playground to try the table live |
| `/changelog` | Release history with an animated timeline |

## What's new

- **Expanded docs**: new sections for state persistence, row and column pinning, row virtualization (100k+ rows), row grouping, advanced filtering (all 15 operators), inline cell editing and validation, and CSS theming.
- **Toolbar reference**: input/output and props tables for `<liji-table-toolbar>` (Angular) and `<UniversalTableToolbar />` (React).
- **Changelog**: the latest release is expanded by default and older releases are collapsed. The timeline has a continuous line, a white dot that travels up it turning each version marker green, and a green pulsing marker for the latest release.
- **Navigation**: the sidebar and mobile docs menu list every section, and the redundant "skip to main content" link has been removed.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000/liji-table](http://localhost:3000/liji-table). Because the site uses `basePath: "/liji-table"`, every route is served under that prefix. To use another port, run `npx next dev -p 3001`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create the static export in `out/` |
| `npm run start` | Serve a production build |

## Project structure

```
website/
├── app/            # Routes: home, docs, playground, changelog
├── components/     # UI: Nav, DocsSidebar, ChangelogList, Playground, ...
├── lib/            # Changelog parser and inline markdown renderer
└── next.config.ts  # Static export + /liji-table base path
```

## Updating the changelog

The changelog page reads the repository's root `CHANGELOG.md` at build time, so add a new release entry there and rebuild the site.

## Deployment

`next.config.ts` sets `output: "export"`, so `npm run build` writes plain static files to `out/`. Serve that folder at `/liji-table/` (for example with an nginx `alias`). No Node server is needed.
