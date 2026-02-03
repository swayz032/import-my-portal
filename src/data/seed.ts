// Types
export interface Approval {
  id: string;
  type: string;
  risk: 'High' | 'Medium' | 'Low' | 'None';
  customer: string;
  summary: string;
  requestedBy: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Denied';
  decisionReason?: string;
  evidenceReceiptIds: string[];
  linkedIncidentId?: string;
}

export interface Incident {
  id: string;
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  status: 'Open' | 'Resolved';
  summary: string;
  customer: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  subscribed: boolean;
  timelineReceiptIds: string[];
  notes: IncidentNote[];
  // Trust Spine fields
  detectionSource: 'robot_test' | 'provider' | 'rule' | 'user_report';
  customerNotified: 'yes' | 'no' | 'queued';
  proofStatus: 'ok' | 'missing' | 'pending';
  recommendedAction?: string;
  correlationId?: string;
}

export interface IncidentNote {
  author: string;
  body: string;
  timestamp: string;
  isLLMAnalysis?: boolean;
}

export interface Receipt {
  id: string;
  timestamp: string;
  runId: string;
  correlationId: string;
  actor: string;
  actionType: string;
  outcome: 'Success' | 'Failed' | 'Blocked';
  provider: string;
  providerCallId: string;
  redactedRequest: string;
  redactedResponse: string;
  linkedIncidentId?: string | null;
  linkedApprovalId?: string | null;
  linkedCustomerId?: string | null;
}

export interface Customer {
  id: string;
  name: string;
  status: 'Active' | 'Trial' | 'Paused' | 'At Risk';
  plan: string;
  mrr: number;
  riskFlag: 'High' | 'Medium' | 'Low' | 'None';
  openIncidents: number;
  openApprovals: number;
  lastActivity: string;
  integrations: string[];
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  plan: string;
  status: 'Active' | 'Trial' | 'Past Due' | 'Cancelled';
  mrr: number;
  startedAt: string;
}

export interface Provider {
  id: string;
  name: string;
  type: string;
  status: 'Healthy' | 'At Risk' | 'Writes Paused' | 'Read-only Allowed';
  lastChecked: string;
  latency: number;
  p95Latency: number;
  errorRate: number;
  scopes: string[];
  lastSyncTime?: string;
  recentReceiptsCount?: number;
  permissionsSummary?: string;
}

// Seed Data
export const approvals: Approval[] = [
  {
    id: 'APR-001',
    type: 'Credential Rotation',
    risk: 'High',
    customer: 'Acme Corp',
    summary: 'Rotate Stripe API key for Acme Corp due to suspected leak',
    requestedBy: 'Security Bot',
    requestedAt: '2026-01-08T10:30:00Z',
    status: 'Pending',
    evidenceReceiptIds: ['RCP-101', 'RCP-102'],
    linkedIncidentId: 'INC-001',
  },
  {
    id: 'APR-002',
    type: 'Refund Request',
    risk: 'Medium',
    customer: 'TechStart Inc',
    summary: 'Process $2,500 refund for billing dispute',
    requestedBy: 'Support Agent',
    requestedAt: '2026-01-08T09:15:00Z',
    status: 'Pending',
    evidenceReceiptIds: ['RCP-103'],
  },
  {
    id: 'APR-003',
    type: 'Scope Expansion',
    risk: 'Medium',
    customer: 'Global Logistics',
    summary: 'Add write permissions to Salesforce integration',
    requestedBy: 'Integration Bot',
    requestedAt: '2026-01-07T16:45:00Z',
    status: 'Pending',
    evidenceReceiptIds: ['RCP-104'],
  },
  {
    id: 'APR-004',
    type: 'Account Upgrade',
    risk: 'Low',
    customer: 'StartupXYZ',
    summary: 'Upgrade from Starter to Professional plan',
    requestedBy: 'Billing System',
    requestedAt: '2026-01-07T14:00:00Z',
    status: 'Approved',
    decisionReason: 'Standard upgrade request, auto-approved',
    evidenceReceiptIds: [],
  },
];

