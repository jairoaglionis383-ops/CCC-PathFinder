// Data Privacy Notice content (English and Filipino).
//
// The notice only states what the system really does (see README.md, DATABASE_GUIDE.md).
// Things the institution still has to decide are said openly instead of being invented:
//  - the retention period (the system never deletes records by itself), and
//  - the privacy contact (fill in PRIVACY_CONTACT below once City College of Calamba provides it;
//    until then the notice says the details have not yet been provided).
// Legal basis named in the notice: Data Privacy Act of 2012 (Republic Act No. 10173), data subject rights.
// The Filipino text should be reviewed by a Filipino-speaking reviewer / the institution before real use.
export const PRIVACY_NOTICE_VERSION = '2026-11';

export const PRIVACY_CONTACT = {
  office: '', // e.g. 'Data Protection Officer, City College of Calamba'
  email: '',
  phone: '',
};

export const PRIVACY_NOTICE = {
  en: {
    toggle: 'English',
    blockTitle: 'Data Privacy Notice',
    summary:
      'We collect your name, age, the other details you enter, and your answers in order to give you a Program recommendation. Please read how your information is used before you continue.',
    readFull: 'Read the full Data Privacy Notice',
    fullTitle: 'CCC PathFinder Data Privacy Notice',
    sections: [
      {
        heading: 'Introduction',
        paragraphs: [
          'CCC PathFinder is the Program Recommendation and Readiness Support System of City College of Calamba. It helps incoming first-year students find the academic department that best matches them and prepare for it. To do this, it needs some information about you.',
          'This notice explains what is collected, why, how it is handled, and your rights under the Data Privacy Act of 2012 (Republic Act No. 10173).',
        ],
      },
      {
        heading: 'Information Collected',
        items: [
          'Your full name and age',
          'Your gender, SHS Track / Elective Cluster and school name (these three are optional)',
          'Your answers to the 20 questionnaire statements and the language you chose',
          'The scores and rankings calculated from your answers, and the date and time you finished',
        ],
        paragraphs: [
          'Your browser keeps your session ID and a list of your finished result IDs on this device so you can reopen your results, and keeps your progress in the browser tab while you answer. The system does not use tracking cookies and does not collect your email address, phone number, home address, photos or location. Your IP address is used only briefly in the server’s memory to limit repeated requests and is not saved in the database.',
        ],
      },
      {
        heading: 'Purpose of Data Collection',
        items: [
          'To calculate your compatibility scores and show your recommended Program and department ranking',
          'To show Program Readiness guidance for the department you view',
          'To let you reopen your earlier results on your dashboard',
          'To maintain the system and fix problems',
        ],
        paragraphs: [
          'The system does not make admission or enrollment decisions. The recommendation is only a guide.',
        ],
      },
      {
        heading: 'Data Storage and Security',
        paragraphs: [
          'Your information is saved in the CCC PathFinder database on the computer or server where the system runs.',
          'What the system does to protect it:',
        ],
        items: [
          'It checks the information it receives before saving it',
          'The results page shows only scores, never your name, age, school or other personal details',
          'Database queries use safe parameters, and saving is all-or-nothing, so a failed save leaves no partial record',
          'It limits repeated requests and sends standard security headers',
          'Its error logs do not include your answers or personal details',
        ],
        paragraphs2: [
          'What the system does not have: user accounts or passwords, and encryption of the stored data. Whether the connection uses HTTPS depends on how the system is installed.',
          'This means anyone with access to the database or server (for example, the system administrator) can see the stored information, and anyone who has your result link can open your results (scores only). On a shared computer, use a private browser window or clear the site data afterwards.',
        ],
      },
      {
        heading: 'Data Sharing and Disclosure',
        paragraphs: [
          'CCC PathFinder does not send your information to other organizations, advertisers or analytics services, and it does not load third-party trackers. The optional learning links on the Program Readiness page open YouTube only if you click them; YouTube’s own privacy rules then apply.',
          'The stored information can be seen by the people who run and maintain the system, and may be disclosed when required by law. Any other sharing within City College of Calamba has not been defined in the system and must follow the college’s policies.',
        ],
      },
      {
        heading: 'Data Retention',
        paragraphs: [
          'CCC PathFinder does not delete records automatically, and no retention period has been set in the system. Records stay in the database until the system administrator removes them. The retention period still has to be set by City College of Calamba.',
        ],
      },
      {
        heading: 'Your Rights',
        paragraphs: ['Under the Data Privacy Act of 2012 (Republic Act No. 10173) you have the following rights, within the limits set by law:'],
        items: [
          'To be informed about what is collected and why (this notice)',
          'To object to the processing of your personal data, or withdraw your consent',
          'To access your personal data',
          'To correct wrong or incomplete data',
          'To ask for your data to be erased or blocked when there is a legal basis',
          'To data portability, where it applies',
          'To file a complaint with the National Privacy Commission (privacy.gov.ph) and to claim damages if you were harmed',
        ],
        paragraphs2: ['To use these rights, contact the person listed under Contact Information below.'],
      },
      {
        heading: 'Contact Information',
        contactMissing:
          'Official contact details for privacy concerns (for example, the Data Protection Officer of City College of Calamba) have not yet been provided to this system. The college is expected to add them before the system is used with real students. For now, please ask your adviser or assessment coordinator.',
      },
    ],
    helpAcknowledgment:
      'Acknowledgment means you have read and understood this notice. Consent means you agree to the collection and use of your information as described. Both are needed because CCC PathFinder cannot give you a recommendation without them. Taking the assessment is voluntary: if you do not agree, you can leave this page and nothing is saved. If you are under 18, we encourage you to read this with a parent or guardian.',
    acknowledgmentLabel: 'I have read and understood the Data Privacy Notice.',
    consentLabel:
      'I consent to CCC PathFinder of City College of Calamba collecting and using my personal information as described in the notice.',
    acknowledgmentError: 'Please confirm that you have read and understood the Data Privacy Notice.',
    consentError: 'Please give your consent to continue.',
    contactLabels: { office: 'Office', email: 'Email', phone: 'Phone' },
  },
  fil: {
    toggle: 'Filipino',
    blockTitle: 'Paunawa sa Privacy ng Datos',
    summary:
      'Kinokolekta namin ang iyong pangalan, edad, iba pang detalyeng ilalagay mo, at ang iyong mga sagot para makapagbigay ng rekomendasyon sa Programa. Pakibasa kung paano gagamitin ang iyong impormasyon bago magpatuloy.',
    readFull: 'Basahin ang buong Paunawa sa Privacy ng Datos',
    fullTitle: 'Paunawa sa Privacy ng Datos ng CCC PathFinder',
    sections: [
      {
        heading: 'Panimula',
        paragraphs: [
          'Ang CCC PathFinder ay ang Program Recommendation and Readiness Support System ng City College of Calamba. Tinutulungan nito ang mga papasok na first-year na estudyante na malaman kung aling departamento ang pinakaangkop sa kanila at kung paano maghanda para rito. Para magawa ito, kailangan ng sistema ang ilang impormasyon tungkol sa iyo.',
          'Ipinapaliwanag ng paunawang ito kung ano ang kinokolekta, bakit, paano ito pinangangasiwaan, at ang iyong mga karapatan ayon sa Data Privacy Act of 2012 (Republic Act No. 10173).',
        ],
      },
      {
        heading: 'Impormasyong Kinokolekta',
        items: [
          'Ang iyong buong pangalan at edad',
          'Ang iyong kasarian, SHS Track / Elective Cluster at pangalan ng paaralan (opsyonal ang tatlong ito)',
          'Ang iyong mga sagot sa 20 pahayag ng talatanungan at ang wikang pinili mo',
          'Ang mga iskor at ranggo na nakuha mula sa iyong mga sagot, at ang petsa at oras ng pagtatapos mo',
        ],
        paragraphs: [
          'Itinatago ng iyong browser sa device na ito ang iyong session ID at listahan ng mga natapos mong resulta para muli mong mabuksan ang mga ito, at itinatago rin ang iyong progreso sa tab ng browser habang sumasagot ka. Hindi gumagamit ang sistema ng tracking cookies at hindi nito kinokolekta ang iyong email, numero ng telepono, tirahan, litrato o lokasyon. Ang iyong IP address ay ginagamit lamang sandali sa memorya ng server para limitahan ang paulit-ulit na request at hindi ito sine-save sa database.',
        ],
      },
      {
        heading: 'Layunin ng Pagkolekta ng Datos',
        items: [
          'Kalkulahin ang iyong compatibility scores at ipakita ang inirerekomendang Programa at ranggo ng mga departamento',
          'Ipakita ang gabay sa Program Readiness para sa departamentong tinitingnan mo',
          'Hayaan kang muling buksan ang iyong mga nakaraang resulta sa dashboard',
          'Panatilihin ang sistema at ayusin ang mga problema',
        ],
        paragraphs: ['Hindi gumagawa ang sistema ng desisyon sa admission o enrollment. Gabay lamang ang rekomendasyon.'],
      },
      {
        heading: 'Pag-iimbak at Seguridad ng Datos',
        paragraphs: [
          'Sine-save ang iyong impormasyon sa database ng CCC PathFinder sa computer o server kung saan tumatakbo ang sistema.',
          'Ang ginagawa ng sistema para protektahan ito:',
        ],
        items: [
          'Sinusuri nito ang natatanggap na impormasyon bago i-save',
          'Mga iskor lamang ang ipinapakita ng pahina ng resulta, hindi ang iyong pangalan, edad, paaralan o iba pang personal na detalye',
          'Ligtas na parameter ang gamit ng mga database query, at all-or-nothing ang pag-save, kaya walang bahagyang record kapag pumalya',
          'Nililimitahan nito ang paulit-ulit na request at nagpapadala ng karaniwang security headers',
          'Hindi kasama sa mga error log nito ang iyong mga sagot o personal na detalye',
        ],
        paragraphs2: [
          'Ang wala sa sistema: user account o password, at encryption ng naka-save na datos. Nakadepende sa paraan ng pag-install ang paggamit ng HTTPS.',
          'Ibig sabihin, ang sinumang may access sa database o server (halimbawa, ang system administrator) ay makikita ang naka-save na impormasyon, at ang sinumang may link ng iyong resulta ay makakabukas ng iyong mga resulta (mga iskor lamang). Sa pinagsasaluhang computer, gumamit ng private browser window o burahin ang site data pagkatapos.',
        ],
      },
      {
        heading: 'Pagbabahagi at Pagbubunyag ng Datos',
        paragraphs: [
          'Hindi ipinapadala ng CCC PathFinder ang iyong impormasyon sa ibang organisasyon, advertiser o analytics service, at hindi ito naglo-load ng third-party tracker. Magbubukas lamang ng YouTube ang mga opsyonal na link sa pag-aaral sa pahina ng Program Readiness kapag pinindot mo ang mga ito; ang sariling patakaran sa privacy ng YouTube ang susundin doon.',
          'Makikita ang naka-save na impormasyon ng mga nangangasiwa at nagpapanatili ng sistema, at maaaring ibunyag kapag hinihingi ng batas. Ang anumang iba pang pagbabahagi sa loob ng City College of Calamba ay hindi pa tinutukoy ng sistema at dapat sumunod sa mga patakaran ng kolehiyo.',
        ],
      },
      {
        heading: 'Pagpapanatili ng Datos',
        paragraphs: [
          'Hindi awtomatikong nagbubura ng record ang CCC PathFinder at walang itinakdang panahon ng pagpapanatili sa sistema. Nananatili ang mga record sa database hanggang burahin ng system administrator. Kailangan pang itakda ng City College of Calamba ang panahon ng pagpapanatili.',
        ],
      },
      {
        heading: 'Ang Iyong mga Karapatan',
        paragraphs: ['Ayon sa Data Privacy Act of 2012 (Republic Act No. 10173), mayroon kang mga sumusunod na karapatan, sa loob ng mga limitasyong itinakda ng batas:'],
        items: [
          'Maabisuhan kung ano ang kinokolekta at bakit (ang paunawang ito)',
          'Tumutol sa pagproseso ng iyong personal na datos, o bawiin ang iyong pahintulot',
          'Makakuha ng access sa iyong personal na datos',
          'Ipatama ang mali o kulang na datos',
          'Hilingin na burahin o i-block ang iyong datos kapag may legal na batayan',
          'Data portability, kung naaangkop',
          'Magsampa ng reklamo sa National Privacy Commission (privacy.gov.ph) at humingi ng danyos kung ikaw ay napinsala',
        ],
        paragraphs2: ['Para gamitin ang mga karapatang ito, makipag-ugnayan sa nakalista sa Impormasyon sa Pakikipag-ugnayan sa ibaba.'],
      },
      {
        heading: 'Impormasyon sa Pakikipag-ugnayan',
        contactMissing:
          'Hindi pa naibibigay sa sistemang ito ang opisyal na contact details para sa mga usapin sa privacy (halimbawa, ang Data Protection Officer ng City College of Calamba). Inaasahang idaragdag ito ng kolehiyo bago gamitin ang sistema sa totoong mga estudyante. Sa ngayon, magtanong sa iyong adviser o sa tagapag-ugnay ng pagtatasa.',
      },
    ],
    helpAcknowledgment:
      'Ang pagkilala (acknowledgment) ay nangangahulugang nabasa at naunawaan mo ang paunawang ito. Ang pahintulot (consent) ay nangangahulugang pumapayag ka sa pagkolekta at paggamit ng iyong impormasyon ayon sa paliwanag. Kailangan ang dalawa dahil hindi makapagbibigay ng rekomendasyon ang CCC PathFinder kung wala ang mga ito. Kusang-loob ang pagsagot sa assessment: kung hindi ka pumapayag, maaari mong iwan ang pahinang ito at walang masi-save. Kung wala ka pang 18 taong gulang, hinihikayat ka naming basahin ito kasama ang magulang o tagapag-alaga.',
    acknowledgmentLabel: 'Nabasa at naunawaan ko ang Paunawa sa Privacy ng Datos.',
    consentLabel:
      'Pumapayag ako na kolektahin at gamitin ng CCC PathFinder ng City College of Calamba ang aking personal na impormasyon ayon sa paunawa.',
    acknowledgmentError: 'Pakikumpirma na nabasa at naunawaan mo ang Paunawa sa Privacy ng Datos.',
    consentError: 'Pakibigay ang iyong pahintulot para magpatuloy.',
    contactLabels: { office: 'Tanggapan', email: 'Email', phone: 'Telepono' },
  },
};
