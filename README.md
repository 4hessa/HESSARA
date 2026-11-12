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
