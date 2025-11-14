import config from '@/payload.config'

export interface ConvertOptions {
  html: string
  config: Awaited<typeof config>
}
