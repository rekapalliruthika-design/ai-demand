import React from 'react';
import { CurrentDemandKPIs } from '../../types';
import {
  Inbox,
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  MapPin,
  Briefcase
} from 'lucide-react';

interface CurrentDemandKPIsSectionProps {
  kpis: CurrentDemandKPIs;
  loading?: boolean;
}

export const CurrentDemandKPIsSection: React.FC<CurrentDemandKPIsSectionProps> = ({ kpis, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Requests Today */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">Requests Today</span>
            <Inbox className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis.requestsToday}
          </div>
          <div className="text-2xs text-slate-600 mt-1 flex items-center">
            <span className="font-semibold text-emerald-700 mr-1">● Live</span> recorded
          </div>
        </div>

        {/* Requests This Week */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">This Week</span>
            <CalendarCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis.requestsThisWeek}
          </div>
          <div className="text-2xs text-slate-600 mt-1">
            7-day aggregate volume
          </div>
        </div>

        {/* Completed Jobs */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">Completed Jobs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">
            {kpis.completedJobs}
          </div>
          <div className="text-2xs text-slate-600 mt-1">
            Fulfilled by cooperative
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">Pending Jobs</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 tracking-tight">
            {kpis.pendingRequests}
          </div>
          <div className="text-2xs text-slate-600 mt-1">
            Awaiting allocation
          </div>
        </div>

        {/* Cancellation Rate */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">Cancellation</span>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis.cancellationRate}%
          </div>
          <div className="text-2xs text-slate-600 mt-1">
            {kpis.cancellationRate < 8 ? 'Healthy stability' : 'Elevated rate'}
          </div>
        </div>

        {/* Average Response Time */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">Avg Response</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis.avgResponseTimeMinutes} <span className="text-sm font-semibold text-slate-500">min</span>
          </div>
          <div className="text-2xs text-emerald-700 font-semibold mt-1">
            SLA target: &lt; 30 min
          </div>
        </div>
      </div>

      {/* Top Demand Drivers: Services & Hubs Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Top Requested Services */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center">
              <Briefcase className="w-3.5 h-3.5 text-emerald-700 mr-1.5" />
              Top Requested Trades
            </span>
            <span className="text-2xs text-slate-600 font-semibold">Active volume</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {kpis.topRequestedServices.length > 0 ? (
              kpis.topRequestedServices.map((srv, idx) => (
                <div
                  key={srv.service}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="font-bold text-slate-600">#{idx + 1}</span>
                  <span className="font-semibold text-slate-800">{srv.service}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-2xs">
                    {srv.count}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-600">No service bookings logged yet.</span>
            )}
          </div>
        </div>

        {/* Top Demand Locations */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center">
              <MapPin className="w-3.5 h-3.5 text-blue-700 mr-1.5" />
              Top Demand Cooperative Hubs
            </span>
            <span className="text-2xs text-slate-600 font-semibold">Area volume</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {kpis.topDemandLocations.length > 0 ? (
              kpis.topDemandLocations.map((loc, idx) => (
                <div
                  key={loc.location}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="font-bold text-slate-600">#{idx + 1}</span>
                  <span className="font-semibold text-slate-800">{loc.location.split(' - ')[0]}</span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold text-2xs">
                    {loc.count}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-600">No location bookings logged yet.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
