'use client';

import { Application, ApplicationStatus } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, X, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface JobCardProps {
  application: Application;
  onDelete: () => void;
  onEdit: () => void;
}

const statusColorMap: Record<ApplicationStatus, string> = {
  WISHLIST: 'bg-blue-50 dark:bg-cyan-500/10 dark:border dark:border-cyan-500/30',
  APPLIED: 'bg-green-50 dark:bg-emerald-500/10 dark:border dark:border-emerald-500/30',
  INTERVIEWING: 'bg-purple-50 dark:bg-violet-500/10 dark:border dark:border-violet-500/30',
  OFFER: 'bg-yellow-50 dark:bg-amber-500/10 dark:border dark:border-amber-500/30',
  REJECTED: 'bg-red-50 dark:bg-rose-500/10 dark:border dark:border-rose-500/30',
};

export default function JobCard({ application, onDelete, onEdit }: JobCardProps) {
  const bgColor = statusColorMap[application.status];

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this application?')) {
      onDelete();
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow cursor-pointer active:shadow-md dark:border-slate-700 ${bgColor}`} onClick={handleCardClick}>
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
              {application.company_name}
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs dark:text-gray-400 line-clamp-1">
              {application.job_title}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 sm:h-9 sm:w-9 text-gray-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0 touch-auto min-h-9 min-w-9"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 sm:space-y-2 text-sm">
        {application.location && (
          <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 gap-1.5">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="line-clamp-1 break-words">{application.location}</span>
          </div>
        )}

        {application.applied_date && (
          <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 gap-1.5">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <span className="line-clamp-1">Applied: {format(new Date(application.applied_date), 'dd/MM/yy')}</span>
          </div>
        )}

        {application.job_url && (
          <div className="pt-1.5 sm:pt-2 mt-1 sm:mt-1.5 border-t dark:border-slate-700">
            <a
              href={application.job_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 gap-1.5 touch-auto py-1"
            >
              <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
              <span className="truncate">View Job</span>
            </a>
          </div>
        )}

        {application.rejection_reason && (
          <div className="p-1.5 mt-1.5 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex gap-1.5">
              <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-0.5">Rejected:</p>
                <p className="text-xs text-red-600 dark:text-red-400 line-clamp-2">{application.rejection_reason}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400 dark:text-gray-500 pt-1">
          Added {format(new Date(application.created_at), 'dd/MM/yy')}
        </div>
      </CardContent>
    </Card>
  );
}
