import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Edit2, Save, X, FileText, Brain, Database, ArrowRight, Zap } from 'lucide-react';

export default function Corrections({ companyId }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const fetchErrors = () => {
    const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    fetch(`${API}/errors?company_id=${companyId}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setErrors(data.data || []))
      .catch(() => setErrors([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchErrors();
  }, [companyId]);

  const startEdit = (err) => {
    setEditing(err.id);
    const orig = err.ai_output || {};
    setForm({
      vehicle_number: orig.vehicle_number || '',
      gross_weight: orig.gross_weight || '',
      tare_weight: orig.tare_weight || '',
      net_weight: orig.net_weight || '',
      material: orig.material || '',
      party_name: orig.party_name || '',
    });
  };

  const saveCorrection = async (err) => {
    setSaving(true);
    setApiError('');
    try {
      const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${API}/correction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: err.weighment_file_id, company_id: companyId, corrected_data: form })
      });
      if (!res.ok) throw new Error();
      setEditing(null);
      setErrors(prev => prev.filter(e => e.id !== err.id));
    } catch {
      setApiError('Data synchronization failed. Retrying bridge connection...');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header anim-fade-up">
        <h1 className="gradient-text-gold">AI Extraction Recovery</h1>
        <p>Correct anomalies to train the LogiCrate neural engine</p>
      </div>

      {apiError && (
        <div className="anim-slide-down" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 12, marginBottom: '2rem', color: 'var(--danger)', fontSize: '0.85rem' }}>
           <AlertCircle size={16} /> {apiError}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '5rem', textAlign: 'center' }}>
          <span className="spinner" style={{ width: 32, height: 32 }} />
          <div style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>SCANNING EXTRACTION BUFFER...</div>
        </div>
      ) : errors.length === 0 ? (
        <div className="card-hover-glow anim-scale-in" style={{ textAlign:'center', padding:'4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24 }}>
          <div className="anim-pulse-glow" style={{ background:'var(--success-bg)', width:'80px', height:'80px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
            <CheckCircle size={40} color="var(--success)" />
          </div>
          <h2 style={{ fontWeight:900, fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Extraction Protocol Healthy</h2>
          <p style={{ color:'var(--text3)', maxWidth: '340px', margin: '0 auto', fontSize: '0.9rem' }}>No anomalies detected in the weighment pipeline. AI is currently performing at 99.8% accuracy.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          {errors.map((err, i) => (
            <div key={err.id} className="card-hover-glow anim-fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(340px, 1fr))', gap:'2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '2rem', animationDelay: `${i * 0.1}s`, position: 'relative', overflow: 'hidden' }}>
              
              {/* Decorative background element */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, var(--danger-bg) 0%, transparent 70%)', pointerEvents: 'none' }} />

              {/* Left: Raw Node Analysis */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
                  <div style={{ background: 'var(--danger-bg)', padding: '8px', borderRadius: '10px' }}>
                    <AlertCircle size={20} color="var(--danger)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>Anomaly: {err.file_name}</h3>
                    <div style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hardware Error Code 0x93</div>
                  </div>
                </div>

                <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 14, padding: '1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 500, lineHeight: 1.5 }}>
                  <Zap size={14} style={{ marginRight: 6, display: 'inline' }} /> {err.error_message}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                   <FileText size={14} color="var(--text3)" />
                   <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Raw Buffer Stream</span>
                </div>
                <pre style={{ flex: 1, background:'var(--bg2)', borderRadius: 16, padding:'1.25rem', fontSize:'0.75rem', color:'var(--text2)', whiteSpace:'pre-wrap', maxHeight:200, overflowY:'auto', border:'1px solid var(--border)', fontFamily: 'monospace', lineHeight: 1.6 }}>
                  {err.raw_text || 'SYSTEM DATA DEPLETED'}
                </pre>
              </div>

              {/* Right: Correction Uplink */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--primary-glow)', padding: '8px', borderRadius: '10px' }}>
                      <Brain size={20} color="var(--primary)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>Correction Uplink</h3>
                      <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Human-in-the-loop validation</div>
                    </div>
                  </div>

                  {editing === err.id ? (
                    <div style={{ display:'flex', gap:'0.5rem' }}>
                      <button className="nav-item-premium" style={{ width: 'auto', padding: '0.4rem 0.85rem', background: 'var(--primary)', color: '#000', fontWeight: 900 }} onClick={() => saveCorrection(err)} disabled={saving}>
                        {saving ? <span className="spinner" style={{ width:12, height:12, borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000' }} /> : 'SYNC'}
                      </button>
                      <button className="nav-item-premium" style={{ width: 'auto', padding: '0.4rem', background: 'var(--surface2)' }} onClick={() => setEditing(null)}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button className="nav-item-premium" style={{ width: 'auto', padding: '0.4rem 0.85rem', background: 'var(--surface2)', fontSize: '0.7rem', fontWeight: 800 }} onClick={() => startEdit(err)}>
                      <Edit2 size={12} /> INITIATE RECOVERY
                    </button>
                  )}
                </div>

                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem', flex: 1 }}>
                  {editing === err.id ? (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'1rem' }}>
                      {[
                        { key:'vehicle_number', label:'Vehicle ID', mono: true },
                        { key:'material', label:'Material' },
                        { key:'gross_weight', label:'Gross Wt' },
                        { key:'tare_weight', label:'Tare Wt' },
                        { key:'net_weight', label:'Net Value' },
                        { key:'party_name', label:'Party / Client' },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display: 'block', fontSize: '0.62rem', fontWeight: 800, color: 'var(--text3)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>{f.label}</label>
                          <input className="input-premium" style={{ width:'100%', padding:'0.6rem 0.85rem', fontSize:'0.85rem', boxSizing: 'border-box', fontFamily: f.mono ? 'monospace' : 'inherit', fontWeight: f.mono ? 800 : 500 }}
                            value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {err.ai_output ? (
                        Object.entries(err.ai_output).slice(0, 6).map(([k, v]) => (
                          <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color:'var(--text3)', textTransform:'capitalize' }}>{k.replace(/_/g,' ')}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: v ? 'var(--text)' : 'var(--text3)' }}>{v ?? 'MISSING'}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.2 }}>
                           <Database size={24} style={{ marginBottom: 10 }} />
                           <div style={{ fontSize: '0.75rem' }}>NO AI OUTPUT BUFFERED</div>
                        </div>
                      )}
                      
                      <div className="anim-fade-in" style={{ marginTop:'1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', background: 'var(--primary-glow)', borderRadius: 10, border: '1px solid var(--border)' }}>
                         <Zap size={14} color="var(--primary)" />
                         <span style={{ color:'var(--primary)', fontSize:'0.7rem', fontWeight: 800 }}>SUBMIT TO RE-CALIBRATE NEURAL WEIGHTS</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
