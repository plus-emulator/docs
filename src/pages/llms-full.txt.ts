import type { APIRoute } from 'astro';
import { pageMarkdown, publishedDocs } from '../lib/docs';

export const GET: APIRoute = async ({ site }) => {
  const entries = await publishedDocs();
  return new Response(entries.map((entry) => pageMarkdown(entry, site)).join('\n---\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
