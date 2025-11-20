import type { WPPost } from '../core/types'
import { getMockWPPosts } from './mock-data'

/**
 * WordPress API Fetch Module
 *
 * Handles fetching WordPress posts from either:
 * 1. Mock data (for testing)
 * 2. WordPress REST API
 * 3. MySQL database (future)
 */

export interface WPFetchOptions {
  /** Use mock data instead of real API */
  useMock?: boolean
  /** WordPress REST API base URL */
  apiUrl?: string
  /** WordPress API credentials */
  credentials?: {
    username: string
    password: string
  }
  /** Maximum number of posts to fetch */
  limit?: number
  /** Post status filter */
  status?: 'publish' | 'draft' | 'private' | 'any'
  /** Category IDs to filter by */
  categories?: number[]
  /** Offset for pagination */
  offset?: number
}

/**
 * Fetch WordPress posts
 *
 * @param options - Fetch options
 * @returns Array of WordPress posts
 *
 * @example
 * ```ts
 * // Use mock data
 * const posts = await fetchWPPosts({ useMock: true })
 *
 * // Fetch from API
 * const posts = await fetchWPPosts({
 *   apiUrl: 'https://example.com/wp-json/wp/v2',
 *   credentials: { username: 'user', password: 'app-password' },
 *   limit: 10
 * })
 * ```
 */
export async function fetchWPPosts(options: WPFetchOptions = {}): Promise<WPPost[]> {
  const { useMock = false, limit } = options

  // Use mock data if requested
  if (useMock) {
    console.log('📦 Using mock WordPress data')
    return getMockWPPosts(limit)
  }

  // Fetch from WordPress REST API
  if (options.apiUrl) {
    return fetchFromAPI(options)
  }

  // Default to mock if no API URL provided
  console.warn('⚠️  No API URL provided, falling back to mock data')
  return getMockWPPosts(limit)
}

/**
 * Fetch posts from WordPress REST API
 *
 * @param options - Fetch options
 * @returns Array of WordPress posts
 *
 * @example
 * ```ts
 * const posts = await fetchFromAPI({
 *   apiUrl: 'https://example.com/wp-json/wp/v2',
 *   credentials: { username: 'user', password: 'pass' },
 *   limit: 10
 * })
 * ```
 */
async function fetchFromAPI(options: WPFetchOptions): Promise<WPPost[]> {
  const { apiUrl, credentials, limit, status = 'publish', categories, offset = 0 } = options

  if (!apiUrl) {
    throw new Error('API URL is required when not using mock data')
  }

  try {
    // Build query parameters
    const params = new URLSearchParams({
      per_page: limit?.toString() || '100',
      offset: offset.toString(),
      status,
      _embed: 'true', // Include embedded data
    })

    if (categories && categories.length > 0) {
      params.append('categories', categories.join(','))
    }

    const url = `${apiUrl}/posts?${params.toString()}`

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add authentication if provided
    if (credentials) {
      const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')
      headers['Authorization'] = `Basic ${auth}`
    }

    console.log(`🔗 Fetching posts from: ${url}`)

    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`)
    }

    const wpPosts = (await response.json()) as any

    // Transform WordPress API response to WPPost format
    return wpPosts?.map(
      (post: any): WPPost => ({
        id: post.id,
        title: post.title?.rendered || post.title || '',
        slug: post.slug || '',
        content: post.content?.rendered || post.content || '',
        excerpt: post.excerpt?.rendered || post.excerpt || '',
        date: post.date || '',
        author: post.author || 0,
        categories: post.categories || [],
        tags: post.tags || [],
        featured_image: post.featured_media
          ? post._embedded?.['wp:featuredmedia']?.[0]?.source_url
          : undefined,
        status: post.status || 'publish',
        meta: post.meta || {},
      }),
    )
  } catch (error) {
    console.error('❌ Error fetching WordPress posts:', error)
    throw error
  }
}

/**
 * Fetch a single WordPress post by ID
 *
 * @param id - Post ID
 * @param options - Fetch options
 * @returns WordPress post or undefined if not found
 *
 * @example
 * ```ts
 * const post = await fetchWPPost(123, { useMock: true })
 * ```
 */
export async function fetchWPPost(
  id: number,
  options: WPFetchOptions = {},
): Promise<WPPost | undefined> {
  const { useMock = false } = options

  if (useMock) {
    const { getMockWPPost } = await import('./mock-data')
    return getMockWPPost(id)
  }

  if (options.apiUrl) {
    try {
      const url = `${options.apiUrl}/posts/${id}?_embed=true`
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (options.credentials) {
        const auth = Buffer.from(
          `${options.credentials.username}:${options.credentials.password}`,
        ).toString('base64')
        headers['Authorization'] = `Basic ${auth}`
      }

      const response = await fetch(url, { headers })

      if (!response.ok) {
        if (response.status === 404) {
          return undefined
        }
        throw new Error(`WordPress API error: ${response.status}`)
      }

      const post = (await response.json()) as any

      return {
        id: post.id,
        title: post.title?.rendered || post.title || '',
        slug: post.slug || '',
        content: post.content?.rendered || post.content || '',
        excerpt: post.excerpt?.rendered || post.excerpt || '',
        date: post.date || '',
        author: post.author || 0,
        categories: post.categories || [],
        tags: post.tags || [],
        featured_image: post.featured_media
          ? post._embedded?.['wp:featuredmedia']?.[0]?.source_url
          : undefined,
        status: post.status || 'publish',
        meta: post.meta || {},
      }
    } catch (error) {
      console.error(`❌ Error fetching WordPress post ${id}:`, error)
      throw error
    }
  }

  throw new Error('API URL is required when not using mock data')
}
