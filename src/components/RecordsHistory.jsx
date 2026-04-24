import React, { useEffect, useState } from 'react';
import { X, Calendar, ClipboardCheck, User } from 'lucide-react';
import '../css/RecordsHistory.css'; // Make sure the path matches your folder structure

const RecordsHistory = ({ ashaId, onClose, t }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch(`/api/get-records/${ashaId}`);
        const data = await res.json();
        // Backend returns records sorted by date (-1) already
        setRecords(data);
      } catch (e) {
        console.error("Failed to fetch records", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [ashaId]);

  return (
    <div className="history-overlay">
      {/* HEADER */}
      <div className="history-header">
        <div className="header-left">
          <h3>{t.tabForms} History</h3>
          <span className="record-count">{records.length} Records found</span>
        </div>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="history-list">
        {loading ? (
          <div className="history-empty">Loading records...</div>
        ) : records.length === 0 ? (
          <div className="history-empty">
            <ClipboardCheck size={48} color="#ccc" />
            <p>No forms submitted yet.</p>
          </div>
        ) : (
          records.map((rec, i) => (
            <div key={rec._id || i} className="history-card">
              <div className="card-top">
                <div className="form-tag">{rec.form_type}</div>
                <div className="date-tag">
                  <Calendar size={12} />
                  {new Date(rec.created_at).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
              
              <div className="card-body">
                <div className="patient-info">
                  <User size={14} className="icon" />
                  <span>{t.patientName}: <strong>{rec.patient_name}</strong></span>
                </div>
                
                {/* Optional: Show small preview of data if it exists */}
                {rec.formData && rec.formData.phone && (
                  <div className="sub-info">📞 {rec.formData.phone}</div>
                )}
              </div>
              
              <div className="status-badge">Submitted</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecordsHistory;