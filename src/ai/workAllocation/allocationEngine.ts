import { Worker, Job, AllocationStrategy, AllocationWeights, AllocationCandidate, AllocationResult, ScoreComponentBreakdown } from '../../types';
import { calculateHaversineDistance, calculateDistanceScore } from './distanceCalculator';
import { calculateWorkloadScore } from './workloadScore';
import { calculateFairnessScore, computeCohortStats, CohortOpportunityStats } from './fairnessScore';

/**
 * Centrally configured allocation weights across different cooperative strategies
 */
export const ALLOCATION_WEIGHTS: Record<AllocationStrategy, AllocationWeights> = {
  balanced: {
    skillMatch: 0.30,
    availability: 0.15,
    locationProximity: 0.15,
    fairnessScore: 0.20,
    workloadBalance: 0.10,
    rating: 0.10
  },
  fairness_priority: {
    skillMatch: 0.25,
    availability: 0.15,
    locationProximity: 0.10,
    fairnessScore: 0.35,
    workloadBalance: 0.10,
    rating: 0.05
  },
  location_priority: {
    skillMatch: 0.25,
    availability: 0.15,
    locationProximity: 0.35,
    fairnessScore: 0.15,
    workloadBalance: 0.05,
    rating: 0.05
  },
  skill_priority: {
    skillMatch: 0.45,
    availability: 0.10,
    locationProximity: 0.10,
    fairnessScore: 0.15,
    workloadBalance: 0.10,
    rating: 0.10
  }
};

/**
 * Filter criteria results for transparency
 */
export interface EligibilityFilterResult {
  eligible: Worker[];
  filteredOut: { worker: Worker; reason: string }[];
}

export class AllocationEngine {
  /**
   * Filter workers before scoring.
   * Workers must:
   * 1. Have required skill match
   * 2. Be verified
   * 3. Not be suspended
   * 4. Not be unavailable
   * 5. Not exceed max active workload (max 3 active jobs)
   */
  public filterEligibleWorkers(job: Job, allWorkers: Worker[]): EligibilityFilterResult {
    const eligible: Worker[] = [];
    const filteredOut: { worker: Worker; reason: string }[] = [];

    for (const worker of allWorkers) {
      if (worker.suspended) {
        filteredOut.push({ worker, reason: 'Worker account suspended' });
        continue;
      }
      if (!worker.verified) {
        filteredOut.push({ worker, reason: 'Cooperative verification pending' });
        continue;
      }
      if (worker.availability === 'unavailable') {
        filteredOut.push({ worker, reason: 'Worker marked unavailable' });
        continue;
      }
      if (worker.activeJobs >= 4) {
        filteredOut.push({ worker, reason: `Workload saturated (${worker.activeJobs} active jobs)` });
        continue;
      }

      // Skill check: worker must have the primary service skill
      const requiredSkillLower = job.service.toLowerCase();
      const hasSkill = worker.skills.some(s =>
        s.toLowerCase().includes(requiredSkillLower) ||
        requiredSkillLower.includes(s.toLowerCase())
      );

      if (!hasSkill) {
        filteredOut.push({ worker, reason: `Does not possess required ${job.service} skill` });
        continue;
      }

      eligible.push(worker);
    }

    return { eligible, filteredOut };
  }

  /**
   * Runs the complete Fair Work Allocation algorithm
   */
  public allocate(
    job: Job,
    workers: Worker[],
    strategy: AllocationStrategy = 'balanced'
  ): AllocationResult {
    const weights = ALLOCATION_WEIGHTS[strategy] || ALLOCATION_WEIGHTS.balanced;

    // 1. Filter eligible candidates
    const { eligible, filteredOut } = this.filterEligibleWorkers(job, workers);

    if (eligible.length === 0) {
      return {
        jobId: job.id,
        job,
        recommendedWorker: null,
        candidates: [],
        strategyUsed: strategy,
        weightsUsed: weights,
        timestamp: new Date().toISOString(),
        cooperativeContext: {
          totalEligibleWorkers: 0,
          totalFilteredWorkers: filteredOut.length,
          averageWeeklyEarnings: 0,
          averageWeeklyJobs: 0
        }
      };
    }

    // 2. Compute statistical cohort benchmarks
    const cohortStats = computeCohortStats(eligible);

    // 3. Score every eligible candidate
    const scoredCandidates: AllocationCandidate[] = eligible.map(worker => {
      return this.scoreWorker(worker, job, weights, cohortStats);
    });

    // 4. Rank candidates by totalScore descending
    scoredCandidates.sort((a, b) => b.totalScore - a.totalScore);

    // Mark top recommendation
    if (scoredCandidates.length > 0) {
      scoredCandidates[0].isTopRecommendation = true;
    }

    return {
      jobId: job.id,
      job,
      recommendedWorker: scoredCandidates[0] || null,
      candidates: scoredCandidates,
      strategyUsed: strategy,
      weightsUsed: weights,
      timestamp: new Date().toISOString(),
      cooperativeContext: {
        totalEligibleWorkers: eligible.length,
        totalFilteredWorkers: filteredOut.length,
        averageWeeklyEarnings: cohortStats.meanWeeklyEarnings,
        averageWeeklyJobs: cohortStats.meanWeeklyJobs
      }
    };
  }