export const incidents: Incident[] = [
  {
    id: 'INC-001',
    severity: 'P0',
    status: 'Open',
    summary: 'Stripe payment processing failing for Acme Corp',
    customer: 'Acme Corp',
    provider: 'Stripe',
    createdAt: '2026-01-08T10:00:00Z',
    updatedAt: '2026-01-08T10:45:00Z',
    subscribed: true,
    timelineReceiptIds: ['RCP-101', 'RCP-102'],
    detectionSource: 'provider',
    customerNotified: 'queued',
    proofStatus: 'ok',
    recommendedAction: 'Re-authenticate the Stripe integration',
    correlationId: 'corr-stripe-001',
    notes: [
      {
        author: 'System',
        body: 'Payment failure detected. Error: authentication_required',
        timestamp: '2026-01-08T10:00:00Z',
      },
      {
        author: 'Ava (LLM)',
        body: 'Analysis complete: The API key appears to have been rotated externally. Recommend re-authenticating the Stripe integration.',
        timestamp: '2026-01-08T10:30:00Z',
        isLLMAnalysis: true,
      },
    ],
  },
  {
    id: 'INC-002',
    severity: 'P1',
    status: 'Open',
    summary: 'Delayed webhook delivery from HubSpot',
    customer: 'Global Logistics',
    provider: 'HubSpot',
    createdAt: '2026-01-08T08:30:00Z',
    updatedAt: '2026-01-08T09:15:00Z',
    subscribed: false,
    timelineReceiptIds: ['RCP-105'],
    detectionSource: 'robot_test',
    customerNotified: 'no',
    proofStatus: 'pending',
    recommendedAction: 'Monitor HubSpot status page and wait for recovery',
    correlationId: 'corr-webhook-001',
    notes: [
      {
        author: 'System',
        body: 'Webhook delivery latency exceeded 5 minutes threshold',
        timestamp: '2026-01-08T08:30:00Z',
      },
    ],
  },
  {
    id: 'INC-003',
    severity: 'P2',
    status: 'Resolved',
    summary: 'Temporary Salesforce sync failure',
    customer: 'TechStart Inc',
    provider: 'Salesforce',
    createdAt: '2026-01-07T14:00:00Z',
    updatedAt: '2026-01-07T15:30:00Z',
    subscribed: false,
    timelineReceiptIds: ['RCP-106', 'RCP-107'],
    detectionSource: 'rule',
    customerNotified: 'yes',
    proofStatus: 'ok',
    recommendedAction: 'No action needed - resolved',
    correlationId: 'corr-sync-001',
    notes: [
      {
        author: 'System',
        body: 'Sync recovered automatically after provider maintenance',
        timestamp: '2026-01-07T15:30:00Z',
      },
    ],
  },
];

export const receipts: Receipt[] = [
  {
    id: 'RCP-101',
    timestamp: '2026-01-08T10:00:00Z',
    runId: 'run-abc123',
    correlationId: 'corr-stripe-001',
    actor: 'Payment Processor',
    actionType: 'Payment Attempt',
    outcome: 'Failed',
    provider: 'Stripe',
    providerCallId: 'ch_1234567890',
    redactedRequest: '{"amount": "[REDACTED]", "currency": "usd", "customer": "[REDACTED]"}',
    redactedResponse: '{"error": {"code": "authentication_required", "message": "[REDACTED]"}}',
    linkedIncidentId: 'INC-001',
    linkedCustomerId: 'CUST-001',
  },
  {
    id: 'RCP-102',
    timestamp: '2026-01-08T10:15:00Z',
    runId: 'run-abc123',
    correlationId: 'corr-stripe-001',
    actor: 'Safety Bot',
    actionType: 'Credential Check',
    outcome: 'Blocked',
    provider: 'Stripe',
    providerCallId: '',
    redactedRequest: '{"action": "verify_credentials"}',
    redactedResponse: '{"status": "invalid", "reason": "key_expired"}',
    linkedIncidentId: 'INC-001',
    linkedApprovalId: 'APR-001',
  },
  {
    id: 'RCP-103',
    timestamp: '2026-01-08T09:00:00Z',
    runId: 'run-def456',
    correlationId: 'corr-refund-001',
    actor: 'Support Agent',
    actionType: 'Refund Request',
    outcome: 'Success',
    provider: 'Internal',
    providerCallId: '',
    redactedRequest: '{"refundAmount": "[REDACTED]", "reason": "[REDACTED]"}',
    redactedResponse: '{"status": "pending_approval"}',
    linkedApprovalId: 'APR-002',
    linkedCustomerId: 'CUST-002',
  },
  {
    id: 'RCP-104',
    timestamp: '2026-01-07T16:30:00Z',
    runId: 'run-ghi789',
    correlationId: 'corr-scope-001',
    actor: 'Integration Bot',
    actionType: 'Scope Request',
    outcome: 'Success',
    provider: 'Salesforce',
    providerCallId: 'sf_oauth_123',
    redactedRequest: '{"scopes": ["read", "write"]}',
    redactedResponse: '{"status": "pending_approval"}',
    linkedApprovalId: 'APR-003',
    linkedCustomerId: 'CUST-003',
  },
  {
    id: 'RCP-105',
    timestamp: '2026-01-08T08:35:00Z',
    runId: 'run-jkl012',
    correlationId: 'corr-webhook-001',
    actor: 'Webhook Receiver',
    actionType: 'Webhook Processing',
    outcome: 'Success',
    provider: 'HubSpot',
    providerCallId: 'hs_webhook_456',
    redactedRequest: '{"event": "contact.updated", "data": "[REDACTED]"}',
    redactedResponse: '{"processed": true, "latency_ms": 312000}',
    linkedIncidentId: 'INC-002',
    linkedCustomerId: 'CUST-003',
  },
  {
    id: 'RCP-106',
    timestamp: '2026-01-07T14:00:00Z',
    runId: 'run-mno345',
    correlationId: 'corr-sync-001',
    actor: 'Sync Agent',
    actionType: 'Data Sync',
    outcome: 'Failed',
    provider: 'Salesforce',
    providerCallId: 'sf_sync_789',
    redactedRequest: '{"operation": "sync", "records": "[REDACTED]"}',
    redactedResponse: '{"error": "service_unavailable"}',
    linkedIncidentId: 'INC-003',
    linkedCustomerId: 'CUST-002',
  },
  {
    id: 'RCP-107',
    timestamp: '2026-01-07T15:30:00Z',
    runId: 'run-mno345',
    correlationId: 'corr-sync-001',
    actor: 'Sync Agent',
    actionType: 'Data Sync Retry',
    outcome: 'Success',
    provider: 'Salesforce',
    providerCallId: 'sf_sync_790',
    redactedRequest: '{"operation": "sync", "records": "[REDACTED]"}',
    redactedResponse: '{"synced": 142, "failed": 0}',
    linkedIncidentId: 'INC-003',
    linkedCustomerId: 'CUST-002',
  },
];

