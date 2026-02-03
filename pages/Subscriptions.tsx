import { Panel } from '@/components/shared/Panel';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable } from '@/components/shared/DataTable';
import { StatusChip } from '@/components/shared/StatusChip';
import { subscriptions, businessMetrics, Subscription } from '@/data/seed';
import { formatCurrency, formatDateShort } from '@/lib/formatters';
import { DollarSign, Users, FileWarning, CheckCircle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useSystem } from '@/contexts/SystemContext';
import { ModeText } from '@/components/shared/ModeText';
import { ModeDetails } from '@/components/shared/ModeDetails';

const eventData = [
  { name: 'Jan 1', payments: 12, upgrades: 3, downgrades: 1, cancellations: 0 },
  { name: 'Jan 2', payments: 8, upgrades: 2, downgrades: 0, cancellations: 1 },
  { name: 'Jan 3', payments: 15, upgrades: 4, downgrades: 2, cancellations: 0 },
  { name: 'Jan 4', payments: 10, upgrades: 1, downgrades: 0, cancellations: 0 },
  { name: 'Jan 5', payments: 18, upgrades: 5, downgrades: 1, cancellations: 1 },
  { name: 'Jan 6', payments: 14, upgrades: 2, downgrades: 0, cancellations: 0 },
  { name: 'Jan 7', payments: 22, upgrades: 3, downgrades: 1, cancellations: 0 },
];

const planBreakdown = [
  { plan: 'Enterprise', count: 3, mrr: 11497, percent: 93 },
  { plan: 'Professional', count: 3, mrr: 797, percent: 6 },
  { plan: 'Starter', count: 1, mrr: 99, percent: 1 },
];

