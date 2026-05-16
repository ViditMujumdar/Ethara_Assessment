import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { adminApi } from '@features/admin/adminApi';
import { useAdmin } from '@hooks/useAdmin';
import { Button } from '@components/ui/Button';
import { Card, CardContent } from '@components/ui/Card';

export function AdminDashboardPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await adminApi.dashboard();
      return res.data.data;
    },
    enabled: isAdmin,
    retry: false,
  });

  if (adminLoading) {
    return <div className="flex h-64 items-center justify-center text-slate-500">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-12 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-xl font-bold">Admin access required</h2>
          <p className="mt-2 text-sm text-slate-500">
            This area is for platform administrators only. Your account does not have an admin profile yet.
          </p>
          <Link to="/dashboard" className="mt-6 inline-block">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" /> Back to dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    const message = (error as { response?: { data?: { message?: string }; status?: number } })?.response?.data?.message
      ?? 'Could not load admin data';
    const status = (error as { response?: { status?: number } })?.response?.status;

    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-12 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-bold">Unable to load admin dashboard</h2>
          <p className="mt-2 text-sm text-slate-500">{message}</p>
          {status && <p className="mt-1 text-xs text-slate-400">HTTP {status}</p>}
          <Link to="/dashboard" className="mt-6 inline-block">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) return <div className="flex h-64 items-center justify-center">Loading...</div>;

  const stats = [
    { label: 'Total Users', value: data?.totalUsers },
    { label: 'Active Users', value: data?.activeUsers },
    { label: 'Workspaces', value: data?.totalWorkspaces },
    { label: 'Tasks', value: data?.totalTasks },
    { label: 'Subscriptions', value: data?.activeSubscriptions },
    { label: 'AI Requests Today', value: data?.aiRequestsToday },
  ];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Admin Dashboard</h1>
      <p className="mb-8 text-sm text-slate-500">Platform-wide metrics and growth</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} hover>
            <CardContent>
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-2 text-3xl font-bold">{s.value ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h3 className="mb-4 font-medium">User Growth</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data?.userGrowth}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366f1" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="mb-4 font-medium">Revenue by Plan</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data?.revenueData}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
