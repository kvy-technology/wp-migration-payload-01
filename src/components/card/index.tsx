'use client'
import useClickableCard from '@/lib/use-clickable-card'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '../media'

export type CardPostData = Pick<
  Post,
  'slug' | 'category' | 'heroImage' | 'populatedAuthors' | 'title'
>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, showCategories, title: titleFromProps } = props

  const { slug, category, heroImage, title } = doc || {}

  const hasCategories = category && Array.isArray(category) && category.length > 0
  const titleToUse = titleFromProps || title
  const formatCategory = typeof category === 'object' && category !== null ? category : null

  const href = formatCategory?.slug ? `/blog/${formatCategory.slug}/${slug}` : `/blog/${slug}`

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full">
        {heroImage && typeof heroImage !== 'string' && <Media resource={heroImage} />}
      </div>
      <div className="p-4">
        {showCategories && hasCategories && (
          <div className="uppercase text-sm mb-4">
            {showCategories && hasCategories && (
              <div>
                {category?.map((category, index) => {
                  if (typeof category === 'object') {
                    const { title: titleFromCategory } = category

                    const categoryTitle = titleFromCategory || 'Untitled category'

                    const isLast = index === category.length - 1

                    return (
                      <Fragment key={index}>
                        {categoryTitle}
                        {!isLast && <Fragment>, &nbsp;</Fragment>}
                      </Fragment>
                    )
                  }

                  return null
                })}
              </div>
            )}
          </div>
        )}
        {titleToUse && (
          <div className="prose">
            <h3>
              <Link className="not-prose" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
      </div>
    </article>
  )
}
