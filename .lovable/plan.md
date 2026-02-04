
# Phase 2: Control Plane UI + Receipts Coverage Expansion

## Executive Summary

This plan adds an **enterprise-grade Control Plane** for Agent/Skill Pack management with a modern multi-step builder wizard, rollout controls, and registry management. It also expands Receipts coverage to handle new receipt types (deploy, SLO, alert, backup, DR, entitlement, RBAC) as first-class filters.

---

## Part A: Repo Hygiene

### Files to Remove

The following artifacts should be deleted to keep `/src` as the single source of truth:

1. **`/temp/Aspire-admin-portal.zip`** - Embedded archive artifact
2. **`/Aspire-admin-portal/`** - Empty/stale directory (contains nested folder)
3. **`/imported-project/`** - Empty/stale directory (contains nested folder)

The duplicate root-level `/pages`, `/components`, `/hooks`, and `/App.tsx` were already removed in Phase 1.

---

## Part B: Control Plane Navigation

### Modify: `src/components/layout/Sidebar.tsx`

Add a new "Control Plane" navigation group with the following routes:

```text
CONTROL PLANE
  - /control-plane/registry     (Registry Items)
  - /control-plane/builder      (Agent Builder)
  - /control-plane/rollouts     (Rollouts)
```

**Operator Mode Labels:**
- Registry → "Your Agents"
- Builder → "Create Agent"
- Rollouts → "Deploy Controls"

**Engineer Mode Labels:**
- Registry → "Registry Items"
- Builder → "Agent Builder"
- Rollouts → "Rollouts"

The Control Plane group will be visible in both Operator and Engineer modes (unlike Business Control which is Operator-only).

---

## Part C: Control Plane Contracts

### New File: `src/contracts/control-plane.ts`

TypeScript interfaces aligned with ecosystem schemas:

```typescript
// Registry Item (Agent/Skill Pack definition)
export interface RegistryItem {
  id: string;
  name: string;
  description: string;
  type: 'agent' | 'skill_pack';
  status: 'draft' | 'pending_review' | 'active' | 'deprecated' | 'disabled';
  version: string;
  owner: string;
  category: string;
  risk_tier: 'low' | 'medium' | 'high';
  approval_required: boolean;
  capabilities: RegistryCapability[];
  tool_allowlist: string[];
  prompt_config: PromptConfig;
  governance: GovernanceConfig;
  created_at: string;
  updated_at: string;
  internal: boolean;
}

export interface RegistryCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface PromptConfig {
  version: string;
  content: string;
  variables: Record<string, string>;
}

export interface GovernanceConfig {
  risk_tier: 'low' | 'medium' | 'high';
  approval_category: string;
  required_presence: 'none' | 'voice' | 'video';
  constraints: string[];
}

// Rollout
export interface Rollout {
  id: string;
  registry_item_id: string;
  registry_item_name: string;
  environment: 'development' | 'staging' | 'production';
  percentage: number;
  status: 'active' | 'paused' | 'rolling_back' | 'completed';
  created_at: string;
  updated_at: string;
  created_by: string;
  history: RolloutHistoryEntry[];
}

export interface RolloutHistoryEntry {
  timestamp: string;
  action: string;
  percentage: number;
  actor: string;
}

// Config Change Proposal
export interface ConfigChangeProposal {
  id: string;
  registry_item_id: string;
  change_type: 'create' | 'update' | 'deprecate' | 'rollout_change';
  status: 'pending' | 'approved' | 'denied' | 'applied';
  summary: string;
  diff: ProposalDiff;
  requested_by: string;
  requested_at: string;
  decided_at?: string;
  decided_by?: string;
}

export interface ProposalDiff {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}
```

### New File: `src/services/controlPlaneClient.ts`

Stubbed async functions with mock data:

