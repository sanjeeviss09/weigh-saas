import React, { useEffect, useState, useRef } from 'react';
import { Search, PlusCircle, X, Download, RefreshCw, Scale, Truck, Clock, CheckCircle, IndianRupee, Filter, ChevronRight, Zap, Database } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ─── PDF Generator ────────────────────────────────────────────────────────────
function printWeighmentSlip(w) {
  const net  = w.net_weight ? (w.net_weight / 1000).toFixed(3) : '—';
  const html = `
    <html><head><title>Weighment Slip</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: auto; color: #111; line-height: 1.5; }
      .card { border: 2px solid #b8960c; border-radius: 12px; padding: 30px; }
      .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 25px; }
      .header h1 { margin: 0; font-size: 1.8rem; color: #b8960c; text-transform: uppercase; letter-spacing: 1px; }
      .header p  { margin: 5px 0; font-size: 0.9rem; color: #666; font-weight: bold; }
      .slip-no   { text-align: right; font-size: 0.9rem; color: #333; margin-bottom: 20px; font-weight: bold; }
      table      { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
      td         { padding: 12px 15px; border: 1px solid #eee; font-size: 0.95rem; }
      td:first-child { font-weight: bold; background: #fcfcfc; width: 45%; color: #555; }
      .net-row td { background: #fffcea; font-weight: 900; font-size: 1.2rem; border: 2px solid #b8960c; }
      .footer    { text-align: center; font-size: 0.8rem; color: #888; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; font-style: italic; }
      @media print { button { display: none; } .card { border: 1px solid #ccc; } }
    </style></head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🚚 LogiCrate Premium</h1>
          <p>AI-POWERED WEIGHBRIDGE SOLUTIONS</p>
        </div>
        <div class="slip-no">REF SLIP: ${w.slip_number || w.id?.substring(0, 8).toUpperCase() || 'AUTO-GEN'}</div>
        <table>
          <tr><td>Vehicle Number</td><td>${w.vehicle_number}</td></tr>
          <tr><td>Party / Client</td><td>${w.party_name || 'Generic Entry'}</td></tr>
          <tr><td>Material Type</td><td>${w.material || 'Standard Goods'}</td></tr>
          <tr><td>First Wt (Gross)</td><td>${w.gross_weight?.toLocaleString() || '—'} kg</td></tr>
          <tr><td>Second Wt (Tare)</td><td>${w.tare_weight ? w.tare_weight.toLocaleString() + ' kg' : 'PENDING'}</td></tr>
          <tr class="net-row"><td>NET WEIGHT</td><td>${w.net_weight ? w.net_weight.toLocaleString() + ' kg  (' + net + ' t)' : 'PENDING'}</td></tr>
          <tr><td>Transaction Status</td><td>${w.status?.toUpperCase()}</td></tr>
          <tr><td>System Timestamp</td><td>${new Date(w.created_at).toLocaleString('en-IN')}</td></tr>
        </table>
        <div class="footer">
          Generated via LogiCrate Cloud Sync • Secure Digital Authenticity Ledger<br>
          Authorized System Copy - ${new Date().toLocaleString('en-IN')}
        </div>
      </div>
      <script>window.onload = () => { window.print(); }<\/script>
    </body></html>
  `;
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

// ─── Mini Stat Component ──────────────────────────────────────────────────
function MiniStat({ label, value, icon, color, delay = 0 }) {
  return (
    <div className="stat-card-premium anim-fade-up" style={{ padding: '1rem 1.25rem', '--card-accent': `${color}11`, '--card-border': `${color}33`, animationDelay: `${delay}s` }}>
       <div style={{ display:'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: `${color}11`, color: color, padding: '8px', borderRadius: '10px', display: 'flex' }}>{icon}</div>
          <div>
             <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
             <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)' }}>{value}</div>
          </div>
       </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Weighments({ companyId, companyName }) {
  const [weighments, setWeighments] = useState([]);
  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [showManual, setShowManual] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState('');
  const [activeTx,   setActiveTx]   = useState(null);

  const [formData, setFormData] = useState({
    vehicle_number: '', gross_weight: '', tare_weight: '',
    material: '', party_name: '', rate_per_ton: '', note: ''
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      let url = `${API}/weighments?`;
      if (companyId)   url += `company_id=${companyId}&`;
      if (companyName) url += `company_name=${encodeURIComponent(companyName)}&`;
      if (search)      url += `search=${encodeURIComponent(search)}&`;
      if (status)      url += `status=${status}&`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWeighments(data.data || []);
      setError('');
    } catch {
      setError('Live connection interrupted. Retrying sync...');
      setWeighments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showManual) {
      setActiveTx(null);
      setFormData({ vehicle_number:'', gross_weight:'', tare_weight:'', material:'', party_name:'', rate_per_ton:'', note:'' });
      return;
    }
  }, [showManual]);

  useEffect(() => {
    if (!showManual || !formData.vehicle_number || formData.vehicle_number.length < 2) {
      setActiveTx(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${API}/weighment/active/${formData.vehicle_number}?company_id=${companyId}`);
        const data = await res.json();
        if (data.active) {
          setActiveTx(data.transaction);
          setFormData(prev => ({
            ...prev,
            material: data.transaction.material || prev.material,
            party_name: data.transaction.party_name || prev.party_name,
            gross_weight: data.transaction.gross_weight || '',
            rate_per_ton: data.transaction.amount || data.transaction.rate_per_ton || prev.rate_per_ton
          }));
        } else { setActiveTx(null); }
      } catch (err) { console.error("Lookup failed", err); }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.vehicle_number, showManual, companyId]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormError('');
    const gross  = parseFloat(formData.gross_weight)  || 0;
    const tare   = parseFloat(formData.tare_weight)   || 0;
    const charge = parseFloat(formData.rate_per_ton)  || 0;
    if (!formData.vehicle_number.trim()) { setFormError('Vehicle number is required.'); setSubmitting(false); return; }
    if (!activeTx && gross <= 0) { setFormError('First weight is required for new entry.'); setSubmitting(false); return; }
    if (activeTx && tare <= 0) { setFormError('Second weight is required for pending entry.'); setSubmitting(false); return; }

    try {
      const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${API}/weighment/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id:     companyId,
          vehicle_number: formData.vehicle_number.trim().toUpperCase(),
          gross_weight:   activeTx ? activeTx.gross_weight : gross, 
          tare_weight:    activeTx ? tare : (tare > 0 ? tare : null),
          material:       formData.material || null,
          party_name:     formData.party_name || null,
          rate_per_ton:   charge > 0 ? charge : null,
          amount:         charge > 0 ? charge : null,
          source:         'MANUAL'
        })
      });
      if (!res.ok) throw new Error('Server protocol error');
      setShowManual(false); fetchLogs();
    } catch (err) { setFormError('Protocol mismatch. Please check backend connection.'); }
    finally { setSubmitting(false); }
  };

  useEffect(() => {
    const timer = setTimeout(fetchLogs, 300);
    return () => clearTimeout(timer);
  }, [companyId, companyName, search, status]);

  const stats = {
    total: weighments.length,
    pending: weighments.filter(w => w.status === 'open').length,
    completed: weighments.filter(w => w.status === 'closed').length,
    amount: weighments.reduce((acc, w) => acc + (parseFloat(w.amount || w.rate_per_ton) || 0), 0)
  };

  return (
    <div className="page-content">
      <div className="page-header anim-fade-up" style={{ marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: '1 1 240px' }}>
            <h1 className="gradient-text-gold" style={{ marginBottom: '0.25rem', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>Weighment Archive</h1>
            <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)' }}>Real-time synchronization with cloud-active weighbridges</p>
          </div>
          <button className="btn-premium-gold" onClick={() => setShowManual(true)} style={{ display:'flex', alignItems:'center', gap:'0.75rem', width: 'auto', padding: '0.75rem 1.75rem', borderRadius: 14, fontSize: '0.85rem' }}>
            <PlusCircle size={18} /> CREATE RECORD
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 45%, 220px), 1fr))', gap: 'clamp(0.75rem, 3vw, 1.25rem)', marginBottom: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
        <MiniStat label="Transactions" value={stats.total} icon={<Database size={16} />} color="#3b82f6" delay={0.1} />
        <MiniStat label="In Progress" value={stats.pending} icon={<Clock size={16} />} color="#f59e0b" delay={0.2} />
        <MiniStat label="Completed" value={stats.completed} icon={<CheckCircle size={16} />} color="#22c55e" delay={0.3} />
        <MiniStat label="Total Volume" value={`₹${stats.amount.toLocaleString('en-IN')}`} icon={<IndianRupee size={16} />} color="#d4af37" delay={0.4} />
      </div>

      {/* ── Filters & Table ── */}
      <div className="anim-fade-up" style={{ 
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        animationDelay: '0.5s',
        marginBottom: '2rem',
        overflow: 'hidden'
      }}>
        <div style={{ display:'flex', gap: '1rem', alignItems: 'center', padding: 'clamp(1rem, 3vw, 1.5rem)', flexWrap:'wrap', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <Search size={18} style={{ position:'absolute', left:'1.25rem', top:'50%', transform:'translateY(-50%)', color: 'var(--text3)', opacity: 0.5 }} />
            <input className="input-premium" placeholder="Search vehicle ID, party name..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft:'3.5rem', width:'100%', boxSizing: 'border-box', background: 'var(--bg2)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--surface2)', padding: '0.65rem 1.25rem', borderRadius: 12, border: '1px solid var(--border)' }}>
            <Filter size={16} color="var(--primary)" />
            <select style={{ background:'transparent', border:'none', color: 'var(--text)', fontSize:'0.85rem', outline:'none', cursor:'pointer', fontWeight: 700 }} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="" style={{ background: 'var(--surface2)' }}>All Transmissions</option>
              <option value="open" style={{ background: 'var(--surface2)' }}>Active Sessions</option>
              <option value="closed" style={{ background: 'var(--surface2)' }}>Archive Nodes</option>
            </select>
          </div>
          <button className="nav-item-premium" onClick={fetchLogs} style={{ width: 'auto', padding: '0.75rem 1.25rem', background: 'var(--surface2)', fontSize: '0.82rem', borderRadius: 12, border: '1px solid var(--border)' }}>
            <RefreshCw size={14} /> SYNC ARCHIVE
          </button>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div style={{ padding:'5rem', textAlign:'center' }}>
              <span className="spinner" style={{ width: 32, height: 32, color: 'var(--primary)' }} />
              <div style={{ marginTop: '1rem', color: 'var(--text3)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>QUERYING ARCHIVE...</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.15em', whiteSpace: 'nowrap', background: 'var(--bg2)' }}>Vehicle ID</th>
                  <th style={{ width: '52px', padding: '0.85rem 0.75rem', fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.15em', background: 'var(--bg2)' }}>Slip</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.15em', whiteSpace: 'nowrap', background: 'var(--bg2)' }}>Entity / Party</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.15em', whiteSpace: 'nowrap', background: 'var(--bg2)' }}>Material</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.15em', whiteSpace: 'nowrap', background: 'var(--bg2)' }}>Gross (kg)</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.15em', whiteSpace: 'nowrap', background: 'var(--bg2)' }}>Tare (kg)</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.15em', whiteSpace: 'nowrap', background: 'var(--bg2)' }}>Net (kg)</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.15em', background: 'var(--bg2)' }}>Fee</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.15em', background: 'var(--bg2)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {weighments.map((w, i) => {
                  const amt = w.amount || w.rate_per_ton || 0;
                  const statusColor = w.status === 'closed' ? '#22c55e' : '#f59e0b';
                  return (
                    <tr key={i} className="table-row-premium" style={{ animation: 'fadeSlideIn 0.3s ease both', animationDelay: `${0.1 + (i * 0.05)}s` }}>
                      <td style={{ padding: '0.75rem 1rem', background: 'var(--surface2)', borderRadius: '14px 0 0 14px', border: '1px solid var(--border)', borderRight: 'none', fontFamily: 'monospace', fontWeight: 900, color: 'var(--primary)', letterSpacing: '2px', fontSize: '0.8rem' }}>
                        {w.vehicle_number}
                      </td>
                      <td style={{ padding: '0.75rem 1.1rem', background: 'var(--surface2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                        <button onClick={() => printWeighmentSlip(w)} style={{ padding: '6px', background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '8px', cursor: 'pointer', display: 'flex', boxShadow: '0 0 10px rgba(212,175,55,0.1)' }}>
                          <Download size={14} />
                        </button>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', background: 'var(--surface2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {w.party_name || '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', background: 'var(--surface2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 600 }}>
                        {w.material || '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', background: 'var(--surface2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', fontWeight: 800, color: 'var(--text)', fontSize: '0.9rem' }}>
                        {w.gross_weight?.toLocaleString() || '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', background: 'var(--surface2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: 600 }}>
                        {w.tare_weight?.toLocaleString() || <span style={{ color:'var(--warning)', fontSize:'0.6rem', fontWeight:900, textTransform: 'uppercase' }}>Wait</span>}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', background: 'var(--surface2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', fontWeight: 900, color: 'var(--success)', fontSize: '0.95rem' }}>
                        {w.net_weight?.toLocaleString() || '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', background: 'var(--surface2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem' }}>
                        {amt > 0 ? `₹${parseFloat(amt).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', background: 'var(--surface2)', borderRadius: '0 14px 14px 0', border: '1px solid var(--border)', borderLeft: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}></div>
                          <span style={{ fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', color: statusColor, letterSpacing: '0.05em' }}>{w.status === 'open' ? 'Live' : w.status}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && weighments.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)' }}>
               <Database size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
               <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>No weighment records detected in this scope.</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Manual Entry Modal ── */}
      {showManual && (
        <div style={{ position:'fixed', inset:0, background:'rgba(5,6,15,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', zIndex:2100, display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(1rem, 5vw, 2rem)' }}>
          <div className="card-luxury anim-scale-in" style={{ 
            maxWidth: 680, 
            width: '100%',
            padding: 'clamp(1.5rem, 5vw, 3rem)',
            borderRadius: 32,
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            position: 'relative'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
              <div>
                <h2 style={{ fontWeight:900, fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.25rem' }}>Manual Entry Wizard</h2>
                <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Protocol override for manual weighbridge data sync</p>
              </div>
              <button className="nav-item-premium" onClick={() => setShowManual(false)} style={{ padding:'0.5rem', width: 'auto', background: 'var(--surface2)', border: '1px solid var(--border)' }}><X size={20} /></button>
            </div>

            {activeTx && (
              <div className="anim-fade-up" style={{ marginBottom:'1.5rem', padding:'1rem', background: 'var(--primary-glow)', borderRadius: 14, border:'1px solid var(--primary)', display:'flex', gap: '1rem', alignItems: 'center' }}>
                <Zap size={20} color="var(--primary)" />
                <div style={{ fontSize:'0.85rem', color: 'var(--text)' }}>
                  <strong style={{ color: 'var(--primary)' }}>Active Transaction Detected:</strong><br />
                  First weight was <span style={{ fontWeight: 900 }}>{activeTx.gross_weight} kg</span>. Please provide Tare weight to close.
                </div>
              </div>
            )}

            <form onSubmit={handleManualSubmit}>
              <div style={{ display:'grid', gridTemplateColumns: window.innerWidth < 480 ? '1fr' : '1fr 1fr', gap:'0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, color:'var(--text3)', marginBottom:'0.5rem', textTransform:'uppercase' }}>Vehicle ID *</label>
                  <input className="input-premium" style={{ width:'100%', fontFamily:'monospace', fontWeight:900, letterSpacing: '2px', boxSizing: 'border-box', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }} required placeholder="TN-XX-XXXX"
                    value={formData.vehicle_number} onChange={e => setFormData({...formData, vehicle_number: e.target.value})} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, color:'var(--text3)', marginBottom:'0.5rem', textTransform:'uppercase' }}>Material</label>
                  <input className="input-premium" style={{ width:'100%', boxSizing: 'border-box', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }} placeholder="Cargo Type"
                    value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns: window.innerWidth < 480 ? '1fr' : '1fr 1fr', gap:'0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, color:'var(--text3)', marginBottom:'0.5rem', textTransform:'uppercase' }}>{activeTx ? '1st Wt (Read-Only)' : 'Gross Wt (kg) *'}</label>
                  <input className="input-premium" style={{ width:'100%', opacity: activeTx ? 0.4 : 1, boxSizing: 'border-box', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }} type="number" 
                    required={!activeTx} readOnly={!!activeTx} placeholder="Gross"
                    value={formData.gross_weight} onChange={e => setFormData({...formData, gross_weight: e.target.value})} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, color:'var(--text3)', marginBottom:'0.5rem', textTransform:'uppercase' }}>{activeTx ? 'Tare Wt (kg) *' : 'Tare Wt (kg)'}</label>
                  <input className="input-premium" style={{ width:'100%', border: activeTx ? '1px solid var(--primary)' : '1px solid var(--border)', boxSizing: 'border-box', background: 'var(--bg)', color: 'var(--text)' }} 
                    type="number" required={!!activeTx} placeholder="Tare"
                    value={formData.tare_weight} onChange={e => setFormData({...formData, tare_weight: e.target.value})} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns: window.innerWidth < 480 ? '1fr' : '1fr 1fr', gap:'0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, color:'var(--text3)', marginBottom:'0.5rem', textTransform:'uppercase' }}>Client / Party</label>
                  <input className="input-premium" style={{ width:'100%', boxSizing: 'border-box', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }} placeholder="Company Name"
                    value={formData.party_name} onChange={e => setFormData({...formData, party_name: e.target.value})} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, color:'var(--text3)', marginBottom:'0.5rem', textTransform:'uppercase' }}>Fee (₹)</label>
                  <input className="input-premium" style={{ width:'100%', boxSizing: 'border-box', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }} type="number" placeholder="0.00"
                    value={formData.rate_per_ton} onChange={e => setFormData({...formData, rate_per_ton: e.target.value})} />
                </div>
              </div>
              
              {formError && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 12, padding: '0.85rem', marginBottom: '1.5rem', color: 'var(--danger)', fontSize: '0.85rem' }}>{formError}</div>}
              
              <div style={{ display:'flex', gap:'1rem' }}>
                <button className="btn-premium-gold" type="submit" disabled={submitting}>
                  {submitting ? <><span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#000' }} /> SYNCING...</> : (activeTx ? 'COMPLETE TRANSACTION' : 'INITIALIZE RECORD')}
                </button>
                <button className="nav-item-premium" type="button" onClick={() => setShowManual(false)} style={{ width: 'auto', padding: '0 1.5rem', background: 'var(--surface2)', border: '1px solid var(--border)' }}>CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
