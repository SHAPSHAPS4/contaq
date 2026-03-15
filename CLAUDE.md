# CONTRAQ — Claude Code Project Guide

## What is this?

CONTRAQ is a B2B SaaS platform for UK M&E fit-out subcontractors (pipe fitters, plumbers, electricians, AC/ductwork, ventilation, fire stopping, insulation/lagging, trace heating). It targets firms working with Tier-1/Tier-2 main contractors (Balfour Beatty, Morgan Sindall, Mace, Skanska).

This codebase was modularised from a single 21,518-line HTML file (v77). It is a **front-end only prototype** — all data is mock, all "AI" features are simulated, no backend.

## Demo Credentials

- **Demo user**: `demo@contraq.co.uk` / `Demo1234!`
- **Admin user**: `admin@contraq.co.uk` / `Admin2025!`

## Project Structure

```
contraq/
├── index.html          # HTML shell — all page markup, modals, structural HTML
├── css/
│   └── main.css        # All styles — design tokens, components, responsive, animations
└── js/
    ├── data.js         # Mock data arrays (PROJECTS, ENGINEERS, TENDERS, CLIENTS, etc.)
    ├── state.js        # STATE object, PLAN_LIMITS, plan gating functions
    ├── core.js         # nav(), scrollToSection()
    ├── utilities.js    # openModal, closeModal, badge, fmtNum, fmtDate, getGreeting
    ├── toast_logout.js # showToast, doLogout
    ├── landing.js      # ROI calculator, trade verticals, FAQ, pricing
    ├── auth.js         # doLogin, doRegister, selectRegPlan
    ├── onboarding.js   # Trade selection wizard
    ├── stripe.js       # Payment form (simulated)
    ├── carousel.js     # Landing page demo carousel
    ├── demo_bg.js      # Hero background animations, scroll reveals, countUp
    ├── founding.js     # Founding Member programme
    ├── dashboard.js    # Dashboard init, nav, KPIs, charts, sidebar, help tips
    ├── quotes.js       # Quote Book — create quote, tenders, AI file upload & extraction
    ├── terms.js        # Terms of Service modal
    ├── pricebook.js    # Materials Price Book, AI upload
    ├── materials.js    # Materials summary view
    ├── clients.js      # Client register, AI upload, client reports
    ├── po_detail.js    # Purchase Order detail view
    ├── diary_alerts.js # Diary alert generation
    ├── projects.js     # Project list, filters, export, project reports
    ├── project_detail.js # Project detail tabs, costs, client stats
    ├── documents.js    # Document upload, staged files, AI analysis
    ├── folders.js      # Folder system, file management
    ├── quote_files.js  # Quote file upload with AI, JSZip integration
    ├── journal.js      # Site Journal, AI EOT/contract analysis
    ├── procurement.js  # PO management, procurement panel
    ├── finance.js      # P&L, invoices, benchmarks
    ├── scheduler.js    # Engineer diary (week/month/6-month views), drag-drop, calendar
    ├── engineers.js    # Engineer management, cert tracker
    ├── suppliers.js    # Supplier panel
    ├── search.js       # Global search, notifications
    ├── admin.js        # Admin panel
    ├── admin_charts.js # Admin analytics charts, user management
    ├── reset.js        # Full demo reset
    ├── cis.js          # CIS compliance (returns, deductions, countdown)
    ├── site_view.js    # Mobile field worker view (journal, measures, time clock)
    ├── enterprise.js   # Book demo, auto-login, enterprise bar
    ├── eco4.js         # ECO4/PAS 2030 compliance, certificates
    ├── patch_nav.js    # Nav patching IIFE, DPA request
    ├── cookie.js       # GDPR cookie consent
    └── procore.js      # Procore CSV import
```

## Design System

| Token | Value |
|-------|-------|
| Base background | `#0a0b0d` (--bg0) through `#2a2f36` (--bg4) |
| Orange accent | `#f97316` (--orange) |
| Lime accent | `#a3e635` (--lime) |
| Mono font | IBM Plex Mono (data, numbers, labels) |
| Serif font | Instrument Serif (headings) |
| Sans font | DM Sans (body text) |
| Border radius | 12px (--radius), 8px (--radius2) |

### Button Classes
`btn-primary` (orange), `btn-ghost`, `btn-outline`, `btn-dark`, `btn-danger`, `btn-lg`, `btn-sm`, `btn-xs`

### Badge System
`g` = lime, `o` = orange, `b` = blue, `y` = yellow, `r` = red

### Page Routing
`.page.active` / `.panel.active` — pages are shown/hidden via CSS class toggling in `nav()` and `dashNav()`.

### Depth Layers
`--bg0` (deepest) → `--bg1` → `--bg2` → `--bg3` → `--bg4` (surface)

## Critical Build Rules

### 1. Surgical Edits Only
All code changes must preserve: element IDs, array structure, folder/attachment schema, cost objects, and CSS variable conventions. No functional regressions.

