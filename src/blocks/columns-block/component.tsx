import RichText from '@/components/rich-text'
import { cn } from '@/lib/utils'
import type { ColumnsBlock as ColumnsBlockProps } from '@/payload-types'
import React from 'react'

type Props = ColumnsBlockProps & {
  className?: string
}

export const ColumnsBlock: React.FC<Props> = ({ className, columns, columnCount = 2 }) => {
  if (!columns || columns.length === 0) {
    return null
  }

  // Determine grid columns based on columnCount
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }

  const gridClass = gridCols[columnCount as keyof typeof gridCols] || gridCols[2]

  return (
    <div className={cn('my-8 w-full', className)}>
      <div className={cn('grid gap-6', gridClass)}>
        {columns.map((column, index) => {
          const columnData = typeof column === 'object' && column !== null ? column : null
          if (!columnData?.content) return null

          return (
            <div key={index} className="flex flex-col">
              <RichText data={columnData.content} enableGutter={false} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
