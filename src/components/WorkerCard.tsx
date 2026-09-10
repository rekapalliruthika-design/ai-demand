import React, { memo, useState, useCallback } from 'react';
import { Worker } from '../types';
import {
  Star,
  ShieldCheck,
  MapPin,
  Phone,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';

interface WorkerCardProps {
  worker: Worker;
  isUpdating?: boolean;
  onToggleStatus: (worker: Worker) => void;
  onDelete: (id: string, name: string) => void;
}

const WorkerCardComponent: React.FC<WorkerCardProps> = ({
  worker,
  isUpdating = false,
  onToggleStatus,
  onDelete
}) => {
  const [imgError, setImgError] = useState(false);

  // Status visual mapping
  const statusConfig = {
    available: {
      label: 'AVAILABLE',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
      dot: 'bg-emerald-500',
      nextAction: 'Set to Busy'
    },
    busy: {
      label: 'BUSY',
      bg: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100',
      dot: 'bg-amber-500',
      nextAction: 'Set to Off-Duty'
    },
    unavailable: {
      label: 'OFF-DUTY',
      bg: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
      dot: 'bg-slate-400',
      nextAction: 'Set to Available'
    }
  };

  const currentStatus = statusConfig[worker.availability] || statusConfig.available;

  const handleStatusClick = useCallback(() => {
    if (!isUpdating) {
      onToggleStatus(worker);
    }
  }, [isUpdating, onToggleStatus, worker]);

  const handleDeleteClick = useCallback(() => {
    if (!isUpdating) {
      onDelete(worker.id, worker.name);
    }
  }, [isUpdating, onDelete, worker.id, worker.name]);

  // Monogram initials for fallback avatar
  const initials = worker.name
    ? worker.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(n => n[0]?.toUpperCase() || '')
        .join('')
    : 'W';

  return (
    <div
      id={`worker-card-${worker.id}`}
      className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden group"
    >
      <div>
        {/* Worker Header: Avatar, Name, Rating & Verification */}
        <div className="flex items-start justify-between mb-3.5">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Worker Avatar with fallback */}
            <div className="relative shrink-0">
              {worker.avatar && !imgError ? (
                <img
                  src={worker.avatar}
                  alt={worker.name}
                  loading="lazy"
                  decoding="async"
                  onError={() => setImgError(true)}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-2xs"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm tracking-wide shadow-2xs">
                  {initials}
                </div>
              )}
              {/* Online status indicator dot */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${currentStatus.dot}`}
                title={`Status: ${worker.availability}`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5 truncate">
                <span className="truncate">{worker.name}</span>
                {worker.verified && (
                  <span title="Cooperative Guild Verified Professional">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </span>
                )}
              </div>
              <div className="text-2xs text-slate-500 flex items-center space-x-1 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{worker.serviceArea}</span>
              </div>
            </div>
          </div>

          {/* Star Rating Badge */}
          <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-md text-amber-800 text-xs font-bold border border-amber-200 shrink-0">
            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
            <span>{Number(worker.rating).toFixed(1)}</span>
            <span className="text-3xs text-amber-600 font-normal">({worker.reviewCount})</span>
          </div>
        </div>

        {/* Skills Badges */}
        <div className="flex flex-wrap gap-1 mb-3.5">
          {worker.skills.map(s => (
            <span
              key={s}
              className="text-3xs font-medium px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200/60"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Interactive Availability Status Control */}
        <div className="flex items-center justify-between py-2 px-2.5 bg-slate-50/80 rounded-lg border border-slate-150 mb-3.5 text-xs">
          <div className="flex items-center space-x-1.5 text-2xs text-slate-500 font-medium">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Status:</span>
          </div>
          <button
            type="button"
            id={`toggle-status-${worker.id}`}
            onClick={handleStatusClick}
            disabled={isUpdating}
            className={`text-3xs font-extrabold px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center space-x-1 ${
              currentStatus.bg
            } ${isUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={`Current: ${worker.availability}. Click to switch (${currentStatus.nextAction})`}
            aria-label={`Toggle worker status from ${worker.availability}`}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-600" />
                <span>UPDATING...</span>
              </>
            ) : (
              <>
                <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
                <span>{currentStatus.label}</span>
                <span className="text-slate-400 font-normal ml-0.5">⇄</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Row & Actions */}
      <div className="pt-3 border-t border-slate-100">
        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
          <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
            <span className="text-3xs text-slate-400 font-semibold block uppercase">Earnings</span>
            <span className="font-bold text-slate-900 text-xs">
              ₹{worker.weeklyEarnings ? worker.weeklyEarnings.toLocaleString('en-IN') : 0}
            </span>
          </div>
          <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
            <span className="text-3xs text-slate-400 font-semibold block uppercase">Week Jobs</span>
            <span className="font-bold text-slate-900 text-xs">{worker.weeklyJobs || 0}</span>
          </div>
          <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
            <span className="text-3xs text-slate-400 font-semibold block uppercase">Active Queue</span>
            <span
              className={`font-bold text-xs ${
                worker.activeJobs === 0 ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {worker.activeJobs || 0}
            </span>
          </div>
        </div>

        {/* Footer: Phone Contact & Delete */}
        <div className="flex items-center justify-between text-2xs text-slate-400 pt-0.5">
          <a
            href={`tel:${worker.phone}`}
            className="flex items-center space-x-1 text-slate-500 hover:text-emerald-600 transition-colors"
            title={`Call worker: ${worker.phone}`}
          >
            <Phone className="w-3 h-3" />
            <span className="font-medium">{worker.phone}</span>
          </a>

          <button
            type="button"
            id={`delete-worker-${worker.id}`}
            onClick={handleDeleteClick}
            disabled={isUpdating}
            className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40"
            title={`Remove ${worker.name} from cooperative directory`}
            aria-label={`Remove worker ${worker.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoized comparison to prevent re-rendering cards whose worker data has not changed
export const WorkerCard = memo(WorkerCardComponent, (prev, next) => {
  return (
    prev.isUpdating === next.isUpdating &&
    prev.worker.id === next.worker.id &&
    prev.worker.availability === next.worker.availability &&
    prev.worker.weeklyEarnings === next.worker.weeklyEarnings &&
    prev.worker.weeklyJobs === next.worker.weeklyJobs &&
    prev.worker.activeJobs === next.worker.activeJobs &&
    prev.worker.rating === next.worker.rating &&
    prev.worker.name === next.worker.name &&
    prev.worker.serviceArea === next.worker.serviceArea &&
    prev.worker.verified === next.worker.verified &&
    prev.worker.avatar === next.worker.avatar
  );
});
