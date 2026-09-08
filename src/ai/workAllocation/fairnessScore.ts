import { Worker } from '../../types';

export interface CohortOpportunityStats {
  meanWeeklyEarnings: number;
  maxWeeklyEarnings: number;
  minWeeklyEarnings: number;
  meanWeeklyJobs: number;
}

/**
 * Computes cohort statistical baselines across a group of eligible workers
 */
export function computeCohortStats(workers: Worker[]): CohortOpportunityStats {
  if (workers.length === 0) {
    return {
      meanWeeklyEarnings: 4500,
      maxWeeklyEarnings: 8000,
      minWeeklyEarnings: 1200,
      meanWeeklyJobs: 7
    };
  }

  const totalEarnings = workers.reduce((sum, w) => sum + w.weeklyEarnings, 0);
  const totalJobs = workers.reduce((sum, w) => sum + w.weeklyJobs, 0);
  const earningsList = workers.map(w => w.weeklyEarnings);

  return {
    meanWeeklyEarnings: Math.round(totalEarnings / workers.length),
    maxWeeklyEarnings: Math.max(...earningsList),
    minWeeklyEarnings: Math.min(...earningsList),
    meanWeeklyJobs: Math.round((totalJobs / workers.length) * 10) / 10
  };
}

/**
 * Calculates the Fairness / Opportunity Score (0 - 100)
 * 
 * CORE PRINCIPLE:
 * Workers who are qualified and available, but have received fewer jobs and earned
 * significantly less this week compared to peers, receive a higher fairness score.
 * 
 * This ensures that cooperative opportunities are equitably distributed rather
 * than concentrating on the top 5% of workers.
 * 
 * CRITICAL SAFEGUARDS:
 * - Operates strictly on economic and workload metrics (weekly earnings, job count).
 * - Never discriminates on protected personal attributes.
 * - Operates ONLY within qualified, eligible candidates.
 */
export function calculateFairnessScore(
  worker: Worker,
  cohortStats: CohortOpportunityStats
): number {
  const { meanWeeklyEarnings, maxWeeklyEarnings, minWeeklyEarnings, meanWeeklyJobs } = cohortStats;

  // Earnings opportunity ratio: inverted so lower earnings = higher score
  const earningsRange = Math.max(1000, maxWeeklyEarnings - minWeeklyEarnings);
  const earningsOffset = Math.max(0, maxWeeklyEarnings - worker.weeklyEarnings);
  const normalizedEarningsScore = Math.min(100, Math.max(10, Math.round((earningsOffset / earningsRange) * 100)));

  // Weekly jobs opportunity ratio
  let jobsScore = 70;
  if (meanWeeklyJobs > 0) {
    const jobRatio = worker.weeklyJobs / meanWeeklyJobs;
    if (jobRatio <= 0.4) jobsScore = 95;      // Very few jobs (e.g. 1-3 jobs)
    else if (jobRatio <= 0.75) jobsScore = 85; // Below average
    else if (jobRatio <= 1.2) jobsScore = 65;  // At average
    else if (jobRatio <= 1.6) jobsScore = 45;  // Above average
    else jobsScore = 25;                       // Saturated (e.g. 12-16 jobs)
  }

  // Blended opportunity score (60% earnings equity + 40% job allocation balance)
  const finalFairnessScore = Math.round(normalizedEarningsScore * 0.6 + jobsScore * 0.4);

  return Math.min(98, Math.max(15, finalFairnessScore));
}
