import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'
import { ConvertOptions } from '../types'

// Convert standard HTML tables to Lexical-compatible HTML structure
// export function normalizeTablesForLexical(inputHtml: string): string {
//   const dom = new JSDOM(`<!doctype html><body>${inputHtml}</body>`)
//   const { document } = dom.window

//   const tables = Array.from(document.querySelectorAll('table'))
//   tables.forEach((table) => {
//     // Skip if this table is already normalized
//     if (table.classList.contains('lexical-table')) return

//     // Ensure table classes and styles
//     table.classList.add('lexical-table')
//     const existingTableStyle = table.getAttribute('style') || ''
//     if (!/border-collapse/i.test(existingTableStyle)) {
//       table.setAttribute(
//         'style',
//         `border-collapse: collapse;${existingTableStyle ? ` ${existingTableStyle}` : ''}`,
//       )
//     }

//     // Ensure <tbody> exists; if only tr under table, move into tbody
//     let tbody = table.querySelector('tbody')
//     if (!tbody) {
//       tbody = document.createElement('tbody')
//       // Move all direct tr children into tbody
//       Array.from(table.children).forEach((child) => {
//         if (child.tagName?.toLowerCase() === 'tr') {
//           tbody!.appendChild(child)
//         }
//       })
//       table.appendChild(tbody)
//     }

//     // Add row and cell classes/styles, wrap content in <p>
//     const rows = Array.from(table.querySelectorAll('tr'))
//     rows.forEach((row) => {
//       row.classList.add('lexical-table-row')
//       const cells = Array.from(row.children) as HTMLElement[]
//       cells.forEach((cell, colIdx) => {
//         const tag = cell.tagName.toLowerCase()
//         if (tag !== 'td' && tag !== 'th') return
//         cell.classList.add('lexical-table-cell', `lexical-table-cell-header-${colIdx}`)
//         const existingStyle = cell.getAttribute('style') || ''
//         const baseStyle = 'border: 1px solid #ccc; padding: 8px;'
//         if (!existingStyle.includes('border:') || !existingStyle.includes('padding:')) {
//           cell.setAttribute('style', `${baseStyle}${existingStyle ? ` ${existingStyle}` : ''}`)
//         }
//         // Ensure content is wrapped in <p>
//         const firstChild = cell.firstElementChild
//         if (!(firstChild && firstChild.tagName.toLowerCase() === 'p')) {
//           const p = document.createElement('p')
//           // Move existing children into <p>
//           while (cell.firstChild) {
//             p.appendChild(cell.firstChild)
//           }
//           cell.appendChild(p)
//         }
//       })
//     })

//     // Wrap table with container div.lexical-table-container
//     const container = document.createElement('div')
//     container.className = 'lexical-table-container'
//     const parent = table.parentNode
//     if (!parent) return
//     parent.insertBefore(container, table)
//     container.appendChild(table)

//     // Optionally add spacing <p><br/></p> before and after, inside a payload-richtext wrapper if not present
//     // If parent of container is not .payload-richtext, wrap with it
//     if (
//       !(container.parentElement && container.parentElement.classList.contains('payload-richtext'))
//     ) {
//       const wrapper = document.createElement('div')
//       wrapper.className = 'payload-richtext'
//       parent.insertBefore(wrapper, container)
//       wrapper.appendChild(container)
//       // Add spacing paragraphs
//       const spacerBefore = document.createElement('p')
//       spacerBefore.innerHTML = '<br />'
//       const spacerAfter1 = document.createElement('p')
//       spacerAfter1.innerHTML = '<br />'
//       const spacerAfter2 = document.createElement('p')
//       spacerAfter2.innerHTML = '<br />'
//       wrapper.insertBefore(spacerBefore, container)
//       wrapper.appendChild(spacerAfter1)
//       wrapper.appendChild(spacerAfter2)
//     } else {
//       // Parent is payload-richtext; ensure at least one <p><br/></p> before and after
//       const wrapper = container.parentElement!
//       const ensureSpacer = (refNode: Element, before = false) => {
//         const spacer = document.createElement('p')
//         spacer.innerHTML = '<br />'
//         if (before) {
//           wrapper.insertBefore(spacer, refNode)
//         } else {
//           wrapper.insertBefore(spacer, refNode.nextSibling)
//         }
//       }
//       ensureSpacer(container, true)
//       ensureSpacer(container, false)
//     }
//   })

