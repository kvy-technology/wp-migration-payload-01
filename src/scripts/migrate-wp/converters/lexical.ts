import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import type { ConversionContext, ConversionResult } from '../core/types'
import { cleanHTML } from './html-utils'

/**
 * Lexical Converter Module
 *
 * Converts HTML content to Lexical JSON format using Payload's converter.
 * Uses pre-uploaded images from imageMap (images are uploaded in migratePost).
 * Handles tables separately as convertHTMLToLexical doesn't support them natively.
 */

/**
 * Convert a table element to Lexical table node
 *
 * @param table - HTML table element
 * @returns Lexical table node
 */
function convertTableToLexicalNode(table: HTMLTableElement): any {
  const rows = Array.from(table.querySelectorAll('tr'))
  const lexicalTableChildren = rows.map((tr) => {
    const cells = Array.from(tr.children) as HTMLElement[]
    const rowChildren = cells
      .filter((c) => {
        const tag = c.tagName.toLowerCase()
        return tag === 'td' || tag === 'th'
      })
      .map((cell) => {
        const isHeader = cell.tagName.toLowerCase() === 'th'
        const textContent = (cell.textContent || '').replace(/\s+/g, ' ').trim()
        const colSpan = Number(cell.getAttribute('colspan') || '1')
        const rowSpan = Number(cell.getAttribute('rowspan') || '1')
        return {
          type: 'tablecell',
          version: 1,
          headerState: isHeader ? 1 : 0,
          colSpan: Number.isFinite(colSpan) && colSpan > 1 ? colSpan : 1,
          rowSpan: Number.isFinite(rowSpan) && rowSpan > 1 ? rowSpan : 1,
          backgroundColor: null,
          width: null,
          height: null,
          children: [
            {
              type: 'paragraph',
              version: 1,
              format: '',
              indent: 0,
              direction: null,
              textFormat: 0,
              textStyle: '',
              children: textContent
                ? [
                    {
                      type: 'text',
                      version: 1,
                      mode: 'normal',
                      style: '',
                      detail: 0,
                      format: 0,
                      text: textContent,
                    },
                  ]
                : [],
            } as any,
          ],
        } as any
      })
    return {
      type: 'tablerow',
      version: 1,
      children: rowChildren,
    }
  })

  return {
    type: 'table',
    version: 1,
    children: lexicalTableChildren,
  }
}

/**
 * Extract tables from HTML and replace with placeholders
 *
 * @param html - HTML content
 * @returns HTML without tables and array of table nodes
 */
function extractTablesFromHTML(html: string): {
  htmlWithoutTables: string
  tableNodes: Array<{ placeholder: string; node: any; index: number }>
} {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const tables = Array.from(document.querySelectorAll('table'))

  if (tables.length === 0) {
    return { htmlWithoutTables: html, tableNodes: [] }
  }

  const tableNodes: Array<{ placeholder: string; node: any; index: number }> = []
  let placeholderCounter = 0

  // Replace each table with a placeholder paragraph
  tables.forEach((table, index) => {
    const placeholder = `__TABLE_PLACEHOLDER_${placeholderCounter}__`
    placeholderCounter++

    // Convert table to Lexical node
    const tableNode = convertTableToLexicalNode(table)

    // Find the parent figure element if it exists (WordPress wraps tables in figures)
    const figure = table.closest('figure')
    const elementToReplace = figure || table

    // Create a placeholder paragraph with the marker text
    const placeholderP = document.createElement('p')
    placeholderP.setAttribute('data-table-placeholder', placeholder)
    placeholderP.textContent = placeholder

    // Replace the table/figure with placeholder paragraph
    if (elementToReplace.parentNode) {
      elementToReplace.parentNode.replaceChild(placeholderP, elementToReplace)
    }

    tableNodes.push({ placeholder, node: tableNode, index })
  })

  // Sort table nodes by their original index to maintain order
  tableNodes.sort((a, b) => a.index - b.index)

  return {
    htmlWithoutTables: document.body.innerHTML,
    tableNodes,
  }
}

