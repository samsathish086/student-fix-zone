ALTER TABLE public.site_settings
ADD COLUMN theme_key text NOT NULL DEFAULT 'teal';

ALTER TABLE public.site_settings
ADD CONSTRAINT site_settings_theme_key_check
CHECK (theme_key IN ('teal', 'navy', 'forest', 'crimson'));
