"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMe, useUpdateMe } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { data: user, isLoading } = useMe();
  const updateMe = useUpdateMe();
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (user) setFullName(user.full_name ?? "");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateMe.mutateAsync({ full_name: fullName || null });
      toast({ title: "Profile updated", description: "Your name has been saved." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <span className="font-bold text-lg">SaaS App</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent transition-colors"
          >
            <span>📊</span>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-md px-3 py-2 bg-accent font-medium transition-colors"
          >
            <span>👤</span>
            <span>Profile</span>
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal information.
            </p>
          </div>

          <div className="rounded-lg border border-border p-6 space-y-6">
            <h2 className="text-xl font-semibold">Account Details</h2>

            {user && (
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="full_name"
                  className="text-sm font-medium leading-none"
                >
                  Full Name
                </label>
                <input
                  id="full_name"
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <button
                type="submit"
                disabled={updateMe.isPending}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {updateMe.isPending ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Account Status</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Active
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium">
                  {user?.is_superuser ? "Admin" : "User"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Member since</p>
                <p className="font-medium">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
