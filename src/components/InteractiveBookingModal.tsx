import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { dataStorage } from '../services/dataStorage';
import { workAllocationService } from '../services/workAllocationService';
import { COOPERATIVE_AREAS, SERVICE_CATEGORIES } from '../data/demandHistory';
import { PlusCircle, Sparkles, MapPin, Briefcase, Clock, DollarSign, X, User, Phone, CheckCircle2, Trash2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'create' | 'queue'>('create');
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  // Real-world Customer Booking Form State
  const [service, setService] = useState('Plumbing');
  const [location, setLocation] = useState('Area A - Indiranagar');
  const [title, setTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number>(650);
  const [urgency, setUrgency] = useState<'high' | 'medium' | 'standard'>('high');
  const [scheduledTime, setScheduledTime] = useState('Immediate (Within 1 hour)');

  const refreshJobs = () => {
    const jobs = dataStorage.getJobs();
    setPendingJobs(jobs);
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshJobs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateBooking = () => {
    const area = COOPERATIVE_AREAS.find(a => a.name === location) || COOPERATIVE_AREAS[0];
    const finalTitle = title.trim() || `${service} Service Call - ${location.split(' - ')[0]}`;
    const finalCustomer = customerName.trim() || 'Cooperative Resident';
    const finalPhone = customerPhone.trim() || '+91 98450 00000';

    const newJob = dataStorage.addJob({
      title: finalTitle,
      service,
      category: `${service} Services`,
      requiredSkills: [service],
      latitude: area.lat,
      longitude: area.lng,
      location,
      customerName: finalCustomer,
      customerPhone: finalPhone,
      scheduledTime,
      status: 'pending',
      estimatedValue: Number(estimatedValue) || 600,
      urgency
    });

    onRunAllocation(newJob);
    onClose();
  };

  const handleSelectQueuedJob = (job: Job) => {
    onRunAllocation(job);
    onClose();
  };

  const handleDeleteJob = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    dataStorage.deleteJob(jobId);
    refreshJobs();
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
              <h3 className="font-bold text-base text-white">Customer Booking & Dispatch</h3>
              <p className="text-xs text-slate-300">
                Register a live customer request or select from the active cooperative queue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              + Create Live Customer Booking
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Booking Queue ({pendingJobs.length})
            </button>
          </div>

          {activeTab === 'create' ? (
            /* Live Customer Booking Form */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Job Title / Service Requirement *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Kitchen Pipe Burst & Drain Unclogging"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Customer Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full text-sm px-3 py-2 pl-8 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. Rajesh Sharma"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Customer Phone
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full text-sm px-3 py-2 pl-8 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. +91 98450 12345"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Service Category *
                  </label>
                  <select
                    value={service}
                    onChange={e => setService(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {SERVICE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Cooperative Service Area *
                  </label>
                  <select
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {COOPERATIVE_AREAS.map(area => (
                      <option key={area.id} value={area.name}>{area.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Job Value / Payout (₹)
                  </label>
                  <input
                    type="number"
                    value={estimatedValue}
                    onChange={e => setEstimatedValue(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={urgency}
                    onChange={e => setUrgency(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="high">Emergency (High)</option>
                    <option value="medium">Standard (Medium)</option>
                    <option value="standard">Flexible (Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Scheduled Window
                  </label>
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Immediate or 3:00 PM"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Queue of Registered Bookings */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Select an active customer booking to run Fair Worker Allocation:</span>
                {pendingJobs.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all pending bookings from queue?')) {
                        pendingJobs.forEach(j => dataStorage.deleteJob(j.id));
                        refreshJobs();
                      }
                    }}
                    className="text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                  >
                    Clear Queue
                  </button>
                )}
              </div>

              {pendingJobs.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Pending Customer Bookings</p>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    The cooperative dispatch queue is clear. Create a new live booking request.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Create Live Booking
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {pendingJobs.map(job => (
                    <div
                      key={job.id}
                      onClick={() => handleSelectQueuedJob(job)}
                      className="p-3.5 rounded-xl border-2 border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 cursor-pointer transition-all group relative"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                            {job.title}
                          </span>
                          <span className={`ml-2 text-2xs font-semibold px-2 py-0.5 rounded capitalize ${
                            job.status === 'assigned'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-xs">₹{job.estimatedValue}</span>
                          <button
                            onClick={e => handleDeleteJob(e, job.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                            title="Remove booking"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 cursor-pointer"
          >
            Cancel
          </button>

          {activeTab === 'create' && (
            <button
              onClick={handleCreateBooking}
              className="px-5 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Register & Allocate Worker</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
