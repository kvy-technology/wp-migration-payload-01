import config from '@payload-config'
import { getPayload } from 'payload'
import { htmlToLexicalContent } from './helper'
import { postContent } from './seed'

const payload = await getPayload({ config })

async function main() {
  const html = postContent

  const lexicalJSON = await htmlToLexicalContent({
    html,
    config: payload.config,
    payload,
  })

  // Log the structure for debugging
  console.log('\n📊 Lexical JSON structure:', {
    hasRoot: !!lexicalJSON.root,
    rootType: lexicalJSON.root?.type,
    childrenCount: lexicalJSON.root?.children?.length,
  })

  console.log(lexicalJSON)

  //Update the post with the converted content
  try {
    await payload.update({
      collection: 'posts',
      id: '2',
      data: {
        title: 'test post 2',
        content: lexicalJSON,
        slug: 'test-post-2',
        category: 1,
      },
    })
    console.log('\n✅ Successfully updated post with content!')
  } catch (error: any) {
    console.error('\n❌ Error updating post:', error)
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2))
    }
    throw error
  }
}

await main()
