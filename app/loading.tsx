import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="w-full px-4 py-8">
      <div className="grid gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-sm px-0.5 py-1 transition-colors duration-200 ease-in-out hover:bg-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center text-gray-400">불러오는 중...</div>
    </div>
  );
}
