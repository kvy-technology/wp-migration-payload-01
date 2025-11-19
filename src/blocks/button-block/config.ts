import type { Block } from 'payload'

import { link } from '@/fields/link'

export const ButtonBlock: Block = {
  slug: 'buttonBlock',
  interfaceName: 'ButtonBlock',
  fields: [
    link({
      name: 'link',
      disableLabel: false,
    }),
    {
      name: 'appearance',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Outline', value: 'outline' },
      ],
      admin: {
        description: 'Choose the button style',
      },
    },
  ],
}

