# Share Yarana

Share Yarana is a free social travel demo for finding trips, hosting plans and travelling together. It uses fictional travellers and sample trips. Published demo trips, requests, drafts and bookmarks are stored in the browser. Data is scoped to the browser profile and site address.

The Community page also previews photo posts; accepted travellers can leave trip feedback, and group members can add one-time location pins to Group Chat. These contributions stay in this browser and are not published online. Reset Demo Data removes them while keeping drafts and bookmarks. Photo uploads are resized and re-encoded locally without embedded metadata; the original file is never stored or transmitted.

**Find your people. Share the adventure.** The intended production address is `https://shareyarana.com`. Opening a different site address starts with that origin’s own browser storage. Existing data stays available at the address where it was saved.

Use the [five-minute tester guide](docs/DEMO_TESTING_GUIDE.md) for usability sessions. The [design blueprint](docs/DESIGN_BLUEPRINT.md), [connected demo report](docs/CONNECTED_DEMO_REPORT.md) and [frontend audit](docs/FRONTEND_AUDIT_REPORT.md) describe the existing app.

## Run locally

Use a Node.js version covered by `package.json`, such as Node.js 22.13 or later in the 22.x line. The project uses npm and the checked-in lockfile. It requires no app environment variables.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. Use HTTPS when testing from a phone over a network. The interactive demo needs Web Locks, which modern browsers expose in secure contexts. A plain HTTP address on the local network may load the site but prevent demo writes. [Web Locks specification](https://w3c.github.io/web-locks/)

## Verify the build

```sh
npm run lint
npm run typecheck
npm run build
node scripts/check-community-model.cjs
```

To test the production build, start it in its own terminal with `npm start -- --port 3100`. The browser regression targets `http://127.0.0.1:3100` by default. It uses Playwright, which can be installed outside the project. For example, on PowerShell run:

```powershell
$demoTestTools = Join-Path $env:TEMP "share-yarana-test-tools"
npm install --prefix $demoTestTools playwright
$env:NODE_PATH = Join-Path $demoTestTools "node_modules"
$env:PLAYWRIGHT_SKIP_BROWSER_GC = "1"
node (Join-Path $env:NODE_PATH "playwright/cli.js") install chromium
node scripts/check-community-browser.cjs
node scripts/check-auth-browser.cjs
node scripts/check-social-browser.cjs
```

Set `SIDETRAIL_TEST_URL` to test an authorized HTTPS demo URL. Use a base URL without a trailing slash. The runner starts a separate browser context and exercises local creation, requests, approvals, cancellation and reset. To test Firefox or WebKit, install that browser with the same Playwright CLI and set `SIDETRAIL_BROWSER` to `firefox` or `webkit`. Test artifacts are written to the system temporary directory.

## Run on Render

The app runs on the existing Render Node.js Web Service with the standard Next.js build and start scripts. The build command is `npm ci && npm run build` and the start command is `npm start`. Canonical URLs point to the intended production domain while navigation and browser storage continue to use the current address. [Render’s Next.js guide](https://render.com/docs/deploy-nextjs-app)

## Deploy to Vercel

1. When ready to publish, put the reviewed workspace changes on the GitHub branch you intend to deploy. Confirm that the revision includes the connected demo and its latest fixes. Pushing to a connected production branch can trigger a deployment. [Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github)
2. In the Vercel dashboard, choose **Add New → Project** and import **DropXpert/Travel**. For an existing connected project, use that project and check the branch selected for Production. [Vercel Git import](https://vercel.com/docs/git)
3. Use these settings and start the deployment when the revision is ready. Vercel supports the standard Next.js App Router build and image optimizer. [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)

   | Setting | Value |
   | --- | --- |
   | Production branch | `main`, with the reviewed demo revision |
   | Framework preset | Next.js |
   | Root directory | Repository root |
   | Install command | `npm ci` |
   | Build command | `npm run build` |
   | Output directory | Framework default, with the override off |
   | Node.js version | 26.x, currently selected by Vercel for the repository’s `engines.node` range |
   | Environment variables | None |

4. Check the build log for the Node.js version and a successful Next.js build. Vercel uses the supported version matching `engines.node` when it overrides the project setting. The framework default output serves dynamic routes alongside static pages. [Vercel Node.js version selection](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions#version-overrides-in-packagejson)
5. Copy the production HTTPS domain from the project and open it in a browser signed out of Vercel. Check that the site loads and can publish a fictional trip. Under **Settings → Deployment Protection**, **Standard Protection** keeps production domains public while protecting preview and generated deployment URLs. Share the public production domain with testers. [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection#standard-protection)
