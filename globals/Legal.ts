import type { GlobalConfig } from 'payload'

export const Legal: GlobalConfig = {
  slug: 'legal',
  label: 'Legal Notice / Imprint',
  admin: {
    description: 'Edit the Legal Notice / Imprint page. Content is rendered as Markdown.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Legal Notice / Imprint',
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Markdown supported: ## Heading, **bold**, *italic*, - list item',
        rows: 20,
      },
    },
    {
      name: 'lastUpdated',
      type: 'text',
      label: 'Last Updated',
      defaultValue: 'March 2026',
    },
  ],
}
