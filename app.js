/**
 * Media Bias Analyzer — App Logic
 * ─────────────────────────────────────────────────────
 * 1. Tab switching
 * 2. Lightbox for chart zoom
 * 3. Article Analyzer — lexicon-based engine
 *    • Bias Score     (cosine-sim-style TF match against ~300 bias terms)
 *    • Tone           (positive / negative lexicon → 5-class)
 *    • Political Leaning (left / right word lists)
 *    • Highlighted preview with inline <mark> spans
 */

/* ════════════════════════════════════════════════════
   1. TAB SWITCHING
   ════════════════════════════════════════════════════ */
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels  = document.querySelectorAll('.tab-panel');

function switchTab(tabId) {
  tabButtons.forEach(btn =>
    btn.classList.toggle('active', btn.dataset.tab === tabId));
  tabPanels.forEach(panel =>
    panel.classList.toggle('active', panel.id === `panel-${tabId}`));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

tabButtons.forEach(btn =>
  btn.addEventListener('click', () => switchTab(btn.dataset.tab)));


/* ════════════════════════════════════════════════════
   SAMPLE ARTICLES — full texts
   ════════════════════════════════════════════════════ */
const SAMPLES = {

  /* ── BIASED EXAMPLES ── */
  biased1: `The incompetent and corrupt opposition leaders have once again resorted to blatant propaganda and deliberate misinformation, desperately trying to mislead the nation with fabricated allegations against the ruling government. These so-called leaders, whose only agenda is political power, are shamelessly exploiting the emotions of ordinary citizens. Anonymous sources claim they are backed by anti-national forces that want to destabilize India. Their rhetoric is nothing short of inflammatory and seditious. Clearly, every single move by this opposition bloc is a calculated attack on the democratic fabric of our nation. Nobody in their right mind should believe these false, manipulative narratives being pushed by these radical elements. The authoritarian-minded opposition has never contributed to India's development; they only know how to obstruct, disrupt, and destroy. It is obviously in the interest of enemies of the state to keep India weak and divided. The government, on the other hand, has achieved historic milestones and must not be undermined by these desperate power-hungry politicians.`,

  biased2: `The corrupt crony capitalists, backed by an authoritarian regime and their cronies in the deep state, are systematically exploiting, suppressing, and looting the marginalized working class of India. These elitist billionaires, who have stolen the nation's wealth through fraudulent means and rigged policies, are deliberately keeping the poor trapped in a cycle of poverty. Workers and farmers who dare to protest are being unlawfully targeted, attacked, and suppressed by the government machinery. It is clearly a criminal conspiracy to silence dissent and crush the voice of the oppressed. Many analysts and experts agree that this is undeniably one of the most dangerous and appalling attacks on labour rights in modern Indian history. The regime's so-called economic reforms are nothing but propaganda designed to mislead the public while handing over national assets to their corporate allies. Dalit communities and tribal groups face systemic persecution and injustice with absolutely no accountability whatsoever.`,

  biased3: `The so-called secular government's blatant and obviously calculated vote bank politics is threatening the very unity and integrity of the nation. Sources claim that the anti-Hindu agenda being pushed by the ruling clique is a deliberate attack on the cultural heritage of this great civilization. The appeasement of radical minority groups at the expense of the majority is nothing short of a betrayal of the constitution. Every single policy announced by this regime has been allegedly designed to polarize communities and radicalize voters along communal lines. It is beyond doubt that this divisive and inflammatory approach is destroying the social harmony that India's ancestors built over centuries. Anonymous insiders within the government have confirmed that this is a coordinated propaganda campaign to suppress nationalism and silence patriotic voices. The controversial decisions taken by this administration are clearly unconstitutional and must be rejected by every true patriot.`,

  /* ── UNBIASED / NEUTRAL EXAMPLES ── */
  neutral1: `The Lok Sabha passed the Union Budget 2024 on Wednesday with 312 votes in favour and 189 against after a two-day debate. The bill will now be sent to the Rajya Sabha for further deliberation. Finance Minister Nirmala Sitharaman presented the budget earlier this month, which includes an allocation of Rs 11.1 lakh crore for capital expenditure. Opposition members raised concerns during the debate regarding the fiscal deficit target and the adequacy of funding for rural welfare schemes. Government representatives responded by citing projected GDP growth figures and long-term infrastructure goals. The vote was held after 14 hours of debate over two sessions. A joint parliamentary committee has been proposed to review the implementation of key allocations. The next session of Parliament is scheduled to begin in the third week of July. The bill requires passage in both houses before receiving Presidential assent and becoming law.`,

  neutral2: `India's gross domestic product grew by 7.2 percent in the July to September quarter of 2024, according to data released on Tuesday by the Ministry of Statistics and Programme Implementation. The growth rate was slightly above the 7.0 percent estimate published by the Reserve Bank of India last month. The agricultural sector recorded a growth rate of 3.5 percent, while manufacturing expanded by 8.1 percent during the same period. Services, which account for the largest share of GDP, grew by 7.9 percent. The data also showed that gross fixed capital formation increased by 11.2 percent year on year, indicating continued investment activity. Household consumption expenditure grew by 6.0 percent compared to the same quarter last year. Economists from the International Monetary Fund and credit rating agency CRISIL noted that India remained one of the fastest-growing major economies globally. The government expects full-year GDP growth to come in between 7 and 7.5 percent for the fiscal year ending March 2025.`,

  neutral3: `The Union Ministry of Health and Family Welfare announced on Monday the launch of a new vaccination programme targeting rural populations across 14 states. The programme aims to reach an estimated 8 million people over the next six months, focusing on children under the age of five and pregnant women. The initiative is part of the Universal Immunisation Programme and includes vaccines for measles, rubella, and diphtheria. State governments will collaborate with district health officers to establish 4,200 new immunisation centres in primary health care facilities. The World Health Organization and UNICEF will provide technical assistance for training health workers. According to the ministry, vaccine coverage in rural areas currently stands at 74 percent, compared to the national target of 90 percent. Health officials said that cold chain infrastructure improvements funded in the 2024 budget will support expanded storage and distribution. The programme is expected to be evaluated at the end of six months with coverage data submitted to parliament.`,
};

/* ── Wire sample cards to textarea ── */
document.querySelectorAll('.sample-card').forEach(card => {
  card.addEventListener('click', () => {
    const key  = card.dataset.sample;
    const text = SAMPLES[key];
    if (!text) return;

    // Fill textarea
    const ta = document.getElementById('article-input');
    ta.value = text;
    ta.dispatchEvent(new Event('input'));   // update word count

    // Highlight selected card, clear others
    document.querySelectorAll('.sample-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    // Smooth scroll to the textarea
    ta.scrollIntoView({ behavior: 'smooth', block: 'center' });
    ta.focus();
  });
});


/* ════════════════════════════════════════════════════
   2. LIGHTBOX
   ════════════════════════════════════════════════════ */
const overlay    = document.createElement('div');
overlay.className = 'lightbox-overlay';
const lightboxImg = document.createElement('img');
lightboxImg.className = 'lightbox-img';
lightboxImg.alt = 'Zoomed chart';
const closeBtn = document.createElement('button');
closeBtn.className = 'lightbox-close';
closeBtn.innerHTML = '✕';
closeBtn.setAttribute('aria-label', 'Close lightbox');
overlay.appendChild(lightboxImg);
overlay.appendChild(closeBtn);
document.body.appendChild(overlay);

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt || 'Chart';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lightboxImg.src = ''; }, 250);
}

