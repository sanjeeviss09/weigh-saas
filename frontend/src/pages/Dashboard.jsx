import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Scale, Building2, Key, Truck, CheckCircle, Clock, IndianRupee, Download, ArrowRight, Zap, TrendingUp, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ─── Animated Counter Component ──────────────────────────────────────────────
function AnimatedCounter({ value, duration = 1500, suffix = "" }) {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);

  useEffect(() => {
    let frameId;
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

// ─── Premium Onboarding Screen ──────────────────────────────────────────────
function OnboardingScreen() {
  const [mode, setMode] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const code = joinCode.trim().toUpperCase();
      const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${API}/validate-join-code?code=${encodeURIComponent(code)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Invalid join code. Please check and try again.');
      }
      const company = await res.json();
      const { error: updateErr } = await supabase.auth.updateUser({
        data: { role: 'weighment', company_id: company.company_id, company_name: company.company_name }
      });
      if (updateErr) throw updateErr;
      setSuccess(`Joined "${company.company_name}" successfully!`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) { setError('Station name is required.'); return; }
    setLoading(true); setError('');
    try {
      const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${API}/company/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyName.trim() })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Could not create station. Is the backend running?');
      }
      const company = await res.json();
      const { error: updateErr } = await supabase.auth.updateUser({
        data: { role: 'company', company_id: company.company_id, company_name: company.company_name }
      });
      if (updateErr) throw updateErr;
      setSuccess(`Station "${company.company_name}" created! Join code: ${company.join_code}`);
      setTimeout(() => window.location.reload(), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'80vh' }}>
      <div className="auth-card-premium" style={{ maxWidth:'500px', padding:'clamp(1.5rem, 8vw, 3.5rem)' }}>
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <div className="anim-pulse-glow" style={{ background:'rgba(212,175,55,0.1)', width:'72px', height:'72px', borderRadius:'22px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', border: '1px solid rgba(212,175,55,0.2)' }}>
            <Building2 size={36} color="var(--primary)" />
          </div>
          <h2 style={{ fontWeight:900, fontSize: '1.75rem', marginBottom:'0.75rem', color: 'var(--text)' }}>Welcome to LogiCrate</h2>
          <p style={{ color:'var(--text2)', fontSize:'0.95rem' }}>Your workspace is ready. Let's finish the setup.</p>
        </div>

        {!mode && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <button className="btn-premium-gold" style={{ padding:'1rem', fontSize:'1.05rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.75rem' }}
              onClick={() => { setMode('join'); setError(''); }}>
              <Key size={20} /> Join with Invite Code
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <div style={{ flex:1, height:'1px', background:'var(--border)' }}></div>
              <span style={{ fontSize:'0.7rem', color:'var(--text3)', fontWeight: 800 }}>OR</span>
              <div style={{ flex:1, height:'1px', background:'var(--border)' }}></div>
            </div>
            <button className="nav-item-premium" style={{ padding:'1rem', fontSize:'1.05rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.75rem', background: 'var(--surface2)', border: '1px solid var(--border)' }}
              onClick={() => { setMode('register'); setError(''); }}>
              <Building2 size={20} /> Register New Station
            </button>
          </div>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="anim-fade-up">
            <button type="button" onClick={() => { setMode(null); setError(''); }}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--primary)', fontSize:'0.85rem', fontWeight: 700, marginBottom:'1.5rem', padding:0 }}>← Go Back</button>
            <h3 style={{ fontWeight:800, marginBottom:'0.5rem', color: 'var(--text)' }}>Enter Invitation Code</h3>
            <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginBottom:'1.5rem' }}>Check with your administrator for the Station code.</p>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <input className="input-premium" style={{ width:'100%', textAlign: 'center', fontFamily:'monospace', fontSize:'1.5rem', letterSpacing:'5px', fontWeight:900, color: 'var(--primary)', padding: '1rem' }}
                type="text" required placeholder="XXXX-XXXX"
                value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} />
            </div>
            {error   && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.85rem' }}>{error}</div>}
            {success && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', color: '#86efac', fontSize: '0.85rem' }}>{success}</div>}
            <button className="btn-premium-gold" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Verifying...</> : 'Confirm Join'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="anim-fade-up">
            <button type="button" onClick={() => { setMode(null); setError(''); }}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--primary)', fontSize:'0.85rem', fontWeight: 700, marginBottom:'1.5rem', padding:0 }}>← Go Back</button>
            <h3 style={{ fontWeight:800, marginBottom:'0.5rem', color: 'var(--text)' }}>Create Your Station</h3>
            <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginBottom:'1.5rem' }}>Set up a new weighbridge workspace for your business.</p>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <input className="input-premium" style={{ width:'100%', boxSizing: 'border-box' }} type="text" required
                placeholder="Station Name (e.g. Sri Kadai Eswara)"
                value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
            {error   && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.85rem' }}>{error}</div>}
            {success && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', color: '#86efac', fontSize: '0.85rem' }}>{success}</div>}
            <button className="btn-premium-gold" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating...</> : 'Initialize Workspace'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Premium Stat Card ──────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon, delay = 0, numeric = false, suffix = "" }) {
  return (
    <div className="stat-card-premium" style={{ '--card-accent': `${color}11`, '--card-border': `${color}44`, animationDelay: `${delay}s` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ background: `${color}11`, color: color, padding: '8px', borderRadius: '12px', display: 'flex' }}>
           {icon}
        </div>
      </div>
      <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
        {numeric ? <AnimatedCounter value={value} suffix={suffix} /> : value}
      </div>
      <div style={{ fontSize:'0.78rem', color: 'var(--text3)', fontWeight: 500 }}>{sub}</div>
    </div>
  );
}

