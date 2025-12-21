"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Category } from "@/lib/api-schemas";
import * as LucideIcons from "lucide-react";

interface CategoryBudgetInputProps {
  category: Category;
  value: string;
  onChange: (value: string) => void;
  max: number;
  error?: string;
  carryover?: number;
}

export function CategoryBudgetInput({
  category,
  value,
  onChange,
  max,
  error,
  carryover = 0,
}: CategoryBudgetInputProps) {
  const IconComponent = LucideIcons[category.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Allow empty string or valid decimal numbers
    if (newValue === "" || /^\d*\.?\d{0,2}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderValue = e.target.value;
    onChange(sliderValue);
  };

  const numericValue = parseFloat(value) || 0;
  const percentage = max > 0 ? (numericValue / max) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        {/* Category Info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="flex size-8 items-center justify-center rounded-lg shrink-0"
            style={{ backgroundColor: `${category.color}20`, color: category.color }}
          >
            {IconComponent && (
              <IconComponent
                className="size-4"
              />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <Label
              htmlFor={`budget-${category.id}`}
              className="text-sm font-medium truncate"
            >
              {category.name}
            </Label>
            {carryover !== 0 && (
              <span
                className={`text-xs ${
                  carryover > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {carryover > 0 ? "+" : ""}
                {formatCurrency(carryover)} from previous months
              </span>
            )}
          </div>
        </div>

        {/* Input Field */}
        <div className="w-32 shrink-0">
          <Input
            id={`budget-${category.id}`}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleInputChange}
            placeholder="0.00"
            className={`text-right ${error ? "border-red-500" : ""}`}
          />
        </div>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max={max}
          step="0.01"
          value={numericValue}
          onChange={handleSliderChange}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          style={{
            background: `linear-gradient(to right, ${category.color} 0%, ${category.color} ${percentage}%, rgb(229 231 235) ${percentage}%, rgb(229 231 235) 100%)`,
          }}
        />
        <span className="text-xs text-muted-foreground w-16 text-right">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(numericValue)}
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
