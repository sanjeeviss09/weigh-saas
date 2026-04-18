import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor, Download, FileText, Printer, FolderOpen,
  CheckCircle, ChevronRight, ChevronLeft, AlertTriangle,
  RefreshCcw, Zap, ShieldCheck, ExternalLink, MessageSquare,
  X, Activity, Info, Terminal, MousePointer, Eye, Copy,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// ─── SUPPORT BOT ──────────────────────────────────────────────────────────────
const BOT_FAQ = [
  { q: "Agent closes or black screen?", a: "This is Windows SmartScreen. Right-click the downloaded .exe → 'Properties' → at the bottom check 'Unblock' → click OK. Then try again." },
  { q: "PDFs not uploading?", a: "Make sure you ran the 'Printer Setup Utility' first. Your weighbridge software must print to the 'LogiRate PDF Creator' printer, and the agent must be watching C:\\Weighments." },
  { q: "Dashboard not updating?", a: "Check the black terminal window that opens when you run the agent. If it says 'Connected' and shows your company ID, it is working. New PDFs will show in 10–30 seconds." },
  { q: "Is the Printer Setup safe?", a: "Yes. It simply uses the built-in Microsoft PDF driver to create a dedicated 'LogiRate PDF Creator' printer on your system so you don't need third-party apps." },
];

function SupportBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ text: "Hi! Need help setting up? Ask me anything below.", isBot: true }]);
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs]);
  const ask = (q, a) => setMsgs(p => [...p, { text: q, isBot: false }, { text: a, isBot: true }]);
  return (
    <>
      <button onClick={() => setOpen(!open)} style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', width: 54, height: 54, borderRadius: '50%', background: 'var(--primary)', color: '#000', border: 'none', cursor: 'pointer', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(212,175,55,0.4)', transition: 'transform 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>
      {open && (
        <div className="anim-scale-in" style={{ position: 'fixed', bottom: '5rem', right: '1.5rem', width: 'min(340px, calc(100vw - 2rem))', height: 420, background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, #d4af37, #b8860b)', color: '#000', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={16} /><div style={{ fontWeight: 900, fontSize: '0.88rem' }}>Setup Help Bot</div>
          </div>
          <div ref={ref} style={{ flex: 1, overflowY: 'auto', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.isBot ? 'flex-start' : 'flex-end', maxWidth: '88%', padding: '0.65rem 0.9rem', borderRadius: 14, background: m.isBot ? 'var(--surface2)' : 'var(--primary)', color: m.isBot ? 'var(--text)' : '#000', fontSize: '0.8rem', lineHeight: 1.55, border: m.isBot ? '1px solid var(--border)' : 'none' }}>{m.text}</div>
            ))}
          </div>
          <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tap a question:</div>
            {BOT_FAQ.map((f, i) => (
              <button key={i} onClick={() => ask(f.q, f.a)} style={{ textAlign: 'left', padding: '0.4rem 0.65rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text2)', fontSize: '0.72rem', cursor: 'pointer' }}>{f.q}</button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── WIZARD STEP INDICATOR ────────────────────────────────────────────────────
function WizardNav({ steps, current, onGo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <button onClick={() => i < current && onGo(i)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: i <= current ? 'pointer' : 'default', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem', transition: 'all 0.3s', background: i < current ? 'var(--success)' : i === current ? 'var(--primary)' : 'var(--surface2)', color: i < current ? '#fff' : i === current ? '#000' : 'var(--text3)', border: `2px solid ${i < current ? 'var(--success)' : i === current ? 'var(--primary)' : 'var(--border)'}` }}>
              {i < current ? <CheckCircle size={18} /> : i + 1}
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: i === current ? 'var(--primary)' : i < current ? 'var(--success)' : 'var(--text3)', textAlign: 'center', whiteSpace: 'nowrap' }}>{s.short}</div>
          </button>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, minWidth: 20, maxWidth: 60, background: i < current ? 'var(--success)' : 'var(--border)', transition: 'background 0.4s' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── INDIVIDUAL STEP CARD ─────────────────────────────────────────────────────
function InstructionStep({ num, icon, title, children, warning }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
      <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--primary-glow)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--primary)', fontWeight: 900, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{num}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {React.cloneElement(icon, { size: 15, color: 'var(--primary)' })}
          <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: '0.9rem' }}>{title}</span>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.65 }}>{children}</div>
        {warning && (
          <div style={{ marginTop: '0.65rem', padding: '0.6rem 0.85rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, fontSize: '0.75rem', color: 'var(--warning)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Info size={13} style={{ flexShrink: 0, marginTop: 2 }} />{warning}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STAGES ───────────────────────────────────────────────────────────────────
const STAGES = [
  { short: 'PDF Printer' },
  { short: 'Download & Run' },
  { short: 'Verify' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AgentSetup({ companyId }) {
  const [stage, setStage] = useState(0);
  const [errors, setErrors] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    async function fetchJoinCode() {
      if (!companyId) return;
      try {
        const { data } = await supabase.from('companies').select('join_code').eq('id', companyId).single();
        if (data?.join_code) setJoinCode(data.join_code);
      } catch {}
    }
    fetchJoinCode();
  }, [companyId]);

  const copyJoinCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleAgentDownload = async () => {
    try {
      const res = await fetch(`${API}/static/agent.py`);
      if (!res.ok) throw new Error('Not found');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'logicrate_agent.py';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not download automatically. Please contact your administrator.');
    }
  };

  const handleBatDownload = async () => {
    try {
      const res = await fetch(`${API}/static/LogiCrate_Setup.bat`);
      if (!res.ok) throw new Error('Not found');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'LogiCrate_Setup.bat';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not download the setup file. Please contact your administrator.');
    }
  };

  const fetchLogs = async () => {
    if (!companyId) return;
    setLogsLoading(true);
    try {
      const res = await fetch(`${API}/errors?company_id=${companyId}`);
      const json = await res.json();
      setErrors(json.data || []);
    } catch { } finally { setLogsLoading(false); }
  };

  useEffect(() => { if (stage === 2) fetchLogs(); }, [stage]);

  const nextStage = () => setStage(s => Math.min(s + 1, STAGES.length - 1));
  const prevStage = () => setStage(s => Math.max(s - 1, 0));

  return (
    <div className="page-content" style={{ maxWidth: 900 }}>
      {/* Page Header */}
      <div className="page-header anim-fade-up" style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'clamp(1.3rem, 3vw, 1.75rem)' }}>
          <Monitor size={26} color="var(--primary)" /> PC Agent Setup Wizard
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: '0.3rem', fontSize: '0.9rem' }}>Follow each step in order to connect your weighbridge to the cloud.</p>
      </div>

      {/* Wizard Navigation */}
      <WizardNav steps={STAGES} current={stage} onGo={setStage} />

      {/* ─── STAGE 0: PDF Printer ──────────────────────────────────────────── */}
      {stage === 0 && (
        <div className="anim-fade-up">
          {/* Intro Banner */}
          <div style={{ padding: '1.5rem', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 20, marginBottom: '1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Printer size={24} color="#000" />
            </div>
            <div>
              <h2 style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Step 1 of 3 — Install a PDF Printer</h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                Your weighbridge software prints paper slips. We need to <strong>redirect those prints to a PDF file</strong> instead — so LogiCrate can read and sync them to the cloud automatically.
                Install the free <strong>PDFCreator</strong> below to get started.
              </p>
            </div>
          </div>

          {/* Download Card */}
          <div style={{ background: 'var(--surface)', border: '2px solid var(--primary)', borderRadius: 24, padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', pointerEvents: 'none', opacity: 0.4 }} />

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ padding: '0.4rem 0.9rem', background: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: 10, fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Free Download</div>
              <div style={{ padding: '0.4rem 0.9rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, fontSize: '0.7rem', fontWeight: 900, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>100% Safe &amp; Trusted</div>
              <div style={{ padding: '0.4rem 0.9rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 10, fontSize: '0.7rem', fontWeight: 900, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Windows 10 / 11</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #1a73e8, #0d47a1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 20px rgba(26,115,232,0.35)' }}>
                <Printer size={28} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.2, marginBottom: '0.2rem' }}>PDFCreator</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text3)', fontWeight: 600 }}>by pdfforge.org · Free edition available · v5.x · ~30 MB installer</div>
              </div>
            </div>

            <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.75 }}>
              A professional open-source virtual PDF printer by pdfforge. Once installed, your weighbridge software will print bills as PDF files into a folder — which the LogiCrate PC Agent watches and syncs to your dashboard automatically.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href="https://www.pdfforge.org/pdfcreator/download"
                target="_blank"
                rel="noreferrer"
                className="btn-premium-gold"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', padding: '1rem 2rem', fontSize: '1rem' }}
              >
                <Download size={20} /> Download PDFCreator (.exe)
              </a>
              <a
                href="https://www.pdfforge.org/pdfcreator"
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text3)', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}
              >
                <ExternalLink size={14} /> Official Website (pdfforge.org)
              </a>
            </div>
          </div>

          {/* Setup Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
            <InstructionStep num="1" icon={<Download />} title="Download & Run the Installer">
              Click the gold button above to download <strong>PDFCreator-setup.exe</strong>. Double-click the downloaded file and follow the steps: click <strong>Next → Next → Finish</strong>. When asked, choose <strong>"PDFCreator (Free)"</strong> edition.
            </InstructionStep>

            <InstructionStep num="2" icon={<Printer />} title='Select "PDFCreator" when printing from your weighbridge software'
              warning='Make sure "PDFCreator" is selected — NOT your actual paper printer. This is how LogiCrate captures the slip data.'>
              In your billing/weighbridge software, click <strong>Print</strong>. In the printer dropdown, choose <strong>"PDFCreator"</strong> and click Print.
            </InstructionStep>

            <InstructionStep num="3" icon={<FolderOpen />} title='Set save location to C:\Weighments'>
              Bullzip will ask where to save the PDF. Type <code style={{ background: 'var(--bg2)', padding: '2px 8px', borderRadius: 6, color: 'var(--primary)', fontWeight: 900, fontFamily: 'monospace' }}>C:\Weighments</code> as the output folder and click <strong>Save</strong>.<br />
              <span style={{ color: 'var(--text3)', fontSize: '0.8rem', marginTop: '0.4rem', display: 'block' }}>
                💡 To make this permanent: In PDFCreator → Profile Settings → set the target folder to <code style={{ color: 'var(--primary)' }}>C:\Weighments</code>.
              </span>
            </InstructionStep>

            <InstructionStep num="4" icon={<CheckCircle />} title='Verify: Print a test slip and check the folder'>
              Print any weighment bill using <strong>PDFCreator</strong>. Then open File Explorer and go to <code style={{ background: 'var(--bg2)', padding: '2px 8px', borderRadius: 6, color: 'var(--primary)', fontWeight: 900, fontFamily: 'monospace' }}>C:\Weighments</code>. If a <strong>.pdf file appears there</strong>, the printer is set up correctly!
            </InstructionStep>
          </div>

          <div style={{ padding: '1rem 1.25rem', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
            <ShieldCheck size={20} color="var(--success)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--success)' }}>Why PDFCreator?</strong> Open-source, trusted by over 100 million users worldwide. The free edition is perfect for commercial use with no watermarks or time limits.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={nextStage} className="btn-premium-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              PDF Printer Installed <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}


      {/* ─── STAGE 1: Download & Run Agent ────────────────────────────────────── */}
      {stage === 1 && (
        <div className="anim-fade-up">
          <div style={{ padding: '1.5rem', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 20, marginBottom: '1.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Terminal size={28} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />
            <div>
              <h2 style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Step 2 of 3 — Download & Run the Agent</h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                Download <strong>one file</strong>, double-click it, and enter your Join Code when asked. <strong>That's it.</strong> Everything else is automatic.
              </p>
            </div>
          </div>

          {/* Join Code Display */}
          <div style={{ background: 'var(--surface)', border: '2px solid var(--primary)', borderRadius: 20, padding: '1.75rem', marginBottom: '1.75rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at top right, var(--primary-glow) 0%, transparent 50%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>Your Station Join Code</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 900, color: 'var(--text)', letterSpacing: '0.15em', padding: '0.5rem 1.5rem', background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)' }}>
                {joinCode || '...'}
              </div>
              <button onClick={copyJoinCode} className="btn-premium-gold" style={{ padding: '0.75rem 1.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {codeCopied ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy Code</>}
              </button>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '0.75rem' }}>
              Write this down or copy it. The agent will ask for it on first run.
            </div>
          </div>

          {/* Download Card — single .bat file */}
          <div style={{ background: 'var(--surface)', border: '2px solid var(--primary)', borderRadius: 20, padding: '2rem', marginBottom: '1.75rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', pointerEvents: 'none', opacity: 0.4 }} />
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ padding: '0.4rem 0.9rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, fontSize: '0.7rem', fontWeight: 900, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>One-Click Setup</div>
              <div style={{ padding: '0.4rem 0.9rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 10, fontSize: '0.7rem', fontWeight: 900, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No Technical Knowledge Needed</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #d4af37, #b8860b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 20px rgba(212,175,55,0.3)' }}>
                <Terminal size={28} color="#000" />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text)' }}>LogiCrate_Setup.bat</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>Downloads & installs everything automatically — just double-click</div>
              </div>
            </div>
            <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              This single file will <strong>automatically install Python</strong>, download the required libraries, create the <code style={{ background: 'var(--bg2)', padding: '2px 6px', borderRadius: 4, color: 'var(--primary)', fontWeight: 800 }}>C:\Weighments</code> folder, and start the agent. <strong>You only need to enter your Join Code.</strong>
            </p>
            <button
              onClick={handleBatDownload}
              className="btn-premium-gold"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1.1rem', fontSize: '1.05rem', width: '100%', cursor: 'pointer', border: 'none' }}
            >
              <Download size={22} /> Download LogiCrate_Setup.bat
            </button>
          </div>

          {/* Simple steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            <InstructionStep num="1" icon={<Download />} title="Download the file above">
              Save <strong>LogiCrate_Setup.bat</strong> to your <strong>Desktop</strong> or any folder you can find easily.
            </InstructionStep>

            <InstructionStep num="2" icon={<MousePointer />} title="Double-click to run it"
              warning='Windows may show a blue popup saying "Windows protected your PC". Click "More info" → then click "Run anyway". This is safe.'>
              Double-click <strong>LogiCrate_Setup.bat</strong>. A green text window will open. It will automatically install everything needed. <strong>Wait for it to finish</strong> (1-2 minutes).
            </InstructionStep>

            <InstructionStep num="3" icon={<Terminal />} title='Enter your Join Code when asked'>
              The window will show: <strong>"Enter your station Join Code:"</strong><br />
              Type or paste your code: <code style={{ background: 'var(--bg2)', padding: '2px 8px', borderRadius: 6, color: 'var(--primary)', fontWeight: 900, fontFamily: 'monospace', fontSize: '1rem' }}>{joinCode || 'GOLD-XXXXXX'}</code> and press <strong>Enter</strong>.
            </InstructionStep>

            <InstructionStep num="4" icon={<Eye />} title="You'll see green checkmarks — minimize the window">
              When you see:<br />
              <code style={{ display: 'block', background: 'var(--bg)', padding: '0.65rem 0.85rem', borderRadius: 10, marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--success)', lineHeight: 1.8, border: '1px solid var(--border)', fontFamily: 'monospace' }}>
                [✓] Station: {'{Your Station Name}'}<br />
                [✓] Agent is RUNNING. Watching for PDFs...
              </code>
              <strong style={{ marginTop: '0.5rem', display: 'block' }}>Minimize the window (click the — button). Do NOT click X.</strong>
            </InstructionStep>
          </div>

          <div style={{ padding: '1rem 1.25rem', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <ShieldCheck size={20} color="var(--success)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--success)' }}>Zero technical skills needed.</strong> No Python, no commands, no config files. Just download → double-click → enter code → done!
            </div>
          </div>

          <div style={{ padding: '1rem 1.25rem', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 14, display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <Info size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--primary)' }}>Next time:</strong> Just double-click the same file again. It will skip the setup and start the agent instantly — no Join Code required.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <button onClick={prevStage} className="nav-item-premium" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <ChevronLeft size={16} /> Back
            </button>
            <button onClick={nextStage} className="btn-premium-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 2rem' }}>
              Agent is Running <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STAGE 2: Verify ───────────────────────────────────────────────── */}
      {stage === 2 && (
        <div className="anim-fade-up">
          <div style={{ padding: '1.5rem', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, marginBottom: '1.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <CheckCircle size={28} color="var(--success)" style={{ flexShrink: 0, marginTop: 3 }} />
            <div>
              <h2 style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Step 3 of 3 — Verify Your Connection</h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: 1.7 }}>Check the logs below to confirm your agent is syncing. If you see no errors and the count goes up when you print a slip — you're fully connected!</p>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.75rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertTriangle size={18} color="var(--warning)" /> Node Telemetry Logs
              </h3>
              <button onClick={fetchLogs} className="nav-item-premium" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.82rem' }}>
                <RefreshCcw size={14} /> Refresh Logs
              </button>
            </div>
            {logsLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}><span className="spinner" /></div>
            ) : errors.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--bg2)', borderRadius: 16, border: '1px dashed var(--border)' }}>
                <CheckCircle size={40} color="var(--success)" style={{ opacity: 0.2, display: 'block', margin: '0 auto 1rem' }} />
                <div style={{ fontWeight: 800, color: 'var(--text3)' }}>No errors detected</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '0.4rem' }}>Print a test slip and click Refresh Logs to verify upload.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {errors.map((e, i) => (
                  <div key={i} style={{ padding: '1rem 1.25rem', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, display: 'flex', gap: '0.875rem' }}>
                    <Zap size={16} color="#fca5a5" style={{ flexShrink: 0, marginTop: 3 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fca5a5', marginBottom: '0.3rem' }}>{e.file_name || 'Upload Error'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>{e.error_message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <button onClick={prevStage} className="nav-item-premium" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <ChevronLeft size={16} /> Back
            </button>
            <button onClick={() => setStage(0)} className="nav-item-premium" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: '0.85rem' }}>
              Start Over
            </button>
          </div>
        </div>
      )}

      <SupportBot />
    </div>
  );
}
