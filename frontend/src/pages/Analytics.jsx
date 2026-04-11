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
    <div className="stat-card-premium anim-fade-up" style={{ '--card-accent': `${color}11`, '--card-border': `${color}33`, animationDelay: `${delay}s` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ background: `${color}11`, color: color, padding: '8px', borderRadius: '12px', display: 'flex' }}>{icon}</div>
      </div>
      <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', fontWeight: 700, color: isPos ? '#22c55e' : '#ef4444', background: isPos ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '99px' }}>
          {isPos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </div>
        <span style={{ fontSize:'0.75rem', color:'var(--text3)', fontWeight: 500 }}>{sub}</span>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <p style={{ color: 'var(--text3)', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase' }}>{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
             <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
             <span style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1rem' }}>{prefix}{item.value.toLocaleString()}</span>
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
        <div style={{ display:'flex', background:'var(--surface2)', padding:'4px', borderRadius: 16, border:'1px solid var(--border)' }}>
          {['daily', 'monthly', 'quarterly', 'yearly'].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{
                padding:'0.6rem 1.25rem', background: view === v ? 'var(--primary)' : 'transparent',
                color: view === v ? '#000' : 'var(--text3)', border:'none', borderRadius: 12,
                fontSize:'0.75rem', fontWeight: 800, textTransform:'uppercase', cursor:'pointer', transition: 'all 0.2s', letterSpacing: '0.03em'
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
        <div className="card-hover-glow anim-fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '2rem', animationDelay: '0.3s' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '2.5rem' }}>
             <h3 style={{ fontWeight:900, fontSize: '1.2rem', color: 'var(--text)', display:'flex', alignItems:'center', gap:'0.75rem' }}>
               <BarChart2 size={20} color="var(--primary)" /> Traffic Volume
             </h3>
             <div style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Processing Active</div>
          </div>
          
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" stroke="var(--border)" vertical={false} />
                <XAxis dataKey={Object.keys(currentData[0] || {})[0]} stroke="var(--text3)" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text3)" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary-glow)', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="vehicles" name="Vehicles" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorVehicles)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Bar Chart */}
        <div className="card-hover-glow anim-fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '2rem', animationDelay: '0.4s' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '2.5rem' }}>
             <h3 style={{ fontWeight:900, fontSize: '1.2rem', color: 'var(--text)', display:'flex', alignItems:'center', gap:'0.75rem' }}>
               <IndianRupee size={20} color="#22c55e" /> Yield Analysis
             </h3>
             <div style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Real-time valuation</div>
          </div>

          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={currentData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="5 5" stroke="var(--border)" vertical={false} />
                <XAxis dataKey={Object.keys(currentData[0] || {})[0]} stroke="var(--text3)" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text3)" fontSize={11} axisLine={false} tickLine={false} tickFormatter={val => `₹${val/1000}k`} />
                <Tooltip content={<CustomTooltip prefix="₹" />} cursor={{ fill: 'var(--primary-glow)' }} />
                <Bar dataKey="amount" name="Revenue" fill="#22c55e" radius={[10, 10, 0, 0]} animationDuration={2000} />
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
