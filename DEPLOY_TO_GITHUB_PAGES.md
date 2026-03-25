# `freetool.online` GitHub Pages Deployment

Updated: 2026-03-20

## Overview

This repo is now built as a static Vite + React SPA and deployed to GitHub Pages with GitHub Actions.

The frontend is Pages-safe:

- client-side routing uses `BrowserRouter` with `basename` derived from `import.meta.env.BASE_URL` (same as Vite `base` / `VITE_BASE_PATH`). With the default workflow base `/`, the app matches routes at `https://freetool.online/...`. For a subpath-only build (e.g. `https://<owner>.github.io/<repo>/`), set `VITE_BASE_PATH` to `/<repo>/` via a repo variable (see below).
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

The workflow sets the browser-facing runtime values:

```yaml
VITE_BASE_PATH: ${{ vars.VITE_BASE_PATH || '/' }}
VITE_API_URL: https://service.freetool.online
VITE_CONTRACT_MANAGEMENT_API_URL: https://service.freetool.online
```

**Default:** `VITE_BASE_PATH` is **`/`** so built assets are `/assets/...`, which matches **`https://freetool.online/`** (and CloudFront at site root with origin path `/freetool.online` on `*.github.io`).

**Override (optional):** In GitHub → **Settings → Secrets and variables → Actions → Variables**, set **`VITE_BASE_PATH`** to **`/freetool.online/`** (include trailing slash) if you need a build that only works at **`https://<owner>.github.io/freetool.online/`** without a custom domain at root.

## CloudFront in front of GitHub Pages (optional)

If you put a CloudFront distribution in front of `*.github.io`:

1. **Origin domain:** `dangkhoaow.github.io` (your user/org host).
2. **Origin path:** `/freetool.online` — **no trailing slash** (AWS: [Origin path](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistValuesOrigin.html) must not end with `/`).
3. **Protocol:** `HTTPS only` to the origin is recommended for GitHub Pages.
4. **Default root object:** set to `index.html` on the distribution so viewer requests to `/` map to the SPA entry.
5. **SPA deep links:** GitHub Pages has no server rewrite for arbitrary paths. Add a **custom error response** (404/403 → `/index.html` with 200) or a **CloudFront Function** on viewer-request that rewrites non-file paths to `/index.html` (same idea as API Gateway / S3 SPA hosting).

**“There isn’t a GitHub Pages site here”** on `https://xxxx.cloudfront.net/` means CloudFront asked GitHub for the **account root** `https://dangkhoaow.github.io/` (no project path). You can prove it from your machine:

```bash
# Must be 200 — this is where the site lives
curl -sI "https://dangkhoaow.github.io/freetool.online/" | head -3

# Will be 404 — same message as CloudFront if the origin path is missing/wrong
curl -sI "https://dangkhoaow.github.io/" | head -3
```

### CloudFront checklist (when that 404 persists)

Work through these in order; most issues are **wrong origin on the behavior** or **origin path not saved** on the origin that is actually used.

1. **Behaviors → Default (`*`) → Origin / origin group**  
   Note the **exact origin name** (e.g. `Custom-dangkhoaow.github.io`). Every path you test must use **that** origin.

2. **Origins → open that same origin → Origin path**  
   - Must be exactly: **`/freetool.online`** (leading `/`, **no** trailing `/`).  
   - If this field is **empty**, GitHub sees `/` → 404 “no site here”.  
   - After any change, wait until the distribution status is **Deployed**.

3. **General → Default root object**  
   Set to **`index.html`** so a viewer request to `/` becomes a request for `index.html` under the origin path (i.e. the project’s `index.html` on GitHub).

4. **Invalidate**  
   Create an invalidation for **`/*`** so an old GitHub 404 is not still cached (`X-Cache: Error from cloudfront` can be a cached error).

5. **Confirm you are testing the right distribution**  
   The domain in the browser must match the distribution where you set the origin path (easy to have two distributions or an old URL bookmarked).

### Plan B: viewer-request function (only if origin path still does not apply)

Use **either** origin path **`/freetool.online`** **or** this function — **not both** (you would double-prefix the path).

