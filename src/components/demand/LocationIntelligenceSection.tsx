import React, { useState } from 'react';
import { LocationIntelligenceItem } from '../../types';
import {
  MapPin,
  Compass,
  AlertTriangle,
  CheckCircle,
  Users,
  TrendingUp
} from 'lucide-react';

interface LocationIntelligenceSectionProps {
  locations: LocationIntelligenceItem[];
}

export const LocationIntelligenceSection: React.FC<LocationIntelligenceSectionProps> = ({ locations }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const filtered = locations.filter(loc => {
    if (selectedStatus === 'All') return true;
    return loc.readinessCategory === selectedStatus;
  });

  const getReadinessBadge = (category: LocationIntelligenceItem['readinessCategory']) => {
    switch (category) {
      case 'Critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-extrabold bg-red-100 text-red-800 border border-red-200">
            Critical Deficit
          </span>
        );
      case 'Prepare':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            High Utilization
          </span>
        );
      case 'Ready':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600 mr-1" />
            Equitable & Ready
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Section 8
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
              <Compass className="w-4 h-4 text-emerald-600 mr-1.5" />
              Location Intelligence (Cooperative Hub Capacity & Shortages)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic hub analytics comparing current load, projected requests, active verified capacity, and calculated workforce deficits
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl shrink-0 text-xs">
          {['All', 'Critical', 'Prepare', 'Ready'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all ${
                selectedStatus === st
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-2xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Cooperative Hub / Area</th>
              <th className="py-2.5 px-3">Zone</th>
              <th className="py-2.5 px-3 text-center">Historical Requests</th>
              <th className="py-2.5 px-3 text-center">Forecast (7d)</th>
              <th className="py-2.5 px-3 text-center">Active Workers</th>
              <th className="py-2.5 px-3 text-center">Shortage</th>
              <th className="py-2.5 px-3 text-center">Readiness Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(loc => (
              <tr key={loc.location} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3 font-bold text-slate-600">
                  #{loc.rank}
                </td>
                <td className="py-3 px-3 font-bold text-slate-900 flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 mr-2 shrink-0" />
                  {loc.location}
                </td>
                <td className="py-3 px-3 text-slate-600 font-semibold">
                  {loc.zone}
                </td>
                <td className="py-3 px-3 text-center font-semibold text-slate-800">
                  {loc.currentRequests} reqs
                </td>
                <td className="py-3 px-3 text-center font-bold text-slate-900">
                  {loc.forecastedRequests} jobs
                </td>
                <td className="py-3 px-3 text-center font-bold text-emerald-700">
                  {loc.workerCapacity}
                </td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`font-black px-2 py-0.5 rounded text-2xs ${
                      loc.shortage > 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {loc.shortage > 0 ? `-${loc.shortage} workers` : 'Balanced'}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  {getReadinessBadge(loc.readinessCategory)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
