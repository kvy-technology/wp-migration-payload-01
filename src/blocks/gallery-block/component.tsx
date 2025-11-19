import { Media } from '@/components/media'
import { cn } from '@/lib/utils'
import type { GalleryBlock as GalleryBlockProps } from '@/payload-types'
import React from 'react'

type Props = GalleryBlockProps & {
  className?: string
  imgClassName?: string
}

export const GalleryBlock: React.FC<Props> = ({
  className,
  images,
  numberPerRow = '3',
  imgClassName,
}) => {
  if (!images || images.length === 0) {
    return null
  }

  // Map numberPerRow to grid columns
  const gridCols = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  const gridClass = gridCols[numberPerRow as keyof typeof gridCols] || gridCols['3']

  return (
    <div className={cn('my-8 w-full', className)}>
      <div className={cn('grid gap-4', gridClass)}>
        {images.map((item, index) => {
          const image = typeof item === 'object' && item !== null ? item.image : null
          if (!image) return null

          return (
            <div key={index} className="relative w-full aspect-square overflow-hidden rounded border border-border">
              <Media
                resource={image}
                imgClassName={cn('object-cover', imgClassName)}
                fill
                priority={index < 4}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

