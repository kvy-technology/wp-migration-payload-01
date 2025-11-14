import { getPayload } from 'payload'

import { CollectionArchive } from '@/components/collection-archive'
import config from '@/payload.config'
import '../styles.css'

export default async function PostsPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs: posts } = await payload.find({
    collection: 'posts',
    limit: 100,
    sort: '-createdAt',
    depth: 1,
  })

  return (
    <div className="bg-black pt-24 pb-24">
      <div className="container mb-16">
        <div className="max-w-none text-center">
          <h1>Blog Posts</h1>
        </div>
      </div>

      <div className="container mx-auto">
        <CollectionArchive posts={posts} />
      </div>
    </div>
  )
}
