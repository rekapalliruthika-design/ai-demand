/**
 * Workforce Planning & Operations Layer for SahakarGig
 * 
 * Computes Demand Risk Radar, Workforce Readiness, What-If Scenarios,
 * Operational Recommendations, and Inter-Zone Workforce Rebalancing Opportunities.
 * Grounded strictly in real worker capacity and deterministic calculations.
 */

import {
  Worker,
  StatisticalForecastResult,
  DemandRiskRadarItem,
  WorkforceReadinessItem,
  WhatIfScenarioConfig,
  WhatIfScenarioResult,
  OperationalRecommendationItem,
  WorkforceRebalancingOpportunity,
  DemandRiskLevel,
  WorkforceReadinessStatus
} from '../types';
import { COOPERATIVE_AREAS } from '../data/demandHistory';

export class WorkforcePlanningService {
  /**
   * Computes Demand Risk Radar across services and cooperative locations
   */
  public calculateDemandRiskRadar(
    forecasts: StatisticalForecastResult[],
    workers: Worker[]
  ): DemandRiskRadarItem[] {
    const items: DemandRiskRadarItem[] = [];

    forecasts.forEach(f => {
      if (f.isInsufficientData) return;

      const areaKey = f.location.split(' - ')[0].toLowerCase();
      // Count available matching workers
      const matchingWorkers = workers.filter(w => {
        const matchArea = w.serviceArea.toLowerCase().includes(areaKey);
        const matchSkill = w.skills.some(s => s.toLowerCase().includes(f.service.toLowerCase()));
        const isAvail = w.availability !== 'unavailable' && !w.suspended;
        return matchArea && matchSkill && isAvail;
      });

      const availableCapacity = matchingWorkers.length;
      const horizonFactor = (f.horizonDays || 7) / 7;
      // Baseline worker productivity: ~5.2 completed jobs per week
      const workersRequired = Math.max(1, Math.ceil(f.expectedDemand / (5.2 * horizonFactor)));
      const capacityGap = availableCapacity - workersRequired; // negative = deficit

      let riskLevel: DemandRiskLevel = 'Low';
      let riskNotes = `Sufficient workforce (${availableCapacity} available for ${f.expectedDemand} jobs).`;

      if (capacityGap <= -2 || (availableCapacity === 0 && f.expectedDemand > 4)) {
        riskLevel = 'Critical';
        riskNotes = `Severe deficit: ${Math.abs(capacityGap)} workers missing. Demand exceeds capacity by ${Math.round((workersRequired / Math.max(1, availableCapacity)) * 100)}%. High SLA breach risk.`;
      } else if (capacityGap === -1 || (availableCapacity > 0 && workersRequired > availableCapacity)) {
        riskLevel = 'High';
        riskNotes = `Projected deficit of 1 worker. Standby cooperative workers should be alerted.`;
      } else if (workersRequired >= availableCapacity * 0.85) {
        riskLevel = 'Moderate';
        riskNotes = `Tight capacity: ${availableCapacity} workers operating near 90%+ utilization threshold.`;
      }

      items.push({
        id: `risk-${f.service}-${f.location}`,
        service: f.service,
        location: f.location,
        forecastedDemand: f.expectedDemand,
        expectedJobs: f.expectedDemand,
        availableWorkerCapacity: availableCapacity,
        workersRequired,
        capacityGap,
        riskLevel,
        riskFactorNotes: riskNotes
      });
    });

    // Sort by risk severity: Critical -> High -> Moderate -> Low
    const rankWeight: Record<DemandRiskLevel, number> = { Critical: 4, High: 3, Moderate: 2, Low: 1 };
    return items.sort((a, b) => {
      if (rankWeight[b.riskLevel] !== rankWeight[a.riskLevel]) {
        return rankWeight[b.riskLevel] - rankWeight[a.riskLevel];
      }
      return a.capacityGap - b.capacityGap;
    });
  }