document.querySelectorAll('.chart-img-wrap img').forEach(img =>
  img.addEventListener('click', () => openLightbox(img.src, img.alt)));
closeBtn.addEventListener('click', closeLightbox);
overlay.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });


/* ════════════════════════════════════════════════════
   3. ARTICLE ANALYZER — LEXICONS
   ════════════════════════════════════════════════════ */

/* ─── Bias Lexicon (~280 terms matching the project's approach) ─── */
const BIAS_TERMS = [
  'allegedly','supposedly','claimed','so-called','accused','purported','asserted',
  'controversial','disputed','debated','contested','questioned','murky','unclear',
  'propaganda','narrative','agenda','spin','manipulate','distort','twist','slant',
  'biased','one-sided','partisan','ideological','radical','extremist','fringe',
  'rhetoric','demagoguery','populist','sensational','inflammatory','incendiary',
  'misleading','misinformation','disinformation','fake','fabricated','doctored',
  'selective','cherry-pick','out of context','misrepresent','exaggerate','overstate',
  'understate','downplay','dismiss','ignore','overlook','suppress','conceal','hide',
  'cover up','whitewash','bury','spin','frame','characterize','portray','paint',
  'stereotype','generalize','label','brand','tag','scapegoat','vilify','demonize',
  'smear','slander','defame','attack','assault','target','victimize','persecute',
  'unconstitutional','illegal','unlawful','criminal','corrupt','fraudulent','rigged',
  'stolen','cheated','fixed','manipulated','subverted','undermined','eroded',
  'threat','danger','risk','crisis','emergency','catastrophe','disaster','collapse',
  'failure','fiasco','debacle','scandal','controversy','outrage','uproar','fury',
  'backlash','revolt','uprising','insurrection','coup','takeover','power grab',
  'dictator','authoritarian','fascist','communist','socialist','capitalist','elitist',
  'establishment','deep state','globalist','nationalist','separatist','secessionist',
  'anti-national','seditious','treasonous','traitor','enemy','adversary','rival',
  'opposition','dissenter','critic','opponent','protester','activist','agitator',
  'regime','junta','clique','cabal','nexus','syndicate','cartel','mafia','gang',
  'crony','nepotism','favoritism','appeasement','capitulation','surrender','betrayal',
  'only','never','always','must','all','every','none','no one','everyone','nobody',
  'clearly','obviously','certainly','definitely','undeniably','without doubt',
  'of course','needless to say','it is a fact','the truth is','experts agree',
  'many people say','some say','it is believed','sources claim','anonymous',
  'community','group','tribe','sect','faction','bloc','camp','side','them','they',
  'invasion','flood','surge','wave','influx','swamp','overrun','overwhelm','takeover',
  'burden','drain','strain','threat','menace','danger','challenge','problem','issue',
  'anti-Hindu','anti-Muslim','anti-Christian','anti-Sikh','anti-Dalit','casteist',
  'communal','sectarian','divisive','polarizing','radicalizing','inciting',
  'appease','vote bank','minority','majority','quota','reservation','demand',
  'demand','pressure','force','coerce','compel','impose','dictate','order',
  'justify','defend','excuse','rationalize','whitewash','apologize','condemn'
];

