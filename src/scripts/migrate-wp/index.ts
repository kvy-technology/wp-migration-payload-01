/**
 * WordPress → PayloadCMS Migration Pipeline
 *
 * Main exports for the migration system
 */

// Main migration function
export { default, migrate } from '../migrate-wp'

// Core types
export type {
  CMSBlockNode,
  ConversionContext,
  ConversionResult,
  ConvertedNode,
  MigrationOptions,
  MigrationStats,
  WPChunk,
  WPPost,
} from './core/types'

// Core constants
export { CMS_BLOCKS, LEXICAL_NODES, MIGRATION_CONFIG, WP_BLOCKS } from './core/constants'

// Registry functions
export {
  detectBlockType,
  getCMSBlockMapping,
  getConversionStrategy,
  hasCMSBlockMapping,
  isLexicalSupported,
} from './core/registry'

// WordPress utilities
export { fetchWPPost, fetchWPPosts } from './wp/fetch'

export { detectBlockTypeFromHTML, hasWPBlocks, splitIntoChunks } from './wp/chunk-splitter'

export {
  batchDetectChunks,
  detectChunk,
  filterChunksByStrategy,
  getChunkStrategy,
} from './wp/chunk-detector'

// Converters
export { convertChunk, convertChunks, convertChunksWithStats } from './converters/html-engine'

export { convertToLexical } from './converters/lexical'

export {
  convertButton,
  convertColumns,
  convertGallery,
  convertUnsupportedBlock,
  convertVideo,
  convertYouTube,
} from './converters/unsupported-blocks'

// Media utilities
export {
  extractGalleryImages,
  extractImages,
  extractImagesFromChunks,
  extractYouTubeIds,
} from './media/extract'

export {
  checkExistingMedia,
  downloadImage,
  normalizeImageUrl,
  uploadImages,
  uploadImageToPayload,
} from './media/upload'

// Utilities
export {
  isCMSBlockNode,
  isLexicalNode,
  mergeNodes,
  mergeNodesPreservingOrder,
  validateMergedStructure,
} from './utils/merge-lexical'

export { logger, LogLevel } from './utils/logger'

export {
  testConvertChunk,
  testDetectChunk,
  testExtractImages,
  testFullMigration,
  testSplitChunks,
} from './utils/tester'
