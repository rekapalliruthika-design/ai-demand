import React, { useState, useEffect } from 'react';
import { Worker } from '../types';
import { workAllocationService } from '../services/workAllocationService';
import { SERVICE_CATEGORIES, COOPERATIVE_AREAS } from '../data/demandHistory';
import { Star, ShieldCheck, MapPin, Briefcase, DollarSign, Filter, Search, CheckCircle } from 'lucide-react';

export const WorkerDirectoryPage: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    workAllocationService.getWorkers().then(setWorkers);
  }, []);

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
              Active certified workers enrolled in the SahakarGig cooperative society
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            {filteredWorkers.length} Workers Displayed
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
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <div className="text-2xs text-slate-500">{w.serviceArea}</div>
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
            </div>

            {/* Stats row */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
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
          </div>
        ))}
      </div>
    </div>
  );
};
