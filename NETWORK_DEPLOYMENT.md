# ARQWELL Network / arqwell.net — deployment handoff

The ARQWELL Agency website package contains the electric-blue homepage and three public application pages:
- `/apply/` — AEC candidate interest
- `/hire/` — employer recruiting requests
- `/training/` — training and onboarding interest (under construction)

**Deployment status:** This is a staging branch only. The complete website is provided as `ARQWELL_network_site_publish.zip` in the ChatGPT handoff; this branch does not yet contain the website source. No live DNS or GitHub Pages settings have been changed.

## Recommended destination

Create a dedicated public repository at https://github.com/new named `network`, under account `imanisim`. Unzip the package and upload **all contents at the repository root**, retaining the `apply/`, `hire/`, `training/`, `supabase/` paths. Do not upload only the ZIP and expect GitHub Pages to serve it.

In repository **Settings → Pages**, choose **Deploy from a branch**, `main`, `/(root)`, and custom domain `arqwell.net`. Keep the root `CNAME` file with exactly `arqwell.net`.

At the domain DNS provider, configure apex A records @ to:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```
For www, CNAME `www` -> `imanisim.github.io`.
Confirm there are no conflicting A or CNAME records, preserve MX/TXT records for email, and enable HTTPS after GitHub certificate provisioning. **Do not change DNS until the GitHub Pages custom domain is correctly configured.**

Documentation: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Intake safety

The forms are **preview-only** until the private Supabase intake function, database schema, and Cloudflare Turnstile verification are configured. Do not advertise the forms as accepting applicants until end-to-end tested. Do not store applicant records in GitHub or in a public database.
