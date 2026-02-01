import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="loading-container">
      <div className="skeleton skeleton-player-info" style={{ borderRadius: '12px' }}></div>
      
      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="left-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="charts-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="white-card">
              <div className="skeleton skeleton-text short"></div>
              <div className="skeleton skeleton-chart"></div>
            </div>
            <div className="white-card">
              <div className="skeleton skeleton-text short"></div>
              <div className="skeleton skeleton-chart"></div>
            </div>
          </div>
          
          <div className="white-card">
            <div className="skeleton skeleton-text short"></div>
            <div className="skeleton skeleton-chart" style={{ height: '200px' }}></div>
          </div>
          
          <div className="white-card">
            <div className="skeleton skeleton-text short"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text medium"></div>
            <div className="skeleton skeleton-text"></div>
          </div>
        </div>
        
        <div className="right-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="white-card">
            <div className="skeleton skeleton-text short"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text medium"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
          </div>
          
          <div className="white-card">
            <div className="skeleton skeleton-text short"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text medium"></div>
          </div>
          
          <div className="white-card">
            <div className="skeleton skeleton-text short"></div>
            <div className="skeleton" style={{ height: '100px', marginTop: '10px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
