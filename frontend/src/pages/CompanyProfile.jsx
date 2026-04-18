import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Building2, ArrowRight, User, Phone, CheckCircle, Scale } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function CompanyProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryMode = new URLSearchParams(location.search).get('mode');

  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  
  const [role, setRole] = useState(queryMode || 'client_company');

  // Fetch session to check metadata if URL didn't have it
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) setUserName(user.user_metadata.full_name);
      if (user?.user_metadata?.role && !queryMode) setRole(user.user_metadata.role);
    });
  }, [queryMode]);

  const isClient = role === 'client_company';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return setError(isClient ? 'Company name is required.' : 'Station name is required.');
    setLoading(true); setError('');

    try {
      // Generate a local company ID as fallback if backend is down
      const localCompanyId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let finalCompanyId = localCompanyId;
      let finalCompanyName = companyName.trim();

      // Try to register with backend (best-effort, non-blocking)
      try {
        const res = await fetch(`${API}/company/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: companyName.trim(), phone: phone.trim(), plan: 'free' }),
        });
        if (res.ok) {
          const company = await res.json();
          finalCompanyId = company.company_id;
          finalCompanyName = company.company_name || companyName.trim();
        }
      } catch (backendErr) {
        console.warn('Backend offline, using local company ID:', backendErr.message);
        // Continue with local ID — backend can be synced later
      }

      // Always update Supabase user metadata (primary source of truth)
      const { error: updateErr } = await supabase.auth.updateUser({
        data: {
          role: role,
          company_id: finalCompanyId,
          company_name: finalCompanyName,
          display_name: userName.trim(),
          phone: phone.trim(),
          plan: isClient ? 'free' : undefined,
          profile_completed: true
        }
      });
      if (updateErr) throw updateErr;

      setDone(true);
      const nextRoute = isClient ? '/' : '/pricing';
      setTimeout(() => navigate(nextRoute), 2500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
          <h1 style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.75rem' }}>Profile Synced!</h1>
          <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: '0.9rem' }}>
            {isClient ? "Your company gateway is ready. Jumping to Dashboard..." : "Station initialized. Redirecting to License Plans..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-premium" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <div className="card-luxury anim-scale-in" style={{ 
        margin: '0 auto', 
        maxWidth: 540, 
        width: '100%', 
        padding: 'clamp(2.5rem, 8vw, 4rem)',
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
            marginBottom: '1.5rem',
          }}>
            {isClient ? <Building2 size={32} color="var(--primary)" /> : <Scale size={32} color="var(--primary)" />}
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>{isClient ? 'Company Details' : 'Station Profile'}</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 900, letterSpacing: '0.2rem', textTransform: 'uppercase', opacity: 0.9 }}>{isClient ? 'Initialize Supply Chain Node' : 'Initialize Station Metadata'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              <Building2 size={12} style={{ display: 'inline', marginRight: 4 }} />{isClient ? 'COMPANY NAME' : 'STATION NAME'}
            </label>
            <input className="input-premium" type="text" required placeholder={isClient ? "e.g. L&T Logistics" : "e.g. Sri Kadai Eswara Weighing"}
              value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              <User size={12} style={{ display: 'inline', marginRight: 4 }} />YOUR NAME
            </label>
            <input className="input-premium" type="text" required placeholder="Full name of administrator"
              value={userName} onChange={e => setUserName(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              <Phone size={12} style={{ display: 'inline', marginRight: 4 }} />PHONE NUMBER
            </label>
            <input className="input-premium" type="tel" placeholder="e.g. 9876543210" required
              value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%' }} />
          </div>

          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.82rem', fontWeight: 600 }}>{error}</div>
          )}

          <button className="btn-premium-gold" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Save & Continue <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
