import type { CMSBlockType } from './constants'
import { CMS_BLOCKS, WP_BLOCKS } from './constants'

/**
 * Registry-Based Feature Routing
 *
 * This registry defines:
 * 1. What Lexical supports natively
 * 2. What maps to CMS blocks
 * 3. What requires custom handling
 *
 * To add support for a new block type:
 * 1. Add the WP block type to WP_BLOCKS in constants.ts
 * 2. Add mapping here if it needs a CMS block
 * 3. Implement converter in /converters/unsupported-blocks.ts
 */

/**
 * Lexical-Supported Features
 * These block types can be converted directly to Lexical nodes
 * using convertHTMLToLexical
 */
export const LEXICAL_SUPPORTED: Record<string, boolean> = {
  [WP_BLOCKS.PARAGRAPH]: true,
  [WP_BLOCKS.HEADING]: true,
  [WP_BLOCKS.LIST]: true,
  [WP_BLOCKS.QUOTE]: true,
  [WP_BLOCKS.TABLE]: true,
  // Columns are not natively supported by Lexical - need custom block
  [WP_BLOCKS.COLUMNS]: false,
  [WP_BLOCKS.COLUMN]: false,
  // Basic images are supported, but we handle them specially for media upload
  [WP_BLOCKS.IMAGE]: false, // Handled separately for media upload
  [WP_BLOCKS.CODE]: true,
}

/**
 * Unsupported → CMS Block Mapping
 * Maps WordPress block types to PayloadCMS block slugs
 *
 * If a block type is not in LEXICAL_SUPPORTED and has a mapping here,
 * it will be converted to the corresponding CMS block.
 */
export const UNSUPPORTED_MAPPING: Record<string, CMSBlockType> = {
  // Gallery blocks → galleryBlock
  [WP_BLOCKS.GALLERY]: CMS_BLOCKS.GALLERY,
  [WP_BLOCKS.SHORTCODE_GALLERY]: CMS_BLOCKS.GALLERY,

  // YouTube embeds → youtubeBlock
  [WP_BLOCKS.YOUTUBE_EMBED]: CMS_BLOCKS.YOUTUBE,
  [WP_BLOCKS.SHORTCODE_YOUTUBE]: CMS_BLOCKS.YOUTUBE,

  // VideoPress embeds → videopressBlock
  [WP_BLOCKS.VIDEOPRESS_EMBED]: CMS_BLOCKS.VIDEOPRESS,

  // Video blocks → videoBlock
  [WP_BLOCKS.VIDEO]: CMS_BLOCKS.VIDEO,
  [WP_BLOCKS.SHORTCODE_VIDEO]: CMS_BLOCKS.VIDEO,

  // Button blocks → buttonBlock
  [WP_BLOCKS.BUTTONS]: CMS_BLOCKS.BUTTON,
  [WP_BLOCKS.BUTTON]: CMS_BLOCKS.BUTTON,

  // Columns blocks → columnsBlock
  [WP_BLOCKS.COLUMNS]: CMS_BLOCKS.COLUMNS,

  // Single images → mediaBlock (optional, can also stay in Lexical)
  // [WP_BLOCKS.IMAGE]: CMS_BLOCKS.MEDIA, // Uncomment if you want images as blocks
}

/**
 * Block Detection Patterns
 * Regex patterns and detection logic for identifying block types
 */
export const BLOCK_DETECTION_PATTERNS: Record<string, RegExp | ((html: string) => boolean)> = {
  // YouTube detection
  [WP_BLOCKS.YOUTUBE_EMBED]: /youtube\.com|youtu\.be/,
  [WP_BLOCKS.SHORTCODE_YOUTUBE]: /\[youtube[^\]]*\]/i,

  // Gallery detection
  [WP_BLOCKS.SHORTCODE_GALLERY]: /\[gallery[^\]]*\]/i,

  // Video detection
  [WP_BLOCKS.SHORTCODE_VIDEO]: /\[video[^\]]*\]/i,

  // Button detection
  [WP_BLOCKS.BUTTON]: (html: string) =>
    html.includes('wp-block-button') || html.includes('wp-block-buttons'),
}

/**
 * Check if a block type is supported by Lexical
 *
 * @param blockType - WordPress block type
 * @returns True if Lexical can handle this natively
 *
 * @example
 * ```ts
 * isLexicalSupported('paragraph') // true
 * isLexicalSupported('gallery') // false
 * ```
 */
