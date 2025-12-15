# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands

### Install
```pwsh
npm ci
# (or) npm install
```

### Dev server (Next.js)
```pwsh
npm run dev
# http://localhost:3000
```

### Lint
```pwsh
npm run lint

# lint a single file (or glob)
npx eslint app/dashboard/page.tsx
```

### Tests
- No Jest/Vitest/Playwright/Cypress configuration was found in this repo.
- Use `npm run build` + manual flows in the UI, or the API smoke tests below.

### Production build / run
```pwsh
npm run build
npm run start
```

### Smoke testing the backend API (out of band)
This repo includes ad-hoc API smoke tests that hit the backend directly (not through Next.js).

- Bash script: `scripts/smoke.sh` (requires `bash`, `curl`, `jq`)
  - It uses `API_URL="http://localhost:3001/api/v1"` inside the script; adjust if your backend differs.

- PowerShell notes: `testRunGuide`
  - Shows how to login to `http://localhost:5000/v1/auth/login`, extract `data.token` into `$TOKEN`, and call protected endpoints with `Authorization: Bearer $TOKEN`.

## High-level architecture

### Framework and routing
- Next.js App Router lives under `app/`.
- Main route groups (pages):
  - Auth: `app/auth/page.tsx`, `app/auth/register/page.tsx`
  - Core app: `app/dashboard/page.tsx`, `app/orders/page.tsx`, `app/orders/create/page.tsx`, `app/orders/[id]/page.tsx`, `app/invoices/page.tsx`, `app/wallet/page.tsx`
- Global layout: `app/layout.tsx`
  - Wraps everything with `app/providers.tsx`, renders `components/Navbar.tsx`, and mounts app-wide UI like `components/TopupModal.tsx`.

### API access pattern (Axios + Next rewrite proxy)
- `lib/api.ts` exports a preconfigured Axios client:
  - `baseURL: '/api/v1'`
  - Request interceptor reads the `token` cookie and sets `Authorization: Bearer <token>`.
  - Response interceptor maps backend error codes (e.g. `INSUFFICIENT_BALANCE`, `UNAUTHORIZED`) to UI behavior.

- `next.config.js` defines a rewrite:
  - `/api/v1/:path*` -> `${process.env.NEXT_PUBLIC_API_URL}/v1/:path*`
  - Practical effect: frontend code calls `/api/v1/...` and Next proxies to the backend, avoiding CORS during local dev.
  - Ensure `NEXT_PUBLIC_API_URL` is set (commonly via `.env.local`).

### Auth model (cookies + middleware)
- Auth state is managed by Zustand in `stores/useAuthStore.ts`.
  - `setAuth()` writes `token` and `user` to cookies.
  - `initAuth()` hydrates Zustand state from cookies.
- `app/providers.tsx` calls `initAuth()` on mount so client components can rely on `useAuthStore().isInitialized`.
- `middleware.ts` is the main route guard:
  - Reads `token` from cookies.
  - Treats `/auth` and `/auth/register` as public.
  - Redirects unauthenticated users to `/auth` and authenticated users away from auth pages to `/dashboard`.

### Data fetching and caching
- TanStack Query is the default data fetching layer.
  - `lib/queryClient.ts` creates the shared `QueryClient`.
  - `app/providers.tsx` mounts `QueryClientProvider`.
- Pages typically call the backend via `lib/api.ts` inside `useQuery()`.

### Cross-cutting UI error handling (event-based)
This app uses browser events to trigger global UI from deep inside API code:
- `lib/api.ts` dispatches:
  - `show-topup-modal` when `error.code === 'INSUFFICIENT_BALANCE'`
  - `api-error` for other errors
- `components/TopupModal.tsx` listens for `show-topup-modal` and routes users to `/wallet`.
- `components/ErrorBoundary.tsx` listens for `api-error` and shows a temporary banner.

### UI components and styling
- Reusable primitives live in `components/ui/` (Button/Input/Card/etc).
- Styling is Tailwind-based (see `app/globals.css`, `tailwind.config.ts`).

### Type conventions
- TypeScript path alias is configured in `tsconfig.json`: `@/*` maps to the repo root.
- Shared response/type shapes live under `types/` (example: `types/dashboard.ts`).
