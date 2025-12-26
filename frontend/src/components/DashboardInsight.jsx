import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useUser } from '../context/UserContext';

export default function DashboardInsight() {
  const { user } = useUser(); 
  const [insight, setInsight] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchInsight = async () => {
      try {
        setLoading(true);
        // Using the correct API endpoint
        const res = await api.get('/insights/dashboard');
        setInsight(res.data.insightText);
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to fetch insight:', err);
        setInsight('Unable to load insights right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [user]);

  // Helper to get percentage for bars
  const getBarWidth = (value, max) => {
    if (!max) return 'w-1/3';
    const perc = Math.min((value / max) * 100, 100);
    return `${perc}%`;
  };

  // Find max among daily/weekly/monthly totals for proportional bars
  const maxTotal = Math.max(
    stats?.daily?.total || 0,
    stats?.weekly?.total || 0,
    stats?.monthly?.total || 0,
    1
  );

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200 w-full min-h-[200px] max-h-[280px] flex flex-col gap-3 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
        <span className="text-lg">💡</span>
        <h3 className="text-xs sm:text-sm text-slate-800 font-semibold">AI Expense Insight</h3>
      </div>

      <div className="relative flex-1 min-h-[56px]">
        <div className={`text-xs sm:text-sm text-slate-600 leading-relaxed transition-all duration-200 pr-1 ${expanded ? 'max-h-[120px] overflow-y-auto' : 'max-h-[48px] overflow-hidden'}`}>
          {loading ? (
            <span className="text-slate-400 animate-pulse">Analyzing your spending...</span>
          ) : (
            insight
          )}
        </div>
        {!expanded && !loading && insight && insight.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>

      {!loading && insight && insight.length > 0 && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="self-start text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {stats && (
        <div className="space-y-2 pt-2 border-t border-slate-200">
          {/* Daily */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-medium text-slate-500 w-12 sm:w-14">Daily</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: getBarWidth(stats.daily.total, maxTotal) }}></div>
            </div>
            <span className="text-xs font-semibold text-slate-700 w-14 sm:w-16 text-right tabular-nums">₹{stats.daily.total.toLocaleString()}</span>
          </div>

          {/* Weekly */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-medium text-slate-500 w-12 sm:w-14">Weekly</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: getBarWidth(stats.weekly.total, maxTotal) }}></div>
            </div>
            <span className="text-xs font-semibold text-slate-700 w-14 sm:w-16 text-right tabular-nums">₹{stats.weekly.total.toLocaleString()}</span>
          </div>

          {/* Monthly */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-medium text-slate-500 w-12 sm:w-14">Monthly</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-violet-500 h-2 rounded-full transition-all duration-300" style={{ width: getBarWidth(stats.monthly.total, maxTotal) }}></div>
            </div>
            <span className="text-xs font-semibold text-slate-700 w-16 text-right tabular-nums">₹{stats.monthly.total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
