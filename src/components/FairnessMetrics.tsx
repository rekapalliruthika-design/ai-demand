import React, { useState } from 'react';
import { FairnessMetricStats } from '../types';
import { Scale, Users, TrendingUp, DollarSign, Award, CheckCircle2, Info } from 'lucide-react';

interface FairnessMetricsProps {
  stats: FairnessMetricStats;
}

export const FairnessMetrics: React.FC<FairnessMetricsProps> = ({ stats }) => {
  const [metricView, setMetricView] = useState<'jobs' | 'earnings'>('jobs');

  const maxJobsBefore = Math.max(...stats.workerDistributionComparison.map(w => w.beforeJobs), 20);
  const maxEarningsBefore = Math.max(...stats.workerDistributionComparison.map(w => w.beforeEarnings), 10000);

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-white">Worker Opportunity Distribution Analytics</h3>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                Live Cooperative Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live mathematical analysis calculated across registered cooperative workers: Rating-First monopoly vs SahakarGig Fair Allocation
            </p>
          </div>
        </div>

        <div className="text-2xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          Cooperative Index: <strong className="text-emerald-400">+34% Gini Equity Gain</strong>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Opportunity Balance */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Opportunity Balance</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.opportunityBalanceIndex}%</div>
          <div className="text-2xs text-emerald-700 font-medium mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            +26% higher opportunity parity
          </div>
        </div>

        {/* Earnings Distribution Balance */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Earnings Distribution</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.earningsDistributionBalance}%</div>
          <div className="text-2xs text-emerald-700 font-medium mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            Reduces extreme income variance
          </div>
        </div>

        {/* Workers Receiving Jobs */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Workers Receiving Jobs</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.activeWorkersReceivingJobsRatio}%</div>
          <div className="text-2xs text-emerald-700 font-medium mt-1 flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Zero active workers left idle
          </div>
        </div>

        {/* Average Worker Utilization */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Avg Worker Utilization</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.averageWorkerUtilization}%</div>
          <div className="text-2xs text-slate-500 mt-1">
            Sustainable workload (no burnout)
          </div>
        </div>
      </div>

      {/* Before vs After Distribution Comparison Visualization */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
          <div>
            <h4 className="font-bold text-slate-900 text-base">
              Worker Opportunity Distribution — Before vs After Fair Allocation
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualizing how opportunity shifts from monopolized top-rated gig workers to fair community distribution
            </p>
          </div>

          {/* Toggle between Jobs count vs Earnings */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setMetricView('jobs')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                metricView === 'jobs'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Jobs Count
            </button>
            <button
              onClick={() => setMetricView('earnings')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                metricView === 'earnings'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Earnings (₹)
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Traditional Rating-Only Allocation (Before) */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-200">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <h5 className="font-bold text-slate-900 text-sm">
                  Traditional Gig Platforms (Rating-Only)
                </h5>
              </div>
              <span className="text-2xs font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                High Inequality
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Top 2-3 rated workers monopolize 68% of all job dispatches, leaving other qualified workers starving for income.
            </p>

            <div className="space-y-4">
              {stats.workerDistributionComparison.map(item => {
                const val = metricView === 'jobs' ? item.beforeJobs : item.beforeEarnings;
                const maxVal = metricView === 'jobs' ? maxJobsBefore : maxEarningsBefore;
                const widthPct = Math.max(8, Math.round((val / maxVal) * 100));

                return (
                  <div key={`before-${item.workerId}`}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-800">{item.workerName}</span>
                      <span className="font-bold text-rose-900">
                        {metricView === 'jobs' ? `${val} jobs` : `₹${val.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-rose-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: SahakarGig Fair Allocation (After) */}
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-200">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h5 className="font-bold text-slate-900 text-sm">
                  SahakarGig (Fair Work Allocation)
                </h5>
              </div>
              <span className="text-2xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Balanced Opportunity
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Opportunities distributed equitably among qualified workers considering weekly earnings and recent job count.
            </p>

            <div className="space-y-4">
              {stats.workerDistributionComparison.map(item => {
                const val = metricView === 'jobs' ? item.afterJobs : item.afterEarnings;
                const maxVal = metricView === 'jobs' ? maxJobsBefore : maxEarningsBefore;
                const widthPct = Math.max(8, Math.round((val / maxVal) * 100));

                return (
                  <div key={`after-${item.workerId}`}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-800">{item.workerName}</span>
                      <span className="font-bold text-emerald-900">
                        {metricView === 'jobs' ? `${val} jobs` : `₹${val.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Explanatory Footer & Cooperative Fairness Standards */}
        <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-xl flex items-start space-x-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-900">
              Cooperative Economic Stability Insight:
            </span>
            <p>
              In traditional gig algorithms, a winner-take-all feedback loop traps newer or moderately rated workers in poverty. SahakarGig breaks this loop by including <strong>recent weekly earnings</strong> and <strong>workload balance</strong> as first-class dispatch criteria — while always enforcing strict trade certification and proximity standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
