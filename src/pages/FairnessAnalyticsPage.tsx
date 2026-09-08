import React, { useState, useEffect } from 'react';
import { FairnessMetricStats } from '../types';
import { workAllocationService } from '../services/workAllocationService';
import { FairnessMetrics } from '../components/FairnessMetrics';
import { Scale, ShieldCheck, HeartHandshake, Award, TrendingUp, RefreshCw } from 'lucide-react';

export const FairnessAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<FairnessMetricStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await workAllocationService.getFairnessAnalytics();
      setStats(data);
    } catch (err) {
      console.error('Failed to load fairness stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Module 3
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Worker Opportunity Distribution Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Measuring systemic equity, opportunity diffusion, and earnings protection across the worker cooperative
            </p>
          </div>

          <button
            onClick={fetchStats}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Analytics</span>
          </button>
        </div>

        {/* 3 Core Cooperative Tenets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-xs mb-1">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Anti-Monopoly Allocation</span>
            </div>
            <p className="text-2xs text-slate-600">
              Unlike commercial gig algorithms where top 5% capture 70% of bookings, SahakarGig disperses opportunities across all certified workers.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-xs mb-1">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>Livelihood Floor Protection</span>
            </div>
            <p className="text-2xs text-slate-600">
              Workers who have received fewer shifts or lower recent earnings receive higher algorithmic priority when jobs match their verified trade.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anti-Discrimination Safeguard</span>
            </div>
            <p className="text-2xs text-slate-600">
              Protected characteristics (gender, religion, caste, age, ethnicity) are strictly excluded from mathematical evaluation models.
            </p>
          </div>
        </div>
      </div>

      {/* Main Analytics Content */}
      {loading || !stats ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Computing Opportunity Distribution Metrics...</p>
        </div>
      ) : (
        <FairnessMetrics stats={stats} />
      )}
    </div>
  );
};
