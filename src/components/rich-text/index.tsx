import { BannerBlock } from '@/blocks/banner/component'
import { ButtonBlock } from '@/blocks/button-block/component'
import { ColumnsBlock } from '@/blocks/columns-block/component'
import { GalleryBlock } from '@/blocks/gallery-block/component'
import { MediaBlock } from '@/blocks/media-block/component'
import { VideoBlock } from '@/blocks/video-block/component'
import { VideopressBlock } from '@/blocks/videopress-block/component'
import { YoutubeBlock } from '@/blocks/youtube-block/component'
import { cn } from '@/lib/utils'
import type {
  BannerBlock as BannerBlockProps,
  ButtonBlock as ButtonBlockProps,
  GalleryBlock as GalleryBlockProps,
  MediaBlock as MediaBlockProps,
  VideoBlock as VideoBlockProps,
  VideopressBlock as VideopressBlockProps,
  YoutubeBlock as YoutubeBlockProps,
} from '@/payload-types'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  RichText as ConvertRichText,
  JSXConvertersFunction,
  LinkJSXConverter,
} from '@payloadcms/richtext-lexical/react'
import './css/common.css'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      | MediaBlockProps
      | BannerBlockProps
      | ButtonBlockProps
      | GalleryBlockProps
      | VideoBlockProps
      | VideopressBlockProps
      | YoutubeBlockProps
    >

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug

  if (relationTo === 'posts') {
    // Check if category is available in the value object (may be populated with depth)
    const category = (value as any).category
    const categorySlug =
      typeof category === 'object' && category !== null && 'slug' in category ? category.slug : null

    return categorySlug ? `/blog/${categorySlug}/${slug}` : `/blog/${slug}`
  }

  return `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    buttonBlock: ({ node }) => <ButtonBlock className="col-start-1 col-span-3" {...node.fields} />,
    columnsBlock: ({ node }) => (
      <ColumnsBlock className="col-start-1 col-span-3" {...node.fields} />
    ),
    galleryBlock: ({ node }) => (
      <GalleryBlock className="col-start-1 col-span-3" {...node.fields} />
    ),
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    videoBlock: ({ node }) => <VideoBlock className="col-start-1 col-span-3" {...node.fields} />,
    videopressBlock: ({ node }) => (
      <VideopressBlock className="col-start-1 col-span-3" {...node.fields} />
    ),
    youtubeBlock: ({ node }) => (
      <YoutubeBlock className="col-start-1 col-span-3" {...node.fields} />
    ),
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props

  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn('container mx-auto common', className)}
      {...rest}
    />
  )
}
