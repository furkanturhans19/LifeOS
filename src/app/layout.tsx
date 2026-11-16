import type { Metadata, Viewport } from 'next';
import { Manrope, Newsreader } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { MobileProvider } from '@/components/providers/MobileProvider';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
import { LayoutSyncProvider } from '@/components/providers/LayoutSyncProvider';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: {
    template: '%s — Life',
    default: 'Life',
  },
  description: 'Kişisel dijital yaşam alanın',
  icons: {
    icon: '/brand/life-logo.png',
    apple: '/brand/life-logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Life',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f6f3' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${manrope.variable} ${newsreader.variable} h-full`} suppressHydrationWarning>
      <body className="h-full font-sans antialiased no-select overflow-hidden">
        <ThemeProvider>
          <MobileProvider>
            <LocaleProvider>
              <LayoutSyncProvider>{children}</LayoutSyncProvider>
            </LocaleProvider>
          </MobileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
