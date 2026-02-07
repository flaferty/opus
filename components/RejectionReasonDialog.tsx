'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const REJECTION_REASONS = [
  "Generic 'Not A Good Fit'",
  'Filled - Internal',
  'No New Applicants',
  'Eliminated Role',
  'Changed Job Scope',
  'Applied Too Late',
  'Auto-Reject: No Feedback Provided',
  '1st Round Rejection - Feedback Provided',
  '1st Round Rejection - No Feedback Provided',
  'Middle Round Rejection - Feedback Provided',
  'Middle Round Rejection - No Feedback Provided',
  'N/A',
  'Final Round Rejection - Feedback Provided',
  'Final Round Rejection - No Feedback Provided',
  'No Response: Sent Email',
  'Post-Interview Follow-Up Email',
];

interface RejectionReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
  isLoading?: boolean;
}

export function RejectionReasonDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: RejectionReasonDialogProps) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (category.trim()) {
      const fullReason = description.trim()
        ? `${category} - ${description}`
        : category;
      onSubmit(fullReason);
      setCategory('');
      setDescription('');
    }
  };

  const handleCancel = () => {
    setCategory('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Rejected</DialogTitle>
          <DialogDescription>
            Select a rejection reason and optionally add details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rejection-category">Rejection Category *</Label>
            <select
              id="rejection-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a reason...</option>
              {REJECTION_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rejection-description">Additional Details (Optional)</Label>
            <Input
              id="rejection-description"
              placeholder="e.g., Feedback provided by recruiter..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !category.trim()}
            >
              {isLoading ? 'Saving...' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
