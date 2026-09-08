#!/usr/bin/env python3
"""Build the public bilingual Sundaf Trip Peru / South America brochure.

Requires reportlab and the bundled files in assets/. All drawing is vector
apart from the supplied Sundaf logo. Font licences are bundled in assets/.
Run: python3 generate_brochure.py --output /path/to/brochure.pdf
"""
from pathlib import Path
import argparse
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parent
for name, filename in [('Body', 'NotoSans-Regular.ttf'), ('BodyBold', 'NotoSans-Bold.ttf'), ('Display', 'Rubik-Regular.ttf'), ('DisplayBold', 'Rubik-Bold.ttf')]:
    candidate = ROOT / 'assets' / filename
    if not candidate.is_file():
        raise FileNotFoundError(f'Required bundled font is missing: assets/{filename}')
    pdfmetrics.registerFont(TTFont(name, str(candidate)))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='BodyBold')

W, H = A4
INK = HexColor('#132B3A')
TEAL = HexColor('#009EA6')
DEEPTEAL = HexColor('#087C82')
AMBER = HexColor('#F2AC3A')
IVORY = HexColor('#FBF8F1')
MUTED = HexColor('#52656D')
LINE = HexColor('#D6E2E1')
PALE = HexColor('#ECF6F3')
WEB = 'https://sundaftrip.com/amerika-latin'
PERU = 'https://sundaftrip.com/peru-amerika-selatan'
MULTI = 'https://sundaftrip.com/amerika-latin/brasil-kolombia-peru-chile'
WHATSAPP = 'https://wa.me/6281775202759?text=Halo%20Sundaf%20Trip%2C%20saya%20berminat%20program%20Peru%20dan%20Amerika%20Latin%202027.'

def rect(c, x, top, width, height, color, radius=0, stroke=None):
    c.setFillColor(color)
    c.setStrokeColor(stroke or color)
    if radius:
        c.roundRect(x, H-top-height, width, height, radius, stroke=int(stroke is not None), fill=1)
    else:
        c.rect(x, H-top-height, width, height, stroke=int(stroke is not None), fill=1)

def text(c, value, x, top, size=10, font='Body', color=INK):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, H-top-size, value)

def para(c, value, x, top, width, size=10.2, leading=15, color=INK, font='Body', limit=None):
    style = ParagraphStyle('p', fontName=font, fontSize=size, leading=leading, textColor=color, spaceAfter=0)
    p = Paragraph(value, style)
    _, height = p.wrap(width, H)
    if limit is not None and height > limit:
        raise ValueError(f'Paragraph exceeds reserved space: {height}>{limit}: {value[:100]}')
    p.drawOn(c, x, H-top-height)
    return height

def link(c, value, x, top, url, size=9.5, color=DEEPTEAL):
    text(c, value, x, top, size, 'BodyBold', color)
    width = pdfmetrics.stringWidth(value, 'BodyBold', size)
    c.linkURL(url, (x, H-top-size-3, x+width, H-top+2), relative=0, thickness=0)

def header(c, subtitle):
    rect(c, 0, 0, W, H, IVORY)
    logo = ROOT / 'assets' / 'sundaf-logo.png'
    c.drawImage(str(logo), 40, H-74, width=135, height=38.5, mask='auto', preserveAspectRatio=True)
    text(c, subtitle, 321, 43, 8.5, 'BodyBold', MUTED)
    c.setStrokeColor(LINE)
    c.line(40, H-88, W-40, H-88)

def footer(c, page, language):
    c.setStrokeColor(LINE)
    c.line(40, 47, W-40, 47)
    text(c, 'SUNDAF TRIP  /  CV Sundaf Holiday Group', 40, H-37, 7.5, 'BodyBold', MUTED)
    text(c, f'SEP 2026  |  {language}  |  {page:02}', W-173, H-37, 7.2, 'Body', MUTED)