/* ─── Positive Sentiment Words ─── */
const POS_WORDS = [
  'good','great','excellent','outstanding','remarkable','impressive','wonderful',
  'positive','benefit','success','achievement','progress','growth','improve','better',
  'strong','robust','significant','historic','landmark','milestone','breakthrough',
  'effective','efficient','productive','innovative','creative','visionary','inspiring',
  'hope','promise','opportunity','solution','resolve','recover','advance','prosper',
  'win','victory','triumph','celebrate','praise','commend','applaud','support',
  'develop','build','launch','introduce','boost','rise','gain','surge','jump','soar',
  'happy','pleased','satisfied','confident','optimistic','encouraging','promising',
  'peaceful','harmonious','cooperative','united','inclusive','democratic','transparent'
];

/* ─── Negative Sentiment Words ─── */
const NEG_WORDS = [
  'bad','terrible','awful','horrible','dreadful','appalling','disastrous','catastrophic',
  'negative','fail','failure','loss','decline','fall','drop','crash','collapse','crisis',
  'weak','poor','ineffective','corrupt','fraudulent','illegal','criminal','dishonest',
  'problem','issue','concern','worry','fear','threat','danger','risk','warning',
  'attack','violence','conflict','tension','dispute','clash','fight','war','protest',
  'anger','outrage','fury','chaos','confusion','uncertainty','instability','turmoil',
  'delay','cancel','suspend','ban','block','reject','deny','oppose','resist','refuse',
  'death','dead','kill','murder','rape','assault','abuse','exploit','oppress','suppress',
  'lie','deceive','cheat','steal','betray','manipulate','mislead','scandal','controversy',
  'sad','unhappy','disappointed','frustrated','depressed','anxious','worried','scared',
  'dangerous','harmful','toxic','destructive','divisive','polarizing','hateful','racist'
];

