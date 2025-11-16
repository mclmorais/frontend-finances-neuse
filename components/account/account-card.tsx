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
  Pencil,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Account } from '@/lib/types/account';

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

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const Icon = ICONS[account.icon] || Wallet;

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${account.color}20`, color: account.color }}
          >
            <Icon className="size-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{account.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Balance: $0.00</p>
          </div>

          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(account)}
              title="Edit account"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(account)}
              title="Delete account"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