//   return document.body.innerHTML
// }

// Hepler function to normalize image URLs from WordPress staging → production by removing ".wpcomstaging"
export function normalizeImageUrl(inputUrl: string): string {
  try {
    const u = new URL(inputUrl)
    u.host = u.host.replace('.wpcomstaging', '')
    return u.toString()
  } catch {
    return inputUrl
  }
}

// Helper function to download an image from a URL
export async function downloadImage(
  url: string,
): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
  try {
    const normalizedUrl = normalizeImageUrl(url)
    const response = await fetch(normalizedUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Extract filename from URL
    const urlPath = new URL(normalizedUrl).pathname
    const filename = urlPath.split('/').pop() || `image-${Date.now()}.jpg`

    return {
      buffer,
      filename,
      mimeType: contentType,
    }
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error)
    throw error
  }
}

// Helper function to upload an image to Payload's media collection
export async function uploadImageToPayload(
  payload: Awaited<ReturnType<typeof getPayload>>,
  imageData: { buffer: Buffer; filename: string; mimeType: string },
  alt: string = '',
): Promise<number> {
  try {
    // 0) Check if a media with the same filename already exists
    try {
      const existing = await payload.find({
        collection: 'media',
        where: {
          filename: {
            equals: imageData.filename,
          },
        },
        limit: 1,
      })
      const existingMedia = existing?.docs?.[0]
      if (existingMedia?.id != null) {
        const existingId =
          typeof existingMedia.id === 'number'
            ? existingMedia.id
            : Number((existingMedia.id as unknown as string) ?? NaN)
        if (!Number.isNaN(existingId)) {
          console.log(
            `ℹ️  Skipping upload, media already exists: ${imageData.filename} (ID: ${existingId})`,
          )
          return existingId
        }
      }
    } catch (e) {
      // If the lookup fails for any reason, continue with upload
      console.warn(`⚠️  Could not check existing media for ${imageData.filename}:`, e)
    }

    // Convert Buffer to Uint8Array for File constructor
    const uint8Array = new Uint8Array(imageData.buffer)
    const blob = new Blob([uint8Array], { type: imageData.mimeType })

    // Create a File object
    const file = new File([blob], imageData.filename, {
      type: imageData.mimeType,
    }) as any // Payload's File type might be slightly different

    // Upload to Payload's media collection
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: alt || imageData.filename,
      },
      file: {
        data: new Uint8Array(imageData.buffer) as any,
        name: imageData.filename,
        size: imageData.buffer.length,
        mimetype: imageData.mimeType,
      },
    })

    const mediaId = typeof media.id === 'number' ? media.id : Number(media.id)
    console.log(`✅ Uploaded image: ${imageData.filename} (ID: ${mediaId})`)
    return mediaId
  } catch (error) {
    console.error(`Error uploading image ${imageData.filename}:`, error)
    throw error
  }
}

// Helper function to extract image URLs and alt text from HTML
export function extractImagesFromHTML(html: string): Array<{ src: string; alt: string }> {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const images: Array<{ src: string; alt: string }> = []

  const imgElements = document.querySelectorAll('img')
  imgElements.forEach((img) => {
    const src = img.getAttribute('src')
    const alt = img.getAttribute('alt') || ''
    if (src) {
      images.push({ src: normalizeImageUrl(src), alt })
    }
  })

  return images
}

