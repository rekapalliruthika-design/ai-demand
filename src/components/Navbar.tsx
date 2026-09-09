import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, Scale, Users, Shield, RotateCcw, Briefcase, Bell, AlertTriangle, ChevronRight, X, HelpCircle, Sparkles } from 'lucide-react';

interface UrgentAlertItem {
  location: string;
  service: string;
  predictedJobs: number;
  demandLevel: string;
  shortage: number;
}

interface NavbarProps {
  activeTab: 'demand-forecast' | 'work-allocation' | 'fairness-analytics' | 'workers';
  setActiveTab: (tab: 'demand-forecast' | 'work-allocation' | 'fairness-analytics' | 'workers') => void;
  onOpenGuide?: () => void;
  onResetData: () => void;
  guideActive?: boolean;
  urgentAlertCount?: number;
  urgentAlerts?: UrgentAlertItem[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenGuide,
  onResetData,
  guideActive = false,
  urgentAlertCount = 0,
  urgentAlerts = []
}) => {
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAlertsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">SahakarGig</span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                  Cooperative Platform
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Cooperative Gig Platform • AI Demand & Fair Allocation
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('demand-forecast')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 relative ${
                activeTab === 'demand-forecast'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>AI Demand Intelligence</span>
              {urgentAlertCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-2xs font-extrabold bg-rose-600 text-white shadow-xs animate-pulse">
                  {urgentAlertCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('work-allocation')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'work-allocation'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Fair Work Allocation</span>
            </button>

            <button
              onClick={() => setActiveTab('fairness-analytics')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'fairness-analytics'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Opportunity Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('workers')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'workers'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Coop Workers</span>
            </button>
          </nav>

          {/* Alerts Notification Badge & Platform Tour Action */}
          <div className="flex items-center space-x-2.5">
            {/* Urgent Workforce Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className={`relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
                  showAlertsDropdown ? 'bg-slate-800 text-white ring-1 ring-slate-700' : ''
                }`}
                title="Urgent Demand Alerts"
                aria-label="View urgent demand notifications"
              >
                <Bell className="w-4 h-4" />
                {urgentAlertCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-white text-3xs font-extrabold items-center justify-center shadow-xs">
                      {urgentAlertCount}
                    </span>
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-md bg-rose-600/20 text-rose-400 flex items-center justify-center">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-white">Urgent Demand Alerts</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                        {urgentAlertCount} Active
                      </span>
                      <button
                        onClick={() => setShowAlertsDropdown(false)}
                        className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-2xs text-slate-400 mb-2.5">
                    Surging job requests require preemptive workforce readiness to avoid cooperative bottlenecks:
                  </p>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {urgentAlerts && urgentAlerts.length > 0 ? (
                      urgentAlerts.map((alert, idx) => (
                        <div
                          key={`alert-item-${idx}`}
                          onClick={() => {
                            setActiveTab('demand-forecast');
                            setShowAlertsDropdown(false);
                          }}
                          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-white group-hover:text-emerald-400 transition-colors">
                              {alert.service}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-2xs font-bold ${
                                alert.demandLevel === 'Critical'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-rose-900 text-rose-200 border border-rose-700'
                              }`}
                            >
                              {alert.demandLevel} Demand
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-2xs text-slate-400 mt-1">
                            <span>{alert.location.split(' - ')[0]}</span>
                            <span className="text-rose-400 font-semibold">
                              {alert.predictedJobs} jobs (+{alert.shortage} workforce deficit)
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400">
                        No critical shortages currently flagged.
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 mt-2.5 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-3xs text-slate-500">Auto-updated via AI Forecast</span>
                    <button
                      onClick={() => {
                        setActiveTab('demand-forecast');
                        setShowAlertsDropdown(false);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Open Forecast Dashboard</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
                  guideActive
                    ? 'bg-emerald-500 text-slate-950 font-bold ring-2 ring-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title="Interactive walkthrough explaining the cooperative platform workflow"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Platform Guide</span>
              </button>
            )}

            <button
              onClick={onResetData}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset or reseed cooperative baseline dataset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tab Strip */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800 items-center">
          <button
            onClick={() => setActiveTab('demand-forecast')}
            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'demand-forecast' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            <span>Demand Forecast</span>
            {urgentAlertCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-3xs font-extrabold bg-rose-600 text-white animate-pulse">
                {urgentAlertCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('work-allocation')}
            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap ${
              activeTab === 'work-allocation' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Fair Allocation
          </button>
          <button
            onClick={() => setActiveTab('fairness-analytics')}
            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap ${
              activeTab === 'fairness-analytics' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Opportunity Analytics
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap ${
              activeTab === 'workers' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Workers
          </button>
        </div>
      </div>
    </header>
  );
};
