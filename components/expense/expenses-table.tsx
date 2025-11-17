'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import type { Expense } from '@/lib/types/expense';
import type { Category } from '@/lib/types/category';
import type { Account } from '@/lib/types/account';

interface ExpensesTableProps {
  expenses: Expense[];
  categories: Category[];
  accounts: Account[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export function ExpensesTable({
  expenses,
  categories,
  accounts,
  onEdit,
  onDelete,
  isDeleting = false,
}: ExpensesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: true },
  ]);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  // Create lookups for categories and accounts
  const categoryMap = React.useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const accountMap = React.useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts]
  );

  const columns: ColumnDef<Expense>[] = React.useMemo(
    () => [
      {
        id: 'category',
        accessorFn: (row) => categoryMap.get(row.categoryId)?.name || 'Unknown',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2"
            >
              Category
              <ArrowUpDown className="ml-2 size-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const category = categoryMap.get(row.original.categoryId);
          if (!category) return <span className="text-muted-foreground">Unknown</span>;

          return (
            <Badge
              variant="outline"
              style={{
                backgroundColor: `${category.color}20`,
                borderColor: category.color,
                color: category.color,
              }}
            >
              {category.name}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'value',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2"
            >
              Value
              <ArrowUpDown className="ml-2 size-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const value = parseFloat(row.original.value);
          return (
            <span className="font-medium">
              R$ {value.toFixed(2).replace('.', ',')}
            </span>
          );
        },
        sortingFn: (rowA, rowB) => {
          const valueA = parseFloat(rowA.original.value);
          const valueB = parseFloat(rowB.original.value);
          return valueA - valueB;
        },
      },
      {
        accessorKey: 'description',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2"
            >
              Description
              <ArrowUpDown className="ml-2 size-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <span className={!row.original.description ? 'text-muted-foreground' : ''}>
            {row.original.description || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'date',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2"
            >
              Date
              <ArrowUpDown className="ml-2 size-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.original.date);
          return (
            <span className="text-muted-foreground">
              {date.toLocaleDateString('pt-BR')}
            </span>
          );
        },
      },
      {
        id: 'account',
        accessorFn: (row) => accountMap.get(row.accountId)?.name || 'Unknown',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2"
            >
              Account
              <ArrowUpDown className="ml-2 size-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const account = accountMap.get(row.original.accountId);
          if (!account) return <span className="text-muted-foreground">Unknown</span>;

          return (
            <Badge
              variant="outline"
              style={{
                backgroundColor: `${account.color}20`,
                borderColor: account.color,
                color: account.color,
              }}
            >
              {account.name}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [categoryMap, accountMap, onEdit]
  );

  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const handleDelete = () => {
    if (deleteId !== null) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
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
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No expenses found. Click "Add Expense" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
