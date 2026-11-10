import { DEPARTMENTS, DEPARTMENT_CODES } from './departments';

// The 20-question assessment dataset (reduced from the original 60,
// per approved requirement). Each question has a stable numeric id,
// departmentCode, departmentName, and real scenario-based text
// (English shown; textFil used when session.state.language === 'fil').
// There are no scoring weights or characteristic tagging here - this
// file's only job is to hold 20 well-shaped question records and
// present them in a mixed order.
//
// CRITICAL ID DESIGN: `id` is computed as a fixed, predictable integer
// (department block index * 5 + local number, 1-indexed). This must
// match the backend's seeded `questions.id` values exactly:
//   DTE = 1-5   DCI = 6-10   DBA = 11-15   DAS = 16-20
// The shuffle/mixing algorithm below is unaffected by the count
// change - it still randomizes PRESENTATION ORDER on every module
// load, guaranteeing no two consecutive questions share a department.

const QUESTIONS_PER_DEPARTMENT = 5;

// Real scenario-based question content, 5 per department. Kept in
// sync with the backend's seeded question rows by construction - if
// this content is ever revised, the backend seed must be updated to
// match, and vice versa.
const QUESTION_CONTENT = {
  DTE: [
    { en: 'When a group is struggling to understand a complicated idea, I naturally look for another way to explain it.', fil: 'Kapag nahihirapan ang isang grupo na maintindihan ang isang komplikadong ideya, natural kong hinahanap ang ibang paraan para ipaliwanag ito.' },
    { en: 'When someone keeps making the same mistake while learning something, I stay patient and try a different approach with them.', fil: 'Kapag paulit-ulit na nagkakamali ang isang tao habang natututo, nananatili akong matiyaga at sinusubukan ang ibang paraan sa kanila.' },
    { en: 'I notice when I need to explain something differently depending on who I am talking to.', fil: 'Napapansin ko kapag kailangan kong iba ang paraan ng pagpapaliwanag depende sa kausap ko.' },
    { en: 'When I help someone improve at something, I focus on what will actually help them progress, not just pointing out errors.', fil: 'Kapag tumutulong ako sa isang tao na umunlad sa isang bagay, nakatuon ako sa kung ano talaga ang makakatulong sa kanilang pag-unlad, hindi lang ang pagturo sa mali.' },
    { en: 'In a group setting, I often find myself checking whether everyone is following along before moving forward.', fil: 'Sa isang grupo, madalas kong tinitingnan kung nakakasabay ang lahat bago magpatuloy.' },
  ],
  DCI: [
    { en: 'When something does not work as expected, I want to understand exactly why before trying another approach.', fil: 'Kapag may hindi gumana ayon sa inaasahan, gusto kong maintindihan kung bakit bago subukan ang ibang paraan.' },
    { en: 'I prefer breaking a complicated task into smaller, more manageable steps rather than tackling it all at once.', fil: 'Mas gusto kong hatiin ang isang komplikadong gawain sa mas maliliit na hakbang kaysa harapin ito nang sabay-sabay.' },
    { en: 'I tend to notice patterns or repeated details that others might overlook.', fil: 'Napapansin ko ang mga pattern o paulit-ulit na detalye na maaaring hindi mapansin ng iba.' },
    { en: 'When solving a problem, I like testing one change at a time to see what effect it has.', fil: 'Kapag lumulutas ng problema, gusto kong subukan ang isang pagbabago sa isang pagkakataon para makita ang epekto nito.' },
    { en: 'If a result seems unusual or unexpected, I want to investigate why before accepting it.', fil: 'Kung may resultang kakaiba o hindi inaasahan, gusto kong imbestigahan kung bakit bago ito tanggapin.' },
  ],
  DBA: [
    { en: 'When resources like time or money are limited, I naturally think about how to use them most effectively.', fil: 'Kapag limitado ang mapagkukunan tulad ng oras o pera, natural kong iniisip kung paano ito magagamit nang pinakamabisa.' },
    { en: 'I like organizing tasks and responsibilities so that everything gets done on schedule.', fil: 'Gusto kong mag-organisa ng mga gawain at responsibilidad para masigurong natatapos ang lahat sa oras.' },
    { en: 'I am comfortable making a decision even when I do not have all the information I would like.', fil: 'Komportable akong magpasya kahit hindi kumpleto ang impormasyong nasa akin.' },
    { en: 'When planning an activity, I think ahead about timing, coordination, and what could go wrong.', fil: 'Kapag nagpaplano ng isang aktibidad, iniisip ko nang maaga ang timing, koordinasyon, at mga posibleng problema.' },
    { en: 'When choosing between two options, I weigh the trade-offs before deciding.', fil: 'Kapag pumipili sa pagitan ng dalawang opsyon, tinitimbang ko ang mga trade-off bago magpasya.' },
  ],
  DAS: [
    { en: 'I often notice small differences in how people react to the same situation.', fil: 'Madalas kong napapansin ang maliliit na pagkakaiba kung paano tumutugon ang mga tao sa parehong sitwasyon.' },
    { en: 'I try to understand a situation from more than one person\u2019s perspective before forming an opinion.', fil: 'Sinusubukan kong maintindihan ang isang sitwasyon mula sa higit sa isang pananaw bago bumuo ng opinyon.' },
    { en: 'I find myself wondering why people respond differently to the same event.', fil: 'Naiisip ko kung bakit magkaiba ang tugon ng mga tao sa parehong pangyayari.' },
    { en: 'I pay attention to what might be influencing someone\u2019s mood or behavior, not just what they say.', fil: 'Binibigyang-pansin ko kung ano ang maaaring nakaaapekto sa mood o ugali ng isang tao, hindi lang ang sinasabi nila.' },
    { en: 'After a disagreement or misunderstanding, I like reflecting on what actually caused it.', fil: 'Pagkatapos ng hindi pagkakaunawaan, gusto kong pag-isipan kung ano talaga ang naging sanhi nito.' },
  ],
};

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildQuestionRecord(departmentCode, localNumber) {
  const department = DEPARTMENTS[departmentCode];
  const departmentBlockIndex = DEPARTMENT_CODES.indexOf(departmentCode);
  const content = QUESTION_CONTENT[departmentCode][localNumber - 1];

  return {
    id: departmentBlockIndex * QUESTIONS_PER_DEPARTMENT + localNumber,
    departmentCode,
    departmentName: department.name,
    text: content.en,
    textFil: content.fil,
  };
}

