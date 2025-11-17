import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Custom loader handles optimization via Cloudflare Image Transformations
    loader: 'custom' as const,
    loaderFile: './src/lib/image-loader.ts',
    remotePatterns: [
      {
        protocol: 'http' as const,
        hostname: 'localhost',
      },
      {
        protocol: 'https' as const,
        hostname: 'wp-migration-payload-01.long-9d7.workers.dev',
      },
      {
        protocol: 'https' as const,
        hostname: 'img.kvytechnology.com',
      },
      // {
      //   protocol: 'https' as const,
      //   hostname: 'media.kvytechnology.com',
      // },
    ],
  },
  webpack: (webpackConfig: any) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
