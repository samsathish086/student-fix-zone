import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bus,
  ChevronDown,
  Droplets,
  Hammer,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  ThumbsUp,
  Utensils,
  Wifi,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useSite } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusFix — Campus issues, clearly resolved" },
      {
        name: "description",
        content:
          "Report campus, hostel and college transportation issues with photos and location, then track progress in one place.",
      },
      { property: "og:title", content: "CampusFix — Campus issues, clearly resolved" },
      {
        property: "og:description",
        content: "A direct reporting channel for campus maintenance, transport and student safety.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const CATEGORIES = [
  { title: "Wi-Fi & Network", body: "Connectivity across classrooms and hostels.", icon: Wifi },
  { title: "Plumbing", body: "Leaks, drainage and water supply.", icon: Droplets },
  { title: "Electrical", body: "Power, lighting, fans and switches.", icon: Zap },
  { title: "Furniture", body: "Beds, desks, chairs and shared facilities.", icon: Hammer },
  { title: "Canteen & Food", body: "Food quality, hygiene and safety.", icon: Utensils },
  { title: "College Bus & Transportation", body: "Routes, delays, safety and vehicle issues.", icon: Bus },
];

function Landing() {
  const { settings, contacts } = useSite();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-secondary/45">
          <div className="mx-auto grid min-h-[520px] max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-3 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" /> {settings.tagline}
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
                Campus issues, reported clearly and resolved faster.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                A direct line between students and campus teams. Add a photo and location, follow
                every update, and help urgent issues get seen.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/student-login">Report an issue <ArrowRight /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/login">Staff & host access</Link>
                </Button>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><MapPin className="size-4 text-primary" /> Location-aware</span>
                <span className="flex items-center gap-2"><ThumbsUp className="size-4 text-primary" /> Community priority</span>
                <span className="flex items-center gap-2"><Shield className="size-4 text-primary" /> Confidential safety desk</span>
              </div>
            </div>

            <div className="border-l-2 border-primary pl-6 sm:pl-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">How it works</p>
              <ol className="mt-6 space-y-7">
                {[
                  ["01", "Submit", "Describe the issue, attach evidence and share its location."],
                  ["02", "Prioritize", "Students upvote issues that need immediate attention."],
                  ["03", "Resolve", "Staff reply, update progress and close the loop."],
                ].map(([number, title, body]) => (
                  <li key={number} className="grid grid-cols-[42px_1fr] gap-4">
                    <span className="text-sm font-bold text-primary">{number}</span>
                    <div>
                      <h2 className="font-semibold">{title}</h2>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">One place to report</p>
              <h2 className="mt-2 text-3xl font-bold">Everyday campus concerns</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Choose the closest category when submitting. Campus teams can then route it to the right person.
            </p>
          </div>
          <div className="mt-8 grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map(({ title, body, icon: Icon }) => (
              <div key={title} className="min-h-44 border-b border-r border-border bg-card p-6 transition-colors hover:bg-secondary/50">
                <Icon className="size-6 text-primary" />
                <h3 className="mt-7 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-foreground text-background">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-4 py-12 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-background/70">Need direct help?</p>
              <h2 className="mt-2 text-2xl font-bold">Contact the campus team</h2>
              <p className="mt-2 text-sm text-background/70">Call or email the listed host and staff desks.</p>
            </div>
            <details className="group relative w-full md:w-auto">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                Contact directory <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-2 grid gap-2 rounded-md bg-background p-2 text-foreground md:absolute md:right-0 md:z-10 md:w-80 md:shadow-xl">
                {contacts.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">No contact details available.</p>
                ) : contacts.map((contact) => (
                  <div key={contact.id} className="border-b border-border p-3 last:border-0">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="font-semibold">{contact.name}</p><p className="text-xs capitalize text-muted-foreground">{contact.role_label}</p></div>
                      <a href={`tel:${contact.phone}`} className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground" aria-label={`Call ${contact.name}`} title={`Call ${contact.name}`}><Phone className="size-4" /></a>
                    </div>
                    <p className="mt-2 text-sm">{contact.phone}</p>
                    {contact.email && <a href={`mailto:${contact.email}`} className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"><Mail className="size-3" />{contact.email}</a>}
                  </div>
                ))}
              </div>
            </details>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="font-semibold text-foreground">{settings.site_title}</span>
        <span>{settings.tagline}</span>
      </footer>
    </div>
  );
}