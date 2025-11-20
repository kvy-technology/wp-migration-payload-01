import { WP_BLOCKS } from '../core/constants'
import {
  detectBlockType,
  getConversionStrategy,
  hasCMSBlockMapping,
  isLexicalSupported,
} from '../core/registry'
import type { ChunkDetection, WPChunk } from '../core/types'

/**
 * WordPress Chunk Detector
 *
 * Detects block types and determines conversion strategy for each chunk.
 * Uses registry-based detection for extensibility.
 */

/**
 * Detect chunk type and conversion strategy
 *
 * @param chunk - WordPress chunk to analyze
 * @returns Chunk detection result
 *
 * @example
 * ```ts
 * const detection = detectChunk({
 *   type: 'gallery',
 *   html: '<figure class="wp-block-gallery">...</figure>',
 *   index: 0
 * })
 * // Returns { type: 'gallery', isLexicalSupported: false, isCMSBlock: true, ... }
 * ```
 */
export function detectChunk(chunk: WPChunk): ChunkDetection {
  // Use registry to detect block type (may refine the declared type)
  const detectedType = detectBlockType(chunk.html, chunk.type, chunk.attributes)

  // Check if Lexical supports it
  const lexicalSupported = isLexicalSupported(detectedType)

  // Check if there's a CMS block mapping
  const cmsBlockMapping = hasCMSBlockMapping(detectedType)
  const cmsBlockSlug = cmsBlockMapping
    ? require('../core/registry').getCMSBlockMapping(detectedType)
    : undefined

  // Determine confidence based on detection quality
  let confidence = 0.8

  // Higher confidence if type matches declared type
  if (detectedType === chunk.type) {
    confidence = 0.95
  }

  // Lower confidence if we had to detect from HTML
  if (!chunk.rawComment) {
    confidence = 0.7
  }

  // Check for ambiguous cases
  if (detectedType === WP_BLOCKS.EMBED) {
    // Need to further detect embed provider
    if (chunk.html.includes('youtube') || chunk.html.includes('youtu.be')) {
      confidence = 0.9
    } else {
      confidence = 0.6 // Unknown embed provider
    }
  }

  return {
    type: detectedType,
    isLexicalSupported: lexicalSupported,
    isCMSBlock: cmsBlockMapping,
    cmsBlockSlug,
    confidence,
  }
}

/**
 * Get conversion strategy for a chunk
 *
 * @param chunk - WordPress chunk
 * @returns Conversion strategy string
 *
 * @example
 * ```ts
 * getChunkStrategy(chunk) // 'lexical' | 'cms-block' | 'custom'
 * ```
 */
export function getChunkStrategy(chunk: WPChunk): 'lexical' | 'cms-block' | 'custom' {
  const detection = detectChunk(chunk)
  return getConversionStrategy(detection.type)
}

/**
 * Batch detect multiple chunks
 *
 * @param chunks - Array of WordPress chunks
 * @returns Array of detection results
 *
 * @example
 * ```ts
 * const detections = batchDetectChunks(chunks)
 * ```
 */
export function batchDetectChunks(chunks: WPChunk[]): ChunkDetection[] {
  return chunks.map((chunk) => detectChunk(chunk))
}

/**
 * Filter chunks by conversion strategy
 *
 * @param chunks - Array of chunks
 * @param strategy - Strategy to filter by
 * @returns Filtered chunks
 *
 * @example
 * ```ts
 * const lexicalChunks = filterChunksByStrategy(chunks, 'lexical')
 * ```
 */
export function filterChunksByStrategy(
  chunks: WPChunk[],
  strategy: 'lexical' | 'cms-block' | 'custom',
): WPChunk[] {
  return chunks.filter((chunk) => getChunkStrategy(chunk) === strategy)
}

/**
 * Validate chunk detection
 *
 * @param detection - Detection result to validate
 * @returns True if detection is valid
 *
 * @example
 * ```ts
 * if (validateDetection(detection)) {
 *   // Proceed with conversion
 * }
 * ```
 */
export function validateDetection(detection: ChunkDetection): boolean {
  // Must have a type
  if (!detection.type) {
    return false
  }

  // Must have at least one conversion path
  if (!detection.isLexicalSupported && !detection.isCMSBlock) {
    // Custom blocks are allowed, but warn if confidence is low
    if (detection.confidence < 0.5) {
      console.warn(`⚠️  Low confidence detection for type: ${detection.type}`)
    }
  }

  return true
}
