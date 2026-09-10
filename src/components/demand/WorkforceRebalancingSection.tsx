import React, { useState } from 'react';
import { WorkforceRebalancingOpportunity } from '../../types';
import {
  ArrowLeftRight,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  Star,
  Send
} from 'lucide-react';

interface WorkforceRebalancingSectionProps {
  opportunities: WorkforceRebalancingOpportunity[];
}

export const WorkforceRebalancingSection: React.FC<WorkforceRebalancingSectionProps> = ({ opportunities }) => {
  const [dispatchedIds, setDispatchedIds] = useState<Set<string>>(new Set());

  const handleDispatchRebalance = (oppId: string) => {
    setDispatchedIds(prev => {
      const next = new Set(prev);
      next.add(oppId);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 uppercase tracking-wider">
              Section 10
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
              <ArrowLeftRight className="w-4 h-4 text-teal-600 mr-1.5" />
              Workforce Rebalancing Opportunities (Inter-Zone Balancing)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Voluntary cross-zone capacity matching: redistributes surplus trade workers to relieve deficit hubs within short transit radiuses
          </p>
        </div>
      </div>

      {opportunities.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
          No cross-zone rebalancing required at present. Worker supply and forecasted demand are evenly balanced across adjacent cooperative hubs.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map(opp => {
            const isDispatched = dispatchedIds.has(opp.id);

            return (
              <div
                key={opp.id}
                className="rounded-xl border border-slate-200 p-4 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Service & Transfer Route */}
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {opp.service}
                    </span>
                    <span className="text-2xs font-semibold text-slate-500">
                      Transit Distance: ~{opp.distanceKm} km
                    </span>
                  </div>

                  {/* Visual Route */}
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 flex items-center justify-between text-xs mb-3">
                    <div className="text-left">
                      <span className="text-3xs font-bold uppercase text-slate-600 block">Surplus Source</span>
                      <strong className="text-slate-800">{opp.sourceArea.split(' - ')[0]}</strong>
                      <div className="text-2xs text-emerald-700 font-bold">+{opp.surplusCount} surplus</div>
                    </div>

                    <div className="flex flex-col items-center px-2">
                      <span className="text-3xs font-extrabold text-teal-700">
                        {opp.recommendedTransferCount} Worker{opp.recommendedTransferCount > 1 ? 's' : ''}
                      </span>
                      <ArrowLeftRight className="w-4 h-4 text-teal-600 my-0.5" />
                    </div>

                    <div className="text-right">
                      <span className="text-3xs font-bold uppercase text-slate-600 block">Deficit Hub</span>
                      <strong className="text-slate-800">{opp.targetArea.split(' - ')[0]}</strong>
                      <div className="text-2xs text-red-700 font-bold">-{opp.shortageCount} deficit</div>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {opp.reasoning}
                  </p>

                  {/* Eligible Workers Available */}
                  <div className="space-y-1.5">
                    <span className="text-3xs font-bold uppercase text-slate-600 block">
                      Recommended Standby Workers (Lowest Weekly Jobs):
                    </span>
                    {opp.eligibleWorkers.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {opp.eligibleWorkers.map(w => (
                          <div
                            key={w.id}
                            className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-2xs text-slate-800 font-medium"
                          >
                            <span>{w.name}</span>
                            <span className="text-amber-700 flex items-center">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 mr-0.5" />
                              {w.rating}
                            </span>
                            <span className="text-slate-600">({w.weeklyJobs} jobs/wk)</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-2xs text-slate-500 italic">No standby workers currently available.</p>
                    )}
                  </div>
                </div>

                {/* Dispatch Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-3xs text-slate-600">
                    Voluntary flex-dispatch
                  </span>
                  <button
                    onClick={() => handleDispatchRebalance(opp.id)}
                    disabled={isDispatched}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isDispatched
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-teal-700 hover:bg-teal-800 text-white shadow-2xs'
                    }`}
                  >
                    {isDispatched ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Rebalance Offer Sent</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3 text-white" />
                        <span>Send Voluntary Dispatch Notification</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
