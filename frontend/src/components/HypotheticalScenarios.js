import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const HypotheticalScenarios = ({ playerId }) => {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/players/${playerId}/hypothetical`, {
        question: question
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setResult({ error: 'Error generating prediction. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const scenarios = result?.scenarios || [
    { label: 'Scenario A: Contested', probability: 35, outcome: 'High risk of wipe' },
    { label: 'Scenario B: Conceded', probability: 55, outcome: 'Lose objective, keep tempo' },
    { label: 'Scenario C: Delayed', probability: 10, outcome: 'Steal potential' }
  ];

  return (
    <div className="hypothetical-scenarios white-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>🔮 Strategic "What If" Predictor</h3>
        <span style={{ fontSize: '0.7rem', color: '#667eea', fontWeight: 'bold' }}>BETA</span>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
        Learn from past decisions. Our AI evaluates counterfactual scenarios to validate your gut feelings with data.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What if we took Baron instead of pushing bot?"
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' }}
        />
        <button type="submit" disabled={loading} style={{
          padding: '10px 20px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {loading && (
            <div style={{
              width: '14px',
              height: '14px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          )}
          {loading ? 'Processing...' : 'Analyze'}
        </button>
      </form>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {result && !result.error && (
        <div className="prediction-result" style={{
          padding: '20px',
          backgroundColor: '#f8faff',
          borderRadius: '12px',
          border: '1px solid #e0e6ff'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Result Preview:</p>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '15px' }}>
              {(result.scenarios || scenarios).map((s, idx) => {
                const isBest = s.probability === Math.max(...(result.scenarios || scenarios).map(x => x.probability));
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.9rem' }}>
                    <span>{isBest ? '✅' : '❌'}</span>
                    <span style={{ fontWeight: isBest ? 'bold' : 'normal' }}>{s.label}:</span>
                    <span style={{ color: isBest ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>{s.probability}% win probability</span>
                  </div>
                );
              })}
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee', fontWeight: 'bold', color: '#667eea' }}>
                Recommendation: {(result.scenarios || scenarios).sort((a, b) => b.probability - a.probability)[0].label.split(':')[0]}
                <span style={{ marginLeft: '10px', color: '#4caf50' }}>(+{(result.scenarios || scenarios).sort((a, b) => b.probability - a.probability)[0].probability - (result.scenarios || scenarios).sort((a, b) => b.probability - a.probability)[1].probability}% edge)</span>
              </div>
            </div>

            <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>AI Primary Recommendation:</p>
            <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', borderLeft: '5px solid #4caf50', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '1rem', margin: 0, color: '#2e7d32', fontWeight: '500' }}>{result.prediction}</p>
            </div>
          </div>

          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333', fontSize: '0.9rem' }}>Comparative Scenarios:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(result.scenarios || scenarios).map((s, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{s.label}</span>
                    <span style={{ fontSize: '0.85rem', color: '#667eea', fontWeight: 'bold' }}>{s.probability}% Win Prob.</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#eee', borderRadius: '3px', marginBottom: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${s.probability}%`, height: '100%', backgroundColor: s.probability > 50 ? '#4caf50' : '#ffa000' }}></div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>Outcome: {s.outcome}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {result?.error && (
        <div style={{ padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '0.9rem' }}>
          {result.error}
        </div>
      )}
    </div>
  );
};

export default HypotheticalScenarios;