def mountain(c, x, top):
    """Abstract vector motif, not a photograph or geographic map."""
    pts = [(0,110),(26,74),(47,91),(79,33),(113,78),(139,50),(168,110)]
    p = c.beginPath()
    p.moveTo(x, H-top-pts[0][1])
    for px,py in pts[1:]: p.lineTo(x+px,H-top-py)
    c.setStrokeColor(TEAL); c.setLineWidth(2)
    c.drawPath(p, stroke=1, fill=0)
    c.setStrokeColor(HexColor('#315365')); c.setLineWidth(.7)
    for offset in (10,20,30):
        p=c.beginPath(); p.moveTo(x,H-top-110-offset)
        for px,py in pts[1:]: p.lineTo(x+px,H-top-py-offset)
        c.drawPath(p,stroke=1,fill=0)
    c.setFillColor(AMBER); c.circle(x+143,H-top-19,10,stroke=0,fill=1)

def route(c, x, top, width, names, dark=False):
    color = white if dark else INK
    step=width/(len(names)-1)
    c.setStrokeColor(TEAL); c.setLineWidth(1.25)
    c.line(x,H-top,x+width,H-top)
    for i,name in enumerate(names):
        xx=x+i*step
        c.setFillColor(AMBER if i==len(names)-1 else TEAL)
        c.circle(xx,H-top,3.5,stroke=0,fill=1)
        words=name.split('|')
        for j,line in enumerate(words):
            fs=8.2
            ww=pdfmetrics.stringWidth(line,'BodyBold',fs)
            text(c,line,xx-ww/2,top+9+j*11,fs,'BodyBold',color)

def public_indonesian(c):
    header(c, 'KATALOG PROGRAM 2027  /  INDONESIA')
    rect(c,0,105,W,173,INK)
    text(c,'JELAJAH AMERIKA LATIN',40,123,9.5,'BodyBold',AMBER)
    text(c,'Peru &',40,144,37,'DisplayBold',white)
    text(c,'Amerika Selatan',40,187,31,'DisplayBold',white)
    text(c,'Program grup 2027 dalam pengembangan',41,239,10.5,'Body',white)
    mountain(c,401,119)

    rect(c,40,296,W-80,161,white,10,LINE)
    text(c,'01  /  PERU',57,310,8.5,'BodyBold',DEEPTEAL)
    text(c,'Lima, Cusco & Machu Picchu',57,329,20,'DisplayBold')
    route(c,76,374,441,['Lima','Cusco','Ollantaytambo','Aguas|Calientes','Machu|Picchu'])
    para(c,'Kembali melalui Cusco. Rancangan Peru tersendiri dikembangkan dari segmen program Amerika Selatan; memerlukan quotation khusus.',57,413,477,9,13,color=MUTED,limit=27)

    rect(c,40,473,W-80,138,white,10,LINE)
    text(c,'02  /  EMPAT NEGARA',57,487,8.5,'BodyBold',DEEPTEAL)
    text(c,'Brasil - Kolombia - Peru - Chile',57,506,18.5,'DisplayBold')
    para(c,'Rute indikatif: São Paulo - Bogotá - Lima - Cusco / Machu Picchu - Santiago - Rio de Janeiro - Iguazu - São Paulo.',57,539,477,10,14,limit=30)
    para(c,'Pengembangan didukung proposal dari supplier regional. Urutan akhir, durasi dan koneksi penerbangan disesuaikan melalui quotation.',57,577,477,8.8,12.5,color=MUTED,limit=26)

    para(c,'<b>Pilihan yang dapat diminta:</b> hotel 3/4 bintang, transfer privat, pemandu berbahasa Inggris, kereta dan kunjungan Machu Picchu sesuai ketersediaan.',40,629,W-80,9.6,14,limit=30)

    rect(c,40,674,W-80,104,PALE,10)
    text(c,'Minta rancangan & penawaran',57,687,16.5,'DisplayBold')
    link(c,'sundaftrip.com/amerika-latin',57,714,WEB,10)
    link(c,'WhatsApp +62 817 7520 2759',301,714,WHATSAPP,9.3)
    para(c,'Tanggal, harga dan ketersediaan dikonfirmasi melalui penawaran. Layanan darat, penerbangan regional dan penerbangan dari Indonesia mengikuti proposal final. Belum ada keberangkatan yang dikonfirmasi.',57,739,478,8,11,limit=33)
    footer(c,1,'ID')
    c.showPage()

