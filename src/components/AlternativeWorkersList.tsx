import React from 'react';
import { AllocationCandidate, Job } from '../types';
import { Star, MapPin, DollarSign, Briefcase, ChevronRight, UserCheck, ShieldAlert } from 'lucide-react';

interface AlternativeWorkersListProps {
  candidates?: AllocationCandidate[];
  job: Job;
  onSelectCandidate?: (candidate: AllocationCandidate) => void;
  onAssignJob?: (workerId: string) => void;
  assignedWorkerId?: string;
}

export const AlternativeWorkersList: React.FC<AlternativeWorkersListProps> = ({
  candidates = [],
  job,
  onSelectCandidate,
  onAssignJob,
  assignedWorkerId
}) => {
  // Show candidates excluding the top recommendation (candidates.slice(1))
  const alternatives = (candidates || []).slice(1);

  if (alternatives.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="font-semibold text-slate-900 text-base flex items-center space-x-2">
            <span>Other Eligible Cooperative Workers</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
              {alternatives.length} candidates evaluated
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by multi-factor score. Notice how rating alone does not dictate allocation.
          </p>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
          Ranked by Balanced Algorithm
        </div>
      </div>

      {/* Candidates List / Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Rank & Candidate</th>
              <th className="px-5 py-3 text-center">Match Score</th>
              <th className="px-5 py-3 text-right">Distance</th>
              <th className="px-5 py-3 text-right">Weekly Earnings</th>
              <th className="px-5 py-3 text-right">Jobs This Week</th>
              <th className="px-5 py-3 text-center">Workload Queue</th>
              <th className="px-5 py-3 text-center">Rating</th>
              <th className="px-5 py-3 text-right">Dispatch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alternatives.map((cand, idx) => {
              const { worker, totalScore, distanceKm } = cand;
              const isAssigned = assignedWorkerId === worker.id;
              const isHighRatedHighEarner = worker.rating >= 4.8 && worker.weeklyEarnings > 6000;

              return (
                <tr
                  key={worker.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    isAssigned ? 'bg-emerald-50/50' : ''
                  }`}
                >
                  {/* Rank & Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center border border-slate-200">
                        #{idx + 2}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center space-x-2">
                          <span>{worker.name}</span>
                          {isHighRatedHighEarner && (
                            <span className="text-2xs px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-normal">
                              High Earner (Saturated)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {worker.serviceArea} • {worker.certifications[0] || 'Certified'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Match Score */}
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <span className="font-extrabold text-sm px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                      {totalScore}%
                    </span>
                  </td>

                  {/* Distance */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap font-medium text-slate-700">
                    {distanceKm} km
                  </td>

                  {/* Weekly Earnings */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <span className={`font-semibold ${worker.weeklyEarnings > 6000 ? 'text-slate-900' : 'text-emerald-700'}`}>
                      ₹{worker.weeklyEarnings.toLocaleString('en-IN')}
                    </span>
                  </td>

                  {/* Jobs this week */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap text-slate-600 font-medium">
                    {worker.weeklyJobs} jobs
                  </td>

                  {/* Current Active Workload */}
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        worker.activeJobs === 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : worker.activeJobs === 1
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {worker.activeJobs} Active
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <div className="inline-flex items-center space-x-1 font-semibold text-slate-800 text-xs">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>{worker.rating}</span>
                      <span className="text-2xs text-slate-400">({worker.reviewCount})</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => onAssignJob?.(worker.id)}
                      disabled={isAssigned}
                      className={`text-xs px-2.5 py-1 rounded font-semibold transition-all ${
                        isAssigned
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 active:scale-95'
                      }`}
                    >
                      {isAssigned ? 'Assigned' : 'Override & Assign'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Educational Note on Fair Allocation Principle */}
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
        <span className="font-bold text-slate-900 shrink-0">Fair Opportunity Dispatch Principle:</span>
        <span>
          Even though <strong>Vikram Sharma</strong> is rated 4.9⭐ and is slightly closer (1.2 km vs 2.1 km), he was not selected because he has already earned ₹7,800 with 15 jobs this week. The Fair Work Allocation engine prioritizes <strong>Ravi Kumar</strong> (4.6⭐, ₹2,100 earnings, 4 jobs) to distribute cooperative opportunities fairly while guaranteeing full technical qualification.
        </span>
      </div>
    </div>
  );
};
