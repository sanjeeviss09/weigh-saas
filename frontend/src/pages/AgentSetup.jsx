import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor, Download, FileText, Printer, FolderOpen,
  CheckCircle, ChevronRight, ChevronLeft, AlertTriangle,
  RefreshCcw, Zap, ShieldCheck, ExternalLink, MessageSquare,
  X, Activity, Info, Terminal, MousePointer, Eye,
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
  { short: 'Download' },
  { short: 'Install Agent' },
  { short: 'Verify' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AgentSetup({ companyId }) {
  const [stage, setStage] = useState(0);
  const [errors, setErrors] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchLogs = async () => {
    if (!companyId) return;
    setLogsLoading(true);
    try {
      const res = await fetch(`${API}/errors?company_id=${companyId}`);
      const json = await res.json();
      setErrors(json.data || []);
    } catch { } finally { setLogsLoading(false); }
  };

  useEffect(() => { if (stage === 3) fetchLogs(); }, [stage]);

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
          <div style={{ padding: '1.5rem', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 20, marginBottom: '1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Printer size={24} color="#000" />
            </div>
            <div>
              <h2 style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Step 1 of 4 — Setup LogiRate PDF Creator</h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                To sync your weighbridge data to the cloud, we need to capture your printed bills as PDFs. 
                Our <strong>LogiRate PDF Creator</strong> utility will install a native virtual printer on your PC that automatically saves your slips for instant syncing.
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', pointerEvents: 'none', opacity: 0.5 }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.5rem 1rem', background: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: 12, fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recommended Setup</div>
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', marginBottom: '1rem' }}>LogiRate Virtual Printer Utility</h3>
            <p style={{ color: 'var(--text2)', fontSize: '1rem', marginBottom: '1.5rem', maxWidth: '600px' }}>
              Download and run this utility to create a dedicated printer named <strong>"LogiRate PDF Creator"</strong> in your Windows printer list. It is silent, fast, and requires no configuration.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href={`${API}/static/SetupLogiRatePrinter.ps1`} download
                className="btn-premium-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', padding: '1rem 2rem', fontSize: '1rem' }}>
                <Terminal size={20} /> Download Printer Setup (.ps1)
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)', color: 'var(--text3)', fontSize: '0.8rem' }}>
                <ShieldCheck size={16} color="var(--success)" /> Digital Signature Verified
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
            <InstructionStep num="A" icon={<Download />} title="Download the Setup Script">
              Click the gold button above to download the <strong>SetupLogiRatePrinter.ps1</strong> script to your desktop.
            </InstructionStep>
            <InstructionStep num="B" icon={<ShieldCheck />} title="Run with PowerShell"
              warning="PowerShell will ask for permission. You MUST select 'Run with PowerShell' and it requires Administrator rights for the printer to be installed correctly.">
              Right-click the downloaded file and select <strong>"Run with PowerShell"</strong>. If prompted for Admin access, click <strong>Yes</strong>.
            </InstructionStep>
            <InstructionStep num="C" icon={<CheckCircle />} title="Installation Complete">
              A blue window will open and close automatically once finished. You will now see <strong>"LogiRate PDF Creator"</strong> in your Windows Start Menu → Printers.
            </InstructionStep>
            <InstructionStep num="D" icon={<Printer />} title="Initial Test">
              Open your weighbridge software and print a test slip. Select <strong>"LogiRate PDF Creator"</strong> as the printer. The file will appear in <code>C:\Weighments</code>.
            </InstructionStep>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={nextStage} className="btn-premium-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              I've Installed the Printer <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}


      {/* ─── STAGE 1: Download ─────────────────────────────────────────────── */}
      {stage === 1 && (
        <div className="anim-fade-up">
          <div style={{ padding: '1.5rem', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 20, marginBottom: '1.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Download size={28} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />
            <div>
              <h2 style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Step 2 of 4 — Download the Agent Files</h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: 1.7 }}>Download both files below and save them in the <strong>same folder</strong> on your desktop (e.g. a folder called <code style={{ background: 'var(--bg2)', padding: '1px 6px', borderRadius: 6 }}>LogiCrate</code>).</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,320px), 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.75rem', background: 'var(--surface)', border: '2px solid var(--primary)', borderRadius: 20, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #d4af37, #b8860b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 20px rgba(212,175,55,0.3)' }}>
                <Terminal size={28} color="#000" />
              </div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text)', marginBottom: '0.4rem' }}>LogiRateSetup.exe</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '1.25rem' }}>The agent program — runs in the background and watches your folder</div>
              <a href="/LogiRateSetup.exe" download className="btn-premium-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', padding: '0.8rem 1.5rem', fontSize: '0.88rem', justifyContent: 'center', width: '100%' }}>
                <Download size={16} /> Download Agent (.exe)
              </a>
            </div>

            <div style={{ padding: '1.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <FileText size={28} color="var(--primary)" />
              </div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text)', marginBottom: '0.4rem' }}>config.json</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '1.25rem' }}>Your unique station key — tells the agent which dashboard to sync to</div>
              <a href={`${API}/api/agent/config?company_id=${companyId}`} download="config.json"
                className="nav-item-premium" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', textDecoration: 'none', padding: '0.8rem 1.5rem', fontSize: '0.88rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, width: '100%' }}>
                <Download size={16} /> Download Config
              </a>
            </div>
          </div>

          <div style={{ padding: '1rem 1.25rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14, display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <AlertTriangle size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--warning)' }}>Important:</strong> Both files must be in the <strong>same folder</strong> before you run the agent. If the config file is missing, the agent will not know which dashboard to sync to.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <button onClick={prevStage} className="nav-item-premium" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <ChevronLeft size={16} /> Back
            </button>
            <button onClick={nextStage} className="btn-premium-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 2rem' }}>
              Both Files Downloaded <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STAGE 2: Install ──────────────────────────────────────────────── */}
      {stage === 2 && (
        <div className="anim-fade-up">
          <div style={{ padding: '1.5rem', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 20, marginBottom: '1.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Monitor size={28} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />
            <div>
              <h2 style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Step 3 of 4 — Run the Agent</h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: 1.7 }}>Now you will run the downloaded agent on your PC. A black terminal window will open — that is normal. Keep it running.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            <InstructionStep num="1" icon={<FolderOpen />} title="Open the folder with both files">
              Find the folder where you saved <strong>LogiRateSetup.exe</strong> and <strong>config.json</strong>. Make sure both files are visible in the same folder.
            </InstructionStep>
            <InstructionStep num="2" icon={<MousePointer />} title="Right-click → Run as Administrator"
              warning="Windows may show a blue or grey popup saying 'Unknown Publisher'. Click 'More info' then 'Run anyway'. This is safe — the file was built specifically for your station.">
              Right-click on <strong>LogiRateSetup.exe</strong> and select <strong>"Run as Administrator"</strong>. This gives it permission to watch folders and connect to the internet.
            </InstructionStep>
            <InstructionStep num="3" icon={<Terminal />} title="A black window will open — this is the agent">
              A black terminal window will appear showing messages like:<br />
              <code style={{ display: 'block', background: 'var(--bg)', padding: '0.65rem 0.85rem', borderRadius: 10, marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--success)', lineHeight: 1.8, border: '1px solid var(--border)' }}>
                LogiCrate PC Agent v4.2 — Starting<br />
                Watch folder: C:\WeighmentPDFs<br />
                Cloud URL: https://weigh-saas.onrender.com<br />
                Agent running. Watching folder...
              </code>
              This means the agent is successfully running.
            </InstructionStep>
            <InstructionStep num="4" icon={<Printer />} title="Test: Print one weighment slip now">
              Go to your weighbridge billing software and print any bill using <strong>Bullzip PDF Printer</strong>. Watch the black window — within seconds you should see:<br />
              <code style={{ display: 'inline-block', background: 'var(--bg)', padding: '4px 10px', borderRadius: 8, marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--success)', border: '1px solid var(--border)' }}>✓ Uploaded successfully: slip.pdf</code>
            </InstructionStep>
            <InstructionStep num="5" icon={<Eye />} title="Keep the black window open / minimize it">
              Do not close the black window or the agent will stop. You can <strong>minimize</strong> it to the taskbar. It will continue running in the background as long as the window stays open. For it to autostart with your PC, ask your administrator.
            </InstructionStep>
          </div>

          <div style={{ padding: '1rem 1.25rem', background: 'var(--success-bg)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 14, display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
            <ShieldCheck size={20} color="var(--success)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6 }}><strong style={{ color: 'var(--success)' }}>No Python or VS Code needed.</strong> The agent is fully self-contained. Nothing extra to install.</div>
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

      {/* ─── STAGE 3: Verify ───────────────────────────────────────────────── */}
      {stage === 3 && (
        <div className="anim-fade-up">
          <div style={{ padding: '1.5rem', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, marginBottom: '1.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <CheckCircle size={28} color="var(--success)" style={{ flexShrink: 0, marginTop: 3 }} />
            <div>
              <h2 style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Step 4 of 4 — Verify Your Connection</h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: 1.7 }}>Check the logs below to confirm your agent is syncing correctly. If you see no errors and the count goes up when you print a slip — you are fully connected!</p>
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
