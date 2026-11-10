import json
from playwright.sync_api import sync_playwright
from lib import BASE
fails=[]
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c: fails.append(m)
def errs(pg): return [e.inner_text() for e in pg.query_selector_all('p[id$=-error]:not([id^=privacy])')]
def go(b, w=1280, init=None):
    ctx=b.new_context(viewport={'width':w,'height':800}, has_touch=(w<500))
    if init: ctx.add_init_script(init)
    pg=ctx.new_page(); pg.goto(BASE+'/student-info'); pg.wait_for_selector('input[name=fullName]'); return ctx,pg
def attempt(pg,name,age,via='click'):
    pg.fill('input[name=fullName]',name)
    if age in ('abc','1e'):
        pg.fill('input[name=age]',''); pg.click('input[name=age]'); pg.keyboard.type('1e' if age=='1e' else 'abc')
    else: pg.fill('input[name=age]',age)
    pg.check('input[name=privacyAcknowledged]'); pg.check('input[name=privacyConsent]')
    if via=='click': pg.click('button:has-text("Continue")')
    else: pg.press('input[name=age]','Enter')
    pg.wait_for_timeout(250)
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,label in [(1280,'desktop'),(375,'mobile')]:
        ctx,pg=go(b,w)
        pg.click('button:has-text("Continue")'); pg.wait_for_timeout(250)
        e=errs(pg); ok(pg.url.endswith('/student-info') and len(e)==2, f'{label} empty -> blocked, 2 inline errors {e}')
        ok(pg.evaluate("document.activeElement.name")=='fullName', f'{label} focus first invalid')
        for name,age,why in [('   ','18','spaces-only name'),('12345','18','numeric name'),('Juan3','18','digit in name'),('R2D2','18','digits mixed'),('!!!','18','symbols'),('Juan Dela Cruz','','empty age'),('Juan Dela Cruz','   ','blank age'),('Juan Dela Cruz','17.5','decimal age'),('Juan Dela Cruz','abc','letters typed into age box'),('Juan Dela Cruz','1e','half-typed exponent (badInput)'),('Juan Dela Cruz','1e1','exponent age'),('Juan Dela Cruz','-5','negative age'),('Juan Dela Cruz','0','zero age'),('Juan Dela Cruz','5','too young'),('Juan Dela Cruz','150','too old')]:
            attempt(pg,name,age); ok(pg.url.endswith('/student-info'), f'{label} blocked: {why} -> {errs(pg)}')
        attempt(pg,'Juan Dela Cruz','','enter'); ok(pg.url.endswith('/student-info'),f'{label} Enter key cannot bypass')
        pg.fill('input[name=fullName]','12345'); pg.fill('input[name=age]','18'); pg.press('input[name=fullName]','Enter'); pg.wait_for_timeout(250); ok(pg.url.endswith('/student-info'),f'{label} Enter on name field cannot bypass')
        # error clears as fixed
        pg.fill('input[name=fullName]','Juan Dela Cruz'); pg.wait_for_timeout(150); ok(not any('name' in x.lower() for x in errs(pg)), f'{label} name error clears when fixed {errs(pg)}')
        ctx.close()
        for name in ['Juan Dela Cruz','Anne-Marie','Mary Anne O\'Connor',"O’Connor",'José Ñuñez','Zoë Müller','Nguyễn Văn An','Ma. Cristina Reyes Jr.','李小龍','  Juan   Dela   Cruz  ']:
            ctx,pg=go(b,w); attempt(pg,name,'18'); ok(pg.url.endswith('/questionnaire/language'), f'{label} accepted name {name!r}')
            ctx.close()
        for age in ['15','18','99']:
            ctx,pg=go(b,w); attempt(pg,'Juan',age); ok(pg.url.endswith('/questionnaire/language'), f'{label} accepted age {age}'); ctx.close()
    # trim saved
    ctx,pg=go(b); attempt(pg,'  Juan   Dela   Cruz  ','18'); pg.click('text=Answer the questionnaire in English.'); pg.click('button:has-text("Continue")'); pg.wait_for_url('**/questionnaire'); pg.wait_for_timeout(500)
    body={}
    pg.route('**/assessment/submit', lambda r: (body.update(json.loads(r.request.post_data)), r.continue_()))
    ok(True,'')
    ctx.close()
    # Tagalog messages (language setting already stored from an earlier choice)
    ctx,pg=go(b,1280,"localStorage.setItem('ccc_pathfinder_learning_language','fil')")
    pg.click('button:has-text("Continue")'); pg.wait_for_timeout(250); e=errs(pg)
    ok(e==['Pakilagay ang iyong buong pangalan.','Pakilagay ang iyong edad.'], f'Tagalog required msgs {e}')
    attempt(pg,'12345','17.5'); e=errs(pg); ok('Maglagay ng wastong pangalan' in e[0] and 'buong bilang' in e[1], f'Tagalog invalid msgs {e}')
    ctx.close()
    ctx,pg=go(b); pg.click('button:has-text("Continue")'); pg.wait_for_timeout(250); ok(errs(pg)==['Please enter your full name.','Please enter your age.'],'English default msgs')
    ok(pg.get_attribute('input[name=fullName]','aria-invalid')=='true','aria-invalid set'); ctx.close()
    print('FAILS',len(fails)); b.close()
