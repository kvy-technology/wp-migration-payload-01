import { convertChunk } from '../converters/html-engine'
import type { ConversionContext, WPChunk, WPPost } from '../core/types'
import { detectChunk } from '../wp/chunk-detector'
import { splitIntoChunks } from '../wp/chunk-splitter'

/**
 * Test Utilities
 *
 * Helper functions for testing the migration pipeline at different stages.
 */

/**
 * Test chunk splitting
 *
 * @param html - WordPress HTML content
 * @returns Array of chunks
 *
 * @example
 * ```ts
 * const chunks = testSplitChunks(postContent)
 * console.log(`Found ${chunks.length} chunks`)
 * ```
 */
export function testSplitChunks(html: string): WPChunk[] {
  console.log('🧪 Testing chunk splitting...')
  const chunks = splitIntoChunks(html)
  console.log(`✅ Split into ${chunks.length} chunks:`)
  chunks.forEach((chunk, index) => {
    console.log(`  ${index + 1}. ${chunk.type} (${chunk.html.length} chars)`)
  })
  return chunks
}

/**
 * Test chunk detection
 *
 * @param chunk - WordPress chunk to detect
 * @returns Detection result
 *
 * @example
 * ```ts
 * const detection = testDetectChunk(chunk)
 * console.log(`Type: ${detection.type}, Strategy: ${detection.isLexicalSupported ? 'Lexical' : 'CMS Block'}`)
 * ```
 */
export function testDetectChunk(chunk: WPChunk) {
  console.log(`🧪 Testing chunk detection for: ${chunk.type}`)
  const detection = detectChunk(chunk)
  console.log(`✅ Detection result:`)
  console.log(`  Type: ${detection.type}`)
  console.log(`  Lexical Supported: ${detection.isLexicalSupported}`)
  console.log(`  CMS Block: ${detection.isCMSBlock}`)
  console.log(`  CMS Block Slug: ${detection.cmsBlockSlug || 'N/A'}`)
  console.log(`  Confidence: ${detection.confidence}`)
  return detection
}

/**
 * Test chunk conversion (requires Payload instance)
 *
 * @param chunk - WordPress chunk to convert
 * @param context - Conversion context
 * @returns Conversion result
 *
 * @example
 * ```ts
 * const result = await testConvertChunk(chunk, { payload, imageMap: new Map(), allChunks: [] })
 * console.log(`Success: ${result.success}, Nodes: ${result.nodes.length}`)
 * ```
 */
export async function testConvertChunk(chunk: WPChunk, context: Omit<ConversionContext, 'chunk'>) {
  console.log(`🧪 Testing chunk conversion for: ${chunk.type}`)
  const result = await convertChunk(chunk, context)
  console.log(`✅ Conversion result:`)
  console.log(`  Success: ${result.success}`)
  console.log(`  Nodes: ${result.nodes.length}`)
  console.log(`  Warnings: ${result.warnings.length}`)
  console.log(`  Errors: ${result.errors.length}`)
  if (result.errors.length > 0) {
    console.error(`  Error details:`, result.errors)
  }
  return result
}

/**
 * Test full migration for a single post
 *
 * @param post - WordPress post to migrate
 * @param context - Conversion context
 * @returns Migration result
 *
 * @example
 * ```ts
 * const result = await testFullMigration(post, { payload, imageMap: new Map(), allChunks: [] })
 * ```
 */
export async function testFullMigration(
  post: WPPost,
  context: Omit<ConversionContext, 'chunk' | 'allChunks'>,
) {
  console.log(`🧪 Testing full migration for post: ${post.title}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Step 1: Split into chunks
  console.log('\n1️⃣  Splitting into chunks...')
  const chunks = testSplitChunks(post.content)

  // Step 2: Detect each chunk
  console.log('\n2️⃣  Detecting chunk types...')
  chunks.forEach((chunk, index) => {
    console.log(`\nChunk ${index + 1}:`)
    testDetectChunk(chunk)
  })

  // Step 3: Convert chunks
  console.log('\n3️⃣  Converting chunks...')
  const fullContext: Omit<ConversionContext, 'chunk'> = {
    ...context,
    allChunks: chunks,
    postMeta: post,
  }

  const conversionResults = []
  for (const chunk of chunks) {
    const result = await testConvertChunk(chunk, fullContext)
    conversionResults.push(result)
  }

  // Summary
  console.log('\n📊 Conversion Summary:')
  const successful = conversionResults.filter((r) => r.success).length
  const failed = conversionResults.filter((r) => !r.success).length
  const totalNodes = conversionResults.reduce((sum, r) => sum + r.nodes.length, 0)
  const totalWarnings = conversionResults.reduce((sum, r) => sum + r.warnings.length, 0)
  const totalErrors = conversionResults.reduce((sum, r) => sum + r.errors.length, 0)

  console.log(`  Successful conversions: ${successful}/${chunks.length}`)
  console.log(`  Failed conversions: ${failed}/${chunks.length}`)
  console.log(`  Total nodes generated: ${totalNodes}`)
  console.log(`  Total warnings: ${totalWarnings}`)
  console.log(`  Total errors: ${totalErrors}`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return {
    chunks,
    conversionResults,
    summary: {
      successful,
      failed,
      totalNodes,
      totalWarnings,
      totalErrors,
    },
  }
}

/**
 * Test image extraction
 *
 * @param html - HTML content
 * @returns Extracted images
 *
 * @example
 * ```ts
 * const images = testExtractImages(html)
 * console.log(`Found ${images.length} images`)
 * ```
 */
export function testExtractImages(html: string) {
  console.log('🧪 Testing image extraction...')
  const { extractImages } = require('../media/extract')
  const images = extractImages(html)
  console.log(`✅ Found ${images.length} images:`)
  images.forEach((img: any, index: any) => {
    console.log(`  ${index + 1}. ${img.normalizedSrc} (alt: "${img.alt}")`)
  })
  return images
}
