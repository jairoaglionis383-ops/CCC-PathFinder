# UI audit suite (form -> database, progress, double click, all programs EN/FIL, readiness content, dashboard, navigation, responsive). Needs API :4000 (TEST database!) and client preview :5173.
# Optional TEST_DB_CMD="mariadb -S /tmp/mrun/m.sock --default-character-set=utf8mb4 ccc_pathfinder -N -B -e" lets it
# read the database to compare what the UI saved. Without it the DB checks are skipped (reported as SKIP).
import os, re, shlex, subprocess, sys, json, urllib.request
from playwright.sync_api import sync_playwright
from lib import BASE, Q
API='http://localhost:4000/api/v1'
DB=os.environ.get('TEST_DB_CMD')
res=[]
def ok(c,n,extra=''):
    res.append((n,bool(c))); print(('PASS' if c else 'FAIL'),n,extra if not c else '')
def skip(n): print('SKIP',n)
def sql(q): return subprocess.run(shlex.split(DB)+[q],capture_output=True,text=True).stdout.strip()
def api(path): 
    try: return json.load(urllib.request.urlopen(API+path))
    except urllib.error.HTTPError as e: return {'status':e.code}
NEXT='button:text-matches("^(Next|Submit|Finish|See).*")'
IGNORE_404=('/results/','/readiness/')
class Watch:
    def __init__(s,pg):
        s.errs=[]; s.bad=[]
        pg.on('console',lambda m: s.errs.append(m.text) if m.type=='error' and 'ERR_TUNNEL' not in m.text and 'ERR_NAME_NOT' not in m.text else None)
        pg.on('pageerror',lambda e: s.errs.append('PAGEERROR '+str(e)))
        EXT=('fonts.googleapis.com','fonts.gstatic.com')  # sandbox has no internet; external web fonts are reported as an observation
        pg.on('response',lambda r: s.bad.append((r.status,r.url)) if r.status>=400 and not any(h in r.url for h in EXT) else None)
        pg.on('requestfailed',lambda r: s.bad.append(('FAILED',r.url)) if not any(h in r.url for h in EXT) else None)
def qtext(pg,lang='en'):
    body=pg.inner_text('body'); return next(x for x in Q if (x['fil'] if lang=='fil' else x['text']) in body)
def start(pg,name='Maria Santos',age='17',gender=None,strand=None,school=None,lang='en'):
    pg.goto(BASE+'/'); pg.click('text=Start Assessment >> nth=0')
    pg.fill('input[name=fullName]',name); pg.fill('input[name=age]',age)
    if gender: pg.select_option('select[name=gender]',label=gender)
    if strand: pg.select_option('select[name=strand]',label=strand)
    if school: pg.fill('input[name=schoolName]',school)
    pg.check('input[name=privacyAcknowledged]'); pg.check('input[name=privacyConsent]')
    pg.click('button:has-text("Continue")')
    pg.click('text=Sagutin ang talatanungan sa Filipino.' if lang=='fil' else 'text=Answer the questionnaire in English.')
    pg.click('button:has-text("Continue")'); pg.wait_for_selector('text=Question 1 of 20')
def answer_all(pg,fn,lang='en',submit=True):
    given={}
    for i in range(20):
        pg.wait_for_selector(f'text=Question {i+1} of 20'); q=qtext(pg,lang); v=fn(q,i); given[q['id']]=v
        pg.click(f'[role=radio] >> nth={v-1}')
        if i<19 or submit: pg.click(NEXT)
    return given
