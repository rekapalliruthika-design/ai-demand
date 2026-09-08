import { Worker } from '../../types';

/**
 * Calculates Workload Balance Score (0 - 100)
 * 
 * Prevents burnout and avoids piling new tasks onto workers who already have active assignments.
 * Prioritizes equally qualified workers with lighter current queues.
 */
export function calculateWorkloadScore(worker: Worker): number {
  if (worker.availability === 'busy' || worker.availability === 'unavailable') {
    return 10;
  }

  // Active jobs evaluation
  let baseScore = 100;

  switch (worker.activeJobs) {
    case 0:
      baseScore = 100;
      break;
    case 1:
      baseScore = 80;
      break;
    case 2:
      baseScore = 55;
      break;
    case 3:
      baseScore = 30;
      break;
    default:
      baseScore = Math.max(5, 20 - (worker.activeJobs - 3) * 10);
      break;
  }

  // Bonus for high available hours
  if (worker.availableHours >= 7) {
    baseScore = Math.min(100, baseScore + 5);
  } else if (worker.availableHours <= 4) {
    baseScore = Math.max(10, baseScore - 10);
  }

  return baseScore;
}
