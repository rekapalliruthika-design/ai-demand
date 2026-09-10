import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { demandForecastService } from '../services/demandForecastService';
import { dataStorage } from '../services/dataStorage';
import {
  AdminDemandFilters,
  CurrentDemandKPIs,
  DemandTrendMetrics,
  StatisticalForecastResult,
  DemandRiskRadarItem,
  WorkforceReadinessItem,
  OperationalRecommendationItem,
  DemandAnomalyItem,
  ServiceIntelligenceItem,
  LocationIntelligenceItem,
  WorkforceRebalancingOpportunity
} from '../types';
import { SERVICE_CATEGORIES, COOPERATIVE_AREAS } from '../data/demandHistory';
import { CurrentDemandKPIsSection } from '../components/demand/CurrentDemandKPIsSection';
import { DemandTrendForecastSection } from '../components/demand/DemandTrendForecastSection';
import { DemandRiskRadarSection } from '../components/demand/DemandRiskRadarSection';
import { WorkforceReadinessSection } from '../components/demand/WorkforceReadinessSection';
import { OperationsActionCenterSection } from '../components/demand/OperationsActionCenterSection';
import { DemandAnomaliesSection } from '../components/demand/DemandAnomaliesSection';
import { ServiceIntelligenceSection } from '../components/demand/ServiceIntelligenceSection';
import { LocationIntelligenceSection } from '../components/demand/LocationIntelligenceSection';
import { DemandScenarioSimulatorSection } from '../components/demand/DemandScenarioSimulatorSection';
import { WorkforceRebalancingSection } from '../components/demand/WorkforceRebalancingSection';
import { ManageDemandDataModal } from '../components/ManageDemandDataModal';
import {
  TrendingUp,
  MapPin,
  Users,
  Calendar,
  Briefcase,
  Layers,
  Filter,
  RefreshCw,
  Database,
  ArrowRight,
  AlertTriangle,
  Bell,
  Cpu,
  ShieldCheck
} from 'lucide-react';

interface DemandForecastPageProps {
  onNavigateToDispatch?: () => void;
  onAlertsCalculated?: (count: number, alerts: any[]) => void;
}

