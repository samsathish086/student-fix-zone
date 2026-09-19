import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useSite } from "@/lib/site";

export function SiteHeader() {
  const { session, role, profile } = useAuth();
  const { settings } = useSite();
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex min-w-0 items-center gap-3 font-semibold">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="" className="size-9 rounded-md border border-border object-cover" />
          ) : (
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              {settings.site_title.slice(0, 2).toUpperCase()}
            </span>
          )}
          <span className="truncate text-base">{settings.site_title}</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {session ? (
            <>
              <Link to="/dashboard" className="px-2 text-muted-foreground hover:text-foreground">
                Reports
              </Link>
              {role === "host" && (
                <Link to="/host" className="px-2 text-muted-foreground hover:text-foreground">
                  Host panel
                </Link>
              )}
              <span className="hidden px-2 text-xs text-muted-foreground sm:inline">
                {profile?.full_name || session.user.email} · {role}
              </span>
              <Button size="icon" variant="outline" onClick={handleSignOut} title="Sign out" aria-label="Sign out">
                <LogOut />
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link to="/login"><ShieldCheck /> Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