export function isLexicalSupported(blockType: string): boolean {
  return LEXICAL_SUPPORTED[blockType] === true
}

/**
 * Get CMS block mapping for an unsupported block type
 *
 * @param blockType - WordPress block type
 * @returns CMS block slug if mapped, undefined otherwise
 *
 * @example
 * ```ts
 * getCMSBlockMapping('gallery') // 'galleryBlock'
 * getCMSBlockMapping('paragraph') // undefined
 * ```
 */
export function getCMSBlockMapping(blockType: string): CMSBlockType | undefined {
  return UNSUPPORTED_MAPPING[blockType]
}

/**
 * Check if a block type has a CMS block mapping
 *
 * @param blockType - WordPress block type
 * @returns True if there's a CMS block mapping
 *
 * @example
 * ```ts
 * hasCMSBlockMapping('gallery') // true
 * hasCMSBlockMapping('paragraph') // false
 * ```
 */
export function hasCMSBlockMapping(blockType: string): boolean {
  return blockType in UNSUPPORTED_MAPPING
}

/**
 * Detect block type from HTML content and attributes
 * Uses patterns and heuristics to identify block types
 *
 * @param html - HTML content to analyze
 * @param declaredType - Type declared in WP block comment (if available)
 * @param attributes - Block attributes from WP block comment (if available)
 * @returns Detected block type
 *
 * @example
 * ```ts
 * detectBlockType('<figure class="wp-block-gallery">...</figure>', 'gallery')
 * // Returns 'gallery'
 *
 * detectBlockType('<iframe src="youtube.com/embed/..."></iframe>', 'embed', { providerNameSlug: 'youtube' })
 * // Returns 'youtube-embed'
 * ```
 */
export function detectBlockType(
  html: string,
  declaredType?: string,
  attributes?: Record<string, unknown>,
): string {
  // Check attributes first for embed provider detection
  if (declaredType === WP_BLOCKS.EMBED && attributes) {
    const providerNameSlug = attributes.providerNameSlug as string | undefined
    const url = attributes.url as string | undefined

    // Check providerNameSlug attribute
    if (providerNameSlug === 'youtube') {
      return WP_BLOCKS.YOUTUBE_EMBED
    }
    if (providerNameSlug === 'videopress') {
      return WP_BLOCKS.VIDEOPRESS_EMBED
    }

    // Check URL for YouTube patterns
    if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
      return WP_BLOCKS.YOUTUBE_EMBED
    }

    // Check URL for VideoPress patterns
    if (url && url.includes('videopress.com')) {
      return WP_BLOCKS.VIDEOPRESS_EMBED
    }
  }

  // Check for VideoPress in video blocks
  if (declaredType === WP_BLOCKS.VIDEO && attributes) {
    const url = attributes.url as string | undefined
    const guid = attributes.guid as string | undefined
    const videoPressClassNames = attributes.videoPressClassNames as string | undefined

    if (videoPressClassNames?.includes('videopress') || guid) {
      return WP_BLOCKS.VIDEOPRESS_EMBED
    }

    if (url && url.includes('videopress.com')) {
      return WP_BLOCKS.VIDEOPRESS_EMBED
    }
  }

  // If declared type has a mapping, use it
  if (declaredType && hasCMSBlockMapping(declaredType)) {
    return declaredType
  }

  // Check detection patterns
  for (const [type, pattern] of Object.entries(BLOCK_DETECTION_PATTERNS)) {
    if (pattern instanceof RegExp) {
      if (pattern.test(html)) {
        return type
      }
    } else if (typeof pattern === 'function') {
      if (pattern(html)) {
        return type
      }
    }
  }

  // Fall back to declared type or 'paragraph'
  return declaredType || WP_BLOCKS.PARAGRAPH
}

/**
 * Get conversion strategy for a block type
 *
 * @param blockType - WordPress block type
 * @returns Conversion strategy: 'lexical', 'cms-block', or 'custom'
 *
 * @example
 * ```ts
 * getConversionStrategy('paragraph') // 'lexical'
 * getConversionStrategy('gallery') // 'cms-block'
 * getConversionStrategy('unknown') // 'custom'
 * ```
 */
export function getConversionStrategy(blockType: string): 'lexical' | 'cms-block' | 'custom' {
  if (isLexicalSupported(blockType)) {
    return 'lexical'
  }

  if (hasCMSBlockMapping(blockType)) {
    return 'cms-block'
  }

  return 'custom'
}
