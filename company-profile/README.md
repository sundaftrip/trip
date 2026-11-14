# Company profile downloads

Run `python3 company-profile/generate_b2b_profile.py` from the repository root
to rebuild the Indonesian, English and Russian B2B brochures. Requires
`reportlab` and `Pillow`. The command does not modify Billy's partner brochure.

Website and PDF copy comes from `lib/b2b-profile-content.json`. Indonesian and
English PDFs embed DM Sans; Russian embeds the bundled Cyrillic-capable Noto
Sans. Both font families include their licenses under `assets/fonts/`.

When publishing changed B2B PDFs, update `B2B_PROFILE_REVISION` in
`lib/b2b-profile.ts` to invalidate previously cached downloads. Keep the existing
English and Russian filenames because other company-profile pages link to them.

`generate_company_profile.py` rebuilds all B2B brochures and the separate Billy
partner brochure, preserving the partner's own editorial layout and contacts.
