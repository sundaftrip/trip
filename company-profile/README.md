# Company profile downloads

Run `python3 company-profile/generate_b2b_profile.py` from the repository root
to rebuild the Indonesian, English and Russian B2B brochures. Install the Python
dependencies with `python3 -m pip install -r company-profile/requirements.txt`.
The command does not modify Billy's partner brochure.

Operating-service descriptions come from `lib/b2b-profile-content.json`.
`b2b_profile_copy.py` contains the brochure's corporate introduction, service
details, workflow and request checklist in all three languages. Published company
registration, office and account-holder details are read from the website's
existing identity constants. Indonesian and English PDFs embed DM Sans; Russian
embeds the bundled Cyrillic-capable Noto Sans. Both font families include their
licenses under `assets/fonts/`.

The six-page profile covers the company, service capabilities, working process,
selected journey documentation, contacts and payment information. Payment marks
are rendered as vectors from the unchanged SVG assets already used by the site;
their sources are documented in `public/brand/ASSET-SOURCES.md`. Bank account
numbers and transaction-specific terms are provided through the official invoice.

When publishing changed B2B PDFs, update `B2B_PROFILE_REVISION` in
`lib/b2b-profile.ts` to invalidate previously cached downloads. Keep the existing
English and Russian filenames because other company-profile pages link to them.

`generate_company_profile.py` rebuilds all B2B brochures and the separate Billy
partner brochure, preserving the partner's own editorial layout and contacts.