function buildMixedQuestionSet() {
  const shuffledLocalNumbers = {};
  DEPARTMENT_CODES.forEach((code) => {
    shuffledLocalNumbers[code] = shuffle(
      Array.from({ length: QUESTIONS_PER_DEPARTMENT }, (_, index) => index + 1)
    );
  });

  const rounds = [];
  for (let round = 0; round < QUESTIONS_PER_DEPARTMENT; round += 1) {
    let deptOrder = shuffle(DEPARTMENT_CODES);

    const previousRound = rounds[round - 1];
    if (previousRound) {
      const previousLast = previousRound[previousRound.length - 1];
      if (deptOrder[0] === previousLast) {
        [deptOrder[0], deptOrder[1]] = [deptOrder[1], deptOrder[0]];
      }
    }

    rounds.push(deptOrder);
  }

  const pointer = { DTE: 0, DCI: 0, DBA: 0, DAS: 0 };
  const orderedQuestions = [];

  rounds.forEach((deptOrder) => {
    deptOrder.forEach((code) => {
      const localNumber = shuffledLocalNumbers[code][pointer[code]];
      pointer[code] += 1;
      orderedQuestions.push(buildQuestionRecord(code, localNumber));
    });
  });

  return orderedQuestions;
}

export const ASSESSMENT_QUESTIONS = buildMixedQuestionSet();
