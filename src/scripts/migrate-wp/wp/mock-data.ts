import type { WPPost } from '../core/types'

const content = `
    <!-- wp:paragraph -->
    <p>
      <strong
        ><em><s>This is a content</s></em></strong
      >
    </p>
    <!-- /wp:paragraph -->
    <!-- wp:heading {"level":1} -->
    <h1 class="wp-block-heading">Heading h1</h1>
    <!-- /wp:heading -->
    <!-- wp:heading -->
    <h2 class="wp-block-heading">Heading h2</h2>
    <!-- /wp:heading -->
    <!-- wp:heading {"level":3} -->
    <h3 class="wp-block-heading">Heading h3</h3>
    <!-- /wp:heading -->
    <!-- wp:heading {"level":4} -->
    <h4 class="wp-block-heading">Heading h4</h4>
    <!-- /wp:heading -->
    <!-- wp:heading {"level":5} -->
    <h5 class="wp-block-heading">Heading h5</h5>
    <!-- /wp:heading -->
    <!-- wp:heading {"level":6} -->
    <h6 class="wp-block-heading">Heading h6</h6>
    <!-- /wp:heading -->
    <!-- wp:gallery {"linkTo":"none"} -->
    <figure class="wp-block-gallery has-nested-images columns-default is-cropped">
      <!-- wp:image {"id":22353,"sizeSlug":"large","linkDestination":"none"} -->
      <figure class="wp-block-image size-large">
        <img
          src="https://kvytechnology.com/wp-content/uploads/2025/11/adaptive-icon.png"
          alt="adaptive icon"
          class="wp-image-22353"
        />
        <figcaption class="wp-element-caption">adaptive icon</figcaption>
      </figure>
      <!-- /wp:image -->
      <!-- wp:image {"id":22354,"sizeSlug":"large","linkDestination":"none"} -->
      <figure class="wp-block-image size-large">
        <img
          src="https://kvytechnology.com/wp-content/uploads/2025/11/background-image.png"
          alt="background image"
          class="wp-image-22354"
        />
        <figcaption class="wp-element-caption">background image</figcaption>
      </figure>
      <!-- /wp:image -->
      <!-- wp:image {"id":22363,"sizeSlug":"full","linkDestination":"none"} -->
      <figure class="wp-block-image size-full">
        <img
          src="https://kvytechnology.com/wp-content/uploads/2025/11/adaptive-icon-1.png"
          alt="adaptive icon"
          class="wp-image-22363"
        />
        <figcaption class="wp-element-caption">adaptive icon</figcaption>
      </figure>
      <!-- /wp:image -->
      <!-- wp:image {"id":22365,"sizeSlug":"large","linkDestination":"none"} -->
      <figure class="wp-block-image size-large">
        <img
          src="https://kvytechnology.com/wp-content/uploads/2025/11/background-image-2.png"
          alt="background image"
          class="wp-image-22365"
        />
        <figcaption class="wp-element-caption">background image</figcaption>
      </figure>
      <!-- /wp:image -->
      <!-- wp:image {"id":22366,"sizeSlug":"large","linkDestination":"none"} -->
      <figure class="wp-block-image size-large">
        <img
          src="https://kvytechnology.com/wp-content/uploads/2025/11/background-image-3.png"
          alt="background image"
          class="wp-image-22366"
        />
        <figcaption class="wp-element-caption">background image</figcaption>
      </figure>
      <!-- /wp:image -->
    </figure>
    <!-- /wp:gallery -->
    <!-- wp:image {"id":22355,"sizeSlug":"full","linkDestination":"none"} -->
    <figure class="wp-block-image size-full">
      <img
        src="https://kvytechnology.com/wp-content/uploads/2025/11/emoji4.png"
        alt="emoji4"
        class="wp-image-22355"
      />
    </figure>
    <!-- /wp:image -->
    <!-- wp:columns -->
    <div class="wp-block-columns">
      <!-- wp:column -->
      <div class="wp-block-column">
        <!-- wp:paragraph -->
        <p>Kvytechnology</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:column -->
      <!-- wp:column -->
      <div class="wp-block-column">
        <!-- wp:paragraph -->
        <p>Kvytechnology</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
    <!-- wp:calendar /-->
    <!-- wp:buttons -->
    <div class="wp-block-buttons">
      <!-- wp:button -->
      <div class="wp-block-button">
        <a class="wp-block-button__link wp-element-button">Action Button</a>
      </div>
      <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
    <!-- wp:video {"id":22373,"guid":"lfrcFm6E","videoPressClassNames":"wp-block-embed is-type-video is-provider-videopress"} -->
    <figure class="wp-block-video wp-block-embed is-type-video is-provider-videopress">
      <div class="wp-block-embed__wrapper">
        https://videopress.com/v/lfrcFm6E?resizeToParent=true&amp;cover=true&amp;preloadContent=metadata&amp;useAverageColor=true
      </div>
    </figure>
    <!-- /wp:video -->
    <!-- wp:embed {"url":"https://www.youtube.com/watch?v=70jKtCdy6eQ","type":"video","providerNameSlug":"youtube","responsive":true,"className":"wp-embed-aspect-16-9 wp-has-aspect-ratio"} -->
    <figure
      class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"
    >
      <div class="wp-block-embed__wrapper">https://www.youtube.com/watch?v=70jKtCdy6eQ</div>
    </figure>
    <!-- /wp:embed -->
`

