/**
 * Forecasting Layer for SahakarGig
 * 
 * Reusable, explainable statistical forecasting without pre-trained ML models,
 * black-box weights, or fake training data.
 * Adheres strictly to mathematical time-series formulations.
 */

import {
  DemandRecord,
  StatisticalForecastResult,
  AdminDemandFilters,
  Worker
} from '../../types';

export interface IForecastProvider {
  name: string;
  isMLPowered: boolean;
  generateForecast(
    filters: AdminDemandFilters,
    history: DemandRecord[],
    workers: Worker[]
  ): Promise<StatisticalForecastResult[]>;
}

/**
 * Deterministic Statistical Forecasting Provider
 * 
 * Implements:
 * 1. Simple Moving Average (SMA)
 * 2. Recency-Weighted Moving Average (WMA)
 * 3. Day-of-Week seasonality indexing
 * 4. Empirical Variance & Standard Deviation calculation
 * 5. Strict data availability auditing (flags insufficient data)
 */
export class StatisticalForecastProvider implements IForecastProvider {
  public readonly name = 'Statistical Time-Series Provider (Moving Avg + Day-of-Week + Recency Trend)';
  public readonly isMLPowered = false;

  public async generateForecast(
    filters: AdminDemandFilters,
    history: DemandRecord[],
    _workers: Worker[]
  ): Promise<StatisticalForecastResult[]> {
    const horizon = filters.horizonDays || 7;
    const filterService = filters.service && filters.service !== 'All' ? filters.service : null;
    const filterLocation = filters.location && filters.location !== 'All' ? filters.location : null;

    // Filter valid historical records
    const validRecords = history.filter(r => {
      if (!r.date || !r.service || !r.location || isNaN(r.requests)) return false;
      const matchSrv = !filterService || r.service.toLowerCase() === filterService.toLowerCase();
      const matchLoc = !filterLocation || r.location.toLowerCase() === filterLocation.toLowerCase();
      return matchSrv && matchLoc;
    });

    // Group records by service + location
    const groups = new Map<string, DemandRecord[]>();
    validRecords.forEach(r => {
      const key = `${r.service}:::${r.location}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    });

    const results: StatisticalForecastResult[] = [];

    // If specific service or location requested but no records exist
    if (filterService && filterLocation && groups.size === 0) {
      results.push(this.buildInsufficientDataResult(filterService, filterLocation, horizon));
      return results;
    }

    // Process each service + location group
    groups.forEach((records, key) => {
      const [service, location] = key.split(':::');
      const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Audit data quality and sufficiency
      if (sorted.length < 3) {
        results.push(this.buildInsufficientDataResult(service, location, horizon, sorted));
        return;
      }

      // 1. Simple Moving Average (SMA) of daily requests
      const totalRequests = sorted.reduce((sum, r) => sum + r.requests, 0);
      const sma = totalRequests / sorted.length;

      // 2. Weighted Moving Average (recency weighting)
      let weightedSum = 0;
      let totalWeight = 0;
      const recentWindow = sorted.slice(-7);
      recentWindow.forEach((rec, idx) => {
        const weight = 1 + idx * 0.25; // More recent days carry higher weight
        weightedSum += rec.requests * weight;
        totalWeight += weight;
      });
      const wma = totalWeight > 0 ? weightedSum / totalWeight : sma;

      // 3. Day of Week Seasonality
      const dayCounts = new Map<string, { sum: number; count: number }>();
      sorted.forEach(r => {
        const d = r.dayOfWeek || 'Mon';
        const curr = dayCounts.get(d) || { sum: 0, count: 0 };
        dayCounts.set(d, { sum: curr.sum + r.requests, count: curr.count + 1 });
      });

      // 4. Variance & Standard Deviation calculation
      const mean = sma;
      const varianceSum = sorted.reduce((acc, r) => acc + Math.pow(r.requests - mean, 2), 0);
      const variance = sorted.length > 1 ? varianceSum / (sorted.length - 1) : 0;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = mean > 0 ? stdDev / mean : 1;

      // 5. Growth momentum (recent window vs prior window)
      let growthFactor = 1.0;
      if (sorted.length >= 6) {
        const mid = Math.floor(sorted.length / 2);
        const priorPeriod = sorted.slice(0, mid);
        const currentPeriod = sorted.slice(mid);
        const priorAvg = priorPeriod.reduce((s, r) => s + r.requests, 0) / priorPeriod.length;
        const currentAvg = currentPeriod.reduce((s, r) => s + r.requests, 0) / currentPeriod.length;
        if (priorAvg > 0) {
          growthFactor = Math.min(1.4, Math.max(0.7, currentAvg / priorAvg));
        }
      }

      // Baseline daily rate blending WMA and growth momentum
      const dailyProjectedBase = Math.max(0.5, (wma * 0.6 + sma * 0.4) * growthFactor);
      const expectedTotal = Math.round(dailyProjectedBase * horizon);

      // 6. Confidence Score derivation
      // Base confidence depends on sample count (max 50 pts)
      const sampleScore = Math.min(50, (sorted.length / 14) * 50);
      // Stability score inversely proportional to coefficient of variation (max 40 pts)
      const stabilityScore = Math.max(10, Math.min(40, (1 - Math.min(1, coefficientOfVariation)) * 40));
      // Cancellation stability bonus (max 10 pts)
      const cancellationRate = totalRequests > 0
        ? sorted.reduce((sum, r) => sum + r.cancelled, 0) / totalRequests
        : 0;
      const cancellationBonus = Math.max(0, 10 - cancellationRate * 20);

      const confidenceScore = Math.min(96, Math.max(45, Math.round(sampleScore + stabilityScore + cancellationBonus)));
      const confidenceLabel = confidenceScore >= 80 ? 'High' : confidenceScore >= 65 ? 'Moderate' : 'Low';

      // 7. Daily timeline projection with day-of-week indexing
      const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const timeline: StatisticalForecastResult['dailyTimeline'] = [];
      const today = new Date();

      for (let i = 0; i < horizon; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i + 1);
        const dayIndex = nextDate.getDay();
        const dayName = daysList[dayIndex === 0 ? 6 : dayIndex - 1];

        // Day of week index
        const dayStats = dayCounts.get(dayName);
        const dayAvg = dayStats && dayStats.count > 0 ? dayStats.sum / dayStats.count : mean;
        const dowFactor = mean > 0 ? Math.min(1.35, Math.max(0.75, dayAvg / mean)) : 1.0;

        const predictedDaily = Math.max(0, Math.round(dailyProjectedBase * dowFactor));
        const margin = Math.max(1, Math.round(stdDev * (1 - confidenceScore / 150)));

        timeline.push({
          date: nextDate.toISOString().split('T')[0],
          day: dayName,
          predicted: predictedDaily,
          confidenceLow: Math.max(0, predictedDaily - margin),
          confidenceHigh: predictedDaily + margin,
          historicalAvg: Math.round(sma)
        });
      }

      results.push({
        service,
        location,
        horizonDays: horizon,
        expectedDemand: expectedTotal,
        confidenceScore,
        confidenceLabel,
        isInsufficientData: false,
        breakdown: {
          movingAverage: Math.round(sma * 10) / 10,
          weightedMovingAverage: Math.round(wma * 10) / 10,
          recencyWeight: Math.round(growthFactor * 100) / 100,
          dayOfWeekFactor: Math.round(1.0 * 100) / 100,
          serviceTrendFactor: Math.round(growthFactor * 100) / 100,
          locationTrendFactor: 1.0,
          historicalSampleCount: sorted.length,
          varianceStdDev: Math.round(stdDev * 10) / 10
        },
        dailyTimeline: timeline
      });
    });

    return results;
  }

  private buildInsufficientDataResult(
    service: string,
    location: string,
    horizonDays: number,
    existingRecords: DemandRecord[] = []
  ): StatisticalForecastResult {
    return {
      service,
      location,
      horizonDays,
      expectedDemand: existingRecords.length > 0
        ? existingRecords.reduce((s, r) => s + r.requests, 0)
        : 0,
      confidenceScore: Math.min(35, existingRecords.length * 10),
      confidenceLabel: 'Low (Insufficient Historical Data)',
      isInsufficientData: true,
      dataQualityWarning: `Only ${existingRecords.length} historical records recorded for ${service} in ${location}. Reliable forecasting requires at least 3 distinct day records.`,
      breakdown: {
        movingAverage: 0,
        weightedMovingAverage: 0,
        recencyWeight: 1.0,
        dayOfWeekFactor: 1.0,
        serviceTrendFactor: 1.0,
        locationTrendFactor: 1.0,
        historicalSampleCount: existingRecords.length,
        varianceStdDev: 0
      },
      dailyTimeline: []
    };
  }
}

/**
 * Future ML Forecast Provider Stub
 * 
 * Provides transparent pluggability for an external backend ML endpoint (e.g. FastAPI / PyTorch / Vertex AI)
 * without breaking existing UI and service contracts.
 */
export class MLForecastProvider implements IForecastProvider {
  public readonly name = 'Machine Learning Forecast Provider (Deep Time-Series / Gradient Boosting)';
  public readonly isMLPowered = true;
  private apiEndpoint: string | null = null;

  constructor(apiEndpoint?: string) {
    this.apiEndpoint = apiEndpoint || null;
  }

  public async generateForecast(
    filters: AdminDemandFilters,
    history: DemandRecord[],
    workers: Worker[]
  ): Promise<StatisticalForecastResult[]> {
    if (!this.apiEndpoint) {
      // Gracefully fall back to statistical provider when ML endpoint is not configured
      const fallback = new StatisticalForecastProvider();
      return fallback.generateForecast(filters, history, workers);
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, historyCount: history.length, workersCount: workers.length })
      });
      if (!response.ok) throw new Error(`ML API error: ${response.statusText}`);
      return await response.json();
    } catch (err) {
      console.warn('ML Forecast endpoint unavailable, falling back to statistical engine', err);
      const fallback = new StatisticalForecastProvider();
      return fallback.generateForecast(filters, history, workers);
    }
  }
}

export const defaultStatisticalForecastProvider = new StatisticalForecastProvider();