/**
 * Find placeholder in a node recursively
 *
 * @param node - Lexical node to search
 * @param placeholders - Array of placeholder strings
 * @returns Found placeholder or null
 */
function findPlaceholderInNode(node: any, placeholders: string[]): string | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  if (node.type === 'text' && typeof node.text === 'string') {
    for (const placeholder of placeholders) {
      if (node.text.includes(placeholder)) {
        return placeholder
      }
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const found = findPlaceholderInNode(child, placeholders)
      if (found) {
        return found
      }
    }
  }

  return null
}

/**
 * Merge table nodes back into Lexical structure
 *
 * @param lexicalJSON - Lexical JSON structure
 * @param tableNodes - Array of table nodes with placeholders
 * @returns Processed Lexical structure with tables merged
 */
function mergeTablesIntoLexical(
  lexicalJSON: any,
  tableNodes: Array<{ placeholder: string; node: any }>,
): any {
  if (!lexicalJSON || typeof lexicalJSON !== 'object') {
    return lexicalJSON
  }

  const placeholders = tableNodes.map((tn) => tn.placeholder)

  // Recursively process children arrays
  if (Array.isArray(lexicalJSON.children)) {
    const mergedChildren: any[] = []

    for (let i = 0; i < lexicalJSON.children.length; i++) {
      const child = lexicalJSON.children[i]

      // Check if this child (or its children) contains a placeholder
      const foundPlaceholder = findPlaceholderInNode(child, placeholders)

      if (foundPlaceholder) {
        // Find the corresponding table node
        const tableNode = tableNodes.find((tn) => tn.placeholder === foundPlaceholder)
        if (tableNode) {
          // Replace the entire child (usually a paragraph) with the table node
          mergedChildren.push(tableNode.node)
        } else {
          // Process recursively in case placeholder is nested
          const processed = mergeTablesIntoLexical(child, tableNodes)
          if (processed) {
            mergedChildren.push(processed)
          }
        }
      } else {
        // Process the child normally
        const processed = mergeTablesIntoLexical(child, tableNodes)
        if (processed) {
          mergedChildren.push(processed)
        }
      }
    }

    lexicalJSON.children = mergedChildren
  }

  // Recursively process other object properties
  const processed: any = {}
  for (const key in lexicalJSON) {
    if (key === 'children') {
      processed[key] = lexicalJSON[key]
    } else if (Array.isArray(lexicalJSON[key])) {
      processed[key] = lexicalJSON[key].map((item: any) =>
        typeof item === 'object' ? mergeTablesIntoLexical(item, tableNodes) : item,
      )
    } else if (typeof lexicalJSON[key] === 'object' && lexicalJSON[key] !== null) {
      processed[key] = mergeTablesIntoLexical(lexicalJSON[key], tableNodes)
    } else {
      processed[key] = lexicalJSON[key]
    }
  }

  return processed
}

/**
 * Convert HTML to Lexical JSON
 *
 * @param context - Conversion context with payload, image map, and chunk
 * @returns Conversion result with Lexical nodes
 *
 * @example
 * ```ts
 * const result = await convertToLexical({
 *   payload,
 *   imageMap: new Map(),
 *   chunk: { type: 'paragraph', html: '<p>Hello</p>', index: 0 },
 *   allChunks: []
 * })
 * ```
 */
