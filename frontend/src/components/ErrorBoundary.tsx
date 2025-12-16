import type { ReactNode } from 'react';
import { Component as ReactComponent } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends ReactComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '500px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626', marginBottom: '16px' }}>
              Oops! Something went wrong
            </h1>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
              We're sorry for the inconvenience. An unexpected error has occurred.
            </p>
            
            {this.state.error && import.meta.env.DEV && (
              <details style={{
                textAlign: 'left',
                backgroundColor: '#f3f4f6',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{
                  fontSize: '12px',
                  color: '#dc2626',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              style={{
                padding: '10px 24px',
                backgroundColor: '#0066FF',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Go Back Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
