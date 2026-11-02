# ARQWELL Network — Agency website deployment

## Current status (November 1, 2026)
The full electric-blue ARQWELL Agency site has been committed and extracted into the `network` branch of `imanisim/arqibox`. GitHub Actions run `41367866007` completed successfully. Verified files include:
- `index.html`, `styles.css`, and `app.js`
- `/apply/index.html` — job seekers
- `/hire/index.html` — employers
- `/training/index.html` — focused training inquiries (under construction)
- `agency-form.css`, `agency-forms.js`, `intake-config.js`
- `supabase/agency_leads.sql` and `supabase/functions/agency-intake/index.ts`
- `CNAME` containing `arqwell.net`

**Domain is NOT connected yet:** publishing settings and DNS records require changes in the GitHub Pages settings and at the DNS provider. Existing `arqwell.org` repositories were not modified.

## Make the website live at arqwell.net

1. Open https://github.com/imanisim/arqibox/settings/pages
2. Under Build and deployment, set Source = **Deploy from a branch**, Branch = **network**, Folder = **/(root)**, and save.
3. Under Custom domain, enter `arqwell.net`, save and verify the domain if prompted. The root CNAME is already present.
4. Then at your domain's DNS provider add apex `@` A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. If you use `www`, add a CNAME pointing to `imanisim.github.io`. Do not delete email-related MX and TXT records. Avoid conflicting web records.
5. Once DNS and the TLS certificate are active, enable **Enforce HTTPS** in GitHub Pages. Verify `https://arqwell.net/`, `/apply/`, `/hire/`, and `/training/`.

Reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Form submission status
The three forms currently validate fields but do not transmit or save submissions; `intake-config.js` has blank endpoint and Turnstile public-site-key settings by design. Before accepting job-seeker information, configure the server-side Supabase Edge Function, restricted database table, Cloudflare Turnstile secret, and public endpoint, and test all three submissions. See `README_FORMS.md` for exact instructions.

## Standalone repository option
A separate repository `imanisim/network` can be created manually at https://github.com/new. If you prefer that location, move the verified source files from this branch into its main branch and configure GitHub Pages and the domain there instead. Do not configure `arqwell.net` on both repositories at the same time.
