# ContratarLATAM (prototype)

Static site (plain HTML/CSS/JS, no build step) comparing EOR / global payroll providers for hiring in Argentina, Brazil, Chile, Colombia and Mexico, with a sourced employer-cost estimator.

Deploy target: GitHub Pages project site `https://redacteddutchman.github.io/contratarlatam/`. All internal links/assets use the `/contratarlatam/` prefix; JSON is fetched from `/contratarlatam/data/…` (base taken from `<html data-base>`).

## Structure
- `index.html` – home + estimator (AR, BR, CL, CO, MX; assumptions listed on each country page).
- `providers/` – table rendered from `data/providers.json` (server-rendered fallback rows + JS filter by country).
- `countries/{argentina,colombia,mexico}/`, `compare/{deel-vs-remote,deel-vs-rippling}/`, `guides/eor-vs-contractor-argentina/`
- `methodology/`, `get-listed/` (form disabled), `newsletter/` (form disabled), `404.html`, `sitemap.xml`, `robots.txt`, `.nojekyll`
- `data/providers.json`, `data/rates.json` – every figure has source URL + as_of.
- `assets/js/calc.js` – pure estimator (works in Node: `require('./assets/js/calc.js')`), `assets/js/app.js` – UI.
- Pages were generated once by `/workspace/build_site.py` (outside the site; optional – HTML can be edited directly).

## TODO (owner)
- [ ] Spanish version under `/contratarlatam/es/` (mirror paths; add `hreflang="es"` + `x-default` alternates and sitemap entries).
- [ ] Affiliate programs to apply for (not applied; links are plain provider links for now):
  - Deel partner/affiliate program via PartnerStack – https://partners.deel.com/ . NOTE: Deel's separate customer *referral* program does not allow public posting of referral links – use only the partner/affiliate program for the site.
  - Wise Business affiliate program – https://wise.com/gb/affiliate-program/
  - Remote partner program – https://remote.com/partners
  - Check partner/affiliate programs of Oyster, Multiplier, Playroll, Rivermate, RemotePeople (not verified yet).
  - When affiliate links go live, add `rel="sponsored"` and keep the disclosure on /methodology/.
- [ ] Get-listed pricing and a real form backend (currently disabled, “Opens soon”).
- [ ] Newsletter provider (e.g. Buttondown/MailerLite) – form disabled.
- [ ] OG image (`og:image`) – none yet.
- [ ] Verify Deel, Oyster, Rippling, RemotePeople, G-P, Safeguard country pages for AR/CO/MX (currently “Not verified” in table); add Papaya Global and Velocity Global once a public page/price can be confirmed (pricing pages returned 403/404 on 2026-10-28).
- [ ] Re-check all figures periodically (as_of 2026-10-28). Argentina: Ley 27.802 / FAL start date keeps moving; Colombia: 2026 SMMLV is provisional (Decreto 0159/2026) pending Consejo de Estado.
- [ ] Peru/Uruguay pages (providers' country pages verified, statutory rates not yet researched).
- [ ] Pros/cons per provider from independent reviews (G2/Capterra/Trustpilot not yet sourced; `pros`/`cons` arrays are empty).
- [ ] Velocity Global (pricing URL redirects to hellopebl.com 404), Omnipresent (no response), Safeguard Global (no public price) – recheck.
- [ ] Chile employer pension rate steps up every August (3.5% until Jul 2027) – update rates.json.
- [ ] robots.txt at a project subpath is not read by crawlers (only domain root counts); submit sitemap in Google Search Console instead, or move to a custom domain.
