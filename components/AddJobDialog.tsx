'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { CreateApplicationInput, ApplicationStatus, Application } from '@/types/database.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingApplication?: Application | null;
  initialStatus?: ApplicationStatus;
}

interface FormData extends CreateApplicationInput {
  rejection_reason?: string;
  tags_input?: string;
}

export default function AddJobDialog({ open, onOpenChange, editingApplication, initialStatus = 'WISHLIST' }: AddJobDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    job_title: '',
    status: initialStatus,
    job_url: '',
    location: '',
    applied_date: new Date().toISOString().split('T')[0],
    rejection_reason: '',
    interview_date: '',
    interview_time: '',
    tags: [],
    tags_input: '',
  });

  const queryClient = useQueryClient();
  const supabase = createClient();

  // Update form data when editing application changes or dialog opens
  useEffect(() => {
    if (open && editingApplication) {
      setFormData({
        company_name: editingApplication.company_name,
        job_title: editingApplication.job_title,
        status: editingApplication.status,
        job_url: editingApplication.job_url || '',
        location: editingApplication.location || '',
        applied_date: editingApplication.applied_date || '',
        rejection_reason: editingApplication.rejection_reason || '',
        interview_date: editingApplication.interview_date || '',
        interview_time: editingApplication.interview_time || '',
        tags: editingApplication.tags || [],
        tags_input: editingApplication.tags?.join(', ') || '',
      });
    } else if (open && !editingApplication) {
      // New application
      resetForm();
    }
  }, [open, editingApplication]);

  const mutation = useMutation({
    mutationFn: async (input: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      // Process tags
      const tags = input.tags_input 
        ? input.tags_input.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const dataToSave = {
        company_name: input.company_name,
        job_title: input.job_title,
        status: input.status,
        job_url: input.job_url || null,
        location: input.location || null,
        applied_date: input.applied_date || null,
        rejection_reason: input.rejection_reason || null,
        interview_date: input.interview_date || null,
        interview_time: input.interview_time || null,
        tags: tags.length > 0 ? tags : null,
      };

      if (editingApplication) {
        // Update existing application
        const { error } = await supabase
          .from('applications')
          .update(dataToSave)
          .eq('id', editingApplication.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new application
        const { error } = await supabase.from('applications').insert({
          user_id: user.id,
          ...dataToSave,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      resetForm();
      onOpenChange(false);
    },
  });

  const resetForm = () => {
    setFormData({
      company_name: '',
      job_title: '',
      status: initialStatus,
      job_url: '',
      location: '',
      applied_date: new Date().toISOString().split('T')[0],
      rejection_reason: '',
      interview_date: '',
      interview_time: '',
      tags: [],
      tags_input: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-[500px] max-h-[95vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>{editingApplication ? 'Edit Job Application' : 'Add New Job Application'}</DialogTitle>
          <DialogDescription>
            {editingApplication ? 'Update the details of your job application.' : 'Fill in the details of the job you\'re applying to or interested in.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="company" className="text-xs sm:text-sm">Company Name *</Label>
            <Input
              id="company"
              placeholder="e.g., Google"
              value={formData.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              required
              className="text-sm h-9 sm:h-10"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="title" className="text-xs sm:text-sm">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Engineer"
              value={formData.job_title}
              onChange={(e) => handleChange('job_title', e.target.value)}
              required
              className="text-sm h-9 sm:h-10"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="location" className="text-xs sm:text-sm">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Remote"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              className="text-sm h-9 sm:h-10"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="url" className="text-xs sm:text-sm">Job URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://..."
              value={formData.job_url || ''}
              onChange={(e) => handleChange('job_url', e.target.value)}
              className="text-sm h-9 sm:h-10"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="applied_date" className="text-xs sm:text-sm">Date Applied</Label>
            <Input
              id="applied_date"
              type="date"
              value={formData.applied_date}
              onChange={(e) => handleChange('applied_date', e.target.value)}
              className="text-sm h-9 sm:h-10"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="tags" className="text-xs sm:text-sm">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g., remote, startup, high priority"
              value={formData.tags_input || ''}
              onChange={(e) => handleChange('tags_input', e.target.value)}
              className="text-sm h-9 sm:h-10"
            />
            <p className="text-xs text-gray-500">Separate multiple tags with commas</p>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="status" className="text-xs sm:text-sm">Status</Label>
            <select
              id="status"
              className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-auto"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as ApplicationStatus)}
            >
              <option value="WISHLIST">Wishlist</option>
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEWING">Interviewing</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {(formData.status === 'INTERVIEWING' || formData.interview_date) && (
            <>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="interview_date" className="text-xs sm:text-sm">Interview Date</Label>
                <Input
                  id="interview_date"
                  type="date"
                  value={formData.interview_date || ''}
                  onChange={(e) => handleChange('interview_date', e.target.value)}
                  className="text-sm h-9 sm:h-10"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="interview_time" className="text-xs sm:text-sm">Interview Time</Label>
                <Input
                  id="interview_time"
                  type="time"
                  value={formData.interview_time || ''}
                  onChange={(e) => handleChange('interview_time', e.target.value)}
                  className="text-sm h-9 sm:h-10"
                />
              </div>
            </>
          )}

          {formData.status === 'REJECTED' && (
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="rejection_reason" className="text-xs sm:text-sm">Rejection Reason</Label>
              <Textarea
                id="rejection_reason"
                placeholder="e.g., Not a good fit"
                value={formData.rejection_reason || ''}
                onChange={(e) => handleChange('rejection_reason', e.target.value)}
                className="text-sm min-h-20 sm:min-h-24 resize-none"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 sm:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={mutation.isPending}
              className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
              {mutation.isPending ? (editingApplication ? 'Updating...' : 'Adding...') : (editingApplication ? 'Update' : 'Add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
