import React, { useState } from 'react';
import {
  StatisticalForecastResult,
  DemandTrendMetrics
} from '../../types';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Calendar,
  Calculator,
  Info
} from 'lucide-react';

interface DemandTrendForecastSectionProps {
  forecast: StatisticalForecastResult | null;
  trendMetrics: DemandTrendMetrics;
  serviceTitle: string;
  locationTitle: string;
  horizonDays: number;
}

export const DemandTrendForecastSection: React.FC<DemandTrendForecastSectionProps> = ({
  forecast,
  trendMetrics,
  serviceTitle,
  locationTitle,
  horizonDays
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Check if forecast has insufficient historical data
  const isInsufficient = !forecast || forecast.isInsufficientData || forecast.dailyTimeline.length === 0;

  // Chart SVG calculations
  const svgWidth = 800;
  const svgHeight = 260;
  const pad = { top: 25, right: 30, bottom: 40, left: 45 };
  const chartW = svgWidth - pad.left - pad.right;
  const chartH = svgHeight - pad.top - pad.bottom;

  const timeline = forecast?.dailyTimeline || [];
  const maxVal = timeline.length > 0
    ? Math.max(...timeline.map(d => Math.max(d.confidenceHigh, d.predicted, d.historicalAvg)), 10)
    : 10;
  const yMax = Math.ceil((maxVal * 1.15) / 5) * 5;

  const getX = (idx: number) => {
    if (timeline.length <= 1) return pad.left + chartW / 2;
    return pad.left + (idx / (timeline.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    return pad.top + chartH - (val / yMax) * chartH;
  };

  // Confidence area path
  const confidenceAreaPath = () => {
    if (timeline.length < 2) return '';
    const upper = timeline.map((d, i) => `${getX(i)},${getY(d.confidenceHigh)}`).join(' L ');
    const lower = [...timeline].reverse().map((d, i) => `${getX(timeline.length - 1 - i)},${getY(d.confidenceLow)}`).join(' L ');
    return `M ${upper} L ${lower} Z`;
  };

  // Projected line path
  const projectedLinePath = () => {
    if (timeline.length === 0) return '';
    return timeline.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.predicted)}`).join(' ');
  };

  // Historical line path
  const historicalLinePath = () => {
    if (timeline.length === 0) return '';
    return timeline.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.historicalAvg)}`).join(' ');
  };

  // Max day-of-week value for mini-chart
  const maxDow = Math.max(...trendMetrics.dayOfWeekPatterns.map(d => d.avgRequests), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
      {/* Header & Confidence Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
              Section 2
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Demand Trend & Statistical Time-Series Forecast
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              ({serviceTitle} • {locationTitle})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent deterministic formulation combining Recency-Weighted Moving Average (WMA), day-of-week seasonality, and historical variance
          </p>
        </div>

        {/* Confidence Badge */}
        {forecast && !isInsufficient && (
          <div className="flex items-center space-x-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
            <div className="text-right">
              <div className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Forecast Confidence</div>
              <div className="text-xs font-extrabold text-slate-900 flex items-center justify-end space-x-1">
                <span>{forecast.confidenceScore}%</span>
                <span className={`text-2xs font-bold px-1.5 py-0.2 rounded ${
                  forecast.confidenceScore >= 80
                    ? 'bg-emerald-100 text-emerald-800'
                    : forecast.confidenceScore >= 65
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {forecast.confidenceLabel}
                </span>
              </div>
            </div>
            <ShieldCheck className={`w-6 h-6 ${
              forecast.confidenceScore >= 80 ? 'text-emerald-600' : 'text-blue-600'
            }`} />
          </div>
        )}
      </div>

      {/* Insufficient Historical Data Alert Banner (Section 3 & 8 requirement) */}
      {isInsufficient ? (
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 text-amber-900 space-y-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900">
                Insufficient historical data for reliable forecasting
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {forecast?.dataQualityWarning ||
                  `The platform requires at least 3 distinct day records for "${serviceTitle}" in "${locationTitle}" to generate reliable time-series projections.`}
                {' '}Statistical projections are paused to prevent misleading predictions. Below are the descriptive baseline trends recorded so far.
              </p>
            </div>
          </div>
          <div className="bg-white/80 rounded-lg p-3 border border-amber-200/80 text-2xs space-y-1 text-amber-900 font-medium">
            <div>● <strong>Data-Driven Policy:</strong> SahakarGig never synthesizes fake predictions or black-box accuracy metrics.</div>
            <div>● <strong>To Enable Forecast:</strong> Log service requests via "Manage Live Data" or wait for real customer bookings to accumulate.</div>
          </div>
        </div>
      ) : (
        <>
          {/* Main SVG Time-Series Chart */}
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none"
            >
              <defs>
                <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="95%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="confidenceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = pad.top + chartH * pct;
                const val = Math.round(yMax * (1 - pct));
                return (
                  <g key={`grid-${i}`}>
                    <line
                      x1={pad.left}
                      y1={y}
                      x2={svgWidth - pad.right}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={pad.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#94a3b8"
                      fontWeight="500"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Confidence Band Area */}
              <path
                d={confidenceAreaPath()}
                fill="url(#confidenceAreaGrad)"
                stroke="none"
              />

              {/* Historical Average Line */}
              <path
                d={historicalLinePath()}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Predicted Demand Line */}
              <path
                d={projectedLinePath()}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />

              {/* Data Points & Interaction */}
              {timeline.map((d, i) => {
                const x = getX(i);
                const yPred = getY(d.predicted);
                const isHovered = hoveredPoint === i;

                return (
                  <g
                    key={`pt-${i}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(i)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Hover vertical crosshair */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1={pad.top}
                        x2={x}
                        y2={pad.top + chartH}
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Point on predicted line */}
                    <circle
                      cx={x}
                      cy={yPred}
                      r={isHovered ? 5 : 3.5}
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* X-axis day label */}
                    <text
                      x={x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isHovered ? '#0f172a' : '#64748b'}
                      fontWeight={isHovered ? '700' : '500'}
                    >
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint !== null && timeline[hoveredPoint] && (
              <div
                className="absolute z-10 bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs pointer-events-none border border-slate-700 space-y-1"
                style={{
                  left: `${(hoveredPoint / (timeline.length - 1)) * 75 + 10}%`,
                  top: '15px'
                }}
              >
                <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex justify-between gap-3">
                  <span>{timeline[hoveredPoint].date} ({timeline[hoveredPoint].day})</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {timeline[hoveredPoint].predicted} reqs
                  </span>
                </div>
                <div className="text-2xs text-slate-300 pt-0.5 space-y-0.5">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Confidence (±1σ):</span>
                    <span className="font-mono text-slate-200">
                      {timeline[hoveredPoint].confidenceLow} - {timeline[hoveredPoint].confidenceHigh}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Historical Avg:</span>
                    <span className="font-mono text-slate-300">
                      {timeline[hoveredPoint].historicalAvg}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Legend Bar */}
            <div className="flex items-center justify-center space-x-6 text-2xs text-slate-600 pt-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 bg-emerald-500 rounded" />
                <span className="font-semibold text-slate-800">Projected Demand ({horizonDays}d)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-2 bg-slate-200 rounded-xs" />
                <span>Confidence Range (±1σ)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-slate-400" />
                <span>Historical Average</span>
              </div>
            </div>
          </div>

          {/* Mathematical Explainability Parameters (Section 7) */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-700">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200">
              <span className="font-bold text-slate-900 flex items-center">
                <Calculator className="w-3.5 h-3.5 text-emerald-700 mr-1.5" />
                Deterministic Formulation Breakdown
              </span>
              <span className="text-2xs font-semibold text-slate-600">
                Sample: {forecast.breakdown.historicalSampleCount} recorded days
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs">
              <div>
                <span className="text-slate-600 block">Moving Average (SMA):</span>
                <span className="font-bold text-slate-900">{forecast.breakdown.movingAverage} reqs/day</span>
              </div>
              <div>
                <span className="text-slate-600 block">Recency Weighted (WMA):</span>
                <span className="font-bold text-slate-900">{forecast.breakdown.weightedMovingAverage} reqs/day</span>
              </div>
              <div>
                <span className="text-slate-600 block">Momentum Multiplier:</span>
                <span className="font-bold text-slate-900">{forecast.breakdown.recencyWeight}x</span>
              </div>
              <div>
                <span className="text-slate-600 block">Variance (StdDev σ):</span>
                <span className="font-bold text-slate-900">±{forecast.breakdown.varianceStdDev} reqs</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Demand Patterns: Day of Week & Time-Slot Intelligence (Section 6 & 11) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        {/* Day of Week Seasonality Patterns */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 flex items-center">
              <Calendar className="w-3.5 h-3.5 text-blue-700 mr-1.5" />
              Day-of-Week Demand Pattern
            </span>
            <span className="text-2xs text-slate-600 font-semibold">Avg daily requests</span>
          </div>

          <div className="h-28 flex items-end justify-between gap-2 pt-2 px-2">
            {trendMetrics.dayOfWeekPatterns.map(d => {
              const heightPct = Math.min(100, Math.max(12, (d.avgRequests / maxDow) * 100));
              const isWeekend = d.day === 'Sat' || d.day === 'Sun';

              return (
                <div key={d.day} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-3xs font-bold text-slate-600 mb-1 group-hover:text-slate-900">
                    {d.avgRequests}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      isWeekend ? 'bg-blue-500 group-hover:bg-blue-600' : 'bg-emerald-500 group-hover:bg-emerald-600'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-3xs font-semibold text-slate-500 mt-1">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-3xs text-slate-600 mt-2 flex justify-between border-t border-slate-200 pt-1">
            <span>● Weekday Baseline</span>
            <span className="text-blue-700 font-semibold">● Weekend Spike Factor</span>
          </div>
        </div>

        {/* Time-Slot Intelligence (Section 11) */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center">
                <Clock className="w-3.5 h-3.5 text-emerald-700 mr-1.5" />
                Time-Slot Intelligence
              </span>
              <span className="px-2 py-0.5 rounded-full text-3xs font-bold bg-emerald-100 text-emerald-800">
                Peak: {trendMetrics.peakTimeSlot}
              </span>
            </div>
            <p className="text-2xs text-slate-600 mb-3">
              {trendMetrics.peakPeriodInsight}
            </p>
          </div>

          <div className="space-y-2">
            {trendMetrics.timeSlotPatterns.map(slot => (
              <div key={slot.slot} className="space-y-0.5">
                <div className="flex justify-between text-2xs font-semibold text-slate-700">
                  <span>{slot.label}</span>
                  <span>{slot.percentage}% ({slot.count} requests)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      slot.label.includes('Evening')
                        ? 'bg-emerald-600'
                        : slot.label.includes('Morning')
                        ? 'bg-blue-600'
                        : slot.label.includes('Afternoon')
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.max(4, slot.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
