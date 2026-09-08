#!/usr/bin/env python3
"""Build Sundaf Trip's public five-page priced Peru / South America catalogue.

Input is a JSON object mapping ``peru`` and ``empat-negara`` to PackageDetails.
Only public retail figures are used; procurement calculations do not belong here.
Requires reportlab and Pillow, plus the repository's bundled fonts and HD photos.
The PDF skill's artifact-operation marker must be run by the caller before the
first PDF creation/edit. This script deliberately does not run that marker.
"""
from __future__ import annotations

import argparse
import json
from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape

from PIL import Image
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

W, H = A4
M = 36
CW = W - M * 2
INK = HexColor('#132B3A')
TEAL = HexColor('#008D93')
PALE = HexColor('#EAF4F1')
IVORY = HexColor('#FBF8F1')
MUTED = HexColor('#50626B')
LINE = HexColor('#D4DEDB')
AMBER = HexColor('#FFD170')
WEB = 'https://sundaftrip.com/amerika-latin'
WHATSAPP = 'https://wa.me/6281775202759'
PAGE_END = H - 64


def clean(value):
    return (str(value).replace('\u2011', '-').replace('\u2013', '-').replace('\u2014', '-')
            .replace('→', '-').replace('↔', '-').replace('★', ' bintang'))


def esc(value):
    return escape(clean(value))


def rupiah(amount):
    return 'Rp' + f'{int(amount):,}'.replace(',', '.')


def millions(amount):
    value = f'{amount / 1_000_000:.2f}'.rstrip('0').rstrip('.').replace('.', ',')
    return 'Rp' + value + ' juta'


