import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import { LanguageProvider } from '@/components/LanguageProvider'
import { CookieConsent } from '@/components/CookieConsent'
import { ScrollToTopButton } from '@/components/ScrollToTopButton'
import { OrganizationSchema, WebsiteSchema, SoftwareApplicationSchema } from '@/components/StructuredData'
import { createMetadata } from '@/lib/metadata'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = createMetadata({})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OrganizationSchema />
        <WebsiteSchema />
        <SoftwareApplicationSchema />
        <LanguageProvider>
          <AuthProvider>
            {children}
            <ScrollToTopButton />
            <CookieConsent />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
