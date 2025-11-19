'use client'

import { cn } from '@/lib/utils'
import React, { useEffect, useRef } from 'react'

import type { Props as MediaProps } from '../types'

import { getServerSideURL } from '@/lib/get-url'

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const {
    onClick,
    resource,
    videoClassName,
    controls = false,
    autoPlay = true,
    loop = true,
    muted = true,
    preload = 'auto',
  } = props

  const videoRef = useRef<HTMLVideoElement>(null)
  // const [showFallback] = useState<boolean>()

  useEffect(() => {
    const { current: video } = videoRef
    if (video) {
      video.addEventListener('suspend', () => {
        // setShowFallback(true);
        // console.warn('Video was suspended, rendering fallback image.')
      })
    }
  }, [])

  if (resource && typeof resource === 'object') {
    const { filename, alt, url } = resource

    return (
      <video
        autoPlay={autoPlay}
        className={cn(videoClassName)}
        controls={controls}
        loop={loop}
        muted={muted}
        onClick={onClick}
        playsInline
        preload={preload}
        ref={videoRef}
      >
        <source src={getServerSideURL() + `/${url}`} />
        {alt && <track kind="captions" label={alt} />}
        Your browser does not support the video tag.
      </video>
    )
  }

  return null
}
