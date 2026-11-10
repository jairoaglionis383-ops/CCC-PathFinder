# CCC PathFinder

**Program Recommendation and Readiness Support System** for incoming first-year students of City College of Calamba.

A student answers a 20-question Likert-scale questionnaire. The system scores it against four academic departments
using a rule-based weighted method (no AI) and recommends a Program, then shows what to expect and how to prepare
(Program Readiness). Results are saved and shown again on the student dashboard.

| Department | Mascot |
|---|---|
| DTE - Teacher Education | Green Dragon |
| DCI - Computing and Informatics | Silver Vikings |
| DBA - Business and Accountancy | Yellow Tigers |
| DAS - Arts and Sciences | Winter Wolves |

## Student flow
Landing Page -> Student Information (name, age, gender, SHS Track / Elective Cluster, school, Data Privacy Notice
with acknowledgment and consent checkboxes) -> Language (English / Filipino) -> 20-question Assessment -> Processing ->
Results and Program Recommendation -> Program Readiness -> Dashboard (history, Retake Assessment, and an
"Assessment Session Completed" card with *Take a New Assessment* and *End Session*). The CCC PathFinder logo in the header
returns to the Landing Page from every page. None of these actions deletes saved results or history; they only reset
the temporary state of the current session (there are no accounts, so End Session is not a logout).

## How scoring works
Each question belongs to one department (DTE questions 1-5, DCI 6-10, DBA 11-15, DAS 16-20) with weight 1.00.
Answers are 1 (Strongly Disagree) to 5 (Strongly Agree). For each department:

    percentage = sum(weight x answer) / sum(weight x 5) x 100

Departments are ranked from highest to lowest; equal scores share the same rank. Scoring is done only on the
backend (`server/src/services/scoring.service.js`); the questions are presented in a mixed order and the department
is never shown during the assessment. Program Readiness content is descriptive and never affects scores.

## Technology
React 18 + Vite, React Router, Tailwind CSS, Axios - Node.js + Express - MySQL (tested on MariaDB 10.11).
Fonts are bundled locally, so the website needs no internet connection once installed (the optional YouTube
resource links on the Readiness page need internet to open).

## Requirements
* Node.js 18 or newer (developed and tested with Node 22) and npm
* MySQL 8 or MariaDB 10.5+ running locally, and a database user allowed to create a database

## Installation and running
Open two terminals in this folder.

**1. Backend** (http://localhost:4000/api/v1)

    cd server
    npm install
    cp .env.example .env        # Windows: copy .env.example .env  - then edit DB_USER / DB_PASSWORD
    npm run db:setup            # creates the database, tables and seed data (see DATABASE_GUIDE.md)
    npm start

Check it: open http://localhost:4000/api/v1/health - it should show `"status":"ok"`.

**2. Frontend** (http://localhost:5173)

    cd client
    npm install
    npm run dev

Open http://localhost:5173 in a browser. (`npm run build` then `npm run preview` serves the production build.)
If the backend runs elsewhere, copy `client/.env.example` to `client/.env` and set `VITE_API_BASE_URL`.

## Configuration (`server/.env`)
| Variable | Meaning | Default |
|---|---|---|
| `PORT` | API port | 4000 |
| `CLIENT_ORIGIN` | Website address allowed by CORS | http://localhost:5173 |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Database connection | localhost, 3306, ccc_pathfinder, root, (empty) |
| `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS` | Per-IP request limit (a whole class sharing one IP may need a higher max) | 120 per 60000 ms |
| `TRUST_PROXY` | Number of reverse proxies in front of the API (normally unset) | 0 |

`.env` files hold credentials and are never part of the project package.

## Project structure
    client/      React website (src/pages, src/features, src/components, src/context, src/services, src/constants, src/utils)
    server/      Express API (src/routes, controllers, services, models, middlewares), database/ (schema.sql, seed.sql),
                 scripts/setupDatabase.js, tests/ (API tests)
    tests/browser/  Browser (end-to-end) tests - see TESTING_SUMMARY.md
    DATABASE_GUIDE.md, TESTING_SUMMARY.md, README.md

API: `POST /assessment/start`, `POST /assessment/submit`, `GET /results/:sessionId`, `GET /readiness/:departmentCode`,
`GET /health` (all under `/api/v1`).

## Behaviour worth knowing
* **No student accounts.** An assessment is a session identified by a random id. The browser remembers the ids it has
  completed (localStorage) so the dashboard can list earlier results; "Retake Assessment" never deletes saved results.
  Anyone who has a result link can open that result (it contains scores only, no personal details).
* **Refresh safe.** Reloading during the assessment restores the answers and position for that browser tab
  (sessionStorage, cleared on submit or tab close). Results and Readiness pages can be reloaded or opened directly.
* **Language.** The language screen sets the questionnaire (questions and answer labels) and the Program Readiness
  learning guide (resources, roadmap, checklist, quiz). All other pages are English, and the department descriptions
  on the Readiness page come from the database in English.
* **Student Information.** Full name and age are required; age is accepted from 15 to 99
  (`client/src/utils/studentInfoValidation.js` and `server/src/services/assessment.service.js`).
* **Admin area.** Not part of this system's scope; `/admin` addresses redirect to the Landing Page. A few unused
  admin source files remain in `client/src` for a possible future module.

## Known limitations
* Results are protected only by their unguessable session id (no login). Suitable for local demonstration.
* Data Privacy Notice (English and Filipino, on the Student Information page): both required checkboxes must be ticked
  before the assessment can start. The consent choice is **not stored in the database** (only enforced in the browser).
  The college still needs to supply: the official privacy / Data Protection Officer contact (edit `PRIVACY_CONTACT` in
  `client/src/constants/privacyNotice.js`; until then the notice says no contact has been provided), and a retention
  period (the system never deletes records, and the notice says so). The Filipino text should be reviewed by a
  Filipino-speaking reviewer and the college before real use; the notice is not legal advice.
* The SHS Track / Elective Cluster list follows the Strengthened SHS Curriculum. It is stored as a code
  (e.g. `academic_stem`, `techpro_maritime`) in `assessment_sessions.senior_high_strand`; the server accepts only the
  15 known codes (or empty). Rows saved earlier with the old codes (`stem`, `abm`, ...) are not changed or deleted.
* Student names, ages and schools are stored unencrypted in the database; protect the database accordingly.
* Tested with Chromium and MariaDB 10.11; MySQL 8 and other browsers were not tested.
* Accessibility was checked with automated tools (axe-core, contrast measurement) only, not with screen readers.
* The scoring weights and question content are as specified for the prototype; no statistical validation of the
  questionnaire is included in this software.
