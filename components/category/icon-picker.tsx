'use client';

import * as React from 'react';
import {
  Wallet,
  Home,
  Car,
  ShoppingCart,
  Utensils,
  Heart,
  Plane,
  Coffee,
  Music,
  Gamepad2,
  GraduationCap,
  Shirt,
  Phone,
  Laptop,
  Lightbulb,
  Droplets,
  Flame,
  PiggyBank,
  TrendingUp,
  Gift,
  DollarSign,
  CreditCard,
  Briefcase,
  Building,
  Smartphone,
  Tv,
  Book,
  Dumbbell,
  Stethoscope,
  PawPrint,
  Baby,
  Pizza,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  wallet: Wallet,
  home: Home,
  car: Car,
  'shopping-cart': ShoppingCart,
  utensils: Utensils,
  heart: Heart,
  plane: Plane,
  coffee: Coffee,
  music: Music,
  gamepad: Gamepad2,
  education: GraduationCap,
  shirt: Shirt,
  phone: Phone,
  laptop: Laptop,
  lightbulb: Lightbulb,
  droplets: Droplets,
  flame: Flame,
  'piggy-bank': PiggyBank,
  'trending-up': TrendingUp,
  gift: Gift,
  'dollar-sign': DollarSign,
  'credit-card': CreditCard,
  briefcase: Briefcase,
  building: Building,
  smartphone: Smartphone,
  tv: Tv,
  book: Book,
  dumbbell: Dumbbell,
  health: Stethoscope,
  'paw-print': PawPrint,
  baby: Baby,
  pizza: Pizza,
};

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color = '#000000' }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);

  const SelectedIcon = ICONS[value] || Wallet;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          type="button"
        >
          <div
            className="flex size-5 items-center justify-center rounded"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <SelectedIcon className="size-4" />
          </div>
          <span className="capitalize">{value.replace(/-/g, ' ')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <div className="mb-2 text-sm font-medium">Select an icon</div>
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(ICONS).map(([key, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
              className={cn(
                'flex size-10 items-center justify-center rounded-md border hover:bg-accent',
                value === key && 'border-primary bg-accent'
              )}
              title={key.replace(/-/g, ' ')}
            >
              <div
                className="flex size-6 items-center justify-center"
                style={{ color: value === key ? color : 'currentColor' }}
              >
                <Icon className="size-5" />
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
