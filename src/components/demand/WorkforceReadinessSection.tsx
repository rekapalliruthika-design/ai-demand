import React from 'react';
import { WorkforceReadinessItem, WorkforceReadinessStatus } from '../../types';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface WorkforceReadinessSectionProps {
  items: WorkforceReadinessItem[];
}

export const WorkforceReadinessSection: React.FC<WorkforceReadinessSectionProps> = ({ items }) => {
  const getStatusBadge = (status: WorkforceReadinessStatus) => {
    switch (status) {
      case 'Critical Shortage':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-extrabold bg-red-100 text-red-800 border border-red-200">
            <Flame className="w-3 h-3 text-red-600 mr-1" />
            Critical Shortage
          </span>
        );
      case 'Shortage':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600 mr-1" />
            Shortage
          </span>
        );
      case 'Prepare':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Prepare
          </span>
        );
      case 'Ready':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />
            Ready
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Section 4
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
              <Users className="w-4 h-4 text-emerald-600 mr-1.5" />
              Workforce Readiness (Demand vs Active Capacity)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational capacity monitoring: tracks how prepared each hub's cooperative pool is to fulfill forecasted workload
          </p>
        </div>
      </div>

      {/* Grid of Readiness Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.slice(0, 6).map(item => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{item.service}</h4>
                  <span className="text-2xs font-semibold text-slate-500">{item.location}</span>
                </div>
                {getStatusBadge(item.readinessStatus)}
              </div>

              {/* Progress & Ratio */}
              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between text-2xs font-semibold text-slate-700">
                  <span>Capacity Coverage: {item.capacityPercentage}%</span>
                  <span>{item.availableWorkers} of {item.requiredWorkers} workers</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.capacityPercentage < 65
                        ? 'bg-red-500'
                        : item.capacityPercentage < 95
                        ? 'bg-amber-500'
                        : item.capacityPercentage <= 115
                        ? 'bg-blue-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(8, item.capacityPercentage))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Metrics Footer & Suggested Action */}
            <div className="pt-2 border-t border-slate-200/80 text-2xs text-slate-600">
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>Expected: {item.expectedJobs} jobs</span>
                {item.shortage > 0 ? (
                  <span className="text-red-700 font-extrabold">Deficit: {item.shortage} workers</span>
                ) : (
                  <span className="text-emerald-700 font-bold">Surplus: +{item.surplus} workers</span>
                )}
              </div>
              <p className="text-slate-500 leading-snug">
                {item.actionSuggestion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
