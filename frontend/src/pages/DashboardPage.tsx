import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  format, isPast, isToday, isTomorrow, parseISO,
} from 'date-fns';
import {
  ArrowRight, BarChart3, Calendar, CheckCircle2, Clock, Kanban,
  Plus, Sparkles, Target, TrendingUp, Users, AlertCircle, Zap,
} from 'lucide-react';
import type { RootState } from '@store/index';
import type { Task, TaskStatus } from '@app-types/index';
import { taskApi } from '@features/tasks/taskApi';
import { TaskModal } from '@features/tasks/TaskModal';
import { Button } from '@components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/Card';
import { cn } from '@lib/utils';

const STATUS_META: Record<TaskStatus, { label: string; color: string; bar: string }> = {
  todo: { label: 'To Do', color: 'text-slate-600', bar: 'bg-slate-400' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bar: 'bg-blue-500' },
  review: { label: 'In Review', color: 'text-amber-600', bar: 'bg-amber-500' },
  done: { label: 'Done', color: 'text-emerald-600', bar: 'bg-emerald-500' },
};

const PRIORITY_STYLES = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDueLabel(dueDate: string) {
  const d = parseISO(dueDate);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isPast(d)) return 'Overdue';
  return format(d, 'MMM d');
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  icon: typeof CheckCircle2;
  accent: string;
  iconBg: string;
  delay?: number;
}

