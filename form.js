const OFFICE = "office@readywellpsych.com";
const SCALE = { 0: "Not at all", 1: "Just a little", 2: "Pretty much", 3: "Very much" };
const SECTIONS = [
  { key: "I", title: "I. INATTENTION / DISTRACTIBILITY", items: [
    "A short attention span, especially for lo-interest activities.",
    "Difficulty competing tasks.",
    "Daydreaming.",
    "Easily distracted.",
    "Nicknames such as: \"spacey\" or \"dreamer\".",
    "Engages in much activity but accomplishes little.",
    "Enthusiastic beginnings but poor endings."
  ]},
  { key: "II", title: "II. IMPULSIVITY", items: [
    "Excitability.",
    "Low frustration tolerance.",
    "Acts before thinking.",
    "Disorganization.",
    "Poor planning ability.",
    "Excessively shifts from one activity to another.",
    "Difficulty in group situations which require patience and taking turns.",
    "Interrupts frequently."
  ]},
  { key: "III", title: "III. ACTIVITY LEVEL PROBLEMS", groups: [
    { sub: "A", title: "A. Overactivity / hyperactivity", items: [
      "Restlessness - either fidgeting or being constantly on the go.",
      "Diminished need for sleep.",
      "Excessive talking.",
      "Difficulty listening.",
      "Restlessness during sleep. Kicks covers off - moves constantly.",
      "Dislike of situations which require attention and being still."
    ]},
    { sub: "B", title: "B. Underactivity", items: [
      "Lethargic",
      "Daydreaming, spiciness.",
      "Failure to complete tasks.",
      "Inattention.",
      "Lacking in leadership.",
      "Difficulty in getting things done."
    ]}
  ]},
  { key: "IV", title: "IV. NONCOMPLIANCE", items: [
    "Does not cooperate. Determined to do things own way.",
    "Argumentative.",
    "Disregards socially-accepted behavioral expectations.",
    "\"Forgets\" unintentionally.",
    "\"Forgets\" as an excuse (intentionally)."
  ]},
  { key: "V", title: "V. UNDERACHIEVEMENT / DISORGANIZATION / LEARNING PROBLEMS", items: [
    "Underachievement in relation to ability.",
    "Frequent job changes.",
    "Loses things - keys, wallet, lists, belongings, etc.",
    "Auditory memory and auditory processing problems.",
    "Learning disabilities or learning problems.",
    "Poor handwriting.",
    "\"Messy\" or \"sloppy\" work.",
    "Work assignments are often not completed satisfactorily.",
    "Rushes through work.",
    "Works too slowly",
    "Procrastinates. Bills, taxes, etc., put off until the last minute."
  ]},
  { key: "VI", title: "VI. EMOTIONAL DIFFICULTIES", items: [
    "Frequent and unpredictable mood swings.",
    "Irritability.",
    "Underreactive to pain / insensitive to danger.",
    "Easily overstimulated. Hard to stop once \"revved\" up.",
    "Low frustration tolerance. Excessive emotional reaction.",
    "Angry outbursts.",
    "Moodiness / lack of energy.",
    "Low self-esteem",
    "Immaturity."
  ]},
  { key: "VII", title: "VII. POOR PEER RELATIONS", items: [
    "Difficulty following the rules of social interactions.",
    "Rejected or avoided by peers.",
    "Avoids group activity. A loner.",
    "\"Bosses\" other people. Wants to be a leader.",
    "Critical of others."
  ]},
  { key: "VIII", title: "VIII. IMPAIRED FAMILY RELATIONS", items: [
    "Easily frustrated with spouse or children. Overreacts. May punish children too severely.",
    "Sees things from own point of view. Does not negotiate differences well.",
    "Underdeveloped sense of responsibility.",
    "Poor manager of money.",
    "Unreasonable; demanding.",
    "Spends excessive amount of time at work because of inefficiency, leaving little time for family."
  ]}
];

// Flatten: each item gets a field name and a display code like "III.A.2"
const ITEMS = [];
SECTIONS.forEach(s => {
  const groups = s.groups || [{ sub: "", title: "", items: s.items }];
  groups.forEach(g => g.items.forEach((text, i) => {
    const code = s.key + "." + (g.sub ? g.sub + "." : "") + (i + 1);
    ITEMS.push({ sec: s.key, code, text, field: "Q" + (ITEMS.length + 1) });
  }));
});

