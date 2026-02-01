import React from 'react';

const ChampionAnalytics = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="champion-analytics white-card">
      <h2>Champion-Specific Analytics</h2>
      <div className="champions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {data.map((champ, index) => {
          const isRecommended = champ.win_rate >= 60 && champ.percentile >= 90;
          const needsPractice = champ.win_rate < 50;

          return (
            <div key={index} className="champ-card" style={{ 
              padding: '15px', 
              border: '1px solid #eee', 
              borderRadius: '12px', 
              textAlign: 'left',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              position: 'relative',
              backgroundColor: isRecommended ? '#f0f9ff' : 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>{champ.champion}</h3>
                {isRecommended && (
                  <span style={{ 
                    fontSize: '0.7rem', 
                    backgroundColor: '#4caf50', 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}>⭐ RECOMMENDED - Play in ranked!</span>
                )}
                {needsPractice && !isRecommended && (
                  <span style={{ 
                    fontSize: '0.7rem', 
                    backgroundColor: '#ff9800', 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}>⚠️ PRACTICE</span>
                )}
              </div>
              
              <div style={{ fontSize: '0.9rem' }}>
                <p style={{ margin: '4px 0' }}>Games: <strong>{champ.games}</strong></p>
                <p style={{ margin: '4px 0' }}>Win Rate: <span style={{ fontWeight: 'bold', color: champ.win_rate >= 50 ? '#4caf50' : '#f44336' }}>{champ.win_rate.toFixed(1)}%</span></p>
                <p style={{ margin: '4px 0' }}>Avg KDA: <strong>{champ.avg_kda.toFixed(2)}</strong></p>
                
                <div style={{ marginTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span>Percentile</span>
                    <span>{champ.percentile}th</span>
                  </div>
                  <div className="percentile-bar" style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${champ.percentile}%`, 
                      height: '100%', 
                      backgroundColor: champ.percentile >= 90 ? '#4caf50' : '#1E90FF',
                      transition: 'width 1s ease-in-out'
                    }}></div>
                  </div>
                </div>
                
                {isRecommended && (
                  <p style={{ fontSize: '0.75rem', color: '#2e7d32', marginTop: '10px', fontWeight: 'bold' }}>
                    → Top tier performance!
                  </p>
                )}
                {needsPractice && (
                  <p style={{ fontSize: '0.75rem', color: '#ef6c00', marginTop: '10px', fontWeight: 'bold' }}>
                    → Focus on mechanics in normals.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChampionAnalytics;
