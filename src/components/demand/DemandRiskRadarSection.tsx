import React, { useState } from 'react';
import { DemandRiskRadarItem, DemandRiskLevel } from '../../types';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Filter,
  Users,
  Briefcase
} from 'lucide-react';

interface DemandRiskRadarSectionProps {
  items: DemandRiskRadarItem[];
}

export const DemandRiskRadarSection: React.FC<DemandRiskRadarSectionProps> = ({ items }) => {
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('All');

  const filteredItems = items.filter(item => {
    if (selectedRiskFilter === 'All') return true;
    return item.riskLevel === selectedRiskFilter;
  });

  const getRiskBadge = (level: DemandRiskLevel) => {
    switch (level) {
      case 'Critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-extrabold bg-red-100 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1 animate-ping" />
            Critical Deficit
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            High Deficit
          </span>
        );
      case 'Moderate':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Moderate Load
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600 mr-1" />
            Optimal Capacity
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header with Risk Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 uppercase tracking-wider">
              Section 3
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
              <ShieldAlert className="w-4 h-4 text-red-600 mr-1.5" />
              Demand Risk Radar (Capacity vs Projected Load)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluates cooperative worker availability against forecasted requests to flag SLA failure points
          </p>
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl shrink-0 text-xs">
          {['All', 'Critical', 'High', 'Moderate', 'Low'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedRiskFilter(lvl)}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all ${
                selectedRiskFilter === lvl
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Table */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center text-slate-600 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          No trade/area combinations match the selected risk filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-2xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Service & Trade</th>
                <th className="py-2.5 px-3">Cooperative Area</th>
                <th className="py-2.5 px-3 text-center">Expected Demand</th>
                <th className="py-2.5 px-3 text-center">Workers Needed</th>
                <th className="py-2.5 px-3 text-center">Active Capacity</th>
                <th className="py-2.5 px-3 text-center">Capacity Gap</th>
                <th className="py-2.5 px-3 text-center">Risk Level</th>
                <th className="py-2.5 px-3">Operational Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 flex items-center">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                    {item.service}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {item.location}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">
                    {item.expectedJobs} jobs
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-700">
                    {item.workersRequired}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">
                    {item.availableWorkerCapacity}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-black px-2 py-0.5 rounded text-2xs ${
                        item.capacityGap < 0
                          ? 'bg-red-100 text-red-800'
                          : item.capacityGap === 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.capacityGap > 0 ? `+${item.capacityGap}` : item.capacityGap}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {getRiskBadge(item.riskLevel)}
                  </td>
                  <td className="py-3 px-3 text-2xs text-slate-600 max-w-xs">
                    {item.riskFactorNotes}
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
