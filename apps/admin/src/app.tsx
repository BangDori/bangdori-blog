import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout';
import { DashboardPage } from './pages/dashboard';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}
