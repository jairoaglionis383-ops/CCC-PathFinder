# Testing summary

All tests were run against a **scratch database created for the test** (never an existing database with student
records), on a fresh installation unpacked from the final package. Environment: Linux, Node 22, MariaDB 10.11,
Chromium (Playwright). The tests only add new assessment sessions; they never delete or reset data.
Test results describe this environment only; MySQL 8, other browsers and other operating systems were not tested.

## Results of the final run
| Test | What it covers | Result |
|---|---|---|
| Lint (`npm run lint` in `client/`) and production build (`npm run build`) | Code style and that the website compiles | passed, no errors |
| API tests (`npm test` in `server/`) - 23 tests | Scoring for all answer patterns, each of the 20 questions affects only its own department, 300 random answer sets equal an independent calculation and the stored database rows, ranking and ties, validation (400), invalid ids (404), duplicate and simultaneous submissions (409), transactions, JSON/body-size/CORS/security-header behaviour, rate limiting, proxy setting, `db:setup` safety guard | 23 passed, 0 failed |
| `test_demo_flow.py` - 73 checks | One browser session through the whole demonstration for all four programs in English and Filipino: Landing -> Student Information -> Language -> 20 questions with a page refresh half-way -> Processing -> Results (scores 100/20/20/20, ranks) -> browser Back -> Program Readiness -> Dashboard (history grows to four records) -> Retake. Also checks that nothing outside localhost is requested (works offline), no console errors, no failed requests, database rows match | 73 passed, 0 failed |
| `test_ui_audit.py` - 124 checks | Form values saved in the right columns, progress counter, Next/Back, double-click submit, all programs, readiness text equals database for each program, dashboard with 0/1/many records and after Retake, invalid and unknown URLs, Back/Forward, no horizontal scrolling at 375, 768 and 1280 px | 124 passed, 0 failed |
| `test_student_info.py` | Student Information validation (names, age, empty fields, desktop and mobile, English and Filipino) | 0 failures |
| `test_scoring_and_retry.py` | Uniform, mixed and single-program answer patterns on screen, stale session, error and "Try again" handling | 42 checks passed, 0 failed |
| `test_page_refresh.py` | Reloading Results, Readiness and Dashboard, invalid ids, saved learning progress | 56 checks passed, 0 failed |
| `test_all_programs.py` | All four programs in both languages: results, readiness, checklist, quiz, dashboard | 0 failures |
| `test_shs_and_privacy.py` | Strengthened SHS Track / Elective Cluster dropdown (two groups, exact 5 + 10 options, no ABM/STEM/HUMSS/GAS/TVL, label), Data Privacy Notice (8 sections in English and Filipino, checkboxes unchecked by default, cannot continue without both, error messages in the notice language, focus, values kept after Back, 375 px layout, stored track code in the database) | 33 passed, 0 failed |
| `test_session_completion.py` | Dashboard "Assessment Session Completed" card (English and Filipino, desktop 1280 px and mobile 375 px): shown at the bottom, buttons and styles, End Session dialog (Cancel / Escape / confirm), Take a New Assessment (fresh form and questionnaire, language kept, separate database record, history kept), End Session (back to Landing, history and database rows kept, clean next start), clickable logo from Student Information, Questionnaire, Results, Program Readiness and Dashboard (history untouched) | 54 passed, 0 failed |
| `test_draft_recovery.py` | Refresh during the assessment restores answers, position and language; draft is cleared after submit; corrupted, expired or already-submitted drafts are ignored | 33 passed, 0 failed |
| `test_accessibility.py` | axe-core rules (WCAG 2.0/2.1 A and AA) on 9 screens at desktop and mobile size | 0 violations on 18 screen states |
| `test_gradient_contrast.py` | Text contrast on gradient backgrounds, measured from rendered pixels | 0 failing text runs |

The browser suites were also run at the same time as each other and as the API tests without failures.

## Update: SHS Track / Elective Cluster and Data Privacy Notice
The dropdown and the notice were added after the run above. After the change the following were re-run on a scratch
MariaDB 10.11 database: lint and build (no errors), API tests (23 passed), and every browser suite (all with 0 failures,
accessibility 0 violations on 18 screen states). The existing browser suites were edited only to tick the two privacy
checkboxes and use the new track labels. Scores and recommendations are unchanged (scoring tests and the program suites
pass without modification of their expected values).

## Update: session completion and clickable logo
Re-run after this change on the scratch database: lint (no errors), API tests (23 passed) and all browser suites (0 failures;
accessibility 0 violations on 18 screen states). `test_session_completion.py` counts only its own records, so it is safe to
run alongside other suites. The new dashboard card and dialog were not part of the axe accessibility screens; the card
text follows the student's language setting, so with Filipino chosen the Dashboard shows this one section in Filipino
and the rest of the page in English.

## What was not tested
MySQL 8 (only MariaDB 10.11); browsers other than Chromium; keyboard-only use and screen readers (automated checks only,
so the site is not claimed to be fully WCAG compliant); deployment on a public server; large numbers of simultaneous
students; the scoring method against the thesis document (it was checked against the project specification only);
spelling and grammar proofreading of all text; the Filipino privacy notice has not been reviewed by a Filipino-speaking\nreviewer or by the college; keyboard-only/screen-reader use of the new notice.

## Running the tests yourself
Use a **scratch** database (copy `server/.env.example`, set `DB_NAME` to e.g. `ccc_pathfinder_test`, run `npm run db:setup`).
Never run the tests against a database holding real records.

    # terminal 1                         # terminal 2                          # terminal 3
    cd server && npm start               cd client && npm run build            cd server && npm test
                                         npx vite preview --port 5173

    # browser tests (Python 3 + Playwright):
    pip install -r tests/browser/requirements.txt
    playwright install chromium
    cd tests/browser
    python3 test_demo_flow.py            # likewise: test_ui_audit.py, test_all_programs.py, test_page_refresh.py,
                                         # test_scoring_and_retry.py, test_student_info.py, test_draft_recovery.py,
                                         # test_accessibility.py, test_gradient_contrast.py

Each prints PASS/FAIL lines and a summary. `test_demo_flow.py` and `test_ui_audit.py` can compare the screen with the
database when `TEST_DB_CMD` is set, for example
`TEST_DB_CMD="mysql -u USER -pPASSWORD ccc_pathfinder_test -N -B -e" python3 test_ui_audit.py`; otherwise those comparisons are skipped.
The browser tests expect the API on port 4000 and the website on port 5173.
