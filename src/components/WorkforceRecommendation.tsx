import React, { useState } from 'react';
import { WorkforceRecommendation as WorkforceRecType } from '../types';
import { AlertTriangle, Users, ArrowRight, CheckCircle, Bell, ArrowRightLeft } from 'lucide-react';

interface WorkforceRecommendationProps {
  recommendations: WorkforceRecType[];
  onActionTriggered?: (rec: WorkforceRecType) => void;
}

export const WorkforceRecommendation: React.FC<WorkforceRecommendationProps> = ({
  recommendations,
  onActionTriggered
}) => {
  const [notifiedIds, setNotifiedIds] = useState<Record<string, boolean>>({});

  const handleNotify = (id: string, rec: WorkforceRecType) => {
    setNotifiedIds(prev => ({ ...prev, [id]: true }));
    onActionTriggered?.(rec);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-base">
              AI Workforce Preparation Recommendations
            </h3>
            <p className="text-xs text-slate-500">
              Actionable roster adjustments to proactively resolve predicted worker shortages
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
          {recommendations.length} Active Alerts
        </span>
      </div>

      {/* Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map(rec => {
          const isNotified = notifiedIds[rec.id];

          return (
            <div
              key={rec.id}
              className={`rounded-lg border p-4 transition-all ${
                rec.urgency === 'high'
                  ? 'border-amber-200 bg-amber-50/40'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{rec.service}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs">
                      {rec.location}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{rec.affectedCoopZone}</span>
                </div>

                <span
                  className={`text-xs px-2 py-0.5 rounded font-semibold whitespace-nowrap ${
                    rec.urgency === 'high'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  +{rec.shortageOrSurplus} Shortage
                </span>
              </div>

              {/* Stats pill group */}
              <div className="grid grid-cols-3 gap-2 py-2 mb-3 bg-white rounded-md border border-slate-200/80 px-3 text-center">
                <div>
                  <div className="text-xs text-slate-400">Expected Jobs</div>
                  <div className="font-bold text-slate-900 text-sm">{rec.expectedDemand}</div>
                </div>
                <div className="border-x border-slate-100">
                  <div className="text-xs text-slate-400">Current Active</div>
                  <div className="font-bold text-slate-900 text-sm">{rec.currentWorkforce}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Required Roster</div>
                  <div className="font-bold text-emerald-700 text-sm">{rec.requiredWorkforce}</div>
                </div>
              </div>

              {/* Action Description */}
              <div className="text-xs text-slate-700 mb-3 bg-slate-100/70 p-2.5 rounded border border-slate-200">
                <span className="font-semibold text-slate-900">Cooperative Action: </span>
                {rec.recommendedAction}
              </div>

              {/* Action Trigger Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-2xs text-slate-400">AI Horizon: Next 7 Days</span>
                <button
                  onClick={() => handleNotify(rec.id, rec)}
                  disabled={isNotified}
                  className={`text-xs px-3 py-1.5 rounded font-semibold flex items-center space-x-1.5 transition-all shadow-2xs ${
                    isNotified
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isNotified ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Notice Dispatched</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>Dispatch Preparation Notice</span>
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
