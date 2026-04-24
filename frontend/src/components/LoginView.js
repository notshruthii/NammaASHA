import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import '../css/Login.css'
const LoginView = ({ onLogin, t }) => {
  const [id, setId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(id);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-icon"><Lock size={40} color="#0b664d"/></div>
        <h2>{t.userType} Login</h2>
        <p>Please enter your unique ASHA ID to continue</p>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Enter ID (e.g. 123)" 
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
          <button type="submit" className="hero-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;