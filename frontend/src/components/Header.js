import React from 'react';

const Header = () => (
  <header className="chat-header">

<div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>      <div style={{ width: 12, height: 12, background: 'white', borderRadius: '50%' }} />
    </div>
    <div>
      <h2 style={{ margin: 0, fontSize: '20px' }}>NammaASHA</h2>
      <p style={{ margin: 0, fontSize: '9px', opacity: 0.8 }}>ಧ್ವನಿ ಮೂಲಕ ಕೇಳಿ · VOICE ASSISTANT</p>
    </div>
  </header>
);

export default Header;