import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusFix — Report campus & hostel issues" },
      {
        name: "description",
        content:
          "CampusFix lets students report hostel and campus maintenance issues with photos and location, track status and upvote urgent problems.",
      },
      { property: "og:title", content: "CampusFix — Report campus & hostel issues" },
      {
        property: "og:description",
        content:
          "Geotagged complaint reporting for colleges: Wi-Fi, plumbing, electrical, furniture, canteen hygiene and a confidential ragging desk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const CATEGORIES = [
  { title: "Wi-Fi & Network", body: "Dead routers, weak signal, no internet in blocks." },
  { title: "Plumbing", body: "Leaks, blocked drains, no water supply." },
  { title: "Electrical", body: "Power cuts, faulty switches, broken fans and lights." },
  { title: "Furniture", body: "Broken beds, chairs, desks and cupboards." },
  { title: "Canteen & Food", body: "Hygiene concerns, food quality and safety." },
  { title: "Ragging desk", body: "Confidential channel reviewed only by the host." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-secondary/40">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Campus maintenance portal
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Report it once. Track it until it is fixed.
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              CampusFix is the single place where students log hostel and college infrastructure
              problems with a photo and location, follow live status updates, and upvote the issues
              that matter most.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/student-login">Student login</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/staff-login">Staff login</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/host-login">Host login</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">What you can report</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <Card key={c.title}>
                <CardHeader>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{c.body}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-3">
            <div>
              <h3 className="font-semibold">1. Submit</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a photo, pin your location and describe the problem in seconds.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">2. Upvote</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Students push urgent issues to the top so staff see them first.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">3. Resolve</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Staff review the queue, the host responds and updates the status.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        CampusFix · Student-run campus maintenance reporting
      </footer>
    </div>
  );
}
