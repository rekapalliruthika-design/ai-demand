import React from 'react';
import { DemandAnomalyItem } from '../../types';
import {
  Activity,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';

interface DemandAnomaliesSectionProps {
  anomalies: DemandAnomalyItem[];
}

export const DemandAnomaliesSection: React.FC<DemandAnomaliesSectionProps> = ({ anomalies }) => {
  const getSeverityBadge = (severity: DemandAnomalyItem['severity']) => {
    switch (severity) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded text-2xs font-extrabold bg-red-100 text-red-800">Critical Shift</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-2xs font-bold bg-amber-100 text-amber-800">High Shift</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-2xs font-bold bg-blue-100 text-blue-800">Moderate Shift</span>;
      case 'Low':
      default:
        return <span className="px-2 py-0.5 rounded text-2xs font-bold bg-slate-100 text-slate-700">Minor Shift</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
              Section 6
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
              <Activity className="w-4 h-4 text-amber-600 mr-1.5" />
              Demand Anomaly Detection
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical outliers detected when observed daily bookings deviate by &gt; 1.3σ from rolling trade baselines
          </p>
        </div>
      </div>

      {anomalies.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
          No statistically significant demand anomalies detected in the current historical window. Daily volumes are behaving within standard deviation bounds.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-2xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Service Trade</th>
                <th className="py-2.5 px-3">Location Hub</th>
                <th className="py-2.5 px-3 text-center">Baseline Demand</th>
                <th className="py-2.5 px-3 text-center">Observed Volume</th>
                <th className="py-2.5 px-3 text-center">Deviation</th>
                <th className="py-2.5 px-3 text-center">Severity</th>
                <th className="py-2.5 px-3">Mathematical Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {anomalies.map(anom => (
                <tr key={anom.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-600 text-2xs">
                    {anom.date}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {anom.service}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {anom.location.split(' - ')[0]}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-600">
                    {anom.baselineDemand} reqs
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900 font-mono">
                    {anom.observedDemand} reqs
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex items-center font-bold px-2 py-0.5 rounded text-2xs ${
                        anom.percentageChange > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {anom.percentageChange > 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {anom.percentageChange > 0 ? `+${anom.percentageChange}` : anom.percentageChange}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {getSeverityBadge(anom.severity)}
                  </td>
                  <td className="py-3 px-3 text-2xs text-slate-600 max-w-xs font-mono">
                    {anom.dataEvidence}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
