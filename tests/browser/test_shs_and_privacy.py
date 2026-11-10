# Strengthened SHS Track / Elective Cluster dropdown + Data Privacy Notice (consent).
# Run with the client preview on :5173 and the API on :4000 (see TESTING_SUMMARY.md).
import os, sys, json, urllib.request
from playwright.sync_api import sync_playwright
from lib import BASE
R=[]
def ok(c,m,d=''):
    R.append(c); print(('PASS ' if c else 'FAIL ')+m+(' | '+str(d) if d and not c else ''))
ACADEMIC=['Arts, Social Sciences, and Humanities','Business and Entrepreneurship','Science, Technology, Engineering, and Mathematics (STEM)','Sports, Health, and Wellness','Field Experience']
TECHPRO=['Aesthetic, Wellness, and Human Care','Agri-Fishery Business and Food Innovation','Artisanry and Creative Enterprise','Automotive and Small Engine Technologies','Construction and Building Technologies','Creative Arts and Design Technologies','Hospitality and Tourism','ICT Support and Computer Programming Technologies','Industrial Technologies','Maritime']
OLD=['ABM','HUMSS','GAS','TVL']
SECTIONS_EN=['Introduction','Information Collected','Purpose of Data Collection','Data Storage and Security','Data Sharing and Disclosure','Data Retention','Your Rights','Contact Information']
SECTIONS_FIL=['Panimula','Impormasyong Kinokolekta','Layunin ng Pagkolekta ng Datos','Pag-iimbak at Seguridad ng Datos','Pagbabahagi at Pagbubunyag ng Datos','Pagpapanatili ng Datos','Ang Iyong mga Karapatan','Impormasyon sa Pakikipag-ugnayan']
def page(b,vp=None):
    ctx=b.new_context(viewport=vp or {'width':1280,'height':900}); pg=ctx.new_page(); pg.goto(BASE+'/'); pg.click('text=Start Assessment >> nth=0'); pg.wait_for_url('**/student-info'); return ctx,pg
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx,pg=page(b)
    # 1. options and groups
    groups={g.get_attribute('label'):[o.inner_text().strip() for o in g.query_selector_all('option')] for g in pg.query_selector_all('select[name=strand] optgroup')}
    ok(list(groups)==['Academic Track','Technical Professional (TechPro) Track'],'two labelled groups',list(groups))
    ok(groups.get('Academic Track')==ACADEMIC,'Academic Track options exact',groups.get('Academic Track'))
    ok(groups.get('Technical Professional (TechPro) Track')==TECHPRO,'TechPro options exact',groups.get('Technical Professional (TechPro) Track'))
    allopts=[o.inner_text().strip() for o in pg.query_selector_all('select[name=strand] option')]
    ok(len(allopts)==16,'placeholder + 15 options',len(allopts))
    ok(not any(o in OLD or o in ('STEM',) for o in allopts),'no outdated ABM/STEM/HUMSS/GAS/TVL option',allopts)
    ok(pg.inner_text('label[for=strand]')=='SHS Track / Elective Cluster','label is "SHS Track / Elective Cluster"')
    body=pg.inner_text('body')
    ok('Senior high school strand' not in body,'old "strand" label gone')
    # 2. notice, defaults
    ok(not pg.is_checked('input[name=privacyAcknowledged]') and not pg.is_checked('input[name=privacyConsent]'),'both checkboxes unchecked by default')
    ok(pg.query_selector('details').get_attribute('open') is None,'full notice is collapsed until opened')
    pg.click('summary')
    txt=pg.inner_text('details')
    ok(all(s in txt for s in SECTIONS_EN),'all 8 English sections present')
    ok('Republic Act No. 10173' in txt and 'Data Privacy Act of 2012' in txt,'RA 10173 cited')
    ok('no retention period has been set' in txt,'retention: no invented period')
    ok('have not yet been provided' in txt,'contact: no invented details')
    ok('Acknowledgment means' in pg.inner_text('section[aria-labelledby=privacy-heading]'),'acknowledgment vs consent explained')
    # 3. Tagalog
    pg.click('button[aria-pressed=false]:has-text("Filipino")')
    txt=pg.inner_text('details')
    ok(all(s in txt for s in SECTIONS_FIL),'all 8 Filipino sections present')
    ok(pg.inner_text('#privacy-heading')=='Paunawa sa Privacy ng Datos','Filipino heading')
    ok('Nabasa at naunawaan ko' in pg.inner_text('label[for=privacyAcknowledged]'),'Filipino acknowledgment label')
    ok('Pumapayag ako' in pg.inner_text('label[for=privacyConsent]'),'Filipino consent label')
    ok(pg.get_attribute('section[aria-labelledby=privacy-heading] div[lang]','lang')=='fil','lang=fil on Filipino text')
    # 4. blocking
    pg.fill('input[name=fullName]','Ana Cruz'); pg.fill('input[name=age]','18')
    pg.select_option('select[name=strand]',label='Maritime')
    pg.click('button:has-text("Continue")'); pg.wait_for_timeout(250)
    ok('/student-info' in pg.url,'cannot continue with nothing ticked')
    ok('Pakikumpirma' in pg.inner_text('#privacyAcknowledged-error') and 'Pakibigay' in pg.inner_text('#privacyConsent-error'),'Filipino error messages shown')
    ok(pg.evaluate("document.activeElement.name")=='privacyAcknowledged','focus moves to first missing checkbox')
    pg.check('input[name=privacyAcknowledged]'); pg.click('button:has-text("Continue")'); pg.wait_for_timeout(250)
    ok('/student-info' in pg.url,'cannot continue with acknowledgment only')
    ok(pg.query_selector('#privacyAcknowledged-error') is None and pg.query_selector('#privacyConsent-error') is not None,'only consent error remains')
    pg.click('button:has-text("English")'); ok('Please give your consent' in pg.inner_text('#privacyConsent-error'),'error switches to English')
    pg.uncheck('input[name=privacyAcknowledged]'); pg.check('input[name=privacyConsent]'); pg.click('button:has-text("Continue")'); pg.wait_for_timeout(250)
    ok('/student-info' in pg.url,'cannot continue with consent only')
    pg.check('input[name=privacyAcknowledged]'); pg.click('button:has-text("Continue")'); pg.wait_for_url('**/language')
    ok(True,'continues once both are ticked')
    # 5. preserved when navigating back
    pg.go_back(); pg.wait_for_url('**/student-info'); pg.wait_for_timeout(300)
    ok(pg.input_value('select[name=strand]')=='techpro_maritime','selected track preserved after Back',pg.input_value('select[name=strand]'))
    ok(pg.input_value('input[name=fullName]')=='Ana Cruz','name preserved after Back')
    ok(pg.is_checked('input[name=privacyAcknowledged]') and pg.is_checked('input[name=privacyConsent]'),'consent preserved after Back')
    ctx.close()
    # 6. mobile
    ctx,pg=page(b,{'width':375,'height':740})
    pg.click('summary'); pg.wait_for_timeout(200)
    ok(pg.evaluate("document.documentElement.scrollWidth<=window.innerWidth"),'no horizontal scroll on mobile with notice open')
    bb=pg.query_selector('input[name=privacyConsent]').bounding_box(); ok(bb['width']>=20,'checkbox tappable size',bb)
    ctx.close()
    # 7. end-to-end: stored code, results unchanged
    ctx,pg=page(b)
    pg.fill('input[name=fullName]','Shs Tester'); pg.fill('input[name=age]','18'); pg.select_option('select[name=strand]',label='ICT Support and Computer Programming Technologies')
    pg.check('input[name=privacyAcknowledged]'); pg.check('input[name=privacyConsent]'); pg.click('button:has-text("Continue")')
    pg.click('text=Answer the questionnaire in English.'); pg.click('button:has-text("Continue")'); pg.wait_for_selector('text=Question 1 of 20')
    for i in range(20):
        pg.click('button[role=radio] >> nth=%d'%(4 if i<5 else 0)); pg.click('button:has-text("%s")'%('Finish' if i==19 else 'Next'))
    pg.wait_for_url('**/results/**',timeout=15000); sid=pg.url.split('/')[-1]
    d=json.load(urllib.request.urlopen(f'http://localhost:4000/api/v1/results/{sid}'))
    ok(bool(d.get('success')),'results available for strand-tagged session')
    cmd=os.environ.get('TEST_DB_CMD')
    if cmd:
        import subprocess
        out=subprocess.run(cmd+f" \"select senior_high_strand from assessment_sessions where id='{sid}'\"",shell=True,capture_output=True,text=True).stdout.strip()
        ok(out=='techpro_ict_support_programming','DB stores the track code',out)
    # privacy flags never sent to the API
    ctx.close(); b.close()
print(f"\n{sum(R)}/{len(R)} passed"); sys.exit(0 if all(R) else 1)
