# `freetool.online` GitHub Pages Deployment

Updated: 2026-03-20 21:05

## Overview

This repo is now built as a static Vite + React SPA and deployed to GitHub Pages with GitHub Actions.

The frontend is Pages-safe:

- client-side routing uses `BrowserRouter` with `basename` derived from `import.meta.env.BASE_URL` (same as Vite `base` / `VITE_BASE_PATH`) so routes match under `https://<owner>.github.io/<repo>/`
- `src/router/hash-path.ts` strips that public path prefix when reading `window.location` and adds it back for full-page navigations and `<a href>` targets
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

## CloudFront in front of GitHub Pages (optional)

If you put a CloudFront distribution in front of `*.github.io`:

1. **Origin domain:** `dangkhoaow.github.io` (your user/org host).
2. **Origin path:** `/freetool.online` — **no trailing slash** (AWS: [Origin path](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistValuesOrigin.html) must not end with `/`).
3. **Protocol:** `HTTPS only` to the origin is recommended for GitHub Pages.
4. **Default root object:** set to `index.html` on the distribution so viewer requests to `/` map to the SPA entry.
5. **SPA deep links:** GitHub Pages has no server rewrite for arbitrary paths. Add a **custom error response** (404/403 → `/index.html` with 200) or a **CloudFront Function** on viewer-request that rewrites non-file paths to `/index.html` (same idea as API Gateway / S3 SPA hosting).

**“There isn’t a GitHub Pages site here”** on `https://xxxx.cloudfront.net/` means CloudFront asked GitHub for the **account root** `https://dangkhoaow.github.io/` (no project path). Fix: confirm the **default cache behavior** uses the origin that has **Origin path** `/freetool.online`, set **Default root object** to `index.html`, then **invalidate** `/*`.

**Build base vs viewer URL:** This workflow builds with `VITE_BASE_PATH=/freetool.online/`, so HTML references assets as `/freetool.online/assets/...`. On the GitHub Pages URL that is correct. If your **viewer** URL is the CloudFront root with **no** `/freetool.online` prefix, you either:

- rebuild with `VITE_BASE_PATH=/` for that distribution (origin path still `/freetool.online` so files are fetched from the right place on GitHub), or  
- keep the current build and ensure viewer URLs include the same prefix as the build (or add rewrite rules so `/freetool.online/*` on the viewer maps correctly).

## GitHub Pages Workflow

The workflow lives at `.github/workflows/deploy-pages.yml`.

High-level flow:

1. Push to `migrate-fe` or `main`.
2. GitHub Actions checks out the repo and installs dependencies.
3. Vite builds the SPA into `dist/`.
4. The `dist/` folder is uploaded as the Pages artifact.
5. GitHub Pages publishes the artifact.

Both branches deploy the same GitHub Pages site, so the latest successful push wins. `migrate-fe` is the working branch for migration validation, and `main` remains the release branch after merge.

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

Deep links use the path **after** the repo prefix (legacy `#/...` URLs are still redirected once to the clean path):

```text
https://<owner>.github.io/freetool.online/projly/login
```

Hard refresh on a deep link still needs either GitHub Pages `404.html` tricks or CloudFront custom errors / a rewrite function, because the server must return `index.html` for unknown paths.

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
