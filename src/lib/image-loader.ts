import type { ImageLoaderProps } from 'next/image'

const CF_IMAGE_BASE_URL = 'https://img.kvytechnology.com'

const normalizeSrc = (src: string) => {
  return src.startsWith('/') ? src.slice(1) : src
}

export default function cloudflareLoader({ src, width, quality }: ImageLoaderProps) {
  const params: string[] = [`width=${width}`]

  // console.log('Original URL', src)

  if (quality) {
    params.push(`quality=${quality}`)
  }

  params.push('format=auto')

  if (!src.startsWith('http')) {
    // Relative path - use directly
    const cleanSrc = normalizeSrc(src)

    console.log(
      'Optimized URL',
      `${CF_IMAGE_BASE_URL}/cdn-cgi/image/${params.join(',')}/${cleanSrc}`,
    )

    return `${CF_IMAGE_BASE_URL}/cdn-cgi/image/${params.join(',')}/${cleanSrc}`
  }

  // Handle absolute URLs - Cloudflare's /cdn-cgi/image/ accepts unencoded absolute URLs
  // The source URL should be appended directly after the parameters
  const optimizedUrl = `${CF_IMAGE_BASE_URL}/cdn-cgi/image/${params.join(',')}/${src}`

  // console.log('Optimized URL', optimizedUrl)
  return optimizedUrl
}
