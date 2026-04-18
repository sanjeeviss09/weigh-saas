import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Scale, LayoutDashboard, Database, Wrench, LogOut, Building2, Truck, ShieldAlert, ShieldCheck, HelpCircle, MessageCircle, Mail, X, BarChart2, Settings, User, IndianRupee, Shield } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Dashboard from './pages/Dashboard';
import Weighments from './pages/Weighments';
import Corrections from './pages/Corrections';
import Analytics from './pages/Analytics';
import Accounts from './pages/Accounts';
import Admin from './pages/Admin';
import SuperAdmin from './pages/SuperAdmin';
import AdminPortal from './pages/AdminPortal';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CompanyProfile from './pages/CompanyProfile';
import Pricing from './pages/Pricing';
import AgentSetup from './pages/AgentSetup';
import OperatorSettings from './pages/OperatorSettings';
import LandingPage from './pages/LandingPage';
import SupportWidget from './components/SupportWidget';
import ErrorBoundary from './components/ErrorBoundary';

const SUPER_ADMIN_EMAIL = 'sanjeevinick09@gmail.com';

// ─── Auth Guard ─────────────────────────────────────────────────────
function ProtectedApp() {
  const [session, setSession] = useState(undefined);
  const [error, setError] = useState(null);
  const [debugLog, setDebugLog] = useState([]);

  const addLog = (msg) => {
    console.log(msg);
    setDebugLog(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${msg}`]);
  };

  useEffect(() => {
    // Timeout to prevent infinite blank screen
    const timer = setTimeout(() => {
      // Only show timeout error if session is strictly undefined (initial load state)
      // We use a functional state update to safely check the current state without adding it to dependencies.
      setSession(currentSession => {
        if (currentSession === undefined) {
           setError('Connection Timeout: Unable to reach authentication server. Please check your Supabase keys in .env');
        }
        return currentSession;
      });
    }, 6000);

    // Initial session fetch
    addLog("Mount: Calling getSession()...");
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        addLog(`getSession() resolved. session=${session ? session.user.email : 'null'}, error=${error?.message || 'none'}`);
        setSession(session);
      })
      .catch(err => {
        addLog(`getSession() catch block: ${err.message}`);
        setError(`Supabase Error: ${err.message}`);
      });

    // Listen to auth changes (login, logout, refresh)
    addLog("Mount: Subscribing to onAuthStateChange...");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      addLog(`onAuthStateChange event: ${event}. session=${s ? s.user.email : 'null'}`);
      setSession(s);
      setError(null);
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []); // <-- Empty dependency array ensures this only runs once on mount

  if (error) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'2rem', textAlign:'center' }}>
      <ShieldAlert size={48} color="var(--danger)" style={{ marginBottom:'1rem' }} />
      <h3 style={{ marginBottom:'0.5rem' }}>Authentication Error</h3>
      <p style={{ color:'var(--text2)', maxWidth:'400px' }}>{error}</p>
      <button className="btn btn-secondary mt-2" onClick={() => window.location.reload()}>Retry Connection</button>
    </div>
  );

  if (session === undefined) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ textAlign:'center' }}>
        <span className="spinner" />
        <p style={{ marginTop:'1rem', color:'var(--text3)', fontSize:'0.8rem' }}>Connecting to Logicrate Cloud...</p>
      </div>
      <div style={{ marginTop: '2rem', textAlign: 'left', background: '#000', color: '#0f0', padding: '1rem', borderRadius: 8, fontSize: '0.7rem', width: '80%', maxWidth: '500px', overflowX: 'auto', border: '1px solid #333' }}>
         <strong>Auth Debug Log (spinner):</strong><br/>
         {debugLog.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );

  return (
    <>
      <Routes>
        <Route path="/home"            element={<LandingPage />} />
        <Route path="/"                element={!session ? <LandingPage /> : <AppShell session={session} />} />
        <Route path="/login"           element={!session ? <Login />           : <Navigate to="/" />} />
        <Route path="/signup"           element={!session ? <Signup />        : <Navigate to="/" />} />
        <Route path="/complete-profile" element={session ? <CompanyProfile /> : <Navigate to="/login" />} />
        <Route path="/pricing"          element={session ? <Pricing /> : <Navigate to="/login" />} />
        <Route path="/*"               element={session ? <AppShell session={session} /> : <Navigate to="/login" />} />
      </Routes>
      <SupportWidget />
    </>
  );
}

// ─── Main Shell ──────────────────────────────────────────────────────
function AppShell({ session }) {
  const navigate = useNavigate();
  const location = useLocation();
  const email = session.user.email;
  const meta  = session.user.user_metadata || {};
  const isSuper = email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase().trim();
  
  const companyId   = meta.company_id   || null;
  const companyName = meta.company_name || (isSuper ? 'LogiCrate Global' : 'Your Company');
  const rawRole     = isSuper ? 'super_admin' : (meta.role || 'client_company');
  // Normalize the role so legacy 'operator' or weird strings always map correctly
  const role        = isSuper ? 'super_admin' : (rawRole === 'client_company' ? 'client_company' : 'weighbridge_station');

  // ── ALL HOOKS MUST COME BEFORE ANY CONDITIONAL RETURN ──
  const [showHelp, setShowHelp] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // ── NOW safe to do conditional redirects after all hooks ──
  if (!isSuper && !meta.profile_completed) {
    return <Navigate to={`/complete-profile?mode=${role}`} replace />;
  }
  if (!isSuper && role === 'weighbridge_station' && !meta.plan) {
    return <Navigate to="/pricing" replace />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/home');
  };

  const handleSwitchAccount = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Navigation logic
  let baseLinks = [];
  if (isSuper) {
    baseLinks = [
      { to: '/admin-portal', icon: <ShieldCheck size={17} />, label: 'ADMIN PORTAL', end: true },
      { to: '/agent-setup',  icon: <Truck size={17} />,       label: 'PC Agent Hub' },
      { to: '/weighments',   icon: <Database size={17} />,    label: 'Global Weighments' },
      { to: '/analytics',    icon: <BarChart2 size={17} />,   label: 'Global Analytics' },
      { to: '/corrections',  icon: <Wrench size={17} />,      label: 'Global Errors' },
      { to: '/settings',     icon: <Settings size={17} />,    label: 'Settings' },
    ];
  } else if (role === 'client_company') {
    baseLinks = [
      { to: '/',            icon: <LayoutDashboard size={17} />, label: 'Overview', end: true },
      { to: '/analytics',   icon: <BarChart2 size={17} />,       label: 'Analytics & Reports' },
      { to: '/weighments',  icon: <Database size={17} />,        label: 'Weighments' },
      { to: '/corrections', icon: <Wrench size={17} />,          label: 'Corrections' },
      { to: '/settings',    icon: <Settings size={17} />,        label: 'Settings' },
    ];
  } else if (role === 'weighbridge_station') {
    baseLinks = [
      { to: '/',            icon: <LayoutDashboard size={17} />, label: 'Overview', end: true },
      { to: '/tasks',       icon: <Database size={17} />,        label: 'Weighment Tasks' },
      { to: '/accounts',    icon: <IndianRupee size={17} />,     label: 'Financial Hub' },
      { to: '/admin',       icon: <Shield size={17} />,          label: 'Station Config' },
      { to: '/agent-setup', icon: <Truck size={17} />,           label: 'PC Agent Hub' },
      { to: '/settings',    icon: <Settings size={17} />,        label: 'Settings' },
    ];
  }

  console.log("Current User Role:", role, "Links:", baseLinks.map(l => l.label));

  const finalLinks = baseLinks;

  return (
    <div className={`app-shell ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Top Bar */}
      <div className="mobile-nav-header anim-fade-in" style={{ 
        position: 'sticky', top: 0, zIndex: 1000, 
        background: 'rgba(5,6,15,0.8)', backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        height: 70, padding: '0 1.25rem'
      }}>
        <button className="nav-item-premium" onClick={() => setIsSidebarOpen(true)} style={{ width: 44, height: 44, padding: 0, justifyContent: 'center', background: 'var(--surface2)', borderRadius: 12 }}>
          <Scale size={20} color="var(--primary)" />
        </button>
        <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em' }}>
           <Truck size={22} color="var(--primary)" className="anim-pulse-glow" /> LogiCrate
        </div>
        <div style={{ width: 44 }} /> {/* Spacer */}
      </div>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)} />

      {/* ── Sidebar ── */}
      <div className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo" style={{ marginBottom: '2.5rem', display:'flex', alignItems:'center', gap:'1rem', padding: '0.5rem' }}>
          <div className="anim-pulse-glow" style={{ background:'var(--primary-glow)', padding:'8px', borderRadius:'14px', display:'flex', border: '1px solid rgba(212,175,55,0.4)' }}>
            <Truck size={24} color="var(--primary)" />
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--text)', letterSpacing: '-0.04em' }}>LogiCrate</span>
        </div>

        {/* Live System Status - High Tech Feel */}
        <div style={{ marginBottom: '2rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
           <div className="glow-dot" style={{ width: 8, height: 8 }} />
           <div style={{ fontSize: '0.7rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--text)', letterSpacing: '0.02em' }}>NETWORK: SECURE</div>
              <div style={{ color: 'var(--text3)', fontSize: '0.6rem', fontWeight: 700 }}>CLOUD SYNC ENCRYPTED</div>
           </div>
        </div>

        {/* Global Admin Link - Dedicated Portal */}
        {isSuper && (
          <NavLink to="/admin-portal" className="btn-premium-gold" style={{ height: 48, marginBottom: '2rem', fontSize: '0.75rem', borderRadius: 14 }}>
            <ShieldCheck size={18} /> ADMIN CONSOLE
          </NavLink>
        )}

        {/* Role badge */}
        <div className="anim-fade-in" style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.75rem', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)', marginBottom:'1.5rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: isSuper ? 'var(--primary-glow)' : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink:0 }}>
            {isSuper
              ? <ShieldCheck size={18} color="var(--primary)" />
              : role === 'client_company'
                ? <Building2 size={18} color="var(--primary)" />
                : <Scale size={18} color="var(--warning)" />
            }
          </div>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:'0.8rem', fontWeight:800, color: 'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', letterSpacing:'-0.01em' }}>
              {isSuper ? 'Global Admin' : companyName}
            </div>
            <div style={{ fontSize:'0.65rem', color: 'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600 }}>
              {isSuper ? 'Logicrate Owner' : (role === 'client_company' ? 'Client' : 'Weighbridge')}
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {finalLinks.filter(l => l.label !== 'ADMIN PORTAL').map((link, i) => (
            <NavLink key={link.to} to={link.to} end={link.end}
              className={({ isActive }) => `nav-item-premium ${isActive ? 'active' : ''} anim-fade-in`}
              style={{ animationDelay: `${0.1 + (i * 0.05)}s` }}>
              {link.icon} {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.85rem 1rem' }}>
             <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(45deg, #d4af37, #ffd700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: '0.75rem' }}>
               {email?.charAt(0).toUpperCase()}
             </div>
             <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email?.split('@')[0]}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text3)' }}>User Profile</div>
             </div>
          </div>
          <button className="nav-item-premium" onClick={() => setShowHelp(true)}>
            <HelpCircle size={17} /> Help Centre
          </button>
          <button className="nav-item-premium" onClick={handleSwitchAccount} style={{ color:'var(--text2)' }}>
            <User size={17} /> Switch Account
          </button>
          <button className="nav-item-premium" onClick={handleLogout} style={{ color:'var(--danger)', fontWeight: 700 }}>
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div className="card-luxury" style={{ maxWidth:'450px', width:'100%', padding: '2rem', position: 'relative' }}>
            <button style={{ position:'absolute', top:'1rem', right:'1rem', padding:'0.4rem', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }} onClick={() => setShowHelp(false)}>
              <X size={20} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background:'var(--success-bg)', width:'56px', height:'56px', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
                <MessageCircle size={28} color="var(--success)" />
              </div>
              <h2 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Help Centre</h2>
              <p style={{ color:'var(--text2)', fontSize:'0.9rem' }}>Get support from the Logicrate team</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href="https://wa.me/919500593997" target="_blank" rel="noreferrer" className="btn btn-secondary btn-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', border: '1px solid #22c55e33', color: '#22c55e' }}>
                <MessageCircle size={18} /> Chat on WhatsApp (+91 95005 93997)
              </a>
              <a href="mailto:srikadaieswara09@gmail.com" className="btn btn-secondary btn-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                <Mail size={18} /> srikadaieswara09@gmail.com
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <div className="main" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="page-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/admin-portal" element={<AdminPortal userEmail={email} />} />
            <Route path="/super"        element={<SuperAdmin  userEmail={email} />} />
            <Route path="/settings"     element={<OperatorSettings companyId={companyId} userEmail={email} />} />
            
            {isSuper && (
              <>
                 <Route path="/"            element={<Navigate to="/admin-portal" />} />
                 <Route path="/weighments"  element={<Weighments companyId={null} companyName={null} />} />
                 <Route path="/analytics"   element={<Analytics companyId={null} companyName={null} />} />
                 <Route path="/corrections" element={<Corrections companyId={null} />} />
                 <Route path="/agent-setup" element={<AgentSetup companyId={null} />} />
              </>
            )}
  
            {role === 'client_company' && !isSuper && (
              <>
                <Route path="/"            element={<Dashboard companyId={companyId} companyName={companyName} />} />
                <Route path="/weighments"  element={<Weighments companyId={companyId} companyName={companyName} />} />
                <Route path="/analytics"   element={<Analytics companyId={companyId} companyName={companyName} />} />
                <Route path="/corrections" element={<Corrections companyId={companyId} />} />
                <Route path="/settings"    element={<OperatorSettings companyId={companyId} userEmail={email} />} />
              </>
            )}
            {role === 'weighbridge_station' && !isSuper && (
              <>
                <Route path="/"            element={<Dashboard companyId={companyId} companyName={companyName} />} />
                <Route path="/tasks"       element={<Weighments companyId={companyId} companyName={companyName} />} />
                <Route path="/weighments"  element={<Navigate to="/tasks" />} />
                <Route path="/admin"       element={<Admin companyId={companyId} userEmail={email} />} />
                <Route path="/accounts"    element={<Accounts />} />
                <Route path="/agent-setup" element={<AgentSetup companyId={companyId} />} />
                <Route path="/settings"    element={<OperatorSettings companyId={companyId} userEmail={email} />} />
              </>
            )}
            {isSuper && !role && <Route path="/" element={<Navigate to="/admin-portal" />} />}
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <ProtectedApp />
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
