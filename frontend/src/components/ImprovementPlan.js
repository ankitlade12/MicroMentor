import React from 'react';

const ImprovementPlan = ({ data }) => {
  return (
    <div className="improvement-plan white-card">
      <h2>Personalized Improvement Plan</h2>
      <div className="focus-areas" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {data.focus_areas.map((area, index) => (
          <div key={index} className="focus-card" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{area.skill.toUpperCase()}</h3>
              <span className={`priority-badge ${area.priority.toLowerCase()}`} style={{ 
                fontSize: '0.7rem', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                backgroundColor: area.priority === 'HIGH' ? '#f44336' : '#ff9800',
                color: 'white'
              }}>
                {area.priority}
              </span>
            </div>
            <div className="stats-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '10px' }}>
              <span>Current: <strong>{area.current_percentile}th</strong> %ile</span>
              <span>Target: <strong>{area.target_percentile}th</strong> %ile</span>
            </div>
            <div style={{ fontSize: '0.85rem', marginBottom: '10px', color: '#666' }}>
              <p>⏱️ Time to improve: {area.time_to_improve}</p>
              <p>🎯 Success metric: {area.success_metric}</p>
            </div>
            <ul className="recommendations" style={{ paddingLeft: '20px', fontSize: '0.9rem' }}>
              {area.recommendations.map((rec, rIndex) => (
                <li key={rIndex} style={{ marginBottom: '5px' }}>{rec}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImprovementPlan;
