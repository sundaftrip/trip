#!/usr/bin/env python3
"""Generate only the /partner PDF. Run from any working directory.
Uses the shared, existing English/Billy content and repository brand assets.
Requires reportlab and Pillow. Does not rebuild other company profiles.
"""
from pathlib import Path
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image, ImageOps
from generate_company_profile import content

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/sundaftrip-company-profile-billy.pdf'
W,H=595.276,841.89
M=48; CW=W-2*M
INK='#183D3F'; MUTED='#536866'; GOLD='#A67F42'; PAPER='#F8F6F0'; LINE='#D7DED8'
for name,file in [('DM','DMSans-Regular.ttf'),('DMB','DMSans-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(ROOT/'assets/fonts/dm-sans'/file)))
T=content('en','billy')
c=None

def rect(x,y,w,h,color):
    c.setFillColor(HexColor(color));c.rect(x,H-y-h,w,h,fill=1,stroke=0)
def txt(s,x,y,size=10,font='DM',color=INK):
    c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,H-y-size,s)
def para(s,x,y,w,size=10,lead=15,font='DM',color=MUTED):
    lines=simpleSplit(s.replace('–','-'),font,size,w)
    for line in lines:txt(line,x,y,size,font,color);y+=lead
    return y

def rule(y,x=M,w=CW):rect(x,y,w,.6,LINE)
def photo(file,x,y,w,h):
    im=Image.open(ROOT/'public/trip-photos'/file).convert('RGB')
    im=ImageOps.fit(im,(int(w*2),int(h*2)),centering=(.5,.85) if file == 'trip-1.jpg' else (.5,.42))
    encoded=BytesIO()
    im.save(encoded, format="JPEG", quality=91, optimize=True)
    encoded.seek(0)
    c.drawImage(ImageReader(encoded),x,H-y-h,w,h)
def logo(x=M,y=35,white=False):
    p=ROOT/('company-profile/logo-white.png' if white else 'public/logo.png')
    im=Image.open(p);w=88;h=w*im.height/im.width
    c.drawImage(str(p),x,H-y-h,w,h,mask='auto')
def start(n,section):
    rect(0,0,W,H,PAPER);logo();txt('COMPANY PROFILE',W-169,43,7,'DMB',MUTED)
    rule(81);txt(section.upper(),M,105,8,'DMB',GOLD)
    rule(789);txt('SUNDAF TRIP  /  CV Sundaf Holiday Group',M,804,7,color=MUTED)
    txt(f'{n:02d}  /  05',W-91,804,7,color=MUTED)
def title(s,y=133,size=36):return para(s,M,y,CW,size,size*1.12,'Times-Roman',INK)
def finish():c.showPage()

def build():
 global c
 c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
 c.setTitle('Sundaf Trip | Company Profile for DMC Partners');c.setAuthor('Sundaf Trip');c.setSubject('Small-group tours and DMC partnerships')
 # 1: A photographic opening with the existing introduction and key figures.
 start(1,'01 / Introducing Sundaf Trip')
 title('Small groups.\nMeaningful journeys.'.replace('\n',' '),132,38)
 txt('FROM INDONESIA, LED BY OUR OWN TOUR LEADERS',M,237,8,'DMB',GOLD)
 photo('trip-5.jpg',M,270,CW,230)
 y=para(T['about1'],M,522,CW,10,15)
 y=para(T['about2'],M,y+10,CW,10,15)
 rule(694)
 for i,(num,label) in enumerate(T['stats']):
    x=M+i*128;txt(num.replace('–','-'),x,711,23,'Times-Roman');txt(label,x,747,6.4,'DMB',MUTED)
 finish()
 # 2: Services as editorial rows, then the complete existing partner rationale.
 start(2,'02 / Our services');title('Thoughtfully planned.\nPersonally led.'.replace('\n',' '),133,34)
 for i,(head,body) in enumerate(T['services']):
    col=i%2;row=i//2;x=M+col*262;y=239+row*102
    txt(f'0{i+1}',x,y,8,'DMB',GOLD);txt(head,x,y+20,12,'DMB')
    para(body,x,y+41,234,9.5,14)
 rule(553);txt('WHY PARTNER WITH SUNDAF TRIP',M,573,8,'DMB',GOLD)
 y=602
 for reason in T['reasons']:
    txt('+',M,y,12,'DM',GOLD);y=para(reason,M+19,y,CW-19,9.5,14)+9
 finish()
 # 3: Destination geography and real group photography from the existing PDF.
 start(3,'03 / Destinations & departures');title('Journeys we bring to life.',133,34)
 txt('CURRENT DESTINATIONS',M,207,8,'DMB',GOLD)
 para(T['dest_current'],M,230,CW,12,18,'DM',INK)
 photo('trip-1.jpg',M,290,CW,220)
 txt('Red Square, Moscow',M,520,8,color=MUTED)
 photo('trip-4.jpg',M,552,205,177)
 txt('Kaindy Lake, Kazakhstan',M,739,8,color=MUTED)
 txt('LOOKING AHEAD',280,552,8,'DMB',GOLD)
 y=579
 for item in T['dest_exp']:y=para(item,280,y,267,10,15)+12
 # Intro kept verbatim; above photographs correspond to the original captions.
 para(T['groups_intro'],280,686,267,8.5,12)
 finish()
 # 4: Five stages and partner requirements, using the full shared source copy.
 start(4,'04 / Working together');title('Clear roles.\nShared standards.'.replace('\n',' '),133,34)
 y=237
 for i,(head,body) in enumerate(T['steps']):
    txt(f'0{i+1}',M,y,19,'Times-Roman',GOLD)
    txt(head.split('. ',1)[1],M+42,y,11,'DMB')
    y=para(body,M+42,y+23,CW-42,9.5,14)+17
 rule(597);txt('WHAT WE LOOK FOR IN A DMC PARTNER',M,615,8,'DMB',GOLD)
 for i,item in enumerate(T['wants']):
    x=M+(i%2)*262;y=646+(i//2)*44
    txt('+',x,y,10,color=GOLD);para(item,x+15,y,220,8.6,12)
 finish()
 # 5: A legible company record and a restrained contact panel.
 start(5,'05 / Company & contact');title('Everyone can travel.',133,37)
 txt('COMPANY SNAPSHOT',M,216,8,'DMB',GOLD)
 y=248
 for key,value in T['snapshot']:
    rule(y-7);txt(key,M,y,9,color=MUTED);para(value,238,y,309,10,14,'DM',INK);y+=35
 rect(0,592,W,197,INK)
 txt("Let's talk.",M,617,34,'Times-Roman','#FFFFFF')
 txt(T['leaders'],M,668,11,'DMB','#FFFFFF')
 txt(T['email'],M,704,12,color='#FFFFFF')
 txt('WhatsApp  '+T['wa_display'],M,731,11,color='#FFFFFF')
 txt('sundaftrip.com',365,731,11,color='#FFFFFF')
 for url,box in [('mailto:'+T['email'],(M,700,300,724)),(T['wa_url'],(M,729,300,752)),('https://www.sundaftrip.com',(360,729,548,752))]:
    x1,y1,x2,y2=box;c.linkURL(url,(x1,H-y2,x2,H-y1),relative=0,thickness=0)
 finish();c.save()
 print(OUT)
if __name__=='__main__':build()
