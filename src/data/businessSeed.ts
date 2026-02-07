// Business Control & Skill Packs Seed Data

// ============================================
// RUNWAY & BURN DATA
// ============================================
export interface CostCategory {
  id: string;
  category: string;
  thisMonth: number;
  lastMonth: number;
  meaning: string;
  nextStep: string;
  vendors: CostVendor[];
  updatedAt: string;
}

export interface CostVendor {
  name: string;
  amount: number;
  type: string;
}

export const runwayBurnData = {
  monthlyBurn: 47500,
  runway: 14.2,
  cashOnHand: 675000,
  biggestCostDriver: 'Engineering',
  burnChangePercent: 8.3,
  
  costCategories: [
    {
      id: 'CAT-001',
      category: 'Engineering',
      thisMonth: 28000,
      lastMonth: 25500,
      meaning: 'Dev team salaries and contractors',
      nextStep: 'Review headcount',
      updatedAt: '2026-02-01T10:00:00Z',
      vendors: [
        { name: 'Payroll - Dev Team', amount: 22000, type: 'salary' },
        { name: 'Contractor - Backend', amount: 4000, type: 'contractor' },
        { name: 'Contractor - Design', amount: 2000, type: 'contractor' },
      ],
    },
    {
      id: 'CAT-002',
      category: 'Marketing',
      thisMonth: 8500,
      lastMonth: 7200,
      meaning: 'Ads, content, and campaigns',
      nextStep: 'Check ROI',
      updatedAt: '2026-02-01T10:00:00Z',
      vendors: [
        { name: 'Google Ads', amount: 4000, type: 'advertising' },
        { name: 'Meta Ads', amount: 2500, type: 'advertising' },
        { name: 'Content Agency', amount: 2000, type: 'services' },
      ],
    },
    {
      id: 'CAT-003',
      category: 'Infrastructure',
      thisMonth: 5200,
      lastMonth: 4800,
      meaning: 'Cloud, APIs, and tools',
      nextStep: 'Review usage',
      updatedAt: '2026-02-02T08:30:00Z',
      vendors: [
        { name: 'AWS', amount: 2800, type: 'cloud' },
        { name: 'Vercel', amount: 800, type: 'cloud' },
        { name: 'Supabase', amount: 600, type: 'database' },
        { name: 'OpenAI API', amount: 1000, type: 'api' },
      ],
    },
    {
      id: 'CAT-004',
      category: 'Legal & CPA',
      thisMonth: 3800,
      lastMonth: 3800,
      meaning: 'Legal and accounting fees',
      nextStep: 'Renew retainer',
      updatedAt: '2026-01-15T14:00:00Z',
      vendors: [
        { name: 'Law Firm Retainer', amount: 2500, type: 'legal' },
        { name: 'Accounting Firm', amount: 1300, type: 'accounting' },
      ],
    },
    {
      id: 'CAT-005',
      category: 'Brand & IP',
      thisMonth: 2000,
      lastMonth: 1500,
      meaning: 'Trademarks and brand assets',
      nextStep: 'File renewal',
      updatedAt: '2026-01-28T16:00:00Z',
      vendors: [
        { name: 'Trademark Filing', amount: 1200, type: 'legal' },
        { name: 'Brand Guidelines', amount: 800, type: 'design' },
      ],
    },
  ] as CostCategory[],

  attentionItems: [
    { id: 'ATT-001', label: 'Engineering costs up 10% this month', meaning: 'Added a new contractor', nextStep: 'Review contract' },
    { id: 'ATT-002', label: 'AWS renewal in 14 days', meaning: 'Annual commitment expires', nextStep: 'Negotiate terms' },
    { id: 'ATT-003', label: 'Runway below 18 months threshold', meaning: 'Conservative buffer recommended', nextStep: 'Plan fundraise' },
  ],
};

// ============================================
// COSTS & USAGE DATA
// ============================================
export interface VendorUsage {
  id: string;
  vendor: string;
  category: string;
  costThisMonth: number;
  costLastMonth: number;
  meaning: string;
  nextStep: string;
  updatedAt: string;
  usage: UsageMeter[];
  overageRules?: string;
}

export interface UsageMeter {
  metric: string;
  current: number;
  limit: number | null;
  unit: string;
}

