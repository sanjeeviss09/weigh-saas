import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Check, ShieldAlert, ArrowRight, Zap, Target, Lock } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const PLANS = [
  {
    id: 'free',
    name: 'Automation',
    price: '₹0',
    target: 'Small weighbridge / single operator',
    value: 'Stop manual entry completely',
    features: [
      'Auto PDF detection',
      'AI data extraction',
      'Basic dashboard (daily entries)',
      'Manual correction',
      'Daily summary report',
      'Local agent (single PC)',
      '1 User Default'
    ]
  },
  {
    id: 'pro',
    name: 'Control',
    price: '₹1,200',
    period: '/month',
    target: 'Growing businesses / owners',
    value: 'Control your entire weighment operation',
    popular: true,
    features: [
      'Everything in Automation +',
      'Gross ↔ Tare auto matching',
      'Duplicate detection (fraud protection)',
      'Multi-user login (owner + operator)',
      'Real-time live dashboard',
      'Missing tare & Duplicate alerts',
      'Material-wise & Daily/Weekly Analytics',
      'Export to Excel'
    ]
  },
  {
    id: 'enterprise',
    name: 'Intelligence',
    price: '₹2,000',
    period: '/month',
    target: 'Multi-location / serious business',
    value: 'Turn your weighbridge into an intelligent system',
    features: [
      'Everything in Control +',
      'AI Fraud Detection',
      'Vehicle behavior analysis & Risk scoring',
      'Load, peak hour & Revenue prediction',
      'Multi-location centralized monitoring',
      'Agent status tracking',
      'Shift performance & Auto insights',
      'Audit logs & Custom integrations'
    ]
  }
];

export default function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSelectPlan = async (plan) => {
    setError('');
    
    // If it's the free plan, simply update metadata and route to dashboard
    if (plan.id === 'free') {
      try {
        setLoading(true);
        const { error: updateErr } = await supabase.auth.updateUser({
          data: { plan: 'free' }
        });
        if (updateErr) throw updateErr;
        navigate('/');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Razorpay Integration Logic (Test Mode)
    setLoading(true);
    const res = await loadRazorpay();
    if (!res) {
      setError('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const companyId = user?.user_metadata?.company_id;
      if (!companyId) throw new Error("Could not construct payment map without company identity.");

      // In a real flow, you'll call a backend API here to generate a Razorpay Order ID.
      // For now, testing directly with simulated success.
      
      const options = {
        key: 'rzp_test_SimulatedLogiRateKey', // This is a simulated key for demo.
        amount: plan.id === 'pro' ? 120000 : 200000, // paise (₹1200 * 100)
        currency: 'INR',
        name: 'LogiRate Platforms',
        description: `Upgrade to ${plan.name} Plan`,
        image: 'https://via.placeholder.com/150', // Logo placeholder
        handler: async function (response) {
          // Success callback: update plan in Supabase
          try {
             // In prod, backend verifies Razorpay signature here.
             const { error: updateErr } = await supabase.auth.updateUser({
               data: { plan: plan.id }
             });
             if (updateErr) throw updateErr;
             
             // Update database directly (Wait, need backend call to upgrade DB record or trigger via webhook)
             await fetch(`${API}/company/update-plan`, {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({ company_id: companyId, plan: plan.id })
             }).catch(() => {}); // fire and forget for demo purposes

             navigate('/');
          } catch(err) {
             setError('Payment processed but failed to apply plan. Contact support.');
          }
        },
        prefill: {
          name: user?.user_metadata?.display_name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#D4AF37'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
       setError(err.message);
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="auth-page-premium" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg)', padding: '4rem 1rem', fontFamily: 'Inter, sans-serif' }}>
       
       <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: 800 }}>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: 'var(--text)', letterSpacing: '-0.04em', marginBottom: '1rem' }}>
             Station Initialized. Select Layer.
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '1.1rem', lineHeight: 1.6 }}>
             LogiRate enables you to stop manual entry completely, gain absolute control, and deploy deep AI predictions across your scale logic.
          </p>
       </div>

       {error && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', padding: '1rem', borderRadius: 12, color: 'var(--danger)', marginBottom: '2rem', maxWidth: 600, width: '100%' }}>{error}</div>}

       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: 1200, width: '100%' }}>
          {PLANS.map((plan) => (
             <div key={plan.id} className="card-luxury" style={{ 
                position: 'relative',
                padding: '2.5rem', 
                borderRadius: 24, 
                border: plan.popular ? '2px solid var(--primary)' : '1px solid var(--border)',
                transform: plan.popular ? 'scale(1.03)' : 'none',
                boxShadow: plan.popular ? '0 30px 60px rgba(212,175,55,0.1)' : '0 10px 30px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column'
             }}>
                {plan.popular && (
                   <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#000', padding: '0.2rem 1rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Most Recommended
                   </div>
                )}
                
                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', marginBottom: '0.5rem' }}>{plan.name}</h3>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text3)', minHeight: 40 }}>{plan.target}</div>
                
                <div style={{ margin: '1.5rem 0 0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                   <span style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.05em' }}>{plan.price}</span>
                   {plan.period && <span style={{ color: 'var(--text3)', fontWeight: 600 }}>{plan.period}</span>}
                </div>
                
                <div style={{ marginBottom: '2.5rem', fontSize: '0.9rem', color: plan.popular ? 'var(--primary)' : 'var(--success)', fontWeight: 700 }}>
                   🔥 {plan.value}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                   {plan.features.map((opt, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                         <Check size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                         <span style={{ fontWeight: opt.includes('Everything in') ? 800 : 500 }}>{opt}</span>
                      </li>
                   ))}
                </ul>

                <button 
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loading}
                  className={plan.popular ? "btn-premium-gold" : "btn btn-secondary"} 
                  style={{ width: '100%', marginTop: '2rem', height: 50, borderRadius: 12, fontSize: '0.95rem' }}
                >
                  {loading ? 'Processing...' : `Get ${plan.name}`}
                </button>
             </div>
          ))}
       </div>

       <div style={{ marginTop: '4rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text3)', fontSize: '0.85rem', fontWeight: 600 }}>
          <Lock size={16} /> Secure encryption routing via Razorpay India
       </div>
    </div>
  );
}
