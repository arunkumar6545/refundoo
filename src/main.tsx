import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { backgroundScanner } from './services/backgroundScanner'
import { loadSettings } from './services/storage'
import './index.css'

// Initialize Capacitor (only in native platforms)
// Use dynamic import to avoid breaking web builds - non-blocking
setTimeout(() => {
  import('@capacitor/core').then(({ Capacitor }) => {
    if (Capacitor.isNativePlatform()) {
      import('@capacitor/app').then(({ App: CapacitorApp }) => {
        CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            CapacitorApp.exitApp();
          } else {
            window.history.back();
          }
        });
      }).catch(() => {
        // Capacitor app module not available
      });
    }
  }).catch(() => {
    // Capacitor not available in web environment - this is fine
  });
}, 0);

// Initialize background scanner if enabled
const settings = loadSettings();
if (settings.autoScanEnabled && (settings.smsScanEnabled || settings.emailScanEnabled)) {
  // Start background scanning after a short delay
  setTimeout(() => {
    backgroundScanner.start();
  }, 2000);
}

// Render the app immediately
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('Rendering app...', { rootElement });

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering app:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; background: #fee; border: 2px solid #f00;">
      <h1 style="color: #c00;">Failed to render app</h1>
      <pre>${error instanceof Error ? error.stack : String(error)}</pre>
    </div>
  `;
}
