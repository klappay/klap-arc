import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

export default defineConfig({
  title: 'klap-arc',
  description:
    'A temporary, open-source, self-hosted deployment of 0xSplits on Circle Arc — until 0xSplits ships official support',
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'force-dark',
  head: [['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }]],

  vite: {
    plugins: [llmstxt({ domain: 'https://arc.klappay.com' })],
  },

  themeConfig: {
    logo: '/logo.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Research', link: '/research' },
      { text: 'npm', link: 'https://www.npmjs.com/package/@klappay/arc-splits' },
    ],

    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Research', link: '/research' },
          { text: 'Migration to official 0xSplits', link: '/migration' },
        ],
      },
      {
        text: 'Packages',
        items: [
          { text: 'Contracts', link: '/contracts' },
          { text: 'SDK (@klappay/arc-splits)', link: '/sdk' },
        ],
      },
    ],

    search: {
      provider: 'local',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/klappay/klap-arc' }],

    footer: {
      message:
        'A temporary bridge, not a product — meant to be retired once 0xSplits ships official Arc support.',
      copyright: 'GPL-3.0 (contracts) / MIT (SDK) — Klappay',
    },
  },
})
