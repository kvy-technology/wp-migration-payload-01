import { cn } from '@/lib/utils'
import type { YoutubeBlock as YoutubeBlockProps } from '@/payload-types'
import React from 'react'

type Props = YoutubeBlockProps & {
  className?: string
}

/**
 * Extracts YouTube video ID from various URL formats
 */
const extractVideoId = (url: string): string | null => {
  if (!url) return null

  // Handle youtu.be short URLs
  const shortUrlMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (shortUrlMatch) return shortUrlMatch[1]

  // Handle youtube.com/watch?v= format
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/)
  if (watchMatch) return watchMatch[1]

  // Handle youtube.com/embed/ format
  const embedMatch = url.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  if (embedMatch) return embedMatch[1]

  // If it's already just a video ID (11 characters, alphanumeric, dashes, underscores)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim()
  }

  return null
}

export const YoutubeBlock: React.FC<Props> = ({ className, youtubeUrl }) => {
  const videoId = extractVideoId(youtubeUrl || '')

  if (!videoId) {
    return (
      <div className={cn('my-8 p-4 border border-border rounded bg-card', className)}>
        <p className="text-muted-foreground">Invalid YouTube URL</p>
      </div>
    )
  }

  return (
    <div className={cn('my-8 w-full', className)}>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded border border-border"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  )
}
