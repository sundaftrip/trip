#!/usr/bin/env python3
"""Build the B2B downloads in ID, EN and RU from the website's shared copy.
Run: python3 company-profile/generate_b2b_profile.py
Requires reportlab and Pillow. Existing partner/Billy brochure is untouched.
"""
import json
from io import BytesIO
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'lib/b2b-profile-content.json').read_text())
W, H = A4
M = 42
CW = W - 2 * M
INK, BODY, GREEN = '#1e3645', '#2f4352', '#2e6751'
SAGE, SAND, AMBER, LINE = '#eaf3f0', '#f5f5ef', '#eab067', '#dce5e1'
PDFS = {'id': 'sundaftrip-company-profile-id.pdf', 'en': 'sundaftrip-company-profile.pdf', 'ru': 'sundaftrip-company-profile-ru.pdf'}

for name, directory, filename in [
    ('DM', 'dm-sans', 'DMSans-Regular.ttf'), ('DM-Bold', 'dm-sans', 'DMSans-Bold.ttf'),
    ('Noto', 'noto-sans', 'NotoSans-Regular.ttf'), ('Noto-Bold', 'noto-sans', 'NotoSans-Bold.ttf'),
]:
    pdfmetrics.registerFont(TTFont(name, str(ROOT / 'assets/fonts' / directory / filename)))


