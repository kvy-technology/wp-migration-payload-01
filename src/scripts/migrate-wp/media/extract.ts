import { JSDOM } from 'jsdom'
import type { ImageReference } from '../core/types'
import { normalizeImageUrl } from './upload'

/**
 * Media Extraction Module
 * 
 * Extracts images and other media from HTML content.
 */

/**
 * Extract all images from HTML content
 * 
 * @param html - HTML content to extract images from
 * @returns Array of image references
 * 
 * @example
 * ```ts
 * const images = extractImages('<img src="https://example.com/image.jpg" alt="Test" />')
 * // Returns [{ src: '...', normalizedSrc: '...', alt: 'Test', status: 'pending' }]
 * ```
 */
export function extractImages(html: string): ImageReference[] {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const images: ImageReference[] = []

  const imgElements = document.querySelectorAll('img')
  
  imgElements.forEach((img) => {
    const src = img.getAttribute('src')
    const alt = img.getAttribute('alt') || ''
    
    if (src) {
      images.push({
        src,
        normalizedSrc: normalizeImageUrl(src),
        alt,
        status: 'pending',
      })
    }
  })

  return images
}

/**
 * Extract images from multiple HTML chunks
 * 
 * @param htmlChunks - Array of HTML strings
 * @returns Array of unique image references
 * 
 * @example
 * ```ts
 * const images = extractImagesFromChunks(['<img src="..."/>', '<img src="..."/>'])
 * ```
 */
export function extractImagesFromChunks(htmlChunks: string[]): ImageReference[] {
  const allImages: ImageReference[] = []
  const seenUrls = new Set<string>()

  for (const html of htmlChunks) {
    const images = extractImages(html)
    
    for (const image of images) {
      // Deduplicate by normalized URL
      if (!seenUrls.has(image.normalizedSrc)) {
        seenUrls.add(image.normalizedSrc)
        allImages.push(image)
      }
    }
  }

  return allImages
}

/**
 * Extract YouTube video IDs from HTML content
 * 
 * @param html - HTML content
 * @returns Array of YouTube video IDs
 * 
 * @example
 * ```ts
 * const videoIds = extractYouTubeIds('<iframe src="youtube.com/embed/abc123"></iframe>')
 * // Returns ['abc123']
 * ```
 */
export function extractYouTubeIds(html: string): string[] {
  const videoIds: string[] = []
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/g,
    /\[youtube[^\]]*id=["']?([a-zA-Z0-9_-]{11})["']?[^\]]*\]/gi,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(html)) !== null) {
      const videoId = match[1]
      if (videoId && !videoIds.includes(videoId)) {
        videoIds.push(videoId)
      }
    }
  }

  return videoIds
}

/**
 * Extract gallery image URLs from WordPress gallery block HTML
 * 
 * @param html - Gallery block HTML
 * @returns Array of image URLs
 * 
 * @example
 * ```ts
 * const urls = extractGalleryImages('<figure class="wp-block-gallery">...</figure>')
 * ```
 */
export function extractGalleryImages(html: string): string[] {
  const images = extractImages(html)
  return images.map(img => img.normalizedSrc)
}

/**
 * Replace image URLs in HTML with placeholders
 * Useful for tracking which images need to be uploaded
 * 
 * @param html - HTML content
 * @param imageMap - Map of original URL to placeholder
 * @returns HTML with replaced URLs
 * 
 * @example
 * ```ts
 * const map = new Map([['https://example.com/img.jpg', '__IMG_0__']])
 * const replaced = replaceImageUrls(html, map)
 * ```
 */
export function replaceImageUrls(
  html: string,
  imageMap: Map<string, string>
): string {
  const dom = new JSDOM(html)
  const document = dom.window.document
  
  const imgElements = document.querySelectorAll('img')
  imgElements.forEach((img) => {
    const src = img.getAttribute('src')
    if (src) {
      const normalizedSrc = normalizeImageUrl(src)
      const placeholder = imageMap.get(normalizedSrc)
      if (placeholder) {
        img.setAttribute('src', placeholder)
        img.setAttribute('data-original-src', normalizedSrc)
      }
    }
  })

  return document.body.innerHTML
}

/**
 * Restore image URLs from placeholders after upload
 * 
 * @param html - HTML with placeholders
 * @param urlMap - Map of placeholder to final URL or media ID
 * @returns HTML with restored URLs
 * 
 * @example
 * ```ts
 * const map = new Map([['__IMG_0__', 'https://payload.com/media/123']])
 * const restored = restoreImageUrls(html, map)
 * ```
 */
export function restoreImageUrls(
  html: string,
  urlMap: Map<string, string>
): string {
  const dom = new JSDOM(html)
  const document = dom.window.document
  
  const imgElements = document.querySelectorAll('img[data-original-src]')
  imgElements.forEach((img) => {
    const placeholder = img.getAttribute('src')
    const originalSrc = img.getAttribute('data-original-src')
    
    if (placeholder && originalSrc) {
      const restoredUrl = urlMap.get(placeholder) || urlMap.get(originalSrc)
      if (restoredUrl) {
        img.setAttribute('src', restoredUrl)
        img.removeAttribute('data-original-src')
      }
    }
  })

  return document.body.innerHTML
}

