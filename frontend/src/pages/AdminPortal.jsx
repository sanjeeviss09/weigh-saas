import React, { useEffect, useState, useRef } from 'react';
import { Building2, PlusCircle, RefreshCw, X, Copy, CheckCircle, Scale, ShieldCheck, Database, KeyRound, AlertTriangle, Truck, Activity, Globe, ShieldAlert, CreditCard, Crown, Zap, Trash2, Cpu } from 'lucide-react';
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

const PLAN_CONFIG = {
  free:       { label: 'Automation', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: <Zap size={14} /> },
  pro:        { label: 'Control',    color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: <Activity size={14} /> },
  enterprise: { label: 'Intelligence', color: '#d4af37', bg: 'rgba(212,175,55,0.1)', icon: <Crown size={14} /> },
};

function PlanBadge({ plan }) {
  const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 8, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default function AdminPortal({ userEmail }) {
  const [stats, setStats] = useState(null);
  const [stations, setStations] = useState([]);
  const [allWeighments, setAllWeighments] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [showAddStation, setShowAddStation] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCustomCode, setNewCustomCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [planUpdating, setPlanUpdating] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [healerStatus, setHealerStatus] = useState({ active: false, status: 'Initializing...', interventions: 0 });
  const [healerHistory, setHealerHistory] = useState('');

  const isAuthorized = userEmail?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase().trim();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, eRes, wRes] = await Promise.all([
        fetch(`${API}/super/stats`,          { headers: apiH(userEmail) }),
        fetch(`${API}/super/companies`,      { headers: apiH(userEmail) }),
        fetch(`${API}/super/errors`,         { headers: apiH(userEmail) }),
        fetch(`${API}/super/all-weighments`, { headers: apiH(userEmail) }),
      ]);
      const [s, c, e, w] = await Promise.all([sRes.json(), cRes.json(), eRes.json(), wRes.json()]);
      setStats(s);
      setStations(c.data || []);
      setErrors(e.data || []);
      setAllWeighments(w.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    if (isAuthorized) {
      fetchAllData();
      fetchHealerStatus();
      const interval = setInterval(fetchHealerStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [userEmail]);

  const fetchHealerStatus = async () => {
    try {
      const res = await fetch(`${API}/healer/status`);
      const data = await res.json();
      setHealerStatus(data);
      
      const hRes = await fetch(`${API}/healer/history`);
      const hData = await hRes.json();
      setHealerHistory(hData.history || '');
    } catch (err) { /* silent */ }
  };

  const handleCreateStation = async () => {
    if (!newName.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/super/company/create`, {
        method: 'POST',
        headers: apiH(userEmail),
        body: JSON.stringify({ name: newName.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to create');
      if (newCustomCode.trim() && data.data?.id) {
        await fetch(`${API}/super/company/${data.data.id}/join-code`, {
          method: 'POST',
          headers: apiH(userEmail),
          body: JSON.stringify({ join_code: newCustomCode.trim() })
        });
      }
      setShowAddStation(false); setNewName(''); setNewCustomCode('');
      fetchAllData();
    } catch (err) { alert(`Error: ${err.message}`); }
    finally { setActionLoading(false); }
  };

  const handleOverridePlan = async (stationId, newPlan) => {
    setPlanUpdating(stationId);
    try {
      await fetch(`${API}/super/company/${stationId}/plan`, {
        method: 'POST',
        headers: apiH(userEmail),
        body: JSON.stringify({ plan: newPlan })
      });
      setStations(prev => prev.map(s => s.id === stationId ? { ...s, plan: newPlan } : s));
    } catch (err) { alert(`Failed to update plan: ${err.message}`); }
    finally { setPlanUpdating(''); }
  };

  const handleUpdateJoinCode = async (cid, newCode) => {
    if (!newCode || newCode.length < 4) return;
    try {
      await fetch(`${API}/super/company/${cid}/join-code`, {
        method: 'POST', headers: apiH(userEmail),
        body: JSON.stringify({ join_code: newCode.toUpperCase() })
      });
      fetchAllData();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteStation = async (stationId) => {
    try {
      await fetch(`${API}/super/company/${stationId}`, {
        method: 'DELETE', headers: apiH(userEmail)
      });
      setStations(prev => prev.filter(s => s.id !== stationId));
      setDeleteConfirm(null);
    } catch (err) { alert(`Delete failed: ${err.message}`); }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  if (!isAuthorized) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div className="card-luxury anim-scale-in" style={{ textAlign: 'center', padding: '4rem', maxWidth: 440 }}>
          <div className="anim-pulse-glow" style={{ width: 100, height: 100, background: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
             <ShieldAlert size={50} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)', marginBottom: '1rem' }}>Restricted Sector</h1>
          <p style={{ color: 'var(--text2)', fontSize: '1rem' }}>Unauthorized access. Protocol Lock active.</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'subscriptions', label: 'Subscription Control', icon: <CreditCard size={16} /> },
    { id: 'provisioning',  label: 'Provisioning',         icon: <KeyRound size={16} /> },
    { id: 'monitor',       label: 'Live Stream',          icon: <Activity size={16} /> },
    { id: 'logs',          label: 'Diagnostics',          icon: <Database size={16} /> },
    { id: 'healer',        label: 'Neural Monitor',       icon: <Cpu size={16} /> },
  ];

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header anim-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(1.5rem, 4vw, 3rem)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em' }}>
            <Globe size={36} color="var(--primary)" className="anim-pulse-glow" /> Command Central
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: '0.9rem', marginTop: '0.25rem' }}>LogiRate SuperAdmin · Global Orchestration Ledger</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="nav-item-premium" style={{ width: 'auto', padding: '0.75rem 1rem', background: 'var(--surface2)', borderRadius: 14, border: '1px solid var(--border)' }} onClick={fetchAllData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
          <button className="btn-premium-gold" onClick={() => setShowAddStation(true)} style={{ padding: '0.75rem 1.5rem', borderRadius: 14, fontSize: '0.85rem' }}>
            <PlusCircle size={18} /> PROVISION STATION
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 45%, 260px), 1fr))', gap: 'clamp(0.75rem, 3vw, 1.5rem)', marginBottom: 'clamp(1.5rem, 5vw, 3rem)' }}>
        <GlobalStat label="Active Stations"  value={stats?.total_companies ?? 0}   sub="Managed Nodes"       color="#3b82f6" icon={<Building2 size={20} />}    delay={0.1} />
        <GlobalStat label="Total Weighments" value={stats?.total_transactions ?? 0} sub="Cloud Transmissions"  color="#d4af37" icon={<Truck size={20} />}       delay={0.2} />
        <GlobalStat label="Net Throughput"   value={Math.floor((stats?.total_net_weight ?? 0) / 1000)} suffix="t" sub="Combined Tonnage" color="#22c55e" icon={<Scale size={20} />} delay={0.3} />
        <GlobalStat label="Anomalies"        value={stats?.total_errors ?? 0}       sub="System Warnings"    color="#ef4444" icon={<AlertTriangle size={20} />} delay={0.4} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', padding: '0.4rem', background: 'var(--surface2)', borderRadius: 20, border: '1px solid var(--border)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.25rem', color: activeTab === t.id ? '#000' : 'var(--text3)', background: activeTab === t.id ? 'var(--primary)' : 'transparent', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '8rem 0', textAlign: 'center' }}>
          <span className="spinner" style={{ width: 44, height: 44 }} />
          <p style={{ marginTop: '1.5rem', color: 'var(--text3)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>QUERYING GLOBAL GRID...</p>
        </div>
      ) : (
        <div>

          {/* ─── SUBSCRIPTION CONTROL PANEL ─── */}
          {activeTab === 'subscriptions' && (
            <div>
              <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontWeight: 900, fontSize: '1.6rem', color: 'var(--text)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>⚖️ Weighbridge Station Plans</h2>
                  <p style={{ color: 'var(--text2)', fontSize: '0.875rem', fontWeight: 500 }}>Instantly override any station's subscription. For offline transfers, free trials & manual upgrades.</p>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text3)', background: 'var(--surface2)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: 10 }}>
                  {stations.length} Station{stations.length !== 1 ? 's' : ''} Total
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {stations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text3)', fontWeight: 600 }}>No weighbridge stations provisioned yet.</div>
                ) : stations.map((station, i) => {
                  const currentPlan = station.plan || 'free';
                  const cfg = PLAN_CONFIG[currentPlan] || PLAN_CONFIG.free;
                  return (
                    <div key={station.id} className="card-luxury anim-fade-up" style={{ padding: '1.75rem 2rem', borderRadius: 20, border: `1px solid ${cfg.color}22`, display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', animationDelay: `${i * 0.05}s`, transition: 'border-color 0.3s' }}>
                      {/* Station Icon + Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 220px', minWidth: 0 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Scale size={26} color={cfg.color} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.02em' }}>{station.name}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.05em', marginTop: 3, fontFamily: 'monospace' }}>
                            {station.id.substring(0, 20).toUpperCase()}...
                          </div>
                        </div>
                      </div>

                      {/* Current Plan Badge */}
                      <div style={{ flex: '0 0 auto' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Current Plan</div>
                        <PlanBadge plan={currentPlan} />
                      </div>

                      {/* Plan Override Dropdown */}
                      <div style={{ flex: '0 0 auto' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Admin Override</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <select
                            value={currentPlan}
                            disabled={planUpdating === station.id}
                            onChange={e => handleOverridePlan(station.id, e.target.value)}
                            style={{ padding: '0.55rem 0.9rem', borderRadius: 10, border: `2px solid ${cfg.color}55`, background: cfg.bg, color: cfg.color, fontWeight: 900, fontSize: '0.82rem', cursor: 'pointer', letterSpacing: '0.02em' }}
                          >
                            <option value="free">🔧 Automation — Free</option>
                            <option value="pro">⚡ Control — ₹1,200/mo</option>
                            <option value="enterprise">👑 Intelligence — ₹2,000/mo</option>
                          </select>
                          {planUpdating === station.id && <span className="spinner" style={{ width: 18, height: 18 }} />}
                          {planUpdating !== station.id && currentPlan !== 'free' && (
                            <CheckCircle size={18} color="var(--success)" />
                          )}
                        </div>
                      </div>

                      {/* Provisioned + Delete */}
                      <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Provisioned</div>
                          <div style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 700 }}>
                            {new Date(station.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <button
                          onClick={() => setDeleteConfirm(station)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer', letterSpacing: '0.04em' }}
                        >
                          <Trash2 size={13} /> REMOVE
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Plan Legend */}
              <div style={{ marginTop: '2.5rem', padding: '1.75rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>📊 Weighbridge Plan Feature Matrix</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {[
                    { plan: 'free',       features: ['Auto PDF Detection', 'AI Data Extraction', 'Basic Daily Dashboard', '1 User Login'] },
                    { plan: 'pro',        features: ['Everything in Automation +', 'Gross↔Tare Auto Matching', 'Duplicate Detection', 'Multi-user Login', 'Excel/PDF Export'] },
                    { plan: 'enterprise', features: ['Everything in Control +', 'AI Fraud Detection & Risk Scoring', 'Predictive Analytics', 'Multi-location Dashboard', 'Audit Logs & API Access'] },
                  ].map(({ plan, features }) => {
                    const cfg = PLAN_CONFIG[plan];
                    return (
                      <div key={plan} style={{ padding: '1.25rem', background: cfg.bg, border: `1px solid ${cfg.color}33`, borderRadius: 14 }}>
                        <div style={{ fontWeight: 900, color: cfg.color, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                          {cfg.icon} {cfg.label}
                        </div>
                        {features.map(f => (
                          <div key={f} style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: 6, lineHeight: 1.4 }}>
                            <CheckCircle size={12} color={cfg.color} style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delete Confirmation Modal */}
              {deleteConfirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <div className="card-luxury anim-scale-in" style={{ maxWidth: 420, width: '100%', padding: '2.5rem', borderRadius: 24, border: '1px solid rgba(239,68,68,0.3)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                        <Trash2 size={30} color="#ef4444" />
                      </div>
                      <h3 style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Remove Station?</h3>
                      <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        Permanently remove <strong style={{ color: 'var(--text)' }}>"{deleteConfirm.name}"</strong> from the platform?
                        <br />All data will be deleted and cannot be recovered.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleDeleteStation(deleteConfirm.id)}
                        style={{ flex: 2, height: 48, borderRadius: 12, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer' }}
                      >
                        Yes, Remove
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="nav-item-premium"
                        style={{ flex: 1, height: 48, justifyContent: 'center', background: 'var(--surface2)', border: '1px solid var(--border)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── PROVISIONING TAB ─── */}
          {activeTab === 'provisioning' && (
            <div className="table-wrap">
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', minWidth: '700px' }}>
                <thead style={{ background: 'var(--surface2)' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Station</th>
                    <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Join Code</th>
                    <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>API Key</th>
                    <th style={{ textAlign: 'right', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map((c, i) => (
                    <tr key={c.id} className="table-row-premium" style={{ animationDelay: `${i * 0.05}s` }}>
                      <td style={{ padding: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>{c.name}</td>
                      <td style={{ padding: '1.25rem' }}>
                        <code style={{ fontSize: '1.05rem', color: 'var(--primary)', letterSpacing: '3px', fontWeight: 900, background: 'var(--surface2)', padding: '0.35rem 0.75rem', borderRadius: 8, border: '1px solid var(--border)' }}>{c.join_code}</code>
                      </td>
                      <td style={{ padding: '1.25rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text3)' }}>
                        {c.api_key ? c.api_key.substring(0, 18) + '...' : '—'}
                      </td>
                      <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                          <button className="nav-item-premium" style={{ width: 'auto', padding: '0.5rem', background: 'var(--surface2)', border: '1px solid var(--border)' }} onClick={() => handleCopy(c.join_code, c.id)}>
                            {copied === c.id ? <CheckCircle size={16} color="#22c55e" /> : <Copy size={16} />}
                          </button>
                          <button className="nav-item-premium" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 800 }} onClick={() => {
                            const nc = prompt("New join code for " + c.name, c.join_code);
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

          {/* ─── LIVE STREAM TAB ─── */}
          {activeTab === 'monitor' && (
            <div className="table-wrap">
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', minWidth: '900px' }}>
                <thead style={{ background: 'var(--surface2)' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Station</th>
                    <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Vehicle</th>
                    <th style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Material</th>
                    <th style={{ textAlign: 'right', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Net (kg)</th>
                    <th style={{ textAlign: 'center', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '1.25rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {allWeighments.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '5rem', color: 'var(--text3)' }}>No weighment data on the global stream yet.</td></tr>
                  ) : allWeighments.map((w, i) => (
                    <tr key={i} className="table-row-premium" style={{ animationDelay: `${i * 0.04}s` }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{w.companies?.name || '—'}</td>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text)' }}>{w.vehicle_number}</td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text2)' }}>{w.material || '—'}</td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 900, color: '#22c55e' }}>{w.net_weight?.toLocaleString() || '—'}</td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.6rem', padding: '0.2rem 0.6rem', borderRadius: 4, border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase' }}>{w.status}</span>
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

          {/* ─── NEURAL MONITOR TAB ─── */}
          {activeTab === 'healer' && (
            <div className="anim-fade-up">
              <div className="card-luxury" style={{ padding: '3rem', borderRadius: 32, background: 'linear-gradient(135deg, rgba(212,175,55,0.05), transparent)', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'center' }}>
                <div className="anim-pulse-glow" style={{ width: 120, height: 120, background: 'var(--primary-glow)', borderRadius: '30%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '2px solid var(--primary)' }}>
                  <Cpu size={60} color="var(--primary)" />
                </div>
                <h2 style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--text)', marginBottom: '1rem' }}>LogiCrate Neural Healer</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  <div style={{ padding: '0.5rem 1.25rem', background: healerStatus.active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: 12, border: healerStatus.active ? '1px solid #22c55e' : '1px solid #ef4444', color: healerStatus.active ? '#22c55e' : '#ef4444', fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className={healerStatus.active ? "glow-dot" : ""} style={{ width: 8, height: 8, background: healerStatus.active ? '#22c55e' : '#ef4444' }} />
                    {healerStatus.status.toUpperCase()}
                  </div>
                  <div style={{ padding: '0.5rem 1.25rem', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 900, fontSize: '0.8rem' }}>
                    MODE: {healerStatus.mode || 'FULL AUTONOMY'}
                  </div>
                </div>

                <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'left', display: 'grid', gap: '1.5rem' }}>
                  <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '1rem' }}>Active Directives</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <Zap size={14} color="var(--primary)" style={{ marginTop: 2 }} />
                        <div style={{ fontSize: '0.85rem', color: 'var(--text2)', fontWeight: 500 }}>
                          Sovereign writes enabled. Healer can autonomously modify source files via SEARCH/REPLACE patches.
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <Database size={14} color="#22c55e" style={{ marginTop: 2 }} />
                        <div style={{ fontSize: '0.85rem', color: 'var(--text2)', fontWeight: 500 }}>
                          Neural Audit Trail active. All interventions are being recorded in the local historical ledger.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Historical Ledger */}
                  <div>
                    <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                       <Activity size={14} /> Autonomous Intervention History
                    </h4>
                    <pre style={{ 
                      background: '#05060d', 
                      border: '1px solid rgba(212,175,55,0.2)', 
                      borderRadius: 16, 
                      padding: '1.5rem', 
                      color: '#22c55e', 
                      fontFamily: '"Fira Code", monospace', 
                      fontSize: '0.75rem', 
                      maxHeight: '300px', 
                      overflowY: 'auto', 
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                    }}>
                      {healerHistory || '>> NO INTERVENTIONS RECORDED IN THIS EPOCH <<'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: PROVISION STATION ── */}
      {showAddStation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,6,13,0.92)', backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card-luxury anim-scale-in" style={{ maxWidth: 540, width: '100%', padding: 'clamp(1.5rem, 8vw, 3rem)', borderRadius: 28, overflowY: 'auto', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '1.75rem', color: 'var(--text)' }}>Provision Station</h2>
                <p style={{ color: 'var(--text3)', fontSize: '0.9rem', marginTop: 4 }}>Initialize a new weighbridge station node.</p>
              </div>
              <button className="nav-item-premium" style={{ width: 'auto', padding: '0.6rem', background: 'var(--surface2)', border: '1px solid var(--border)' }} onClick={() => setShowAddStation(false)}><X size={24} /></button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Station Name *</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.5 }} />
                <input className="input-premium" style={{ width: '100%', paddingLeft: '3.5rem', boxSizing: 'border-box' }} placeholder="e.g. Sharma Weighing Station" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Custom Join Code (Optional)</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.5 }} />
                <input className="input-premium" style={{ width: '100%', paddingLeft: '3.5rem', fontFamily: 'monospace', letterSpacing: '4px', boxSizing: 'border-box', textTransform: 'uppercase' }} placeholder="AUTO-GENERATED IF BLANK" value={newCustomCode} onChange={e => setNewCustomCode(e.target.value.toUpperCase())} />
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: '0.5rem' }}>A secure code will be auto-generated if left blank.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-premium-gold" onClick={handleCreateStation} disabled={actionLoading || !newName.trim()} style={{ flex: 3 }}>
                {actionLoading ? <><span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#000' }} /> PROVISIONING...</> : 'CREATE STATION'}
              </button>
              <button className="nav-item-premium" style={{ flex: 1, width: 'auto', background: 'var(--surface2)', border: '1px solid var(--border)', justifyContent: 'center' }} onClick={() => setShowAddStation(false)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
