const STORAGE_KEY = "productivity-clock-data-v1";
const GOAL_KEY    = "productivity-clock-goal-v1";
const TOUR_KEY    = "productivity-clock-tour-v1";
const THEME_KEY   = "productivity-clock-theme-v1";
const POMO_KEY    = "productivity-clock-pomo-v1";

// ---- THEMES ----------------------------------------------------------------

const THEMES = {
  warm: {
    "--bg": "#f4f0e8", "--ink": "#1b1b1b", "--muted": "#6b6b6b",
    "--card": "rgba(255,248,240,0.92)", "--stroke": "rgba(241,124,88,0.13)",
    "--surface": "rgba(255,238,222,0.80)",
    "--accent-bg": "rgba(241,124,88,0.14)", "--teal-bg": "rgba(47,143,157,0.12)",
    "--green-bg": "rgba(76,149,108,0.14)",
    "--accent": "#f17c58", "--accent-strong": "#ef6a3f",
    "--teal": "#2f8f9d", "--gold": "#f2c14e", "--green": "#4c956c",
    "--shadow": "0 28px 60px rgba(200,80,30,0.14)",
    "--chart-box": "rgba(18, 14, 32, 0.93)",
  },
  dark: {
    "--bg": "#0d1117", "--ink": "#e6edf3", "--muted": "#8b949e",
    "--card": "rgba(22,27,34,0.94)", "--stroke": "rgba(240,246,252,0.10)",
    "--surface": "rgba(255,255,255,0.05)",
    "--accent-bg": "rgba(255,123,84,0.14)", "--teal-bg": "rgba(57,208,224,0.12)",
    "--green-bg": "rgba(86,201,139,0.13)",
    "--accent": "#ff7b54", "--accent-strong": "#ff5733",
    "--teal": "#39d0e0", "--gold": "#ffd166", "--green": "#56c98b",
    "--shadow": "0 28px 60px rgba(0,0,0,0.5)",
    "--chart-box": "rgba(4, 6, 14, 0.97)",
  },
  ocean: {
    "--bg": "#d8eef8", "--ink": "#0a2640", "--muted": "#3a6080",
    "--card": "rgba(206,240,255,0.91)", "--stroke": "rgba(0,150,199,0.15)",
    "--surface": "rgba(182,228,250,0.76)",
    "--accent-bg": "rgba(0,150,199,0.14)", "--teal-bg": "rgba(0,180,216,0.12)",
    "--green-bg": "rgba(82,183,136,0.14)",
    "--accent": "#0096c7", "--accent-strong": "#0077b6",
    "--teal": "#00b4d8", "--gold": "#48cae4", "--green": "#52b788",
    "--shadow": "0 28px 60px rgba(0,100,180,0.18)",
    "--chart-box": "rgba(4, 18, 48, 0.94)",
  },
  forest: {
    "--bg": "#e4eee0", "--ink": "#1a2e1a", "--muted": "#496050",
    "--card": "rgba(220,242,214,0.92)", "--stroke": "rgba(106,153,78,0.16)",
    "--surface": "rgba(200,232,192,0.78)",
    "--accent-bg": "rgba(106,153,78,0.14)", "--teal-bg": "rgba(82,121,111,0.13)",
    "--green-bg": "rgba(56,102,65,0.15)",
    "--accent": "#6a994e", "--accent-strong": "#386641",
    "--teal": "#52796f", "--gold": "#a7c957", "--green": "#386641",
    "--shadow": "0 28px 60px rgba(50,100,40,0.16)",
    "--chart-box": "rgba(6, 20, 8, 0.94)",
  },
  dusk: {
    "--bg": "#ebe0f8", "--ink": "#2a1a3a", "--muted": "#6a5a7a",
    "--card": "rgba(234,220,255,0.93)", "--stroke": "rgba(157,78,221,0.16)",
    "--surface": "rgba(216,196,252,0.76)",
    "--accent-bg": "rgba(199,125,255,0.15)", "--teal-bg": "rgba(157,78,221,0.13)",
    "--green-bg": "rgba(123,94,167,0.15)",
    "--accent": "#c77dff", "--accent-strong": "#9d4edd",
    "--teal": "#9d4edd", "--gold": "#ff99c8", "--green": "#7b5ea7",
    "--shadow": "0 28px 60px rgba(120,50,200,0.18)",
    "--chart-box": "rgba(18, 6, 36, 0.94)",
  },
};

// Particle colours per theme (r,g,b) + scale multiplier for opacity on light backgrounds
const CANVAS_COLORS = {
  warm:   { r: 180, g:  70, b:  30, scale: 2.8 },
  dark:   { r:  57, g: 208, b: 224, scale: 1.0 },
  ocean:  { r:   0, g:  80, b: 165, scale: 2.8 },
  forest: { r:  35, g: 100, b:  20, scale: 2.8 },
  dusk:   { r: 110, g:  25, b: 195, scale: 2.8 },
};

let canvasRGB = CANVAS_COLORS.warm;

function applyTheme(name) {
  const t = THEMES[name];
  if (!t) return;
  const root = document.documentElement;
  Object.entries(t).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute("data-theme", name);
  canvasRGB = CANVAS_COLORS[name] || CANVAS_COLORS.warm;
  document.querySelectorAll(".theme-dot").forEach((d) =>
    d.classList.toggle("active", d.dataset.theme === name)
  );
  localStorage.setItem(THEME_KEY, name);
}

function initTheme() {
  applyTheme(localStorage.getItem(THEME_KEY) || "warm");
  document.querySelectorAll(".theme-dot").forEach((d) =>
    d.addEventListener("click", () => applyTheme(d.dataset.theme))
  );
}

// ---- TIME OF DAY -----------------------------------------------------------

const TOD_RANGES = [
  [0,  5,  "late-night"],
  [5,  7,  "sunrise"],
  [7,  11, "morning"],
  [11, 14, "midday"],
  [14, 17, "afternoon"],
  [17, 20, "evening"],
  [20, 24, "night"],
];

const TOD_LABELS = {
  "late-night": "Late Night", "sunrise": "Sunrise", "morning": "Morning",
  "midday": "Midday", "afternoon": "Afternoon", "evening": "Evening", "night": "Night",
};

function getCurrentTOD() {
  const h = new Date().getHours();
  for (const [s, e, n] of TOD_RANGES) if (h >= s && h < e) return n;
  return "night";
}

function applyTOD() {
  const tod = getCurrentTOD();
  document.documentElement.setAttribute("data-tod", tod);
  // Update timezone label to also show time of day
  const tz = document.querySelector(".timezone");
  if (tz) tz.textContent = `Local time · ${TOD_LABELS[tod] || ""}`;
}

function initTOD() {
  applyTOD();
  setInterval(applyTOD, 60_000);
}

// ---- CANVAS BACKGROUND ANIMATION ------------------------------------------
// Clock-tick marks (tiny rectangles) float upward like sparks.
// Expanding rings grow from random points and fade — like a clock's ripple.

const PARTICLES = [];

function mkRgba(r, g, b, a) { return `rgba(${r},${g},${b},${a.toFixed(3)})`; }

function mkTick(W, H, randomY) {
  const maxLife = Math.random() * 420 + 180;
  return {
    type: "tick",
    x: Math.random() * W,
    y: randomY ? Math.random() * H : H + 20,
    pw: Math.random() * 1.6 + 0.5,
    ph: Math.random() * 10 + 4,
    angle: Math.random() * Math.PI,
    vx: (Math.random() - 0.5) * 0.28,
    vy: -(Math.random() * 0.55 + 0.18),
    op: 0, maxOp: Math.random() * 0.18 + 0.04,
    life: randomY ? Math.floor(Math.random() * maxLife) : 0,
    maxLife,
  };
}

function mkRing(W, H, randomLife) {
  const maxLife = Math.random() * 260 + 110;
  return {
    type: "ring",
    x: Math.random() * W,
    y: Math.random() * H,
    radius: 0,
    maxRadius: Math.random() * 95 + 35,
    op: 0, maxOp: Math.random() * 0.11 + 0.03,
    life: randomLife ? Math.floor(Math.random() * maxLife) : 0,
    maxLife,
  };
}

