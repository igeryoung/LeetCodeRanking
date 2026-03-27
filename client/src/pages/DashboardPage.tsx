import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchStats } from '../api/status';
import { fetchProblems } from '../api/problems';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { RatingDistribution } from '../components/dashboard/RatingDistribution';
import type { Stats } from '../types';

export function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([
      fetchStats(),
      fetchProblems({ page: 1, limit: 1 }),
    ]).then(([s, p]) => {
      setStats(s);
      setTotal(p.total);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (isLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-screen-2xl mx-auto w-full px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {user?.display_name}'s {t.dashboard.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.dashboard.subtitle}
        </p>
      </div>
      <StatsOverview stats={stats} total={total} />
      <RatingDistribution stats={stats} />
    </div>
  );
}
