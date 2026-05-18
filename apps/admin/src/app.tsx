import { Route, Routes } from 'react-router-dom';
import { ROUTES } from '@shared/lib/routes';
import { Layout } from './components/layout';
import { DashboardPage } from './pages/dashboard';
import { PostsCreatePage } from './pages/posts/create';
import { PostsListPage } from './pages/posts/list';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path={ROUTES.posts} element={<PostsListPage />} />
        <Route path={ROUTES.postsNew} element={<PostsCreatePage />} />
      </Route>
    </Routes>
  );
}
