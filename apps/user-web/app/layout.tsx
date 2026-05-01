import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Footer from '@/components/layouts/Footer';
import Header from '@/components/layouts/Header';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { VisitorTracker } from '@/components/VisitorTracker';
import './globals.css';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: '강병준 블로그',
  description: '프론트엔드 개발자 강병준의 개발 블로그입니다.',
  alternates: {
    canonical: '/',
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
    locale: 'ko_KR',
    title: '강병준 블로그',
    description: '프론트엔드 개발자 강병준의 개발 블로그입니다.',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: '강병준 블로그',
    images: [
      {
        url: '/profile.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
  verification: {
    google: '1MOKYvT_GGBdafHzhizlVbSkJm2MCMq3ochRPEByTmQ',
  },
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_SITE_URL}`),
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
