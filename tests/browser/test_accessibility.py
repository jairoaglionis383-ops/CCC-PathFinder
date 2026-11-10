# Accessibility scan (axe-core) of each screen: reports WCAG 2.x A/AA violations and
# colour-contrast "needs review" items (gradient backgrounds cannot be computed by axe).
# Needs axe-core (installed as a client dev dependency; override with AXE=/path/to/axe.min.js).  API :4000 + preview :5173 running.
import os, sys, json
from playwright.sync_api import sync_playwright
from lib import BASE, complete_flow
AXE=open(os.environ.get('AXE', os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','client','node_modules','axe-core','axe.min.js'))).read()
TAGS=['wcag2a','wcag2aa','wcag21a','wcag21aa']
def scan(pg,label,out):
    pg.add_script_tag(content=AXE)
    r=pg.evaluate("tags=>axe.run(document,{runOnly:{type:'tag',values:tags}})",TAGS)
    v=[(x['id'],x['impact'],len(x['nodes'])) for x in r['violations']]
    inc=[(x['id'],len(x['nodes'])) for x in r['incomplete'] if x['id']=='color-contrast']
    print(f"{label:34s} violations={v or 'none'}  contrast-needs-review={inc or 'none'}")
    out.append((label,v))
    for x in r['violations']:
        for n in x['nodes'][:3]: print('    ',x['id'],n['target'],n['any'][0]['message'][:150] if n['any'] else '')
with sync_playwright() as p:
    b=p.chromium.launch(); out=[]
    for vp,(w,h) in {'desktop':(1280,800),'mobile':(375,740)}.items():
        ctx=b.new_context(viewport={'width':w,'height':h}); pg=ctx.new_page()
        pg.goto(BASE+'/'); pg.wait_for_selector('h1'); scan(pg,f'{vp} landing',out)
        pg.click('text=Start Assessment >> nth=0'); pg.wait_for_selector('input[name=fullName]'); scan(pg,f'{vp} student-info',out)
        pg.click('button:has-text("Continue")'); pg.wait_for_timeout(300); scan(pg,f'{vp} student-info (errors shown)',out)
        pg.fill('input[name=fullName]','Ana Cruz'); pg.fill('input[name=age]','17'); pg.check('input[name=privacyAcknowledged]'); pg.check('input[name=privacyConsent]'); pg.click('button:has-text("Continue")')
        pg.wait_for_selector('text=Answer the questionnaire in English.'); pg.click('text=Answer the questionnaire in English.'); scan(pg,f'{vp} language',out)
        pg.click('button:has-text("Continue")'); pg.wait_for_selector('text=Question 1 of 20'); scan(pg,f'{vp} assessment (unselected)',out)
        pg.click('[role=radio] >> nth=4'); pg.wait_for_timeout(500); scan(pg,f'{vp} assessment (selected)',out)
        ctx.close()
        ctx=b.new_context(viewport={'width':w,'height':h}); pg=ctx.new_page()
        complete_flow(pg,'en','DCI'); scan(pg,f'{vp} results',out)
        pg.click('a[href="/readiness/DCI"] >> nth=0'); pg.wait_for_selector('#roadmap'); scan(pg,f'{vp} readiness',out)
        pg.goto(BASE+'/dashboard'); pg.wait_for_selector('h1:has-text("Your Dashboard")'); scan(pg,f'{vp} dashboard',out)
        ctx.close()
    b.close()
bad=[l for l,v in out if v]; print('\nSCREENS WITH VIOLATIONS:',len(bad),'of',len(out)); sys.exit(1 if bad else 0)
