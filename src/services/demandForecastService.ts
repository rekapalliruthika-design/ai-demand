import {
  ForecastSummaryKPIs,
  DemandForecast,
  WorkforceRecommendation,
  DailyForecastPoint,
  DemandRecord,
  AdminDemandFilters,
  CurrentDemandKPIs,
  DemandTrendMetrics,
  StatisticalForecastResult,
  DemandRiskRadarItem,
  WorkforceReadinessItem,
  DemandAnomalyItem,
  ServiceIntelligenceItem,
  LocationIntelligenceItem,
  WhatIfScenarioConfig,
  WhatIfScenarioResult,
  OperationalRecommendationItem,
  WorkforceRebalancingOpportunity
} from '../types';
import { defaultForecastEngine, ForecastFilterParams } from '../ai/demandForecast/forecastEngine';
import { defaultStatisticalForecastProvider, IForecastProvider } from './forecasting/forecastProvider';
import { defaultDemandAnalyticsService } from './demandAnalyticsService';
import { defaultWorkforcePlanningService } from './workforcePlanningService';
import { dataStorage } from './dataStorage';

/**
 * Unified Production-Ready Demand Intelligence & Workforce Planning Service
 * 
 * Exposes API-ready methods matching Section 23 specification:
 * - getDemandAnalytics()
 * - getDemandTrendAnalysis()
 * - getDemandForecast()
 * - getDemandAnomalies()
 * - getDemandRiskRadar()
 * - getWorkforceReadiness()
 * - getServiceIntelligence()
 * - getLocationIntelligence()
 * - simulateWhatIfScenario()
 * - getOperationalRecommendations()
 * - getWorkforceRebalancingOpportunities()
 */
class DemandForecastService {
  private forecastProvider: IForecastProvider = defaultStatisticalForecastProvider;

  /**
   * Sets custom forecast provider (e.g. MLForecastProvider when backend connected)
   */
  public setForecastProvider(provider: IForecastProvider): void {
    this.forecastProvider = provider;
  }

  public getForecastProviderName(): string {
    return this.forecastProvider.name;
  }

  public isMLPowered(): boolean {
    return this.forecastProvider.isMLPowered;
  }

  /**
   * 1. Real-time Current Demand Analytics & KPIs
   */
  public async getDemandAnalytics(filters?: Partial<AdminDemandFilters>): Promise<CurrentDemandKPIs> {
    const history = dataStorage.getDemandHistory();
    const jobs = dataStorage.getJobs();
    return defaultDemandAnalyticsService.calculateCurrentKPIs(history, jobs, filters);
  }

  /**
   * 2. Trend & Time-Slot Analysis
   */
  public async getDemandTrendAnalysis(filters?: Partial<AdminDemandFilters>): Promise<DemandTrendMetrics> {
    const history = dataStorage.getDemandHistory();
    const jobs = dataStorage.getJobs();
    return defaultDemandAnalyticsService.calculateTrendMetrics(history, jobs, filters);
  }

  /**
   * 3. Statistical / Model Forecasting Layer
   */
  public async getDemandForecast(filters: AdminDemandFilters): Promise<StatisticalForecastResult[]> {
    const history = dataStorage.getDemandHistory();
    const workers = dataStorage.getWorkers();
    return this.forecastProvider.generateForecast(filters, history, workers);
  }

  /**
   * 4. Demand Anomaly Detection
   */
  public async getDemandAnomalies(filters?: Partial<AdminDemandFilters>): Promise<DemandAnomalyItem[]> {
    const history = dataStorage.getDemandHistory();
    return defaultDemandAnalyticsService.detectDemandAnomalies(history, filters);
  }

  /**
   * 5. Demand Risk Radar
   */
  public async getDemandRiskRadar(
    filters: AdminDemandFilters,
    providedForecasts?: StatisticalForecastResult[]
  ): Promise<DemandRiskRadarItem[]> {
    const forecasts = providedForecasts || await this.getDemandForecast(filters);
    const workers = dataStorage.getWorkers();
    return defaultWorkforcePlanningService.calculateDemandRiskRadar(forecasts, workers);
  }

