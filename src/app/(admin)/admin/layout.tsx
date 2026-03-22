import Link from "next/link";
import { LayoutDashboard, Calendar, Users, FileText, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import { SentryErrorBoundary } from "@/components/sentry/SentryErrorBoundary";
import { colors, shadows, radii, typography } from "@/styles/botanical";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Schedule", icon: Calendar },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <SentryErrorBoundary>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex w-16 flex-col items-center py-5 flex-shrink-0"
          style={{
            background: `linear-gradient(180deg, ${colors.card} 0%, ${colors.mutedBg} 100%)`,
            borderRight: `1px solid ${colors.primary}`,
            boxShadow: '2px 0 12px rgba(62, 44, 28, 0.06)',
          }}
        >
          {/* Logo */}
          <div className="mb-7">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white"
              style={{
                background: `linear-gradient(135deg, ${colors.primaryBase} 0%, ${colors.primaryHover} 100%)`,
                boxShadow: `${shadows.button}, inset 0 1px 0 rgba(255,255,255,0.15)`,
                fontFamily: typography.heading,
                fontSize: 'var(--font-size-meta)',
                letterSpacing: '0.04em',
              }}
            >
              KQ
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="sidebar-nav-link group relative w-10 h-10 rounded-xl flex items-center justify-center"
                title={item.label}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {/* Tooltip */}
                <span
                  className="absolute left-full ml-3 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none"
                  style={{
                    background: colors.heading,
                    color: colors.card,
                    boxShadow: shadows.elevated,
                    fontFamily: typography.body,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* User section at bottom */}
          <div className="flex flex-col items-center gap-3 mt-auto">
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                title="Logout"
                className="sidebar-logout-btn w-10 h-10 rounded-xl flex items-center justify-center"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </form>
            <Avatar
              className="h-9 w-9"
              style={{ boxShadow: `0 0 0 2px ${colors.primary}, 0 0 0 4px ${colors.card}` }}
            >
              <AvatarFallback
                className="text-xs font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${colors.primaryBase} 0%, ${colors.primaryHover} 100%)`,
                  color: '#fff',
                  fontFamily: typography.heading,
                }}
              >
                {user?.email?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40" style={{ background: colors.card, borderBottom: `1px solid ${colors.primary}` }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
            style={{
              background: `linear-gradient(135deg, ${colors.primaryBase} 0%, ${colors.primaryHover} 100%)`,
              fontFamily: typography.heading,
            }}
          >
            KQ
          </div>
        </div>

        {/* Mobile bottom navigation */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center py-2 px-4 z-50"
          style={{
            background: colors.card,
            borderTop: `1px solid ${colors.primary}`,
            boxShadow: '0 -2px 12px rgba(62, 44, 28, 0.07)',
            paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="mobile-nav-link flex flex-col items-center gap-1 p-3 rounded-lg"
              title={item.label}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-hidden pb-20 md:pb-0">
          {children}
          <Toaster />
        </main>
      </div>
    </SentryErrorBoundary>
  );
}
