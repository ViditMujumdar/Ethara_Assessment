import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Kanban, Calendar, BarChart3, MessageSquare,
  Settings, Sparkles, Shield,
} from 'lucide-react';
import { cn } from '@lib/utils';
import { useAdmin } from '@hooks/useAdmin';

const baseNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/board', icon: Kanban, label: 'Board' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/timeline', icon: Calendar, label: 'Timeline' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/ai', icon: Sparkles, label: 'AI Assistant' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const adminNavItem = { to: '/admin', icon: Shield, label: 'Admin' };

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { isAdmin } = useAdmin();
  const navItems = isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <aside className={cn('flex h-full flex-col border-r bg-white dark:bg-slate-900', collapsed ? 'w-16' : 'w-64')}>
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <motion.div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white font-bold"
          whileHover={{ scale: 1.05 }}
        >
          TF
        </motion.div>
        {!collapsed && <span className="font-semibold text-lg">TaskFlow</span>}
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
