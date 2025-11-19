import type { Block } from 'payload'

export const GalleryBlock: Block = {
  slug: 'galleryBlock',
  interfaceName: 'GalleryBlock',
  fields: [
    {
      name: 'images',
      type: 'array',
      label: 'Images',
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'numberPerRow',
      type: 'select',
      label: 'Images per row',
      defaultValue: '3',
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
      required: true,
      admin: {
        description: 'Number of images to display per row',
      },
    },
  ],
}
