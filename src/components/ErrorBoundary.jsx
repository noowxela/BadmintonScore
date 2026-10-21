import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="container">
        <header className="header">
          <div className="title">Badminton<span style={{ color: 'var(--color-text)' }}>Score</span></div>
        </header>
        <div className="card">
          <h2 style={{ marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            The page hit an unexpected error. Your saved data is still in this browser.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => { window.location.href = import.meta.env.BASE_URL; }}
          >
            Back home
          </button>
        </div>
      </div>
    );
  }
}
