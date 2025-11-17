'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  generateMonthRange,
  formatMonthYear,
  isSameMonth,
  getCurrentMonthYear,
  type MonthYear,
} from '@/lib/utils/date-helpers';

interface MonthNavigationProps {
  selectedMonth: MonthYear | null;
  onMonthSelect: (month: MonthYear | null) => void;
}

export function MonthNavigation({ selectedMonth, onMonthSelect }: MonthNavigationProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const currentMonthYear = getCurrentMonthYear();
  const months = generateMonthRange(-6, 6);

  const handleMonthClick = (month: MonthYear) => {
    onMonthSelect(month);
  };

  const handleViewAll = () => {
    onMonthSelect(null);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      e.preventDefault();
      scrollContainerRef.current.scrollBy({ left: e.deltaY, behavior: 'auto' });
    }
  };

  return (
    <div className="border border-border rounded-lg bg-card p-4 mb-6">
      <div className="flex gap-2 items-center">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={scrollLeft}
          className="shrink-0"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className="flex gap-2 items-center overflow-x-auto scrollbar-hide flex-1"
        >
          {months.map((month) => {
            const isSelected = isSameMonth(month, selectedMonth);
            const isCurrent = isSameMonth(month, currentMonthYear);

            return (
              <Button
                key={`${month.year}-${month.month}`}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className="min-w-[100px] shrink-0"
                onClick={() => handleMonthClick(month)}
              >
                {formatMonthYear(month, currentMonthYear.year)}
                {isCurrent && !isSelected && (
                  <span className="ml-1 text-xs opacity-60">•</span>
                )}
              </Button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={scrollRight}
          className="shrink-0"
        >
          <ChevronRight className="size-4" />
        </Button>

        <Separator orientation="vertical" className="h-8 mx-1" />

        <Button
          variant={selectedMonth === null ? 'default' : 'ghost'}
          size="sm"
          className="shrink-0"
          onClick={handleViewAll}
        >
          View All
        </Button>
      </div>
    </div>
  );
}