export const costsUsageData = {
  toolsVendorsTotal: 12450,
  aiApiTotal: 3200,
  biggestSpike: 'OpenAI API (+42%)',
  overageExposure: 850,
  alertsTriggered: 2,

  vendors: [
    {
      id: 'VND-001',
      vendor: 'AWS',
      category: 'Cloud Infrastructure',
      costThisMonth: 2800,
      costLastMonth: 2650,
      meaning: 'Hosting and compute costs',
      nextStep: 'Review instances',
      updatedAt: '2026-02-02T06:00:00Z',
      usage: [
        { metric: 'EC2 Hours', current: 720, limit: 1000, unit: 'hours' },
        { metric: 'S3 Storage', current: 450, limit: 1000, unit: 'GB' },
        { metric: 'Lambda Invocations', current: 125000, limit: 500000, unit: 'calls' },
      ],
      overageRules: '$0.10 per additional EC2 hour',
    },
    {
      id: 'VND-002',
      vendor: 'OpenAI',
      category: 'AI/LLM',
      costThisMonth: 2400,
      costLastMonth: 1690,
      meaning: 'AI model usage spiked',
      nextStep: 'Optimize prompts',
      updatedAt: '2026-02-02T08:00:00Z',
      usage: [
        { metric: 'GPT-4 Tokens', current: 2400000, limit: 5000000, unit: 'tokens' },
        { metric: 'Embeddings', current: 180000, limit: 500000, unit: 'tokens' },
      ],
      overageRules: 'Pay-as-you-go after limit',
    },
    {
      id: 'VND-003',
      vendor: 'Anthropic',
      category: 'AI/LLM',
      costThisMonth: 800,
      costLastMonth: 720,
      meaning: 'Claude usage for complex tasks',
      nextStep: 'Monitor usage',
      updatedAt: '2026-02-02T08:00:00Z',
      usage: [
        { metric: 'Claude Tokens', current: 850000, limit: 2000000, unit: 'tokens' },
      ],
      overageRules: 'Tiered pricing applies',
    },
    {
      id: 'VND-004',
      vendor: 'Vercel',
      category: 'Hosting',
      costThisMonth: 800,
      costLastMonth: 800,
      meaning: 'Frontend hosting flat',
      nextStep: 'No action needed',
      updatedAt: '2026-02-01T00:00:00Z',
      usage: [
        { metric: 'Bandwidth', current: 850, limit: 1000, unit: 'GB' },
        { metric: 'Functions', current: 42000, limit: 100000, unit: 'invocations' },
      ],
    },
    {
      id: 'VND-005',
      vendor: 'Supabase',
      category: 'Database',
      costThisMonth: 600,
      costLastMonth: 500,
      meaning: 'Database growing steadily',
      nextStep: 'Plan upgrade',
      updatedAt: '2026-02-02T02:00:00Z',
      usage: [
        { metric: 'Database Size', current: 4.2, limit: 8, unit: 'GB' },
        { metric: 'Edge Functions', current: 28000, limit: 50000, unit: 'invocations' },
      ],
    },
    {
      id: 'VND-006',
      vendor: 'Twilio',
      category: 'Communication',
      costThisMonth: 450,
      costLastMonth: 380,
      meaning: 'SMS volume increased',
      nextStep: 'Check campaign',
      updatedAt: '2026-02-01T12:00:00Z',
      usage: [
        { metric: 'SMS Sent', current: 4200, limit: 10000, unit: 'messages' },
        { metric: 'Voice Minutes', current: 120, limit: 500, unit: 'minutes' },
      ],
    },
  ] as VendorUsage[],

  attentionItems: [
    { id: 'ATT-001', label: 'OpenAI API costs up 42%', meaning: 'More AI features deployed', nextStep: 'Optimize prompts' },
    { id: 'ATT-002', label: 'AWS nearing EC2 limit', meaning: 'May trigger overage', nextStep: 'Upgrade plan' },
  ],
};

// ============================================
// REVENUE & ADD-ONS DATA
// ============================================
export interface RevenueSKU {
  id: string;
  sku: string;
  type: 'base' | 'office_addon' | 'suite_addon' | 'skill_pack' | 'overage';
  mrr: number;
  customerCount: number;
  meaning: string;
  nextStep: string;
  updatedAt: string;
}

