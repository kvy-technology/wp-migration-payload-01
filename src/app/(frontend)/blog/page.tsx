import { getPayload } from 'payload'

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
    <div className="home">
      <div className="content">
        <h1>All Posts</h1>
        {posts.length === 0 ? (
          <p>No posts found. Create your first post in the admin panel!</p>
        ) : (
          <div className="posts-list">
            {posts.map((post) => {
              console.log('post', post)

              const category =
                typeof post.category === 'object' && post.category !== null ? post.category : null

              const url = category?.slug
                ? `/blog/${category.slug}/${post.slug}`
                : `/blog/${post.slug}`

              return (
                <div key={post.id} className="post-item">
                  <h2>
                    <a href={url}>{post.title}</a>
                  </h2>
                </div>
              )
            })}
          </div>
        )}
        <div className="links">
          <a href="/">← Back to home</a>
        </div>
      </div>
    </div>
  )
}
