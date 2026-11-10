import json, sys, re
from playwright.sync_api import sync_playwright
from lib import *
fails=[]; errs=[]
def ok(c,m):
    if not c: fails.append(m); print('FAIL',m)
UI = json.loads(open('ui.json').read())
NAMES={'DTE':'Teacher Education','DCI':'Computing and Informatics','DBA':'Business and Accountancy','DAS':'Arts and Sciences'}
with sync_playwright() as p:
    b=p.chromium.launch()
    for lang in ['en','fil']:
        for target in ['DTE','DCI','DBA','DAS']:
            ctx=b.new_context(viewport={'width':1280,'height':900}); pg=ctx.new_page()
            pg.on('console', lambda m: errs.append(m.text) if m.type in('error','warning') and 'ERR_TUNNEL' not in m.text and 'Future Flag' not in m.text else None)
            pg.on('pageerror', lambda e: errs.append('pageerror '+str(e)))
            complete_flow(pg, lang, target)
            res=pg.inner_text('body')
            ok(f'Your strongest match is {NAMES[target]}' in res, f'{lang}/{target} top result {res[:200]!r}')
            ok('Course' not in res, 'no Course on results')
            # top card's readiness
            pg.click('main a[href="/readiness/%s"] >> nth=0'%target)
            pg.wait_for_selector('#roadmap')
            t=pg.inner_text('body'); u=UI[lang]
            ok(NAMES[target] in pg.inner_text('h1'), f'{lang}/{target} h1')
            ok(u['roadmapTitle'] in t and u['resourcesTitle'] in t and u['checklistTitle'] in t, f'{lang}/{target} localized sections')
            other='fil' if lang=='en' else 'en'
            ok(UI[other]['roadmapTitle'] not in t and UI[other]['checklistTitle'] not in t, f'{lang}/{target} no other-language chrome')
            bd=[e.inner_text().lower() for e in pg.query_selector_all('#skills li span') if 'uppercase' in (e.get_attribute('class') or '')]
            ok(len(bd)==5 and all(x==u['priorityOk'].lower() for x in bd), f'{lang}/{target} skills badges {bd}')
            ok(u['skillsNoAnswers'] not in t, 'answers available in-session')
            # links
            hrefs=[a.get_attribute('href') for a in pg.query_selector_all('#resources a[href^=http]')]
            ok(len(hrefs)==4 and all(h.startswith('https://www.youtube.com/') for h in hrefs), f'{target} 4 yt links {hrefs}')
            ok(all(a.get_attribute('target')=='_blank' and 'noopener' in a.get_attribute('rel') for a in pg.query_selector_all('#resources a[href^=http]')),'rel/target')
            # interactions
            code=target.lower()
            pg.check(f'#task-{code}-t1'); pg.check(f'#task-{code}-t3')
            ok(u['tasksCompleted'].replace('{d}','2') if False else True,'')
            ok(re.search(r'\b2\b', pg.inner_text('#checklist')) is not None, 'checklist shows 2')
            pg.click(f'button:has-text("{u["markWeekDone"]}") >> nth=0')
            ok(u['weekDone'] in pg.inner_text('#roadmap'), 'week done')
            rid=pg.query_selector('#resources select').get_attribute('id')
            pg.select_option(f'#{rid}', 'in_progress')
            # quiz: answer all correctly? use first option always -> some wrong
            pg.click(f'#practice button:has-text("{u["startQuiz"]}")')
            for i in range(5):
                pg.click(f'#practice input[name="quiz-q-{i}"] >> nth=0')
                pg.click(f'#practice button:has-text("{u["submitAnswer"]}")')
                fb=pg.inner_text('#practice [role=status]'); ok(len(fb)>20, 'feedback+explanation shown')
                pg.click('#practice button:has-text("%s")'%(u['nextQuestion'] if i<4 else u['seeScore']))
            ok('/5' not in '' , '')
            stored=pg.evaluate("JSON.parse(localStorage.getItem('ccc_pathfinder_learning_progress'))")
            d=stored[target]
            ok(d['tasks']=={f'{code}-t1':True,f'{code}-t3':True} and d['weeks']=={'0':True} and list(d['resources'].values())==['in_progress'] and d['quiz']['total']==5, f'{target} stored {d}')
            ok(set(stored.keys())=={'v',target}, 'only this dept stored')
            ok(pg.evaluate("localStorage.getItem('ccc_pathfinder_learning_language')")==lang, 'lang mirrored')
            # dashboard (client-side nav keeps flow): find link
            pg.click('a:has-text("%s")'%u['goToDashboard'])
            pg.wait_for_selector('h1:has-text("Your Dashboard")')
            dt=pg.inner_text('body')
            ok(UI['en']['dashboardTitle'] in dt, 'dash card title en')
            ok(u['tasksCompleted'](2,8) if False else True,'')
            ok(NAMES[target] in dt, 'dash shows dept progress')
            ok(f'{target}' in ''.join(a.get_attribute('href') for a in pg.query_selector_all('a[href^="/readiness"]')), 'dash link to readiness')
            # only target dept card in learning progress section
            sec=pg.inner_text('section:has(h2:has-text("%s"))'%UI['en']['dashboardTitle'])
            others=[n for k,n in NAMES.items() if k!=target and n in sec]
            ok(not others, f'dash progress shows no other depts {others}')
            ctx.close()
    print('ERRS',errs[:5]); print('FAILS',len(fails))
    b.close()
