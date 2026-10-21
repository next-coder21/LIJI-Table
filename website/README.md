# LIJI Table Website

The marketing site, documentation, live playground and changelog for [LIJI Table](https://github.com/next-coder21/LIJI-Table), a framework-agnostic data table for React, Angular and Vanilla JS.

Live site: <https://lijishwilson.in/liji-table/>

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) with React 19 |
| Styling | Tailwind CSS 4 with CSS custom properties |
| Language | TypeScript 5 |
| Table packages | `@liji-table/core`, `@liji-table/react`, `@liji-table/ui` (`^0.0.10`) |
| Output | Static export (`output: "export"`), served under `/liji-table` |
| Linting | ESLint 9 with `eslint-config-next` |

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing page: hero, framework support, feature overview, comparison section and call to action |
| `/docs` | Full documentation with a searchable sidebar and a mobile docs menu |
| `/playground` | Interactive playground running the real `@liji-table/ui` table |
| `/changelog` | Release history with a version sidebar and an animated timeline |

The site also generates `robots.txt`, `sitemap.xml`, a favicon and an Open Graph image.

### Documentation sections

1. Installation
2. Quick start (Vanilla JS, React, Angular)
3. Column definition
4. `@liji-table/core` API reference
5. `@liji-table/react` API reference
6. `@liji-table/angular` (including `<liji-table>` and `<liji-table-toolbar>`)
7. `@liji-table/ui` (including `<UniversalTable />` and `<UniversalTableToolbar />`)
8. Layout persistence
9. Row and column pinning
10. Row virtualization
11. Row grouping
12. Advanced filtering (14 operators)
13. Inline cell editing and validation
14. CSS theming

### Changelog page

- Reads the repository's root `CHANGELOG.md` at build time (`lib/changelog.ts`), so adding a release entry there and rebuilding is all that is needed.
- The latest release is expanded by default and older releases are collapsed.
- The timeline has a continuous line. A white dot travels up it, turning each version marker green as it passes. The latest release marker is green and pulses. The animation is disabled when the visitor prefers reduced motion.

### Other features

- Dark theme by default, with a light theme toggle. The choice is saved in `localStorage` under `liji-theme`.
- Responsive navigation, including mobile menus for docs and versions.
- Copy-to-clipboard install commands.

## Getting started

Requirements: Node.js 20 or later and npm.

```bash
cd website
npm install
npm run dev
```

Open <http://localhost:3000/liji-table>. Every route is served under the `/liji-table` base path. To use another port: `npx next dev -p 3001`.

> The site installs `@liji-table/*` from the npm registry (it is not part of the repo's npm workspaces). If `npm install` cannot find `0.0.10`, the packages have not been published yet. Publish them first, or install from the built packages in `../packages`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create the static export in `out/` |
| `npm run start` | Serve a production build (not used for the static export) |
| `npm run lint` | Run ESLint |

## Configuration

| Setting | Where | Notes |
| --- | --- | --- |
| Base path `/liji-table` | `next.config.ts` | Applied to links and assets, and exposed as `NEXT_PUBLIC_BASE_PATH` |
| `NEXT_PUBLIC_SITE_URL` | environment variable | Used by the sitemap and robots file. Defaults to `https://lijishwilson.in/liji-table` |
| Unoptimized images | `next.config.ts` | Image optimization needs a server, which a static export does not have |

## Project structure

```
website/
├── app/                 # Routes: /, /docs, /playground, /changelog, plus robots, sitemap, icon and OG image
├── components/          # Nav, Footer, Hero, DocsSidebar, ChangelogList, Playground, ThemeToggle, ...
├── lib/                 # changelog.ts (CHANGELOG.md parser) and inline-markdown.tsx
├── public/              # Static assets (logo, background)
└── next.config.ts       # Static export and base path
```

## Updating the documentation

- API docs live in `app/docs/page.tsx`. Verify every method, option and type against the package source before editing.
- Sidebar and mobile navigation entries come from the `GROUPS` array in `components/DocsSidebar.tsx`.
- The release list on `/changelog` comes from the root `CHANGELOG.md`.

## Deployment

`npm run build` writes plain static files to `out/`. Serve that folder at `/liji-table/`, for example with an nginx `alias`. No Node server is needed.

## License

MIT © 2026

---

**Built by Lijish for developers who need powerful tables without the bloat**
