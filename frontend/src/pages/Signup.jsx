import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Building2, Eye, EyeOff, ArrowRight, CheckCircle, Users, Phone, Mail, Send, Info, AlertTriangle } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const PLANS = [
  {
    id: 'standard',
    name: 'Standard',
    price: '₹1,200',
    period: '/month',
    desc: 'Perfect for single weighbridge stations',
    features: ['Up to 15 connected companies', 'Automatic PDF data capture', 'Real-time cloud sync', 'Invoice generation', 'Email support'],
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '₹2,000',
    period: '/month',
    desc: 'For large stations managing multiple companies',
    features: ['Up to 50 connected companies', 'Advanced analytics dashboard', 'Full invoice automation', 'E-Way bill verification', 'Multi-user role management', 'Priority support'],
    popular: true,
  },
];

const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
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

// ─── COMPANY SIGNUP ────────────────────────────────────────────────────────────
function CompanySignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = details, 2 = choose plan
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (!companyName.trim()) return setError('Company name is required.');
    setError('');
    setStep(2);
  };

  const handleRegister = async () => {
    setLoading(true); setError('');
    try {
      // Create company in backend first
      const res = await fetch(`${API}/company/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyName.trim(), plan: selectedPlan }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to create company.');
      }
      const company = await res.json();

      // Create Supabase auth account
      const { error: authErr } = await supabase.auth.signUp({
        email, password,
        options: {
          data: {
            role: 'company',
            company_id: company.company_id,
            company_name: company.company_name,
            plan: selectedPlan,
          }
        }
      });
      if (authErr) throw authErr;

      setMessage(`Account created! Your join code is: ${company.join_code} — Check your email to confirm, then log in.`);
      setTimeout(() => navigate('/login'), 7000);
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
          redirectTo: `${window.location.origin}/complete-profile?plan=${selectedPlan}`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        }
      });
      if (error) setError(`Google Error: ${error.message}`);
    } catch (err) {
      setError('Unexpected error during Google Sign-Up.');
    }
  };

  return (
    <div className="auth-card-premium anim-scale-in" style={{ margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(1.25rem, 4vw, 2rem)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 18, background: 'var(--primary-glow)', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '1rem' }}>
          <Building2 size={28} color="var(--primary)" />
        </div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text)' }}>Register Company</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text3)', marginTop: '0.4rem' }}>
          {step === 1 ? 'Create your weighbridge company account' : 'Choose your plan to get started'}
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
        {['Details', 'Choose Plan'].map((s, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, background: i < step ? 'var(--primary)' : i === step - 1 ? 'var(--primary)' : 'var(--surface2)', color: i <= step - 1 ? '#000' : 'var(--text3)', border: `2px solid ${i <= step - 1 ? 'var(--primary)' : 'var(--border)'}`, transition: 'all 0.3s' }}>
              {i < step - 1 ? <CheckCircle size={14} /> : i + 1}
            </div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: i === step - 1 ? 'var(--primary)' : 'var(--text3)' }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 1 && (
        <form onSubmit={handleDetailsSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>COMPANY NAME</label>
            <input className="input-premium" type="text" required placeholder="e.g. Sri Kadai Eswara Weighing"
              value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>EMAIL ADDRESS</label>
            <input className="input-premium" type="email" required placeholder="admin@yourcompany.com"
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
          <button className="btn-premium-gold" type="submit">
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>Continue <ArrowRight size={18} /></span>
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
      )}

      {/* Step 2: Choose Plan */}
      {step === 2 && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {PLANS.map(plan => (
              <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                style={{ padding: '1.25rem', border: `2px solid ${selectedPlan === plan.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 16, cursor: 'pointer', background: selectedPlan === plan.id ? 'rgba(212,175,55,0.06)' : 'var(--surface)', transition: 'all 0.2s', position: 'relative' }}>
                {plan.popular && <div style={{ position: 'absolute', top: '-10px', right: '1rem', background: 'var(--primary)', color: '#000', fontSize: '0.6rem', fontWeight: 900, padding: '2px 10px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Most Popular</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text)' }}>{plan.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{plan.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{plan.price}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{plan.period}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {plan.features.slice(0, 3).map(f => (
                    <span key={f} style={{ fontSize: '0.68rem', color: 'var(--text2)', background: 'var(--bg2)', padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border)' }}>✓ {f}</span>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ padding: '0.85rem 1rem', background: 'rgba(212,175,55,0.04)', border: '1px dashed rgba(212,175,55,0.25)', borderRadius: 12, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <Info size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', lineHeight: 1.5 }}>
                Plans can be changed later. If you qualify for a special arrangement, contact us after signing up and our team will enable it for your account.
              </div>
            </div>
          </div>

          {error && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.82rem', fontWeight: 600 }}>{error}</div>}
          {message && <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', color: 'var(--success)', fontSize: '0.82rem', fontWeight: 600 }}>{message}</div>}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setStep(1)} style={{ flex: '0 0 auto', padding: '0.85rem 1.25rem', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
              ← Back
            </button>
            <button className="btn-premium-gold" onClick={handleRegister} disabled={loading} style={{ flex: 1 }}>
              {loading ? <span className="spinner" /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>Create Account <ArrowRight size={18} /></span>}
            </button>
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text3)' }}>
        Already have an account?{' '}
        <NavLink to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign In</NavLink>
      </p>
    </div>
  );
}

// ─── OPERATOR SIGNUP ──────────────────────────────────────────────────────────
function OperatorSignup() {
  const navigate = useNavigate();
  const [subTab, setSubTab] = useState('join'); // 'join' | 'request'
  const [joinCode, setJoinCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Request code form
  const [reqName, setReqName] = useState('');
  const [reqContact, setReqContact] = useState(''); // email or phone
  const [reqMessage, setReqMessage] = useState('');
  const [reqLoading, setReqLoading] = useState(false);
  const [reqSent, setReqSent] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (!joinCode.trim()) throw new Error('Join code is required.');
      const valRes = await fetch(`${API}/validate-join-code?code=${encodeURIComponent(joinCode.trim())}`);
      if (!valRes.ok) {
        const err = await valRes.json().catch(() => ({}));
        throw new Error(err.detail || 'Invalid join code.');
      }
      const valData = await valRes.json();

      const { error: authErr } = await supabase.auth.signUp({
        email, password,
        options: {
          data: {
            role: 'operator',
            company_id: valData.company_id,
            company_name: valData.company_name,
          }
        }
      });
      if (authErr) throw authErr;
      setMessage(`Joined ${valData.company_name} successfully! Check your email to confirm, then log in.`);
      setTimeout(() => navigate('/login'), 6000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!reqName.trim() || !reqContact.trim()) return setError('Please fill in your name and contact details.');
    setReqLoading(true); setError('');
    try {
      const res = await fetch(`${API}/operator-code-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reqName.trim(), contact: reqContact.trim(), message: reqMessage.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to send request.');
      }
      setReqSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setReqLoading(false);
    }
  };

  return (
    <div className="auth-card-premium anim-scale-in" style={{ margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(1.25rem, 4vw, 2rem)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 18, background: 'var(--primary-glow)', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '1rem' }}>
          <Users size={28} color="var(--primary)" />
        </div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text)' }}>Join as Weighment Operator</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text3)', marginTop: '0.4rem' }}>Enter your join code to link to your company</p>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg2)', padding: '4px', borderRadius: 12, border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        {[['join', 'I have a join code'], ['request', 'Request a join code']].map(([key, label]) => (
          <button key={key} type="button" onClick={() => { setSubTab(key); setError(''); }}
            style={{ flex: 1, padding: '0.55rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.2s', background: subTab === key ? 'var(--primary)' : 'transparent', color: subTab === key ? '#000' : 'var(--text2)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Join with Code */}
      {subTab === 'join' && (
        <form onSubmit={handleJoin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>JOIN CODE</label>
            <input className="input-premium" type="text" required placeholder="E.G. JOIN-XYZ123"
              value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
              style={{ width: '100%', textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '2px' }} />
            <div style={{ marginTop: '0.5rem', fontSize: '0.73rem', color: 'var(--text3)' }}>Don't have a code? Switch to "Request a join code" above.</div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>YOUR EMAIL</label>
            <input className="input-premium" type="email" required placeholder="operator@email.com"
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
          {message && <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', color: 'var(--success)', fontSize: '0.82rem', fontWeight: 600 }}>{message}</div>}
          <button className="btn-premium-gold" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>Join Company <ArrowRight size={18} /></span>}
          </button>
        </form>
      )}

      {/* Request a Code */}
      {subTab === 'request' && (
        reqSent ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Request Sent!</div>
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              Your request has been sent to your station administrator. Once approved, you will receive a join code at the contact you provided. Then come back here to sign up.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRequestCode}>
            <div style={{ padding: '0.85rem 1rem', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <Info size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--text2)', lineHeight: 1.6 }}>
                Fill in your details below. Your station manager will receive your request and send you a join code via your email or phone.
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>YOUR FULL NAME</label>
              <input className="input-premium" type="text" required placeholder="e.g. Murugan K"
                value={reqName} onChange={e => setReqName(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>EMAIL OR PHONE NUMBER</label>
              <input className="input-premium" type="text" required placeholder="email@example.com or 9876543210"
                value={reqContact} onChange={e => setReqContact(e.target.value)} style={{ width: '100%' }} />
              <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '0.4rem' }}>The join code will be sent to this contact.</div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>MESSAGE (optional)</label>
              <textarea className="input-premium" placeholder="Add any details for the administrator..."
                value={reqMessage} onChange={e => setReqMessage(e.target.value)}
                rows={2} style={{ width: '100%', resize: 'vertical', minHeight: 60 }} />
            </div>

            {error && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.82rem', fontWeight: 600 }}>{error}</div>}

            <button className="btn-premium-gold" type="submit" disabled={reqLoading}>
              {reqLoading ? <span className="spinner" /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Send size={16} /> Send Request</span>}
            </button>
          </form>
        )
      )}

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text3)' }}>
        Already have an account?{' '}
        <NavLink to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign In</NavLink>
      </p>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function Signup() {
  const location = useLocation();
  const queryMode = new URLSearchParams(location.search).get('mode');
  const [mode, setMode] = useState(queryMode === 'operator' ? 'operator' : 'company');

  return (
    <div className="auth-page-premium" style={{ fontFamily: 'Inter, sans-serif', paddingTop: 'clamp(3rem, 10vh, 5rem)', paddingBottom: '2rem' }}>
      {PARTICLES.map(p => (
        <div key={p.id} style={{ position: 'absolute', borderRadius: '50%', left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: 'var(--primary)', opacity: p.opacity, animation: `particle-drift ${p.duration}s ease-in-out ${p.delay}s infinite alternate`, pointerEvents: 'none' }} />
      ))}

      {/* Top role toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '5px', borderRadius: 14, border: '1px solid var(--border)', marginBottom: '1.5rem', width: 'fit-content', zIndex: 1, position: 'relative' }}>
        {[['company', '🏢 Company'], ['operator', '👷 Weighment Operator']].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setMode(key)}
            style={{ padding: '0.55rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s', background: mode === key ? 'var(--primary)' : 'transparent', color: mode === key ? '#000' : 'var(--text2)' }}>
            {label}
          </button>
        ))}
      </div>

      {mode === 'company' ? <CompanySignup /> : <OperatorSignup />}
    </div>
  );
}
