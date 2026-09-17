import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadProfile } from "@/lib/auth";

export const Route = createFileRoute("/host-login")({
  head: () => ({
    meta: [
      { title: "Host login — CampusFix" },
      {
        name: "description",
        content: "Private host sign-in to approve staff accounts and manage every campus report.",
      },
      { property: "og:title", content: "Host login — CampusFix" },
      { property: "og:description", content: "Host control panel access for CampusFix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HostLogin,
});

function HostLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setBusy(false);
      return setError(error?.message ?? "Sign in failed");
    }
    const { role } = await loadProfile(data.user.id);
    if (role !== "host") {
      await supabase.auth.signOut();
      setBusy(false);
      return setError("This account is not the host account.");
    }
    setBusy(false);
    navigate({ to: "/host" });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-14">
        <Card>
          <CardHeader>
            <CardTitle>Host sign-in</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={signIn}>
              <div className="space-y-2">
                <Label htmlFor="hemail">Host user ID (email)</Label>
                <Input
                  id="hemail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hpass">Password</Label>
                <Input
                  id="hpass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" disabled={busy}>
                {busy ? "Please wait…" : "Enter host panel"}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
