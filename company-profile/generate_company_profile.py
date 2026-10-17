#!/usr/bin/env python3
"""
Sundaf Trip — Company Profile PDF generator.

Builds three A4 company-profile PDFs into the website's public/ folder:

  sundaftrip-company-profile.pdf        English  · Ferdiansah  (→ /b2b, /company-profile EN)
  sundaftrip-company-profile-billy.pdf  English  · Billy only  (→ /partner)
  sundaftrip-company-profile-ru.pdf     Russian  · Ferdiansah  (→ /company-profile RU)

The layout follows the website: DM Sans, the clean theme colours and the
footer waves, over four pages.

Run:  python3 generate_company_profile.py
"""
import math
import os
import re

from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# --------------------------------------------------------------------------
# CONFIG
# --------------------------------------------------------------------------
# The repository this script lives in, so a worktree builds into its own public/.
BASE          = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_EN     = f"{BASE}/public/sundaftrip-company-profile.pdf"
OUTPUT_BILLY  = f"{BASE}/public/sundaftrip-company-profile-billy.pdf"
OUTPUT_RU     = f"{BASE}/public/sundaftrip-company-profile-ru.pdf"
PHOTO_DIR     = f"{BASE}/public/trip-photos"
LOGO_PATH     = f"{BASE}/company-profile/logo-white.png"

# Cyrillic-capable TTF (macOS system Arial) for the Russian build.
CYR_REGULAR   = "/System/Library/Fonts/Supplemental/Arial.ttf"
CYR_BOLD      = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

EMAIL        = "info@sundaftrip.com"
WEBSITE      = "sundaftrip.com"
WEBSITE_URL  = "https://sundaftrip.com"
WA_DISPLAY   = "+62 817-7520-2759"
WA_URL       = "https://wa.me/6281775202759"
CONTACTS = {
    "ferdiansah": {
        "email": EMAIL,
        "wa_display": WA_DISPLAY,
        "wa_url": WA_URL,
    },
    "billy": {
        "email": "partner@sundaftrip.com",
        "wa_display": "+7 916 889-64-71",
        "wa_url": "https://wa.me/79168896471",
    },
}
LEGAL_ENTITY = "CV Sundaf Holiday Group"
NIB          = "1601260060842"

# --------------------------------------------------------------------------
# Brand palette: the website's own colours (components/website/clean/*.css)
# --------------------------------------------------------------------------
def _hex(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) / 255 for i in (0, 2, 4))


INK = _hex("#132b3a")        # --clean-ink: headings
INK_SOFT = _hex("#42515a")   # --shell-ink-soft: body text
MUTED = _hex("#606b72")      # --clean-muted: labels and captions
TEAL = _hex("#075d63")       # --clean-teal: links and numbers
AURORA = _hex("#20b8b5")     # --shell-aurora: small accents
AURORA_LT = _hex("#8cdae0")  # links on navy
LINE = _hex("#e2e7e8")       # --clean-line: rules
ROW_LINE = _hex("#d8e5e4")   # rules inside sage cards
SAGE = _hex("#eaf3f0")       # --doc-sage: cards, like the website FAQ rows
SAND = _hex("#f5f5ef")       # --doc-sand: cards, like the website FAQ rows
TEAL_PALE = _hex("#dff1f2")  # --clean-teal-pale
NAVY = _hex("#222b3b")       # website footer
NAVY_TEXT = _hex("#b7c0d0")  # website footer text
WHITE = (1, 1, 1)

W, H = A4
LM, RM = 46, 46
CW = W - LM - RM

SANS, SANS_BOLD = "DMSans", "DMSans-Bold"
FONT_DIR = f"{BASE}/assets/fonts/dm-sans"
COLOR_LOGO_PATH = f"{BASE}/public/logo.png"

# Font remap, set per build: DM Sans has no Cyrillic, so the Russian build
# swaps it for the Cyrillic Arial fonts.
FONTMAP = {}
_FONTS_DONE = False
_CYR_DONE = False


def _f(name):
    return FONTMAP.get(name, name)


def register_fonts():
    global _FONTS_DONE
    if _FONTS_DONE:
        return
    pdfmetrics.registerFont(TTFont(SANS, f"{FONT_DIR}/DMSans-Regular.ttf"))
    pdfmetrics.registerFont(TTFont(SANS_BOLD, f"{FONT_DIR}/DMSans-Bold.ttf"))
    _FONTS_DONE = True


def register_cyrillic():
    global _CYR_DONE
    if _CYR_DONE:
        return
    pdfmetrics.registerFont(TTFont("ArialRU", CYR_REGULAR))
    pdfmetrics.registerFont(TTFont("ArialRU-Bold", CYR_BOLD))
    _CYR_DONE = True


# --------------------------------------------------------------------------
# Low-level helpers: every font name passes through _f()
# --------------------------------------------------------------------------
def set_fill(c, rgb, alpha=1):
    c.setFillColorRGB(*rgb)
    c.setFillAlpha(alpha)


