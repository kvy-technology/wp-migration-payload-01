import type { WPChunk, WPBlockComment } from '../core/types'
import { WP_BLOCKS } from '../core/constants'

/**
 * WordPress Chunk Splitter
 * 
 * Splits WordPress post content into individual block chunks.
 * Handles WordPress block comment syntax: <!-- wp:block-type {...} --> ... <!-- /wp:block-type -->
 */

/**
 * Parse WordPress block comment
 * 
 * @param comment - Raw block comment string
 * @returns Parsed block comment or null if invalid
 * 
 * @example
 * ```ts
 * parseBlockComment('<!-- wp:image {"id":123} -->')
 * // Returns { type: 'image', attributes: { id: 123 }, raw: '...' }
 * ```
 */
export function parseBlockComment(comment: string): WPBlockComment | null {
  // Match: <!-- wp:block-type {...} -->
  const match = comment.match(/<!--\s*wp:([a-z0-9\/-]+)(?:\s+({[^}]*}))?\s*-->/i)
  
  if (!match) {
    return null
  }

  const [, type, attrsJson] = match
  let attributes: Record<string, unknown> = {}

  // Parse JSON attributes if present
  if (attrsJson) {
    try {
      attributes = JSON.parse(attrsJson)
    } catch (error) {
      console.warn(`⚠️  Failed to parse block attributes: ${attrsJson}`, error)
    }
  }

  return {
    type: type.trim(),
    attributes,
    raw: comment,
  }
}

/**
 * Split WordPress content into chunks
 * 
 * @param content - WordPress post content HTML
 * @returns Array of WPChunk objects
 * 
 * @example
 * ```ts
 * const chunks = splitIntoChunks(postContent)
 * // Returns [{ type: 'heading', html: '<h1>...</h1>', ... }, ...]
 * ```
 */
export function splitIntoChunks(content: string): WPChunk[] {
  const chunks: WPChunk[] = []
  
  // WordPress block pattern: <!-- wp:type {...} --> ... <!-- /wp:type -->
  const blockRegex = /<!--\s*wp:([a-z0-9\/-]+)(?:\s+({[^}]*}))?\s*-->([\s\S]*?)<!--\s*\/wp:\1\s*-->/gi

  let match
  let index = 0

  while ((match = blockRegex.exec(content)) !== null) {
    const [, rawType, attrsJson, blockContent] = match
    const type = normalizeBlockType(rawType.trim())
    
    let attributes: Record<string, unknown> = {}
    
    // Parse attributes if present
    if (attrsJson) {
      try {
        attributes = JSON.parse(attrsJson)
      } catch (error) {
        console.warn(`⚠️  Failed to parse attributes for block ${type}:`, error)
      }
    }

    // Handle nested blocks (e.g., gallery contains image blocks)
    const html = blockContent.trim()
    
    chunks.push({
      type,
      html,
      attributes,
      rawComment: match[0],
      index: index++,
    })
  }

  // Handle content outside of blocks (shouldn't happen in modern WP, but handle gracefully)
  const remainingContent = content.replace(blockRegex, '').trim()
  if (remainingContent) {
    console.warn('⚠️  Found content outside of WordPress blocks, treating as paragraph')
    chunks.push({
      type: WP_BLOCKS.PARAGRAPH,
      html: remainingContent,
      index: index++,
    })
  }

  return chunks
}

/**
 * Normalize WordPress block type names
 * 
 * @param rawType - Raw block type from comment
 * @returns Normalized block type
 * 
 * @example
 * ```ts
 * normalizeBlockType('core/paragraph') // 'paragraph'
 * normalizeBlockType('list') // 'list'
 * ```
 */
function normalizeBlockType(rawType: string): string {
  // Remove 'core/' prefix if present
  const normalized = rawType.replace(/^core\//, '')
  
  // Handle special cases
  if (normalized === 'list' && rawType.includes('ordered')) {
    return WP_BLOCKS.LIST // Will be handled by attributes.ordered
  }
  
  return normalized
}

/**
 * Check if content contains WordPress blocks
 * 
 * @param content - Content to check
 * @returns True if content contains WordPress block comments
 * 
 * @example
 * ```ts
 * hasWPBlocks('<!-- wp:paragraph --><p>Hello</p><!-- /wp:paragraph -->')
 * // Returns true
 * ```
 */
export function hasWPBlocks(content: string): boolean {
  return /<!--\s*wp:[a-z0-9\/-]+/i.test(content)
}

/**
 * Extract block type from HTML content (fallback detection)
 * 
 * @param html - HTML content
 * @returns Detected block type or 'paragraph' as default
 * 
 * @example
 * ```ts
 * detectBlockTypeFromHTML('<figure class="wp-block-gallery">...</figure>')
 * // Returns 'gallery'
 * ```
 */
export function detectBlockTypeFromHTML(html: string): string {
  // Check for common WordPress block class patterns
  if (html.includes('wp-block-gallery')) {
    return WP_BLOCKS.GALLERY
  }
  if (html.includes('wp-block-image')) {
    return WP_BLOCKS.IMAGE
  }
  if (html.includes('wp-block-heading')) {
    return WP_BLOCKS.HEADING
  }
  if (html.includes('wp-block-list')) {
    return WP_BLOCKS.LIST
  }
  if (html.includes('wp-block-quote')) {
    return WP_BLOCKS.QUOTE
  }
  if (html.includes('wp-block-table')) {
    return WP_BLOCKS.TABLE
  }
  if (html.includes('wp-block-buttons') || html.includes('wp-block-button')) {
    return WP_BLOCKS.BUTTON
  }
  if (html.includes('wp-block-columns')) {
    return WP_BLOCKS.COLUMNS
  }
  if (html.includes('wp-block-embed')) {
    return WP_BLOCKS.EMBED
  }
  
  return WP_BLOCKS.PARAGRAPH
}

