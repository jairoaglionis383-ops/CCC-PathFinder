# Demonstration-flow test: ONE browser session runs the whole journey for all four programs in a row:
# Landing -> Student Info -> Language -> 20 questions (with a page refresh half way) -> Processing -> Results ->
# Back button -> Program Readiness -> Dashboard -> Retake. All requests that leave localhost are blocked, so it
# also proves the app needs no internet. Needs API :4000 (TEST db) + preview :5173.
import os, re, shlex, subprocess, sys, json, time, urllib.request
from playwright.sync_api import sync_playwright
from lib import BASE, Q
API='http://localhost:4000/api/v1'; DB=os.environ.get('TEST_DB_CMD')
res=[]
def ok(c,n,extra=''):
    res.append((n,bool(c))); print(('PASS' if c else 'FAIL'),n,'' if c else extra)
def api(p): return json.load(urllib.request.urlopen(API+p))
def sql(q): return subprocess.run(shlex.split(DB)+[q],capture_output=True,text=True).stdout.strip()
NAMES={'DTE':'Teacher Education','DCI':'Computing and Informatics','DBA':'Business and Accountancy','DAS':'Arts and Sciences'}
NEXT='button:text-matches("^(Next|Submit|Finish|See).*")'
tag='Demo'+''.join(chr(97+int(c)) for c in str(int(time.time())%100000))  # letters only: names may not contain digits
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1280,'height':900}); pg=ctx.new_page()
    errs=[]; bad=[]; external=[]
    ctx.route(lambda u: not re.match(r'^(http://(localhost|127\.0\.0\.1)[:/]|data:|blob:)',u), lambda r: (external.append(r.request.url), r.abort()))
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.on('pageerror',lambda e: errs.append('PAGEERROR '+str(e)))
    pg.on('response',lambda r: bad.append((r.status,r.url)) if r.status>=400 else None)
    ids=[]
    def qtext(lang):
        body=pg.inner_text('body'); return next(x for x in Q if (x['fil'] if lang=='fil' else x['text']) in body)
    for n,(target,lang) in enumerate([('DTE','en'),('DCI','fil'),('DBA','en'),('DAS','fil')]):
        L=f'[{target}/{lang}]'
        if n==0:
            pg.goto(BASE+'/'); ok(pg.is_visible('h1') and 'Start Assessment' in pg.inner_text('body'),f'{L} landing page loads')
            pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(800)
            loaded=pg.evaluate("[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family.replace(/\"/g,''))")
            ok(all(any(fam in l for l in loaded) for fam in ('Plus Jakarta Sans','Inter')),'fonts load with no internet (self-hosted)',str(loaded))
            pg.click('a:has-text("Learn More")'); ok('#how-it-works' in pg.url,f'{L} Learn More scrolls to how-it-works')
            pg.click('text=Start Assessment >> nth=0')
        else:
            pg.click('button:has-text("Retake Assessment")')
        pg.wait_for_url('**/student-info'); ok(True,f'{L} reached Student Info')
        pg.fill('input[name=fullName]',f'{tag} {target}'); pg.fill('input[name=age]','18')
        pg.select_option('select[name=gender]',label='Female'); pg.select_option('select[name=strand]',label='Science, Technology, Engineering, and Mathematics (STEM)'); pg.fill('input[name=schoolName]','Demo SHS')
        pg.check('input[name=privacyAcknowledged]'); pg.check('input[name=privacyConsent]')
        pg.click('button:has-text("Continue")')
        pg.click('text=Sagutin ang talatanungan sa Filipino.' if lang=='fil' else 'text=Answer the questionnaire in English.'); pg.click('button:has-text("Continue")')
        pg.wait_for_selector('text=Question 1 of 20')
        fn=lambda q: 5 if q['dep']==target else 1
        for i in range(20):
            pg.wait_for_selector(f'text=Question {i+1} of 20'); q=qtext(lang)
            if lang=='fil': ok(q['fil'] in pg.inner_text('body') and q['text'] not in pg.inner_text('body'),f'{L} Q{i+1} shown in Filipino only') if i in (0,19) else None
            pg.click(f'[role=radio] >> nth={fn(q)-1}')
            if i==9:
                pg.click(NEXT); pg.wait_for_selector('text=Question 11 of 20'); pg.reload(); pg.wait_for_selector('text=Question 11 of 20')
                ok(pg.get_attribute('[role=radio] >> nth=0','aria-checked')=='false' and '10/20' in pg.inner_text('body'),f'{L} refresh at Q11 keeps position and 10 answers')
                pg.click('button:text-matches("^Back")'); pg.wait_for_selector('text=Question 10 of 20'); q10=qtext(lang)
                ok(pg.get_attribute(f'[role=radio] >> nth={fn(q10)-1}','aria-checked')=='true',f'{L} answer given before refresh is still selected')
                pg.click(NEXT); continue
            if i==19: break
            pg.click(NEXT)
        pg.click('button:has-text("Finish")')
        t0=time.time(); pg.wait_for_url('**/results/**',timeout=20000); pg.wait_for_selector('text=/strongest match|more than one/i',timeout=15000)
        ok(time.time()-t0<15,f'{L} processing finishes and results appear (not stuck)',f'{time.time()-t0:.1f}s')
        sid=pg.url.rstrip('/').split('/')[-1]; ids.append(sid)
        r=api('/results/'+sid)['data']['results']; body=pg.inner_text('body')
        ok(r[0]['departmentCode']==target and r[0]['percentageScore']==100 and [x['percentageScore'] for x in r[1:]]==[20,20,20] and r[0]['rank']==1 and [x['rank'] for x in r[1:]]==[2,2,2],f'{L} scores 100/20/20/20, ranks 1/2/2/2',str(r))
        ok(('Your strongest match is '+NAMES[target]) in body and body.count('100%')>=2 and body.count('20%')>=3,f'{L} results page shows the same scores and recommendation')
        pg.go_back(); pg.wait_for_timeout(1200)
        ok('/results/'+sid in pg.url,f'{L} browser Back from results returns to the results (no blank assessment)',pg.url)
        pg.go_forward() if '/results/' not in pg.url else None
        pg.reload(); pg.wait_for_selector('text=/strongest match|more than one/i'); ok(('Your strongest match is '+NAMES[target]) in pg.inner_text('body'),f'{L} results survive refresh')
        pg.click(f'a[href="/readiness/{target}"] >> nth=0'); pg.wait_for_selector('#roadmap')
        secs=api('/readiness/'+target)['data']['sections']; pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
        rb=re.sub(r'\s+',' ',pg.inner_text('body'))
        ok(len(secs)==7 and all(re.sub(r'\s+',' ',s['content'])[:60] in rb for s in secs) and NAMES[target] in rb and not [v for k,v in NAMES.items() if k!=target and v in rb],f'{L} readiness shows the 7 sections of {target} only')
        pg.reload(); pg.wait_for_selector('#roadmap'); ok(NAMES[target] in pg.inner_text('body'),f'{L} readiness survives refresh')
        BR,GD=('Bumalik sa Resulta','Pumunta sa Dashboard') if lang=='fil' else ('Back to Results','Go to Dashboard')  # readiness page follows the chosen language
        pg.wait_for_selector(f'a:has-text("{BR}")'); pg.click(f'a:has-text("{BR}")'); pg.wait_for_selector('text=/strongest match|more than one/i'); ok('/results/'+sid in pg.url,f'{L} Back to Results link works')
        pg.click('a:has-text("Go to Dashboard")'); pg.wait_for_selector('h1:has-text("Your Dashboard")'); pg.wait_for_timeout(700)
        links=pg.evaluate("[...document.querySelectorAll('a[href^=\"/results/\"]')].map(a=>a.getAttribute('href').split('/').pop())")
        ok(sorted(set(links))==sorted(ids) and len(links)==len(set(links)),f'{L} dashboard lists all {len(ids)} saved result(s), no duplicates, none lost after retake',f'{links} vs {ids}')
        ok(('Your strongest match is '+NAMES[target]) in pg.inner_text('body'),f'{L} dashboard current result = newest assessment')
        pg.reload(); pg.wait_for_selector('h1:has-text("Your Dashboard")'); pg.wait_for_timeout(700); ok(len(pg.query_selector_all('a[href^="/results/"]'))>=len(ids),f'{L} dashboard survives refresh')
        pg.click('a:has-text("View Program Readiness")'); pg.wait_for_selector('#roadmap'); ok(f'/readiness/{target}' in pg.url,f'{L} dashboard "View Program Readiness" opens {target}')
        pg.go_back(); pg.wait_for_selector('h1:has-text("Your Dashboard")')
        pg.click('a:has-text("View Full Results")'); pg.wait_for_selector('text=/strongest match|more than one/i'); pg.go_back(); pg.wait_for_selector('h1:has-text("Your Dashboard")')
    # all four records survive in the database and in the browser
    hist=pg.evaluate("JSON.parse(localStorage.getItem('ccc_pathfinder_session_history')).map(h=>h.sessionId)")
    ok(hist==ids[::-1],'browser history holds the 4 session ids, newest first')
    if DB:
        n=sql(f"select count(*) from assessment_sessions where first_name='{tag}'"); ok(n=='4','database holds exactly the 4 submitted sessions',n)
        ok(sql(f"select count(*) from assessment_sessions s where s.first_name='{tag}' and (select count(*) from assessment_answers a where a.session_id=s.id)=20 and (select count(*) from result_scores r where r.session_id=s.id)=4")=='4','each session has 20 answers and 4 scores')
    ok(not external,'app made no request outside localhost (works offline)',str(external[:3]))
    ok(not errs,'no browser console errors during the whole demonstration',str(errs[:3]))
    ok(not bad,'no failed HTTP responses during the whole demonstration',str(bad[:3]))
    b.close()
bad_=[n for n,k in res if not k]
print(f'\n{len(res)-len(bad_)}/{len(res)} passed'); print('FAILED:',bad_); sys.exit(1 if bad_ else 0)
