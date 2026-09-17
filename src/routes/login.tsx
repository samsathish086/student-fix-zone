import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
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
  const options = [
    { to: "/student-login", title: "Student", body: "Report issues, upvote and track progress." },
    { to: "/staff-login", title: "Staff", body: "View reports after host approval of your staff ID." },
    { to: "/host-login", title: "Host", body: "Approve staff and manage every report." },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Sign in to CampusFix</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {options.map((o) => (
            <Card key={o.to}>
              <CardHeader>
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