// ─── Main Dashboard Component ───────────────────────────────────────────────
export default function Dashboard({ companyId, companyName }) {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minLoadingDone, setMinLoadingDone] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('SYNCHRONIZING SECURE NODE...');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingDone(true), 3500);
    const msgTimer1 = setTimeout(() => setLoadingMessage('VERIFYING AUTHENTICITY LEDGER...'), 1200);
    const msgTimer2 = setTimeout(() => setLoadingMessage('ESTABLISHING P2P ENCRYPTION...'), 2400);
    return () => { clearTimeout(timer); clearTimeout(msgTimer1); clearTimeout(msgTimer2); };
  }, []);

  const fetchStats = async () => {
    if (!companyId && !companyName) { setLoading(false); return; }
    try {
      const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      let url = `${API}/dashboard?`;
      if (companyId)   url += `company_id=${companyId}&`;
      if (companyName) url += `company_name=${encodeURIComponent(companyName)}&`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStats(data);
      setError('');
    } catch {
      setError('Live sync intermittent. Reconnecting...');
      if (!stats) setStats({ total_transactions:0, total_net_weight:0, open_transactions:0, closed_transactions:0, total_amount:0, active_alerts:0, recent_errors:[] });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecent = async () => {
    if (!companyId && !companyName) return;
    try {
      const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      let url = `${API}/weighments?`;
      if (companyId)   url += `company_id=${companyId}&`;
      if (companyName) url += `company_name=${encodeURIComponent(companyName)}&`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRecent((data.data || []).slice(0, 8));
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchStats();
    fetchRecent();
    const interval = setInterval(() => { fetchStats(); fetchRecent(); }, 15000);
    return () => clearInterval(interval);
  }, [companyId, companyName]);

  if (!companyId && !companyName) return <OnboardingScreen />;

  if (loading || !minLoadingDone) return (
    <div className="page-content" style={{ display:'flex', flexDirection: 'column', alignItems:'center', justifyContent: 'center', minHeight: '60vh', gap:'2rem' }}>
      <div className="spinner-luxury" />
      <div style={{ textAlign: 'center' }}>
        <div style={{ color:'var(--text)', fontWeight: 800, letterSpacing: '0.15em', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{loadingMessage}</div>
        <div style={{ color:'var(--primary)', fontSize: '0.7rem', fontWeight: 600, opacity: 0.6 }}>LOGICRATE CLOUD GATEWAY v4.22</div>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header anim-fade-up">
        <h1 className="gradient-text-gold">Operational Overview</h1>
        <p>Live metrics from the global weighbridge cloud</p>
      </div>

      {error && (
        <div className="anim-slide-down" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, marginBottom: '2rem' }}>
           <Zap size={16} color="var(--primary)" className="anim-float" />
           <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 45%, 260px), 1fr))', gap: 'clamp(0.75rem, 3vw, 1.5rem)', marginBottom: '3rem' }}>
        <StatCard
          label="Total Vehicles"
          value={stats?.total_transactions ?? 0}
          numeric
          sub="Operations processed"
          color="#3b82f6"
          icon={<Truck size={20} />}
          delay={0}
        />
        <StatCard
          label="Pending 2nd Weight"
          value={stats?.open_transactions ?? 0}
          numeric
          sub="Active tare sessions"
          color="#f59e0b"
          icon={<Clock size={20} />}
          delay={0.1}
        />
        <StatCard
          label="Closed Tickets"
          value={stats?.closed_transactions ?? 0}
          numeric
          sub="Fully validated slips"
          color="#22c55e"
          icon={<CheckCircle size={20} />}
          delay={0.2}
        />
        <StatCard
          label="Net Throughput"
          value={Math.floor((stats?.total_net_weight ?? 0) / 1000)}
          numeric
          suffix=" t"
          sub="Total metric tonnage"
          color="#d4af37"
          icon={<Scale size={20} />}
          delay={0.3}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(300px, 100%, 800px), 1fr))', gap: '1.5rem' }}>
         {/* ── Recent Activity ── */}
         <div className="card-hover-glow" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '2rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
              <h3 style={{ fontWeight:900, fontSize: '1.25rem', color: 'var(--text)', display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <TrendingUp size={20} color="var(--primary)" /> Live Weighment Feed
              </h3>
              <a href="/weighments" className="nav-item-premium" style={{ width: 'auto', padding: '0.5rem 1rem', background: 'var(--surface2)', fontSize: '0.75rem' }}>View History</a>
            </div>

            <div style={{ overflowX:'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '0 1rem 0.75rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vehicle ID</th>
                    <th style={{ padding: '0 1rem 0.75rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Entity</th>
                    <th style={{ padding: '0 1rem 0.75rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Net Weight</th>
                    <th style={{ padding: '0 1rem 0.75rem', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((w, i) => {
                    const statusColor = w.status === 'closed' ? '#22c55e' : '#f59e0b';
                    return (
                      <tr key={w.id || i} className="table-row-premium anim-fade-in" style={{ animationDelay: `${0.5 + (i * 0.05)}s` }}>
                        <td style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '14px 0 0 14px', border: '1px solid var(--border)', borderRight: 'none' }}>
                           <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>{w.vehicle_number}</span>
                        </td>
                        <td style={{ padding: '1rem', background: 'var(--bg)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                           <div style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 600 }}>{w.party_name || 'Generic Entry'}</div>
                           <div style={{ color: 'var(--text3)', fontSize: '0.65rem' }}>{w.material || 'Standard Goods'}</div>
                        </td>
                        <td style={{ padding: '1rem', background: 'var(--bg)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                           <div style={{ color: 'var(--text)', fontWeight: 800 }}>{w.net_weight?.toLocaleString() ?? '--'} <span style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>KG</span></div>
                        </td>
                        <td style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '0 14px 14px 0', border: '1px solid var(--border)', borderLeft: 'none' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor }}></div>
                              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: statusColor }}>{w.status}</span>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {recent.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'rgba(255,255,255,0.15)' }}>No weighments detected in synchronizer feed.</div>
              )}
            </div>
         </div>

         {/* ── Status Panel ── */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Health Monitor */}
            <div className="card-hover-glow anim-fade-up anim-delay-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '1.75rem' }}>
               <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text3)', marginBottom: '1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><Zap size={14} /> CLOUD HEALTH</h4>
               
               <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  {[
                    { label: 'Cloud Sync', val: 'Active', color: '#22c55e' },
                    { label: 'PC Agent Node', val: stats?.total_transactions > 0 ? 'Connected' : 'Await Sync', color: stats?.total_transactions > 0 ? '#22c55e' : '#f59e0b' },
                    { label: 'AI Extraction', val: 'Online', color: '#22c55e' }
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{item.label}</span>
                       <span style={{ padding: '4px 10px', background: `${item.color}11`, color: item.color, borderRadius: 8, fontSize: '0.7rem', fontWeight: 800 }}>{item.val}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Live Anomalies */}
            <div className="anim-fade-up anim-delay-5" style={{ flex: 1, background: 'linear-gradient(135deg, rgba(239,68,68,0.05), transparent)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 24, padding: '1.75rem' }}>
               <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fca5a5', marginBottom: '1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><AlertTriangle size={14} /> SYSTEM ANOMALIES</h4>
               
               {stats?.recent_errors?.length > 0 ? (
                 <div style={{ display:'flex', flexDirection:'column', gap: '0.75rem' }}>
                    {stats.recent_errors.slice(0, 3).map((e, idx) => (
                      <div key={idx} style={{ padding: '0.85rem', background: 'rgba(239,68,68,0.05)', borderRadius: 14, border: '1px solid rgba(239,68,68,0.1)' }}>
                         <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fca5a5' }}>{e.file_name}</div>
                         <p style={{ fontSize: '0.65rem', color: 'rgba(239,68,68,0.4)', marginTop: 4 }}>{e.error_message}</p>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', opacity: 0.15 }}>
                     <CheckCircle size={32} />
                     <span style={{ fontSize: '0.7rem', marginTop: 10 }}>NO ERRORS REGISTERED</span>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* ── Premium Enterprise Teaser ── */}
      <div className="anim-fade-up anim-delay-6" style={{ marginTop: '3rem' }}>
        <div className="card-luxury" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2.5rem', borderRadius: 32, background: 'linear-gradient(135deg, rgba(212,175,55,0.05), transparent)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px var(--primary-glow)' }}>
              <IndianRupee size={32} />
            </div>
            <div>
              <h4 style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--text)', marginBottom: '0.4rem' }}>Node Pro: Accounts Orchestration</h4>
              <p style={{ color: 'var(--text3)', fontSize: '0.95rem', maxWidth: 500 }}>Unlock advanced party ledgers, automatic GST reconciliation, and integrated financial reporting for your entire weighbridge network.</p>
            </div>
          </div>
          <button className="btn-premium-gold" style={{ padding: '0.9rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             UPGRADE TO PRO <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
