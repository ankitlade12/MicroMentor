import React, { useState } from 'react';

const MatchHistory = ({ history }) => {
  const [filter, setFilter] = useState('All');

  if (!history || history.length === 0) return null;

  const filteredHistory = history.filter(game => {
    if (filter === 'All') return true;
    if (filter === 'Wins') return game.game_result === 'WIN';
    if (filter === 'Losses') return game.game_result === 'LOSS';
    return true;
  });

  const recentHistory = filter === 'Recent' ? history.slice(0, 5) : filteredHistory;

  const calculateStreak = () => {
    if (!history || history.length === 0) return null;
    let streakCount = 0;
    const firstResult = history[0].game_result;
    for (const game of history) {
      if (game.game_result === firstResult) {
        streakCount++;
      } else {
        break;
      }
    }
    return { type: firstResult, count: streakCount };
  };

  const streak = calculateStreak();

  const filterButtonStyle = (active) => ({
    padding: '6px 12px',
    marginRight: '8px',
    borderRadius: '20px',
    border: '1px solid #667eea',
    backgroundColor: active ? '#667eea' : 'white',
    color: active ? 'white' : '#667eea',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  });

  return (
    <div className="match-history white-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2 style={{ margin: 0 }}>Match History Details</h2>
          {streak && (
            <span style={{ 
              fontSize: '0.75rem', 
              backgroundColor: streak.type === 'WIN' ? '#e8f5e9' : '#ffebee', 
              color: streak.type === 'WIN' ? '#2e7d32' : '#c62828', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              Current Streak: {streak.type === 'WIN' ? 'W' : 'L'}{streak.count}
            </span>
          )}
        </div>
        <div className="filters">
          {['All', 'Wins', 'Losses', 'Recent'].map((f) => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              style={filterButtonStyle(filter === f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Result</th>
              <th style={{ padding: '12px' }}>Champion</th>
              <th style={{ padding: '12px' }}>K/D/A</th>
              <th style={{ padding: '12px' }}>CS@10</th>
            </tr>
          </thead>
          <tbody>
            {(filter === 'Recent' ? recentHistory : filteredHistory).map((game, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee', transition: 'background-color 0.2s' }} 
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fcfcfc'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '12px' }}>{game.game_date}</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: game.game_result === 'WIN' ? '#4caf50' : '#f44336' }}>
                  {game.game_result}
                </td>
                <td style={{ padding: '12px' }}>{game.champion}</td>
                <td style={{ padding: '12px' }}>{`${game.kills}/${game.deaths}/${game.assists}`}</td>
                <td style={{ padding: '12px' }}>{game.cs_at_10}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatchHistory;
