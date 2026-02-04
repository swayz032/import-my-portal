/**
 * API CLIENT - Stubbed functions returning canonical-shaped mock data
 * 
 * These will be wired to real APIs later. For now, they return mock data
 * that matches the canonical Trust Spine contract shapes.
 */

import {
  Receipt,
  ReceiptFilters,
  AuthorityQueueItem,
  AuthorityQueueFilters,
  OutboxJob,
  OutboxFilters,
  ProviderCallLog,
  ProviderCallLogFilters,
  Incident,
  IncidentFilters,
  ProviderInfo,
  EcosystemSyncStatus,
} from '@/contracts';

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// RECEIPTS
// ============================================================================
export async function listReceipts(filters?: ReceiptFilters): Promise<Receipt[]> {
  await delay(100);
  
  let data = MOCK_RECEIPTS;
  
  if (filters?.status) {
    data = data.filter(r => r.status === filters.status);
  }
  if (filters?.provider) {
    data = data.filter(r => r.provider === filters.provider);
  }
  if (filters?.correlation_id) {
    data = data.filter(r => r.correlation_id === filters.correlation_id);
  }
  
  return data;
}

// ============================================================================
// AUTHORITY QUEUE
// ============================================================================
export async function listAuthorityQueue(filters?: AuthorityQueueFilters): Promise<AuthorityQueueItem[]> {
  await delay(100);
  
  let data = MOCK_AUTHORITY_QUEUE;
  
  if (filters?.status) {
    data = data.filter(a => a.status === filters.status);
  }
  if (filters?.risk_level) {
    data = data.filter(a => a.risk_level === filters.risk_level);
  }
  
  return data;
}

// ============================================================================
// OUTBOX JOBS
// ============================================================================
export async function listOutboxJobs(filters?: OutboxFilters): Promise<OutboxJob[]> {
  await delay(100);
  
  let data = MOCK_OUTBOX_JOBS;
  
  if (filters?.status) {
    data = data.filter(j => j.status === filters.status);
  }
  if (filters?.provider) {
    data = data.filter(j => j.provider === filters.provider);
  }
  
  return data;
}

// ============================================================================
// PROVIDER CALL LOGS
// ============================================================================
export async function listProviderCallLogs(filters?: ProviderCallLogFilters): Promise<ProviderCallLog[]> {
  await delay(100);
  
  let data = MOCK_PROVIDER_CALL_LOGS;
  
  if (filters?.provider) {
    data = data.filter(l => l.provider === filters.provider);
  }
  if (filters?.status) {
    data = data.filter(l => l.status === filters.status);
  }
  
  return data;
}

// ============================================================================
// INCIDENTS
// ============================================================================
export async function listIncidents(filters?: IncidentFilters): Promise<Incident[]> {
  await delay(100);
  
  let data = MOCK_INCIDENTS;
  
  if (filters?.severity) {
    data = data.filter(i => i.severity === filters.severity);
  }
  if (filters?.status) {
    data = data.filter(i => i.status === filters.status);
  }
  if (filters?.proof_status) {
    data = data.filter(i => i.proof_status === filters.proof_status);
  }
  
  return data;
}

// ============================================================================
// PROVIDERS
// ============================================================================
export async function listProviders(): Promise<ProviderInfo[]> {
  await delay(100);
  return MOCK_PROVIDERS;
}

// ============================================================================
// ECOSYSTEM SYNC
// ============================================================================
export async function getEcosystemSyncStatus(): Promise<EcosystemSyncStatus> {
  await delay(50);
  return MOCK_ECOSYSTEM_SYNC;
}

// ============================================================================
// MOCK DATA - Canonical shapes
// ============================================================================

