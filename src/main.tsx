import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { DownloadProvider } from './context/DownloadContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DownloadProvider>
      <App />
    </DownloadProvider>
  </StrictMode>,
);
