import { Worker, Job, AllocationStrategy, AllocationResult, FairnessMetricStats } from '../types';
import { MOCK_WORKERS } from '../data/workerData';
import { defaultAllocationEngine } from '../ai/workAllocation/allocationEngine';

/**
 * Service Layer for Work Allocation & Fairness Analytics
 * 
 * Future Backend Architecture:
 * Can be connected directly to:
 * POST /api/jobs/allocate
 * GET /api/workers/eligible
 * POST /api/jobs/assign
 * GET /api/workers/fairness
 */
class WorkAllocationService {
  private workers: Worker[] = [...MOCK_WORKERS];

  /**
   * Returns current worker pool
   */
  public async getWorkers(): Promise<Worker[]> {
    return [...this.workers];
  }

  /**
   * Allocates the best worker for a given job using fair balanced scoring
   */
  public async allocateWorkerForJob(
    job: Job,
    strategy: AllocationStrategy = 'balanced'
  ): Promise<AllocationResult> {
    // Micro-delay for realistic interactive feel
    await new Promise(resolve => setTimeout(resolve, 150));
    return defaultAllocationEngine.allocate(job, this.workers, strategy);
  }

  /**
   * Confirms assignment of job to worker and updates their weekly stats
   */
  public async assignJob(jobId: string, workerId: string, jobValue: number = 750): Promise<Worker> {
    const workerIndex = this.workers.findIndex(w => w.id === workerId);
    if (workerIndex === -1) {
      throw new Error(`Worker with ID ${workerId} not found`);
    }

    const currentWorker = this.workers[workerIndex];
    const updatedWorker: Worker = {
      ...currentWorker,
      weeklyJobs: currentWorker.weeklyJobs + 1,
      totalJobs: currentWorker.totalJobs + 1,
      activeJobs: currentWorker.activeJobs + 1,
      weeklyEarnings: currentWorker.weeklyEarnings + jobValue
    };

    this.workers[workerIndex] = updatedWorker;
    return updatedWorker;
  }

  /**
   * Calculates fairness distribution analytics (Before Fair Allocation vs After Fair Allocation)
   * Designed as an illustrative simulation for SIH demonstration
   */
  public async getFairnessAnalytics(): Promise<FairnessMetricStats> {
    // Top 5 plumbers comparison showcasing inequality flattening
    return {
      opportunityBalanceIndex: 82, // 82% balance index
      earningsDistributionBalance: 76, // 76% balance
      activeWorkersReceivingJobsRatio: 94, // 94% of active workers have jobs
      averageWorkerUtilization: 78, // 78% average utilization
      topEarnersSharePercentage: 34, // Down from 62% in traditional gig monopolies
      bottomEarnersSharePercentage: 24, // Up from 8%
      workerDistributionComparison: [
        {
          workerName: 'Vikram Sharma (Top Rated 4.9⭐)',
          workerId: 'worker-plumb-02',
          beforeJobs: 18,
          afterJobs: 11,
          beforeEarnings: 9200,
          afterEarnings: 6100
        },
        {
          workerName: 'Deepak Gupta (4.8⭐)',
          workerId: 'worker-plumb-05',
          beforeJobs: 14,
          afterJobs: 10,
          beforeEarnings: 7400,
          afterEarnings: 5600
        },
        {
          workerName: 'Suresh Patel (4.7⭐)',
          workerId: 'worker-plumb-03',
          beforeJobs: 8,
          afterJobs: 9,
          beforeEarnings: 4200,
          afterEarnings: 4700
        },
        {
          workerName: 'Ravi Kumar (Fair Allocation Winner 4.6⭐)',
          workerId: 'worker-plumb-01',
          beforeJobs: 4,
          afterJobs: 9,
          beforeEarnings: 2100,
          afterEarnings: 4650
        },
        {
          workerName: 'Anil Verma (4.4⭐)',
          workerId: 'worker-plumb-04',
          beforeJobs: 2,
          afterJobs: 7,
          beforeEarnings: 1100,
          afterEarnings: 3700
        }
      ]
    };
  }

  /**
   * Resets worker dataset back to initial state
   */
  public resetData(): void {
    this.workers = [...MOCK_WORKERS];
  }
}

export const workAllocationService = new WorkAllocationService();
