import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { BarChart2, TrendingUp, IndianRupee, Truck, Calendar, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';

// ─── Animated Counter Component ──────────────────────────────────────────────
function AnimatedCounter({ value, duration = 1500, suffix = "", prefix = "" }) {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);
  useEffect(() => {
    let frameId;
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Premium Analytics Card ──────────────────────────────────────────────────
function AnalyticsCard({ label, value, sub, trend, color, icon, delay = 0, prefix = "", suffix = "" }) {
  const isPos = trend >= 0;
  return (
    <div className="card-luxury anim-fade-up" style={{ 
      animationDelay: `${delay}s`, 
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '180px'
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ background: `${color}15`, color: color, padding: '10px', borderRadius: '12px', display: 'flex', border: `1px solid ${color}33`, boxShadow: `0 0 20px ${color}11` }}>
           {React.cloneElement(icon, { size: 18 })}
        </div>
      </div>
      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 800, color: isPos ? '#22c55e' : '#ef4444', background: isPos ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '4px 10px', borderRadius: '99px', border: `1px solid ${isPos ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
          {isPos ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
          {Math.abs(trend)}%
        </div>
        <span style={{ fontSize:'0.75rem', color:'var(--text3)', fontWeight: 600 }}>{sub}</span>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card-luxury" style={{ padding: '1.25rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ color: 'var(--text3)', fontSize: '0.65rem', fontWeight: 900, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
             <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, boxShadow: `0 0 10px ${item.color}` }} />
             <span style={{ color: 'var(--text)', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>{prefix}{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Analytics({ companyId, companyName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('daily');

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        let url = `${API}/analytics?`;
        if (companyId)   url += `company_id=${companyId}&`;
        if (companyName) url += `company_name=${encodeURIComponent(companyName)}&`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Analytical buffer underrun');
        const json = await res.json();
        setData(json);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
    fetchAnalytics();
  }, [companyId, companyName]);

  if (loading) return (
    <div className="page-content" style={{ display:'flex', flexDirection: 'column', alignItems:'center', justifyContent: 'center', minHeight: '60vh', gap:'1.5rem' }}>
      <span className="spinner" style={{ width: 40, height: 40, color: 'var(--primary)' }} />
      <span style={{ color:'var(--text3)', fontWeight: 600, letterSpacing: '0.05em' }}>PROCESSING GLOBAL TRENDS...</span>
    </div>
  );

  const currentData = data ? data[view] : [];
  const latestMetric = currentData.length > 0 ? currentData[currentData.length - 1] : { vehicles: 0, amount: 0 };
  const prevMetric = currentData.length > 1 ? currentData[currentData.length - 2] : null;

  const getTrend = (current, previous) => {
    if (!previous || previous === 0) return 0;
    const diff = current - previous;
    return parseFloat(((diff / previous) * 100).toFixed(1));
  };

  const vTrend = getTrend(latestMetric.vehicles, prevMetric?.vehicles);
  const aTrend = getTrend(latestMetric.amount, prevMetric?.amount);

  return (
    <div className="page-content">
      <div className="page-header anim-fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="gradient-text-gold">Intelligence & Yield</h1>
          <p>Multi-dimensional analysis of weighbridge throughput</p>
        </div>
        
        {/* View Toggle */}
        <div style={{ display:'flex', gap: '0.4rem', background:'var(--surface2)', padding:'6px', borderRadius: 18, border:'1px solid var(--border)' }}>
          {['daily', 'monthly', 'quarterly', 'yearly'].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{
                padding:'0.6rem 1.4rem', background: view === v ? 'var(--primary)' : 'transparent',
                color: view === v ? '#000' : 'var(--text3)', border:'none', borderRadius: 14,
                fontSize:'0.75rem', fontWeight: 900, textTransform:'uppercase', cursor:'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', letterSpacing: '0.05em',
                boxShadow: view === v ? '0 8px 15px var(--primary-glow)' : 'none'
              }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <AnalyticsCard
          label={`${view} throughput`}
          value={latestMetric.vehicles}
          sub={`vs previous ${view.replace('ly','')}`}
          trend={vTrend}
          color="#3b82f6"
          icon={<Truck size={20} />}
          delay={0.1}
        />
        <AnalyticsCard
          label={`${view} revenue (₹)`}
          value={latestMetric.amount}
          prefix="₹"
          sub={`vs previous ${view.replace('ly','')}`}
          trend={aTrend}
          color="#22c55e"
          icon={<IndianRupee size={20} />}
          delay={0.2}
        />
      </div>

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        
        {/* Traffic Area Chart */}
        <div className="card-luxury anim-fade-up" style={{ padding: 'clamp(1rem, 5vw, 2rem)', animationDelay: '0.3s' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: '3rem' }}>
             <div>
               <h3 style={{ fontWeight:900, fontSize: '1.4rem', color: 'var(--text)', display:'flex', alignItems:'center', gap:'0.75rem', marginBottom: '0.25rem' }}>
                 <BarChart2 size={24} color="var(--primary)" /> Traffic Volume
               </h3>
               <div style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 600 }}>Active vehicle throughput synchronization</div>
             </div>
             <div className="pricing-chip" style={{ fontSize: '0.65rem', background: 'rgba(212,175,55,0.1)', color: 'var(--primary)' }}>NODE: ACTIVE</div>
          </div>
          
          <div style={{ width: '100%', height: 380 }}>
            <ResponsiveContainer>
              <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey={Object.keys(currentData[0] || {})[0]} stroke="var(--text3)" fontSize={11} tickMargin={12} axisLine={false} tickLine={false} fontWeight={700} />
                <YAxis stroke="var(--text3)" fontSize={11} axisLine={false} tickLine={false} fontWeight={700} tickMargin={8} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="vehicles" name="Vehicles" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorVehicles)" filter="url(#glow)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Bar Chart */}
        <div className="card-luxury anim-fade-up" style={{ padding: 'clamp(1rem, 5vw, 2rem)', animationDelay: '0.4s', backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: '3rem' }}>
             <div>
               <h3 style={{ fontWeight:900, fontSize: '1.4rem', color: 'var(--text)', display:'flex', alignItems:'center', gap:'0.75rem', marginBottom: '0.25rem' }}>
                 <IndianRupee size={24} color="#22c55e" /> Yield Analysis
               </h3>
               <div style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 600 }}>Protocol valuation and revenue trends</div>
             </div>
             <div className="pricing-chip" style={{ fontSize: '0.65rem', background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>SECURE SYNC</div>
          </div>

          <div style={{ width: '100%', height: 380 }}>
            <ResponsiveContainer>
              <BarChart data={currentData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey={Object.keys(currentData[0] || {})[0]} stroke="var(--text3)" fontSize={11} tickMargin={12} axisLine={false} tickLine={false} fontWeight={700} />
                <YAxis stroke="var(--text3)" fontSize={11} axisLine={false} tickLine={false} tickFormatter={val => `₹${val/1000}k`} fontWeight={700} tickMargin={8} />
                <Tooltip content={<CustomTooltip prefix="₹" />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="amount" name="Revenue" fill="#22c55e" radius={[6, 6, 0, 0]} animationDuration={2000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── Footer Insight ── */}
      <div className="anim-fade-up" style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--primary-glow)', border: '1px solid var(--primary-glow)', borderRadius: 20, display: 'flex', alignItems: 'center', gap: '1rem', animationDelay: '0.6s' }}>
         <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
            <Zap size={20} color="#000" />
         </div>
         <div style={{ flex: 1 }}>
            <div style={{ color: 'var(--text)', fontWeight: 800, fontSize: '0.9rem' }}>Predictive Insight</div>
            <div style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>Based on current {view} growth of <span style={{ color: vTrend > 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{vTrend}%</span>, we project a yield increase of approximately ₹{(latestMetric.amount * 0.12).toLocaleString()} next month.</div>
         </div>
      </div>
    </div>
  );
}
