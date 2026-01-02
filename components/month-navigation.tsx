"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, isSameMonth } from "date-fns";
import { useLocale } from "next-intl";
import { formatMonthYear } from "@/lib/date-format";
import { format as dateFnsFormat } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";

interface MonthNavigationProps {
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
}

export function MonthNavigation({
  selectedMonth,
  onMonthChange,
}: MonthNavigationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const currentYear = today.getFullYear();
  const locale = useLocale() as "en" | "pt";

  // Generate 13 months: 6 before, current, 6 after
  const months = Array.from({ length: 13 }, (_, i) => {
    return addMonths(selectedMonth, i - 6);
  });

  const formatMonthLabel = (date: Date) => {
    const monthYear = date.getFullYear();
    const fnsLocale = locale === "pt" ? ptBR : enUS;
    if (monthYear === currentYear) {
      // Same year as today: show only month name
      return dateFnsFormat(date, "MMMM", { locale: fnsLocale });
    } else {
      // Different year: show month and year
      return formatMonthYear(date, locale);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Left scroll button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={scrollLeft}
        className="shrink-0 h-8 w-8"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Scrollable months container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex gap-2 pb-1">
          {months.map((month, index) => {
            const isSelected = isSameMonth(month, selectedMonth);
            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onMonthChange(month)}
                className="shrink-0 whitespace-nowrap"
              >
                {formatMonthLabel(month)}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Right scroll button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={scrollRight}
        className="shrink-0 h-8 w-8"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
