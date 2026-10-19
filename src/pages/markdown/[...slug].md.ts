import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from 'astro';
import { markdownPath, pageMarkdown, publishedDocs } from '../../lib/docs';

export const getStaticPaths = (async () => {
  return (await publishedDocs()).map((entry) => ({
    params: { slug: markdownPath(entry.id).slice('/markdown/'.length, -3) },
    props: { entry },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<InferGetStaticPropsType<typeof getStaticPaths>> = ({ props, site }) => {
  return new Response(pageMarkdown(props.entry, site), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
