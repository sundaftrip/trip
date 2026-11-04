#!/usr/bin/env python3
"""Build the four-page partner company profile from shared English/Billy copy.
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

def build():
 global c
 c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1,invariant=1)
 c.setTitle('Sundaf Trip - Company Profile');c.setAuthor('Sundaf Trip')
 c.setSubject('Company information and DMC partnerships')
 # 1. A business introduction and company record, without a marketing cover.
 page(1,'Company profile')
 with Image.open(ROOT/'public/logo.png') as im:ratio=im.height/im.width
 c.drawImage(str(ROOT/'public/logo.png'),M, H-146-100*ratio,100,100*ratio,mask='auto')
 text('Indonesian tour operator',185,151,12,'Bold')
 text('Small group tours and DMC partnerships',185,172,10,color=GRAY)
 y=heading('About Sundaf Trip',219)
 y=paragraph(T['about1'],M,y)+10
 y=paragraph(T['about2'],M,y)+26
 y=heading('Company information',y)
 for label,value in T['snapshot']:
    line(y-7)
    text(label,M,y,9.5,color=GRAY)
    end=paragraph(value,229,y,CW-180,10,15)
    y=max(y+32,end+14)
 line(y-7)
 # The same source figures, treated as a plain note rather than statistic tiles.
 paragraph('10-20 pax per group.  5+ target destinations.  100% own tour leader.\nB2C + B2B sales model.'.replace('\n',' '),M,y+12,CW,9,14,color=GRAY)
 c.showPage()
 # 2. Continuous prose with functional section titles.
 page(2,'Services and partnerships')
 y=142
 for label,body in T['services']:
    text(label,M,y,11,'Bold');y=paragraph(body,M,y+20,CW,10.5,15.5)+18
 y=heading('Why partner with Sundaf Trip',y+8)
 for reason in T['reasons']:
    text('•',M,y,10);y=paragraph(reason,M+15,y,CW-15,10,15)+9
 c.showPage()
 # 3. Full workflow and requirements, laid out as a conventional document.
 page(3,'Working with DMC partners')
 y=142
 for label,body in T['steps']:
    text(label,M,y,11,'Bold');y=paragraph(body,M,y+20,CW,10,15)+17
 y=heading('What we look for in a DMC partner',y+8)
 for item in T['wants']:
    text('•',M,y,10);y=paragraph(item,M+15,y,CW-15,10,15)+8
 c.showPage()
 # 4. Destination information, uncropped trip photographs and contact details.
 page(4,'Destinations and contact')
 y=heading('Current destinations',142)
 y=paragraph(T['dest_current'],M,y)+16
 y=heading('Planned expansion',y)
 for item in T['dest_exp']:
    text('•',M,y,10);y=paragraph(item,M+15,y,CW-15,10,15)+5
 y=heading('Our groups in action',y+15)
 y=paragraph(T['groups_intro'],M,y,CW,10,15)+15
 pw=(CW-17)/2
 h1=photo('trip-1.jpg',M,y,pw);h2=photo('trip-4.jpg',M+pw+17,y,pw)
 text('Red Square, Moscow',M,y+h1+8,8.5,color=GRAY)
 text('Kaindy Lake, Kazakhstan',M+pw+17,y+h2+8,8.5,color=GRAY)
 y=y+max(h1,h2)+47;line(y-10)
 y=heading('Partnership enquiries',y+7)
 text(T['leaders'],M,y,11,'Bold');y+=30
 for label,value,url in [('Email',T['email'],'mailto:'+T['email']),('WhatsApp',T['wa_display'],T['wa_url']),('Website','sundaftrip.com','https://www.sundaftrip.com')]:
    text(label,M,y,10,color=GRAY);text(value,M+85,y,10.5)
    c.linkURL(url,(M+85,H-y-16,W-M,H-y+2),relative=0,thickness=0);y+=24
 c.showPage();c.save();print(OUT)
if __name__=='__main__':build()
