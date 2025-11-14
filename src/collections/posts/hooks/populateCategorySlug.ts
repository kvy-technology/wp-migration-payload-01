import type { CollectionAfterReadHook } from 'payload'

// Populate categorySlug from the category relationship
// This makes it easier to access the category slug without needing to resolve the relationship
export const populateCategorySlug: CollectionAfterReadHook = async ({
  doc,
  req: { payload },
}) => {
  if (doc?.category) {
    try {
      // If category is already populated as an object with slug, use it directly
      if (typeof doc.category === 'object' && doc.category !== null && 'slug' in doc.category) {
        doc.categorySlug = doc.category.slug
      } else {
        // Otherwise, fetch the category by ID
        const categoryId = typeof doc.category === 'object' ? doc.category?.id : doc.category

        if (categoryId) {
          const categoryDoc = await payload.findByID({
            id: categoryId,
            collection: 'categories',
            depth: 0,
          })

          if (categoryDoc?.slug) {
            doc.categorySlug = categoryDoc.slug
          }
        }
      }
    } catch {
      // swallow error
    }
  } else {
    // Clear categorySlug if category is null/undefined
    doc.categorySlug = null
  }

  return doc
}

