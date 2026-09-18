import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowBigUp, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, signedUrl } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Report feed — CampusFix" },
      { name: "description", content: "Live feed of campus and hostel maintenance reports." },
      { property: "og:title", content: "Report feed — CampusFix" },
      { property: "og:description", content: "Track and upvote open campus maintenance reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

export type ReportRow = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  is_ragging: boolean;
  anonymous: boolean;
  status: string;
  response: string | null;
  created_at: string;
};

export function StatusBadge({ status }: { status: string }) {
  const label: Record<string, string> = {
    submitted: "Submitted",
    in_progress: "In progress",
    resolved: "Resolved",
    rejected: "Rejected",
  };
  const variant =
    status === "resolved" ? "default" : status === "rejected" ? "destructive" : "secondary";
  return <Badge variant={variant}>{label[status] ?? status}</Badge>;
}

export function ReportPhoto({ path }: { path: string | null }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    void signedUrl("report-photos", path).then(setUrl);
  }, [path]);
  if (!url) return null;
  return (
    <img src={url} alt="Reported issue" className="mt-3 max-h-64 w-full rounded-md object-cover" />
  );
}

const STATUS_OPTIONS = ["submitted", "in_progress", "resolved", "rejected"];

function ReplyBox({ r, onSaved }: { r: ReportRow; onSaved: () => void }) {
  const [status, setStatus] = useState(r.status);
  const [response, setResponse] = useState(r.response ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase
      .from("reports")
      .update({ status, response, updated_at: new Date().toISOString() })
      .eq("id", r.id);
    setBusy(false);
    setMsg(error ? error.message : "Reply sent to the student.");
    if (!error) onSaved();
  }

  return (
    <div className="mt-3 space-y-2 rounded-md border border-border p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Reply to reporter
      </p>
      <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
        <Textarea
          rows={2}
          placeholder="Write a reply for the student"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" disabled={busy} onClick={save}>
          Send reply
        </Button>
        {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, role } = useAuth();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    setReports((data ?? []) as ReportRow[]);
    const [{ data: countRows }, { data: own }] = await Promise.all([
      supabase.rpc("report_vote_counts"),
      supabase.from("report_upvotes").select("report_id"),
    ]);
    const counts: Record<string, number> = {};
    for (const row of countRows ?? []) counts[row.report_id] = Number(row.votes);
    setVotes(counts);
    setMine(new Set((own ?? []).map((r) => r.report_id)));
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function toggleVote(id: string) {
    if (!user) return;
    if (mine.has(id)) {
      await supabase.from("report_upvotes").delete().eq("report_id", id).eq("user_id", user.id);
    } else {
      await supabase.from("report_upvotes").insert({ report_id: id, user_id: user.id });
    }
    void load();
  }

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(reports.map((r) => r.category)))],
    [reports],
  );
  const visible = reports.filter((r) => filter === "all" || r.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campus reports</h1>
            <p className="text-sm text-muted-foreground">
              {role === "staff" || role === "host"
                ? "Update the status and reply to students directly on each report."
                : "Upvote the issues that need attention first."}
            </p>
          </div>
          {role !== "staff" && (
            <Button asChild>
              <Link to="/report">New report</Link>
            </Button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={filter === c ? "default" : "outline"}
              onClick={() => setFilter(c)}
            >
              {c === "all" ? "All" : c}
            </Button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {loading && <p className="text-sm text-muted-foreground">Loading reports…</p>}
          {!loading && visible.length === 0 && (
            <p className="text-sm text-muted-foreground">No reports yet.</p>
          )}
          {visible.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{r.title}</CardTitle>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{r.category}</Badge>
                    <StatusBadge status={r.status} />
                    {r.is_ragging && <Badge variant="destructive">Confidential</Badge>}
                    <span>{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={mine.has(r.id) ? "default" : "outline"}
                  onClick={() => toggleVote(r.id)}
                  className="shrink-0"
                >
                  <ArrowBigUp className="size-4" /> {votes[r.id] ?? 0}
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{r.description}</p>
                {(r.location || r.latitude) && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {r.location}
                    {r.latitude != null &&
                      ` (${r.latitude.toFixed(5)}, ${r.longitude?.toFixed(5)})`}
                  </p>
                )}
                <ReportPhoto path={r.photo_url} />
                {r.response && (
                  <p className="mt-3 rounded-md bg-secondary p-3 text-sm">
                    <span className="font-medium">Official response: </span>
                    {r.response}
                  </p>
                )}
                {(role === "staff" || role === "host") && <ReplyBox r={r} onSaved={load} />}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
