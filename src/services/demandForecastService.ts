import { ForecastSummaryKPIs, DemandForecast, WorkforceRecommendation, DailyForecastPoint, DemandRecord } from '../types';
import { defaultForecastEngine, ForecastFilterParams } from '../ai/demandForecast/forecastEngine';
import { dataStorage } from './dataStorage';

/**
 * Service Layer for Live Demand Forecasting and Operational Data Management
 */
class DemandForecastService {
  /**
   * Fetches dynamic forecast analysis with KPIs, area breakdowns, recommendations and charts
   * computed from the active live data storage
   */
  public async getForecastData(params: ForecastFilterParams = { horizonDays: 7 }): Promise<{
    kpis: ForecastSummaryKPIs;
    areaForecasts: DemandForecast[];
    recommendations: WorkforceRecommendation[];
    timelineForecast: DailyForecastPoint[];
  }> {
    const history = dataStorage.getDemandHistory();
    const workers = dataStorage.getWorkers();

    // Async micro-tick for realistic feel
    await new Promise(resolve => setTimeout(resolve, 80));
    return defaultForecastEngine.generateForecast(params, history, workers);
  }

  /**
   * Fetches specific high demand zones
   */
  public async getHighDemandAreas(horizonDays: 7 | 14 | 30 = 7): Promise<DemandForecast[]> {
    const data = await this.getForecastData({ horizonDays });
    return data.areaForecasts;
  }

  /**
   * Fetches workforce preparation recommendations
   */
  public async getWorkforceRecommendations(): Promise<WorkforceRecommendation[]> {
    const data = await this.getForecastData();
    return data.recommendations;
  }

  /**
   * Returns current live demand history records
   */
  public getDemandHistory(): DemandRecord[] {
    return dataStorage.getDemandHistory();
  }

  /**
   * Adds a new real demand record
   */
  public addDemandRecord(record: Omit<DemandRecord, 'id'>): DemandRecord {
    return dataStorage.addDemandRecord(record);
  }

  /**
   * Deletes a demand record by ID
   */
  public deleteDemandRecord(id: string): void {
    dataStorage.deleteDemandRecord(id);
  }

  /**
   * Clears all demand records (start clean)
   */
  public clearAllDemandRecords(): void {
    dataStorage.clearDemandHistory();
  }

  /**
   * Resets demand records to baseline cooperative seed
   */
  public resetToBaseline(): void {
    dataStorage.resetDemandHistoryToBaseline();
  }

  /**
   * Imports demand records from CSV format
   * Header: date,dayOfWeek,service,location,requests,completed,cancelled,avgResponseTimeMinutes,weatherCondition
   */
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
        id: `rec-csv-${Date.now()}-${i}`,
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

  /**
   * Exports all live demand records to CSV string
   */
  public exportToCSV(): string {
    const records = dataStorage.getDemandHistory();
    const headers = ['date', 'dayOfWeek', 'service', 'location', 'requests', 'completed', 'cancelled', 'avgResponseTimeMinutes', 'weatherCondition'];
    const rows = records.map(r => [
      r.date,
      r.dayOfWeek,
      `"${r.service}"`,
      `"${r.location}"`,
      r.requests,
      r.completed,
      r.cancelled,
      r.avgResponseTimeMinutes,
      `"${r.weatherCondition || 'Clear'}"`
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }
}

export const demandForecastService = new DemandForecastService();