function stepTick(p, W, H) {
  p.life++; p.angle += 0.003; p.x += p.vx; p.y += p.vy;
  const t = p.life / p.maxLife;
  p.op = t < 0.15 ? (t / 0.15) * p.maxOp
       : t > 0.78 ? ((1 - t) / 0.22) * p.maxOp
       : p.maxOp;
  if (p.life >= p.maxLife || p.y < -30) Object.assign(p, mkTick(W, H, false));
}

function stepRing(p, W, H) {
  p.life++;
  const t = p.life / p.maxLife;
  p.radius = t * p.maxRadius;
  p.op = (1 - t) * p.maxOp;
  if (p.life >= p.maxLife) Object.assign(p, mkRing(W, H, false));
}

function drawP(p, ctx) {
  const { r, g, b, scale = 1.0 } = canvasRGB;
  const op = Math.min(p.op * scale, 0.55);
  ctx.save();
  if (p.type === "tick") {
    ctx.fillStyle = mkRgba(r, g, b, op);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.fillRect(-p.pw / 2, -p.ph / 2, p.pw, p.ph);
  } else {
    ctx.strokeStyle = mkRgba(r, g, b, op);
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// ---- BUBBLE PARTICLES (mouse-reactive) -------------------------------------

const BUBBLES = [];
const bubbleMouse = { x: null, y: null };

function mkBubble(W, H, randomLife) {
  const maxLife = Math.random() * 700 + 400;
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    radius: Math.random() * 26 + 9,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45,
    wander: Math.random() * Math.PI * 2,  // wandering angle
    op: 0,
    maxOp: Math.random() * 0.55 + 0.25,
    life: randomLife ? Math.floor(Math.random() * maxLife) : 0,
    maxLife,
  };
}

function stepBubble(b, W, H) {
  // Gentle wander force — slowly rotates the bubble's drift direction
  b.wander += (Math.random() - 0.5) * 0.08;
  b.vx += Math.cos(b.wander) * 0.013;
  b.vy += Math.sin(b.wander) * 0.013;

  // Mouse repulsion — pushes bubble away when cursor comes near
  if (bubbleMouse.x !== null) {
    const dx = b.x - bubbleMouse.x, dy = b.y - bubbleMouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const repelR = 110 + b.radius;
    if (dist < repelR && dist > 0.5) {
      const strength = ((repelR - dist) / repelR) * 0.95;
      b.vx += (dx / dist) * strength;
      b.vy += (dy / dist) * strength;
    }
  }

  // Damping + speed cap
  b.vx *= 0.955;
  b.vy *= 0.955;
  const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (spd > 2.2) { b.vx = b.vx / spd * 2.2; b.vy = b.vy / spd * 2.2; }

  b.x += b.vx;
  b.y += b.vy;

  // Soft boundary push (keeps bubbles on screen)
  const m = 40;
  if (b.x < m)     b.vx += 0.18;
  if (b.x > W - m) b.vx -= 0.18;
  if (b.y < m)     b.vy += 0.18;
  if (b.y > H - m) b.vy -= 0.18;

  // Opacity fade in/out over lifetime
  b.life++;
  const fadeTicks = 70;
  if (b.life < fadeTicks)               b.op = (b.life / fadeTicks) * b.maxOp;
  else if (b.life > b.maxLife - fadeTicks) b.op = ((b.maxLife - b.life) / fadeTicks) * b.maxOp;
  else                                  b.op = b.maxOp;

  if (b.life >= b.maxLife) Object.assign(b, mkBubble(W, H, false));
}

function drawBubble(b, ctx) {
  const r = canvasRGB.r, g = canvasRGB.g, bc = canvasRGB.b;
  const op = b.op;
  if (op <= 0.005) return;
  ctx.save();
  ctx.globalAlpha = op;

  // Translucent body — radial gradient off-centre for a 3D feel
  const gx = b.x - b.radius * 0.22, gy = b.y - b.radius * 0.28;
  const grad = ctx.createRadialGradient(gx, gy, 0, b.x, b.y, b.radius);
  grad.addColorStop(0,   `rgba(${r},${g},${bc},0.06)`);
  grad.addColorStop(0.55,`rgba(${r},${g},${bc},0.03)`);
  grad.addColorStop(1,   `rgba(${r},${g},${bc},0.11)`);
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Outer rim
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${r},${g},${bc},0.38)`;
  ctx.lineWidth = 1.1;
  ctx.stroke();

  // Faint inner rim for depth
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.radius * 0.86, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${r},${g},${bc},0.07)`;
  ctx.lineWidth = 0.6;
  ctx.stroke();

  // Primary highlight (top-left)
  ctx.beginPath();
  ctx.arc(b.x - b.radius * 0.27, b.y - b.radius * 0.30, b.radius * 0.21, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.60)";
  ctx.fill();

  // Tiny secondary gleam (bottom-right)
  ctx.beginPath();
  ctx.arc(b.x + b.radius * 0.30, b.y + b.radius * 0.26, b.radius * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fill();

  ctx.restore();
}

// ---- CANVAS ----------------------------------------------------------------

function initCanvas() {
  const cv = document.getElementById("bgCanvas");
  if (!cv) return;
  const ctx = cv.getContext("2d");

  function resize() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Track mouse for bubble repulsion (raw pixels, not normalised)
  window.addEventListener("mousemove", (e) => {
    bubbleMouse.x = e.clientX;
    bubbleMouse.y = e.clientY;
  }, { passive: true });
  window.addEventListener("mouseleave", () => { bubbleMouse.x = bubbleMouse.y = null; }, { passive: true });

  // Touch support — treat touch as "mouse" for repulsion
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      bubbleMouse.x = e.touches[0].clientX;
      bubbleMouse.y = e.touches[0].clientY;
    }
  }, { passive: true });
  window.addEventListener("touchend", () => { bubbleMouse.x = bubbleMouse.y = null; }, { passive: true });

  const W = () => cv.width, H = () => cv.height;
  for (let i = 0; i < 30; i++) PARTICLES.push(mkTick(W(), H(), true));
  for (let i = 0; i <  5; i++) PARTICLES.push(mkRing(W(), H(), true));
  for (let i = 0; i < 15; i++) BUBBLES.push(mkBubble(W(), H(), true));

  (function frame() {
    ctx.clearRect(0, 0, W(), H());
    PARTICLES.forEach((p) => {
      p.type === "tick" ? stepTick(p, W(), H()) : stepRing(p, W(), H());
      drawP(p, ctx);
    });
    BUBBLES.forEach((b) => {
      stepBubble(b, W(), H());
      drawBubble(b, ctx);
    });
    requestAnimationFrame(frame);
  })();
}

// ---- ELEMENTS --------------------------------------------------------------

const elements = {
  hourHand: document.getElementById("hourHand"),
  minuteHand: document.getElementById("minuteHand"),
  secondHand: document.getElementById("secondHand"),
  digitalTime: document.getElementById("digitalTime"),
  digitalDate: document.getElementById("digitalDate"),
  clockFace: document.getElementById("clockFace"),
  startBtn: document.getElementById("startBtn"),
  stopBtn: document.getElementById("stopBtn"),
  clearTodayBtn: document.getElementById("clearTodayBtn"),
  sessionTime: document.getElementById("sessionTime"),
  sessionMeta: document.getElementById("sessionMeta"),
  timerStatus: document.getElementById("timerStatus"),
  todayTotal: document.getElementById("todayTotal"),
  todayPointsSummary: document.getElementById("todayPointsSummary"),
  todayStatusSummary: document.getElementById("todayStatusSummary"),
  todayHours: document.getElementById("todayHours"),
  todayPoints: document.getElementById("todayPoints"),
  todayRating: document.getElementById("todayRating"),
  historyList: document.getElementById("historyList"),
  monthLabel: document.getElementById("monthLabel"),
  prevMonthBtn: document.getElementById("prevMonthBtn"),
  nextMonthBtn: document.getElementById("nextMonthBtn"),
  calendarDays: document.getElementById("calendarDays"),
  selectedDateLabel: document.getElementById("selectedDateLabel"),
  selectedDateHours: document.getElementById("selectedDateHours"),
  selectedDateRating: document.getElementById("selectedDateRating"),
  selectedDatePoints: document.getElementById("selectedDatePoints"),
  reportMonth: document.getElementById("reportMonth"),
  monthHours: document.getElementById("monthHours"),
  monthPoints: document.getElementById("monthPoints"),
  monthPercent: document.getElementById("monthPercent"),
  monthProgress: document.getElementById("monthProgress"),
  monthNote: document.getElementById("monthNote"),
  streakValue: document.getElementById("streakValue"),
  pomoToggleBtn: document.getElementById("pomoToggleBtn"),
  pomoSection: document.getElementById("pomoSection"),
  pomoPhaseLabel: document.getElementById("pomoPhaseLabel"),
  pomoTime: document.getElementById("pomoTime"),
  pomoCyclesNote: document.getElementById("pomoCyclesNote"),
  goalFill: document.getElementById("goalFill"),
  goalEditBtn: document.getElementById("goalEditBtn"),
};

