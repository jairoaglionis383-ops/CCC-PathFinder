// Learning-support content for the Program Readiness page: resources,
// 4-week roadmap, checklist, skills, mini quiz, sample projects and
// career paths - one block per department code, every text available
// in English (`en`) and Filipino (`fil`).
//
// This is static, hand-written guidance content, NOT assessment data:
// nothing here is scored, and nothing here changes how the assessment
// or the backend ranks departments.
//
// LINK POLICY. Only links that were opened and confirmed are used:
//  - channel pages for @freecodecamp, @Fireship, @khanacademy,
//    @crashcourse and @dojicreates (confirmed to exist);
//  - three CrashCourse playlists (Psychology, Statistics, Economics),
//    whose IDs were opened and confirmed by title and owner;
//  - "channel search" links (youtube.com/@channel/search?query=...),
//    which open that channel's own search for the topic. The topic
//    results themselves are chosen by YouTube and can change over time.
// No ratings, rankings, subscriber counts or endorsement claims are
// made anywhere. These are external sites; CCC does not run them.

export const CHANNELS = {
  freecodecamp: { name: 'freeCodeCamp.org', handle: 'freecodecamp' },
  fireship: { name: 'Fireship', handle: 'Fireship' },
  dojicreates: { name: 'Doji Creates', handle: 'dojicreates' },
  khan: { name: 'Khan Academy', handle: 'khanacademy' },
  crashcourse: { name: 'CrashCourse', handle: 'crashcourse' },
};

const channelUrl = (key) => `https://www.youtube.com/@${CHANNELS[key].handle}`;
const searchUrl = (key, query) =>
  `https://www.youtube.com/@${CHANNELS[key].handle}/search?query=${encodeURIComponent(query)}`;
const playlistUrl = (id) => `https://www.youtube.com/playlist?list=${id}`;

const CC_PSYCHOLOGY = playlistUrl('PL8dPuuaLjXtOPRKzVLY0jJY-uHOH9KVU6');
const CC_STATISTICS = playlistUrl('PL8dPuuaLjXtNM_Y-bUAhblSAdWRnmBUcr');
const CC_ECONOMICS = playlistUrl('PL8dPuuaLjXtPNZwz5_o_5uirJ8gQXnhEO');

