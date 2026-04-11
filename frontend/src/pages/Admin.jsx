import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Key, Mail, Phone, Copy, CheckCircle, Smartphone, KeyRound, Truck, Download, Shield, Activity, Fingerprint, Zap } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Admin({ companyId, userEmail }) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    async function fetchCompany() {
      if (!companyId) return;
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      
      if (!error) setCompany(data);
      setLoading(false);
    }
    fetchCompany();
  }, [companyId]);

  const copy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem' }}>
      <span className="spinner" style={{ width: 40, height: 40 }} />
      <span style={{ color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.05em' }}>QUERYING STATION PROFILE...</span>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header anim-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="gradient-text-gold">Station Configuration</h1>
          <p>Master control for weighbridge nodes and security protocols</p>
        </div>
        <Link to="/weighments" className="btn-premium-gold" style={{ width: 'auto', padding: '0.65rem 1.25rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <Activity size={16} /> Manage Weighments
        </Link>
      </div>

      <div style={{ maxWidth: '900px', display: 'grid', gap: '2rem' }}>
        
        {/* Company Node Info */}
        <div className="card-hover-glow anim-fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 28, padding: '2.5rem', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: 'var(--primary-glow)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(212,175,55,0.1)' }}>
              <Building2 size={32} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text)' }}>{company?.name || 'INITIALIZING NODE'}</h3>
              <p style={{ color: 'var(--text2)', fontSize: '0.9rem', fontWeight: 600 }}>Station Lead: {userEmail}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1.25rem', background: 'var(--bg2)', borderRadius: 18, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '6px', letterSpacing: '0.05em' }}>Node Status</div>
                  <div style={{ fontWeight: 800, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} /> OPERATIONAL
                  </div>
               </div>
               <div className="glow-dot" style={{ backgroundColor: 'var(--success)' }} />
            </div>
            <div style={{ padding: '1.25rem', background: 'var(--bg2)', borderRadius: 18, border: '1px solid var(--border)' }}>
               <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '6px', letterSpacing: '0.05em' }}>Commissioned At</div>
               <div style={{ fontWeight: 800, color: 'var(--text)' }}>{new Date(company?.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
        </div>

        {/* Security Twin-Card Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          
          {/* Join Code Card */}
          <div className="card-hover-glow anim-fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 28, padding: '2rem', animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, background: 'var(--bg2)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <Fingerprint size={22} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontWeight: 900, color: 'var(--text)', fontSize: '1.1rem' }}>Operator Invitation</h3>
                <p style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>Node Provisioning Credentials</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text3)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Invitation Cipher</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input className="input-premium" value={company?.join_code || '—'} readOnly style={{ flex: 1, fontFamily: 'monospace', fontWeight: 900, letterSpacing: '4px', textAlign: 'center' }} />
                <button className="btn-premium-gold" onClick={() => copy(company?.join_code, 'code')} style={{ width: 'auto', padding: '0 1.5rem' }}>
                  {copied === 'code' ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--primary-glow)', border: '1px dashed var(--border)', borderRadius: 16, fontSize: '0.75rem', color: 'var(--text3)', lineHeight: 1.6 }}>
               Operators must use this code during registration to link their terminals to this node. Keep this secure.
            </div>
          </div>

          {/* API Key Card */}
          <div className="card-hover-glow anim-fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 28, padding: '2rem', animationDelay: '0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, background: 'var(--bg2)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <KeyRound size={22} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontWeight: 900, color: 'var(--text)', fontSize: '1.1rem' }}>Edge Auth Key</h3>
                <p style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>Low-latency Hardware Uplink</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text3)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Encrypted Token</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input className="input-premium" value={company?.api_key || '—'} readOnly type="password" style={{ flex: 1, fontFamily: 'monospace', letterSpacing: '4px' }} />
                <button className="nav-item-premium" onClick={() => copy(company?.api_key, 'key')} style={{ width: 'auto', padding: '0 1.5rem', background: 'var(--bg2)', fontSize: '0.7rem' }}>
                  {copied === 'key' ? 'COPIED' : 'COPY KEY'}
                </button>
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--primary-glow)', border: '1px dashed var(--border)', borderRadius: 16, fontSize: '0.75rem', color: 'var(--text3)', lineHeight: 1.6, display: 'flex', gap: '0.75rem' }}>
               <Zap size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
               <span>Required for PC Agent v4.2 integration. Inject this secret into your <code>config.json</code> environment.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
