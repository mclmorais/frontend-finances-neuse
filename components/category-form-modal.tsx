"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import {
  Wallet,
  ShoppingCart,
  Home,
  Car,
  Coffee,
  Utensils,
  Plane,
  Heart,
  Shirt,
  Gamepad2,
  GraduationCap,
  Stethoscope,
  DollarSign,
  Gift,
  Music,
  Film,
  Dumbbell,
  PiggyBank,
  TrendingUp,
  CreditCard,
} from "lucide-react";

const COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Light Red", value: "#fca5a5" },
  { name: "Light Blue", value: "#93c5fd" },
  { name: "Light Green", value: "#6ee7b7" },
  { name: "Light Amber", value: "#fcd34d" },
  { name: "Light Purple", value: "#c4b5fd" },
  { name: "Light Orange", value: "#fdba74" },
  { name: "Light Pink", value: "#f9a8d4" },
];

const ICONS = [
  { name: "Wallet", component: Wallet },
  { name: "ShoppingCart", component: ShoppingCart },
  { name: "Home", component: Home },
  { name: "Car", component: Car },
  { name: "Coffee", component: Coffee },
  { name: "Utensils", component: Utensils },
  { name: "Plane", component: Plane },
  { name: "Heart", component: Heart },
  { name: "Shirt", component: Shirt },
  { name: "Gamepad2", component: Gamepad2 },
  { name: "GraduationCap", component: GraduationCap },
  { name: "Stethoscope", component: Stethoscope },
  { name: "DollarSign", component: DollarSign },
  { name: "Gift", component: Gift },
  { name: "Music", component: Music },
  { name: "Film", component: Film },
  { name: "Dumbbell", component: Dumbbell },
  { name: "PiggyBank", component: PiggyBank },
  { name: "TrendingUp", component: TrendingUp },
  { name: "CreditCard", component: CreditCard },
];

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["expense", "saving"]),
  color: z.string().regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i, "Invalid color"),
  icon: z.string().min(1, "Icon is required"),
});

type CategoryInput = z.infer<typeof categorySchema>;

interface Category {
  id: number;
  userId: string;
  color: string;
  icon: string;
  name: string;
  type: string;
}

interface CategoryFormModalProps {
  mode: "create" | "edit";
  category?: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryFormModal({
  mode,
  category,
  open,
  onOpenChange,
}: CategoryFormModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "saving">("expense");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0].name);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const prevCategoryIdRef = useRef<number | null>(null);

  // Populate form when editing - using startTransition to avoid cascading renders
  useEffect(() => {
    if (mode === "edit" && category && category.id !== prevCategoryIdRef.current) {
      prevCategoryIdRef.current = category.id;
      startTransition(() => {
        setName(category.name);
        setType(category.type as "expense" | "saving");
        setSelectedColor(category.color);
        setSelectedIcon(category.icon);
        setErrors({});
      });
    }
  }, [mode, category]);

  const createMutation = useMutation({
    mutationFn: async (data: CategoryInput) => {
      return apiClient.post("/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("Failed to create category:", error);
      setErrors({ submit: error.message || "Failed to create category" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      categoryId,
      data,
    }: {
      categoryId: number;
      data: CategoryInput;
    }) => {
      return apiClient.patch(`/categories/${categoryId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("Failed to update category:", error);
      setErrors({ submit: error.message || "Failed to update category" });
    },
  });

  const resetForm = () => {
    setName("");
    setType("expense");
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

    const result = categorySchema.safeParse(data);

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

    if (mode === "create") {
      createMutation.mutate(result.data);
    } else if (mode === "edit" && category) {
      updateMutation.mutate({ categoryId: category.id, data: result.data });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const SelectedIconComponent =
    ICONS.find((i) => i.name === selectedIcon)?.component || Wallet;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Category" : "Edit Category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name Input */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                autoComplete="off"
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
                className={errors.name ? "border-red-500" : ""}
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
                  onClick={() => setType("expense")}
                  className={`flex-1 py-2 px-4 rounded-md border-2 transition-colors ${
                    type === "expense"
                      ? "border-primary bg-primary/10"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType("saving")}
                  className={`flex-1 py-2 px-4 rounded-md border-2 transition-colors ${
                    type === "saving"
                      ? "border-primary bg-primary/10"
                      : "border-input hover:border-primary/50"
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
            <div className="grid gap-2">
              <Label>Icon</Label>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-12 h-12 rounded-md flex items-center justify-center border-2"
                  style={{ backgroundColor: selectedColor }}
                >
                  <SelectedIconComponent className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Selected: {selectedIcon}
                </span>
              </div>
              <div className="grid grid-cols-10 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                {ICONS.map((icon) => {
                  const IconComponent = icon.component;
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => setSelectedIcon(icon.name)}
                      className={`p-2 rounded-md transition-colors hover:bg-accent ${
                        selectedIcon === icon.name
                          ? "bg-primary/20 border-2 border-primary"
                          : "border border-transparent"
                      }`}
                      title={icon.name}
                    >
                      <IconComponent className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
              {errors.icon && (
                <p className="text-sm text-red-500">{errors.icon}</p>
              )}
            </div>

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
                        ? "ring-2 ring-primary ring-offset-2 scale-110"
                        : "hover:scale-105"
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Category"
                  : "Update Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