```typescript
// Stubbed API functions
listRegistryItems(): Promise<RegistryItem[]>
getRegistryItem(id: string): Promise<RegistryItem | null>
createDraftRegistryItem(payload: Partial<RegistryItem>): Promise<RegistryItem>
updateDraftRegistryItem(id: string, patch: Partial<RegistryItem>): Promise<RegistryItem>
proposeConfigChange(payload: Partial<ConfigChangeProposal>): Promise<ConfigChangeProposal>
listRollouts(): Promise<Rollout[]>
getRollout(id: string): Promise<Rollout | null>
createRollout(payload: Partial<Rollout>): Promise<Rollout>
setRolloutPercentage(rolloutId: string, percentage: number): Promise<Rollout>
pauseRollout(rolloutId: string): Promise<Rollout>
rollbackRollout(rolloutId: string): Promise<ConfigChangeProposal>
```

---

## Part D: Registry Items Page

### New File: `src/pages/control-plane/Registry.tsx`

**Layout Structure:**

```text
+----------------------------------------------------------+
| Page Hero: "Your Agents" / "Registry Items"              |
| Subtitle: "Manage your automated team members"            |
+----------------------------------------------------------+
| Purpose Strip                                             |
+----------------------------------------------------------+
| Quick Stats: Total | Active | Draft | High-Risk          |
+----------------------------------------------------------+
| Filters: [Type ▼] [Status ▼] [Risk ▼] [Search...]       |
+----------------------------------------------------------+
| Table:                                                    |
| | Name | Type | Status | Risk | Version | Updated |      |
| (Click row → opens detail drawer)                        |
+----------------------------------------------------------+
| [+ Create New Agent] Primary CTA                         |
+----------------------------------------------------------+
```

**Detail Drawer (Right Side):**
- Overview tab: Name, description, status, version
- Capabilities tab: List of enabled capabilities
- Governance tab: Risk tier, approval requirements, constraints
- Versions tab: Version history
- Rollouts tab: Current deployment status

**Mode-Aware Copy:**
- Operator: "What it does", "What it can access", "How safe it is"
- Engineer: registry_item_id, policy references, tool allowlist

---

## Part E: Agent Builder (Core Deliverable)

### New File: `src/pages/control-plane/Builder.tsx`

A modern multi-step wizard with a left stepper and right live preview panel.

**Layout:**

```text
+------------------+----------------------------------------+
| STEPS            | STEP CONTENT                           |
|                  |                                        |
| [1] Identity ●   | [Current step form fields]            |
| [2] Capabilities |                                        |
| [3] Governance   |                                        |
| [4] Prompt       |----------------------------------------|
| [5] Review       | LIVE PREVIEW                           |
|                  | +------------------------------------+ |
|                  | | Agent Card Preview                 | |
|                  | | Name: My Agent                     | |
|                  | | Risk: Low ●                        | |
|                  | | Capabilities: 3                    | |
|                  | +------------------------------------+ |
+------------------+----------------------------------------+
```

**Step 1: Identity**
- Name (required)
- Short description (required)
- Category selector: "Operations", "Finance", "Sales", "Support", "Legal"
- Template selector: "Start from scratch" or choose template
- Internal/External toggle
- Internal notes (optional, collapsible)

**Step 2: Capabilities**
- Capability cards with toggle switches:
  - Read Data
  - Write Data
  - Send Notifications
  - Trigger Automations
  - Access External APIs
- Tool allowlist selector (grouped, searchable)
- Grouped by category: "Communication", "Data", "Finance", "CRM"

**Step 3: Governance**
- Risk tier selector with explanations:
  - Low: "Can run automatically with minimal oversight"
  - Medium: "Requires periodic review"
  - High: "Requires approval for most actions"
- Approval requirement toggle
- Required presence: "None" / "Voice available" (display-only, no video flows)
- Constraints editor (add/remove text constraints)

**Step 4: Prompt & Config**
- Versioned prompt editor (clean textarea)
- Character count display
- Config JSON editor with basic validation
- "Diff from previous version" viewer (simple side-by-side)

