'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Application, ApplicationStatus, KANBAN_COLUMNS } from '@/types/database.types';
import JobCard from './JobCard';
import AddJobDialog from './AddJobDialog';
import { RejectionReasonDialog } from './RejectionReasonDialog';
import { Button } from './ui/button';
import { Plus, X, ChevronDown, ChevronRight } from 'lucide-react';

export default function KanbanBoard() {
  const [mounted, setMounted] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [pendingRejectionId, setPendingRejectionId] = useState<string | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<ApplicationStatus>>(new Set());
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [initialStatus, setInitialStatus] = useState<ApplicationStatus>('WISHLIST');
  const queryClient = useQueryClient();
  const supabase = createClient();

  const toggleColumn = (columnId: ApplicationStatus) => {
    setCollapsedColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

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
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: ApplicationStatus; rejectionReason?: string }) => {
      const updateData: any = { status };
      if (rejectionReason !== undefined) {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async ({ id, status, rejectionReason }) => {
      await queryClient.cancelQueries({ queryKey: ['applications'] });

      const previousApplications = queryClient.getQueryData<Application[]>(['applications']);

      if (previousApplications) {
        queryClient.setQueryData<Application[]>(
          ['applications'],
          previousApplications.map((app) =>
            app.id === id
              ? {
                  ...app,
                  status,
                  ...(rejectionReason !== undefined && { rejection_reason: rejectionReason }),
                }
              : app
          )
        );
      }

      return { previousApplications };
    },
    onError: (err, newData, context) => {
      if (context?.previousApplications) {
        queryClient.setQueryData(['applications'], context.previousApplications);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const deleteApplicationMutation = useMutation({
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

  const filteredApplications = applications
    .filter((app) => {
      if (selectedCompany && app.company_name !== selectedCompany) {
        return false;
      }

      if (selectedLocation && app.location !== selectedLocation) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (!a.applied_date || !b.applied_date) return 0;
      const dateA = new Date(a.applied_date).getTime();
      const dateB = new Date(b.applied_date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const uniqueCompanies = Array.from(new Set(applications.map((app) => app.company_name))).sort();
  const uniqueLocations = Array.from(
    new Set(applications.filter((app) => app.location).map((app) => app.location!))
  ).sort();

  const groupedApplications = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = filteredApplications.filter((app) => app.status === column.id);
    return acc;
  }, {} as Record<ApplicationStatus, Application[]>);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as ApplicationStatus;

    if (newStatus === 'REJECTED') {
      setPendingRejectionId(draggableId);
      setRejectionDialogOpen(true);
    } else {
      updateStatusMutation.mutate({
        id: draggableId,
        status: newStatus,
      });
    }
  };

  const handleRejectionReasonSubmit = (reason: string) => {
    if (pendingRejectionId) {
      updateStatusMutation.mutate({
        id: pendingRejectionId,
        status: 'REJECTED',
        rejectionReason: reason,
      });
      setPendingRejectionId(null);
      setRejectionDialogOpen(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col overflow-hidden h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="p-2 sm:p-3 md:p-4 lg:p-6 border-b bg-white dark:bg-slate-900 dark:border-slate-800 overflow-y-auto max-h-[45%] sm:max-h-[40%] md:max-h-auto transition-colors">
        <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">Track your applications</h1>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="flex-shrink-0 text-xs sm:text-sm h-8 sm:h-9 md:h-10">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>

          <div className="flex flex-row items-center gap-1 flex-wrap">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 dark:text-white h-8 touch-auto transition-colors"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>

            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 dark:text-white h-8 touch-auto transition-colors"
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
              className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 dark:text-white h-8 touch-auto transition-colors"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            {(selectedCompany || selectedLocation || sortOrder !== 'newest') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCompany('');
                  setSelectedLocation('');
                  setSortOrder('newest');
                }}
                className="text-xs h-8 px-2"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col md:flex-row md:items-start md:overflow-x-auto md:overflow-y-hidden md:justify-center">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col md:flex-row gap-1 p-2 sm:p-3 md:p-4 w-full md:w-auto">
            {KANBAN_COLUMNS.map((column) => {
              const isCollapsed = collapsedColumns.has(column.id);
              
              const darkColorMap: Record<string, string> = {
                'bg-slate-100': 'dark:bg-slate-700',
                'bg-blue-100': 'dark:bg-slate-700',
                'bg-yellow-100': 'dark:bg-slate-700',
                'bg-green-100': 'dark:bg-slate-700',
                'bg-red-100': 'dark:bg-slate-700',
              };
              
              const darkColorClass = darkColorMap[column.color] || 'dark:bg-slate-700';
              
              return (
                <div key={column.id} className="flex flex-col flex-shrink-0 w-full md:w-56 lg:w-64 xl:w-72">
                  <div className={`${column.color} ${darkColorClass} rounded-t-lg p-1.5 sm:p-2 md:p-3 border-b-2 border-gray-300 dark:border-gray-600 flex items-center justify-between gap-1 transition-colors`}>
                    <div className="flex items-center gap-0.5 sm:gap-1 flex-1 min-w-0">
                      <button
                        onClick={() => toggleColumn(column.id)}
                        className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex-shrink-0 touch-auto min-h-9 min-w-9 flex items-center justify-center"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gray-700 dark:text-gray-200" />
                        ) : (
                          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gray-700 dark:text-gray-200" />
                        )}
                      </button>
                      <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-0.5 sm:gap-1 flex-1 min-w-0">
                        <span className="truncate text-xs sm:text-sm md:text-base line-clamp-1">{column.title}</span>
                        <span className="bg-white dark:bg-gray-800 dark:text-white px-1.5 py-0.5 rounded-full text-xs flex-shrink-0">
                          {groupedApplications[column.id]?.length || 0}
                        </span>
                      </h2>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          onClick={() => {
                            setInitialStatus(column.id);
                            setIsAddDialogOpen(true);
                          }}
                          className={`flex-1 p-1.5 sm:p-2 rounded-b-lg min-h-[200px] md:min-h-[400px] lg:min-h-[500px] transition-colors cursor-pointer group ${
                            snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-800'
                          }`}
                        >
                          <div className="space-y-3">
                            {groupedApplications[column.id]?.map((application, index) => (
                              <Draggable
                                key={application.id}
                                draggableId={application.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={snapshot.isDragging ? 'opacity-50' : ''}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <JobCard
                                      application={application}
                                      onDelete={() =>
                                        deleteApplicationMutation.mutate(application.id)
                                      }
                                      onEdit={() => {
                                        setEditingApplication(application);
                                        setIsAddDialogOpen(true);
                                      }}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                          {groupedApplications[column.id]?.length === 0 && (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                              Click to add a job
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  )}
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      <AddJobDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingApplication(null);
            setInitialStatus('WISHLIST');
          }
        }}
        editingApplication={editingApplication}
        initialStatus={initialStatus}
      />

      <RejectionReasonDialog
        open={rejectionDialogOpen}
        onOpenChange={setRejectionDialogOpen}
        onSubmit={handleRejectionReasonSubmit}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
}
