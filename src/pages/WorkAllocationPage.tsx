import React, { useState, useEffect } from 'react';
import { Job, AllocationResult, AllocationStrategy, AllocationCandidate } from '../types';
import { INITIAL_JOBS } from '../data/jobData';
import { workAllocationService } from '../services/workAllocationService';
import { WorkerAllocationCard } from '../components/WorkerAllocationCard';
import { AlternativeWorkersList } from '../components/AlternativeWorkersList';
import { InteractiveBookingModal } from '../components/InteractiveBookingModal';
import {
  Scale,
  Sparkles,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Layers,
  CheckCircle2,
  Sliders,
  AlertCircle,
  PlusCircle,
  UserCheck
} from 'lucide-react';

interface WorkAllocationPageProps {
  initialJob?: Job;
}

export const WorkAllocationPage: React.FC<WorkAllocationPageProps> = ({
  initialJob = INITIAL_JOBS[0]
}) => {
  const [currentJob, setCurrentJob] = useState<Job>(initialJob);
  const [strategy, setStrategy] = useState<AllocationStrategy>('balanced');
  const [allocationResult, setAllocationResult] = useState<AllocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [assignedWorkerId, setAssignedWorkerId] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [dispatchSuccessToast, setDispatchSuccessToast] = useState<string | null>(null);

  // Run allocation engine
  const runAllocation = async (jobToAllocate: Job, selectedStrategy: AllocationStrategy = strategy) => {
    setLoading(true);
    setAssignedWorkerId(null);
    try {
      const result = await workAllocationService.allocateWorkerForJob(jobToAllocate, selectedStrategy);
      setAllocationResult(result);
    } catch (err) {
      console.error('Allocation failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAllocation(currentJob, strategy);
  }, [currentJob, strategy]);

  // Handle assigning job
  const handleAssignJob = async (workerId: string) => {
    try {
      await workAllocationService.assignJob(currentJob.id, workerId, currentJob.estimatedValue);
      setAssignedWorkerId(workerId);
      const worker = allocationResult?.recommendedWorker.worker.name || 'Worker';
      setDispatchSuccessToast(
        `✓ Job successfully assigned to ${worker}! Cooperative earnings (+₹${currentJob.estimatedValue}) and weekly count recorded.`
      );
      setTimeout(() => setDispatchSuccessToast(null), 6000);
    } catch (err) {
      console.error('Assign failed', err);
    }
  };

  const handleSelectNewJob = (newJob: Job) => {
    setCurrentJob(newJob);
    runAllocation(newJob, strategy);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast alert on job dispatch */}
      {dispatchSuccessToast && (
        <div className="bg-emerald-900 text-emerald-100 px-4 py-3 rounded-xl border border-emerald-700 shadow-md flex items-center justify-between text-xs animate-in slide-in-from-top duration-200">
          <span className="font-semibold">{dispatchSuccessToast}</span>
          <button
            onClick={() => setDispatchSuccessToast(null)}
            className="text-emerald-300 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Module 2 Header & Simulation Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Module 2
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Fair Work Allocation & Dispatch Engine
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic, explainable worker matching that balances technical eligibility, proximity, and cooperative livelihood fairness
            </p>
          </div>

          {/* Quick Create Booking Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Change / Create Booking</span>
            </button>
          </div>
        </div>

        {/* Current Active Job Banner */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 uppercase">
                Active Job Request
              </span>
              <h3 className="font-bold text-slate-900 text-base">{currentJob.title}</h3>
              {currentJob.id === 'job-demo-01' && (
                <span className="text-2xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Standard Showcase Job
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="font-bold text-slate-900 text-sm">₹{currentJob.estimatedValue}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">{currentJob.scheduledTime}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center space-x-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Service: <strong className="text-slate-900">{currentJob.service}</strong></span>
            </span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Location: <strong className="text-slate-900">{currentJob.location}</strong></span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Urgency: <strong className="capitalize text-slate-900">{currentJob.urgency}</strong></span>
            </span>
            <span className="flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Customer: <strong className="text-slate-900">{currentJob.customerName}</strong></span>
            </span>
          </div>
        </div>

        {/* Algorithm Strategy Selector */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-700">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Allocation Strategy Mode:</span>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setStrategy('balanced')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  strategy === 'balanced'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Balanced (Default Fair)
              </button>
              <button
                onClick={() => setStrategy('fairness-priority')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  strategy === 'fairness-priority'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fairness Max (35%)
              </button>
              <button
                onClick={() => setStrategy('location-priority')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  strategy === 'location-priority'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Proximity Priority
              </button>
              <button
                onClick={() => setStrategy('skill-priority')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  strategy === 'skill-priority'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Skill Priority
              </button>
            </div>
          </div>

          <div className="text-2xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 flex items-center justify-between">
            <span>
              {strategy === 'balanced' && '⚖️ Balanced: 40% Trade Qualification + 30% Distance Proximity + 30% Livelihood Income Equity.'}
              {strategy === 'fairness-priority' && '🤝 Fairness Max: Prioritizes workers with fewer shifts & lower weekly earnings to raise cooperative floor.'}
              {strategy === 'location-priority' && '📍 Proximity Priority: Optimizes for shortest transit time and urgent emergency customer arrival.'}
              {strategy === 'skill-priority' && '⭐ Skill Priority: Optimizes strictly for rating and specialized certification tier.'}
            </span>
            <span className="text-emerald-700 font-medium ml-2 shrink-0">Deterministic & Explainable</span>
          </div>
        </div>
      </div>

      {/* Loading state or Allocation Results */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <h4 className="font-bold text-slate-900 text-sm">Evaluating Worker Candidates...</h4>
          <p className="text-xs text-slate-500 mt-1">
            Running eligibility filter, distance calculation, workload scoring, and fairness balancing
          </p>
        </div>
      ) : allocationResult && allocationResult.recommendedWorker ? (
        <div className="space-y-6">
          {/* Top Recommended Worker Card */}
          <WorkerAllocationCard
            candidate={allocationResult.recommendedWorker}
            job={currentJob}
            onAssignJob={handleAssignJob}
            isAssigned={assignedWorkerId === allocationResult.recommendedWorker.worker.id}
          />

          {/* Alternative Ranked Workers */}
          <AlternativeWorkersList
            candidates={allocationResult.candidates || []}
            job={currentJob}
            onAssignJob={handleAssignJob}
            assignedWorkerId={assignedWorkerId || undefined}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          No eligible workers available for this job category.
        </div>
      )}

      {/* Interactive Booking Modal */}
      <InteractiveBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onRunAllocation={handleSelectNewJob}
      />
    </div>
  );
};
