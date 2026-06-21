import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ROUTES } from '@shared/lib/routes';
import { LoginPage } from './pages/auth/login';
import { DashboardPage } from './pages/dashboard';
import { ExternalPostsCreatePage } from './pages/external-posts/create';
import { ExternalPostsEditPage } from './pages/external-posts/edit';
import { ExternalPostsListPage } from './pages/external-posts/list';
import { PostsCreatePage } from './pages/posts/create';
import { PostsEditPage } from './pages/posts/edit';
import { PostsListPage } from './pages/posts/list';
import { ProtectedRoute } from './pages/protected';

export function App() {
  return (
    <>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path={ROUTES.posts} element={<PostsListPage />} />
          <Route path={ROUTES.postsNew} element={<PostsCreatePage />} />
          <Route path={ROUTES.postsEdit} element={<PostsEditPage />} />
          <Route path={ROUTES.externalPosts} element={<ExternalPostsListPage />} />
          <Route path={ROUTES.externalPostsNew} element={<ExternalPostsCreatePage />} />
          <Route path={ROUTES.externalPostsEdit} element={<ExternalPostsEditPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors closeButton theme="system" />
    </>
  );
}
