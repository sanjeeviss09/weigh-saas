import React, { useEffect, useState, useRef } from 'react';
import { Building2, PlusCircle, UserPlus, RefreshCw, X, Copy, CheckCircle, Scale, ShieldCheck, Database, LayoutDashboard, KeyRound, AlertTriangle, Truck, Zap, Activity, Globe, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const SUPER_ADMIN_EMAIL = 'sanjeevinick09@gmail.com';
const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function apiH(email) {
  return { 'x-admin-email': email, 'Content-Type': 'application/json' };
}

// ─── Animated Counter ───────────────────────────────────────────────────────
function AnimatedCounter({ value, duration = 1500, suffix = "" }) {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);
  useEffect(() => {
    let frameId;
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);
  return <span>{count.toLocaleString('en-IN')}{suffix}</span>;
}

// ─── Premium Stat Card ──────────────────────────────────────────────────────
function GlobalStat({ label, value, sub, icon, color, delay = 0, suffix = "" }) {
  return (
    <div className="stat-card-premium anim-fade-up" style={{ '--card-accent': `${color}11`, '--card-border': `${color}33`, animationDelay: `${delay}s` }}>
       <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
          <div style={{ background: `${color}11`, color: color, padding: '8px', borderRadius: '12px' }}>{icon}</div>
       </div>
       <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          <AnimatedCounter value={value} suffix={suffix} />
       </div>
       <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: '0.5rem', fontWeight: 500 }}>{sub}</div>
    </div>
  );
}

