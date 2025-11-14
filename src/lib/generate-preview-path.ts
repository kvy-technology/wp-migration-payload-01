import { CollectionSlug, PayloadRequest } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/blog',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  categorySlug?: string | null
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug, categorySlug }: Props) => {
  // Allow empty strings, e.g. for the homepage
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)
  const encodedCategorySlug = categorySlug ? encodeURIComponent(categorySlug) : null

  let path = collectionPrefixMap[collection]
  if (collection === 'posts' && encodedCategorySlug) {
    path = `${path}/${encodedCategorySlug}/${encodedSlug}`
  } else {
    path = `${path}/${encodedSlug}`
  }

  const encodedParams = new URLSearchParams({
    slug: encodedSlug,
    collection,
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  // Add categorySlug to params if it exists
  if (encodedCategorySlug) {
    encodedParams.set('categorySlug', encodedCategorySlug)
  }

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
