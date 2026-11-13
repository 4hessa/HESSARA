# HESSARA

Marketing site for HESSARA, an AI-powered advisory platform. Static site built with [Astro](https://astro.build).

## Pages

| Route | Page |
| --- | --- |
| `/` | Home |
| `/platform/` | Platform |
| `/models/` | Language Models |
| `/consulting/` | AI Consulting |
| `/insights/` | Insights |
| `/resources/` | Resources |
| `/insights/<slug>/` | Insight articles (Markdown) |
| `/resources/<slug>/` | Resource documents (Markdown) |
| `/about/`, `/contact/`, `/careers/`, `/programs/` | Company pages |
| `/privacy/`, `/terms/` | Legal templates, pending review |

## Develop

```bash
npm install
npm run dev
```

```bash
npm run build
```

The build output is written to `dist/`.

## Site address, sharing and search

The public address is needed for canonical links, social preview cards (`public/og.jpg`) and the sitemap. It is resolved at build time:

- on Vercel, from `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel sets automatically
- anywhere else, from `SITE_URL`, for example:

```bash
SITE_URL=https://example.com npm run build
```

Without either, those tags and the sitemap are left out rather than pointing at a wrong address. `robots.txt` is always generated and links the sitemap when one exists.

## Linking to the application

The consulting application in `platform/` is deployed as its own Vercel project. The site's "start a consultation" buttons (Talk to an Advisor, Start Consultation, Launch Advisory Session, Book AI Session, Start a Consultation) lead into it, and Select AI Specialist leads to its agents page, once its address is set at build time:

```bash
PUBLIC_APP_URL=https://hessara-platform1.vercel.app npm run build
```

On Vercel, add `PUBLIC_APP_URL` under the `hessara` project's Environment Variables and redeploy. Without it, those buttons stay on this site, so the variable should only be set once sign-in works in the application.

## Structure

- `src/layouts/Base.astro` – page shell: navigation, hero slot, centre column, footer.
- `src/layouts/Prose.astro` – layout for long-form Markdown pages. A `draft` field in the front matter shows a notice at the top of the page.
- `src/data/site.ts` – navigation, footer links, and the public contact address (`contactEmail`, empty until confirmed).
- `src/components/ – artwork (`Art`), cards, process steps, product mock-ups, call-to-action, icons.
- `src/styles/global.css` – design tokens and all styles. The layout is drawn on a 90rem canvas (1440px design width) and scales with the viewport.
- `public/art/` – responsive hero artwork (AVIF + WebP, 1280px to 5120px wide).

## Artwork

`scripts/build-art.mjs` regenerates `public/art/` and `src/data/art.json` from greyscale master PNGs:

```bash
node scripts/build-art.mjs path/to/masters
```

Masters are named after their page (`home.png`, `platform.png`, `models.png`, `consulting.png`, `insights.png`, `resources.png`) and are not stored in the repository.

Each hero is positioned from the page's `art` prop: `kind` (`frame` shows the whole image, `fade` shows a fixed-height window), `y` (vertical offset) and a `fade` string carrying `--art-h` (window height) and the mask stops `--f1`/`--f2`/`--f3`. Heights are given in `rem`, which tracks the viewport width, so a window set to `90 / aspect` rem matches the image exactly at any screen size.

The Insights master was extended sideways from a portrait original so that the hero sits at a usable height; its dark room continues into black at both edges.

## Repository layout

This repository holds two independent builds. Each has its own `package.json` and lockfile, and neither imports from the other.

| Path | What it is | Stack | Deployment |
| --- | --- | --- | --- |
| `/` (root) | Marketing site (this README) | Astro, static | Vercel project `hessara` builds the repository root |
| `platform/` | The consulting application: accounts, consultations with a chosen model or specialised agent, critique lab, media library | Next.js, TypeScript, SQLite locally or PostgreSQL via `DATABASE_URL` | Needs its own Vercel project with **Root Directory** set to `platform`. See [`platform/README.md`](platform/README.md) |

The application's documentation (design system, architecture, status and known limits, security review) is in [`platform/docs/`](platform/docs/).
