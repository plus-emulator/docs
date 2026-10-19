import type { APIRoute } from 'astro';
import { markdownPath, publishedDocs } from '../lib/docs';

export const GET: APIRoute = async ({ site }) => {
  const entries = await publishedDocs();
  const links = entries.map((entry) =>
    `- [${entry.data.title}](${new URL(markdownPath(entry.id), site)}): ${entry.data.description ?? ''}`,
  );
  return new Response([
    '# PlusEMU documentation',
    '',
    '> Guides for setting up and operating PlusEMU, the Habbo Hotel server emulator.',
    '',
    'These pages describe the current project. Check your installed release before applying commands or configuration.',
    '',
    '## Documentation',
    '',
    ...links,
    '',
    '## Complete documentation',
    '',
    `- [All pages in one file](${new URL('/llms-full.txt', site)}): Full text of the published documentation.`,
    '',
  ].join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
