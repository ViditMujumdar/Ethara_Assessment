import { useState } from 'react';
import { Search, Menu, ChevronDown, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeSwitcher } from './ThemeSwitcher';
import { WorkspaceSwitcher } from '@features/workspace/WorkspaceSwitcher';
import { NotificationDropdown } from '@features/notifications/NotificationDropdown';
import { useAuth } from '@hooks/useAuth';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-40 flex h-16 items-center gap-4 border-b px-4 lg:px-6">
      <button type="button" onClick={onMenuClick} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800">
        <Menu className="h-5 w-5" />
      </button>
      <WorkspaceSwitcher />
      <div className="hidden max-w-md flex-1 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" placeholder="Search tasks..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800" />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitcher />
        <NotificationDropdown />
        <div className="relative">
          <button type="button" onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-medium text-white">{user?.name?.charAt(0) || 'U'}</div>
            <span className="hidden text-sm font-medium sm:block">{user?.name}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 mt-2 w-48 rounded-lg border bg-white py-1 shadow-lg dark:bg-slate-900">
                <div className="border-b px-4 py-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button type="button" onClick={() => logout()} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
