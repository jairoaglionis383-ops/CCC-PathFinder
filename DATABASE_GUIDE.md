# Database guide

CCC PathFinder uses one MySQL / MariaDB database (default name `ccc_pathfinder`, character set `utf8mb4`).
Files: `server/database/schema.sql` (tables), `server/database/seed.sql` (fixed reference data),
`server/scripts/setupDatabase.js` (runs both; started with `npm run db:setup` inside `server/`).

## Setting up
1. Create `server/.env` from `server/.env.example` and set `DB_USER` / `DB_PASSWORD` (and `DB_NAME` if you want a different name).
2. `cd server && npm run db:setup` - creates the database if missing, then creates all tables and loads the seed data.

**Use an empty or scratch database for setup and for the automated tests.** `schema.sql` begins with `DROP TABLE`
statements, so setup replaces all tables. As a safety net, `db:setup` refuses to run (exit code 2) when the database
already contains saved assessments; `npm run db:setup -- --force` overrides this on purpose.

## Tables (7)
| Table | Purpose | Main columns |
|---|---|---|
| `departments` | The four departments (seed) | id, code (DTE/DCI/DBA/DAS), name, mascot_name |
| `questions` | The 20 questions in English and Filipino (seed) | id 1-20, text_en, text_fil, is_reverse_scored, is_active |
| `question_department_weights` | Which department each question counts for (seed) | question_id, department_id, weight (1.00) |
| `readiness_sections` | Program Readiness descriptions, 7 per department (seed) | department_id, section_type, content, display_order |
| `assessment_sessions` | One row per completed assessment: student details | id (UUID), first_name, last_name, age, gender, senior_high_strand, school_name, language, status, started_at, completed_at |
| `assessment_answers` | The 20 answers of a session | session_id, question_id, likert_value (1-5) |
| `result_scores` | The 4 computed scores of a session | session_id, department_id, raw_score, percentage_score, rank_position |

Relationships (foreign keys): answers and result scores belong to a session; answers belong to a question; weights,
readiness sections and result scores belong to a department. A submission writes the session, its 20 answers and its
4 scores in **one transaction**, so a failed submission leaves nothing partly saved. A session id can be submitted only once.

## Seed data
4 departments - 20 questions (DTE 1-5, DCI 6-10, DBA 11-15, DAS 16-20) - 20 weight rows (all 1.00, no reverse-scored
questions) - 28 readiness sections (overview, first-year expectations, major subjects, required skills, common
challenges, career opportunities, preparation tips for each department). If question text is edited in `seed.sql`, the same
text must be updated in `client/src/constants/assessmentQuestions.js`.

## Useful checks (read-only)
    SELECT COUNT(*) FROM assessment_sessions;
    SELECT s.first_name, d.code, r.percentage_score, r.rank_position
      FROM result_scores r JOIN assessment_sessions s ON s.id = r.session_id
      JOIN departments d ON d.id = r.department_id ORDER BY s.completed_at DESC, r.rank_position LIMIT 8;

## Backup and restore
The dump keeps all relationships. Keep dump files private - they contain student names, ages and schools - and do not
commit them or share them in a ZIP.

    mysqldump -u USER -p --single-transaction ccc_pathfinder > ccc_backup_YYYY-MM-DD.sql      (MariaDB: mariadb-dump)

Restore into a **new** database first and compare row counts:

    mysql -u USER -p -e "CREATE DATABASE ccc_restore_check CHARACTER SET utf8mb4"
    mysql -u USER -p ccc_restore_check < ccc_backup_YYYY-MM-DD.sql
    -- then compare COUNT(*) of assessment_sessions, assessment_answers and result_scores with the original

Restoring over a live database replaces its contents (the dump contains DROP/CREATE statements): stop the API first.
This procedure was tested on MariaDB 10.11 with a test database (188 sessions, 3,760 answers, 748 results): all
counts matched, there were no orphaned rows and all foreign keys were restored. It was not tested on MySQL 8.

## SHS Track / Elective Cluster values
`assessment_sessions.senior_high_strand` (VARCHAR(100), optional) stores a code from the Strengthened SHS Curriculum list:
`academic_arts_social_sciences_humanities`, `academic_business_entrepreneurship`, `academic_stem`,
`academic_sports_health_wellness`, `academic_field_experience`, `techpro_aesthetic_wellness_human_care`,
`techpro_agri_fishery_food_innovation`, `techpro_artisanry_creative_enterprise`, `techpro_automotive_small_engine`,
`techpro_construction_building`, `techpro_creative_arts_design`, `techpro_hospitality_tourism`,
`techpro_ict_support_programming`, `techpro_industrial_technologies`, `techpro_maritime`.
No schema change was made. Records saved before this update may contain the old values (`stem`, `abm`, `humss`, `gas`,
`tvl`); they are left untouched. Privacy acknowledgment/consent is not stored in the database.
