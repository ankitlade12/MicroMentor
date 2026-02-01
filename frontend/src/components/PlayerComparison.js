import React, { useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const API_BASE = 'http://localhost:5001/api';

const PlayerComparison = () => {
    const [player1Id, setPlayer1Id] = useState('');
    const [player2Id, setPlayer2Id] = useState('');
    const [player1Data, setPlayer1Data] = useState(null);
    const [player2Data, setPlayer2Data] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showComparison, setShowComparison] = useState(false);

    const fetchPlayerData = async (id) => {
        const [profile, skills, benchmarks] = await Promise.all([
            axios.get(`${API_BASE}/players/${id}/profile`),
            axios.get(`${API_BASE}/players/${id}/micro-skills`),
            axios.get(`${API_BASE}/players/${id}/benchmarks?role=mid`)
        ]);

        return {
            profile: profile.data,
            skills: skills.data,
            benchmarks: benchmarks.data
        };
    };

    const handleCompare = async () => {
        if (!player1Id.trim() || !player2Id.trim()) return;

        setLoading(true);
        try {
            const [p1, p2] = await Promise.all([
                fetchPlayerData(player1Id),
                fetchPlayerData(player2Id)
            ]);

            setPlayer1Data(p1);
            setPlayer2Data(p2);
            setShowComparison(true);
        } catch (error) {
            console.error('Error fetching comparison data:', error);
            alert('Error fetching player data. Please check the player IDs.');
        } finally {
            setLoading(false);
        }
    };

    const getRadarData = () => {
        if (!player1Data || !player2Data) return null;

        const categories = ['Laning', 'Vision', 'Combat', 'Objectives', 'Consistency'];

        const getSkillValues = (skills) => {
            if (!skills.categories) return [50, 50, 50, 50, 50];
            return categories.map(cat => {
                const category = skills.categories.find(c =>
                    c.name.toLowerCase().includes(cat.toLowerCase())
                );
                return category ? category.score : 50;
            });
        };

        return {
            data: [
                {
                    type: 'scatterpolar',
                    r: getSkillValues(player1Data.skills),
                    theta: categories,
                    fill: 'toself',
                    name: player1Data.profile.name || player1Id,
                    fillcolor: 'rgba(102, 126, 234, 0.3)',
                    line: { color: '#667eea', width: 2 }
                },
                {
                    type: 'scatterpolar',
                    r: getSkillValues(player2Data.skills),
                    theta: categories,
                    fill: 'toself',
                    name: player2Data.profile.name || player2Id,
                    fillcolor: 'rgba(234, 102, 126, 0.3)',
                    line: { color: '#ea667e', width: 2 }
                }
            ],
            layout: {
                polar: {
                    radialaxis: {
                        visible: true,
                        range: [0, 100]
                    },
                    bgcolor: 'transparent'
                },
                showlegend: true,
                legend: { x: 0.5, xanchor: 'center', y: -0.1, orientation: 'h' },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                margin: { t: 30, b: 50, l: 30, r: 30 },
                font: { color: '#666' }
            }
        };
    };

    const getWinner = (metric) => {
        if (!player1Data?.benchmarks?.player_stats || !player2Data?.benchmarks?.player_stats) {
            return null;
        }
        const p1 = player1Data.benchmarks.player_stats[metric] || 0;
        const p2 = player2Data.benchmarks.player_stats[metric] || 0;
        return p1 > p2 ? 1 : p2 > p1 ? 2 : 0;
    };

    const metrics = [
        { key: 'cs_at_10', label: 'CS @ 10' },
        { key: 'vision_score_per_min', label: 'Vision/min' },
        { key: 'kill_participation', label: 'Kill Participation' },
        { key: 'kda', label: 'KDA' }
    ];

    return (
        <div className="white-card">
            <h3>⚔️ Player Comparison</h3>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Player 1 ID"
                    value={player1Id}
                    onChange={(e) => setPlayer1Id(e.target.value)}
                    style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: '2px solid #667eea',
                        flex: 1,
                        minWidth: '120px'
                    }}
                />
                <span style={{ alignSelf: 'center', fontWeight: 'bold', color: '#667eea' }}>VS</span>
                <input
                    type="text"
                    placeholder="Player 2 ID"
                    value={player2Id}
                    onChange={(e) => setPlayer2Id(e.target.value)}
                    style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: '2px solid #ea667e',
                        flex: 1,
                        minWidth: '120px'
                    }}
                />
                <button
                    onClick={handleCompare}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Loading...' : 'Compare'}
                </button>
            </div>

            {showComparison && player1Data && player2Data && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '12px' }}>
                            <h4 style={{ color: '#667eea', margin: 0 }}>{player1Data.profile.name}</h4>
                            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>{player1Data.profile.team} | {player1Data.profile.role?.toUpperCase()}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '2rem', color: '#764ba2' }}>⚔️</div>
                        <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(234, 102, 126, 0.1)', borderRadius: '12px' }}>
                            <h4 style={{ color: '#ea667e', margin: 0 }}>{player2Data.profile.name}</h4>
                            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>{player2Data.profile.team} | {player2Data.profile.role?.toUpperCase()}</p>
                        </div>
                    </div>

                    <Plot
                        data={getRadarData()?.data || []}
                        layout={getRadarData()?.layout || {}}
                        style={{ width: '100%', height: '300px' }}
                        config={{ displayModeBar: false, responsive: true }}
                    />

                    <div style={{ marginTop: '20px' }}>
                        <h4>Head-to-Head Stats</h4>
                        {metrics.map(({ key, label }) => {
                            const winner = getWinner(key);
                            const p1Val = player1Data.benchmarks?.player_stats?.[key] || 0;
                            const p2Val = player2Data.benchmarks?.player_stats?.[key] || 0;

                            return (
                                <div key={key} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 2fr 1fr',
                                    alignItems: 'center',
                                    padding: '10px',
                                    borderBottom: '1px solid var(--border-color)'
                                }}>
                                    <span style={{
                                        textAlign: 'right',
                                        fontWeight: winner === 1 ? 'bold' : 'normal',
                                        color: winner === 1 ? '#667eea' : 'inherit'
                                    }}>
                                        {typeof p1Val === 'number' ? p1Val.toFixed(1) : p1Val}
                                        {winner === 1 && ' 👑'}
                                    </span>
                                    <span style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>{label}</span>
                                    <span style={{
                                        textAlign: 'left',
                                        fontWeight: winner === 2 ? 'bold' : 'normal',
                                        color: winner === 2 ? '#ea667e' : 'inherit'
                                    }}>
                                        {winner === 2 && '👑 '}
                                        {typeof p2Val === 'number' ? p2Val.toFixed(1) : p2Val}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default PlayerComparison;
