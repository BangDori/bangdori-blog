import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { configureHttp } from '@shared/lib/http';
import { ROUTES } from '@shared/lib/routes';
import { App } from './app';
import { QueryProvider } from './components/query-provider';
import { ThemeProvider } from './components/theme-provider';
import './globals.css';

// navigate 는 컴포넌트 컨텍스트 밖에서 못 쓰므로 location.assign 으로 하드 네비게이션.
configureHttp({
  onAuthFailure: () => {
    if (window.location.pathname !== ROUTES.login) {
      window.location.assign(ROUTES.login);
    }
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>,
);