function StatCard({ label, value, sub, trend, icon: Icon, accent, iconBg, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card hover className="relative overflow-hidden">
        <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', accent)} />
        <CardContent className="pt-7">
          <motion.div className="flex items-start justify-between">
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', iconBg)}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            {trend && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </span>
            )}
          </motion.div>
          <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
          <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DashboardPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const workspace = useSelector((s: RootState) => s.workspace.currentWorkspace);
  const workspaceId = workspace?._id;
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', workspaceId],
    queryFn: async () => {
      const { data } = await taskApi.list(workspaceId!, { limit: '200' });
      return data.data.tasks as Task[];
    },
    enabled: !!workspaceId,
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics', workspaceId],
    queryFn: async () => {
      const res = await taskApi.analytics(workspaceId!);
      return res.data.data as {
        statusStats: { _id: string; count: number }[];
        priorityStats: { _id: string; count: number }[];
        completionTrend: { _id: string; count: number }[];
      };
    },
    enabled: !!workspaceId,
  });

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress' || t.status === 'review').length;
    const overdue = tasks.filter((t) => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'done').length;
    const completionRate = total ? Math.round((done / total) * 100) : 0;
    const memberCount = workspace?.members?.length ?? 1;
    return { total, done, inProgress, overdue, completionRate, memberCount };
  }, [tasks, workspace]);

  const statusChart = useMemo(() => {
    const map = new Map(analytics?.statusStats?.map((s) => [s._id, s.count]) ?? []);
    return (['todo', 'in_progress', 'review', 'done'] as TaskStatus[]).map((id) => ({
      id,
      label: STATUS_META[id].label,
      count: map.get(id) ?? tasks.filter((t) => t.status === id).length,
    }));
  }, [analytics, tasks]);

  const trendData = useMemo(() => {
    const raw = analytics?.completionTrend ?? [];
    if (raw.length) {
      return raw.slice(-14).map((t) => ({ date: format(parseISO(t._id), 'MMM d'), count: t.count }));
    }
    return Array.from({ length: 7 }, (_, i) => ({
      date: format(new Date(Date.now() - (6 - i) * 86400000), 'MMM d'),
      count: 0,
    }));
  }, [analytics]);

  const upcoming = useMemo(
    () =>
      tasks
        .filter((t) => t.dueDate && t.status !== 'done')
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 5),
    [tasks],
  );

  const recentTasks = useMemo(() => [...tasks].slice(0, 6), [tasks]);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  if (!workspaceId) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CardContent className="py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/40">
            <Target className="h-7 w-7 text-primary-600" />
          </div>
          <h2 className="mt-6 text-xl font-bold">Select a workspace</h2>
          <p className="mt-2 text-sm text-slate-500">
            Choose a workspace from the header or create one to see your dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-slate-500">
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              {workspace?.name}
            </span>
            <span>·</span>
            <span>{stats.total} tasks tracked</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setTaskModalOpen(true)}>
            <Plus className="h-4 w-4" /> New task
          </Button>
          <Link to="/board">
            <Button variant="secondary">
              <Kanban className="h-4 w-4" /> Board
            </Button>
          </Link>
          <Link to="/analytics">
            <Button variant="ghost">
              <BarChart3 className="h-4 w-4" /> Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <motion.div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tasks completed"
          value={stats.done}
          sub={`${stats.completionRate}% of all tasks`}
          trend={stats.completionRate > 0 ? `+${stats.completionRate}%` : undefined}
          icon={CheckCircle2}
          accent="from-emerald-400 to-teal-500"
          iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
          delay={0}
        />
        <StatCard
          label="In progress"
          value={stats.inProgress}
          sub="Active & in review"
          icon={Clock}
          accent="from-blue-400 to-indigo-500"
          iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
          delay={0.05}
        />
        <StatCard
          label="Team members"
          value={stats.memberCount}
          sub="In this workspace"
          icon={Users}
          accent="from-violet-400 to-purple-500"
          iconBg="bg-gradient-to-br from-violet-500 to-purple-600"
          delay={0.1}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          sub={stats.overdue ? 'Needs attention' : 'All on track'}
          icon={stats.overdue ? AlertCircle : Zap}
          accent={stats.overdue ? 'from-rose-400 to-red-500' : 'from-amber-400 to-orange-500'}
          iconBg={stats.overdue ? 'bg-gradient-to-br from-rose-500 to-red-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}
          delay={0.15}
        />
      </motion.div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Completion trend */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Completion velocity</CardTitle>
                <CardDescription>Tasks marked done over time</CardDescription>
              </div>
              <Link to="/analytics" className="text-xs font-medium text-primary-600 hover:underline">
                View details
              </Link>
            </CardHeader>
            <CardContent className="h-64 pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="fillDone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#fillDone)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pipeline */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Task pipeline</CardTitle>
                <CardDescription>Distribution across workflow stages</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {statusChart.map((row) => {
                const pct = stats.total ? Math.round((row.count / stats.total) * 100) : 0;
                return (
                  <div key={row.id}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className={cn('font-medium', STATUS_META[row.id].color)}>{row.label}</span>
                      <span className="text-slate-500">
                        {row.count} <span className="text-slate-400">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className={cn('h-full rounded-full', STATUS_META[row.id].bar)}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Mini bar chart */}
          <Card>
            <CardHeader>
              <CardTitle>Workload snapshot</CardTitle>
              <CardDescription>Tasks per status</CardDescription>
            </CardHeader>
            <CardContent className="h-52 pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          {/* Progress ring card */}
          <Card className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-0">
            <CardContent>
              <div className="flex items-center gap-2 text-primary-100">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Sprint progress</span>
              </div>
              <p className="mt-4 text-4xl font-bold">{stats.completionRate}%</p>
              <p className="mt-1 text-sm text-primary-100">Overall completion rate</p>
              <motion.div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                <motion.div
                  className="h-full rounded-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completionRate}%` }}
                  transition={{ duration: 0.8 }}
                />
              </motion.div>
              <p className="mt-3 text-xs text-primary-200">
                {stats.done} of {stats.total} tasks completed
              </p>
            </CardContent>
          </Card>

          {/* Upcoming deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-500" />
                Upcoming deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {upcoming.length === 0 && (
                <p className="py-4 text-center text-sm text-slate-500">No upcoming deadlines</p>
              )}
              {upcoming.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className={cn(
                      'text-xs',
                      task.dueDate && isPast(parseISO(task.dueDate)) ? 'text-red-500' : 'text-slate-500',
                    )}>
                      {task.dueDate && formatDueLabel(task.dueDate)}
                    </p>
                  </div>
                  <span className={cn('ml-2 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase', PRIORITY_STYLES[task.priority])}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>{stats.memberCount} members</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {workspace?.members?.slice(0, 8).map((m) => (
                  <motion.div
                    key={typeof m.user === 'string' ? m.user : m.user._id}
                    title={typeof m.user === 'string' ? m.role : m.user.name}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-xs font-semibold text-white ring-2 ring-white dark:ring-slate-900"
                  >
                    {(typeof m.user === 'string' ? '?' : m.user.name?.charAt(0)) || '?'}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent tasks</CardTitle>
          <Link to="/board" className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline">
            View board <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {tasksLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed py-12 text-center">
              <p className="text-sm text-slate-500">No tasks yet</p>
              <Button className="mt-4" size="sm" onClick={() => setTaskModalOpen(true)}>
                <Plus className="h-4 w-4" /> Create your first task
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentTasks.map((task) => (
                <div
                  key={task._id}
                  className="group rounded-xl border border-slate-100 p-4 transition-colors hover:border-primary-200 hover:bg-primary-50/30 dark:border-slate-800 dark:hover:border-primary-800 dark:hover:bg-primary-900/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-medium">{task.title}</p>
                    <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase', PRIORITY_STYLES[task.priority])}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className={STATUS_META[task.status].color}>{STATUS_META[task.status].label}</span>
                    {task.assignee && typeof task.assignee !== 'string' && (
                      <span className="truncate">{task.assignee.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={null}
        workspaceId={workspaceId}
      />
    </div>
  );
}

export default DashboardPage;
