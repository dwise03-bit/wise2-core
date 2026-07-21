'use client';

import React from 'react';

export interface BaseChartProps {
  data: any[];
  title?: string;
  height?: number;
  loading?: boolean;
}

export const BaseChart: React.FC<BaseChartProps> = ({ data, title, height = 300, loading }) => {
  if (loading) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div>;
  }

  if (!data || data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No data available</div>;
  }

  return <div style={{ height }}>{title && <h4>{title}</h4>}</div>;
};

export default BaseChart;
