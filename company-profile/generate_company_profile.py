#!/usr/bin/env python3
"""
Sundaf Trip — Company Profile PDF generator.

Builds three A4 company-profile PDFs into the website's public/ folder:

  sundaftrip-company-profile.pdf        English  · Ferdiansah  (→ /b2b, /company-profile EN)
  sundaftrip-company-profile-billy.pdf  English  · Billy only  (→ /partner)
  sundaftrip-company-profile-ru.pdf     Russian  · Ferdiansah  (→ /company-profile RU)

Run:  python3 generate_company_profile.py
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import simpleSplit
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# --------------------------------------------------------------------------
# CONFIG
# --------------------------------------------------------------------------
BASE          = "/Users/ferdiansahyusuf/sundaftrip"
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
        "email": "sebastianbilly31@gmail.com",
        "wa_display": "+7 916 889-64-71",
        "wa_url": "https://wa.me/79168896471",
    },
}
LEGAL_ENTITY = "CV Sundaf Holiday Group"
NIB          = "1601260060842"

# --------------------------------------------------------------------------
# Brand palette / geometry
# --------------------------------------------------------------------------
# REBRAND 2026: charcoal/teal (navy+oranye pensiun). Nama konstanta tetap
# NAVY/ORANGE agar tak perlu ubah seluruh pemakaian — hanya nilainya diganti.
NAVY   = (0x22 / 255, 0x28 / 255, 0x31 / 255)   # charcoal (dulu navy)
ORANGE = (0x00 / 255, 0xAD / 255, 0xB5 / 255)   # teal (dulu oranye)
WHITE  = (1, 1, 1)
GREY   = (0.36, 0.38, 0.42)
LGREY  = (0.55, 0.57, 0.60)
CARDBG = (0.945, 0.945, 0.955)
LINKBL = (0.20, 0.45, 0.78)

W, H = A4
LM, RM = 42, 42
CW = W - LM - RM

# Font remap — populated per build. Russian build maps the built-in
# Helvetica names onto registered Cyrillic Arial fonts.
FONTMAP = {}
_CYR_DONE = False


def _f(name):
    return FONTMAP.get(name, name)


def register_cyrillic():
    global _CYR_DONE
    if _CYR_DONE:
        return
    pdfmetrics.registerFont(TTFont("ArialRU", CYR_REGULAR))
    pdfmetrics.registerFont(TTFont("ArialRU-Bold", CYR_BOLD))
    _CYR_DONE = True


# --------------------------------------------------------------------------
# Low-level helpers — every font name passes through _f()
# --------------------------------------------------------------------------
def set_fill(c, rgb):
    c.setFillColorRGB(*rgb)


def text(c, x, y, s, font="Helvetica", size=10, color=GREY):
    set_fill(c, color)
    c.setFont(_f(font), size)
    c.drawString(x, y, s)


def text_center(c, x, y, s, font="Helvetica", size=10, color=GREY):
    set_fill(c, color)
    c.setFont(_f(font), size)
    c.drawCentredString(x, y, s)


def link(c, x, y, s, url, font="Helvetica", size=10, color=LINKBL,
         underline=True):
    set_fill(c, color)
    c.setFont(_f(font), size)
    c.drawString(x, y, s)
    tw = c.stringWidth(s, _f(font), size)
    if underline:
        c.setStrokeColorRGB(*color)
        c.setLineWidth(0.6)
        c.line(x, y - 1.6, x + tw, y - 1.6)
    c.linkURL(url, (x, y - 3, x + tw, y + size), relative=0,
              thickness=0, kind="URI")
    return tw


def paragraph(c, x, y, body, width, font="Helvetica", size=9,
              color=GREY, leading=12.5):
    set_fill(c, color)
    c.setFont(_f(font), size)
    for line in simpleSplit(body, _f(font), size, width):
        c.drawString(x, y, line)
        y -= leading
    return y


def section_heading(c, x, y, label):
    set_fill(c, ORANGE)
    c.rect(x, y - 2, 5, 17, stroke=0, fill=1)
    text(c, x + 13, y + 2, label, "Helvetica-Bold", 13.5, NAVY)
    return y - 20


def bullet(c, x, y, body, width):
    set_fill(c, ORANGE)
    c.circle(x + 3, y + 3, 2.6, stroke=0, fill=1)
    return paragraph(c, x + 13, y, body, width - 13,
                     "Helvetica", 9, GREY, 12.5)


def text_label(c, x, y, s, color):
    text(c, x, y, s, "Helvetica", 9.5, color)
    return c.stringWidth(s, _f("Helvetica"), 9.5)


def text_chunk(c, x, y, s, mailto=False, url=None):
    font, size = "Helvetica", 8
    if mailto or url:
        target = f"mailto:{s}" if mailto else url
        set_fill(c, LINKBL)
        c.setFont(_f(font), size)
        c.drawString(x, y, s)
        tw = c.stringWidth(s, _f(font), size)
        c.linkURL(target, (x, y - 2, x + tw, y + size), relative=0,
                  thickness=0, kind="URI")
        return tw
    text(c, x, y, s, font, size, LGREY)
    return c.stringWidth(s, _f(font), size)


def sep(c, x, y):
    text(c, x + 5, y, "|", "Helvetica", 8, (0.78, 0.80, 0.83))
    return c.stringWidth("  |  ", _f("Helvetica"), 8) + 4


# --------------------------------------------------------------------------
# Page furniture
# --------------------------------------------------------------------------
def draw_header(c, T):
    set_fill(c, NAVY)
    c.rect(0, H - 86, W, 86, stroke=0, fill=1)
    logo_h = 34
    logo_w = logo_h * 862 / 241          # logo-white.png is 862x241
    c.drawImage(LOGO_PATH, LM + 16, H - 58, width=logo_w, height=logo_h,
                mask="auto")
    text(c, LM + 17, H - 71, T["tagline"], "Helvetica", 9, (0.78, 0.82, 0.88))
    set_fill(c, ORANGE)
    c.rect(0, H - 90, W, 4, stroke=0, fill=1)


def draw_footer(c, T, page_no):
    set_fill(c, ORANGE)
    c.rect(0, 46, W, 2.5, stroke=0, fill=1)
    y, x = 33, LM
    x += text_chunk(c, x, y, T["email"], mailto=True)
    x += sep(c, x, y)
    x += text_chunk(c, x, y, WEBSITE, url=WEBSITE_URL)
    x += sep(c, x, y)
    x += text_chunk(c, x, y, LEGAL_ENTITY)
    x += sep(c, x, y)
    x += text_chunk(c, x, y, T["city"])
    text(c, W - RM - 52, y, f'{T["page"]} {page_no}', "Helvetica", 8, LGREY)


# --------------------------------------------------------------------------
# Pages
# --------------------------------------------------------------------------
def page_one(c, T):
    draw_header(c, T)
    y = H - 118

    y = section_heading(c, LM, y, T["h_about"])
    y = paragraph(c, LM, y, T["about1"], CW) - 5
    y = paragraph(c, LM, y, T["about2"], CW) - 16

    gap = 12
    card_w = (CW - 3 * gap) / 4
    card_h = 56
    cy = y - card_h
    for i, (num, label) in enumerate(T["stats"]):
        cx = LM + i * (card_w + gap)
        set_fill(c, CARDBG)
        c.roundRect(cx, cy, card_w, card_h, 6, stroke=0, fill=1)
        text_center(c, cx + card_w / 2, cy + 30, num, "Helvetica-Bold", 17, ORANGE)
        text_center(c, cx + card_w / 2, cy + 14, label, "Helvetica", 7, GREY)
    y = cy - 26

    y = section_heading(c, LM, y, T["h_services"])
    col_gap = 26
    col_w = (CW - col_gap) / 2
    row_h = 56
    for i, (title, body) in enumerate(T["services"]):
        sx = LM + (i % 2) * (col_w + col_gap)
        sy = y - (i // 2) * row_h
        text(c, sx, sy, title, "Helvetica-Bold", 10, NAVY)
        paragraph(c, sx, sy - 13, body, col_w, "Helvetica", 8.5, GREY, 11)
    y = y - 3 * row_h - 8

    y = section_heading(c, LM, y, T["h_destinations"])
    label_w = 90
    text(c, LM, y, T["lbl_current"], "Helvetica-Bold", 9, NAVY)
    text(c, LM + label_w, y, T["dest_current"], "Helvetica", 9, GREY)
    y -= 15
    text(c, LM, y, T["lbl_expanding"], "Helvetica-Bold", 9, NAVY)
    text(c, LM + label_w, y, T["dest_exp"][0], "Helvetica", 9, GREY)
    for line in T["dest_exp"][1:]:
        y -= 12.5
        text(c, LM + label_w, y, line, "Helvetica", 9, GREY)
    y -= 22

    y = section_heading(c, LM, y, T["h_why"])
    for r in T["reasons"]:
        y = bullet(c, LM, y, r, CW) - 4

    draw_footer(c, T, 1)


def page_two(c, T):
    draw_header(c, T)
    y = H - 118

    y = section_heading(c, LM, y, T["h_how"])
    for title, body in T["steps"]:
        text(c, LM, y, title, "Helvetica-Bold", 10, ORANGE)
        y = paragraph(c, LM, y - 13, body, CW, "Helvetica", 9, GREY, 11.5)
        y -= 4
    y -= 12

    y = section_heading(c, LM, y, T["h_look"])
    for w in T["wants"]:
        y = bullet(c, LM, y, w, CW) - 4
    y -= 6

    # Let's Talk box
    box_h = 104
    box_y = y - box_h
    set_fill(c, NAVY)
    c.roundRect(LM, box_y, CW, box_h, 8, stroke=0, fill=1)
    pad = 22
    ix = LM + pad
    set_fill(c, ORANGE)
    c.rect(ix, box_y + box_h - 40, 5, 20, stroke=0, fill=1)
    text(c, ix + 14, box_y + box_h - 36, T["lets_talk"], "Helvetica-Bold", 16, WHITE)

    line_y = box_y + box_h - 54
    LH = 15.5
    light = (0.82, 0.85, 0.90)
    blue = (0.62, 0.80, 1.0)
    text(c, ix, line_y, T["leaders"], "Helvetica", 9.5, light)
    line_y -= LH
    lx = ix + text_label(c, ix, line_y, T["lbl_email"], light)
    link(c, lx, line_y, T["email"], f'mailto:{T["email"]}', "Helvetica", 9.5, blue)
    line_y -= LH
    lx = ix + text_label(c, ix, line_y, T["lbl_wa"], light)
    link(c, lx, line_y, T["wa_display"], T["wa_url"], "Helvetica", 9.5, blue)
    line_y -= LH
    lx = ix + text_label(c, ix, line_y, T["lbl_web"], light)
    link(c, lx, line_y, WEBSITE, WEBSITE_URL, "Helvetica", 9.5, blue)

    rx = LM + CW - pad
    set_fill(c, ORANGE)
    c.setFont(_f("Helvetica-Bold"), 9.5)
    c.drawRightString(rx, box_y + box_h - 36, "CV SUNDAF HOLIDAY GROUP")
    set_fill(c, light)
    c.setFont(_f("Helvetica"), 9)
    c.drawRightString(rx, box_y + box_h - 52, f"NIB: {NIB}")
    c.drawRightString(rx, box_y + box_h - 68, T["city"])
    c.drawRightString(rx, box_y + box_h - 84, T["op_label"])

    y = box_y - 20

    y = section_heading(c, LM, y, T["h_snapshot"])
    snapshot = T["snapshot"]
    panel_h = 18 + len(snapshot) * 15
    panel_y = y - panel_h
    set_fill(c, CARDBG)
    c.roundRect(LM, panel_y, CW, panel_h, 6, stroke=0, fill=1)
    row_y = y - 16
    for k, v in snapshot:
        text(c, LM + 20, row_y, k, "Helvetica-Bold", 8.5, NAVY)
        text(c, LM + 210, row_y, v, "Helvetica", 8.5, GREY)
        row_y -= 15

    draw_footer(c, T, 2)


def page_three(c, T):
    draw_header(c, T)
    y = H - 118

    y = section_heading(c, LM, y, T["h_groups"])
    y = paragraph(c, LM, y, T["groups_intro"], CW) - 16

    gap = 14
    col_w = (CW - gap) / 2
    img_h = col_w * 2 / 3
    row_h = img_h + 26
    top = y
    for i, (fn, cap) in enumerate(T["photos"]):
        px = LM + (i % 2) * (col_w + gap)
        img_y = top - (i // 2) * row_h - img_h
        c.drawImage(f"{PHOTO_DIR}/{fn}", px, img_y, width=col_w, height=img_h)
        c.setStrokeColorRGB(*CARDBG)
        c.setLineWidth(0.75)
        c.rect(px, img_y, col_w, img_h, stroke=1, fill=0)
        text(c, px + 1, img_y - 13, cap, "Helvetica", 8.5, GREY)

    draw_footer(c, T, 3)


# --------------------------------------------------------------------------
# Content — English & Russian
# --------------------------------------------------------------------------
EN = {
    "tagline": ("Small Group Tours   |   Affordable International Travel"
                "   |   Indonesia-based Tour Operator"),
    "city": "Jakarta, Indonesia",
    "page": "Page",
    "doc_title": "Sundaf Trip — Company Profile",
    "h_about": "ABOUT US",
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
    "h_services": "OUR SERVICES",
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
    "h_destinations": "DESTINATIONS",
    "lbl_current": "Current:",
    "lbl_expanding": "Expanding to:",
    "dest_current": ("Russia (Moscow, St. Petersburg, Murmansk), Central Asia, "
                     "and India"),
    "dest_exp": [
        "Western Europe (France, Netherlands, Germany, Switzerland, Italy)",
        "Scandinavia (Norway, Sweden, Finland)",
        "Other destinations based on market demand",
    ],
    "h_why": "WHY PARTNER WITH SUNDAF TRIP",
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
    "h_how": "HOW WE WORK WITH DMC PARTNERS",
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
    "h_look": "WHAT WE LOOK FOR IN A DMC PARTNER",
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
    "lets_talk": "Let's Talk",
    "lbl_email": "Email:  ",
    "lbl_wa": "WhatsApp:  ",
    "lbl_web": "Website:  ",
    "op_label": "B2C + B2B Tour Operator",
    "h_snapshot": "COMPANY SNAPSHOT",
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
    "h_groups": "OUR GROUPS IN ACTION",
    "groups_intro": ("Real group departures we have operated across Russia, "
                     "Central Asia, China, and India — every trip accompanied "
                     "by our own Indonesian-speaking tour leader."),
    "photos": [
        ("cp-1.jpg", "Aurora borealis — Murmansk"),
        ("cp-2.jpg", "Group under the northern lights — Murmansk"),
        ("trip-1.jpg", "Red Square, Moscow"),
        ("trip-4.jpg", "Kaindy Lake, Kazakhstan"),
        ("cp-3.jpg", "Aurora hunting — Murmansk"),
        ("cp-4.jpg", "Sundaf Trip travelers — Murmansk"),
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
    "h_about": "О КОМПАНИИ",
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
    "h_services": "НАШИ УСЛУГИ",
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
    "h_destinations": "НАПРАВЛЕНИЯ",
    "lbl_current": "Сейчас:",
    "lbl_expanding": "Расширяемся:",
    "dest_current": ("Россия (Москва, Санкт-Петербург, Мурманск), "
                     "Центральная Азия и Индия"),
    "dest_exp": [
        "Западная Европа (Франция, Нидерланды, Германия, Швейцария, Италия)",
        "Скандинавия (Норвегия, Швеция, Финляндия)",
        "Другие направления — в зависимости от спроса",
    ],
    "h_why": "ПОЧЕМУ СТОИТ РАБОТАТЬ С SUNDAF TRIP",
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
    "h_how": "КАК МЫ РАБОТАЕМ С DMC-ПАРТНЁРАМИ",
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
    "h_look": "ЧТО МЫ ИЩЕМ В DMC-ПАРТНЁРЕ",
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
    "h_snapshot": "КРАТКО О КОМПАНИИ",
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
    "h_groups": "НАШИ ГРУППЫ В ДЕЛЕ",
    "groups_intro": ("Реальные групповые выезды, проведённые нами по России, "
                     "Центральной Азии, Китаю и Индии — каждую поездку "
                     "сопровождал наш собственный турлидер."),
    "photos": [
        ("cp-1.jpg", "Северное сияние — Мурманск"),
        ("cp-2.jpg", "Группа под северным сиянием — Мурманск"),
        ("trip-1.jpg", "Красная площадь, Москва"),
        ("trip-4.jpg", "Озеро Каинды, Казахстан"),
        ("cp-3.jpg", "Охота за сиянием — Мурманск"),
        ("cp-4.jpg", "Путешественники Sundaf Trip — Мурманск"),
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
    if lang == "ru":
        register_cyrillic()
        FONTMAP = {"Helvetica": "ArialRU", "Helvetica-Bold": "ArialRU-Bold"}
    else:
        FONTMAP = {}

    T = content(lang, person)
    c = canvas.Canvas(output_path, pagesize=A4)
    c.setTitle(T["doc_title"])
    c.setAuthor("CV Sundaf Holiday Group")
    c.setSubject("Company Profile")
    page_one(c, T)
    c.showPage()
    page_two(c, T)
    c.showPage()
    page_three(c, T)
    c.showPage()
    c.save()
    print(f"PDF written to {output_path}")


def main():
    build(OUTPUT_EN, lang="en", person="ferdiansah")
    build(OUTPUT_BILLY, lang="en", person="billy")
    build(OUTPUT_RU, lang="ru", person="ferdiansah")


if __name__ == "__main__":
    main()
