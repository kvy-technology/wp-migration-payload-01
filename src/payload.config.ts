// storage-adapter-import-placeholder
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite' // database-adapter-import
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { r2Storage } from '@payloadcms/storage-r2'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { GetPlatformProxyOptions } from 'wrangler'

import { Categories } from './collections/categories'
import { Media } from './collections/media'
import { Posts } from './collections/posts'
import { Users } from './collections/users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Allow remote bindings in development if explicitly enabled via environment variable
// Set CLOUDFLARE_REMOTE_BINDINGS=true to use remote R2 and D1 when running locally
const cloudflareRemoteBindings =
  process.env.NODE_ENV === 'production' || process.env.CLOUDFLARE_REMOTE_BINDINGS === 'true'
// Use getCloudflareContext in production, otherwise use Wrangler's platform proxy
// Wrangler can use remote bindings when cloudflareRemoteBindings is true
const useDirectCloudflareContext =
  process.env.NODE_ENV === 'production' &&
  !process.argv.find((value) => value.match(/^(generate|migrate):?/))
const cloudflare = useDirectCloudflareContext
  ? await getCloudflareContext({ async: true })
  : await getCloudflareContextFromWrangler()

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Posts, Categories],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // database-adapter-config-start
  db: sqliteD1Adapter({ binding: cloudflare.env.D1 }),
  // database-adapter-config-end
  plugins: [
    // storage-adapter-placeholder
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        experimental: { remoteBindings: cloudflareRemoteBindings },
      } satisfies GetPlatformProxyOptions),
  )
}
