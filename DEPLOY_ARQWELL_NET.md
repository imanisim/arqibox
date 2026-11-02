# ARQWELL Agency — Blue Edition · arqwell.net publishing steps

## Status
The website files are ready for a new GitHub Pages deployment, **but the custom domain is not connected**. The only matching connected GitHub repositories found were `imanisim/Arqwell_site` and `imanisim/Arq.web`; their `CNAME` files identify `arqwell.org` and `www.arqwell.org` respectively. **Do not replace either repository's CNAME:** doing so could disconnect an existing website.

## Design update
- The HTML layout, text, links, sections, form fields, and JavaScript behavior remain the same as agency-services v1.
- Only CSS colors and the HTML `theme-color` value changed. No backend has been added; the form remains a demonstration and will not send or save information.

## Publish to arqwell.net using a dedicated repository
1. On GitHub, create a new public repository under `imanisim`, for example `arqwell-net` (or select the separate repository you already use for arqwell.net).
2. Upload these files **to the repository root**, keeping exactly these names together: `index.html`, `styles.css`, `app.js`, `CNAME`. The CNAME file contains `arqwell.net`.
3. On GitHub open **Settings → Pages → Build and deployment**, select **Deploy from a branch**, set `main` and `/(root)`, and save. Set or confirm **Custom domain** `arqwell.net` under Pages and verify domain ownership if GitHub requests it.
4. At the domain's DNS provider, configure four **A** records for `@`:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
5. Optional but recommended: add `www` **CNAME** to `imanisim.github.io` so that the www variant can redirect to the apex domain. Do not create wildcard DNS records. Avoid conflicting A/AAAA/ALIAS/ANAME records for the apex, and don't delete email-related MX/TXT records.
6. In GitHub Pages, enable **Enforce HTTPS** when a certificate has been provisioned. Confirm `https://arqwell.net/` loads the blue agency page.

**Important:** Changes to DNS are performed in the account that controls the domain and cannot be carried out merely by uploading these files. Confirm any existing records before replacing them; if arqwell.net already hosts another site, these steps would replace its public destination, so first identify that site's repository/host.

GitHub documentation: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Test locally
Open `index.html` in your browser, or serve this folder using `python -m http.server 8000` and open `http://localhost:8000`.

## Integration note
Once published, the demonstration inquiry form still needs a secure backend before you can collect requests. That wasn't changed because the request was for colors and domain publication only.

## Additional training interest page

The third application is `/training/`, labeled **Under construction**, and is intended for early requests for entry training and new-employee onboarding, including employer budget per employee or cohort. It uses the same `agency-intake` Edge Function; if a prior 2-category schema is already installed, run the updated SQL to permit `type=training`.