**Step 5: Review & Propose**
- Summary cards for all steps
- "What happens next" explanation (Operator mode)
- Creates a ConfigChangeProposal object (stub)
- Primary CTA: "Submit for Review" / "Create Draft"

**Live Preview Panel:**
- Shows agent card as it will appear in Registry
- Updates in real-time as user edits
- Displays: name, description, risk tier chip, capability count, tool count

---

## Part F: Rollouts Page

### New File: `src/pages/control-plane/Rollouts.tsx`

**Layout Structure:**

```text
+----------------------------------------------------------+
| Page Hero: "Deploy Controls" / "Rollouts"                 |
| Subtitle: "Control how agents are deployed"               |
+----------------------------------------------------------+
| Purpose Strip                                             |
+----------------------------------------------------------+
| Quick Stats: Active | Paused | Rolling Back              |
+----------------------------------------------------------+
| Table:                                                    |
| | Agent | Environment | Current % | Status | Updated |   |
| (Click row → opens detail drawer)                        |
+----------------------------------------------------------+
```

**Detail Drawer:**
- Current settings: percentage, status, environment
- History timeline with actor + action + timestamp
- Actions:
  - "Set Percentage" (slider + confirm button)
  - "Pause" button
  - "Rollback" button (creates proposal)

**Safety Mode Integration:**
- When Safety Mode is ON, disable all rollout modification buttons
- Show tooltip: "Rollout changes are restricted when Safety Mode is ON"

---

## Part G: Receipts Coverage Expansion

### Modify: `src/pages/Receipts.tsx`

**Add Receipt Type Filter:**
- New dropdown filter for receipt domain/type prefixes
- First-class support for:
  - `deploy.*`
  - `slo.*`
  - `alert.*`
  - `backup.*`
  - `restore.*`
  - `dr.*` (disaster recovery)
  - `entitlement.*`
  - `rbac.*`
  - `payments.*` (existing)
  - `security.*` (existing)

**Receipt Type Facet Selector:**
- Dynamically populated from observed data
- Shows count per type
- Unknown types render with "custom" badge

**Update Mock Data in `src/services/apiClient.ts`:**
Add sample receipts for each new type:
```typescript
{ domain: 'deploy', action_type: 'deploy.release', ... }
{ domain: 'slo', action_type: 'slo.breach_detected', ... }
{ domain: 'alert', action_type: 'alert.triggered', ... }
{ domain: 'backup', action_type: 'backup.completed', ... }
{ domain: 'dr', action_type: 'dr.failover_initiated', ... }
{ domain: 'entitlement', action_type: 'entitlement.granted', ... }
{ domain: 'rbac', action_type: 'rbac.role_assigned', ... }
```

**Graceful Unknown Type Handling:**
- If receipt domain is not in known list, render with:
  - Badge: "custom" in muted style
  - Full domain name displayed
  - No filtering restrictions

---

## Part H: Terminology Updates

### Modify: `src/lib/terminology.ts`

Add Control Plane terms:

```typescript
// Control Plane terms
'term.registry': { operator: 'Agents', engineer: 'Registry Items' },
'term.registry.singular': { operator: 'Agent', engineer: 'Registry Item' },
'term.rollout': { operator: 'Deployment', engineer: 'Rollout' },
'term.rollouts': { operator: 'Deploy Controls', engineer: 'Rollouts' },
'term.builder': { operator: 'Create Agent', engineer: 'Agent Builder' },
'term.risk_tier': { operator: 'Safety Level', engineer: 'Risk Tier' },
'term.approval_required': { operator: 'Needs Your OK', engineer: 'Approval Required' },
'term.required_presence': { operator: 'Presence Required', engineer: 'Required Presence' },
'term.tool_allowlist': { operator: 'Allowed Tools', engineer: 'Tool Allowlist' },
'term.capability': { operator: 'What it can do', engineer: 'Capability' },

// Glossary entries
'glossary.registry_item': { ... }
'glossary.rollout': { ... }
'glossary.config_change_proposal': { ... }
```

