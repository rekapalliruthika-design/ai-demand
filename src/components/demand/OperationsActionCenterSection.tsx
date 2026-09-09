import React, { useState } from 'react';
import { OperationalRecommendationItem } from '../../types';
import {
  BellRing,
  AlertTriangle,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Send
} from 'lucide-react';

interface OperationsActionCenterSectionProps {
  recommendations: OperationalRecommendationItem[];
}

export const OperationsActionCenterSection: React.FC<OperationsActionCenterSectionProps> = ({
  recommendations
}) => {
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());

  const handleExecuteAction = (rec: OperationalRecommendationItem) => {
    setActionedIds(prev => {
      const next = new Set(prev);
      next.add(rec.id);
      return next;
    });
  };

  const getImpactBadge = (impact: OperationalRecommendationItem['impact']) => {
    switch (impact) {
      case 'High':
        return <span className="px-2 py-0.5 rounded text-2xs font-extrabold bg-red-100 text-red-800">High Urgency</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-2xs font-bold bg-amber-100 text-amber-800">Medium Urgency</span>;
      case 'Low':
      default:
        return <span className="px-2 py-0.5 rounded text-2xs font-bold bg-blue-100 text-blue-800">Standard</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase tracking-wider">
              Section 5
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
              <BellRing className="w-4 h-4 text-purple-600 mr-1.5" />
              Operations Action Center (Data-Derived Recommendations)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real operational recommendations automatically calculated from live demand forecasts and active worker capacity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recommendations.map(rec => {
          const isActioned = actionedIds.has(rec.id);

          return (
            <div
              key={rec.id}
              className={`rounded-xl border p-4 transition-all flex flex-col justify-between space-y-3 ${
                isActioned
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center">
                    {rec.type === 'shortage' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 mr-1.5 shrink-0" />
                    ) : rec.type === 'surplus' ? (
                      <Users className="w-3.5 h-3.5 text-blue-600 mr-1.5 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
                    )}
                    {rec.title}
                  </h4>
                  {getImpactBadge(rec.impact)}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {rec.description}
                </p>

                {/* Grounding metrics badge */}
                <div className="flex items-center space-x-3 text-2xs text-slate-500 font-semibold mt-2 pt-2 border-t border-slate-100">
                  <span>Expected: <strong className="text-slate-800">{rec.expectedJobs} jobs</strong></span>
                  <span>Active Capacity: <strong className="text-emerald-700">{rec.availableCapacity} workers</strong></span>
                  <span>Gap: <strong className={rec.capacityGap < 0 ? 'text-red-700' : 'text-emerald-700'}>
                    {rec.capacityGap > 0 ? `+${rec.capacityGap}` : rec.capacityGap}
                  </strong></span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-3xs font-semibold text-slate-600 uppercase tracking-wider">
                  Zone: {rec.location.split(' - ')[0]}
                </span>
                <button
                  onClick={() => handleExecuteAction(rec)}
                  disabled={isActioned}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActioned
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                  }`}
                >
                  {isActioned ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Action Dispatched</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 text-slate-300" />
                      <span>{rec.actionLabel}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
