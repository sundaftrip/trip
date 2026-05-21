#!/usr/bin/env python3
"""
Sundaf Trip — Company Profile PDF generator.

Outputs a 2-page A4 B2B company profile with clickable email / website /
WhatsApp links. Edit the CONFIG block below, then run:

    python3 generate_company_profile.py
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import simpleSplit
from reportlab.pdfgen import canvas

# --------------------------------------------------------------------------
# CONFIG — edit these values, then re-run the script.
# --------------------------------------------------------------------------
OUTPUT_PATH = "/Users/ferdiansahyusuf/sundaftrip/public/sundaftrip-company-profile.pdf"
PHOTO_DIR   = "/Users/ferdiansahyusuf/sundaftrip/public/trip-photos"
LOGO_PATH   = "/Users/ferdiansahyusuf/sundaftrip/company-profile/logo-white.png"

EMAIL        = "info@sundaftrip.com"
WEBSITE      = "sundaftrip.com"
WEBSITE_URL  = "https://sundaftrip.com"
WA_DISPLAY   = "+62 817-7520-2759"
WA_URL       = "https://wa.me/6281775202759"
LEGAL_ENTITY = "CV Sundaf Holiday Group"
NIB          = "1601260060842"
CITY         = "Jakarta, Indonesia"

# --------------------------------------------------------------------------
# Brand palette
# --------------------------------------------------------------------------
NAVY   = (0x0C / 255, 0x26 / 255, 0x47 / 255)
ORANGE = (0xFE / 255, 0x80 / 255, 0x32 / 255)
WHITE  = (1, 1, 1)
GREY   = (0.36, 0.38, 0.42)
LGREY  = (0.55, 0.57, 0.60)
CARDBG = (0.945, 0.945, 0.955)
LINKBL = (0.20, 0.45, 0.78)

W, H = A4
LM, RM = 42, 42
CW = W - LM - RM


# --------------------------------------------------------------------------
# Low-level helpers
# --------------------------------------------------------------------------
def set_fill(c, rgb):
    c.setFillColorRGB(*rgb)


def text(c, x, y, s, font="Helvetica", size=10, color=GREY):
    set_fill(c, color)
    c.setFont(font, size)
    c.drawString(x, y, s)


def text_center(c, x, y, s, font="Helvetica", size=10, color=GREY):
    set_fill(c, color)
    c.setFont(font, size)
    c.drawCentredString(x, y, s)


def link(c, x, y, s, url, font="Helvetica", size=10, color=LINKBL,
         underline=True):
    """Draw a string and register a clickable URL over its bounding box."""
    set_fill(c, color)
    c.setFont(font, size)
    c.drawString(x, y, s)
    tw = c.stringWidth(s, font, size)
    if underline:
        c.setStrokeColorRGB(*color)
        c.setLineWidth(0.6)
        c.line(x, y - 1.6, x + tw, y - 1.6)
    c.linkURL(url, (x, y - 3, x + tw, y + size), relative=0,
              thickness=0, kind="URI")
    return tw


def paragraph(c, x, y, body, width, font="Helvetica", size=9,
              color=GREY, leading=12.5):
    """Word-wrapped block. Returns the y position after the last line."""
    set_fill(c, color)
    c.setFont(font, size)
    for line in simpleSplit(body, font, size, width):
        c.drawString(x, y, line)
        y -= leading
    return y


def section_heading(c, x, y, label):
    """Orange tick + bold navy section heading."""
    set_fill(c, ORANGE)
    c.rect(x, y - 2, 5, 17, stroke=0, fill=1)
    text(c, x + 13, y + 2, label, "Helvetica-Bold", 13.5, NAVY)
    return y - 20


def bullet(c, x, y, body, width):
    set_fill(c, ORANGE)
    c.circle(x + 3, y + 3, 2.6, stroke=0, fill=1)
    return paragraph(c, x + 13, y, body, width - 13,
                     "Helvetica", 9, GREY, 12.5)


# --------------------------------------------------------------------------
# Shared page furniture
# --------------------------------------------------------------------------
TAGLINE = ("Small Group Tours   |   Affordable International Travel   |   "
           "Indonesia-based Tour Operator")


def draw_header(c):
    set_fill(c, NAVY)
    c.rect(0, H - 86, W, 86, stroke=0, fill=1)
    logo_h = 34
    logo_w = logo_h * 862 / 241          # logo-white.png is 862x241
    c.drawImage(LOGO_PATH, LM + 16, H - 58, width=logo_w, height=logo_h,
                mask="auto")
    text(c, LM + 17, H - 71, TAGLINE, "Helvetica", 9, (0.78, 0.82, 0.88))
    set_fill(c, ORANGE)
    c.rect(0, H - 90, W, 4, stroke=0, fill=1)


def draw_footer(c, page_no):
    set_fill(c, ORANGE)
    c.rect(0, 46, W, 2.5, stroke=0, fill=1)
    y = 33
    x = LM
    x += text_chunk(c, x, y, EMAIL, mailto=True)
    x += sep(c, x, y)
    x += text_chunk(c, x, y, WEBSITE, url=WEBSITE_URL)
    x += sep(c, x, y)
    x += text_chunk(c, x, y, LEGAL_ENTITY)
    x += sep(c, x, y)
    x += text_chunk(c, x, y, CITY)
    text(c, W - RM - 38, y, f"Page {page_no}", "Helvetica", 8, LGREY)


def text_chunk(c, x, y, s, mailto=False, url=None):
    """Footer text chunk; clickable when mailto/url given. Returns advance."""
    font, size = "Helvetica", 8
    if mailto or url:
        target = f"mailto:{s}" if mailto else url
        set_fill(c, LINKBL)
        c.setFont(font, size)
        c.drawString(x, y, s)
        tw = c.stringWidth(s, font, size)
        c.linkURL(target, (x, y - 2, x + tw, y + size), relative=0,
                  thickness=0, kind="URI")
        return tw
    text(c, x, y, s, font, size, LGREY)
    return c.stringWidth(s, font, size)


def sep(c, x, y):
    text(c, x + 5, y, "|", "Helvetica", 8, (0.78, 0.80, 0.83))
    return c.stringWidth("  |  ", "Helvetica", 8) + 4


# --------------------------------------------------------------------------
# Page 1
# --------------------------------------------------------------------------
def page_one(c):
    draw_header(c)
    y = H - 118

    # --- ABOUT US ---
    y = section_heading(c, LM, y, "ABOUT US")
    about1 = ("Sundaf Trip is an Indonesian tour operator under "
              "CV Sundaf Holiday Group, based in Jakarta. We specialize in "
              "organizing affordable, well-curated small group tours to "
              "international destinations. Our focus is delivering high-value "
              "travel experiences with personal attention — ensuring every "
              "trip is safe, enjoyable, and memorable.")
    about2 = ("Founded by Ferdiansah with co-founder Billy, Sundaf Trip was "
              "built on the belief that international travel should be "
              "accessible to more people. We handle end-to-end trip "
              "operations including itinerary design, group coordination, "
              "and on-ground tour leadership.")
    y = paragraph(c, LM, y, about1, CW) - 5
    y = paragraph(c, LM, y, about2, CW) - 16

    # --- STAT CARDS ---
    stats = [("10–20", "PAX PER GROUP"),
             ("5+", "TARGET DESTINATIONS"),
             ("100%", "OWN TOUR LEADER"),
             ("B2C + B2B", "SALES MODEL")]
    gap = 12
    card_w = (CW - 3 * gap) / 4
    card_h = 56
    cy = y - card_h
    for i, (num, label) in enumerate(stats):
        cx = LM + i * (card_w + gap)
        set_fill(c, CARDBG)
        c.roundRect(cx, cy, card_w, card_h, 6, stroke=0, fill=1)
        text_center(c, cx + card_w / 2, cy + 30, num,
                    "Helvetica-Bold", 17, ORANGE)
        text_center(c, cx + card_w / 2, cy + 14, label,
                    "Helvetica", 7, GREY)
    y = cy - 26

    # --- OUR SERVICES ---
    y = section_heading(c, LM, y, "OUR SERVICES")
    services = [
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
    ]
    col_gap = 26
    col_w = (CW - col_gap) / 2
    row_h = 56
    for i, (title, body) in enumerate(services):
        col = i % 2
        row = i // 2
        sx = LM + col * (col_w + col_gap)
        sy = y - row * row_h
        text(c, sx, sy, title, "Helvetica-Bold", 10, NAVY)
        paragraph(c, sx, sy - 13, body, col_w, "Helvetica", 8.5, GREY, 11)
    y = y - 3 * row_h - 8

    # --- DESTINATIONS ---
    y = section_heading(c, LM, y, "DESTINATIONS")
    label_w = 74
    text(c, LM, y, "Current:", "Helvetica-Bold", 9, NAVY)
    text(c, LM + label_w, y,
         "Russia (Moscow, St. Petersburg, Murmansk), Central Asia, "
         "and India",
         "Helvetica", 9, GREY)
    y -= 15
    text(c, LM, y, "Expanding to:", "Helvetica-Bold", 9, NAVY)
    text(c, LM + label_w, y,
         "Western Europe (France, Netherlands, Germany, Switzerland, Italy)",
         "Helvetica", 9, GREY)
    y -= 12.5
    text(c, LM + label_w, y, "Scandinavia (Norway, Sweden, Finland)",
         "Helvetica", 9, GREY)
    y -= 12.5
    text(c, LM + label_w, y, "Other destinations based on market demand",
         "Helvetica", 9, GREY)
    y -= 22

    # --- WHY PARTNER ---
    y = section_heading(c, LM, y, "WHY PARTNER WITH SUNDAF TRIP")
    reasons = [
        "Small group sizes of 10–20 pax per departure — ideal for "
        "focused, well-coordinated ground arrangements.",
        "We bring our own tour leader — your team only needs to handle "
        "logistics and ground operations.",
        "Growing Indonesian outbound travel market with strong demand for "
        "affordable Europe packages.",
        "Long-term partnership mindset — we are looking for a reliable DMC "
        "to grow with, not one-off deals.",
        "Professional operations: structured itineraries, clear "
        "communication, and on-time coordination.",
    ]
    for r in reasons:
        y = bullet(c, LM, y, r, CW) - 4

    draw_footer(c, 1)


# --------------------------------------------------------------------------
# Page 2
# --------------------------------------------------------------------------
def page_two(c):
    draw_header(c)
    y = H - 118

    # --- HOW WE WORK WITH DMC PARTNERS ---
    y = section_heading(c, LM, y, "HOW WE WORK WITH DMC PARTNERS")
    steps = [
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
    ]
    for title, body in steps:
        text(c, LM, y, title, "Helvetica-Bold", 10, ORANGE)
        y = paragraph(c, LM, y - 13, body, CW, "Helvetica", 9, GREY, 11.5)
        y -= 4

    y -= 12
    # --- WHAT WE LOOK FOR ---
    y = section_heading(c, LM, y, "WHAT WE LOOK FOR IN A DMC PARTNER")
    wants = [
        "Competitive group rates for 3-star hotels in city center or "
        "well-connected locations.",
        "Reliable coach / minibus transportation with experienced drivers.",
        "Meal arrangements — flexible between restaurant bookings and "
        "self-catered options.",
        "Attraction tickets and skip-the-line access where available.",
        "Transparent pricing with clear inclusions — no hidden costs.",
        "Responsive communication, ideally via email and WhatsApp.",
    ]
    for w in wants:
        y = bullet(c, LM, y, w, CW) - 4
    y -= 6

    # --- LET'S TALK BOX ---
    box_h = 104
    box_y = y - box_h
    set_fill(c, NAVY)
    c.roundRect(LM, box_y, CW, box_h, 8, stroke=0, fill=1)
    pad = 22
    ix = LM + pad
    set_fill(c, ORANGE)
    c.rect(ix, box_y + box_h - 40, 5, 20, stroke=0, fill=1)
    text(c, ix + 14, box_y + box_h - 36, "Let's Talk",
         "Helvetica-Bold", 16, WHITE)

    line_y = box_y + box_h - 54
    LH = 15.5
    light = (0.82, 0.85, 0.90)
    text(c, ix, line_y, "Ferdiansah, Founder   ·   Billy, Co-Founder",
         "Helvetica", 9.5, light)
    line_y -= LH
    lx = ix + text_label(c, ix, line_y, "Email:  ", light)
    link(c, lx, line_y, EMAIL, f"mailto:{EMAIL}",
         "Helvetica", 9.5, (0.62, 0.80, 1.0))
    line_y -= LH
    lx = ix + text_label(c, ix, line_y, "WhatsApp:  ", light)
    link(c, lx, line_y, WA_DISPLAY, WA_URL,
         "Helvetica", 9.5, (0.62, 0.80, 1.0))
    line_y -= LH
    lx = ix + text_label(c, ix, line_y, "Website:  ", light)
    link(c, lx, line_y, WEBSITE, WEBSITE_URL,
         "Helvetica", 9.5, (0.62, 0.80, 1.0))

    # right column of the box
    rx = LM + CW - pad
    set_fill(c, ORANGE)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawRightString(rx, box_y + box_h - 36, "CV SUNDAF HOLIDAY GROUP")
    set_fill(c, light)
    c.setFont("Helvetica", 9)
    c.drawRightString(rx, box_y + box_h - 52, f"NIB: {NIB}")
    c.drawRightString(rx, box_y + box_h - 68, CITY)
    c.drawRightString(rx, box_y + box_h - 84, "B2C + B2B Tour Operator")

    y = box_y - 20

    # --- COMPANY SNAPSHOT (fills lower page 2) ---
    y = section_heading(c, LM, y, "COMPANY SNAPSHOT")
    snapshot = [
        ("Legal Entity", "CV Sundaf Holiday Group"),
        ("Business License (NIB)", NIB),
        ("Headquarters", "Jakarta, Indonesia"),
        ("Founder & Co-Founder", "Ferdiansah, Billy"),
        ("Business Model", "B2C + B2B (Tour Operator)"),
        ("Group Size", "10–20 pax per departure"),
        ("Tour Leadership", "Own Indonesian-speaking tour leader"),
        ("Current Destinations", "Russia, Central Asia, and India"),
        ("Target Expansion", "Western Europe & Scandinavia"),
    ]
    panel_h = 18 + len(snapshot) * 15
    panel_y = y - panel_h
    set_fill(c, CARDBG)
    c.roundRect(LM, panel_y, CW, panel_h, 6, stroke=0, fill=1)
    row_y = y - 16
    for k, v in snapshot:
        text(c, LM + 20, row_y, k, "Helvetica-Bold", 8.5, NAVY)
        text(c, LM + 200, row_y, v, "Helvetica", 8.5, GREY)
        row_y -= 15

    draw_footer(c, 2)


def text_label(c, x, y, s, color):
    """Draw a plain label, return its advance width."""
    text(c, x, y, s, "Helvetica", 9.5, color)
    return c.stringWidth(s, "Helvetica", 9.5)


# --------------------------------------------------------------------------
# Page 3 — photo gallery
# --------------------------------------------------------------------------
TRIP_PHOTOS = [
    ("trip-1.jpg", "Red Square, Moscow"),
    ("trip-2.jpg", "Taj Mahal, India"),
    ("trip-3.jpg", "Jade Dragon Snow Mountain, China"),
    ("trip-4.jpg", "Kaindy Lake, Kazakhstan"),
    ("trip-5.jpg", "Aurora borealis, Murmansk"),
    ("trip-6.jpg", "Group departure — Moscow (Sheremetyevo)"),
]


def page_three(c):
    draw_header(c)
    y = H - 118

    y = section_heading(c, LM, y, "OUR GROUPS IN ACTION")
    intro = ("Real group departures we have operated across Russia, "
             "Central Asia, China, and India — every trip accompanied by "
             "our own Indonesian-speaking tour leader.")
    y = paragraph(c, LM, y, intro, CW) - 16

    gap = 14
    col_w = (CW - gap) / 2
    img_h = col_w * 2 / 3          # photos are 3:2 landscape
    row_h = img_h + 26
    top = y

    for i, (fn, cap) in enumerate(TRIP_PHOTOS):
        col = i % 2
        row = i // 2
        px = LM + col * (col_w + gap)
        img_top = top - row * row_h
        img_y = img_top - img_h
        c.drawImage(f"{PHOTO_DIR}/{fn}", px, img_y,
                    width=col_w, height=img_h)
        c.setStrokeColorRGB(*CARDBG)
        c.setLineWidth(0.75)
        c.rect(px, img_y, col_w, img_h, stroke=1, fill=0)
        text(c, px + 1, img_y - 13, cap, "Helvetica", 8.5, GREY)

    draw_footer(c, 3)


# --------------------------------------------------------------------------
def main():
    c = canvas.Canvas(OUTPUT_PATH, pagesize=A4)
    c.setTitle("Sundaf Trip — Company Profile")
    c.setAuthor("CV Sundaf Holiday Group")
    c.setSubject("Company Profile for DMC Partners")
    page_one(c)
    c.showPage()
    page_two(c)
    c.showPage()
    page_three(c)
    c.showPage()
    c.save()
    print(f"PDF written to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
