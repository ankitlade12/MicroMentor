import React from 'react';
import Plot from 'react-plotly.js';

const MicroSkillsRadar = ({ data }) => {
  const categories = Object.keys(data);
  const values = categories.map(cat => {
    const skills = Object.values(data[cat]);
    if (skills.length === 0) return 0;
    const avgPercentile = skills.reduce((sum, skill) => 
      sum + (skill.percentile || 0), 0) / skills.length;
    return avgPercentile;
  });

  const radarData = [{
    type: 'scatterpolar',
    r: values,
    theta: categories.map(c => c.replace('_', ' ').toUpperCase()),
    fill: 'toself',
    name: 'Player Performance',
    marker: { color: '#1E90FF' }
  }];

  const layout = {
    title: 'Micro-Skill Performance Radar',
    polar: {
      radialaxis: {
        visible: true,
        range: [0, 100]
      }
    },
    showlegend: false,
    autosize: true
  };

  return (
    <div className="radar-chart">
      <Plot
        data={radarData}
        layout={layout}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default MicroSkillsRadar;
