import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Cpu, Cloud, Zap, ShieldCheck, BarChart2, ArrowRight, CheckCircle, Smartphone, Menu, X, ChevronDown, Globe, Activity, Layers, CreditCard, Receipt, Users } from 'lucide-react';
import dashboardImg from '../assets/dashboard_3d.png';
import automationImg from '../assets/automation_3d.png';

// ─── Animation Hook ──────────────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── Animated Section Wrapper ─────────────────────────────────────────────────
function FadeIn({ children, delay = 0, direction = 'up', style = {} }) {
  const [ref, inView] = useInView();
  const transforms = { 
    up: 'translateY(40px)', 
    down: 'translateY(-40px)', 
    left: 'translateX(-40px)', 
    right: 'translateX(40px)', 
    none: 'none' 
  };
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : transforms[direction],
      transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      ...style
    }}>
      {children}
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="card-luxury"
        style={{
          padding: '2.5rem', borderRadius: 28,
          cursor: 'default', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: hovered ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
          border: hovered ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.06)',
          transition: 'all 0.4s ease'
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: hovered ? 'var(--primary)' : 'rgba(212,175,55,0.1)',
          color: hovered ? '#000' : 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem', transition: 'all 0.3s ease',
        }}>
          {React.cloneElement(icon, { size: 28 })}
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text)' }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text3)', lineHeight: 1.7 }}>{desc}</p>
      </div>
    </FadeIn>
  );
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────
function PricingCard({ title, price, features, highlighted, footer, companies, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div 
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="card-luxury anim-shimmer"
        style={{
          padding: '3rem 2.5rem', borderRadius: 32,
          position: 'relative', border: highlighted ? '2px solid var(--primary)' : '1px solid var(--border)',
          transform: highlighted ? (hovered ? 'scale(1.03) translateY(-10px)' : 'scale(1.02)') : (hovered ? 'translateY(-8px)' : 'none'),
          background: highlighted ? 'var(--primary-glow)' : 'var(--surface)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: highlighted ? 10 : 1
        }}
      >
        {highlighted && <div className="pricing-chip" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>Most Popular</div>}
        
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</h3>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text)' }}>₹{price}</span>
            <span style={{ color: 'var(--text3)', fontWeight: 600 }}>/ month</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginTop: '0.5rem' }}>Scalable capacity for up to {companies} companies</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={14} color="var(--success)" />
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text2)', fontWeight: 500 }}>{f}</span>
            </div>
          ))}
          {footer && (
             <div style={{ padding: '1.25rem', background: 'var(--primary-glow)', borderRadius: 16, border: '1px solid var(--border)', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Premium Upgrade:</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text2)', lineHeight: 1.5 }}>{footer}</div>
             </div>
          )}
        </div>

        <Link to="/signup" className={highlighted ? "btn-premium-gold" : "nav-item-premium"} style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: 16, textDecoration: 'none' }}>
          Select Plan
        </Link>
      </div>
    </FadeIn>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = ['Features', 'How It Works', 'Pricing', 'Contact'];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: (scrolled || mobileMenuOpen) ? 'var(--surface)' : 'transparent',
      backdropFilter: (scrolled || mobileMenuOpen) ? 'blur(20px)' : 'none',
      borderBottom: (scrolled || mobileMenuOpen) ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.4s ease',
      boxShadow: (scrolled || mobileMenuOpen) ? '0 4px 30px rgba(0,0,0,0.1)' : 'none'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="anim-pulse-glow" style={{ background: 'var(--primary-glow)', padding: 6, borderRadius: 10 }}><Truck size={20} color="var(--primary)" /></div>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.035em', color: 'var(--text)' }}>LogiCrate</span>
        </div>

        {/* Desktop Links */}
        <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s/g,'-')}`} className="nav-item-premium" style={{ width: 'auto', background: 'transparent', fontSize: '0.85rem' }}>{l}</a>
          ))}
        </div>

        {/* Desktop Buttons & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/login" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>Log In</Link>
            <Link to="/signup" className="btn-premium-gold" style={{ padding: '0.6rem 1.4rem', textDecoration: 'none', width: 'auto', fontSize: '0.85rem' }}>Get Started</Link>
          </div>
          
          <button 
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ 
              background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer',
              display: 'none', // Managed by CSS media query
              padding: '0.5rem'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{ 
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
          animation: 'fadeInDown 0.3s ease forwards'
        }}>
          {links.map(l => (
            <a 
              key={l} 
              href={`#${l.toLowerCase().replace(/\s/g,'-')}`} 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 600 }}
            >
              {l}
            </a>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 800 }}>Log In</Link>
          <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="btn-premium-gold" style={{ textAlign: 'center', padding: '1rem', textDecoration: 'none' }}>Get Started</Link>
        </div>
      )}
    </nav>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Background Decor */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(212,175,55,0.06), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(34,197,94,0.04), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(8rem, 15vh, 12rem) 1.5rem 6rem', display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap', position: 'relative', zIndex: 1, minHeight: '80vh' }}>
        <div style={{ flex: '1 1 480px' }}>
          <FadeIn>
            <div className="pricing-chip" style={{ marginBottom: '1.5rem', fontSize: '0.75rem' }}>✨ Version 4.2: AI Neural Engine Active</div>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="text-gradient-gold" style={{ fontSize: 'clamp(2.2rem, 8vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
              Autonomous<br />Weighbridge Intelligence.
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', color: 'var(--text2)', lineHeight: 1.6, maxWidth: 540, marginBottom: '2.5rem' }}>
              Eliminate manual entry with AI extraction. Our background agent silently syncs every weighment slip to your secure command center — instantly, accurately, effortlessly.
            </p>
          </FadeIn>
          <FadeIn delay={300} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn-premium-gold" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
              Deploy Hub <ArrowRight size={18} />
            </Link>
            <a href="#pricing" className="nav-item-premium" style={{ width: 'auto', padding: '0.9rem 1.5rem', fontSize: '0.9rem' }}>View Pricing Models</a>
          </FadeIn>
        </div>

        <FadeIn delay={400} direction="right" style={{ flex: '1 1 340px' }}>
          <div className="anim-float-premium" style={{ position: 'relative', width: '100%', maxWidth: 500, margin: '0 auto' }}>
             <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1 }} />
             <img src={dashboardImg} alt="Dashboard Preview" style={{ width: '100%', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }} />
             
             {/* Dynamic Live Tag */}
             <div className="card-luxury" style={{ 
               position: 'absolute', 
               bottom: '15%', 
               left: '-5%', 
               padding: '0.8rem 1.2rem', 
               borderRadius: 16, 
               maxWidth: 160, 
               border: '1px solid rgba(34,197,94,0.3)', 
               backdropFilter: 'blur(10px)',
               display: 'flex',
               flexDirection: 'column',
               gap: '0.3rem'
             }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="anim-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>LIVE SYNC</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>Payload processed via AI Neural Link</div>
             </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '8rem 2rem', position: 'relative', zIndex: 1 }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em' }}>Ecosystem of Power.</h2>
          <p style={{ color: 'var(--text3)', fontSize: '1.1rem', marginTop: '1rem' }}>Replace outdated systems with a high-fidelity logistics orchestrator.</p>
        </FadeIn>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <FeatureCard delay={0} icon={<Cpu />} title="Neural Data Extraction" desc="AI extracts gross, tare, net wts and vehicle IDs from any PDF slip with 99.9% precision." />
          <FeatureCard delay={100} icon={<Cloud />} title="Elastic Cloud Sync" desc="Zero-latency propagation of weighment records across your entire corporate infrastructure." />
          <FeatureCard delay={200} icon={<ShieldCheck />} title="Encrypted Ledger" desc="Transactions are cryptographically signed and stored in our secure global vault." />
          <FeatureCard delay={300} icon={<Activity />} title="Live Telemetry" desc="Monitor weighbridge usage, frequency, and operator productivity with millisecond precision." />
          <FeatureCard delay={400} icon={<Globe />} title="Government Sync" desc="Ready for e-way bill verification and automated GST invoice alignment." />
          <FeatureCard delay={500} icon={<Zap />} title="Hyper-Automation" desc="Generate and ship invoices to clients automatically based on successful weighments." />
        </div>
      </section>

      {/* ── AUTOMATION SHOWCASE ────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: 'rgba(255,255,255,0.01)', padding: '10rem 2rem', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)', position: 'relative' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '6rem', alignItems: 'center' }}>
            <FadeIn direction="left">
               <img src={automationImg} alt="Automation Concept" style={{ width: '100%', borderRadius: 32, boxShadow: '0 50px 100px rgba(0,0,0,0.6)', border: '1px solid rgba(212,175,55,0.1)' }} />
            </FadeIn>
            <div>
              <FadeIn direction="right">
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: '1.5rem' }}>Invisible Operation.</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  {[
                    { i: <Cpu />, t: "Autonomous Detection", d: "Our PC Agent monitors your local printer spooler and detects new slips instantly." },
                    { i: <Zap />, t: "Neural Uplink", d: "Data is cleaned, hashed, and processed via AI before cloud synchronization." },
                    { i: <Layers />, t: "Seamless Ecosystem", d: "Generate invoices, E-way bill cross-checks, and audit logs without manual effort." },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1.5rem' }}>
                       <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                          {item.i}
                       </div>
                       <div>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.4rem' }}>{item.t}</h4>
                          <p style={{ color: 'var(--text3)', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.d}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ maxWidth: 1200, margin: '0 auto', padding: '12rem 2rem' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <div className="pricing-chip" style={{ marginBottom: '1.5rem' }}>Operational Efficiency Plans</div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>Command Your Scale.</h2>
          <p style={{ color: 'rgba(255,255,255,0.3)', maxWidth: 600, margin: '1rem auto 0', fontSize: '1.15rem' }}>Choose the synchronization capacity that matches your business throughput.</p>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem', maxWidth: 1000, margin: '0 auto' }}>
          <PricingCard 
            delay={0}
            title="Node Standard"
            price="1,200"
            companies={15}
            features={[
              "Synchronize up to 15 Companies",
              "AI Optical Weight Extraction",
              "Automated Invoice Generation",
              "E-Way Bill Integration Hub",
              "Real-time Data Sync Agent",
              "Priority Email Support"
            ]}
          />
          <PricingCard 
            delay={150}
            title="Node Enterprise"
            price="2,000"
            companies={50}
            highlighted={true}
            features={[
              "Synchronize up to 50 Companies",
              "Advanced Analytics Dashboard",
              "Full Invoice Automation Suite",
              "E-Way Bill Enterprise Cross-Verify",
              "Multi-User Role Management",
              "24/7 Dedicated Command Support"
            ]}
            footer="Unlocks the 'Accounts Options' suite for advanced weighment financial orchestration."
          />
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.6)', padding: '6rem 2rem 3rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '6rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                    <Truck size={24} color="var(--primary)" />
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>LogiCrate</span>
                 </div>
                 <p style={{ color: 'rgba(255,255,255,0.3)', maxWidth: 320, lineHeight: 1.8 }}>The elite synchronization layer for the modern heavy-duty logistics industry.</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>Protocol</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {['Features', 'Intelligence', 'Security', 'Enterprise'].map(l => <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.95rem' }}>{l}</a>)}
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>Direct Link</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   <a href="mailto:srikadaieswara09@gmail.com" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.95rem' }}>Command Centre Support</a>
                   <a href="https://wa.me/919500593997" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.95rem' }}>WhatsApp Terminal</a>
                </div>
              </div>
           </div>
           <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 700 }}>
              <div>© 2026 LOGICRATE SYSTEMS. REPLICANT ASSETS ENFORCED.</div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                 <span>PRIVACY.LOG</span>
                 <span>TERMS.EXE</span>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
