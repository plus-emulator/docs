import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://docs.plusemu.dev',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'PlusEMU',
      description: 'Set up your PlusEMU hotel, manage access, and configure its features.',
      logo: { src: './src/assets/logo.svg' },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'PlusEMU on GitHub', href: 'https://github.com/plus-emulator' }],
      customCss: ['./src/styles/custom.css'],
      components: {
        PageTitle: './src/components/PageTitle.astro',
        Footer: './src/components/Footer.astro',
      },
      credits: false,
      sidebar: [
        { label: 'Introduction', slug: '' },
        { label: 'Get started', items: [{ autogenerate: { directory: 'getting-started' } }] },
        { label: 'Administration', items: [{ autogenerate: { directory: 'administration' } }] },
        { label: 'Features', items: [{ autogenerate: { directory: 'features' } }] },
        { label: 'Use with AI', slug: 'using-these-docs' },
      ],
      head: [
        { tag: 'link', attrs: { rel: 'alternate', type: 'text/plain', href: '/llms.txt', title: 'Documentation index for LLMs' } },
      ],
    }),
  ],
});
