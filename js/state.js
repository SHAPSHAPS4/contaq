/* ═══ CONTRAQ — STATE ═══
   STATE object, PLAN_LIMITS, plan gating functions
   Lines 7875-8005 from contraq-v77
═══════════════════════════════════════════ */

/* ── Launch Mode: only show wedge features (AI Quote Builder + Quote Book + Clients + Projects) ── */
var LAUNCH_MODE = true; // Set to false to unlock all features
var LAUNCH_UNLOCKED = ['home', 'tenders', 'clients', 'projects', 'settings', 'admin'];
var LAUNCH_LOCKED_PANELS = ['measures', 'diary', 'engineers', 'eco4', 'suppliers', 'pricebook', 'procurement', 'reports', 'invoices', 'finance', 'cis', 'procore'];

var STATE = {
  loggedIn: false,
  user: null,
  currentPanel: 'home',
  regPlan: 'professional',
  obStep: 1,
  editTradeId: null,
  editClientId: null,
  editInvId: null,
  editTenderId: null,
  revenueChart: null,
  settingsSection: 'profile',
  editEventId: null,
  editEngineerId: null,
  editSupplierId: null,
  renewalEngId: null,
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  calSelectedDate: null,
  // P&L goals
  plGoalRevenue: 1400000,
  plGoalMargin: 22,
  plGoalProfit: 308000,
  // Invoice filters
  invFilterMonth: 'all',
  invFilterClient: 'all',
  invFilterProject: 'all',
  invFilterStatus: 'all',
  // v6
  viewClientId: null,
  poCounters: {INS:3,DUC:1,TRC:1,ELC:0,PLB:0,MEC:1,FIX:1,OTH:0},
  // v7
  viewProjectId: null,
  editMeasureId: null,
  measuresView: 'grid',
  notifPanelOpen: false,
  projClientFilter: 'all',
  proj6mFilter: false,
  // Procurement filters
  procClientFilter: 'all',
  procProjectFilter: 'all',
  currentPOId: null,
  docUploadContext: null,
  journalEditId: null,
  journalProjectId: null,
  qfUploadTenderId: null,
  folderUploadCtx: null,
  // v8 — trade selection
  selectedTrades: [],
  tradePrimary: 'insulation',
  dashMode: 'focus',
  roiDismissed: {},
  setupComplete: false,
  setupSteps: {
    addClient: false,
    addQuote: false,
    addProject: false,
    addEngineer: false,
    raiseInvoice: false
  },
  aiQuotesUsedThisMonth: 0,
  anthropicApiKey: ''
};

/* ── Backend API proxy base URL ───────────────────────────────── */
// In production (Railway), API is on the same origin — use empty string
// In local dev, API runs on port 3001
var CONTRAQ_API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3001'
  : '';

/* ── Load persisted settings from localStorage ─────────────── */
try {
  var _savedKey = localStorage.getItem('contraq_anthropic_key');
  if (_savedKey) STATE.anthropicApiKey = _savedKey;
  var _savedNotif = localStorage.getItem('contraq_notif_prefs');
  if (_savedNotif) STATE.notifPrefs = JSON.parse(_savedNotif);
  var _savedPlatform = localStorage.getItem('contraq_platform_settings');
  if (_savedPlatform) STATE.platformSettings = JSON.parse(_savedPlatform);
} catch(e) { /* localStorage unavailable */ }

/* ══════════════════════════════════════════════════════════════
   PLAN LIMITS & SOFT GATES
══════════════════════════════════════════════════════════════ */
var PLAN_LIMITS = {
  starter:      { users: 2, projects: 5,  aiQuotes: 3,  hasCIS: false, hasFinance: false, hasProcore: false, storage: '5 GB' },
  professional: { users: 5, projects: 20, aiQuotes: Infinity, hasCIS: true,  hasFinance: true,  hasProcore: false, storage: '25 GB' },
  business:     { users: Infinity, projects: Infinity, aiQuotes: Infinity, hasCIS: true,  hasFinance: true,  hasProcore: true,  storage: 'Unlimited' }
};

function getUserPlan() {
  if (!STATE.user) return 'professional';
  return STATE.user.plan || 'professional';
}

function getPlanLimits() {
  return PLAN_LIMITS[getUserPlan()] || PLAN_LIMITS.professional;
}

function checkPlanGate(feature, currentCount) {
  var limits = getPlanLimits();
  var plan = getUserPlan();
  if (plan === 'business') return { allowed: true };
  if (plan === 'professional' && feature !== 'procore') return { allowed: true };

  switch(feature) {
    case 'aiQuote':
      if (currentCount >= limits.aiQuotes) return { allowed: false, title: 'AI Quote limit reached', desc: 'Your Starter plan includes 3 AI quotes per month. Upgrade to Professional for unlimited AI-powered scope extraction.', upgradeTo: 'professional' };
      return { allowed: true };
    case 'project':
      if (currentCount >= limits.projects) return { allowed: false, title: 'Project limit reached', desc: 'Your Starter plan includes 5 active projects. Upgrade to Professional for up to 20 projects and full commercial tools.', upgradeTo: 'professional' };
      return { allowed: true };
    case 'user':
      if (currentCount >= limits.users) return { allowed: false, title: 'User limit reached', desc: 'Your Starter plan includes 2 users. Upgrade to Professional to add your whole team — up to 5 users included.', upgradeTo: 'professional' };
      return { allowed: true };
    case 'cis':
      if (!limits.hasCIS) return { allowed: false, title: 'CIS compliance is a Professional feature', desc: 'CIS deduction tracking, monthly returns, and HMRC verification are available on Professional and above. Most M&E subs need this — upgrade to unlock.', upgradeTo: 'professional' };
      return { allowed: true };
    case 'finance':
      if (!limits.hasFinance) return { allowed: false, title: 'Finance module is a Professional feature', desc: 'Invoice register, purchase orders, P&L tracking, and payment application chasing are available on Professional and above.', upgradeTo: 'professional' };
      return { allowed: true };
    case 'procore':
      if (!limits.hasProcore) return { allowed: false, title: 'Procore integration is a Business feature', desc: 'Direct Procore marketplace integration with two-way sync is available on the Business plan.', upgradeTo: 'business' };
      return { allowed: true };
    default:
      return { allowed: true };
  }
}

function showUpgradePrompt(gate) {
  var modal = document.getElementById('modal-upgrade-prompt');
  if (!modal) return;
  document.getElementById('upgrade-prompt-title').textContent = gate.title || 'Upgrade your plan';
  document.getElementById('upgrade-prompt-desc').textContent = gate.desc || 'Upgrade to unlock this feature.';
  var target = gate.upgradeTo || 'professional';
  var price = target === 'business' ? '£349' : '£149';
  var planLabel = target === 'business' ? 'Business' : 'Professional';
  document.getElementById('upgrade-prompt-plan').textContent = planLabel + ' — ' + price + '/mo';
  document.getElementById('upgrade-prompt-btn').onclick = function() {
    closeModal('modal-upgrade-prompt');
    selectPlanAndRegister(target);
  };
  openModal('modal-upgrade-prompt');
}


/* ══════════════════════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════════════════════ */
