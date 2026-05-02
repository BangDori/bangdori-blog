import { type NextRequest, NextResponse } from 'next/server';

interface OgData {
  title: string;
  description: string;
  image: string;
  favicon: string;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
    });

    const html = await response.text();
    const ogData = parseOgTags(html, url);

    return NextResponse.json(ogData, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 });
  }
}

function parseOgTags(html: string, url: string): OgData {
  const getMetaContent = (property: string): string => {
    const regex = new RegExp(
      `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']|<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
      'i',
    );
    const match = html.match(regex);
    return match?.[1] || match?.[2] || '';
  };

  const getTitleFromHtml = (): string => {
    const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return match?.[1] || '';
  };

  const origin = new URL(url).origin;

  const title = getMetaContent('og:title') || getMetaContent('twitter:title') || getTitleFromHtml();
  const description =
    getMetaContent('og:description') ||
    getMetaContent('twitter:description') ||
    getMetaContent('description');
  let image = getMetaContent('og:image') || getMetaContent('twitter:image');

  if (image && !image.startsWith('http')) {
    image = new URL(image, origin).href;
  }

  const faviconMatch = html.match(
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i,
  );
  let favicon = faviconMatch?.[1] || `${origin}/favicon.ico`;

  if (favicon && !favicon.startsWith('http')) {
    favicon = new URL(favicon, origin).href;
  }

  return { title, description, image, favicon };
}