const MOCK_RECEIPTS: Receipt[] = [
  {
    id: 'rcp-001',
    suite_id: 'suite-acme',
    office_id: 'office-hq',
    domain: 'payments',
    action_type: 'payment.process',
    status: 'failed',
    created_at: '2026-02-04T10:00:00Z',
    correlation_id: 'corr-stripe-001',
    payload: { amount: 2500, currency: 'usd', customer: 'cust_redacted' },
    provider: 'Stripe',
    request_id: 'req_abc123',
  },
  {
    id: 'rcp-002',
    suite_id: 'suite-acme',
    office_id: 'office-hq',
    domain: 'security',
    action_type: 'credential.check',
    status: 'blocked',
    created_at: '2026-02-04T10:15:00Z',
    correlation_id: 'corr-stripe-001',
    payload: { action: 'verify_credentials' },
    provider: 'Stripe',
  },
  {
    id: 'rcp-003',
    suite_id: 'suite-techstart',
    office_id: 'office-main',
    domain: 'billing',
    action_type: 'refund.request',
    status: 'success',
    created_at: '2026-02-04T09:00:00Z',
    correlation_id: 'corr-refund-001',
    payload: { refund_amount: 2500, reason: 'billing_dispute' },
    provider: 'Internal',
  },
  {
    id: 'rcp-004',
    suite_id: 'suite-global',
    office_id: 'office-eu',
    domain: 'integrations',
    action_type: 'scope.request',
    status: 'success',
    created_at: '2026-02-03T16:30:00Z',
    correlation_id: 'corr-scope-001',
    payload: { scopes: ['read', 'write'] },
    provider: 'Salesforce',
  },
  {
    id: 'rcp-005',
    suite_id: 'suite-global',
    office_id: 'office-eu',
    domain: 'webhooks',
    action_type: 'webhook.process',
    status: 'success',
    created_at: '2026-02-04T08:35:00Z',
    correlation_id: 'corr-webhook-001',
    payload: { event: 'contact.updated', latency_ms: 312000 },
    provider: 'HubSpot',
  },
];

const MOCK_AUTHORITY_QUEUE: AuthorityQueueItem[] = [
  {
    id: 'aq-001',
    suite_id: 'suite-acme',
    office_id: 'office-hq',
    status: 'pending',
    risk_level: 'high',
    summary: 'Rotate Stripe API key for Acme Corp due to suspected leak',
    requested_at: '2026-02-04T10:30:00Z',
    linked_receipt_ids: ['rcp-001', 'rcp-002'],
    correlation_id: 'corr-stripe-001',
    requested_by: 'Security Bot',
    type: 'Credential Rotation',
    customer: 'Acme Corp',
  },
  {
    id: 'aq-002',
    suite_id: 'suite-techstart',
    office_id: 'office-main',
    status: 'pending',
    risk_level: 'medium',
    summary: 'Process $2,500 refund for billing dispute',
    requested_at: '2026-02-04T09:15:00Z',
    linked_receipt_ids: ['rcp-003'],
    correlation_id: 'corr-refund-001',
    requested_by: 'Support Agent',
    type: 'Refund Request',
    customer: 'TechStart Inc',
  },
  {
    id: 'aq-003',
    suite_id: 'suite-global',
    office_id: 'office-eu',
    status: 'pending',
    risk_level: 'medium',
    summary: 'Add write permissions to Salesforce integration',
    requested_at: '2026-02-03T16:45:00Z',
    linked_receipt_ids: ['rcp-004'],
    correlation_id: 'corr-scope-001',
    requested_by: 'Integration Bot',
    type: 'Scope Expansion',
    customer: 'Global Logistics',
  },
  {
    id: 'aq-004',
    suite_id: 'suite-startup',
    office_id: 'office-main',
    status: 'approved',
    risk_level: 'low',
    summary: 'Upgrade from Starter to Professional plan',
    requested_at: '2026-02-03T14:00:00Z',
    decision_at: '2026-02-03T14:05:00Z',
    decided_by: 'Auto-Approver',
    requested_by: 'Billing System',
    type: 'Account Upgrade',
    customer: 'StartupXYZ',
  },
];