  /**
   * 6. Workforce Readiness (Expected Demand vs Capacity)
   */
  public async getWorkforceReadiness(
    riskRadar: DemandRiskRadarItem[]
  ): Promise<WorkforceReadinessItem[]> {
    return defaultWorkforcePlanningService.calculateWorkforceReadiness(riskRadar);
  }

  /**
   * 7. Service Intelligence (Ranked by growth, demand, response times)
   */
  public async getServiceIntelligence(): Promise<ServiceIntelligenceItem[]> {
    const history = dataStorage.getDemandHistory();
    const jobs = dataStorage.getJobs();
    return defaultDemandAnalyticsService.calculateServiceIntelligence(history, jobs);
  }

  /**
   * 8. Location Intelligence (Ranked by volume, risk, and worker deficit)
   */
  public async getLocationIntelligence(): Promise<LocationIntelligenceItem[]> {
    const history = dataStorage.getDemandHistory();
    const jobs = dataStorage.getJobs();
    const workers = dataStorage.getWorkers();

    const workerCountsByArea = new Map<string, number>();
    workers.forEach(w => {
      if (w.availability !== 'unavailable' && !w.suspended) {
        const areaKey = w.serviceArea.split(' - ')[0];
        workerCountsByArea.set(areaKey, (workerCountsByArea.get(areaKey) || 0) + 1);
        workerCountsByArea.set(w.serviceArea, (workerCountsByArea.get(w.serviceArea) || 0) + 1);
      }
    });

    return defaultDemandAnalyticsService.calculateLocationIntelligence(history, jobs, workerCountsByArea);
  }

  /**
   * 9. What-If Scenario Simulator
   */
  public async simulateWhatIfScenario(
    config: WhatIfScenarioConfig,
    baseRisks: DemandRiskRadarItem[]
  ): Promise<WhatIfScenarioResult> {
    return defaultWorkforcePlanningService.simulateScenario(config, baseRisks);
  }

  /**
   * 10. Operations Action Center Recommendations
   */
  public async getOperationalRecommendations(
    risks: DemandRiskRadarItem[],
    readiness: WorkforceReadinessItem[]
  ): Promise<OperationalRecommendationItem[]> {
    return defaultWorkforcePlanningService.generateOperationalRecommendations(risks, readiness);
  }

  /**
   * 11. Inter-Zone Workforce Rebalancing Opportunities
   */
  public async getWorkforceRebalancingOpportunities(
    readiness: WorkforceReadinessItem[]
  ): Promise<WorkforceRebalancingOpportunity[]> {
    const workers = dataStorage.getWorkers();
    return defaultWorkforcePlanningService.calculateRebalancingOpportunities(workers, readiness);
  }

  // --- Legacy Backward Compatibility Methods ---
  public async getForecastData(params: ForecastFilterParams = { horizonDays: 7 }): Promise<{
    kpis: ForecastSummaryKPIs;
    areaForecasts: DemandForecast[];
    recommendations: WorkforceRecommendation[];
    timelineForecast: DailyForecastPoint[];
  }> {
    const history = dataStorage.getDemandHistory();
    const workers = dataStorage.getWorkers();
    return defaultForecastEngine.generateForecast(params, history, workers);
  }

  public async getHighDemandAreas(horizonDays: 7 | 14 | 30 = 7): Promise<DemandForecast[]> {
    const data = await this.getForecastData({ horizonDays });
    return data.areaForecasts;
  }

  public async getWorkforceRecommendations(): Promise<WorkforceRecommendation[]> {
    const data = await this.getForecastData();
    return data.recommendations;
  }

  public getDemandHistory(): DemandRecord[] {
    return dataStorage.getDemandHistory();
  }