class Brochure:
    def __init__(self, repo_root: Path, data: dict, output: Path):
        self.repo_root = repo_root
        self.assets = repo_root / 'scripts' / 'latin-america-brochure' / 'assets'
        self.photos = repo_root / 'public' / 'images' / 'latin-america'
        self.data = data
        self.metadata = {item['id']: item for item in json.loads((self.photos / 'metadata.json').read_text())}
        for name, filename in [('Body', 'NotoSans-Regular.ttf'), ('BodyBold', 'NotoSans-Bold.ttf'),
                               ('Display', 'Rubik-Regular.ttf'), ('DisplayBold', 'Rubik-Bold.ttf')]:
            pdfmetrics.registerFont(TTFont(name, str(self.assets / filename)))
        pdfmetrics.registerFontFamily('Body', normal='Body', bold='BodyBold')
        output.parent.mkdir(parents=True, exist_ok=True)
        self.c = canvas.Canvas(str(output), pagesize=A4, pageCompression=1)
        self.c.setTitle('Sundaf Trip | Peru & Amerika Selatan 2027')
        self.c.setAuthor('Sundaf Trip - CV Sundaf Holiday Group')
        self.c.setSubject('Indicative retail group tours from Jakarta: Peru and four-country South America')
        self.c.setKeywords('Sundaf Trip, Peru, South America, Amerika Latin, 2027, group travel, catalogue')

    def box(self, x, top, width, height, color, radius=0):
        self.c.setFillColor(color)
        if radius:
            self.c.roundRect(x, H-top-height, width, height, radius, fill=1, stroke=0)
        else:
            self.c.rect(x, H-top-height, width, height, fill=1, stroke=0)

    def text(self, value, x, top, size=10, font='Body', color=INK):
        self.c.setFillColor(color)
        self.c.setFont(font, size)
        self.c.drawString(x, H-top-size, clean(value))

    def para(self, value, x, top, width, size=9.1, leading=13, color=INK,
             bold=False, limit=None, markup=False):
        style = ParagraphStyle('catalogue', fontName='BodyBold' if bold else 'Body',
                               fontSize=size, leading=leading, textColor=color,
                               spaceBefore=0, spaceAfter=0)
        paragraph = Paragraph(clean(value) if markup else esc(value), style)
        _, height = paragraph.wrap(width, H)
        if limit is not None and height > limit + 0.01:
            raise ValueError(f'Paragraph exceeds reserved area ({height:.1f} > {limit:.1f}): {value[:100]}')
        if top + height > PAGE_END:
            raise ValueError(f'Paragraph crosses page footer at {top + height:.1f}: {value[:100]}')
        paragraph.drawOn(self.c, x, H-top-height)
        return height

    def link(self, label, url, x, top, size=9, color=TEAL):
        self.text(label, x, top, size, 'BodyBold', color)
        width = pdfmetrics.stringWidth(clean(label), 'BodyBold', size)
        self.c.linkURL(url, (x, H-top-size-3, x+width, H-top+2), relative=0, thickness=0)

    def photo(self, photo_id, x, top, width, height, focus=(.5, .5)):
        image_path = self.photos / f'{photo_id}.webp'
        with Image.open(image_path) as im:
            image = im.convert('RGB')
            iw, ih = image.size
            encoded = BytesIO()
            image.save(encoded, format='JPEG', quality=92, subsampling=0, optimize=True)
            encoded.seek(0)
            scale = max(width / iw, height / ih)
            drawn_w, drawn_h = iw * scale, ih * scale
            dx = (drawn_w - width) * focus[0]
            dy = (drawn_h - height) * focus[1]
            self.c.saveState()
            clip = self.c.beginPath()
            clip.rect(x, H-top-height, width, height)
            self.c.clipPath(clip, stroke=0)
            self.c.drawImage(ImageReader(encoded), x-dx, H-top-height-dy, drawn_w, drawn_h)
            self.c.restoreState()

    def header(self, right):
        self.box(0, 0, W, H, IVORY)
        self.c.drawImage(str(self.assets / 'sundaf-logo.png'), M, H-58, 112, 32,
                         mask='auto', preserveAspectRatio=True)
        self.text(right, 304, 35, 8.1, 'BodyBold', MUTED)
        self.c.setStrokeColor(LINE)
        self.c.setLineWidth(.5)
        self.c.line(M, H-73, W-M, H-73)

    def footer(self, page, label='KATALOG 2027'):
        self.c.setStrokeColor(LINE)
        self.c.line(M, 46, W-M, 46)
        self.text('SUNDAF TRIP / CV Sundaf Holiday Group', M, H-35, 7.1, 'BodyBold', MUTED)
        self.text(f'{label}  /  {page:02}', W-157, H-35, 7.1, 'Body', MUTED)
        self.c.showPage()

    def bullets(self, items, x, top, width, size=8.6, leading=12, gap=5):
        for item in items:
            self.box(x, top+5, 3, 3, TEAL)
            height = self.para(item, x+11, top, width-11, size=size, leading=leading)
            top += height+gap
        return top

    def title(self, small, large, top=93):
        self.text(small, M, top, 8.7, 'BodyBold', TEAL)
        self.text(large, M, top+20, 25, 'DisplayBold')

    def overview(self, key, page):
        p = self.data[key]
        peru = key == 'peru'
        self.header('DARI JAKARTA / PERJALANAN GRUP')
        self.photo('machu-picchu-panorama' if peru else 'rio-de-janeiro-sunrise', M, 89, CW, 205, focus=(.5, .15 if peru else .55))
        self.box(M, 238, CW, 56, INK)
        self.text('PERU' if peru else 'BRASIL · KOLOMBIA · PERU · CHILE', M+15, 249,
                  25 if peru else 17, 'DisplayBold', white)
        self.text('Lima, Sacred Valley & Machu Picchu' if peru else 'Machu Picchu, Rio & Iguazu dalam satu perjalanan',
                  M+16, 278, 8.5, color=white)

        self.text(p['duration'], M, 309, 12, 'BodyBold')
        self.box(M, 337, CW, 89, PALE, 8)
        self.text('ESTIMASI MULAI DARI', M+15, 349, 8.5, 'BodyBold', TEAL)
        self.text(millions(p['price']['from']), M+15, 368, 31, 'DisplayBold')
        self.text('per orang · kamar twin/double', M+17, 407, 8.4, color=MUTED)
        self.para('Termasuk anggaran pesawat PP Jakarta, penerbangan regional/domestik, dan 1 tour leader Indonesia.',
                  M+302, 350, CW-319, size=8.7, leading=12.3, limit=51)
        self.text('Basis 20 peserta membayar + 1 tour leader', M+302, 405, 7.2, 'BodyBold', TEAL)

        left_w = 306
        right_x = M+329
        right_w = CW-329
        self.text('SUDAH TERMASUK', M, 445, 9, 'BodyBold', TEAL)
        left_end = self.bullets(p['included'], M, 467, left_w, size=8.5, leading=12, gap=5)
        self.text('PILIHAN TAMBAHAN', right_x, 445, 9, 'BodyBold', TEAL)
        top = 468
        for option in p['price']['options']:
            top += self.para(option['name'], right_x, top, right_w, size=9.2, leading=12.6, bold=True)
            top += 4
            amount = f"+ {rupiah(option['amount'])} / orang" if option['amount'] > 0 else 'Penawaran terpisah'
            self.text(amount, right_x, top, 9.3, 'BodyBold', TEAL)
            top += 18
            top += self.para(option['description'], right_x, top, right_w, size=8.1, leading=11.4, color=MUTED)
            top += 16
        if not p['price']['options']:
            top += self.para('Kamar single, layanan privat dan tambahan malam tersedia melalui penawaran terpisah.',
                             right_x, top, right_w, size=8.6, leading=12, color=MUTED)
        note_top = max(left_end, top)+7
        if note_top > 728:
            raise ValueError(f'Overview content too long for {key}: note starts at {note_top}')
        note = (f"Harga indikatif untuk perjalanan 2027; diperbarui {p['price']['updated']}. "
                'Belum ada tanggal keberangkatan tetap. Harga dan ketersediaan dikonfirmasi dalam penawaran untuk tanggal pilihanmu.')
        self.para(note, M, note_top, CW, size=8.0, leading=11.1, color=MUTED, limit=34)
        self.footer(page)

    def day(self, day, number, x, top, width, size=8.4, leading=11.7, gap=11):
        self.text(f'{number:02}', x, top, 12.5, 'DisplayBold', TEAL)
        tx = x+29
        tw = width-29
        height = self.para(day['title'], tx, top, tw, size=9.3, leading=12.3, bold=True)
        top += height+4
        top += self.para(day['description'], tx, top, tw, size=size, leading=leading)
        top += 3
        stay = ('Malam: '+day['overnight']) if day['overnight'] != 'Perjalanan pulang' else 'Perjalanan pulang'
        if day.get('meals'):
            stay += ' · '+day['meals']
        top += self.para(stay, tx, top, tw, size=7.4, leading=10.2, color=TEAL)
        return top+gap

    def hotel_list(self, p, x, top, width, compact=False):
        self.text('TEMPAT MENGINAP', x, top, 9, 'BodyBold', TEAL)
        top += 22
        for hotel in p['hotels']:
            label = f"{hotel['city']} · {hotel['nights']} malam"
            top += self.para(label, x, top, width, size=8.6 if compact else 9, leading=11.6, bold=True)
            top += 2
            top += self.para(hotel['note'], x, top, width, size=7.7 if compact else 8.1,
                             leading=10.4 if compact else 11.2, color=MUTED)
            top += 7 if compact else 12
        return top

    def peru_itinerary(self):
        p = self.data['peru']
        self.header('PERU / RENCANA PERJALANAN')
        self.title('7 HARI LOKAL · 6 MALAM HOTEL', 'Dari Lima ke pegunungan Inca')
        self.para(p['travelNote'], M, 151, CW, size=8.6, leading=12.2, color=MUTED, limit=37)
        top = 201
        for n, day in enumerate(p['days'], 1):
            top = self.day(day, n, M, top, 333, size=8.4, leading=11.7, gap=12)
        if top > PAGE_END+12:
            raise ValueError(f'Peru itinerary overflow: {top}')
        right_x = M+355
        right_w = CW-355
        top = self.hotel_list(p, right_x, 202, right_w)
        self.text('DI LUAR HARGA', right_x, top+4, 9, 'BodyBold', TEAL)
        top = self.bullets(p['excluded'], right_x, top+26, right_w, size=7.9, leading=11.2, gap=6)
        top += 9
        self.para(p['price']['basisNote'], right_x, top, right_w, size=7.9, leading=11.2, color=MUTED)
        self.footer(2)

    def four_itinerary(self):
        p = self.data['empat-negara']
        self.header('EMPAT NEGARA / RENCANA PERJALANAN')
        self.title('13 HARI LOKAL · 12 MALAM HOTEL', 'Dari Brasil, melintasi Andes')
        self.para(p['travelNote'], M, 151, CW, size=8.5, leading=12, color=MUTED, limit=37)
        gap = 21
        col_w = (CW-gap)/2
        for col, entries in enumerate((p['days'][:7], p['days'][7:])):
            top = 202
            for offset, day in enumerate(entries):
                number = offset+1 if col == 0 else offset+8
                top = self.day(day, number, M+col*(col_w+gap), top, col_w,
                               size=8.05, leading=11.15, gap=9)
            if top > PAGE_END+9:
                raise ValueError(f'Four-country itinerary column {col} overflow: {top}')
        self.footer(4)

    def trade(self):
        peru, multi = self.data['peru'], self.data['empat-negara']
        self.header('TRAVEL DETAILS / ENGLISH TRADE BRIEF')
        self.title('BRASIL · KOLOMBIA · PERU · CHILE', 'Your South America journey')
        left_w = 244
        right_x = M+269
        right_w = CW-269
        top = self.hotel_list(multi, M, 158, left_w, compact=True)
        self.text('DI LUAR HARGA EMPAT NEGARA', right_x, 158, 8.6, 'BodyBold', TEAL)
        right_top = self.bullets(multi['excluded'], right_x, 180, right_w, size=8.0, leading=11.3, gap=5)
        right_top += 7
        right_top += self.para(multi['price']['basisNote'], right_x, right_top, right_w,
                               size=7.9, leading=11.2, color=MUTED)
        top = max(top, right_top)+12
        self.c.setStrokeColor(LINE)
        self.c.line(M, H-top, W-M, H-top)
        top += 14
        self.text('FLIGHTS & BOOKING', M, top, 9, 'BodyBold', TEAL)
        top += 22
        flight_text = (
            '<b>Peru:</b> '+esc(peru['flightRoute'])+'. <b>Four countries:</b> '+esc(multi['flightRoute'])+'. '
            'Qatar Airways is preferred for long-haul sectors, with partner airlines where required. '
            'Airfare is a planning allowance, not held inventory. Flights, baggage and transit times are confirmed for the travel dates. '
            'Wi-Fi depends on the operating airline and aircraft; continuous access is not guaranteed.'
        )
        top += self.para(flight_text, M, top, CW, size=8.0, leading=11.5, markup=True)
        top += 13
        trade_text = (
            '<b>Indonesian outbound groups.</b> Peru: 7 local days / 6 hotel nights, from '+esc(millions(peru['price']['from']))+
            '. Four countries: 13 local days / 12 hotel nights, from '+esc(millions(multi['price']['from']))+'. '
            'Both indicative retail prices are per paying guest, based on 20 paying guests plus one Indonesian tour leader, '
            'with twin/double sharing and international plus domestic/regional airfare allowances. '
            'International travel adds days. Bogotá is a transit visit, subject to the flight schedule. '
            'There are no fixed departure dates; 2027 rates, hotels, transport and admission availability require reconfirmation.'
        )
        top += self.para(trade_text, M, top, CW, size=8.0, leading=11.5, markup=True)
        top += 16
        self.box(M, top, CW, 45, PALE, 7)
        self.text('Minta itinerary & harga untuk grupmu', M+12, top+8, 11.4, 'DisplayBold')
        self.link('sundaftrip.com/amerika-latin', WEB, M+12, top+29, size=8.5)
        self.link('+62 817 7520 2759', WHATSAPP, M+329, top+14, size=9.1)
        self.link('info@sundaftrip.com', 'mailto:info@sundaftrip.com', M+329, top+29, size=8.5)
        top += 58
        self.text('PHOTO CREDITS', M, top, 7.1, 'BodyBold', MUTED)
        top += 15
        for photo_id in ('machu-picchu-panorama', 'rio-de-janeiro-sunrise'):
            item = self.metadata[photo_id]
            author = esc(item['author'])
            if item.get('authorUrl'):
                author += f", <link href=\"{escape(item['authorUrl'])}\" color=\"#008D93\">{esc(item['authorUrl'])}</link>"
            credit = (f'{esc(item["title"])} - {author}. '
                      f'<link href="{escape(item["source"])}" color="#008D93">Wikimedia Commons source</link>. '
                      f'<link href="{escape(item["licenseUrl"])}" color="#008D93">{esc(item["license"])}</link>. '
                      'Resized and cropped for this layout; no generative edits.')
            top += self.para(credit, M, top, CW, size=7.0, leading=9.7, color=MUTED, markup=True)+4
        self.footer(5, 'TRADE / ID + EN')

    def build(self):
        self.overview('peru', 1)
        self.peru_itinerary()
        self.overview('empat-negara', 3)
        self.four_itinerary()
        self.trade()
        self.c.save()


def validate(data):
    for key, expected_days, expected_nights in [('peru', 7, 6), ('empat-negara', 13, 12)]:
        p = data[key]
        if not isinstance(p['price']['from'], (int, float)) or p['price']['from'] <= 0:
            raise ValueError(f'{key}: a positive final indicative retail price is required')
        if p['price']['groupSize'] != 20:
            raise ValueError(f'{key}: this catalogue layout requires a 20 paying guests + 1 TL basis')
        if len(p['days']) != expected_days:
            raise ValueError(f'{key}: expected {expected_days} local days')
        if sum(h['nights'] for h in p['hotels']) != expected_nights:
            raise ValueError(f'{key}: expected {expected_nights} hotel nights')
        if len(p['price']['options']) > 3:
            raise ValueError(f'{key}: at most 3 priced options fit the overview page')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-file', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--repo-root', type=Path, required=True)
    args = parser.parse_args()
    data = json.loads(args.data_file.read_text())
    validate(data)
    Brochure(args.repo_root, data, args.output).build()
    print(args.output)


if __name__ == '__main__':
    main()
