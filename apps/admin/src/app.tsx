import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout';
import { DashboardPage } from './pages/dashboard';
import { PostsListPage } from './pages/posts/list';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="posts" element={<PostsListPage />} />
      </Route>
    </Routes>
  );
}
