import type { GlobalConfig } from 'payload'

export const Privacy: GlobalConfig = {
  slug: 'privacy',
  label: 'Privacy Policy',
  admin: {
    description: 'Edit the Privacy Policy page. Content is rendered as Markdown.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Privacy Policy',
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
