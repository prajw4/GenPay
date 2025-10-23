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
  <div className="bg-white rounded p-6 shadow w-full min-h-[200px] max-h-[260px] flex flex-col gap-1 transition-shadow duration-200 hover:shadow-lg">
      <h3 className="text-gray-700 font-semibold flex items-center gap-2">
        💡 Your AI Expense Insight
      </h3>
      <div className="relative flex-1 min-h-[72px]">
        <div className={`text-gray-600 text-sm transition-all duration-200 pr-1 ${expanded ? 'max-h-[140px] overflow-y-auto' : 'max-h-[60px] overflow-hidden'}`}>
          {loading ? 'Loading...' : insight}
        </div>
        {!expanded && !loading && insight && insight.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
      {!loading && insight && insight.length > 0 && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="self-start text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {stats && (
        <div className="space-y-0.5">
          {/* Daily */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium w-12">Daily</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: getBarWidth(stats.daily.total, maxTotal) }}></div>
            </div>
            <span className="text-xs font-medium w-16 text-right">₹{stats.daily.total}</span>
          </div>

          {/* Weekly */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium w-12">Weekly</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: getBarWidth(stats.weekly.total, maxTotal) }}></div>
            </div>
            <span className="text-xs font-medium w-16 text-right">₹{stats.weekly.total}</span>
          </div>

          {/* Monthly */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium w-12">Monthly</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: getBarWidth(stats.monthly.total, maxTotal) }}></div>
            </div>
            <span className="text-xs font-medium w-16 text-right">₹{stats.monthly.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
