import type { Payload } from 'payload'
import { MIGRATION_CONFIG, WP_URL_PATTERNS } from '../core/constants'
import type { ImageReference } from '../core/types'

/**
 * Media Upload Module
 *
 * Handles downloading and uploading images and videos to Payload CMS media collection.
 */

/**
 * Normalize image URL by removing WordPress staging suffix
 *
 * @param inputUrl - Original image URL
 * @returns Normalized URL
 *
 * @example
 * ```ts
 * normalizeImageUrl('https://site.wpcomstaging.com/image.jpg')
 * // Returns 'https://site.com/image.jpg'
 * ```
 */
export function normalizeImageUrl(inputUrl: string): string {
  try {
    const u = new URL(inputUrl)
    u.host = u.host.replace(WP_URL_PATTERNS.STAGING_SUFFIX, '')
    return u.toString()
  } catch {
    return inputUrl
  }
}

/**
 * Download image from URL
 *
 * @param url - Image URL
 * @returns Image data buffer and metadata
 *
 * @example
 * ```ts
 * const imageData = await downloadImage('https://example.com/image.jpg')
 * // Returns { buffer: Buffer, filename: 'image.jpg', mimeType: 'image/jpeg' }
 * ```
 */
export async function downloadImage(
  url: string,
): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
  try {
    const normalizedUrl = normalizeImageUrl(url)
    const response = await fetch(normalizedUrl)

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Validate content type
    if (!MIGRATION_CONFIG.SUPPORTED_IMAGE_TYPES.includes(contentType as any)) {
      throw new Error(`Unsupported image type: ${contentType}`)
    }

    // Validate size
    if (buffer.length > MIGRATION_CONFIG.MAX_IMAGE_SIZE) {
      throw new Error(`Image too large: ${buffer.length} bytes`)
    }

    // Extract filename from URL
    const urlPath = new URL(normalizedUrl).pathname
    const filename = urlPath.split('/').pop() || `image-${Date.now()}.jpg`

    return {
      buffer,
      filename,
      mimeType: contentType,
    }
  } catch (error) {
    console.error(`❌ Error downloading image from ${url}:`, error)
    throw error
  }
}

/**
 * Check if media already exists in Payload
 *
 * @param payload - Payload instance
 * @param filename - Media filename to check
 * @returns Media document ID if exists, undefined otherwise
 *
 * @example
 * ```ts
 * const existingId = await checkExistingMedia(payload, 'image.jpg')
 * ```
 */
export async function checkExistingMedia(
  payload: Payload,
  filename: string,
): Promise<number | undefined> {
  try {
    const existing = await payload.find({
      collection: 'media',
      where: {
        filename: {
          equals: filename,
        },
      },
      limit: 1,
    })

    const existingMedia = existing?.docs?.[0]
    if (existingMedia?.id != null) {
      const existingId =
        typeof existingMedia.id === 'number'
          ? existingMedia.id
          : Number((existingMedia.id as unknown as string) ?? NaN)

      if (!Number.isNaN(existingId)) {
        return existingId
      }
    }
  } catch (error) {
    // If lookup fails, continue with upload
    console.warn(`⚠️  Could not check existing media for ${filename}:`, error)
  }

  return undefined
}

/**
 * Upload image to Payload CMS media collection
 *
 * @param payload - Payload instance
 * @param imageData - Image data to upload
 * @param alt - Alt text for the image
 * @returns Media document ID
 *
 * @example
 * ```ts
 * const mediaId = await uploadImageToPayload(payload, {
 *   buffer: Buffer,
 *   filename: 'image.jpg',
 *   mimeType: 'image/jpeg'
 * }, 'Alt text')
 * ```
 */
export async function uploadImageToPayload(
  payload: Payload,
  imageData: { buffer: Buffer; filename: string; mimeType: string },
  alt: string = '',
): Promise<number> {
  try {
    // Check if media already exists
    const existingId = await checkExistingMedia(payload, imageData.filename)
    if (existingId) {
      console.log(
        `ℹ️  Skipping upload, media already exists: ${imageData.filename} (ID: ${existingId})`,
      )
      return existingId
    }

    // Convert Buffer to Uint8Array for File constructor
    const uint8Array = new Uint8Array(imageData.buffer)

    // Upload to Payload's media collection
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: alt || imageData.filename,
      },
      file: {
        data: uint8Array as any,
        name: imageData.filename,
        size: imageData.buffer.length,
        mimetype: imageData.mimeType,
      },
    })

    const mediaId = typeof media.id === 'number' ? media.id : Number(media.id)
    console.log(`✅ Uploaded image: ${imageData.filename} (ID: ${mediaId})`)
    return mediaId
  } catch (error) {
    console.error(`❌ Error uploading image ${imageData.filename}:`, error)
    throw error
  }
}

