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
  totalPacks: 8,
  enabledPacks: 6,
  packsRequiringApprovals: 3,
  monetizedPacks: 5,
  packsWithOverages: 2,

  packs: [
    {
      id: 'PACK-001',
      packId: 'invoicing_agent_v2',
      displayName: 'Invoicing Agent',
      category: 'finance',
      status: 'enabled',
      operatorStatus: 'Done',
      meaning: 'Sends and tracks invoices automatically',
      nextStep: 'Monitor outcomes',
      updatedAt: '2026-02-01T10:00:00Z',
      constraints: ['Never sends duplicate invoices', 'Cannot exceed $10k without approval', 'Always CC accounts team'],
      requiresApprovalFor: ['Invoices over $5,000', 'International payments', 'New customer first invoice'],
      autonomyCap: 'high',
      receiptsExpected: ['invoice_sent', 'payment_received', 'reminder_sent'],
      pricing: { model: 'paid', price: 299, quota: 100, overageRate: 2.5 },
      enabled: true,
      monetized: true,
      hasOverages: true,
    },
    {
      id: 'PACK-002',
      packId: 'contract_agent_v1',
      displayName: 'Contract Agent',
      category: 'legal',
      status: 'enabled',
      operatorStatus: 'Needs approval',
      meaning: 'Drafts and manages contracts',
      nextStep: 'Review pending',
      updatedAt: '2026-02-02T08:00:00Z',
      constraints: ['Never signs without explicit approval', 'Always uses approved templates', 'Flags non-standard terms'],
      requiresApprovalFor: ['All contract signatures', 'Template modifications', 'Counterparty negotiations'],
      autonomyCap: 'low',
      receiptsExpected: ['contract_drafted', 'contract_sent', 'contract_signed'],
      pricing: { model: 'paid', price: 199, quota: 50, overageRate: 3.0 },
      enabled: true,
      monetized: true,
      hasOverages: false,
    },
    {
      id: 'PACK-003',
      packId: 'followup_agent_v1',
      displayName: 'Follow-up Agent',
      category: 'sales',
      status: 'enabled',
      operatorStatus: 'Done',
      meaning: 'Sends timely customer follow-ups',
      nextStep: 'Expand triggers',
      updatedAt: '2026-02-01T14:00:00Z',
      constraints: ['Max 3 follow-ups per contact per week', 'Respects unsubscribe requests', 'Business hours only'],
      requiresApprovalFor: ['VIP customer outreach', 'Discount offers over 20%'],
      autonomyCap: 'medium',
      receiptsExpected: ['followup_sent', 'reply_received', 'meeting_booked'],
      pricing: { model: 'paid', price: 149, quota: 200, overageRate: 0.50 },
      enabled: true,
      monetized: true,
      hasOverages: true,
    },
    {
      id: 'PACK-004',
      packId: 'support_triage_v1',
      displayName: 'Support Triage',
      category: 'support',
      status: 'enabled',
      operatorStatus: 'Done',
      meaning: 'Routes and prioritizes tickets',
      nextStep: 'Fine-tune routing',
      updatedAt: '2026-02-02T06:00:00Z',
      constraints: ['Never closes tickets without resolution', 'Escalates P0 immediately', 'Preserves full context'],
      requiresApprovalFor: ['Refund recommendations over $500'],
      autonomyCap: 'high',
      receiptsExpected: ['ticket_triaged', 'ticket_routed', 'ticket_escalated'],
      pricing: { model: 'included' },
      enabled: true,
      monetized: false,
      hasOverages: false,
    },
    {
      id: 'PACK-005',
      packId: 'meeting_scheduler_v1',
      displayName: 'Meeting Scheduler',
      category: 'operations',
      status: 'enabled',
      operatorStatus: 'Done',
      meaning: 'Books meetings automatically',
      nextStep: 'Add integrations',
      updatedAt: '2026-02-01T12:00:00Z',
      constraints: ['Respects calendar blocks', 'Minimum 30 min between meetings', 'No weekends'],
      requiresApprovalFor: ['External stakeholder meetings'],
      autonomyCap: 'high',
      receiptsExpected: ['meeting_scheduled', 'meeting_rescheduled', 'meeting_cancelled'],
      pricing: { model: 'included' },
      enabled: true,
      monetized: false,
      hasOverages: false,
    },
    {
      id: 'PACK-006',
      packId: 'expense_agent_v1',
      displayName: 'Expense Agent',
      category: 'finance',
      status: 'pending_approval',
      operatorStatus: 'Needs approval',
      meaning: 'Processes expense reports',
      nextStep: 'Approve activation',
      updatedAt: '2026-02-02T09:00:00Z',
      constraints: ['Cannot approve own expenses', 'Requires receipt for >$25', 'Follows category limits'],
      requiresApprovalFor: ['All expense approvals', 'Category exceptions'],
      autonomyCap: 'low',
      receiptsExpected: ['expense_submitted', 'expense_approved', 'expense_rejected'],
      pricing: { model: 'usage', quota: 100, overageRate: 1.0 },
      enabled: false,
      monetized: true,
      hasOverages: false,
    },
    {
      id: 'PACK-007',
      packId: 'data_sync_v1',
      displayName: 'Data Sync Agent',
      category: 'operations',
      status: 'disabled',
      operatorStatus: 'Blocked',
      meaning: 'Syncs data across systems',
      nextStep: 'Fix integration',
      updatedAt: '2026-01-28T16:00:00Z',
      constraints: ['Never overwrites primary source', 'Validates schema before sync', 'Logs all changes'],
      requiresApprovalFor: ['Schema changes', 'Bulk deletes'],
      autonomyCap: 'medium',
      receiptsExpected: ['sync_started', 'sync_completed', 'sync_failed'],
      pricing: { model: 'included' },
      enabled: false,
      monetized: false,
      hasOverages: false,
    },
    {
      id: 'PACK-008',
      packId: 'legacy_mailer_v0',
      displayName: 'Legacy Mailer',
      category: 'operations',
      status: 'deprecated',
      operatorStatus: 'Needs attention',
      meaning: 'Old email automation (deprecated)',
      nextStep: 'Migrate users',
      updatedAt: '2026-01-15T10:00:00Z',
      constraints: ['Read-only mode', 'No new campaigns'],
      requiresApprovalFor: [],
      autonomyCap: 'low',
      receiptsExpected: ['email_sent'],
      pricing: { model: 'included' },
      enabled: false,
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
  mostUsedThisWeek: 'Support Triage',
  highestValueOutcomes: 'Invoicing Agent',
  approvalFrictionRate: 12.5,
  failureRate: 2.1,
  avgCostPerAction: 0.42,

  usage: [
    { packId: 'support_triage_v1', displayName: 'Support Triage', actionsThisWeek: 847, actionsLast30Days: 3420, successRate: 98.2, avgCostPerAction: 0.05 },
    { packId: 'followup_agent_v1', displayName: 'Follow-up Agent', actionsThisWeek: 312, actionsLast30Days: 1245, successRate: 94.8, avgCostPerAction: 0.28 },
    { packId: 'meeting_scheduler_v1', displayName: 'Meeting Scheduler', actionsThisWeek: 189, actionsLast30Days: 756, successRate: 97.1, avgCostPerAction: 0.12 },
    { packId: 'invoicing_agent_v2', displayName: 'Invoicing Agent', actionsThisWeek: 156, actionsLast30Days: 624, successRate: 99.1, avgCostPerAction: 0.85 },
    { packId: 'contract_agent_v1', displayName: 'Contract Agent', actionsThisWeek: 42, actionsLast30Days: 168, successRate: 91.2, avgCostPerAction: 1.20 },
  ] as SkillPackUsage[],

  outcomes: [
    { id: 'OUT-001', type: 'invoice_paid', label: 'Invoices Paid', count: 89, value: 142500 },
    { id: 'OUT-002', type: 'contract_signed', label: 'Contracts Signed', count: 12, value: 48000 },
    { id: 'OUT-003', type: 'meeting_booked', label: 'Meetings Booked', count: 156, value: 0 },
    { id: 'OUT-004', type: 'ticket_resolved', label: 'Tickets Resolved', count: 412, value: 0 },
    { id: 'OUT-005', type: 'followup_converted', label: 'Follow-ups Converted', count: 34, value: 28500 },
  ] as SkillPackOutcome[],

  friction: {
    pendingApprovals: 7,
    avgApprovalTime: 4.2, // hours
    translatedFailures: [
      { reason: 'Rate limit exceeded', count: 12, meaning: 'Too many requests too fast' },
      { reason: 'Validation failed', count: 8, meaning: 'Data format issues' },
      { reason: 'External API error', count: 5, meaning: 'Third-party service issues' },
    ],
  },

  attentionItems: [
    { id: 'ATT-001', label: 'Contract Agent approval rate: 88%', meaning: 'Many contracts need review', nextStep: 'Tune autonomy' },
    { id: 'ATT-002', label: '7 approvals pending >4 hours', meaning: 'Approval bottleneck', nextStep: 'Review queue' },
    { id: 'ATT-003', label: 'Invoicing Agent: $142k collected', meaning: 'High value outcomes', nextStep: 'Feature success' },
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
