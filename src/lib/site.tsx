import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ThemeKey = "teal" | "navy" | "forest" | "crimson";

export type SiteSettings = {
  id: boolean;
  site_title: string;
  tagline: string;
  logo_url: string | null;
  theme_key: ThemeKey;
  updated_at: string;
};

export type Contact = {
  id: string;
  name: string;
  role_label: string;
  phone: string;
  email: string | null;
  sort_order: number;
};

const DEFAULT_SETTINGS: SiteSettings = {
  id: true,
  site_title: "CampusFix",
  tagline: "Campus maintenance portal",
  logo_url: null,
  theme_key: "teal",
  updated_at: "",
};

type SiteContextValue = {
  settings: SiteSettings;
  contacts: Contact[];
  refreshSite: () => Promise<void>;
};

const SiteContext = createContext<SiteContextValue>({
  settings: DEFAULT_SETTINGS,
  contacts: [],
  refreshSite: async () => undefined,
});

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [contacts, setContacts] = useState<Contact[]>([]);

  async function refreshSite() {
    const [{ data: nextSettings }, { data: nextContacts }] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", true).maybeSingle(),
      supabase.from("contacts").select("*").order("sort_order").order("created_at"),
    ]);
    if (nextSettings) setSettings(nextSettings as SiteSettings);
    setContacts((nextContacts ?? []) as Contact[]);
  }

  useEffect(() => {
    void refreshSite();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme_key;
  }, [settings.theme_key]);

  return (
    <SiteContext.Provider value={{ settings, contacts, refreshSite }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  return useContext(SiteContext);
}