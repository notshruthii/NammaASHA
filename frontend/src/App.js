import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import AICard from './components/AICard';
import ChatInput from './components/ChatInput';
import { Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (text) => {
    setMessages([...messages, { type: 'user', text }]);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'ai', data }]);
    } catch (e) {
      alert("Backend error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <Header />
        
        <div className="messages-list" ref={scrollRef}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>
              <p>ಹಲೋ! ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?</p>
              <p style={{ fontSize: '12px' }}>Talk or type to start</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={msg.type === 'user' ? 'msg-user' : 'msg-ai'}>
              {msg.type === 'user' ? msg.text : <AICard data={msg.data} />}
            </div>
          ))}
          
          {loading && (
            <div className="msg-ai" style={{ display: 'flex', gap: '10px' }}>
              Thinking...
            </div>
          )}
        </div>

        <ChatInput onSend={sendMessage} loading={loading} />
      </div>
    </div>
  );
}

export default App;