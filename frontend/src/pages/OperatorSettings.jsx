import React, { useState, useEffect } from 'react';
import { User, Shield, Moon, Sun, Monitor, Key, Copy, CheckCircle, Bell, BellOff, ExternalLink, Activity, Fingerprint, Zap, Lock, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabaseClient';

export default function OperatorSettings({ companyId, userEmail }) {
  const { theme, setTheme } = useTheme();
  const [company, setCompany] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    async function fetchCompany() {
      if (!companyId) return;
      const { data } = await supabase.from('companies').select('*').eq('id', companyId).single();
      if (data) setCompany(data);
    }
    fetchCompany();
  }, [companyId]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-content">
      <div className="page-header anim-fade-up">
        <h1 className="gradient-text-gold" style={{ color: 'var(--text)' }}>Command Center Settings</h1>
        <p>Configure your terminal environment and station security protocols</p>
      </div>

      <div style={{ maxWidth: '900px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
        
        {/* Profile Card */}
        <div className="card-luxury anim-fade-up" style={{ padding: '2rem', animationDelay: '0.1s' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', marginBottom:'2rem' }}>
            <div style={{ padding:'12px', background:'var(--primary-glow)', borderRadius:'16px', border:'1px solid var(--border)' }}>
              <Fingerprint size={28} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontWeight: 900, color: 'var(--text)', fontSize: '1.2rem' }}>Identity Profile</h3>
              <p style={{ fontSize:'0.85rem', color: 'var(--text2)', fontWeight: 600 }}>Digital Signature: {userEmail}</p>
            </div>
          </div>
          
          <div style={{ display:'grid', gap:'1rem' }}>
            <div style={{ padding:'1.25rem', background:'var(--surface2)', borderRadius: 18, border:'1px solid var(--border)' }}>
              <div style={{ fontSize:'0.65rem', color: 'var(--text3)', textTransform:'uppercase', fontWeight: 800, marginBottom:'6px', letterSpacing: '0.05em' }}>Assigned Station</div>
              <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>{company?.name || 'INITIALIZING...'}</div>
            </div>
            <div style={{ padding:'1.25rem', background:'var(--surface2)', borderRadius: 18, border:'1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <div style={{ fontSize:'0.65rem', color: 'var(--text3)', textTransform:'uppercase', fontWeight: 800, marginBottom:'4px', letterSpacing: '0.05em' }}>Security Clearance</div>
                  <div style={{ fontWeight: 800, color: '#22c55e', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={14} /> LEVEL 1 - VERIFIED
                  </div>
               </div>
               <div className="glow-dot" />
            </div>
          </div>
        </div>

        {/* System Appearance */}
        <div className="card-luxury anim-fade-up" style={{ padding: '2rem', animationDelay: '0.2s' }}>
          <h3 style={{ fontWeight: 900, marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.75rem', color: 'var(--text)' }}>
            <Monitor size={22} color="var(--primary)" /> Environment
          </h3>
          <p style={{ fontSize:'0.85rem', color: 'var(--text2)', marginBottom:'2rem', lineHeight: '1.6' }}>Switch between visualization modes for optimal operational clarity.</p>
          
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'0.75rem' }}>
            {[
              { id: 'light', icon: <Sun size={18} />, label: 'Light' },
              { id: 'dark', icon: <Moon size={18} />, label: 'Dark' },
              { id: 'system', icon: <Activity size={18} />, label: 'Auto' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setTheme(item.id)}
                className="nav-item-premium"
                style={{ 
                  flexDirection:'column', gap:'0.5rem', height: '100px', justifyContent: 'center',
                  background: theme === item.id ? 'var(--primary)' : 'var(--surface2)',
                  color: theme === item.id ? '#000' : 'var(--text3)',
                  border: theme === item.id ? 'none' : '1px solid var(--border)',
                  fontWeight: 800
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* API Lockbox */}
        <div className="card-luxury anim-fade-up" style={{ padding: '2rem', gridColumn: '1 / -1', animationDelay: '0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
             <div>
                <h3 style={{ fontWeight: 900, marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.75rem', color: 'var(--text)' }}>
                   <Lock size={22} color="var(--primary)" /> API Encryption Key
                </h3>
                <p style={{ fontSize:'0.85rem', color: 'var(--text2)' }}>Authorize the PC Agent Node to sync local hardware data to the cloud.</p>
             </div>
             <div style={{ padding: '0.5rem 1rem', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, color: 'var(--primary)', fontWeight: 800, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={14} /> SECURITY: AES-256
             </div>
          </div>
          
          <div style={{ position: 'relative', display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
               <input 
                  className="input-premium" 
                  type={showApiKey ? 'text' : 'password'} 
                  readOnly 
                  value={company?.api_key || ''} 
                  style={{ width: '100%', fontFamily:'monospace', fontWeight: 900, letterSpacing: '4px', paddingRight: '3rem', boxSizing: 'border-box', background: 'var(--bg)', color: 'var(--text)' }} 
               />
               <button onClick={() => setShowApiKey(!showApiKey)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
               </button>
            </div>
            <button 
              className="btn-premium-gold" 
              onClick={() => copyToClipboard(company?.api_key)}
              style={{ width:'140px', padding: '0.85rem' }}
            >
              {copied ? 'KEY COPIED' : 'COPY ACCESS KEY'}
            </button>
          </div>
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface2)', borderRadius: 16, border: '1px dashed var(--border2)', fontSize: '0.8rem', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <Key size={16} color="var(--primary)" />
             <span>Paste this key into your local <code style={{ color: 'var(--primary)', fontWeight: 800 }}>config.json</code> to authorize the node uplink.</span>
          </div>
        </div>

        {/* Global Alarms */}
        <div className="card-luxury anim-fade-up" style={{ padding: '2rem', gridColumn: '1 / -1', animationDelay: '0.4s' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: notifications ? 'var(--success-bg)' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {notifications ? <Bell size={24} color="var(--success)" /> : <BellOff size={24} color="var(--text3)" />}
                </div>
               <div>
                 <h3 style={{ fontWeight: 900, color: 'var(--text)', fontSize: '1.1rem' }}>Node Proximity Alarms</h3>
                 <p style={{ fontSize:'0.85rem', color: 'var(--text2)', marginTop:'0.2rem' }}>Recieve audio/visual triggers for successful cloud-sync events.</p>
               </div>
            </div>
            <div 
               onClick={() => setNotifications(!notifications)}
               className="nav-item-premium"
               style={{ 
                  width: '140px', background: notifications ? '#22c55e' : 'var(--surface2)',
                  color: notifications ? '#000' : 'var(--text2)',
                  border: 'none', justifyContent: 'center', cursor: 'pointer', height: '48px', fontWeight: 900
               }}
            >
              {notifications ? 'ACTIVE' : 'MUTED'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
