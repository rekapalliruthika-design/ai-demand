import React, { useState } from 'react';
import { TrendingUp, Scale, Users, Briefcase, HelpCircle, ChevronDown, ChevronUp, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface WorkflowBannerProps {
  activeTab: 'demand-forecast' | 'work-allocation' | 'fairness-analytics' | 'workers';
  onSelectTab: (tab: 'demand-forecast' | 'work-allocation' | 'fairness-analytics' | 'workers') => void;
  onOpenGuide: () => void;
}

export const WorkflowBanner: React.FC<WorkflowBannerProps> = ({
  activeTab,
  onSelectTab,
  onOpenGuide
}) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const steps = [
    {
      id: 'demand-forecast' as const,
      number: '1',
      title: 'Demand Intelligence',
      subtitle: 'Surge forecast & workforce planning',
      icon: TrendingUp
    },
    {
      id: 'work-allocation' as const,
      number: '2',
      title: 'Fair Work Dispatch',
      subtitle: 'Multi-criteria matching with explainability',
      icon: Scale
    },
    {
      id: 'fairness-analytics' as const,
      number: '3',
      title: 'Equity Analytics',
      subtitle: 'Monitor Gini index & income diffusion',
      icon: Users
    },
    {
      id: 'workers' as const,
      number: '4',
      title: 'Worker Directory',
      subtitle: 'Verified trade professionals & dispatch',
      icon: Briefcase
    }
  ];

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top summary row: Workflow Stepper + How It Works Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Stepper Steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
            {steps.map(s => {
              const Icon = s.icon;
              const isActive = activeTab === s.id;

              return (
                <button
                  key={s.id}
                  onClick={() => onSelectTab(s.id)}
                  className={`flex items-center space-x-2.5 p-2 rounded-xl text-left transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/40 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-xs font-bold truncate ${
                          isActive ? 'text-emerald-950' : 'text-slate-800'
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                    <p className="text-3xs text-slate-500 truncate hidden sm:block">
                      {s.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Platform Help / Guide Toggles */}
          <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                showHowItWorks
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>How It Works</span>
              {showHowItWorks ? (
                <ChevronUp className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              )}
            </button>

            <button
              onClick={onOpenGuide}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
              title="Start guided step-by-step tour"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Platform Guide</span>
              <span className="sm:hidden">Tour</span>
            </button>
          </div>
        </div>

        {/* Collapsible "How It Works" Explanation Accordion */}
        {showHowItWorks && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-200 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {/* Pillar 1 */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-center space-x-2 mb-1.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Predictive Demand & Preemption</h4>
                </div>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  Instead of reacting to service spikes in real-time, the AI engine projects job demand 7 to 30 days ahead across regional cooperative zones, flagging workforce shortages before customers experience service bottlenecks.
                </p>
                <div className="mt-2 text-3xs font-semibold text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Proactive hub mobilization & alerts</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-center space-x-2 mb-1.5">
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Fair Deterministic Dispatch</h4>
                </div>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  Commercial platforms create winner-take-all feedback loops. SahakarGig scores candidates across <strong>Skill Competence (40%)</strong>, <strong>Proximity (30%)</strong>, and <strong>Weekly Income Balance (30%)</strong> to distribute opportunity fairly without sacrificing quality.
                </p>
                <div className="mt-2 text-3xs font-semibold text-blue-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Transparent explainability on every job</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-center space-x-2 mb-1.5">
                  <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Equitable Cooperative Livelihoods</h4>
                </div>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  The system tracks the Opportunity Gini Coefficient against commercial industry baselines. All registered cooperative workers get steady access to jobs, preventing worker burnout while protecting economic security.
                </p>
                <div className="mt-2 text-3xs font-semibold text-purple-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Zero discrimination on protected attributes</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
