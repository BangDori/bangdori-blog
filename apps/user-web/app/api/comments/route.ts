import { NextResponse } from 'next/server';

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';
const REPO_OWNER = 'BangDori';
const REPO_NAME = 'bangdori-blog';
const token = process.env.GITHUB_TOKEN;

const query = `
query {
  repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
    discussions(first: 100) {
      nodes {
        title
        comments(first: 30) {
          totalCount
          nodes {
            replies(first: 30) {
              totalCount
            }
          }
        }
      }
    }
  }
}
`;

interface Discussion {
  title: string;
  comments: {
    totalCount: number;
    nodes: Array<{
      replies: {
        totalCount: number;
      };
    }>;
  };
}

export async function GET() {
  try {
    if (!token) {
      return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 }, // 1시간 캐싱
    });

    if (!response.ok) {
      throw new Error('GitHub API request failed');
    }

    const data = await response.json();
    const discussions: Discussion[] = data.data?.repository?.discussions?.nodes || [];

    // 경로별 댓글 수 매핑 (Giscus mapping="pathname" 기준)
    const commentCounts: Record<string, number> = {};

    discussions.forEach((discussion) => {
      // Discussion 제목이 경로 (예: "/blog/my-post")
      const path = discussion.title;

      // 최상위 댓글 수 + 대댓글 수
      commentCounts[path] = discussion.comments.nodes.reduce(
        (sum, comment) => sum + comment.replies.totalCount,
        discussion.comments.totalCount
      );
    });

    return NextResponse.json(commentCounts);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch comment counts:', error);
    return NextResponse.json({ error: 'Failed to fetch comment counts' }, { status: 500 });
  }
}
