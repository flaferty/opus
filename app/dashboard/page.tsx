'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import KanbanBoard from '@/components/KanbanBoard';
import ApplicationsList from '@/components/ApplicationsList';
import Navbar from '@/components/Navbar';

type ViewMode = 'kanban' | 'list';

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      {/* Content */}
      <main className="flex-1">
        <div className={viewMode === 'kanban' ? 'block' : 'hidden'}>
          <KanbanBoard viewMode={viewMode} setViewMode={setViewMode} />
        </div>
        <div className={viewMode === 'list' ? 'block' : 'hidden'}>
          <ApplicationsList viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </main>
    </div>
  );
}
