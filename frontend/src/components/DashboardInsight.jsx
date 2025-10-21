import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useUser } from '../context/UserContext';

export default function DashboardInsight() {
  const { user } = useUser(); 
  const [insight, setInsight] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchInsight = async () => {
      try {
        setLoading(true);
        const res = await api.get('/insights/dashboard'); // backend route
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
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 
                    shadow-md rounded-xl p-4 transition transform hover:scale-105 hover:shadow-lg">
      <h3 className="text-gray-700 dark:text-gray-200 font-semibold mb-2 flex items-center gap-2">
        💡 Your AI Expense Insight
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
        {loading ? 'Loading...' : insight}
      </p>

      {stats && (
        <div className="space-y-2">
          {/* Daily */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium w-12">Daily</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: getBarWidth(stats.daily.total, maxTotal) }}></div>
            </div>
            <span className="text-xs font-medium w-16 text-right">₹{stats.daily.total}</span>
          </div>

          {/* Weekly */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium w-12">Weekly</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: getBarWidth(stats.weekly.total, maxTotal) }}></div>
            </div>
            <span className="text-xs font-medium w-16 text-right">₹{stats.weekly.total}</span>
          </div>

          {/* Monthly */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium w-12">Monthly</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: getBarWidth(stats.monthly.total, maxTotal) }}></div>
            </div>
            <span className="text-xs font-medium w-16 text-right">₹{stats.monthly.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
