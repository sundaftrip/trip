# Sundaf Visa Database Audit - 2026-06-28

Scope: read-only audit of the live Sundaf visa database, local Prisma data, local seed files, and current public/official reference sources available on 2026-06-28.

## Verdict

[Certain] The live API `https://sundaftrip.com/api/visa-database` returns 88 entries.

[Certain] The local Prisma `CountryVisa` table also returns 88 entries.

[Certain] The live API and local Prisma data match for `visa`, `stay`, `cost`, and `notes`.

[Likely] The database is not safe to describe as fully compliant yet. The main issue is not deployment drift; it is content semantics.

## Highest Risk Findings

1. [Certain] `Taiwan` is listed as `evisa` with `30 hari`.
   [Likely] This is too broad. BOCA confirms Indonesians can apply for an R.O.C. Travel Authorization Certificate, which is conditional and should not be presented as a generic e-visa.
   Source: https://www.boca.gov.tw/cp-152-274-8c0e2-2.html

2. [Certain] `Nepal` is listed as `evisa`, while its note says `VOA Application`.
   [Certain] Nepal Tourism Board describes tourist visa on arrival and lists 15/30/90-day fees.
   Suggested direction: change category to `voa`, keep 15/30/90 days, and separate official visa fee from Sundaf service fee.
   Source: https://ntb.gov.np/plan-your-trip/before-you-come/tourist-visa

3. [Certain] `Kyrgyzstan` is internally inconsistent: `visa=evisa`, `stay=60 hari`, `cost=Gratis`, but notes say `Bebas visa 30 hari dalam periode 60 hari`.
   [Likely] This needs manual official portal confirmation before publishing as final.
   Source for official checker: https://www.evisa.e-gov.kg/get_information.php?lng=en

4. [Certain] `Tajikistan` is internally mixed: `visa=bebas`, `stay=30 hari / 60 hari`, `cost=USD 30`, and notes say e-Visa.
   [Likely] Public copy should split the free 30-day entry from paid e-visa / GBAO-specific needs.
   Source: https://mfa.tj/en/brussels/view/9213/visa-free-travel-to-tajikistan

5. [Certain] `Oman` is internally mixed: `visa=bebas`, `stay=14 hari / 30 hari`, `cost=OMR 20`, and notes say 14-day visa-free or 30-day e-visa.
   [Likely] Public copy should show `bebas 14 hari` as the main rule and move the 30-day e-visa into conditional notes/variant.

6. [Likely] `Saudi Arabia` as plain `evisa` is too broad for ordinary WNI because Sundaf's own note limits the tourist eVisa route to holders of UK/US/Schengen visas.
   Suggested direction: label as conditional, not generic eVisa.
   Source: https://visa.visitsaudi.com/

7. [Certain] `Japan` is accurate only for registered ICAO e-passport holders.
   [Likely] The label `bebas` is too broad unless the card visibly says "khusus e-paspor terdaftar".
   Sources: https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html and https://www.mofa.go.jp/j_info/visit/visa/visaonline.html

8. [Certain] `Brazil` has an internal contradiction: `stay=30 hari`, but notes say `Bebas visa 90 hari`.
   [Likely] Keep 30 days and correct the note.
   Source: https://www.gov.br/mre/pt-br/embaixada-abu-dhabi/abu-dhabi-arquivos/english/consular-services/visa/visa-requirements-by-country/visa-requirements-by-country-list-of-countries

9. [Certain] `Chile` has an internal contradiction: `stay=60 hari`, but notes say `Bebas visa 90 hari`.
   [Likely] Needs official Indonesia-specific confirmation before changing the published stay.

10. [Certain] `Peru` has an internal contradiction: `stay=90 hari`, but notes say `Bebas visa 183 hari`.
    [Likely] Needs official Indonesia-specific confirmation before changing the published stay.

11. [Certain] `South Africa` is not visa-free for Indonesian ordinary passport holders on the Embassy page.
    [Certain] The Embassy says ordinary Indonesian passport holders still require a visitor visa until the visa-free agreement is implemented, and encourages ETA as the quicker route.
    [Likely] Current `evisa` can remain only if the copy clearly says ETA/visitor visa required, not visa-free.
    Source: https://dirco1.azurewebsites.net/jakarta/immigration.html

## Entries Verified As Broadly Aligned

[Certain] `Russia` e-visa stay of up to 30 days is aligned with the Russian MFA e-visa site.
Source: https://evisa.kdmid.ru/

[Certain] Schengen short stay `Maks. 90 hari/180 hari` is aligned with the European Commission short-stay rule.
Source: https://home-affairs.ec.europa.eu/policies/schengen/border-crossing/short-stay-calculator_en

[Certain] `Canada` FAQ is directionally aligned with Canada.ca: eligible Indonesian citizens can apply for eTA from 2026-05-26 only when they meet the listed prior-visa/US-visa, air-travel, and temporary-stay requirements.
Source: https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta/eligibility/eta-x.html

## Structural Risk

[Certain] The current schema uses one `visa` label for cases that are actually conditional or mixed.

[Likely] A safer structure is:
- `mainRequirement`: bebas | voa | eta | evisa | visa_required | conditional
- `officialFee`: official government fee only
- `servicePrice`: Sundaf service price only
- `conditions`: visible plain-language conditions
- `sourceUrl` and `lastVerifiedAt`

[Likely] Without this split, the site will keep producing ambiguous claims such as "bebas" with a paid cost, or "evisa" where only some WNI qualify.

## Data Change Status

[Certain] No production or local database values were changed during this audit.
