# PlusEMU documentation

The documentation website for [PlusEMU](https://github.com/plus-emulator/PlusEMU), published at <https://docs.plusemu.dev>.

The site uses [Astro Starlight](https://starlight.astro.build/). It builds static HTML, a local search index, and plain-text documentation exports. Cloudflare Workers Static Assets serves the files without a Worker script.

## Run locally

Use Node.js 24.22.0, as recorded in `.node-version`, and npm.

```sh
npm ci
npm run dev
```

Open the address printed by Astro. Search uses the production build's Pagefind index, so check search with the preview command below.

## Check the production build

```sh
npm run check
npm run build
npm run preview
```

The build writes to `dist/`. In the browser, check the home page, a setup guide, a permission guide, and the camera guide. Use search, switch themes, open the mobile menu, and try a code block's copy button. Follow **View as Markdown** and the **llms.txt** footer link.

`npm run check` checks Astro and TypeScript. There is no separate lint command. Do not add or run frontend tests unless a maintainer asks for them.

## Write a page

Add a `.md` file under `src/content/docs/`. Start with frontmatter:

```yaml
---
title: Set up a feature
description: Explain what the reader can do with this guide.
sidebar:
  order: 1
---
```

Use `getting-started/` for installation and updates, `administration/` for access management, and `features/` for feature guides. The sidebar includes new pages in those directories automatically. `sidebar.order` controls the order within a section.

Check commands, defaults, and permissions against the current PlusEMU source before documenting them. Use public source links. Keep each page focused on an overview, a task, or a reference. Use common words, sentence-case headings, and numbered steps for procedures.

Use plain Markdown and fenced code blocks. Keep important text in the page body. Do not use MDX, import statements, or custom components in documentation pages. This keeps the HTML and Markdown exports readable from the same source.

Set `draft: true` while a page is unfinished. Production builds and text exports omit drafts. Do not put secrets or private notes in this repository, including drafts and HTML comments.

## Text exports

Astro generates these endpoints during every build:

- `/llms.txt` lists published pages, their descriptions, and their Markdown URLs.
- `/llms-full.txt` contains the full text of every published page.
- `/markdown/<page-path>.md` contains one page. The home page is `/markdown/index.md`.

`src/lib/docs.ts` reads the same Astro content collection that Starlight uses. It includes the title, description, source URL, and body. It omits frontmatter and HTML comments. Never edit generated copies in `dist/` or add copies to `public/`.

## Deploy to Cloudflare

`wrangler.jsonc` names the Worker `plusemu-docs` and configures `docs.plusemu.dev` as its custom domain. Cloudflare must manage the `plusemu.dev` DNS zone in the target account.

For an interactive login, run:

```sh
npx wrangler login
npm run deploy
```

For unattended deployment, provide `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` through the deployment environment. The token needs permission to deploy Workers and manage the custom domain. Do not store credentials in source files.

`npm run deploy` checks and builds the site before running `wrangler deploy`. To inspect the deployment bundle without publishing, run:

```sh
npm run build
npx wrangler deploy --dry-run
```

The `_headers` file sets the content type for Markdown and text exports. Missing routes use the generated `404.html`. The site URL in `astro.config.mjs` controls canonical URLs, the sitemap, and exported source links. Update it together with the custom domain when moving the site.

## License

GPL-3.0-only. See [LICENSE](LICENSE).