  /**
   * Computes Workforce Readiness: Expected Demand vs Available Capacity
   */
  public calculateWorkforceReadiness(
    riskRadar: DemandRiskRadarItem[]
  ): WorkforceReadinessItem[] {
    return riskRadar.map(r => {
      const capacityPercentage = r.workersRequired > 0
        ? Math.round((r.availableWorkerCapacity / r.workersRequired) * 100)
        : 100;

      let readinessStatus: WorkforceReadinessStatus = 'Ready';
      let actionSuggestion = 'Capacity is well-balanced. Routine fair allocation active.';

      if (capacityPercentage < 65 || r.capacityGap <= -2) {
        readinessStatus = 'Critical Shortage';
        actionSuggestion = `Mobilize ${Math.abs(r.capacityGap)} standby cooperative workers or request adjacent zone rebalancing immediately.`;
      } else if (capacityPercentage < 95 || r.capacityGap < 0) {
        readinessStatus = 'Shortage';
        actionSuggestion = `Activate 1 cooperative worker from flex-shift pool to safeguard 30-min response times.`;
      } else if (capacityPercentage <= 115) {
        readinessStatus = 'Prepare';
        actionSuggestion = `Workforce operating near capacity. Monitor incoming bookings during evening peak windows.`;
      } else {
        readinessStatus = 'Ready';
        actionSuggestion = `Surplus of ${r.capacityGap} workers available to take overflow requests from adjacent cooperative zones.`;
      }

      return {
        id: `ready-${r.id}`,
        service: r.service,
        location: r.location,
        expectedJobs: r.expectedJobs,
        requiredWorkers: r.workersRequired,
        availableWorkers: r.availableWorkerCapacity,
        capacityPercentage,
        shortage: r.capacityGap < 0 ? Math.abs(r.capacityGap) : 0,
        surplus: r.capacityGap > 0 ? r.capacityGap : 0,
        readinessStatus,
        actionSuggestion
      };
    });
  }

  /**
   * What-If Scenario Simulator
   * Pure planning simulation: does NOT modify real bookings or workers
   */
  public simulateScenario(
    config: WhatIfScenarioConfig,
    baseRisks: DemandRiskRadarItem[]
  ): WhatIfScenarioResult {
    const factor = 1 + (config.percentageChange / 100);

    const relevant = baseRisks.filter(r => {
      const matchSrv = !config.serviceFilter || config.serviceFilter === 'All' || r.service === config.serviceFilter;
      const matchLoc = !config.locationFilter || config.locationFilter === 'All' || r.location === config.locationFilter;
      return matchSrv && matchLoc;
    });

    let totalOriginal = 0;
    let totalAdjusted = 0;
    let totalOriginalWorkers = 0;
    let totalAdjustedWorkers = 0;
    let totalAvailable = 0;

    const areaBreakdown = relevant.map(r => {
      const originalJobs = r.expectedJobs;
      const adjustedJobs = Math.max(0, Math.round(originalJobs * factor));
      const requiredWorkers = Math.max(1, Math.ceil(adjustedJobs / 5.2));
      const availableWorkers = r.availableWorkerCapacity;
      const gap = availableWorkers - requiredWorkers;

      let risk: DemandRiskLevel = 'Low';
      if (gap <= -2) risk = 'Critical';
      else if (gap === -1) risk = 'High';
      else if (requiredWorkers >= availableWorkers * 0.9) risk = 'Moderate';

      totalOriginal += originalJobs;
      totalAdjusted += adjustedJobs;
      totalOriginalWorkers += r.workersRequired;
      totalAdjustedWorkers += requiredWorkers;
      totalAvailable += availableWorkers;

      return {
        service: r.service,
        location: r.location,
        originalJobs,
        adjustedJobs,
        requiredWorkers,
        availableWorkers,
        gap,
        risk
      };
    });

    const workforceGap = totalAvailable - totalAdjustedWorkers;
    const capacityPercentage = totalAdjustedWorkers > 0
      ? Math.round((totalAvailable / totalAdjustedWorkers) * 100)
      : 100;

    let riskLevel: DemandRiskLevel = 'Low';
    if (workforceGap <= -3 || capacityPercentage < 70) riskLevel = 'Critical';
    else if (workforceGap < 0 || capacityPercentage < 90) riskLevel = 'High';
    else if (capacityPercentage <= 110) riskLevel = 'Moderate';

    let recommendedAction = 'Workforce remains balanced under this hypothetical demand scenario.';
    if (config.percentageChange > 0) {
      if (workforceGap < 0) {
        recommendedAction = `A ${config.percentageChange}% demand surge creates a projected cooperative deficit of ${Math.abs(workforceGap)} workers. Recommend pre-authorizing overtime shifts and standby roster activations.`;
      } else {
        recommendedAction = `Current cooperative capacity can absorb a +${config.percentageChange}% surge with ${workforceGap} workers still in surplus.`;
      }
    } else if (config.percentageChange < 0) {
      recommendedAction = `A ${config.percentageChange}% drop leaves a surplus of ${workforceGap} workers. Recommend scheduling trade upskilling sessions or cross-zone equipment maintenance.`;
    }

    return {
      scenarioPercentage: config.percentageChange,
      originalDemand: totalOriginal,
      scenarioDemand: totalAdjusted,
      baselineWorkersRequired: totalOriginalWorkers,
      scenarioWorkersRequired: totalAdjustedWorkers,
      availableCapacity: totalAvailable,
      workforceGap,
      capacityPercentage,
      riskLevel,
      recommendedAction,
      areaBreakdown
    };
  }

