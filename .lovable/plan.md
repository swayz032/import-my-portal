
# AspireOS Admin Portal: Enterprise-Grade Trust Spine Transformation

## Executive Summary

This plan transforms the AspireOS Admin Portal into a **contract-first, enterprise-grade operations console** that is both non-coder friendly (Operator mode) and technically precise (Engineer mode). The architecture will be aligned with the Aspire Ecosystem "Trust Spine" - ensuring the UI always reflects canonical system state and cannot drift from the underlying contracts.

---

## Part A: Critical Cleanup (Prevent Drift)

### Problem Identified
The project has duplicate folders at root level that can cause import confusion:
- `/pages/` (root) - OLD, duplicates `/src/pages/`
- `/components/` (root) - OLD, duplicates `/src/components/`
- `/hooks/` (root) - OLD, duplicates `/src/hooks/`
- `/App.tsx` (root) - OLD, system uses `/src/App.tsx`
- `/index.css` (root) - OLD, system uses `/src/index.css`

### Solution
Delete these root-level duplicates to ensure `/src/` is the single source of truth:

**Files to Delete:**
- `/pages/` folder (entire directory)
- `/components/` folder (entire directory)
- `/hooks/` folder (entire directory)
- `/App.tsx` (root file)
- `/index.css` (root file)

---

## Part B: Ecosystem Sync Foundation (Contract-First)

### B1. Create Canonical Contract Types

**New File: `/src/contracts/index.ts`**

```text
+--------------------------------------------------+
|  CANONICAL TRUST SPINE CONTRACTS                  |
+--------------------------------------------------+
|                                                  |
|  Receipt                                         |
|  - id, suite_id, office_id, domain              |
|  - action_type, status, created_at              |
|  - correlation_id, payload, provider?           |
|  - request_id?                                  |
|                                                  |
|  AuthorityQueueItem (Approval)                  |
|  - id, suite_id, office_id, status              |
|  - risk_level, summary, requested_at            |
|  - decision_at?, decided_by?                    |
|  - linked_receipt_ids?, correlation_id?         |
|                                                  |
|  OutboxJob                                       |
|  - id, suite_id, office_id, status              |
|  - queued_at, started_at?, finished_at?         |
|  - attempts, correlation_id                     |
|  - action_type, provider?                       |
|                                                  |
|  ProviderCallLog                                 |
|  - id, suite_id, provider                       |
|  - action_type, status                          |
|  - started_at, finished_at, correlation_id      |
|  - request_meta, response_meta                  |
|                                                  |
|  Incident                                        |
|  - id, suite_id, severity, status               |
|  - created_at, updated_at, summary              |
|  - linked_receipt_ids?, correlation_id?         |
|                                                  |
+--------------------------------------------------+
```

### B2. Create API Client with Stubbed Functions

**New File: `/src/services/apiClient.ts`**

```typescript
// Stubbed async functions that return canonical-shaped mock data
export async function listReceipts(filters?: ReceiptFilters): Promise<Receipt[]>
export async function listAuthorityQueue(filters?: AuthorityQueueFilters): Promise<AuthorityQueueItem[]>
export async function listOutboxJobs(filters?: OutboxFilters): Promise<OutboxJob[]>
export async function listProviderCallLogs(filters?: ProviderCallLogFilters): Promise<ProviderCallLog[]>
export async function listIncidents(filters?: IncidentFilters): Promise<Incident[]>
export async function listProviders(): Promise<ProviderInfo[]>
```

### B3. Add Ecosystem Sync Panel to Advanced Page

**Modify: `/src/pages/Advanced.tsx`**

Add new "Ecosystem Sync" section with:
- Ecosystem Pack Version: `v2.4.1` (mock)
- Contracts Loaded: YES/NO indicator
- Schema Drift Warning banner (conditionally shown)
- Last Sync Check: timestamp display

---

## Part C: Operator/Engineer Mode Enhancements

### C1. Persist Mode in localStorage

**Modify: `/src/contexts/SystemContext.tsx`**

```typescript
// On mount, read from localStorage
const [viewMode, setViewMode] = useState<ViewMode>(() => {
  const stored = localStorage.getItem('aspire-view-mode');
  return (stored === 'engineer' || stored === 'operator') ? stored : 'operator';
});

// On change, persist to localStorage
useEffect(() => {
  localStorage.setItem('aspire-view-mode', viewMode);
}, [viewMode]);
```

### C2. Centralized Dictionary System

