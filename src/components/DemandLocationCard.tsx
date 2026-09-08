import React, { useState } from 'react';
import { DemandForecast } from '../types';
import { MapPin, Users, ArrowUpRight, AlertCircle, CheckCircle2, AlertTriangle, Filter } from 'lucide-react';

interface DemandLocationCardProps {
  forecasts?: DemandForecast[];
  onSelectArea?: (areaName: string, serviceName: string) => void;
  urgentOnlyDefault?: boolean;
}

export const DemandLocationCard: React.FC<DemandLocationCardProps> = ({
  forecasts = [],
  onSelectArea,
  urgentOnlyDefault = false
}) => {
  const [filterUrgentOnly, setFilterUrgentOnly] = useState(urgentOnlyDefault);

  const safeForecasts = forecasts || [];
  const urgentAlerts = safeForecasts.filter(f => f.demandLevel === 'Critical' || f.demandLevel === 'High');
  const criticalCount = safeForecasts.filter(f => f.demandLevel === 'Critical').length;
  const highCount = safeForecasts.filter(f => f.demandLevel === 'High').length;

  const filteredItems = filterUrgentOnly ? urgentAlerts : safeForecasts;
  const displayItems = (filteredItems || []).slice(0, 10);

  const getDemandBadge = (level: string) => {
    switch (level) {
      case 'Critical':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-ping"></span>
            Critical Demand
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
            High Demand
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            Medium Demand
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            Stable (Low)
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <h3 className="font-semibold text-slate-900 text-base flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Forecasted Demand by Cooperative Hubs</span>
            </h3>

            {urgentAlerts.length > 0 && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{urgentAlerts.length} Urgent Alerts</span>
                <span className="text-2xs font-medium text-rose-700">({criticalCount} Critical, {highCount} High)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Territorial job projection, active cooperative capacity, and predicted workforce shortages
          </p>
        </div>

        {/* Filter toggle controls */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setFilterUrgentOnly(false)}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              !filterUrgentOnly
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Zones ({forecasts.length})
          </button>
          <button
            onClick={() => setFilterUrgentOnly(true)}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              filterUrgentOnly
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span>Urgent Alerts Only</span>
            <span className={`px-1.5 py-0.2 rounded-full text-2xs font-bold ${
              filterUrgentOnly ? 'bg-white text-rose-700' : 'bg-rose-200 text-rose-900'
            }`}>
              {urgentAlerts.length}
            </span>
          </button>
        </div>
      </div>

      {/* Table for desktop & larger screens */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Area / Locality</th>
              <th className="px-5 py-3">Service Category</th>
              <th className="px-5 py-3 text-right">Predicted Jobs</th>
              <th className="px-5 py-3 text-center">Demand Level</th>
              <th className="px-5 py-3 text-right">Available Workers</th>
              <th className="px-5 py-3 text-right">Workers Needed</th>
              <th className="px-5 py-3 text-center">Capacity Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayItems.map((item, index) => {
              const hasShortage = item.shortageOrSurplus > 0;
              return (
                <tr
                  key={`${item.location}-${item.service}-${index}`}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Area */}
                  <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      <span>{item.location}</span>
                    </div>
                  </td>

                  {/* Service */}
                  <td className="px-5 py-3.5 text-slate-700 font-medium">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-semibold">
                      {item.service}
                    </span>
                  </td>

                  {/* Predicted Jobs */}
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900 text-base">
                    {item.predictedJobs}
                    <span className="text-xs font-normal text-slate-400 ml-1">jobs</span>
                  </td>

                  {/* Demand Level */}
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {getDemandBadge(item.demandLevel)}
                  </td>

                  {/* Available Workers */}
                  <td className="px-5 py-3.5 text-right text-slate-600 font-medium">
                    {item.currentWorkforce} workers
                  </td>

                  {/* Recommended Workforce */}
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                    {item.recommendedWorkforce} workers
                  </td>

                  {/* Shortage or Surplus */}
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {hasShortage ? (
                      <span className="inline-flex items-center text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                        +{item.shortageOrSurplus} Shortage
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                        Balanced
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectArea?.(item.location, item.service)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Prepare Roster</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