const root = document.getElementById("sections");
SECTIONS.forEach(s => {
  const groups = s.groups || [{ sub: "", title: "", items: s.items }];
  let h = `<div class="card"><h2>${s.title}</h2>`;
  groups.forEach(g => {
    if (g.title) h += `<h3 style="margin:1rem 0 .4rem">${g.title}</h3>`;
    g.items.forEach((text, i) => {
      const it = ITEMS.find(x => x.code === s.key + "." + (g.sub ? g.sub + "." : "") + (i + 1));
      h += `<div class="item"><p><span class="code">${i + 1}.</span> ${text}</p>
        <div class="scale four">${[0,1,2,3].map(v => `<label><input type="radio" name="${it.field}" value="${v}" required> <span class="num">${v}</span><small>${SCALE[v]}</small></label>`).join("")}</div></div>`;
    });
  });
  h += `</div>`;
  root.insertAdjacentHTML("beforeend", h);
});
document.getElementById("date").valueAsDate = new Date();

function num(name) {
  const el = document.querySelector(`[name="${name}"]:checked`);
  return el ? Number(el.value) : null;
}
// Bands exactly as printed on the clinic form. Ranges the form does not cover are labeled as such.
function bandFor(pct) {
  if (pct >= 35 && pct <= 49) return "35-49%: suggests mild to moderate difficulties";
  if (pct >= 50 && pct <= 69) return "50-69%: suggests moderate to severe difficulties";
  if (pct > 70) return "Above 70%: suggests major interference";
  if (pct < 35) return "Below 35%: below the ranges listed on the form";
  return "70%: between the form's listed ranges (50-69% and above 70%)";
}

function compute() {
  const ratings = ITEMS.map(it => num(it.field));
  if (ratings.some(v => v === null)) return null;
  const subs = SECTIONS.map(s => {
    const idx = ITEMS.map((it, i) => it.sec === s.key ? i : -1).filter(i => i >= 0);
    const score = idx.reduce((a, i) => a + ratings[i], 0);
    const max = idx.length * 3;
    const pct = Math.round(score / max * 100);
    return { key: s.key, title: s.title, n: idx.length, score, max, pct, band: bandFor(pct) };
  });
  const total = ratings.reduce((a, b) => a + b, 0);
  return { ratings, subs, total, max: ITEMS.length * 3 };
}

function score(opts) {
  opts = opts || {};
  const name = document.getElementById("name").value.trim();
  if (!name) { alert("Please enter initials."); document.getElementById("name").focus(); return; }
  const r = compute();
  if (!r) { alert("Please mark every item (0-3)."); return; }
  const date = document.getElementById("date").value || "";
  const visit = document.getElementById("visit").value || "not given";
  const by = document.getElementById("by").value;

  let html = `
    <div class="score-row"><span>Initials</span><strong>${name}</strong></div>
    <div class="score-row"><span>Completed</span><strong>${date || "not dated"}</strong></div>
    <div class="score-row"><span>Completed by</span><strong>${by}</strong></div>
    <div class="score-row"><span>Next visit</span><strong>${visit}</strong></div>`;
  r.subs.forEach(s => {
    html += `<div class="score-row"><span>${s.title}</span><strong>${s.score} / ${s.max} · ${s.pct}%<br><small>${s.band}</small></strong></div>`;
  });
  html += `<div class="score-row"><span>All items (not a form category)</span><strong>${r.total} / ${r.max}</strong></div>`;
  document.getElementById("resultBody").innerHTML = html;

  document.getElementById("itemList").innerHTML = "<p class=\"hint\">Every item and the rating selected</p>" +
    ITEMS.map((it, i) => `<div class="item"><p><span class="code">${it.code}</span> ${it.text}</p><p class="ans">Answer: ${r.ratings[i]} · ${SCALE[r.ratings[i]]}</p></div>`).join("");

  const lines = [
    "Copeland Symptom List, Adult Attention Deficit Disorder (63 items)",
    "Initials: " + name,
    "Completed: " + (date || "n/a"),
    "Completed by: " + by,
    "Next visit: " + visit,
    "",
    "Category scores (score / possible, percent, band per form):"
  ];
  r.subs.forEach(s => lines.push(s.title + ": " + s.score + " / " + s.max + " = " + s.pct + "% · " + s.band));
  lines.push("All items: " + r.total + " / " + r.max + " (not a form category)");
  lines.push("", "Scoring: Not at all = 0, Just a little = 1, Pretty much = 2, Very much = 3. 35-49% mild to moderate, 50-69% moderate to severe, above 70% major interference.", "", "Item, rating, label");
  ITEMS.forEach((it, i) => { lines.push(""); lines.push(it.code + " " + it.text); lines.push("Answer: " + r.ratings[i] + "  " + SCALE[r.ratings[i]]); });
  window._ocsSummary = lines.join("\n");
  window._meta = { name, date, visit, by, r };
  document.getElementById("summaryBox").value = window._ocsSummary;
  document.getElementById("results").classList.add("show");
  document.getElementById("results").scrollIntoView({ behavior: "smooth" });
  if (opts.send) sendOffice();
  return true;
}

