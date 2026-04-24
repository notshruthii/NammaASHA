import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, FileText, User, Languages, LogOut } from 'lucide-react';

// Components
import FormsPanel from './components/FormsPanel';
import AICard from './components/AICard';
import ChatInput from './components/ChatInput';
import LoginView from './components/LoginView'; // Create this component
import RecordsHistory from './components/RecordsHistory'; // Create this component

// Constants
import { translations } from './constants/translations';

// CSS Imports
import './index.css';
import './css/Header.css';
import './css/HeroSection.css';
import './App.css';
import './css/Chat.css';
import './css/Forms.css';

function App() {
  // 1. AUTH STATE (Check localStorage on load)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('asha_worker');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. UI STATE
  const [language, setLanguage] = useState('kn');
  const [activeTab, setActiveTab] = useState('assistant');
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef(null);      
  const containerRef = useRef(null);   

  const t = translations[language];

  // 3. PERSISTENT SCROLL & AUTO-CHAT SCROLL
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  // 4. AUTH LOGIC
  const handleLogin = async (ashaId, password) => { // Added password parameter
  try {
    const res = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        asha_id: ashaId, 
        password: password // Send password to backend
      }),
    });
    
    const data = await res.json();

    if (res.ok && data.status === "success") {
      const userData = { id: ashaId, name: data.worker_name, village: data.village };
      setUser(userData);
      localStorage.setItem('asha_worker', JSON.stringify(userData));
    } else {
      alert(data.detail || "Invalid Credentials");
    }
  } catch (e) {
    alert("Backend connection error");
  }
};

  const handleLogout = () => {
    localStorage.removeItem('asha_worker');
    setUser(null);
    setShowHistory(false);
  };

  // 5. NAVIGATION LOGIC
  const handleStartChat = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.offsetHeight,
        behavior: 'smooth'
      });
    }
    setActiveTab('assistant');
  };

  // 6. BACKEND API CALLS
  const sendMessage = async (text) => {
    setMessages([...messages, { type: 'user', text }]);
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'ai', data }]);
    } catch (e) {
      alert(t.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e, formName) => {
    e.preventDefault();
    const formDataObj = new FormData(e.target);
    const data = Object.fromEntries(formDataObj.entries());

    const payload = {
      asha_id: user.id,
      asha_name: user.name,
      form_type: formName,
      patient_name: data.patient_name || "Record Entry",
      formData: data 
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.status === "success") {
        alert(t.successMsg);
      }
    } catch (err) {
      alert(t.errorMsg);
    }
  };

  // 7. RENDER LOGIN IF NOT AUTHENTICATED
  if (!user) {
    return <LoginView onLogin={handleLogin} t={t} />;
  }

  return (
    <div className="mobile-wrapper">
      <div className="mobile-container">
        
        {/* STICKY HEADER (STAYS AT TOP) */}
        <header className="sticky-header">
          <div className="user-profile" onClick={() => setShowHistory(true)}>
            <div className="avatar"><User size={20} color="white"/></div>
            <div className="user-info">
              <span className="welcome-text">{t.welcome}</span>
              <span className="user-name">{user.name}</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="lang-toggle-btn" onClick={() => setLanguage(l => l === 'en' ? 'kn' : 'en')}>
              <Languages size={16} />
              <span>{language === 'en' ? 'KN' : 'EN'}</span>
            </button>
            <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* RECORDS HISTORY DRAWER (Visible when profile is clicked) */}
        {showHistory && (
          <RecordsHistory 
            ashaId={user.id} 
            onClose={() => setShowHistory(false)} 
            t={t} 
          />
        )}

        <div className="snap-container" ref={containerRef}>
          
          {/* SECTION 1: HERO (Welcome Card) */}
          <section className="snap-section hero-section">
            <div className="hero-card">
              <h2>{t.heroTitle}</h2>
              <p>{t.heroSub}</p>
              <button className="hero-btn" onClick={handleStartChat}>
                {t.heroBtn}
              </button>
            </div>
            <div className="swipe-up-indicator">
              <div className="bar"></div>
              <span>{t.swipeHint}</span>
            </div>
          </section>

          {/* SECTION 2: MAIN PANEL (Assistant & Forms) */}
          <section className="snap-section main-panel-section">
            <div className="tab-nav-sticky">
              <div className="uber-tabs">
                <div 
                  className={`tab-item ${activeTab === 'assistant' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('assistant')}
                >
                  <MessageCircle size={20} /> <span>{t.tabAssistant}</span>
                </div>
                <div 
                  className={`tab-item ${activeTab === 'forms' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('forms')}
                >
                  <FileText size={20} /> <span>{t.tabForms}</span>
                </div>
              </div>
            </div>

            <div className="panel-content">
              {activeTab === 'assistant' ? (
                <div className="messages-area" ref={scrollRef}>
                  {messages.length === 0 && <div className="empty-chat-msg">{t.placeholder}</div>}
                  {messages.map((msg, idx) => (
                    <div key={idx} className={msg.type === 'user' ? 'msg-user' : 'msg-ai'}>
                      {msg.type === 'user' ? msg.text : <AICard data={msg.data} />}
                    </div>
                  ))}
                  {loading && <div className="msg-ai">{t.thinking}</div>}
                </div>
              ) : (
                <FormsPanel 
                  t={t} 
                  onFormSubmit={handleFormSubmit} 
                />
              )}
            </div>
            
            {/* Input Bar only shows on Assistant Tab */}
            {activeTab === 'assistant' && (
              <ChatInput onSend={sendMessage} loading={loading} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;