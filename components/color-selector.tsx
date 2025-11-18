'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { COLORS } from '@/lib/colors';

interface ColorSelectorProps {
  value: string;
  onChange: (color: string) => void;
  showLabel?: boolean;
}

export function ColorSelector({ value, onChange, showLabel = true }: ColorSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (color: string) => {
    onChange(color);
    setOpen(false);
  };

  return (
    <div className="grid gap-2">
      {showLabel && <Label>Color</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            role="combobox"
            aria-expanded={open}
            className="h-12 w-12 p-0"
            style={{ backgroundColor: value }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleSelect(color.value)}
                  className={`h-8 w-8 rounded-md transition-all ${
                    value === color.value
                      ? 'ring-2 ring-primary ring-offset-2 scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
