import { ForecastSummaryKPIs, DemandForecast, WorkforceRecommendation, DailyForecastPoint } from '../types';
import { defaultForecastEngine, ForecastFilterParams } from '../ai/demandForecast/forecastEngine';

/**
 * Service Layer for Demand Forecasting
 * 
 * Future Backend Architecture:
 * When migrating to a production microservice, this service can easily be swapped to:
 * 
 * const response = await fetch('/api/demand/forecast', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(params)
 * });
 * return await response.json();
 */
class DemandForecastService {
  /**
   * Fetches full forecast analysis with KPIs, area breakdowns, recommendations and charts
   */
  public async getForecastData(params: ForecastFilterParams = { horizonDays: 7 }): Promise<{
    kpis: ForecastSummaryKPIs;
    areaForecasts: DemandForecast[];
    recommendations: WorkforceRecommendation[];
    timelineForecast: DailyForecastPoint[];
  }> {
    // Simulating short async micro-tick for realistic UI reactivity
    await new Promise(resolve => setTimeout(resolve, 120));
    return defaultForecastEngine.generateForecast(params);
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
}

export const demandForecastService = new DemandForecastService();