**New File: `/src/lib/terminology.ts`**

```typescript
const TERMINOLOGY = {
  'term.receipt': { operator: 'Proof log', engineer: 'Receipts' },
  'term.authority_queue': { operator: 'Approval queue', engineer: 'Authority Queue' },
  'term.outbox': { operator: 'Execution queue', engineer: 'Outbox' },
  'term.provider_call_log': { operator: 'Service calls', engineer: 'Provider Call Log' },
  'term.correlation_id': { operator: 'Request link', engineer: 'Correlation ID' },
  'term.suite_id': { operator: 'Office group', engineer: 'Suite ID' },
  'term.office_id': { operator: 'Office', engineer: 'Office ID' },
  'term.idempotency': { operator: 'Duplicate protection', engineer: 'Idempotency' },
  // ... more terms
};

export function getTerm(key: string, mode: 'operator' | 'engineer'): string
export function getGlossaryEntry(key: string, mode: 'operator' | 'engineer'): GlossaryEntry
```

### C3. Glossary Tooltips Component

**New File: `/src/components/shared/GlossaryTooltip.tsx`**

A tooltip component that explains Trust Spine terms:
- Suite ID, Office ID, Receipt, Authority Queue
- Outbox, Provider Call Log, Correlation ID, Idempotency

### C4. Purpose Strip Component

**New File: `/src/components/shared/PurposeStrip.tsx`**

A compact banner at top of major pages:
- Operator: What this page is for + what actions matter
- Engineer: Which canonical objects are shown

---

## Part D: System Pipeline Map Component

### New File: `/src/components/shared/SystemPipelineCard.tsx`

A visual pipeline diagram showing the Trust Spine flow:

```text
Operator Mode:
+----------+    +--------+    +----------+    +--------+    +------+    +----------+    +-------+
| Request  | -> | Safety | -> | You      | -> | Queued | -> | Runs | -> | Provider | -> | Proof |
|          |    | checks |    | approve  |    |        |    |      |    | calls    |    | saved |
+----------+    +--------+    +----------+    +--------+    +------+    +----------+    +-------+

Engineer Mode:
+----------+    +--------+    +----------+    +--------+    +----------+    +-----------+    +----------+
| Proposal | -> | Policy | -> | Approval | -> | Outbox | -> | Executor | -> | Provider  | -> | Receipts |
|          |    |        |    |          |    |        |    |          |    | CallLog   |    |          |
+----------+    +--------+    +----------+    +--------+    +----------+    +-----------+    +----------+
```

**Placement:**
- Dashboard (main overview)
- Authority Queue page (approvals context)
- Receipts page (proof context)
- Connected Apps / Provider Control Center
- Safety / Incidents pages

---

## Part E: Authority Queue Page (Upgrade Approvals)

### Modify: `/src/pages/Approvals.tsx`

**UI Copy Changes:**
- Page title: "Authority Queue" (Engineer) / "Approval Queue" (Operator)
- Route remains `/approvals` for backward compatibility

**Layout Structure:**
```text
+----------------------------------------------------------+
| Purpose Strip: "Decisions waiting for your approval"      |
+----------------------------------------------------------+
| [Pending] [Approved] [Denied]  <- Tabs                    |
+----------------------------------------------------------+
| Table: status, risk_level, summary, suite_id, office_id, |
|        requested_at                                       |
| (Click row to open drawer)                                |
+----------------------------------------------------------+
```

**Right-Side Drawer Contains:**
- Summary and risk flags
- correlation_id (Engineer mode)
- linked_receipt_ids with links
- "What happens if you approve?" (Operator mode)
- Status transitions and correlation linkage (Engineer mode)
- Approve / Reject buttons

---

## Part F: Receipts Viewer Page

### New File: `/src/pages/Receipts.tsx`

**Contract-Aligned Fields:**
- suite_id, office_id, domain, action_type
- status, created_at, correlation_id
- Expandable payload JSON viewer

**Filters:**
- domain, status, provider, action_type
- suite_id, office_id

**Grouping:**
- Group by correlation_id in UI (collapsible groups)

**Mode-Aware Copy:**
- Operator: "Proof of what happened"
- Engineer: "Canonical Receipt objects + JSON"

### Add Route: `/receipts`

---

## Part G: Outbox + Provider Call Log Pages

### G1. Outbox Section

**New File: `/src/pages/Outbox.tsx`** (or integrate into Automation page)