export const revenueAddonsData = {
  totalMRR: 18750,
  baseMRR: 12393,
  addonMRR: 3200,
  skillPackMRR: 2400,
  overageProjected: 757,
  churnPercent: 1.2,

  breakdown: {
    base: 12393,
    officeAddons: 1800,
    suiteAddons: 1400,
    skillPacks: 2400,
    overages: 757,
  },

  skus: [
    { id: 'SKU-001', sku: 'Enterprise Plan', type: 'base', mrr: 11497, customerCount: 3, meaning: 'Core enterprise licenses', nextStep: 'Upsell add-ons', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'SKU-002', sku: 'Professional Plan', type: 'base', mrr: 797, customerCount: 3, meaning: 'Mid-tier subscriptions', nextStep: 'Drive upgrades', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'SKU-003', sku: 'Starter Plan', type: 'base', mrr: 99, customerCount: 1, meaning: 'Entry-level plan', nextStep: 'Convert trial', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'SKU-004', sku: 'Office: Priority Support', type: 'office_addon', mrr: 900, customerCount: 3, meaning: 'Premium support tier', nextStep: 'Expand adoption', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'SKU-005', sku: 'Office: Extra Users', type: 'office_addon', mrr: 600, customerCount: 4, meaning: 'Additional seat licenses', nextStep: 'Monitor growth', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'SKU-006', sku: 'Office: Custom Branding', type: 'office_addon', mrr: 300, customerCount: 2, meaning: 'White-label features', nextStep: 'Upsell suite', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'SKU-007', sku: 'Suite: Analytics Pro', type: 'suite_addon', mrr: 800, customerCount: 2, meaning: 'Advanced analytics', nextStep: 'Feature adoption', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'SKU-008', sku: 'Suite: API Access', type: 'suite_addon', mrr: 600, customerCount: 2, meaning: 'Developer API access', nextStep: 'Monitor usage', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'SKU-009', sku: 'Skill Pack: Invoicing Agent', type: 'skill_pack', mrr: 1200, customerCount: 4, meaning: 'Automated invoicing', nextStep: 'Track outcomes', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'SKU-010', sku: 'Skill Pack: Contract Agent', type: 'skill_pack', mrr: 800, customerCount: 3, meaning: 'Contract management', nextStep: 'Gather feedback', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'SKU-011', sku: 'Skill Pack: Follow-up Agent', type: 'skill_pack', mrr: 400, customerCount: 2, meaning: 'Customer follow-ups', nextStep: 'Expand use cases', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'SKU-012', sku: 'API Overage', type: 'overage', mrr: 450, customerCount: 2, meaning: 'API limit exceeded', nextStep: 'Offer upgrade', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'SKU-013', sku: 'Storage Overage', type: 'overage', mrr: 307, customerCount: 1, meaning: 'Storage limit exceeded', nextStep: 'Cleanup or upgrade', updatedAt: '2026-02-01T00:00:00Z' },
  ] as RevenueSKU[],

  attentionItems: [
    { id: 'ATT-001', label: 'Skill Pack MRR up 15%', meaning: 'Agent adoption growing', nextStep: 'Feature more packs' },
    { id: 'ATT-002', label: 'Overage projected at $757', meaning: 'Customers exceeding limits', nextStep: 'Offer tier upgrades' },
    { id: 'ATT-003', label: '2 customers near API limit', meaning: 'May incur overages', nextStep: 'Proactive outreach' },
  ],
};

// ============================================
// SKILL PACK REGISTRY DATA
// ============================================
export interface SkillPack {
  id: string;
  packId: string;
  displayName: string;
  category: 'operations' | 'sales' | 'support' | 'finance' | 'legal';
  status: 'enabled' | 'disabled' | 'pending_approval' | 'deprecated';
  operatorStatus: 'Done' | 'Needs approval' | 'Blocked' | 'Failed' | 'Needs attention';
  meaning: string;
  nextStep: string;
  updatedAt: string;
  constraints: string[];
  requiresApprovalFor: string[];
  autonomyCap: 'low' | 'medium' | 'high';
  receiptsExpected: string[];
  pricing: {
    model: 'included' | 'paid' | 'usage';
    price?: number;
    quota?: number;
    overageRate?: number;
  };
  enabled: boolean;
  monetized: boolean;
  hasOverages: boolean;
}

