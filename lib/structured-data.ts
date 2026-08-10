import { absoluteUrl, SITE } from '@/lib/site';
import type { Post } from '@/domains/post/types';

const personId = absoluteUrl('/#person');
const websiteId = absoluteUrl('/#website');

export function createWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    inLanguage: SITE.language,
    publisher: {
      '@id': personId,
    },
  };
}

export function createPersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId,
    name: SITE.author.name,
    url: absoluteUrl('/about'),
    image: absoluteUrl('/profile.jpg'),
    jobTitle: SITE.author.jobTitle,
    sameAs: SITE.author.sameAs,
  };
}

export function createBlogPostingJsonLd(post: Post) {
  const path = `/blog/${encodeURIComponent(post.slug)}`;
  const url = absoluteUrl(path);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.description,
    image: [absoluteUrl(`${path}/opengraph-image`)],
    author: {
      '@type': 'Person',
      '@id': personId,
      name: SITE.author.name,
      url: absoluteUrl('/about'),
    },
    publisher: {
      '@type': 'Person',
      '@id': personId,
      name: SITE.author.name,
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    inLanguage: SITE.language,
    keywords: post.tag ? [post.tag] : undefined,
  };
}

export function createPostBreadcrumbJsonLd(post: Post) {
  const path = `/blog/${encodeURIComponent(post.slug)}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: post.title,
        item: absoluteUrl(path),
      },
    ],
  };
}
