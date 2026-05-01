# Changelog

## 2026-05-01 — Deployment & Layout Fixes

Four bugs were discovered while diagnosing "works locally, broken when deployed."
Three of them stop the production build from functioning at all (broken routing,
broken assets, broken API URLs). The fourth makes the desktop layout look
nonsensical even in development.

---

### 1. Router ignored the deploy base path

**File:** [`src/router/index.ts`](src/router/index.ts)

**Before**

```ts
const router = createRouter({
  history: createWebHistory(),
  routes
})
```

**After**

```ts
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})
```

**Why it broke deployment.** `createWebHistory()` defaults its base to `/`. When
the site is deployed under a subpath — e.g. GitHub Pages at
`https://user.github.io/happyfri-vue3/` with `VITE_PUBLIC_BASE=/happyfri-vue3/`
— Vite emits assets under that subpath but the router still listens at `/`. So
the very first navigation (the index URL) doesn't match any route and the page
renders blank.

`import.meta.env.BASE_URL` is populated by Vite from the `base` option in
[`vite.config.ts`](vite.config.ts), which itself reads `VITE_PUBLIC_BASE`.
Passing it to `createWebHistory` keeps the router and the asset pipeline aligned.

**Local dev was unaffected** because `VITE_PUBLIC_BASE` defaults to `/`.

---

### 2. Hardcoded `/static/img/...` paths in the home background

**File:** [`src/views/HomeView.vue`](src/views/HomeView.vue)

**Before**

```ts
onMounted(() => {
  document.body.style.backgroundImage =
    "url('/static/img/1-1.webp'), url('/static/img/1-1.jpg')"
})
```

**After**

```ts
onMounted(() => {
  const base = import.meta.env.BASE_URL
  document.body.style.backgroundImage =
    `url('${base}static/img/1-1.webp'), url('${base}static/img/1-1.jpg')`
})
```

**Why it broke deployment.** The `/static/...` URL is anchored to the site
root. Under any subpath deploy the browser fetches
`https://user.github.io/static/img/1-1.jpg` instead of
`https://user.github.io/happyfri-vue3/static/img/1-1.jpg`, and the request
404s.

Templates and `<img src>` references are rewritten by Vite automatically, but
strings assigned at runtime (like this one in `onMounted`) are not — they have
to use `import.meta.env.BASE_URL` explicitly.

---

### 3. `.env.development` produced a doubled `/api/api/...` URL

**File:** [`.env.development`](.env.development)

**Before**

```
VITE_API_BASE_URL=/api
```

**After**

```
# Empty so the dev server's /api proxy in vite.config.ts handles requests
# (the API client already prepends /api/... to the path).
VITE_API_BASE_URL=
```

**Why it was buggy.** The API client at
[`src/api/quiz.ts:10`](src/api/quiz.ts) already prepends `/api/parse-questions`
to whatever `VITE_API_BASE_URL` is. With `VITE_API_BASE_URL=/api` the resulting
URL becomes `/api/api/parse-questions`, which doesn't exist on the backend.

The bug was masked locally because the README instructs developers to copy
`.env.example` to `.env.local`, and `.env.local` overrides `.env.development`.
Anyone running the project without that personal override hit the bug
immediately.

With the value cleared, dev requests go to the relative `/api/parse-questions`
URL, which the Vite proxy in
[`vite.config.ts`](vite.config.ts) forwards to `http://127.0.0.1:8000`. In
production, you set `VITE_API_BASE_URL=https://your-backend-domain.com` (via
`.env.production` or your hosting provider) and the call becomes
`https://your-backend-domain.com/api/parse-questions`.

---

### 4. Mobile rem adapter inflated root font-size on desktop

**File:** [`src/config/rem.ts`](src/config/rem.ts)

**Before** (only the relevant body)

```ts
const recalc = () => {
  const clientWidth = docEl.clientWidth;
  if (!clientWidth) return;
  const fontSize = 20 * (clientWidth / 320);
  docEl.style.fontSize = `${fontSize}px`;
};
```

**After**

```ts
const MOBILE_BREAKPOINT = 640;

const recalc = () => {
  const clientWidth = docEl.clientWidth;
  if (!clientWidth) return;

  if (clientWidth >= MOBILE_BREAKPOINT) {
    docEl.style.fontSize = '';
    return;
  }

  const fontSize = 20 * (clientWidth / 320);
  docEl.style.fontSize = `${fontSize}px`;
};
```

**Why the layout looked strange.** The adapter is a mobile-first technique:
`html { font-size: 20px }` at a 320px viewport, scaling linearly so 1rem grows
with the screen. On a 1920px desktop browser, the formula yields a 120px root
font — and any element without an explicit `font-size` (default text, native
form controls, the file input on `/upload`, etc.) inherits that and looks
gigantic.

The clamp at `MOBILE_BREAKPOINT = 640` leaves the desktop alone (clearing the
inline `font-size` so the browser default of 16px takes over) while phones
still get the rem scaling.

---

## What you still need to set up for deployment

These are configuration tasks the code alone can't fix — you handle them on
your hosting provider:

- Set **`VITE_API_BASE_URL`** to your deployed backend's URL (e.g.
  `https://happyfri-backend.onrender.com`). Without it, the built site has no
  idea where to find the API.
- If deploying under a subpath (GitHub Pages with a project repo), set
  **`VITE_PUBLIC_BASE=/<repo-name>/`**.
- Add an SPA fallback so direct navigation to `/upload`, `/score`, etc. doesn't
  404:
  - **Vercel:** add `vercel.json` with a rewrite of all paths to `/index.html`.
  - **Netlify:** add a `_redirects` file: `/* /index.html 200`.
  - **GitHub Pages:** copy `index.html` to `404.html` after `npm run build`.

## Other observations (not fixed)

These didn't break deployment, but worth knowing:

- [`backend/app/main.py:9`](backend/app/main.py) sets
  `allow_origins=["*"]` together with `allow_credentials=True`. Browsers
  reject this combination on credentialed requests; it's currently silent
  because the frontend doesn't send credentials.
- [`src/api/quiz.ts`](src/api/quiz.ts) imports raw `axios` instead of using
  the configured instance from
  [`src/config/ajax.ts`](src/config/ajax.ts) — code smell, no functional
  impact.
- `vite-plugin-compression` is in devDependencies but never registered in
  [`vite.config.ts`](vite.config.ts) — dead dependency.
- `1-1.webp` is referenced from `HomeView.vue` but missing from
  `public/static/img/`; the browser falls back to the `.jpg` silently.
