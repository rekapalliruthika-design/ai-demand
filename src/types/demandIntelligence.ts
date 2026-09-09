/**
 * Real-World AI Demand Intelligence and Workforce Planning Types
 * SahakarGig Cooperative Platform
 */

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export type DemandRiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type WorkforceReadinessStatus = 'Ready' | 'Prepare' | 'Shortage' | 'Critical Shortage';

export type ServiceGrowthCategory = 'Growing' | 'Stable' | 'Declining';

export interface CurrentDemandKPIs {
  requestsToday: number;
  requestsThisWeek: number;
  completedJobs: number;
  pendingRequests: number;
  cancellationRate: number; // percentage (e.g. 8.5)
  avgResponseTimeMinutes: number;
  topRequestedServices: { service: string; count: number }[];
  topDemandLocations: { location: string; count: number }[];
}

export interface DemandTrendMetrics {
  service: string;
  location: string;
  previousPeriodRequests: number;
  currentPeriodRequests: number;
  growthPercentage: number;
  trendDirection: 'increasing' | 'stable' | 'decreasing';
  dayOfWeekPatterns: { day: string; avgRequests: number }[];
  timeSlotPatterns: { slot: TimeSlot; label: string; count: number; percentage: number }[];
  peakTimeSlot: string;
  peakPeriodInsight: string;
}

export interface ForecastCalculationBreakdown {
  movingAverage: number;
  weightedMovingAverage: number;
  recencyWeight: number;
  dayOfWeekFactor: number;
  serviceTrendFactor: number;
  locationTrendFactor: number;
  historicalSampleCount: number;
  varianceStdDev: number;
}

export interface StatisticalForecastResult {
  service: string;
  location: string;
  horizonDays: number;
  expectedDemand: number;
  confidenceScore: number; // 0 to 100
  confidenceLabel: string;
  isInsufficientData: boolean;
  dataQualityWarning?: string;
  breakdown: ForecastCalculationBreakdown;
  dailyTimeline: Array<{
    date: string;
    day: string;
    predicted: number;
    confidenceLow: number;
    confidenceHigh: number;
    historicalAvg: number;
  }>;
}

export interface DemandRiskRadarItem {
  id: string;
  service: string;
  location: string;
  forecastedDemand: number;
  expectedJobs: number;
  availableWorkerCapacity: number;
  workersRequired: number;
  capacityGap: number; // negative = deficit, positive = surplus
  riskLevel: DemandRiskLevel;
  riskFactorNotes: string;
}

export interface WorkforceReadinessItem {
  id: string;
  service: string;
  location: string;
  expectedJobs: number;
  requiredWorkers: number;
  availableWorkers: number;
  capacityPercentage: number;
  shortage: number;
  surplus: number;
  readinessStatus: WorkforceReadinessStatus;
  actionSuggestion: string;
}

export interface DemandAnomalyItem {
  id: string;
  date: string;
  service: string;
  location: string;
  baselineDemand: number;
  observedDemand: number;
  percentageChange: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  dataEvidence: string;
}

export interface ServiceIntelligenceItem {
  service: string;
  currentDemand: number;
  growthRate: number; // percentage
  forecastedDemand: number;
  cancellationRate: number;
  avgResponseTime: number;
  category: ServiceGrowthCategory;
  rank: number;
}

export interface LocationIntelligenceItem {
  location: string;
  zone: string;
  currentRequests: number;
  forecastedRequests: number;
  growthRate: number;
  workerCapacity: number;
  shortage: number;
  riskLevel: DemandRiskLevel;
  readinessCategory: 'Ready' | 'Prepare' | 'Critical';
  rank: number;
}

export interface WhatIfScenarioConfig {
  percentageChange: number; // e.g. -20, -10, 0, 10, 20
  serviceFilter?: string;
  locationFilter?: string;
}

export interface WhatIfScenarioResult {
  scenarioPercentage: number;
  originalDemand: number;
  scenarioDemand: number;
  baselineWorkersRequired: number;
  scenarioWorkersRequired: number;
  availableCapacity: number;
  workforceGap: number;
  capacityPercentage: number;
  riskLevel: DemandRiskLevel;
  recommendedAction: string;
  areaBreakdown: Array<{
    service: string;
    location: string;
    originalJobs: number;
    adjustedJobs: number;
    requiredWorkers: number;
    availableWorkers: number;
    gap: number;
    risk: DemandRiskLevel;
  }>;
}

export interface OperationalRecommendationItem {
  id: string;
  type: 'shortage' | 'surplus' | 'surge' | 'sla' | 'rebalance';
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  service: string;
  location: string;
  actionLabel: string;
  expectedJobs: number;
  availableCapacity: number;
  capacityGap: number;
}

export interface WorkforceRebalancingOpportunity {
  id: string;
  service: string;
  sourceArea: string; // Area with surplus
  targetArea: string; // Area with shortage
  surplusCount: number;
  shortageCount: number;
  recommendedTransferCount: number;
  distanceKm: number;
  eligibleWorkers: Array<{
    id: string;
    name: string;
    rating: number;
    activeJobs: number;
    weeklyJobs: number;
    serviceArea: string;
  }>;
  reasoning: string;
}

export interface AdminDemandFilters {
  horizonDays: 7 | 14 | 30;
  service: string;
  location: string;
  timeSlot: string; // 'All' | 'morning' | 'afternoon' | 'evening' | 'night'
  riskLevel: string; // 'All' | 'Low' | 'Moderate' | 'High' | 'Critical'
  startDate?: string;
  endDate?: string;
}