export default function Subscriptions() {
  const { viewMode } = useSystem();
  const activeSubscriptions = subscriptions.filter(s => s.status === 'Active' || s.status === 'Trial');
  const overdueSubscriptions = subscriptions.filter(s => s.status === 'Past Due');

  const getStatusType = (status: Subscription['status']) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Trial': return 'pending';
      case 'Past Due': return 'critical';
      case 'Cancelled': return 'neutral';
      default: return 'neutral';
    }
  };

  const getOperatorStatus = (status: Subscription['status']) => {
    switch (status) {
      case 'Active': return 'Active';
      case 'Trial': return 'Trying Out';
      case 'Past Due': return 'Payment Issue';
      case 'Cancelled': return 'Ended';
      default: return status;
    }
  };

  // Operator columns (simplified)
  const operatorColumns = [
    { key: 'customerName', header: 'Customer' },
    { key: 'plan', header: 'Plan' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (s: Subscription) => <StatusChip status={getStatusType(s.status)} label={getOperatorStatus(s.status)} /> 
    },
    { key: 'mrr', header: 'Monthly', render: (s: Subscription) => formatCurrency(s.mrr) },
    { key: 'startedAt', header: 'Started', render: (s: Subscription) => <span className="text-text-secondary">{formatDateShort(s.startedAt)}</span> },
  ];

  // Engineer columns (full detail)
  const engineerColumns = [
    { key: 'id', header: 'Subscription ID', render: (s: Subscription) => <span className="font-mono text-xs">{s.id}</span> },
    { key: 'customerName', header: 'Customer' },
    { key: 'plan', header: 'Plan' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (s: Subscription) => <StatusChip status={getStatusType(s.status)} label={s.status} /> 
    },
    { key: 'mrr', header: 'MRR', render: (s: Subscription) => formatCurrency(s.mrr) },
    { key: 'startedAt', header: 'Started', render: (s: Subscription) => <span className="text-text-secondary">{formatDateShort(s.startedAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">
          <ModeText operator="Revenue & Plans" engineer="Subscriptions & Sales" />
        </h1>
        <p className="page-subtitle">
          <ModeText 
            operator="See how your business is doing" 
            engineer="Revenue metrics and subscription management" 
          />
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={viewMode === 'operator' ? "Monthly Revenue" : "Monthly Recurring Revenue"}
          value={formatCurrency(businessMetrics.totalMRR)}
          trend={{ value: businessMetrics.mrrGrowth }}
          icon={<DollarSign className="h-4 w-4" />}
          status="success"
        />
        <KPICard
          title={viewMode === 'operator' ? "Active Customers" : "Active Customers"}
          value={businessMetrics.activeCustomers}
          icon={<Users className="h-4 w-4" />}
          status="success"
        />
        <KPICard
          title={viewMode === 'operator' ? "Payment Issues" : "Overdue Invoices"}
          value={overdueSubscriptions.length}
          subtitle={formatCurrency(overdueSubscriptions.reduce((sum, s) => sum + s.mrr, 0))}
          icon={<FileWarning className="h-4 w-4" />}
          status={overdueSubscriptions.length > 0 ? 'warning' : 'success'}
        />
        <KPICard
          title={viewMode === 'operator' ? "Pending Requests" : "Open Approvals"}
          value={3}
          icon={<CheckCircle className="h-4 w-4" />}
          status="info"
          linkTo="/approvals"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel title={viewMode === 'operator' ? "Revenue Growth" : "MRR Trend"}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={businessMetrics.mrrTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={12}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={12}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(220 18% 11%)', 
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.92)'
                  }}
                  formatter={(value: number) => [formatCurrency(value), viewMode === 'operator' ? 'Revenue' : 'MRR']}
                />
                <Line 
                  type="monotone" 
                  dataKey="mrr" 
                  stroke="hsl(187 82% 53%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(187 82% 53%)', strokeWidth: 0, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={viewMode === 'operator' ? "Recent Activity" : "Subscription Events"}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(220 18% 11%)', 
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.92)'
                  }}
                />
                <Legend />
                <Bar dataKey="payments" fill="hsl(187 82% 53%)" name="Payments" />
                <Bar dataKey="upgrades" fill="hsl(142 71% 45%)" name="Upgrades" />
                <Bar dataKey="downgrades" fill="hsl(38 92% 50%)" name="Downgrades" />
                <Bar dataKey="cancellations" fill="hsl(0 72% 51%)" name="Cancellations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Panels Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Panel title={viewMode === 'operator' ? "Plan Distribution" : "Plans Breakdown"}>
          <div className="space-y-4">
            {planBreakdown.map((plan) => (
              <div key={plan.plan} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">{plan.plan}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(plan.mrr)}</p>
                  <p className="text-xs text-text-secondary">{plan.count} customers • {plan.percent}%</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={viewMode === 'operator' ? "Refunds" : "Recent Refunds"}>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-surface-1 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">EduTech Solutions</span>
                <span className="text-sm text-destructive">{formatCurrency(-299)}</span>
              </div>
              <p className="text-xs text-text-secondary">
                {viewMode === 'operator' ? 'Refunded • Dec 15' : 'Refund processed • Dec 15, 2025'}
              </p>
            </div>
            <p className="text-xs text-text-tertiary text-center">No other refunds in the last 30 days.</p>
          </div>
        </Panel>

        <Panel title={viewMode === 'operator' ? "Growth Summary" : "Churn Impact"}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-sm">{viewMode === 'operator' ? 'Lost Revenue' : 'Churned MRR'}</span>
              </div>
              <span className="text-sm font-medium text-destructive">{formatCurrency(-299)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm">{viewMode === 'operator' ? 'New Revenue' : 'Expansion MRR'}</span>
              </div>
              <span className="text-sm font-medium text-success">+{formatCurrency(1200)}</span>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{viewMode === 'operator' ? 'Net Growth' : 'Net MRR Change'}</span>
                <span className="text-sm font-semibold text-success">+{formatCurrency(901)}</span>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Subscriptions Table */}
      <Panel title={viewMode === 'operator' ? "All Plans" : "All Subscriptions"} noPadding>
        <DataTable
          columns={viewMode === 'operator' ? operatorColumns : engineerColumns}
          data={subscriptions}
          keyExtractor={(s) => s.id}
          emptyMessage="No subscriptions found."
        />
      </Panel>
    </div>
  );
}
