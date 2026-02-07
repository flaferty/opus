'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import KanbanBoard from '@/components/KanbanBoard';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [supabase, router]);

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <KanbanBoard />
    </div>
  );
}
