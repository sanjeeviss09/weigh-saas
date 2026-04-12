import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Building2, ArrowRight, User, Phone, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function CompanyProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = new URLSearchParams(location.search).get('plan') || 'standard';

  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Pre-fill name from Google account if available
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) setUserName(user.user_metadata.full_name);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return setError('Company name is required.');
    setLoading(true); setError('');

    try {
      // Create company on backend
      const res = await fetch(`${API}/company/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyName.trim(), plan }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to create company.');
      }
      const company = await res.json();

      // Update Supabase user metadata
      const { error: updateErr } = await supabase.auth.updateUser({
        data: {
          role: 'company',
          company_id: company.company_id,
          company_name: company.company_name,
          display_name: userName.trim(),
          phone: phone.trim(),
          plan,
        }
      });
      if (updateErr) throw updateErr;

      setDone(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
          <h1 style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.75rem' }}>You're all set!</h1>
          <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: '0.9rem' }}>Your company account has been created. Taking you to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <div className="auth-card-premium" style={{ margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 18, background: 'var(--primary-glow)', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '1rem' }}>
            <Building2 size={28} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)' }}>Complete Your Profile</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text3)', marginTop: '0.4rem' }}>Tell us about your company to finish setup</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              <Building2 size={12} style={{ display: 'inline', marginRight: 4 }} />COMPANY NAME
            </label>
            <input className="input-premium" type="text" required placeholder="e.g. Sri Kadai Eswara Weighing"
              value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              <User size={12} style={{ display: 'inline', marginRight: 4 }} />YOUR NAME
            </label>
            <input className="input-premium" type="text" required placeholder="Full name"
              value={userName} onChange={e => setUserName(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              <Phone size={12} style={{ display: 'inline', marginRight: 4 }} />PHONE NUMBER
            </label>
            <input className="input-premium" type="tel" placeholder="e.g. 9876543210"
              value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%' }} />
            <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: '0.3rem' }}>Optional but recommended for account recovery</div>
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
