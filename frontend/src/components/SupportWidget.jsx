import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, PhoneCall, X, Send, Bot, User, Minimize2 } from 'lucide-react';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(null); // 'chat' or null
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm the LogiCrate AI Support Node. How can I assist you with your weighbridge automation today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const stored = localStorage.getItem('supabase.auth.token');
      let company_id = null;
      let company_name = null;
      if (stored) {
        const parsed = JSON.parse(stored);
        const meta = parsed.currentSession?.user?.user_metadata || {};
        company_id = meta.company_id;
        company_name = meta.company_name;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, company_id, company_name })
      });
      const data = await res.json();
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: data.response || "I'm having trouble connecting to the command hub. Try again later.", sender: 'bot' }]);
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Connection error. Please ensure the backend is running.", sender: 'bot' }]);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 'clamp(1rem, 5vh, 2.5rem)', right: 'clamp(1rem, 5vw, 2.5rem)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
      
      {/* ── Chat Window ── */}
      {isOpen && mode === 'chat' && (
        <div className="card-luxury anim-slide-up" style={{ width: 350, height: 500, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid var(--border)' }}>
          <div style={{ padding: '1.25rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: 6, background: 'var(--primary-glow)', borderRadius: 10, color: 'var(--primary)' }}><Bot size={20} /></div>
              <div>
                <h4 style={{ fontWeight: 800, color: 'var(--text)', fontSize: '0.9rem' }}>Command AI Support</h4>
                <div style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="glow-dot" style={{ width: 6, height: 6, background: 'var(--success)' }}/> Online</div>
              </div>
            </div>
            <button onClick={() => setMode(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}><Minimize2 size={18} /></button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: 'var(--bg2)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', gap: '0.75rem', alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                {m.sender === 'bot' && <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}><Bot size={14} /></div>}
                
                <div style={{ padding: '0.85rem', borderRadius: 14, background: m.sender === 'user' ? 'var(--primary)' : 'var(--surface)', color: m.sender === 'user' ? '#000' : 'var(--text)', border: m.sender === 'user' ? 'none' : '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5, borderTopRightRadius: m.sender === 'user' ? 4 : 14, borderTopLeftRadius: m.sender === 'bot' ? 4 : 14 }}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start', maxWidth: '85%' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}><Bot size={14} /></div>
                <div style={{ padding: '0.85rem', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                   <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ padding: '1rem', background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type your query..." className="input-premium" style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem', borderRadius: 12 }} />
            <button type="submit" disabled={!input.trim()} className="btn-premium-gold" style={{ padding: '0 1rem', borderRadius: 12 }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* ── Menu Options ── */}
      {isOpen && mode !== 'chat' && (
        <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
          <a href="https://wa.me/919500593997" target="_blank" rel="noreferrer" className="btn-premium-gold" style={{ padding: '0.75rem 1.25rem', borderRadius: 20, display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            WhatsApp Support
          </a>
          <a href="tel:+919500593997" className="btn-premium-gold" style={{ padding: '0.75rem 1.25rem', borderRadius: 20, display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}>
            <PhoneCall size={20} color="var(--primary)" /> Direct Call
          </a>
          <button onClick={() => setMode('chat')} className="btn-premium-gold" style={{ padding: '0.75rem 1.25rem', borderRadius: 20, display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <Bot size={20} /> AI Analysis Chat
          </button>
        </div>
      )}

      {/* ── FAB Trigger ── */}
      <button 
        onClick={() => {
          if (isOpen) { setIsOpen(false); setMode(null); }
          else setIsOpen(true);
        }} 
        className="btn-premium-gold"
        style={{ width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(212,175,55,0.4)', padding: 0 }}
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>
    </div>
  );
}
