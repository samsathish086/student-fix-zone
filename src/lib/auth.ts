import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "student" | "staff" | "host";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  requested_role: AppRole;
  status: string;
  staff_id_number: string | null;
  staff_id_path: string | null;
  department: string | null;
};

export async function loadProfile(userId: string) {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  const roleList = (roles ?? []).map((r) => r.role as AppRole);
  const role: AppRole = roleList.includes("host")
    ? "host"
    : roleList.includes("staff")
      ? "staff"
      : "student";
  return { profile: (profile as Profile | null) ?? null, role, roleList };
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole>("student");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (userId: string) => {
    const { profile: p, role: r } = await loadProfile(userId);
    setProfile(p);
    setRole(r);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session?.user) await refresh(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) void refresh(s.user.id);
      else {
        setProfile(null);
        setRole("student");
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [refresh]);

  return { session, user: session?.user ?? null, profile, role, loading };
}

export async function signedUrl(bucket: string, path: string | null) {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
