import React, { useState } from 'react';
import { AllocationCandidate, Job } from '../types';
import { Award, CheckCircle2, MapPin, Star, DollarSign, Briefcase, Clock, ShieldCheck, ChevronDown, ChevronUp, ArrowRight, UserCheck } from 'lucide-react';
import { AllocationScoreBreakdown } from './AllocationScoreBreakdown';

interface WorkerAllocationCardProps {
  candidate: AllocationCandidate;
  job: Job;
  onAssignJob: (workerId: string) => void;
  isAssigned?: boolean;
}

export const WorkerAllocationCard: React.FC<WorkerAllocationCardProps> = ({
  candidate,
  job,
  onAssignJob,
  isAssigned = false
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { worker, totalScore, distanceKm, explanation } = candidate;

  return (
    <div className="bg-white rounded-xl border-2 border-emerald-500/80 shadow-md overflow-hidden">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs">
            ★
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              AI Recommended Worker — Fair Allocation Winner
            </div>
            <div className="text-xs text-slate-300">
              Balanced on skill qualification, proximity, workload, and opportunity fairness
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-300 hidden sm:inline">Overall Match:</span>
          <span className="text-lg font-extrabold px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow-sm">
            {totalScore}%
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Worker Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
          <div className="flex items-start space-x-3.5">
            <div className="w-13 h-13 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xl shrink-0 overflow-hidden">
              {worker.avatar ? (
                <img
                  src={worker.avatar}
                  alt={worker.name}
                  loading="lazy"
                  decoding="async"
                  onError={e => {
                    // Fallback to initials if broken
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{worker.name.split(' ').map(n => n[0]).join('')}</span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-lg font-bold text-slate-900">{worker.name}</h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {(worker.skills || []).slice(0, 3).join(' • ')}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {worker.serviceArea} • Registered since {worker.joinedDate.split('-')[0]}
              </p>
            </div>
          </div>

          {/* Action button */}
          <div className="flex sm:flex-col items-end justify-between gap-2">
            <button
              onClick={() => onAssignJob(worker.id)}
              disabled={isAssigned}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 shadow-sm transition-all ${
                isAssigned
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white ring-2 ring-emerald-300/40'
              }`}
            >
              {isAssigned ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Job Assigned & Dispatched</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Assign & Dispatch Job</span>
                </>
              )}
            </button>
            {isAssigned && (
              <span className="text-2xs text-emerald-700 font-medium">
                Earnings updated (+₹{job.estimatedValue}) • Stats synced
              </span>
            )}
          </div>
        </div>

        {/* Core Metric Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 mb-5">
          {/* Distance */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center space-x-1 text-slate-500 text-xs mb-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Distance</span>
            </div>
            <div className="text-base font-bold text-slate-900">{distanceKm} km</div>
            <div className="text-2xs text-slate-500">From job in {job.location.split(' - ')[0]}</div>
          </div>

          {/* Workload */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center space-x-1 text-slate-500 text-xs mb-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Current Workload</span>
            </div>
            <div className="text-base font-bold text-slate-900">
              {worker.activeJobs === 0 ? 'Free (0 Active)' : `${worker.activeJobs} Active Job`}
            </div>
            <div className="text-2xs text-emerald-700 font-medium">Fast immediate dispatch</div>
          </div>

          {/* Weekly Earnings & Jobs */}
          <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-200/80">
            <div className="flex items-center space-x-1 text-amber-800 text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              <span>Weekly Earnings</span>
            </div>
            <div className="text-base font-bold text-slate-900">
              ₹{worker.weeklyEarnings.toLocaleString('en-IN')}
            </div>
            <div className="text-2xs text-amber-800 font-medium">
              {worker.weeklyJobs} jobs this week (Fair balance)
            </div>
          </div>

          {/* Service Rating */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center space-x-1 text-slate-500 text-xs mb-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Coop Rating</span>
            </div>
            <div className="text-base font-bold text-slate-900 flex items-center space-x-1">
              <span>{worker.rating}</span>
              <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
            </div>
            <div className="text-2xs text-slate-500">{worker.reviewCount} verified reviews</div>
          </div>
        </div>

        {/* Why This Worker Explanation Section (Cooperative Explainability Standard) */}
        <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/80 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-bold text-emerald-950 text-sm flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Why this worker was selected by the AI Engine?</span>
            </h5>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Explainable Decision
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-3">
            The algorithm distributed this opportunity to <strong className="text-slate-900">{worker.name}</strong> because they are fully qualified, available, within convenient distance, and have received fewer jobs this week compared to peers.
          </p>

          <ul className="space-y-1.5">
            {explanation.map((reason, idx) => (
              <li key={`exp-${idx}`} className="flex items-start space-x-2 text-xs text-slate-800">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Expandable Score Breakdown Button */}
        <div className="border-t border-slate-100 pt-3">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Detailed Mathematical Score Breakdown & Weights</span>
            </span>
            {showBreakdown ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showBreakdown && (
            <div className="mt-3">
              <AllocationScoreBreakdown candidate={candidate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
