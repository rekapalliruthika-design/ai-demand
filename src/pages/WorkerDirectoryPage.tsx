import React, { useState, useEffect } from 'react';
import { Worker } from '../types';
import { workAllocationService } from '../services/workAllocationService';
import { SERVICE_CATEGORIES, COOPERATIVE_AREAS } from '../data/demandHistory';
import { RegisterWorkerModal } from '../components/RegisterWorkerModal';
import {
  Star,
  ShieldCheck,
  MapPin,
  Briefcase,
  DollarSign,
  Filter,
  Search,
  CheckCircle,
  UserPlus,
  Trash2,
  RotateCcw,
  Users,
  Phone,
  Clock
} from 'lucide-react';

export const WorkerDirectoryPage: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const fetchWorkers = async () => {
    const list = await workAllocationService.getWorkers();
    setWorkers(list);
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleToggleAvailability = async (worker: Worker) => {
    const nextStatus: Record<string, 'available' | 'busy' | 'unavailable'> = {
      available: 'busy',
      busy: 'unavailable',
      unavailable: 'available'
    };
    const updated: Worker = {
      ...worker,
      availability: nextStatus[worker.availability] || 'available'
    };
    await workAllocationService.updateWorker(updated);
    fetchWorkers();
  };

  const handleDeleteWorker = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove worker ${name}?`)) {
      await workAllocationService.deleteWorker(id);
      fetchWorkers();
    }
  };

  const handleResetBaseline = () => {
    if (window.confirm('Reset workers to standard cooperative baseline?')) {
      workAllocationService.resetData();
      fetchWorkers();
    }
  };

  const filteredWorkers = workers.filter(w => {
    if (selectedTrade !== 'All' && !w.skills.some(s => s.toLowerCase().includes(selectedTrade.toLowerCase()))) {
      return false;
    }
    if (selectedArea !== 'All' && !w.serviceArea.includes(selectedArea.split(' - ')[0])) {
      return false;
    }
    if (searchQuery.trim() && !w.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Cooperative Workers Directory
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active certified trade professionals enrolled in the SahakarGig cooperative society
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Worker</span>
            </button>
            <button
              onClick={handleResetBaseline}
              className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
              title="Reset to baseline workers"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Baseline</span>
            </button>
            <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              {filteredWorkers.length} Workers Displayed
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Search Worker Name</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="e.g. Ravi Kumar"
                className="w-full text-xs px-3 py-2 pl-8 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Trade / Skill</label>
            <select
              value={selectedTrade}
              onChange={e => setSelectedTrade(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Trades</option>
              {SERVICE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Service Area</label>
            <select
              value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Areas</option>
              {COOPERATIVE_AREAS.map(area => (
                <option key={area.id} value={area.name}>{area.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      {filteredWorkers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No Workers Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {workers.length === 0
              ? 'The cooperative directory is currently empty. Register your first worker or seed baseline members.'
              : 'No workers matched your trade or area filter. Try changing your search filters.'}
          </p>
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Register Worker
            </button>
            {workers.length === 0 && (
              <button
                onClick={handleResetBaseline}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Seed Baseline
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map(w => (
            <div
              key={w.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                      {w.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                        <span>{w.name}</span>
                        {w.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Cooperative Verified" />
                        )}
                      </div>
                      <div className="text-2xs text-slate-500 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{w.serviceArea}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded text-amber-800 text-xs font-bold border border-amber-200">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>{w.rating}</span>
                  </div>
                </div>

                {/* Skills badges */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {w.skills.map(s => (
                    <span
                      key={s}
                      className="text-2xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between py-2 px-2.5 bg-slate-50 rounded-lg border border-slate-100 mb-3 text-xs">
                  <span className="text-2xs text-slate-500">Current Status:</span>
                  <button
                    onClick={() => handleToggleAvailability(w)}
                    className={`text-2xs font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                      w.availability === 'available'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : w.availability === 'busy'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                    title="Click to toggle availability"
                  >
                    ● {w.availability.toUpperCase()} (Click to toggle)
                  </button>
                </div>
              </div>

              {/* Stats row & actions */}
              <div className="pt-3 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-2xs text-slate-400 block">Earnings</span>
                    <span className="font-bold text-slate-900">₹{w.weeklyEarnings.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-2xs text-slate-400 block">Week Jobs</span>
                    <span className="font-bold text-slate-900">{w.weeklyJobs}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-2xs text-slate-400 block">Active</span>
                    <span className={`font-bold ${w.activeJobs === 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {w.activeJobs}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-2xs text-slate-400 pt-1">
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{w.phone}</span>
                  </span>
                  <button
                    onClick={() => handleDeleteWorker(w.id, w.name)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove worker from directory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Worker Modal */}
      <RegisterWorkerModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onWorkerAdded={fetchWorkers}
      />
    </div>
  );
};
