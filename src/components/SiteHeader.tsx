import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { session, role, profile } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
            CF
          </span>
          <span>CampusFix</span>
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
              <Button size="sm" variant="outline" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
