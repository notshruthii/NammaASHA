import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { 
  MessageCircle, 
  FileText, 
  User, 
  Languages, 
  LogOut, 
  MessageSquareText 
} from 'lucide-react';

// Components
import AICard from './components/AICard';
import ChatInput from './components/ChatInput';
import FormsPanel from './components/FormsPanel';
import RecordsHistory from './components/RecordsHistory';
import LandingPage from './components/LandingPage'; 
import LoginView from './components/LoginView';

// Constants & Styles
import { translations } from './constants/translations';
import './App.css'; 
import './css/Header.css';
import './css/LandingPage.css'; 
import './css/HeroSection.css';
import './css/Chat.css';
import './css/Forms.css';

/**
 * 1. MAIN DASHBOARD (The "Second Code" Contents)
 * This contains the Assistant, Forms with Voice, and History
 */
function MainDashboard({ user, setUser, language, setLanguage }) {
  const [activeTab, setActiveTab] = useState('assistant');
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef(null);      
  const containerRef = useRef(null);   
  const navigate = useNavigate();
  const t = translations[language];

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('asha_worker');
    setUser(null);
    navigate('/');
  };

  const handleStartChat = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.offsetHeight,
        behavior: 'smooth'
      });
    }
    setActiveTab('assistant');
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { type: 'user', text }]);
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
      if (result.status === "success") alert(t.successMsg);
    } catch (err) {
      alert(t.errorMsg);
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="mobile-container">
        {/* APP HEADER */}
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

        {showHistory && (
          <RecordsHistory ashaId={user.id} onClose={() => setShowHistory(false)} t={t} />
        )}

        <div className="snap-container" ref={containerRef}>
          {/* WELCOME HERO */}
          <section className="snap-section hero-section">
            <div className="hero-card">
              <h2 className="text-xl font-black italic mb-2">NammaASHA</h2>
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

          {/* MAIN TABS AREA */}
          <section className="snap-section main-panel-section">
            <div className="tab-nav-sticky">
              <div className="uber-tabs">
                <div className={`tab-item ${activeTab === 'assistant' ? 'active' : ''}`} onClick={() => setActiveTab('assistant')}>
                  <MessageCircle size={20} /> <span>{t.tabAssistant}</span>
                </div>
                <div className={`tab-item ${activeTab === 'forms' ? 'active' : ''}`} onClick={() => setActiveTab('forms')}>
                  <FileText size={20} /> <span>{t.tabForms}</span>
                </div>
              </div>
            </div>

            <div className="panel-content">
              {activeTab === 'assistant' ? (
                <div className="messages-area" ref={scrollRef}>
                  {messages.length === 0 && (
                    <div className="empty-chat-msg flex flex-col items-center opacity-40">
                       <MessageSquareText size={48} className="mb-4 text-[#0077ED]" />
                       <p>{t.placeholder}</p>
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div key={idx} className={msg.type === 'user' ? 'msg-user' : 'msg-ai'}>
                      {msg.type === 'user' ? msg.text : <AICard data={msg.data} />}
                    </div>
                  ))}
                  {loading && <div className="msg-ai">{t.thinking}</div>}
                </div>
              ) : (
                <FormsPanel t={t} onFormSubmit={handleFormSubmit} language={language} />
              )}
            </div>
            
            {activeTab === 'assistant' && (
              <ChatInput onSend={sendMessage} loading={loading} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. ROOT APP (Routing Logic)
 */
export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('asha_worker');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [language, setLanguage] = useState('kn');
  const t = translations[language];

  // Auth Logic for the Login page
  const handleLogin = async (ashaId, password, navigate) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asha_id: ashaId, password: password }),
      });
      const data = await res.json();
      
      if (res.ok && data.status === "success") {
        const userData = { id: ashaId, name: data.worker_name, village: data.village };
        setUser(userData);
        localStorage.setItem('asha_worker', JSON.stringify(userData));
        navigate('/app'); // Redirect to dashboard after successful login
      } else {
        alert(data.detail || "Invalid Credentials");
      }
    } catch (e) {
      alert("Backend connection error");
    }
  };

  return (
    <Router>
      <Routes>
        {/* STEP 1: Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* STEP 2: Login Page */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/app" /> : <LoginView onLogin={handleLogin} t={t} />} 
        />
        
        {/* STEP 3: Main App Dashboard */}
        <Route 
          path="/app" 
          element={user ? (
            <MainDashboard 
              user={user} 
              setUser={setUser} 
              language={language} 
              setLanguage={setLanguage} 
            />
          ) : (
            <Navigate to="/login" />
          )} 
        />
      </Routes>
    </Router>
  );
}