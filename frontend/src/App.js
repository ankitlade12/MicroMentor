import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import MicroSkillsRadar from './components/MicroSkillsRadar';
import BenchmarkComparison from './components/BenchmarkComparison';
import ImprovementPlan from './components/ImprovementPlan';
import HistoricalTrends from './components/HistoricalTrends';
import InsightsPanel from './components/InsightsPanel';
import MatchHistory from './components/MatchHistory';
import GoalTracking from './components/GoalTracking';
import ChampionAnalytics from './components/ChampionAnalytics';
import MacroReview from './components/MacroReview';
import HypotheticalScenarios from './components/HypotheticalScenarios';
import LoadingSkeleton from './components/LoadingSkeleton';
import AICoachChat from './components/AICoachChat';
import PlayerComparison from './components/PlayerComparison';
import PDFExport from './components/PDFExport';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function App() {
  const [playerId, setPlayerId] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const savedTheme = localStorage.getItem('micromentor-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
    localStorage.setItem('micromentor-theme', newMode ? 'dark' : 'light');
  };

  const fetchPlayerData = async (id) => {
    setLoading(true);
    setPlayerData(null);
    try {
      const [profile, skills, benchmarks, plan, trends, insights, history, champions, macroReview] = await Promise.all([
        axios.get(`${API_BASE}/players/${id}/profile`),
        axios.get(`${API_BASE}/players/${id}/micro-skills`),
        axios.get(`${API_BASE}/players/${id}/benchmarks?role=mid`),
        axios.get(`${API_BASE}/players/${id}/improvement-plan`),
        axios.get(`${API_BASE}/players/${id}/trends`),
        axios.get(`${API_BASE}/players/${id}/insights`),
        axios.get(`${API_BASE}/players/${id}/history`),
        axios.get(`${API_BASE}/players/${id}/champions`),
        axios.get(`${API_BASE}/players/${id}/macro-review`)
      ]);

      setPlayerData({
        profile: profile.data,
        skills: skills.data,
        benchmarks: benchmarks.data,
        improvementPlan: plan.data,
        trends: trends.data,
        insights: insights.data.insights,
        history: history.data,
        champions: champions.data,
        macroReview: macroReview.data
      });
    } catch (error) {
      console.error('Error fetching player data:', error);
      alert(`Error fetching player data: ${error.message}. Please ensure the backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (playerId.trim()) {
      fetchPlayerData(playerId);
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1 style={{ margin: 0 }}>🎯 MicroMentor</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Individual Player Development Platform</p>
        </div>
        <div className="header-controls">
          {playerData && <PDFExport playerData={playerData} />}
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter Player ID or Name"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
          />
          <button type="submit">Analyze Player</button>
        </form>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal',
            background: activeTab === 'dashboard' ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
            color: activeTab === 'dashboard' ? 'white' : 'var(--text-primary)'
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: activeTab === 'compare' ? 'bold' : 'normal',
            background: activeTab === 'compare' ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
            color: activeTab === 'compare' ? 'white' : 'var(--text-primary)'
          }}
        >
          ⚔️ Compare Players
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: activeTab === 'chat' ? 'bold' : 'normal',
            background: activeTab === 'chat' ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
            color: activeTab === 'chat' ? 'white' : 'var(--text-primary)'
          }}
        >
          🤖 AI Coach
        </button>
      </div>

      {loading && <LoadingSkeleton />}

      {activeTab === 'compare' && !loading && (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <PlayerComparison />
        </div>
      )}

      {activeTab === 'chat' && !loading && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <AICoachChat playerId={playerData?.profile?.player_id || 'ankit'} />
        </div>
      )}

      {activeTab === 'dashboard' && !loading && playerData && (
        <div className="dashboard">
          <div className="player-info">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: 0 }}>{playerData.profile.name}</h2>
                <p style={{ margin: '5px 0' }}>{playerData.profile.team} | {playerData.profile.role.toUpperCase()}</p>
                <span className={`data-source-badge ${playerData.profile.data_source}`}>
                  Source: {playerData.profile.data_source.toUpperCase()}
                </span>
              </div>
              <div className="real-time-indicator">
                Updated real-time
              </div>
            </div>
          </div>

          <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div className="left-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="charts-row">
                <div className="chart-container entered">
                  <MicroSkillsRadar data={playerData.skills} />
                </div>
                <BenchmarkComparison data={playerData.benchmarks} />
              </div>
              <HistoricalTrends data={playerData.trends} />
              <ChampionAnalytics data={playerData.champions} />
              <MatchHistory history={playerData.history} />
              <MacroReview review={playerData.macroReview} />
            </div>

            <div className="right-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <InsightsPanel insights={playerData.insights} />
              <AICoachChat playerId={playerData.profile.player_id} />
              <HypotheticalScenarios playerId={playerData.profile.player_id} />
              <GoalTracking goals={playerData.improvementPlan.goals} />
              <ImprovementPlan data={playerData.improvementPlan} />
              <div className="peer-comparison white-card">
                <h3>👥 Peer Comparison</h3>
                <p>Your Rank: <strong>#450</strong> / 1,000 Mid Laners</p>
                <div style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                  <p>Similar Players:</p>
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    <li style={{ padding: '5px 0', borderBottom: '1px solid var(--border-color)' }}>Player X (Cloud9) - 48th %ile</li>
                    <li style={{ padding: '5px 0', borderBottom: '1px solid var(--border-color)' }}>Player Y (T1) - 46th %ile</li>
                    <li style={{ padding: '5px 0' }}>Player Z (G2) - 44th %ile</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && !loading && !playerData && (
        <div className="white-card" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px' }}>
          <h2>👋 Welcome to MicroMentor</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Enter a player ID above to analyze their performance, or try these features:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
            <div style={{ padding: '15px', background: 'var(--bg-primary)', borderRadius: '8px' }}>
              <strong>📊 Player Analysis</strong>
              <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Get detailed micro-skill breakdowns and insights
              </p>
            </div>
            <div style={{ padding: '15px', background: 'var(--bg-primary)', borderRadius: '8px' }}>
              <strong>⚔️ Compare Players</strong>
              <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Side-by-side comparison with radar charts
              </p>
            </div>
            <div style={{ padding: '15px', background: 'var(--bg-primary)', borderRadius: '8px' }}>
              <strong>🤖 AI Coach</strong>
              <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Ask questions with voice or text input
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
