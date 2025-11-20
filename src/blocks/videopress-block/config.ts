import type { Block } from 'payload'

export const VideopressBlock: Block = {
  slug: 'videopressBlock',
  interfaceName: 'VideopressBlock',
  fields: [
    {
      name: 'videopressUrl',
      type: 'text',
      required: true,
      label: 'VideoPress URL',
      admin: {
        description: 'Enter a VideoPress video URL (e.g., https://videopress.com/v/VIDEO_ID)',
      },
    },
  ],
}
