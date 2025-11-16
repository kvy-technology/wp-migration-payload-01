import { AdminBar } from '@/components/admin-bar'
import { ThemeProvider } from '@/providers/theme-provider'
import { draftMode } from 'next/headers'
import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Kvy Creative Payload CMS Template',
  title: 'Kvy Creative Payload CMS Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <main className="h-full">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
