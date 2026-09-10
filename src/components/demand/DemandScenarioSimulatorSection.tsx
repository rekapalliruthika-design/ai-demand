import React, { useState, useEffect } from 'react';
import {
  DemandRiskRadarItem,
  WhatIfScenarioResult
} from '../../types';
import { defaultWorkforcePlanningService } from '../../services/workforcePlanningService';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  Users,
  ShieldAlert,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';

interface DemandScenarioSimulatorSectionProps {
  baseRisks: DemandRiskRadarItem[];
}

export const DemandScenarioSimulatorSection: React.FC<DemandScenarioSimulatorSectionProps> = ({ baseRisks }) => {
  const [percentageChange, setPercentageChange] = useState<number>(10);
  const [simulationResult, setSimulationResult] = useState<WhatIfScenarioResult | null>(null);

  useEffect(() => {
    const res = defaultWorkforcePlanningService.simulateScenario(
      { percentageChange },
      baseRisks
    );
    setSimulationResult(res);
  }, [percentageChange, baseRisks]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase tracking-wider">
              Section 9
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
              <Sliders className="w-4 h-4 text-indigo-600 mr-1.5" />
              What-If Scenario Simulator (Stress-Test Cooperative Capacity)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Test hypothetical surge or drop conditions without modifying live bookings or active worker rosters
          </p>
        </div>

        {/* Simulation notice */}
        <div className="flex items-center space-x-1 text-2xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold">Planning simulator — Zero platform state changes</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-900">
              Hypothetical Demand Shift:
              <span className={`ml-2 text-sm font-black ${
                percentageChange > 0
                  ? 'text-emerald-700'
                  : percentageChange < 0
                  ? 'text-amber-700'
                  : 'text-slate-700'
              }`}>
                {percentageChange > 0 ? `+${percentageChange}` : percentageChange}%
              </span>
            </span>
            <p className="text-2xs text-slate-500">
              Slide to stress-test capacity against extreme surge or seasonal contraction
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {[-20, -10, 0, 10, 20, 35].map(pct => (
              <button
                key={pct}
                onClick={() => setPercentageChange(pct)}
                className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all ${
                  percentageChange === pct
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {pct > 0 ? `+${pct}%` : `${pct}%`}
              </button>
            ))}
            <button
              onClick={() => setPercentageChange(0)}
              title="Reset to 0%"
              className="p-1 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="-50"
          max="100"
          step="5"
          value={percentageChange}
          onChange={e => setPercentageChange(parseInt(e.target.value, 10))}
          className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-3xs font-semibold text-slate-600">
          <span>-50% (Severe Contraction)</span>
          <span>Baseline (0%)</span>
          <span>+50% (Festival Spike)</span>
          <span>+100% (Surge Double)</span>
        </div>
      </div>

      {/* Simulated Outcomes Summary Cards */}
      {simulationResult && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <span className="text-2xs font-bold text-slate-600 uppercase tracking-wider block">Projected Workload</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {simulationResult.scenarioDemand} <span className="text-xs font-semibold text-slate-500">jobs</span>
              </div>
              <span className="text-2xs text-slate-600">
                Baseline: {simulationResult.originalDemand} jobs
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <span className="text-2xs font-bold text-slate-600 uppercase tracking-wider block">Workers Needed</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {simulationResult.scenarioWorkersRequired} <span className="text-xs font-semibold text-slate-500">workers</span>
              </div>
              <span className="text-2xs text-slate-600">
                Baseline: {simulationResult.baselineWorkersRequired} workers
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <span className="text-2xs font-bold text-slate-600 uppercase tracking-wider block">Workforce Coverage</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {simulationResult.capacityPercentage}%
              </div>
              <span className="text-2xs text-slate-600">
                Active pool: {simulationResult.availableCapacity} workers
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <span className="text-2xs font-bold text-slate-600 uppercase tracking-wider block">Cooperative Gap</span>
              <div className={`text-xl font-black mt-1 ${
                simulationResult.workforceGap < 0 ? 'text-red-700' : 'text-emerald-700'
              }`}>
                {simulationResult.workforceGap > 0
                  ? `+${simulationResult.workforceGap} surplus`
                  : `${simulationResult.workforceGap} deficit`}
              </div>
              <span className="text-2xs font-semibold text-slate-600">
                Risk: {simulationResult.riskLevel}
              </span>
            </div>
          </div>

          {/* Action guidance callout */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Simulated Policy Recommendation: </strong>
              <span>{simulationResult.recommendedAction}</span>
            </div>
          </div>

          {/* Area Breakdown Table */}
          <div className="overflow-x-auto max-h-60">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-2xs uppercase tracking-wider text-slate-500 font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Service</th>
                  <th className="py-2 px-3">Cooperative Area</th>
                  <th className="py-2 px-3 text-center">Baseline Jobs</th>
                  <th className="py-2 px-3 text-center">Simulated Jobs</th>
                  <th className="py-2 px-3 text-center">Workers Needed</th>
                  <th className="py-2 px-3 text-center">Active Pool</th>
                  <th className="py-2 px-3 text-center">Simulated Gap</th>
                  <th className="py-2 px-3 text-center">Simulated Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {simulationResult.areaBreakdown.map(b => (
                  <tr key={`${b.service}-${b.location}`} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 font-semibold text-slate-900">{b.service}</td>
                    <td className="py-2 px-3 text-slate-700">{b.location.split(' - ')[0]}</td>
                    <td className="py-2 px-3 text-center text-slate-600">{b.originalJobs}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-900">{b.adjustedJobs}</td>
                    <td className="py-2 px-3 text-center text-slate-800 font-semibold">{b.requiredWorkers}</td>
                    <td className="py-2 px-3 text-center text-emerald-700 font-bold">{b.availableWorkers}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`font-black text-2xs px-1.5 py-0.2 rounded ${
                        b.gap < 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {b.gap > 0 ? `+${b.gap}` : b.gap}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-2xs">
                      <span className={b.risk === 'Critical' ? 'text-red-700' : b.risk === 'High' ? 'text-amber-700' : 'text-slate-600'}>
                        {b.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
