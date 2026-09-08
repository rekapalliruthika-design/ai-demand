import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WorkflowBanner } from './components/WorkflowBanner';
import { SIHDemoWalkthrough } from './components/SIHDemoWalkthrough';
import { DemandForecastPage } from './pages/DemandForecastPage';
import { WorkAllocationPage } from './pages/WorkAllocationPage';
import { FairnessAnalyticsPage } from './pages/FairnessAnalyticsPage';
import { WorkerDirectoryPage } from './pages/WorkerDirectoryPage';
import { INITIAL_JOBS } from './data/jobData';
import { workAllocationService } from './services/workAllocationService';
import { demandForecastService } from './services/demandForecastService';
import { Scale, ShieldCheck, HeartHandshake, Award } from 'lucide-react';

type TabType = 'demand-forecast' | 'work-allocation' | 'fairness-analytics' | 'workers';

interface UrgentAlertSummary {
  location: string;
  service: string;
  predictedJobs: number;
  demandLevel: string;
  shortage: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('demand-forecast');
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [urgentAlertCount, setUrgentAlertCount] = useState<number>(5);
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlertSummary[]>([]);

  useEffect(() => {
    demandForecastService.getForecastData({ horizonDays: 7 }).then(res => {
      const urgentList = res.areaForecasts.filter(f => f.demandLevel === 'Critical' || f.demandLevel === 'High');
      setUrgentAlertCount(urgentList.length);
      setUrgentAlerts(
        urgentList.map(a => ({
          location: a.location,
          service: a.service,
          predictedJobs: a.predictedJobs,
          demandLevel: a.demandLevel,
          shortage: Math.max(1, a.shortageOrSurplus)
        }))
      );
    }).catch(err => console.error('Failed to preload forecast alerts', err));
  }, []);

  const handleOpenGuide = () => {
    setDemoActive(true);
    setDemoStep(1);
  };

  const handleResetData = () => {
    workAllocationService.resetData();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation with notification badge */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGuide={handleOpenGuide}
        onResetData={handleResetData}
        guideActive={demoActive}
        urgentAlertCount={urgentAlertCount}
        urgentAlerts={urgentAlerts}
      />

      {/* Guided Walkthrough Banner (when active) */}
      {demoActive && (
        <SIHDemoWalkthrough
          isOpen={demoActive}
          onClose={() => setDemoActive(false)}
          currentStep={demoStep}
          setStep={setDemoStep}
          onNavigateTab={tab => setActiveTab(tab)}
        />
      )}

      {/* Workflow Navigation & Quick Explanations */}
      <WorkflowBanner
        activeTab={activeTab}
        onSelectTab={tab => setActiveTab(tab)}
        onOpenGuide={handleOpenGuide}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'demand-forecast' && (
          <DemandForecastPage
            onNavigateToDispatch={() => setActiveTab('work-allocation')}
            onAlertsCalculated={(count, alerts) => {
              setUrgentAlertCount(count);
              setUrgentAlerts(
                alerts.map(a => ({
                  location: a.location,
                  service: a.service,
                  predictedJobs: a.predictedJobs,
                  demandLevel: a.demandLevel,
                  shortage: Math.max(1, a.shortageOrSurplus)
                }))
              );
            }}
          />
        )}

        {activeTab === 'work-allocation' && (
          <WorkAllocationPage initialJob={INITIAL_JOBS[0]} />
        )}

        {activeTab === 'fairness-analytics' && (
          <FairnessAnalyticsPage />
        )}

        {activeTab === 'workers' && (
          <WorkerDirectoryPage />
        )}
      </main>

      {/* Cooperative Platform Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-white">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">SahakarGig</span>
            <span className="text-slate-500">•</span>
            <span>Cooperative Gig Platform for Fair Work Allocation & AI Demand Forecasting</span>
          </div>

          <div className="flex items-center space-x-4 text-2xs">
            <span className="flex items-center space-x-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cooperative Fairness Standard</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>Zero Discrimination Protected Attributes</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-semibold">Autonomous Worker Welfare Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
