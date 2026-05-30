# defffy.com

## Docker Compose

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Commands

| Command | Description |
| --- | --- |
| `docker compose up dev` | Start the dev server on port 8080 |
| `docker compose run install` | Install all dependencies from the lockfile |
| `docker compose run install <pkg>` | Add a specific package |
| `docker compose run build` | Run a production build |

All services share a `node_modules` volume, so changes from one command are visible to the others.

### Workflow

1. Start the dev server in one terminal:

   ```sh
   docker compose up dev
   ```

2. In a second terminal, install a package:

   ```sh
   docker compose run install react
   ```

3. Restart the dev server to pick up the new dependency:

   ```sh
   docker compose restart dev
   ```