const MOCK_OUTBOX_JOBS: OutboxJob[] = [
  {
    id: 'job-001',
    suite_id: 'suite-acme',
    office_id: 'office-hq',
    status: 'queued',
    queued_at: '2026-02-04T10:45:00Z',
    attempts: 0,
    correlation_id: 'corr-stripe-001',
    action_type: 'credential.rotate',
    provider: 'Stripe',
  },
  {
    id: 'job-002',
    suite_id: 'suite-techstart',
    office_id: 'office-main',
    status: 'processing',
    queued_at: '2026-02-04T09:20:00Z',
    started_at: '2026-02-04T09:21:00Z',
    attempts: 1,
    correlation_id: 'corr-refund-001',
    action_type: 'refund.execute',
    provider: 'Stripe',
  },
  {
    id: 'job-003',
    suite_id: 'suite-global',
    office_id: 'office-eu',
    status: 'completed',
    queued_at: '2026-02-04T08:00:00Z',
    started_at: '2026-02-04T08:01:00Z',
    finished_at: '2026-02-04T08:02:00Z',
    attempts: 1,
    correlation_id: 'corr-sync-001',
    action_type: 'data.sync',
    provider: 'Salesforce',
  },
  {
    id: 'job-004',
    suite_id: 'suite-global',
    office_id: 'office-eu',
    status: 'failed',
    queued_at: '2026-02-04T07:00:00Z',
    started_at: '2026-02-04T07:01:00Z',
    finished_at: '2026-02-04T07:02:00Z',
    attempts: 3,
    correlation_id: 'corr-webhook-fail',
    action_type: 'webhook.retry',
    provider: 'HubSpot',
    error_message: 'Max retries exceeded',
  },
];

const MOCK_PROVIDER_CALL_LOGS: ProviderCallLog[] = [
  {
    id: 'pcl-001',
    suite_id: 'suite-acme',
    provider: 'Stripe',
    action_type: 'payment.create',
    status: 'failed',
    started_at: '2026-02-04T10:00:00Z',
    finished_at: '2026-02-04T10:00:02Z',
    correlation_id: 'corr-stripe-001',
    request_meta: { endpoint: '/v1/charges', method: 'POST' },
    response_meta: { status: 401, error: 'authentication_required' },
    duration_ms: 2000,
  },
  {
    id: 'pcl-002',
    suite_id: 'suite-global',
    provider: 'Salesforce',
    action_type: 'contact.update',
    status: 'success',
    started_at: '2026-02-04T08:01:00Z',
    finished_at: '2026-02-04T08:01:00Z',
    correlation_id: 'corr-sync-001',
    request_meta: { endpoint: '/services/data/v56.0/sobjects/Contact', method: 'PATCH' },
    response_meta: { status: 200 },
    duration_ms: 145,
  },
  {
    id: 'pcl-003',
    suite_id: 'suite-global',
    provider: 'HubSpot',
    action_type: 'webhook.receive',
    status: 'timeout',
    started_at: '2026-02-04T08:30:00Z',
    finished_at: '2026-02-04T08:35:00Z',
    correlation_id: 'corr-webhook-001',
    request_meta: { endpoint: '/webhook/hubspot', method: 'POST' },
    response_meta: { status: 504, error: 'gateway_timeout' },
    duration_ms: 300000,
  },
];

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    suite_id: 'suite-acme',
    severity: 'P0',
    status: 'open',
    created_at: '2026-02-04T10:00:00Z',
    updated_at: '2026-02-04T10:45:00Z',
    summary: 'Stripe payment processing failing for Acme Corp',
    linked_receipt_ids: ['rcp-001', 'rcp-002'],
    correlation_id: 'corr-stripe-001',
    customer: 'Acme Corp',
    provider: 'Stripe',
    detection_source: 'provider',
    customer_notified: 'queued',
    proof_status: 'ok',
    recommended_action: 'Re-authenticate the Stripe integration',
    notes: [
      {
        author: 'System',
        body: 'Payment failure detected. Error: authentication_required',
        timestamp: '2026-02-04T10:00:00Z',
      },
      {
        author: 'Ava (LLM)',
        body: 'Analysis complete: The API key appears to have been rotated externally. Recommend re-authenticating the Stripe integration.',
        timestamp: '2026-02-04T10:30:00Z',
        is_llm_analysis: true,
      },
    ],
  },
  {
    id: 'inc-002',
    suite_id: 'suite-global',
    severity: 'P1',
    status: 'investigating',
    created_at: '2026-02-04T08:30:00Z',
    updated_at: '2026-02-04T09:15:00Z',
    summary: 'Delayed webhook delivery from HubSpot',
    linked_receipt_ids: ['rcp-005'],
    correlation_id: 'corr-webhook-001',
    customer: 'Global Logistics',
    provider: 'HubSpot',
    detection_source: 'robot_test',
    customer_notified: 'no',
    proof_status: 'pending',
    recommended_action: 'Monitor HubSpot status page and wait for recovery',
  },
  {
    id: 'inc-003',
    suite_id: 'suite-techstart',
    severity: 'P2',
    status: 'resolved',
    created_at: '2026-02-03T14:00:00Z',
    updated_at: '2026-02-03T15:30:00Z',
    summary: 'Temporary Salesforce sync failure',
    linked_receipt_ids: [],
    correlation_id: 'corr-sync-001',
    customer: 'TechStart Inc',
    provider: 'Salesforce',
    detection_source: 'rule',
    customer_notified: 'yes',
    proof_status: 'ok',
    recommended_action: 'No action needed - resolved',
  },
];