var SENT_KEY = "copeland.v1.sent";
var sending = false;
function isSent() {
  try { if (localStorage.getItem(SENT_KEY) === "1") return true; } catch (e) {}
  return document.cookie.split("; ").some(function (p) { return p === SENT_KEY + "=1"; });
}
function markSent() {
  try { localStorage.setItem(SENT_KEY, "1"); } catch (e) {}
  document.cookie = SENT_KEY + "=1;max-age=" + (60 * 60 * 24 * 14) + ";path=/;SameSite=Lax";
}
function showThanks() {
  const btn = document.getElementById("scoreBtn");
  btn.disabled = true;
  btn.style.display = "none";
  if (!document.getElementById("thanksBox")) {
    const t = document.createElement("div");
    t.id = "thanksBox";
    t.setAttribute("role", "status");
    t.style.cssText = "margin:16px 0;padding:20px;border:2px solid #2e7d32;border-radius:12px;background:#eef7ee;font-size:18px;line-height:1.5;";
    t.innerHTML = "<strong>Thank you.</strong> Your answers were sent to the office. You can close this page.";
    const actions = document.querySelector(".actions");
    actions.parentNode.insertBefore(t, actions);
  }
  const status = document.getElementById("copyStatus");
  if (status) status.textContent = "";
}

function sendOffice() {
  if (!window._ocsSummary || sending || isSent()) return;
  sending = true;
  const m = window._meta || {};
  const btn = document.getElementById("scoreBtn");
  const status = document.getElementById("copyStatus");
  btn.disabled = true;
  btn.textContent = "Sending\u2026";
  status.textContent = "";
  const body = {
    _subject: "FOR REVIEW : Copeland Symptom List (Adult ADD)",
    _template: "box",
    _captcha: "false",
    _cc: ["yuriyb", "mail.grokbot.com"].join("@"),
    initials: m.name || "",
    date: m.date || "",
    completed_by: m.by || "",
    visit: m.visit || ""
  };
  m.r.subs.forEach(s => { body["cat_" + s.key] = s.score + " / " + s.max + " = " + s.pct + "% (" + s.band + ")"; });
  body.all_items = m.r.total + " / " + m.r.max;
  body.message = window._ocsSummary;
  fetch("https://formsubmit.co/ajax/" + OFFICE, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(body)
  }).then(r => r.json()).then(d => {
    if (d && (d.success === true || d.success === "true")) { markSent(); showThanks(); }
    else throw new Error("not sent");
  }).catch(() => {
    sending = false;
    btn.disabled = false;
    btn.textContent = "Retry sending";
    status.textContent = "Your answers did not send. Please check your connection and press Retry sending.";
  });
}

function copySummary() {
  if (!score({ send: false })) return false;
  const box = document.getElementById("summaryBox");
  const status = document.getElementById("copyStatus");
  box.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (e) {}
  if (!ok && navigator.clipboard) {
    navigator.clipboard.writeText(window._ocsSummary).then(() => { status.textContent = "Summary copied."; })
      .catch(() => { status.textContent = "Select the box and copy (Ctrl+C or Cmd+C)."; });
    return true;
  }
  status.textContent = ok ? "Summary copied." : "Select the box and copy (Ctrl+C or Cmd+C).";
  return ok;
}

document.getElementById("scoreBtn").onclick = function () { if (isSent()) { showThanks(); return; } score({ send: true }); };
document.getElementById("copyBtn").onclick = copySummary;
document.getElementById("printBtn").onclick = () => { if (score({ send: false })) window.print(); };
if (isSent()) showThanks();
