# Quill — Frontend

A calm, editorial microblog UI for the microservices backend. Built with
**React + Vite + Tailwind CSS**.

## Design at a glance

- **Concept:** a quiet, deliberate feed you read top to bottom.
- **Signature:** a continuous hairline *timeline rail* threading every post,
  with mono timestamps anchored to it.
- **Type:** Fraunces (display), Inter (UI), JetBrains Mono (metadata).
- **Palette:** warm paper, ink, one indigo accent.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

The dev server proxies `/v1/*` to the API gateway (default
`http://localhost:3000`; override with `VITE_GATEWAY_URL`). Start the backend
with `docker compose up` from the repo root first.

```bash
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle locally
```

## Structure

```
src/
  lib/         api client (token refresh) + formatters
  context/     auth + toast providers
  components/  Layout, PostCard (timeline node), Composer, AuthShell, …
  pages/       Login, Register, Feed, PostDetail, Search, Profile, NotFound
```

## What it talks to

Everything goes through the gateway under `/v1`: auth (`/auth`), posts
(`/posts`), media (`/media`), search (`/search`). Access token is kept in
memory; the refresh token lives in `localStorage` and the API client refreshes
transparently on a 401.
