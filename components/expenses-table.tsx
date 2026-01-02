"use no memo"; // TODO: Remove after TanStack Table adds React Compiler support

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowDownToLine,
  ArrowUpFromLine,
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
  type LucideIcon,
} from "lucide-react";
import { Expense, Category, Account } from "@/lib/types";
import { parse } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import { formatDateShort } from "@/lib/date-format";
import { useLocale, useTranslations } from "next-intl";

// Icon mapping for dynamic lookup
const ICON_MAP: Record<string, LucideIcon> = {
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
};

// Helper function to safely get icon component
const getIconComponent = (iconName: string): LucideIcon => {
  if (!iconName) return Wallet;

  // Try to get icon from the map
  const icon = ICON_MAP[iconName];

  // If not found, log for debugging and use fallback
  if (!icon) {
    console.warn(
      `Icon "${iconName}" not found in ICON_MAP, using Wallet as fallback`,
    );
    return Wallet;
  }

  return icon;
};

interface ExpensesTableProps {
  expenses: Expense[];
  categories: Category[];
  accounts: Account[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpensesTable({
  expenses,
  categories,
  accounts,
  onEdit,
  onDelete,
}: ExpensesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const locale = useLocale() as "en" | "pt";
  const t = useTranslations("table");

  const getCategoryById = (id: number) => {
    return categories.find((cat) => cat.id === id);
  };

  const getAccountById = (id: number) => {
    return accounts.find((acc) => acc.id === id);
  };

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("date")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const dateString = row.getValue("date") as string;
        const date = parse(dateString, "yyyy-MM-dd", new Date());
        return (
          <div className="font-medium">{formatDateShort(date, locale)}</div>
        );
      },
    },
    {
      accessorKey: "description",
      header: t("description"),
      cell: ({ row }) => {
        const description = row.getValue("description") as string | null;
        return (
          <div className="text-sm text-muted-foreground">
            {description || "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "categoryId",
      header: t("category"),
      cell: ({ row }) => {
        const category = getCategoryById(row.getValue("categoryId"));
        if (!category) return <div>—</div>;

        const IconComponent = getIconComponent(category.icon);
        const expense = row.original;
        const savingsType = expense.savingsType;

        return (
          <div className="flex items-center gap-2">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{ backgroundColor: category.color }}
            >
              <IconComponent className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                {category.name}
              </span>
            </div>
            {savingsType && (
              <div
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                  savingsType === "deposit"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                }`}
              >
                {savingsType === "deposit" ? (
                  <ArrowDownToLine className="w-3 h-3" />
                ) : (
                  <ArrowUpFromLine className="w-3 h-3" />
                )}
                {savingsType === "deposit" ? t("deposit") : t("withdrawal")}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "accountId",
      header: t("account"),
      cell: ({ row }) => {
        const account = getAccountById(row.getValue("accountId"));
        if (!account) return <div>—</div>;

        const IconComponent = getIconComponent(account.icon);

        return (
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ backgroundColor: account.color }}
          >
            <IconComponent className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              {account.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("amount")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = parseFloat(row.getValue("value"));
        const formatted = formatCurrency({ locale, value });
        return <div className="font-semibold">{formatted}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(expense)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(expense)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {useTranslations("common")("noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {useTranslations("common")("previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {useTranslations("common")("next")}
        </Button>
      </div>
    </div>
  );
}
