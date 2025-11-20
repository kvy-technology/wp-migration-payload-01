/**
 * WordPress → PayloadCMS Migration Constants
 *
 * Defines all WordPress block types, CMS block slugs, and mapping constants
 * used throughout the migration pipeline.
 */

/**
 * WordPress Core Block Types
 * These match WordPress block comment syntax: <!-- wp:block-type -->
 */
export const WP_BLOCKS = {
  // Core blocks
  PARAGRAPH: 'paragraph',
  HEADING: 'heading',
  IMAGE: 'image',
  GALLERY: 'gallery',
  LIST: 'list',
  QUOTE: 'quote',
  TABLE: 'table',
  COLUMNS: 'columns',
  COLUMN: 'column',
  EMBED: 'embed',
  CODE: 'code',
  BUTTONS: 'buttons',
  BUTTON: 'button',
  VIDEO: 'video',
  SHORTCODE: 'shortcode',

  // Shortcode variants
  SHORTCODE_GALLERY: 'shortcode-gallery',
  SHORTCODE_YOUTUBE: 'shortcode-youtube',
  SHORTCODE_VIDEO: 'shortcode-video',

  // Embed providers
  YOUTUBE_EMBED: 'youtube-embed',
  VIDEOPRESS_EMBED: 'videopress-embed',
  VIMEO_EMBED: 'vimeo',
} as const

/**
 * PayloadCMS Block Slugs
 * These match the block slugs defined in /src/blocks/[block-name]/config.ts
 */
export const CMS_BLOCKS = {
  YOUTUBE: 'youtubeBlock',
  VIDEO: 'videoBlock',
  VIDEOPRESS: 'videopressBlock',
  GALLERY: 'galleryBlock',
  BUTTON: 'buttonBlock',
  MEDIA: 'mediaBlock',
  BANNER: 'banner',
  COLUMNS: 'columnsBlock',
} as const

/**
 * Lexical Node Types
 * Standard Lexical editor node types
 */
export const LEXICAL_NODES = {
  ROOT: 'root',
  PARAGRAPH: 'paragraph',
  HEADING: 'heading',
  LIST: 'list',
  LIST_ITEM: 'listitem',
  QUOTE: 'quote',
  TEXT: 'text',
  LINK: 'link',
  TABLE: 'table',
  TABLE_ROW: 'tablerow',
  TABLE_CELL: 'tablecell',
  UPLOAD: 'upload',
} as const

/**
 * WordPress Block Attribute Keys
 * Common attributes found in WP block comments
 */
export const WP_ATTRIBUTES = {
  ID: 'id',
  SIZE_SLUG: 'sizeSlug',
  LINK_DESTINATION: 'linkDestination',
  LEVEL: 'level',
  ORDERED: 'ordered',
  HAS_FIXED_LAYOUT: 'hasFixedLayout',
  LINK_TO: 'linkTo',
  COLUMNS: 'columns',
} as const

/**
 * Migration Configuration Constants
 */
export const MIGRATION_CONFIG = {
  // Image processing
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],

  // Video processing
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],

  // Chunk processing
  MAX_CHUNK_SIZE: 10000, // characters

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
} as const

/**
 * WordPress URL Patterns
 */
export const WP_URL_PATTERNS = {
  STAGING_SUFFIX: '.wpcomstaging',
  IMAGE_PATH: '/wp-content/uploads/',
} as const

/**
 * YouTube URL Patterns
 */
const YOUTUBE_SHORTCODE_PATTERN = /\[youtube[^\]]*id=["']?([a-zA-Z0-9_-]{11})["']?[^\]]*\]/gi

export const YOUTUBE_PATTERNS = {
  WATCH: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  EMBED: /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  SHORTCODE: YOUTUBE_SHORTCODE_PATTERN,
}

/**
 * Type exports for TypeScript
 */
export type WPBlockType = (typeof WP_BLOCKS)[keyof typeof WP_BLOCKS]
export type CMSBlockType = (typeof CMS_BLOCKS)[keyof typeof CMS_BLOCKS]
export type LexicalNodeType = (typeof LEXICAL_NODES)[keyof typeof LEXICAL_NODES]
