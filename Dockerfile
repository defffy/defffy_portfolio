# Pre-installs the pinned pnpm so container startup never has to reach the
# npm registry just to bootstrap the package manager.
FROM node:22-alpine

# Activate the exact pnpm version pinned in package.json's "packageManager"
# field at build time, so it's cached in the image instead of downloaded on
# every `docker compose up`.
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate

WORKDIR /src
