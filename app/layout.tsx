import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

const font = Manrope({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  title: 'Image Hosting: upload and share images',
  description: 'Image Hosting: upload an image and get direct, display and viewer links in seconds.',
  applicationName: 'Image Hosting',
  openGraph: { title: 'Image Hosting', description: 'Upload an image and get a shareable link.', siteName: 'Image Hosting', type: 'website' },
  icons: { icon: '/icon.svg' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f6f7f9' }, { media: '(prefers-color-scheme: dark)', color: '#0e1116' }],
}

const themeScript = `try{var t=localStorage.getItem('image-hosting:theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={font.variable} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
