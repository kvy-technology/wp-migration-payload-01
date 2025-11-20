import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const ColumnsBlock: Block = {
  slug: 'columnsBlock',
  interfaceName: 'ColumnsBlock',
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: 'Columns',
      minRows: 1,
      maxRows: 6,
      required: true,
      fields: [
        {
          name: 'content',
          type: 'richText',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [
                ...rootFeatures,
                // Include all standard features for nested content
              ]
            },
          }),
          label: 'Column Content',
          required: true,
        },
      ],
    },
    {
      name: 'columnCount',
      type: 'number',
      label: 'Number of Columns',
      defaultValue: 2,
      min: 1,
      max: 6,
      admin: {
        description: 'Number of columns to display (1-6)',
      },
    },
  ],
}
