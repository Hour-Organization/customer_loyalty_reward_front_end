# KhmerShop frontend

The React storefront and admin console for KhmerShop, a Cambodian e-commerce shop built around loyalty:
points, Bronze to Platinum tiers, rewards, badges, referrals and campaigns. It talks to the FastAPI backend
(`customer_loyalty_reward_fastapi_back_end`) through `src/data/api.ts`.

## Run it

Tooling is Node 22 and pnpm 10 (`.mise.toml`).

```bash
pnpm install
echo "VITE_API_URL=http://localhost:8000/api" > .env.local   # where the API runs
pnpm dev                                                      # http://localhost:8443
```

Or run it in Docker with `docker compose up`, also on port 8443. Typecheck with `pnpm exec tsc --noEmit`; `pnpm build`
writes `dist/`, which `.github/workflows/deploy-pages.yml` publishes to GitHub Pages.

Demo sign-ins come from the backend's seed data: `customer@example.com` at `/login` and `test@example.com`
at `/backend/login`, both with the password `password`.

## Docs

- [CLAUDE.md](CLAUDE.md): read before changing code; the store, routing and UI conventions, and how to add a page.
- [AGENTS.md](AGENTS.md): the Figma Make scaffold this project started from; dev server, styling and project layout.
- [Project brief](src/imports/pasted_text/project-brief.md): the original product brief; use it for business rules
  and module scope, not for the stack (it describes Laravel and MongoDB).
