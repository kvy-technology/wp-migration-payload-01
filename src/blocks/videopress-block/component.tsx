import { cn } from '@/lib/utils'
import type { VideopressBlock as VideopressBlockProps } from '@/payload-types'
import React from 'react'

type Props = VideopressBlockProps & {
  className?: string
}

/**
 * Extracts VideoPress video ID from URL
 */
const extractVideoId = (url: string): string | null => {
  if (!url) return null

  // Handle videopress.com/v/VIDEO_ID format
  const match = url.match(/(?:videopress\.com\/v\/)([a-zA-Z0-9_-]+)/)
  if (match) return match[1]

  // If it's already just a video ID
  if (/^[a-zA-Z0-9_-]+$/.test(url.trim())) {
    return url.trim()
  }

  return null
}

export const VideopressBlock: React.FC<Props> = ({ className, videopressUrl }) => {
  const videoId = extractVideoId(videopressUrl || '')

  if (!videoId) {
    return (
      <div className={cn('my-8 p-4 border border-border rounded bg-card', className)}>
        <p className="text-muted-foreground">Invalid VideoPress URL</p>
      </div>
    )
  }

  return (
    <div className={cn('my-8 w-full', className)}>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded border border-border"
          src={`https://videopress.com/embed/${videoId}?preloadContent=metadata`}
          title="VideoPress video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  )
}
