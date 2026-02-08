'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Note } from '@/types/database.types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { MessageSquare, Send, Trash2 } from 'lucide-react';

interface ApplicationNotesProps {
  applicationId: string;
}

export default function ApplicationNotes({ applicationId }: ApplicationNotesProps) {
  const [noteContent, setNoteContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch notes for this application
  const { data: notes = [] } = useQuery({
    queryKey: ['notes', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as Note[]) || [];
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('notes').insert({
        application_id: applicationId,
        content,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', applicationId] });
      setNoteContent('');
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', applicationId] });
    },
  });

  const handleAddNote = () => {
    if (noteContent.trim()) {
      addNoteMutation.mutate(noteContent);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <MessageSquare size={16} />
        <span>Notes ({notes.length})</span>
      </button>

      {isExpanded && (
        <div className="space-y-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
          {/* Add Note Form */}
          <div className="space-y-2">
            <Textarea
              placeholder="Add a note about this application... (interview feedback, salary discussed, etc.)"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="text-sm min-h-20 resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNoteContent('')}
                className="text-xs h-8"
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddNote}
                disabled={addNoteMutation.isPending || !noteContent.trim()}
                className="text-xs h-8 gap-1"
              >
                <Send size={14} />
                Add Note
              </Button>
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-2 bg-white dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600 space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDate(note.created_at)}
                  </p>
                  <button
                    onClick={() => deleteNoteMutation.mutate(note.id)}
                    disabled={deleteNoteMutation.isPending}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
