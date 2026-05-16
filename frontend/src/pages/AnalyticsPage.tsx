import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { taskApi } from '@features/tasks/taskApi';
import type { RootState } from '@store/index';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

export function AnalyticsPage() {
  const workspaceId = useSelector((s: RootState) => s.workspace.currentWorkspace?._id);

  const { data } = useQuery({
    queryKey: ['analytics', workspaceId],
    queryFn: async () => {
      const res = await taskApi.analytics(workspaceId!);
      return res.data.data;
    },
    enabled: !!workspaceId,
  });

  const statusData = data?.statusStats?.map((s: { _id: string; count: number }) => ({ name: s._id, count: s.count })) || [];
  const trendData = data?.completionTrend?.map((t: { _id: string; count: number }) => ({ date: t._id, count: t.count })) || [];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Analytics</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 dark:bg-slate-900">
          <h3 className="mb-4 font-medium">Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border bg-white p-6 dark:bg-slate-900">
          <h3 className="mb-4 font-medium">Completion Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border bg-white p-6 dark:bg-slate-900 lg:col-span-2">
          <h3 className="mb-4 font-medium">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data?.priorityStats?.map((p: { _id: string; count: number }) => ({ name: p._id, value: p.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
