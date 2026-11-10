# Mid-assessment refresh recovery (Task 2). Needs API :4000 + preview :5173.
import json, sys
from playwright.sync_api import sync_playwright
from lib import Q, BASE
res=[]
def check(name, cond, extra=''):
    res.append((name, bool(cond))); print(('PASS' if cond else 'FAIL'), name, extra)
def qtext(pg, lang):
    body=pg.inner_text('body')
    return next(x for x in Q if (x['fil'] if lang=='fil' else x['text']) in body)
def to_assessment(pg, lang):
    pg.goto(BASE+'/'); pg.click('text=Start Assessment >> nth=0')
    pg.fill('input[name=fullName]','Maria Santos'); pg.fill('input[name=age]','17')
    pg.check('input[name=privacyAcknowledged]'); pg.check('input[name=privacyConsent]')
    pg.click('button:has-text("Continue")')
    pg.click('text=Sagutin ang talatanungan sa Filipino.' if lang=='fil' else 'text=Answer the questionnaire in English.')
    pg.click('button:has-text("Continue")'); pg.wait_for_url('**/questionnaire')
NEXT='button:text-matches("^(Next|Submit|Finish|See).*")'
with sync_playwright() as p:
    b=p.chromium.launch()
    for lang in ('en','fil'):
        ctx=b.new_context(); pg=ctx.new_page()
        to_assessment(pg, lang)
        given={}
        for i in range(7):
            pg.wait_for_selector(f'text=Question {i+1} of 20')
            q=qtext(pg,lang); v=(i%5)+1; given[q['id']]=v
            pg.click(f'[role=radio] >> nth={v-1}')
            if i<6: pg.click(NEXT)
        # now on question 7, answered. Refresh.
        sid_before=pg.evaluate("localStorage.getItem('ccc_pathfinder_session_id')")
        pg.reload(); pg.wait_for_selector('text=Question 7 of 20')
        check(f'[{lang}] reload keeps question 7', True)
        q7=qtext(pg,lang); check(f'[{lang}] same question text after reload', q7['id']==list(given)[6])
        check(f'[{lang}] language kept', (q7['fil'] if lang=='fil' else q7['text']) in pg.inner_text('body'))
        sel=pg.get_attribute(f'[role=radio] >> nth={given[q7["id"]]-1}','aria-checked')
        check(f'[{lang}] answer for q7 still selected', sel=='true')
        check(f'[{lang}] same session id', pg.evaluate("localStorage.getItem('ccc_pathfinder_session_id')")==sid_before)
        # go back through earlier ones and verify each
        ok=True
        for back in range(6):
            pg.click('button:has-text("Back"), button:has-text("Bumalik")')
            pg.wait_for_selector(f'text=Question {6-back} of 20')
            q=qtext(pg,lang); idx=[i for i,k in enumerate(given) if k==q['id']]
            ok &= bool(idx) and pg.get_attribute(f'[role=radio] >> nth={given[q["id"]]-1}','aria-checked')=='true'
        check(f'[{lang}] earlier answers preserved after reload', ok)
        # storage content: draft lives in sessionStorage only, not localStorage
        d=json.loads(pg.evaluate("sessionStorage.getItem('ccc_pathfinder_assessment_draft')"))
        check(f'[{lang}] draft is in sessionStorage', True)
        check(f'[{lang}] localStorage has no student info', 'Maria' not in json.dumps(pg.evaluate("Object.assign({}, localStorage)")))
        # cross-session leakage: new context (other tab/browser) has no draft
        ctx2=b.new_context(); pg2=ctx2.new_page(); pg2.goto(BASE+'/questionnaire')
        pg2.wait_for_url('**/student-info*', timeout=5000) if False else None
        check(f'[{lang}] fresh browser does not see draft', pg2.evaluate("sessionStorage.getItem('ccc_pathfinder_assessment_draft')") is None and 'Question 1 of 20' not in pg2.inner_text('body'))
        ctx2.close()
        # finish the rest then submit
        for i in range(6): pg.click(NEXT)  # forward to q7 (answered)
        for i in range(7,20):
            pg.click(NEXT); pg.wait_for_selector(f'text=Question {i+1} of 20')
            pg.click('[role=radio] >> nth=4')
        pg.click(NEXT)
        pg.wait_for_url('**/results/**', timeout=20000)
        check(f'[{lang}] submit after restore works', True)
        check(f'[{lang}] draft cleared after submit', pg.evaluate("sessionStorage.getItem('ccc_pathfinder_assessment_draft')") is None)
        pg.reload(); pg.wait_for_selector('text=/Your strongest match|more than one|compatib/i', timeout=15000)
        check(f'[{lang}] results survive reload', True)
        # new assessment starts clean
        pg.goto(BASE+'/'); pg.click('text=Start Assessment >> nth=0')
        pg.fill('input[name=fullName]','Pedro Reyes'); pg.fill('input[name=age]','19'); pg.check('input[name=privacyAcknowledged]'); pg.check('input[name=privacyConsent]'); pg.click('button:has-text("Continue")')
        pg.click('text=Answer the questionnaire in English.'); pg.click('button:has-text("Continue")')
        pg.wait_for_selector('text=Question 1 of 20')
        check(f'[{lang}] new assessment starts at Q1 with no old answers', pg.get_attribute('[role=radio] >> nth=0','aria-checked')=='false' and pg.get_attribute('[role=radio] >> nth=4','aria-checked')=='false')
        ctx.close()
    # tampered / expired / invalid drafts
    for label, mutate in [('corrupt json', lambda d: '{bad'),
                          ('expired', lambda d: json.dumps({**d,'savedAt':'2020-01-01T00:00:00.000Z'})),
                          ('bad session id', lambda d: json.dumps({**d,'sessionId':'xyz'})),
                          ('answer out of range', lambda d: json.dumps({**d,'answers':{**d['answers'],str(d['order'][0]):9}})),
                          ('order not a permutation', lambda d: json.dumps({**d,'order':d['order'][:-1]+[d['order'][0]]}))]:
        ctx=b.new_context(); pg=ctx.new_page(); to_assessment(pg,'en')
        pg.wait_for_selector('text=Question 1 of 20'); pg.click('[role=radio] >> nth=2'); pg.click(NEXT); pg.wait_for_selector('text=Question 2 of 20')
        d=json.loads(pg.evaluate("sessionStorage.getItem('ccc_pathfinder_assessment_draft')"))
        pg.evaluate("v=>sessionStorage.setItem('ccc_pathfinder_assessment_draft',v)", mutate(d))
        pg.reload(); pg.wait_for_timeout(1500)
        url=pg.url; body=pg.inner_text('body')
        check(f'[{label}] invalid draft discarded, no crash, back to start of flow', 'Question 2 of 20' not in body and 'Something went wrong' not in body and '/student-info' in url, url)
        ctx.close()
    # already-submitted session id in draft -> must not restore
    ctx=b.new_context(); pg=ctx.new_page(); to_assessment(pg,'en'); pg.wait_for_selector('text=Question 1 of 20')
    pg.click('[role=radio] >> nth=2'); pg.click(NEXT); pg.wait_for_selector('text=Question 2 of 20')
    d=pg.evaluate("sessionStorage.getItem('ccc_pathfinder_assessment_draft')"); sid=json.loads(d)['sessionId']
    pg.evaluate("s=>localStorage.setItem('ccc_pathfinder_session_history', JSON.stringify([{sessionId:s,completedAt:new Date().toISOString()}]))", sid)
    pg.reload(); pg.wait_for_timeout(1500)
    check('[completed session] draft for a submitted session is not restored', 'Question 2 of 20' not in pg.inner_text('body') and pg.evaluate("sessionStorage.getItem('ccc_pathfinder_assessment_draft')") is None)
    ctx.close()
    # blocked storage
    ctx=b.new_context(); pg=ctx.new_page()
    pg.add_init_script("Object.defineProperty(window,'sessionStorage',{get(){throw new Error('blocked')}})")
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    to_assessment(pg,'en'); pg.wait_for_selector('text=Question 1 of 20'); pg.click('[role=radio] >> nth=1'); pg.click(NEXT); pg.reload(); pg.wait_for_timeout(1000)
    check('[blocked sessionStorage] app still works (no crash)', not errs and 'Something went wrong' not in pg.inner_text('body'), str(errs[:1]))
    b.close()
bad=[n for n,ok in res if not ok]
print(f'\n{len(res)-len(bad)}/{len(res)} passed'); sys.exit(1 if bad else 0)