const MOCK_PROVIDERS: ProviderInfo[] = [
  {
    id: 'prov-001',
    name: 'Stripe',
    type: 'Payment',
    connection_status: 'degraded',
    capability_scope: 'writes_enabled',
    last_checked: '2026-02-04T10:50:00Z',
    latency_ms: 380,
    p95_latency_ms: 450,
    error_rate: 2.5,
    scopes: ['payments.read', 'payments.write', 'customers.read'],
    last_sync_time: '2026-02-04T10:45:00Z',
    receipt_coverage_percent: 94,
    permissions_summary: 'Full payment access',
  },
  {
    id: 'prov-002',
    name: 'Salesforce',
    type: 'CRM',
    connection_status: 'connected',
    capability_scope: 'writes_enabled',
    last_checked: '2026-02-04T10:50:00Z',
    latency_ms: 145,
    p95_latency_ms: 180,
    error_rate: 0.1,
    scopes: ['contacts.read', 'contacts.write', 'deals.read'],
    last_sync_time: '2026-02-04T10:48:00Z',
    receipt_coverage_percent: 98,
    permissions_summary: 'CRM read/write',
  },
  {
    id: 'prov-003',
    name: 'HubSpot',
    type: 'Marketing',
    connection_status: 'degraded',
    capability_scope: 'writes_paused',
    last_checked: '2026-02-04T10:50:00Z',
    latency_ms: 520,
    p95_latency_ms: 680,
    error_rate: 5.2,
    scopes: ['contacts.read', 'contacts.write', 'campaigns.read'],
    last_sync_time: '2026-02-04T09:30:00Z',
    receipt_coverage_percent: 76,
    permissions_summary: 'Marketing automation',
  },
  {
    id: 'prov-004',
    name: 'Slack',
    type: 'Communication',
    connection_status: 'connected',
    capability_scope: 'writes_enabled',
    last_checked: '2026-02-04T10:50:00Z',
    latency_ms: 85,
    p95_latency_ms: 120,
    error_rate: 0,
    scopes: ['messages.read', 'messages.write', 'channels.read'],
    last_sync_time: '2026-02-04T10:49:00Z',
    receipt_coverage_percent: 100,
    permissions_summary: 'Messaging access',
  },
  {
    id: 'prov-005',
    name: 'Twilio',
    type: 'Communication',
    connection_status: 'connected',
    capability_scope: 'writes_enabled',
    last_checked: '2026-02-04T10:50:00Z',
    latency_ms: 120,
    p95_latency_ms: 160,
    error_rate: 0.2,
    scopes: ['sms.send', 'calls.read'],
    last_sync_time: '2026-02-04T10:47:00Z',
    receipt_coverage_percent: 99,
    permissions_summary: 'SMS/Voice access',
  },
];

const MOCK_ECOSYSTEM_SYNC: EcosystemSyncStatus = {
  pack_version: 'v2.4.1',
  contracts_loaded: true,
  schema_drift_detected: false,
  drift_warnings: [],
  last_sync_check: '2026-02-04T10:50:00Z',
};
