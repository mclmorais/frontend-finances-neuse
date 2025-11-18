'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { IconSelector } from '@/components/icon-selector';
import { ICONS } from '@/lib/icons';

const COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Light Red', value: '#fca5a5' },
  { name: 'Light Blue', value: '#93c5fd' },
  { name: 'Light Green', value: '#6ee7b7' },
  { name: 'Light Amber', value: '#fcd34d' },
  { name: 'Light Purple', value: '#c4b5fd' },
  { name: 'Light Orange', value: '#fdba74' },
  { name: 'Light Pink', value: '#f9a8d4' },
];

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['expense', 'saving']),
  color: z.string().regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i, 'Invalid color'),
  icon: z.string().min(1, 'Icon is required'),
});

type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export function CategoryCreateForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'saving'>('expense');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0].name);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: async (data: CreateCategoryInput) => {
      return apiClient.post('/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
    },
    onError: (error: any) => {
      console.error('Failed to create category:', error);
      setErrors({ submit: error.message || 'Failed to create category' });
    },
  });

  const resetForm = () => {
    setName('');
    setType('expense');
    setSelectedColor(COLORS[0].value);
    setSelectedIcon(ICONS[0].name);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const data = {
      name,
      type,
      color: selectedColor,
      icon: selectedIcon,
    };

    const result = createCategorySchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    createMutation.mutate(result.data);
  };


  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          {/* Name Input */}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Type Selection */}
          <div className="grid gap-2">
            <Label>Type</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-2 px-4 rounded-md border-2 transition-colors ${
                  type === 'expense'
                    ? 'border-primary bg-primary/10'
                    : 'border-input hover:border-primary/50'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('saving')}
                className={`flex-1 py-2 px-4 rounded-md border-2 transition-colors ${
                  type === 'saving'
                    ? 'border-primary bg-primary/10'
                    : 'border-input hover:border-primary/50'
                }`}
              >
                Saving
              </button>
            </div>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Icon Selection */}
          <IconSelector
            value={selectedIcon}
            onChange={setSelectedIcon}
            selectedColor={selectedColor}
          />
          {errors.icon && (
            <p className="text-sm text-red-500">{errors.icon}</p>
          )}

          {/* Color Selection */}
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="grid grid-cols-7 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full h-10 rounded-md transition-all ${
                    selectedColor === color.value
                      ? 'ring-2 ring-primary ring-offset-2 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-sm text-red-500">{errors.color}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={createMutation.isPending}
            >
              Reset
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