def sw(s, font, size):
    return pdfmetrics.stringWidth(s, _f(font), size)


def text(c, x, y, s, font=SANS, size=9.5, color=INK_SOFT):
    set_fill(c, color)
    c.setFont(_f(font), size)
    c.drawString(x, y, s)
    return sw(s, font, size)


def text_right(c, x, y, s, font=SANS, size=9.5, color=INK_SOFT):
    set_fill(c, color)
    c.setFont(_f(font), size)
    c.drawRightString(x, y, s)


def text_center(c, x, y, s, font=SANS, size=9.5, color=INK_SOFT):
    set_fill(c, color)
    c.setFont(_f(font), size)
    c.drawCentredString(x, y, s)


def spaced_width(s, font, size, space):
    return sw(s, font, size) + space * max(len(s) - 1, 0)


def spaced(c, x, y, s, font=SANS_BOLD, size=7.5, color=TEAL, space=1.2):
    """Letter-spaced capitals, like the website's small section labels."""
    set_fill(c, color)
    # Set the canvas font first, so the text object never falls back to Helvetica.
    c.setFont(_f(font), size)
    t = c.beginText(x, y)
    t.setFont(_f(font), size)
    t.setCharSpace(space)
    t.textOut(s)
    # Character spacing is part of the PDF text state and outlives this text
    # object, so reset it or every later line would be spaced out too.
    t.setCharSpace(0)
    c.drawText(t)
    return spaced_width(s, font, size, space)


def lines_of(body, width, font=SANS, size=9.5):
    return simpleSplit(body, _f(font), size, width)


def paragraph(c, x, y, body, width, font=SANS, size=9.5, color=INK_SOFT,
              leading=14):
    for line in lines_of(body, width, font, size):
        text(c, x, y, line, font, size, color)
        y -= leading
    return y


def link(c, x, y, s, url, font=SANS, size=9.5, color=TEAL):
    tw = text(c, x, y, s, font, size, color)
    c.linkURL(url, (x, y - 3, x + tw, y + size), relative=0, thickness=0,
              kind="URI")
    return tw


def accent(c, x, y):
    """The short aurora rule that sits above every section title."""
    set_fill(c, AURORA)
    c.roundRect(x, y, 22, 3, 1.5, stroke=0, fill=1)


def heading(c, x, y, title, size=16):
    accent(c, x, y + size - 1)
    text(c, x, y, title, SANS_BOLD, size, INK)
    return y - 24


def card(c, x, y, w, h, fill, radius=5):
    set_fill(c, fill)
    c.roundRect(x, y, w, h, radius, stroke=0, fill=1)


def tick(c, x, y, d=11):
    """Round teal check mark, aligned with text on baseline y."""
    r = d / 2
    cx, cy = x + r, y + r - 2.2
    set_fill(c, TEAL)
    c.circle(cx, cy, r, stroke=0, fill=1)
    c.setStrokeColorRGB(*WHITE)
    c.setLineWidth(1.2)
    c.setLineCap(1)
    c.setLineJoin(1)
    p = c.beginPath()
    p.moveTo(cx - r * 0.42, cy + r * 0.02)
    p.lineTo(cx - r * 0.1, cy - r * 0.32)
    p.lineTo(cx + r * 0.45, cy + r * 0.34)
    c.drawPath(p, stroke=1, fill=0)


def photo(c, path, x, y, w, h, radius=6):
    """Image cropped to fill the box, with rounded corners."""
    img = ImageReader(path)
    iw, ih = img.getSize()
    scale = max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.saveState()
    p = c.beginPath()
    p.roundRect(x, y, w, h, radius)
    c.clipPath(p, stroke=0, fill=0)
    c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, width=dw, height=dh)
    c.restoreState()


# The three waves of the website footer (FooterHorizon), in its 1440 x 150 box.
def _wave(base, amp, periods, phase, harm=0.35):
    pts = []
    for x in range(-120, 1561, 40):
        t = x / 1440 * math.pi * 2 * periods + phase
        pts.append((x, base + amp * (math.sin(t) + harm * math.sin(2.3 * t + 1.1))))
    return pts


WAVES = [
    (_hex("#5fb3ad"), 0.22, _wave(56, 16, 1.6, 0.4)),
    (_hex("#3b4a62"), 0.7, _wave(86, 14, 2.2, 1.6)),
    (NAVY, 1, _wave(114, 12, 1.25, 2.6)),
]


