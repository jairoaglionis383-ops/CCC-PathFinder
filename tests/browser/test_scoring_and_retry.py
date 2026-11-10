import json, re, urllib.request
from playwright.sync_api import sync_playwright
from lib import BASE, Q
fails=[]
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c: fails.append(m)
def api(path): return json.load(urllib.request.urlopen('http://localhost:4000/api/v1'+path))['data']
BAD=re.compile(r'NaN|Infinity|undefined|\[object')
def start(pg, name='Juan', age='17', lang='en'):
    pg.goto(BASE+'/'); pg.click('text=Start Assessment >> nth=0')
    pg.fill('input[name=fullName]',name); pg.fill('input[name=age]',age); pg.check('input[name=privacyAcknowledged]'); pg.check('input[name=privacyConsent]'); pg.click('button:has-text("Continue")')
    pg.click('text=Sagutin ang talatanungan sa Filipino.' if lang=='fil' else 'text=Answer the questionnaire in English.'); pg.click('button:has-text("Continue")'); pg.wait_for_url('**/questionnaire')
def answer(pg, fn):
    for i in range(20):
        pg.wait_for_selector(f'text=Question {i+1} of 20'); pg.click(f'[role=radio] >> nth={fn(i)-1}'); pg.click('button:text-matches("^(Next|Finish).*")')
def finish_ok(pg):
    pg.wait_for_url('**/results/**', timeout=20000); pg.wait_for_selector('text=/Your strongest match|more than one/i', timeout=15000)
    return pg.url.rsplit('/',1)[1]
