"use client";

import { useMe, useLogout } from "@/hooks/use-auth";
import { useUIStore } from "@/store/ui-store";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function DashboardPage() {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { theme, setTheme } = useTheme();

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
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 bg-card border-r border-border flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-border">
          {sidebarOpen && (
            <span className="font-bold text-lg">SaaS App</span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent transition-colors font-medium"
          >
            <span>📊</span>
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent transition-colors"
          >
            <span>👤</span>
            {sidebarOpen && <span>Profile</span>}
          </Link>
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={() => setTheme(THEME_CYCLE[theme ?? "system"] ?? "dark")}
            className="flex items-center gap-3 rounded-md px-3 py-2 w-full hover:bg-accent transition-colors text-sm"
            aria-label="Toggle theme"
          >
            <span>{THEME_ICON[theme ?? "system"] ?? "💻"}</span>
            {sidebarOpen && (
              <span className="capitalize">{theme ?? "system"}</span>
            )}
          </button>
          <button
            onClick={() => logout.mutate()}
            className="flex items-center gap-3 rounded-md px-3 py-2 w-full hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back{user?.full_name ? `, ${user.full_name}` : ""}!
            </p>
          </div>

          {user && (
            <div className="rounded-lg border border-border p-6 space-y-4">
              <h2 className="text-xl font-semibold">Your Account</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{user.full_name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Active
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium">
                    {user.is_superuser ? "Admin" : "User"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border p-6"
              >
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

const THEME_CYCLE: Record<string, string> = {
  dark: "light",
  light: "system",
  system: "dark",
};

const THEME_ICON: Record<string, string> = {
  dark: "🌙",
  light: "☀️",
  system: "💻",
};

const stats = [
  { label: "Projects", value: "12" },
  { label: "Team Members", value: "4" },
  { label: "API Calls Today", value: "1,234" },
];