/**
 * Upload multiple images with retry logic
 *
 * @param payload - Payload instance
 * @param images - Array of image references to upload
 * @returns Map of image URLs to media IDs
 *
 * @example
 * ```ts
 * const imageMap = await uploadImages(payload, imageReferences)
 * ```
 */
export async function uploadImages(
  payload: Payload,
  images: ImageReference[],
): Promise<Map<string, number>> {
  const imageMap = new Map<string, number>()

  for (const image of images) {
    if (image.status === 'uploaded' && image.mediaId) {
      // Already uploaded
      imageMap.set(image.normalizedSrc, image.mediaId)
      continue
    }

    if (image.status === 'skipped') {
      continue
    }

    try {
      console.log(`📥 Downloading: ${image.normalizedSrc}`)
      const imageData = await downloadImage(image.normalizedSrc)
      const mediaId = await uploadImageToPayload(payload, imageData, image.alt)

      image.mediaId = mediaId
      image.status = 'uploaded'
      imageMap.set(image.normalizedSrc, mediaId)
    } catch (error) {
      console.error(`❌ Failed to process image ${image.normalizedSrc}:`, error)
      image.status = 'failed'
      image.error = error instanceof Error ? error.message : 'Unknown error'
    }
  }

  return imageMap
}

/**
 * Download video from URL
 *
 * @param url - Video URL
 * @returns Video data buffer and metadata
 *
 * @example
 * ```ts
 * const videoData = await downloadVideo('https://example.com/video.mp4')
 * // Returns { buffer: Buffer, filename: 'video.mp4', mimeType: 'video/mp4' }
 * ```
 */
export async function downloadVideo(
  url: string,
): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
  try {
    const normalizedUrl = normalizeImageUrl(url) // Reuse normalization function
    const response = await fetch(normalizedUrl)

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status} ${response.statusText}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get('content-type') || 'video/mp4'

    // Validate content type
    if (!MIGRATION_CONFIG.SUPPORTED_VIDEO_TYPES.includes(contentType as any)) {
      throw new Error(`Unsupported video type: ${contentType}`)
    }

    // Validate size
    if (buffer.length > MIGRATION_CONFIG.MAX_VIDEO_SIZE) {
      throw new Error(`Video too large: ${buffer.length} bytes`)
    }

    // Extract filename from URL
    const urlPath = new URL(normalizedUrl).pathname
    const filename = urlPath.split('/').pop() || `video-${Date.now()}.mp4`

    return {
      buffer,
      filename,
      mimeType: contentType,
    }
  } catch (error) {
    console.error(`❌ Error downloading video from ${url}:`, error)
    throw error
  }
}

/**
 * Upload video to Payload CMS media collection
 *
 * @param payload - Payload instance
 * @param videoData - Video data to upload
 * @param alt - Alt text for the video
 * @returns Media document ID
 *
 * @example
 * ```ts
 * const mediaId = await uploadVideoToPayload(payload, {
 *   buffer: Buffer,
 *   filename: 'video.mp4',
 *   mimeType: 'video/mp4'
 * }, 'Video description')
 * ```
 */
export async function uploadVideoToPayload(
  payload: Payload,
  videoData: { buffer: Buffer; filename: string; mimeType: string },
  alt: string = '',
): Promise<number> {
  try {
    // Check if media already exists
    const existingId = await checkExistingMedia(payload, videoData.filename)
    if (existingId) {
      console.log(
        `ℹ️  Skipping upload, media already exists: ${videoData.filename} (ID: ${existingId})`,
      )
      return existingId
    }

    // Convert Buffer to Uint8Array for File constructor
    const uint8Array = new Uint8Array(videoData.buffer)

    // Upload to Payload's media collection
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: alt || videoData.filename,
      },
      file: {
        data: uint8Array as any,
        name: videoData.filename,
        size: videoData.buffer.length,
        mimetype: videoData.mimeType,
      },
    })

    const mediaId = typeof media.id === 'number' ? media.id : Number(media.id)
    console.log(`✅ Uploaded video: ${videoData.filename} (ID: ${mediaId})`)
    return mediaId
  } catch (error) {
    console.error(`❌ Error uploading video ${videoData.filename}:`, error)
    throw error
  }
}
