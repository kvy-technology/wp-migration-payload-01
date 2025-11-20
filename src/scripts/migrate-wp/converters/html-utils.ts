import { JSDOM } from 'jsdom'

/**
 * HTML Utility Functions
 *
 * Helper functions for manipulating and cleaning HTML content
 * during the conversion process.
 */

/**
 * Clean HTML content by removing WordPress-specific classes and attributes
 *
 * @param html - HTML content to clean
 * @returns Cleaned HTML
 *
 * @example
 * ```ts
 * const cleaned = cleanHTML('<p class="wp-block-paragraph">Hello</p>')
 * // Returns '<p>Hello</p>'
 * ```
 */
export function cleanHTML(html: string): string {
  const dom = new JSDOM(html)
  const document = dom.window.document

  // Remove WordPress-specific classes
  const elements = document.querySelectorAll('[class*="wp-"]')
  elements.forEach((el) => {
    const classes = el.className.split(' ').filter((cls) => !cls.startsWith('wp-'))
    if (classes.length > 0) {
      el.className = classes.join(' ')
    } else {
      el.removeAttribute('class')
    }
  })

  // Remove WordPress-specific data attributes
  const dataElements = document.querySelectorAll('[data-wp-], [data-id]')
  dataElements.forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-wp-') || attr.name === 'data-id') {
        el.removeAttribute(attr.name)
      }
    })
  })

  return document.body.innerHTML
}

/**
 * Extract text content from HTML
 *
 * @param html - HTML content
 * @returns Plain text content
 *
 * @example
 * ```ts
 * const text = extractText('<p>Hello <strong>world</strong></p>')
 * // Returns 'Hello world'
 * ```
 */
export function extractText(html: string): string {
  const dom = new JSDOM(html)
  const document = dom.window.document
  return document.body.textContent || ''
}

/**
 * Wrap content in a container element
 *
 * @param html - HTML content to wrap
 * @param tag - Tag name for wrapper
 * @param className - Optional class name
 * @returns Wrapped HTML
 *
 * @example
 * ```ts
 * const wrapped = wrapContent('<p>Hello</p>', 'div', 'container')
 * // Returns '<div class="container"><p>Hello</p></div>'
 * ```
 */
export function wrapContent(html: string, tag: string, className?: string): string {
  const dom = new JSDOM(html)
  const document = dom.window.document

  const wrapper = document.createElement(tag)
  if (className) {
    wrapper.className = className
  }

  // Move all body children to wrapper
  while (document.body.firstChild) {
    wrapper.appendChild(document.body.firstChild)
  }

  document.body.appendChild(wrapper)
  return document.body.innerHTML
}

/**
 * Remove empty elements from HTML
 *
 * @param html - HTML content
 * @returns HTML with empty elements removed
 *
 * @example
 * ```ts
 * const cleaned = removeEmptyElements('<p></p><p>Content</p>')
 * // Returns '<p>Content</p>'
 * ```
 */
export function removeEmptyElements(html: string): string {
  const dom = new JSDOM(html)
  const document = dom.window.document

  const emptyElements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6')
  emptyElements.forEach((el) => {
    const text = el.textContent?.trim() || ''
    if (!text && el.children.length === 0) {
      el.remove()
    }
  })

  return document.body.innerHTML
}

/**
 * Sanitize HTML by removing potentially dangerous content
 *
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML
 *
 * @example
 * ```ts
 * const safe = sanitizeHTML('<script>alert("xss")</script><p>Safe</p>')
 * // Returns '<p>Safe</p>'
 * ```
 */
export function sanitizeHTML(html: string): string {
  const dom = new JSDOM(html)
  const document = dom.window.document

  // Remove script tags
  const scripts = document.querySelectorAll('script')
  scripts.forEach((script) => script.remove())

  // Remove style tags (optional, comment out if you want to keep styles)
  // const styles = document.querySelectorAll('style')
  // styles.forEach((style) => style.remove())

  // Remove event handlers from attributes
  const allElements = document.querySelectorAll('*')
  allElements.forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name)
      }
    })
  })

  return document.body.innerHTML
}

/**
 * Extract attributes from an HTML element
 *
 * @param html - HTML content (should contain single root element)
 * @returns Map of attribute names to values
 *
 * @example
 * ```ts
 * const attrs = extractAttributes('<img src="test.jpg" alt="Test" />')
 * // Returns Map { 'src' => 'test.jpg', 'alt' => 'Test' }
 * ```
 */
export function extractAttributes(html: string): Map<string, string> {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const attrs = new Map<string, string>()

  const firstElement = document.body.firstElementChild
  if (firstElement) {
    Array.from(firstElement.attributes).forEach((attr) => {
      attrs.set(attr.name, attr.value)
    })
  }

  return attrs
}
