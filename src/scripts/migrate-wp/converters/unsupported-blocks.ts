import { CMS_BLOCKS, YOUTUBE_PATTERNS } from '../core/constants'
import type { CMSBlockNode, ConversionContext, ConversionResult } from '../core/types'
import { extractGalleryImages, extractYouTubeIds } from '../media/extract'
import { downloadVideo, uploadImages, uploadVideoToPayload } from '../media/upload'

/**
 * Unsupported Blocks Converter Module
 *
 * Converts WordPress blocks that don't map to Lexical into PayloadCMS blocks.
 * Follows existing block schema conventions from /src/blocks/[block-name]/config.ts
 */

/**
 * Convert YouTube embed to youtubeBlock
 *
 * @param context - Conversion context
 * @returns Conversion result with youtubeBlock node
 *
 * @example
 * ```ts
 * const result = await convertYouTube(context)
 * // Returns { nodes: [{ blockType: 'youtubeBlock', youtubeUrl: '...' }] }
 * ```
 */
export async function convertYouTube(context: ConversionContext): Promise<ConversionResult> {
  const { chunk } = context
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Extract YouTube video ID
    const videoIds = extractYouTubeIds(chunk.html)

    if (videoIds.length === 0) {
      // Try to extract from embed URL in attributes
      const embedUrl = chunk.attributes?.url as string | undefined
      if (embedUrl) {
        const match =
          embedUrl.match(YOUTUBE_PATTERNS.WATCH) || embedUrl.match(YOUTUBE_PATTERNS.EMBED)
        if (match) {
          videoIds.push(match[1])
        }
      }
    }

    if (videoIds.length === 0) {
      errors.push('Could not extract YouTube video ID')
      return {
        nodes: [],
        warnings,
        errors,
        success: false,
      }
    }

    // Use first video ID found
    const videoId = videoIds[0]
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`

    // Create youtubeBlock following schema from /src/blocks/youtube-block/config.ts
    const node: CMSBlockNode = {
      blockType: CMS_BLOCKS.YOUTUBE,
      youtubeUrl,
    }

    return {
      nodes: [node],
      warnings,
      errors,
      success: true,
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error')
    return {
      nodes: [],
      warnings,
      errors,
      success: false,
    }
  }
}

/**
 * Convert gallery block to galleryBlock
 *
 * @param context - Conversion context
 * @returns Conversion result with galleryBlock node
 *
 * @example
 * ```ts
 * const result = await convertGallery(context)
 * // Returns { nodes: [{ blockType: 'galleryBlock', images: [...], numberPerRow: '3' }] }
 * ```
 */
export async function convertGallery(context: ConversionContext): Promise<ConversionResult> {
  const { payload, chunk, imageMap } = context
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Extract image URLs from gallery
    const imageUrls = extractGalleryImages(chunk.html)

    if (imageUrls.length === 0) {
      errors.push('No images found in gallery')
      return {
        nodes: [],
        warnings,
        errors,
        success: false,
      }
    }

    // Upload images and get media IDs
    const { extractImages } = await import('../media/extract')
    const images = imageUrls.map((url) => ({
      src: url,
      normalizedSrc: url,
      alt: '',
      status: 'pending' as const,
    }))

    const uploadedMap = await uploadImages(payload, images)

    // Build images array following schema from /src/blocks/gallery-block/config.ts
    const galleryImages = Array.from(uploadedMap.values())
      .filter((id) => id !== undefined)
      .map((mediaId) => ({
        image: mediaId,
      }))

    if (galleryImages.length === 0) {
      errors.push('Failed to upload gallery images')
      return {
        nodes: [],
        warnings,
        errors,
        success: false,
      }
    }

    // Get numberPerRow from attributes or default to '3'
    const columns = chunk.attributes?.columns as number | undefined
    const numberPerRow = columns ? columns.toString() : '3'

    // Create galleryBlock following schema from /src/blocks/gallery-block/config.ts
    const node: CMSBlockNode = {
      blockType: CMS_BLOCKS.GALLERY,
      images: galleryImages,
      numberPerRow,
    }

    // Update image map
    uploadedMap.forEach((mediaId, url) => {
      imageMap.set(url, mediaId)
    })

    return {
      nodes: [node],
      warnings,
      errors,
      success: true,
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error')
    return {
      nodes: [],
      warnings,
      errors,
      success: false,
    }
  }
}

/**
 * Convert button block to buttonBlock
 *
 * Handles both single buttons and buttons containers (wp-block-buttons).
 * Each button becomes a separate buttonBlock node.
 *
 * @param context - Conversion context
 * @returns Conversion result with buttonBlock node(s)
 *
 * @example
 * ```ts
 * const result = await convertButton(context)
 * // Returns { nodes: [{ blockType: 'buttonBlock', link: {...}, appearance: 'default' }] }
 * ```
 */
export async function convertButton(context: ConversionContext): Promise<ConversionResult> {
  const { chunk } = context
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Extract buttons from HTML
    const dom = new (await import('jsdom')).JSDOM(chunk.html)
    const document = dom.window.document

    // Find all button links (wp-block-buttons can contain multiple wp-block-button)
    let linkElements = Array.from(
      document.querySelectorAll('a.wp-block-button__link, .wp-block-button a'),
    )

    // If no buttons found, try to find any link
    if (linkElements.length === 0) {
      const fallbackLink = document.querySelector('a')
      if (!fallbackLink) {
        errors.push('No link found in button block')
        return {
          nodes: [],
          warnings,
          errors,
          success: false,
        }
      }
      linkElements = [fallbackLink]
    }

    const nodes: CMSBlockNode[] = []

    // Process each button
    linkElements.forEach((linkElement, index) => {
      const href = linkElement.getAttribute('href') || ''
      const text = linkElement.textContent?.trim() || ''
      const target = linkElement.getAttribute('target')

      // Handle buttons without href
      if (!href) {
        warnings.push(
          `Button "${text || `Button ${index + 1}`}" has no href attribute. Using placeholder "#".`,
        )
      }

      // Find the parent button container to check for appearance classes
      const buttonContainer = linkElement.closest('.wp-block-button')
      const containerClasses = buttonContainer?.className || ''
      const linkClasses = linkElement.className || ''

      // Check for outline style in container or link classes
      const isOutline =
        containerClasses.includes('is-style-outline') ||
        linkClasses.includes('is-style-outline') ||
        (chunk.attributes?.className as string | undefined)?.includes('outline')

      // Determine link type (internal vs custom)
      // For now, assume all are custom URLs (can be enhanced to check for internal posts)
      const link = {
        type: 'custom' as const,
        url: href || '#', // Use placeholder if no href
        newTab: target === '_blank',
        label: text || undefined,
      }

      // Get appearance from classes or default
      const appearance = isOutline ? 'outline' : 'default'

      // Create buttonBlock following schema from /src/blocks/button-block/config.ts
      nodes.push({
        blockType: CMS_BLOCKS.BUTTON,
        link,
        appearance,
      })
    })

    if (nodes.length === 0) {
      errors.push('No valid buttons found in button block')
      return {
        nodes: [],
        warnings,
        errors,
        success: false,
      }
    }

    return {
      nodes,
      warnings,
      errors,
      success: true,
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error')
    return {
      nodes: [],
      warnings,
      errors,
      success: false,
    }
  }
}

/**
 * Convert video block to videoBlock
 *
 * @param context - Conversion context
 * @returns Conversion result with videoBlock node
 *
 * @example
 * ```ts
 * const result = await convertVideo(context)
 * ```
 */
export async function convertVideo(context: ConversionContext): Promise<ConversionResult> {
  const { payload, chunk, imageMap } = context
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Extract video URL or file
    let videoUrl = chunk.attributes?.url as string | undefined
    const videoId = chunk.attributes?.id as number | undefined

    // If no URL in attributes, try to extract from HTML
    if (!videoUrl) {
      const dom = new (await import('jsdom')).JSDOM(chunk.html)
      const document = dom.window.document

      // Check for video element
      const videoElement = document.querySelector('video')
      if (videoElement) {
        videoUrl = videoElement.getAttribute('src') || undefined
      }

      // Check for embed wrapper (VideoPress, etc.)
      if (!videoUrl) {
        const embedWrapper = document.querySelector('.wp-block-embed__wrapper')
        if (embedWrapper) {
          const textContent = embedWrapper.textContent?.trim()
          if (
            textContent &&
            (textContent.startsWith('http://') || textContent.startsWith('https://'))
          ) {
            videoUrl = textContent
          }
        }
      }
    }

    // Check if it's a YouTube link - throw error as it should use youtubeBlock instead
    if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))) {
      errors.push('YouTube videos should use youtubeBlock, not videoBlock')
      return {
        nodes: [],
        warnings,
        errors,
        success: false,
      }
    }

    if (!videoUrl && !videoId) {
      errors.push('No video URL or ID found')
      return {
        nodes: [],
        warnings,
        errors,
        success: false,
      }
    }

    // Download and upload video file
    if (videoUrl) {
      try {
        console.log(`📥 Downloading video: ${videoUrl}`)
        const videoData = await downloadVideo(videoUrl)
        const mediaId = await uploadVideoToPayload(
          payload,
          videoData,
          'Video from WordPress migration',
        )

        // Create videoBlock node
        const node: CMSBlockNode = {
          blockType: CMS_BLOCKS.VIDEO,
          video: mediaId,
        }

        return {
          nodes: [node],
          warnings,
          errors,
          success: true,
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Failed to download/upload video: ${errorMessage}`)
        warnings.push(`Video URL: ${videoUrl}`)
        return {
          nodes: [],
          warnings,
          errors,
          success: false,
        }
      }
    }

    // If we only have videoId (WordPress media ID), we can't download it without the URL
    if (videoId) {
      warnings.push(
        `Video ID ${videoId} is a WordPress media ID, but no URL found. ` +
          `Cannot download video without URL. Skipping video block.`,
      )
      return {
        nodes: [],
        warnings,
        errors: ['Cannot download video: WordPress media ID provided but no URL available'],
        success: false,
      }
    }

    errors.push('No video URL or ID found')
    return {
      nodes: [],
      warnings,
      errors,
      success: false,
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error')
    return {
      nodes: [],
      warnings,
      errors,
      success: false,
    }
  }
}

