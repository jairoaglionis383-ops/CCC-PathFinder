# Measures real contrast of text that sits on gradient backgrounds (which axe cannot evaluate):
# hides the text, screenshots the page, and for each text element takes the WORST background pixel
# inside its box against the element's computed text colour. Needs pillow.
import io, sys
from PIL import Image
from playwright.sync_api import sync_playwright
from lib import BASE, complete_flow
# NOTE: an h1 that contains a gradient-clipped word (landing) is skipped: its text range box overlaps the clipped glyphs, which would be mis-measured.
def lin(c): c/=255; return c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
def L(rgb): return 0.2126*lin(rgb[0])+0.7152*lin(rgb[1])+0.0722*lin(rgb[2])
def cr(a,b): x,y=sorted([L(a),L(b)],reverse=True); return (x+0.05)/(y+0.05)
JS="""()=>{const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while(n=w.nextNode()){const t=n.textContent.trim();if(!t)continue;const el=n.parentElement;const cs=getComputedStyle(el);
  if(cs.visibility==='hidden'||cs.display==='none')continue;const r=document.createRange();r.selectNodeContents(n);const b=r.getBoundingClientRect();
  if(b.width<2||b.height<2||b.bottom<0||b.top>innerHeight)continue;
  const m=cs.color.match(/[\\d.]+/g).map(Number);out.push({t:t.slice(0,40),x:b.x,y:b.y,w:b.width,h:b.height,c:m.slice(0,3),a:m[3]===undefined?1:m[3],fs:parseFloat(cs.fontSize),fw:parseInt(cs.fontWeight),clip:!!el.closest('.bg-clip-text')||!!(el.closest('h1')&&el.closest('h1').querySelector('.bg-clip-text'))})}
 return out}"""
def scan(pg,label):
    # freeze animations/transitions FIRST so the boxes we read are the final layout (reveal animations
    # otherwise move elements between reading the boxes and taking the screenshot)
    pg.add_style_tag(content='*,*::before,*::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}')
    pg.evaluate('window.scrollTo(0,0)')  # the page may restore a scroll offset; a sticky header would then cover the text we sample
    pg.wait_for_timeout(400)
    items=pg.evaluate(JS)
    pg.add_style_tag(content='*{transition:none!important;animation:none!important;color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}')
    pg.wait_for_timeout(300)
    img=Image.open(io.BytesIO(pg.screenshot())).convert('RGB'); W,H=img.size
    worst=[]
    for it in items:
        if it['clip']: continue
        box=(max(0,int(it['x'])),max(0,int(it['y'])),min(W,int(it['x']+it['w'])),min(H,int(it['y']+it['h'])))
        if box[2]<=box[0] or box[3]<=box[1]: continue
        px=list(img.crop(box).get_flattened_data() if hasattr(img,'get_flattened_data') else img.crop(box).getdata()); 
        fg=it['c']
        # blend translucent text colour over each bg pixel
        def ratio(bg):
            f=[it['a']*fg[i]+(1-it['a'])*bg[i] for i in range(3)]; return cr(f,bg)
        r=min(ratio(p) for p in px[::max(1,len(px)//400)])
        large = it['fs']>=24 or (it['fs']>=18.66 and it['fw']>=700)
        need=3 if large else 4.5
        worst.append((r,need,it['t'],it['fs']))
    worst.sort()
    fails=[w for w in worst if w[0]<w[1]]
    print(f'{label}: {len(worst)} text runs, lowest ratios:')
    for r,need,t,fs in worst[:4]: print(f'   {r:5.2f} (need {need}) {fs:.0f}px  {t!r}')
    return fails
with sync_playwright() as p:
    b=p.chromium.launch(); allf=[]
    for vp,(w,h) in {'desktop':(1280,800),'mobile':(375,740)}.items():
        ctx=b.new_context(viewport={'width':w,'height':h}); pg=ctx.new_page()
        pg.goto(BASE+'/'); pg.wait_for_selector('h1'); allf+=scan(pg,f'{vp} landing (top of page)'); ctx.close()
        ctx=b.new_context(viewport={'width':w,'height':h}); pg=ctx.new_page()
        complete_flow(pg,'en','DCI'); pg.wait_for_timeout(2500); allf+=scan(pg,f'{vp} results (top)')
        pg.goto(BASE+'/dashboard'); pg.wait_for_selector('h1:has-text("Your Dashboard")'); pg.wait_for_timeout(800); allf+=scan(pg,f'{vp} dashboard (top)'); ctx.close()
    b.close()
print('\nFAILING TEXT RUNS:',len(allf)); sys.exit(1 if allf else 0)