class Brochure:
    def __init__(self, lang):
        self.lang = lang
        self.font = 'Noto' if lang == 'ru' else 'DM'
        self.c = canvas.Canvas(str(ROOT / 'public' / PDFS[lang]), pagesize=A4, pageCompression=1, invariant=1)
        self.c.setTitle('Sundaf Trip - B2B Company Profile - ' + lang.upper())
        self.c.setAuthor('CV Sundaf Holiday Group')
        self.c.setSubject('Ground operations and B2B partnerships')
        self.c.setCreator('Sundaf Trip B2B profile 20261114')
        self.page = 0

    def t(self, value):
        return value[self.lang]

    def box(self, x, y, width, height, color):
        self.c.setFillColor(HexColor(color))
        self.c.rect(x, H - y - height, width, height, fill=1, stroke=0)

    def text(self, value, x, y, size=10, bold=False, color=INK):
        self.c.setFillColor(HexColor(color))
        self.c.setFont(self.font + ('-Bold' if bold else ''), size)
        self.c.drawString(x, H - y - size, value)

    def para(self, value, x, y, width=CW, size=10, leading=15, bold=False, color=BODY):
        lines = simpleSplit(value, self.font + ('-Bold' if bold else ''), size, width)
        bottom = y + len(lines) * leading
        if bottom > 770:
            raise ValueError(f'{self.lang} page {self.page}: text exceeds content area ({bottom:.1f})')
        for line in lines:
            self.text(line, x, y, size, bold, color)
            y += leading
        return y

    def rule(self, y, x=M, width=CW):
        self.c.setStrokeColor(HexColor(LINE))
        self.c.setLineWidth(.5)
        self.c.line(x, H - y, x + width, H - y)

    def photo(self, src, x, y, width, height):
        # Fit within the frame without stretching or cropping people's faces.
        with Image.open(ROOT / 'public' / src) as original:
            im = original.convert('RGB')
            im.thumbnail((int(width * 2), int(height * 2)), Image.Resampling.LANCZOS)
            ratio = min(width / im.width, height / im.height)
            iw, ih = im.width * ratio, im.height * ratio
            encoded = BytesIO()
            im.save(encoded, format='JPEG', quality=85, optimize=True)
            encoded.seek(0)
            self.c.drawImage(ImageReader(encoded), x + (width - iw) / 2, H - y - ih, iw, ih)

    def start(self, title=None):
        self.page += 1
        self.c.drawImage(str(ROOT / 'public/logo.png'), M, H - 59, 100, 28, mask='auto')
        self.text('B2B / ' + self.lang.upper(), W - M - 70, 40, 9, True, GREEN)
        self.rule(76)
        self.rule(788)
        for label, url, x in [('sundaftrip.com', 'https://sundaftrip.com/b2b', M), ('@sundaf.trip', 'https://instagram.com/sundaf.trip', M + 145)]:
            self.text(label, x, 800, 8, color=GREEN)
            self.c.linkURL(url, (x, H - 814, x + 112, H - 796), relative=0, thickness=0)
        self.text(f'{self.page:02d} / 05', W - M - 36, 800, 8, color=BODY)
        if title:
            self.box(M, 100, CW, 35, AMBER)
            self.para(title, M + 13, 108, CW - 26, 12, 16, True, INK)

    def end(self):
        self.c.showPage()

    def cover(self):
        self.start()
        self.text('/ ' + self.t(DATA['HERO']['eyebrow']).upper(), M, 102, 10, True, GREEN)
        y = self.para(self.t(DATA['HERO']['title']), M, 132, CW, 29, 35, True, INK) + 18
        y = self.para(self.t(DATA['HERO']['intro']), M, y, CW, 10.5, 16) + 18
        self.photo('trip-photos/trip-1.jpg', M, y, CW, 235)
        y += 250
        self.box(M, y, CW, 140, SAGE)
        y = self.para(self.t(DATA['POSITIONING']['title']), M + 18, y + 16, CW - 36, 13, 18, True, INK) + 10
        self.para(self.t(DATA['POSITIONING']['desc']), M + 18, y, CW - 36, 9.5, 14)
        self.end()

    def scope(self):
        self.start(self.t(DATA['TX']['coverageHead']))
        gap = 6
        cell = (CW - gap) / 2
        for i, entry in enumerate(DATA['COVERAGE']):
            x = M + (i % 2) * (cell + gap)
            y = 158 + (i // 2) * 133
            self.box(x, y, cell, 127, SAND if i % 2 == 0 else SAGE)
            bottom = self.para(self.t(entry['title']), x + 16, y + 16, cell - 32, 11.5, 16, True, INK)
            self.para(self.t(entry['desc']), x + 16, bottom + 10, cell - 32, 9.5, 14)
        y = 578
        self.para(self.t(DATA['TX']['destinationsHead']), M, y, CW, 13, 18, True, GREEN)
        y += 29
        for destination in DATA['DESTINATIONS']:
            self.text(self.t(destination['region']), M, y, 10, True)
            y = self.para(self.t(destination['detail']), M + 166, y, CW - 166, 9.5, 14) + 15
        self.end()

    def process(self):
        self.start(self.t(DATA['TX']['whyHead']))
        y = 158
        for point in DATA['WHY']:
            self.box(M, y + 5, 4, 4, GREEN)
            y = self.para(self.t(point), M + 18, y, CW - 18, 10, 15) + 12
        y += 10
        self.box(M, y, CW, 35, AMBER)
        self.para(self.t(DATA['TX']['stepsHead']), M + 13, y + 8, CW - 26, 12, 16, True, INK)
        y += 53
        for entry in DATA['STEPS']:
            self.text(entry['n'].zfill(2), M, y, 18, False, GREEN)
            bottom = self.para(self.t(entry['title']), M + 42, y, CW - 42, 10.5, 15, True, INK)
            y = self.para(self.t(entry['desc']), M + 42, bottom + 4, CW - 42, 9.5, 14) + 13
        self.end()

    def evidence(self):
        self.start(self.t(DATA['TX']['photosHead']))
        self.para(self.t(DATA['TX']['photosBody']), M, 156, CW, 10, 15)
        gap = 7
        cell = (CW - gap * 2) / 3
        for i in range(12):
            x = M + (i % 3) * (cell + gap)
            y = 215 + (i // 3) * 128
            self.box(x, y, cell, 121, SAND)
            self.photo(f'b2b-gallery/b2b-{i + 1:02d}.webp', x, y, cell, 121)
        self.end()

    def contact(self):
        self.start(self.t(DATA['TX']['b2bLead']))
        self.photo('partner/ferdiansah-world-nyc.jpg', M, 160, 216, 325)
        x, width = M + 242, CW - 242
        self.text(DATA['FERDIANSAH']['name'], x, 170, 24, True)
        self.text(DATA['FERDIANSAH']['role'].upper(), x, 208, 9, True, GREEN)
        self.para(self.t(DATA['FERDIANSAH']['desc']), x, 239, width, 10.5, 16)
        self.para(self.t(DATA['FERDIANSAH_USA_PROOF']['caption']), M, 498, CW, 8.5, 13)
        self.box(M, 544, CW, 208, SAGE)
        y = self.para(self.t(DATA['TX']['ctaHead']), M + 18, 560, CW - 36, 18, 23, True, INK) + 12
        y = self.para(self.t(DATA['TX']['ctaBody']), M + 18, y, CW - 36, 10, 15) + 15
        for label, url in [('info@sundaftrip.com', 'mailto:info@sundaftrip.com'), ('+62 817-7520-2759', DATA['FERDIANSAH']['whatsappUrl'])]:
            self.text(label, M + 18, y, 11, True, GREEN)
            self.c.linkURL(url, (M + 18, H - y - 17, M + 250, H - y + 2), relative=0, thickness=0)
            y += 24
        self.text('CV Sundaf Holiday Group / NIB 1601260060842', M + 18, y + 4, 8, color=BODY)
        self.end()

    def build(self):
        for page in (self.cover, self.scope, self.process, self.evidence, self.contact):
            page()
        self.c.save()
        print(PDFS[self.lang])


if __name__ == '__main__':
    for language in PDFS:
        Brochure(language).build()
