import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/report")({
  head: () => ({
    meta: [
      { title: "New report — CampusFix" },
      {
        name: "description",
        content: "Submit a geotagged campus maintenance report or a confidential ragging report.",
      },
      { property: "og:title", content: "New report — CampusFix" },
      { property: "og:description", content: "Report a campus issue with photo and location." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewReport,
});

const CATEGORIES = [
  "Wi-Fi & Network",
  "Plumbing",
  "Electrical",
  "Furniture",
  "Canteen & Food",
  "Cleanliness",
  "Other",
];

function NewReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("issue");
  const [category, setCategory] = useState(CATEGORIES[0]!);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [anonymous, setAnonymous] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function geotag() {
    if (!navigator.geolocation) return setError("Location is not available on this device.");
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Could not read your location. You can type it instead."),
    );
  }

  async function submit(isRagging: boolean) {
    if (!user) return;
    setBusy(true);
    setError(null);

    let photoPath: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("report-photos").upload(path, file);
      if (upErr) {
        setBusy(false);
        return setError(`Photo upload failed: ${upErr.message}`);
      }
      photoPath = path;
    }

    const { error: insErr } = await supabase.from("reports").insert({
      user_id: user.id,
      category: isRagging ? "Ragging / Harassment" : category,
      title,
      description,
      location: location || null,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      photo_url: photoPath,
      is_ragging: isRagging,
      anonymous: isRagging ? anonymous : false,
    });
    setBusy(false);
    if (insErr) return setError(insErr.message);
    navigate({ to: "/dashboard" });
  }

  const shared = (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short summary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="desc">What happened?</Label>
        <Textarea
          id="desc"
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="loc">Block / room / place</Label>
        <Input
          id="loc"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Hostel B, Room 214"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={geotag}>
          <MapPin className="size-4" /> Use my location
        </Button>
        {coords && (
          <span className="text-xs text-muted-foreground">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="photo">Photo (optional)</Label>
        <Input
          id="photo"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Submit a report</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="issue">Maintenance issue</TabsTrigger>
                <TabsTrigger value="ragging">Ragging desk</TabsTrigger>
              </TabsList>

              <TabsContent value="issue">
                <form
                  className="space-y-4 pt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submit(false);
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="cat">Category</Label>
                    <select
                      id="cat"
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  {shared}
                  <Button className="w-full" disabled={busy}>
                    {busy ? "Submitting…" : "Submit report"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="ragging">
                <form
                  className="space-y-4 pt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submit(true);
                  }}
                >
                  <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    Ragging reports are confidential. Only the host can read them — they never
                    appear in the public feed.
                  </p>
                  {shared}
                  <div className="flex items-center justify-between rounded-md border border-border p-3">
                    <Label htmlFor="anon" className="text-sm font-normal">
                      Hide my name from the host summary
                    </Label>
                    <Switch id="anon" checked={anonymous} onCheckedChange={setAnonymous} />
                  </div>
                  <Button className="w-full" variant="destructive" disabled={busy}>
                    {busy ? "Sending…" : "Send confidential report"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            {error && <p className="pt-4 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
