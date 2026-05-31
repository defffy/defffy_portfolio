# CLAUDE.md

## Dependencies

Never run `pnpm install`, `pnpm add`, `npm install`, or any package manager commands directly on the host. All dependency operations must go through Docker Compose:

- Install all deps: `docker compose run --rm install`
- Add a package: `docker compose run --rm install <package-name>`

node_modules lives in a Docker volume and does not exist on the host filesystem.

## Dev & Build

- Dev server: `docker compose up dev` (serves on port 8080)
- Production build: `docker compose run --rm build` (outputs to `_site/`)

## Stack

- 11ty (Eleventy) v3 static site generator
- SCSS for styles (compiled via sass)
- TypeScript for scripts (compiled via esbuild)
- pnpm as package manager (inside the container)
- Source files live in `src/`, output goes to `_site/`
