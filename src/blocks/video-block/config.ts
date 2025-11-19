import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'videoBlock',
  interfaceName: 'VideoBlock',
  fields: [
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Upload a video file (MP4, WebM, etc.)',
      },
    },
  ],
}