export const customers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Acme Corp',
    status: 'At Risk',
    plan: 'Enterprise',
    mrr: 4999,
    riskFlag: 'High',
    openIncidents: 1,
    openApprovals: 1,
    lastActivity: '2026-01-08T10:45:00Z',
    integrations: ['Stripe', 'Salesforce', 'Slack'],
  },
  {
    id: 'CUST-002',
    name: 'TechStart Inc',
    status: 'Active',
    plan: 'Professional',
    mrr: 299,
    riskFlag: 'None',
    openIncidents: 0,
    openApprovals: 1,
    lastActivity: '2026-01-08T09:15:00Z',
    integrations: ['Stripe', 'Salesforce'],
  },
  {
    id: 'CUST-003',
    name: 'Global Logistics',
    status: 'Active',
    plan: 'Enterprise',
    mrr: 3499,
    riskFlag: 'Medium',
    openIncidents: 1,
    openApprovals: 1,
    lastActivity: '2026-01-08T09:00:00Z',
    integrations: ['HubSpot', 'Salesforce', 'Stripe'],
  },
  {
    id: 'CUST-004',
    name: 'StartupXYZ',
    status: 'Trial',
    plan: 'Starter',
    mrr: 99,
    riskFlag: 'None',
    openIncidents: 0,
    openApprovals: 0,
    lastActivity: '2026-01-07T18:00:00Z',
    integrations: ['Stripe'],
  },
  {
    id: 'CUST-005',
    name: 'MegaCorp Industries',
    status: 'Active',
    plan: 'Enterprise',
    mrr: 2999,
    riskFlag: 'Low',
    openIncidents: 0,
    openApprovals: 0,
    lastActivity: '2026-01-08T08:00:00Z',
    integrations: ['Stripe', 'Salesforce', 'HubSpot', 'Slack'],
  },
  {
    id: 'CUST-006',
    name: 'EduTech Solutions',
    status: 'Paused',
    plan: 'Professional',
    mrr: 199,
    riskFlag: 'Medium',
    openIncidents: 0,
    openApprovals: 0,
    lastActivity: '2026-01-01T12:00:00Z',
    integrations: ['Stripe'],
  },
];

export const subscriptions: Subscription[] = [
  { id: 'SUB-001', customerId: 'CUST-001', customerName: 'Acme Corp', plan: 'Enterprise', status: 'Active', mrr: 4999, startedAt: '2025-06-15T00:00:00Z' },
  { id: 'SUB-002', customerId: 'CUST-002', customerName: 'TechStart Inc', plan: 'Professional', status: 'Active', mrr: 299, startedAt: '2025-09-01T00:00:00Z' },
  { id: 'SUB-003', customerId: 'CUST-003', customerName: 'Global Logistics', plan: 'Enterprise', status: 'Active', mrr: 3499, startedAt: '2025-04-20T00:00:00Z' },
  { id: 'SUB-004', customerId: 'CUST-004', customerName: 'StartupXYZ', plan: 'Starter', status: 'Trial', mrr: 99, startedAt: '2026-01-01T00:00:00Z' },
  { id: 'SUB-005', customerId: 'CUST-005', customerName: 'MegaCorp Industries', plan: 'Enterprise', status: 'Active', mrr: 2999, startedAt: '2025-03-10T00:00:00Z' },
  { id: 'SUB-006', customerId: 'CUST-006', customerName: 'EduTech Solutions', plan: 'Professional', status: 'Past Due', mrr: 199, startedAt: '2025-08-15T00:00:00Z' },
  { id: 'SUB-007', customerId: 'CUST-007', customerName: 'Innovate Labs', plan: 'Professional', status: 'Cancelled', mrr: 299, startedAt: '2025-05-01T00:00:00Z' },
];

