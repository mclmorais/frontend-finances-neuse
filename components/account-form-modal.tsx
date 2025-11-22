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

const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i, "Invalid color"),
  icon: z.string().min(1, "Icon is required"),
});

type AccountInput = z.infer<typeof accountSchema>;

interface Account {
  id: number;
  userId: string;
  color: string;
  icon: string;
  name: string;
}

interface AccountFormModalProps {
  mode: "create" | "edit";
  account?: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountFormModal({
  mode,
  account,
  open,
  onOpenChange,
}: AccountFormModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0].name);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const prevAccountIdRef = useRef<number | null>(null);

  // Populate form when editing - using startTransition to avoid cascading renders
  useEffect(() => {
    if (mode === "edit" && account && account.id !== prevAccountIdRef.current) {
      prevAccountIdRef.current = account.id;
      startTransition(() => {
        setName(account.name);
        setSelectedColor(account.color);
        setSelectedIcon(account.icon);
        setErrors({});
      });
    }
  }, [mode, account]);

  const createMutation = useMutation({
    mutationFn: async (data: AccountInput) => {
      return apiClient.post("/accounts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("Failed to create account:", error);
      setErrors({ submit: error.message || "Failed to create account" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      accountId,
      data,
    }: {
      accountId: number;
      data: AccountInput;
    }) => {
      return apiClient.patch(`/accounts/${accountId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("Failed to update account:", error);
      setErrors({ submit: error.message || "Failed to update account" });
    },
  });

  const resetForm = () => {
    setName("");
    setSelectedColor(COLORS[0].value);
    setSelectedIcon(ICONS[0].name);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const data = {
      name,
      color: selectedColor,
      icon: selectedIcon,
    };

    const result = accountSchema.safeParse(data);

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
    } else if (mode === "edit" && account) {
      updateMutation.mutate({ accountId: account.id, data: result.data });
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
            {mode === "create" ? "Create New Account" : "Edit Account"}
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
                placeholder="Account name"
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
                  ? "Create Account"
                  : "Update Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