// ---- STATE -----------------------------------------------------------------

const state = {
  currentMonth: new Date(),
  selectedDateKey: getLocalDateKey(new Date()),
  data: loadData(),
  goal: loadGoal(),
  goalCelebrated: false,
  pomo: { enabled: false, phase: "focus", endTime: null, cycles: 0, ...loadPomoSettings() },
};

// Transient session label chosen at start (not persisted mid-session)
let pendingSessionLabel = "";

// ---- PERSISTENCE -----------------------------------------------------------

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const p = JSON.parse(raw);
    return {
      days: p.days || {},
      labels: p.labels || {},
      running: p.running || emptyRunning(),
    };
  } catch { return defaultData(); }
}

function defaultData() {
  return { days: {}, labels: {}, running: emptyRunning() };
}

function emptyRunning() {
  return { isRunning: false, sessionStart: null, activeStart: null, lastDateKey: null };
}

function loadGoal() {
  try {
    const r = localStorage.getItem(GOAL_KEY);
    const v = r ? parseFloat(r) : 8;
    return Number.isFinite(v) && v > 0 ? v : 8;
  }
  catch { return 8; }
}

function saveGoal(v) { localStorage.setItem(GOAL_KEY, String(v)); }
function saveData()  { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data)); }

function loadPomoSettings() {
  try {
    const raw = localStorage.getItem(POMO_KEY);
    if (!raw) return { focusMin: 25, breakMin: 5 };
    const p = JSON.parse(raw);
    return {
      focusMin: (p.focusMin > 0 && p.focusMin <= 99) ? p.focusMin : 25,
      breakMin: (p.breakMin > 0 && p.breakMin <= 99) ? p.breakMin : 5,
    };
  } catch { return { focusMin: 25, breakMin: 5 }; }
}
function savePomoSettings() {
  localStorage.setItem(POMO_KEY, JSON.stringify({ focusMin: state.pomo.focusMin, breakMin: state.pomo.breakMin }));
}
function pomoFocusMs() { return state.pomo.focusMin * 60 * 1000; }
function pomoBreakMs() { return state.pomo.breakMin * 60 * 1000; }

// ---- DATE UTILS ------------------------------------------------------------

function getLocalDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function getMidnight(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function getNextMidnight(dateKey) {
  const mn = getMidnight(dateKey);
  mn.setDate(mn.getDate() + 1);
  return mn;
}

function hoursFromMs(ms) { return ms / 36e5; }
function formatHours(ms) { return hoursFromMs(ms).toFixed(2); }

function formatDuration(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 3600)).padStart(2,"0")}:${String(Math.floor((s % 3600) / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
}

function formatDigitalTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function formatLongDate(date) {
  return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatShortDate(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], { month: "short", day: "numeric" });
}

function ratingForHours(h) {
  if (h < 2)  return { label: "Below average", className: "status-low" };
  if (h < 5)  return { label: "Ok",            className: "status-ok" };
  if (h < 10) return { label: "Good",          className: "status-good" };
  return             { label: "Positive",      className: "status-positive" };
}

// ---- TIME TRACKING ---------------------------------------------------------

function addMsToDay(dateKey, ms) {
  state.data.days[dateKey] = (state.data.days[dateKey] || 0) + ms;
}

function allocateMsAcrossDays(start, end) {
  let cur = new Date(start);
  while (cur < end) {
    const key = getLocalDateKey(cur);
    const nxt = getNextMidnight(key);
    const slice = (end < nxt ? end : nxt) - cur;
    if (slice > 0) addMsToDay(key, slice);
    cur = end < nxt ? end : nxt;
  }
}

function getLiveDayMs(dateKey) {
  let total = state.data.days[dateKey] || 0;
  const r = state.data.running;
  if (r.isRunning && r.lastDateKey === dateKey) {
    const now = new Date(), as = new Date(r.activeStart);
    if (now > as) total += now - as;
  }
  return total;
}

function getMonthTotalMs(year, monthIndex) {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2,"0")}`;
  let total = Object.entries(state.data.days)
    .filter(([k]) => k.startsWith(prefix))
    .reduce((s, [, v]) => s + v, 0);
  const r = state.data.running;
  if (r.isRunning && r.lastDateKey && r.lastDateKey.startsWith(prefix)) {
    const now = new Date(), as = new Date(r.activeStart);
    if (now > as) total += now - as;
  }
  return total;
}

// ---- STREAK ----------------------------------------------------------------

function calculateStreak() {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (getLiveDayMs(getLocalDateKey(d)) > 0) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function refreshStreak() {
  if (!elements.streakValue) return;
  const s = calculateStreak();
  elements.streakValue.textContent = (s === 1 ? "1 day" : `${s} days`) + (s >= 3 ? " 🔥" : "");
}

// ---- GOAL BAR --------------------------------------------------------------

function refreshGoalBar() {
  if (!elements.goalFill || !elements.goalEditBtn) return;
  const ms  = getLiveDayMs(getLocalDateKey(new Date()));
  const goal = state.goal > 0 ? state.goal : 8;
  const pct = Math.min((hoursFromMs(ms) / goal) * 100, 100);
  elements.goalFill.style.width = `${pct.toFixed(1)}%`;
  elements.goalEditBtn.textContent = `${goal} hrs`;
  if (pct >= 100 && !state.goalCelebrated) {
    state.goalCelebrated = true;
    burstConfetti(elements.goalFill);
  } else if (pct < 90) {
    state.goalCelebrated = false;
  }
}

function editGoal() {
  const modal = document.getElementById("goalModal");
  const input = document.getElementById("goalModalInput");
  if (!modal) return;
  input.value = state.goal;
  modal.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    modal.classList.add("open");
    input.focus(); input.select();
  }));
}

function closeGoalModal() {
  const modal = document.getElementById("goalModal");
  if (!modal) return;
  modal.classList.remove("open");
  setTimeout(() => { modal.hidden = true; }, 350);
}

function doSaveGoal() {
  const input = document.getElementById("goalModalInput");
  const n = parseFloat(input.value);
  if (!isNaN(n) && n > 0) { state.goal = n; saveGoal(n); state.goalCelebrated = false; refreshGoalBar(); }
  closeGoalModal();
}

// ---- CONFETTI --------------------------------------------------------------

function burstConfetti(anchor) {
  const colors = ["#f2c14e","#f17c58","#2f8f9d","#4c956c","#ef6a3f","#c3e6cb"];
  const rect = anchor.getBoundingClientRect();
  const cx = rect.left + rect.width * (Math.random() * 0.5 + 0.25);
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 48; i++) {
    const dot = document.createElement("span");
    dot.className = "confetti-dot";
    const angle = (i / 48) * Math.PI * 2 + Math.random() * 0.4;
    const speed = Math.random() * 180 + 60;
    dot.style.setProperty("--tx", `${Math.cos(angle) * speed}px`);
    dot.style.setProperty("--ty", `${Math.sin(angle) * speed - 100}px`);
    dot.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
    dot.style.left = `${cx}px`;
    dot.style.top  = `${cy}px`;
    dot.style.background = colors[i % colors.length];
    dot.style.animationDelay = `${Math.random() * 180}ms`;
    dot.style.width = dot.style.height = `${Math.random() * 7 + 4}px`;
    dot.style.borderRadius = Math.random() > 0.5 ? "50%" : "3px";
    document.body.appendChild(dot);
    dot.addEventListener("animationend", () => dot.remove());
  }
}

// ---- CARD SHIMMER ----------------------------------------------------------

function shimmerCard(cardEl) {
  if (!cardEl) return;
  const el = document.createElement("span");
  el.className = "card-shimmer";
  cardEl.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

// ---- POMODORO --------------------------------------------------------------

function playChime(isFocusEnd) {
  try {
    const AC = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
    const ctx = new AC();
    (isFocusEnd ? [440, 660, 880] : [880, 660]).forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = "sine";
      const t = ctx.currentTime + i * 0.22;
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.start(t); osc.stop(t + 0.45);
    });
  } catch (_) {}
}

function updatePomoDisplay() {
  if (!elements.pomoSection) return;
  const p = state.pomo;
  if (!p.enabled) {
    elements.pomoSection.hidden = true;
    elements.pomoToggleBtn.textContent = "Pomodoro";
    elements.pomoToggleBtn.classList.remove("pomo-active");
    return;
  }
  elements.pomoSection.hidden = false;
  elements.pomoToggleBtn.textContent = "Pomodoro on";
  elements.pomoToggleBtn.classList.add("pomo-active");
  if (p.endTime) {
    const rem = Math.max(0, p.endTime - Date.now());
    elements.pomoTime.textContent = `${String(Math.floor(rem / 60000)).padStart(2,"0")}:${String(Math.floor((rem % 60000) / 1000)).padStart(2,"0")}`;
  } else {
    const fm = String(p.focusMin).padStart(2,"0"), bm = String(p.breakMin).padStart(2,"0");
    elements.pomoTime.textContent = p.phase === "focus" ? `${fm}:00` : `${bm}:00`;
  }
  elements.pomoPhaseLabel.textContent  = p.phase === "focus" ? "Focus" : "Break";
  elements.pomoPhaseLabel.className    = `pomo-phase-label${p.phase === "break" ? " break" : ""}`;
  elements.pomoCyclesNote.textContent  = p.cycles === 1 ? "1 cycle completed" : `${p.cycles} cycles completed`;
}

function tickPomodoro() {
  const p = state.pomo;
  if (!p.enabled || !p.endTime) return;
  if (Date.now() >= p.endTime) {
    if (p.phase === "focus") { p.cycles++; p.phase = "break"; p.endTime = Date.now() + pomoBreakMs(); playChime(true); }
    else                     {             p.phase = "focus"; p.endTime = Date.now() + pomoFocusMs(); playChime(false); }
  }
  updatePomoDisplay();
}

function togglePomodoro() {
  state.pomo.enabled = !state.pomo.enabled;
  if (state.pomo.enabled) {
    state.pomo.phase = "focus"; state.pomo.cycles = 0;
    state.pomo.endTime = state.data.running.isRunning ? Date.now() + pomoFocusMs() : null;
  } else { state.pomo.endTime = null; }
  updatePomoDisplay();
}

// ---- CLOCK -----------------------------------------------------------------

function updateClock() {
  const now = new Date(), s = now.getSeconds(), m = now.getMinutes() + s / 60, h = (now.getHours() % 12) + m / 60;
  elements.secondHand.style.transform = `translateX(-50%) rotate(${s * 6}deg)`;
  elements.minuteHand.style.transform = `translateX(-50%) rotate(${m * 6}deg)`;
  elements.hourHand.style.transform   = `translateX(-50%) rotate(${h * 30}deg)`;
  elements.digitalTime.textContent    = formatDigitalTime(now);
  elements.digitalDate.textContent    = formatLongDate(now);
}

function buildClockTicks() {
  if (!elements.clockFace) return;
  for (let i = 0; i < 60; i++) {
    const t = document.createElement("span");
    t.className = i % 5 === 0 ? "tick bold" : "tick";
    t.style.transform = `translateX(-50%) rotate(${i * 6}deg)`;
    elements.clockFace.appendChild(t);
  }
}

// ---- DISPLAY / SUMMARY -----------------------------------------------------

function refreshTodaySummary() {
  const ms = getLiveDayMs(getLocalDateKey(new Date()));
  const h  = hoursFromMs(ms), r = ratingForHours(h);
  elements.todayTotal.textContent         = `${formatHours(ms)} hrs`;
  elements.todayPointsSummary.textContent = formatHours(ms);
  elements.todayStatusSummary.textContent = r.label;
  elements.todayHours.textContent         = `${formatHours(ms)} hrs`;
  elements.todayPoints.textContent        = formatHours(ms);
  elements.todayRating.textContent        = r.label;
}

function updateSessionDisplay() {
  const run = state.data.running;
  const activeLabel = document.getElementById("sessionActiveLabel");
  if (run.isRunning && run.sessionStart) {
    const start = new Date(run.sessionStart);
    elements.sessionTime.textContent = formatDuration(new Date() - start);
    elements.sessionMeta.textContent = `Started at ${formatDigitalTime(start)}`;
    elements.timerStatus.textContent = "Running";
    elements.timerStatus.className   = "pill running";
    if (activeLabel) activeLabel.textContent = pendingSessionLabel ? `"${pendingSessionLabel}"` : "";
  } else {
    elements.sessionTime.textContent = "00:00:00";
    elements.sessionMeta.textContent = "No active session";
    elements.timerStatus.textContent = "Paused";
    elements.timerStatus.className   = "pill";
    if (activeLabel) activeLabel.textContent = "";
  }
  elements.startBtn.disabled = run.isRunning;
  elements.stopBtn.disabled  = !run.isRunning;
  elements.startBtn.textContent = state.pomo.enabled
    ? (run.isRunning ? "Running…" : "Start Focus")
    : "Start Reading";
}

function refreshHistory() {
  const today = new Date(), items = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = getLocalDateKey(d), ms = getLiveDayMs(key), h = hoursFromMs(ms), r = ratingForHours(h);
    const labels = (state.data.labels && state.data.labels[key]) || [];
    items.push({ key, hours: formatHours(ms), label: r.label, tags: labels });
  }
  elements.historyList.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "history-item";
    const left = document.createElement("div");
    left.append(document.createTextNode(formatShortDate(item.key)));
    left.append(document.createElement("br"));

    const status = document.createElement("span");
    status.textContent = item.label;
    left.append(status);

    if (item.tags.length) {
      const tagsWrap = document.createElement("div");
      tagsWrap.className = "session-tags";
      item.tags.forEach((tagText) => {
        const tag = document.createElement("span");
        tag.className = "session-tag";
        tag.textContent = tagText;
        tagsWrap.appendChild(tag);
      });
      left.append(tagsWrap);
    }

    const right = document.createElement("div");
    right.textContent = `${item.hours} hrs`;

    row.append(left, right);
    elements.historyList.appendChild(row);
  });
}

function renderCalendar() {
  const year = state.currentMonth.getFullYear(), mi = state.currentMonth.getMonth();
  const startWD = new Date(year, mi, 1).getDay();
  const daysInMonth = new Date(year, mi + 1, 0).getDate();
  const daysInPrev  = new Date(year, mi, 0).getDate();
  elements.monthLabel.textContent = state.currentMonth.toLocaleDateString([], { month: "long", year: "numeric" });
  elements.calendarDays.innerHTML = "";
  for (let i = 0; i < 42; i++) {
    const dayNum = i - startWD + 1;
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    let dateKey = null, displayNum = dayNum;
    if (dayNum < 1) { displayNum = daysInPrev + dayNum; cell.classList.add("inactive"); }
    else if (dayNum > daysInMonth) { displayNum = dayNum - daysInMonth; cell.classList.add("inactive"); }
    else {
      dateKey = `${year}-${String(mi + 1).padStart(2,"0")}-${String(dayNum).padStart(2,"0")}`;
      const ms = getLiveDayMs(dateKey), h = hoursFromMs(ms), r = ratingForHours(h);
      if (h > 0) cell.classList.add(r.className);
      if (dateKey === getLocalDateKey(new Date())) cell.classList.add("today");
      if (dateKey === state.selectedDateKey) cell.classList.add("selected");
      if (h > 0) { const hl = document.createElement("span"); hl.className = "day-hours"; hl.textContent = `${formatHours(ms)} hrs`; cell.appendChild(hl); }
    }
    const num = document.createElement("span"); num.className = "day-number"; num.textContent = displayNum;
    cell.prepend(num);
    if (dateKey) cell.dataset.dateKey = dateKey;
    elements.calendarDays.appendChild(cell);
  }
}

function updateDayDetail() {
  const key = state.selectedDateKey, ms = getLiveDayMs(key), h = hoursFromMs(ms), r = ratingForHours(h);
  const [y, m, d] = key.split("-").map(Number), date = new Date(y, m - 1, d);
  elements.selectedDateLabel.textContent = date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  elements.selectedDateHours.textContent = `${formatHours(ms)} hrs`;
  elements.selectedDateRating.textContent = r.label;
  elements.selectedDateRating.className  = `detail-pill ${r.className}`;
  elements.selectedDatePoints.textContent = `${formatHours(ms)} pts`;
}

// ---- MONTHLY CHART ---------------------------------------------------------

let gridHoverDay = -1;

/* ─────────────────────────────────────────────────────────────────────────
   renderMonthChart — LEFT: activity rings   RIGHT: month heatmap grid
   Both are drawn on the same canvas and respond to the current theme.
   ───────────────────────────────────────────────────────────────────────── */
function renderMonthChart() {
  const cv = document.getElementById("monthChart");
  if (!cv) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssW = cv.offsetWidth, cssH = cv.offsetHeight;
  if (!cssW || !cssH) return;
  cv.width = cssW * dpr; cv.height = cssH * dpr;
  const ctx = cv.getContext("2d");
  ctx.scale(dpr, dpr);

  const W = cssW, H = cssH;
  const cs     = getComputedStyle(document.documentElement);
  const accent = cs.getPropertyValue("--accent").trim();
  const teal   = cs.getPropertyValue("--teal").trim();
  const ink    = cs.getPropertyValue("--ink").trim();
  const muted  = cs.getPropertyValue("--muted").trim();
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const trackA = isDark ? 0.12 : 0.09;

  const now = new Date();
  const year = state.currentMonth.getFullYear(), mi = state.currentMonth.getMonth();
  const daysInMonth = new Date(year, mi + 1, 0).getDate();
  const firstDay    = new Date(year, mi, 1).getDay();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === mi;
  const todayD = isCurrentMonth ? now.getDate() : -1;

  // ════════════════════════════════════════════════════════════════════════
  // LEFT PANEL — Activity Rings
  // ════════════════════════════════════════════════════════════════════════
  const RING_W = Math.min(H * 0.96, W * 0.40);
  const cx = RING_W / 2, cy = H / 2;
  const ringSize = Math.min(RING_W, H);

  // Selected day/week hours (from the month currently in view)
  const goal = state.goal > 0 ? state.goal : 8;
  const [sy, sm, sd] = state.selectedDateKey.split("-").map(Number);
  const selectedDate = new Date(sy, (sm || 1) - 1, sd || 1);
  const selectedInViewedMonth = selectedDate.getFullYear() === year && selectedDate.getMonth() === mi;
  const focusDate = selectedInViewedMonth ? selectedDate : new Date(year, mi, isCurrentMonth ? now.getDate() : 1);
  const focusDay = Math.max(1, Math.min(daysInMonth, focusDate.getDate()));

  const dayKey = `${year}-${String(mi + 1).padStart(2,"0")}-${String(focusDay).padStart(2,"0")}`;
  const dayH = hoursFromMs(getLiveDayMs(dayKey));
  const dayPct = dayH / goal; // >1 means over goal

  // Week's hours for selected day (Sun→selected day)
  const wStart = new Date(focusDate); wStart.setDate(focusDate.getDate() - focusDate.getDay()); wStart.setHours(0,0,0,0);
  let weekH = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(wStart); d.setDate(wStart.getDate() + i);
    if (d > focusDate) break;
    const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    weekH += hoursFromMs(getLiveDayMs(k));
  }
  const weekPct = weekH / (goal * 7);

  const outerR = ringSize * 0.34;
  const outerW = ringSize * 0.090;
  const innerR = outerR - outerW - ringSize * 0.038;
  const innerW = outerW * 0.65;
  const clearR = innerR - innerW / 2 - 3; // safe radius for center text

  // Draw one arc ring
  function drawRing(r, w, pct, color) {
    const trackColor = isDark ? `rgba(255,255,255,${trackA})` : `rgba(0,0,0,${trackA})`;
    // Background track
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = trackColor; ctx.lineWidth = w; ctx.lineCap = "butt"; ctx.stroke();
    if (pct <= 0) return;
    // Progress arc (clockwise from 12 o'clock)
    const end = -Math.PI / 2 + Math.min(pct, 1) * Math.PI * 2;
    ctx.save();
    ctx.shadowColor = hexToRgba(color, 0.55); ctx.shadowBlur = w * 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, end);
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.stroke();
    ctx.restore();
    // Over-goal second pass (teal glow overlay)
    if (pct > 1) {
      const end2 = -Math.PI / 2 + Math.min(pct - 1, 1) * Math.PI * 2;
      ctx.save();
      ctx.shadowColor = hexToRgba(teal, 0.60); ctx.shadowBlur = w;
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, end2);
      ctx.strokeStyle = hexToRgba(teal, 0.80); ctx.lineWidth = w * 0.55; ctx.lineCap = "round"; ctx.stroke();
      ctx.restore();
    }
  }

  drawRing(outerR, outerW, dayPct, accent);
  drawRing(innerR, innerW, weekPct,  teal);

  // Center text — all positions kept within clearR
  const bigFz  = Math.max(13, Math.round(clearR * 0.76));
  const lblFz  = Math.max(8,  Math.round(clearR * 0.36));
  const sub1Fz = Math.max(7,  Math.round(clearR * 0.29));
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = ink;
  ctx.font = `700 ${bigFz}px "IBM Plex Mono", monospace`;
  const hDisplay = dayH < 10 ? dayH.toFixed(2) : dayH.toFixed(1);
  ctx.fillText(hDisplay, cx, cy - clearR * 0.28);
  ctx.fillStyle = muted;
  ctx.font = `500 ${lblFz}px "Space Grotesk", sans-serif`;
  ctx.fillText("hrs selected", cx, cy + clearR * 0.22);
  ctx.font = `400 ${sub1Fz}px "Space Grotesk", sans-serif`;
  ctx.fillText(`${Math.min(Math.round(dayPct * 100), 999)}% of ${goal}h`, cx, cy + clearR * 0.60);
  ctx.textBaseline = "alphabetic";

  // Legend (tiny dots + labels at bottom)
  const legY  = H - 9;
  const legDot = Math.max(3.5, ringSize * 0.030);
  ctx.save();
  ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(cx - RING_W * 0.20, legY, legDot, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = muted; ctx.font = `400 ${Math.round(ringSize * 0.062)}px "Space Grotesk", sans-serif`;
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText("Day", cx - RING_W * 0.20 + legDot + 3, legY);
  ctx.fillStyle = teal; ctx.beginPath(); ctx.arc(cx + RING_W * 0.04, legY, legDot, 0, Math.PI * 2); ctx.fill();
  ctx.fillText("Week", cx + RING_W * 0.04 + legDot + 3, legY);
  ctx.textBaseline = "alphabetic";
  ctx.restore();

  // Divider — solid, very subtle
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(RING_W + 8, H * 0.10); ctx.lineTo(RING_W + 8, H * 0.90); ctx.stroke();

  // ════════════════════════════════════════════════════════════════════════
  // RIGHT PANEL — Month Heatmap Grid
  // ════════════════════════════════════════════════════════════════════════
  const GX   = RING_W + 18;
  const GW   = W - GX - 6;
  const HDR  = 16;
  const COLS = 7, ROWS = 6, GAP = 3;
  const cw   = (GW - GAP * (COLS - 1)) / COLS;
  const ch   = (H - HDR - GAP * (ROWS - 1)) / ROWS;
  const cr   = Math.min(cw, ch) * 0.26;

  // Weekday header row
  ["S","M","T","W","T","F","S"].forEach((lbl, i) => {
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)";
    ctx.font = `600 ${Math.round(cw * 0.40)}px "Space Grotesk", sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(lbl, GX + i * (cw + GAP) + cw / 2, HDR / 2);
  });
  ctx.textBaseline = "alphabetic";

  for (let d = 1; d <= daysInMonth; d++) {
    const idx = d - 1 + firstDay;
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);
    const cx2 = GX + col * (cw + GAP);
    const cy2 = HDR + row * (ch + GAP);

    const key = `${year}-${String(mi+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const h   = hoursFromMs(getLiveDayMs(key));
    const isToday   = d === todayD;
    const isFuture  = isCurrentMonth && d > now.getDate();
    const isHovered = d === gridHoverDay;
    const intensity = Math.min(h / goal, 1);

    // ── Cell background ──
    ctx.save();
    if (isToday) {
      ctx.shadowColor = hexToRgba(teal, 0.50); ctx.shadowBlur = 7;
      ctx.fillStyle = h > 0
        ? hexToRgba(teal, 0.18 + intensity * 0.62)
        : hexToRgba(teal, 0.09);
    } else if (h > 0) {
      ctx.fillStyle = hexToRgba(accent, 0.10 + intensity * 0.80);
    } else if (isFuture) {
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)";
    } else {
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
    }
    roundRect(ctx, cx2, cy2, cw, ch, cr); ctx.fill();

    // ── Border ring ──
    if (isToday || isHovered) {
      ctx.strokeStyle = isToday ? hexToRgba(teal, 0.88) : hexToRgba(accent, 0.65);
      ctx.lineWidth = 1.5;
      roundRect(ctx, cx2 + 0.75, cy2 + 0.75, cw - 1.5, ch - 1.5, cr);
      ctx.stroke();
    }
    ctx.restore();

    // ── Day number ──
    const fSz = Math.max(7, Math.round(Math.min(cw, ch) * 0.38));
    ctx.font = `${isToday ? 700 : 400} ${fSz}px "Space Grotesk", sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = isToday
      ? (h > 0 ? "#fff" : hexToRgba(teal, 0.88))
      : h > 0
        ? (intensity > 0.55 ? "rgba(255,255,255,0.90)" : hexToRgba(ink, 0.72))
        : isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)";
    if (cw >= 18 && ch >= 16) ctx.fillText(String(d), cx2 + cw / 2, cy2 + ch / 2);
    ctx.textBaseline = "alphabetic";
  }
}

