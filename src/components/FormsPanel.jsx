import React, { useState } from 'react';
import { ChevronRight, ArrowLeft, ClipboardList, Syringe, Mic, MicOff } from 'lucide-react';

const FormsPanel = ({ t, onFormSubmit, language }) => {
  const [category, setCategory] = useState(null); // 'maternal' or 'imm'
  const [selectedForm, setSelectedForm] = useState(null);

  // --- Voice Logic Start ---
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const startVoice = (fieldName) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser not supported");

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'kn' ? 'kn-IN' : 'en-US';
    setActiveField(fieldName);
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = document.getElementsByName(fieldName)[0];
      if (input) {
        if (input.tagName === 'SELECT') {
          const val = transcript.toLowerCase();
          if (val.includes("yes") || val.includes("ಹೌದು")) input.value = "Yes";
          if (val.includes("no") || val.includes("ಇಲ್ಲ")) input.value = "No";
        } else {
          input.value = transcript.replace(/\.$/, ""); // Remove trailing dots
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };
    recognition.onend = () => { setIsListening(false); setActiveField(null); };
    recognition.start();
  };

  const MicBtn = ({ name }) => (
    <button 
      type="button" 
      onClick={() => startVoice(name)}
      style={{ padding: '8px', border: 'none', background: activeField === name && isListening ? '#ff4444' : '#f0f0f0', borderRadius: '8px', marginLeft: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {activeField === name && isListening ? <MicOff size={16} color="white" /> : <Mic size={16} color="#666" />}
    </button>
  );
  // --- Voice Logic End ---

  // 1. Category Selection View
  if (!category) {
    return (
      <div className="forms-list-modern">
        <h3 className="section-title">Select Category</h3>
        <div className="form-card-modern" onClick={() => setCategory('maternal')}>
          <div className="form-icon-box" style={{background: '#e8f5e9'}}><ClipboardList color="#2e7d32" /></div>
          <div className="form-details">
            <h4>{t.maternalTitle}</h4>
            <p>3 Official Annexures</p>
          </div>
          <ChevronRight size={20} color="#ccc" />
        </div>

        <div className="form-card-modern" onClick={() => setCategory('imm')}>
          <div className="form-icon-box" style={{background: '#e3f2fd'}}><Syringe color="#1565c0" /></div>
          <div className="form-details">
            <h4>{t.immTitle}</h4>
            <p>2 Official Annexures</p>
          </div>
          <ChevronRight size={20} color="#ccc" />
        </div>
      </div>
    );
  }

  // 2. Specific Form List View
  if (!selectedForm) {
    const forms = category === 'maternal' 
      ? [t.formBirthPrep, t.formDelivery, t.formPostNatal] 
      : [t.formChildImm, t.formStock];

    return (
      <div className="forms-list-modern">
        <button onClick={() => setCategory(null)} className="back-btn">
          <ArrowLeft size={16} /> Back to Categories
        </button>
        <h3 className="section-title">{category === 'maternal' ? t.maternalTitle : t.immTitle}</h3>
        {forms.map((fname, i) => (
          <div key={i} className="form-card-modern" onClick={() => setSelectedForm(fname)}>
            <div className="form-icon-box">{category === 'maternal' ? '📋' : '💉'}</div>
            <div className="form-details"><h4>{fname}</h4></div>
            <ChevronRight size={20} color="#ccc" />
          </div>
        ))}
      </div>
    );
  }

  // 3. The Dynamic Form Input View
  return (
    <div className="active-form-container">
      <button onClick={() => setSelectedForm(null)} className="back-btn">
        <ArrowLeft size={16} /> {t.backBtn}
      </button>
      <h3 className="form-header-title">{selectedForm}</h3>
      
      <form onSubmit={(e) => { onFormSubmit(e, selectedForm); setSelectedForm(null); }} className="modern-input-form">
        
        {/* FIELDS FOR MATERNAL CARE */}
        {category === 'maternal' && (
          <>
            <div className="input-group">
              <label>{t.patientName}</label>
              <div style={{ display: 'flex' }}><input name="patient_name" required style={{ flex: 1 }} /><MicBtn name="patient_name"/></div>
            </div>
            
            {selectedForm === t.formBirthPrep && (
              <>
                <div className="input-group"><label>{t.husbandName}</label><div style={{ display: 'flex' }}><input name="husband" style={{ flex: 1 }} /><MicBtn name="husband"/></div></div>
                <div className="input-group"><label>{t.lmp}</label><input name="lmp" type="date" /></div>
                <div className="input-group"><label>{t.edd}</label><input name="edd" type="date" /></div>
                <div className="input-group"><label>{t.transport}</label><div style={{ display: 'flex' }}><select name="transport" style={{ flex: 1 }}><option>Yes</option><option>No</option></select><MicBtn name="transport"/></div></div>
              </>
            )}

            {selectedForm === t.formDelivery && (
              <>
                <div className="input-group"><label>{t.ashArrival}</label><input name="asha_time" type="time" /></div>
                <div className="input-group"><label>{t.labourPain}</label><input name="pain_time" type="time" /></div>
                <div className="input-group"><label>{t.deliveryPlace}</label><div style={{ display: 'flex' }}><input name="place" placeholder="Hospital/Home" style={{ flex: 1 }} /><MicBtn name="place"/></div></div>
              </>
            )}

            {selectedForm === t.formPostNatal && (
              <>
                <div className="input-group"><label>Day of visit (1,3,7,14,21,28,42)</label><div style={{ display: 'flex' }}><input name="visit_day" type="number" style={{ flex: 1 }} /><MicBtn name="visit_day"/></div></div>
                <div className="input-group"><label>Temperature (°F)</label><div style={{ display: 'flex' }}><input name="temp" type="number" style={{ flex: 1 }} /><MicBtn name="temp"/></div></div>
              </>
            )}
          </>
        )}

        {/* FIELDS FOR IMMUNIZATION */}
        {category === 'imm' && (
          <>
            {selectedForm === t.formChildImm && (
              <>
                <div className="input-group"><label>{t.patientName}</label><div style={{ display: 'flex' }}><input name="patient_name" required style={{ flex: 1 }} /><MicBtn name="patient_name"/></div></div>
                <div className="input-group"><label>{t.bcg}</label><div style={{ display: 'flex' }}><select name="bcg" style={{ flex: 1 }}><option>Yes</option><option>No</option></select><MicBtn name="bcg"/></div></div>
                <div className="input-group"><label>{t.opv}</label><div style={{ display: 'flex' }}><select name="opv" style={{ flex: 1 }}><option>Yes</option><option>No</option></select><MicBtn name="opv"/></div></div>
                <div className="input-group"><label>{t.birthWeight}</label><div style={{ display: 'flex' }}><input name="weight" type="number" step="0.1" style={{ flex: 1 }} /><MicBtn name="weight"/></div></div>
              </>
            )}

            {selectedForm === t.formStock && (
              <>
                <div className="input-group"><label>{t.drugName}</label><div style={{ display: 'flex' }}><input name="drug" required style={{ flex: 1 }} /><MicBtn name="drug"/></div></div>
                <div className="input-group"><label>{t.stockBalance}</label><div style={{ display: 'flex' }}><input name="balance" type="number" style={{ flex: 1 }} /><MicBtn name="balance"/></div></div>
              </>
            )}
          </>
        )}

        <button type="submit" className="hero-btn submit-form-btn">{t.submitBtn}</button>
      </form>
    </div>
  );
};

export default FormsPanel;