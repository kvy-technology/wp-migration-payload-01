import { CMSLink } from '@/components/link'
import { cn } from '@/lib/utils'
import type { ButtonBlock as ButtonBlockProps } from '@/payload-types'
import React from 'react'

type Props = ButtonBlockProps & {
  className?: string
}

export const ButtonBlock: React.FC<Props> = ({ className, link: linkField, appearance }) => {
  if (!linkField) {
    return null
  }

  // Map the appearance value to CMSLink's appearance prop
  const linkAppearance = appearance === 'outline' ? 'outline' : 'button'

  return (
    <div className={cn('my-8 w-full flex justify-center', className)}>
      <CMSLink
        {...linkField}
        appearance={linkAppearance}
        className={cn({
          'w-full sm:w-auto': true,
        })}
      />
    </div>
  )
}