export default function AdminPortal({ userEmail }) {
  const [stats, setStats] = useState(null);
  const [weighbridges, setWeighbridges] = useState([]);
  const [allWeighments, setAllWeighments] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('join-codes');
  const [showAddBridge, setShowAddBridge] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCustomCode, setNewCustomCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const isAuthorized = userEmail?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase().trim();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, eRes, wRes] = await Promise.all([
        fetch(`${API}/super/stats`, { headers: apiH(userEmail) }),
        fetch(`${API}/super/companies`, { headers: apiH(userEmail) }),
        fetch(`${API}/super/errors`, { headers: apiH(userEmail) }),
        fetch(`${API}/super/all-weighments`, { headers: apiH(userEmail) }),
      ]);
      const [s, c, e, w] = await Promise.all([sRes.json(), cRes.json(), eRes.json(), wRes.json()]);
      setStats(s);
      setWeighbridges(c.data || []);
      setErrors(e.data || []);
      setAllWeighments(w.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthorized) fetchAllData(); }, [userEmail]);

  const handleCreateBridge = async () => {
    if (!newName.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/super/company/create`, {
        method: 'POST',
        headers: apiH(userEmail),
        body: JSON.stringify({ name: newName.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Uplink Failed');
      if (newCustomCode.trim() && data.data?.id) {
        await fetch(`${API}/super/company/${data.data.id}/join-code`, {
          method: 'POST',
          headers: apiH(userEmail),
          body: JSON.stringify({ join_code: newCustomCode.trim() })
        });
      }
      setShowAddBridge(false); setNewName(''); setNewCustomCode(''); fetchAllData();
    } catch (err) { alert(`Neural Error: ${err.message}`); }
    finally { setActionLoading(false); }
  };

  const handleUpdateJoinCode = async (cid, newCode) => {
    if (!newCode || newCode.length < 4) return;
    try {
      await fetch(`${API}/super/company/${cid}/join-code`, {
        method: 'POST',
        headers: apiH(userEmail),
        body: JSON.stringify({ join_code: newCode.toUpperCase() })
      });
      fetchAllData();
    } catch (err) { alert(err.message); }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  if (!isAuthorized) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div className="auth-card-premium anim-scale-in" style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="anim-pulse-glow" style={{ width: 100, height: 100, background: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
             <ShieldAlert size={50} color="#ef4444" />
          </div>
          <h1 className="gradient-text-gold" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Restricted Sector</h1>
          <p style={{ color: 'var(--text2)', fontSize: '1.1rem' }}>Unauthorized access detected. Protocol Lock active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Header Area */}
      <div className="page-header anim-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(1.5rem, 4vw, 3rem)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h1 className="gradient-text-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'clamp(1.5rem, 6vw, 2.5rem)' }}>
            <Globe size={window.innerWidth < 768 ? 24 : 40} color="var(--primary)" className="anim-pulse-glow" /> Command Central
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 'clamp(0.8rem, 2vw, 1.1rem)' }}>Global Orchestration Ledger • System Authorized</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', width: window.innerWidth < 768 ? '100%' : 'auto' }}>
          <button className="nav-item-premium" style={{ flex: 1, padding: '0.75rem', background: 'var(--surface2)', borderRadius: 14, border: '1px solid var(--border)', display : 'flex' , justifyContent: 'center' }} onClick={fetchAllData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
          <button className="btn-premium-gold" onClick={() => setShowAddBridge(true)} style={{ flex: 3, padding: '0.75rem', borderRadius: 14, fontSize: '0.85rem' }}>
            <PlusCircle size={18} /> PROVISION NODE
          </button>
        </div>
      </div>

      {/* Global Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 45%, 260px), 1fr))', gap: 'clamp(0.75rem, 3vw, 1.5rem)', marginBottom: 'clamp(1.5rem, 5vw, 3rem)' }}>
        <GlobalStat label="Global Nodes" value={stats?.total_companies ?? 0} sub="Managed Stations" color="#3b82f6" icon={<Activity size={20} />} delay={0.1} />
        <GlobalStat label="Cloud Packets" value={stats?.total_transactions ?? 0} sub="Total Transactions" color="#d4af37" icon={<Truck size={20} />} delay={0.2} />
        <GlobalStat label="Net Tonnage" value={Math.floor((stats?.total_net_weight ?? 0) / 1000)} suffix="t" sub="Total Throughput" color="#22c55e" icon={<Scale size={20} />} delay={0.3} />
        <GlobalStat label="System Warnings" value={stats?.total_errors ?? 0} sub="Global Anomalies" color="#ef4444" icon={<AlertTriangle size={20} />} delay={0.4} />
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem', 
        padding: '0.4rem', 
        background: 'var(--surface2)', 
        borderRadius: 20, 
        border: '1px solid var(--border)', 
        width: '100%',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        WebkitOverflowScrolling: 'touch'
      }}>
        {[
          { id: 'join-codes', label: 'Provisioning', icon: <KeyRound size={16} /> },
          { id: 'companies', label: 'Nodes', icon: <Building2 size={16} /> },
          { id: 'monitor', label: 'Stream', icon: <Activity size={16} /> },
          { id: 'logs', label: 'Diagnostics', icon: <Database size={16} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.25rem',
              color: activeTab === t.id ? '#000' : 'var(--text3)',
              background: activeTab === t.id ? 'var(--primary)' : 'transparent',
              border: 'none', borderRadius: 14,
              fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s',
              flexShrink: 0
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: '8rem 0', textAlign: 'center' }}>
          <span className="spinner" style={{ width: 44, height: 44, color: 'var(--primary)' }} />
          <p style={{ marginTop: '1.5rem', color: 'var(--text3)', letterSpacing: '0.1em', fontSize: '0.8rem' }}>QUERYING GLOBAL GRID...</p>
        </div>
      ) : (
        <div style={{ animation: 'fadeSlideUp 0.4s ease both' }}>
          
          {/* JOIN CODES TAB */}
          {activeTab === 'join-codes' && (
            <div className="table-wrap">
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', minWidth: '800px' }}>
                <thead style={{ background: 'var(--surface2)' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Target Node</th>
                    <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Provisioning Key</th>
                    <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Link Status</th>
                    <th style={{ textAlign: 'right', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Control</th>
                  </tr>
                </thead>
                <tbody>
                  {weighbridges.map((c, i) => (
                    <tr key={c.id} className="table-row-premium" style={{ animationDelay: `${i * 0.05}s` }}>
                      <td style={{ padding: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>{c.name}</td>
                      <td style={{ padding: '1.25rem' }}>
                        <code style={{ fontSize: '1.1rem', color: 'var(--primary)', letterSpacing: '3px', fontWeight: 900, background: 'var(--surface2)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>{c.join_code}</code>
                      </td>
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                           <div className="glow-dot" style={{ backgroundColor: '#22c55e' }} />
                           <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#22c55e', textTransform: 'uppercase' }}>UPLINK HEALTHY</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                          <button className="nav-item-premium" style={{ width: 'auto', padding: '0.5rem', background: 'var(--surface2)', border: '1px solid var(--border)' }} onClick={() => handleCopy(c.join_code, c.id)}>
                            {copied === c.id ? <CheckCircle size={16} color="#22c55e" /> : <Copy size={16} />}
                          </button>
                          <button className="nav-item-premium" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 800 }} onClick={() => {
                            const nc = prompt("Re-provision Join Code for " + c.name, c.join_code);
                            if (nc) handleUpdateJoinCode(c.id, nc);
                          }}>RE-WRITE</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* MONITOR TAB */}
          {activeTab === 'monitor' && (
            <div className="table-wrap">
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', minWidth: '900px' }}>
                <thead style={{ background: 'var(--surface2)' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Node Source</th>
                    <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Vehicle ID</th>
                    <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Payload</th>
                    <th style={{ textAlign: 'right', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Mass (kg)</th>
                    <th style={{ textAlign: 'center', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Sync</th>
                    <th style={{ textAlign: 'right', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Network Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {allWeighments.map((w, i) => (
                    <tr key={i} className="table-row-premium" style={{ animationDelay: `${i * 0.05}s` }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{w.companies?.name}</td>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text)' }}>{w.vehicle_number}</td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text2)' }}>{w.material || 'GENERIC'}</td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 900, color: '#22c55e' }}>{w.net_weight?.toLocaleString() || '—'}</td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.6rem', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase' }}>{w.status}</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: 'var(--text3)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {new Date(w.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* WEIGHBRIDGE DIRECTORY */}
          {activeTab === 'companies' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 100%, 420px), 1fr))', gap: '1.5rem' }}>
              {weighbridges.map((c, i) => (
                <div key={c.id} className="card-hover-glow anim-fade-up" style={{ padding: '0', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 28, animationDelay: `${i * 0.1}s` }}>
                  <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ background: 'rgba(212,175,55,0.1)', padding: '10px', borderRadius: '12px' }}>
                         <Building2 size={24} color="var(--primary)" />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 900, color: 'var(--text)', fontSize: '1.25rem' }}>{c.name}</h4>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 800, letterSpacing: '0.05em' }}>HEX_ID: {c.id.substring(0,16).toUpperCase()}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Terminal Auth Key</label>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input className="input-premium" type="password" value={c.api_key} readOnly style={{ flex: 1, fontFamily: 'monospace', letterSpacing: '4px' }} />
                        <button className="nav-item-premium" style={{ width: 'auto', padding: '0.75rem', background: 'var(--surface2)', border: '1px solid var(--border)' }} onClick={() => handleCopy(c.api_key, c.id + '_api')}><Copy size={16} /></button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 600 }}>Provisioned: {new Date(c.created_at).toLocaleDateString()}</div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                         <button className="nav-item-premium" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 800, background: 'var(--surface2)', border: '1px solid var(--border)' }}>ASSETS</button>
                         <button className="nav-item-premium" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 800, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>PURGE</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DIAGNOSTICS TAB */}
          {activeTab === 'logs' && (
            <div className="card-hover-glow" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '2rem' }}>
              {errors.length === 0 ? (
                <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
                  <div className="anim-pulse-glow" style={{ width: 100, height: 100, background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                    <ShieldCheck size={50} color="#22c55e" />
                  </div>
                  <h3 style={{ fontWeight: 900, color: 'var(--text)', fontSize: '1.5rem' }}>Core Data Integrity Locked</h3>
                  <p style={{ color: 'var(--text3)', fontSize: '1rem' }}>No platform-wide anomalies detected in the current session.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                   {errors.map((e, index) => (
                     <div key={index} style={{ padding: '1.5rem', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 20, display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '12px' }}>
                           <AlertTriangle size={24} color="#ef4444" />
                        </div>
                        <div style={{ flex: 1 }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <strong style={{ color: '#fca5a5', fontWeight: 900, fontSize: '1rem' }}>{e.file_name}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 700 }}>{new Date(e.created_at).toLocaleString()}</span>
                           </div>
                           <div style={{ fontSize: '0.9rem', color: 'var(--text2)', lineHeight: 1.5 }}>{e.error_message}</div>
                        </div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: PROVISION STATION */}
      {showAddBridge && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,6,13,0.95)', backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(0rem, 2vw, 1rem)' }}>
          <div className="auth-card-premium anim-scale-in" style={{ 
            maxWidth: '600px', 
            width: '100%', 
            padding: 'clamp(1.5rem, 8vw, 3rem)',
            height: window.innerWidth < 768 ? '100%' : 'auto',
            borderRadius: window.innerWidth < 768 ? 0 : 24,
            overflowY: 'auto'
          }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                   <h2 style={{ fontWeight: 900, fontSize: '1.75rem', color: 'var(--text)' }}>Deploy Global Node</h2>
                   <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Initialize a new weighbridge entity on the LogiCrate fabric.</p>
                </div>
                <button className="nav-item-premium" style={{ width: 'auto', padding: '0.6rem', background: 'var(--surface2)', border: '1px solid var(--border)' }} onClick={() => setShowAddBridge(false)}><X size={24} /></button>
             </div>
             
             <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Station Name-space *</label>
                <div style={{ position: 'relative' }}>
                   <Building2 size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.5 }} />
                   <input className="input-premium" style={{ width: '100%', paddingLeft: '3.5rem', boxSizing: 'border-box', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }} placeholder="e.g. TERMINAL_ALPHA" value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
             </div>

             <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Custom Sync Cipher (Optional)</label>
                <div style={{ position: 'relative' }}>
                   <KeyRound size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.5 }} />
                   <input className="input-premium" style={{ width: '100%', paddingLeft: '3.5rem', fontFamily: 'monospace', letterSpacing: '4px', boxSizing: 'border-box', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }} placeholder="CUSTOM_CODE" value={newCustomCode} onChange={e => setNewCustomCode(e.target.value.toUpperCase())} />
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text3)', opacity: 0.6, marginTop: '0.6rem', fontWeight: 600 }}>Algorithm will auto-generate a secure cipher if null.</p>
             </div>

             <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-premium-gold" onClick={handleCreateBridge} disabled={actionLoading || !newName.trim()}>
                   {actionLoading ? <><span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#000' }} /> PROVISIONING...</> : 'INITIATE DEPLOYMENT'}
                </button>
                <button className="nav-item-premium" style={{ width: 'auto', padding: '0 2rem', background: 'var(--surface2)', border: '1px solid var(--border)' }} onClick={() => setShowAddBridge(false)}>CANCEL</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
