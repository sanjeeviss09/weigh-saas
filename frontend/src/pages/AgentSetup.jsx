import React, { useState, useEffect, useRef } from 'react';
import { Truck, AlertTriangle, MessageSquare, Send, X, Download, CheckCircle, RefreshCcw, HelpCircle, FileText, Key, Code, Zap, ChevronRight, Monitor, Activity } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ─── Help Center Content (Bot Knowledge) ──────────────────────────────────────
const BOT_FAQ = [
  { id: 1, q: "Where is my API Key?", a: "Your secure Agent API Key is in the 'Station Profile'. The installer handles this automatically if you download the 'Bespoke Config' next to it." },
  { id: 2, q: "Script window closes?", a: "Ensure Python 3.10+ is installed and 'Add to PATH' was checked during installation." },
  { id: 3, q: "PDFs not uploading?", a: "Verify internet stability and ensure the 'API_URL' in config.json matches your cloud endpoint." },
  { id: 4, q: "Background mode?", a: "Run 'start_hidden.vbs' after the initial setup wizard completes successfully." },
];

// ─── Support Bot Component ──────────────────────────────────────────────────
function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Protocol synchronized. I am the LogiCrate Assistant. How can I help with your Agent node?", isBot: true }]);
  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);
  const handleAsk = (q, a) => { setMessages(prev => [...prev, { text: q, isBot: false }, { text: a, isBot: true }]); };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="anim-pulse-glow" style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(212,175,55,0.4)', border: 'none', cursor: 'pointer', zIndex: 1000, transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}>
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
      {isOpen && (
        <div className="anim-scale-in" style={{ position: 'fixed', bottom: '6.5rem', right: '2rem', width: '380px', height: '520px', background: 'rgba(14,16,26,0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 24px 64px rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #d4af37, #b8860b)', color: '#000', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(0,0,0,0.1)', borderRadius: '14px' }}><Activity size={20} /></div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.02em' }}>Agent Support Hub</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 700 }}>NEURAL SYNC ACTIVE</div>
            </div>
          </div>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.isBot ? 'flex-start' : 'flex-end', maxWidth: '85%', padding: '0.85rem 1rem', borderRadius: '18px', background: m.isBot ? 'var(--surface2)' : 'var(--primary)', color: m.isBot ? 'var(--text)' : '#000', fontSize: '0.85rem', lineHeight: '1.5', border: m.isBot ? '1px solid var(--border)' : 'none', borderBottomLeftRadius: m.isBot ? '4px' : '18px', borderBottomRightRadius: m.isBot ? '18px' : '4px', animation: 'fadeSlideUp 0.3s ease both' }}>
                {m.text}
              </div>
            ))}
          </div>
          <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
             <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Suggested Queries:</div>
             <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {BOT_FAQ.map(faq => (
                  <button key={faq.id} onClick={() => handleAsk(faq.q, faq.a)} className="nav-item-premium" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.72rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>{faq.q}</button>
                ))}
             </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AgentSetup({ companyId }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchLogs = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${API}/errors?company_id=${companyId}`);
      const json = await res.json();
      setErrors(json.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchLogs(); }, [companyId]);

  return (
    <div className="page-content">
      <div className="page-header anim-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 className="gradient-text-gold" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Monitor size={36} color="var(--primary)" /> Automation Hub
          </h1>
          <p>Orchestrate your local weighbridge node and data synchronizer</p>
        </div>
        <button onClick={fetchLogs} className="nav-item-premium" style={{ width: 'auto', padding: '0.7rem 1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
          <RefreshCcw size={16} /> REFRESH NODE LOGS
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2.5rem' }}>
        <div>
          {/* Main Download Area */}
          <div className="card-hover-glow anim-fade-up" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08), transparent)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 28, padding: '2.5rem', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
               <div style={{ width: 72, height: 72, borderRadius: '22px', background: 'linear-gradient(135deg, #d4af37, #b8860b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 30px rgba(212,175,55,0.3)' }}>
                  <Download size={36} color="#000" />
               </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontWeight: 900, fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--text)' }}>Deploy PC Agent v4.2</h2>
                  <p style={{ color: 'var(--text2)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                    The Logicrate Synchronizer automates your weighbridge workflow by monitoring local folders for PDF slips and instantly syncing them to your cloud dashboard.
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div className="anim-fade-up" style={{ animationDelay: '0.2s' }}>
                       <div style={{ padding: '1.5rem', background: 'rgba(212,175,55,0.05)', border: '1px dashed rgba(212,175,55,0.3)', borderRadius: 20, textAlign: 'center' }}>
                          <a href="/LogiRateSetup.exe" download className="btn-premium-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', justifyContent: 'center', marginBottom: '1rem' }}>
                            <Download size={22} /> DOWNLOAD INSTALLER
                          </a>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Windows 10/11 Architecture (x64)</div>
                       </div>
                    </div>
                    <div className="anim-fade-up" style={{ animationDelay: '0.3s' }}>
                       <div style={{ padding: '1.5rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, textAlign: 'center' }}>
                          <a href={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/agent/config?company_id=${companyId}`} download className="nav-item-premium" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', justifyContent: 'center', marginBottom: '1rem', background: 'var(--surface)', padding: '0.85rem' }}>
                             <FileText size={20} /> BESPOKE CONFIGURATION
                          </a>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 600 }}>Unique Node Access Credentials</div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Diagnostics Logs */}
          <div className="card-hover-glow anim-fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '2rem', animationDelay: '0.4s' }}>
             <h3 style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text)', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <AlertTriangle size={20} color="var(--warning)" /> Node Telemetry Logs
             </h3>
             {loading ? (
               <div style={{ padding: '3rem', textAlign: 'center' }}><span className="spinner" /></div>
             ) : errors.length === 0 ? (
               <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--bg2)', borderRadius: 20, border: '1px dashed var(--border)' }}>
                 <CheckCircle size={48} color="var(--success)" style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                 <div style={{ fontWeight: 800, color: 'var(--text3)', fontSize: '1rem' }}>SYSTEM FLOW OPTIMAL</div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '0.5rem' }}>No anomalies detected in the last 24,000 packets.</div>
               </div>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {errors.map((e, i) => (
                   <div key={i} style={{ padding: '1.25rem', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 16, display: 'flex', gap: '1rem' }}>
                      <Zap size={18} color="#fca5a5" style={{ flexShrink: 0, marginTop: 4 }} />
                      <div style={{ flex: 1 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                           <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fca5a5' }}>{e.file_name || 'Link Interrupted'}</span>
                           <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>{new Date(e.created_at).toLocaleTimeString()}</span>
                         </div>
                         <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{e.error_message}</div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Right: Quick Instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card-hover-glow anim-fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '2rem', animationDelay: '0.2s' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Zap size={18} /> INITIALIZATION STAGES
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[
                { s: '01', t: 'Archive Extraction', d: 'Download the Hub Installer and the custom Provisioning Config.' },
                { s: '02', t: 'Co-Location', d: 'Ensure both files reside in the same local directory before execution.' },
                { s: '03', t: 'Sudo Execution', d: 'Run the installer. Provide Administrative rights when prompted.' },
                { s: '04', t: 'Neural Link', d: 'Complete the wizard. Verification should turn GREEN on this dashboard.' },
              ].map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '12px', background: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }}>{step.s}</div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '0.95rem', marginBottom: '0.3rem' }}>{step.t}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text2)', lineHeight: 1.5 }}>{step.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PDF Creator Guide */}
          <div className="card-luxury anim-fade-up" style={{ padding: '2rem', animationDelay: '0.4s' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={18} /> STEP 0: VIRTUAL PDF PRINTER
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              To automate your existing software, you need a virtual printer that saves slips as PDFs to your <strong>watch folder</strong>.
            </p>
            <div style={{ background: 'var(--bg2)', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
               <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Recommended Software:</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a href="https://www.bullzip.com/products/pdf/download.php" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ChevronRight size={14} /> Bullzip PDF Printer (Free)
                  </a>
                  <a href="http://www.cutepdf.com/Products/CutePDF/writer.asp" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ChevronRight size={14} /> CutePDF Writer (Simple)
                  </a>
               </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3)', fontStyle: 'italic' }}>
              Tip: Set the "Auto-save" path of the printer to your LogiRate watch folder.
            </div>
          </div>

          <div className="anim-fade-up" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '2.5rem', textAlign: 'center', animationDelay: '0.5s' }}>
            <HelpCircle size={48} color="var(--primary)" style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <h4 style={{ fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>Stuck in the shadows?</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Deploy our Setup Assistant Bot for a real-time guided walkthrough of the synchronization protocol.</p>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>PROTOCOL HELP BELOW ↓</div>
          </div>
        </div>
      </div>
      <SupportBot />
    </div>
  );
}
