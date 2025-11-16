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
import { Badge } from '@/components/ui/badge';
import type { Category } from '@/lib/types/category';

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

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const Icon = ICONS[category.icon] || Wallet;

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${category.color}20`, color: category.color }}
          >
            <Icon className="size-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{category.name}</h3>
            <Badge
              variant="outline"
              className="mt-1 text-xs"
              style={{ borderColor: category.color, color: category.color }}
            >
              {category.type}
            </Badge>
          </div>

          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(category)}
              title="Edit category"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(category)}
              title="Delete category"
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