Table showing OutboxJob entries:
- id, status, attempts, correlation_id
- queued_at, started_at, finished_at
- action_type, provider

### G2. Provider Call Log Section

**New File: `/src/pages/ProviderCallLog.tsx`** (or integrate into Connected Apps)

Table showing ProviderCallLog entries:
- id, provider, action_type, status
- duration (calculated from started_at/finished_at)
- correlation_id

### Add Routes: `/outbox` and `/provider-call-log`

---

## Part H: Connected Apps -> Provider Control Center

### Modify: `/src/pages/ConnectedApps.tsx`

**Rename UI Copy:**
- Page title: "Provider Control Center"
- Sidebar label: "Providers" or "Provider Control"

**Enhanced Provider Cards:**
```text
+------------------------------------------+
| [Stripe Icon]  STRIPE                    |
|                                          |
| Connection:     ● Connected              |
| Capability:     Writes Enabled           |
| Last Check:     2 minutes ago            |
| Receipt Coverage: 94%                    |
|                                          |
| [Pause Writes] [Configure]               |
+------------------------------------------+
```

**Pause Writes Control:**
- Button visible on each provider card
- Disabled when Safety Mode is ON (with tooltip explaining why)
- Creates approval request when clicked

---

## Part I: Safety + Incidents Enhancements

### I1. Safety Page Updates

**Modify: `/src/pages/Safety.tsx`**

Add "What Safety Mode Gates" section:

**Operator Mode:**
- "When Safety Mode is ON, the system will pause risky operations until you review them."
- Visual list of gated actions (plain English)

**Engineer Mode:**
- Gated objects list: Authority Queue (writes), Outbox (execution), Provider writes
- Policy enforcement indicators

### I2. Incidents Page Updates

**Modify: `/src/pages/Incidents.tsx`**

Enhanced table columns:
- severity, status, created_at, summary
- linked_receipt_ids (clickable), correlation_id

Detail drawer enhancements:
- Timeline visualization (mock trace events)
- Linked receipts section with direct links
- "View in Receipts" button

---

## Part J: Dashboard Enhancements

### Modify: `/src/pages/Dashboard.tsx`

**Layout Structure:**

```text
+----------------------------------------------------------+
| Purpose Strip                                             |
+----------------------------------------------------------+
| KPI Row:                                                  |
| [Receipts 24h] [Pending Queue] [Outbox] [Incidents] [Providers]
+----------------------------------------------------------+
|                                                          |
| LEFT COLUMN (2/3 width):                                 |
| +------------------------+  +------------------------+   |
| | Authority Queue        |  | Active Incidents       |   |
| | Top 5 pending items    |  | Top 5 open issues      |   |
| +------------------------+  +------------------------+   |
|                                                          |
| +--------------------------------------------------+    |
| | Recent Receipts Feed (last 10)                    |    |
| +--------------------------------------------------+    |
|                                                          |
| RIGHT COLUMN (1/3 width):                                |
| +--------------------------------------------------+    |
| | System Pipeline Card                              |    |
| +--------------------------------------------------+    |
| | Ecosystem Sync Status                             |    |
| | - Pack Version: v2.4.1                            |    |
| | - Contracts: Loaded                               |    |
| | - Last Sync: 2 min ago                            |    |
| +--------------------------------------------------+    |
|                                                          |
+----------------------------------------------------------+
```

---

## Part K: Quality Bar & Consistency

### K1. Consistent Spacing & Typography

**Verify across all pages:**
- Use `max-w-7xl mx-auto` for content containers
- Consistent card padding (p-4 or p-6)
- Typography scale: page-title (text-2xl), section-title (text-lg), body (text-sm)

### K2. Empty States with Guidance

**Update all empty states to include:**
- Friendly headline (no technical jargon in Operator mode)
- Clear explanation of what should appear here
- Action button or link to relevant page

Example:
```text
+------------------------------------------+
| [Icon: Inbox]                            |
|                                          |
| No pending approvals                     |
| When someone requests a change, you'll   |
| see it here for your review.             |
|                                          |
| [View Recent Activity]                   |
+------------------------------------------+
```

### K3. Visual Theme Consistency

