# ARQWELL Agency — two-sided AEC recruitment intake (November 2026)

Three audience-specific forms added to the existing electric-blue ARQWELL Agency site.

- `/apply/` — AEC professionals looking for jobs, temp work and recruiting introductions.
- `/hire/` — employer recruiting and staffing requests, with optional focused training interest and early budget.
- `/training/` — **under construction** focused entry training and onboarding interest page, with employee count, training topics, timing, estimated budget range AND whether the budget is per-employee or for a full cohort.
- `index.html` — same existing page and services, with its primary calls-to-action now linking to the corresponding application pages. Partner intake remains a preview in the original service page.

## IMPORTANT: What works now

The pages load in any static host (GitHub Pages). Required fields, phone/email/URL validation, accessibility labels and responsive layout are functional. When no endpoint is configured, submissions clearly say **preview only** and **nothing is sent or stored**. This prevents a misleading success message. The applications contain no résumé-upload promise (only links). 

## Connect to Supabase and enable actual application collection

1. Prefer a **dedicated Agency Supabase project**, rather than storing candidate personally identifiable information inside the public-facing ARQWELL Library project.
2. Run `supabase/agency_leads.sql` in the project SQL editor. The `agency_leads` table has RLS enabled with NO anonymous read or write access; the Edge Function writes using its secret service key on the server.
3. Register a Cloudflare Turnstile widget for `arqwell.net` (and `www.arqwell.net`). Obtain the public **site key** and private **secret key**.
4. Deploy the `supabase/functions/agency-intake/index.ts` Supabase Edge Function as `agency-intake`, with `verify_jwt=false`. This is essential because job seekers and hiring managers don't sign in to submit; the handler requires Turnstile and validates fields.
5. Add `TURNSTILE_SECRET_KEY` as a **private** Edge Function secret. Do NOT put it in frontend files or GitHub. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided by the Supabase environment for hosted functions; confirm they are present. The function denies requests until the secrets are available.
6. Edit `intake-config.js`, setting `endpoint` to your project function URL (`https://PROJECT_REF.supabase.co/functions/v1/agency-intake`) and setting `turnstileSiteKey` to your public site key. The endpoint and public site key are safe to expose in static JavaScript.
7. Publish these files together at the root of the arqwell.net GitHub Pages repository. Test ALL THREE forms with synthetic non-personal test data. Verify both resulting rows appear in Supabase Table Editor; then delete the test rows.
8. In the Supabase Table Editor filter `type=candidate`, `type=employer`, or `type=training` and use `status` to move leads from `new` to `contacted`, `qualified`, `matched`, `closed`. Keep database/administration access restricted to authorized ARQWELL staff.

The function blocks unconfigured submissions, unapproved browser origins, missing required fields, and failed spam verification. For higher volume, add server-side abuse monitoring and request-level rate limits. Never rely on CORS or the browser alone to prevent automated abuse.

## Domain and hosting

These files do NOT take control of `arqwell.net`. The `CNAME` file remains prepared for that domain but publishing and DNS setup require identifying the correct hosting repository and DNS provider. The connected GitHub repositories currently found target `arqwell.org` and must not be overwritten as substitutes for `arqwell.net`.

## Data privacy/operation

- Do not collect SSNs, DOBs, identity documents, health history or protected-class data at this initial stage.
- Ask for permission before presenting a candidate to an employer. The form includes an explicit sharing preference; a follow-up conversation is still advised.
- Set retention and deletion procedures, establish a real privacy policy, and secure your Supabase dashboard before public launch.
- Employer applications are **requests**, not active job postings or binding terms. Use written service agreements before beginning sourcing.
- No actual job inventory, resumes, candidate matching engine, dashboard, alerts or emails are represented as working.
