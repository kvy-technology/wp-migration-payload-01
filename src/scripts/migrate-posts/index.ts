import config from '@payload-config'
import { getPayload } from 'payload'
import { htmlToLexicalContent } from './helper'
import { postContent, wpPost } from './seed'

const payload = await getPayload({ config })

export function parseWPBlocks(html: string) {
  const blocks: Array<{ type: string; data: string }> = []

  // Match any WP block wrapper
  const blockRegex = /<!-- wp:([a-z-]+)([\s\S]*?)-->([\s\S]*?)<!-- \/wp:\1 -->/g

  let match
  while ((match = blockRegex.exec(html)) !== null) {
    const [, rawType, _attrs, content] = match

    // Normalize type names (optional)
    const type = rawType === 'list' && content.trim().startsWith('<ol') ? 'ordered-list' : rawType

    blocks.push({
      type,
      data: content.trim(), // return exact HTML inside the block
    })
  }

  return blocks
}

async function main() {
  // const html = postContent
  const htmlTable = `
  <!-- wp:table {"hasFixedLayout":false} -->
    <figure class="wp-block-table"><table><tbody><tr><th>AI in Software Development</th></tr><tr><td>Augmenting human capabilities</td></tr><tr><td>Improving efficiency and innovation</td></tr><tr><td>Enhancing Quality Assurance</td></tr></tbody></table></figure>
  <!-- /wp:table -->
  `

  const htmlPImg = `
  <!-- wp:image {"id":15615,"sizeSlug":"large","linkDestination":"none"} -->
    <figure class="wp-block-image size-large"><img src="https://kvytechnology.wpcomstaging.com/wp-content/uploads/2024/03/programming-background-with-person-working-with-codes-computer-1024x683.jpg" alt="The Evolution of Software Development: From Assembly Language to AI Kvytech" class="wp-image-15615"/></figure>
  <!-- /wp:image -->

  <!-- wp:paragraph -->
    <p>Let's briefly recap a&nbsp;fascinating journey from the rudimentary Assembly Language to the current AI-driven techniques in software development. Each stage of this evolution has contributed significantly to the trajectory of technology progression.&nbsp;</p>
  <!-- /wp:paragraph -->

  <!-- wp:paragraph -->
    <p><strong><em><s>This is a content</s></em></strong></p>
  <!-- /wp:paragraph -->
  `

  const html = `
  <!-- wp:image {"id":15615,"sizeSlug":"large","linkDestination":"none"} -->
    <figure class="wp-block-image size-large"><img src="https://kvytechnology.wpcomstaging.com/wp-content/uploads/2024/03/programming-background-with-person-working-with-codes-computer-1024x683.jpg" alt="The Evolution of Software Development: From Assembly Language to AI Kvytech" class="wp-image-15615"/></figure>
  <!-- /wp:image -->

  <!-- wp:paragraph -->
    <p>Let's briefly recap a&nbsp;fascinating journey from the rudimentary Assembly Language to the current AI-driven techniques in software development. Each stage of this evolution has contributed significantly to the trajectory of technology progression.&nbsp;</p>
  <!-- /wp:paragraph -->

  <!-- wp:table {"hasFixedLayout":false} -->
    <figure class="wp-block-table"><table><tbody><tr><th>AI in Software Development</th></tr><tr><td>Augmenting human capabilities</td></tr><tr><td>Improving efficiency and innovation</td></tr><tr><td>Enhancing Quality Assurance</td></tr></tbody></table></figure>
  <!-- /wp:table -->
  `

  console.log('Parse wp to blocks', parseWPBlocks(postContent))

  const lexicalJSON = await htmlToLexicalContent({
    html: wpPost,
    config: payload.config,
    payload,
  })

  // Log the structure for debugging
  console.log('\n📊 Lexical JSON structure:', {
    hasRoot: !!lexicalJSON.root,
    rootType: lexicalJSON.root?.type,
    childrenCount: lexicalJSON.root?.children?.length,
  })

  console.log(lexicalJSON?.root?.children)

  //Update the post with the converted content
  try {
    await payload.update({
      collection: 'posts',
      id: '3',
      data: {
        title: 'test post 3',
        content: lexicalJSON,
        slug: 'test-post-3',
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
