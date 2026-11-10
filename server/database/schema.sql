-- CCC PathFinder - minimal schema (7 tables). MySQL 8 / InnoDB / utf8mb4.
DROP TABLE IF EXISTS result_scores;
DROP TABLE IF EXISTS assessment_answers;
DROP TABLE IF EXISTS assessment_sessions;
DROP TABLE IF EXISTS readiness_sections;
DROP TABLE IF EXISTS question_department_weights;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  mascot_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE questions (
  id INT UNSIGNED NOT NULL PRIMARY KEY,
  text_en VARCHAR(500) NOT NULL,
  text_fil VARCHAR(600) NOT NULL,
  is_reverse_scored TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE question_department_weights (
  question_id INT UNSIGNED NOT NULL,
  department_id TINYINT UNSIGNED NOT NULL,
  weight DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  PRIMARY KEY (question_id, department_id),
  CONSTRAINT fk_qdw_question FOREIGN KEY (question_id) REFERENCES questions(id),
  CONSTRAINT fk_qdw_department FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE readiness_sections (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  department_id TINYINT UNSIGNED NOT NULL,
  section_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  display_order TINYINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_readiness (department_id, section_type),
  CONSTRAINT fk_rs_department FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE assessment_sessions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NULL,
  age TINYINT UNSIGNED NULL,
  gender VARCHAR(50) NULL,
  senior_high_strand VARCHAR(100) NULL,
  school_name VARCHAR(200) NULL,
  language ENUM('en','fil') NOT NULL DEFAULT 'en',
  status ENUM('in_progress','completed') NOT NULL DEFAULT 'in_progress',
  started_at DATETIME NOT NULL,
  completed_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE assessment_answers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  session_id CHAR(36) NOT NULL,
  question_id INT UNSIGNED NOT NULL,
  likert_value TINYINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_answer (session_id, question_id),
  CONSTRAINT chk_likert CHECK (likert_value BETWEEN 1 AND 5),
  CONSTRAINT fk_aa_session FOREIGN KEY (session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_aa_question FOREIGN KEY (question_id) REFERENCES questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE result_scores (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  session_id CHAR(36) NOT NULL,
  department_id TINYINT UNSIGNED NOT NULL,
  raw_score DECIMAL(8,2) NOT NULL,
  percentage_score DECIMAL(5,2) NOT NULL,
  rank_position TINYINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_result (session_id, department_id),
  CONSTRAINT fk_rsc_session FOREIGN KEY (session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_rsc_department FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
