import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'

export const revalidatePost: CollectionAfterChangeHook<Post> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      let category: { slug: string } | null = null

      if (typeof doc.category === 'object' && doc.category !== null) {
        category = doc.category
      } else if (typeof doc.category === 'number') {
        const fetchedCategory = await payload.findByID({
          collection: 'categories',
          id: doc.category,
        })
        category = fetchedCategory || null
      }

      const categorySlug = category?.slug
      const path = categorySlug ? `/blog/${categorySlug}/${doc.slug}` : `/blog/${doc.slug}`

      payload.logger.info(`Revalidating post at path: ${path}`)

      revalidatePath(path)
      revalidateTag('posts-sitemap')
    }

    if (previousDoc._status === 'published' && doc._status !== 'published') {
      let oldCategory: { slug: string } | null = null

      if (typeof previousDoc.category === 'object' && previousDoc.category !== null) {
        oldCategory = previousDoc.category
      } else if (typeof previousDoc.category === 'number') {
        const fetchedCategory = await payload.findByID({
          collection: 'categories',
          id: previousDoc.category,
        })
        oldCategory = fetchedCategory || null
      }

      const oldCategorySlug = oldCategory?.slug
      const oldPath = oldCategorySlug
        ? `/blog/${oldCategorySlug}/${previousDoc.slug}`
        : `/blog/${previousDoc.slug}`

      payload.logger.info(`Revalidating old post at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('posts-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate && doc) {
    // Fetch category to build the correct path
    let category: { slug: string } | null = null
    if (typeof doc.category === 'object' && doc.category !== null) {
      category = doc.category
    } else if (typeof doc.category === 'number') {
      const fetchedCategory = await payload.findByID({
        collection: 'categories',
        id: doc.category,
      })
      category = fetchedCategory || null
    }

    const categorySlug = category?.slug
    const path = categorySlug ? `/blog/${categorySlug}/${doc.slug}` : `/blog/${doc.slug}`

    revalidatePath(path)
    revalidateTag('posts-sitemap')
  }

  return doc
}