export const providers: Provider[] = [
  {
    id: 'PROV-001',
    name: 'Stripe',
    type: 'Payment',
    status: 'At Risk',
    lastChecked: '2026-01-08T10:50:00Z',
    latency: 380,
    p95Latency: 450,
    errorRate: 2.5,
    scopes: ['payments.read', 'payments.write', 'customers.read'],
    lastSyncTime: '2026-01-08T10:45:00Z',
    recentReceiptsCount: 12,
    permissionsSummary: 'Full payment access',
  },
  {
    id: 'PROV-002',
    name: 'Salesforce',
    type: 'CRM',
    status: 'Healthy',
    lastChecked: '2026-01-08T10:50:00Z',
    latency: 145,
    p95Latency: 180,
    errorRate: 0.1,
    scopes: ['contacts.read', 'contacts.write', 'deals.read'],
    lastSyncTime: '2026-01-08T10:48:00Z',
    recentReceiptsCount: 8,
    permissionsSummary: 'CRM read/write',
  },
  {
    id: 'PROV-003',
    name: 'HubSpot',
    type: 'Marketing',
    status: 'Writes Paused',
    lastChecked: '2026-01-08T10:50:00Z',
    latency: 520,
    p95Latency: 680,
    errorRate: 5.2,
    scopes: ['contacts.read', 'contacts.write', 'campaigns.read'],
    lastSyncTime: '2026-01-08T09:30:00Z',
    recentReceiptsCount: 3,
    permissionsSummary: 'Marketing automation',
  },
  {
    id: 'PROV-004',
    name: 'Slack',
    type: 'Communication',
    status: 'Healthy',
    lastChecked: '2026-01-08T10:50:00Z',
    latency: 85,
    p95Latency: 120,
    errorRate: 0,
    scopes: ['messages.read', 'messages.write', 'channels.read'],
    lastSyncTime: '2026-01-08T10:49:00Z',
    recentReceiptsCount: 25,
    permissionsSummary: 'Messaging access',
  },
  {
    id: 'PROV-005',
    name: 'Twilio',
    type: 'Communication',
    status: 'Healthy',
    lastChecked: '2026-01-08T10:50:00Z',
    latency: 120,
    p95Latency: 160,
    errorRate: 0.2,
    scopes: ['sms.send', 'calls.read'],
    lastSyncTime: '2026-01-08T10:47:00Z',
    recentReceiptsCount: 5,
    permissionsSummary: 'SMS/Voice access',
  },
];

// Business Metrics
export const businessMetrics = {
  totalMRR: 12393,
  mrrGrowth: 8.5,
  activeCustomers: 5,
  newSubscriptions7d: 2,
  churnRate: 1.2,
  churn30d: 2,
  failedPayments: {
    count: 3,
    amount: 1499,
  },
  trialConversion: 42,
  refundsDisputes: {
    refunds: 1,
    disputes: 0,
    amount: 299,
  },
  expansionMRR: 1200,
  contractionMRR: 400,
  mrrTrend: [
    { date: '2025-08-01', mrr: 9500 },
    { date: '2025-09-01', mrr: 10200 },
    { date: '2025-10-01', mrr: 10800 },
    { date: '2025-11-01', mrr: 11200 },
    { date: '2025-12-01', mrr: 11800 },
    { date: '2026-01-01', mrr: 12393 },
  ],
};

// Ops Metrics
export const opsMetrics = {
  openApprovals: 3,
  activeIncidents: {
    p0: 1,
    p1: 1,
    p2: 0,
    p3: 0,
  },
  successfulActionsToday: 1247,
  providerHealth: {
    status: 'Degraded',
    p95Latency: 380,
  },
  queueHealth: {
    depth: 12,
    lag: 2.3,
    retries: 3,
  },
  llmAnalyst: {
    status: 'Online',
    lastAnalysis: '2026-01-08T10:30:00Z',
  },
  errorBudget: {
    remaining: 72,
    burnRate: 1.3,
  },
};
