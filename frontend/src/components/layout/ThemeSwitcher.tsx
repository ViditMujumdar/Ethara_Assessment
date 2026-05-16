import { Moon, Sun, Monitor } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '@features/theme/themeSlice';
import type { RootState } from '@store/index';
import { cn } from '@lib/utils';

export function ThemeSwitcher() {
  const dispatch = useDispatch();
  const theme = useSelector((s: RootState) => s.theme.theme);

  const options = [
    { value: 'light' as const, icon: Sun },
    { value: 'dark' as const, icon: Moon },
    { value: 'system' as const, icon: Monitor },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => dispatch(setTheme(value))}
          className={cn(
            'rounded-md p-1.5 transition-colors',
            theme === value ? 'bg-white shadow dark:bg-slate-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700',
          )}
          aria-label={`${value} theme`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

export default ThemeSwitcher;