export const DemandForecastPage: React.FC<DemandForecastPageProps> = ({
  onNavigateToDispatch,
  onAlertsCalculated
}) => {
  // Filter States
  const [horizonDays, setHorizonDays] = useState<7 | 14 | 30>(7);
  const [selectedService, setSelectedService] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [isManageDataOpen, setIsManageDataOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noticeAlert, setNoticeAlert] = useState<string | null>(null);

  // Real Platform Intelligence Data States
  const [currentKPIs, setCurrentKPIs] = useState<CurrentDemandKPIs>({
    requestsToday: 0,
    requestsThisWeek: 0,
    completedJobs: 0,
    pendingRequests: 0,
    cancellationRate: 0,
    avgResponseTimeMinutes: 25,
    topRequestedServices: [],
    topDemandLocations: []
  });

  const [trendMetrics, setTrendMetrics] = useState<DemandTrendMetrics>({
    service: 'All Services',
    location: 'All Zones',
    previousPeriodRequests: 0,
    currentPeriodRequests: 0,
    growthPercentage: 0,
    trendDirection: 'stable',
    dayOfWeekPatterns: [],
    timeSlotPatterns: [],
    peakTimeSlot: 'Evening (5 PM - 9 PM)',
    peakPeriodInsight: 'Loading platform intelligence...'
  });

  const [forecastList, setForecastList] = useState<StatisticalForecastResult[]>([]);
  const [riskRadar, setRiskRadar] = useState<DemandRiskRadarItem[]>([]);
  const [workforceReadiness, setWorkforceReadiness] = useState<WorkforceReadinessItem[]>([]);
  const [operationalRecs, setOperationalRecs] = useState<OperationalRecommendationItem[]>([]);
  const [anomalies, setAnomalies] = useState<DemandAnomalyItem[]>([]);
  const [serviceIntel, setServiceIntel] = useState<ServiceIntelligenceItem[]>([]);
  const [locationIntel, setLocationIntel] = useState<LocationIntelligenceItem[]>([]);
  const [rebalancingOpps, setRebalancingOpps] = useState<WorkforceRebalancingOpportunity[]>([]);

  // Keep onAlertsCalculated in a ref so changes to parent callback identity never re-trigger loadIntelligence
  const alertsCallbackRef = useRef(onAlertsCalculated);
  useEffect(() => {
    alertsCallbackRef.current = onAlertsCalculated;
  }, [onAlertsCalculated]);

  // Load all intelligence modules from live platform data
  const loadIntelligence = useCallback(async () => {
    setLoading(true);
    try {
      const filters: AdminDemandFilters = {
        horizonDays,
        service: selectedService,
        location: selectedLocation,
        timeSlot: 'All',
        riskLevel: 'All'
      };

      // 1. Current Demand KPIs
      const kpis = await demandForecastService.getDemandAnalytics(filters);
      setCurrentKPIs(kpis);

      // 2. Trend Metrics & Time-Slot Patterns
      const trends = await demandForecastService.getDemandTrendAnalysis(filters);
      setTrendMetrics(trends);

      // 3. Statistical Forecast Projections
      const forecasts = await demandForecastService.getDemandForecast(filters);
      setForecastList(forecasts);

      // 4. Demand Risk Radar
      const risks = await demandForecastService.getDemandRiskRadar(filters, forecasts);
      setRiskRadar(risks);

      // 5. Workforce Readiness
      const readiness = await demandForecastService.getWorkforceReadiness(risks);
      setWorkforceReadiness(readiness);

      // 6. Operational Action Center
      const recs = await demandForecastService.getOperationalRecommendations(risks, readiness);
      setOperationalRecs(recs);

      // 7. Anomalies
      const detectedAnomalies = await demandForecastService.getDemandAnomalies(filters);
      setAnomalies(detectedAnomalies);

      // 8. Service Intelligence
      const services = await demandForecastService.getServiceIntelligence();
      setServiceIntel(services);

      // 9. Location Intelligence
      const locations = await demandForecastService.getLocationIntelligence();
      setLocationIntel(locations);

      // 10. Rebalancing Opportunities
      const rebal = await demandForecastService.getWorkforceRebalancingOpportunities(readiness);
      setRebalancingOpps(rebal);

      // Report urgent alerts count
      const urgentRisks = risks.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High');
      alertsCallbackRef.current?.(urgentRisks.length, urgentRisks);
    } catch (err) {
      console.error('Failed to calculate demand intelligence:', err);
    } finally {
      setLoading(false);
    }
  }, [horizonDays, selectedService, selectedLocation]);

  useEffect(() => {
    loadIntelligence();
  }, [loadIntelligence]);

  // Primary forecast to visualize in Section 2 chart
  const primaryForecast = useMemo(() => {
    if (forecastList.length === 0) return null;
    // Return matching or first valid
    return forecastList.find(f => !f.isInsufficientData) || forecastList[0];
  }, [forecastList]);

  // Urgent alerts for banner
  const urgentCount = useMemo(() => {
    return riskRadar.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High').length;
  }, [riskRadar]);

  const criticalCount = useMemo(() => {
    return riskRadar.filter(r => r.riskLevel === 'Critical').length;
  }, [riskRadar]);

  const demandHistoryCount = dataStorage.getDemandHistory().length;

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert */}
      {noticeAlert && (
        <div className="bg-emerald-900 text-emerald-100 px-4 py-3 rounded-xl border border-emerald-700 shadow-md flex items-center justify-between text-xs">
          <span className="font-semibold">{noticeAlert}</span>
          <button
            onClick={() => setNoticeAlert(null)}
            className="text-emerald-300 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header & Global Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-2xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 uppercase tracking-wider">
                Production Intelligence Engine
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                AI Demand Intelligence & Workforce Planning
              </h2>
              {urgentCount > 0 && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-2xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-white" />
                  <span>{urgentCount} Urgent Deficits Detected</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Anticipate service spikes across cooperative zones using real platform data, deterministic statistical formulations, and live worker capacity
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {onNavigateToDispatch && (
              <button
                onClick={onNavigateToDispatch}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
              >
                <span>Fair Work Allocation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Forecast Horizon */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Planning Horizon</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {([7, 14, 30] as const).map(d => (
                <button
                  key={`horizon-${d}`}
                  onClick={() => setHorizonDays(d)}
                  className={`py-1 rounded-lg text-xs font-bold transition-all ${
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
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Cooperative Trade</span>
            </label>
            <select
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Cooperative Trades</option>
              {SERVICE_CATEGORIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Cooperative Area / Hub</span>
            </label>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Cooperative Hubs</option>
              {COOPERATIVE_AREAS.map(a => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Urgent Operational Deficit Banner */}
      {urgentCount > 0 && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white rounded-2xl border-2 border-rose-600/70 p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>

              <div>
                <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Urgent Capacity Shortage Alerts
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white border border-rose-400 shadow-2xs">
                    {urgentCount} Deficits Identified ({criticalCount} Critical)
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Forecasted demand in{' '}
                  <span className="text-white font-semibold">
                    {riskRadar
                      .filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High')
                      .slice(0, 3)
                      .map(r => `${r.location.split(' - ')[0]} (${r.service})`)
                      .join(', ')}
                  </span>{' '}
                  exceeds active certified cooperative capacity. Preemptive cross-zone rebalancing recommended.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('section-action-center');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-2xs flex items-center space-x-1.5 cursor-pointer self-start lg:self-auto shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Review Action Center</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: Current Demand KPIs */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Section 1: Current Demand KPIs & Activity
          </h3>
        </div>
        <CurrentDemandKPIsSection kpis={currentKPIs} loading={loading} />
      </section>

      {/* SECTION 2: Demand Trend + Time-Series Forecast */}
      <section>
        <DemandTrendForecastSection
          forecast={primaryForecast}
          trendMetrics={trendMetrics}
          serviceTitle={selectedService === 'All' ? 'All Cooperative Services' : selectedService}
          locationTitle={selectedLocation === 'All' ? 'All Cooperative Hubs' : selectedLocation}
          horizonDays={horizonDays}
        />
      </section>

      {/* SECTION 3: Demand Risk Radar */}
      <section>
        <DemandRiskRadarSection items={riskRadar} />
      </section>

      {/* SECTION 4: Workforce Readiness */}
      <section>
        <WorkforceReadinessSection items={workforceReadiness} />
      </section>

      {/* SECTION 5: Operations Action Center */}
      <section id="section-action-center">
        <OperationsActionCenterSection recommendations={operationalRecs} />
      </section>

      {/* SECTION 6: Demand Anomalies */}
      <section>
        <DemandAnomaliesSection anomalies={anomalies} />
      </section>

      {/* SECTION 7: Service Intelligence */}
      <section>
        <ServiceIntelligenceSection services={serviceIntel} />
      </section>

      {/* SECTION 8: Location Intelligence */}
      <section>
        <LocationIntelligenceSection locations={locationIntel} />
      </section>

      {/* SECTION 9: What-If Scenario Simulator */}
      <section>
        <DemandScenarioSimulatorSection baseRisks={riskRadar} />
      </section>

      {/* SECTION 10: Workforce Rebalancing Opportunities */}
      <section>
        <WorkforceRebalancingSection opportunities={rebalancingOpps} />
      </section>

      {/* Live Dataset Management Modal */}
      <ManageDemandDataModal
        isOpen={isManageDataOpen}
        onClose={() => setIsManageDataOpen(false)}
        onDataUpdated={loadIntelligence}
      />
    </div>
  );
};
