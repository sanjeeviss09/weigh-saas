import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Scale, LayoutDashboard, Database, Wrench, LogOut, Building2, Truck, ShieldAlert, ShieldCheck, HelpCircle, MessageCircle, Mail, X, BarChart2, Download, Settings, User, IndianRupee } from 'lucide-react';
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
import SignupOperator from './pages/SignupOperator';
import CompanyProfile from './pages/CompanyProfile';
import AgentSetup from './pages/AgentSetup';
import OperatorSettings from './pages/OperatorSettings';
import LandingPage from './pages/LandingPage';
import SupportWidget from './components/SupportWidget';

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
        <Route path="/signup"          element={!session ? <Signup />          : <Navigate to="/" />} />
        <Route path="/signup-operator" element={!session ? <SignupOperator /> : <Navigate to="/" />} />
        <Route path="/complete-profile" element={<CompanyProfile />} />
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
  const role        = isSuper ? 'super_admin' : (meta.role || 'company');
  const [showHelp, setShowHelp] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    // Auto-close sidebar on mobile when navigating
    setIsSidebarOpen(false);
  }, [location.pathname]);

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
      { to: '/accounts',     icon: <IndianRupee size={17} />, label: 'Financial Hub' },
      { to: '/corrections',  icon: <Wrench size={17} />,      label: 'Global Errors' },
      { to: '/settings',     icon: <Settings size={17} />,    label: 'Settings' },
    ];
  } else if (role === 'company') {
    baseLinks = [
      { to: '/',            icon: <LayoutDashboard size={17} />, label: 'Overview', end: true },
      { to: '/analytics',   icon: <BarChart2 size={17} />,       label: 'Analytics & Reports' },
      { to: '/weighments',  icon: <Database size={17} />,        label: 'Weighments' },
      { to: '/corrections', icon: <Wrench size={17} />,          label: 'Corrections' },
      { to: '/admin',       icon: <Building2 size={17} />,       label: 'Station Profile' },
      { to: '/settings',    icon: <Settings size={17} />,        label: 'Settings' },
    ];
  } else {
    baseLinks = [
      { to: '/',            icon: <LayoutDashboard size={17} />, label: 'Overview', end: true },
      { to: '/tasks',       icon: <Database size={17} />,        label: 'Weighment Tasks' },
      { to: '/accounts',    icon: <IndianRupee size={17} />,     label: 'Financial Hub' },
      { to: '/agent-setup', icon: <Truck size={17} />,           label: 'PC Agent Hub' },
      { to: '/settings',    icon: <Settings size={17} />,        label: 'Settings' },
    ];
  }

  console.log("Current User Role:", role, "Links:", baseLinks.map(l => l.label));

  const finalLinks = baseLinks;

  return (
    <div className={`app-shell ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Top Bar */}
      <div className="mobile-nav-header">
        <button className="btn-ghost" onClick={() => setIsSidebarOpen(true)} style={{ padding: '0.5rem' }}>
          <Scale size={24} color="var(--primary)" />
        </button>
        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
           <Truck size={18} color="var(--primary)" /> LogiCrate
        </div>
        <div style={{ width: 34 }} /> {/* Spacer */}
      </div>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)} />

      {/* ── Sidebar ── */}
      <div className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo" style={{ marginBottom: '1.75rem', letterSpacing:'-0.03em', display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <div className="anim-pulse-glow" style={{ background:'var(--primary-glow)', padding:'6px', borderRadius:'10px', display:'flex' }}>
            <Truck size={22} color="var(--primary)" />
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text)' }}>LogiCrate</span>
        </div>

        {/* Live System Status */}
        <div style={{ marginBottom: '1.5rem', padding: '0.6rem 0.85rem', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
           <div className="glow-dot" />
           <div style={{ fontSize: '0.7rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>System Online</div>
              <div style={{ color: 'var(--text3)', fontSize: '0.6rem' }}>Syncing to Cloud v4.2</div>
           </div>
        </div>

        {/* Global Admin Link - Dedicated Portal */}
        {isSuper && (
          <NavLink to="/admin-portal" className="nav-item-premium" style={{ background: 'var(--primary)', color: '#000', fontWeight: 800, marginBottom: '1.5rem', borderRadius: '12px', justifyContent: 'center', boxShadow: '0 8px 16px var(--primary-glow)' }}>
            <ShieldCheck size={18} /> OPEN ADMIN PORTAL
          </NavLink>
        )}

        {/* Role badge */}
        <div className="anim-fade-in" style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.75rem', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)', marginBottom:'1.5rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: isSuper ? 'var(--primary-glow)' : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink:0 }}>
            {isSuper
              ? <ShieldCheck size={18} color="var(--primary)" />
              : role === 'company'
                ? <Building2 size={18} color="var(--primary)" />
                : <Truck size={18} color="var(--warning)" />
            }
          </div>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:'0.8rem', fontWeight:800, color: 'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', letterSpacing:'-0.01em' }}>
              {isSuper ? 'Global Admin' : companyName}
            </div>
            <div style={{ fontSize:'0.65rem', color: 'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600 }}>
              {isSuper ? 'Logicrate Owner' : role}
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
  
            {role === 'company' && !isSuper && (
              <>
                <Route path="/"            element={<Dashboard companyId={companyId} companyName={companyName} />} />
                <Route path="/weighments"  element={<Weighments companyId={companyId} companyName={companyName} />} />
                <Route path="/analytics"   element={<Analytics companyId={companyId} companyName={companyName} />} />
                <Route path="/corrections" element={<Corrections companyId={companyId} />} />
                <Route path="/admin"       element={<Admin companyId={companyId} userEmail={email} />} />
                <Route path="/accounts"    element={<Accounts />} />
                <Route path="/agent-setup" element={<AgentSetup companyId={companyId} />} />
              </>
            )}
            {role === 'weighment' && (
              <>
                <Route path="/"            element={<Dashboard companyId={companyId} companyName={companyName} />} />
                <Route path="/tasks"       element={<Weighments companyId={companyId} companyName={companyName} />} />
                <Route path="/weighments"  element={<Navigate to="/tasks" />} />
                <Route path="/accounts"    element={<Accounts />} />
                <Route path="/agent-setup" element={<AgentSetup companyId={companyId} />} />
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
      <Router>
        <ProtectedApp />
      </Router>
    </ThemeProvider>
  );
}
