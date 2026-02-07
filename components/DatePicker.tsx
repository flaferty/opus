'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DatePickerProps {
  selected?: Date;
  onChange: (date: Date) => void;
}

export function DatePicker({ selected, onChange }: DatePickerProps) {
  const [displayMonth, setDisplayMonth] = React.useState(selected || new Date());
  const [open, setOpen] = React.useState(false);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1));
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    onChange(newDate);
    setOpen(false);
  };

  const daysInMonth = getDaysInMonth(displayMonth);
  const firstDay = getFirstDayOfMonth(displayMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthName = displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedDateStr = selected?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-sm hover:bg-slate-50"
      >
        <span>{selectedDateStr || 'Select date'}</span>
        <ChevronLeft className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-50 w-72">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{monthName}</h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handlePrevMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-xs font-semibold text-center text-slate-600 h-6">
                  {day}
                </div>
              ))}

              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="h-6" />
              ))}

              {days.map((day) => {
                const isSelected =
                  selected &&
                  selected.getDate() === day &&
                  selected.getMonth() === displayMonth.getMonth() &&
                  selected.getFullYear() === displayMonth.getFullYear();

                return (
                  <button
                    key={day}
                    onClick={() => handleSelectDate(day)}
                    className={`h-6 text-xs rounded hover:bg-slate-100 ${
                      isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
