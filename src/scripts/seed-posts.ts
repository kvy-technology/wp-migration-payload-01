// import config from '@payload-config'
// import { getPayload } from 'payload'

// const samplePosts = [
//   {
//     title: 'Getting Started with Payload CMS',
//     slug: 'getting-started-with-payload-cms',
//     description:
//       'Learn the basics of Payload CMS and how to set up your first content management system. This comprehensive guide covers installation, configuration, and creating your first collections.',
//   },
//   {
//     title: 'Building Dynamic Websites with Next.js',
//     slug: 'building-dynamic-websites-with-nextjs',
//     description:
//       'Explore how to build modern, dynamic websites using Next.js. We cover server-side rendering, static site generation, and API routes to create fast and SEO-friendly applications.',
//   },
//   {
//     title: 'Cloudflare Workers Best Practices',
//     slug: 'cloudflare-workers-best-practices',
//     description:
//       'Discover the best practices for deploying and optimizing applications on Cloudflare Workers. Learn about edge computing, performance optimization, and cost-effective scaling strategies.',
//   },
//   {
//     title: 'TypeScript Tips for Better Code',
//     slug: 'typescript-tips-for-better-code',
//     description:
//       'Master TypeScript with these essential tips and tricks. From advanced types to utility functions, learn how to write more maintainable and type-safe code in your projects.',
//   },
//   {
//     title: 'Modern Web Development Trends',
//     slug: 'modern-web-development-trends',
//     description:
//       'Stay up to date with the latest trends in web development. We explore new frameworks, tools, and methodologies that are shaping the future of web development in 2024.',
//   },
//   {
//     title: 'Database Design Fundamentals',
//     slug: 'database-design-fundamentals',
//     description:
//       'Understand the core principles of database design. Learn about normalization, indexing, relationships, and how to structure your data for optimal performance and scalability.',
//   },
//   {
//     title: 'API Development with REST and GraphQL',
//     slug: 'api-development-with-rest-and-graphql',
//     description:
//       'Compare REST and GraphQL APIs and learn when to use each. This guide covers design patterns, best practices, and how to build robust APIs that serve your frontend applications effectively.',
//   },
//   {
//     title: 'Authentication and Security',
//     slug: 'authentication-and-security',
//     description:
//       'Implement secure authentication systems in your applications. Learn about JWT tokens, session management, password hashing, and protecting your APIs from common security vulnerabilities.',
//   },
//   {
//     title: 'Performance Optimization Techniques',
//     slug: 'performance-optimization-techniques',
//     description:
//       'Optimize your web applications for speed and efficiency. Discover techniques for code splitting, lazy loading, caching strategies, and measuring performance metrics.',
//   },
//   {
//     title: 'Deployment Strategies for Modern Apps',
//     slug: 'deployment-strategies-for-modern-apps',
//     description:
//       'Explore different deployment strategies for modern web applications. Learn about CI/CD pipelines, containerization, serverless deployments, and maintaining zero-downtime updates.',
//   },
// ]

// const seed = async () => {
//   const payload = await getPayload({ config })

//   await payload.delete({
//     collection: 'posts',
//     where: {
//       id: {
//         not_in: [],
//       },
//     },
//   })

//   for (const postData of samplePosts) {
//     try {
//       const post = await payload.create({
//         collection: 'posts',
//         data: {

//         },
//       })
//       console.log(`✅ Created post: "${post.title}"`)
//     } catch (error) {
//       console.error(`❌ Failed to create post "${postData.title}":`, error)
//     }
//   }
// }

// // Call the function here to run your seed script
// await seed()
