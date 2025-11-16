import React from 'react'

import type { Post } from '@/payload-types'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDateTime } from '@/lib/format-date-time'
import { Media } from '../media'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { heroImage, title, createdAt, populatedAuthors } = post

  return (
    <div className="container mx-auto px-4 lg:px-[100px]">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
        <h1 className="max-w-3xl text-pretty text-5xl font-semibold md:text-6xl">{title}</h1>

        <div className="flex items-center gap-3 text-sm md:text-base">
          <Avatar className="h-8 w-8 border">
            <Media resource={heroImage} />
            <AvatarFallback>{}</AvatarFallback>
          </Avatar>
          <span>
            <a href="#" className="font-semibold">
              {populatedAuthors[0]?.name}
            </a>
            <span className="ml-1">on {formatDateTime(createdAt)}</span>
          </span>
        </div>
        <Media resource={heroImage} />
      </div>
    </div>
  )
}
