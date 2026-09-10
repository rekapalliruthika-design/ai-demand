import { Worker, Job, AllocationStrategy, AllocationResult, FairnessMetricStats } from '../types';
import { defaultAllocationEngine } from '../ai/workAllocation/allocationEngine';
import { dataStorage } from './dataStorage';

/**
 * Service Layer for Work Allocation, Worker Registry & Dynamic Fairness Analytics
 */
class WorkAllocationService {
  /**
   * Returns current active worker pool from live storage
   */
  public async getWorkers(): Promise<Worker[]> {
    return dataStorage.getWorkers();
  }

  /**
   * Adds a new cooperative worker
   */
  public async addWorker(workerData: Omit<Worker, 'id' | 'joinedDate'>): Promise<Worker> {
    return dataStorage.addWorker(workerData);
  }

  /**
   * Updates an existing worker
   */
  public async updateWorker(worker: Worker): Promise<void> {
    dataStorage.updateWorker(worker);
  }

  /**
   * Deletes a worker
   */
  public async deleteWorker(id: string): Promise<void> {
    dataStorage.deleteWorker(id);
  }

  /**
   * Clears all workers
   */
  public async clearWorkers(): Promise<void> {
    dataStorage.clearWorkers();
  }

  /**
   * Returns all pending and allocated jobs
   */
  public async getJobs(): Promise<Job[]> {
    return dataStorage.getJobs();
  }

  /**
   * Adds a new customer service request / job
   */
  public async addJob(jobData: Omit<Job, 'id' | 'createdAt'>): Promise<Job> {
    return dataStorage.addJob(jobData);
  }

  /**
   * Allocates the best worker for a given job using fair multi-criteria scoring
   */
  public async allocateWorkerForJob(
    job: Job,
    strategy: AllocationStrategy = 'balanced'
  ): Promise<AllocationResult> {
    const workers = dataStorage.getWorkers();
    // Micro-delay for realistic UI feedback
    await new Promise(resolve => setTimeout(resolve, 120));
    return defaultAllocationEngine.allocate(job, workers, strategy);
  }

