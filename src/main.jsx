import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Immediately purge any legacy Service Worker caches (v1, v2, v3, v4) that may have cached /api/ responses
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== 'jtfb-phone-cache-v5') {
        caches.delete(key).catch(() => {});
      }
    });
  }).catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Unregister legacy /sw.js and register clean /sw-v5.js
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        if (reg.active && reg.active.scriptURL && !reg.active.scriptURL.endsWith('/sw-v5.js')) {
          reg.unregister().catch(() => {});
        }
      }
    }).catch(() => {});

    navigator.serviceWorker.register('/sw-v5.js')
      .then((reg) => {
        reg.update();
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}