### 2. JavaScript Patterns to Watch
- **Unescaped quotes in onclick**: Use `&quot;` for HTML entity encoding in inline handlers
- **Orphaned closing braces**: After replacing a function block, verify brace matching
- **State variable names**: Always verify correct variable (e.g. `STATE.currentProjectId` vs `STATE.viewProjectId`)
- **Function hoisting**: Avoid recursive function declarations that cause stack overflows

### 3. Module Boundaries
The JS modules are loaded sequentially via `<script>` tags. Functions may span module boundaries (e.g. a function begins at the end of one file and its body continues in the next). This is by design from the monolith split.

**When adding new functions**: Place them in the appropriate module file. If a function needs to call another function, ensure the called function's module loads first (check `index.html` script order).

**When editing existing functions**: Use `grep -rn "functionName" js/` to locate the function across modules before editing.

### 4. Validation
After any change, validate JS syntax:
```bash
cat js/data.js js/state.js js/core.js js/utilities.js js/toast_logout.js js/landing.js js/auth.js js/onboarding.js js/stripe.js js/carousel.js js/demo_bg.js js/founding.js js/dashboard.js js/quotes.js js/terms.js js/pricebook.js js/materials.js js/clients.js js/po_detail.js js/diary_alerts.js js/projects.js js/project_detail.js js/documents.js js/folders.js js/quote_files.js js/journal.js js/procurement.js js/finance.js js/scheduler.js js/engineers.js js/suppliers.js js/search.js js/admin.js js/admin_charts.js js/reset.js js/cis.js js/site_view.js js/enterprise.js js/eco4.js js/patch_nav.js js/cookie.js js/procore.js > /tmp/all_contraq.js && node --check /tmp/all_contraq.js
```

### 5. Post-Edit Checklist
After each change, verify:
1. Folder tab switching works in project detail
2. Upload modals open/close correctly
3. Quote-to-project file transfer works
4. Overall app integrity (login → dashboard → navigate panels)

## How to Serve Locally

```bash
# Any simple HTTP server works
npx serve .
# or
python3 -m http.server 8000
```

Open `http://localhost:8000` (or whichever port). The app needs HTTP serving for font loading and correct path resolution.

## Domain Terminology

| Term | Meaning |
|------|---------|
| CIS300 | Construction Industry Scheme monthly return to HMRC |
| UTR | Unique Taxpayer Reference |
| VO | Variation Order (change to contract scope) |
| EOT | Extension of Time (delay claim) |
| Payment Application | Monthly invoice from subcontractor to main contractor |
| Retention | Percentage withheld from payments until project completion |
| NBS | National Building Specification |
| CSCS | Construction Skills Certification Scheme (site access card) |
| JCT / NEC | Standard UK construction contract forms |
| PAS 2030 | Publicly Available Specification for energy efficiency installations |
| ECO4 | Energy Company Obligation scheme (government retrofit programme) |
| Tier-1 / Tier-2 | Main contractor classification by size/turnover |

## Platform Sections

| Panel ID | Section | Key Module(s) |
|----------|---------|---------------|
| `home` | Dashboard | dashboard.js |
| `projects` | Projects | projects.js, project_detail.js |
| `tenders` | Quote Book | quotes.js, quote_files.js |
| `scheduler` | Engineer Diary | scheduler.js |
| `journal` | Site Journal | journal.js |
| `documents` | Documents & Folders | documents.js, folders.js |
| `engineers` | Engineer & Certs | engineers.js |
| `clients` | Client Register | clients.js |
| `suppliers` | Suppliers | suppliers.js |
| `procurement` | Procurement | procurement.js |
| `finance` | Finance / P&L | finance.js |
| `pricebook` | Price Book | pricebook.js |
| `measures` | Site Measures | project_detail.js |
| `cis` | CIS Compliance | cis.js |
| `eco4` | ECO4 / PAS 2030 | eco4.js |
| `settings` | Settings | (inline in dashboard.js) |
| `reports` | Reports | (inline in dashboard.js) |
| `admin` | Admin Panel | admin.js, admin_charts.js |

## External Dependencies

- **Chart.js 4.4.1** — loaded from CDN in index.html
- **Google Fonts** — IBM Plex Mono, Instrument Serif, DM Sans
- **JSZip** — loaded dynamically in quote_files.js for .xlsx/.docx parsing

## What's Next (Queued Improvements)

1. Trade-agnostic onboarding flow
2. Focus Mode dashboard
3. Activation checklist
4. ROI calculator improvements
5. Hero section redesign
6. Real Claude API integration (replacing simulated AI animations)
7. ~~Social proof section~~ DONE — replaced fabricated testimonials with honest founding-member structure
8. Pricing framing improvements
9. ROI banners throughout platform
10. Empty state designs
11. Contextual help tooltips
12. ~~Founding Member programme (replacing fabricated testimonials)~~ DONE — fabricated testimonials removed, placeholder slots for real beta feedback added
