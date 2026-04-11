import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Truck, Eye, EyeOff, Building2, ArrowRight, CheckCircle } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  duration: 8 + Math.random() * 12,
  delay: Math.random() * 5,
  opacity: 0.1 + Math.random() * 0.2,
}));

export default function Signup() {
  const location = useLocation();
  const queryMode = new URLSearchParams(location.search).get('mode');
  
  const [mode, setMode]         = useState(queryMode === 'operator' ? 'operator' : 'admin');
  const [joinCode, setJoinCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [message, setMessage]   = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');

    try {
      const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      let companyIdToUse = '';
      let companyNameToUse = '';

      if (mode === 'admin') {
        if (!companyName.trim()) throw new Error('Station name is required.');
        const companyRes = await fetch(`${API}/company/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: companyName.trim() })
        });
        if (!companyRes.ok) {
          const err = await companyRes.json().catch(() => ({}));
          throw new Error(err.detail || 'Failed to create station.');
        }
        const company = await companyRes.json();
        companyIdToUse = company.company_id;
        companyNameToUse = company.company_name;
        setMessage(`Station created! Join code: ${company.join_code}`);
      } else {
        if (!joinCode.trim()) throw new Error('Join code is required.');
        const valRes = await fetch(`${API}/validate-join-code?code=${encodeURIComponent(joinCode.trim())}`);
        if (!valRes.ok) {
           const err = await valRes.json().catch(() => ({}));
           throw new Error(err.detail || 'Invalid join code.');
        }
        const valData = await valRes.json();
        companyIdToUse = valData.company_id;
        companyNameToUse = valData.company_name;
        setMessage(`Joined station: ${valData.company_name}`);
      }

      const { error: authErr } = await supabase.auth.signUp({
        email, password,
        options: {
          data: {
            role: mode === 'admin' ? 'company' : 'operator',
            company_id: companyIdToUse,
            company_name: companyNameToUse,
          }
        }
      });
      if (authErr) throw authErr;
      
      setMessage(prev => `${prev} — Account created. Please check your email to confirm.`);
      setTimeout(() => navigate('/login'), 6000);
    } catch (err) {
      setError(err.message);
    } finally {
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
    <div className="auth-page-premium" style={{ fontFamily: 'Inter, sans-serif', paddingTop: 'clamp(4rem, 15vh, 8rem)' }}>
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

      <div className="auth-card-premium">
        <div className="anim-fade-up" style={{ textAlign: 'center', marginBottom: 'clamp(1rem, 4vw, 2rem)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 20, background: 'var(--primary-glow)', border: '1px solid var(--primary)', marginBottom: '1.25rem', opacity: 0.8 }}>
            <Building2 size={32} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)' }}>
            {mode === 'admin' ? 'Register Station' : 'Join Station'}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '0.5rem', lineHeight: 1.4 }}>
            {mode === 'admin' ? 'Start your weighbridge automation journey' : 'Enter join code to link to a station'}
          </p>
        </div>

        <div className="anim-fade-up anim-delay-1" style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 12, padding: '4px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
          <button type="button" onClick={() => setMode('admin')} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none', background: mode === 'admin' ? 'var(--surface)' : 'transparent', color: mode === 'admin' ? 'var(--primary)' : 'var(--text2)', fontWeight: mode === 'admin' ? 800 : 500, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: mode === 'admin' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none' }}>
            New Station
          </button>
          <button type="button" onClick={() => setMode('operator')} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none', background: mode === 'operator' ? 'var(--surface)' : 'transparent', color: mode === 'operator' ? 'var(--primary)' : 'var(--text2)', fontWeight: mode === 'operator' ? 800 : 500, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: mode === 'operator' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none' }}>
            Join as Operator
          </button>
        </div>

        <form onSubmit={handleSignup} className="anim-fade-up anim-delay-2">
          {mode === 'admin' ? (
            <div className="anim-fade-up" style={{ marginBottom: '1rem', animationDelay: '0.3s' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04rem' }}>STATION / BUSINESS NAME</label>
              <input className="input-premium" type="text" required placeholder="e.g. Sri Kadai Eswara Weighing"
                value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
          ) : (
            <div className="anim-fade-up" style={{ marginBottom: '1rem', animationDelay: '0.3s' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04rem' }}>JOIN CODE</label>
              <input className="input-premium" type="text" required placeholder="e.g. JOIN-XYZ123"
                value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '2px' }} />
            </div>
          )}
          <div className="anim-fade-up" style={{ marginBottom: '1rem', animationDelay: '0.4s' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04rem' }}>{mode === 'admin' ? 'ADMIN EMAIL' : 'OPERATOR EMAIL'}</label>
            <input className="input-premium" type="email" required placeholder="admin@station.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="anim-fade-up" style={{ marginBottom: '1.5rem', animationDelay: '0.5s' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04rem' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input className="input-premium" type={showPass ? 'text' : 'password'} required minLength={6} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 10, padding: '0.85rem', marginBottom: '1.25rem', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>{error}</div>}
          {message && <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 10, padding: '0.85rem', marginBottom: '1.25rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>{message}</div>}

          <button className="btn-premium-gold" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? <><span className="spinner" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text)' }} /> Processing...</> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>{mode === 'admin' ? 'Register Now' : 'Join Terminal'} <ArrowRight size={18} /></span>}
          </button>
        </form>

        <div className="anim-fade-up anim-delay-3" style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', gap: '1rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.05em' }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <button className="anim-fade-up anim-delay-4" onClick={handleGoogleAuth} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%', padding: '0.85rem', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', color: 'var(--text)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px var(--primary-glow)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </button>

        <p className="anim-fade-up anim-delay-5" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text3)' }}>
          Already have an account?{' '}
          <NavLink to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign In</NavLink>
        </p>
      </div>
    </div>
  );
}
