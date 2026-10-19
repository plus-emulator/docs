# PlusEMU documentation rules

Read the applicable shared engineering policy before making changes. These rules cover this documentation repository.

## Scope and writing

- Write for hotel operators who need to set up or manage PlusEMU.
- Follow ISO 24495-1:2023 plain-language principles. Use common words, active voice, short sentences, and sentence-case headings.
- Use regular hyphens. Do not use em dashes or en dashes.
- Keep pages focused. Cover common tasks and the main features. Link to source for details that do not need a full guide.
- Verify commands, configuration keys, SQL, permissions, and defaults against the current `plus-emulator/PlusEMU` source. Do not infer behavior from a name alone.
- Use `https://github.com/plus-emulator/` for public project links. Do not expose local paths, internal hosts, credentials, or private notes.
- Do not add tool or assistant attribution to commits, pull requests, or documentation.

## Files and patterns

- Documentation lives in `src/content/docs/` as plain `.md` files.
- Every page needs a clear `title` and `description`. Use `sidebar.order` to place the page within its section.
- Use root-relative site links with trailing slashes, such as `/features/camera/`.
- Keep important text in the page body. Do not use MDX, imports, or custom UI components in documentation pages.
- Set `draft: true` for unfinished pages. Drafts are not a safe place to store secrets.
- Reuse Starlight navigation, search, theme selection, code blocks, and accessibility behavior. Keep custom components and CSS small.
- Text exports come from the Astro content collection through `src/lib/docs.ts`. Do not create or maintain separate copies of page text.
- Keep dependencies pinned and commit `package-lock.json`. Do not commit `dist/`, `node_modules/`, `.astro/`, `.wrangler/`, or credentials.

## Verification

Run `npm run check` and `npm run build`. Preview the production build with `npm run preview` and inspect the changed pages in a real browser. Check search in the production preview, not only in the development server.

For layout changes, check desktop and mobile widths, keyboard navigation, and both themes. For content changes, check internal links and the page's Markdown export. For export changes, check `/llms.txt`, `/llms-full.txt`, and an individual `/markdown/` URL.

Do not write or run frontend tests unless Dennis explicitly asks. Use the type check, build, and real browser checks.

## Deployment

Cloudflare Workers Static Assets serves `dist/`. `wrangler.jsonc` owns the Worker name and domain. Supply credentials through the environment.

Deploy only within the user's existing authorization. Run `npm run deploy` after review and verification. Never add account credentials or tokens to this repository.
