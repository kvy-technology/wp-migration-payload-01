import { detectBlockType, getConversionStrategy } from '../core/registry'
import type { ConversionContext, ConversionResult, ConvertedNode, WPChunk } from '../core/types'
import { convertToLexical } from './lexical'
import { convertUnsupportedBlock } from './unsupported-blocks'

/**
 * HTML Conversion Engine
 *
 * Main conversion orchestrator that routes chunks to appropriate converters
 * based on registry-based detection. This is the core of the conversion pipeline.
 */

/**
 * Convert a single chunk to Lexical or CMS block format
 *
 * @param chunk - WordPress chunk to convert
 * @param context - Conversion context (will be enhanced with chunk)
 * @returns Conversion result
 *
 * @example
 * ```ts
 * const result = await convertChunk(chunk, {
 *   payload,
 *   imageMap: new Map(),
 *   allChunks: [],
 * })
 * ```
 */
export async function convertChunk(
  chunk: WPChunk,
  context: Omit<ConversionContext, 'chunk'>,
): Promise<ConversionResult> {
  // Detect the actual block type (may differ from chunk.type)
  const detectedType = detectBlockType(chunk.html, chunk.type, chunk.attributes)

  // Create chunk with detected type for conversion
  const detectedChunk: WPChunk = {
    ...chunk,
    type: detectedType,
  }

  const fullContext: ConversionContext = {
    ...context,
    chunk: detectedChunk,
  }

  // Determine conversion strategy using detected type
  const strategy = getConversionStrategy(detectedType)

  try {
    switch (strategy) {
      case 'lexical':
        // Convert using Lexical converter
        return await convertToLexical(fullContext)

      case 'cms-block':
        // Convert using CMS block converter
        return await convertUnsupportedBlock(fullContext)

      case 'custom':
        // Fallback: try Lexical first, then warn
        console.warn(`⚠️  Unknown block type "${detectedType}", attempting Lexical conversion`)
        const lexicalResult = await convertToLexical(fullContext)

        if (!lexicalResult.success) {
          return {
            nodes: [],
            warnings: [`Block type "${detectedType}" not recognized, conversion may be incomplete`],
            errors: lexicalResult.errors,
            success: false,
          }
        }

        return lexicalResult

      default:
        return {
          nodes: [],
          warnings: [],
          errors: [`Unknown conversion strategy for block type: ${detectedType}`],
          success: false,
        }
    }
  } catch (error) {
    return {
      nodes: [],
      warnings: [],
      errors: [
        `Error converting chunk: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
      success: false,
    }
  }
}

/**
 * Convert multiple chunks in sequence
 *
 * @param chunks - Array of WordPress chunks
 * @param context - Conversion context
 * @returns Array of conversion results
 *
 * @example
 * ```ts
 * const results = await convertChunks(chunks, { payload, imageMap: new Map(), allChunks: chunks })
 * ```
 */
export async function convertChunks(
  chunks: WPChunk[],
  context: Omit<ConversionContext, 'chunk'>,
): Promise<ConversionResult[]> {
  const results: ConversionResult[] = []

  for (const chunk of chunks) {
    console.log(`🔄 Converting chunk ${chunk.index + 1}/${chunks.length}: ${chunk.type}`)
    const result = await convertChunk(chunk, context)
    results.push(result)

    // Log warnings and errors
    if (result.warnings.length > 0) {
      console.warn(`⚠️  Warnings for chunk ${chunk.index}:`, result.warnings)
    }
    if (result.errors.length > 0) {
      console.error(`❌ Errors for chunk ${chunk.index}:`, result.errors)
    }
  }

  return results
}

/**
 * Convert chunks with error handling and statistics
 *
 * @param chunks - Array of WordPress chunks
 * @param context - Conversion context
 * @param options - Conversion options
 * @returns Combined conversion result with statistics
 *
 * @example
 * ```ts
 * const result = await convertChunksWithStats(chunks, context, { continueOnError: true })
 * ```
 */
export async function convertChunksWithStats(
  chunks: WPChunk[],
  context: Omit<ConversionContext, 'chunk'>,
  options: { continueOnError?: boolean } = {},
): Promise<{
  nodes: ConvertedNode[]
  warnings: string[]
  errors: string[]
  stats: {
    total: number
    successful: number
    failed: number
    skipped: number
  }
}> {
  const allNodes: ConvertedNode[] = []
  const allWarnings: string[] = []
  const allErrors: string[] = []
  let successful = 0
  let failed = 0
  let skipped = 0

  for (const chunk of chunks) {
    try {
      const result = await convertChunk(chunk, context)

      if (result.success) {
        allNodes.push(...result.nodes)
        allWarnings.push(...result.warnings.map((w) => `[Chunk ${chunk.index}] ${w}`))
        successful++
      } else {
        allErrors.push(...result.errors.map((e) => `[Chunk ${chunk.index}] ${e}`))
        failed++

        if (!options.continueOnError) {
          throw new Error(`Conversion failed for chunk ${chunk.index}: ${result.errors.join(', ')}`)
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      allErrors.push(`[Chunk ${chunk.index}] ${errorMsg}`)
      failed++

      if (!options.continueOnError) {
        throw error
      }
    }
  }

  return {
    nodes: allNodes,
    warnings: allWarnings,
    errors: allErrors,
    stats: {
      total: chunks.length,
      successful,
      failed,
      skipped,
    },
  }
}
