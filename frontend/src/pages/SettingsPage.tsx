import { useSelector } from 'react-redux';
import { ThemeSwitcher } from '@components/layout/ThemeSwitcher';
import type { RootState } from '@store/index';

export function SettingsPage() {
  const user = useSelector((s: RootState) => s.auth.user);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <section className="mt-8 rounded-xl border bg-white p-6 dark:bg-slate-900">
        <h2 className="font-medium">Profile</h2>
        <p className="mt-2 text-sm text-slate-500">Name: {user?.name}</p>
        <p className="text-sm text-slate-500">Email: {user?.email}</p>
      </section>
      <section className="mt-4 rounded-xl border bg-white p-6 dark:bg-slate-900">
        <h2 className="font-medium">Appearance</h2>
        <div className="mt-4"><ThemeSwitcher /></div>
      </section>
    </div>
  );
}

export default SettingsPage;
