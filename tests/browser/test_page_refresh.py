import json, re, urllib.request
from playwright.sync_api import sync_playwright
from lib import *
fails=[]; errs=[]
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c: fails.append(m)
UI=json.load(open('ui.json'))
NAMES={'DTE':'Teacher Education','DCI':'Computing and Informatics','DBA':'Business and Accountancy','DAS':'Arts and Sciences'}
def api(path): return json.load(urllib.request.urlopen('http://localhost:4000/api/v1'+path))['data']
def newctx(b, init=None):
    ctx=b.new_context(viewport={'width':1280,'height':900})
    if init: ctx.add_init_script(init)
    pg=ctx.new_page()
    pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_TUNNEL' not in m.text and 'Failed to load resource' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append('pageerror '+str(e)))
    return ctx,pg
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx,pg=newctx(b); complete_flow(pg,'fil','DBA')
    rurl=pg.url; sid=rurl.rsplit('/',1)[1]; expect=api('/results/'+sid)['results']
    # 1 refresh on results
    pg.reload(); pg.wait_for_selector('text=/Your strongest match/', timeout=15000)
    ok(pg.url==rurl, 'REAL BROWSER: refresh /results/:id stays on results')
    t=pg.inner_text('body'); ok('Your strongest match is Business and Accountancy' in t,'refresh results shows backend top match')
    pcts=sorted(set(re.findall(r'(\d+)%',t))); ok(set(str(round(r['percentageScore'])) for r in expect)<=set(pcts), f'percentages match API {pcts}')
    links=[a.get_attribute('href') for a in pg.query_selector_all('main a')]; ok('/readiness/DBA' in links and '/dashboard' in links,'results links after refresh')
    # direct open in a brand-new context (no storage at all)
    c2,p2=newctx(b); p2.goto(rurl); p2.wait_for_selector('text=/Your strongest match/', timeout=15000)
    ok(p2.url==rurl and 'Business and Accountancy' in p2.inner_text('body'),'REAL BROWSER: results open in fresh browser profile via URL')
    # 2 invalid session
    for bad in ['not-a-session','00000000-0000-0000-0000-000000000000']:
        p2.goto(BASE+'/results/'+bad); p2.wait_for_selector('text=/Session not found|Couldn.t load/', timeout=15000)
        ok('/results/'+bad in p2.url and 'Your strongest match' not in p2.inner_text('body'), f'invalid session {bad[:12]} -> error state, no fake result')
    c2.close()
    # 3 readiness direct, four codes, no session, en default and stored fil
    for code in NAMES:
        for lang in ['en','fil']:
            init = f"localStorage.setItem('ccc_pathfinder_learning_language','{lang}')"
            c3,p3=newctx(b,init); p3.goto(BASE+'/readiness/'+code); p3.wait_for_selector('#roadmap', timeout=15000)
            ok(NAMES[code] in p3.inner_text('h1') and p3.url.endswith('/readiness/'+code), f'REAL BROWSER: direct /readiness/{code} [{lang}] loads right program')
            tt=p3.inner_text('body'); o='fil' if lang=='en' else 'en'
            ok(UI[lang]['roadmapTitle'] in tt and UI[o]['roadmapTitle'] not in tt, f'{code}/{lang} language chrome')
            ok(UI[lang]['skillsNoAnswers'] in tt, f'{code}/{lang} no answers after refresh -> honest no-priorities note')
            ok(not any(a.get_attribute('href')=='' for a in p3.query_selector_all('main a')) and 'Back to Results' not in tt and UI[lang]['backToResults'] not in tt, 'no Back-to-Results without a session')
            c3.close()
    c3,p3=newctx(b)
    p3.goto(BASE+'/readiness/XXX'); p3.wait_for_selector('text=/Unknown department/', timeout=15000); ok(p3.url.endswith('/readiness/XXX'),'REAL BROWSER: invalid code -> error state (no redirect)')
    p3.goto(BASE+'/readiness/dci'); p3.wait_for_selector('#roadmap'); ok('Computing and Informatics' in p3.inner_text('h1'),'lowercase code ok')
    # guard still applies elsewhere
    for path in ['/questionnaire','/processing','/questionnaire/language']:
        p3.goto(BASE+path); p3.wait_for_timeout(500); ok(p3.url.endswith('/student-info'), f'guard still redirects {path}')
    c3.close()
    # 4 readiness refresh keeps progress (use the first logged-in context)
    pg.goto(BASE+'/dashboard'); pg.wait_for_selector('h1:has-text("Your Dashboard")')
    pg.reload(); pg.wait_for_selector('h1:has-text("Your Dashboard")')
    pg.click('a:has-text("View Program Readiness") >> nth=0'); pg.wait_for_selector('#roadmap', timeout=15000)
    ok('/readiness/DBA' in pg.url,'REAL BROWSER: Dashboard->Readiness after reload stays on readiness: '+pg.url)
    ok(UI['fil']['roadmapTitle'] in pg.inner_text('body'),'language persisted (fil) after reload')
    ok(UI['fil']['backToResults'] in pg.inner_text('body'),'Back to Results available (session id persisted)')
    pg.check('#task-dba-t1'); pg.check('#task-dba-t2'); pg.click(f'button:has-text("{UI["fil"]["markWeekDone"]}") >> nth=0')
    pg.reload(); pg.wait_for_selector('#checklist')
    ok(pg.is_checked('#task-dba-t1') and pg.is_checked('#task-dba-t2') and not pg.is_checked('#task-dba-t3'),'REAL BROWSER: checklist persisted over refresh')
    ok(UI['fil']['weekDone'] in pg.inner_text('#roadmap'),'week persisted over refresh')
    pg.click(f'a:has-text("{UI["fil"]["backToResults"]}")'); pg.wait_for_selector('text=Your strongest match'); ok(pg.url==rurl,'Back to Results after reload returns to same result')
    # dashboard learning card link after reload
    pg.goto(BASE+'/dashboard'); pg.wait_for_selector('h1:has-text("Your Dashboard")')
    ok(UI['en']['dashboardTitle'] in pg.inner_text('body') and '2 of 8' in pg.inner_text('body'),'dashboard progress card after reload')
    pg.click('a:has-text("Open Program Readiness")'); pg.wait_for_selector('#roadmap'); ok('/readiness/DBA' in pg.url,'REAL BROWSER: Dashboard progress-card link after reload')
    # retake still works
    pg.goto(BASE+'/dashboard'); pg.wait_for_selector('h1:has-text("Your Dashboard")'); pg.click('button:has-text("Retake Assessment")'); ok(pg.url.endswith('/student-info'),'retake -> student-info')
    ok(pg.evaluate("localStorage.getItem('ccc_pathfinder_session_id')") is None,'retake clears active session id')
    ok(sid in pg.evaluate("localStorage.getItem('ccc_pathfinder_session_history')"),'history kept after retake')
    # a retake in progress is still guarded
    pg.goto(BASE+'/questionnaire'); pg.wait_for_timeout(500); ok(pg.url.endswith('/student-info'),'guard after retake')
    print('CONSOLE ERRORS', errs[:5]); print('FAILS', len(fails))
    b.close()
