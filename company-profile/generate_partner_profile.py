#!/usr/bin/env python3
"""Build the six-page partner company profile from shared English/Billy copy.
Run: python3 company-profile/generate_partner_profile.py
Requires reportlab and Pillow. Does not rebuild other profile variants.
"""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image
from generate_company_profile import content

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'public/sundaftrip-company-profile-billy.pdf'
W,H=595.276,841.89
M=49;CW=W-2*M
INK='#202727';GRAY='#555D60';LINE='#BCC4C6'
for name,file in [('Regular','DMSans-Regular.ttf'),('Bold','DMSans-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(ROOT/'assets/fonts/dm-sans'/file)))
T=content('en','billy')
c=None

def text(s,x,y,size=10.5,font='Regular',color=INK):
    c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,H-y-size,s.replace('–','-'))
def paragraph(s,x,y,width=CW,size=10.5,leading=15.5,font='Regular',color=INK):
    for line in simpleSplit(s.replace('–','-'),font,size,width):
        text(line,x,y,size,font,color);y+=leading
    return y

def line(y,x=M,width=CW):
    c.setStrokeColor(HexColor(LINE));c.setLineWidth(.5);c.line(x,H-y,x+width,H-y)
def heading(s,y):text(s,M,y,14,'Bold');return y+29

def page(n,title):
    text('SUNDAF TRIP',M,34,9,'Bold');text('Company profile',W-133,34,8.5,color=GRAY)
    line(57);text(title,M,84,24,'Bold')
    line(785);text('CV Sundaf Holiday Group  |  Jakarta, Indonesia',M,799,8,color=GRAY)
    text(str(n),W-M-5,799,8,color=GRAY)
def photo(file,x,y,width):
    p=ROOT/'public/trip-photos'/file
    with Image.open(p) as im:height=width*im.height/im.width
    c.drawImage(str(p),x,H-y-height,width,height)
    return height

def block(x,y,w,h,color):
    c.setFillColor(HexColor(color));c.rect(x,H-y-h,w,h,stroke=0,fill=1)

TEAL='#075D63'
PALE='#EAEEEE'
def section(n,title):
    text(title,M,66,28,'Bold',TEAL)
    text('SUNDAF TRIP',M,801,8,color=GRAY)
    text(str(n),W-M-6,801,8,color=GRAY)

def build():
 global c
 c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1,invariant=1)
 c.setTitle('Sundaf Trip - Company Profile');c.setAuthor('Sundaf Trip')
 c.setSubject('Company information and DMC partnerships')
 # Cover: a photograph and one brand block, with ordinary company identification.
 with Image.open(ROOT/'public/logo.png') as im:ratio=im.height/im.width
 c.drawImage(str(ROOT/'public/logo.png'),M,H-48-105*ratio,105,105*ratio,mask='auto')
 photo('trip-5.jpg',M,125,W-M)
 block(0,490,390,248,TEAL)
 text('Sundaf Trip',M,526,35,'Bold','#FFFFFF')
 text('Company profile',M,582,19,'Regular','#FFFFFF')
 paragraph('Indonesia-based tour operator',M,638,290,12,18,color='#FFFFFF')
 text('CV Sundaf Holiday Group',M,774,10,color=GRAY)
 c.showPage()
 # About: a short introduction paired with the company record.
 section(2,'About Sundaf Trip')
 y=paragraph(T['about1'],M,135,CW,11,17)+16
 y=paragraph(T['about2'],M,y,CW,11,17)+33
 block(0,y-6,15,320,TEAL)
 text('Company information',M,y,16,'Bold',TEAL);y+=40
 for label,value in T['snapshot']:
    text(label,M,y,9.5,color=GRAY)
    end=paragraph(value,229,y,CW-180,10,15)
    y=max(y+33,end+13)
 line(y-8)
 paragraph('10-20 pax per group. 5+ target destinations. 100% own tour leader. B2C + B2B sales model.',M,y+13,CW,9.5,15,color=GRAY)
 c.showPage()
 # Services: a photographic column and a simple list rather than cards.
 section(3,'Our services')
 block(0,131,233,593,PALE)
 # Fit the original portrait-friendly photograph without changing its aspect ratio.
 photo('trip-5.jpg',0,166,233)
 block(0,321,233,179,TEAL)
 paragraph('Small group tours',28,347,179,23,29,'Bold','#FFFFFF')
 paragraph('Affordable international travel from Indonesia, accompanied by our own tour leaders.',28,423,179,11,17,color='#FFFFFF')
 y=137
 for label,body in T['services']:
    text(label,267,y,12,'Bold',TEAL)
    y=paragraph(body,267,y+26,279,10.5,16)+25
 c.showPage()
 # Cooperation: facts and responsibilities, using the unchanged source content.
 section(4,'DMC partnerships')
 text('Why partner with Sundaf Trip',M,136,15,'Bold',TEAL)
 y=172
 for reason in T['reasons']:
    text('•',M,y,10);y=paragraph(reason,M+15,y,CW-15,10,15)+9
 y+=24;text('How we work together',M,y,15,'Bold',TEAL);y+=39
 for label,body in T['steps']:
    text(label,M,y,11,'Bold')
    y=paragraph(body,M,y+21,CW,10,15)+16
 c.showPage()
 # Destinations: one real photograph and practical partner requirements.
 section(5,'Destinations')
 y=paragraph(T['dest_current'],M,132,CW,12,18)+20
 text('Planned expansion',M,y,12,'Bold',TEAL);y+=26
 for item in T['dest_exp']:
    text('•',M,y,10);y=paragraph(item,M+15,y,CW-15,10,15)+5
 y+=14
 ph=photo('trip-1.jpg',M,y,300)
 paragraph(T['groups_intro'],374,y,172,10,15)
 text('Red Square, Moscow',M,y+ph+9,8,color=GRAY)
 y=y+ph+48;text('What we look for in a DMC partner',M,y,15,'Bold',TEAL);y+=34
 for item in T['wants']:
    text('•',M,y,10);y=paragraph(item,M+15,y,CW-15,10,15)+7
 c.showPage()
 # Closing: a real group photograph, contact block and clear legal identity.
 section(6,'Contact information')
 ph=photo('trip-4.jpg',175,135,372)
 text('Kaindy Lake, Kazakhstan',175,135+ph+8,8,color=GRAY)
 block(0,452,365,300,TEAL)
 text('Partnership enquiries',M,481,20,'Bold','#FFFFFF')
 paragraph(T['leaders'],M,532,280,11,17,'Bold','#FFFFFF')
 y=584
 for label,value,url in [('Email',T['email'],'mailto:'+T['email']),('WhatsApp',T['wa_display'],T['wa_url']),('Website','sundaftrip.com','https://www.sundaftrip.com')]:
    text(label,M,y,9,color='#FFFFFF');text(value,M,y+17,12,color='#FFFFFF')
    c.linkURL(url,(M,H-y-36,350,H-y-14),relative=0,thickness=0);y+=48
 c.showPage();c.save();print(OUT)
if __name__=='__main__':build()
