import { getCollection, type CollectionEntry } from 'astro:content';

export function pagePath(id: string): string {
  const slug = id.replace(/(^|\/)index$/, '');
  return slug ? `/${slug.replace(/\/$/, '')}/` : '/';
}

export function markdownPath(id: string): string {
  return `/markdown/${pagePath(id).slice(1, -1) || 'index'}.md`;
}

export async function publishedDocs() {
  return (await getCollection('docs', ({ data }) => !data.draft))
    .sort((left, right) => pagePath(left.id).localeCompare(pagePath(right.id)));
}

export function pageMarkdown(entry: CollectionEntry<'docs'>, site: URL | undefined): string {
  const body = (entry.body ?? '').replace(/<!--[\s\S]*?-->/g, '').trim();
  return [
    `# ${entry.data.title}`,
    entry.data.description,
    `Source: ${new URL(pagePath(entry.id), site)}`,
    body,
  ].filter(Boolean).join('\n\n') + '\n';
}
