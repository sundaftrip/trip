#!/usr/bin/env python3
"""Build corporate B2B profiles in ID, EN and RU.
Run: python3 company-profile/generate_b2b_profile.py
Dependencies: company-profile/requirements.txt. Billy's brochure is untouched.
"""
import json
import re
from io import BytesIO
from pathlib import Path

from PIL import Image
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from svglib.svglib import svg2rlg

from b2b_profile_copy import COPY, SERVICE_TITLES, SERVICE_OUTPUTS, STAGE_TITLES, STAGE_BODIES, BRIEF_ITEMS, PHOTOS

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'lib/b2b-profile-content.json').read_text())
W, H = A4
M = 42
CW = W - 2 * M
INK, BODY, GREEN = '#1e3645', '#2f4352', '#075d63'
SAGE, SAND, LINE, MUTED = '#edf3f1', '#f5f5f2', '#d5dfdc', '#53636b'
PDFS = {'id': 'sundaftrip-company-profile-id.pdf', 'en': 'sundaftrip-company-profile.pdf', 'ru': 'sundaftrip-company-profile-ru.pdf'}
PAGE_COUNT = 6
REVISION = '20261114-corporate'

# Reuse the site's published company identity rather than maintaining a second address.
BUSINESS_SOURCE = (ROOT / 'lib/business-identity.ts').read_text()
TRANSFER_SOURCE = (ROOT / 'lib/company-transfer.ts').read_text()
def source_value(pattern, source):
    match = re.search(pattern, source)
    if not match:
        raise ValueError('Published company identity could not be read')
    return match.group(1)
