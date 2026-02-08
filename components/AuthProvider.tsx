'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const isAuthPage = pathname === '/login' || pathname === '/start' || pathname?.includes('/forgot-password') || pathname?.includes('/reset-password');
        
        if (!session && !isAuthPage) {
          router.push('/login');
        } else if (session && isAuthPage) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (_event === 'SIGNED_OUT') {
          router.push('/login');
        } else if (_event === 'SIGNED_IN' && pathname?.startsWith('/login')) {
          router.push('/dashboard');
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, router, pathname]);

  return <>{children}</>;
}
