import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Building2, Eye, EyeOff, ArrowRight, Scale } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: 2 + Math.random() * 3, duration: 8 + Math.random() * 12,
  delay: Math.random() * 5, opacity: 0.1 + Math.random() * 0.15,
}));

// ─── GOOGLE SVG ───────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function AuthForm({ role }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // Create Supabase auth account without company id
      const { error: authErr } = await supabase.auth.signUp({
        email, password,
        options: {
          data: {
            role: role,
            profile_completed: false
          }
        }
      });
      if (authErr) throw authErr;

      // Navigate to complete profile page passing the role
      navigate(`/complete-profile?mode=${role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/complete-profile?mode=${role}`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        }
      });
      if (error) setError(`Google Error: ${error.message}`);
    } catch (err) {
      setError('Unexpected error during Google Sign-Up.');
    }
  };

  const isClient = role === 'client_company';

  return (
    <div className="card-luxury anim-scale-in" style={{ 
      margin: '0 auto', 
      maxWidth: 540, 
      width: '100%', 
      padding: 'clamp(2rem, 8vw, 3.5rem)',
      borderRadius: 32,
      background: 'rgba(5, 5, 5, 0.82)',
      zIndex: 10
    }}>
      {/* Header */}
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
          {isClient ? <Building2 size={32} color="var(--primary)" /> : <Scale size={32} color="var(--primary)" />}
        </div>
        <h1 style={{ 
          fontWeight: 900, 
          fontSize: 'clamp(2.2rem, 5vw, 2.6rem)', 
          color: '#ffffff', 
          letterSpacing: '-0.04em',
          marginBottom: '0.5rem'
        }}>
          {isClient ? 'Company Access' : 'Deploy Station'}
        </h1>
        <p style={{ 
          color: 'var(--primary)', 
          fontSize: '0.7rem', 
          fontWeight: 900, 
          letterSpacing: '0.2rem', 
          textTransform: 'uppercase',
          opacity: 0.9,
          marginBottom: '0.5rem'
        }}>
          {isClient ? 'Join LogiRate Network' : 'Initialize Operational Instance'}
        </p>

        {isClient && (
          <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.4rem 0.8rem', borderRadius: 20, marginTop: '0.5rem' }}>
            <p style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>✨ FREE FOREVER: INCLUDES E-WAY BILLS & INVOICES</p>
          </div>
        )}
      </div>

      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>WORK EMAIL</label>
          <input className="input-premium" type="email" required placeholder="admin@company.com"
            value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <input className="input-premium" type={showPass ? 'text' : 'password'} required minLength={6} placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', paddingRight: '2.75rem' }} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.82rem', fontWeight: 600 }}>{error}</div>}
        
        <button className="btn-premium-gold" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>Create Account <ArrowRight size={18} /></span>}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '1rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.05em' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <button type="button" onClick={handleGoogleSignup}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', color: 'var(--text)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
        >
          <GoogleIcon /> Sign up with Google
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text3)' }}>
        Already have an account?{' '}
        <NavLink to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign In</NavLink>
      </p>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function Signup() {
  const [role, setRole] = useState('client_company');

  return (
    <div className="auth-page-premium" style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      overflow: 'hidden', 
      background: 'var(--bg)',
      padding: '2rem 1rem'
    }}>
      {PARTICLES.map(p => (
        <div key={p.id} style={{ position: 'absolute', borderRadius: '50%', left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: 'var(--primary)', opacity: p.opacity, animation: `particle-drift ${p.duration}s ease-in-out ${p.delay}s infinite alternate`, pointerEvents: 'none' }} />
      ))}

      {/* ── Background Elements ── */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', opacity: 0.6, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', opacity: 0.4, pointerEvents: 'none' }} />


      {/* Top role toggle */}
      <div style={{ display: 'flex', gap: '0.6rem', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)', marginBottom: '2rem', width: 'fit-content', zIndex: 1, position: 'relative', margin: '0 auto 1.5rem' }}>
        {[['client_company', '🏢 Client Company'], ['weighbridge_station', '⚖️ Weighment Station']].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setRole(key)}
            style={{ padding: '0.7rem 1.75rem', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', background: role === key ? 'var(--primary)' : 'transparent', color: role === key ? '#000' : 'var(--text3)', boxShadow: role === key ? '0 8px 20px var(--primary-glow)' : 'none' }}>
            {label}
          </button>
        ))}
      </div>

      <AuthForm role={role} />
    </div>
  );
}
