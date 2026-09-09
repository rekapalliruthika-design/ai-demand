import React, { useState } from 'react';
import { ServiceIntelligenceItem, ServiceGrowthCategory } from '../../types';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  Minus,
  Briefcase,
  Clock,
  AlertCircle
} from 'lucide-react';

interface ServiceIntelligenceSectionProps {
  services: ServiceIntelligenceItem[];
}

export const ServiceIntelligenceSection: React.FC<ServiceIntelligenceSectionProps> = ({ services }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredServices = services.filter(s => {
    if (selectedCategory === 'All') return true;
    return s.category === selectedCategory;
  });

  const getCategoryBadge = (category: ServiceGrowthCategory) => {
    switch (category) {
      case 'Growing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800">
            <TrendingUp className="w-3 h-3 mr-1" />
            Growing
          </span>
        );
      case 'Declining':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-red-100 text-red-800">
            <TrendingDown className="w-3 h-3 mr-1" />
            Declining
          </span>
        );
      case 'Stable':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-slate-100 text-slate-700">
            <Minus className="w-3 h-3 mr-1" />
            Stable
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
              Section 7
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
              <Layers className="w-4 h-4 text-blue-600 mr-1.5" />
              Service Intelligence (Growth & Cancellation Diagnostics)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Trade performance rankings based on historical demand momentum, forecasted load, and SLA fulfillment
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl shrink-0 text-xs">
          {['All', 'Growing', 'Stable', 'Declining'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-2xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Service Category</th>
              <th className="py-2.5 px-3 text-center">Historical Volume</th>
              <th className="py-2.5 px-3 text-center">Growth Rate</th>
              <th className="py-2.5 px-3 text-center">Forecasted (7d)</th>
              <th className="py-2.5 px-3 text-center">Cancellation Rate</th>
              <th className="py-2.5 px-3 text-center">Avg Response</th>
              <th className="py-2.5 px-3 text-center">Trend Trajectory</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredServices.map(srv => (
              <tr key={srv.service} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3 font-bold text-slate-600">
                  #{srv.rank}
                </td>
                <td className="py-3 px-3 font-bold text-slate-900 flex items-center">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  {srv.service}
                </td>
                <td className="py-3 px-3 text-center font-semibold text-slate-800">
                  {srv.currentDemand} reqs
                </td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`font-bold text-2xs ${
                      srv.growthRate > 0
                        ? 'text-emerald-700'
                        : srv.growthRate < 0
                        ? 'text-red-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {srv.growthRate > 0 ? `+${srv.growthRate}` : srv.growthRate}%
                  </span>
                </td>
                <td className="py-3 px-3 text-center font-bold text-slate-900">
                  {srv.forecastedDemand} jobs
                </td>
                <td className="py-3 px-3 text-center font-mono">
                  <span className={srv.cancellationRate > 7 ? 'text-amber-700 font-bold' : 'text-slate-600'}>
                    {srv.cancellationRate}%
                  </span>
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-600">
                  {srv.avgResponseTime} min
                </td>
                <td className="py-3 px-3 text-center">
                  {getCategoryBadge(srv.category)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