def trade_english(c):
    header(c, 'TRADE PRODUCT BRIEF  /  ENGLISH')
    text(c,'INDONESIAN OUTBOUND MARKET',40,112,9.2,'BodyBold',DEEPTEAL)
    text(c,'Peru & South America',40,137,29,'DisplayBold')
    text(c,'2027 programme development',40,176,17,'Display',MUTED)
    para(c,'Sundaf Trip is developing group journeys for Indonesian travellers. Detailed proposals received from regional suppliers support the development of a Brazil, Colombia, Peru and Chile programme.',40,212,W-80,11,16.5,limit=51)

    rect(c,40,282,247,177,white,10,LINE)
    text(c,'PERU PROGRAMME',57,298,9,'BodyBold',DEEPTEAL)
    text(c,'A dedicated Peru journey',57,320,15,'DisplayBold')
    para(c,'Lima - Cusco - Ollantaytambo - Aguas Calientes - Machu Picchu, returning via Cusco.',57,351,212,10,15,limit=46)
    para(c,'Adapted from the Peru segment of the wider programme. A standalone supplier quotation is required.',57,408,212,9.2,13.4,color=MUTED,limit=41)

    rect(c,303,282,252,177,white,10,LINE)
    text(c,'FOUR-COUNTRY PROGRAMME',320,298,9,'BodyBold',DEEPTEAL)
    text(c,'Brazil, Colombia, Peru, Chile',320,320,13.1,'DisplayBold')
    para(c,'Indicative stops: São Paulo, Bogotá, Lima, Cusco / Machu Picchu, Santiago, Rio de Janeiro and Iguazu.',320,351,215,10,15,limit=46)
    para(c,'Supplier proposals received. Final sequencing, duration and flight connections remain under review.',320,408,215,9.2,13.4,color=MUTED,limit=41)

    text(c,'SERVICES OPEN FOR DISCUSSION',40,481,9,'BodyBold',DEEPTEAL)
    para(c,'3- or 4-star hotels; private transfers; English-speaking guides; rail arrangements and Machu Picchu visits, subject to availability. Land services and regional and Indonesia-origin flights will be defined in the final quotation.',40,503,W-80,10.2,15,limit=46)

    rect(c,40,568,W-80,83,INK,10)
    text(c,'Enquiries welcome',57,583,16,'DisplayBold',white)
    para(c,'Dates, the final route and duration, pricing and availability are confirmed by quotation. No departure has been confirmed. Partner discussions and tailored group enquiries are welcome.',57,611,477,9.2,13,color=white,limit=39)

    text(c,'SUNDAF TRIP',40,676,12,'DisplayBold')
    text(c,'CV Sundaf Holiday Group  |  Indonesia',40,697,9.6,'Body',MUTED)
    link(c,'info@sundaftrip.com',40,722,'mailto:info@sundaftrip.com',10)
    link(c,'WhatsApp +62 817 7520 2759',297,722,WHATSAPP,9.5)
    link(c,'Explore the catalogue',40,748,WEB,9.5)
    link(c,'Peru programme',220,748,PERU,9.5)
    link(c,'Four-country programme',381,748,MULTI,9.3)
    footer(c,2,'EN')
    c.showPage()

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=Path,default=ROOT/'sundaf-trip-peru-south-america-2027.pdf')
    args=parser.parse_args()
    args.output.parent.mkdir(parents=True,exist_ok=True)
    c=canvas.Canvas(str(args.output),pagesize=A4,pageCompression=1)
    c.setTitle('Sundaf Trip | Peru & South America 2027')
    c.setAuthor('Sundaf Trip - CV Sundaf Holiday Group')
    c.setSubject('Public product-development brochure: Indonesian customer catalogue and English trade brief')
    c.setKeywords('Sundaf Trip, Peru, South America, Amerika Latin, 2027, programme development')
    public_indonesian(c); trade_english(c); c.save()
    print(args.output)

if __name__=='__main__': main()