/* ─── Political Leaning Lexicons ─── */
const LEFT_WORDS = [
  'inequality','social justice','welfare','subsidize','redistribute','progressive',
  'labour','workers','union','rights','equity','minorities','marginalized','vulnerable',
  'dalit','tribal','poor','farmers','gender','feminist','environment','climate',
  'secularism','pluralism','diversity','inclusive','regulation','state intervention',
  'public sector','nationalization','free education','free healthcare','protest',
  'civil society','ngos','activists','grassroots','anti-establishment','corporate greed',
  'wealth gap','oligarchy','austerity','privatization','unemployment','displacement'
];

const RIGHT_WORDS = [
  'national security','defence','military','sovereignty','border','nationalist',
  'development','gdp','economic growth','business','market','deregulation',
  'privatization','free market','investment','entrepreneurship','startup','innovation',
  'tradition','culture','heritage','religion','hindutva','ram','temple','cow',
  'anti-corruption','surgical strike','terror','infiltration','illegal immigration',
  'law and order','police','courts','judiciary','constitution','sedition',
  'patriot','bharat','india first','viksit bharat','modi','bjp','rss','sangh',
  'uniform civil code','article 370','citizenship','nrc','caa','nsa'
];


/* ════════════════════════════════════════════════════
   4. ANALYZER LOGIC
   ════════════════════════════════════════════════════ */

/** Tokenize text to lowercase words, strip punctuation */
function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z\s'-]/g, ' ').split(/\s+/).filter(Boolean);
}

/** Count how many times words from `list` appear in `tokens` (returns hits array) */
function matchTerms(tokens, list) {
  const hits = [];
  const joined = tokens.join(' ');
  list.forEach(term => {
    const re = new RegExp(`\\b${term.replace(/[-]/g,'[- ]')}\\b`, 'gi');
    const m  = joined.match(re);
    if (m) hits.push(...Array(m.length).fill(term));
  });
  return hits;
}

/** Sentence count */
function sentenceCount(text) {
  return (text.match(/[.!?]+/g) || []).length || 1;
}

/** Run full analysis; returns result object */
function analyzeText(text) {
  const tokens   = tokenize(text);
  const total    = tokens.length;
  const sents    = sentenceCount(text);

  /* ── Bias ── */
  const biasHits = matchTerms(tokens, BIAS_TERMS);
  // Score: proportion of bias-term hits relative to total words, normalized 0–100
  const rawBias  = Math.min(biasHits.length / (total * 0.15), 1);
  const biasScore = Math.round(rawBias * 100);
  const isBiased  = biasScore >= 30;

  /* ── Tone ── */
  const posHits  = matchTerms(tokens, POS_WORDS);
  const negHits  = matchTerms(tokens, NEG_WORDS);
  const posN = posHits.length;
  const negN = negHits.length;
  const sentiTotal = posN + negN || 1;
  const posRatio = posN / sentiTotal;

  let tone;
  if      (posRatio >= 0.75) tone = 'Very Positive';
  else if (posRatio >= 0.55) tone = 'Positive';
  else if (posRatio >= 0.40) tone = 'Neutral';
  else if (posRatio >= 0.25) tone = 'Negative';
  else                       tone = 'Very Negative';

  // If very few hits, default to Neutral
  if ((posN + negN) < 3) tone = 'Neutral';

  /* ── Political Leaning ── */
  const leftHits  = matchTerms(tokens, LEFT_WORDS);
  const rightHits = matchTerms(tokens, RIGHT_WORDS);
  const lN = leftHits.length;
  const rN = rightHits.length;
  const polTotal = lN + rN || 1;
  const rightRatio = rN / polTotal;

  let leaning, leaningPos;  // leaningPos: 0=far left, 50=centre, 100=far right
  if      ((lN + rN) < 2) { leaning = 'Neutral';  leaningPos = 50; }
  else if (rightRatio >= 0.65) { leaning = 'Right'; leaningPos = 75 + Math.min(rightRatio * 20, 20); }
  else if (rightRatio <= 0.35) { leaning = 'Left';  leaningPos = 30 - Math.min((1 - rightRatio) * 20, 20); }
  else                         { leaning = 'Neutral'; leaningPos = 50; }
  leaningPos = Math.max(5, Math.min(95, leaningPos));

  /* ── Deduplicated unique signal words ── */
  const uniqueBias  = [...new Set(biasHits)].slice(0, 20);
  const uniquePos   = [...new Set(posHits)].slice(0,  12);
  const uniqueNeg   = [...new Set(negHits)].slice(0,  12);
  const uniquePol   = [...new Set([...leftHits, ...rightHits])].slice(0, 10);

  return {
    wordCount: total, sents,
    biasScore, isBiased, biasHits: uniqueBias,
    tone, posHits: uniquePos, negHits: uniqueNeg,
    leaning, leaningPos,
    polHits: uniquePol,
    totalSentiSignals: posN + negN,
  };
}