/**
 * Convert VideoPress embed to videopressBlock
 *
 * @param context - Conversion context
 * @returns Conversion result with videopressBlock node
 *
 * @example
 * ```ts
 * const result = await convertVideopress(context)
 * // Returns { nodes: [{ blockType: 'videopressBlock', videopressUrl: '...' }] }
 * ```
 */
export async function convertVideopress(context: ConversionContext): Promise<ConversionResult> {
  const { chunk } = context
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Extract VideoPress URL
    let videopressUrl = chunk.attributes?.url as string | undefined
    const guid = chunk.attributes?.guid as string | undefined

    // If no URL in attributes, try to extract from HTML
    if (!videopressUrl) {
      const dom = new (await import('jsdom')).JSDOM(chunk.html)
      const document = dom.window.document

      // Check for embed wrapper
      const embedWrapper = document.querySelector('.wp-block-embed__wrapper')
      if (embedWrapper) {
        const textContent = embedWrapper.textContent?.trim()
        if (
          textContent &&
          (textContent.startsWith('http://') || textContent.startsWith('https://'))
        ) {
          videopressUrl = textContent
        }
      }
    }

    // If we have a GUID but no URL, construct the URL
    if (!videopressUrl && guid) {
      videopressUrl = `https://videopress.com/v/${guid}`
    }

    if (!videopressUrl) {
      errors.push('Could not extract VideoPress URL')
      return {
        nodes: [],
        warnings,
        errors,
        success: false,
      }
    }

    // Create videopressBlock following schema from /src/blocks/videopress-block/config.ts
    const node: CMSBlockNode = {
      blockType: CMS_BLOCKS.VIDEOPRESS,
      videopressUrl,
    }

    return {
      nodes: [node],
      warnings,
      errors,
      success: true,
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error')
    return {
      nodes: [],
      warnings,
      errors,
      success: false,
    }
  }
}