/**
 * Mock WordPress Post Data
 *
 * Provides sample WordPress posts for testing the migration pipeline
 * without requiring a live WordPress instance.
 */

/**
 * Sample WordPress post content with various block types
 */
export const MOCK_WP_POSTS: WPPost[] = [
  {
    id: 1,
    title: 'The Evolution of Programming: High-Level Languages',
    slug: 'evolution-of-programming',
    content: `
        <!-- wp:paragraph -->
        <p class="has-text-align-center"><strong><em><s>This is a content</s></em></strong></p>
    <!-- /wp:paragraph -->

    <!-- wp:heading --> <h2 class="wp-block-heading">Heading h2</h2> 
    <!-- /wp:heading --> 

    <!-- wp:heading {"level":3} --> <h3 class="wp-block-heading">Heading h3</h3> 
    <!-- /wp:heading --> 

    <!-- wp:heading {"level":4} --> <h4 class="wp-block-heading">Heading h4</h4> 
    <!-- /wp:heading --> 

    <!-- wp:heading {"level":5} --> <h5 class="wp-block-heading">Heading h5</h5> 
    <!-- /wp:heading --> 

    <!-- wp:heading {"level":6} --> <h6 class="wp-block-heading">Heading h6</h6> 
    <!-- /wp:heading --> 
    
    <!-- wp:image {"id":22355,"sizeSlug":"full","linkDestination":"none"} --> 
        <figure class="wp-block-image size-full"><img src="https://kvytechnology.com/wp-content/uploads/2025/11/emoji4.png" alt="emoji4" class="wp-image-22355"/><figcaption class="wp-element-caption">emoji4</figcaption></figure> 
    <!-- /wp:image --> 

    <!-- wp:gallery {"linkTo":"none"} --> <figure class="wp-block-gallery has-nested-images columns-default is-cropped">
    
    <!-- wp:image {"id":22353,"sizeSlug":"large","linkDestination":"none"} --> <figure class="wp-block-image size-large"><img src="https://kvytechnology.com/wp-content/uploads/2025/11/adaptive-icon.png" alt="adaptive icon" class="wp-image-22353"/><figcaption class="wp-element-caption">adaptive icon</figcaption></figure> <!-- /wp:image --> 
    
    <!-- wp:image {"id":22354,"sizeSlug":"large","linkDestination":"none"} --> <figure class="wp-block-image size-large"><img src="https://kvytechnology.com/wp-content/uploads/2025/11/background-image.png" alt="background image" class="wp-image-22354"/><figcaption class="wp-element-caption">background image</figcaption></figure> <!-- /wp:image --> 
    
    <!-- wp:image {"id":22363,"sizeSlug":"full","linkDestination":"none"} --> <figure class="wp-block-image size-full"><img src="https://kvytechnology.com/wp-content/uploads/2025/11/adaptive-icon-1.png" alt="adaptive icon" class="wp-image-22363"/><figcaption class="wp-element-caption">adaptive icon</figcaption></figure> <!-- /wp:image --> 
    
    <!-- wp:image {"id":22365,"sizeSlug":"large","linkDestination":"none"} --> <figure class="wp-block-image size-large"><img src="https://kvytechnology.com/wp-content/uploads/2025/11/background-image-2.png" alt="background image" class="wp-image-22365"/><figcaption class="wp-element-caption">background image</figcaption></figure> <!-- /wp:image --> 
    
    <!-- wp:image {"id":22366,"sizeSlug":"large","linkDestination":"none"} --> <figure class="wp-block-image size-large"><img src="https://kvytechnology.com/wp-content/uploads/2025/11/background-image-3.png" alt="background image" class="wp-image-22366"/><figcaption class="wp-element-caption">background image</figcaption></figure> <!-- /wp:image --></figure> <!-- /wp:gallery --> 
    
    <!-- wp:image {"id":22355,"sizeSlug":"full","linkDestination":"none"} --> <figure class="wp-block-image size-full"><img src="https://kvytechnology.com/wp-content/uploads/2025/11/emoji4.png" alt="emoji4" class="wp-image-22355"/></figure> <!-- /wp:image --> 

    <!-- wp:table {"hasFixedLayout":false} -->
        <figure class="wp-block-table"><table><tbody><tr><th>Languages</th><th>Purpose</th></tr><tr><td>APL, COBOL, FORTRAN, LISP, PLI, SIMULA</td><td>Paved the path towards more efficient programming</td></tr><tr><td>COBOL, FORTRAN</td><td>Used for business data processing and scientific computations</td></tr></tbody></table></figure>
    <!-- /wp:table -->

    <!-- wp:video {"id":22373,"guid":"lfrcFm6E","videoPressClassNames":"wp-block-embed is-type-video is-provider-videopress"} -->
    <figure class="wp-block-video wp-block-embed is-type-video is-provider-videopress">
      <div class="wp-block-embed__wrapper">
        https://videopress.com/v/lfrcFm6E?resizeToParent=true&amp;cover=true&amp;preloadContent=metadata&amp;useAverageColor=true
      </div>
    </figure>
    <!-- /wp:video -->
       
    <!-- wp:embed {"url":"https://www.youtube.com/watch?v=70jKtCdy6eQ","type":"video","providerNameSlug":"youtube","responsive":true,"className":"wp-embed-aspect-16-9 wp-has-aspect-ratio"} -->
    <figure
      class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"
    >
      <div class="wp-block-embed__wrapper">https://www.youtube.com/watch?v=70jKtCdy6eQ</div>
    </figure>
    <!-- /wp:embed -->

    <!-- wp:buttons -->
      <div class="wp-block-buttons">
        <!-- wp:button -->
        <div class="wp-block-button">
          <a class="wp-block-button__link wp-element-button">Action Button</a>
        </div>
        <!-- /wp:button -->
      </div>
    <!-- /wp:buttons -->

        <!-- wp:columns -->
    <div class="wp-block-columns">
      <!-- wp:column -->
      <div class="wp-block-column">
        <!-- wp:paragraph -->
        <p>Kvytechnology</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:column -->
      <!-- wp:column -->
      <div class="wp-block-column">
        <!-- wp:paragraph -->
        <p>Kvytechnology</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
`,
    excerpt: 'A journey through programming language evolution',
    date: '2024-01-15T10:00:00Z',
    author: 1,
    categories: [1],
    status: 'publish',
  },
]

/**
 * Get mock WordPress posts
 *
 * @param limit - Maximum number of posts to return (default: all)
 * @returns Array of mock WordPress posts
 *
 * @example
 * ```ts
 * const posts = getMockWPPosts(5)
 * ```
 */
export function getMockWPPosts(limit?: number): WPPost[] {
  if (limit && limit > 0) {
    return MOCK_WP_POSTS.slice(0, limit)
  }
  return MOCK_WP_POSTS
}

/**
 * Get a single mock WordPress post by ID
 *
 * @param id - Post ID
 * @returns WordPress post or undefined if not found
 *
 * @example
 * ```ts
 * const post = getMockWPPost(1)
 * ```
 */
export function getMockWPPost(id: number): WPPost | undefined {
  return MOCK_WP_POSTS.find((post) => post.id === id)
}
