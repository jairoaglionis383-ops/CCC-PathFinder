import json
Q = json.load(open('qs.json'))
BASE='http://localhost:5173'
def complete_flow(pg, lang, target, name='Juan Dela Cruz'):
    pg.goto(BASE+'/')
    pg.click('text=Start Assessment >> nth=0')
    pg.fill('input[name=fullName]', name); pg.fill('input[name=age]','17')
    pg.check('input[name=privacyAcknowledged]'); pg.check('input[name=privacyConsent]')
    pg.click('button:has-text("Continue")')
    pg.click('text=Sagutin ang talatanungan sa Filipino.' if lang=='fil' else 'text=Answer the questionnaire in English.')
    pg.click('button:has-text("Continue")'); pg.wait_for_url('**/questionnaire')
    for i in range(20):
        pg.wait_for_selector(f'text=Question {i+1} of 20')
        body = pg.inner_text('body')
        q = next(x for x in Q if (x['fil'] if lang=='fil' else x['text']) in body)
        v = 5 if q['dep']==target else 1
        pg.click(f'[role=radio] >> nth={v-1}')
        pg.click('button:text-matches("^(Next|Submit|Finish|See).*")')
    pg.wait_for_url('**/results/**', timeout=20000); pg.wait_for_selector('text=/Your strongest match|more than one/i', timeout=15000)
