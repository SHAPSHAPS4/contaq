/* ═══ CONTRAQ — API CLIENT ═══
   Central data access layer. All frontend modules use this
   to fetch/save data. Routes to real API when logged in with
   a real account, falls back to mock arrays for demo mode.
═══════════════════════════════════════════════════════════════ */

var ContraqAPI = (function() {

  // ─── Helpers ──────────────────────────────────────────────
  function isRealUser() {
    return CONTRAQ_SESSION && CONTRAQ_SESSION.token && STATE.user && STATE.user.orgId;
  }

  function headers() {
    return typeof getAuthHeader === 'function' ? getAuthHeader() : { 'Content-Type': 'application/json' };
  }

  function apiUrl(path) {
    return CONTRAQ_API_BASE + '/api/data' + path;
  }

  function handleResponse(resp) {
    return resp.json().then(function(data) {
      if (!resp.ok) throw new Error(data.error || 'API error');
      return data;
    });
  }

  // ─── DASHBOARD ────────────────────────────────────────────
  function getDashboard() {
    if (!isRealUser()) {
      // Demo mode — calculate from mock arrays
      return Promise.resolve({
        stats: {
          activeProjects: PROJECTS.filter(function(p) { return p.status === 'active'; }).length,
          openQuotes: TENDERS.filter(function(t) { return t.status === 'submitted' || t.status === 'draft'; }).length,
          wonQuotes: TENDERS.filter(function(t) { return t.status === 'won'; }).length,
          winRate: Math.round((TENDERS.filter(function(t) { return t.status === 'won'; }).length / Math.max(TENDERS.length, 1)) * 100),
          overdueInvoices: INVOICES.filter(function(i) { return i.status === 'overdue'; }).length,
          pipelineValue: TENDERS.filter(function(t) { return t.status === 'submitted'; }).reduce(function(s, t) { return s + (t.value || 0); }, 0),
          activeEngineers: ENGINEERS.filter(function(e) { return e.status === 'active'; }).length,
          totalProjects: PROJECTS.length,
          totalQuotes: TENDERS.length,
          totalInvoices: INVOICES.length
        },
        activity: ACTIVITY_LOG.slice(0, 10)
      });
    }
    return fetch(apiUrl('/dashboard'), { headers: headers() }).then(handleResponse);
  }

  // ─── PROJECTS ─────────────────────────────────────────────
  function getProjects(opts) {
    if (!isRealUser()) return Promise.resolve(PROJECTS);
    var url = '/projects';
    if (opts && opts.status) url += '?status=' + opts.status;
    return fetch(apiUrl(url), { headers: headers() }).then(handleResponse);
  }

  function getProject(id) {
    if (!isRealUser()) return Promise.resolve(PROJECTS.find(function(p) { return p.id === id; }));
    return fetch(apiUrl('/projects/' + id), { headers: headers() }).then(handleResponse);
  }

  function saveProject(data) {
    if (!isRealUser()) {
      if (data.id) {
        var idx = PROJECTS.findIndex(function(p) { return p.id === data.id; });
        if (idx >= 0) Object.assign(PROJECTS[idx], data);
        return Promise.resolve(PROJECTS[idx]);
      }
      data.id = 'p' + Date.now();
      PROJECTS.push(data);
      return Promise.resolve(data);
    }
    if (data.id) {
      return fetch(apiUrl('/projects/' + data.id), { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
    }
    return fetch(apiUrl('/projects'), { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
  }

  // ─── QUOTES / TENDERS ─────────────────────────────────────
  function getQuotes(opts) {
    if (!isRealUser()) return Promise.resolve(TENDERS);
    var url = '/quotes';
    if (opts && opts.status) url += '?status=' + opts.status;
    return fetch(apiUrl(url), { headers: headers() }).then(handleResponse);
  }

  function saveQuote(data) {
    if (!isRealUser()) {
      if (data.id) {
        var idx = TENDERS.findIndex(function(t) { return t.id === data.id; });
        if (idx >= 0) Object.assign(TENDERS[idx], data);
        return Promise.resolve(TENDERS[idx]);
      }
      data.id = 't' + Date.now();
      TENDERS.push(data);
      return Promise.resolve(data);
    }
    if (data.id) {
      return fetch(apiUrl('/quotes/' + data.id), { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
    }
    return fetch(apiUrl('/quotes'), { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
  }

  function getQuoteItems(quoteId) {
    if (!isRealUser()) return Promise.resolve([]);
    return fetch(apiUrl('/quotes/' + quoteId + '/items'), { headers: headers() }).then(handleResponse);
  }

  function saveQuoteItems(quoteId, items) {
    if (!isRealUser()) return Promise.resolve(items);
    return fetch(apiUrl('/quotes/' + quoteId + '/items'), { method: 'POST', headers: headers(), body: JSON.stringify({ items: items }) }).then(handleResponse);
  }

  // ─── INVOICES ─────────────────────────────────────────────
  function getInvoices(opts) {
    if (!isRealUser()) return Promise.resolve(INVOICES);
    var url = '/invoices';
    if (opts && opts.status) url += '?status=' + opts.status;
    return fetch(apiUrl(url), { headers: headers() }).then(handleResponse);
  }

  function saveInvoice(data) {
    if (!isRealUser()) {
      if (data.id) {
        var idx = INVOICES.findIndex(function(i) { return i.id === data.id; });
        if (idx >= 0) Object.assign(INVOICES[idx], data);
        return Promise.resolve(INVOICES[idx]);
      }
      data.id = 'inv' + Date.now();
      INVOICES.push(data);
      return Promise.resolve(data);
    }
    if (data.id) {
      return fetch(apiUrl('/invoices/' + data.id), { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
    }
    return fetch(apiUrl('/invoices'), { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
  }

  // ─── CLIENTS ──────────────────────────────────────────────
  function getClients() {
    if (!isRealUser()) return Promise.resolve(CLIENTS);
    return fetch(apiUrl('/clients'), { headers: headers() }).then(handleResponse);
  }

  function saveClient(data) {
    if (!isRealUser()) {
      if (!data.id) { data.id = 'cl' + Date.now(); CLIENTS.push(data); }
      return Promise.resolve(data);
    }
    return fetch(apiUrl('/clients'), { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
  }

  // ─── ENGINEERS ────────────────────────────────────────────
  function getEngineers() {
    if (!isRealUser()) return Promise.resolve(ENGINEERS);
    return fetch(apiUrl('/engineers'), { headers: headers() }).then(handleResponse);
  }

  function saveEngineer(data) {
    if (!isRealUser()) {
      if (!data.id) { data.id = 'e' + Date.now(); ENGINEERS.push(data); }
      return Promise.resolve(data);
    }
    return fetch(apiUrl('/engineers'), { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
  }

  // ─── SUPPLIERS ────────────────────────────────────────────
  function getSuppliers() {
    if (!isRealUser()) return Promise.resolve(SUPPLIERS);
    return fetch(apiUrl('/suppliers'), { headers: headers() }).then(handleResponse);
  }

  // ─── JOURNAL ──────────────────────────────────────────────
  function getJournal(opts) {
    if (!isRealUser()) return Promise.resolve(typeof JOURNAL_ENTRIES !== 'undefined' ? JOURNAL_ENTRIES : []);
    var url = '/journal';
    if (opts && opts.projectId) url += '?projectId=' + opts.projectId;
    return fetch(apiUrl(url), { headers: headers() }).then(handleResponse);
  }

  function saveJournalEntry(data) {
    if (!isRealUser()) return Promise.resolve(data);
    return fetch(apiUrl('/journal'), { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
  }

  // ─── SCHEDULE ─────────────────────────────────────────────
  function getSchedule(opts) {
    if (!isRealUser()) return Promise.resolve(CALENDAR_EVENTS);
    var url = '/schedule';
    if (opts && opts.startDate) url += '?startDate=' + opts.startDate;
    if (opts && opts.endDate) url += (url.includes('?') ? '&' : '?') + 'endDate=' + opts.endDate;
    return fetch(apiUrl(url), { headers: headers() }).then(handleResponse);
  }

  // ─── EXTRACTIONS ──────────────────────────────────────────
  function saveExtraction(data) {
    if (!isRealUser()) return Promise.resolve(data);
    return fetch(apiUrl('/extractions'), { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
  }

  function getExtractions(opts) {
    if (!isRealUser()) return Promise.resolve([]);
    var url = '/extractions';
    if (opts && opts.quoteId) url += '?quoteId=' + opts.quoteId;
    return fetch(apiUrl(url), { headers: headers() }).then(handleResponse);
  }

  // ─── LEARNED RULES ────────────────────────────────────────
  function getLearnedRules() {
    if (!isRealUser()) return Promise.resolve(typeof LEARNED_RULES !== 'undefined' ? LEARNED_RULES : []);
    return fetch(apiUrl('/rules'), { headers: headers() }).then(handleResponse);
  }

  function saveLearnedRule(data) {
    if (!isRealUser()) return Promise.resolve(data);
    return fetch(apiUrl('/rules'), { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
  }

  // ─── PRICEBOOK ────────────────────────────────────────────
  function getPricebook(opts) {
    if (!isRealUser()) return Promise.resolve(typeof PRICEBOOK !== 'undefined' ? PRICEBOOK : []);
    var url = '/pricebook';
    if (opts && opts.category) url += '?category=' + opts.category;
    return fetch(apiUrl(url), { headers: headers() }).then(handleResponse);
  }

  // ─── ACTIVITY LOG ─────────────────────────────────────────
  function getActivity(limit) {
    if (!isRealUser()) return Promise.resolve(ACTIVITY_LOG.slice(0, limit || 20));
    return fetch(apiUrl('/activity?limit=' + (limit || 20)), { headers: headers() }).then(handleResponse);
  }

  // ─── PUBLIC API ───────────────────────────────────────────
  return {
    isRealUser: isRealUser,
    getDashboard: getDashboard,
    getProjects: getProjects,
    getProject: getProject,
    saveProject: saveProject,
    getQuotes: getQuotes,
    saveQuote: saveQuote,
    getQuoteItems: getQuoteItems,
    saveQuoteItems: saveQuoteItems,
    getInvoices: getInvoices,
    saveInvoice: saveInvoice,
    getClients: getClients,
    saveClient: saveClient,
    getEngineers: getEngineers,
    saveEngineer: saveEngineer,
    getSuppliers: getSuppliers,
    getJournal: getJournal,
    saveJournalEntry: saveJournalEntry,
    getSchedule: getSchedule,
    saveExtraction: saveExtraction,
    getExtractions: getExtractions,
    getLearnedRules: getLearnedRules,
    saveLearnedRule: saveLearnedRule,
    getPricebook: getPricebook,
    getActivity: getActivity
  };

})();
