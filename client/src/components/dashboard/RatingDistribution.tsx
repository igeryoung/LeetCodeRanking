import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import type { Stats } from '../../types';

interface Props { stats: Stats; }

const BANDS = ['0-1200','1200-1400','1400-1600','1600-1800','1800-2000','2000-2200','2200-2400','2400+'];

export function RatingDistribution({ stats }: Props) {
  const dataMap: Record<string, Record<string, number>> = {};
  for (const b of BANDS) dataMap[b] = { solved: 0, attempted: 0, todo: 0 };

  for (const entry of stats.byRating) {
    if (dataMap[entry.band]) {
      dataMap[entry.band][entry.status] = entry.count;
    }
  }

  const data = BANDS.map((band) => ({ band, ...dataMap[band] }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Progress by Rating Band</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="band" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--tooltip-bg, #1e293b)', border: 'none', borderRadius: '8px', fontSize: 12 }}
            labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="solved"    name="Solved"    stackId="a" fill="#22c55e" radius={[0,0,0,0]} />
          <Bar dataKey="attempted" name="Attempted" stackId="a" fill="#f59e0b" />
          <Bar dataKey="todo"      name="Todo"      stackId="a" fill="#3b82f6" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
