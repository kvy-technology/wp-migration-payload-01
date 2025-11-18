import type { ImageLoaderProps } from 'next/image'
import { getClientSideURL } from './get-url'

const CF_IMAGE_BASE_URL = 'https://img.kvytechnology.com'
const CL_R2_BUCKET_URL = 'https://media.kvytechnology.com'
const NODE_ENV = process.env.NODE_ENV

export default function cloudflareLoader({ src: srcProp, width, quality }: ImageLoaderProps) {
  if (!srcProp) return ''

  if (NODE_ENV === 'development' || !CL_R2_BUCKET_URL) {
    const baseUrl = getClientSideURL()
    return `${baseUrl}${srcProp}`
  }

  const params: string[] = [`width=${width}`]

  const filename = srcProp.split('/').pop()

  const src = `${CL_R2_BUCKET_URL}/${filename}`

  if (quality) {
    params.push(`quality=${quality}`)
  }

  params.push('format=webp')

  // Handle absolute URLs - Cloudflare's /cdn-cgi/image/ accepts unencoded absolute URLs
  // The source URL should be appended directly after the parameters
  const optimizedUrl = `${CF_IMAGE_BASE_URL}/cdn-cgi/image/${params.join(',')}/${src}`

  // console.log('Optimized URL', optimizedUrl)
  return optimizedUrl
}
