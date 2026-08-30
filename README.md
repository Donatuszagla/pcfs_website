# Paradise City of Faith Sanctuary website

Production-oriented local implementation of the PCFS public website and self-hosted CMS. The system uses three independent Yarn applications; there is intentionally no root workspace.

## Applications

- `website/` — React, Vite and TypeScript public site with custom Express SSR, React streaming and hydration.
- `admin/` — React, Vite and TypeScript administration interface.
- `backend/` — Express, Apollo GraphQL, MongoDB, Argon2id authentication, MinIO uploads and SMTP notifications.

The source document is used as content input only. Temporary imagery and unresolved data are visibly marked and must be replaced before launch.

## Quick start with Docker

1. Copy `.env.example` to `.env` and replace both JWT secrets.
2. Run `docker compose up --build -d`.
3. Seed the supplied content:

   ```sh
   docker compose exec backend yarn seed
   ```

4. Create the first administrator exactly once:

   ```sh
   docker compose exec \
     -e ADMIN_EMAIL=administrator@example.org \
     -e ADMIN_NAME="PCFS Administrator" \
     -e ADMIN_PASSWORD="use-a-long-unique-passphrase" \
     backend yarn bootstrap-admin
   ```

5. Open the public site at `http://localhost:4173`, admin at `http://localhost:4174`, Mailpit at `http://localhost:8025`, and MinIO console at `http://localhost:9001`.

## Local development

Run commands independently in each directory:

```sh
cd backend && yarn install && yarn dev
cd website && yarn install && yarn dev
cd admin && yarn install && yarn dev
```

The default API is `http://localhost:4000/graphql`. Copy each application’s `.env.example` when overriding local settings.

## Verification

Run these four commands in each application:

```sh
yarn lint
yarn type-check
yarn test
yarn build
```

Then run `docker compose config` and `docker compose up --build -d` for the infrastructure smoke test.

## Security and release notes

- Refresh tokens are rotating, stored only in secure HTTP-only cookies, and revoked on use/logout.
- Access tokens are short-lived and permissions are enforced in backend services.
- Contact records are stored before SMTP delivery. Delivery failures remain visible for retry.
- Production contact submissions require Cloudflare Turnstile configuration.
- Uploads accept JPEG, PNG or WebP up to 10 MB, require alt text, and generate 480, 960 and 1600 pixel WebP variants.
- Configure real origins, TLS, secrets, bucket access policy, SMTP credentials and official media before deployment.

See [administrator guide](docs/administrator-guide.md), [backup and restore](docs/backup-restore.md), and [launch handover](docs/handover-checklist.md).
# pcfs_website
