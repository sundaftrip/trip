#!/usr/bin/env python3
"""Build Sundaf Trip's six-page group catalogue with flight and land-only choices.

Input is a JSON object mapping ``peru`` and ``empat-negara`` to PackageDetails.
Only selling totals, customer inclusions and optional upgrades are printed.
Each package requires price.groups with groupSize, from, landOnlyFrom,
optionPrices and roomNote, plus landTour and flightInclusions. The 20-person
flight-inclusive selling total must match price.from. The included list holds
ground services common to both modes. No internal cost breakdown is accepted.
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
        self.header('PILIHAN PAKET / PERJALANAN GRUP')
        offset = 80
        self.photo('machu-picchu-panorama' if peru else 'rio-de-janeiro-sunrise', M, 89, CW, 250, focus=(.5, .85 if peru else .55))
        self.box(M, 203+offset, CW, 56, INK)
        self.text('PERU' if peru else 'BRASIL · KOLOMBIA · PERU · CHILE', M+15, 214+offset,
                  25 if peru else 17, 'DisplayBold', white)
        self.text('Lima, Sacred Valley & Machu Picchu' if peru else 'Machu Picchu, Rio & Iguazu dalam satu perjalanan',
                  M+16, 243+offset, 8.5, color=white)

        self.text('Dengan pesawat: '+p['duration'], M, 274+offset, 10.8, 'BodyBold')
        self.text('Land tour: '+p['landTour']['duration'], M, 292+offset, 9.4, color=MUTED)
        self.text('ESTIMASI HARGA MULAI DARI / PER ORANG', M, 316+offset, 8.5, 'BodyBold', TEAL)
        groups = sorted(p['price']['groups'], key=lambda group: group['groupSize'])
        label_w = 122
        col_w = (CW-label_w)/3
        self.box(M, 335+offset, CW, 26, INK, 5)
        self.text('PILIHAN PAKET', M+11, 343+offset, 7.8, 'BodyBold', white)
        for index, group in enumerate(groups):
            x = M+label_w+index*col_w
            self.text(f"{group['groupSize']} PESERTA", x+10, 343+offset, 8.2, 'BodyBold', white)
        for row, (label, field) in enumerate((('Termasuk pesawat', 'from'), ('Land tour saja', 'landOnlyFrom'))):
            top = 361+offset+row*43
            self.box(M, top, CW, 43, PALE if row == 0 else white)
            self.para(label, M+11, top+13, label_w-21, size=8.9, leading=12, bold=True, limit=25)
            for index, group in enumerate(groups):
                x = M+label_w+index*col_w
                self.para(millions(group[field]), x+10, top+11, col_w-18,
                          size=15.3, leading=21, bold=True, color=INK if row == 0 else TEAL, limit=22)
        room_text = ' '.join(f"{group['groupSize']} peserta: {group['roomNote']}" for group in groups)
        top = 459+offset
        top += self.para(room_text, M, top, CW, size=7.9, leading=11.2, color=MUTED, limit=45)+10
        top += self.para('<b>Paket dengan pesawat:</b> '+esc(p['flightInclusions']), M, top, CW,
                         size=8.4, leading=12, markup=True, limit=37)+7
        top += self.para('<b>Land tour:</b> tidak termasuk seluruh tiket pesawat peserta, termasuk penerbangan domestik '
                         'dan regional yang diperlukan dalam itinerary. Rute penerbangan dan titik temu ada di halaman 5.',
                         M, top, CW, size=8.4, leading=12, markup=True, limit=37)+14
        self.text('TERMASUK PADA KEDUA PILIHAN', M, top, 9, 'BodyBold', TEAL)
        top += 23
        gap = 23
        col_w = (CW-gap)/2
        split = (len(p['included'])+1)//2
        left_end = self.bullets(p['included'][:split], M, top, col_w, size=8.5, leading=12, gap=5)
        right_end = self.bullets(p['included'][split:], M+col_w+gap, top, col_w, size=8.5, leading=12, gap=5)
        note_top = max(left_end, right_end)+8
        self.para('Harga akhir, jadwal, hotel dan ketersediaan dikonfirmasi dalam penawaran tertulis. '
                  'Pilihan tambahan dan detail pemesanan ada di halaman 5.', M, note_top, CW,
                  size=7.7, leading=10.8, color=MUTED, limit=23)
        self.footer(page)

    def options(self, p, x, top, width):
        groups = sorted(p['price']['groups'], key=lambda group: group['groupSize'])
        for option in p['price']['options']:
            top += self.para(option['name'], x, top, width, size=9.2, leading=12.6, bold=True)
            top += 4
            amounts = [group['optionPrices'].get(option['id'], option['amount']) for group in groups]
            if option['id'] == 'hotel-4' or len(set(amounts)) > 1:
                option_col_w = width/3
                for index, (group, amount) in enumerate(zip(groups, amounts)):
                    cell_x = x+index*option_col_w
                    self.text(f"{group['groupSize']} peserta", cell_x, top, 7.0, 'BodyBold', MUTED)
                    self.para('+'+rupiah(amount), cell_x, top+12, option_col_w-3, size=7.5,
                              leading=9.3, color=TEAL, bold=True, limit=10)
                top += 28
                self.text('tambahan per orang', x, top, 7.2, color=MUTED)
                top += 15
            else:
                amount = f"+ {rupiah(amounts[0])} / orang" if amounts[0] > 0 else 'Penawaran terpisah'
                self.text(amount, x, top, 9.3, 'BodyBold', TEAL)
                top += 18
            top += self.para(option['description'], x, top, width, size=8.1, leading=11.4, color=MUTED)
            top += 12
        if not p['price']['options']:
            top += self.para('Kamar single, layanan privat dan tambahan malam tersedia melalui penawaran terpisah.',
                             x, top, width, size=8.6, leading=12, color=MUTED)
        return top

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

    def land_and_options(self):
        self.header('LAND TOUR / PILIHAN TAMBAHAN')
        self.title('ATUR PERJALANAN SESUAI KEBUTUHAN', 'Bergabung langsung di destinasi')
        top = 151
        top += self.para('Land tour mencakup hotel, layanan darat dan 1 tour leader Indonesia. '
                         'Seluruh tiket pesawat peserta dibeli terpisah: menuju titik temu, dari titik akhir, '
                         'serta antarkota atau antarnegara dalam itinerary.', M, top, CW, size=9, leading=13, limit=40)+19
        gap = 25
        col_w = (CW-gap)/2
        bottom = []
        for index, (key, label) in enumerate((('peru', 'PERU'), ('empat-negara', 'EMPAT NEGARA'))):
            p = self.data[key]
            land = p['landTour']
            x = M+index*(col_w+gap)
            y = top
            self.text(label, x, y, 10.1, 'BodyBold', TEAL)
            y += 22
            y += self.para(land['duration'], x, y, col_w, size=9.1, leading=12.4, bold=True)+12
            y += self.para('<b>Titik temu:</b> '+esc(land['meetingPoint']), x, y, col_w,
                           size=8.4, leading=12, markup=True)+8
            y += self.para('<b>Titik akhir:</b> '+esc(land['finishPoint']), x, y, col_w,
                           size=8.4, leading=12, markup=True)+12
            y += self.para('Penerbangan dalam rute, dibeli terpisah:', x, y, col_w,
                           size=8.4, leading=12, bold=True)+5
            y += self.para(' · '.join(land['flightSectors']), x, y, col_w,
                           size=8.1, leading=11.6, color=MUTED)
            bottom.append(y)
        top = max(bottom)+20
        self.c.setStrokeColor(LINE)
        self.c.line(M, H-top, W-M, H-top)
        top += 16
        self.text('PILIHAN TAMBAHAN / HARGA PER ORANG', M, top, 9.2, 'BodyBold', TEAL)
        top += 24
        bottom = []
        for index, (key, label) in enumerate((('peru', 'PERU'), ('empat-negara', 'EMPAT NEGARA'))):
            x = M+index*(col_w+gap)
            self.text(label, x, top, 9, 'BodyBold', MUTED)
            bottom.append(self.options(self.data[key], x, top+23, col_w))
        top = max(bottom)+7
        top += self.para('Harga pilihan tambahan berlaku pada kedua jenis paket. Peserta land tour perlu '
                         'mencocokkan jadwal penerbangannya dengan Sundaf sebelum membeli tiket agar seluruh '
                         'rangkaian perjalanan dapat diikuti.', M, top, CW, size=8.3, leading=12, limit=37)+9
        self.para('Seluruh harga merupakan estimasi perjalanan 2027. Belum ada tanggal keberangkatan tetap; '
                  'harga akhir, layanan, jadwal dan ketersediaan dikonfirmasi dalam penawaran tertulis.',
                  M, top, CW, size=8, leading=11.6, color=MUTED, limit=35)
        self.footer(5)

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
            'The flight-inclusive package includes return travel from Jakarta and domestic/regional flights along the itinerary. '
            'Land-only packages exclude all participant flights, including those required during the tour. '
            'Flight schedules, baggage and transit times are confirmed in the final written offer. '
            'Wi-Fi depends on the operating airline and aircraft; continuous access is not guaranteed.'
        )
        top += self.para(flight_text, M, top, CW, size=8.0, leading=11.5, markup=True)
        top += 13
        trade_text = (
            '<b>Indonesian outbound groups.</b> Peru covers 7 local days and 6 hotel nights; the four-country journey covers '
            '13 local days and 12 hotel nights. Both packages are offered with flights or as land-only tours, '
            'with group prices for 10, 15 and 20 participants and one Indonesian tour leader. '
            'For a group of 15, participant 15 shares a room with the tour leader. '
            'International travel adds days. Bogotá is a transit visit, subject to the flight schedule. '
            'There are no fixed departure dates. The final 2027 price, hotels, transport and admission availability are confirmed in a written offer.'
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
        self.footer(6, 'TRADE / ID + EN')

    def build(self):
        self.overview('peru', 1)
        self.peru_itinerary()
        self.overview('empat-negara', 3)
        self.four_itinerary()
        self.land_and_options()
        self.trade()
        self.c.save()


def validate(data):
    for key, expected_days, expected_nights in [('peru', 7, 6), ('empat-negara', 13, 12)]:
        p = data[key]
        if not isinstance(p['price']['from'], (int, float)) or p['price']['from'] <= 0:
            raise ValueError(f'{key}: a positive final indicative retail price is required')
        if p['price']['groupSize'] != 20:
            raise ValueError(f'{key}: the headline price must correspond to 20 guests')
        if 'components' in p['price'] or 'airfareNote' in p['price']:
            raise ValueError(f'{key}: remove internal components and airfareNote from public price data')
        groups = p['price'].get('groups', [])
        if sorted(group['groupSize'] for group in groups) != [10, 15, 20]:
            raise ValueError(f'{key}: exactly one price each for groups of 10, 15 and 20 is required')
        option_ids = {option['id'] for option in p['price']['options']}
        for group in groups:
            if not isinstance(group['from'], (int, float)) or group['from'] <= 0:
                raise ValueError(f'{key}: all group prices must be positive')
            if not isinstance(group.get('landOnlyFrom'), (int, float)) or not 0 < group['landOnlyFrom'] < group['from']:
                raise ValueError(f'{key}: each land-only price must be positive and below the flight-inclusive price')
            if not isinstance(group.get('roomNote'), str) or not group['roomNote'].strip():
                raise ValueError(f'{key}: a customer room arrangement is required for every group')
            if group['groupSize'] == 15 and 'tour leader' not in group['roomNote'].lower():
                raise ValueError(f'{key}: the 15-person room note must explain sharing with the tour leader')
            if group['groupSize'] == 20 and group['from'] != p['price']['from']:
                raise ValueError(f'{key}: the 20-person price must equal the headline price')
            if not isinstance(group.get('optionPrices'), dict):
                raise ValueError(f'{key}: every group requires an optionPrices object')
            for option_id, amount in group['optionPrices'].items():
                if option_id not in option_ids or not isinstance(amount, (int, float)) or amount < 0:
                    raise ValueError(f'{key}: invalid group option price for {option_id}')
            if 'hotel-4' in option_ids and 'hotel-4' not in group['optionPrices']:
                raise ValueError(f'{key}: an explicit hotel upgrade price is required for each group size')
        if p['price']['from'] != min(group['from'] for group in groups):
            raise ValueError(f'{key}: the headline must be the lowest of the three group prices')
        if len(p['days']) != expected_days:
            raise ValueError(f'{key}: expected {expected_days} local days')
        if sum(h['nights'] for h in p['hotels']) != expected_nights:
            raise ValueError(f'{key}: expected {expected_nights} hotel nights')
        if len(p['price']['options']) > 3:
            raise ValueError(f'{key}: at most 3 priced options fit the overview page')
        land = p.get('landTour', {})
        for name in ('duration', 'meetingPoint', 'finishPoint'):
            if not isinstance(land.get(name), str) or not land[name].strip():
                raise ValueError(f'{key}: landTour.{name} is required')
        if not isinstance(land.get('flightSectors'), list) or not land['flightSectors']:
            raise ValueError(f'{key}: landTour.flightSectors must list the participant flights to buy separately')
        if not all(isinstance(sector, str) and sector.strip() for sector in land['flightSectors']):
            raise ValueError(f'{key}: flight sectors must be nonempty customer-facing strings')
        if not isinstance(p.get('flightInclusions'), str) or not p['flightInclusions'].strip():
            raise ValueError(f'{key}: flightInclusions is required for the flight-inclusive package')
        # Catch stale internal copy before any PDF file is created. No strings are
        # silently altered; the public source data must be corrected explicitly.
        public_copy = json.dumps({name: p[name] for name in (
            'duration', 'travelNote', 'included', 'excluded', 'days', 'hotels',
            'flightNote', 'englishSummary', 'landTour', 'flightInclusions')}, ensure_ascii=False).lower()
        public_copy += json.dumps({name: p['price'][name] for name in (
            'basisNote', 'options', 'groups')}, ensure_ascii=False).lower()
        for phrase in ('rata-rata', 'sampel', 'markup', 'mark up', 'supplier', 'alokasi',
                       'cadangan biaya', 'airfare allowance', 'flight allowance',
                       'cost basis', 'quoted ground', 'planning allowance',
                       'shared across', 'regular-fare', 'buffer'):
            if phrase in public_copy:
                raise ValueError(f'{key}: internal pricing phrase remains in public copy: {phrase}')


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
