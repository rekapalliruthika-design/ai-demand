/**
 * Core domain types for SahakarGig AI Demand Forecasting and Fair Work Allocation System
 */

export interface Worker {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  skills: string[];
  certifications: string[];
  rating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  serviceArea: string;
  availability: 'available' | 'busy' | 'unavailable';
  availableHours: number;
  activeJobs: number;
  weeklyJobs: number;
  weeklyEarnings: number; // in INR (₹)
  totalJobs: number;
  verified: boolean;
  suspended?: boolean;
  joinedDate: string;
}

export interface Job {
  id: string;
  title: string;
  service: string;
  category: string;
  requiredSkills: string[];
  latitude: number;
  longitude: number;
  location: string;
  customerName: string;
  customerPhone?: string;
  scheduledTime: string;
  status: 'pending' | 'allocated' | 'in_progress' | 'completed' | 'cancelled';
  estimatedValue: number;
  urgency: 'high' | 'medium' | 'standard';
  assignedWorkerId?: string;
  createdAt: string;
}

export interface DemandRecord {
  id: string;
  date: string;
  dayOfWeek: string;
  service: string;
  location: string;
  timeSlot?: 'morning' | 'afternoon' | 'evening' | 'night';
  requests: number;
  completed: number;
  cancelled: number;
  avgResponseTimeMinutes: number;
  isHolidayOrWeekend: boolean;
  weatherCondition?: string;
}

export type DemandLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface DailyForecastPoint {
  date: string;
  day: string;
  predicted: number;
  confidenceLow: number;
  confidenceHigh: number;
  historicalAvg: number;
}

export interface DemandForecast {
  service: string;
  location: string;
  predictedJobs: number;
  demandLevel: DemandLevel;
  trendPercentage: number;
  confidence: number;
  historicalAverage: number;
  currentWorkforce: number;
  recommendedWorkforce: number;
  shortageOrSurplus: number;
  recommendedAction: string;
  dailyForecast: DailyForecastPoint[];
}

export interface ForecastSummaryKPIs {
  predictedJobs7Days: number;
  highDemandAreasCount: number;
  criticalDemandCount: number;
  urgentAlertsCount: number;
  topDemandService: string;
  workforceNeededCount: number;
  forecastConfidenceAvg: number;
}

export interface WorkforceRecommendation {
  id: string;
  service: string;
  location: string;
  expectedDemand: number;
  currentWorkforce: number;
  requiredWorkforce: number;
  shortageOrSurplus: number; // positive = shortage, negative = surplus
  recommendedAction: string;
  urgency: 'high' | 'medium' | 'low';
  affectedCoopZone: string;
}

export interface AllocationWeights {
  skillMatch: number;      // e.g. 0.30
  availability: number;    // e.g. 0.15
  locationProximity: number; // e.g. 0.15
  fairnessScore: number;   // e.g. 0.20
  workloadBalance: number; // e.g. 0.10
  rating: number;          // e.g. 0.10
}

export type AllocationStrategy = 'balanced' | 'fairness_priority' | 'location_priority' | 'skill_priority';

export interface ScoreComponentBreakdown {
  raw: number;           // 0 to 100
  weight: number;        // weight fraction e.g. 0.30
  weightedScore: number; // raw * weight (e.g. 30 out of 30)
  maxPoints: number;     // weight * 100
}

export interface AllocationCandidate {
  worker: Worker;
  totalScore: number; // 0 to 100
  distanceKm: number;
  skillScore: ScoreComponentBreakdown;
  availabilityScore: ScoreComponentBreakdown;
  locationScore: ScoreComponentBreakdown;
  fairnessScore: ScoreComponentBreakdown;
  workloadScore: ScoreComponentBreakdown;
  ratingScore: ScoreComponentBreakdown;
  explanation: string[];
  eligibilityNotes?: string[];
  isTopRecommendation: boolean;
}

export interface AllocationResult {
  jobId: string;
  job: Job;
  recommendedWorker: AllocationCandidate | null;
  candidates: AllocationCandidate[];
  strategyUsed: AllocationStrategy;
  weightsUsed: AllocationWeights;
  timestamp: string;
  cooperativeContext: {
    totalEligibleWorkers: number;
    totalFilteredWorkers: number;
    averageWeeklyEarnings: number;
    averageWeeklyJobs: number;
  };
}

export interface FairnessMetricStats {
  opportunityBalanceIndex: number; // e.g. 82%
  earningsDistributionBalance: number; // e.g. 76%
  activeWorkersReceivingJobsRatio: number; // e.g. 94%
  averageWorkerUtilization: number; // e.g. 78%
  topEarnersSharePercentage: number;
  bottomEarnersSharePercentage: number;
  workerDistributionComparison: {
    workerName: string;
    workerId: string;
    beforeJobs: number;
    afterJobs: number;
    beforeEarnings: number;
    afterEarnings: number;
  }[];
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'workforce' | 'fairness' | 'geo' | 'recommendation';
  title: string;
  description: string;
  metric?: string;
  badge?: string;
  iconName: string;
  timestamp: string;
}

export * from './demandIntelligence';
