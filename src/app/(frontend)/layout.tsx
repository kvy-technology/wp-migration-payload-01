import { ThemeProvider } from '@/providers/theme-provider'
import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Kvy Creative Payload CMS Template',
  title: 'Kvy Creative Payload CMS Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
