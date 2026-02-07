'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Suspense } from 'react';
import Logo from './Logo';

function NavbarContent() {
  const supabase = createClient();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
      <div className="mx-auto px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 dark:text-yellow-400" />
              ) : (
                <Sun className="h-4 w-4 text-yellow-400" />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={
      <nav className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2" />
          </div>
        </div>
      </nav>
    }>
      <NavbarContent />
    </Suspense>
  );
}