// Helper: convert a CSS colour (hex or rgb/rgba) to rgba string with given alpha
function hexToRgba(color, alpha) {
  if (!color) return `rgba(150,150,150,${alpha})`;
  if (color.startsWith("#")) {
    const c = color.replace("#", "");
    const full = c.length === 3 ? c.split("").map(x => x + x).join("") : c;
    const r = parseInt(full.slice(0,2),16), g = parseInt(full.slice(2,4),16), b = parseInt(full.slice(4,6),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (color.startsWith("rgb")) {
    return color.replace(/rgba?\(/, "rgba(").replace(/,?\s*[\d.]+\)$/, `,${alpha})`);
  }
  return `rgba(150,150,150,${alpha})`;
}

// Helper: draw rounded rect (fallback for browsers without ctx.roundRect)
function roundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function initMonthChart() {
  const cv = document.getElementById("monthChart");
  const tip = document.getElementById("chartTooltip");
  if (!cv || !tip) return;

  const year = () => state.currentMonth.getFullYear();
  const mi   = () => state.currentMonth.getMonth();

  cv.addEventListener("mousemove", (e) => {
    const rect = cv.getBoundingClientRect();
    const W = rect.width, H = rect.height;

    // Mirror layout constants from renderMonthChart
    const RING_W = Math.min(H * 0.96, W * 0.40);
    const GX     = RING_W + 18;
    const GW     = W - GX - 6;
    const HDR    = 16;
    const COLS   = 7, ROWS = 6, GAP = 3;
    const cw     = (GW - GAP * (COLS - 1)) / COLS;
    const ch     = (H - HDR - GAP * (ROWS - 1)) / ROWS;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Only react in the grid area
    if (mouseX < GX || mouseX > GX + GW || mouseY < HDR) {
      if (gridHoverDay !== -1) { gridHoverDay = -1; tip.hidden = true; renderMonthChart(); }
      return;
    }

    const daysInMonth = new Date(year(), mi() + 1, 0).getDate();
    const firstDay    = new Date(year(), mi(), 1).getDay();
    const gx = mouseX - GX;
    const gy = mouseY - HDR;
    const col = Math.floor(gx / (cw + GAP));
    const row = Math.floor(gy / (ch + GAP));
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
      if (gridHoverDay !== -1) { gridHoverDay = -1; tip.hidden = true; renderMonthChart(); }
      return;
    }
    const d = row * COLS + col - firstDay + 1;
    if (d < 1 || d > daysInMonth) {
      if (gridHoverDay !== -1) { gridHoverDay = -1; tip.hidden = true; renderMonthChart(); }
      return;
    }

    gridHoverDay = d;
    const key  = `${year()}-${String(mi()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const h    = hoursFromMs(getLiveDayMs(key));
    const date = new Date(year(), mi(), d);

    tip.hidden = false;
    document.getElementById("ctDate").textContent =
      date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    document.getElementById("ctVal").textContent = h > 0 ? `${h.toFixed(2)} hrs` : "No data";

    // Position above the cell centre
    tip.style.left = `${GX + col * (cw + GAP) + cw / 2}px`;
    tip.style.top  = `${HDR + row * (ch + GAP)}px`;
    renderMonthChart();
  }, { passive: true });

  cv.addEventListener("mouseleave", () => {
    gridHoverDay = -1;
    tip.hidden = true;
    renderMonthChart();
  }, { passive: true });

  const ro = new ResizeObserver(() => renderMonthChart());
  ro.observe(cv);
}

function updateMonthlyReport() {
  const year = state.currentMonth.getFullYear(), mi = state.currentMonth.getMonth();
  const totalMs = getMonthTotalMs(year, mi), totalH = hoursFromMs(totalMs);
  const daysInMonth = new Date(year, mi + 1, 0).getDate();
  const goal = state.goal > 0 ? state.goal : 8;
  const targetH = goal * daysInMonth;
  const pct = targetH === 0 ? 0 : (totalH / targetH) * 100;
  elements.reportMonth.textContent   = state.currentMonth.toLocaleDateString([], { month: "short", year: "numeric" });
  elements.monthHours.textContent    = `${totalH.toFixed(2)} hrs`;
  elements.monthPoints.textContent   = totalH.toFixed(2);
  elements.monthPercent.textContent  = `${pct.toFixed(1)}%`;
  elements.monthProgress.style.width = `${Math.min(pct, 100).toFixed(1)}%`;
  elements.monthNote.textContent     = `${totalH.toFixed(2)} hrs out of ${targetH.toFixed(2)} goal hrs`;
  renderMonthChart();
}

function refreshAll() {
  refreshTodaySummary(); renderCalendar(); updateDayDetail();
  updateMonthlyReport(); refreshHistory(); refreshStreak(); refreshGoalBar();
}

// ---- DAY-CHANGE HANDLING ---------------------------------------------------

function handleDayChange(now) {
  const r = state.data.running;
  if (!r.isRunning || !r.lastDateKey) return;
  const curKey = getLocalDateKey(now);
  if (curKey === r.lastDateKey) return;
  let changed = false;
  while (r.lastDateKey !== curKey) {
    const lk = r.lastDateKey, mn = getNextMidnight(lk), as = new Date(r.activeStart);
    if (mn > as) addMsToDay(lk, mn - as);
    r.activeStart = mn.toISOString(); r.lastDateKey = getLocalDateKey(mn); changed = true;
  }
  if (changed) { saveData(); refreshAll(); }
}

function tickProductivity() {
  handleDayChange(new Date()); updateSessionDisplay(); refreshTodaySummary(); refreshGoalBar(); refreshStreak();
}

// ---- TIMER ACTIONS ---------------------------------------------------------

function openSessionModal() {
  const modal = document.getElementById("sessionModal");
  const input = document.getElementById("sessionModalInput");
  if (!modal) return;
  input.value = "";
  modal.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    modal.classList.add("open");
    input.focus();
  }));
}

function closeSessionModal() {
  const modal = document.getElementById("sessionModal");
  if (!modal) return;
  modal.classList.remove("open");
  setTimeout(() => { modal.hidden = true; }, 350);
}

function doStartTimer(label) {
  pendingSessionLabel = label.trim();
  const r = state.data.running; if (r.isRunning) return;
  const now = new Date();
  r.isRunning = true; r.sessionStart = r.activeStart = now.toISOString(); r.lastDateKey = getLocalDateKey(now);
  saveData();
  if (state.pomo.enabled) { state.pomo.phase = "focus"; state.pomo.endTime = Date.now() + pomoFocusMs(); updatePomoDisplay(); }
  updateSessionDisplay(); refreshAll();
}

function startTimer() {
  if (state.data.running.isRunning) return;
  openSessionModal();
}

function stopTimer() {
  const r = state.data.running; if (!r.isRunning || !r.activeStart) return;
  const now = new Date(), as = new Date(r.activeStart);
  if (now > as) allocateMsAcrossDays(as, now);
  const label = pendingSessionLabel;
  if (label) {
    if (!state.data.labels) state.data.labels = {};
    const key = getLocalDateKey(now);
    if (!state.data.labels[key]) state.data.labels[key] = [];
    state.data.labels[key].unshift(label);
    state.data.labels[key] = state.data.labels[key].slice(0, 3);
  }
  pendingSessionLabel = "";
  r.isRunning = false;
  r.sessionStart = r.activeStart = r.lastDateKey = null;
  if (state.pomo.enabled) { state.pomo.endTime = null; updatePomoDisplay(); }
  saveData(); updateSessionDisplay(); refreshAll();
  shimmerCard(document.querySelector(".timer-card"));
}

function clearToday() {
  const key = getLocalDateKey(new Date()), r = state.data.running;
  if (!confirm("Clear today's productivity total?")) return;
  state.data.days[key] = 0; state.goalCelebrated = false;
  if (state.data.labels) delete state.data.labels[key];
  if (r.isRunning && r.lastDateKey === key) r.activeStart = new Date().toISOString();
  saveData(); refreshAll();
}

function handleCalendarClick(e) {
  const t = e.target.closest(".calendar-day");
  if (!t || t.classList.contains("inactive") || !t.dataset.dateKey) return;
  state.selectedDateKey = t.dataset.dateKey; renderCalendar(); updateDayDetail();
}

function changeMonth(offset) {
  const next = new Date(state.currentMonth); next.setMonth(next.getMonth() + offset);
  state.currentMonth = next;
  const mk = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2,"0")}`;
  if (!state.selectedDateKey.startsWith(mk)) state.selectedDateKey = `${mk}-01`;
  refreshAll();
}

function catchUpRunningSession() {
  const r = state.data.running;
  if (!r.isRunning || !r.activeStart || !r.sessionStart) return;
  const now = new Date(), as = new Date(r.activeStart);
  if (now > as) { allocateMsAcrossDays(as, now); r.activeStart = now.toISOString(); r.lastDateKey = getLocalDateKey(now); saveData(); }
}

function sanitizeRunningState() {
  const r = state.data.running;
  if (r.isRunning && (!r.sessionStart || !r.activeStart || !r.lastDateKey)) {
    r.isRunning = false; r.sessionStart = r.activeStart = r.lastDateKey = null; saveData();
  }
}

// ---- 3D: CLOCK CARD TILT ---------------------------------------------------

function init3D() {
  const cc = document.querySelector(".clock-card"); if (!cc) return;
  cc.addEventListener("mousemove", (e) => {
    const rect = cc.getBoundingClientRect();
    const rx = -((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * 8;
    const ry =  ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) * 8;
    cc.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
  });
  cc.addEventListener("mouseleave", () => {
    cc.style.transition = "transform 0.55s cubic-bezier(0.23,1,0.32,1)";
    cc.style.transform = "";
    setTimeout(() => { cc.style.transition = ""; }, 600);
  });
  cc.addEventListener("mouseenter", () => { cc.style.transition = "transform 0.12s ease"; });
}

// ---- CARD LIFT + CURSOR SPOTLIGHT ------------------------------------------

function initCardLift() {
  if (window.matchMedia("(hover:none)").matches) return;
  document.querySelectorAll(".card").forEach((el) => {
    el.addEventListener("mouseenter", () => { el.style.transition = "transform 0.14s ease, box-shadow 0.14s ease"; });
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const { r: cr, g: cg, b: cb } = canvasRGB;
      const glow = isDark ? `rgba(255,255,255,0.22)` : `rgba(${cr},${cg},${cb},0.18)`;
      el.style.background  = `radial-gradient(circle at ${x}px ${y}px, ${glow} 0%, transparent 52%), var(--card)`;
      const nx = x / rect.width - 0.5, ny = y / rect.height - 0.5;
      el.style.boxShadow   = `${-nx * 24}px ${24 + Math.abs(ny) * 18}px 64px rgba(17,24,39,0.17), 0 4px 16px rgba(17,24,39,0.08)`;
      el.style.transform   = "translateY(-7px) scale(1.007)";
    });
    el.addEventListener("mouseleave", () => {
      el.style.transition = "all 0.5s cubic-bezier(0.23,1,0.32,1)";
      el.style.background = el.style.boxShadow = el.style.transform = "";
      setTimeout(() => { el.style.transition = ""; }, 550);
    });
  });
}

// ---- PARALLAX ORBS (rAF with idle drift) ------------------------------------

function initParallax() {
  const o1 = document.querySelector(".orb-one"),
        o2 = document.querySelector(".orb-two"),
        o3 = document.querySelector(".orb-three");
  if (!o1 || !o2 || !o3) return;
  let mx = 0, my = 0, ex = 0, ey = 0;
  if (window.DeviceOrientationEvent && window.matchMedia("(hover:none)").matches) {
    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma != null) { mx = Math.max(-1, Math.min(1, e.gamma / 30)); my = Math.max(-1, Math.min(1, (e.beta - 45) / 30)); }
    }, { passive: true });
  } else {
    document.addEventListener("mousemove", (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }
  (function frame() {
    ex += (mx - ex) * 0.038; ey += (my - ey) * 0.038;
    const t = Date.now() / 1000;
    o1.style.transform = `translate(${Math.sin(t * 0.25) * 22 + ex * -44}px, ${Math.cos(t * 0.19) * 18 + ey * -44}px)`;
    o2.style.transform = `translate(${Math.cos(t * 0.18) * 28 + ex *  34}px, ${Math.sin(t * 0.31) * 22 + ey *  34}px)`;
    o3.style.transform = `translate(${Math.sin(t * 0.36 + 1.2) * 16 + ex * -20}px, ${Math.cos(t * 0.27 + 0.8) * 20 + ey * -20}px)`;
    requestAnimationFrame(frame);
  })();
}

// ---- POMODORO TIME SETTINGS ------------------------------------------------

function initPomoSettings() {
  const fi = document.getElementById("pomoFocusInput");
  const bi = document.getElementById("pomoBreakInput");
  if (!fi || !bi) return;
  fi.value = state.pomo.focusMin;
  bi.value = state.pomo.breakMin;

  function apply() {
    const f = parseInt(fi.value, 10), b = parseInt(bi.value, 10);
    if (f > 0 && f <= 99) state.pomo.focusMin = f;
    if (b > 0 && b <= 99) state.pomo.breakMin = b;
    savePomoSettings();
    // If timer is running in focus phase, reschedule to use new time
    if (state.pomo.enabled && state.pomo.phase === "focus" && state.pomo.endTime) {
      const elapsed = pomoFocusMs() - Math.max(0, state.pomo.endTime - Date.now());
      state.pomo.endTime = Date.now() + Math.max(0, pomoFocusMs() - elapsed);
    }
    updatePomoDisplay();
  }

  fi.addEventListener("change", apply);
  bi.addEventListener("change", apply);
  // Sync inputs when pomo section is toggled visible
  const observer = new MutationObserver(() => {
    fi.value = state.pomo.focusMin;
    bi.value = state.pomo.breakMin;
  });
  const section = document.getElementById("pomoSection");
  if (section) observer.observe(section, { attributes: true, attributeFilter: ["hidden"] });
}

// ---- KEYBOARD --------------------------------------------------------------

function initKeyboard() {
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.code === "Space") { e.preventDefault(); state.data.running.isRunning ? stopTimer() : startTimer(); }
    else if (e.code === "Escape") {
      closeSessionModal(); closeGoalModal(); closeTour();
    }
  });
}

