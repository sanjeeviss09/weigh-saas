import React from 'react';
import { IndianRupee, ShieldCheck, ArrowRight, Lock, FileText, CheckCircle } from 'lucide-react';

export default function Accounts() {
  return (
    <div className="page-content">
      <div className="page-header anim-fade-up">
        <h1 className="gradient-text-gold">Financial Orchestration</h1>
        <p>Advanced party ledgers and GST reconciliation</p>
      </div>

      <div className="anim-fade-up anim-delay-1" style={{ width: '100%', maxWidth: 1100, margin: '2rem auto' }}>
        <div className="card-luxury" style={{ padding: 'clamp(2rem, 8vw, 5rem) clamp(1rem, 5vw, 3rem)', textAlign: 'center', borderRadius: 40, border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 250, height: 250, background: 'radial-gradient(circle, var(--primary-glow), transparent)', borderRadius: '50%' }} />
          
          <div style={{ width: 100, height: 100, background: 'var(--primary-glow)', borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', color: 'var(--primary)', boxShadow: '0 10px 40px rgba(212,175,55,0.2)' }}>
            <Lock size={48} />
          </div>

          <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.8rem)', fontWeight: 900, color: 'var(--text)', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>Node Pro Exclusive</h2>
          <p style={{ fontSize: 'clamp(0.95rem, 3vw, 1.2rem)', color: 'var(--text2)', lineHeight: 1.7, maxWidth: 700, margin: '0 auto 3.5rem' }}>
            The Financial Orchestration suite is locked. Upgrade to the **Node Pro** tier to automate your party ledgers, tax compliance, and automated invoicing.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'left', marginBottom: '4rem' }}>
            {[
              { t: "Live Ledgers", d: "Track party-wise balances automatically based on weighment value." },
              { t: "Tax Compliance", d: "Automated GST reconciliation and direct report generation." },
              { t: "Smart Invoicing", d: "Schedule and ship invoices without leaving the dashboard." }
            ].map((f, i) => (
              <div key={i} style={{ padding: '1.5rem', background: 'var(--surface2)', borderRadius: 20, border: '1px solid var(--border)' }}>
                <CheckCircle size={18} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h4 style={{ color: 'var(--text)', fontWeight: 800, marginBottom: '0.4rem' }}>{f.t}</h4>
                <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{f.d}</p>
              </div>
            ))}
          </div>

          <button className="btn-premium-gold" style={{ padding: '1.25rem 3.5rem', width: 'auto', minWidth: '280px', fontSize: '1.1rem', borderRadius: 20, boxShadow: '0 15px 45px rgba(212,175,55,0.4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            Initialize Pro Sync <ArrowRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
