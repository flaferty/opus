'use client';

interface TagBadgesProps {
  tags?: string[] | null;
  onClick?: (tag: string) => void;
  className?: string;
}

const tagColors: Record<string, { bg: string; text: string }> = {
  remote: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-200' },
  startup: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-200' },
  'high priority': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-200' },
  contract: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-200' },
  'full-time': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-200' },
  'part-time': { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-700 dark:text-indigo-200' },
};

const getTagColor = (tag: string) => {
  const lowerTag = tag.toLowerCase();
  return tagColors[lowerTag] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-200' };
};

export default function TagBadges({ tags, onClick, className = '' }: TagBadgesProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((tag) => {
        const colors = getTagColor(tag);
        return (
          <button
            key={tag}
            onClick={() => onClick?.(tag)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity ${
              onClick ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            #{tag}
          </button>
        );
      })}
    </div>
  );
}
