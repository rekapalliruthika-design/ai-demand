import React from 'react';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';

interface SIHDemoWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  setStep: (step: number) => void;
  onNavigateTab: (tab: 'demand-forecast' | 'work-allocation' | 'fairness-analytics' | 'workers') => void;
}

export const SIHDemoWalkthrough: React.FC<SIHDemoWalkthroughProps> = ({
  isOpen,
  onClose,
  currentStep,
  setStep,
  onNavigateTab
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Step 1: AI Demand Forecast & Shortage Detection',
      tab: 'demand-forecast' as const,
      description:
        'Observe the projected +24% plumbing surge in Area A (Indiranagar). Note the "Workforce Preparation Recommendation" showing a shortage of 2 certified plumbers.',
      highlight: 'Check the 5 KPI Cards and High Demand Areas table.'
    },
    {
      step: 2,
      title: 'Step 2: AI Autonomous Intelligence & Insights',
      tab: 'demand-forecast' as const,
      description:
        'Inspect the "Cooperative AI Intelligence" panel. Notice the "Opportunity Distribution Imbalance Detected" insight showing workers with fewer jobs than the cohort average.',
      highlight: 'Notice how the system proactively flags fairness imbalances before dispatch.'
    },
    {
      step: 3,
      title: 'Step 3: Booking Request Trigger (Area A Plumbing)',
      tab: 'work-allocation' as const,
      description:
        'A customer books an "Emergency Main Pipe Burst & Valve Rupture" in Area A (Indiranagar). The Fair Work Allocation Engine runs in real-time.',
      highlight: 'Switching to Fair Work Allocation tab...'
    },
    {
      step: 4,
      title: 'Step 4: AI Recommends Ravi Kumar (91% Match)',
      tab: 'work-allocation' as const,
      description:
        'Ravi Kumar is recommended with high confidence. Look at the "Why this worker was selected?" checklist explaining qualification, availability, and fair opportunity priority.',
      highlight: 'Full explainability breakdown with green checkmarks.'
    },
    {
      step: 5,
      title: 'Step 5: Why Top-Rated Vikram Sharma (4.9⭐) Was Not Picked',
      tab: 'work-allocation' as const,
      description:
        'Look at the "Other Eligible Workers" list. Vikram Sharma has a higher rating (4.9⭐) and is closer (1.2 km vs 2.1 km), BUT he already earned ₹7,800 with 15 jobs this week. The algorithm avoids monopoly!',
      highlight: 'Cooperative principle: Rating-only algorithms perpetuate gig poverty.'
    },
    {
      step: 6,
      title: 'Step 6: Worker Opportunity Distribution Analytics',
      tab: 'fairness-analytics' as const,
      description:
        'View the "Before vs After Fair Allocation" comparison bars. See how opportunity flattens out, achieving an 82% Opportunity Balance Index and 94% worker participation.',
      highlight: 'Interactive comparison between Jobs count and Weekly Earnings (₹).'
    }
  ];

  const current = steps[currentStep - 1] || steps[0];

  const handleNext = () => {
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setStep(nextStep);
      onNavigateTab(steps[nextStep - 1].tab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setStep(prevStep);
      onNavigateTab(steps[prevStep - 1].tab);
    }
  };

  return (
    <div className="bg-slate-900 text-white border-b-2 border-emerald-500 shadow-xl px-4 py-3 sticky top-16 z-40 animate-in slide-in-from-top-2 duration-150">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Step progress & badge */}
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-sm mt-0.5">
            {currentStep}/{steps.length}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xs font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                Interactive Platform Tour
              </span>
              <h4 className="font-bold text-sm text-white">{current.title}</h4>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-3xl">
              {current.description}{' '}
              <strong className="text-emerald-400 font-semibold">{current.highlight}</strong>
            </p>
          </div>
        </div>

        {/* Right: Step controls */}
        <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 text-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center space-x-1 transition-all cursor-pointer"
          >
            <span>{currentStep === steps.length ? 'Finish Tour' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            title="Dismiss walkthrough banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
