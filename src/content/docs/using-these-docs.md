---
title: Use these docs with AI
description: Read individual Markdown pages or download the complete PlusEMU documentation for a language model.
---

Every documentation page has a **View as Markdown** link below its title. Use that link when you want to paste a page into a language model or read it without the website layout.

## Choose an export

| File | Contents |
| --- | --- |
| [llms.txt](/llms.txt) | Page titles, descriptions, and links to each Markdown file. |
| [llms-full.txt](/llms-full.txt) | All published pages in one plain-text file. |
| [Home page as Markdown](/markdown/index.md) | An example of an individual Markdown page. |

The site creates these files from the documentation during each build. Each exported page includes its source URL.

## Give a model the right context

Include your PlusEMU release, the feature you are configuring, and the relevant documentation page. Remove passwords, authentication tokens, and personal information from any configuration or logs you share.

Check generated commands before running them. A model may suggest settings from another emulator or an older PlusEMU release.

You can download all pages with this command:

```sh
curl --fail --output plusemu-docs.txt https://docs.plusemu.dev/llms-full.txt
```
