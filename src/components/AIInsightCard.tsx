import React from 'react';
import { AIInsight } from '../types';
import { TrendingUp, Users, Scale, MapPin, Sparkles, Lightbulb } from 'lucide-react';

interface AIInsightCardProps {
  insights: AIInsight[];
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ insights }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'Users':
        return <Users className="w-4 h-4 text-sky-600" />;
      case 'Scale':
        return <Scale className="w-4 h-4 text-emerald-700" />;
      case 'MapPin':
        return <MapPin className="w-4 h-4 text-indigo-600" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      default:
        return <Lightbulb className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-base">
              Cooperative AI Intelligence & Insights
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic pattern synthesis across historical demand logs and live worker telemetry
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
          Autonomous Telemetry
        </span>
      </div>

      {/* Grid of Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {insights.map(item => (
          <div
            key={item.id}
            className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded bg-white shadow-2xs border border-slate-200">
                    {getIcon(item.iconName)}
                  </div>
                  <span className="font-semibold text-slate-900 text-xs">{item.title}</span>
                </div>
                {item.badge && (
                  <span className="text-2xs px-2 py-0.5 rounded-full font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs whitespace-nowrap">
                    {item.badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {item.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-2xs text-slate-500">
              <span>{item.timestamp}</span>
              {item.metric && (
                <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {item.metric}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