/**
 * Convert columns block to columnsBlock
 *
 * Extracts columns from WordPress columns HTML structure and converts
 * each column's content to Lexical rich text.
 *
 * @param context - Conversion context
 * @returns Conversion result with columnsBlock node
 *
 * @example
 * ```ts
 * const result = await convertColumns(context)
 * // Returns { nodes: [{ blockType: 'columnsBlock', columns: [...], columnCount: 2 }] }
 * ```
 */
export async function convertColumns(context: ConversionContext): Promise<ConversionResult> {
  const { payload, chunk, imageMap } = context
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Extract columns from HTML
    const dom = new (await import('jsdom')).JSDOM(chunk.html)
    const document = dom.window.document

    // Find all column elements
    const columnElements = Array.from(document.querySelectorAll('.wp-block-column'))

    if (columnElements.length === 0) {
      errors.push('No columns found in columns block')
      return {
        nodes: [],
        warnings,
        errors,
        success: false,
      }
    }

    // Convert each column's content to Lexical using convertToLexical for proper table handling
    const { convertToLexical } = await import('./lexical')

    const columns = await Promise.all(
      columnElements.map(async (columnElement, index) => {
        // Get the inner HTML of the column
        const columnHTML = columnElement.innerHTML

        // Create a temporary chunk for this column
        const columnChunk = {
          type: 'paragraph',
          html: columnHTML,
          index,
          attributes: {},
        }

        // Convert column content to Lexical (handles tables, images, etc.)
        const conversionResult = await convertToLexical({
          payload,
          chunk: columnChunk,
          imageMap,
          allChunks: [],
        })

        if (!conversionResult.success || conversionResult.nodes.length === 0) {
          warnings.push(
            `Column ${index + 1} conversion had issues: ${conversionResult.errors.join(', ')}`,
          )
          // Return empty content if conversion failed
          return {
            content: {
              root: {
                type: 'root',
                children: [],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          }
        }

        // Merge all nodes into a single root
        const { mergeNodesPreservingOrder } = await import('../utils/merge-lexical')
        const merged = mergeNodesPreservingOrder(conversionResult.nodes)

        return {
          content: {
            root: merged.root,
          },
        }
      }),
    )

    // Get column count from attributes or use number of columns found
    const columnCount = (chunk.attributes?.columns as number | undefined) || columnElements.length

    // Create columnsBlock following schema from /src/blocks/columns-block/config.ts
    const node: CMSBlockNode = {
      blockType: CMS_BLOCKS.COLUMNS,
      columns,
      columnCount: Math.min(columnCount, 6), // Max 6 columns
    }

    return {
      nodes: [node],
      warnings,
      errors,
      success: true,
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error')
    return {
      nodes: [],
      warnings,
      errors,
      success: false,
    }
  }
}

/**
 * Router function to call appropriate converter based on block type
 *
 * @param context - Conversion context
 * @returns Conversion result
 */
export async function convertUnsupportedBlock(
  context: ConversionContext,
): Promise<ConversionResult> {
  const { chunk } = context
  const { getCMSBlockMapping } = await import('../core/registry')
  const cmsBlockSlug = getCMSBlockMapping(chunk.type)

  switch (cmsBlockSlug) {
    case CMS_BLOCKS.YOUTUBE:
      return convertYouTube(context)

    case CMS_BLOCKS.VIDEOPRESS:
      return convertVideopress(context)

    case CMS_BLOCKS.GALLERY:
      return convertGallery(context)

    case CMS_BLOCKS.BUTTON:
      return convertButton(context)

    case CMS_BLOCKS.VIDEO:
      return convertVideo(context)

    case CMS_BLOCKS.COLUMNS:
      return convertColumns(context)

    default:
      return {
        nodes: [],
        warnings: [`No converter found for block type: ${chunk.type}`],
        errors: [`Unsupported block type: ${chunk.type}`],
        success: false,
      }
  }
}
