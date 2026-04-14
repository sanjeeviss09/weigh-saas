import React, { useEffect, useState } from 'react';
import { Building2, AlertTriangle, Trash2, ChevronRight, X, Scale, RefreshCw, PlusCircle, UserPlus, Copy, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const SUPER_ADMIN_EMAIL = 'sanjeevinick09@gmail.com';
const API = 'http://localhost:8000';

function apiH(email) {
  return { 'x-admin-email': email, 'Content-Type': 'application/json' };
}

// ─── Transactions Modal ───────────────────────────────────────
function TxModal({ company, email, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/super/company/${company.id}/transactions`, { headers: apiH(email) })
      .then(r => r.json()).then(d => setRows(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', backdropFilter: 'blur(4px)' }}>
      <div className="card-luxury" style={{ width:'100%', maxWidth:820, maxHeight:'82vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'1.25rem 1.75rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h3 style={{ fontWeight:700 }}>{company.name}</h3>
            <p style={{ fontSize:'0.78rem', color:'var(--text2)', marginTop:'0.15rem' }}>All weighment transactions</p>
          </div>
          <button className="btn btn-ghost" style={{ padding:'0.4rem' }} onClick={onClose}><X size={20} /></button>
        </div>
        <div style={{ overflowY:'auto', flex:1 }}>
          {loading ? (
            <div style={{ padding:'3rem', textAlign:'center' }}><span className="spinner" /></div>
          ) : rows.length === 0 ? (
            <div style={{ padding:'3rem', textAlign:'center', color:'var(--text3)' }}>No transactions yet for this company.</div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>{['Vehicle', 'Material', 'Gross', 'Tare', 'Net (kg)', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding:'0.75rem 1.25rem', textAlign:'left', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--primary)', borderBottom:'1px solid var(--border)', background:'var(--surface)', whiteSpace:'nowrap' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'0.85rem 1.25rem', fontFamily:'monospace', color:'var(--primary)', fontSize:'0.85rem' }}>{r.vehicle_number}</td>
                    <td style={{ padding:'0.85rem 1.25rem', color:'var(--text2)', fontSize:'0.875rem' }}>{r.material || '—'}</td>
                    <td style={{ padding:'0.85rem 1.25rem', color:'var(--text2)', fontSize:'0.875rem' }}>{r.gross_weight?.toLocaleString() || '—'}</td>
                    <td style={{ padding:'0.85rem 1.25rem', color:'var(--text2)', fontSize:'0.875rem' }}>{r.tare_weight?.toLocaleString() || '—'}</td>
                    <td style={{ padding:'0.85rem 1.25rem', color:'var(--success)', fontWeight:600 }}>{r.net_weight?.toLocaleString() || '—'}</td>
                    <td style={{ padding:'0.85rem 1.25rem' }}>
                      <span style={{ padding:'0.2rem 0.65rem', borderRadius:9999, fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', border:'1px solid', borderColor: r.status==='closed' ? 'var(--success)' : r.status==='error' ? 'var(--danger)' : 'var(--warning)', color: r.status==='closed' ? 'var(--success)' : r.status==='error' ? 'var(--danger)' : 'var(--warning)' }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding:'0.85rem 1.25rem', color:'var(--text3)', fontSize:'0.78rem' }}>
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
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
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', backdropFilter: 'blur(4px)' }}>
      <div className="card-luxury" style={{ maxWidth:480, width:'100%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h3 style={{ fontWeight:700 }}>Add New Company</h3>
          <button className="btn btn-ghost" style={{ padding:'0.4rem' }} onClick={onClose}><X size={20} /></button>
        </div>

        {!result ? (
          <>
            <div className="form-group">
              <label className="form-label">Company / Business Name</label>
              <input className="input" style={{ width:'100%' }} placeholder="e.g. Sharma Logistics" value={name} onChange={e => setName(e.target.value)} />
            </div>
            {error && <div className="alert alert-error mb-2">{error}</div>}
            <button className="btn btn-primary btn-full btn-lg" onClick={create} disabled={loading || !name.trim()}>
              {loading ? <><span className="spinner" /> Creating...</> : 'Create Company & Generate Codes'}
            </button>
          </>
        ) : (
          <>
            <div className="alert alert-success" style={{ marginBottom:'1.5rem' }}>
              ✓ Company <strong>{result.name}</strong> created successfully!
            </div>
            {[
              { label: 'Staff Join Code (share with weighment operators)', value: result.join_code, id: 'code', mono: true, large: true },
              { label: 'Agent API Key (configure in agent.exe)', value: result.api_key, id: 'key', mono: true, large: false },
            ].map(item => (
              <div key={item.id} className="form-group">
                <label className="form-label" style={{ color:'var(--primary)' }}>{item.label}</label>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <input className="input" value={item.value} readOnly style={{ flex:1, fontFamily:'monospace', fontSize: item.large ? '1rem' : '0.8rem', letterSpacing: item.large ? '2px' : 'normal', fontWeight: item.large ? 700 : 400 }} />
                  <button className="btn btn-secondary" style={{ width:80 }} onClick={() => copy(item.value, item.id)}>
                    {copied === item.id ? <CheckCircle size={14} color="var(--success)" /> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary btn-full mt-2" onClick={onClose}>Done</button>
          </>
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
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', backdropFilter: 'blur(4px)' }}>
      <div className="card-luxury" style={{ maxWidth:460, width:'100%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h3 style={{ fontWeight:700 }}>Generate Join Code</h3>
          <button className="btn btn-ghost" style={{ padding:'0.4rem' }} onClick={onClose}><X size={20} /></button>
        </div>

        <div className="alert alert-info" style={{ marginBottom:'1.5rem', fontSize:'0.875rem' }}>
          Select a company to get its unique join code. You can share this manually or use the "Respond" button in the requests tab to email it automatically.
        </div>

        <div className="form-group">
          <label className="form-label">Select Company</label>
          <select className="select" style={{ width:'100%' }} value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}>
            <option value="">-- Choose a company --</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {company && (
          <div className="form-group">
            <label className="form-label" style={{ color:'var(--primary)' }}>Join Code to Share</label>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <input className="input" value={company.join_code} readOnly style={{ flex:1, fontFamily:'monospace', fontSize:'1.1rem', letterSpacing:'3px', fontWeight:700 }} />
              <button className="btn btn-secondary" style={{ width:90 }} onClick={copy}>
                {copied ? <CheckCircle size={14} color="var(--success)" /> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
          </div>
        )}

        <button className="btn btn-secondary btn-full mt-2" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ─── Respond to Operator Request Modal ──────────────────────
function RespondModal({ request, companies, email, onClose, onResponded }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [adminMessage, setAdminMessage] = useState('Your request for a join code has been approved. Please find the details below.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const company = companies.find(c => c.id === selectedCompanyId);

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/super/operator-requests/${request.id}/respond`, {
        method: 'POST',
        headers: apiH(email),
        body: JSON.stringify({
          message: adminMessage,
          join_code: company?.join_code || null
        })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || 'Failed to send response');
      }
      onResponded();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', backdropFilter: 'blur(4px)' }}>
      <div className="card-luxury" style={{ maxWidth:540, width:'100%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <div>
            <h3 style={{ fontWeight:700 }}>Respond to {request.name}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>A notification will be sent to: <span style={{ color:'var(--primary)' }}>{request.contact}</span></p>
          </div>
          <button className="btn btn-ghost" style={{ padding:'0.4rem' }} onClick={onClose}><X size={20} /></button>
        </div>

        <div className="form-group">
          <label className="form-label">Attach Join Code (Optional)</label>
          <select className="select" style={{ width:'100%' }} value={selectedCompanyId} onChange={e => setSelectedCompanyId(e.target.value)}>
            <option value="">-- No join code (Reject/Info only) --</option>
            {companies.map(c => <option key={c.id} value={c.id}>Allocate to: {c.name}</option>)}
          </select>
          {company && <div style={{ marginTop:'0.4rem', fontSize:'0.75rem', color:'var(--success)' }}>Allocating Join Code: <strong>{company.join_code}</strong></div>}
        </div>

        <div className="form-group">
          <label className="form-label">Email Message Body</label>
          <textarea className="input" style={{ width:'100%', minHeight:100, fontSize:'0.85rem' }} 
            value={adminMessage} onChange={e => setAdminMessage(e.target.value)} />
        </div>

        {error && <div className="alert alert-error mb-2">{error}</div>}

        <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
          <button className="btn btn-primary btn-full" onClick={submit} disabled={loading}>
            {loading ? <span className="spinner" /> : <><Send size={16} /> Send Response & Email</>}
          </button>
          <button className="btn btn-secondary btn-full" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Super Admin Page ────────────────────────────────────
export default function SuperAdmin({ userEmail }) {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [errors, setErrors] = useState([]);
  const [opRequests, setOpRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('companies');
  const [viewCompany, setViewCompany] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showCreateOp, setShowCreateOp] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  const isAuthorized = userEmail?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase().trim();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, eRes, oRes] = await Promise.all([
        fetch(`${API}/super/stats`,     { headers: apiH(userEmail) }),
        fetch(`${API}/super/companies`, { headers: apiH(userEmail) }),
        fetch(`${API}/super/errors`,    { headers: apiH(userEmail) }),
        fetch(`${API}/super/operator-requests`, { headers: apiH(userEmail) }),
      ]);
      const [s, c, e, o] = await Promise.all([sRes.json(), cRes.json(), eRes.json(), oRes.json()]);
      setStats(s); setCompanies(c.data || []); setErrors(e.data || []); setOpRequests(o.data || []);
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
      {activeRequest  && <RespondModal request={activeRequest} companies={companies} email={userEmail} onClose={() => setActiveRequest(null)} onResponded={fetchAll} />}

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
          <button className="btn btn-secondary" onClick={() => setShowCreateOp(true)}>
            <UserPlus size={16} /> Operator Code
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
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.25rem', marginBottom:'2rem' }}>
            {[
              { label:'Total Companies',    value: stats?.total_companies    ?? 0, color:'var(--primary)' },
              { label:'Total Transactions', value: stats?.total_transactions ?? 0, color:'var(--text)'    },
              { label:'Platform Errors',    value: stats?.total_errors       ?? 0, color: stats?.total_errors > 0 ? 'var(--danger)':'var(--success)' },
              { label:'Total Net Weight',   value:`${((stats?.total_net_weight ?? 0)/1000).toFixed(1)}t`, color:'var(--success)' },
            ].map((s,i) => (
              <div key={i} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:'0.25rem', background:'var(--surface)', padding:'0.25rem', borderRadius:'var(--radius)', width:'fit-content', marginBottom:'1.5rem' }}>
            {[
              { id:'companies', label:`Companies (${companies.length})` },
              { id:'op_requests', label:`Operator Requests (${opRequests.filter(r => r.status === 'pending').length})` },
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
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 6, background: c.plan === 'enterprise' ? 'rgba(212,175,55,0.1)' : 'var(--bg2)', color: c.plan === 'enterprise' ? 'var(--primary)' : 'var(--text2)', border: '1px solid var(--border)' }}>
                          {c.plan || 'Standard'}
                        </span>
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

          {/* Operator Requests */}
          {tab === 'op_requests' && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Requester</th>
                    <th>Contact Info</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {opRequests.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign:'center', padding:'3rem', color:'var(--text3)' }}>No requests yet.</td></tr>
                  ) : opRequests.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700 }}>{r.name}</td>
                      <td style={{ color: 'var(--text2)' }}>{r.contact}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text3)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.message || '—'}</td>
                      <td>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: r.status === 'approved' ? 'var(--success-bg)' : 'rgba(245,158,11,0.05)', color: r.status === 'approved' ? 'var(--success)' : 'var(--warning)' }}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {r.status === 'pending' ? (
                          <button className="btn btn-primary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }} onClick={() => setActiveRequest(r)}>
                            Respond
                          </button>
                        ) : (
                          <span style={{ fontSize:'0.7rem', color:'var(--text3)' }}>Processed</span>
                        )}
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
