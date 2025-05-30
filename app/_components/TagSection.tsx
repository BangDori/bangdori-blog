import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { NotionTag } from '@/types/notion.type';

interface TagSectionProps {
  tags: NotionTag[];
}

export default function TagSection({ tags }: TagSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>태그 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {tags.map((tag) => (
            <Link href={`?tag=${tag.name}`} key={tag.name}>
              <div className="hover:bg-muted-foreground/10 text-muted-foreground flex items-center justify-between rounded-md p-1.5 text-sm transition-colors">
                <span>{tag.name}</span>
                <span>{tag.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
