import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadProfile } from "@/lib/auth";

export const Route = createFileRoute("/staff-login")({
  head: () => ({
    meta: [
      { title: "Staff login — CampusFix" },
      {
        name: "description",
        content:
          "Campus staff register with their staff ID card and sign in once the host approves the request.",
      },
      { property: "og:title", content: "Staff login — CampusFix" },
      { property: "og:description", content: "Host-approved staff access to CampusFix reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StaffLogin,
});

function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [staffId, setStaffId] = useState("");
  const [department, setDepartment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setBusy(false);
      return setError(error?.message ?? "Sign in failed");
    }
    const { profile, role } = await loadProfile(data.user.id);
    if (role === "host") {
      setBusy(false);
      navigate({ to: "/host" });
      return;
    }
    if (role !== "staff" || profile?.status !== "approved") {
      await supabase.auth.signOut();
      setBusy(false);
      return setError(
        profile?.status === "rejected"
          ? "Your staff request was rejected by the host."
          : "Your staff account is waiting for host approval.",
      );
    }
    setBusy(false);
    navigate({ to: "/dashboard" });
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("Please upload a photo of your staff ID card.");
    setBusy(true);
    setError(null);
    setNotice(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          requested_role: "staff",
          staff_id_number: staffId,
          department,
        },
      },
    });
    if (error || !data.user) {
      setBusy(false);
      return setError(error?.message ?? "Registration failed");
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${data.user.id}/staff-id.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("staff-ids")
      .upload(path, file, { upsert: true });
    if (!upErr) {
      await supabase.from("profiles").update({ staff_id_path: path }).eq("id", data.user.id);
    }
    await supabase.auth.signOut();
    setBusy(false);
    setNotice(
      upErr
        ? `Account created, but the ID upload failed (${upErr.message}). Please register again with a smaller image.`
        : "Request sent. The host will review your staff ID and approve your login.",
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-14">
        <Card>
          <CardHeader>
            <CardTitle>Staff access</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="request">Request access</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form className="space-y-4 pt-4" onSubmit={signIn}>
                  <div className="space-y-2">
                    <Label htmlFor="semail">Work email</Label>
                    <Input
                      id="semail"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spass">Password</Label>
                    <Input
                      id="spass"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" disabled={busy}>
                    {busy ? "Please wait…" : "Sign in"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Forgot your password? Only the host can reset it for you.
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="request">
                <form className="space-y-4 pt-4" onSubmit={register}>
                  <div className="space-y-2">
                    <Label htmlFor="sname">Full name</Label>
                    <Input
                      id="sname"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sid">Staff ID number</Label>
                    <Input
                      id="sid"
                      required
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept">Department</Label>
                    <Input
                      id="dept"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idcard">Staff ID card photo</Label>
                    <Input
                      id="idcard"
                      type="file"
                      accept="image/*,application/pdf"
                      required
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semail2">Work email</Label>
                    <Input
                      id="semail2"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spass2">Create password</Label>
                    <Input
                      id="spass2"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" disabled={busy}>
                    {busy ? "Sending request…" : "Send request to host"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            {error && <p className="pt-4 text-sm text-destructive">{error}</p>}
            {notice && <p className="pt-4 text-sm text-primary">{notice}</p>}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
