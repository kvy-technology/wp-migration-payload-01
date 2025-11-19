import type { Block } from 'payload'

export const YoutubeBlock: Block = {
  slug: 'youtubeBlock',
  interfaceName: 'YoutubeBlock',
  fields: [
    {
      name: 'youtubeUrl',
      type: 'text',
      required: true,
      label: 'YouTube URL',
      admin: {
        description:
          'Enter a YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)',
      },
    },
  ],
}
