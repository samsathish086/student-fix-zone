import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, signedUrl, type Profile } from "@/lib/auth";
import { resetStaffPassword } from "@/lib/host.functions";
import { ReportPhoto, StatusBadge, type ReportRow } from "./dashboard";

export const Route = createFileRoute("/_authenticated/host")({
  head: () => ({
    meta: [
      { title: "Host panel — CampusFix" },
      {
        name: "description",
        content: "Approve or reject staff logins, reset staff passwords and respond to reports.",
      },
      { property: "og:title", content: "Host panel — CampusFix" },
      { property: "og:description", content: "CampusFix host controls for staff and reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HostPanel,
});

const STATUSES = ["submitted", "in_progress", "resolved", "rejected"];

function StaffCard({ p, onChanged }: { p: Profile; onChanged: () => void }) {
  const [idUrl, setIdUrl] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const reset = useServerFn(resetStaffPassword);

  useEffect(() => {
    void signedUrl("staff-ids", p.staff_id_path).then(setIdUrl);
  }, [p.staff_id_path]);

  async function decide(approve: boolean) {
    setBusy(true);
    setMsg(null);
    await supabase
      .from("profiles")
      .update({ status: approve ? "approved" : "rejected" })
      .eq("id", p.id);
    if (approve) {
      await supabase.from("user_roles").insert({ user_id: p.id, role: "staff" });
    } else {
      await supabase.from("user_roles").delete().eq("user_id", p.id).eq("role", "staff");
    }
    setBusy(false);
    onChanged();
  }

  async function doReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await reset({ data: { staffUserId: p.id, newPassword } });
      setNewPassword("");
      setMsg("Password updated. Share it with the staff member.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not reset password");
    }
    setBusy(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {p.full_name || p.email}
          <Badge
            variant={
              p.status === "approved"
                ? "default"
                : p.status === "rejected"
                  ? "destructive"
                  : "secondary"
            }
          >
            {p.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          {p.email} · Staff ID {p.staff_id_number || "—"} · {p.department || "No department"}
        </p>
        {idUrl ? (
          <a href={idUrl} target="_blank" rel="noreferrer">
            <img
              src={idUrl}
              alt="Staff ID card"
              className="max-h-56 rounded-md border border-border object-contain"
            />
          </a>
        ) : (
          <p className="text-xs text-muted-foreground">No ID card uploaded.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={busy} onClick={() => decide(true)}>
            Approve login
          </Button>
          <Button size="sm" variant="destructive" disabled={busy} onClick={() => decide(false)}>
            Reject
          </Button>
        </div>
        <form className="flex flex-wrap items-end gap-2" onSubmit={doReset}>
          <div className="space-y-1">
            <Label htmlFor={`pw-${p.id}`} className="text-xs">
              Set new password
            </Label>
            <Input
              id={`pw-${p.id}`}
              type="text"
              minLength={8}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-56"
            />
          </div>
          <Button size="sm" variant="outline" disabled={busy}>
            Reset password
          </Button>
        </form>
        {msg && <p className="text-xs text-primary">{msg}</p>}
      </CardContent>
    </Card>
  );
}

function ReportAdmin({ r, onChanged }: { r: ReportRow; onChanged: () => void }) {
  const [status, setStatus] = useState(r.status);
  const [response, setResponse] = useState(r.response ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await supabase
      .from("reports")
      .update({ status, response, updated_at: new Date().toISOString() })
      .eq("id", r.id);
    setBusy(false);
    onChanged();
  }

  async function remove() {
    setBusy(true);
    await supabase.from("reports").delete().eq("id", r.id);
    setBusy(false);
    onChanged();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {r.title}
          <Badge variant="outline">{r.category}</Badge>
          <StatusBadge status={r.status} />
          {r.is_ragging && <Badge variant="destructive">Confidential</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>{r.description}</p>
        <p className="text-xs text-muted-foreground">
          {r.location} {r.latitude != null && `· ${r.latitude}, ${r.longitude}`} ·{" "}
          {new Date(r.created_at).toLocaleString()}
          {r.is_ragging && r.anonymous && " · reporter chose to stay anonymous"}
        </p>
        <ReportPhoto path={r.photo_url} />
        <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <Textarea
            rows={2}
            placeholder="Write a response for the reporter"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" disabled={busy} onClick={save}>
            Save update
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={remove}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HostPanel() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Profile[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);

  async function load() {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .eq("requested_role", "staff")
      .order("created_at", { ascending: false });
    setStaff((profiles ?? []) as Profile[]);
    const { data: rows } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    setReports((rows ?? []) as ReportRow[]);
  }

  useEffect(() => {
    if (!loading && role !== "host") navigate({ to: "/dashboard", replace: true });
    if (role === "host") void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, loading]);

  if (loading || role !== "host") {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <p className="p-8 text-sm text-muted-foreground">Checking host access…</p>
      </div>
    );
  }

  const pending = staff.filter((s) => s.status === "pending");
  const others = staff.filter((s) => s.status !== "pending");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight">Host panel</h1>
        <p className="text-sm text-muted-foreground">
          Approve staff logins, reset staff passwords and respond to every report.
        </p>

        <Tabs defaultValue="staff" className="mt-6">
          <TabsList>
            <TabsTrigger value="staff">Staff requests ({pending.length})</TabsTrigger>
            <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="space-y-4 pt-4">
            {pending.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending staff requests.</p>
            )}
            {pending.map((p) => (
              <StaffCard key={p.id} p={p} onChanged={load} />
            ))}
            {others.length > 0 && (
              <>
                <h2 className="pt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Reviewed staff
                </h2>
                {others.map((p) => (
                  <StaffCard key={p.id} p={p} onChanged={load} />
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4 pt-4">
            {reports.map((r) => (
              <ReportAdmin key={r.id} r={r} onChanged={load} />
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
