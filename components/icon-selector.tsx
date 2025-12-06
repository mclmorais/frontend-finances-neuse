"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ICONS } from "@/lib/icons";

interface IconSelectorProps {
  value: string;
  onChange: (iconName: string) => void;
  selectedColor: string;
}

export function IconSelector({
  value,
  onChange,
  selectedColor,
}: IconSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedIcon = ICONS.find((icon) => icon.name === value);
  const SelectedIconComponent = selectedIcon?.component;

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
  };

  return (
    <div className="grid gap-2">
      <Label>Icon</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            role="combobox"
            aria-expanded={open}
            className="h-12 w-12 p-0"
            style={{ backgroundColor: selectedColor }}
          >
            {SelectedIconComponent && (
              <SelectedIconComponent className="size-6 text-white" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-4">
            <>
              <div className="grid grid-cols-6 gap-2 max-h-[300px] overflow-y-auto">
                {ICONS.map((icon) => {
                  const IconComponent = icon.component;
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => handleSelect(icon.name)}
                      className={`p-2.5 rounded-md transition-colors hover:bg-accent flex items-center justify-center ${
                        value === icon.name
                          ? "bg-primary/20 border-2 border-primary"
                          : "border border-transparent"
                      }`}
                      title={icon.name}
                    >
                      <IconComponent className="h-7 w-7" />
                    </button>
                  );
                })}
              </div>
            </>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
