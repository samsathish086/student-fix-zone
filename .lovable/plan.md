# CampusFix visual refresh and host customization

## Goal
Create a more polished, minimalist CampusFix experience while letting the host control the site identity and public contact details. Add transportation as a standard report category.

## What will change
- Refresh the shared visual system with a clean civic-campus style, stronger typography, restrained color, clearer spacing, and polished mobile layouts.
- Redesign the home page around quick reporting, issue categories, report progress, and a prominent contact menu for host and staff phone numbers.
- Make the header and public pages use the saved site title, tagline, logo image link, and selected color theme.
- Add a new **Site settings** area in the host panel where the host can:
  - edit the website title and tagline;
  - set or remove a logo image link with a live preview;
  - choose from several professional color themes;
  - add and remove host/staff contact details.
- Add **College Bus & Transportation** to the home-page issue list and the report form.
- Keep all current account approvals, report privacy, replies, upvotes, and security rules unchanged.

## Data and access
- Extend the existing site settings record with a validated theme identifier.
- Keep site settings and contacts publicly readable so the home page can display them.
- Keep all edits restricted by the existing host-only database rules.
- Validate links and required fields in the host form before saving.

## Verification
- Check the home page, report form, sign-in pages, report feed, and host panel at desktop and mobile sizes.
- Verify the host can save branding/theme changes and manage contacts.
- Verify transportation reports can be submitted and filtered like other maintenance reports.
- Confirm each content page retains complete page-title and sharing metadata.