// ---- ONE-TIME TOUR ---------------------------------------------------------

const TOUR_STEPS = [
  { selector: null,            emoji: "👋", title: "Welcome to Productivity Clock",
    desc: "Track focus time, build streaks, stay intentional. 30-second tour — or skip anytime." },
  { selector: ".clock-card",   emoji: "🕐", title: "Live Clock",
    desc: "Real-time analog + digital clock. Move your mouse over it — it tilts like a physical object." },
  { selector: ".timer-display",emoji: "▶",  title: "Focus Timer",
    desc: "Hit Start — you'll be asked what you're working on. Hit Space anywhere to start/stop quickly." },
  { selector: "#pomoToggleBtn",emoji: "🍅", title: "Pomodoro Mode",
    desc: "Focus sprints + breaks. Adjust the minutes to match how you like to work, then toggle it on." },
  { selector: ".goal-row",     emoji: "🎯", title: "Daily Goal",
    desc: "Tracks progress toward your daily target. Click the hours to change it. Hit 100% for a surprise." },
  { selector: ".calendar-card",emoji: "📅", title: "Productivity Calendar",
    desc: "Every day is colour-coded. Tap any day to see details. Build those streaks!" },
  { selector: ".report-card",  emoji: "📊", title: "Monthly Report",
    desc: "Your cumulative focus hours for the month. Use it daily and watch the picture grow." },
];

