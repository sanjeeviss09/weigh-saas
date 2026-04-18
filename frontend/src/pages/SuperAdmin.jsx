import React, { useEffect, useState } from 'react';
import { Building2, AlertTriangle, Trash2, ChevronRight, X, Scale, RefreshCw, PlusCircle, UserPlus, Copy, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const SUPER_ADMIN_EMAIL = 'sanjeevinick09@gmail.com';
const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function apiH(email) {
  return { 'x-admin-email': email, 'Content-Type': 'application/json' };
}

function TxModal({ company, email, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/super/company/${company.id}/transactions`, { headers: apiH(email) })
      .then(r => r.json()).then(d => setRows(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(5,6,15,0.85)', zIndex:2100, display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(1rem, 5vw, 2rem)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
      <div className="card-luxury anim-scale-in" style={{ width:'100%', maxWidth:920, maxHeight:'85vh', display:'flex', flexDirection:'column', overflow:'hidden', borderRadius: 32 }}>
        <div style={{ padding:'2.5rem', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h3 style={{ fontWeight:900, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{company.name} ARCHIVE</h3>
            <p style={{ fontSize:'0.85rem', color:'var(--text3)', marginTop:'0.25rem', fontWeight: 600 }}>Protocol transmission ledger for company node</p>
          </div>
          <button className="nav-item-premium" style={{ width:'auto', padding:'0.6rem', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)' }} onClick={onClose}><X size={22} /></button>
        </div>
        <div style={{ overflowY:'auto', flex:1, padding: '0 1rem' }}>
          {loading ? (
            <div style={{ padding:'5rem', textAlign:'center' }}><span className="spinner" style={{ width: 40, height: 40 }} /></div>
          ) : rows.length === 0 ? (
            <div style={{ padding:'5rem', textAlign:'center', color:'var(--text3)', fontWeight: 600 }}>Zero transmissions logged for this node.</div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr>{['Vehicle', 'Material', 'Gross', 'Tare', 'Net (kg)', 'Status', 'Transmission'].map(h => (
                  <th key={h} style={{ padding:'1rem 1.25rem', textAlign:'left', fontSize:'0.7rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--text3)', opacity: 0.6 }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="table-row-premium anim-fade-in" style={{ animationDelay: `${0.1 + (i*0.04)}s` }}>
                    <td style={{ padding:'1.25rem', fontFamily:'monospace', color:'var(--primary)', fontWeight: 800, fontSize:'0.9rem', background: 'var(--bg2)', borderRadius: '14px 0 0 14px', border: '1px solid var(--border)', borderRight: 'none' }}>{r.vehicle_number}</td>
                    <td style={{ padding:'1.25rem', color:'var(--text)', fontWeight: 600, background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>{r.material || '—'}</td>
                    <td style={{ padding:'1.25rem', color:'var(--text)', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>{r.gross_weight?.toLocaleString() || '—'}</td>
                    <td style={{ padding:'1.25rem', color:'var(--text)', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>{r.tare_weight?.toLocaleString() || '—'}</td>
                    <td style={{ padding:'1.25rem', color:'var(--success)', fontWeight:900, fontSize: '1.1rem', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>{r.net_weight?.toLocaleString() || '—'}</td>
                    <td style={{ padding:'1.25rem', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.status==='closed' ? 'var(--success)' : r.status==='error' ? 'var(--danger)' : 'var(--warning)' }}></div>
                        <span style={{ fontSize:'0.7rem', fontWeight:800, textTransform:'uppercase', color: r.status==='closed' ? 'var(--success)' : r.status==='error' ? 'var(--danger)' : 'var(--warning)' }}>{r.status}</span>
                      </div>
                    </td>
                    <td style={{ padding:'1.25rem', color:'var(--text3)', fontWeight: 600, fontSize:'0.75rem', background: 'var(--bg2)', borderRadius: '0 14px 14px 0', border: '1px solid var(--border)', borderLeft: 'none' }}>
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Add Company Modal ────────────────────────────────────────
function AddCompanyModal({ email, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id); setTimeout(() => setCopied(''), 2000);
  };

  const create = async () => {
    if (!name.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/super/company/create`, {
        method: 'POST', headers: apiH(email),
        body: JSON.stringify({ name: name.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to create');
      setResult(data.data);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(5,6,15,0.85)', zIndex:2100, display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(1rem, 5vw, 2rem)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
      <div className="card-luxury anim-scale-in" style={{ maxWidth:540, width:'100%', borderRadius: 32, padding: '2.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2.5rem' }}>
          <div>
            <h3 style={{ fontWeight:900, fontSize: '1.4rem' }}>Node Provisioning</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text3)', fontWeight: 600 }}>Create a new company node on the global fabric</p>
          </div>
          <button className="nav-item-premium" style={{ width:'auto', padding:'0.6rem', borderRadius: 12 }} onClick={onClose}><X size={22} /></button>
        </div>

        {!result ? (
          <>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Company / Business Name</label>
              <input className="input-premium" style={{ width:'100%', background: 'var(--bg2)', padding: '1rem' }} placeholder="e.g. Sharma Logistics" value={name} onChange={e => setName(e.target.value)} />
            </div>
            {error && <div className="alert alert-error mb-3">{error}</div>}
            <button className="btn-premium-gold" onClick={create} disabled={loading || !name.trim()} style={{ height: 54 }}>
              {loading ? <><span className="spinner" /> DEPLOYING...</> : 'CREATE COMPANY & GENERATE PROTOCOLS'}
            </button>
          </>
        ) : (
          <div className="anim-fade-up">
            <div className="alert alert-success" style={{ marginBottom:'2.5rem', borderRadius: 16 }}>
              ✓ Company <strong>{result.name}</strong> has been provisioned.
            </div>
            {[
              { label: 'Staff Access Code (Weighment Operators)', value: result.join_code, id: 'code', mono: true, large: true },
              { label: 'PC Agent API Key (Local PC Node)', value: result.api_key, id: 'key', mono: true, large: false },
            ].map(item => (
              <div key={item.id} className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ color:'var(--primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem' }}>{item.label}</label>
                <div style={{ display:'flex', gap:'0.75rem' }}>
                  <input className="input-premium" value={item.value} readOnly style={{ flex:1, fontFamily:'monospace', fontSize: item.large ? '1.25rem' : '0.85rem', letterSpacing: item.large ? '3px' : 'normal', fontWeight: 900, background: 'var(--bg2)', padding: '0.75rem 1rem' }} />
                  <button className="nav-item-premium" style={{ width:100, background: 'var(--surface2)', border: '1px solid var(--border)' }} onClick={() => copy(item.value, item.id)}>
                    {copied === item.id ? <CheckCircle size={16} color="var(--success)" /> : <><Copy size={16} /> Copy</>}
                  </button>
                </div>
              </div>
            ))}
            <button className="btn-premium-gold" style={{ height: 50, marginTop: '1rem' }} onClick={onClose}>FINALIZE</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Create Weighment Account Modal ──────────────────────────
function CreateOperatorModal({ companies, onClose }) {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [copied, setCopied] = useState(false);

  const company = companies.find(c => c.id === selectedCompany);

  const copy = () => {
    if (company?.join_code) {
      navigator.clipboard.writeText(company.join_code);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(5,6,15,0.85)', zIndex:2100, display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(1rem, 5vw, 2rem)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
      <div className="card-luxury anim-scale-in" style={{ maxWidth:500, width:'100%', borderRadius: 32, padding: '2.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
          <div>
            <h3 style={{ fontWeight:900, fontSize: '1.4rem' }}>Operator Access</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text3)', fontWeight: 600 }}>Retrieve join codes for manual distribution</p>
          </div>
          <button className="nav-item-premium" style={{ width:'auto', padding:'0.6rem', borderRadius: 12 }} onClick={onClose}><X size={22} /></button>
        </div>

        <div className="alert alert-info" style={{ marginBottom:'1.5rem', fontSize:'0.85rem', fontWeight: 600, borderRadius: 12 }}>
          Share this unique join code with weighment operators to link them to a specific company node.
        </div>

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Select Company Node</label>
          <select className="input-premium" style={{ width:'100%', background: 'var(--bg2)', padding: '0.75rem' }} value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}>
            <option value="">-- Choose a company --</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {company && (
          <div className="form-group anim-fade-up">
            <label className="form-label" style={{ color:'var(--primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Transmission Join Code</label>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <input className="input-premium" value={company.join_code} readOnly style={{ flex:1, fontFamily:'monospace', fontSize:'1.25rem', letterSpacing:'4px', fontWeight:900, background: 'var(--bg2)', padding: '0.75rem 1rem' }} />
              <button className="nav-item-premium" style={{ width:100, background: 'var(--surface2)', border: '1px solid var(--border)' }} onClick={copy}>
                {copied ? <CheckCircle size={18} color="var(--success)" /> : <><Copy size={16} /> Copy</>}
              </button>
            </div>
          </div>
        )}

        <button className="btn-premium-gold" style={{ height: 50, marginTop: '2rem' }} onClick={onClose}>DONE</button>
      </div>
    </div>
  );
}



// ─── Main Super Admin Page ────────────────────────────────────
export default function SuperAdmin({ userEmail }) {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('companies');
  const [viewCompany, setViewCompany] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddCompany, setShowAddCompany] = useState(false);

  const isAuthorized = userEmail?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase().trim();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, eRes, oRes] = await Promise.all([
        fetch(`${API}/super/stats`,     { headers: apiH(userEmail) }),
        fetch(`${API}/super/companies`, { headers: apiH(userEmail) }),
        fetch(`${API}/super/errors`,    { headers: apiH(userEmail) }),
      ]);
      const [s, c, e] = await Promise.all([sRes.json(), cRes.json(), eRes.json()]);
      setStats(s); setCompanies(c.data || []); setErrors(e.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAuthorized) fetchAll(); }, []);

  const handleDelete = async (id) => {
    await fetch(`${API}/super/company/${id}`, { method:'DELETE', headers: apiH(userEmail) });
    setDeleteConfirm(null); fetchAll();
  };

  const handleApproveOp = async (id) => {
    await fetch(`${API}/super/operator-requests/${id}/approve`, { method:'POST', headers: apiH(userEmail) });
    fetchAll();
  };

  if (!isAuthorized) return (
    <div className="page-content" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🔒</div>
        <h2 style={{ fontWeight:700, marginBottom:'0.5rem' }}>Access Denied</h2>
        <p style={{ color:'var(--text2)' }}>This area is restricted to the platform administrator only.</p>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      {viewCompany    && <TxModal company={viewCompany} email={userEmail} onClose={() => setViewCompany(null)} />}
      {showAddCompany && <AddCompanyModal email={userEmail} onClose={() => setShowAddCompany(false)} onCreated={fetchAll} />}
      {showCreateOp   && <CreateOperatorModal companies={companies} onClose={() => setShowCreateOp(false)} />}

      {deleteConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter: 'blur(4px)' }}>
          <div className="card-luxury" style={{ maxWidth:400, width:'100%', margin:'2rem' }}>
            <h3 style={{ fontWeight:700, marginBottom:'0.75rem', color:'var(--danger)' }}>Delete Company?</h3>
            <p style={{ color:'var(--text2)', marginBottom:'1.5rem' }}>
              Permanently delete <strong style={{ color:'var(--text)' }}>{deleteConfirm.name}</strong>? This cannot be undone.
            </p>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button className="btn btn-danger btn-full" onClick={() => handleDelete(deleteConfirm.id)}>Yes, Delete</button>
              <button className="btn btn-secondary btn-full" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <Scale size={28} color="var(--primary)" /> Super Admin Panel
          </h1>
          <p>Full platform control · <span style={{ color:'var(--primary)' }}>{userEmail}</span></p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
          <button className="btn btn-primary" onClick={() => setShowAddCompany(true)}>
            <PlusCircle size={16} /> Add Company
          </button>
          <button className="btn btn-secondary" onClick={fetchAll} disabled={loading}>
            <RefreshCw size={15} style={{ animation: loading ? 'spin 0.6s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'4rem' }}><span className="spinner" style={{ width:36, height:36, borderWidth:3 }} /></div>
      ) : (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Active Companies', val: stats?.total_companies ?? 0, color: '#3b82f6', icon: <Building2 size={20} /> },
              { label: 'Global Transactions', val: stats?.total_transactions ?? 0, color: '#d4af37', icon: <Scale size={20} /> },
              { label: 'System Anomalies', val: stats?.total_errors ?? 0, color: (stats?.total_errors > 0 ? '#ef4444' : '#22c55e'), icon: <AlertTriangle size={20} /> },
              { label: 'Net Fabric Weight', val: `${((stats?.total_net_weight ?? 0) / 1000).toFixed(1)}t`, color: '#22c55e', icon: <CheckCircle size={20} /> }
            ].map((s, i) => (
              <div key={i} className="stat-card-premium anim-fade-up" style={{ '--card-accent': `${s.color}11`, '--card-border': `${s.color}33`, animationDelay: `${i * 0.1}s`, padding: '1.5rem' }}>
                 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
                   <div style={{ fontSize:'0.7rem', fontWeight:800, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{s.label}</div>
                   <div style={{ background:`${s.color}16`, color:s.color, padding:'8px', borderRadius:'10px', display:'flex' }}>{s.icon}</div>
                 </div>
                 <div style={{ fontSize:'2.25rem', fontWeight:900, color:'var(--text)', letterSpacing:'-0.03em' }}>{s.val}</div>
                 <div style={{ fontSize:'0.75rem', color:'var(--text3)', marginTop:'0.25rem', fontWeight: 600 }}>Real-time synchronization</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:'0.25rem', background:'var(--surface)', padding:'0.25rem', borderRadius:'var(--radius)', width:'fit-content', marginBottom:'1.5rem' }}>
            {[
              { id:'companies', label:`Companies (${companies.length})` },
              { id:'errors',    label:`Errors (${errors.length})` },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className="btn" style={{ padding:'0.5rem 1.1rem', background: tab===t.id ? 'var(--surface2)' : 'transparent', color: tab===t.id ? 'var(--primary)' : 'var(--text2)', border: tab===t.id ? '1px solid var(--border2)' : '1px solid transparent' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Companies */}
          {tab === 'companies' && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Plan</th>
                    <th>Join Code</th>
                    <th>API Key</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign:'center', padding:'3rem', color:'var(--text3)' }}>No companies yet. Click "Add Company" to create one.</td></tr>
                  ) : companies.map(c => (
                    <tr key={c.id}>
                      <td className="td-primary" style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                        <Building2 size={15} color="var(--primary)" /> {c.name}
                      </td>
                      <td>
                        <select 
                          className="input-premium" 
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', width: 'auto', background: c.plan === 'enterprise' ? 'rgba(212,175,55,0.1)' : 'var(--bg2)', border: '1px solid var(--border)' }}
                          value={c.plan || 'free'}
                          onChange={async (e) => {
                            const newPlan = e.target.value;
                            setCompanies(prev => prev.map(comp => comp.id === c.id ? { ...comp, plan: newPlan } : comp));
                            await fetch(`${API}/super/company/${c.id}/plan`, {
                              method: 'POST',
                              headers: apiH(userEmail),
                              body: JSON.stringify({ plan: newPlan })
                            });
                          }}
                        >
                          <option value="free">FREE / AUTOMATION</option>
                          <option value="pro">PRO / CONTROL</option>
                          <option value="enterprise">ENTERPRISE / INTELLIGENCE</option>
                        </select>
                      </td>
                      <td style={{ fontFamily:'monospace', fontSize:'0.85rem', letterSpacing:'2px', color:'var(--primary)' }}>{c.join_code}</td>
                      <td style={{ fontFamily:'monospace', fontSize:'0.75rem', color:'var(--text3)' }}>
                        {c.api_key ? c.api_key.substring(0,14) + '...' : '—'}
                      </td>
                      <td style={{ color:'var(--text3)', fontSize:'0.8rem' }}>
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'0.5rem' }}>
                          <button className="btn btn-secondary" style={{ padding:'0.35rem 0.75rem', fontSize:'0.78rem' }} onClick={() => setViewCompany(c)}>
                            <ChevronRight size={13} /> View
                          </button>
                          <button className="btn btn-danger" style={{ padding:'0.35rem 0.75rem', fontSize:'0.78rem' }} onClick={() => setDeleteConfirm(c)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}



          {/* Errors */}
          {tab === 'errors' && (
            <div className="table-wrap">
              <table>
                <thead><tr><th>File</th><th>Error</th><th>Date</th></tr></thead>
                <tbody>
                  {errors.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign:'center', padding:'3rem', color:'var(--success)' }}>✓ No platform errors!</td></tr>
                  ) : errors.map((e,i) => (
                    <tr key={i}>
                      <td className="td-mono">{e.file_name}</td>
                      <td style={{ color:'var(--danger)', fontSize:'0.85rem', maxWidth:400 }}>{e.error_message}</td>
                      <td style={{ color:'var(--text3)', fontSize:'0.78rem' }}>
                        {new Date(e.created_at).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
