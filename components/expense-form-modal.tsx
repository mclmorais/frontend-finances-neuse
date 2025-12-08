"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiClient } from "@/lib/api-client";
import { Expense, Category, Account } from "@/lib/types";
import {
  expenseSchema as expenseResponseSchema,
  accountsSchema,
  categoriesSchema,
} from "@/lib/api-schemas";
import { format, parse } from "date-fns";
import { CalendarIcon, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

// Helper function to safely get icon component
const getIconComponent = (iconName: string): LucideIcon => {
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  return (typeof icon === "function" ? icon : Wallet) as LucideIcon;
};

const expenseSchema = z.object({
  accountId: z.number().int().positive("Account is required"),
  categoryId: z.number().int().positive("Category is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  value: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Value must be a valid decimal number (e.g., 10.50)",
    ),
  description: z.string().optional(),
});

type ExpenseInput = z.infer<typeof expenseSchema>;

interface ExpenseFormModalProps {
  mode: "create" | "edit";
  expense?: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpenseFormModal({
  mode,
  expense,
  open,
  onOpenChange,
}: ExpenseFormModalProps) {
  const queryClient = useQueryClient();
  const [accountId, setAccountId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const prevExpenseIdRef = useRef<number | null>(null);

  // Fetch accounts
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      return apiClient.get("/accounts", accountsSchema);
    },
  });

  // Fetch categories (only expense type)
  const { data: allCategories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return apiClient.get("/categories", categoriesSchema);
    },
  });

  const categories = allCategories.filter((cat) => cat.type === "expense");

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && expense && expense.id !== prevExpenseIdRef.current) {
      prevExpenseIdRef.current = expense.id;
      startTransition(() => {
        setAccountId(expense.accountId);
        setCategoryId(expense.categoryId);
        // Parse date string as local date to avoid timezone shift
        setDate(parse(expense.date, "yyyy-MM-dd", new Date()));
        // Convert number to string for form input
        setValue(expense.value.toString());
        setDescription(expense.description || "");
        setErrors({});
      });
    }
  }, [mode, expense]);

  const createMutation = useMutation({
    mutationFn: async (data: ExpenseInput) => {
      return apiClient.post("/expenses", expenseResponseSchema, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["reports", "monthly-comparison"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("Failed to create expense:", error);
      setErrors({ submit: error.message || "Failed to create expense" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      expenseId,
      data,
    }: {
      expenseId: number;
      data: ExpenseInput;
    }) => {
      return apiClient.patch(
        `/expenses/${expenseId}`,
        expenseResponseSchema,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["reports", "monthly-comparison"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("Failed to update expense:", error);
      setErrors({ submit: error.message || "Failed to update expense" });
    },
  });

  const resetForm = () => {
    setAccountId(null);
    setCategoryId(null);
    setDate(new Date());
    setValue("");
    setDescription("");
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const data = {
      accountId: accountId!,
      categoryId: categoryId!,
      date: date ? format(date, "yyyy-MM-dd") : "",
      value,
      description: description || undefined,
    };

    const result = expenseSchema.safeParse(data);

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
    } else if (mode === "edit" && expense) {
      updateMutation.mutate({ expenseId: expense.id, data: result.data });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const getAccountDisplay = (account: Account) => {
    const IconComponent = getIconComponent(account.icon);
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{ backgroundColor: account.color }}
        >
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <span>{account.name}</span>
      </div>
    );
  };

  const getCategoryDisplay = (category: Category) => {
    const IconComponent = getIconComponent(category.icon);
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{ backgroundColor: category.color }}
        >
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <span>{category.name}</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Expense" : "Edit Expense"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Account Selection */}
            <div className="grid gap-2">
              <Label htmlFor="account">Account</Label>
              <Select
                value={accountId?.toString()}
                onValueChange={(value) => setAccountId(parseInt(value))}
              >
                <SelectTrigger
                  className={errors.accountId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {getAccountDisplay(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountId && (
                <p className="text-sm text-red-500">{errors.accountId}</p>
              )}
            </div>

            {/* Category Selection */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={categoryId?.toString()}
                onValueChange={(value) => setCategoryId(parseInt(value))}
              >
                <SelectTrigger
                  className={errors.categoryId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {getCategoryDisplay(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-500">{errors.categoryId}</p>
              )}
            </div>

            {/* Date Picker */}
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                      errors.date && "border-red-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            {/* Value Input */}
            <div className="grid gap-2">
              <Label htmlFor="value">Amount</Label>
              <Input
                id="value"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.00"
                autoComplete="off"
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
                className={errors.value ? "border-red-500" : ""}
              />
              {errors.value && (
                <p className="text-sm text-red-500">{errors.value}</p>
              )}
            </div>

            {/* Description Input */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter expense description"
                autoComplete="off"
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
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
                  ? "Add Expense"
                  : "Update Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
