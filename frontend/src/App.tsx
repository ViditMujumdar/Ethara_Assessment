import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { store } from '@store/index';
import { initTheme } from '@features/theme/themeSlice';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { DashboardLayout } from '@components/layout/DashboardLayout';

const LoginPage = lazy(() => import('@pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@pages/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@pages/DashboardPage'));
const BoardPage = lazy(() => import('@pages/BoardPage'));
const CalendarPage = lazy(() => import('@pages/CalendarPage'));
const TimelinePage = lazy(() => import('@pages/TimelinePage'));
const AnalyticsPage = lazy(() => import('@pages/AnalyticsPage'));
const ChatPage = lazy(() => import('@pages/ChatPage'));
const AIPage = lazy(() => import('@pages/AIPage'));
const SettingsPage = lazy(() => import('@pages/SettingsPage'));
const AdminDashboardPage = lazy(() => import('@pages/admin/AdminDashboardPage'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

function ThemeInit() {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(initTheme()); }, [dispatch]);
  return null;
}

function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeInit />
          <AppRoutes />
          <Toaster position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}
