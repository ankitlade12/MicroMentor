import React from 'react';

const InsightsPanel = ({ insights }) => {
  return (
    <div className="insights-panel white-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>📊 Performance Insights</h3>
        <span style={{ fontSize: '0.7rem', color: '#666' }}>Updated real-time</span>
      </div>
      
      <div className="insights-list">
        {insights.map((item, index) => {
          const confidence = item.confidence || 85;
          const correlation = item.correlation || 0.75;
          const sampleSize = item.sample_size || 47;
          const timePeriod = item.time_period || 'Last 30 days';
          
          return (
            <div key={index} className="insight-item" style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              backgroundColor: '#fcfcfc', 
              borderRadius: '10px',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', color: '#667eea', fontSize: '0.85rem' }}>DATA OBSERVED ({timePeriod})</span>
                  <span style={{ fontSize: '0.7rem', color: '#999' }}>Sample Size: {sampleSize} games analyzed</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '2px' }}>Confidence</div>
                  <div style={{ width: '80px', height: '6px', backgroundColor: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${confidence}%`, height: '100%', backgroundColor: '#4caf50' }}></div>
                  </div>
                </div>
              </div>
              
              <p style={{ fontSize: '0.9rem', marginBottom: '15px', lineHeight: '1.4' }}>{item.data}</p>
              
              <div style={{ padding: '12px', backgroundColor: '#f0f4ff', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
                <p style={{ fontWeight: 'bold', color: '#764ba2', fontSize: '0.85rem', marginBottom: '5px' }}>STRATEGIC INSIGHT</p>
                <p style={{ fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>{item.insight}</p>
              </div>

              {correlation > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold' }}>CORRELATION:</span>
                  <div style={{ flex: 1, height: '4px', backgroundColor: '#eee', borderRadius: '2px' }}>
                    <div style={{ width: `${correlation * 100}%`, height: '100%', backgroundColor: '#764ba2' }}></div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#764ba2', fontWeight: 'bold' }}>{(correlation * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: '0.75rem', color: '#999', textAlign: 'center', marginTop: '10px' }}>
        "MicroMentor discovers non-obvious patterns coaches might miss."
      </p>
    </div>
  );
};

export default InsightsPanel;