- Dark, high-contrast, premium aesthetic
- Primary accent: cyan (#06B6D4)
- Consistent status colors across all pages
- "Authority Queue" used consistently (no mixing with "Approvals" in copy)

---

## File Summary

### New Files (12)
1. `/src/contracts/index.ts` - Canonical Trust Spine types
2. `/src/services/apiClient.ts` - Stubbed API functions
3. `/src/lib/terminology.ts` - Operator/Engineer dictionary
4. `/src/components/shared/GlossaryTooltip.tsx` - Term explanations
5. `/src/components/shared/PurposeStrip.tsx` - Page purpose banners
6. `/src/components/shared/SystemPipelineCard.tsx` - Visual pipeline
7. `/src/pages/Receipts.tsx` - Contract-aligned receipts viewer
8. `/src/pages/Outbox.tsx` - Outbox job queue viewer
9. `/src/pages/ProviderCallLog.tsx` - Provider call log viewer
10. `/src/data/contractMockData.ts` - Mock data matching contracts

### Modified Files (11)
1. `/src/contexts/SystemContext.tsx` - localStorage persistence
2. `/src/pages/Advanced.tsx` - Add Ecosystem Sync panel
3. `/src/pages/Approvals.tsx` - Authority Queue upgrade
4. `/src/pages/Dashboard.tsx` - KPI row + pipeline + sync status
5. `/src/pages/ConnectedApps.tsx` - Provider Control Center
6. `/src/pages/Safety.tsx` - Gated objects section
7. `/src/pages/Incidents.tsx` - Receipt linkage + timeline
8. `/src/components/layout/Sidebar.tsx` - Updated navigation labels
9. `/src/App.tsx` - Add new routes (Receipts, Outbox, ProviderCallLog)
10. `/src/index.css` - Any new utility classes needed
11. `/src/data/seed.ts` - Align existing data with contract shapes

### Files to Delete (5)
1. `/pages/` (entire directory)
2. `/components/` (entire directory)
3. `/hooks/` (entire directory)
4. `/App.tsx` (root)
5. `/index.css` (root)

---

## Technical Implementation Notes

### Contract Shape Alignment

The existing seed data in `/src/data/seed.ts` already has many of the right fields but needs alignment:

```typescript
// Current Receipt interface is close but needs:
// - suite_id (add, currently missing)
// - office_id (add, currently missing)
// - domain (add, currently missing)
// - Rename outcome -> status

// Current Approval interface needs:
// - Rename to AuthorityQueueItem
// - Add suite_id, office_id
// - Rename risk -> risk_level
```

### Routing Structure

```text
/home                    - Premium Home experience
/dashboard               - Technical dashboard (existing)
/approvals               - Authority Queue (renamed in UI)
/receipts                - NEW: Receipts viewer
/outbox                  - NEW: Outbox viewer
/provider-call-log       - NEW: Provider call log
/activity                - Activity page (existing)
/safety                  - Safety controls (existing)
/incidents               - Incidents (existing)
/connected-apps          - Provider Control Center (renamed)
/customers               - Customer management (existing)
/subscriptions           - Subscriptions (existing)
/advanced                - Advanced tools + Ecosystem Sync
/llm-ops-desk            - Ava LLM console (existing)
```

### Sidebar Navigation Updates

```text
QUICK ACCESS
  - Home
  - Authority Queue (was "Approvals")
  - Receipts (NEW)
  - Talk to Ava

OPERATIONS
  - Dashboard
  - Activity
  - Outbox (NEW)
  - Incidents
  - Safety

PROVIDERS
  - Provider Control (was "Connected Apps")
  - Provider Logs (NEW)

BUSINESS (collapsible)
  - Customers
  - Subscriptions
  - ... existing items

ADVANCED
  - Advanced Tools
```

---

## Outcome

After implementation, the AspireOS Admin Portal will:

1. **Be Contract-First**: All UI renders canonical Trust Spine objects (Receipt, AuthorityQueueItem, OutboxJob, ProviderCallLog, Incident) - no ad-hoc UI-only schemas

2. **Prevent Drift**: Ecosystem Sync panel surfaces sync health, schema warnings, and contract version

3. **Be Non-Coder Friendly**: Operator mode uses plain English, hides technical IDs, provides action-oriented guidance

4. **Be Engineer-Ready**: Engineer mode exposes full technical depth with IDs, correlation links, and JSON payloads

5. **Show System State Visually**: SystemPipelineCard makes the Trust Spine "alive" across key pages

6. **Maintain Premium Quality**: Consistent dark theme, cyan accents, high-contrast, no gibberish text, proper empty states

Make sure to keep theme the same when it comes to the visuals and etc and dashboard theme just integrate the updates without really changing the theme