/** Build highlighted HTML for article preview */
function buildHighlightedHTML(text, biasTerms, posTerms, negTerms) {
  // Escape HTML entities
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Build a map: term → class
  const hlMap = {};
  biasTerms.forEach(t => { hlMap[t.toLowerCase()] = 'hl-bias'; });
  negTerms.forEach(t  => { hlMap[t.toLowerCase()] = 'hl-neg'; });
  posTerms.forEach(t  => { hlMap[t.toLowerCase()] = 'hl-pos'; });

  // Sort by length desc to match longer phrases first
  const sorted = Object.keys(hlMap).sort((a, b) => b.length - a.length);

  sorted.forEach(term => {
    const cls = hlMap[term];
    const re  = new RegExp(`\\b(${term.replace(/[-]/g,'[- ]')})\\b`, 'gi');
    escaped = escaped.replace(re, `<span class="${cls}">$1</span>`);
  });

  return escaped;
}

/** Tone → emoji map */
const TONE_EMOJI = {
  'Very Positive': '😊',
  'Positive':      '🙂',
  'Neutral':       '😐',
  'Negative':      '🙁',
  'Very Negative': '😠',
};

/** Tone → colour (for verdict banner border) */
const TONE_COLOR = {
  'Very Positive': '#5dd896',
  'Positive':      '#7ecac0',
  'Neutral':       '#a8c6cc',
  'Negative':      '#e0a070',
  'Very Negative': '#e07070',
};


/* ════════════════════════════════════════════════════
   5. UI WIRING — ANALYZE TAB
   ════════════════════════════════════════════════════ */

const textarea    = document.getElementById('article-input');
const wordCountEl = document.getElementById('word-count');
const clearBtnEl  = document.getElementById('clear-btn');
const analyzeBtn  = document.getElementById('analyze-btn');
const loadingEl   = document.getElementById('analyzer-loading');
const resultsEl   = document.getElementById('analyzer-results');

/* Word counter */
textarea.addEventListener('input', () => {
  const w = textarea.value.trim().split(/\s+/).filter(Boolean).length;
  wordCountEl.textContent = `${w} word${w !== 1 ? 's' : ''}`;
});

/* Clear button */
clearBtnEl.addEventListener('click', () => {
  textarea.value = '';
  wordCountEl.textContent = '0 words';
  resultsEl.style.display = 'none';
  loadingEl.style.display = 'none';
});

