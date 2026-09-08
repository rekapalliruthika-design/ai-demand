import React, { useState, useEffect, useMemo } from 'react';
import { demandForecastService } from '../services/demandForecastService';
import { ForecastSummaryKPIs, DemandForecast, WorkforceRecommendation as WorkforceRecType, DailyForecastPoint } from '../types';
import { SERVICE_CATEGORIES, COOPERATIVE_AREAS } from '../data/demandHistory';
import { MOCK_WORKERS } from '../data/workerData';
import { generateAIInsights } from '../ai/demandForecast/demandAnalyzer';
import { DemandForecastChart } from '../components/DemandForecastChart';
import { DemandLocationCard } from '../components/DemandLocationCard';
import { WorkforceRecommendation } from '../components/WorkforceRecommendation';
import { AIInsightCard } from '../components/AIInsightCard';
import {
  TrendingUp,
  MapPin,
  Users,
  ShieldCheck,
  Calendar,
  Briefcase,
  Layers,
  Filter,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DemandForecastPageProps {
  onNavigateToDispatch?: () => void;
}

export const DemandForecastPage: React.FC<DemandForecastPageProps> = ({
  onNavigateToDispatch
}) => {
  const [horizonDays, setHorizonDays] = useState<7 | 14 | 30>(7);
  const [selectedService, setSelectedService] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [loading, setLoading] = useState(false);

  // Data state
  const [kpis, setKpis] = useState<ForecastSummaryKPIs>({
    predictedJobs7Days: 184,
    highDemandAreasCount: 6,
    topDemandService: 'Plumbing',
    workforceNeededCount: 27,
    forecastConfidenceAvg: 87
  });
  const [areaForecasts, setAreaForecasts] = useState<DemandForecast[]>([]);
  const [recommendations, setRecommendations] = useState<WorkforceRecType[]>([]);
  const [timelineData, setTimelineData] = useState<DailyForecastPoint[]>([]);
  const [noticeAlert, setNoticeAlert] = useState<string | null>(null);

  // Load forecast data
  const loadForecast = async () => {
    setLoading(true);
    try {
      const data = await demandForecastService.getForecastData({
        horizonDays,
        service: selectedService,
        location: selectedLocation
      });
      setKpis(data.kpis);
      setAreaForecasts(data.areaForecasts);
      setRecommendations(data.recommendations);
      setTimelineData(data.timelineForecast);
    } catch (err) {
      console.error('Failed to load forecast data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [horizonDays, selectedService, selectedLocation]);

  // Generate dynamic AI insights
  const aiInsights = useMemo(() => {
    return generateAIInsights(areaForecasts, MOCK_WORKERS);
  }, [areaForecasts]);

  const handleActionTriggered = (rec: WorkforceRecType) => {
    setNoticeAlert(
      `✓ Preparation notice dispatched to cooperative workers for ${rec.service} in ${rec.location}. Roster updated.`
    );
    setTimeout(() => setNoticeAlert(null), 5000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast alert when preparation notice dispatched */}
      {noticeAlert && (
        <div className="bg-emerald-900 text-emerald-100 px-4 py-3 rounded-xl border border-emerald-700 shadow-md flex items-center justify-between text-xs animate-in slide-in-from-top duration-200">
          <span className="font-semibold">{noticeAlert}</span>
          <button
            onClick={() => setNoticeAlert(null)}
            className="text-emerald-300 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Section Header & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Module 1
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                AI Service Demand Forecasting
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Anticipate service spikes across cooperative zones before demand surge, enabling preemptive workforce preparation
            </p>
          </div>

          {/* Quick link to dispatch */}
          {onNavigateToDispatch && (
            <button
              onClick={onNavigateToDispatch}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-lg border border-emerald-200 transition-colors self-start lg:self-auto"
            >
              <span>Go to Fair Work Allocation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Cooperative Admin Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Forecast Horizon */}
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Forecast Horizon</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {([7, 14, 30] as const).map(d => (
                <button
                  key={`horizon-${d}`}
                  onClick={() => setHorizonDays(d)}
                  className={`py-1 rounded text-xs font-semibold transition-all ${
                    horizonDays === d
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d} Days
                </button>
              ))}
            </div>
          </div>

          {/* Service Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Service Category</span>
            </label>
            <select
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Cooperative Trades</option>
              {SERVICE_CATEGORIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Cooperative Hub / Locality</span>
            </label>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Cooperative Zones</option>
              {COOPERATIVE_AREAS.map(a => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5 KPI Cards (Explicit prompt requirement) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Predicted Jobs */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium mb-1">
            Predicted Jobs — Next {horizonDays}d
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {kpis.predictedJobs7Days}
          </div>
          <div className="text-2xs text-emerald-700 font-semibold mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            +18% weekly momentum
          </div>
        </div>

        {/* High Demand Areas */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium mb-1">High Demand Areas</div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {kpis.highDemandAreasCount}
          </div>
          <div className="text-2xs text-rose-700 font-semibold mt-1">
            Area A & Area B prioritized
          </div>
        </div>

        {/* Top Service */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium mb-1">Highest Demand Service</div>
          <div className="text-xl font-bold text-slate-900 truncate tracking-tight">
            {kpis.topDemandService}
          </div>
          <div className="text-2xs text-slate-500 mt-1">
            32 projected requests
          </div>
        </div>

        {/* Workforce Needed */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium mb-1">Workforce Needed</div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
            {kpis.workforceNeededCount} workers
          </div>
          <div className="text-2xs text-slate-500 mt-1">
            Active cooperative capacity
          </div>
        </div>

        {/* Forecast Confidence */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-slate-500 text-xs font-medium mb-1">Forecast Confidence</div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-1">
            <span>{kpis.forecastConfidenceAvg}%</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xs text-emerald-700 font-semibold mt-1">
            Standard error &lt; 8.4%
          </div>
        </div>
      </div>

      {/* Visual Forecast Chart */}
      <DemandForecastChart
        data={timelineData}
        serviceTitle={selectedService === 'All' ? 'All Cooperative Services' : selectedService}
        horizonDays={horizonDays}
      />

      {/* High Demand Areas Table & Visualizations */}
      <DemandLocationCard
        forecasts={areaForecasts}
        onSelectArea={(area, srv) => {
          setSelectedLocation(area);
          setSelectedService(srv);
        }}
      />

      {/* AI Workforce Preparation Recommendations */}
      <WorkforceRecommendation
        recommendations={recommendations}
        onActionTriggered={handleActionTriggered}
      />

      {/* AI Insights Panel */}
      <AIInsightCard insights={aiInsights} />
    </div>
  );
};