  /**
   * Generates actionable operational recommendations grounded strictly in computed metrics
   */
  public generateOperationalRecommendations(
    risks: DemandRiskRadarItem[],
    readiness: WorkforceReadinessItem[]
  ): OperationalRecommendationItem[] {
    const recs: OperationalRecommendationItem[] = [];

    // 1. Critical Deficit Recommendations
    const criticalShortages = readiness.filter(r => r.readinessStatus === 'Critical Shortage');
    criticalShortages.slice(0, 3).forEach((r, idx) => {
      recs.push({
        id: `rec-crit-${idx}`,
        type: 'shortage',
        title: `Urgent Worker Deficit: ${r.service} in ${r.location.split(' - ')[0]}`,
        description: `Projected demand of ${r.expectedJobs} jobs exceeds active capacity (${r.availableWorkers} available, ${r.requiredWorkers} required). Dispatch delay risk is critical.`,
        impact: 'High',
        service: r.service,
        location: r.location,
        actionLabel: `Mobilize ${r.shortage} Standby Workers`,
        expectedJobs: r.expectedJobs,
        availableCapacity: r.availableWorkers,
        capacityGap: -r.shortage
      });
    });

    // 2. High Shortages
    const highShortages = readiness.filter(r => r.readinessStatus === 'Shortage');
    highShortages.slice(0, 2).forEach((r, idx) => {
      recs.push({
        id: `rec-high-${idx}`,
        type: 'shortage',
        title: `Workforce Augmentation: ${r.service} in ${r.location.split(' - ')[0]}`,
        description: `Cooperative capacity is currently 1 worker short for anticipated request volume (${r.expectedJobs} requests). Preemptively notify flex-shift workers.`,
        impact: 'Medium',
        service: r.service,
        location: r.location,
        actionLabel: 'Alert 1 Flex Worker',
        expectedJobs: r.expectedJobs,
        availableCapacity: r.availableWorkers,
        capacityGap: -r.shortage
      });
    });

    // 3. Surplus / Rebalance Opportunities
    const surpluses = readiness.filter(r => r.surplus >= 2);
    surpluses.slice(0, 2).forEach((r, idx) => {
      recs.push({
        id: `rec-surplus-${idx}`,
        type: 'surplus',
        title: `Available Worker Capacity: ${r.service} in ${r.location.split(' - ')[0]}`,
        description: `Surplus of ${r.surplus} certified workers available. Capacity can be leveraged to take overflow dispatch from adjacent zones.`,
        impact: 'Low',
        service: r.service,
        location: r.location,
        actionLabel: 'Enable Overflow Dispatch',
        expectedJobs: r.expectedJobs,
        availableCapacity: r.availableWorkers,
        capacityGap: r.surplus
      });
    });

    // 4. Stable balance confirmation
    if (recs.length === 0) {
      const topRisk = risks[0];
      if (topRisk) {
        recs.push({
          id: 'rec-stable-01',
          type: 'sla',
          title: `Capacity Balanced: ${topRisk.service} in ${topRisk.location.split(' - ')[0]}`,
          description: `Workforce readiness is optimal at ${topRisk.availableWorkerCapacity} workers for ${topRisk.expectedJobs} expected requests. Fair allocation rules maintaining equitable dispatch.`,
          impact: 'Low',
          service: topRisk.service,
          location: topRisk.location,
          actionLabel: 'Maintain Balanced Strategy',
          expectedJobs: topRisk.expectedJobs,
          availableCapacity: topRisk.availableWorkerCapacity,
          capacityGap: topRisk.capacityGap
        });
      }
    }

    return recs;
  }