export const skillPackRegistryData = {
  totalPacks: 10,
  enabledPacks: 7,
  packsRequiringApprovals: 3,
  monetizedPacks: 5,
  packsWithOverages: 2,

  packs: [
    {
      id: 'PACK-001',
      packId: 'sarah_front_desk',
      displayName: 'Sarah — Front Desk',
      category: 'support',
      status: 'enabled',
      operatorStatus: 'Done',
      meaning: 'Handles inbound voice calls, greets callers, and routes to appropriate staff',
      nextStep: 'Monitor call volume',
      updatedAt: '2026-02-01T10:00:00Z',
      constraints: ['Never provide legal, medical, or financial advice', 'Escalate after 3 unanswered questions', 'Transfer to human after 2 minutes of confusion'],
      requiresApprovalFor: [],
      autonomyCap: 'medium',
      receiptsExpected: ['answer_call', 'transfer_call', 'take_message', 'schedule_callback', 'escalate_to_human'],
      pricing: { model: 'included' },
      enabled: true,
      monetized: false,
      hasOverages: false,
    },
    {
      id: 'PACK-002',
      packId: 'eli_inbox',
      displayName: 'Eli — Inbox Manager',
      category: 'operations',
      status: 'enabled',
      operatorStatus: 'Done',
      meaning: 'Manages email inbox, categorizes messages, drafts responses, and escalates urgent items',
      nextStep: 'Review draft queue',
      updatedAt: '2026-02-02T08:00:00Z',
      constraints: ['Never auto-reply to external senders without approval', 'Flag suspicious emails for human review', 'Archive but never delete without explicit approval'],
      requiresApprovalFor: ['Sending replies to external contacts'],
      autonomyCap: 'medium',
      receiptsExpected: ['categorize_email', 'draft_reply', 'send_reply', 'archive_email', 'flag_urgent'],
      pricing: { model: 'included' },
      enabled: true,
      monetized: false,
      hasOverages: false,
    },
    {
      id: 'PACK-003',
      packId: 'quinn_invoices',
      displayName: 'Quinn — Invoicing',
      category: 'finance',
      status: 'enabled',
      operatorStatus: 'Done',
      meaning: 'Creates, sends, and tracks invoices. Handles payment follow-ups and reconciliation',
      nextStep: 'Monitor outcomes',
      updatedAt: '2026-02-01T14:00:00Z',
      constraints: ['Require voice confirmation for invoices over threshold', 'Never modify payment terms without approval', 'All invoice actions must be receipted'],
      requiresApprovalFor: ['Invoices over $5,000', 'Voiding invoices', 'Applying discounts over $500'],
      autonomyCap: 'high',
      receiptsExpected: ['create_invoice', 'send_invoice', 'void_invoice', 'apply_discount', 'mark_paid'],
      pricing: { model: 'paid', price: 299, quota: 100, overageRate: 2.5 },
      enabled: true,
      monetized: true,
      hasOverages: true,
    },
    {
      id: 'PACK-004',
      packId: 'nora-conference',
      displayName: 'Nora — Conference Ops',
      category: 'operations',
      status: 'enabled',
      operatorStatus: 'Done',
      meaning: 'Manages conference calls, handles participant routing, and maintains meeting transcripts',
      nextStep: 'Review transcript settings',
      updatedAt: '2026-02-02T06:00:00Z',
      constraints: ['Always start recording with consent announcement', 'Respect retention policy for transcripts', 'Route overflow to callback queue'],
      requiresApprovalFor: ['Starting conference recording'],
      autonomyCap: 'high',
      receiptsExpected: ['start_conference', 'add_participant', 'start_recording', 'generate_transcript', 'end_conference'],
      pricing: { model: 'paid', price: 199, quota: 50, overageRate: 1.5 },
      enabled: true,
      monetized: true,
      hasOverages: false,
    },
    {
      id: 'PACK-005',
      packId: 'adam-research',
      displayName: 'Adam — Research',
      category: 'operations',
      status: 'enabled',
      operatorStatus: 'Done',
      meaning: 'Conducts research, gathers information, and synthesizes findings into actionable reports',
      nextStep: 'Add integrations',
      updatedAt: '2026-02-01T12:00:00Z',
      constraints: ['Cite all sources in research outputs', 'Flag uncertainty when confidence is low', 'Never present speculation as fact'],
      requiresApprovalFor: [],
      autonomyCap: 'high',
      receiptsExpected: ['brave_search', 'tavily_search', 'pdf_preflight'],
      pricing: { model: 'included' },
      enabled: true,
      monetized: false,
      hasOverages: false,
    },
    {
      id: 'PACK-006',
      packId: 'tec-docs',
      displayName: 'Tec — Documentation',
      category: 'operations',
      status: 'enabled',
      operatorStatus: 'Done',
      meaning: 'Creates and maintains documentation, SOPs, and knowledge base articles',
      nextStep: 'Review flagged content',
      updatedAt: '2026-02-01T14:00:00Z',
      constraints: ['Maintain version history for all documents', 'Apply consistent formatting standards', 'Flag outdated content for review'],
      requiresApprovalFor: [],
      autonomyCap: 'high',
      receiptsExpected: ['pdf_preflight', 'playwright_pdf_renderer'],
      pricing: { model: 'included' },
      enabled: true,
      monetized: false,
      hasOverages: false,
    },
    {
      id: 'PACK-007',
      packId: 'finn_finance',
      displayName: 'Finn — Finance Analyst',
      category: 'finance',
      status: 'disabled',
      operatorStatus: 'Needs approval',
      meaning: 'Analyzes financial data, tracks metrics, and generates reports for business insights',
      nextStep: 'Connect Plaid',
      updatedAt: '2026-01-28T16:00:00Z',
      constraints: ['All financial data must be sourced from connected providers', 'Flag anomalies exceeding 10% variance', 'Never project without stating assumptions'],
      requiresApprovalFor: ['All financial reports', 'Variance alerts'],
      autonomyCap: 'low',
      receiptsExpected: [],
      pricing: { model: 'paid', price: 249, quota: 200, overageRate: 1.0 },
      enabled: false,
      monetized: true,
      hasOverages: false,
    },
    {
      id: 'PACK-008',
      packId: 'milo_ops',
      displayName: 'Milo — Operations Analyst',
      category: 'operations',
      status: 'disabled',
      operatorStatus: 'Needs approval',
      meaning: 'Monitors operations, identifies bottlenecks, and optimizes workflows for efficiency',
      nextStep: 'Define SLOs',
      updatedAt: '2026-01-25T10:00:00Z',
      constraints: ['Monitor SLOs and alert on breaches', 'Automate repetitive tasks when safe', 'Document all workflow changes'],
      requiresApprovalFor: ['Workflow automations', 'SLO modifications'],
      autonomyCap: 'medium',
      receiptsExpected: [],
      pricing: { model: 'usage', quota: 100, overageRate: 0.50 },
      enabled: false,
      monetized: true,
      hasOverages: false,
    },
    {
      id: 'PACK-009',
      packId: 'teressa_legal',
      displayName: 'Teressa — Legal Analyst',
      category: 'legal',
      status: 'disabled',
      operatorStatus: 'Needs attention',
      meaning: 'Reviews contracts, flags compliance issues, and assists with legal document organization',
      nextStep: 'Approve activation',
      updatedAt: '2026-01-20T11:00:00Z',
      constraints: ['Never provide legal advice - only summarize and flag', 'Escalate contract reviews to human counsel', 'Maintain strict confidentiality on all legal documents'],
      requiresApprovalFor: ['All actions (async_approval required)'],
      autonomyCap: 'low',
      receiptsExpected: ['pdf_preflight'],
      pricing: { model: 'paid', price: 349, quota: 30, overageRate: 5.0 },
      enabled: false,
      monetized: true,
      hasOverages: false,
    },
    {
      id: 'PACK-010',
      packId: 'ava_orchestrator',
      displayName: 'Ava — Chief of Staff',
      category: 'operations',
      status: 'enabled',
      operatorStatus: 'Done',
      meaning: 'Central orchestrator that coordinates all other staff members and manages workflow delegation',
      nextStep: 'Monitor delegation',
      updatedAt: '2026-02-03T10:00:00Z',
      constraints: ['Never execute without explicit approval for high-risk actions', 'Always maintain audit trail via receipts', 'Escalate ambiguous requests to human operator'],
      requiresApprovalFor: [],
      autonomyCap: 'high',
      receiptsExpected: ['delegate_task', 'escalate_incident'],
      pricing: { model: 'included' },
      enabled: true,
      monetized: false,
      hasOverages: false,
    },
  ] as SkillPack[],
};