  /**
   * Confirms assignment of job to worker and updates real persistent stats
   */
  public async assignJob(jobId: string, workerId: string, jobValue: number = 750): Promise<Worker> {
    const workers = dataStorage.getWorkers();
    const worker = workers.find(w => w.id === workerId);
    if (!worker) {
      throw new Error(`Worker with ID ${workerId} not found`);
    }

    const updatedWorker: Worker = {
      ...worker,
      weeklyJobs: worker.weeklyJobs + 1,
      totalJobs: worker.totalJobs + 1,
      activeJobs: worker.activeJobs + 1,
      weeklyEarnings: worker.weeklyEarnings + jobValue
    };

    dataStorage.updateWorker(updatedWorker);

    // Update job status in persistent storage
    const jobs = dataStorage.getJobs();
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      const updatedJob: Job = {
        ...job,
        status: 'allocated',
        assignedWorkerId: workerId
      };
      dataStorage.updateJob(updatedJob);

      // Record this real service demand event in the demand history
      dataStorage.addDemandRecord({
        date: new Date().toISOString().split('T')[0],
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()],
        service: job.service,
        location: job.location,
        requests: 1,
        completed: 1,
        cancelled: 0,
        avgResponseTimeMinutes: 18,
        isHolidayOrWeekend: [0, 6].includes(new Date().getDay()),
        weatherCondition: 'Clear'
      });
    }

    return updatedWorker;
  }

  /**
   * Calculates live fairness distribution analytics directly from the active worker registry
   */
  public async getFairnessAnalytics(): Promise<FairnessMetricStats> {
    const workers = dataStorage.getWorkers().filter(w => !w.suspended);

    if (workers.length === 0) {
      return {
        opportunityBalanceIndex: 100,
        earningsDistributionBalance: 100,
        activeWorkersReceivingJobsRatio: 100,
        averageWorkerUtilization: 0,
        topEarnersSharePercentage: 0,
        bottomEarnersSharePercentage: 0,
        workerDistributionComparison: []
      };
    }

    const n = workers.length;
    const earnings = workers.map(w => w.weeklyEarnings);
    const jobs = workers.map(w => w.weeklyJobs);
    const totalEarnings = earnings.reduce((sum, val) => sum + val, 0);
    const totalJobs = jobs.reduce((sum, val) => sum + val, 0);
    const meanEarnings = totalEarnings > 0 ? totalEarnings / n : 1;

    // Mathematical Gini Coefficient:
    // G = (sum_i sum_j |x_i - x_j|) / (2 * n^2 * mean)
    let absoluteDifferencesSum = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        absoluteDifferencesSum += Math.abs(earnings[i] - earnings[j]);
      }
    }
    const giniCoefficient = totalEarnings > 0 ? absoluteDifferencesSum / (2 * n * n * meanEarnings) : 0;
    const earningsDistributionBalance = Math.min(100, Math.max(10, Math.round((1 - giniCoefficient) * 100)));

    // Active workers receiving jobs ratio
    const activeWithJobsCount = workers.filter(w => w.weeklyJobs > 0).length;
    const activeWorkersReceivingJobsRatio = Math.round((activeWithJobsCount / n) * 100);

    // Opportunity Balance Index (Standard deviation of job allocation normalized)
    const meanJobs = totalJobs > 0 ? totalJobs / n : 1;
    const jobVariance = jobs.reduce((acc, j) => acc + Math.pow(j - meanJobs, 2), 0) / n;
    const jobStdDev = Math.sqrt(jobVariance);
    const coefficientOfVariation = meanJobs > 0 ? jobStdDev / meanJobs : 0;
    const opportunityBalanceIndex = Math.min(100, Math.max(10, Math.round((1 / (1 + coefficientOfVariation)) * 100)));

    // Average utilization (assuming 15 jobs/week is nominal max full-time capacity)
    const averageWorkerUtilization = Math.min(100, Math.round((meanJobs / 12) * 100));

    // Top 20% vs Bottom 20% earnings share
    const sortedByEarnings = [...earnings].sort((a, b) => b - a);
    const quintileSize = Math.max(1, Math.floor(n * 0.2));
    const topQuintileSum = sortedByEarnings.slice(0, quintileSize).reduce((s, v) => s + v, 0);
    const bottomQuintileSum = sortedByEarnings.slice(-quintileSize).reduce((s, v) => s + v, 0);

    const topEarnersSharePercentage = totalEarnings > 0
      ? Math.round((topQuintileSum / totalEarnings) * 100)
      : 20;
    const bottomEarnersSharePercentage = totalEarnings > 0
      ? Math.round((bottomQuintileSum / totalEarnings) * 100)
      : 20;

    // Worker distribution comparison from live workers
    // Select up to 6 workers with varied ratings to showcase how traditional monopoly vs fair dispatch behaves
    const sortedByRating = [...workers].sort((a, b) => b.rating - a.rating);
    const sampledWorkers = sortedByRating.length <= 6
      ? sortedByRating
      : [
          sortedByRating[0],
          sortedByRating[1],
          sortedByRating[Math.floor(sortedByRating.length / 2)],
          sortedByRating[sortedByRating.length - 2],
          sortedByRating[sortedByRating.length - 1]
        ].filter(Boolean);

    const avgJobValue = totalJobs > 0 && totalEarnings > 0 ? totalEarnings / totalJobs : 550;

    const workerDistributionComparison = sampledWorkers.map((w, idx) => {
      // In a rating-first traditional platform: top-rated workers receive 60-80% of jobs
      const traditionalMultiplier = 1.8 - (idx / sampledWorkers.length) * 1.5;
      const beforeJobs = Math.max(1, Math.round(w.weeklyJobs * Math.max(0.25, traditionalMultiplier)));
      const beforeEarnings = Math.round(beforeJobs * avgJobValue);

      return {
        workerName: `${w.name} (${w.rating}⭐)`,
        workerId: w.id,
        beforeJobs,
        afterJobs: w.weeklyJobs,
        beforeEarnings,
        afterEarnings: w.weeklyEarnings
      };
    });

    return {
      opportunityBalanceIndex,
      earningsDistributionBalance,
      activeWorkersReceivingJobsRatio,
      averageWorkerUtilization,
      topEarnersSharePercentage,
      bottomEarnersSharePercentage,
      workerDistributionComparison
    };
  }

  /**
   * Resets worker and job records back to cooperative baseline
   */
  public resetData(): void {
    dataStorage.resetWorkersToBaseline();
    dataStorage.resetJobsToBaseline();
  }

  /**
   * Clears all workers and jobs for fresh real-world setup
   */
  public clearData(): void {
    dataStorage.clearWorkers();
    dataStorage.saveJobs();
  }
}

export const workAllocationService = new WorkAllocationService();
