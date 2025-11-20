import config from '@payload-config'
import { getPayload } from 'payload'
import { convertChunksWithStats } from './migrate-wp/converters/html-engine'
import type { MigrationOptions, MigrationStats, WPPost } from './migrate-wp/core/types'
import { extractImagesFromChunks } from './migrate-wp/media/extract'
import { uploadImages } from './migrate-wp/media/upload'
import { logger } from './migrate-wp/utils/logger'
import {
  mergeNodesPreservingOrder,
  validateMergedStructure,
} from './migrate-wp/utils/merge-lexical'
import { splitIntoChunks } from './migrate-wp/wp/chunk-splitter'
import { fetchWPPosts } from './migrate-wp/wp/fetch'

/**
 * WordPress → PayloadCMS Migration Pipeline
 *
 * Main entry point for migrating WordPress posts to PayloadCMS.
 * Follows the flow diagram exactly:
 *
 * 1. Fetch WP posts (mock or API)
 * 2. Split post_content into chunks
 * 3. For each chunk:
 *    - If supported by Lexical → convertHTMLToLexical
 *    - Else → match CMS blocks
 *    - Else (new type) → generate new block following existing block style
 * 4. Merge all converted chunks
 * 5. Create PayloadCMS post via payload.create
 */

/**
 * Migrate a single WordPress post to PayloadCMS
 *
 * @param post - WordPress post to migrate
 * @param payload - Payload instance
 * @param options - Migration options
 * @returns Created Payload post ID or null if failed
 *
 * @example
 * ```ts
 * const postId = await migratePost(wpPost, payload, { skipImages: false })
 * ```
 */
async function migratePost(
  post: WPPost,
  payload: Awaited<ReturnType<typeof getPayload>>,
  options: MigrationOptions = {},
): Promise<number | null> {
  try {
    logger.info(`📝 Migrating post: ${post.title}`)

    // Step 1: Split post content into chunks
    logger.debug('Splitting content into chunks...')
    const chunks = splitIntoChunks(post.content)
    logger.info(`Split into ${chunks.length} chunks`)

    if (chunks.length === 0) {
      logger.warn('No chunks found in post content')
      return null
    }

    // Step 2: Extract all images upfront (before conversion)
    logger.debug('Extracting images from chunks...')
    const imageMap = new Map<string, number>()

    if (!options.skipImages) {
      const htmlChunks = chunks.map((chunk) => chunk.html)
      const images = extractImagesFromChunks(htmlChunks)
      logger.info(`Found ${images.length} images to upload`)

      // Upload images before conversion
      if (images.length > 0) {
        logger.info('Uploading images to Payload...')
        const uploadedMap = await uploadImages(payload, images)
        uploadedMap.forEach((mediaId, url) => {
          imageMap.set(url, mediaId)
        })
        logger.info(`Uploaded ${uploadedMap.size} images`)
      }
    }

    // Step 3: Convert chunks
    logger.debug('Converting chunks...')
    const conversionResult = await convertChunksWithStats(
      chunks,
      {
        payload,
        imageMap,
        allChunks: chunks,
        postMeta: post,
      },
      {
        continueOnError: options.continueOnError ?? true,
      },
    )

    if (conversionResult.errors.length > 0 && !options.continueOnError) {
      throw new Error(`Conversion failed: ${conversionResult.errors.join(', ')}`)
    }

    logger.info(
      `Conversion complete: ${conversionResult.stats.successful}/${conversionResult.stats.total} successful`,
    )

    // Step 4: Merge all converted nodes
    logger.debug('Merging converted nodes...')
    const merged = mergeNodesPreservingOrder(conversionResult.nodes)

    if (!validateMergedStructure(merged)) {
      throw new Error('Invalid merged Lexical structure')
    }

    // Step 5: Create PayloadCMS post
    if (options.dryRun) {
      logger.info('🔍 DRY RUN: Would create post with content')
      return null
    }

    logger.debug('Creating Payload post...')

    // Map category if provided
    // let categoryId: number | undefined
    // if (post.categories && post.categories.length > 0 && options.categoryMap) {
    //   const wpCategoryId = post.categories[0]
    //   categoryId = options.categoryMap.get(wpCategoryId)
    // }

    // Map author if provided
    // let authorId: number | undefined
    // if (post.author && options.authorMap) {
    //   authorId = options.authorMap.get(post.author)
    // }

    const payloadPost = await payload.update({
      collection: 'posts',
      id: 4,
      data: {
        title: post.title,
        slug: post.slug,
        content: merged,
        // content: {
        //   root: {
        //     children: [
        //       {
        //         type: 'block',
        //         version: 2,
        //         format: '',

        //         fields: {
        //           id: '691d916cf351d0615d33c240',
        //           blockName: '',

        //           images: [
        //             {
        //               id: '691d916eb1a4ac005ce027f2',

        //               image: {
        //                 id: 4,
        //                 alt: 'background image',
        //                 updatedAt: '2025-11-18T08:22:58.265Z',
        //                 createdAt: '2025-11-18T08:22:58.265Z',
        //                 url: '/api/media/file/background-image.png',
        //                 thumbnailURL: null,
        //                 filename: 'background-image.png',
        //                 mimeType: 'image/png',
        //                 filesize: 83187,
        //                 width: 356,
        //                 height: 522,
        //               },
        //             },

        //             {
        //               id: '691d9173b1a4ac005ce027f4',

        //               image: {
        //                 id: 1,
        //                 alt: 'https://kvytechnology.com/wp-content/uploads/2025/10/DXL-1588-x-1016-px-1.png',
        //                 updatedAt: '2025-11-17T04:03:05.519Z',
        //                 createdAt: '2025-11-17T04:03:05.519Z',
        //                 url: '/api/media/file/DXL-1588-x-1016-px-1.png',
        //                 thumbnailURL: null,
        //                 filename: 'DXL-1588-x-1016-px-1.png',
        //                 mimeType: 'image/png',
        //                 filesize: 1314151,
        //                 width: 1588,
        //                 height: 1016,
        //               },
        //             },
        //           ],
        //           numberPerRow: '3',
        //           blockType: 'galleryBlock',
        //         },
        //       },

        //       {
        //         children: [],
        //         direction: null,
        //         format: '',
        //         indent: 0,
        //         type: 'paragraph',
        //         version: 1,
        //         textFormat: 0,
        //         textStyle: '',
        //       },
        //     ],
        //     direction: null,
        //     format: '',
        //     indent: 0,
        //     type: 'root',
        //     version: 1,
        //   },
        // },
        // category: categoryId,
        // authors: authorId ? [authorId] : undefined,
        // _status: post.status === 'publish' ? 'published' : 'draft',
      },
    })

    const postId = typeof payloadPost.id === 'number' ? payloadPost.id : Number(payloadPost.id)

    logger.info(`✅ Successfully migrated post: ${post.title} (ID: ${postId})`)
    return postId
  } catch (error) {
    logger.error(`Failed to migrate post: ${post.title}`, error)
    throw error
  }
}

