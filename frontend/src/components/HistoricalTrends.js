import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
        <p className="label">{`Date: ${label}`}</p>
        <p className="champion">{`Champion: ${data.champion}`}</p>
        <p className="result" style={{ color: data.game_result === 'WIN' ? '#4caf50' : '#f44336' }}>
          {`Result: ${data.game_result}`}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toFixed(2)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const HistoricalTrends = ({ data }) => {
  return (
    <div className="historical-trends white-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Historical Performance Trends</h2>
        <div className="trend-legend">
          <span style={{ marginRight: '10px' }}>↑ Improving</span>
          <span style={{ marginRight: '10px' }}>↓ Declining</span>
          <span>→ Stable</span>
        </div>
      </div>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="game_date" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="cs_at_10" stroke="#8884d8" activeDot={{ r: 8 }} name="CS @ 10" />
            <Line yAxisId="left" type="monotone" dataKey="kill_participation" stroke="#ff7300" name="Kill Participation %" />
            <Line yAxisId="right" type="monotone" dataKey="kda" stroke="#82ca9d" name="KDA Ratio" />
            <Line yAxisId="right" type="monotone" dataKey="vision_score_per_min" stroke="#8dd1e1" name="Vision/Min" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoricalTrends;
