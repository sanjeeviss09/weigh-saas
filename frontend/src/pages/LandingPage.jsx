import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Cpu, Cloud, Zap, ShieldCheck, BarChart2, ArrowRight, CheckCircle, Menu, X, Globe, Activity, Layers, Printer, Brain, MessageSquare, ArrowUpRight, Star } from 'lucide-react';
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
          padding: '2rem', borderRadius: 28,
          cursor: 'default', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: hovered ? 'var(--surface2)' : 'var(--surface)',
          border: hovered ? '1px solid var(--primary)' : '1px solid var(--border)',
          transition: 'all 0.4s ease',
          boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.4)' : 'none',
          transform: hovered ? 'translateY(-4px)' : 'none'
        }}
      >
        <div style={{
          width: 50, height: 50, borderRadius: 16,
          background: hovered ? 'var(--primary-glow)' : 'rgba(212,175,55,0.05)',
          color: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem', transition: 'all 0.3s ease',
          border: hovered ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent'
        }}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text)' }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text2)', lineHeight: 1.7 }}>{desc}</p>
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
          padding: '2.5rem 2rem', borderRadius: 32,
          position: 'relative', border: highlighted ? '2px solid var(--primary)' : '1px solid var(--border)',
          transform: highlighted ? (hovered ? 'scale(1.03) translateY(-10px)' : 'scale(1.02)') : (hovered ? 'translateY(-8px)' : 'none'),
          background: highlighted ? 'var(--primary-glow)' : 'var(--surface)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: highlighted ? 10 : 1
        }}
      >
        {highlighted && <div className="pricing-chip" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#000', fontWeight: 900, border: 'none' }}>Most Popular Platform</div>}
        
        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: highlighted ? 'var(--primary)' : 'var(--text)', marginBottom: '1.5rem' }}>{title}</h3>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em' }}>₹{price}</span>
            <span style={{ color: 'var(--text3)', fontWeight: 600 }}>/ month</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginTop: '0.5rem', lineHeight: 1.6 }}>Perfect capacity for up to {companies} connected transport companies.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <CheckCircle size={14} color="var(--success)" />
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text2)', fontWeight: 500, lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
          {footer && (
             <div style={{ padding: '1.25rem', background: 'rgba(212,175,55,0.08)', borderRadius: 16, border: '1px solid rgba(212,175,55,0.2)', marginTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enterprise Upgrade:</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.6 }}>{footer}</div>
             </div>
          )}
        </div>

        <Link to="/signup" className={highlighted ? "btn-premium-gold" : "nav-item-premium"} style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: 16, textDecoration: 'none', textAlign: 'center', fontWeight: 700, border: highlighted ? 'none' : '1px solid var(--border)' }}>
          Choose {title}
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

  const links = ['Features', 'AI Magic', 'How It Works', 'Pricing'];

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
          <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)' }}>LogiCrate</span>
        </div>

        {/* Desktop Links */}
        <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s/g,'-')}`} className="nav-item-premium" style={{ width: 'auto', background: 'transparent', fontSize: '0.85rem' }}>{l}</a>
          ))}
        </div>

        {/* Desktop Buttons & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/login" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700, padding: '0.5rem 1rem' }}>Log In</Link>
            <Link to="/signup" className="btn-premium-gold" style={{ padding: '0.65rem 1.5rem', textDecoration: 'none', width: 'auto', fontSize: '0.85rem' }}>Start Free Trial</Link>
          </div>
          
          <button 
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ 
              background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer',
              display: 'none', padding: '0.5rem'
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
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      {/* Background Decor */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(212,175,55,0.06), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(34,197,94,0.03), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(7rem, 15vh, 10rem) var(--gutter) clamp(3rem, 8vh, 6rem)', display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap', position: 'relative', zIndex: 1, minHeight: '85vh' }}>
        <div style={{ flex: '1 1 500px' }}>
          <FadeIn>
            <div className="pricing-chip" style={{ marginBottom: '1.5rem', fontSize: '0.75rem', background: 'var(--primary-glow)', border: '1px solid rgba(212,175,55,0.3)' }}>✨ Powered by Gemini AI Neural Engine</div>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.8rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
              Your weighbridge data. <br />
              <span className="text-gradient-gold">Digitized instantly.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', color: 'var(--text2)', lineHeight: 1.6, maxWidth: 580, marginBottom: '2.5rem' }}>
              We know running a weighbridge is tough. Endless printed slips, manual Excel entries, and lost records. LogiCrate reads your printed slips using AI and syncs them directly to the cloud. You don't type a single number.
            </p>
          </FadeIn>
          <FadeIn delay={300} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="/signup" className="btn-premium-gold" style={{ padding: '1rem 2.2rem', fontSize: '1.05rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 30px rgba(212,175,55,0.3)' }}>
              Start Automating Today <ArrowRight size={18} />
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem' }}>
              <div style={{ display: 'flex', color: 'var(--primary)' }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text3)', fontWeight: 600 }}>Trusted by 100+ stations</span>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={400} direction="right" style={{ flex: '1 1 340px' }}>
          <div className="anim-float-premium" style={{ position: 'relative', width: '100%', maxWidth: 500, margin: '0 auto' }}>
             <div style={{ position: 'absolute', inset: -30, background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 60%)', borderRadius: '50%', zIndex: -1 }} />
             <img src={dashboardImg} alt="Dashboard Preview" style={{ width: '100%', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }} />
             
             {/* Dynamic Live Tag */}
             <div className="card-luxury" style={{ 
               position: 'absolute', 
               bottom: '10%', 
               left: '-10%', 
               padding: '1rem 1.5rem', 
               borderRadius: 20, 
               maxWidth: 220, 
               border: '1px solid rgba(34,197,94,0.3)', 
               backdropFilter: 'blur(15px)',
               display: 'flex',
               flexDirection: 'column',
               gap: '0.4rem',
               boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
             }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="anim-pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>AI SYNC ACTIVE</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>Slip #4892 extracted and synced in 1.2s</div>
             </div>
          </div>
        </FadeIn>
      </section>

      {/* ── PROBLEM SOLVED (Human Tone Section) ────────────────────────── */}
      <section style={{ background: 'var(--surface2)', padding: '5rem var(--gutter)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--text)', marginBottom: '1.5rem' }}>
              We know why you're here.
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text2)', lineHeight: 1.8 }}>
              You have a great weighbridge, but at the end of every day, either you or your staff sits down with a stack of printed bills and types them into an Excel sheet. Mistakes happen. Slips get lost. Bills are delayed. <strong>LogiCrate fixes this completely.</strong> Our AI acts like a digital clerk that watches your computer, reads the slips the moment they print, and organizes them perfectly online.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── AI MAGIC ─────────────────────────────────────────────────────── */}
      <section id="ai-magic" style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--section-gap) var(--gutter)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap-reverse', gap: '4rem' }}>
          <FadeIn direction="left" style={{ flex: '1 1 400px' }}>
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 24, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px dashed var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Cloud size={24} color="var(--primary)" />
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Original PDF Slip</span>
                </div>
                <ArrowRight color="var(--text3)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[['TN 38 CX 1234', 'Vehicle'], ['14,500', 'Gross Wt'], ['4,500', 'Tare Wt'], ['Blue Metals', 'Material']].map(([val, lbl]) => (
                  <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface2)', padding: '1rem', borderRadius: 12 }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase' }}>{lbl}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--success)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          
          <div style={{ flex: '1 1 400px' }}>
            <FadeIn direction="right">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'var(--primary-glow)', padding: '0.5rem 1rem', borderRadius: 99, border: '1px solid rgba(212,175,55,0.3)', marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem' }}>
                <Brain size={18} /> True AI Understanding
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
                It doesn't just read. <br />It understands.
              </h2>
              <p style={{ color: 'var(--text2)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                Unlike old OCR scanners that get confused if a receipt format changes, LogiCrate is powered by Google's Gemini AI. It literally "reads" the bill like a human would. If your printer shifts the text, or if you use a totally customized slip design, our AI still knows exactly where the Net Weight is.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['Works with any billing software', 'No rigid templates to set up', 'Learns and improves if you correct it'].map((t, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1rem', color: 'var(--text)', fontWeight: 600 }}>
                    <CheckCircle size={20} color="var(--primary)" /> {t}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: 'var(--surface)', padding: 'var(--section-gap) var(--gutter)', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
            <FadeIn>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'var(--text)', marginBottom: '1rem' }}>3 Steps to Complete Automation.</h2>
              <p style={{ color: 'var(--text3)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 4rem' }}>Setup takes less than 3 minutes. Your workflow never changes.</p>
            </FadeIn>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '24px', left: '15%', right: '15%', height: 2, background: 'var(--border)', zIndex: 0, '@media (max-width: 900px)': { display: 'none' } }} className="desktop-only" />
              
              {[
                { i: <Printer />, t: "Print Normally", d: "Your staff clicks 'Print' on your local weighbridge software, just like they do 100 times a day." },
                { i: <Cpu />, t: "Agent Syncs It", d: "Our tiny PC Agent instantly reads the digital copy using AI and pushes it to your cloud account securely." },
                { i: <Globe />, t: "Access Anywhere", d: "You log into the web dashboard from your smartphone to see the transaction live. Invoices ready." },
              ].map((item, idx) => (
                <FadeIn key={idx} delay={idx * 150} style={{ position: 'relative', zIndex: 1, background: 'var(--surface)', padding: '2rem', borderRadius: 24, border: '1px solid var(--border)' }}>
                   <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', margin: '0 auto 1.5rem', boxShadow: '0 10px 20px rgba(212,175,55,0.3)', position: 'relative', zIndex: 2 }}>
                      {React.cloneElement(item.i, { size: 28 })}
                   </div>
                   <h4 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)', marginBottom: '0.75rem' }}>{item.t}</h4>
                   <p style={{ color: 'var(--text2)', fontSize: '1rem', lineHeight: 1.6 }}>{item.d}</p>
                </FadeIn>
              ))}
            </div>
          </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--section-gap) var(--gutter)' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 6vw, 4rem)' }}>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>Simple, Honest Pricing.</h2>
          <p style={{ color: 'var(--text2)', maxWidth: 600, margin: '1rem auto 0', fontSize: '1.15rem' }}>No hidden setup fees. No hardware required. Cancel anytime.</p>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', maxWidth: 900, margin: '0 auto' }}>
          <PricingCard 
            delay={0}
            title="Standard Station"
            price="1,200"
            companies={15}
            features={[
              "Manage up to 15 Transport Companies",
              "Unlimited AI Slip Processing",
              "Real-time Mobile Dashboard",
              "Automated Client Invoicing",
              "Downloadable Excel Reports",
              "Email Support"
            ]}
          />
          <PricingCard 
            delay={150}
            title="Enterprise Hub"
            price="2,000"
            companies={50}
            highlighted={true}
            features={[
              "Manage up to 50 Transport Companies",
              "Multiple Operator Accounts",
              "E-Way Bill Tracking",
              "Advanced Analytics & Charts",
              "Custom Invoice Branding",
              "Priority WhatsApp Support"
            ]}
            footer="Unlocks full team management and advanced accounting connections."
          />
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'var(--surface2)', padding: '5rem 2rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                    <Truck size={24} color="var(--primary)" />
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>LogiCrate</span>
                 </div>
                 <p style={{ color: 'var(--text3)', maxWidth: 320, lineHeight: 1.7, fontSize: '0.9rem' }}>Making weighbridge operations painless. LogiCrate brings peace of mind to station owners across the country through intelligent automation.</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: '#fff', marginBottom: '1.5rem', fontSize: '1.05rem' }}>Product</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {['Features', 'AI Technology', 'Pricing', 'Security'].map(l => <a key={l} href="#" style={{ color: 'var(--text3)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>{l}</a>)}
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: '#fff', marginBottom: '1.5rem', fontSize: '1.05rem' }}>Contact Us</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text3)', fontSize: '0.9rem', fontWeight: 600 }}>
                   <a href="mailto:srikadaieswara09@gmail.com" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={16} /> Email Support</a>
                   <a href="https://wa.me/919500593997" style={{ color: 'var(--success)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowUpRight size={16} /> WhatsApp Sales</a>
                </div>
              </div>
           </div>
           
           <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: 'var(--text3)', fontSize: '0.8rem', fontWeight: 600 }}>
              <div>© 2026 LogiCrate SaaS. All rights reserved.</div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                 <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
                 <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