  /**
   * Identifies Workforce Rebalancing Opportunities across neighboring cooperative zones
   * Respects trade skills, active workloads, ratings, and physical transit distances
   */
  public calculateRebalancingOpportunities(
    workers: Worker[],
    readiness: WorkforceReadinessItem[]
  ): WorkforceRebalancingOpportunity[] {
    const opps: WorkforceRebalancingOpportunity[] = [];

    // Group readiness items by service
    const serviceGroups = new Map<string, { shortages: WorkforceReadinessItem[]; surpluses: WorkforceReadinessItem[] }>();

    readiness.forEach(item => {
      if (!serviceGroups.has(item.service)) {
        serviceGroups.set(item.service, { shortages: [], surpluses: [] });
      }
      const group = serviceGroups.get(item.service)!;
      if (item.shortage > 0) group.shortages.push(item);
      if (item.surplus > 0) group.surpluses.push(item);
    });

    serviceGroups.forEach((group, service) => {
      group.shortages.forEach(shortageItem => {
        group.surpluses.forEach(surplusItem => {
          if (shortageItem.location === surplusItem.location) return;

          // Find coordinates of both hubs
          const sourceHub = COOPERATIVE_AREAS.find(a => a.name === surplusItem.location);
          const targetHub = COOPERATIVE_AREAS.find(a => a.name === shortageItem.location);

          let distanceKm = 4.5;
          if (sourceHub && targetHub) {
            // Haversine formula
            const R = 6371;
            const dLat = (targetHub.lat - sourceHub.lat) * (Math.PI / 180);
            const dLon = (targetHub.lng - sourceHub.lng) * (Math.PI / 180);
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(sourceHub.lat * (Math.PI / 180)) *
              Math.cos(targetHub.lat * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            distanceKm = Math.round(R * c * 10) / 10;
          }

          // Feasible transit threshold: within 12 km
          if (distanceKm > 12) return;

          const sourceShort = surplusItem.location.split(' - ')[0].toLowerCase();
          // Find eligible workers in source hub with matching skill and low active workload
          const eligible = workers
            .filter(w => {
              const matchArea = w.serviceArea.toLowerCase().includes(sourceShort);
              const matchSkill = w.skills.some(s => s.toLowerCase().includes(service.toLowerCase()));
              const isAvailable = w.availability === 'available' && !w.suspended;
              return matchArea && matchSkill && isAvailable;
            })
            .sort((a, b) => a.weeklyJobs - b.weeklyJobs) // prioritize workers with fewer jobs (fairness)
            .map(w => ({
              id: w.id,
              name: w.name,
              rating: w.rating,
              activeJobs: w.activeJobs,
              weeklyJobs: w.weeklyJobs,
              serviceArea: w.serviceArea
            }));

          if (eligible.length === 0) return;

          const recommendedTransfer = Math.min(surplusItem.surplus, shortageItem.shortage, eligible.length);
          if (recommendedTransfer <= 0) return;

          opps.push({
            id: `rebal-${service}-${surplusItem.location.substring(0, 6)}-${shortageItem.location.substring(0, 6)}`,
            service,
            sourceArea: surplusItem.location,
            targetArea: shortageItem.location,
            surplusCount: surplusItem.surplus,
            shortageCount: shortageItem.shortage,
            recommendedTransferCount: recommendedTransfer,
            distanceKm,
            eligibleWorkers: eligible.slice(0, recommendedTransfer),
            reasoning: `${surplusItem.location.split(' - ')[0]} has a surplus of ${surplusItem.surplus} ${service.toLowerCase()} workers, while ${shortageItem.location.split(' - ')[0]} faces a deficit of ${shortageItem.shortage} workers (~${distanceKm} km transit). Voluntary temporary rebalancing optimizes worker earnings and meets consumer SLAs.`
          });
        });
      });
    });

    return opps.slice(0, 4);
  }
}

export const defaultWorkforcePlanningService = new WorkforcePlanningService();
