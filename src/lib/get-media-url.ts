const BUCKET_URL = 'https://media.kvytechnology.com'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (
  filename: string | null | undefined,
  cacheTag?: string | null,
): string => {
  if (!filename) return ''

  // Check if URL already has http/https protocol
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename
  }

  return `${BUCKET_URL}/${filename}`
}
