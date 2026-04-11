import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Truck, Eye, EyeOff, Key, ArrowRight } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  duration: 10 + Math.random() * 10,
  delay: Math.random() * 5,
  opacity: 0.1,
}));

export default function SignupOperator() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');

    try {
      const { error: authErr } = await supabase.auth.signUp({
        email, password,
        options: {
          data: {
            role: 'weighment', // Flag as weighment first, they must enter join code after login
            company_id: null,
            company_name: null
          }
        }
      });
      if (authErr) throw authErr;
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-premium" style={{ fontFamily: 'Inter, sans-serif' }}>
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
        <div className="anim-fade-up" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 20, background: 'var(--primary-glow)', border: '1px solid var(--primary)', marginBottom: '1.25rem', opacity: 0.8 }}>
            <Key size={32} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)' }}>Operator Signup</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '0.25rem' }}>Join a station using an invitations code</p>
        </div>

        <form onSubmit={handleSignup} className="anim-fade-up anim-delay-1">
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04rem' }}>OPERATOR EMAIL</label>
            <input className="input-premium" type="email" required placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: '2rem' }}>
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

          <button className="btn-premium-gold" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text)' }} /> Creating...</> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>Sign Up <ArrowRight size={18} /></span>}
          </button>
        </form>

        <p className="anim-fade-up anim-delay-2" style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--text3)' }}>
          Already have an account?{' '}
          <NavLink to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign In</NavLink>
        </p>

        <div className="anim-fade-up anim-delay-3" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>
            Note: You will need a <strong style={{ color: 'var(--text2)' }}>Station Code</strong> from your administrator after signing in.
          </p>
        </div>
      </div>
    </div>
  );
}
