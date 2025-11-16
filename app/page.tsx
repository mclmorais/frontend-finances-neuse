'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
        <header className="border-b bg-white dark:bg-zinc-900">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-semibold">Finance Neuse</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {user?.email}
              </span>
              <Button variant="outline" onClick={signOut}>
                Sign out
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto flex-1 px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <h2 className="text-3xl font-bold">
              Welcome to Finance Neuse
            </h2>
            <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
              Your personal finance management application.
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