LEGAL_NAME = source_value(r'legalName:\s*"([^"]+)"', BUSINESS_SOURCE)
AHU = source_value(r'number:\s*"([^"]+)"', BUSINESS_SOURCE)
AHU_URL = source_value(r'verificationUrl:\s*"([^"]+)"', BUSINESS_SOURCE)
OFFICE = source_value(r'APPOINTMENT_ONLY_OFFICE_ADDRESS\s*=\s*"([^"]+)"', BUSINESS_SOURCE)
ACCOUNT_HOLDER = source_value(r'holder:\s*"([^"]+)"', TRANSFER_SOURCE)
NIB = '1601260060842'

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
        self.c.setTitle('Sundaf Trip - Company Profile - ' + lang.upper())
        self.c.setAuthor(LEGAL_NAME)
        self.c.setSubject('Corporate profile, B2B services and company payment information')
        self.c.setCreator('Sundaf Trip / ' + REVISION)
        self.page = 0

    def t(self, value):
        return value[self.lang]

    def copy(self, key):
        return self.t(COPY[key])

    def box(self, x, y, width, height, color):
        self.c.setFillColor(HexColor(color))
        self.c.rect(x, H - y - height, width, height, fill=1, stroke=0)

    def text(self, value, x, y, size=10, bold=False, color=INK):
        self.c.setFillColor(HexColor(color))
        self.c.setFont(self.font + ('-Bold' if bold else ''), size)
        self.c.drawString(x, H - y - size, value)

    def height(self, value, width, size=10, leading=15, bold=False):
        return len(simpleSplit(value, self.font + ('-Bold' if bold else ''), size, width)) * leading

    def para(self, value, x, y, width=CW, size=10, leading=15, bold=False, color=BODY):
        lines = simpleSplit(value, self.font + ('-Bold' if bold else ''), size, width)
        bottom = y + len(lines) * leading
        if x < M - .1 or x + width > W - M + .1 or bottom > 770:
            raise ValueError(f'{self.lang} page {self.page}: text outside content area: {value[:45]} ({bottom:.1f})')
        for line in lines:
            self.text(line, x, y, size, bold, color)
            y += leading
        return y

    def rule(self, y, x=M, width=CW, color=LINE, weight=.5):
        self.c.setStrokeColor(HexColor(color))
        self.c.setLineWidth(weight)
        self.c.line(x, H - y, x + width, H - y)

    def photo(self, src, x, y, width, height):
        with Image.open(ROOT / 'public' / src) as original:
            im = original.convert('RGB')
            im.thumbnail((int(width * 2.2), int(height * 2.2)), Image.Resampling.LANCZOS)
            ratio = min(width / im.width, height / im.height)
            iw, ih = im.width * ratio, im.height * ratio
            encoded = BytesIO()
            im.save(encoded, format='JPEG', quality=88, optimize=True)
            encoded.seek(0)
            self.c.drawImage(ImageReader(encoded), x + (width - iw) / 2, H - y - (height + ih) / 2, iw, ih)

    def logo(self, file, x, y, width, height):
        drawing = svg2rlg(str(ROOT / 'public/brand' / file))
        if drawing is None:
            raise ValueError('Logo could not be rendered: ' + file)
        scale = min(width / drawing.width, height / drawing.height)
        original_w, original_h = drawing.width, drawing.height
        drawing.scale(scale, scale)
        renderPDF.draw(drawing, self.c, x, H - y - original_h * scale)
        return original_w * scale, original_h * scale

    def link(self, label, url, x, y, width=240, size=10, bold=False, color=GREEN):
        if y >= 788:
            self.text(label, x, y, size, bold, color)
            end = y + size * 1.45
        else:
            end = self.para(label, x, y, width, size, size * 1.45, bold, color)
        self.c.linkURL(url, (x, H - end - 2, x + width, H - y + 1), relative=0, thickness=0)
        return end

    def start(self, title=None, intro=None):
        self.page += 1
        self.c.drawImage(str(ROOT / 'public/logo.png'), M, H - 65, 116, 32.4, mask='auto')
        self.text('COMPANY PROFILE / ' + self.lang.upper(), W - M - 146, 45, 8, True, MUTED)
        self.rule(84)
        self.rule(788)
        self.link('sundaftrip.com', 'https://sundaftrip.com/b2b', M, 800, 100, 8)
        self.link('@sundaf.trip', 'https://instagram.com/sundaf.trip', M + 138, 800, 100, 8)
        self.text(f'{self.page:02d} / {PAGE_COUNT:02d}', W - M - 36, 800, 8, color=MUTED)
        if title:
            self.box(M, 113, 25, 2, GREEN)
            y = self.para(title, M, 129, CW, 24, 30, True, INK)
            if intro:
                y = self.para(intro, M, y + 14, CW, 10, 15)
            return y
        return 100

    def end(self):
        self.c.showPage()

    def cover(self):
        self.start()
        self.text(self.copy('focus'), M, 117, 10, True, GREEN)
        y = self.para(self.copy('profile'), M, 149, CW, 40, 47, True, INK)
        y = self.para(self.copy('subtitle'), M, y + 7, CW, 17, 23, False, GREEN)
        y = self.para(self.copy('intro'), M, y + 23, CW, 10.5, 16)
        self.photo('trip-photos/trip-1.jpg', M, 333, CW, 336)
        self.rule(693, color=GREEN, weight=1)
        self.text(LEGAL_NAME, M, 710, 12, True)
        self.para(self.copy('coverNote'), M, 733, CW - 135, 9, 13, color=MUTED)
        self.para(self.copy('edition'), W - M - 126, 714, 126, 8.5, 13, color=MUTED)
        self.end()

    def company(self):
        y = self.start(self.copy('company'), self.copy('companyIntro')) + 30
        self.text(self.copy('identity'), M, y, 13, True, GREEN)
        y += 29
        rows = [
            (self.copy('brandLabel'), 'Sundaf Trip', None),
            (self.copy('entityLabel'), LEGAL_NAME, None),
            (self.copy('nibLabel'), NIB, 'https://oss.go.id/id'),
            (self.copy('ahuLabel'), AHU, AHU_URL),
            (self.copy('officeLabel'), OFFICE, None),
            (self.copy('visitLabel'), self.copy('appointment'), None),
        ]
        for label, value, url in rows:
            self.rule(y)
            h = max(34, self.height(value, CW - 139, 9.5, 14) + 20)
            self.para(label, M, y + 10, 120, 9, 13, color=MUTED)
            end = self.para(value, M + 139, y + 10, CW - 139, 9.5, 14, color=INK)
            if url:
                self.c.linkURL(url, (M + 139, H - end - 2, W - M, H - y - 8), relative=0, thickness=0)
            y += h
        self.rule(y)
        y += 30
        self.text(self.copy('markets'), M, y, 13, True, GREEN)
        y += 29
        gap = 25
        width = (CW - gap) / 2
        for i, (title, detail) in enumerate([('russia', 'russiaRoutes'), ('centralAsia', 'asiaRoutes')]):
            x = M + i * (width + gap)
            self.text(self.copy(title), x, y, 12, True)
            self.para(self.copy(detail), x, y + 24, width, 10, 15)
        self.end()

    def scope(self):
        y = self.start(self.copy('capabilities'), self.copy('capabilityIntro')) + 25
        widths = [103, 224, CW - 327]
        self.box(M, y, CW, 31, GREEN)
        x = M
        for key, width in zip(['area', 'scope', 'output'], widths):
            self.para(self.copy(key), x + 11, y + 8, width - 22, 8.5, 12, True, '#ffffff')
            x += width
        y += 31
        for i, entry in enumerate(DATA['COVERAGE']):
            values = [self.t(SERVICE_TITLES[i]), self.t(entry['desc']), self.t(SERVICE_OUTPUTS[i])]
            h = max(self.height(v, w - 22, 9, 13, j == 0) for j, (v, w) in enumerate(zip(values, widths))) + 24
            if i % 2 == 0:
                self.box(M, y, CW, h, SAND)
            x = M
            for j, (value, width) in enumerate(zip(values, widths)):
                self.para(value, x + 11, y + 12, width - 22, 9, 13, j == 0, INK if j == 0 else BODY)
                x += width
            y += h
            self.rule(y)
        y += 27
        self.text(self.copy('roles'), M, y, 12, True, GREEN)
        y += 25
        width = (CW - 25) / 2
        for i, (title, body) in enumerate([(self.copy('partnerRole'), self.copy('partnerRoleBody')), ('Sundaf Trip', self.copy('sundafRoleBody'))]):
            x = M + i * (width + 25)
            self.para(title, x, y, width, 10, 14, True, INK)
            self.para(body, x, y + 23, width, 9, 13)
        self.end()

    def process(self):
        y = self.start(self.copy('process'), self.copy('processIntro')) + 28
        for i in range(5):
            self.text(str(i + 1).zfill(2), M, y, 23, False, GREEN)
            title_end = self.para(self.t(STAGE_TITLES[i]), M + 48, y, CW - 48, 11, 15, True, INK)
            y = self.para(self.t(STAGE_BODIES[i]), M + 48, title_end + 7, CW - 48, 9.5, 14) + 17
        y += 3
        self.box(M, y, CW, 169, SAGE)
        self.para(self.copy('brief'), M + 16, y + 14, CW - 32, 11, 15, True, GREEN)
        top = y + 45
        col_w = (CW - 50) / 2
        for i, item in enumerate(BRIEF_ITEMS):
            x = M + 16 + (i % 2) * (col_w + 18)
            yy = top + (i // 2) * 31
            self.box(x, yy + 4, 3, 3, GREEN)
            self.para(self.t(item), x + 12, yy, col_w - 12, 9, 13)
        self.para(self.copy('briefNote'), M, y + 183, CW, 8.5, 12, color=MUTED)
        self.end()

    def evidence(self):
        y = self.start(self.copy('evidence'), self.copy('evidenceIntro')) + 30
        gap = 16
        width = (CW - gap) / 2
        for i, (src, caption) in enumerate(PHOTOS):
            x = M + (i % 2) * (width + gap)
            top = y + (i // 2) * 178
            self.photo(src, x, top, width, 142)
            self.para(self.t(caption), x, top + 151, width, 8.5, 12, color=MUTED)
        self.end()

    def contact(self):
        y = self.start(self.copy('contact'), self.copy('contactIntro')) + 29
        self.text(self.copy('b2bContact').upper(), M, y, 9, True, GREEN)
        self.text('Ferdiansah Yusuf', M, y + 24, 20, True)
        self.text(self.copy('founder'), M, y + 53, 9.5, False, MUTED)
        yy = y + 81
        for label, url in [('info@sundaftrip.com', 'mailto:info@sundaftrip.com'), ('+62 817-7520-2759', 'https://wa.me/6281775202759'), ('sundaftrip.com', 'https://sundaftrip.com/b2b')]:
            self.link(label, url, M, yy, 255, 10, True)
            yy += 25
        qr = QrCodeWidget('https://wa.me/6281775202759')
        x0, y0, x1, y1 = qr.getBounds()
        size = 88
        drawing = Drawing(size, size, transform=[size/(x1-x0), 0, 0, size/(y1-y0), 0, 0])
        drawing.add(qr)
        renderPDF.draw(drawing, self.c, W - M - 111, H - y - 99)
        self.link(self.copy('scan'), 'https://wa.me/6281775202759', W - M - 123, y + 108, 123, 8.5)
        y = max(yy, y + 145) + 20
        self.rule(y)
        y += 25
        bank_w = 230
        self.box(M, y, bank_w, 142, '#063e70')
        self.logo('bca-white.svg', M + 18, y + 18, 104, 33)
        self.para(self.copy('transfer'), M + 18, y + 65, bank_w - 36, 9, 13, True, '#ffffff')
        self.para(self.copy('holder'), M + 18, y + 87, bank_w - 36, 8, 12, False, '#d5e5f4')
        self.para(ACCOUNT_HOLDER, M + 18, y + 104, bank_w - 36, 9, 13, True, '#ffffff')
        x = M + bank_w + 26
        width = CW - bank_w - 26
        self.para(self.copy('cards'), x, y + 8, width, 11, 15, True, INK)
        self.logo('mastercard-symbol.svg', x, y + 37, 66, 45)
        self.logo('unionpay.svg', x + 91, y + 41, 56, 37)
        self.text('Mastercard / UnionPay', x, y + 99, 9, color=MUTED)
        y += 160
        y = self.para(self.copy('invoiceNote'), M, y, CW, 9, 13, color=MUTED) + 25
        self.text(LEGAL_NAME + ' / NIB ' + NIB, M, y, 10, True)
        self.text(AHU, M, y + 22, 9, color=MUTED)
        y = self.para(OFFICE + ' / ' + self.copy('appointment'), M, y + 44, CW, 8.5, 13, color=MUTED)
        self.link(self.copy('legalLink'), 'https://sundaftrip.com/legalitas-dan-keamanan', M, y + 14, 300, 9)
        self.end()

    def build(self):
        for page in (self.cover, self.company, self.scope, self.process, self.evidence, self.contact):
            page()
        self.c.save()
        print(PDFS[self.lang])


if __name__ == '__main__':
    for language in PDFS:
        Brochure(language).build()
