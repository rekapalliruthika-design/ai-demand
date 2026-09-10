import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Worker } from '../types';
import { workAllocationService } from '../services/workAllocationService';
import { SERVICE_CATEGORIES, COOPERATIVE_AREAS } from '../data/demandHistory';
import { RegisterWorkerModal } from '../components/RegisterWorkerModal';
import { WorkerCard } from '../components/WorkerCard';
import {
  Search,
  UserPlus,
  RotateCcw,
  Users,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  X,
  TrendingDown
} from 'lucide-react';

export const WorkerDirectoryPage: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting States
  const [selectedTrade, setSelectedTrade] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Modal & Async Action States
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [updatingWorkerIds, setUpdatingWorkerIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Safe data fetching with error handling
  const fetchWorkers = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const list = await workAllocationService.getWorkers();
      setWorkers(list || []);
    } catch (err: any) {
      console.error('Failed to load workers directory:', err);
      setError(err?.message || 'Unable to retrieve workers from storage.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Reset to page 1 whenever any filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTrade, selectedArea, selectedStatus, searchQuery, sortBy, pageSize]);

  // Optimistic single-worker status toggle without reloading the entire dashboard
  const handleToggleAvailability = useCallback(async (worker: Worker) => {
    if (updatingWorkerIds.has(worker.id)) return;

    // Determine cyclic next status
    const statusCycle: Record<string, 'available' | 'busy' | 'unavailable'> = {
      available: 'busy',
      busy: 'unavailable',
      unavailable: 'available'
    };
    const nextStatus = statusCycle[worker.availability] || 'available';

    // 1. Mark this specific worker as updating (shows spinner on their card only)
    setUpdatingWorkerIds(prev => new Set(prev).add(worker.id));

    // 2. Optimistic local update so UI responds instantly
    const previousWorkers = workers;
    setWorkers(prev =>
      prev.map(w => (w.id === worker.id ? { ...w, availability: nextStatus } : w))
    );

    try {
      const updatedWorker: Worker = {
        ...worker,
        availability: nextStatus
      };
      await workAllocationService.updateWorker(updatedWorker);
      setToastMessage({
        type: 'success',
        text: `Status for ${worker.name} changed to ${nextStatus.toUpperCase()}.`
      });
    } catch (err: any) {
      console.error('Failed to update worker status:', err);
      // Revert on error
      setWorkers(previousWorkers);
      setToastMessage({
        type: 'error',
        text: `Could not update status for ${worker.name}: ${err?.message || 'Storage error'}`
      });
    } finally {
      // 3. Remove worker from updating set
      setUpdatingWorkerIds(prev => {
        const next = new Set(prev);
        next.delete(worker.id);
        return next;
      });
    }
  }, [updatingWorkerIds, workers]);

  // Safe worker deletion with optimistic update
  const handleDeleteWorker = useCallback(async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove worker "${name}" from the cooperative directory?`)) {
      return;
    }

    setUpdatingWorkerIds(prev => new Set(prev).add(id));
    const previousWorkers = workers;
    setWorkers(prev => prev.filter(w => w.id !== id));

    try {
      await workAllocationService.deleteWorker(id);
      setToastMessage({
        type: 'success',
        text: `Worker "${name}" successfully removed.`
      });
    } catch (err: any) {
      console.error('Failed to delete worker:', err);
      setWorkers(previousWorkers);
      setToastMessage({
        type: 'error',
        text: `Failed to remove ${name}: ${err?.message || 'Error occurred'}`
      });
    } finally {
      setUpdatingWorkerIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [workers]);

  // Clear all workers from the cooperative directory
  const handleClearAllWorkers = useCallback(async () => {
    if (window.confirm('Are you sure you want to remove all workers/members from the site?')) {
      setLoading(true);
      try {
        await workAllocationService.clearWorkers();
        setWorkers([]);
        setToastMessage({
          type: 'success',
          text: 'All members removed from the site.'
        });
      } catch (err: any) {
        setError('Failed to clear workers.');
      } finally {
        setLoading(false);
      }
    }
  }, []);

  // Efficient memoized KPI counts from workers list
  const workerKPIs = useMemo(() => {
    let available = 0;
    let busy = 0;
    let unavailable = 0;
    let totalRating = 0;

    for (let i = 0; i < workers.length; i++) {
      const w = workers[i];
      if (w.availability === 'available') available++;
      else if (w.availability === 'busy') busy++;
      else unavailable++;
      totalRating += w.rating || 0;
    }

    const avgRating = workers.length > 0 ? (totalRating / workers.length).toFixed(1) : '5.0';

    return {
      total: workers.length,
      available,
      busy,
      unavailable,
      avgRating
    };
  }, [workers]);

  // Efficient memoized filtering & sorting
  const filteredAndSortedWorkers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // 1. Filtering
    const filtered = workers.filter(w => {
      // Trade filter
      if (selectedTrade !== 'All') {
        const hasSkill = w.skills.some(s => s.toLowerCase().includes(selectedTrade.toLowerCase()));
        if (!hasSkill) return false;
      }

      // Area filter
      if (selectedArea !== 'All') {
        const areaNamePrefix = selectedArea.split(' - ')[0];
        if (!w.serviceArea.includes(areaNamePrefix)) return false;
      }

      // Status filter
      if (selectedStatus !== 'All') {
        if (w.availability !== selectedStatus.toLowerCase()) return false;
      }

      // Search query (matches name, phone, or any skill)
      if (query) {
        const nameMatch = w.name.toLowerCase().includes(query);
        const phoneMatch = w.phone?.toLowerCase().includes(query);
        const skillMatch = w.skills.some(s => s.toLowerCase().includes(query));
        if (!nameMatch && !phoneMatch && !skillMatch) return false;
      }

      return true;
    });

    // 2. Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'rating-desc') {
        return b.rating - a.rating;
      }
      if (sortBy === 'earnings-asc') {
        return (a.weeklyEarnings || 0) - (b.weeklyEarnings || 0);
      }
      if (sortBy === 'earnings-desc') {
        return (b.weeklyEarnings || 0) - (a.weeklyEarnings || 0);
      }
      if (sortBy === 'jobs-asc') {
        return (a.weeklyJobs || 0) - (b.weeklyJobs || 0);
      }
      if (sortBy === 'jobs-desc') {
        return (b.weeklyJobs || 0) - (a.weeklyJobs || 0);
      }
      if (sortBy === 'active-desc') {
        return (b.activeJobs || 0) - (a.activeJobs || 0);
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      // default: preserve list order
      return 0;
    });

    return filtered;
  }, [workers, selectedTrade, selectedArea, selectedStatus, searchQuery, sortBy]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedWorkers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedWorkers = useMemo(() => {
    if (pageSize >= 999) return filteredAndSortedWorkers;
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredAndSortedWorkers.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedWorkers, safeCurrentPage, pageSize]);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const displayCountStart = filteredAndSortedWorkers.length === 0 ? 0 : startIndex + 1;
  const displayCountEnd = Math.min(startIndex + pageSize, filteredAndSortedWorkers.length);

  const handleClearFilters = () => {
    setSelectedTrade('All');
    setSelectedArea('All');
    setSelectedStatus('All');
    setSearchQuery('');
    setSortBy('default');
  };

  const hasActiveFilters =
    selectedTrade !== 'All' ||
    selectedArea !== 'All' ||
    selectedStatus !== 'All' ||
    searchQuery.trim() !== '' ||
    sortBy !== 'default';

  return (
    <div className="space-y-6 pb-12">
      {/* Non-intrusive Toast Notification */}
      {toastMessage && (
        <div
          id="worker-directory-toast"
          className={`fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-top-2 duration-150 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-rose-900 text-rose-100 border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-300 hover:text-white ml-2 p-0.5"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Quick Action Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xs font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Module 4
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Cooperative Workers Directory & Admin
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active certified trade professionals enrolled in the SahakarGig cooperative society
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              id="btn-register-worker"
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Worker</span>
            </button>

            <button
              id="btn-refresh-workers"
              onClick={() => fetchWorkers(true)}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs transition-colors cursor-pointer"
              title="Refresh workers directory"
              aria-label="Refresh workers"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {workers.length > 0 && (
              <button
                id="btn-clear-members"
                onClick={handleClearAllWorkers}
                className="px-3 py-2 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                title="Remove all members from the site"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remove All Members</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Cooperative Worker Status KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <div className="flex items-center justify-between text-2xs text-slate-500 font-semibold mb-1">
              <span>Total Roster</span>
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg font-bold text-slate-900">{workerKPIs.total}</div>
          </div>

          <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200/80">
            <div className="flex items-center justify-between text-2xs text-emerald-800 font-semibold mb-1">
              <span>Available Now</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-lg font-bold text-emerald-950">{workerKPIs.available}</div>
          </div>

          <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200/80">
            <div className="flex items-center justify-between text-2xs text-amber-800 font-semibold mb-1">
              <span>Currently Busy</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-lg font-bold text-amber-950">{workerKPIs.busy}</div>
          </div>

          <div className="bg-slate-100/70 rounded-xl p-3 border border-slate-200/80">
            <div className="flex items-center justify-between text-2xs text-slate-600 font-semibold mb-1">
              <span>Off-Duty</span>
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            </div>
            <div className="text-lg font-bold text-slate-800">{workerKPIs.unavailable}</div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-2xs text-slate-500 font-semibold mb-1">
              <span>Avg Rating</span>
              <span className="text-amber-500 font-bold">★</span>
            </div>
            <div className="text-lg font-bold text-slate-900">{workerKPIs.avgRating} / 5.0</div>
          </div>
        </div>
      </div>

      {/* Search, Filters, & Sorting Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Query */}
          <div>
            <label htmlFor="worker-search-input" className="text-xs font-semibold text-slate-700 block mb-1">
              Search Workers
            </label>
            <div className="relative">
              <input
                id="worker-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Name, trade, or phone..."
                className="w-full text-xs px-3 py-2 pl-8 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Trade Filter */}
          <div>
            <label htmlFor="worker-trade-select" className="text-xs font-semibold text-slate-700 block mb-1">
              Trade / Skill
            </label>
            <select
              id="worker-trade-select"
              value={selectedTrade}
              onChange={e => setSelectedTrade(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Trades ({SERVICE_CATEGORIES.length})</option>
              {SERVICE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Service Area Filter */}
          <div>
            <label htmlFor="worker-area-select" className="text-xs font-semibold text-slate-700 block mb-1">
              Service Area
            </label>
            <select
              id="worker-area-select"
              value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Service Areas</option>
              {COOPERATIVE_AREAS.map(area => (
                <option key={area.id} value={area.name}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="worker-status-select" className="text-xs font-semibold text-slate-700 block mb-1">
              Availability Status
            </label>
            <select
              id="worker-status-select"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Availability States</option>
              <option value="available">Available Only</option>
              <option value="busy">Busy Only</option>
              <option value="unavailable">Off-Duty / Unavailable</option>
            </select>
          </div>
        </div>

        {/* Sorting & Page Size Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 gap-2 text-xs">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <div className="flex items-center space-x-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-700">Sort:</span>
              <select
                id="worker-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-xs px-2.5 py-1 rounded-md border border-slate-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="default">Default (Balanced Order)</option>
                <option value="rating-desc">Highest Rated (⭐)</option>
                <option value="earnings-asc">Lowest Weekly Earnings (Priority Floor)</option>
                <option value="earnings-desc">Highest Weekly Earnings</option>
                <option value="jobs-asc">Fewest Jobs This Week</option>
                <option value="jobs-desc">Most Jobs This Week</option>
                <option value="active-desc">Most Active Jobs</option>
                <option value="name-asc">Worker Name (A-Z)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                id="btn-clear-filters"
                onClick={handleClearFilters}
                className="text-2xs font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 text-slate-500">
            <div className="flex items-center space-x-1">
              <span>Per page:</span>
              <select
                id="worker-page-size-select"
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                className="text-xs px-2 py-1 rounded-md border border-slate-200 bg-white"
              >
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={9999}>All ({filteredAndSortedWorkers.length})</option>
              </select>
            </div>

            <div className="font-medium text-slate-600">
              Showing <strong className="text-slate-900">{displayCountStart}–{displayCountEnd}</strong> of{' '}
              <strong className="text-slate-900">{filteredAndSortedWorkers.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div
          id="worker-directory-error-banner"
          className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center justify-between text-xs"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchWorkers(true)}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-md transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton Grid */}
      {loading ? (
        <div id="worker-loading-skeleton" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-2xs animate-pulse space-y-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="flex gap-1.5 pt-1">
                <div className="h-4 bg-slate-100 rounded w-16" />
                <div className="h-4 bg-slate-100 rounded w-20" />
              </div>
              <div className="h-8 bg-slate-100 rounded-lg" />
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div className="h-10 bg-slate-100 rounded" />
                <div className="h-10 bg-slate-100 rounded" />
                <div className="h-10 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedWorkers.length === 0 ? (
        /* Empty State */
        <div
          id="worker-empty-state"
          className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs"
        >
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">
            {workers.length === 0 ? 'No workers registered yet.' : 'No Matching Workers Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 mb-5">
            {workers.length === 0
              ? 'No workers registered yet. Click below to register your first certified trade professional.'
              : 'No workers matched your specific combination of trade, service area, or search filters. Try clearing your filters.'}
          </p>

          <div className="flex items-center justify-center space-x-2">
            {workers.length === 0 ? (
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Register Worker
              </button>
            ) : (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Optimized Worker Cards Grid */
        <div className="space-y-5">
          <div
            id="workers-cards-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {paginatedWorkers.map(worker => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                isUpdating={updatingWorkerIds.has(worker.id)}
                onToggleStatus={handleToggleAvailability}
                onDelete={handleDeleteWorker}
              />
            ))}
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div
              id="worker-pagination-controls"
              className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs"
            >
              <div className="text-xs text-slate-600">
                Page <strong className="text-slate-900">{safeCurrentPage}</strong> of{' '}
                <strong className="text-slate-900">{totalPages}</strong> (
                {filteredAndSortedWorkers.length} total workers)
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  id="pagination-btn-prev"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none flex items-center space-x-1 transition-colors cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {/* Page numbers */}
                <div className="hidden sm:flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                    .filter(page => {
                      // Show first, last, and window around current page
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - safeCurrentPage) <= 1
                      );
                    })
                    .map((page, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && page - prev > 1;

                      return (
                        <React.Fragment key={`page-${page}`}>
                          {showEllipsis && (
                            <span className="px-1 text-slate-400 text-xs">…</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              safeCurrentPage === page
                                ? 'bg-emerald-600 text-white'
                                : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  id="pagination-btn-next"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none flex items-center space-x-1 transition-colors cursor-pointer"
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Register Worker Modal */}
      <RegisterWorkerModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onWorkerAdded={() => fetchWorkers(true)}
      />
    </div>
  );
};