def waves(c, x, y, w, h, flip=False, layers=WAVES):
    """Draw the footer waves in the box (x, y, w, h).

    flip=False matches the website: page above, navy below.
    flip=True hangs the waves under a navy band.
    """
    def at(px, py):
        yy = y + py / 150 * h if flip else y + h - py / 150 * h
        return x + px * w / 1440, yy

    base_y = y + h if flip else y
    for color, alpha, pts in layers:
        set_fill(c, color, alpha)
        p = c.beginPath()
        p.moveTo(at(pts[0][0], 0)[0], base_y)
        p.lineTo(*at(*pts[0]))
        for i in range(len(pts) - 1):
            p0 = pts[i - 1] if i else pts[i]
            p1, p2 = pts[i], pts[i + 1]
            p3 = pts[i + 2] if i + 2 < len(pts) else p2
            c1 = at(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
            c2 = at(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
            p.curveTo(*c1, *c2, *at(*p2))
        p.lineTo(at(pts[-1][0], 0)[0], base_y)
        p.close()
        c.drawPath(p, stroke=0, fill=1)
    set_fill(c, WHITE)


# --------------------------------------------------------------------------
# Page furniture
# --------------------------------------------------------------------------
def draw_header(c, T):
    """White header with the colour logo, like the website's top bar."""
    logo_h = 22
    c.drawImage(COLOR_LOGO_PATH, LM, H - 54, width=logo_h * 862 / 241,
                height=logo_h, mask="auto")
    label = T["cover_kicker"]
    spaced(c, W - RM - spaced_width(label, SANS_BOLD, 7, 1.4), H - 46, label,
           SANS_BOLD, 7, MUTED, 1.4)
    c.setStrokeColorRGB(*LINE)
    c.setLineWidth(0.8)
    c.line(LM, H - 68, W - RM, H - 68)


def footer_dot(c, x, y):
    set_fill(c, AURORA)
    c.circle(x + 7, y + 2.6, 1.2, stroke=0, fill=1)
    return 14


def draw_footer(c, T, page_no, on_navy=False):
    rule, link_color, muted = ((_hex("#3a4455"), AURORA_LT, NAVY_TEXT) if on_navy
                               else (LINE, TEAL, MUTED))
    c.setStrokeColorRGB(*rule)
    c.setLineWidth(0.8)
    c.line(LM, 50, W - RM, 50)
    y, x, size = 34, LM, 7.8
    x += link(c, x, y, T["email"], f'mailto:{T["email"]}', SANS, size, link_color)
    x += footer_dot(c, x, y)
    x += link(c, x, y, WEBSITE, WEBSITE_URL, SANS, size, link_color)
    x += footer_dot(c, x, y)
    x += text(c, x, y, LEGAL_ENTITY, SANS, size, muted)
    x += footer_dot(c, x, y)
    text(c, x, y, T["city"], SANS, size, muted)
    text_right(c, W - RM, y, f'{T["page"]} {page_no}', SANS, size, muted)


# --------------------------------------------------------------------------
# Pages
# --------------------------------------------------------------------------
def page_one(c, T):
    """Cover band in the footer navy, then about, key numbers, destinations."""
    band = H - 268
    wave_h = 58
    # Waves first, then the band over them, reaching into the navy front wave,
    # so no hairline shows where they meet.
    waves(c, 0, band - wave_h, W, wave_h, flip=True)
    set_fill(c, NAVY)
    c.rect(0, band - 3, W, H - band + 3, stroke=0, fill=1)

    logo_h = 30
    c.drawImage(LOGO_PATH, LM, H - 78, width=logo_h * 862 / 241,
                height=logo_h, mask="auto")
    kicker = T["cover_kicker"]
    spaced(c, W - RM - spaced_width(kicker, SANS_BOLD, 7.5, 1.6), H - 66,
           kicker, SANS_BOLD, 7.5, AURORA_LT, 1.6)

    photo_w, photo_h = 196, 214
    px, py = W - RM - photo_w, band - 40
    title_w = px - LM - 28
    # Longer titles (the Russian one) step down a size so the tagline clears the waves.
    size, leading = 22, 27
    title = lines_of(T["cover_title"], title_w, SANS_BOLD, size)
    if len(title) > 3:
        size, leading = 20, 24
        title = lines_of(T["cover_title"], title_w, SANS_BOLD, size)
    y = H - 128
    for line in title:
        text(c, LM, y, line, SANS_BOLD, size, WHITE)
        y -= leading
    y -= 10
    for item in [s.strip() for s in T["tagline"].split("|")]:
        set_fill(c, AURORA)
        c.circle(LM + 2.4, y + 3, 2.1, stroke=0, fill=1)
        text(c, LM + 12, y, item, SANS, 9, NAVY_TEXT)
        y -= 15
    photo(c, f'{PHOTO_DIR}/{T["hero_photo"]}', px, py, photo_w, photo_h, 10)

    y = band - wave_h - 28
    y = heading(c, LM, y, T["h_about"])
    y = paragraph(c, LM, y, T["about1"], CW, SANS, 9.4, INK_SOFT, 13.8) - 6
    y = paragraph(c, LM, y, T["about2"], CW, SANS, 9.4, INK_SOFT, 13.8) - 12

    # Key numbers on the sage and sand tiles of the website's FAQ rows.
    gap = 10
    tile_w = (CW - 3 * gap) / 4
    tile_h = 54
    ty = y - tile_h
    for i, (num, label) in enumerate(T["stats"]):
        tx = LM + i * (tile_w + gap)
        card(c, tx, ty, tile_w, tile_h, SAGE if i % 2 == 0 else SAND)
        text_center(c, tx + tile_w / 2, ty + 27, num, SANS_BOLD, 16, TEAL)
        lw = spaced_width(label, SANS_BOLD, 6.2, 0.7)
        spaced(c, tx + (tile_w - lw) / 2, ty + 13, label, SANS_BOLD, 6.2, MUTED, 0.7)
    y = ty - 34

    y = heading(c, LM, y, T["h_destinations"])
    gap = 12
    col_w = (CW - gap) / 2
    inner = col_w - 30
    current = lines_of(T["dest_current"], inner, SANS, 9.2)
    expanding = [lines_of(item, inner - 12, SANS, 9.2) for item in T["dest_exp"]]
    rows = max(len(current), sum(len(item) for item in expanding))
    card_h = 44 + rows * 13 + 8
    cy = y + 8 - card_h
    for i, (label, fill) in enumerate([(T["lbl_current"], TEAL_PALE), (T["lbl_expanding"], SAND)]):
        cx = LM + i * (col_w + gap)
        card(c, cx, cy, col_w, card_h, fill)
        spaced(c, cx + 15, cy + card_h - 22, label.rstrip(":").upper(), SANS_BOLD, 7, TEAL, 1.2)
        ly = cy + card_h - 41
        if i == 0:
            for line in current:
                text(c, cx + 15, ly, line, SANS, 9.2, INK)
                ly -= 13
        else:
            for item in expanding:
                set_fill(c, AURORA)
                c.circle(cx + 17.5, ly + 3, 2, stroke=0, fill=1)
                for line in item:
                    text(c, cx + 27, ly, line, SANS, 9.2, INK)
                    ly -= 13

    draw_footer(c, T, 1)


def page_two(c, T):
    """Services on sage and sand cards, then why partner with us."""
    draw_header(c, T)
    y = H - 106
    y = heading(c, LM, y, T["h_services"])
    gap = 10
    col_w = (CW - gap) / 2
    services = T["services"]
    for row in range(0, len(services), 2):
        pair = services[row:row + 2]
        titles = [lines_of(t, col_w - 30, SANS_BOLD, 10.5) for t, _ in pair]
        bodies = [lines_of(b, col_w - 30, SANS, 8.8) for _, b in pair]
        card_h = 30 + 14 * max(map(len, titles)) + 12.4 * max(map(len, bodies))
        for i, (tl, bl) in enumerate(zip(titles, bodies)):
            cx = LM + i * (col_w + gap)
            card(c, cx, y + 8 - card_h, col_w, card_h,
                 SAGE if (row // 2 + i) % 2 == 0 else SAND)
            ly = y - 14
            for line in tl:
                text(c, cx + 15, ly, line, SANS_BOLD, 10.5, INK)
                ly -= 14
            ly -= 2
            for line in bl:
                text(c, cx + 15, ly, line, SANS, 8.8, INK_SOFT)
                ly -= 12.4
        y -= card_h + gap
    y -= 26

    y = heading(c, LM, y, T["h_why"])
    for reason in T["reasons"]:
        tick(c, LM, y)
        y = paragraph(c, LM + 20, y, reason, CW - 20, SANS, 9.4, INK_SOFT, 13.6) - 8
    y -= 22

    y = heading(c, LM, y, T["h_look"])
    gap = 22
    col_w = (CW - gap) / 2
    wants = T["wants"]
    for row in range(0, len(wants), 2):
        pair = [lines_of(item, col_w - 20, SANS, 9.2) for item in wants[row:row + 2]]
        for i, lines in enumerate(pair):
            cx = LM + i * (col_w + gap)
            tick(c, cx, y)
            ly = y
            for line in lines:
                text(c, cx + 20, ly, line, SANS, 9.2, INK_SOFT)
                ly -= 13.2
        y -= max(map(len, pair)) * 13.2 + 10

    draw_footer(c, T, 2)


def page_three(c, T):
    """The five steps of working together, then the company snapshot."""
    draw_header(c, T)
    y = H - 106
    y = heading(c, LM, y, T["h_how"])
    steps = T["steps"]
    nx, bx = LM + 12, LM + 38
    bw = CW - 38
    blocks = []
    for i, (title, body) in enumerate(steps):
        m = re.match(r"\s*(\d+)\.\s*(.*)", title)
        num, name = (m.group(1), m.group(2)) if m else (str(i + 1), title)
        lines = lines_of(body, bw, SANS, 9.2)
        blocks.append((num, name, lines, 18 + len(lines) * 13))
    # The connector runs behind the number circles.
    yy = y
    for _, _, _, block_h in blocks[:-1]:
        nxt = yy - block_h - 14
        c.setStrokeColorRGB(*LINE)
        c.setLineWidth(1.4)
        c.line(nx, yy + 3.5, nx, nxt + 3.5)
        yy = nxt
    for num, name, lines, block_h in blocks:
        set_fill(c, TEAL_PALE)
        c.circle(nx, y + 3.5, 11, stroke=0, fill=1)
        text_center(c, nx, y, num, SANS_BOLD, 10, TEAL)
        text(c, bx, y, name, SANS_BOLD, 10.5, INK)
        ly = y - 18
        for line in lines:
            text(c, bx, ly, line, SANS, 9.2, INK_SOFT)
            ly -= 13
        y -= block_h + 14
    y -= 22

    y = heading(c, LM, y, T["h_snapshot"])
    rows = T["snapshot"]
    row_h, pad = 21, 13
    table_h = len(rows) * row_h + pad * 2 - 6
    top = y + 12
    card(c, LM, top - table_h, CW, table_h, SAGE)
    ry = top - pad - 10
    for i, (label, value) in enumerate(rows):
        if i:
            c.setStrokeColorRGB(*ROW_LINE)
            c.setLineWidth(0.6)
            c.line(LM + 16, ry + 13.5, LM + CW - 16, ry + 13.5)
        text(c, LM + 16, ry, label, SANS_BOLD, 9, INK)
        text(c, LM + 186, ry, value, SANS, 9, INK_SOFT)
        ry -= row_h

    draw_footer(c, T, 3)


def page_four(c, T):
    """Two group photos, then the website footer: waves into a navy close."""
    draw_header(c, T)
    y = H - 106
    y = heading(c, LM, y, T["h_groups"])
    y = paragraph(c, LM, y, T["groups_intro"], CW, SANS, 9.4, INK_SOFT, 13.8) - 8
    gap = 14
    pw = (CW - gap) / 2
    ph = 212
    for i, (fn, cap) in enumerate(T["photos"][:2]):
        px = LM + i * (pw + gap)
        photo(c, f"{PHOTO_DIR}/{fn}", px, y - ph, pw, ph, 6)
        text(c, px, y - ph - 14, cap, SANS, 8.4, MUTED)

    navy_top, wave_h = 338, 60
    waves(c, 0, navy_top, W, wave_h, flip=False)
    set_fill(c, NAVY)
    c.rect(0, 0, W, navy_top + 1, stroke=0, fill=1)

    # Closing line: the website footer's own tagline.
    y = navy_top - 62
    accent(c, LM, y + 31)
    text(c, LM, y, T["closing"], SANS_BOLD, 28, WHITE)
    c.setStrokeColorRGB(*_hex("#3a4455"))
    c.setLineWidth(0.8)
    c.line(LM, y - 26, W - RM, y - 26)

    tx, ty = LM, y - 58
    text(c, tx, ty, T["lets_talk"], SANS_BOLD, 13, WHITE)
    ty -= 20
    text(c, tx, ty, T["leaders"], SANS, 9.4, NAVY_TEXT)
    ty -= 21
    contacts = [
        (T["lbl_email"].strip(), T["email"], f'mailto:{T["email"]}'),
        (T["lbl_wa"].strip(), T["wa_display"], T["wa_url"]),
        (T["lbl_web"].strip(), WEBSITE, WEBSITE_URL),
    ]
    label_w = max(sw(label, SANS, 9.4) for label, _, _ in contacts) + 12
    for label, value, url in contacts:
        text(c, tx, ty, label, SANS, 9.4, NAVY_TEXT)
        link(c, tx + label_w, ty, value, url, SANS_BOLD, 9.4, AURORA_LT)
        ty -= 17

    rx, ry = W - RM, y - 58
    legal = LEGAL_ENTITY.upper()
    spaced(c, rx - spaced_width(legal, SANS_BOLD, 7.6, 1.2), ry + 2, legal,
           SANS_BOLD, 7.6, AURORA_LT, 1.2)
    for line in [f"NIB: {NIB}", T["city"], T["op_label"]]:
        ry -= 18
        text_right(c, rx, ry, line, SANS, 9.2, NAVY_TEXT)

    draw_footer(c, T, 4, on_navy=True)


# --------------------------------------------------------------------------
# Content — English & Russian
# --------------------------------------------------------------------------
EN = {
    "tagline": ("Small Group Tours   |   Affordable International Travel"
                "   |   Indonesia-based Tour Operator"),
    "city": "Jakarta, Indonesia",
    "page": "Page",
    "doc_title": "Sundaf Trip — Company Profile",
    "cover_kicker": "COMPANY PROFILE",
    "cover_title": ("Small-group journeys from Indonesia, led by our own "
                    "tour leaders."),
    "hero_photo": "trip-5.jpg",
    "closing": "Everyone can travel.",
    "h_about": "About us",
    "about1": ("Sundaf Trip is an Indonesian tour operator under CV Sundaf "
               "Holiday Group, based in Jakarta. We specialize in organizing "
               "affordable, well-curated small group tours to international "
               "destinations. Our focus is delivering high-value travel "
               "experiences with personal attention — ensuring every trip is "
               "safe, enjoyable, and memorable."),
    "about2_ferdiansah": ("Founded by Ferdiansah, Sundaf Trip was built on the "
               "belief that international travel should be accessible to more "
               "people. We handle end-to-end trip operations including "
               "itinerary design, group coordination, and on-ground tour "
               "leadership."),
    "about2_billy": ("Sundaf Trip was built on the belief that international "
               "travel should be accessible to more people. We handle "
               "end-to-end trip operations including itinerary design, group "
               "coordination, and on-ground tour leadership."),
    "stats": [("10–20", "PAX PER GROUP"), ("5+", "TARGET DESTINATIONS"),
              ("100%", "OWN TOUR LEADER"), ("B2C + B2B", "SALES MODEL")],
    "h_services": "Our services",
    "services": [
        ("Small Group Tours",
         "Curated international tours for groups of 10–20 pax, with a "
         "personal touch and flexible itineraries."),
        ("End-to-End Coordination",
         "Flights, accommodation, ground transport, meals, and attraction "
         "tickets — all organized under one roof."),
        ("Tour Leadership",
         "Every trip is accompanied by our own Indonesian-speaking tour "
         "leader from departure to return."),
        ("Budget-Friendly Packages",
         "Value-for-money packages that make international travel "
         "accessible to Indonesian travelers."),
        ("Custom Itinerary Design",
         "We design itineraries from scratch based on destination appeal, "
         "budget, and traveler preferences."),
        ("Content & Marketing",
         "In-house social media content production including branded "
         "visuals, travel stories, and trip documentation."),
    ],
    "h_destinations": "Destinations",
    "lbl_current": "Current:",
    "lbl_expanding": "Expanding to:",
    "dest_current": ("Russia (Moscow, St. Petersburg, Murmansk), Central Asia, "
                     "and India"),
    "dest_exp": [
        "Western Europe (France, Netherlands, Germany, Switzerland, Italy)",
        "Scandinavia (Norway, Sweden, Finland)",
        "Other destinations based on market demand",
    ],
    "h_why": "Why partner with Sundaf Trip",
    "reasons": [
        "Small group sizes of 10–20 pax per departure — ideal for focused, "
        "well-coordinated ground arrangements.",
        "We bring our own tour leader — your team only needs to handle "
        "logistics and ground operations.",
        "Growing Indonesian outbound travel market with strong demand for "
        "affordable Europe packages.",
        "Long-term partnership mindset — we are looking for a reliable DMC "
        "to grow with, not one-off deals.",
        "Professional operations: structured itineraries, clear "
        "communication, and on-time coordination.",
    ],
    "h_how": "How we work with DMC partners",
    "steps": [
        ("1. Itinerary Planning",
         "We share our desired route, destinations, group size, travel "
         "dates, and budget range. We welcome your suggestions for "
         "optimizing the itinerary based on local knowledge."),
        ("2. Quotation & Agreement",
         "DMC partner provides a detailed quotation covering hotels, "
         "transportation, meals, and attraction tickets. We review, "
         "negotiate, and confirm."),
        ("3. Pre-Trip Coordination",
         "Final rooming list, dietary requirements, and any special "
         "requests are shared 3–4 weeks before departure. We confirm all "
         "arrangements and emergency contacts."),
        ("4. On-Ground Execution",
         "Our tour leader manages the group. DMC partner handles local "
         "logistics — driver, hotel check-ins, restaurant reservations, "
         "and any on-the-ground issues."),
        ("5. Post-Trip Review",
         "We share feedback from our travelers and discuss improvements "
         "for future departures. Strong partnerships are built on "
         "continuous communication."),
    ],
    "h_look": "What we look for in a DMC partner",
    "wants": [
        "Competitive group rates for 3-star hotels in city center or "
        "well-connected locations.",
        "Reliable coach / minibus transportation with experienced drivers.",
        "Meal arrangements — flexible between restaurant bookings and "
        "self-catered options.",
        "Attraction tickets and skip-the-line access where available.",
        "Transparent pricing with clear inclusions — no hidden costs.",
        "Responsive communication, ideally via email and WhatsApp.",
    ],
    "lets_talk": "Let's talk",
    "lbl_email": "Email:  ",
    "lbl_wa": "WhatsApp:  ",
    "lbl_web": "Website:  ",
    "op_label": "B2C + B2B Tour Operator",
    "h_snapshot": "Company snapshot",
    "snapshot_base": [
        ("Legal Entity", "CV Sundaf Holiday Group"),
        ("Business License (NIB)", NIB),
        ("Headquarters", "Jakarta, Indonesia"),
        ("__FOUNDER__", ""),
        ("Business Model", "B2C + B2B (Tour Operator)"),
        ("Group Size", "10–20 pax per departure"),
        ("Tour Leadership", "Own Indonesian-speaking tour leader"),
        ("Current Destinations", "Russia, Central Asia, and India"),
        ("Target Expansion", "Western Europe & Scandinavia"),
    ],
    "h_groups": "Our groups in action",
    "groups_intro": ("Real group departures we have operated across Russia, "
                     "Central Asia, China, and India — every trip accompanied "
                     "by our own Indonesian-speaking tour leader."),
    "photos": [
        ("trip-1.jpg", "Red Square, Moscow"),
        ("trip-4.jpg", "Kaindy Lake, Kazakhstan"),
    ],
    "name_ferdiansah": "Ferdiansah", "role_ferdiansah": "Founder",
    "name_billy": "Billy", "role_billy": "Co-Founder",
}

RU = {
    "tagline": ("Туры малыми группами   |   Доступные международные "
                "путешествия   |   Туроператор из Индонезии"),
    "city": "Джакарта, Индонезия",
    "page": "Стр.",
    "doc_title": "Sundaf Trip — Профиль компании",
    "cover_kicker": "ПРОФИЛЬ КОМПАНИИ",
    "cover_title": ("Туры малыми группами из Индонезии с нашими "
                    "собственными турлидерами."),
    "hero_photo": "trip-5.jpg",
    "closing": "Путешествовать может каждый.",
    "h_about": "О компании",
    "about1": ("Sundaf Trip — индонезийский туроператор в составе CV Sundaf "
               "Holiday Group, базирующийся в Джакарте. Мы специализируемся "
               "на организации доступных, тщательно продуманных туров малыми "
               "группами по международным направлениям. Наша цель — дарить "
               "путешествия высокой ценности с индивидуальным вниманием, "
               "чтобы каждая поездка была безопасной, приятной и "
               "запоминающейся."),
    "about2_ferdiansah": ("Компания Sundaf Trip, основанная Фердиансахом, "
               "родилась из убеждения, что международные путешествия должны "
               "быть доступны большему числу людей. Мы берём на себя полный "
               "цикл организации поездки: разработку маршрута, координацию "
               "группы и сопровождение тура на месте."),
    "about2_billy": ("Компания Sundaf Trip родилась из убеждения, что "
               "международные путешествия должны быть доступны большему "
               "числу людей. Мы берём на себя полный цикл организации "
               "поездки: разработку маршрута, координацию группы и "
               "сопровождение тура на месте."),
    "stats": [("10–20", "ЧЕЛ. В ГРУППЕ"), ("5+", "НАПРАВЛЕНИЙ"),
              ("100%", "СВОЙ ТУРЛИДЕР"), ("B2C + B2B", "МОДЕЛЬ ПРОДАЖ")],
    "h_services": "Наши услуги",
    "services": [
        ("Туры малыми группами",
         "Продуманные международные туры для групп 10–20 человек, с "
         "индивидуальным подходом и гибкими маршрутами."),
        ("Полная координация",
         "Авиаперелёты, проживание, наземный транспорт, питание и билеты "
         "на достопримечательности — всё в одних руках."),
        ("Сопровождение тура",
         "Каждую поездку сопровождает наш собственный турлидер со знанием "
         "индонезийского — от вылета до возвращения."),
        ("Доступные пакеты",
         "Пакеты с оптимальным соотношением цены и качества, делающие "
         "международные поездки доступнее для путешественников."),
        ("Индивидуальные маршруты",
         "Мы разрабатываем маршруты с нуля, исходя из привлекательности "
         "направления, бюджета и предпочтений путешественников."),
        ("Контент и маркетинг",
         "Собственное производство контента для соцсетей: фирменные "
         "визуалы, истории путешествий и документация поездок."),
    ],
    "h_destinations": "Направления",
    "lbl_current": "Сейчас:",
    "lbl_expanding": "Расширяемся:",
    "dest_current": ("Россия (Москва, Санкт-Петербург, Мурманск), "
                     "Центральная Азия и Индия"),
    "dest_exp": [
        "Западная Европа (Франция, Нидерланды, Германия, Швейцария, Италия)",
        "Скандинавия (Норвегия, Швеция, Финляндия)",
        "Другие направления — в зависимости от спроса",
    ],
    "h_why": "Почему стоит работать с Sundaf Trip",
    "reasons": [
        "Малые группы по 10–20 человек на выезд — идеально для чёткой и "
        "слаженной организации на месте.",
        "Мы привозим собственного турлидера — вашей команде нужно "
        "заниматься только логистикой и наземным обслуживанием.",
        "Растущий рынок выездного туризма Индонезии с высоким спросом на "
        "доступные туры по Европе.",
        "Настрой на долгосрочное партнёрство — мы ищем надёжного DMC для "
        "совместного роста, а не разовые сделки.",
        "Профессиональная организация: структурированные маршруты, чёткая "
        "коммуникация и своевременная координация.",
    ],
    "h_how": "Как мы работаем с DMC-партнёрами",
    "steps": [
        ("1. Планирование маршрута",
         "Мы сообщаем желаемый маршрут, направления, размер группы, даты "
         "поездки и бюджетный диапазон. Мы приветствуем ваши предложения "
         "по оптимизации маршрута на основе местных знаний."),
        ("2. Расчёт и соглашение",
         "DMC-партнёр предоставляет подробный расчёт по отелям, "
         "транспорту, питанию и билетам. Мы изучаем, обсуждаем и "
         "подтверждаем."),
        ("3. Координация до поездки",
         "Финальный список размещения, требования по питанию и особые "
         "пожелания передаются за 3–4 недели до вылета. Мы подтверждаем "
         "все договорённости и экстренные контакты."),
        ("4. Работа на месте",
         "Наш турлидер ведёт группу. DMC-партнёр отвечает за местную "
         "логистику — водителя, заселение в отели, бронирование "
         "ресторанов и решение вопросов на месте."),
        ("5. Анализ после поездки",
         "Мы делимся отзывами путешественников и обсуждаем улучшения для "
         "будущих выездов. Прочное партнёрство строится на постоянной "
         "коммуникации."),
    ],
    "h_look": "Что мы ищем в DMC-партнёре",
    "wants": [
        "Конкурентные групповые тарифы на отели 3* в центре города или в "
        "удобных по транспорту районах.",
        "Надёжный транспорт — автобусы или микроавтобусы с опытными "
        "водителями.",
        "Организация питания — гибко: бронирование ресторанов или "
        "самостоятельные варианты.",
        "Билеты на достопримечательности и проход без очереди, где это "
        "возможно.",
        "Прозрачное ценообразование с понятным составом услуг — без "
        "скрытых платежей.",
        "Оперативная коммуникация, желательно по email и WhatsApp.",
    ],
    "lets_talk": "Свяжитесь с нами",
    "lbl_email": "Эл. почта:  ",
    "lbl_wa": "WhatsApp:  ",
    "lbl_web": "Сайт:  ",
    "op_label": "Туроператор B2C + B2B",
    "h_snapshot": "Кратко о компании",
    "snapshot_base": [
        ("Юридическое лицо", "CV Sundaf Holiday Group"),
        ("Лицензия (NIB)", NIB),
        ("Главный офис", "Джакарта, Индонезия"),
        ("__FOUNDER__", ""),
        ("Модель бизнеса", "B2C + B2B (туроператор)"),
        ("Размер группы", "10–20 чел. на выезд"),
        ("Сопровождение", "Собственный турлидер со знанием индонезийского"),
        ("Текущие направления", "Россия, Центральная Азия и Индия"),
        ("Планы расширения", "Западная Европа и Скандинавия"),
    ],
    "h_groups": "Наши группы в деле",
    "groups_intro": ("Реальные групповые выезды, проведённые нами по России, "
                     "Центральной Азии, Китаю и Индии — каждую поездку "
                     "сопровождал наш собственный турлидер."),
    "photos": [
        ("trip-1.jpg", "Красная площадь, Москва"),
        ("trip-4.jpg", "Озеро Каинды, Казахстан"),
    ],
    "name_ferdiansah": "Фердиансах", "role_ferdiansah": "Основатель",
    "name_billy": "Билли", "role_billy": "Сооснователь",
}


def content(lang, person):
    """Resolve a content dict for (lang, person)."""
    base = EN if lang == "en" else RU
    T = dict(base)
    contact = CONTACTS[person]
    T["email"] = contact["email"]
    T["wa_display"] = contact["wa_display"]
    T["wa_url"] = contact["wa_url"]
    T["about2"] = base[f"about2_{person}"]
    name = base[f"name_{person}"]
    role = base[f"role_{person}"]
    T["leaders"] = f"{name}  |  {role}, Sundaf Trip"
    snap = [list(row) for row in base["snapshot_base"]]
    for row in snap:
        if row[0] == "__FOUNDER__":
            row[0], row[1] = role, name
    T["snapshot"] = [tuple(r) for r in snap]
    return T


# --------------------------------------------------------------------------
def build(output_path, lang, person):
    global FONTMAP
    register_fonts()
    if lang == "ru":
        register_cyrillic()
        FONTMAP = {SANS: "ArialRU", SANS_BOLD: "ArialRU-Bold"}
    else:
        FONTMAP = {}

    T = content(lang, person)
    c = canvas.Canvas(output_path, pagesize=A4, initialFontName=_f(SANS),
                      initialFontSize=9.5)
    c.setTitle(T["doc_title"])
    c.setAuthor("CV Sundaf Holiday Group")
    c.setSubject("Company Profile")
    for page in (page_one, page_two, page_three, page_four):
        page(c, T)
        c.showPage()
    c.save()
    print(f"PDF written to {output_path}")


def main():
    build(OUTPUT_EN, lang="en", person="ferdiansah")
    build(OUTPUT_BILLY, lang="en", person="billy")
    build(OUTPUT_RU, lang="ru", person="ferdiansah")


if __name__ == "__main__":
    main()
