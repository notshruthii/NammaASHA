import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const AICard = ({ data }) => {
  const [checked, setChecked] = useState({});

  if (!data) return null;

  return (
    <div className="ai-content">
      {/* 1. Topic Badge */}
      <span className="topic-tag">{data.topic}</span>
      
      {/* 2. Main Answers */}
      <div className="lang-block">
        <span className="lang-label">ಕನ್ನಡ (Kannada)</span>
        <p style={{ margin: '4px 0', fontWeight: '600', fontSize: '15px' }}>{data.answer_kn}</p>
      </div>

      <div className="lang-block" style={{ borderLeftColor: '#3b82f6' }}>
        <span className="lang-label">English</span>
        <p style={{ margin: '4px 0', fontSize: '14px', color: '#444' }}>{data.answer_en}</p>
      </div>

      {/* 3. Key Actions */}
      {data.key_actions_en?.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <span className="lang-label">Key Actions · ಮುಖ್ಯ ಕ್ರಮಗಳು</span>
          {data.key_actions_en.map((action, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <div style={{ width: 6, height: 6, background: '#0b664d', borderRadius: '50%', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>{action}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>{data.key_actions_kn[i]}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Updated Follow-up Checklist (Bilingual) */}
      {data.followup_checklist?.length > 0 && (
        <div className="checklist-area">
          <span className="lang-label">Follow-up Checklist · ಪರಿಶೀಲನಾ ಪಟ್ಟಿ</span>
          {data.followup_checklist.map((item, i) => (
            <div 
              key={i} 
              style={{ display: 'flex', gap: '10px', marginTop: '12px', cursor: 'pointer', alignItems: 'flex-start' }} 
              onClick={() => setChecked({...checked, [i]: !checked[i]})}
            >
               {/* Checkbox Box */}
               <div style={{ 
                 width: 20, 
                 height: 20, 
                 border: '2px solid #ccc', 
                 borderRadius: '5px', 
                 flexShrink: 0,
                 marginTop: '2px',
                 background: checked[i] ? '#0b664d' : 'white',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}>
                 {checked[i] && <CheckCircle2 size={16} color="white" />}
               </div>

               {/* Text Area - Now shows BOTH languages */}
               <div>
                 <p style={{ 
                   margin: 0, 
                   fontSize: '13px', 
                   fontWeight: '500',
                   textDecoration: checked[i] ? 'line-through' : 'none',
                   color: checked[i] ? '#aaa' : '#333'
                 }}>
                   {item.en}
                 </p>
                 <p style={{ 
                   margin: 0, 
                   fontSize: '12px', 
                   color: checked[i] ? '#ddd' : '#888',
                   fontStyle: 'italic'
                 }}>
                   {item.kn}
                 </p>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AICard;