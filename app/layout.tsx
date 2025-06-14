import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Header from '@/components/layouts/Header';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: '강병준 블로그',
  description: '프론트엔드 개발자 강병준의 개발 블로그입니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="font-pretendard antialiased">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="flex-1">{children}</main>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
