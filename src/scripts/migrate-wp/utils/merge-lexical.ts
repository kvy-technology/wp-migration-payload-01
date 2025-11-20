import { LEXICAL_NODES } from '../core/constants'
import type { ConvertedNode } from '../core/types'

// Lexical node type - represents any Lexical editor node
type LexicalNode = any

/**
 * Lexical Merge Utilities
 *
 * Functions for merging converted nodes into a single Lexical document structure.
 */

/**
 * Check if a node is a Lexical node (not a CMS block)
 *
 * @param node - Node to check
 * @returns True if node is a Lexical node
 *
 * @example
 * ```ts
 * isLexicalNode({ type: 'paragraph', children: [] }) // true
 * isLexicalNode({ blockType: 'youtubeBlock' }) // false
 * ```
 */
export function isLexicalNode(node: ConvertedNode): node is LexicalNode {
  return 'type' in node && !('blockType' in node)
}

/**
 * Check if a node is a CMS block node
 *
 * @param node - Node to check
 * @returns True if node is a CMS block
 *
 * @example
 * ```ts
 * isCMSBlockNode({ blockType: 'youtubeBlock' }) // true
 * ```
 */
export function isCMSBlockNode(node: ConvertedNode): boolean {
  return 'blockType' in node
}

/**
 * Create a Lexical root node with children
 *
 * @param children - Array of child nodes
 * @returns Lexical root node
 *
 * @example
 * ```ts
 * const root = createLexicalRoot([paragraphNode, headingNode])
 * ```
 */
export function createLexicalRoot(children: ConvertedNode[]): { root: LexicalNode } {
  return {
    root: {
      type: LEXICAL_NODES.ROOT,
      children: children.filter(isLexicalNode),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

/**
 * Generate a unique block ID
 */
function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Merge converted nodes into Lexical document structure
 *
 * CMS blocks are inserted as block nodes within the Lexical structure.
 * PayloadCMS BlocksFeature requires:
 * 1. A `blockReferences` array at the root level containing full block data
 * 2. Block nodes in the Lexical tree that reference blocks by `id`
 *
 * @param nodes - Array of converted nodes (Lexical and CMS blocks)
 * @returns Merged Lexical document structure with blockReferences
 *
 * @example
 * ```ts
 * const merged = mergeNodes([
 *   { type: 'paragraph', children: [...] },
 *   { blockType: 'youtubeBlock', youtubeUrl: '...' },
 *   { type: 'heading', children: [...] }
 * ])
 * ```
 */
export function mergeNodes(nodes: ConvertedNode[]): { root: LexicalNode; blockReferences?: any[] } {
  const lexicalChildren: LexicalNode[] = []
  const blockReferences: any[] = []

  for (const node of nodes) {
    if (isLexicalNode(node)) {
      // Direct Lexical node - add as-is
      lexicalChildren.push(node)
    } else if (isCMSBlockNode(node)) {
      // Generate unique ID for the block
      const blockId = generateBlockId()

      // Prepare block data with required fields
      const blockData = {
        id: blockId,
        blockName: '',
        ...(node as Record<string, unknown>),
      }

      // Add to blockReferences array (for PayloadCMS internal tracking)
      blockReferences.push(blockData)

      // Create block node with full fields structure
      // PayloadCMS expects the full block data in fields, not just a reference
      lexicalChildren.push({
        type: 'block',
        version: 2,
        format: '',
        fields: blockData,
        indent: 0,
        direction: null,
      } as any)
    }
  }

  const result: { root: LexicalNode; blockReferences?: any[] } = createLexicalRoot(lexicalChildren)

  // Add blockReferences array if there are any blocks
  // This is used by PayloadCMS for block management
  if (blockReferences.length > 0) {
    result.blockReferences = blockReferences
  }

  return result
}

/**
 * Merge nodes preserving order and handling empty nodes
 *
 * @param nodes - Array of converted nodes
 * @returns Merged Lexical document with blockReferences if needed
 *
 * @example
 * ```ts
 * const merged = mergeNodesPreservingOrder(nodes)
 * ```
 */
export function mergeNodesPreservingOrder(nodes: ConvertedNode[]): {
  root: LexicalNode
  blockReferences?: any[]
} {
  // Filter out null/undefined nodes
  const validNodes = nodes.filter((node) => node !== null && node !== undefined)

  // If no valid nodes, return empty root
  if (validNodes.length === 0) {
    return {
      root: {
        type: LEXICAL_NODES.ROOT,
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    }
  }

  return mergeNodes(validNodes)
}

/**
 * Validate merged Lexical structure
 *
 * @param merged - Merged Lexical document
 * @returns True if structure is valid
 *
 * @example
 * ```ts
 * if (validateMergedStructure(merged)) {
 *   // Use merged structure
 * }
 * ```
 */
export function validateMergedStructure(merged: { root: LexicalNode }): boolean {
  if (!merged || !merged.root) {
    return false
  }

  if (merged.root.type !== LEXICAL_NODES.ROOT) {
    return false
  }

  if (!Array.isArray(merged.root.children)) {
    return false
  }

  return true
}
