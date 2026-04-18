import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Truck, Eye, EyeOff, ArrowRight, Zap, KeyRound } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

// ─── Animated particle background ────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  duration: 6 + Math.random() * 10,
  delay: Math.random() * 6,
  opacity: 0.15 + Math.random() * 0.25,
}));

// ─── Animated counter ────────────────────────────────────────────
function CountUp({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const step = to / 40;
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + step, to);
      setVal(Math.floor(cur));
      if (cur >= to) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [to]);
  return <span>{val.toLocaleString()}{suffix}</span>;
}

export default function Login() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [focused, setFocused]   = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin, queryParams: { access_type: 'offline', prompt: 'consent' } }
      });
      if (error) setError(`Google Error: ${error.message}`);
    } catch (err) {
      setError('An unexpected error occurred during Google Sign-In.');
    }
  };

  return (
    <div className="auth-page-premium" style={{ fontFamily: 'Inter, sans-serif', padding: 'clamp(2rem, 10vh, 6rem) 1rem', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      {/* Animated particles */}
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position: 'absolute', borderRadius: '50%',
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          background: 'var(--primary)',
          opacity: p.opacity,
          animation: `particle-drift ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* ── Auth Card ── */}
      <div className="card-luxury anim-scale-in" style={{ 
        margin: '0 auto', 
        maxWidth: 500, 
        width: '100%', 
        padding: 'clamp(2rem, 8vw, 4rem)',
        borderRadius: 32,
        background: 'rgba(5, 5, 5, 0.8)',
        zIndex: 10
      }}>
        {/* Logo/Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="anim-pulse-glow" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 72, 
            height: 72, 
            borderRadius: 20, 
            background: 'var(--primary-glow)', 
            border: '1px solid rgba(212,175,55,0.3)', 
            marginBottom: '1.5rem'
          }}>
            <KeyRound size={32} color="var(--primary)" />
          </div>
          <h1 style={{ 
            fontWeight: 900, 
            fontSize: 'clamp(2.5rem, 6vw, 2.8rem)', 
            color: '#ffffff', 
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: '0.75rem'
          }}>Access Portal</h1>
          <p style={{ 
            color: 'var(--primary)', 
            fontSize: '0.7rem', 
            fontWeight: 900, 
            letterSpacing: '0.2rem', 
            textTransform: 'uppercase',
            opacity: 0.9
          }}>Secure Biometric Protocol Simulation</p>
        </div>

        {/* Status Strip */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '3rem' }}>
          {[
            { val: '1,280+', lab: 'NODES' },
            { val: '99.9%', lab: 'SYNC' },
            { val: '40ms', lab: 'LATENCY' }
          ].map(s => (
            <div key={s.lab} style={{ flex: 1, padding: '1rem 0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--primary)' }}>{s.val}</div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text3)', fontWeight: 800, letterSpacing: '0.05em', marginTop: '2px' }}>{s.lab}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="anim-fade-up anim-delay-2">
          {/* Email */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: '0.75rem' }}>Operational Email</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-premium"
                type="email" required placeholder="admin@logicrate.io"
                value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
              />
              {focused === 'email' && (
                <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                  <Zap size={16} />
                </div>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="anim-fade-up" style={{ marginBottom: '1.5rem', animationDelay: '0.4s' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-premium"
                type={showPass ? 'text' : 'password'}
                required placeholder="••••••••" minLength={6}
                value={password} onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
                style={{ width: '100%', paddingRight: '2.75rem', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', transition: 'color 0.2s', padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 10, padding: '0.85rem', marginBottom: '1.25rem', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>{error}</div>}

          <button className="btn-premium-gold" type="submit" disabled={loading} style={{ marginTop: '1rem', height: 56, fontSize: '1.05rem' }}>
            {loading ? <span className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>ENTER DASHBOARD <ArrowRight size={20} /></span>}
          </button>
        </form>

        {/* Divider */}
        <div className="anim-fade-up anim-delay-3" style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', gap: '1rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.05em' }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Google */}
        <button className="anim-fade-up anim-delay-4" onClick={handleGoogleAuth} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%', padding: '0.85rem', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', color: 'var(--text)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px var(--primary-glow)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Footer links */}
        <div className="anim-fade-up anim-delay-5" style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>
            No account?{' '}
            <NavLink to="/signup" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}
            >Register Company</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}