### Note on "Required Presence"
The `required_presence` field is **display-only** and shows:
- **Operator mode:** "Presence required: Voice available" 
- **Engineer mode:** "required_presence: voice"

No video session flows or session-start UX is implemented. This is purely informational.

---

## Part I: Route Registration

### Modify: `src/App.tsx`

Add new Control Plane routes:

```typescript
import ControlPlaneRegistry from './pages/control-plane/Registry';
import ControlPlaneBuilder from './pages/control-plane/Builder';
import ControlPlaneRollouts from './pages/control-plane/Rollouts';

// Routes
<Route path="/control-plane/registry" element={<ProtectedRoute><AppLayout><ControlPlaneRegistry /></AppLayout></ProtectedRoute>} />
<Route path="/control-plane/builder" element={<ProtectedRoute><AppLayout><ControlPlaneBuilder /></AppLayout></ProtectedRoute>} />
<Route path="/control-plane/rollouts" element={<ProtectedRoute><AppLayout><ControlPlaneRollouts /></AppLayout></ProtectedRoute>} />
```

---

## File Summary

### New Files (7)
1. `src/contracts/control-plane.ts` - Control Plane contract types
2. `src/services/controlPlaneClient.ts` - Stubbed Control Plane API
3. `src/pages/control-plane/Registry.tsx` - Registry Items page
4. `src/pages/control-plane/Builder.tsx` - Agent Builder wizard
5. `src/pages/control-plane/Rollouts.tsx` - Rollouts management page
6. `src/components/control-plane/BuilderSteps.tsx` - Builder step components
7. `src/components/control-plane/AgentPreviewCard.tsx` - Live preview component

### Modified Files (5)
1. `src/components/layout/Sidebar.tsx` - Add Control Plane nav group
2. `src/App.tsx` - Add Control Plane routes
3. `src/pages/Receipts.tsx` - Expand receipt type filters
4. `src/services/apiClient.ts` - Add new receipt type mock data
5. `src/lib/terminology.ts` - Add Control Plane terminology

### Files to Delete (3)
1. `temp/Aspire-admin-portal.zip`
2. `Aspire-admin-portal/` (directory)
3. `imported-project/` (directory)

---

## Design Specifications

### Builder Wizard
- Left stepper: 200px width, fixed position
- Step indicators: numbered circles with completion checkmarks
- Current step: primary color highlight
- Step content area: scrollable with consistent padding
- Live preview: sticky sidebar, updates in real-time

### Registry Table
- Row height: 56px for comfortable interaction
- Status chips: use existing StatusChip component
- Risk tier: color-coded badges (green/yellow/red)
- Hover: subtle lift effect

### Rollout Controls
- Percentage slider: 0-100% with 10% increments
- Status badges: Active (green), Paused (yellow), Rolling Back (orange)
- History timeline: vertical layout with timestamps

### Receipt Type Badges
- Known types: colored badges matching domain
- Unknown types: muted "custom" badge with monospace font

---

## Outcome

After Phase 2 implementation:

1. **Control Plane Navigation** - New sidebar group with Registry, Builder, and Rollouts pages

2. **Enterprise Agent Builder** - Modern multi-step wizard that is:
   - No-code-founder friendly (Operator mode)
   - Technically precise (Engineer mode)
   - Premium visual design (Linear/Stripe quality)
   - Contract-aligned with ecosystem schemas

3. **Rollout Management** - Controlled deployment with:
   - Percentage-based rollouts
   - Safety Mode integration
   - Audit trail via proposals

4. **Expanded Receipts** - First-class support for deploy, SLO, alert, backup, DR, entitlement, and RBAC receipt types with graceful unknown type handling

5. **Clean Repository** - Removed stale artifacts, `/src` remains single source of truth
