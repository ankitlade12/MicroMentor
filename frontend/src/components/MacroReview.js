import React from 'react';

const MacroReview = ({ review }) => {
  if (!review) return null;

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return '#d32f2f';
      case 'MEDIUM': return '#f57c00';
      case 'LOW': return '#388e3c';
      default: return '#d32f2f';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return '🔴 HIGH';
      case 'MEDIUM': return '🟡 MEDIUM';
      case 'LOW': return '🟢 LOW';
      default: return '🔴 HIGH';
    }
  };

  return (
    <div className="macro-review white-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>📋 Game Review Agenda</h3>
        <span style={{ fontSize: '0.75rem', backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '4px' }}>
          AI-Generated
        </span>
      </div>
      
      <div className="review-header" style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px', fontSize: '0.9rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <p style={{ margin: 0 }}><strong>Match:</strong> {review.match}</p>
          <p style={{ margin: 0 }}><strong>Opponent:</strong> {review.opponent}</p>
          <p style={{ margin: 0 }}><strong>Champion:</strong> {review.champion}</p>
          <p style={{ margin: 0 }}><strong>Result:</strong> <span style={{ color: review.result === 'WIN' ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>{review.result}</span></p>
        </div>
      </div>

      <div className="agenda-list">
        {review.agenda_items.map((item, index) => (
          <div key={index} className="agenda-item" style={{ 
            marginBottom: '15px', 
            paddingLeft: '15px', 
            borderLeft: `4px solid ${getPriorityColor(item.priority || 'HIGH')}` 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 5px 0', color: '#333' }}>
                {item.timestamp ? `[${item.timestamp}] ` : ''}{item.title}
              </p>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 'bold', 
                color: getPriorityColor(item.priority || 'HIGH'),
                whiteSpace: 'nowrap',
                marginLeft: '10px'
              }}>
                {getPriorityLabel(item.priority || 'HIGH')}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', margin: 0, color: '#666' }}>{item.description}</p>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontStyle: 'italic', fontSize: '0.75rem', color: '#999', margin: 0 }}>
          Replaces manual VOD review
        </p>
        <button style={{ 
          fontSize: '0.75rem', 
          padding: '5px 10px', 
          backgroundColor: '#eee', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Export PDF
        </button>
      </div>
    </div>
  );
};

export default MacroReview;
