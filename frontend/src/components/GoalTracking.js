import React from 'react';

const GoalTracking = ({ goals }) => {
  if (!goals || goals.length === 0) return null;

  return (
    <div className="goal-tracking white-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Goal Tracking</h2>
        <span style={{ fontSize: '0.75rem', color: '#666' }}>{goals.length} Active Goals</span>
      </div>
      
      <div className="goals-container" style={{ textAlign: 'left' }}>
        {goals.map((goal, index) => {
          const estCompletion = goal.est_completion || 'Feb 15, 2026';
          const startValue = goal.start_value || Math.max(0, goal.current - 15);
          
          const getMilestoneCelebration = (progress) => {
            if (progress >= 75) return "🎉 Major Milestone: Reached 75th percentile!";
            if (progress >= 50) return "🎉 Milestone: Reached 50th percentile!";
            if (progress >= 25) return "✨ Milestone: Reached 25th percentile!";
            return null;
          };
          
          const celebration = getMilestoneCelebration(goal.current);
          
          return (
            <div key={index} className="goal-item" style={{ marginBottom: '25px', padding: '15px', border: '1px solid #f0f0f0', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-start' }}>
                <div>
                  <strong style={{ fontSize: '1rem', color: '#333' }}>{goal.title}</strong>
                  {celebration && (
                    <div style={{ fontSize: '0.75rem', color: '#4caf50', fontWeight: 'bold', marginTop: '4px' }}>
                      {celebration}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                    Est. Completion: <span style={{ color: '#764ba2', fontWeight: 'bold' }}>{estCompletion}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#764ba2' }}>{goal.progress}%</span>
                  <div style={{ fontSize: '0.7rem', color: '#999' }}>Target: {goal.target}th %ile</div>
                </div>
              </div>
              
              <div style={{ position: 'relative', height: '40px', display: 'flex', alignItems: 'center' }}>
                {/* Milestone line */}
                <div style={{ position: 'absolute', width: '100%', height: '2px', backgroundColor: '#eee', top: '50%', transform: 'translateY(-50%)', zIndex: 0 }}></div>
                
                {/* Start Milestone */}
                <div style={{ position: 'absolute', left: '0%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, textAlign: 'center' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#ccc', borderRadius: '50%', margin: '0 auto' }}></div>
                  <div style={{ fontSize: '0.65rem', color: '#999', marginTop: '4px' }}>{startValue}%ile</div>
                </div>
                
                {/* Current Progress bar */}
                <div style={{ 
                  position: 'absolute', 
                  left: '0', 
                  width: `${goal.progress}%`, 
                  height: '8px', 
                  backgroundColor: '#764ba2', 
                  borderRadius: '4px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  boxShadow: '0 0 10px rgba(118, 75, 162, 0.3)'
                }}></div>
                
                {/* Current Milestone */}
                <div style={{ position: 'absolute', left: `${goal.progress}%`, top: '50%', transform: 'translate(-50%, -50%)', zIndex: 3, textAlign: 'center' }}>
                  <div style={{ width: '14px', height: '14px', backgroundColor: '#764ba2', border: '3px solid white', borderRadius: '50%', margin: '0 auto', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                  <div style={{ fontSize: '0.7rem', color: '#764ba2', fontWeight: 'bold', marginTop: '4px' }}>Now</div>
                </div>
                
                {/* Target Milestone */}
                <div style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, textAlign: 'center' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#ff9800', borderRadius: '50%', margin: '0 auto' }}></div>
                  <div style={{ fontSize: '0.65rem', color: '#ff9800', fontWeight: 'bold', marginTop: '4px' }}>{goal.target}th</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.7rem', color: '#999' }}>
                <span>Initial: {startValue}th percentile</span>
                <span>Current: {goal.current}th percentile</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalTracking;
