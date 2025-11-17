import { BannerBlock } from '@/blocks/banner/component'
import { MediaBlock } from '@/blocks/media-block/component'
import { cn } from '@/lib/utils'
import type {
  BannerBlock as BannerBlockProps,
  MediaBlock as MediaBlockProps,
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

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<MediaBlockProps | BannerBlockProps>

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