// ============================================
// SKILL PACK ANALYTICS DATA
// ============================================
export interface SkillPackUsage {
  packId: string;
  displayName: string;
  actionsThisWeek: number;
  actionsLast30Days: number;
  successRate: number;
  avgCostPerAction: number;
}

export interface SkillPackOutcome {
  id: string;
  type: 'invoice_paid' | 'contract_signed' | 'meeting_booked' | 'ticket_resolved' | 'followup_converted';
  label: string;
  count: number;
  value: number;
}

export const skillPackAnalyticsData = {
  mostUsedThisWeek: 'Sarah — Front Desk',
  highestValueOutcomes: 'Quinn — Invoicing',
  approvalFrictionRate: 12.5,
  failureRate: 2.1,
  avgCostPerAction: 0.42,

  usage: [
    { packId: 'sarah_front_desk', displayName: 'Sarah — Front Desk', actionsThisWeek: 847, actionsLast30Days: 3420, successRate: 98.2, avgCostPerAction: 0.05 },
    { packId: 'eli_inbox', displayName: 'Eli — Inbox Manager', actionsThisWeek: 512, actionsLast30Days: 2048, successRate: 96.4, avgCostPerAction: 0.18 },
    { packId: 'quinn_invoices', displayName: 'Quinn — Invoicing', actionsThisWeek: 156, actionsLast30Days: 624, successRate: 99.1, avgCostPerAction: 0.85 },
    { packId: 'nora-conference', displayName: 'Nora — Conference Ops', actionsThisWeek: 189, actionsLast30Days: 756, successRate: 97.1, avgCostPerAction: 0.32 },
    { packId: 'adam-research', displayName: 'Adam — Research', actionsThisWeek: 94, actionsLast30Days: 376, successRate: 93.8, avgCostPerAction: 1.20 },
    { packId: 'tec-docs', displayName: 'Tec — Documentation', actionsThisWeek: 67, actionsLast30Days: 268, successRate: 97.5, avgCostPerAction: 0.45 },
    { packId: 'ava_orchestrator', displayName: 'Ava — Chief of Staff', actionsThisWeek: 312, actionsLast30Days: 1245, successRate: 99.7, avgCostPerAction: 0.08 },
  ] as SkillPackUsage[],

  outcomes: [
    { id: 'OUT-001', type: 'invoice_paid', label: 'Invoices Paid (Quinn)', count: 89, value: 142500 },
    { id: 'OUT-002', type: 'contract_signed', label: 'Contracts Reviewed (Teressa)', count: 12, value: 48000 },
    { id: 'OUT-003', type: 'meeting_booked', label: 'Conferences Managed (Nora)', count: 156, value: 0 },
    { id: 'OUT-004', type: 'ticket_resolved', label: 'Calls Handled (Sarah)', count: 412, value: 0 },
    { id: 'OUT-005', type: 'followup_converted', label: 'Emails Processed (Eli)', count: 234, value: 28500 },
  ] as SkillPackOutcome[],

  friction: {
    pendingApprovals: 7,
    avgApprovalTime: 4.2,
    translatedFailures: [
      { reason: 'Rate limit exceeded', count: 12, meaning: 'Too many requests too fast' },
      { reason: 'Validation failed', count: 8, meaning: 'Data format issues' },
      { reason: 'External API error', count: 5, meaning: 'Third-party service issues' },
    ],
  },

  attentionItems: [
    { id: 'ATT-001', label: 'Quinn invoicing: $142k collected this month', meaning: 'High value outcomes', nextStep: 'Feature success' },
    { id: 'ATT-002', label: '7 approvals pending >4 hours', meaning: 'Approval bottleneck', nextStep: 'Review queue' },
    { id: 'ATT-003', label: 'Eli inbox: 96.4% success rate', meaning: 'Strong email handling', nextStep: 'Expand auto-reply scope' },
  ],
};