// kind: 'playlist' = a confirmed playlist, 'search' = channel search
// for the topic, 'channel' = the channel page.
export const LEARNING_CONTENT = {
  // ---------------------------------------------------------------
  DTE: {
    resources: [
      {
        id: 'dte-cc-study',
        channel: 'crashcourse',
        kind: 'search',
        url: searchUrl('crashcourse', 'study skills'),
        topic: { en: 'Study skills and how learning works', fil: 'Mga study skill at kung paano natututo ang tao' },
        why: {
          en: 'Good teachers understand how people learn. This builds your own study habits and your sense of how to help others study.',
          fil: 'Naiintindihan ng mahusay na guro kung paano natututo ang tao. Nakakatulong ito sa sarili mong gawi sa pag-aaral at sa pagtulong sa iba.',
        },
      },
      {
        id: 'dte-cc-psych',
        channel: 'crashcourse',
        kind: 'playlist',
        url: CC_PSYCHOLOGY,
        topic: { en: 'Psychology playlist (learning, memory, development)', fil: 'Psychology playlist (pagkatuto, memorya, pag-unlad)' },
        why: {
          en: 'Introductory psychology helps you understand how learners think and grow, which supports lesson planning and classroom communication.',
          fil: 'Ang panimulang psychology ay tumutulong maintindihan kung paano nag-iisip at lumalaki ang mga mag-aaral, na makatutulong sa pagpaplano ng aralin at komunikasyon sa klase.',
        },
      },
      {
        id: 'dte-khan-foundations',
        channel: 'khan',
        kind: 'channel',
        url: `${channelUrl('khan')}/playlists`,
        topic: { en: 'Review foundational subjects (math, science, reading)', fil: 'Balikan ang mga pundamental na asignatura (math, science, pagbasa)' },
        why: {
          en: 'Teachers need a solid grasp of the basics. Browse the playlists and refresh the subject you may want to teach.',
          fil: 'Kailangan ng guro ng matibay na pundasyon sa mga batayan. Tingnan ang mga playlist at balikan ang asignaturang nais mong ituro.',
        },
      },
      {
        id: 'dte-khan-explain',
        channel: 'khan',
        kind: 'search',
        url: searchUrl('khan', 'teaching and learning'),
        topic: { en: 'Examples of clear step-by-step explanations', fil: 'Mga halimbawa ng malinaw na paliwanag nang hakbang-hakbang' },
        why: {
          en: 'Watch how a lesson is explained in small steps, then note what makes it easy to follow.',
          fil: 'Panoorin kung paano ipinapaliwanag ang aralin sa maliliit na hakbang, at itala kung ano ang nagpapadali sa pag-unawa.',
        },
      },
    ],
    roadmap: [
      {
        topic: { en: 'How people learn', fil: 'Paano natututo ang tao' },
        objective: { en: 'Describe two ways learners remember and understand new ideas.', fil: 'Mailarawan ang dalawang paraan kung paano naaalala at naiintindihan ng mga mag-aaral ang bagong ideya.' },
        practice: { en: 'Teach a friend one new fact, then ask them to explain it back to you.', fil: 'Magturo sa kaibigan ng isang bagong kaalaman, saka ipaliwanag nila ito pabalik sa iyo.' },
        resources: ['dte-cc-psych', 'dte-cc-study'],
      },
      {
        topic: { en: 'Explaining ideas clearly', fil: 'Malinaw na pagpapaliwanag ng ideya' },
        objective: { en: 'Explain one idea in two different ways using an example.', fil: 'Maipaliwanag ang isang ideya sa dalawang magkaibang paraan gamit ang halimbawa.' },
        practice: { en: 'Pick a school topic and explain it in 2 minutes without reading from notes.', fil: 'Pumili ng paksa sa paaralan at ipaliwanag ito sa loob ng 2 minuto nang hindi nagbabasa ng notes.' },
        resources: ['dte-khan-explain'],
      },
      {
        topic: { en: 'Simple lesson planning', fil: 'Simpleng pagpaplano ng aralin' },
        objective: { en: 'Write a clear learning objective and a short activity for it.', fil: 'Makasulat ng malinaw na layunin sa pagkatuto at maikling gawain para dito.' },
        practice: { en: 'Draft a half-page plan: objective, activity, and one question to check understanding.', fil: 'Gumawa ng kalahating pahinang plano: layunin, gawain, at isang tanong para suriin ang pag-unawa.' },
        resources: ['dte-cc-study'],
      },
      {
        topic: { en: 'Refresh a core subject', fil: 'Balikan ang isang pangunahing asignatura' },
        objective: { en: 'Review one subject you may teach so you can explain its basics confidently.', fil: 'Balikan ang isang asignaturang maaari mong ituro upang kumpiyansa mong maipaliwanag ang mga batayan nito.' },
        practice: { en: 'Write five short questions about the topic and answer them without notes.', fil: 'Sumulat ng limang maikling tanong tungkol sa paksa at sagutin ito nang walang notes.' },
        resources: ['dte-khan-foundations'],
      },
    ],
    checklist: [
      { id: 'dte-t1', text: { en: 'Practice explaining one topic out loud in two different ways', fil: 'Magsanay magpaliwanag ng isang paksa nang malakas sa dalawang magkaibang paraan' } },
      { id: 'dte-t2', text: { en: 'Create a simple one-page lesson plan', fil: 'Gumawa ng simpleng isang-pahinang plano ng aralin' } },
      { id: 'dte-t3', text: { en: 'Help a classmate or sibling with a school task', fil: 'Tulungan ang kaklase o kapatid sa isang gawain sa paaralan' } },
      { id: 'dte-t4', text: { en: 'Watch an introductory psychology episode about learning', fil: 'Manood ng isang panimulang episode ng psychology tungkol sa pagkatuto' } },
      { id: 'dte-t5', text: { en: 'Review basic math and reading skills you may need to teach', fil: 'Balikan ang batayang math at pagbasa na maaaring kailanganin mong ituro' } },
      { id: 'dte-t6', text: { en: 'Practice speaking for two minutes in front of others', fil: 'Magsanay magsalita nang dalawang minuto sa harap ng iba' } },
      { id: 'dte-t7', text: { en: 'Write down three questions that check if learners understood', fil: 'Isulat ang tatlong tanong na sumusuri kung naintindihan ng mga mag-aaral' } },
      { id: 'dte-t8', text: { en: 'Talk to a teacher about what their day-to-day work is like', fil: 'Kausapin ang isang guro tungkol sa araw-araw nilang trabaho' } },
    ],
    skills: [
      { questionId: 1, name: { en: 'Explaining ideas in different ways', fil: 'Pagpapaliwanag ng ideya sa iba\'t ibang paraan' }, action: { en: 'Pick one topic and prepare two explanations, each with a different example.', fil: 'Pumili ng isang paksa at maghanda ng dalawang paliwanag na may magkaibang halimbawa.' } },
      { questionId: 2, name: { en: 'Patience when someone struggles', fil: 'Pasensya kapag nahihirapan ang isang tao' }, action: { en: 'Next time someone is stuck, wait, ask what they already understand, then try a new approach.', fil: 'Sa susunod na may nahihirapan, maghintay, itanong kung ano na ang naiintindihan nila, saka sumubok ng bagong paraan.' } },
      { questionId: 3, name: { en: 'Adapting how you communicate', fil: 'Pag-aangkop ng paraan ng pakikipag-usap' }, action: { en: 'Explain the same idea to a younger and an older person and notice what you change.', fil: 'Ipaliwanag ang parehong ideya sa mas bata at mas matandang tao at pansinin kung ano ang binago mo.' } },
      { questionId: 4, name: { en: 'Giving feedback that helps progress', fil: 'Pagbibigay ng feedback na nakatutulong umunlad' }, action: { en: 'When giving feedback, name one thing done well and one next step to improve.', fil: 'Sa pagbibigay ng feedback, banggitin ang isang mahusay na ginawa at isang susunod na hakbang para umunlad.' } },
      { questionId: 5, name: { en: 'Checking that a group is following', fil: 'Pagsuri kung nakakasabay ang grupo' }, action: { en: 'In your next group task, pause once and ask each member to say the main idea in one sentence.', fil: 'Sa susunod na gawaing pangkat, huminto minsan at hilingin sa bawat kasapi na sabihin ang pangunahing ideya sa isang pangungusap.' } },
    ],
    quiz: {
      title: { en: 'Teaching and learning basics', fil: 'Mga batayan ng pagtuturo at pagkatuto' },
      questions: [
        {
          q: { en: 'Which is a good way to check whether learners understood a lesson?', fil: 'Alin ang magandang paraan para suriin kung naintindihan ng mga mag-aaral ang aralin?' },
          options: [
            { en: 'Ask them to explain the idea in their own words', fil: 'Hilingin sa kanilang ipaliwanag ang ideya gamit ang sarili nilang salita' },
            { en: 'Ask only "Any questions?" and move on', fil: 'Itanong lamang ang "May tanong ba?" at magpatuloy' },
            { en: 'Assume they understood if nobody speaks', fil: 'Ipagpalagay na naintindihan nila kung walang nagsasalita' },
            { en: 'Repeat the same explanation more loudly', fil: 'Ulitin ang parehong paliwanag nang mas malakas' },
          ],
          answer: 0,
          explanation: { en: 'Explaining in their own words shows what they really understand. Silence does not always mean understanding.', fil: 'Ipinapakita ng pagpapaliwanag gamit ang sariling salita kung ano talaga ang naiintindihan nila. Hindi laging pag-unawa ang katahimikan.' },
        },
        {
          q: { en: 'A clear learning objective describes...', fil: 'Ang malinaw na layunin sa pagkatuto ay naglalarawan ng...' },
          options: [
            { en: 'What the teacher will talk about', fil: 'Kung ano ang sasabihin ng guro' },
            { en: 'What learners should be able to do by the end', fil: 'Kung ano ang dapat magawa ng mga mag-aaral sa dulo' },
            { en: 'How long the class will last', fil: 'Gaano katagal ang klase' },
            { en: 'Which book will be used', fil: 'Anong aklat ang gagamitin' },
          ],
          answer: 1,
          explanation: { en: 'Objectives focus on what learners can do, which makes it easier to plan activities and check progress.', fil: 'Nakatuon ang layunin sa kung ano ang kayang gawin ng mag-aaral, kaya mas madaling magplano ng gawain at suriin ang pag-unlad.' },
        },
        {
          q: { en: 'A learner keeps making the same mistake. What is a good first step?', fil: 'Paulit-ulit na nagkakamali ang isang mag-aaral. Ano ang magandang unang hakbang?' },
          options: [
            { en: 'Tell them to try harder', fil: 'Sabihing mas magsikap pa sila' },
            { en: 'Skip the topic', fil: 'Laktawan ang paksa' },
            { en: 'Find out why it happens and try a different explanation', fil: 'Alamin kung bakit nangyayari at subukan ang ibang paliwanag' },
            { en: 'Give the same task again with no change', fil: 'Ibigay muli ang parehong gawain nang walang pagbabago' },
          ],
          answer: 2,
          explanation: { en: 'Repeated mistakes often point to a gap in understanding. A new explanation targets that gap.', fil: 'Madalas na senyales ng kulang na pag-unawa ang paulit-ulit na pagkakamali. Natutugunan ito ng bagong paliwanag.' },
        },
        {
          q: { en: 'Which order is common in a simple lesson plan?', fil: 'Alin ang karaniwang pagkakasunod sa simpleng plano ng aralin?' },
          options: [
            { en: 'Objective, activity, check for understanding', fil: 'Layunin, gawain, pagsuri ng pag-unawa' },
            { en: 'Check for understanding, objective, activity', fil: 'Pagsuri ng pag-unawa, layunin, gawain' },
            { en: 'Activity, then decide the objective', fil: 'Gawain muna, saka pipiliin ang layunin' },
            { en: 'No order is needed', fil: 'Walang kailangang pagkakasunod' },
          ],
          answer: 0,
          explanation: { en: 'Starting from the objective keeps the activity and the check aligned with what you want learners to achieve.', fil: 'Kapag nagsimula sa layunin, nananatiling nakaayon ang gawain at pagsuri sa nais makamit ng mga mag-aaral.' },
        },
        {
          q: { en: 'Which question is open-ended and encourages thinking?', fil: 'Alin ang tanong na bukas ang sagot at nag-uudyok mag-isip?' },
          options: [
            { en: 'Is the sky blue?', fil: 'Asul ba ang langit?' },
            { en: 'Why do you think the plant grew toward the window?', fil: 'Bakit sa palagay mo lumaki ang halaman papunta sa bintana?' },
            { en: 'Is 5 greater than 3?', fil: 'Mas malaki ba ang 5 kaysa 3?' },
            { en: 'Did you finish your homework?', fil: 'Natapos mo ba ang takdang-aralin mo?' },
          ],
          answer: 1,
          explanation: { en: '"Why" questions invite learners to reason and explain instead of answering yes or no.', fil: 'Inaanyayahan ng mga tanong na "bakit" ang mag-aaral na mangatwiran at magpaliwanag sa halip na oo o hindi lang.' },
        },
      ],
    },
    projects: [
      { title: { en: 'Prepare a sample lesson plan', fil: 'Gumawa ng halimbawang plano ng aralin' }, description: { en: 'Choose a simple topic and write an objective, a 10-minute activity, and three questions to check understanding.', fil: 'Pumili ng simpleng paksa at sumulat ng layunin, 10-minutong gawain, at tatlong tanong para suriin ang pag-unawa.' } },
      { title: { en: 'Mini tutoring session', fil: 'Maikling tutoring session' }, description: { en: 'Teach a classmate or sibling a short topic for 10 minutes and ask what could be clearer.', fil: 'Magturo sa kaklase o kapatid ng maikling paksa sa loob ng 10 minuto at itanong kung ano ang maaaring mas malinaw.' } },
      { title: { en: 'Visual aid for one concept', fil: 'Visual aid para sa isang konsepto' }, description: { en: 'Make a simple poster or drawing that explains one idea for younger learners.', fil: 'Gumawa ng simpleng poster o drowing na nagpapaliwanag ng isang ideya para sa mas batang mag-aaral.' } },
    ],
    careers: [
      { en: 'Elementary or secondary school teacher', fil: 'Guro sa elementarya o sekondarya' },
      { en: 'Early childhood educator', fil: 'Tagapagturo sa maagang edukasyon' },
      { en: 'Tutor or learning-support assistant', fil: 'Tutor o tagatulong sa pagkatuto' },
      { en: 'Curriculum or education program support', fil: 'Suporta sa kurikulum o programang pang-edukasyon' },
    ],
  },

  // ---------------------------------------------------------------
  DCI: {
    resources: [
      {
        id: 'dci-fcc-web',
        channel: 'freecodecamp',
        kind: 'search',
        url: searchUrl('freecodecamp', 'html css full course'),
        topic: { en: 'HTML and CSS for beginners', fil: 'HTML at CSS para sa mga baguhan' },
        why: {
          en: 'Building a simple webpage is a friendly first project and shows how websites are structured and styled.',
          fil: 'Ang paggawa ng simpleng webpage ay magandang unang proyekto at nagpapakita kung paano binubuo at inaayos ang itsura ng website.',
        },
      },
      {
        id: 'dci-fcc-python',
        channel: 'freecodecamp',
        kind: 'search',
        url: searchUrl('freecodecamp', 'python for beginners'),
        topic: { en: 'Programming fundamentals with Python', fil: 'Mga batayan ng programming gamit ang Python' },
        why: {
          en: 'Variables, conditions and loops appear in almost every language. Python keeps the syntax readable for beginners.',
          fil: 'Lumilitaw ang variables, conditions at loops sa halos lahat ng wika. Madaling basahin ang syntax ng Python para sa mga baguhan.',
        },
      },
      {
        id: 'dci-fire-100',
        channel: 'fireship',
        kind: 'search',
        url: searchUrl('fireship', '100 seconds of code'),
        topic: { en: '"100 Seconds of Code" quick concept overviews', fil: 'Maiikling paliwanag ng konsepto: "100 Seconds of Code"' },
        why: {
          en: 'Short overviews of tools and concepts help you learn the vocabulary of computing. Fast-paced, so pause and replay.',
          fil: 'Ang maiikling paliwanag ng mga tool at konsepto ay tumutulong matutunan ang bokabularyo ng computing. Mabilis ito, kaya mag-pause at ulitin.',
        },
      },
      {
        id: 'dci-doji',
        channel: 'dojicreates',
        kind: 'channel',
        url: channelUrl('dojicreates'),
        topic: { en: 'Programming tutorials in Tagalog', fil: 'Mga tutorial sa programming sa Tagalog' },
        why: {
          en: 'A Filipino creator who explains programming basics in Tagalog, useful if you learn better in Filipino.',
          fil: 'Isang Pilipinong creator na nagpapaliwanag ng batayan ng programming sa Tagalog, kapaki-pakinabang kung mas madali kang matuto sa Filipino.',
        },
      },
    ],
    roadmap: [
      {
        topic: { en: 'How computers follow instructions', fil: 'Paano sumusunod ang computer sa mga instruksyon' },
        objective: { en: 'Explain what a program, a variable and an instruction are.', fil: 'Maipaliwanag kung ano ang program, variable, at instruksyon.' },
        practice: { en: 'Write the steps for making instant noodles as exact instructions a computer could follow.', fil: 'Isulat ang mga hakbang sa pagluto ng instant noodles bilang eksaktong instruksyong masusunod ng computer.' },
        resources: ['dci-fire-100', 'dci-doji'],
      },
      {
        topic: { en: 'Conditions and loops', fil: 'Mga condition at loop' },
        objective: { en: 'Use "if" and a loop in a tiny program.', fil: 'Makagamit ng "if" at loop sa maliit na program.' },
        practice: { en: 'Write a program that prints the numbers 1 to 10 and says which ones are even.', fil: 'Gumawa ng program na nagpi-print ng numerong 1 hanggang 10 at nagsasabi kung alin ang even.' },
        resources: ['dci-fcc-python', 'dci-doji'],
      },
      {
        topic: { en: 'Your first webpage', fil: 'Ang una mong webpage' },
        objective: { en: 'Create a page with a heading, paragraph, list and an image using HTML.', fil: 'Gumawa ng pahina na may heading, talata, listahan, at larawan gamit ang HTML.' },
        practice: { en: 'Build a one-page "About me" site and open it in your browser.', fil: 'Gumawa ng isang-pahinang "About me" na site at buksan ito sa browser.' },
        resources: ['dci-fcc-web'],
      },
      {
        topic: { en: 'Fixing problems (debugging)', fil: 'Pag-aayos ng problema (debugging)' },
        objective: { en: 'Find and fix a bug by changing one thing at a time.', fil: 'Makahanap at makaayos ng bug sa pamamagitan ng pagbabago ng isang bagay sa bawat pagkakataon.' },
        practice: { en: 'Break your webpage or program on purpose, then fix it and note what the error message said.', fil: 'Sadyang sirain ang iyong webpage o program, saka ayusin ito at itala kung ano ang sinabi ng error message.' },
        resources: ['dci-fcc-python', 'dci-fire-100'],
      },
    ],
    checklist: [
      { id: 'dci-t1', text: { en: 'Learn basic programming concepts (variables, conditions, loops)', fil: 'Pag-aralan ang batayang konsepto ng programming (variables, conditions, loops)' } },
      { id: 'dci-t2', text: { en: 'Write and run a first small program', fil: 'Sumulat at magpatakbo ng una mong maliit na program' } },
      { id: 'dci-t3', text: { en: 'Create a simple webpage with HTML', fil: 'Gumawa ng simpleng webpage gamit ang HTML' } },
      { id: 'dci-t4', text: { en: 'Practice breaking a problem into smaller steps on paper', fil: 'Magsanay hatiin ang problema sa mas maliliit na hakbang sa papel' } },
      { id: 'dci-t5', text: { en: 'Get comfortable with files and folders on a computer', fil: 'Maging komportable sa files at folders sa computer' } },
      { id: 'dci-t6', text: { en: 'Fix one bug and write down what caused it', fil: 'Ayusin ang isang bug at isulat kung ano ang sanhi nito' } },
      { id: 'dci-t7', text: { en: 'Review basic math such as fractions, percentages and simple algebra', fil: 'Balikan ang batayang math tulad ng fraction, porsiyento, at simpleng algebra' } },
      { id: 'dci-t8', text: { en: 'Practice searching for and reading technical explanations', fil: 'Magsanay maghanap at magbasa ng teknikal na paliwanag' } },
    ],
    skills: [
      { questionId: 6, name: { en: 'Understanding why something fails', fil: 'Pag-unawa kung bakit pumapalya ang isang bagay' }, action: { en: 'When something breaks, write what you expected, what happened, and one possible cause before changing anything.', fil: 'Kapag may nasira, isulat kung ano ang inaasahan mo, ano ang nangyari, at isang posibleng sanhi bago magbago ng anuman.' } },
      { questionId: 7, name: { en: 'Breaking big tasks into small steps', fil: 'Paghahati ng malaking gawain sa maliliit na hakbang' }, action: { en: 'Take one school project and list it as five small steps before you start.', fil: 'Kumuha ng isang proyekto sa paaralan at ilista ito bilang limang maliliit na hakbang bago magsimula.' } },
      { questionId: 8, name: { en: 'Noticing patterns', fil: 'Pagpansin sa mga pattern' }, action: { en: 'Try pattern puzzles or look for repeated parts in a short piece of code.', fil: 'Subukan ang pattern puzzles o hanapin ang paulit-ulit na bahagi sa maikling code.' } },
      { questionId: 9, name: { en: 'Testing one change at a time', fil: 'Pagsubok ng isang pagbabago sa bawat pagkakataon' }, action: { en: 'When fixing a problem, change one thing, test it, and record the result before the next change.', fil: 'Sa pag-aayos ng problema, magbago ng isang bagay, subukan, at itala ang resulta bago ang susunod na pagbabago.' } },
      { questionId: 10, name: { en: 'Investigating unexpected results', fil: 'Pag-iimbestiga sa hindi inaasahang resulta' }, action: { en: 'Pick a surprising result and find at least two possible explanations before accepting it.', fil: 'Pumili ng nakakagulat na resulta at humanap ng hindi bababa sa dalawang posibleng paliwanag bago ito tanggapin.' } },
    ],
    quiz: {
      title: { en: 'Programming basics', fil: 'Mga batayan ng programming' },
      questions: [
        {
          q: { en: 'What is a variable in programming?', fil: 'Ano ang variable sa programming?' },
          options: [
            { en: 'A named place that stores a value', fil: 'Isang may-pangalang lalagyan ng halaga' },
            { en: 'A type of computer', fil: 'Isang uri ng computer' },
            { en: 'An error message', fil: 'Isang error message' },
            { en: 'A website address', fil: 'Isang address ng website' },
          ],
          answer: 0,
          explanation: { en: 'A variable has a name and holds a value, such as age = 17, that your program can use and change.', fil: 'May pangalan ang variable at may hawak na halaga, tulad ng age = 17, na magagamit at mababago ng program mo.' },
        },
        {
          q: { en: 'What does a loop do?', fil: 'Ano ang ginagawa ng loop?' },
          options: [
            { en: 'Deletes your program', fil: 'Binubura ang program mo' },
            { en: 'Repeats instructions', fil: 'Inuulit ang mga instruksyon' },
            { en: 'Makes the screen brighter', fil: 'Pinaliliwanag ang screen' },
            { en: 'Connects to the internet', fil: 'Kumokonekta sa internet' },
          ],
          answer: 1,
          explanation: { en: 'A loop repeats a set of instructions, for example printing the numbers 1 to 10 without writing ten lines.', fil: 'Inuulit ng loop ang isang grupo ng instruksyon, halimbawa ang pag-print ng 1 hanggang 10 nang hindi sumusulat ng sampung linya.' },
        },
        {
          q: { en: 'What is HTML mainly used for?', fil: 'Para saan pangunahing ginagamit ang HTML?' },
          options: [
            { en: 'Styling colors only', fil: 'Pagkulay lamang' },
            { en: 'Storing large databases', fil: 'Pag-iimbak ng malalaking database' },
            { en: 'Describing the structure and content of a webpage', fil: 'Paglalarawan ng istruktura at nilalaman ng webpage' },
            { en: 'Playing music', fil: 'Pagpapatugtog ng musika' },
          ],
          answer: 2,
          explanation: { en: 'HTML marks up headings, paragraphs, lists and images. CSS is usually used to style them.', fil: 'Minamarkahan ng HTML ang heading, talata, listahan, at larawan. Karaniwang CSS ang ginagamit para sa itsura.' },
        },
        {
          q: { en: 'What is debugging?', fil: 'Ano ang debugging?' },
          options: [
            { en: 'Finding and fixing errors in a program', fil: 'Paghahanap at pag-aayos ng mali sa program' },
            { en: 'Writing a program faster', fil: 'Mas mabilis na pagsulat ng program' },
            { en: 'Installing a new keyboard', fil: 'Pag-install ng bagong keyboard' },
            { en: 'Copying someone else\'s code', fil: 'Pagkopya ng code ng iba' },
          ],
          answer: 0,
          explanation: { en: 'Debugging means finding why a program misbehaves and fixing it, often by testing one change at a time.', fil: 'Ang debugging ay paghahanap kung bakit hindi tama ang takbo ng program at pag-aayos nito, madalas sa pagsubok ng isang pagbabago sa bawat pagkakataon.' },
        },
        {
          q: { en: 'What does an "if" statement do?', fil: 'Ano ang ginagawa ng "if" statement?' },
          options: [
            { en: 'Runs code only when a condition is true', fil: 'Pinapatakbo ang code kapag totoo lamang ang kondisyon' },
            { en: 'Always runs the code', fil: 'Palaging pinapatakbo ang code' },
            { en: 'Stops the computer', fil: 'Pinahihinto ang computer' },
            { en: 'Saves the file', fil: 'Sine-save ang file' },
          ],
          answer: 0,
          explanation: { en: 'An "if" lets a program make decisions, like showing "adult" only if age is 18 or more.', fil: 'Pinapayagan ng "if" ang program na magpasya, tulad ng pagpapakita ng "adult" kung 18 pataas lamang ang edad.' },
        },
      ],
    },
    projects: [
      { title: { en: 'Create a simple webpage', fil: 'Gumawa ng simpleng webpage' }, description: { en: 'Build an "About me" page with a heading, a list of hobbies and one image using HTML.', fil: 'Gumawa ng "About me" na pahina na may heading, listahan ng hilig, at isang larawan gamit ang HTML.' } },
      { title: { en: 'Number guessing game', fil: 'Larong paghula ng numero' }, description: { en: 'Write a small program that picks a number and tells the player "higher" or "lower".', fil: 'Gumawa ng maliit na program na pumipili ng numero at nagsasabing "mas mataas" o "mas mababa" sa manlalaro.' } },
      { title: { en: 'Simple budget or grade calculator', fil: 'Simpleng calculator ng budget o grado' }, description: { en: 'Create a tiny tool that adds numbers and shows a total or an average.', fil: 'Gumawa ng maliit na tool na nagdadagdag ng numero at nagpapakita ng kabuuan o average.' } },
    ],
    careers: [
      { en: 'Software or web developer', fil: 'Software o web developer' },
      { en: 'IT support or systems technician', fil: 'IT support o systems technician' },
      { en: 'Network or database administrator', fil: 'Network o database administrator' },
      { en: 'Data or quality-assurance roles', fil: 'Mga tungkulin sa data o quality assurance' },
    ],
  },

  // ---------------------------------------------------------------
  DBA: {
    resources: [
      {
        id: 'dba-khan-acct',
        channel: 'khan',
        kind: 'search',
        url: searchUrl('khan', 'accounting'),
        topic: { en: 'Basic accounting and financial statements', fil: 'Batayang accounting at financial statements' },
        why: {
          en: 'Accounting is the language of business. Start with what assets, liabilities and income mean.',
          fil: 'Ang accounting ang wika ng negosyo. Magsimula sa kahulugan ng assets, liabilities, at kita.',
        },
      },
      {
        id: 'dba-cc-econ',
        channel: 'crashcourse',
        kind: 'playlist',
        url: CC_ECONOMICS,
        topic: { en: 'Economics playlist', fil: 'Economics playlist' },
        why: {
          en: 'Introduces scarcity, supply and demand and decision-making, which connect to budgeting and business choices.',
          fil: 'Ipinakikilala ang scarcity, supply at demand, at paggawa ng desisyon, na may kaugnayan sa pagba-budget at pagpili sa negosyo.',
        },
      },
      {
        id: 'dba-cc-biz',
        channel: 'crashcourse',
        kind: 'search',
        url: searchUrl('crashcourse', 'business entrepreneurship'),
        topic: { en: 'Business and entrepreneurship basics', fil: 'Batayan ng negosyo at entrepreneurship' },
        why: {
          en: 'A beginner-friendly look at how businesses start, operate and communicate.',
          fil: 'Madaling unawaing pagtingin kung paano nagsisimula, tumatakbo, at nakikipag-ugnayan ang mga negosyo.',
        },
      },
      {
        id: 'dba-khan-finance',
        channel: 'khan',
        kind: 'search',
        url: searchUrl('khan', 'personal finance budgeting'),
        topic: { en: 'Budgeting and personal finance', fil: 'Pagba-budget at personal na pananalapi' },
        why: {
          en: 'Managing limited money is a core skill. Practice with simple budgets before more advanced topics.',
          fil: 'Pangunahing kasanayan ang pamamahala ng limitadong pera. Magsanay sa simpleng budget bago ang mas mataas na paksa.',
        },
      },
    ],
    roadmap: [
      {
        topic: { en: 'Budgeting basics', fil: 'Batayan ng pagba-budget' },
        objective: { en: 'Separate income, needs, wants and savings in a simple budget.', fil: 'Mapaghiwalay ang kita, pangangailangan, kagustuhan, at ipon sa simpleng budget.' },
        practice: { en: 'List your allowance or income and expenses for one week and compare them.', fil: 'Ilista ang baon o kita at gastos mo sa loob ng isang linggo at ihambing ang mga ito.' },
        resources: ['dba-khan-finance'],
      },
      {
        topic: { en: 'Basic accounting terms', fil: 'Batayang termino sa accounting' },
        objective: { en: 'Explain assets, liabilities, income and expenses with examples.', fil: 'Maipaliwanag ang assets, liabilities, kita, at gastos gamit ang halimbawa.' },
        practice: { en: 'Pick a small store and sort five of its items into assets, liabilities, income or expenses.', fil: 'Pumili ng maliit na tindahan at ayusin ang limang bagay nito bilang assets, liabilities, kita, o gastos.' },
        resources: ['dba-khan-acct'],
      },
      {
        topic: { en: 'Scarcity, choices and trade-offs', fil: 'Scarcity, pagpili, at trade-off' },
        objective: { en: 'Describe opportunity cost using a real decision you made.', fil: 'Mailarawan ang opportunity cost gamit ang totoong desisyon mo.' },
        practice: { en: 'Write one choice you made recently, what you gave up, and whether you would choose again.', fil: 'Isulat ang isang pinili mo kamakailan, ano ang isinuko mo, at kung pipiliin mo ba itong muli.' },
        resources: ['dba-cc-econ'],
      },
      {
        topic: { en: 'How a small business works', fil: 'Paano gumagana ang maliit na negosyo' },
        objective: { en: 'Describe how a simple business earns money and what it must spend.', fil: 'Mailarawan kung paano kumikita ang simpleng negosyo at ano ang kailangan nitong gastusin.' },
        practice: { en: 'Plan a mini sale: cost per item, selling price, and expected profit.', fil: 'Magplano ng mini sale: halaga bawat item, presyo ng benta, at inaasahang tubo.' },
        resources: ['dba-cc-biz'],
      },
    ],
    checklist: [
      { id: 'dba-t1', text: { en: 'Review basic accounting and budgeting', fil: 'Balikan ang batayang accounting at pagba-budget' } },
      { id: 'dba-t2', text: { en: 'Track your own income and spending for one week', fil: 'Subaybayan ang sarili mong kita at gastos sa loob ng isang linggo' } },
      { id: 'dba-t3', text: { en: 'Learn the difference between assets, liabilities and equity', fil: 'Alamin ang pagkakaiba ng assets, liabilities, at equity' } },
      { id: 'dba-t4', text: { en: 'Practice percentages, averages and basic arithmetic', fil: 'Magsanay sa porsiyento, average, at batayang aritmetika' } },
      { id: 'dba-t5', text: { en: 'Plan a small event or sale with a limited budget', fil: 'Magplano ng maliit na event o bentahan na may limitadong budget' } },
      { id: 'dba-t6', text: { en: 'Learn to use a spreadsheet for simple totals', fil: 'Matutong gumamit ng spreadsheet para sa simpleng kabuuan' } },
      { id: 'dba-t7', text: { en: 'Read a short article about how a local business started', fil: 'Magbasa ng maikling artikulo kung paano nagsimula ang isang lokal na negosyo' } },
      { id: 'dba-t8', text: { en: 'Practice presenting a plan clearly in two minutes', fil: 'Magsanay iharap nang malinaw ang isang plano sa loob ng dalawang minuto' } },
    ],
    skills: [
      { questionId: 11, name: { en: 'Using limited resources wisely', fil: 'Matalinong paggamit ng limitadong mapagkukunan' }, action: { en: 'Make a one-week plan for a small amount of money or time and note what you gave up.', fil: 'Gumawa ng plano para sa isang linggo gamit ang maliit na halaga ng pera o oras at itala ang isinuko mo.' } },
      { questionId: 12, name: { en: 'Organizing tasks and schedules', fil: 'Pag-oorganisa ng gawain at iskedyul' }, action: { en: 'List this week\'s tasks with deadlines and order them by what is due first.', fil: 'Ilista ang mga gawain ngayong linggo kasama ang deadline at ayusin ayon sa unang itatakda.' } },
      { questionId: 13, name: { en: 'Deciding with incomplete information', fil: 'Pagpapasya kahit kulang ang impormasyon' }, action: { en: 'Practice listing what you know, what you assume, and your decision with a reason.', fil: 'Magsanay ilista ang alam mo, ang ipinapalagay mo, at ang desisyon mo kasama ang dahilan.' } },
      { questionId: 14, name: { en: 'Planning and coordination', fil: 'Pagpaplano at koordinasyon' }, action: { en: 'In a group task, write who does what, by when, and one thing that could go wrong.', fil: 'Sa gawaing pangkat, isulat kung sino ang gagawa ng ano, kailan, at isang posibleng magkamali.' } },
      { questionId: 15, name: { en: 'Weighing trade-offs', fil: 'Pagtitimbang ng trade-off' }, action: { en: 'Before a choice, list one benefit and one cost of each option side by side.', fil: 'Bago pumili, ilista ang isang benepisyo at isang kapalit ng bawat opsyon nang magkatabi.' } },
    ],
    quiz: {
      title: { en: 'Accounting and budgeting basics', fil: 'Mga batayan ng accounting at pagba-budget' },
      questions: [
        {
          q: { en: 'What is a budget?', fil: 'Ano ang budget?' },
          options: [
            { en: 'A plan for expected income and spending', fil: 'Plano para sa inaasahang kita at gastos' },
            { en: 'A receipt from a store', fil: 'Resibo mula sa tindahan' },
            { en: 'A type of loan', fil: 'Isang uri ng utang' },
            { en: 'A bank account number', fil: 'Numero ng bank account' },
          ],
          answer: 0,
          explanation: { en: 'A budget plans how money will be earned and used so you can avoid overspending.', fil: 'Pinaplano ng budget kung paano kikitain at gagamitin ang pera para maiwasan ang labis na paggastos.' },
        },
        {
          q: { en: 'Which shows the basic accounting equation?', fil: 'Alin ang nagpapakita ng batayang accounting equation?' },
          options: [
            { en: 'Assets = Liabilities + Equity', fil: 'Assets = Liabilities + Equity' },
            { en: 'Assets = Income - Taxes', fil: 'Assets = Income - Taxes' },
            { en: 'Equity = Liabilities x Assets', fil: 'Equity = Liabilities x Assets' },
            { en: 'Liabilities = Assets + Equity', fil: 'Liabilities = Assets + Equity' },
          ],
          answer: 0,
          explanation: { en: 'What a business owns (assets) is funded by what it owes (liabilities) plus the owners\' stake (equity).', fil: 'Ang pag-aari ng negosyo (assets) ay pinopondohan ng utang nito (liabilities) at ng bahagi ng may-ari (equity).' },
        },
        {
          q: { en: 'Which of these is an expense for a small shop?', fil: 'Alin dito ang gastos ng maliit na tindahan?' },
          options: [
            { en: 'Money received from customers', fil: 'Perang natanggap mula sa mga customer' },
            { en: 'Paying the monthly electricity bill', fil: 'Pagbabayad ng buwanang kuryente' },
            { en: 'Money the owner puts in to start', fil: 'Perang inilagay ng may-ari para magsimula' },
            { en: 'A loan received from a bank', fil: 'Utang na natanggap mula sa bangko' },
          ],
          answer: 1,
          explanation: { en: 'Expenses are costs of running the business, such as utilities, rent and supplies.', fil: 'Ang gastos ay halagang ginugugol sa pagpapatakbo ng negosyo, tulad ng kuryente, upa, at suplay.' },
        },
        {
          q: { en: 'What is opportunity cost?', fil: 'Ano ang opportunity cost?' },
          options: [
            { en: 'The price tag of an item', fil: 'Presyo ng isang bagay' },
            { en: 'The tax on a purchase', fil: 'Buwis sa binili' },
            { en: 'The value of the next best choice you give up', fil: 'Halaga ng susunod na pinakamagandang pagpipilian na isinuko mo' },
            { en: 'Money saved in a bank', fil: 'Perang naka-ipon sa bangko' },
          ],
          answer: 2,
          explanation: { en: 'Choosing one option means giving up the next best one. That lost value is the opportunity cost.', fil: 'Ang pagpili ng isang opsyon ay pagsuko sa susunod na pinakamainam. Iyon ang opportunity cost.' },
        },
        {
          q: { en: 'A shop earns 5,000 pesos in sales and spends 3,500 pesos. What is the profit?', fil: 'Kumita ang tindahan ng 5,000 piso sa benta at gumastos ng 3,500 piso. Magkano ang tubo?' },
          options: [
            { en: '1,500 pesos', fil: '1,500 piso' },
            { en: '8,500 pesos', fil: '8,500 piso' },
            { en: '3,500 pesos', fil: '3,500 piso' },
            { en: '5,000 pesos', fil: '5,000 piso' },
          ],
          answer: 0,
          explanation: { en: 'Profit = revenue - expenses = 5,000 - 3,500 = 1,500 pesos.', fil: 'Tubo = kita sa benta - gastos = 5,000 - 3,500 = 1,500 piso.' },
        },
      ],
    },
    projects: [
      { title: { en: 'Create a basic budget spreadsheet', fil: 'Gumawa ng batayang budget spreadsheet' }, description: { en: 'List a month of income and expenses in a spreadsheet and add totals with a simple formula.', fil: 'Ilista ang kita at gastos sa isang buwan sa spreadsheet at magdagdag ng kabuuan gamit ang simpleng formula.' } },
      { title: { en: 'Mini business plan', fil: 'Mini business plan' }, description: { en: 'Pick a small product, estimate costs and prices, and calculate expected profit for 20 sales.', fil: 'Pumili ng maliit na produkto, tantiyahin ang gastos at presyo, at kalkulahin ang inaasahang tubo sa 20 benta.' } },
      { title: { en: 'Event plan with a limited budget', fil: 'Plano ng event na may limitadong budget' }, description: { en: 'Plan a class activity with a fixed budget, compare two options, and explain your choice.', fil: 'Magplano ng gawain sa klase na may takdang budget, ihambing ang dalawang opsyon, at ipaliwanag ang pinili mo.' } },
    ],
    careers: [
      { en: 'Accountant or bookkeeper', fil: 'Accountant o bookkeeper' },
      { en: 'Banking or finance staff', fil: 'Kawani sa bangko o pananalapi' },
      { en: 'Business owner or entrepreneur', fil: 'May-ari ng negosyo o entrepreneur' },
      { en: 'Business operations or marketing roles', fil: 'Mga tungkulin sa operasyon o marketing ng negosyo' },
    ],
  },

  // ---------------------------------------------------------------
  DAS: {
    resources: [
      {
        id: 'das-cc-psych',
        channel: 'crashcourse',
        kind: 'playlist',
        url: CC_PSYCHOLOGY,
        topic: { en: 'Psychology playlist (introductory)', fil: 'Psychology playlist (panimula)' },
        why: {
          en: 'A beginner-friendly overview of how psychologists study behavior and the mind, from the basics onward.',
          fil: 'Madaling unawaing pangkalahatang-tanaw kung paano pinag-aaralan ng mga psychologist ang pag-uugali at isipan, mula sa mga batayan.',
        },
      },
      {
        id: 'das-cc-stats',
        channel: 'crashcourse',
        kind: 'playlist',
        url: CC_STATISTICS,
        topic: { en: 'Statistics playlist', fil: 'Statistics playlist' },
        why: {
          en: 'Research in psychology and science uses data. This introduces averages, samples and how to read results carefully.',
          fil: 'Gumagamit ng datos ang pananaliksik sa psychology at agham. Ipinakikilala nito ang average, sample, at maingat na pagbasa ng resulta.',
        },
      },
      {
        id: 'das-khan-psych',
        channel: 'khan',
        kind: 'search',
        url: searchUrl('khan', 'psychology'),
        topic: { en: 'Psychology topics from Khan Academy', fil: 'Mga paksa sa psychology mula sa Khan Academy' },
        why: {
          en: 'Short lessons you can use to review one idea at a time after the longer series.',
          fil: 'Maiikling aralin na magagamit para balikan ang isang ideya sa bawat pagkakataon pagkatapos ng mas mahabang serye.',
        },
      },
      {
        id: 'das-khan-stats',
        channel: 'khan',
        kind: 'search',
        url: searchUrl('khan', 'statistics and probability'),
        topic: { en: 'Statistics and probability fundamentals', fil: 'Mga batayan ng statistics at probability' },
        why: {
          en: 'Builds comfort with numbers and charts, useful for understanding studies and for critical thinking.',
          fil: 'Nagpapalakas ng ginhawa sa numero at tsart, kapaki-pakinabang sa pag-unawa ng pag-aaral at kritikal na pag-iisip.',
        },
      },
    ],
    roadmap: [
      {
        topic: { en: 'What psychology studies', fil: 'Ano ang pinag-aaralan ng psychology' },
        objective: { en: 'Explain psychology as the study of behavior and mental processes.', fil: 'Maipaliwanag ang psychology bilang pag-aaral ng pag-uugali at proseso ng isip.' },
        practice: { en: 'Write three everyday behaviors you notice and one question about why they happen.', fil: 'Isulat ang tatlong pang-araw-araw na kilos na napansin mo at isang tanong kung bakit ito nangyayari.' },
        resources: ['das-cc-psych'],
      },
      {
        topic: { en: 'Observation and research questions', fil: 'Obserbasyon at mga tanong sa pananaliksik' },
        objective: { en: 'Tell an observation from an opinion and write a clear research question.', fil: 'Mapagkaiba ang obserbasyon sa opinyon at makasulat ng malinaw na tanong sa pananaliksik.' },
        practice: { en: 'Observe a public place for 10 minutes and record only what you can see and hear.', fil: 'Obserbahan ang isang pampublikong lugar sa loob ng 10 minuto at itala lamang ang nakikita at naririnig mo.' },
        resources: ['das-cc-psych', 'das-khan-psych'],
      },
      {
        topic: { en: 'Numbers and data basics', fil: 'Batayan ng numero at datos' },
        objective: { en: 'Compute an average and read a simple chart.', fil: 'Makakwenta ng average at makabasa ng simpleng tsart.' },
        practice: { en: 'Ask 10 classmates a yes/no question, count the answers, and make a small bar chart.', fil: 'Magtanong sa 10 kaklase ng oo/hindi na tanong, bilangin ang sagot, at gumawa ng maliit na bar chart.' },
        resources: ['das-cc-stats', 'das-khan-stats'],
      },
      {
        topic: { en: 'Thinking critically about claims', fil: 'Kritikal na pag-iisip sa mga pahayag' },
        objective: { en: 'Explain why two things happening together may not mean one causes the other.', fil: 'Maipaliwanag kung bakit hindi laging ang magkasabay na pangyayari ay nangangahulugang may sanhi ang isa sa isa.' },
        practice: { en: 'Find a news or social media claim and write what evidence would be needed to trust it.', fil: 'Maghanap ng pahayag sa balita o social media at isulat kung anong ebidensya ang kailangan para pagkatiwalaan ito.' },
        resources: ['das-cc-stats', 'das-cc-psych'],
      },
    ],
    checklist: [
      { id: 'das-t1', text: { en: 'Review introductory psychology and research concepts', fil: 'Balikan ang panimulang psychology at mga konsepto ng pananaliksik' } },
      { id: 'das-t2', text: { en: 'Write a simple research question about everyday behavior', fil: 'Sumulat ng simpleng tanong sa pananaliksik tungkol sa pang-araw-araw na kilos' } },
      { id: 'das-t3', text: { en: 'Do a 10-minute observation and record only facts', fil: 'Gumawa ng 10-minutong obserbasyon at itala lamang ang katotohanan' } },
      { id: 'das-t4', text: { en: 'Learn to compute an average and read a bar chart', fil: 'Matutong magkwenta ng average at magbasa ng bar chart' } },
      { id: 'das-t5', text: { en: 'Practice listening to someone without interrupting', fil: 'Magsanay makinig sa isang tao nang hindi sumisingit' } },
      { id: 'das-t6', text: { en: 'Read a short article and note one claim and its evidence', fil: 'Magbasa ng maikling artikulo at itala ang isang pahayag at ang ebidensya nito' } },
      { id: 'das-t7', text: { en: 'Write a one-page reflection on a recent disagreement or misunderstanding', fil: 'Sumulat ng isang-pahinang repleksyon tungkol sa kamakailang hindi pagkakaunawaan' } },
      { id: 'das-t8', text: { en: 'Practice writing a clear paragraph that explains your reasoning', fil: 'Magsanay sumulat ng malinaw na talata na nagpapaliwanag ng iyong katwiran' } },
    ],
    skills: [
      { questionId: 16, name: { en: 'Observing how people react', fil: 'Pagmamasid sa reaksyon ng mga tao' }, action: { en: 'Watch a group situation and note, without judging, how different people reacted.', fil: 'Magmasid sa isang sitwasyong pangkat at itala, nang walang paghuhusga, kung paano tumugon ang iba\'t ibang tao.' } },
      { questionId: 17, name: { en: 'Seeing more than one perspective', fil: 'Pagtingin sa higit sa isang pananaw' }, action: { en: 'Before forming an opinion, write the situation from two different people\'s points of view.', fil: 'Bago bumuo ng opinyon, isulat ang sitwasyon mula sa pananaw ng dalawang magkaibang tao.' } },
      { questionId: 18, name: { en: 'Asking why people respond differently', fil: 'Pagtatanong kung bakit magkaiba ang tugon ng mga tao' }, action: { en: 'Pick one event and list three possible reasons people reacted differently.', fil: 'Pumili ng isang pangyayari at ilista ang tatlong posibleng dahilan kung bakit magkaiba ang naging tugon ng mga tao.' } },
      { questionId: 19, name: { en: 'Noticing what influences behavior', fil: 'Pagpansin sa nakaaapekto sa pag-uugali' }, action: { en: 'Notice a friend\'s mood and write what in their day may be influencing it, besides what they said.', fil: 'Pansinin ang mood ng kaibigan at isulat kung ano sa araw nila ang maaaring nakaaapekto rito, bukod sa sinabi nila.' } },
      { questionId: 20, name: { en: 'Reflecting on what caused a disagreement', fil: 'Pagninilay sa sanhi ng hindi pagkakaunawaan' }, action: { en: 'After a disagreement, write what happened, what each side wanted, and what you would do differently.', fil: 'Pagkatapos ng hindi pagkakaunawaan, isulat ang nangyari, ang nais ng bawat panig, at ang gagawin mong naiiba.' } },
    ],
    quiz: {
      title: { en: 'Psychology and research basics', fil: 'Mga batayan ng psychology at pananaliksik' },
      questions: [
        {
          q: { en: 'Psychology is best described as...', fil: 'Ang psychology ay pinakamainam na ilarawan bilang...' },
          options: [
            { en: 'The scientific study of behavior and mental processes', fil: 'Siyentipikong pag-aaral ng pag-uugali at proseso ng isip' },
            { en: 'Guessing what people think', fil: 'Paghula sa iniisip ng tao' },
            { en: 'Only the study of mental illness', fil: 'Pag-aaral lamang ng sakit sa pag-iisip' },
            { en: 'A type of medicine', fil: 'Isang uri ng gamot' },
          ],
          answer: 0,
          explanation: { en: 'Psychology uses evidence to study how people behave, think and feel, not only illness.', fil: 'Gumagamit ang psychology ng ebidensya para pag-aralan kung paano kumikilos, nag-iisip, at nakararamdam ang tao, hindi lang sakit.' },
        },
        {
          q: { en: 'Which is a good research question?', fil: 'Alin ang magandang tanong sa pananaliksik?' },
          options: [
            { en: 'Is everyone happy?', fil: 'Masaya ba ang lahat?' },
            { en: 'Do students who sleep 8 hours score higher on a short quiz than those who sleep 5?', fil: 'Mas mataas ba ang iskor sa maikling quiz ng mga estudyanteng natutulog ng 8 oras kaysa sa 5 oras?' },
            { en: 'What is the meaning of life?', fil: 'Ano ang kahulugan ng buhay?' },
            { en: 'Why is psychology good?', fil: 'Bakit mabuti ang psychology?' },
          ],
          answer: 1,
          explanation: { en: 'A good research question is specific and can be answered by collecting data.', fil: 'Ang magandang tanong sa pananaliksik ay tiyak at masasagot sa pamamagitan ng pangangalap ng datos.' },
        },
        {
          q: { en: 'Which is an observation, not an opinion?', fil: 'Alin ang obserbasyon, hindi opinyon?' },
          options: [
            { en: 'He was rude.', fil: 'Bastos siya.' },
            { en: 'She hates group work.', fil: 'Kinaiinisan niya ang gawaing pangkat.' },
            { en: 'He raised his voice and crossed his arms.', fil: 'Tumaas ang boses niya at tinawid niya ang kanyang mga braso.' },
            { en: 'They are lazy.', fil: 'Tamad sila.' },
          ],
          answer: 2,
          explanation: { en: 'An observation describes what can be seen or heard. Words like "rude" or "lazy" are judgments.', fil: 'Inilalarawan ng obserbasyon ang nakikita o naririnig. Ang mga salitang "bastos" o "tamad" ay paghuhusga.' },
        },
        {
          q: { en: 'What is the average (mean) of 2, 4 and 6?', fil: 'Ano ang average (mean) ng 2, 4, at 6?' },
          options: [
            { en: '4', fil: '4' },
            { en: '6', fil: '6' },
            { en: '12', fil: '12' },
            { en: '3', fil: '3' },
          ],
          answer: 0,
          explanation: { en: 'Add the numbers (2 + 4 + 6 = 12) and divide by how many there are (3). 12 / 3 = 4.', fil: 'Idagdag ang mga numero (2 + 4 + 6 = 12) at hatiin sa dami nito (3). 12 / 3 = 4.' },
        },
        {
          q: { en: 'Two things happen together. What can we safely say?', fil: 'Magkasabay na nangyayari ang dalawang bagay. Ano ang ligtas nating masasabi?' },
          options: [
            { en: 'One definitely causes the other', fil: 'Tiyak na sanhi ng isa ang isa pa' },
            { en: 'They may be related, but more evidence is needed to show a cause', fil: 'Maaaring magkaugnay ang mga ito, ngunit kailangan pa ng ebidensya para ipakita ang sanhi' },
            { en: 'They are unrelated', fil: 'Hindi sila magkaugnay' },
            { en: 'The data must be wrong', fil: 'Tiyak na mali ang datos' },
          ],
          answer: 1,
          explanation: { en: 'Correlation shows a relationship, not a cause. Other factors may explain both.', fil: 'Ipinapakita ng ugnayan na may relasyon, hindi sanhi. Maaaring ibang salik ang nagpapaliwanag sa dalawa.' },
        },
      ],
    },
    projects: [
      { title: { en: 'Observation exercise', fil: 'Ehersisyo sa obserbasyon' }, description: { en: 'Observe one place for 10 minutes, record only what you see and hear, then write two questions it raised.', fil: 'Obserbahan ang isang lugar sa loob ng 10 minuto, itala lamang ang nakikita at naririnig, saka sumulat ng dalawang tanong na bumangon.' } },
      { title: { en: 'Simple research question and mini survey', fil: 'Simpleng tanong sa pananaliksik at mini survey' }, description: { en: 'Write a research question, ask 10 people three short questions, and summarize the answers in a table.', fil: 'Sumulat ng tanong sa pananaliksik, magtanong sa 10 tao ng tatlong maikling tanong, at ibuod ang mga sagot sa talahanayan.' } },
      { title: { en: 'Perspective-taking reflection', fil: 'Repleksyon sa pagtingin ng iba\'t ibang pananaw' }, description: { en: 'Write one situation from three different points of view and what each person may have needed.', fil: 'Isulat ang isang sitwasyon mula sa tatlong magkaibang pananaw at kung ano ang maaaring kailangan ng bawat tao.' } },
    ],
    careers: [
      { en: 'Psychology-related roles (with further study and licensing)', fil: 'Mga tungkulin kaugnay ng psychology (kasama ang karagdagang pag-aaral at lisensya)' },
      { en: 'Research or data assistant', fil: 'Katulong sa pananaliksik o datos' },
      { en: 'Community, social or human-resource support', fil: 'Suporta sa komunidad, panlipunan, o human resources' },
      { en: 'Graduate study in the social sciences or education', fil: 'Gradwadong pag-aaral sa agham panlipunan o edukasyon' },
    ],
  },
};

