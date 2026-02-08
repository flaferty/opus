'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Application, ApplicationStatus } from '@/types/database.types';
import { Button } from './ui/button';
import { ChevronDown, Download, Edit2, Trash2, LayoutGrid, List } from 'lucide-react';

type SortKey = keyof Application;
type SortOrder = 'asc' | 'desc';

export default function ApplicationsList({ viewMode, setViewMode }: { viewMode: 'kanban' | 'list'; setViewMode: (mode: 'kanban' | 'list') => void }) {
  const [mounted, setMounted] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [tableSortOrder, setTableSortOrder] = useState<SortOrder>('desc');
  const [sortByDate, setSortByDate] = useState<'newest' | 'oldest'>('newest');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Application[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const filteredAndSortedApplications = applications
    .filter((app) => {
      if (selectedCompany && app.company_name !== selectedCompany) return false;
      if (selectedLocation && app.location !== selectedLocation) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortByDate === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const getStatusColor = (status: ApplicationStatus) => {
    const colors: Record<ApplicationStatus, string> = {
      WISHLIST: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
      APPLIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      INTERVIEWING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      OFFER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    };
    return colors[status];
  };

  const uniqueCompanies = Array.from(
    new Set(applications.map((app) => app.company_name).filter((c): c is string => Boolean(c)))
  ).sort();

  const uniqueLocations = Array.from(
    new Set(applications.map((app) => app.location).filter((l): l is string => Boolean(l)))
  ).sort();

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setTableSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Company', 'Job Title', 'Status', 'Location', 'Applied Date', 'URL'];
    const rows = filteredAndSortedApplications.map((app) => [
      app.company_name,
      app.job_title,
      app.status,
      app.location || '',
      app.applied_date || '',
      app.job_url || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const SortHeader = ({ label, sortKey: key }: { label: string; sortKey: SortKey }) => (
    <button
      onClick={() => handleSort(key)}
      className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
    >
      {label}
      {sortKey === key && (
        <ChevronDown
          size={16}
          className={`transform transition-transform ${
            tableSortOrder === 'desc' ? 'rotate-0' : 'rotate-180'
          }`}
        />
      )}
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 dark:text-gray-400">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="p-2 sm:p-3 md:p-4 lg:p-6 border-b bg-white dark:bg-slate-900 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">Track your applications</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-gray-900 text-white dark:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
              }`}
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-gray-900 text-white dark:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
              }`}
            >
              <List size={16} />
              <span className="hidden sm:inline">List</span>
            </button>
            <Button onClick={handleExportCSV} size="sm" className="flex-shrink-0 text-xs sm:text-sm h-8 sm:h-9 md:h-10">
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Filters and Export */}
        <div className="flex flex-row items-center gap-1 flex-nowrap overflow-x-auto">
          <select
            value={sortByDate}
            onChange={(e) => setSortByDate(e.target.value as 'newest' | 'oldest')}
            className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 dark:text-white h-8 touch-auto transition-colors flex-shrink-0"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 dark:text-white h-8 touch-auto transition-colors flex-shrink-0"
          >
            <option value="">All Companies</option>
            {uniqueCompanies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 dark:text-white h-8 touch-auto transition-colors flex-shrink-0"
          >
            <option value="">All Locations</option>
            {uniqueLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          {(selectedCompany || selectedLocation || sortByDate !== 'newest') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCompany('');
                setSelectedLocation('');
                setSortByDate('newest');
              }}
              className="text-xs h-8 px-2 flex-shrink-0"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="w-full max-w-7xl mx-auto">
          <div className="overflow-x-auto border border-gray-300 dark:border-slate-700 rounded-lg">
            <table className="w-full bg-white dark:bg-slate-800">
              <thead>
                <tr className="border-b border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                  <th className="px-4 py-3 text-left">
                    <SortHeader label="Company" sortKey="company_name" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader label="Job Title" sortKey="job_title" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader label="Status" sortKey="status" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader label="Location" sortKey="location" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader label="Applied" sortKey="applied_date" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader label="Created" sortKey="created_at" />
                  </th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedApplications.map((app) => (
                    <tr key={app.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{app.company_name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{app.job_title}</td>
                      <td className="px-4 py-3">
                        {editingId === app.id ? (
                          <select
                            value={app.status}
                            onChange={(e) =>
                              updateStatusMutation.mutate({
                                id: app.id,
                                status: e.target.value as ApplicationStatus,
                              })
                            }
                            className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                          >
                            <option value="WISHLIST">WISHLIST</option>
                            <option value="APPLIED">APPLIED</option>
                            <option value="INTERVIEWING">INTERVIEWING</option>
                            <option value="OFFER">OFFER</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        ) : (
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{app.location || '—'}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setEditingId(editingId === app.id ? null : app.id)}
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Edit status"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this application?')) {
                                deleteMutation.mutate(app.id);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-100 dark:hover:bg-red-900 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedApplications.length} of {applications.length} applications
          </div>
        </div>
      </div>
    </div>
  );
}
