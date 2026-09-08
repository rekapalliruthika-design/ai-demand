import { AIInsight, DemandForecast, Worker } from '../../types';

/**
 * Deterministic AI demand and workforce insight analyzer
 */
export function generateAIInsights(
  forecasts: DemandForecast[],
  workers: Worker[]
): AIInsight[] {
  const insights: AIInsight[] = [];

  // 1. High Demand Trend Insight
  const topForecast = forecasts[0];
  if (topForecast) {
    insights.push({
      id: 'ins-trend-01',
      type: 'trend',
      title: `${topForecast.service} Surge in ${topForecast.location.split(' - ')[0]}`,
      description: `${topForecast.service} demand is projected to reach ${topForecast.predictedJobs} requests (+${topForecast.trendPercentage}% vs historic baseline) driven by seasonal weather and housing turnover.`,
      metric: `+${topForecast.trendPercentage}%`,
      badge: `${topForecast.demandLevel} Demand`,
      iconName: 'TrendingUp',
      timestamp: 'Forecast horizon: 7 days'
    });
  }

  // 2. Workforce Shortage Alert Insight
  const shortageForecast = forecasts.find(f => f.shortageOrSurplus > 0);
  if (shortageForecast) {
    insights.push({
      id: 'ins-workforce-01',
      type: 'workforce',
      title: `Workforce Mobilization: ${shortageForecast.service}`,
      description: `${shortageForecast.shortageOrSurplus} additional ${shortageForecast.service.toLowerCase()} specialists needed in ${shortageForecast.location} to prevent response latency exceeding 30 mins.`,
      metric: `${shortageForecast.recommendedWorkforce} Required`,
      badge: 'Action Required',
      iconName: 'Users',
      timestamp: 'Immediate shift planning'
    });
  }

  // 3. Worker Opportunity Imbalance Detection (Fairness Insight)
  const availableWorkers = workers.filter(w => !w.suspended && w.verified);
  const avgJobs = availableWorkers.length > 0
    ? availableWorkers.reduce((acc, w) => acc + w.weeklyJobs, 0) / availableWorkers.length
    : 6;
  const underallocatedCount = availableWorkers.filter(w => w.weeklyJobs < avgJobs * 0.5).length;

  insights.push({
    id: 'ins-fairness-01',
    type: 'fairness',
    title: 'Opportunity Distribution Imbalance Detected',
    description: `${underallocatedCount} verified cooperative workers have received under 50% of the weekly average job volume (${Math.round(avgJobs)} jobs). Fair Allocation Engine is active to prioritize their dispatch on matching requests.`,
    metric: `${underallocatedCount} Workers`,
    badge: 'Fairness Engine Active',
    iconName: 'Scale',
    timestamp: 'Live cooperative telemetry'
  });

  // 4. Geographic Cluster Insight
  insights.push({
    id: 'ins-geo-01',
    type: 'geo',
    title: 'Geographic Service Density in East & South-East Hubs',
    description: '61% of upcoming requests are concentrated within Area A (Indiranagar) and Area B (Koramangala). Recommend staging standby mobile service kits at the cooperative community center.',
    metric: '61% Density',
    badge: 'Cluster Alert',
    iconName: 'MapPin',
    timestamp: 'Micro-transit corridor'
  });

  // 5. Cooperative Actionable Recommendation
  insights.push({
    id: 'ins-rec-01',
    type: 'recommendation',
    title: 'Inter-Area Cooperative Workforce Rebalancing',
    description: 'Area D (HSR) currently holds a surplus of 2 certified woodworkers, while Area B requires electrical assistance. Cross-training and temporary zone rebalancing will optimize cooperative earnings.',
    metric: '94% Efficiency',
    badge: 'Recommendation',
    iconName: 'Sparkles',
    timestamp: 'Cooperative admin guidance'
  });

  return insights;
}
