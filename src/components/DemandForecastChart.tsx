import React, { useState } from 'react';
import { DailyForecastPoint } from '../types';
import { TrendingUp, ShieldCheck, Calendar, Info } from 'lucide-react';

interface DemandForecastChartProps {
  data: DailyForecastPoint[];
  serviceTitle: string;
  horizonDays: number;
}

export const DemandForecastChart: React.FC<DemandForecastChartProps> = ({
  data,
  serviceTitle,
  horizonDays
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        No forecast timeline data available.
      </div>
    );
  }

  // Chart dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const padding = { top: 30, right: 30, bottom: 45, left: 50 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Scales
  const maxPredicted = Math.max(...data.map(d => d.confidenceHigh), 10);
  const minHistorical = 0;
  const yMax = Math.ceil((maxPredicted * 1.15) / 5) * 5;

  const getX = (index: number) => {
    if (data.length === 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - (val / yMax) * chartHeight;
  };

  // Build confidence range path
  const confidenceAreaPath = () => {
    if (data.length < 2) return '';
    const upperPoints = data.map((d, i) => `${getX(i)},${getY(d.confidenceHigh)}`).join(' L ');
    const lowerPoints = [...data].reverse().map((d, i) => `${getX(data.length - 1 - i)},${getY(d.confidenceLow)}`).join(' L ');
    return `M ${upperPoints} L ${lowerPoints} Z`;
  };

  // Build predicted line path
  const predictedLinePath = () => {
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.predicted)}`).join(' ');
  };

  // Build historical line path
  const historicalLinePath = () => {
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.historicalAvg)}`).join(' ');
  };

  // Y-axis grid ticks
  const yTicks = [0, Math.round(yMax * 0.25), Math.round(yMax * 0.5), Math.round(yMax * 0.75), yMax];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-slate-900 text-base">
              Service Demand Forecast — Next {horizonDays} Days
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              {serviceTitle || 'All Cooperative Trades'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical projection weighted by day-of-week seasonality, weather trends, and zone velocity
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
            <span className="text-slate-700 font-medium">Predicted Demand</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-0.5 bg-slate-400 border-b border-dashed border-slate-600"></div>
            <span className="text-slate-600">Historical Avg</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-emerald-100/80 border border-emerald-300"></div>
            <span className="text-slate-500">Confidence Band (±15%)</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
          style={{ minWidth: '600px' }}
        >
          {/* Horizontal Grid lines */}
          {yTicks.map(val => (
            <g key={`ytick-${val}`}>
              <line
                x1={padding.left}
                y1={getY(val)}
                x2={svgWidth - padding.right}
                y2={getY(val)}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={getY(val) + 4}
                textAnchor="end"
                fontSize="11"
                fill="#94a3b8"
                fontFamily="system-ui, sans-serif"
              >
                {val}
              </text>
            </g>
          ))}

          {/* Confidence interval band */}
          <path
            d={confidenceAreaPath()}
            fill="#10b981"
            fillOpacity="0.12"
          />

          {/* Historical Demand dashed line */}
          <path
            d={historicalLinePath()}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.75"
            strokeDasharray="4 3"
          />

          {/* Predicted Demand line */}
          <path
            d={predictedLinePath()}
            fill="none"
            stroke="#059669"
            strokeWidth="2.75"
          />

          {/* Data points */}
          {data.map((point, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={`point-${i}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Invisible hover trigger line */}
                <line
                  x1={getX(i)}
                  y1={padding.top}
                  x2={getX(i)}
                  y2={padding.top + chartHeight}
                  stroke={isHovered ? '#10b981' : 'transparent'}
                  strokeWidth={isHovered ? '1.5' : '12'}
                  strokeDasharray={isHovered ? '3 2' : 'none'}
                />

                {/* Point dot */}
                <circle
                  cx={getX(i)}
                  cy={getY(point.predicted)}
                  r={isHovered ? 6 : 4}
                  fill="#059669"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* X-axis label */}
                <text
                  x={getX(i)}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHovered ? '600' : '400'}
                  fill={isHovered ? '#0f172a' : '#64748b'}
                  fontFamily="system-ui, sans-serif"
                >
                  {point.day}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl border border-slate-700"
            style={{
              left: `${(getX(hoveredIndex) / svgWidth) * 100}%`,
              top: '15%',
              transform: 'translateX(-50%)'
            }}
          >
            <div className="font-semibold text-emerald-300 pb-1 border-b border-slate-700 mb-1">
              {data[hoveredIndex].day} ({data[hoveredIndex].date})
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between space-x-3">
                <span className="text-slate-300">Predicted Jobs:</span>
                <span className="font-bold text-white text-sm">{data[hoveredIndex].predicted}</span>
              </div>
              <div className="flex items-center justify-between space-x-3 text-slate-400">
                <span>Confidence Range:</span>
                <span>{data[hoveredIndex].confidenceLow} – {data[hoveredIndex].confidenceHigh}</span>
              </div>
              <div className="flex items-center justify-between space-x-3 text-slate-400">
                <span>Historical Baseline:</span>
                <span>{data[hoveredIndex].historicalAvg} jobs</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Peak service velocity expected on weekends (Sat–Sun) with +25% household repair uplift.</span>
        </div>
        <span className="text-slate-400 hidden sm:inline">Model: Holt-Winters Weighted Decomposition (Deterministic MVP)</span>
      </div>
    </div>
  );
};