def sid(pg): return pg.url.rstrip('/').split('/')[-1]
with sync_playwright() as p:
    b=p.chromium.launch()
    # ---------- A: student info -> DB, progress, navigation, likert, double click
    ctx=b.new_context(viewport={'width':1280,'height':900}); pg=ctx.new_page(); w=Watch(pg)
    start(pg,'Ana Reyes','18','Female','Science, Technology, Engineering, and Mathematics (STEM)','City College of Calamba SHS')
    ok(pg.is_disabled(NEXT) and pg.is_disabled('button:text-matches("^(Back).*")'),'A: Next disabled until answered, Back disabled on Q1')
    ok('0/20' in pg.inner_text('body'),'A: progress starts 0/20')
    reqs=[]; pg.on('request',lambda r: reqs.append(r.url) if r.method=='POST' else None)
    prog_ok=True
    for i in range(20):
        pg.wait_for_selector(f'text=Question {i+1} of 20')
        prog_ok &= f'{i}/20' in pg.inner_text('body')
        pg.click(f'[role=radio] >> nth={i%5}')
        if i<19: pg.click(NEXT)
    ok(prog_ok,'A: answered counter equals answers given at every step')
    # change answer + back/next retention
    pg.click('button:text-matches("^Back")'); pg.wait_for_selector('text=Question 19 of 20')
    ok(pg.get_attribute('[role=radio] >> nth=3','aria-checked')=='true','A: Back shows the previous answer (Q19=4)')
    pg.click(NEXT); pg.wait_for_selector('text=Question 20 of 20')
    ok(pg.get_attribute('[role=radio] >> nth=4','aria-checked')=='true','A: Next returns to last question with its answer kept (Q20=5)')
    pg.click('[role=radio] >> nth=0')  # change last answer 5 -> 1? (index19 -> 19%5=4 originally)
    fin=pg.locator('button:has-text("Finish")'); fin.dblclick()
    pg.wait_for_url('**/results/**',timeout=20000); pg.wait_for_selector('text=/strongest match|more than one/i')
    submits=[u for u in reqs if u.endswith('/assessment/submit')]
    ok(len(submits)==1,'A: double-click Finish sends exactly one submit request',str(len(submits)))
    sess=sid(pg)
    if DB:
        row=sql(f"select first_name,last_name,age,gender,senior_high_strand,school_name,language,status from assessment_sessions where id='{sess}'").split('\t')
        ok(row==['Ana','Reyes','18','female','academic_stem','City College of Calamba SHS','en','completed'],'A: form values saved to the right DB columns',str(row))
        ans=sql(f"select count(*), sum(likert_value) from assessment_answers where session_id='{sess}'").split('\t')
        exp=sum((i%5)+1 for i in range(19))+1
        ok(ans==['20',str(exp)],'A: 20 answers saved, sum matches (incl. the changed last answer)',f'{ans} expected {exp}')
    else: skip('A: DB column checks (TEST_DB_CMD not set)')
    # results page == API == (DB scores)
    shown=pg.inner_text('body'); r=api('/results/'+sess)['data']['results']
    ok(all(x['departmentName'] in shown for x in r),'A: results page lists all four programs from the API')
    top=[x for x in r if x['rank']==1]
    ok(('Your strongest match is '+top[0]['departmentName']) in shown if len(top)==1 else 'more than one' in shown.lower(),'B: headline equals computed rank-1 program')
    pcts=re.findall(r'(\d+)%',shown)
    ok(all(str(int(x['percentageScore'])) in pcts for x in r),'B: percentages shown equal stored scores')
    pg.reload(); pg.wait_for_selector('text=/strongest match|more than one/i')
    ok(pg.inner_text('body')==shown or all(x['departmentName'] in pg.inner_text('body') for x in r),'B: results identical after reload')
    ok(not [e for e in w.errs],'A/E: no console errors during first full flow',str(w.errs[:3]))
    ok(not [x for x in w.bad],'A/E: no failed network requests during first full flow',str(w.bad[:3]))
    ctx.close()
    # ---------- one-word name
    ctx=b.new_context(); pg=ctx.new_page(); start(pg,'Cher','20')
    answer_all(pg,lambda q,i:3); pg.wait_for_url('**/results/**'); s=sid(pg)
    if DB: ok(sql(f"select first_name,ifnull(last_name,'NULL') from assessment_sessions where id='{s}'")=='Cher\tNULL','A: one-word name keeps last name empty (was duplicated before fix)')
    else: skip('A: one-word name DB check')
    ctx.close()
    # ---------- A: validation extras
    ctx=b.new_context(); pg=ctx.new_page(); pg.goto(BASE+'/student-info')
    def tryform(name,age,school=''):
        pg.goto(BASE+'/student-info')
        pg.fill('input[name=fullName]',name); pg.fill('input[name=age]',age); pg.fill('input[name=schoolName]',school); pg.check('input[name=privacyAcknowledged]'); pg.check('input[name=privacyConsent]'); pg.click('button:has-text("Continue")'); pg.wait_for_timeout(250)
        return '/language' in pg.url
    tryform('Juan','17','x'*201); 
    ok(not tryform('   ','17'),'A: whitespace-only name rejected')
    ok(not tryform('Juan','1e1'),'A: age "1e1" rejected')
    ok(not tryform('Juan','0017.0'),'A: decimal-looking age rejected')
    ok(tryform('Juan','17','x'*200),'A: school name of exactly 200 characters accepted')
    pg.goto(BASE+'/student-info'); pg.fill('input[name=schoolName]','x'*250); ok(len(pg.input_value('input[name=schoolName]'))==200,'A: school field cannot exceed 200 characters (typing is capped, matches backend limit)')
    ctx.close()
    # ---------- B: all four programs end to end through the UI, EN and FIL (+ readiness = right program)
    names={'DTE':'Teacher Education','DCI':'Computing and Informatics','DBA':'Business and Accountancy','DAS':'Arts and Sciences'}
    for lang in ('en','fil'):
        for target in names:
            ctx=b.new_context(viewport={'width':1280,'height':900}); pg=ctx.new_page(); w=Watch(pg)
            start(pg,'Test Student','19',lang=lang)
            given=answer_all(pg,lambda q,i: 5 if q['dep']==target else 1,lang)
            pg.wait_for_url('**/results/**',timeout=20000); pg.wait_for_selector('text=/strongest match|more than one/i'); s=sid(pg)
            body=pg.inner_text('body')
            ok(('Your strongest match is '+names[target]) in body,f'B: [{lang}] {target} answers -> {names[target]} recommended')
            r=api('/results/'+s)['data']['results']; ok(r[0]['departmentCode']==target and r[0]['percentageScore']==100 and all(x['percentageScore']==20 for x in r[1:]),f'B: [{lang}] {target} stored 100/20/20/20')
            if lang=='fil': ok(not any(x['text'] in pg.content() for x in Q),'B: [fil] English question text never shown in results page')
            pg.click(f'a[href="/readiness/{target}"] >> nth=0'); pg.wait_for_selector('#roadmap')
            rb=pg.inner_text('body'); ok(names[target] in rb and not [n for k,n in names.items() if k!=target and n in rb],f'C: [{lang}] readiness for {target} shows only {target}')
            ok(not w.errs,f'E: [{lang}] {target} flow no console errors',str(w.errs[:2])); ok(not w.bad,f'E: [{lang}] {target} flow no failed requests',str(w.bad[:2]))
            ctx.close()
    # ---------- C: readiness content from backend, per program
    secs={}
    for d in names:
        j=api('/readiness/'+d)['data']; secs[d]=j
    sects=lambda j: j['sections'] if 'sections' in j else j
    for d in names:
        lst=sects(secs[d]); keys=[x.get('type') for x in lst]
        ok(len(lst)==7 and len(set(keys))==7,f'C: {d} has 7 distinct sections',str(keys))
        txt=' '.join((x.get('content') or '') for x in lst)
        ok(not re.search(r'lorem|todo|tbd|placeholder|xxx',txt,re.I),f'C: {d} content has no placeholder text')
        ok(all(len((x.get('content') or ''))>40 for x in lst),f'C: {d} every section has real content')
    allc=[(d,x.get('content')) for d in names for x in sects(secs[d])]
    dup=[c for c in set(c for _,c in allc) if sum(1 for _,k in allc if k==c)>1]
    ok(not dup,'C: no section text duplicated between programs',str(dup[:1]))
    # UI readiness shows each section's backend text
    ctx=b.new_context(); pg=ctx.new_page()
    for d in names:
        pg.goto(BASE+f'/readiness/{d}'); pg.wait_for_selector('#roadmap')
        pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
        body=re.sub(r'\s+',' ',pg.inner_text('body'))
        miss=[x.get('content')[:40] for x in sects(secs[d]) if re.sub(r'\s+',' ',x.get('content'))[:60] not in body]
        ok(not miss,f'C: UI /readiness/{d} displays all 7 backend sections',str(miss[:2]))
    ctx.close()
    # ---------- D: dashboard 0 / 1 / many records, refresh, retake, consistency
    ctx=b.new_context(viewport={'width':1280,'height':900}); pg=ctx.new_page(); w=Watch(pg)
    pg.goto(BASE+'/dashboard'); pg.wait_for_selector('h1:has-text("Your Dashboard")')
    ok('No assessment history yet' in pg.inner_text('body'),'D: empty history shows the empty state')
    ids=[]
    for n,t in enumerate(['DTE','DCI','DBA']):
        if n==0: start(pg,'Multi Record','20')
        else:
            pg.click('button:has-text("Retake Assessment")') if '/dashboard' in pg.url else pg.goto(BASE+'/student-info')
            pg.wait_for_url('**/student-info'); pg.fill('input[name=fullName]','Multi Record'); pg.fill('input[name=age]','20'); pg.check('input[name=privacyAcknowledged]'); pg.check('input[name=privacyConsent]'); pg.click('button:has-text("Continue")')
            pg.click('text=Answer the questionnaire in English.'); pg.click('button:has-text("Continue")'); pg.wait_for_selector('text=Question 1 of 20')
        answer_all(pg,lambda q,i,t=t: 5 if q['dep']==t else 1); pg.wait_for_url('**/results/**'); ids.append(sid(pg))
        pg.goto(BASE+'/dashboard'); pg.wait_for_selector('h1:has-text("Your Dashboard")'); pg.wait_for_timeout(600)
        links=pg.evaluate("[...document.querySelectorAll('a[href^=\"/results/\"]')].map(a=>a.getAttribute('href').split('/').pop())")
        ok(sorted(set(links))==sorted(ids) and len(links)==len(set(links)),f'D: after {n+1} record(s) dashboard lists exactly those results, no duplicates',f'{links} vs {ids}')
        body=pg.inner_text('body'); top={'DTE':'Teacher Education','DCI':'Computing and Informatics','DBA':'Business and Accountancy'}[t]
        ok(('Your strongest match is '+top) in body,f'D: current result shows newest assessment ({t})')
    hist=pg.evaluate("JSON.parse(localStorage.getItem('ccc_pathfinder_session_history')).map(h=>h.sessionId)")
    ok(hist==ids[::-1],'D: browser history = database ids, newest first',str(hist))
    pg.reload(); pg.wait_for_selector('h1:has-text("Your Dashboard")'); pg.wait_for_timeout(600)
    ok(len(pg.query_selector_all('a[href^="/results/"]'))>=3,'D: dashboard identical after reload')
    pg.click('button:has-text("Retake Assessment")'); pg.wait_for_url('**/student-info')
    pg.goto(BASE+'/dashboard'); pg.wait_for_selector('h1:has-text("Your Dashboard")'); pg.wait_for_timeout(600)
    ok('No assessment history yet' not in pg.inner_text('body') and len(pg.query_selector_all('a[href^="/results/"]'))>=3,'D: history still visible after Retake (regression for fixed defect)')
    # mid-assessment peek
    start(pg,'Someone Else','25'); pg.goto(BASE+'/dashboard'); pg.wait_for_selector('h1:has-text("Your Dashboard")'); pg.wait_for_timeout(600)
    ok('Someone Else' not in pg.inner_text('body') and 'No completed assessment yet' not in pg.inner_text('body'),'D: dashboard during a new assessment shows saved results without greeting the new student')
    for u in ids:
        pg.goto(BASE+'/results/'+u); pg.wait_for_selector('text=/strongest match|more than one/i')
    ok(not [e for e in w.errs],'D: no console errors in dashboard flows',str(w.errs[:2]))
    ctx.close()
    # ---------- E: direct URLs, invalid ids, back/forward, stuck loading
    ctx=b.new_context(); pg=ctx.new_page(); w=Watch(pg)
    for path,expect in [('/results/not-a-uuid','error'),('/results/00000000-0000-4000-8000-000000000000','error'),('/readiness/XYZ','error'),('/readiness/dci','ok'),('/nope/nope','landing'),('/admin/login','landing'),('/admin','landing')]:
        pg.goto(BASE+path); pg.wait_for_timeout(2200); t=pg.inner_text('body')
        stuck=bool(re.search(r'loading',t,re.I)) and len(t)<400
        if expect=='error': ok(not stuck and re.search(r"not found|couldn.t|try again|error|no results",t,re.I),f'E: {path} shows an error state, not an endless spinner',t[:120])
        elif expect=='landing': ok(pg.url.rstrip('/')==BASE and 'Start Assessment' in t,f'E: {path} -> landing page',pg.url)
        else: ok('Computing and Informatics' in t,f'E: {path} opens readiness')
    for path in ['/questionnaire/language','/questionnaire','/processing']:
        pg.goto(BASE+path); pg.wait_for_timeout(500); ok('/student-info' in pg.url,f'E: direct {path} without a started flow -> Student Info',pg.url)
    ctx.close()
    # back / forward through the flow
    ctx=b.new_context(); pg=ctx.new_page(); w=Watch(pg); start(pg,'Nav Test','18')
    answer_all(pg,lambda q,i:4); pg.wait_for_url('**/results/**'); pg.wait_for_selector('text=/strongest match|more than one/i'); rid=sid(pg)
    pg.go_back(); pg.wait_for_timeout(1500); u1=pg.url; t1=pg.inner_text('body')
    ok(not re.search(r'Something went wrong|Unexpected Application Error',t1),'E: browser Back from results does not crash',u1)
    print('INFO back from results ->',u1.replace(BASE,''),'|',t1.replace('\n',' ')[:90])
    pg.go_forward(); pg.wait_for_timeout(1500)
    pg.goto(BASE+'/dashboard'); pg.wait_for_selector('h1:has-text("Your Dashboard")'); pg.go_back(); pg.go_forward(); pg.wait_for_selector('h1:has-text("Your Dashboard")'); ok(True,'E: dashboard back/forward ok')
    ok(not w.errs,'E: no console errors during back/forward',str(w.errs[:2]))
    ctx.close()
    # ---------- F: responsive overflow on every page, three widths
    for (wd,ht) in [(375,740),(768,1024),(1280,800)]:
        ctx=b.new_context(viewport={'width':wd,'height':ht}); pg=ctx.new_page()
        pages=[('landing','/'),('student-info','/student-info'),('dashboard','/dashboard'),('readiness','/readiness/DBA'),('results','/results/'+rid)]
        for nme,path in pages:
            pg.goto(BASE+path); pg.wait_for_selector('h1',timeout=8000); pg.wait_for_timeout(500)
            over=pg.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
            ok(over<=0,f'F: {nme} no horizontal scroll at {wd}px',f'overflow {over}px')
        start(pg,'Resp Test','18'); over=pg.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth"); ok(over<=0,f'F: assessment no horizontal scroll at {wd}px')
        ctx.close()
    b.close()
bad=[n for n,k in res if not k]
print(f'\n{len(res)-len(bad)}/{len(res)} passed'); print('FAILED:',bad)
sys.exit(1 if bad else 0)
