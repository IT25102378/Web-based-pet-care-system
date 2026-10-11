import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  try {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </React.StrictMode>
    );
  } catch (err) {
    console.error('Fatal initialization error:', err);
    rootEl.innerHTML = `<div style="padding:2.5rem;margin:2rem auto;max-width:640px;background:#FEF2F2;border:1.5px solid #EF4444;border-radius:12px;font-family:system-ui,sans-serif;color:#991B1B;">
      <h3 style="margin:0 0 8px;">Failed to initialize application</h3>
      <p style="margin:0 0 12px;font-size:0.92rem;">${err.message || String(err)}</p>
      <button onclick="window.location.reload()" style="padding:8px 16px;background:#EF4444;color:#FFF;border:none;border-radius:6px;cursor:pointer;font-weight:600;">Reload</button>
    </div>`;
  }
}
