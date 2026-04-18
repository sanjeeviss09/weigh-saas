import React from 'react';
import { AlertTriangle, RefreshCw, Cpu } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, recovering: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Self-Healing Monitor Caught Exception:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Auto-recovery attempt for chunk load errors or minor glitches
    if (error.message && (error.message.includes('Loading chunk') || error.message.includes('fetch'))) {
        this.setState({ recovering: true });
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
  }

  handleManualRecover = () => {
    this.setState({ recovering: true });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
          
          <div className="anim-pulse-glow" style={{ width: 80, height: 80, background: 'rgba(239,68,68,0.1)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Cpu size={40} color="#ef4444" />
          </div>
          
          <h1 style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--text)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            System Micro-Glitch Detected
          </h1>
          
          <p style={{ color: 'var(--text2)', fontSize: '1rem', marginBottom: '2rem', maxWidth: 450, lineHeight: 1.6 }}>
            Our neural monitors intercepted a UI rendering anomaly. To prevent a blank screen, the subsystem has been halted.
          </p>

          <div style={{ padding: '1rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, marginBottom: '2.5rem', width: '100%', maxWidth: 500, textAlign: 'left', overflow: 'hidden' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Diagnostics Log:</div>
            <div style={{ fontFamily: 'monospace', color: 'var(--text)', fontSize: '0.75rem', wordBreak: 'break-all' }}>
              {this.state.error?.toString()}
            </div>
          </div>

          <button 
            className="btn-premium-gold" 
            onClick={this.handleManualRecover}
            disabled={this.state.recovering}
            style={{ padding: '0.8rem 2rem', fontSize: '0.9rem', gap: '0.75rem' }}
          >
            {this.state.recovering ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#000' }} /> INITIATING SELF-RECOVERY...</>
            ) : (
              <><RefreshCw size={18} /> FORCE SYSTEM REBOOT</>
            )}
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}
