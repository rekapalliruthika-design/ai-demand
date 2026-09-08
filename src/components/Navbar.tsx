import React from 'react';
import { TrendingUp, Scale, Users, Shield, Play, RotateCcw, Briefcase } from 'lucide-react';

interface NavbarProps {
  activeTab: 'demand-forecast' | 'work-allocation' | 'fairness-analytics' | 'workers';
  setActiveTab: (tab: 'demand-forecast' | 'work-allocation' | 'fairness-analytics' | 'workers') => void;
  onRunDemoScenario: () => void;
  onResetData: () => void;
  demoActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRunDemoScenario,
  onResetData,
  demoActive
}) => {
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
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  SIH 2026
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
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'demand-forecast'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>AI Demand Forecast</span>
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

          {/* Quick SIH Demo Action */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onRunDemoScenario}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
                demoActive
                  ? 'bg-emerald-500 text-slate-950 font-bold ring-2 ring-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title="Loads the canonical SIH demonstration scenario: Emergency Plumbing in Area A"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run SIH Demo</span>
            </button>

            <button
              onClick={onResetData}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Reset mock data to initial baseline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tab Strip */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('demand-forecast')}
            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap ${
              activeTab === 'demand-forecast' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Demand Forecast
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
            Workers (22)
          </button>
        </div>
      </div>
    </header>
  );
};
