import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import '@/app/(frontend)/styles.css'
import { PostHero } from '@/components/post-hero'
import { RelatedPosts } from '@/components/related-posts'
import RichText from '@/components/rich-text'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { cache } from 'react'

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params

  const postSlug = slug?.[1]
  const categorySlug = slug?.[0]

  if (!postSlug || !categorySlug) {
    notFound()
  }

  const post = await queryPostBySlug({ slug: postSlug, categorySlug: categorySlug })

  if (!post) {
    notFound()
  }

  return (
    <article>
      <PostHero post={post} />

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container mx-auto">
          <RichText className="max-w-3xl mx-auto" data={post.content} enableGutter={false} />

          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="max-w-3xl mx-auto my-12 lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )}
        </div>
      </div>
    </article>
  )
}

const queryPostBySlug = cache(
  async ({ slug, categorySlug }: { slug: string; categorySlug: string }) => {
    const { isEnabled: draft } = await draftMode()

    const payload = await getPayload({ config: configPromise })

    const categoryResult = await payload.find({
      collection: 'categories',
      limit: 1,
      where: {
        slug: {
          equals: categorySlug,
        },
      },
    })

    const categoryId = categoryResult.docs?.[0]?.id

    if (!categoryId) {
      return null
    }

    const result = await payload.find({
      collection: 'posts',
      draft,
      limit: 1,
      overrideAccess: draft,
      pagination: false,
      depth: 2,
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          {
            category: {
              equals: categoryId,
            },
          },
        ],
      },
    })

    const post = result.docs?.[0]
    if (!post) {
      return null
    }

    // Manually populate categories for relatedPosts since depth doesn't work for nested relationships
    if (post.relatedPosts && post.relatedPosts.length > 0) {
      // Filter to only Post objects (not IDs)
      const relatedPostsObjects = post.relatedPosts.filter(
        (relatedPost): relatedPost is Exclude<typeof relatedPost, number> =>
          typeof relatedPost === 'object',
      )

      // Extract unique category IDs from relatedPosts
      const categoryIds = relatedPostsObjects
        .map((relatedPost) => {
          return typeof relatedPost.category === 'object' && relatedPost.category !== null
            ? relatedPost.category.id
            : relatedPost.category
        })
        .filter((id): id is number => typeof id === 'number')

      // Fetch all categories at once if we have any IDs
      let categoriesMap = new Map<number, any>()
      if (categoryIds.length > 0) {
        const categoriesResult = await payload.find({
          collection: 'categories',
          limit: 100,
          where: {
            id: {
              in: categoryIds,
            },
          },
        })
        categoriesMap = new Map(categoriesResult.docs.map((cat) => [cat.id, cat]))
      }

      // Map categories back to relatedPosts
      post.relatedPosts = relatedPostsObjects.map((relatedPost) => {
        const categoryId =
          typeof relatedPost.category === 'object' && relatedPost.category !== null
            ? relatedPost.category.id
            : typeof relatedPost.category === 'number'
              ? relatedPost.category
              : null

        const category = categoryId !== null ? categoriesMap.get(categoryId) || null : null

        return {
          ...relatedPost,
          category,
        }
      })
    }

    return post
  },
)
