import React, { useState } from 'react';
import { Job } from '../types';
import { INITIAL_JOBS } from '../data/jobData';
import { COOPERATIVE_AREAS, SERVICE_CATEGORIES } from '../data/demandHistory';
import { PlusCircle, Sparkles, MapPin, Briefcase, Clock, DollarSign, X } from 'lucide-react';

interface InteractiveBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunAllocation: (job: Job) => void;
}

export const InteractiveBookingModal: React.FC<InteractiveBookingModalProps> = ({
  isOpen,
  onClose,
  onRunAllocation
}) => {
  const [selectedJob, setSelectedJob] = useState<Job>(INITIAL_JOBS[0]);
  const [isCustom, setIsCustom] = useState(false);

  // Custom form state
  const [customService, setCustomService] = useState('Plumbing');
  const [customLocation, setCustomLocation] = useState('Area A - Indiranagar');
  const [customTitle, setCustomTitle] = useState('Urgent Kitchen Sink Pipe Replacement');
  const [customValue, setCustomValue] = useState(650);
  const [customUrgency, setCustomUrgency] = useState<'high' | 'medium' | 'standard'>('high');

  if (!isOpen) return null;

  const handleSelectPreset = (job: Job) => {
    setSelectedJob(job);
    setIsCustom(false);
  };

  const handleDispatch = () => {
    if (isCustom) {
      const area = COOPERATIVE_AREAS.find(a => a.name === customLocation) || COOPERATIVE_AREAS[0];
      const newJob: Job = {
        id: `custom-job-${Date.now()}`,
        title: customTitle,
        service: customService,
        category: `${customService} Services`,
        requiredSkills: [customService],
        latitude: area.lat,
        longitude: area.lng,
        location: customLocation,
        customerName: 'Customer Booking',
        customerPhone: '+91 98450 12399',
        scheduledTime: 'Immediate (Within 1 hour)',
        status: 'pending',
        estimatedValue: Number(customValue) || 600,
        urgency: customUrgency,
        createdAt: new Date().toISOString()
      };
      onRunAllocation(newJob);
    } else {
      onRunAllocation(selectedJob);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Create / Select Customer Booking</h3>
              <p className="text-xs text-slate-300">
                Trigger the Fair Work Allocation Engine to evaluate candidates and recommend the best worker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Preset Jobs vs Custom Booking Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setIsCustom(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isCustom
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Preset Test Scenarios
            </button>
            <button
              onClick={() => setIsCustom(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isCustom
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              + Create Custom Booking
            </button>
          </div>

          {!isCustom ? (
            /* Presets List */
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                Select a test booking scenario:
              </span>

              {INITIAL_JOBS.map(job => {
                const isSelected = selectedJob.id === job.id;
                const isShowcaseJob = job.id === 'job-demo-01';

                return (
                  <div
                    key={job.id}
                    onClick={() => handleSelectPreset(job)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{job.title}</span>
                        {isShowcaseJob && (
                          <span className="text-2xs font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                            ★ Standard Showcase
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 text-xs">₹{job.estimatedValue}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-700">{job.service}</strong>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.scheduledTime}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Custom Booking Form */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Job Title / Service Requirement
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Master Bedroom Wall Re-painting"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Service Category
                  </label>
                  <select
                    value={customService}
                    onChange={e => setCustomService(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {SERVICE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Cooperative Service Area
                  </label>
                  <select
                    value={customLocation}
                    onChange={e => setCustomLocation(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {COOPERATIVE_AREAS.map(area => (
                      <option key={area.id} value={area.name}>{area.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Estimated Job Value (₹)
                  </label>
                  <input
                    type="number"
                    value={customValue}
                    onChange={e => setCustomValue(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={customUrgency}
                    onChange={e => setCustomUrgency(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="high">Emergency / Immediate</option>
                    <option value="medium">Standard (Same Day)</option>
                    <option value="standard">Scheduled (Next Day)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleDispatch}
            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2 shadow-sm transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Find Best Worker (Fair Allocation)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
