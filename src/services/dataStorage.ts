import { Worker, Job, DemandRecord } from '../types';
import { MOCK_DEMAND_HISTORY, COOPERATIVE_AREAS, SERVICE_CATEGORIES } from '../data/demandHistory';
import { MOCK_WORKERS } from '../data/workerData';
import { INITIAL_JOBS } from '../data/jobData';

const STORAGE_KEY_DEMAND = 'sahakargig_demand_history_v1';
const STORAGE_KEY_WORKERS = 'sahakargig_workers_v2';
const STORAGE_KEY_JOBS = 'sahakargig_jobs_v1';

class DataStorage {
  private demandHistory: DemandRecord[] = [];
  private workers: Worker[] = [];
  private jobs: Job[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    try {
      // Clear legacy storage containing hardcoded mock members
      localStorage.removeItem('sahakargig_workers_v1');

      const storedDemand = localStorage.getItem(STORAGE_KEY_DEMAND);
      if (storedDemand) {
        this.demandHistory = JSON.parse(storedDemand);
      } else {
        this.demandHistory = [...MOCK_DEMAND_HISTORY];
        this.saveDemandHistory();
      }

      const storedWorkers = localStorage.getItem(STORAGE_KEY_WORKERS);
      if (storedWorkers) {
        this.workers = JSON.parse(storedWorkers);
      } else {
        // Start empty: no preloaded fake workers/members
        this.workers = [];
        this.saveWorkers();
      }

      const storedJobs = localStorage.getItem(STORAGE_KEY_JOBS);
      if (storedJobs) {
        this.jobs = JSON.parse(storedJobs);
      } else {
        this.jobs = [...INITIAL_JOBS];
        this.saveJobs();
      }

      this.initialized = true;
    } catch (e) {
      console.warn('LocalStorage not accessible, using in-memory state', e);
      this.demandHistory = [...MOCK_DEMAND_HISTORY];
      this.workers = [];
      this.jobs = [...INITIAL_JOBS];
    }
  }

  // --- Demand Records ---
  public getDemandHistory(): DemandRecord[] {
    return [...this.demandHistory];
  }

  public saveDemandHistory(): void {
    try {
      localStorage.setItem(STORAGE_KEY_DEMAND, JSON.stringify(this.demandHistory));
    } catch (e) {
      console.error('Failed to persist demand history', e);
    }
  }

  public addDemandRecord(record: Omit<DemandRecord, 'id'>): DemandRecord {
    const newRecord: DemandRecord = {
      ...record,
      id: `rec-${Date.now()}-${this.demandHistory.length + 1}`
    };
    this.demandHistory = [newRecord, ...this.demandHistory];
    this.saveDemandHistory();
    return newRecord;
  }

  public deleteDemandRecord(id: string): void {
    this.demandHistory = this.demandHistory.filter(r => r.id !== id);
    this.saveDemandHistory();
  }

  public importDemandRecords(records: DemandRecord[]): void {
    this.demandHistory = [...records];
    this.saveDemandHistory();
  }

  public appendDemandRecords(records: DemandRecord[]): void {
    this.demandHistory = [...records, ...this.demandHistory];
    this.saveDemandHistory();
  }

  public clearDemandHistory(): void {
    this.demandHistory = [];
    this.saveDemandHistory();
  }

  public resetDemandHistoryToBaseline(): void {
    this.demandHistory = [...MOCK_DEMAND_HISTORY];
    this.saveDemandHistory();
  }

  // --- Workers ---
  public getWorkers(): Worker[] {
    return [...this.workers];
  }

  public saveWorkers(): void {
    try {
      localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(this.workers));
    } catch (e) {
      console.error('Failed to persist workers', e);
    }
  }

  public addWorker(workerData: Omit<Worker, 'id' | 'joinedDate'>): Worker {
    const newWorker: Worker = {
      ...workerData,
      id: `worker-live-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    this.workers = [newWorker, ...this.workers];
    this.saveWorkers();
    return newWorker;
  }

  public updateWorker(worker: Worker): void {
    const index = this.workers.findIndex(w => w.id === worker.id);
    if (index !== -1) {
      this.workers[index] = worker;
      this.saveWorkers();
    }
  }

  public deleteWorker(id: string): void {
    this.workers = this.workers.filter(w => w.id !== id);
    this.saveWorkers();
  }

  public importWorkers(workers: Worker[]): void {
    this.workers = [...workers];
    this.saveWorkers();
  }

  public clearWorkers(): void {
    this.workers = [];
    this.saveWorkers();
  }

  public resetWorkersToBaseline(): void {
    this.workers = [];
    this.saveWorkers();
  }

  // --- Jobs ---
  public getJobs(): Job[] {
    return [...this.jobs];
  }

  public saveJobs(): void {
    try {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(this.jobs));
    } catch (e) {
      console.error('Failed to persist jobs', e);
    }
  }

  public addJob(jobData: Omit<Job, 'id' | 'createdAt'>): Job {
    const newJob: Job = {
      ...jobData,
      id: `job-live-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.jobs = [newJob, ...this.jobs];
    this.saveJobs();
    return newJob;
  }

  public updateJob(job: Job): void {
    const index = this.jobs.findIndex(j => j.id === job.id);
    if (index !== -1) {
      this.jobs[index] = job;
      this.saveJobs();
    }
  }

  public deleteJob(id: string): void {
    this.jobs = this.jobs.filter(j => j.id !== id);
    this.saveJobs();
  }

  public resetJobsToBaseline(): void {
    this.jobs = [...INITIAL_JOBS];
    this.saveJobs();
  }

  // --- Full System Reset / Export ---
  public exportFullBackup(): string {
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        demandHistory: this.demandHistory,
        workers: this.workers,
        jobs: this.jobs
      },
      null,
      2
    );
  }

  public importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.demandHistory)) {
        this.demandHistory = data.demandHistory;
        this.saveDemandHistory();
      }
      if (Array.isArray(data.workers)) {
        this.workers = data.workers;
        this.saveWorkers();
      }
      if (Array.isArray(data.jobs)) {
        this.jobs = data.jobs;
        this.saveJobs();
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  }

  public clearAllData(): void {
    this.demandHistory = [];
    this.workers = [];
    this.jobs = [];
    this.saveDemandHistory();
    this.saveWorkers();
    this.saveJobs();
  }

  public resetAllToBaseline(): void {
    this.demandHistory = [...MOCK_DEMAND_HISTORY];
    this.workers = [...MOCK_WORKERS];
    this.jobs = [...INITIAL_JOBS];
    this.saveDemandHistory();
    this.saveWorkers();
    this.saveJobs();
  }
}

export const dataStorage = new DataStorage();
