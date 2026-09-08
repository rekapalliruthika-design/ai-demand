import React from 'react';
import { AllocationCandidate } from '../types';
import { ShieldCheck, Info } from 'lucide-react';

interface AllocationScoreBreakdownProps {
  candidate: AllocationCandidate;
}

export const AllocationScoreBreakdown: React.FC<AllocationScoreBreakdownProps> = ({
  candidate
}) => {
  const {
    skillScore,
    availabilityScore,
    locationScore,
    fairnessScore,
    workloadScore,
    ratingScore,
    totalScore
  } = candidate;

  const rows = [
    {
      name: 'Skill Match & Certifications',
      weightPct: `${Math.round(skillScore.weight * 100)}%`,
      raw: skillScore.raw,
      points: skillScore.weightedScore,
      max: skillScore.maxPoints,
      color: 'bg-emerald-600',
      description: 'Trade competence, verification status & vocational certifications'
    },
    {
      name: 'Availability & Shift Capacity',
      weightPct: `${Math.round(availabilityScore.weight * 100)}%`,
      raw: availabilityScore.raw,
      points: availabilityScore.weightedScore,
      max: availabilityScore.maxPoints,
      color: 'bg-teal-600',
      description: 'Immediate dispatch feasibility & available shift hours'
    },
    {
      name: 'Location Proximity',
      weightPct: `${Math.round(locationScore.weight * 100)}%`,
      raw: locationScore.raw,
      points: locationScore.weightedScore,
      max: locationScore.maxPoints,
      color: 'bg-sky-600',
      description: `${candidate.distanceKm} km transit distance via Haversine great-circle model`
    },
    {
      name: 'Fairness & Opportunity Balance',
      weightPct: `${Math.round(fairnessScore.weight * 100)}%`,
      raw: fairnessScore.raw,
      points: fairnessScore.weightedScore,
      max: fairnessScore.maxPoints,
      color: 'bg-amber-600',
      description: 'Inverse weighting on recent weekly earnings & job distribution'
    },
    {
      name: 'Workload Balance (Anti-Burnout)',
      weightPct: `${Math.round(workloadScore.weight * 100)}%`,
      raw: workloadScore.raw,
      points: workloadScore.weightedScore,
      max: workloadScore.maxPoints,
      color: 'bg-indigo-600',
      description: 'Penalizes already saturated queues to ensure fast response'
    },
    {
      name: 'Customer Quality Rating',
      weightPct: `${Math.round(ratingScore.weight * 100)}%`,
      raw: ratingScore.raw,
      points: ratingScore.weightedScore,
      max: ratingScore.maxPoints,
      color: 'bg-purple-600',
      description: 'Quality factor considered alongside opportunity equity'
    }
  ];

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div>
          <h6 className="font-bold text-slate-900 text-sm">Transparent Scoring Formula Breakdown</h6>
          <p className="text-slate-500 text-2xs">
            Balanced multi-objective optimization across 6 objective criteria
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xs text-slate-400 block">Total Score</span>
          <span className="text-base font-extrabold text-emerald-700">{totalScore} / 100</span>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div key={`row-${idx}`} className="bg-white p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-900">{row.name}</span>
                <span className="text-2xs px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                  Weight: {row.weightPct}
                </span>
              </div>
              <div className="font-bold text-slate-800">
                <span className="text-emerald-700">{row.points}</span> / {row.max} pts
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1">
              <div
                className={`h-1.5 rounded-full ${row.color}`}
                style={{ width: `${Math.min(100, (row.raw / 100) * 100)}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-2xs text-slate-500">
              <span>{row.description}</span>
              <span>Raw Score: {row.raw}/100</span>
            </div>
          </div>
        ))}
      </div>

      {/* Fairness Safeguard Notice */}
      <div className="mt-3 pt-3 border-t border-slate-200 flex items-start space-x-2 text-2xs text-slate-500">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Ethical Safeguard:</strong> The algorithm strictly operates on qualifications, availability, proximity, workload, and economic distribution metrics. It does not evaluate or discriminate on gender, caste, religion, ethnicity, age, or disability.
        </span>
      </div>
    </div>
  );
};
