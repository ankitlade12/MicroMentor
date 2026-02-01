import React, { useState } from 'react';
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

const API_BASE = 'http://localhost:5001/api';

function App() {
  const [playerId, setPlayerId] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPlayerData = async (id) => {
    setLoading(true);
    setPlayerData(null); // Clear previous data
    try {
      console.log(`Fetching data for player: ${id}`);
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

      console.log('Received profile:', profile.data);

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
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎯 MicroMentor</h1>
        <p>Individual Player Development Platform</p>
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

      {loading && <div className="loading">Loading player data...</div>}

      {playerData && (
        <div className="dashboard">
          <div className="player-info">
            <h2>{playerData.profile.name}</h2>
            <p>{playerData.profile.team} | {playerData.profile.role.toUpperCase()}</p>
            <span className={`data-source-badge ${playerData.profile.data_source}`}>
              Source: {playerData.profile.data_source.toUpperCase()}
            </span>
          </div>

          <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div className="left-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="charts-row">
                <MicroSkillsRadar data={playerData.skills} />
                <BenchmarkComparison data={playerData.benchmarks} />
              </div>
              <HistoricalTrends data={playerData.trends} />
              <ChampionAnalytics data={playerData.champions} />
              <MatchHistory history={playerData.history} />
              <MacroReview review={playerData.macroReview} />
            </div>

            <div className="right-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <InsightsPanel insights={playerData.insights} />
              <HypotheticalScenarios playerId={playerData.profile.player_id} />
              <GoalTracking goals={playerData.improvementPlan.goals} />
              <ImprovementPlan data={playerData.improvementPlan} />
              <div className="peer-comparison white-card">
                <h3>👥 Peer Comparison</h3>
                <p>Your Rank: <strong>#450</strong> / 1,000 Mid Laners</p>
                <div style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                  <p>Similar Players:</p>
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    <li style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>Player X (Cloud9) - 48th %ile</li>
                    <li style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>Player Y (T1) - 46th %ile</li>
                    <li style={{ padding: '5px 0' }}>Player Z (G2) - 44th %ile</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
