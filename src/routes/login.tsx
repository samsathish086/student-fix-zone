import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { GraduationCap, HardHat, ShieldCheck } from "lucide-react";
import { useSite } from "@/lib/site";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — CampusFix" },
      { name: "description", content: "Choose how to sign in to CampusFix: student, staff or host." },
      { property: "og:title", content: "Sign in — CampusFix" },
      { property: "og:description", content: "Student, staff and host sign-in for CampusFix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginHub,
});

function LoginHub() {
  const { settings } = useSite();
  const options = [
    { to: "/student-login", title: "Student", body: "Report issues, upvote and track progress.", icon: GraduationCap },
    { to: "/staff-login", title: "Staff", body: "View and respond after host approval.", icon: HardHat },
    { to: "/host-login", title: "Host", body: "Approve staff and manage the portal.", icon: ShieldCheck },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Secure access</p>
        <h1 className="mt-2 text-3xl font-bold">Sign in to {settings.site_title}</h1>
        <p className="mt-3 text-muted-foreground">Choose the area that matches your role.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {options.map((o) => (
            <Card key={o.to} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <o.icon className="mb-4 size-6 text-primary" />
                <CardTitle className="text-base">{o.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{o.body}</p>
                <Button asChild className="w-full">
                  <Link to={o.to}>Continue</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