1. Set the origin’s **Origin path** to **empty**.
2. Attach a **CloudFront Function** on **viewer request** (same behavior as `*`):

```javascript
function handler(event) {
  var request = event.request;
  var uri = request.uri || "/";
  var prefix = "/freetool.online";
  if (uri === "/" || uri.indexOf(prefix) !== 0) {
    if (uri === "/") {
      request.uri = prefix + "/";
    } else if (uri.indexOf("/") === 0) {
      request.uri = prefix + uri;
    } else {
      request.uri = prefix + "/" + uri;
    }
  }
  return request;
}
```

3. Keep **Default root object** `index.html`, deploy, then **invalidate** `/*`.

**Build base vs viewer URL:** The workflow defaults to **`VITE_BASE_PATH=/`**, so HTML references **`/assets/...`**. Keep CloudFront **origin path** **`/freetool.online`** on `dangkhoaow.github.io` so a viewer request to `/assets/...` becomes `/freetool.online/assets/...` on GitHub. If you instead build with **`VITE_BASE_PATH=/freetool.online/`** (repo variable), asset URLs include that prefix—only use that when the browser’s path also includes `/freetool.online/` (e.g. direct `github.io` project URL without root CDN).

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
# Match production (custom domain root):
export VITE_BASE_PATH=/
export VITE_API_URL="https://service.freetool.online"
export VITE_CONTRACT_MANAGEMENT_API_URL="https://service.freetool.online"
npm run build
```

For a subpath-only build (github.io project URL):

```bash
export VITE_BASE_PATH="/freetool.online/"
npm run build
```

For local dev, run:

```bash
npm run dev
```

Deep links (default base `/`) look like:

```text
https://freetool.online/projly/login
```

With a subpath build (`VITE_BASE_PATH=/freetool.online/`), use `https://<owner>.github.io/freetool.online/projly/login`. Legacy `#/...` URLs are still redirected once to the clean path.

Hard refresh on a deep link still needs either GitHub Pages `404.html` tricks or CloudFront custom errors / a rewrite function, because the server must return `index.html` for unknown paths.

## Code Editor Notes

The code editor no longer depends on local Next.js filesystem routes.

Supported browser-side flows:

- open folder from the File System Access API
- save files to the browser-selected folder
- export project content as a ZIP in the browser
- fall back to the virtual workspace tree when disk access is not available

## Troubleshooting

### Push rejected: `workflow` scope / `deploy-pages.yml`

If `git push` fails with:

```text
refusing to allow a Personal Access Token to create or update workflow
`.github/workflows/deploy-pages.yml` without `workflow` scope
```

GitHub requires extra permission for any change under `.github/workflows/`.

1. **Classic PAT:** [GitHub → Settings → Developer settings → PATs](https://github.com/settings/tokens) → generate new token → enable **`workflow`** (and **`repo`** for private repos).
2. **Fine-grained PAT:** create a token for this repo with **Contents: Read and write** and **Workflows: Read and write**.
3. **Update stored credentials on macOS:** open **Keychain Access**, search `github`, remove the old `github.com` item (or use **Git Credential Manager** / `gh auth login` to replace the password with the new token).
4. Push again: `git push origin migrate-fe` (or your branch).

**Alternative:** use **SSH** (`git@github.com:dangkhoaow/freetool.online.git`) if your machine already has a GitHub SSH key; SSH pushes are not limited by PAT scopes.

---

- If assets 404 (e.g. requests to `/freetool.online/assets/...` on `freetool.online`), the deployed build still used a subpath base—confirm CI logs show `VITE_BASE_PATH=/` and invalidate CloudFront. If `github.io/<repo>/` 404s assets, set repo variable `VITE_BASE_PATH` to `/<repo>/`.
- If API calls fail from the Pages site, confirm the backend CORS allowlist includes the Pages origin.
- If websocket or auth redirects fail, verify the backend origin matcher and cookie domain settings.
- If the GitHub Pages build fails, run the same `npm ci --legacy-peer-deps && npm run build` sequence locally first.
