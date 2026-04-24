import React, { useState } from 'react';
import { ChevronRight, ArrowLeft, ClipboardList, Syringe } from 'lucide-react';

const FormsPanel = ({ t, onFormSubmit }) => {
  const [category, setCategory] = useState(null); // 'maternal' or 'imm'
  const [selectedForm, setSelectedForm] = useState(null);

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

  // 3. The Dynamic Form Input View (Fields strictly from PDF)
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
              <input name="patient_name" required />
            </div>
            
            {selectedForm === t.formBirthPrep && (
              <>
                <div className="input-group"><label>{t.husbandName}</label><input name="husband" /></div>
                <div className="input-group"><label>{t.lmp}</label><input name="lmp" type="date" /></div>
                <div className="input-group"><label>{t.edd}</label><input name="edd" type="date" /></div>
                <div className="input-group"><label>{t.transport}</label><select name="transport"><option>Yes</option><option>No</option></select></div>
              </>
            )}

            {selectedForm === t.formDelivery && (
              <>
                <div className="input-group"><label>{t.ashArrival}</label><input name="asha_time" type="time" /></div>
                <div className="input-group"><label>{t.labourPain}</label><input name="pain_time" type="time" /></div>
                <div className="input-group"><label>{t.deliveryPlace}</label><input name="place" placeholder="Hospital/Home" /></div>
              </>
            )}

            {selectedForm === t.formPostNatal && (
              <>
                <div className="input-group"><label>Day of visit (1,3,7,14,21,28,42)</label><input name="visit_day" type="number" /></div>
                <div className="input-group"><label>Temperature (°F)</label><input name="temp" type="number" /></div>
              </>
            )}
          </>
        )}

        {/* FIELDS FOR IMMUNIZATION */}
        {category === 'imm' && (
          <>
            {selectedForm === t.formChildImm && (
              <>
                <div className="input-group"><label>{t.patientName}</label><input name="patient_name" required /></div>
                <div className="input-group"><label>{t.bcg}</label><select name="bcg"><option>Yes</option><option>No</option></select></div>
                <div className="input-group"><label>{t.opv}</label><select name="opv"><option>Yes</option><option>No</option></select></div>
                <div className="input-group"><label>{t.birthWeight}</label><input name="weight" type="number" step="0.1" /></div>
              </>
            )}

            {selectedForm === t.formStock && (
              <>
                <div className="input-group"><label>{t.drugName}</label><input name="drug" required /></div>
                <div className="input-group"><label>{t.stockBalance}</label><input name="balance" type="number" /></div>
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