export async function convertToLexical(context: ConversionContext): Promise<ConversionResult> {
  const { payload, chunk, imageMap } = context
  const warnings: string[] = []
  const errors: string[] = []

  try {
    // Step 1: Extract tables from HTML and replace with placeholders
    // Tables need special handling as convertHTMLToLexical doesn't support them
    const { htmlWithoutTables, tableNodes } = extractTablesFromHTML(chunk.html)

    // Step 2: Replace image URLs with media references in HTML
    // Images are already uploaded in migratePost and stored in imageMap
    let processedHTML = htmlWithoutTables

    // Replace img src with placeholder that will be handled by convertHTMLToLexical
    // The converter will create upload nodes for images
    const dom = new JSDOM(processedHTML)
    const document = dom.window.document

    const imgElements = document.querySelectorAll('img')
    imgElements.forEach((img) => {
      const src = img.getAttribute('src')
      if (src) {
        // Normalize URL to check in map (remove staging suffix)
        const normalizedSrc = src.replace('.wpcomstaging', '')
        const mediaId = imageMap.get(normalizedSrc)

        if (mediaId) {
          // Add data attribute for later replacement
          img.setAttribute('data-media-id', mediaId.toString())
        }
      }
    })

    processedHTML = document.body.innerHTML

    // Step 3: Clean HTML (remove WP-specific classes)
    processedHTML = cleanHTML(processedHTML)

    // Step 4: Get editor config
    const editorConfig = await editorConfigFactory.default({
      config: payload.config,
    })

    // Step 5: Convert HTML to Lexical JSON
    const lexicalJSON = await convertHTMLToLexical({
      html: processedHTML,
      editorConfig,
      JSDOM,
    })

    // Step 6: Ensure proper structure
    if (!lexicalJSON || typeof lexicalJSON !== 'object') {
      throw new Error('Invalid lexical JSON returned from converter')
    }

    if (!lexicalJSON.root) {
      throw new Error('Lexical JSON missing root property')
    }

    // Step 7: Merge tables back into Lexical structure
    const lexicalWithTables = mergeTablesIntoLexical(lexicalJSON.root, tableNodes)

    // Step 8: Replace pending upload nodes with proper media references
    const processedNodes = await replacePendingUploads(lexicalWithTables, imageMap)

    return {
      nodes: processedNodes.children || [],
      warnings,
      errors,
      success: true,
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error')
    return {
      nodes: [],
      warnings,
      errors,
      success: false,
    }
  }
}

/**
 * Replace pending upload nodes with proper media references
 *
 * @param root - Lexical root node
 * @param imageMap - Map of image URLs to media IDs
 * @returns Processed root node
 */
export async function replacePendingUploads(
  root: any,
  imageMap: Map<string, number>,
): Promise<any> {
  if (!root || typeof root !== 'object') {
    return root
  }

  // If it's an upload node with pending state, replace it
  if (root.type === 'upload' && root.pending) {
    const imageUrl = root.pending.src?.replace('.wpcomstaging', '')
    const mediaId = imageMap.get(imageUrl || '')

    if (mediaId) {
      return {
        type: 'upload',
        version: 3,
        format: '',
        id: root.id || `upload-${Date.now()}-${Math.random()}`,
        fields: null,
        relationTo: 'media',
        value: mediaId,
      }
    } else {
      // If image wasn't uploaded, remove the node
      console.warn(`⚠️  Image not uploaded: ${imageUrl}, removing from content`)
      return {
        type: 'paragraph',
        version: 1,
        children: [],
        direction: null,
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
      }
    }
  }

  // Recursively process children
  if (Array.isArray(root.children)) {
    const processedChildren = await Promise.all(
      root.children.map((child: any) => replacePendingUploads(child, imageMap)),
    )
    root.children = processedChildren.filter((child: any) => child !== null)
  }

  // Recursively process other object properties
  const processed: any = {}
  for (const key in root) {
    if (key === 'children') {
      processed[key] = root[key]
    } else if (Array.isArray(root[key])) {
      processed[key] = await Promise.all(
        root[key].map((item: any) =>
          typeof item === 'object' ? replacePendingUploads(item, imageMap) : item,
        ),
      )
    } else if (typeof root[key] === 'object' && root[key] !== null) {
      processed[key] = await replacePendingUploads(root[key], imageMap)
    } else {
      processed[key] = root[key]
    }
  }

  return processed
}
