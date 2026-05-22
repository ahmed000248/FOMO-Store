import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';

// ── Error Boundary — catches white screens and shows the real error ───────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#080b14', color: '#f8fafc',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '2rem', fontFamily: 'monospace',
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid rgba(244,63,94,0.4)',
            borderRadius: '16px', padding: '2rem', maxWidth: '700px', width: '100%',
          }}>
            <p style={{ color: '#f43f5e', fontWeight: 'bold', fontSize: '18px', marginBottom: '1rem' }}>
              ⚠ App Error — copy this and share it
            </p>
            <pre style={{
              background: '#0f172a', padding: '1rem', borderRadius: '8px',
              overflow: 'auto', fontSize: '13px', color: '#e2e8f0',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {this.state.error?.message}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1.5rem', padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)',
                border: 'none', borderRadius: '12px', color: 'white',
                cursor: 'pointer', fontSize: '14px', fontWeight: 600,
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </HelmetProvider>
);