// ============================================
// ACQUISITION ANALYTICS DATA
// ============================================
export interface ChannelPerformance {
  id: string;
  source: string;
  medium: string;
  campaign: string | null;
  visits: number;
  signups: number;
  activated: number;
  paid: number;
  conversionRate: number;
}

export interface AgeRangeData {
  range: '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+' | 'unknown' | 'prefer_not_to_say';
  signups: number;
  conversions: number;
  conversionRate: number;
}

export interface GenderData {
  gender: 'female' | 'male' | 'non_binary' | 'unknown' | 'prefer_not_to_say';
  signups: number;
  conversions: number;
  conversionRate: number;
}

export const acquisitionAnalyticsData = {
  signups7d: 127,
  signups30d: 498,
  conversionRate: 3.8,
  topChannel: 'Google Ads',
  bestConvertingAgeRange: '25-34',
  bestConvertingGender: 'female',

  channels: [
    { id: 'CH-001', source: 'google', medium: 'cpc', campaign: 'brand_2026_q1', visits: 2450, signups: 89, activated: 42, paid: 18, conversionRate: 3.6 },
    { id: 'CH-002', source: 'meta', medium: 'paid', campaign: 'retargeting_jan', visits: 1820, signups: 54, activated: 28, paid: 12, conversionRate: 3.0 },
    { id: 'CH-003', source: 'linkedin', medium: 'cpc', campaign: 'b2b_enterprise', visits: 890, signups: 38, activated: 22, paid: 9, conversionRate: 4.3 },
    { id: 'CH-004', source: 'organic', medium: 'search', campaign: null, visits: 3200, signups: 156, activated: 68, paid: 24, conversionRate: 4.9 },
    { id: 'CH-005', source: 'referral', medium: 'partner', campaign: null, visits: 540, signups: 45, activated: 28, paid: 14, conversionRate: 8.3 },
    { id: 'CH-006', source: 'direct', medium: 'none', campaign: null, visits: 1100, signups: 78, activated: 35, paid: 11, conversionRate: 7.1 },
    { id: 'CH-007', source: 'twitter', medium: 'organic', campaign: null, visits: 320, signups: 18, activated: 8, paid: 2, conversionRate: 5.6 },
    { id: 'CH-008', source: 'newsletter', medium: 'email', campaign: 'jan_digest', visits: 680, signups: 20, activated: 12, paid: 5, conversionRate: 2.9 },
  ] as ChannelPerformance[],

  funnel: {
    visits: 11000,
    signups: 498,
    activated: 243,
    paid: 95,
  },

  demographics: {
    ageRanges: [
      { range: '18-24', signups: 42, conversions: 8, conversionRate: 19.0 },
      { range: '25-34', signups: 178, conversions: 48, conversionRate: 27.0 },
      { range: '35-44', signups: 142, conversions: 35, conversionRate: 24.6 },
      { range: '45-54', signups: 68, conversions: 12, conversionRate: 17.6 },
      { range: '55-64', signups: 28, conversions: 4, conversionRate: 14.3 },
      { range: '65+', signups: 8, conversions: 1, conversionRate: 12.5 },
      { range: 'unknown', signups: 24, conversions: 5, conversionRate: 20.8 },
      { range: 'prefer_not_to_say', signups: 8, conversions: 2, conversionRate: 25.0 },
    ] as AgeRangeData[],
    genders: [
      { gender: 'female', signups: 198, conversions: 52, conversionRate: 26.3 },
      { gender: 'male', signups: 224, conversions: 48, conversionRate: 21.4 },
      { gender: 'non_binary', signups: 18, conversions: 4, conversionRate: 22.2 },
      { gender: 'unknown', signups: 42, conversions: 8, conversionRate: 19.0 },
      { gender: 'prefer_not_to_say', signups: 16, conversions: 3, conversionRate: 18.8 },
    ] as GenderData[],
    dataSource: 'ga4' as 'ga4' | 'meta' | 'self_reported',
    note: 'GA4 demographics include age/gender from consenting users only. Thresholds may apply.',
    unknownAgePercent: 6.4,
    unknownGenderPercent: 11.6,
  },

  attentionItems: [
    { id: 'ATT-001', label: 'Referral channel: 8.3% conversion', meaning: 'Best performing source', nextStep: 'Expand program' },
    { id: 'ATT-002', label: '25-34 age range: 27% conversion', meaning: 'Core demographic', nextStep: 'Double down on targeting' },
    { id: 'ATT-003', label: 'Twitter: low volume, decent rate', meaning: 'Potential growth channel', nextStep: 'Test paid promotion' },
  ],
};
