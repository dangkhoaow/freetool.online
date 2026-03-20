# `freetool.online` GitHub Pages Deployment

Updated: 2026-03-20

## Overview

This repo is now built as a static Vite + React SPA and deployed to GitHub Pages with GitHub Actions.

The frontend is Pages-safe:

- client-side routing uses `HashRouter`
- browser-only env values come from `src/runtime-env.ts`
- backend API calls go to `https://service.freetool.online`
- server-only Next route handlers under `app/api/**` were retired from the frontend repo

## Deployment Files

- `package.json`
- `vite.config.ts`
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `.github/workflows/deploy-pages.yml`
- `src/runtime-env.ts`
- `app/projly/config/apiConfig.ts`
- `lib/api-client.ts`

## Build Contract

GitHub Pages builds this repo by running:

```bash
npm ci --legacy-peer-deps
npm run build
```

The build writes to `dist/`, and the Pages workflow uploads that folder as the publish artifact.

The workflow also sets the browser-facing runtime values:

```yaml
VITE_BASE_PATH: /${{ github.event.repository.name }}/
VITE_API_URL: https://service.freetool.online
VITE_CONTRACT_MANAGEMENT_API_URL: https://service.freetool.online
```

`VITE_BASE_PATH` should match the GitHub Pages project path. If you later move the app to a custom domain root, change that value to `/`.

## GitHub Pages Workflow

The workflow lives at `.github/workflows/deploy-pages.yml`.

High-level flow:

1. Push to `main`.
2. GitHub Actions checks out the repo and installs dependencies.
3. Vite builds the SPA into `dist/`.
4. The `dist/` folder is uploaded as the Pages artifact.
5. GitHub Pages publishes the artifact.

## Backend Dependencies

The Pages site only works if `service.freetool.online` accepts the Pages origin.

The backend repo now includes the Pages origin in:

- `service.freetool.online/config/settings.json`
- `service.freetool.online/server.js`
- `service.freetool.online/middleware.ts`
- `service.freetool.online/api-server.js`
- `service.freetool.online/lib/cors/cors-helper.ts`
- `service.freetool.online/lib/websocket/websocket-server.ts`
- `service.freetool.online/app/api/cors-config/route.ts`
- `service.freetool.online/app/api/cors-auth/route.ts`
- `service.freetool.online/app/api/admin/auth/login/route.ts`
- `service.freetool.online/app/api/admin/auth/access/route.ts`
- `service.freetool.online/app/api/photo-data/authenticity/check/route.ts`

The allowlist includes:

- `https://*.github.io`
- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:5173`

## Local Validation

To test the Pages build locally:

```bash
npm ci --legacy-peer-deps
$env:VITE_BASE_PATH="/freetool.online/"
$env:VITE_API_URL="https://service.freetool.online"
$env:VITE_CONTRACT_MANAGEMENT_API_URL="https://service.freetool.online"
npm run build
```

For local dev, run:

```bash
npm run dev
```

Because the app uses `HashRouter`, deep links stay safe on GitHub Pages. For example:

```text
https://<owner>.github.io/freetool.online/#/projly/login
```

## Code Editor Notes

The code editor no longer depends on local Next.js filesystem routes.

Supported browser-side flows:

- open folder from the File System Access API
- save files to the browser-selected folder
- export project content as a ZIP in the browser
- fall back to the virtual workspace tree when disk access is not available

## Troubleshooting

- If assets 404 on GitHub Pages, check `VITE_BASE_PATH`.
- If API calls fail from the Pages site, confirm the backend CORS allowlist includes the Pages origin.
- If websocket or auth redirects fail, verify the backend origin matcher and cookie domain settings.
- If the GitHub Pages build fails, run the same `npm ci --legacy-peer-deps && npm run build` sequence locally first.