// UI text for the new sections. Section/page labels, buttons and
// helper text, in both languages, so a page is never half English and
// half Filipino.
export const LEARNING_UI = {
  en: {
    pageTitle: 'Program Readiness',
    pageIntro: 'What to expect in this department, the skills involved, and how to prepare for your first year.',
    contentNote: '',
    sections: {
      overview: 'Overview',
      first_year_expectations: 'First Year Expectations',
      major_subjects_overview: 'Major Subjects Overview',
      required_skills: 'Required Skills',
      common_challenges: 'Common Challenges',
      career_opportunities: 'Career Opportunities',
      preparation_tips: 'Preparation Tips',
    },
    nav: { skills: 'Skills', roadmap: 'Roadmap', resources: 'Resources', practice: 'Practice', checklist: 'Checklist', projects: 'Projects & careers', progress: 'Progress' },
    backToResults: 'Back to Results',
    goToDashboard: 'Go to Dashboard',
    startPreparing: 'Start preparing',
    startPreparingSub: 'Practical ways to get ready for this Program. Your progress is saved in this browser.',
    skillsTitle: 'Skills to develop',
    skillsDisclaimer: 'These are suggested learning priorities based on your answers to questions related to this Program. They are not a professional evaluation or a measurement of your ability.',
    skillsNoAnswers: 'Your individual answers are only available right after you finish the assessment in this visit. Showing the foundational skills for this Program without priorities.',
    priorityHigh: 'Suggested priority',
    priorityOk: 'Already comfortable. Keep practicing',
    skillAction: 'Try this',
    roadmapTitle: 'Four-week learning roadmap',
    roadmapSub: 'A beginner-friendly plan. Mark each week done when you finish it.',
    week: 'Week',
    objective: 'Objective',
    practice: 'Practice activity',
    resourcesLabel: 'Resources',
    markWeekDone: 'Mark week as done',
    weekDone: 'Week done',
    resourcesTitle: 'Recommended Learning Resources',
    resourcesSub: 'Free YouTube channels and playlists relevant to this Program. These are external links and are not run or endorsed by City College of Calamba.',
    watch: 'Watch on YouTube',
    linkPlaylist: 'Playlist',
    linkSearch: 'Topic search on channel',
    linkChannel: 'Channel',
    linkNote: 'Topic-search links open the channel\'s own search, so the videos shown may change over time.',
    recommendedTopic: 'Recommended topic',
    status: 'Status',
    statusNone: 'Not saved',
    statusToWatch: 'To watch',
    statusInProgress: 'In progress',
    statusCompleted: 'Completed',
    practiceTitle: 'Practice quiz',
    practiceSub: 'A short, optional quiz. It does not affect your assessment or results.',
    startQuiz: 'Start quiz',
    submitAnswer: 'Check answer',
    correct: 'Correct!',
    notQuite: 'Not quite.',
    nextQuestion: 'Next question',
    seeScore: 'See my score',
    questionOf: (n, t) => `Question ${n} of ${t}`,
    scoreOf: (s, t) => `You got ${s} of ${t}.`,
    tryAgain: 'Try again',
    lastScore: (s, t) => `Last score: ${s} of ${t}`,
    checklistTitle: 'Readiness checklist',
    tasksCompleted: (d, t) => `${d} of ${t} tasks completed`,
    projectsTitle: 'Sample projects',
    careersTitle: 'Possible career paths',
    careersNote: 'These are possibilities, not guaranteed outcomes. Requirements such as licensing may apply.',
    progressTitle: 'Your learning progress',
    progressSub: 'Saved in this browser for this Program.',
    pTasks: 'Checklist tasks',
    pWeeks: 'Roadmap weeks',
    pResources: 'Resources completed',
    pSaved: 'Resources saved',
    notFound: 'Programs',
    dashboardTitle: 'Learning progress',
    dashboardNone: 'You have not started the learning tasks yet.',
    dashboardOpen: 'Open Program Readiness',
  },
  fil: {
    pageTitle: 'Kahandaan sa Programa',
    pageIntro: 'Ano ang aasahan sa departamentong ito, ang mga kasanayang kailangan, at kung paano maghanda para sa unang taon mo.',
    contentNote: 'Paalala: ang paglalarawan ng departamento sa ibaba ay available pa lamang sa English.',
    sections: {
      overview: 'Pangkalahatang-ideya',
      first_year_expectations: 'Inaasahan sa Unang Taon',
      major_subjects_overview: 'Pangunahing Asignatura',
      required_skills: 'Kinakailangang Kasanayan',
      common_challenges: 'Karaniwang Hamon',
      career_opportunities: 'Mga Oportunidad sa Karera',
      preparation_tips: 'Mga Tip sa Paghahanda',
    },
    nav: { skills: 'Kasanayan', roadmap: 'Roadmap', resources: 'Mga Resource', practice: 'Pagsasanay', checklist: 'Checklist', projects: 'Proyekto at karera', progress: 'Progreso' },
    backToResults: 'Bumalik sa Resulta',
    goToDashboard: 'Pumunta sa Dashboard',
    startPreparing: 'Magsimulang maghanda',
    startPreparingSub: 'Mga praktikal na paraan para maghanda sa Programang ito. Naka-save ang progreso mo sa browser na ito.',
    skillsTitle: 'Mga kasanayang dapat paunlarin',
    skillsDisclaimer: 'Ito ay mga iminumungkahing prayoridad sa pag-aaral batay sa mga sagot mo sa mga tanong na may kaugnayan sa Programang ito. Hindi ito propesyonal na pagsusuri o sukat ng kakayahan mo.',
    skillsNoAnswers: 'Makikita lamang ang mga indibidwal na sagot mo pagkatapos mong matapos ang assessment sa pagbisitang ito. Ipinapakita ang mga pundamental na kasanayan para sa Programang ito nang walang prayoridad.',
    priorityHigh: 'Iminumungkahing prayoridad',
    priorityOk: 'Komportable ka na. Ipagpatuloy ang pagsasanay',
    skillAction: 'Subukan ito',
    roadmapTitle: 'Apat na linggong roadmap sa pag-aaral',
    roadmapSub: 'Planong angkop sa mga baguhan. Markahan ang bawat linggo kapag tapos mo na.',
    week: 'Linggo',
    objective: 'Layunin',
    practice: 'Gawaing pansanay',
    resourcesLabel: 'Mga Resource',
    markWeekDone: 'Markahang tapos ang linggo',
    weekDone: 'Tapos na ang linggo',
    resourcesTitle: 'Mga Inirerekomendang Resource sa Pag-aaral',
    resourcesSub: 'Mga libreng YouTube channel at playlist na kaugnay ng Programang ito. Panlabas na link ang mga ito at hindi pinatatakbo o inendorso ng City College of Calamba.',
    watch: 'Panoorin sa YouTube',
    linkPlaylist: 'Playlist',
    linkSearch: 'Paghahanap ng paksa sa channel',
    linkChannel: 'Channel',
    linkNote: 'Binubuksan ng mga link ng paghahanap ng paksa ang sariling search ng channel, kaya maaaring magbago ang mga video sa paglipas ng panahon.',
    recommendedTopic: 'Inirerekomendang paksa',
    status: 'Katayuan',
    statusNone: 'Hindi naka-save',
    statusToWatch: 'Papanoorin',
    statusInProgress: 'Isinasagawa',
    statusCompleted: 'Tapos na',
    practiceTitle: 'Pagsasanay na quiz',
    practiceSub: 'Maikli at opsyonal na quiz. Hindi nito naaapektuhan ang assessment o resulta mo.',
    startQuiz: 'Simulan ang quiz',
    submitAnswer: 'Suriin ang sagot',
    correct: 'Tama!',
    notQuite: 'Hindi pa tama.',
    nextQuestion: 'Susunod na tanong',
    seeScore: 'Tingnan ang iskor ko',
    questionOf: (n, t) => `Tanong ${n} sa ${t}`,
    scoreOf: (s, t) => `Nakakuha ka ng ${s} sa ${t}.`,
    tryAgain: 'Subukan muli',
    lastScore: (s, t) => `Huling iskor: ${s} sa ${t}`,
    checklistTitle: 'Checklist ng kahandaan',
    tasksCompleted: (d, t) => `${d} sa ${t} na gawain ang natapos`,
    projectsTitle: 'Mga halimbawang proyekto',
    careersTitle: 'Mga posibleng landas sa karera',
    careersNote: 'Mga posibilidad ito, hindi garantisadong resulta. Maaaring may mga kinakailangan tulad ng lisensya.',
    progressTitle: 'Ang progreso mo sa pag-aaral',
    progressSub: 'Naka-save sa browser na ito para sa Programang ito.',
    pTasks: 'Mga gawain sa checklist',
    pWeeks: 'Mga linggo sa roadmap',
    pResources: 'Mga natapos na resource',
    pSaved: 'Mga naka-save na resource',
    notFound: 'Mga Programa',
    dashboardTitle: 'Progreso sa pag-aaral',
    dashboardNone: 'Hindi mo pa nasisimulan ang mga gawain sa pag-aaral.',
    dashboardOpen: 'Buksan ang Kahandaan sa Programa',
  },
};

export const RESOURCE_STATUSES = ['to_watch', 'in_progress', 'completed'];
