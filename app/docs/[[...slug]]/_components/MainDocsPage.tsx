import Link from 'next/link';
import { Separator } from '@radix-ui/react-select';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function MainDocsPage() {
  return (
    <>
      <h1 className="text-4xl font-bold">문서 메인 페이지</h1>
      <Separator />
      <div className="grid gap-4">
        <Link href="/docs/intro">
          <Card>
            <CardHeader>
              <CardTitle>시작하기</CardTitle>
              <CardDescription>
                Next.js의 기본 개념과 프로젝트 설정 방법을 알아봅니다.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/docs/guide/basic">
          <Card>
            <CardHeader>
              <CardTitle>고급 가이드</CardTitle>
              <CardDescription>심화 개념과 실전 활용 방법을 다룹니다.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </>
  );
}