/* Run Analysis */
analyzeBtn.addEventListener('click', () => {
  const text = textarea.value.trim();
  if (!text || text.split(/\s+/).length < 10) {
    textarea.style.borderColor = '#e07070';
    textarea.style.boxShadow   = '0 0 0 3px rgba(220,80,80,0.25)';
    setTimeout(() => {
      textarea.style.borderColor = '';
      textarea.style.boxShadow   = '';
    }, 1800);
    return;
  }

  // Show loading
  resultsEl.style.display = 'none';
  loadingEl.style.display = 'flex';
  analyzeBtn.classList.add('loading');
  analyzeBtn.querySelector('.btn-text').textContent = 'Analyzing…';

  // Simulate async processing (300ms for UX feel)
  setTimeout(() => {
    const result = analyzeText(text);
    renderResults(result, text);
    loadingEl.style.display = 'none';
    resultsEl.style.display = 'block';
    analyzeBtn.classList.remove('loading');
    analyzeBtn.querySelector('.btn-text').textContent = 'Run Analysis';
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 420);
});

/** Populate all result elements */
function renderResults(r, rawText) {

  /* ─ Verdict Banner ─ */
  const icon    = document.getElementById('verdict-icon');
  const title   = document.getElementById('verdict-title');
  const sub     = document.getElementById('verdict-sub');
  const badge   = document.getElementById('verdict-badge');
  const banner  = document.getElementById('verdict-banner');

  if (r.isBiased) {
    icon.textContent  = '⚠️';
    title.textContent = 'This article shows signs of bias';
    badge.textContent = 'BIASED';
    badge.className   = 'verdict-badge biased';
    banner.style.borderColor = '#cc6060';
  } else {
    icon.textContent  = '✅';
    title.textContent = 'This article appears relatively neutral';
    badge.textContent = 'UNBIASED';
    badge.className   = 'verdict-badge unbiased';
    banner.style.borderColor = '#50c88c';
  }
  sub.textContent = `Tone: ${r.tone}  ·  Leaning: ${r.leaning}  ·  ${r.wordCount} words analysed`;

  /* ─ Bias Score Card ─ */
  document.getElementById('bias-score-val').textContent = `${r.biasScore} / 100`;
  document.getElementById('bias-class').textContent =
    r.biasScore >= 60 ? '🔴 Highly Biased'
    : r.biasScore >= 30 ? '🟡 Moderately Biased'
    : '🟢 Low Bias';
  // Animate bar after small delay
  setTimeout(() => {
    document.getElementById('bias-bar-fill').style.width = `${r.biasScore}%`;
  }, 100);

  /* ─ Tone Card ─ */
  document.getElementById('tone-val').textContent =
    `${TONE_EMOJI[r.tone]} ${r.tone}`;
  document.querySelectorAll('#tone-scale span').forEach(el => {
    el.classList.toggle('active', el.dataset.t === r.tone);
  });
  document.getElementById('tone-conf').textContent =
    `Positive signals: ${r.posHits.length}  ·  Negative signals: ${r.negHits.length}`;

  /* ─ Political Leaning Card ─ */
  document.getElementById('political-val').textContent = r.leaning;
  document.getElementById('political-conf').textContent =
    `Left signals: ${r.polHits.filter(x => LEFT_WORDS.includes(x.toLowerCase())).length}  ·  Right: ${r.polHits.filter(x => RIGHT_WORDS.includes(x.toLowerCase())).length}`;
  setTimeout(() => {
    document.getElementById('leaning-needle').style.left = `${r.leaningPos}%`;
  }, 100);

  /* ─ Text Stats Card ─ */
  document.getElementById('stat-words').textContent   = r.wordCount;
  document.getElementById('stat-sents').textContent   = r.sents;
  document.getElementById('stat-signals').textContent = r.biasHits.length;
  document.getElementById('stat-senti').textContent   = r.totalSentiSignals;

  /* ─ Phrase Tags ─ */
  const grid = document.getElementById('phrases-grid');
  grid.innerHTML = '';

  const addTags = (terms, cls, label) => {
    if (!terms.length) return;
    terms.forEach((t, i) => {
      const span = document.createElement('span');
      span.className = `phrase-tag ${cls}`;
      span.style.animationDelay = `${i * 40}ms`;
      span.textContent = t;
      grid.appendChild(span);
    });
  };
  addTags(r.biasHits, 'bias', 'Bias');
  addTags(r.posHits,  'pos',  'Positive');
  addTags(r.negHits,  'neg',  'Negative');
  addTags(r.polHits,  'pol',  'Political');

  if (!grid.children.length) {
    const empty = document.createElement('span');
    empty.style.cssText = 'color:var(--text-muted);font-size:13px';
    empty.textContent = 'No strong bias or sentiment signals detected.';
    grid.appendChild(empty);
  }

  /* ─ Highlighted Article Preview ─ */
  const preview = document.getElementById('article-preview');
  preview.innerHTML = buildHighlightedHTML(rawText, r.biasHits, r.posHits, r.negHits);
}
