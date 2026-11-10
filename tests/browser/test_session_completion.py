# Session completion card (Take a New Assessment / End Session) and clickable logo.
# Needs API on :4000, client preview on :5173, TEST_DB_CMD set to a SCRATCH database.
import os, sys, subprocess
from playwright.sync_api import sync_playwright
from lib import BASE, complete_flow
R=[]
def ok(c,m,d=''):
    c=bool(c); R.append(c); print(('PASS ' if c else 'FAIL ')+m+(' | '+str(d) if d and not c else ''))
DB=os.environ.get('TEST_DB_CMD')
def sql(q): return subprocess.run(DB+f' "{q}"',shell=True,capture_output=True,text=True).stdout.strip()
def hist(pg): return pg.evaluate("localStorage.getItem('ccc_pathfinder_session_history')")
def dash(pg):
    pg.click('a:has-text("Go to Dashboard")'); pg.wait_for_selector('h1:has-text("Your Dashboard")'); pg.wait_for_timeout(600)
def logo(pg): pg.click('header a[href="/"]'); pg.wait_for_url(BASE+'/')
CARD='section[aria-labelledby=session-completed-heading]'
with sync_playwright() as p:
    b=p.chromium.launch()
    for lang,vp in (('en',{'width':1280,'height':900}),('fil',{'width':375,'height':740})):
        L=f'[{lang} {vp["width"]}px]'
        ctx=b.new_context(viewport=vp); pg=ctx.new_page()
        tag='Sesyon'+('Ana' if lang=='en' else 'Fil')
        before=int(sql(f"select count(*) from assessment_sessions where first_name='{tag}'") or 0)
        complete_flow(pg,lang,'DCI',name=f'{tag} Uno')
        # logo on Results does not delete anything
        h1=hist(pg); logo(pg); ok(hist(pg)==h1 and h1,f'{L} logo from Results -> Landing, history kept')
        pg.go_back(); pg.wait_for_url('**/results/**'); dash(pg)
        ok(pg.query_selector(CARD) is not None,f'{L} session completion section appears on Dashboard')
        # it is the last section, after Previous Attempts / learning
        ok(pg.evaluate(f"(()=>{{const s=document.querySelector('{CARD}');return s.nextElementSibling===null}})()"),f'{L} section is at the bottom')
        t=pg.inner_text(CARD)
        if lang=='en': ok('Assessment Session Completed' in t and 'You have successfully completed your CCC PathFinder assessment. Your program recommendations and readiness results are available in your dashboard.' in t,f'{L} exact English heading + message')
        else: ok('Tapos na ang Sesyon' in t and 'Kumuha ng Bagong Assessment' in t and 'Tapusin ang Sesyon' in t,f'{L} Filipino heading/buttons')
        ok(pg.evaluate("document.documentElement.scrollWidth<=window.innerWidth"),f'{L} no horizontal scroll')
        newb='button:has-text("Take a New Assessment")' if lang=='en' else 'button:has-text("Kumuha ng Bagong Assessment")'
        endb=f'{CARD} button:has-text("End Session")' if lang=='en' else f'{CARD} button:has-text("Tapusin ang Sesyon")'
        # primary vs secondary styling
        ok('bg-sky-ink' in pg.get_attribute(newb,'class') and 'bg-white' in pg.get_attribute(endb,'class'),f'{L} New = primary, End = secondary')
        # modal: cancel
        pg.click(endb); pg.wait_for_selector('[role=dialog]')
        dt=pg.inner_text('[role=dialog]')
        if lang=='en': ok('End Your Session?' in dt and 'Are you sure you want to end your current session? Your saved assessment results and history will remain available.' in dt,f'{L} dialog text')
        else: ok('Tapusin ang Iyong Sesyon?' in dt,f'{L} dialog in Filipino')
        pg.click('[role=dialog] button:has-text("%s")'%('Cancel' if lang=='en' else 'Kanselahin')); pg.wait_for_timeout(200)
        ok(pg.query_selector('[role=dialog]') is None and pg.url.endswith('/dashboard'),f'{L} Cancel closes dialog, stays on Dashboard')
        pg.click(endb); pg.keyboard.press('Escape'); pg.wait_for_timeout(200); ok(pg.query_selector('[role=dialog]') is None,f'{L} Escape closes dialog')
        # take new assessment
        h_before=hist(pg); pg.click(newb); pg.wait_for_url('**/student-info')
        ok(hist(pg)==h_before,f'{L} history unchanged by Take a New Assessment')
        ok(pg.input_value('input[name=fullName]')=='' and not pg.is_checked('input[name=privacyConsent]'),f'{L} Student Info form is blank/new')
        ok(pg.evaluate("sessionStorage.getItem('ccc_pathfinder_assessment_draft')") is None and pg.evaluate("localStorage.getItem('ccc_pathfinder_session_id')") is None,f'{L} temporary draft and active session id cleared')
        pg.fill('input[name=fullName]',f'{tag} Dos'); pg.fill('input[name=age]','18'); pg.check('input[name=privacyAcknowledged]'); pg.check('input[name=privacyConsent]'); pg.click('button:has-text("Continue")')
        pre=pg.evaluate("[...document.querySelectorAll('button[aria-pressed=true]')].map(e=>e.innerText)")
        ok(any(('Filipino' if lang=='fil' else 'English') in x for x in pre),f'{L} language kept (pre-selected)',pre)
        pg.click('button:has-text("Continue")'); pg.wait_for_url('**/questionnaire'); pg.wait_for_selector('text=Question 1 of 20')
        ok(pg.get_attribute('[role=radio] >> nth=0','aria-checked')=='false' and pg.get_attribute('[role=radio] >> nth=4','aria-checked')=='false','%s fresh questionnaire: no old answers'%L)
        # logo from questionnaire
        logo(pg); ok(hist(pg)==h_before,f'{L} logo from Questionnaire keeps history'); 
        # finish second assessment (restart through Home)
        complete_flow(pg,lang,'DBA',name=f'{tag} Dos')
        ok(sql(f"select count(*) from assessment_sessions where first_name='{tag}'")==str(before+2),f'{L} two separate records created (this test\'s own records)')
        ok(len(__import__('json').loads(hist(pg)))>=2,f'{L} history has both attempts')
        # readiness logo
        dash(pg)
        ok('Previous Attempts' in pg.inner_text('body'),f'{L} previous attempt listed on Dashboard')
        pg.click('a:has-text("View Program Readiness")'); pg.wait_for_url('**/readiness/**'); h2=hist(pg)
        logo(pg); ok(hist(pg)==h2,f'{L} logo from Program Readiness keeps history')
        pg.go_back(); pg.wait_for_url('**/readiness/**'); pg.go_back(); pg.wait_for_url('**/dashboard')
        pg.wait_for_selector(CARD); h3=hist(pg); logo(pg); ok(hist(pg)==h3,f'{L} logo from Dashboard keeps history')
        pg.go_back(); pg.wait_for_selector(CARD)
        # end session
        rows_before=sql(f"select count(*) from assessment_sessions where first_name='{tag}'")
        pg.click(endb); pg.click('[role=dialog] button:has-text("%s")'%('End Session' if lang=='en' else 'Tapusin ang Sesyon')); pg.wait_for_url(BASE+'/')
        ok(True,f'{L} End Session -> Landing')
        ok(hist(pg)==h3 and sql(f"select count(*) from assessment_sessions where first_name='{tag}'")==rows_before,f'{L} saved history and DB rows preserved after End Session')
        ok(pg.evaluate("localStorage.getItem('ccc_pathfinder_session_id')") is None and pg.evaluate("sessionStorage.getItem('ccc_pathfinder_assessment_draft')") is None,f'{L} temporary session cleared')
        pg.click('text=Start Assessment >> nth=0'); pg.wait_for_url('**/student-info')
        ok(pg.input_value('input[name=fullName]')=='' and not pg.is_checked('input[name=privacyAcknowledged]'),f'{L} next assessment starts clean')
        pg.goto(BASE+'/questionnaire'); pg.wait_for_timeout(500); ok('/student-info' in pg.url or '/language' in pg.url or pg.url.endswith('/'),f'{L} cannot jump into questionnaire after End Session',pg.url)
        # logo from Student Info
        pg.goto(BASE+'/student-info'); logo(pg); ok(True,f'{L} logo from Student Information -> Landing')
        # Home via logo then Start after finishing: starts fresh, not redirected to old results
        pg.goto(BASE+'/dashboard'); pg.wait_for_selector(CARD); logo(pg); pg.click('text=Start Assessment >> nth=0'); pg.wait_for_url('**/student-info'); pg.wait_for_timeout(300)
        ok(pg.input_value('input[name=fullName]')=='','%s Home via logo then Start Assessment: blank form'%L)
        ctx.close()
    b.close()
print(f"\n{sum(R)}/{len(R)} passed"); sys.exit(0 if all(R) else 1)
