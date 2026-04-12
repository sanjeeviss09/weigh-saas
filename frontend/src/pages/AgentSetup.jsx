import React, { useState, useEffect, useRef } from 'react';
import { Truck, AlertTriangle, MessageSquare, X, Download, CheckCircle, RefreshCcw, FileText, Zap, ChevronRight, Monitor, Activity, Terminal, Printer, FolderOpen, MousePointer, ShieldCheck, Info } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// ─── Support Bot ──────────────────────────────────────────────────────────────
const BOT_FAQ = [
  { id: 1, q: "Agent not detecting PDFs?", a: "Make sure the watch folder path in your config.json matches exactly where your virtual printer saves files. The folder must exist before you run the agent." },
  { id: 2, q: "Agent closes immediately?", a: "This is normal! The agent runs invisibly in the background. Check your Windows System Tray (bottom right corner) for the LogiCrate icon." },
  { id: 3, q: "How to set up the PDF printer?", a: "Download and install Bullzip PDF Printer (free). After installation, open it and set the Output Folder to your watch folder path (e.g. C:\\WeighmentPDFs)." },
  { id: 4, q: "Dashboard not updating?", a: "Check your internet connection. The agent needs internet to sync data to the cloud. Wait 30 seconds after a PDF appears before checking the dashboard." },
];

