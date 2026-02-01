import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BenchmarkComparison = ({ data }) => {
  const chartData = Object.keys(data).map(metric => ({
    name: metric.toUpperCase(),
    'Your Performance': data[metric].player_value,
    'Average (P50)': data[metric].p50,
    'Above Average (P75)': data[metric].p75,
    'Elite (P90)': data[metric].p90
  }));

  return (
    <div className="benchmark-comparison">
      <h2>Benchmark Comparison</h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Your Performance" fill="#8884d8" />
            <Bar dataKey="Average (P50)" fill="#82ca9d" />
            <Bar dataKey="Above Average (P75)" fill="#ffc658" />
            <Bar dataKey="Elite (P90)" fill="#ff7c7c" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BenchmarkComparison;
