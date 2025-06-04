import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MainDocsPage from './_components/MainDocsPage';

interface DocsPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;

  if (!slug) {
    return <MainDocsPage />;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="text-muted-foreground flex items-center gap-2">
          <span>문서</span>
          {slug.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <span className={index === slug.length - 1 ? 'text-foreground font-medium' : ''}>
                {segment}
              </span>
            </div>
          ))}
        </div>
        <h1 className="text-4xl font-bold">{slug[slug.length - 1]}</h1>
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>현재 경로 정보</CardTitle>
          <CardDescription>
            <code className="bg-muted rounded-md px-2 py-1">
              params.slug: {JSON.stringify(slug)}
            </code>
          </CardDescription>
        </CardHeader>
      </Card>
    </>
  );
}