let tourStep = 0;

function positionTourCard(targetEl) {
  const card = document.getElementById("tourCard");
  if (!card) return;
  if (!targetEl) {
    // Welcome step: true centre
    card.style.removeProperty("top");
    card.style.removeProperty("left");
    card.style.removeProperty("transform");
    card.classList.remove("near-target");
    return;
  }
  card.classList.add("near-target");
  const MARGIN = 16, CARD_H = 260, CARD_W = 440;
  const rect = targetEl.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  // Prefer below, fallback to above
  let top = (rect.bottom + MARGIN + CARD_H < vh)
    ? rect.bottom + MARGIN
    : Math.max(MARGIN, rect.top - CARD_H - MARGIN);
  let left = Math.max(MARGIN, Math.min(vw - Math.min(CARD_W, vw - MARGIN * 2) - MARGIN,
    rect.left + rect.width / 2 - Math.min(CARD_W, vw - MARGIN * 2) / 2));
  card.style.top  = `${top}px`;
  card.style.left = `${left}px`;
  card.style.transform = "none";
}

function updateTourSpotlight(selector) {
  const backdrop = document.getElementById("tourOverlay");
  const spotlight = document.getElementById("tourSpotlight");
  const card = document.getElementById("tourCard");
  if (!spotlight || !backdrop) return;

  if (!selector) {
    spotlight.hidden = true;
    spotlight.classList.remove("visible");
    backdrop.classList.remove("spotlit");
    positionTourCard(null);
    return;
  }

  const el = document.querySelector(selector);
  if (!el) {
    spotlight.hidden = true;
    spotlight.classList.remove("visible");
    backdrop.classList.remove("spotlit");
    positionTourCard(null);
    return;
  }

  // Scroll target into view first, then position
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  setTimeout(() => {
    const rect = el.getBoundingClientRect();
    const pad = 10;
    spotlight.hidden = false;
    spotlight.style.top    = `${rect.top  - pad}px`;
    spotlight.style.left   = `${rect.left - pad}px`;
    spotlight.style.width  = `${rect.width  + pad * 2}px`;
    spotlight.style.height = `${rect.height + pad * 2}px`;
    spotlight.classList.add("visible");
    backdrop.classList.add("spotlit");
    positionTourCard(el);
    // Activate card with near-target transform
    requestAnimationFrame(() => { if (card) card.classList.add("active"); });
  }, 280);
}

