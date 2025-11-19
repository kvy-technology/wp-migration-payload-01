import { cn } from '@/lib/utils'
import type { VideoBlock as VideoBlockProps } from '@/payload-types'
import React from 'react'

import { Media } from '@/components/media'

type Props = VideoBlockProps & {
  className?: string
  videoClassName?: string
}

export const VideoBlock: React.FC<Props> = ({ className, video, videoClassName }) => {
  if (!video || typeof video !== 'object') {
    return null
  }

  const { mimeType } = video

  // Check if the uploaded file is actually a video
  if (mimeType && !mimeType.includes('video')) {
    return (
      <div className={cn('my-8 p-4 border border-border rounded bg-card', className)}>
        <p className="text-muted-foreground">
          Invalid video file. Please upload a video file (MP4, WebM, etc.).
        </p>
      </div>
    )
  }

  return (
    <div className={cn('my-8 w-full', className)}>
      <Media
        resource={video}
        videoClassName={cn('w-full rounded border border-border', videoClassName)}
        controls={true}
        autoPlay={false}
        loop={false}
        muted={false}
        preload="metadata"
      />
    </div>
  )
}