with sync_playwright() as p:
    b=p.chromium.launch()
    # A. patterns
    for label,fn in [('all Strongly Agree',lambda i:5),('all Strongly Disagree',lambda i:1),('all Neutral',lambda i:3),('mixed 1-5 cycle',lambda i:(i%5)+1),('mixed alternating 5/1',lambda i:5 if i%2 else 1)]:
        ctx=b.new_context(); pg=ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        start(pg); answer(pg,fn); sid=finish_ok(pg); t=pg.inner_text('main')
        res=api('/results/'+sid)['results']
        ok(len(res)==4 and all(0<=r['percentageScore']<=100 for r in res), f'{label}: backend 4 finite scores {[ (r["departmentCode"],r["percentageScore"],r["rank"]) for r in res]}')
        ok(not BAD.search(t) and not errs, f'{label}: no NaN/undefined/exception on results page {errs}')
        shown=set(re.findall(r'(\d+)%',t)); ok({str(round(r['percentageScore'])) for r in res}<=shown, f'{label}: page shows the backend percentages {shown}')
        ctx.close()
    # B. stale session: same browser, reload, second assessment
    ctx=b.new_context(); pg=ctx.new_page(); sub=[]
    pg.on('request', lambda r: sub.append(json.loads(r.post_data)) if r.url.endswith('/assessment/submit') else None)
    start(pg,'  Juan   Dela   Cruz  ','18'); answer(pg,lambda i:5); sid1=finish_ok(pg)
    ok(sub[0]['studentInfo']['firstName']=='Juan' and sub[0]['studentInfo']['lastName']=='Dela Cruz', f"name trimmed/collapsed before saving: {sub[0]['studentInfo']['firstName']!r} {sub[0]['studentInfo']['lastName']!r}")
    start(pg,'Maria','19'); pg.wait_for_selector('text=Question 1 of 20'); ok('0/20' in pg.inner_text('main'),'2nd attempt (after reload) starts clean at 0/20')
    ok(pg.query_selector('[role=radio][aria-checked=true]') is None,'no stale answer pre-selected')
    answer(pg,lambda i:1); sid2=finish_ok(pg)
    ok(sid1!=sid2,'second attempt got a NEW session id'); 
    t=pg.inner_text('main'); ok('20%' in t and '100%' not in t, 'second attempt shows NEW scores (20%), not stale 100%')
    ok(api('/results/'+sid1)['results'][0]['percentageScore']==100,'first saved result intact in database')
    pg.goto(BASE+'/dashboard'); pg.wait_for_selector('text=Previous Attempts'); ok(len(pg.query_selector_all('section:has(h2:has-text("Previous Attempts")) a:has-text("View")'))==1,'dashboard history = exactly 1 previous (real)')
    ctx.close()
    # C. 409 -> Try again -> Landing, clean state
    ctx=b.new_context(); pg=ctx.new_page(); start(pg,'Juan','17',lang='fil')
    pg.route('**/assessment/submit', lambda r: r.fulfill(status=409, content_type='application/json', body=json.dumps({'success':False,'data':None,'message':'This session was already submitted'})))
    answer(pg,lambda i:5); pg.wait_for_selector('text=Couldn\'t submit your assessment')
    ok('already submitted' in pg.inner_text('main'),'409 shows friendly error')
    ls_before=pg.evaluate("[localStorage.getItem('ccc_pathfinder_session_id'), localStorage.getItem('ccc_pathfinder_session_history')]")
    pg.click('button:has-text("Try again")'); pg.wait_for_timeout(800)
    ok(pg.url==BASE+'/','REAL BROWSER: Try again after 409 -> Landing page: '+pg.url)
    ok(pg.evaluate("localStorage.getItem('ccc_pathfinder_session_id')") is None,'active session id cleared')
    ok(pg.evaluate("localStorage.getItem('ccc_pathfinder_session_history')")==ls_before[1],'saved history untouched')
    pg.unroute('**/assessment/submit')
    pg.click('text=Start Assessment >> nth=0'); ok(pg.url.endswith('/student-info'),'can start again'); 
    ok(pg.input_value('input[name=fullName]')=='','student form is empty (no stale info)')
    pg.fill('input[name=fullName]','Pedro'); pg.fill('input[name=age]','20'); pg.check('input[name=privacyAcknowledged]'); pg.check('input[name=privacyConsent]'); pg.click('button:has-text("Continue")')
    ok(pg.evaluate("document.querySelector('button:last-of-type')?.disabled") is not None,'')
    ok(pg.query_selector('button:has-text("Continue")').is_disabled(),'language must be chosen again (existing retake behaviour)')
    pg.click('text=Answer the questionnaire in English.'); pg.click('button:has-text("Continue")'); pg.wait_for_url('**/questionnaire')
    pg.wait_for_selector('text=Question 1 of 20'); ok('0/20' in pg.inner_text('main'),'new attempt at 0/20')
    answer(pg,lambda i:3); sid=finish_ok(pg); ok(True,'new attempt after restart completes: '+sid[:8])
    ok(api('/results/'+sid)['results'][0]['percentageScore']==60,'new results from new answers (60%)')
    ctx.close()
    # D. network failure -> Try again retries same answers
    ctx=b.new_context(); pg=ctx.new_page(); start(pg)
    pg.route('**/assessment/submit', lambda r: r.abort('failed'))
    answer(pg,lambda i:5); pg.wait_for_selector('text=Couldn\'t submit your assessment')
    pg.unroute('**/assessment/submit'); pg.click('button:has-text("Try again")'); sid=finish_ok(pg)
    ok(api('/results/'+sid)['results'][0]['percentageScore']==100,'network error: Try again re-sends the SAME answers -> results (100%)')
    ctx.close()
    # E. malformed backend result
    for label,payload in [('null percentage',{'results':[{'departmentCode':'DCI','percentageScore':None,'rank':1}]}),('empty results',{'results':[]}),('missing results',{}),('percentage 140',{'results':[{'departmentCode':'DCI','percentageScore':140,'rank':1}]})]:
        ctx=b.new_context(); pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        start(pg); 
        flag={'real':False}
        pg.route('**/results/*', (lambda pl: (lambda r: r.continue_() if flag['real'] else r.fulfill(status=200, content_type='application/json', body=json.dumps({'success':True,'data':pl,'message':'ok'}))))(payload))
        answer(pg,lambda i:5); pg.wait_for_selector('text=/Couldn.t load your results/', timeout=15000)
        t=pg.inner_text('main'); ok('incomplete result' in t and not errs and not BAD.search(t), f'malformed ({label}) -> safe error, no crash {errs}')
        flag['real']=True; pg.click('button:has-text("Try again")'); finish_ok(pg); ok(True,f'malformed ({label}) -> Try again recovers')
        ctx.close()
    print('FAILS',len(fails)); b.close()