  /**
   * Transparent scoring of an individual eligible worker
   */
  private scoreWorker(
    worker: Worker,
    job: Job,
    weights: AllocationWeights,
    cohortStats: CohortOpportunityStats
  ): AllocationCandidate {
    // 1. Skill Score (0-100)
    const requiredSkillLower = job.service.toLowerCase();
    const hasExactSkill = worker.skills.some(s => s.toLowerCase() === requiredSkillLower);
    let skillRaw = hasExactSkill ? 95 : 85;
    // Certification boost
    if (worker.certifications.length > 0) {
      skillRaw = Math.min(100, skillRaw + 5);
    }

    // 2. Availability Score (0-100)
    let availabilityRaw = 100;
    if (worker.availability === 'busy') {
      availabilityRaw = 60;
    }
    if (worker.availableHours < 5) {
      availabilityRaw -= 15;
    }

    // 3. Location Proximity Score (0-100) & Haversine Distance
    const distanceKm = calculateHaversineDistance(
      job.latitude,
      job.longitude,
      worker.latitude,
      worker.longitude
    );
    const locationRaw = calculateDistanceScore(distanceKm);

    // 4. Fairness / Opportunity Score (0-100)
    const fairnessRaw = calculateFairnessScore(worker, cohortStats);

    // 5. Workload Balance Score (0-100)
    const workloadRaw = calculateWorkloadScore(worker);

    // 6. Rating Score (0-100)
    const ratingRaw = Math.min(100, Math.round((worker.rating / 5.0) * 100));

    // Weighted Component Breakdowns
    const makeBreakdown = (raw: number, weight: number): ScoreComponentBreakdown => ({
      raw,
      weight,
      weightedScore: Math.round(raw * weight * 10) / 10,
      maxPoints: Math.round(weight * 100)
    });

    const skillScore = makeBreakdown(skillRaw, weights.skillMatch);
    const availabilityScore = makeBreakdown(availabilityRaw, weights.availability);
    const locationScore = makeBreakdown(locationRaw, weights.locationProximity);
    const fairnessScore = makeBreakdown(fairnessRaw, weights.fairnessScore);
    const workloadScore = makeBreakdown(workloadRaw, weights.workloadBalance);
    const ratingScore = makeBreakdown(ratingRaw, weights.rating);

    // Final blended total score
    const totalScore = Math.round(
      skillScore.weightedScore +
      availabilityScore.weightedScore +
      locationScore.weightedScore +
      fairnessScore.weightedScore +
      workloadScore.weightedScore +
      ratingScore.weightedScore
    );

    // Generate explainability statements
    const explanation = this.generateWorkerExplanation(
      worker,
      job,
      distanceKm,
      cohortStats,
      fairnessRaw,
      workloadRaw
    );

    return {
      worker,
      totalScore,
      distanceKm,
      skillScore,
      availabilityScore,
      locationScore,
      fairnessScore,
      workloadScore,
      ratingScore,
      explanation,
      isTopRecommendation: false
    };
  }

  /**
   * Generates human-readable, transparent justification for why this candidate was scored/selected
   */
  private generateWorkerExplanation(
    worker: Worker,
    job: Job,
    distanceKm: number,
    cohortStats: CohortOpportunityStats,
    fairnessScore: number,
    workloadScore: number
  ): string[] {
    const reasons: string[] = [];

    // Skill justification
    const matchingCert = worker.certifications[0] || 'Verified cooperative technician';
    reasons.push(`Required ${job.service} skill verified (${matchingCert})`);

    // Availability
    if (worker.availability === 'available') {
      reasons.push(`Available for immediate dispatch (${worker.availableHours}h shift capacity)`);
    } else {
      reasons.push(`Shift capacity available within acceptable window`);
    }

    // Proximity
    reasons.push(`Proximity: Only ${distanceKm} km from customer location in ${job.location}`);

    // Workload
    if (worker.activeJobs <= 1) {
      reasons.push(`Low current workload (${worker.activeJobs} active job queue — fast turnaround)`);
    } else {
      reasons.push(`Current workload: ${worker.activeJobs} active jobs`);
    }

    // Fairness & Opportunity (The Key Innovation)
    if (worker.weeklyEarnings < cohortStats.meanWeeklyEarnings) {
      reasons.push(
        `Lower recent earnings (₹${worker.weeklyEarnings.toLocaleString('en-IN')} vs cooperative avg ₹${cohortStats.meanWeeklyEarnings.toLocaleString('en-IN')}) — promotes equitable livelihood`
      );
    } else {
      reasons.push(
        `Weekly earnings: ₹${worker.weeklyEarnings.toLocaleString('en-IN')} (${worker.weeklyJobs} jobs assigned this week)`
      );
    }

    if (worker.weeklyJobs <= Math.round(cohortStats.meanWeeklyJobs)) {
      reasons.push(`Has received fewer jobs this week (${worker.weeklyJobs} jobs vs cooperative avg ${cohortStats.meanWeeklyJobs})`);
    }

    // Rating
    reasons.push(`High service quality: ${worker.rating} ⭐ rating with ${worker.reviewCount} verified cooperative reviews`);

    return reasons;
  }
}

export const defaultAllocationEngine = new AllocationEngine();
