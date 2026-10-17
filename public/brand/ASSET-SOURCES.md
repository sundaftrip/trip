# Official identity asset

`oss-indonesia.svg` is the OSS Indonesia logo with unchanged artwork (line endings normalized) served by the official OSS website, retrieved on 2026-09-12.

- Source page: https://oss.go.id/id
- Asset: https://s3.oss.go.id/oss/cms/OSS-LOGO-NEW-2024-ID-c39d5a64d376bdcb60bae5f61ce15848.svg
- The mark identifies the OSS business-licensing system operated by Kementerian Investasi dan Hilirisasi/BKPM. It appears beside the company's existing NIB with the label “Perizinan melalui OSS”; it is not a government endorsement or certification badge.
- The footer links to Sundaf's legal identity page and does not claim that the NIB was independently verified by the website.

## BCA receiving-bank logo

`bca-white.svg` is the unchanged white BCA logo served by the official BCA website, retrieved on 2026-10-11.

- Source page: https://www.bca.co.id/id/tentang-bca/media-riset/pressroom/Brand-Assets
- Asset: https://www.bca.co.id/-/media/Feature/Footer/Breadcrumb/logo-bca-logo-only-light.svg?v=1
- Logo BCA merupakan merek terdaftar milik PT Bank Central Asia Tbk.
- The logo identifies the bank used for SUNDAF company transfers. The existing public receiving-account data remains in `lib/company-transfer.ts`.

## Mastercard acceptance mark

`mastercard-symbol.svg` is the unchanged Mastercard Symbol (`ma_symbol.svg`) from the official Mastercard Brand Center download "Mastercard Symbol, Websites & apps, SVG", retrieved on 2026-10-17 after accepting the Mastercard Download Artwork Agreement.

- Source page: https://www.mastercard.com/brandcenter/us/en/download-artwork.html
- Asset: https://www.mastercard.com/content/dam/brandcenter/assets/downloads/mc_symbol_SVG.zip
- Mastercard's web quick reference guide places this symbol on websites with an `<img>` element at the chosen size; the file includes its own clear space.
- Shown in the footer payment row because Sundaf accepts Mastercard cards (confirmed by the owner on 2026-10-17).

## UnionPay acceptance mark

`unionpay.svg` is the official UnionPay "Brand logo (for general purpose and E-Commerce checkout)" from the UnionPay International Artwork Download Center, retrieved on 2026-10-17 after accepting UnionPay's download statement.

- Source page: https://m.unionpayintl.com/en/mediaCenter/brandCenter/artworkDownloadCenter/identification.shtml
- The download ships an Illustrator file (PDF-compatible). It was converted with `pdftocairo -svg`, and only the root `viewBox` was changed to crop the page to the logo's bounds. The artwork paths are unchanged.
- Shown in the footer payment row because Sundaf accepts UnionPay cards (confirmed by the owner on 2026-10-17).

## Visa acceptance mark (pending)

Not added yet. The public Visa Brand Mark form at https://globalclient.visa.com/brand-mark returned the "Enabled by Visa" endorsement lockup, which is not an acceptance mark, so it is not used here. Add the white Visa Brand Mark from brand.visa.com (or from Sundaf's acquiring bank) with its own entry in this file.