/**
 * Main migration function
 *
 * @param options - Migration options
 * @returns Migration statistics
 *
 * @example
 * ```ts
 * // Use mock data
 * const stats = await migrate({ useMock: true, dryRun: false })
 *
 * // Migrate from WordPress API
 * const stats = await migrate({
 *   wpApiUrl: 'https://example.com/wp-json/wp/v2',
 *   wpCredentials: { username: 'user', password: 'app-pass' },
 *   batchSize: 10
 * })
 * ```
 */
export async function migrate(options: MigrationOptions = {}): Promise<MigrationStats> {
  const startTime = Date.now()
  logger.info('🚀 Starting WordPress → PayloadCMS migration')
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Initialize Payload
  const payload = await getPayload({ config })

  // Step 1: Fetch WordPress posts
  logger.info('Step 1: Fetching WordPress posts...')
  const wpPosts = await fetchWPPosts({
    useMock: options.useMock ?? false,
    apiUrl: options.wpApiUrl,
    credentials: options.wpCredentials,
    limit: options.batchSize,
  })

  logger.info(`Fetched ${wpPosts.length} posts`)

  if (wpPosts.length === 0) {
    logger.warn('No posts to migrate')
    return {
      totalPosts: 0,
      successfulPosts: 0,
      failedPosts: 0,
      totalChunks: 0,
      totalImages: 0,
      totalErrors: 0,
      processingTime: Date.now() - startTime,
    }
  }

  // Process posts
  let successfulPosts = 0
  let failedPosts = 0
  let totalChunks = 0
  let totalImages = 0
  let totalErrors = 0

  for (let i = 0; i < wpPosts.length; i++) {
    const post = wpPosts[i]
    logger.info(`\nProcessing post ${i + 1}/${wpPosts.length}: ${post.title}`)

    try {
      // Count chunks
      const chunks = splitIntoChunks(post.content)
      totalChunks += chunks.length

      // Count images
      if (!options.skipImages) {
        const htmlChunks = chunks.map((chunk) => chunk.html)
        const images = extractImagesFromChunks(htmlChunks)
        totalImages += images.length
      }

      // Migrate post
      const postId = await migratePost(post, payload, options)

      if (postId) {
        successfulPosts++
      } else {
        failedPosts++
        totalErrors++
      }
    } catch (error) {
      logger.error(`Error processing post: ${post.title}`, error)
      failedPosts++
      totalErrors++

      if (!options.continueOnError) {
        throw error
      }
    }
  }

  const processingTime = Date.now() - startTime

  // Log statistics
  const stats: MigrationStats = {
    totalPosts: wpPosts.length,
    successfulPosts,
    failedPosts,
    totalChunks,
    totalImages,
    totalErrors,
    processingTime,
  }

  logger.logStats(stats)
  logger.info('✅ Migration complete!')

  return stats
}

// Export for use as script
// if (import.meta.url === `file://${process.argv[1]}`) {
//   // Parse command line arguments
//   const args = process.argv.slice(2)
//   const options: MigrationOptions = {
//     useMock: args.includes('--mock') || args.includes('-m'),
//     dryRun: args.includes('--dry-run') || args.includes('-d'),
//     skipImages: args.includes('--skip-images'),
//     continueOnError: !args.includes('--fail-fast'),
//   }

//   // Run migration
//   migrate(options)
//     .then((stats) => {
//       process.exit(stats.failedPosts > 0 ? 1 : 0)
//     })
//     .catch((error) => {
//       logger.error('Migration failed', error)
//       process.exit(1)
//     })
// }

await migrate({
  useMock: true,
  dryRun: false,
})

export default migrate
