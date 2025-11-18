'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { IconSelector } from '@/components/icon-selector';
import { ColorSelector } from '@/components/color-selector';
import { ICONS } from '@/lib/icons';
import { COLORS } from '@/lib/colors';

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

          {/* Color & Icon Selection */}
          <div className="flex gap-3 items-start">
            <ColorSelector
              value={selectedColor}
              onChange={setSelectedColor}
            />
            <IconSelector
              value={selectedIcon}
              onChange={setSelectedIcon}
              selectedColor={selectedColor}
            />
          </div>
          {(errors.color || errors.icon) && (
            <div className="text-sm text-red-500">
              {errors.color && <p>{errors.color}</p>}
              {errors.icon && <p>{errors.icon}</p>}
            </div>
          )}

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
