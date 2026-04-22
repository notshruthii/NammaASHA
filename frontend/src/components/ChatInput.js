import React, { useState } from 'react';
import { Mic, Send, MicOff, Globe } from 'lucide-react';

const ChatInput = ({ onSend, loading }) => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState("kn-IN"); // Default to Kannada

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice not supported in this browser");

    const recognition = new SpeechRecognition();
    
    // Uses the currently selected language
    recognition.lang = lang; 
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech Error:", event.error);
      setIsListening(false);
    };
    
    recognition.start();
  };

  const handleSubmit = () => {
    if (!text.trim() || loading) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="input-bar">
      {/* Language Toggle Button */}
      <button 
        onClick={() => setLang(lang === "kn-IN" ? "en-IN" : "kn-IN")}
        style={{
          border: 'none',
          background: '#e9f2ee',
          color: '#0b664d',
          padding: '0 10px',
          borderRadius: '15px',
          fontSize: '10px',
          fontWeight: 'bold',
          cursor: 'pointer',
          height: '50px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px'
        }}
      >
        <Globe size={14} />
        {lang === "kn-IN" ? "ಕನ್ನಡ" : "ENG"}
      </button>

      {/* Microphone Button */}
      <button 
        className={`mic-btn ${isListening ? 'listening' : ''}`} 
        onClick={handleVoice}
        title={lang === "kn-IN" ? "ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ" : "Speak in English"}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      <input 
        className="chat-input" 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder={lang === "kn-IN" ? "ಮಾತನಾಡಿ ಅಥವಾ ಬರೆಯಿರಿ..." : "Speak or type..."}
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
      />

      <button className="send-btn" onClick={handleSubmit}>
        <Send size={20} />
      </button>
    </div>
  );
};

export default ChatInput;