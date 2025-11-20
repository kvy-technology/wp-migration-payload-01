import type { Payload } from 'payload'
import type { CMSBlockType, WPBlockType } from './constants'

/**
 * WordPress Post Data Structure
 * Represents a WordPress post fetched from the database or API
 */
export interface WPPost {
  id: number
  title: string
  slug: string
  content: string // WordPress block HTML
  excerpt?: string
  date?: string
  author?: number
  categories?: number[]
  tags?: number[]
  featured_image?: string
  status?: 'publish' | 'draft' | 'private'
  meta?: Record<string, unknown>
}

/**
 * WordPress Block Chunk
 * Represents a single WordPress block extracted from post content
 */
export interface WPChunk {
  /** WordPress block type (e.g., 'paragraph', 'image', 'gallery') */
  type: WPBlockType | string
  /** Raw HTML content inside the block */
  html: string
  /** Parsed JSON attributes from WP block comment */
  attributes?: Record<string, unknown>
  /** Original block comment for debugging */
  rawComment?: string
  /** Index in the original content */
  index: number
}

/**
 * Converted Node Result
 * Result of converting a WordPress chunk to either Lexical or CMS block format
 */
// export type ConvertedNode = SerializedBlockNode | CMSBlockNode
export type ConvertedNode = any

/**
 * CMS Block Node
 * Represents a PayloadCMS block structure
 */
export interface CMSBlockNode {
  blockType: CMSBlockType
  [key: string]: unknown
}

/**
 * Image Reference
 * Represents an image extracted from HTML with upload status
 */
export interface ImageReference {
  /** Original source URL */
  src: string
  /** Normalized URL (staging suffix removed) */
  normalizedSrc: string
  /** Alt text */
  alt: string
  /** Payload media document ID (after upload) */
  mediaId?: number
  /** Upload status */
  status: 'pending' | 'uploaded' | 'failed' | 'skipped'
  /** Error message if upload failed */
  error?: string
}

/**
 * Chunk Detection Result
 * Result of detecting what type a chunk is
 */
export interface ChunkDetection {
  /** Detected block type */
  type: WPBlockType | string
  /** Whether Lexical can handle this natively */
  isLexicalSupported: boolean
  /** Whether this maps to a CMS block */
  isCMSBlock: boolean
  /** Target CMS block slug if applicable */
  cmsBlockSlug?: CMSBlockType
  /** Confidence level (0-1) */
  confidence: number
}

/**
 * Conversion Context
 * Context passed to converters during conversion
 */
export interface ConversionContext {
  /** Payload instance */
  payload: Payload
  /** Map of image URLs to media IDs */
  imageMap: Map<string, number>
  /** Current chunk being converted */
  chunk: WPChunk
  /** All chunks for context */
  allChunks: WPChunk[]
  /** Post metadata */
  postMeta?: WPPost
}

/**
 * Conversion Result
 * Result of converting a chunk
 */
export interface ConversionResult {
  /** Converted node(s) */
  nodes: ConvertedNode[]
  /** Warnings during conversion */
  warnings: string[]
  /** Errors during conversion */
  errors: string[]
  /** Whether conversion was successful */
  success: boolean
}

/**
 * Migration Options
 * Options for the migration pipeline
 */
export interface MigrationOptions {
  /** Use mock data instead of fetching from WordPress */
  useMock?: boolean
  /** WordPress API endpoint (if not using mock) */
  wpApiUrl?: string
  /** WordPress API credentials */
  wpCredentials?: {
    username: string
    password: string
  }
  /** Batch size for processing posts */
  batchSize?: number
  /** Dry run (don't actually create posts) */
  dryRun?: boolean
  /** Category mapping (WP category ID → Payload category ID) */
  categoryMap?: Map<number, number>
  /** Author mapping (WP user ID → Payload user ID) */
  authorMap?: Map<number, number>
  /** Skip image uploads */
  skipImages?: boolean
  /** Continue on errors */
  continueOnError?: boolean
}

/**
 * Migration Statistics
 * Statistics about the migration process
 */
export interface MigrationStats {
  /** Total posts processed */
  totalPosts: number
  /** Successfully migrated posts */
  successfulPosts: number
  /** Failed posts */
  failedPosts: number
  /** Total chunks processed */
  totalChunks: number
  /** Total images uploaded */
  totalImages: number
  /** Total errors encountered */
  totalErrors: number
  /** Processing time in ms */
  processingTime: number
}

/**
 * WordPress Block Comment Structure
 * Parsed WordPress block comment
 */
export interface WPBlockComment {
  /** Block type */
  type: string
  /** JSON attributes */
  attributes: Record<string, unknown>
  /** Raw comment string */
  raw: string
}
