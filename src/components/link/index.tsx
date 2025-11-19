'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Post } from '@/payload-types'
import Link from 'next/link'
import React from 'react'

export type CMSLinkType = {
  appearance?: 'link' | 'button' | null | 'outline'
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'posts'
    value: Post | string | number
  } | null
  type?: 'custom' | 'reference' | null
  url?: string | null
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'link',
    children,
    className,
    label,
    newTab,
    reference,
    url,
    style = {},
    onClick,
  } = props

  const getHref = () => {
    if (type === 'reference' && typeof reference?.value === 'object' && reference.value.slug) {
      // Handle posts with category slugs
      if (reference.relationTo === 'posts') {
        const post = reference.value as Post
        const category = (post as any).category
        // Check for category slug from populated relationship or direct field
        const categorySlug =
          typeof category === 'object' && category !== null && 'slug' in category
            ? category.slug
            : (post as any).categorySlug || null

        return categorySlug ? `/blog/${categorySlug}/${post.slug}` : `/blog/${post.slug}`
      }
      // Default behavior for other references
      return `/${reference.value.slug}`
    }
    return url
  }

  const href = getHref()

  if (!href) return null

  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'link') {
    return (
      <Link
        className={className || ''}
        href={href || url || ''}
        style={style}
        onClick={onClick}
        {...newTabProps}
      >
        {children}
        {label}
      </Link>
    )
  }

  return (
    <Button
      asChild
      className={className}
      variant={appearance === 'outline' ? 'outline' : 'default'}
      style={style}
    >
      <Link
        className={cn(className)}
        prefetch={false}
        href={href || url || ''}
        onClick={onClick}
        {...newTabProps}
      >
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}
