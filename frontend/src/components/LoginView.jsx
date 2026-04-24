import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Activity, ArrowLeft } from 'lucide-react'; // Import ArrowLeft
import '../css/Login.css';

const LoginView = ({ onLogin, t }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = (e) => {
    e.preventDefault();
    // In your integrated App.js, onLogin expects (id, password, navigate)
    onLogin(id, password, navigate);
  };

  return (
    <div className="login-screen">
      {/* --- BACK BUTTON --- */}
      <button 
        className="back-to-landing" 
        onClick={() => navigate('/')}
        aria-label="Back to landing page"
      >
        <ArrowLeft size={24} color="#2D4A3E" />
      </button>

      <div className="login-header">
        <div className="brand-logo">
          <Activity size={32} color="white" strokeWidth={2.5} />
        </div>
        <h1>{t.userType || "ASHA"} Login</h1>
        <p>Providing care, one visit at a time</p>
      </div>

      <div className="login-card">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="ASHA ID" 
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="hero-btn">
            Sign In
          </button>
        </form>
        
        <p className="footer-text">National Health Mission • Karnataka</p>
      </div>
    </div>
  );
};

export default LoginView;