  public addDemandRecord(record: Omit<DemandRecord, 'id'>): DemandRecord {
    return dataStorage.addDemandRecord(record);
  }

  public deleteDemandRecord(id: string): void {
    dataStorage.deleteDemandRecord(id);
  }

  public clearAllDemandRecords(): void {
    dataStorage.clearDemandHistory();
  }

  public resetToBaseline(): void {
    dataStorage.resetDemandHistoryToBaseline();
  }

  public exportToCSV(): string {
    const history = this.getDemandHistory();
    const headers = ['date', 'dayOfWeek', 'service', 'location', 'timeSlot', 'requests', 'completed', 'cancelled', 'avgResponseTimeMinutes', 'isHolidayOrWeekend', 'weatherCondition'];
    const rows = history.map(r => [
      r.date,
      r.dayOfWeek || 'Mon',
      `"${r.service}"`,
      `"${r.location}"`,
      r.timeSlot || 'morning',
      r.requests,
      r.completed,
      r.cancelled,
      r.avgResponseTimeMinutes || 25,
      r.isHolidayOrWeekend ? 'true' : 'false',
      `"${r.weatherCondition || 'Clear'}"`
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  public importFromCSV(csvContent: string): { imported: number; errors: string[] } {
    const lines = csvContent.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return { imported: 0, errors: ['CSV file is empty or missing data rows.'] };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dateIdx = headers.indexOf('date');
    const serviceIdx = headers.indexOf('service');
    const locationIdx = headers.indexOf('location');
    const requestsIdx = headers.indexOf('requests');
    const completedIdx = headers.indexOf('completed');
    const cancelledIdx = headers.indexOf('cancelled');
    const responseTimeIdx = headers.indexOf('avgresponsetimeminutes');
    const weatherIdx = headers.indexOf('weathercondition');

    if (dateIdx === -1 || serviceIdx === -1 || locationIdx === -1 || requestsIdx === -1) {
      return {
        imported: 0,
        errors: ['CSV must contain headers: date, service, location, requests. Optional: completed, cancelled, avgResponseTimeMinutes, weatherCondition.']
      };
    }

    const newRecords: DemandRecord[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      const date = cols[dateIdx];
      const service = cols[serviceIdx];
      const location = cols[locationIdx];
      const requests = parseInt(cols[requestsIdx], 10);

      if (!date || !service || !location || isNaN(requests)) {
        errors.push(`Row ${i + 1} skipped: Invalid required values.`);
        continue;
      }

      const completed = completedIdx !== -1 && !isNaN(parseInt(cols[completedIdx], 10))
        ? parseInt(cols[completedIdx], 10)
        : Math.round(requests * 0.9);

      const cancelled = cancelledIdx !== -1 && !isNaN(parseInt(cols[cancelledIdx], 10))
        ? parseInt(cols[cancelledIdx], 10)
        : Math.max(0, requests - completed);

      const avgResponseTimeMinutes = responseTimeIdx !== -1 && !isNaN(parseInt(cols[responseTimeIdx], 10))
        ? parseInt(cols[responseTimeIdx], 10)
        : 25;

      const weatherCondition = weatherIdx !== -1 && cols[weatherIdx] ? cols[weatherIdx] : 'Clear';

      const d = new Date(date);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayOfWeek = days[isNaN(d.getDay()) ? 1 : d.getDay()];
      const isHolidayOrWeekend = dayOfWeek === 'Sat' || dayOfWeek === 'Sun';

      newRecords.push({
        id: `csv-${Date.now()}-${i}`,
        date,
        dayOfWeek,
        service,
        location,
        requests,
        completed,
        cancelled,
        avgResponseTimeMinutes,
        isHolidayOrWeekend,
        weatherCondition
      });
    }

    if (newRecords.length > 0) {
      dataStorage.appendDemandRecords(newRecords);
    }

    return { imported: newRecords.length, errors };
  }
}

export const demandForecastService = new DemandForecastService();