function initTour() {
  if (localStorage.getItem(TOUR_KEY) === "done") return;
  const backdrop = document.getElementById("tourOverlay");
  const card     = document.getElementById("tourCard");
  if (!backdrop || !card) return;

  document.getElementById("tourNext").addEventListener("click", () => {
    tourStep < TOUR_STEPS.length - 1 ? (tourStep++, renderTourStep()) : closeTour();
  });
  document.getElementById("tourPrev").addEventListener("click", () => {
    tourStep > 0 && (tourStep--, renderTourStep());
  });
  document.getElementById("tourSkip").addEventListener("click", closeTour);

  setTimeout(() => {
    document.body.style.overflow = "hidden";
    backdrop.hidden = false;
    card.hidden = false;
    tourStep = 0;
    renderTourStep();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      backdrop.classList.add("active");
      if (!TOUR_STEPS[0].selector) card.classList.add("active");
    }));
  }, 700);
}

function renderTourStep() {
  const s = TOUR_STEPS[tourStep];
  const card = document.getElementById("tourCard");
  document.getElementById("tourEmoji").textContent   = s.emoji;
  document.getElementById("tourTitle").textContent   = s.title;
  document.getElementById("tourDesc").textContent    = s.desc;
  document.getElementById("tourCounter").textContent = `${tourStep + 1} of ${TOUR_STEPS.length}`;
  const prev = document.getElementById("tourPrev"), next = document.getElementById("tourNext");
  prev.style.visibility = tourStep === 0 ? "hidden" : "visible";
  next.textContent = tourStep === TOUR_STEPS.length - 1 ? "Let's go! 🚀" : "Next →";
  document.getElementById("tourDots").innerHTML = TOUR_STEPS.map((_, i) =>
    `<span class="t-dot${i === tourStep ? " active" : ""}"></span>`).join("");

  // For steps with selectors: briefly fade out card, reposition, fade back in
  if (s.selector && card) {
    card.classList.remove("active");
    setTimeout(() => updateTourSpotlight(s.selector), 120);
  } else {
    updateTourSpotlight(null);
    requestAnimationFrame(() => requestAnimationFrame(() => { if (card) card.classList.add("active"); }));
  }
}

function closeTour() {
  const backdrop = document.getElementById("tourOverlay");
  const spotlight = document.getElementById("tourSpotlight");
  const card = document.getElementById("tourCard");
  if (!backdrop || !backdrop.classList.contains("active")) return;
  localStorage.setItem(TOUR_KEY, "done");
  document.body.style.overflow = "";
  backdrop.classList.remove("active", "spotlit");
  if (spotlight) { spotlight.classList.remove("visible"); }
  if (card) { card.classList.remove("active", "near-target"); }
  setTimeout(() => {
    backdrop.hidden = true;
    if (spotlight) spotlight.hidden = true;
    if (card) card.hidden = true;
  }, 480);
}

// ---- INIT ------------------------------------------------------------------

function init() {
  initTheme();
  initTOD();

  buildClockTicks();
  updateClock();
  setInterval(updateClock, 1000);

  sanitizeRunningState();
  catchUpRunningSession();
  updateSessionDisplay();
  refreshAll();
  updatePomoDisplay();

  elements.startBtn.addEventListener("click", startTimer);
  elements.stopBtn.addEventListener("click", stopTimer);
  elements.clearTodayBtn.addEventListener("click", clearToday);
  elements.calendarDays.addEventListener("click", handleCalendarClick);
  elements.prevMonthBtn.addEventListener("click", () => changeMonth(-1));
  elements.nextMonthBtn.addEventListener("click", () => changeMonth(1));
  elements.pomoToggleBtn.addEventListener("click", togglePomodoro);
  elements.goalEditBtn.addEventListener("click", editGoal);

  // Session modal
  const sessionOk = document.getElementById("sessionModalOk");
  const sessionCancel = document.getElementById("sessionModalCancel");
  const sessionInput = document.getElementById("sessionModalInput");
  if (sessionOk) sessionOk.addEventListener("click", () => {
    const label = sessionInput ? sessionInput.value : "";
    closeSessionModal();
    doStartTimer(label);
  });
  if (sessionCancel) sessionCancel.addEventListener("click", closeSessionModal);
  if (sessionInput) sessionInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); sessionOk && sessionOk.click(); }
  });
  // Close on backdrop click
  document.getElementById("sessionModal")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeSessionModal();
  });

  // Goal modal
  const goalOk = document.getElementById("goalModalOk");
  const goalCancel = document.getElementById("goalModalCancel");
  const goalInput = document.getElementById("goalModalInput");
  if (goalOk) goalOk.addEventListener("click", doSaveGoal);
  if (goalCancel) goalCancel.addEventListener("click", closeGoalModal);
  if (goalInput) goalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); goalOk && goalOk.click(); }
  });
  document.getElementById("goalModal")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeGoalModal();
  });

  setInterval(tickProductivity, 1000);
  setInterval(tickPomodoro, 500);

  init3D();
  initCardLift();
  initParallax();
  initCanvas();
  initKeyboard();
  initPomoSettings();
  initMonthChart();
  initTour();
}

init();
