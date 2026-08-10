import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import Footer from '@/components/layouts/Footer';
import Header from '@/components/layouts/Header';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { VisitorTracker } from '@/components/VisitorTracker';
import { SITE } from '@/lib/site';
import './globals.css';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  authors: [{ name: SITE.author.name, url: '/about' }],
  creator: SITE.author.name,
  publisher: SITE.author.name,
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  keywords: [
    '강병준',
    '프론트엔드',
    '개발',
    '블로그',
    'React',
    'Next.js',
    'Tailwind CSS',
    'TypeScript',
    'JavaScript',
  ],
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    title: SITE.name,
    description: SITE.description,
    url: '/',
    siteName: SITE.name,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
    description: SITE.description,
    images: ['/opengraph-image'],
  },
  verification: {
    google: '1MOKYvT_GGBdafHzhizlVbSkJm2MCMq3ochRPEByTmQ',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <meta name="naver-site-verification" content="0e5d02ef9840430d455d81b33e561586d724c09f" />
      </head>
      <body className="font-pretendard antialiased">
        <div className="flex min-h-screen flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <VisitorTracker />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
        </div>
        <GoogleAnalytics />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
