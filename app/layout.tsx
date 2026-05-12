import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Serif_Display, DM_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
})

const dmSerif = DM_Serif_Display({ 
  subsets: ['latin'],
  variable: '--font-dm-serif',
  weight: '400',
})

const dmMono = DM_Mono({ 
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'InvoiceForge - Get Paid Faster',
  description: 'Free professional invoicing. Upgrade to Pro for unlimited invoices, PDF download, and custom branding.',
  generator: 'v0.app',
  authors: [{ name: 'InvoiceForge' }],
  openGraph: {
    title: 'InvoiceForge - Get Paid Faster',
    description: 'Free professional invoicing. Upgrade to Pro for unlimited invoices and PDF downloads.',
    type: 'website',
    url: 'https://invoiceforge.vercel.app/',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f0e0d',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmSerif.variable} ${dmMono.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