// Helper function to replace pending upload nodes with proper upload nodes
export async function replacePendingUploads(
  lexicalJSON: any,
  payload: Awaited<ReturnType<typeof getPayload>>,
  imageMap: Map<string, number>, // Maps image URLs to media document IDs
): Promise<any> {
  if (!lexicalJSON || typeof lexicalJSON !== 'object') {
    return lexicalJSON
  }

  // If it's an upload node with pending state, replace it with a proper upload node
  if (lexicalJSON.type === 'upload' && lexicalJSON.pending) {
    const imageUrl = normalizeImageUrl(lexicalJSON.pending.src)
    const mediaId = imageMap.get(imageUrl)

    if (mediaId) {
      // Replace with proper upload node
      return {
        type: 'upload',
        version: 3,
        format: '',
        id: lexicalJSON.id || `upload-${Date.now()}-${Math.random()}`,
        fields: null,
        relationTo: 'media',
        value: mediaId, // This is the media document ID
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

  // Recursively process children arrays
  if (Array.isArray(lexicalJSON.children)) {
    const cleanedChildren = await Promise.all(
      lexicalJSON.children.map((child: any) => replacePendingUploads(child, payload, imageMap)),
    )
    lexicalJSON.children = cleanedChildren.filter((child: any) => child !== null)
  }

  // Recursively process other object properties
  const cleaned: any = {}
  for (const key in lexicalJSON) {
    if (key === 'children') {
      cleaned[key] = lexicalJSON[key]
    } else if (Array.isArray(lexicalJSON[key])) {
      cleaned[key] = await Promise.all(
        lexicalJSON[key].map((item: any) =>
          typeof item === 'object' ? replacePendingUploads(item, payload, imageMap) : item,
        ),
      )
    } else if (typeof lexicalJSON[key] === 'object' && lexicalJSON[key] !== null) {
      cleaned[key] = await replacePendingUploads(lexicalJSON[key], payload, imageMap)
    } else {
      cleaned[key] = lexicalJSON[key]
    }
  }

  return cleaned
}

// Helper function to convert HTML to Lexical JSON
export async function htmlToLexicalContent(
  options: ConvertOptions & { payload: Awaited<ReturnType<typeof getPayload>> },
) {
  const { html, config, payload } = options

  // If the HTML contains a table, build a Lexical Table structure manually
  // because convertHTMLToLexical currently does not import tables.
  if (/<table[\s>]/i.test(html)) {
    const dom = new JSDOM(html)
    const document = dom.window.document
    const table = document.querySelector('table')
    if (table) {
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

      const tableNode = {
        type: 'table',
        version: 1,
        children: lexicalTableChildren,
      }

      const root: any = {
        type: 'root',
        version: 1,
        direction: null,
        children: [
          {
            type: 'paragraph',
            version: 1,
            format: '',
            indent: 0,
            direction: null,
            textFormat: 0,
            textStyle: '',
            children: [],
          },
          tableNode,
          {
            type: 'paragraph',
            version: 1,
            format: '',
            indent: 0,
            direction: null,
            textFormat: 0,
            textStyle: '',
            children: [],
          },
        ],
      }

      return { root } as any
    }
  }

  // Normalize tables to Lexical-compatible structure first
  // const normalizedHtml = normalizeTablesForLexical(html)

  // Step 1: Extract images from HTML
  console.log('📸 Extracting images from HTML...')
  const images = extractImagesFromHTML(html)
  console.log(`   Found ${images.length} image(s)`)

  // Step 2: Download and upload images to Payload
  const imageMap = new Map<string, number>() // Maps image URLs to media document IDs

  for (const image of images) {
    try {
      console.log(`   Downloading: ${image.src}`)
      const imageData = await downloadImage(image.src)
      const mediaId = await uploadImageToPayload(payload, imageData, image.alt)
      imageMap.set(image.src, mediaId)
    } catch (error) {
      console.error(`   ❌ Failed to process image ${image.src}:`, error)
    }
  }

  // Step 3: Get the editor config
  const editorConfig = await editorConfigFactory.default({ config })

  // Step 4: Convert the HTML string to Lexical JSON
  const lexicalJSON = await convertHTMLToLexical({
    html: html,
    editorConfig,
    JSDOM,
  })

  // Ensure the lexical JSON has the correct structure
  if (!lexicalJSON || typeof lexicalJSON !== 'object') {
    throw new Error('Invalid lexical JSON returned from converter')
  }

  // Ensure it has a root property (Payload expects this structure)
  if (!lexicalJSON.root) {
    throw new Error('Lexical JSON missing root property')
  }

  // Step 6: Replace pending upload nodes with proper upload nodes
  console.log('🔄 Replacing pending upload nodes with media references...')
  const cleanLexicalJSON = await replacePendingUploads(lexicalJSON, payload, imageMap)

  return cleanLexicalJSON
}