function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Hello! I'm the LogiCrate setup assistant. What do you need help with?", isBot: true }]);
  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);
  const handleAsk = (q, a) => { setMessages(prev => [...prev, { text: q, isBot: false }, { text: a, isBot: true }]); };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="anim-pulse-glow" style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(212,175,55,0.4)', border: 'none', cursor: 'pointer', zIndex: 1000, transition: 'transform 0.2s' }}>
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
      {isOpen && (
        <div className="anim-scale-in" style={{ position: 'fixed', bottom: '6rem', right: '2rem', width: 'min(360px, calc(100vw - 2rem))', height: '480px', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #d4af37, #b8860b)', color: '#000', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Activity size={18} />
            <div>
              <div style={{ fontWeight: 900, fontSize: '0.9rem' }}>Setup Assistant</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 700 }}>Always here to help</div>
            </div>
          </div>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.isBot ? 'flex-start' : 'flex-end', maxWidth: '85%', padding: '0.75rem 1rem', borderRadius: 16, background: m.isBot ? 'var(--surface2)' : 'var(--primary)', color: m.isBot ? 'var(--text)' : '#000', fontSize: '0.82rem', lineHeight: 1.5, border: m.isBot ? '1px solid var(--border)' : 'none' }}>
                {m.text}
              </div>
            ))}
          </div>
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Common questions:</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {BOT_FAQ.map(faq => (
                <button key={faq.id} onClick={() => handleAsk(faq.q, faq.a)} className="nav-item-premium" style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.7rem', background: 'var(--bg2)', borderRadius: '8px' }}>{faq.q}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Step Component ───────────────────────────────────────────────────────────
function Step({ number, icon, title, desc, note }) {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem', background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(212,175,55,0.3)' }}>{number}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          {React.cloneElement(icon, { size: 15, color: 'var(--primary)' })}
          <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '0.92rem' }}>{title}</div>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6 }}>{desc}</div>
        {note && <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--warning)', background: 'var(--warning-bg)', padding: '0.5rem 0.75rem', borderRadius: 8, display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}><Info size={12} style={{ flexShrink: 0, marginTop: 2 }} />{note}</div>}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AgentSetup({ companyId }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('install'); // 'install' | 'pdf' | 'logs'

  const fetchLogs = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/errors?company_id=${companyId}`);
      const json = await res.json();
      setErrors(json.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchLogs(); }, [companyId]);

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header anim-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)' }}>
            <Monitor size={28} color="var(--primary)" /> PC Agent Hub
          </h1>
          <p style={{ color: 'var(--text2)', marginTop: '0.35rem' }}>Download, install, and configure your local synchronization agent</p>
        </div>
        <button onClick={fetchLogs} className="nav-item-premium" style={{ width: 'auto', padding: '0.65rem 1.25rem', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <RefreshCcw size={14} /> Refresh Logs
        </button>
      </div>

      {/* Tab Nav */}
      <div className="anim-fade-up" style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface)', padding: '5px', borderRadius: 14, border: '1px solid var(--border)', marginBottom: '2rem', width: 'fit-content', flexWrap: 'wrap' }}>
        {[
          { key: 'install', label: '📥 Install Agent', },
          { key: 'pdf', label: '🖨️ PDF Printer Setup' },
          { key: 'logs', label: '📋 Node Logs' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s', background: tab === t.key ? 'var(--primary)' : 'transparent', color: tab === t.key ? '#000' : 'var(--text2)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── INSTALL TAB ── */}
      {tab === 'install' && (
        <div className="anim-fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: '2rem' }}>
          {/* Download Card */}
          <div>
            <div style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1), transparent)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 24, padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(212,175,55,0.08), transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg, #d4af37, #b8860b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(212,175,55,0.3)', flexShrink: 0 }}>
                  <Download size={30} color="#000" />
                </div>
                <div>
                  <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text)', marginBottom: '0.25rem' }}>LogiCrate Agent v4.2</h2>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text3)', fontWeight: 600 }}>Windows 10/11 · x64 · Self-contained installer</div>
                </div>
              </div>

              <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                This installer sets up a small background program on your PC that watches a folder for weighment PDFs and automatically syncs data to your cloud dashboard — no coding or technical knowledge needed.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <a
                  href={`/LogiRateSetup.exe`}
                  download
                  className="btn-premium-gold"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', textDecoration: 'none', padding: '0.9rem 1rem', fontSize: '0.88rem' }}
                >
                  <Download size={18} /> Download (.exe)
                </a>
                <a
                  href={`${API}/api/agent/config?company_id=${companyId}`}
                  download
                  className="nav-item-premium"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', textDecoration: 'none', padding: '0.9rem 1rem', fontSize: '0.88rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}
                >
                  <FileText size={18} /> Config File
                </a>
              </div>

              <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: 'rgba(34,197,94,0.07)', borderRadius: 12, border: '1px solid rgba(34,197,94,0.2)', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <ShieldCheck size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.78rem', color: 'var(--success)' }}>
                  <strong>No Python or VS Code required.</strong> Just download, double-click, and follow the simple setup wizard.
                </div>
              </div>
            </div>

            {/* System requirements */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Monitor size={16} color="var(--primary)" /> System Requirements
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  ['Operating System', 'Windows 10 or 11'],
                  ['Architecture', '64-bit (x64)'],
                  ['RAM', 'At least 2 GB'],
                  ['Disk Space', '50 MB free'],
                  ['Internet', 'Required for cloud sync'],
                  ['Permissions', 'Admin rights to install'],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: '0.75rem', background: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Installation Steps */}
          <div>
            <h3 style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Zap size={18} color="var(--primary)" /> Step-by-Step Installation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Step number="1" icon={<Download />} title="Download both files"
                desc="Click 'Download (.exe)' and 'Config File' above. Save both files to the same folder on your desktop (e.g. a folder called 'LogiCrate')."
                note="Place both files in the same folder before running the installer." />
              <Step number="2" icon={<MousePointer />} title="Run the installer"
                desc="Double-click the downloaded .exe file. If Windows shows a security warning, click 'More Info' then 'Run Anyway'. Right-click and select 'Run as Administrator' if prompted." />
              <Step number="3" icon={<FolderOpen />} title="Choose your watch folder"
                desc="The setup wizard will ask for a 'Watch Folder' — this is the folder where your PDF printer saves weighment slips. You can set this to C:\WeighmentPDFs (it will be created automatically)." />
              <Step number="4" icon={<Terminal />} title="Complete setup & minimize"
                desc="Click 'Finish' in the wizard. The agent will start silently in the background. You will see a small LogiCrate icon appear in your Windows System Tray (bottom-right near the clock)." />
              <Step number="5" icon={<CheckCircle />} title="Verify connection"
                desc="Come back to this page and click 'Refresh Logs'. If the agent connected successfully, you will see a green status. Print a test weighment slip to verify." />
            </div>
          </div>
        </div>
      )}

      {/* ── PDF PRINTER TAB ── */}
      {tab === 'pdf' && (
        <div className="anim-fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 24, padding: '2rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Printer size={24} color="var(--primary)" /> What is a Virtual PDF Printer?
              </h2>
              <p style={{ color: 'var(--text2)', lineHeight: 1.8, fontSize: '0.9rem', marginBottom: '1rem' }}>
                Your existing weighbridge software can already print bills. A <strong style={{ color: 'var(--text)' }}>virtual PDF printer</strong> acts like a normal printer — but instead of printing on paper, it saves the bill as a PDF file to a folder on your computer.
              </p>
              <p style={{ color: 'var(--text2)', lineHeight: 1.8, fontSize: '0.9rem' }}>
                The LogiCrate Agent watches that folder 24/7. Every time a new PDF appears, it automatically reads the data and syncs it to your cloud dashboard — without any extra steps from you.
              </p>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '1rem' }}>Recommended Free Software</h3>
              {[
                {
                  name: 'Bullzip PDF Printer',
                  badge: 'Most Popular',
                  url: 'https://www.bullzip.com/products/pdf/download.php',
                  desc: 'Best option. Free for personal/small business use. Supports auto-save to a fixed folder.',
                  color: 'var(--success)',
                },
                {
                  name: 'CutePDF Writer',
                  badge: 'Simplest',
                  url: 'http://www.cutepdf.com/Products/CutePDF/writer.asp',
                  desc: 'Very simple and lightweight. Good if you want a no-fuss setup.',
                  color: 'var(--primary)',
                },
                {
                  name: 'PDF24 Creator',
                  badge: 'Full Featured',
                  url: 'https://tools.pdf24.org/en/creator',
                  desc: 'Includes many extra PDF tools. Great if you also need to merge or edit PDFs.',
                  color: 'var(--warning)',
                },
              ].map(opt => (
                <a key={opt.name} href={opt.url} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none', marginBottom: '0.75rem' }}>
                  <div style={{ padding: '1rem 1.25rem', background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ChevronRight size={14} color="var(--primary)" /> {opt.name}
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: opt.color, background: `${opt.color}18`, padding: '2px 8px', borderRadius: 99, border: `1px solid ${opt.color}33`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{opt.badge}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text3)', lineHeight: 1.5 }}>{opt.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Printer size={18} color="var(--primary)" /> Setting Up Bullzip (Recommended)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              <Step number="1" icon={<Download />} title="Download & Install Bullzip"
                desc="Go to bullzip.com and download the free PDF Printer. Run the installer and click through the default options." />
              <Step number="2" icon={<Printer />} title="Open Bullzip Settings"
                desc="After installation, search for 'Bullzip PDF Printer' in the Windows Start Menu. Open it, then click 'Options' or 'Settings'." />
              <Step number="3" icon={<FolderOpen />} title="Set the Auto-Save Folder"
                desc='In Settings, find the "Output" tab. Set "File Name" to a fixed path like: C:\WeighmentPDFs\slip.pdf — Check "Auto-save" and set subfolder to "none".'
                note='The folder C:\WeighmentPDFs must match the watch folder you set during the LogiCrate agent installation.' />
              <Step number="4" icon={<Terminal />} title="Test it with your software"
                desc='Open your existing weighbridge billing software. Print one weighment slip as usual, but select "Bullzip PDF Printer" from the printer list. Check if a PDF appears in C:\WeighmentPDFs.' />
              <Step number="5" icon={<CheckCircle />} title="You are done!"
                desc="From now on, every time you print a slip using Bullzip, the PDF will be saved automatically and the LogiCrate agent will upload it to your dashboard within seconds." />
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--success-bg)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16, display: 'flex', gap: '0.75rem' }}>
              <CheckCircle size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.88rem', marginBottom: '0.3rem' }}>Already have a PDF printer?</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text2)', lineHeight: 1.6 }}>
                  Just set its auto-save folder to <code style={{ background: 'var(--bg2)', padding: '1px 6px', borderRadius: 6, fontSize: '0.78rem' }}>C:\WeighmentPDFs</code> and you are fully set up. The LogiCrate agent will detect it automatically.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LOGS TAB ── */}
      {tab === 'logs' && (
        <div className="anim-fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '2rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} color="var(--warning)" /> Node Telemetry Logs
          </h3>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}><span className="spinner" /></div>
          ) : errors.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg2)', borderRadius: 20, border: '1px dashed var(--border)' }}>
              <CheckCircle size={48} color="var(--success)" style={{ opacity: 0.15, marginBottom: '1.5rem' }} />
              <div style={{ fontWeight: 800, color: 'var(--text3)', fontSize: '1rem' }}>All Clear</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text3)', marginTop: '0.5rem' }}>No errors detected in your recent uploads.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {errors.map((e, i) => (
                <div key={i} style={{ padding: '1.25rem', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 16, display: 'flex', gap: '1rem' }}>
                  <Zap size={18} color="#fca5a5" style={{ flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fca5a5' }}>{e.file_name || 'Upload Error'}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text3)', fontWeight: 700 }}>{new Date(e.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.5 }}>{e.error_message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <SupportBot />
    </div>
  );
}
