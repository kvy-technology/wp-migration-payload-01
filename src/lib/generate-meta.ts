import type { Metadata } from 'next'

import type { Config, Media, Post } from '../payload-types'

import { getServerSideURL } from './get-url'
import { mergeOpenGraph } from './merge-open-graph'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    url = serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: { doc: Partial<Post> | null }): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title ? doc?.meta?.title + ' | KVY Blog Template' : 'KVY Blog Template'

  const postPath = doc?.categorySlug
    ? `/blog/${doc?.categorySlug}/${doc?.slug}`
    : `/blog/${doc?.slug}`

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: postPath,
    }),
    title,
  }
}
