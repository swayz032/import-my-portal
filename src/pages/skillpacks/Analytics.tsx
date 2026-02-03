import { Panel } from '@/components/shared/Panel';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable } from '@/components/shared/DataTable';
import { ModeText } from '@/components/shared/ModeText';
import { ModeDetails } from '@/components/shared/ModeDetails';
import { useSystem } from '@/contexts/SystemContext';
import { skillPackAnalyticsData, SkillPackUsage, SkillPackOutcome } from '@/data/businessSeed';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { 
  Zap, 
  Trophy, 
  Clock, 
  AlertTriangle, 
  DollarSign,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Calendar,
  Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['hsl(187, 82%, 53%)', 'hsl(142, 71%, 45%)', 'hsl(262, 83%, 58%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)'];

export default function SkillPackAnalytics() {
  const { viewMode } = useSystem();

  const usageChartData = skillPackAnalyticsData.usage.map(u => ({
    name: u.displayName,
    actions: u.actionsThisWeek,
    successRate: u.successRate,
  }));

  const getOutcomeIcon = (type: SkillPackOutcome['type']) => {
    switch (type) {
      case 'invoice_paid': return <DollarSign className="h-4 w-4" />;
      case 'contract_signed': return <FileCheck className="h-4 w-4" />;
      case 'meeting_booked': return <Calendar className="h-4 w-4" />;
      case 'ticket_resolved': return <Ticket className="h-4 w-4" />;
      case 'followup_converted': return <TrendingUp className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const operatorColumns = [
    { 
      key: 'displayName', 
      header: 'Staff Member', 
      render: (u: SkillPackUsage) => (
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-medium">{u.displayName}</span>
        </div>
      )
    },
    { 
      key: 'actionsThisWeek', 
      header: 'This Week', 
      render: (u: SkillPackUsage) => <span className="font-medium">{u.actionsThisWeek.toLocaleString()}</span>
    },
    { 
      key: 'successRate', 
      header: 'Success', 
      render: (u: SkillPackUsage) => (
        <span className={u.successRate > 95 ? 'text-success' : u.successRate > 90 ? 'text-warning' : 'text-destructive'}>
          {formatPercent(u.successRate)}
        </span>
      )
    },
    { 
      key: 'avgCostPerAction', 
      header: 'Cost/Action', 
      render: (u: SkillPackUsage) => <span className="text-text-secondary">{formatCurrency(u.avgCostPerAction)}</span>
    },
  ];

  const engineerColumns = [
    { key: 'packId', header: 'Pack ID', render: (u: SkillPackUsage) => <span className="font-mono text-xs">{u.packId}</span> },
    { key: 'displayName', header: 'Name' },
    { 
      key: 'actionsThisWeek', 
      header: '7d Actions', 
      render: (u: SkillPackUsage) => <span>{u.actionsThisWeek.toLocaleString()}</span>
    },
    { 
      key: 'actionsLast30Days', 
      header: '30d Actions', 
      render: (u: SkillPackUsage) => <span>{u.actionsLast30Days.toLocaleString()}</span>
    },
    { 
      key: 'successRate', 
      header: 'Success %', 
      render: (u: SkillPackUsage) => formatPercent(u.successRate)
    },
    { 
      key: 'avgCostPerAction', 
      header: 'Avg Cost', 
      render: (u: SkillPackUsage) => formatCurrency(u.avgCostPerAction)
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">
          <ModeText operator="Staff Performance" engineer="Skill Pack Analytics" />
        </h1>
        <p className="page-subtitle">
          <ModeText 
            operator="See how your automated team is doing" 
            engineer="Usage metrics, outcomes, and friction analysis" 
          />
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title={viewMode === 'operator' ? 'Busiest Staff' : 'Most Used This Week'}
          value={skillPackAnalyticsData.mostUsedThisWeek}
          icon={<Zap className="h-4 w-4" />}
          status="success"
        />
        <KPICard
          title={viewMode === 'operator' ? 'Top Performer' : 'Highest Value Outcomes'}
          value={skillPackAnalyticsData.highestValueOutcomes}
          icon={<Trophy className="h-4 w-4" />}
          status="success"
        />
        <KPICard
          title={viewMode === 'operator' ? 'Approval Delays' : 'Approval Friction Rate'}
          value={formatPercent(skillPackAnalyticsData.approvalFrictionRate)}
          icon={<Clock className="h-4 w-4" />}
          status={skillPackAnalyticsData.approvalFrictionRate > 10 ? 'warning' : 'success'}
        />
        <KPICard
          title={viewMode === 'operator' ? 'Error Rate' : 'Failure Rate'}
          value={formatPercent(skillPackAnalyticsData.failureRate)}
          icon={<AlertTriangle className="h-4 w-4" />}
          status={skillPackAnalyticsData.failureRate > 5 ? 'warning' : 'success'}
        />
        <KPICard
          title={viewMode === 'operator' ? 'Avg Cost/Action' : 'Cost Per Action'}
          value={formatCurrency(skillPackAnalyticsData.avgCostPerAction)}
          icon={<DollarSign className="h-4 w-4" />}
          status="info"
        />
      </div>

      {/* What Needs Attention */}
      <Panel title={viewMode === 'operator' ? 'What Needs Attention' : 'Action Items'}>
        <div className="space-y-3">
          {skillPackAnalyticsData.attentionItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border">
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-text-secondary">{item.meaning}</p>
              </div>
              <Button variant="outline" size="sm" className="ml-4">
                {item.nextStep}
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Usage Chart */}
        <Panel title={viewMode === 'operator' ? 'Staff Activity This Week' : 'Top Skill Packs (7d)'}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={12} width={120} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(220 18% 11%)', 
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.92)'
                  }}
                />
                <Bar dataKey="actions" name="Actions">
                  {usageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Outcomes */}
        <Panel title={viewMode === 'operator' ? 'Results Delivered' : 'Outcomes Summary'}>
          <div className="space-y-4">
            {skillPackAnalyticsData.outcomes.map((outcome) => (
              <div key={outcome.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getOutcomeIcon(outcome.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{outcome.label}</p>
                    <p className="text-xs text-text-secondary">{outcome.count} this period</p>
                  </div>
                </div>
                {outcome.value > 0 && (
                  <span className="text-success font-medium">{formatCurrency(outcome.value)}</span>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Usage Table */}
      <Panel title={viewMode === 'operator' ? 'All Staff Performance' : 'Usage by Pack'} noPadding>
        <DataTable
          columns={viewMode === 'operator' ? operatorColumns : engineerColumns}
          data={skillPackAnalyticsData.usage}
          keyExtractor={(u) => u.packId}
        />
      </Panel>

      {/* Friction Analysis */}
      <Panel title={viewMode === 'operator' ? 'Approval Bottlenecks' : 'Friction Analysis'}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-surface-1 border border-border">
            <p className="text-xs text-text-secondary mb-1">
              <ModeText operator="Waiting for You" engineer="Pending Approvals" />
            </p>
            <p className="text-2xl font-semibold">{skillPackAnalyticsData.friction.pendingApprovals}</p>
          </div>
          <div className="p-4 rounded-lg bg-surface-1 border border-border">
            <p className="text-xs text-text-secondary mb-1">
              <ModeText operator="Avg Wait Time" engineer="Avg Approval Time" />
            </p>
            <p className="text-2xl font-semibold">{skillPackAnalyticsData.friction.avgApprovalTime}h</p>
          </div>
          <div className="p-4 rounded-lg bg-surface-1 border border-border">
            <p className="text-xs text-text-secondary mb-1">
              <ModeText operator="Errors This Week" engineer="Translated Failures" />
            </p>
            <p className="text-2xl font-semibold">
              {skillPackAnalyticsData.friction.translatedFailures.reduce((sum, f) => sum + f.count, 0)}
            </p>
          </div>
        </div>

        <ModeDetails
          summary={
            <p className="text-sm font-medium mt-4">
              <ModeText operator="Error Breakdown" engineer="Failure Reasons" />
            </p>
          }
          details={
            <div className="space-y-3 mt-2">
              {skillPackAnalyticsData.friction.translatedFailures.map((failure, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-surface-2">
                  <div>
                    <p className="text-sm">{viewMode === 'operator' ? failure.meaning : failure.reason}</p>
                    {viewMode === 'engineer' && (
                      <p className="text-xs text-text-tertiary">{failure.meaning}</p>
                    )}
                  </div>
                  <Badge variant="outline">{failure.count}</Badge>
                </div>
              ))}
            </div>
          }
        />
      </Panel>
    </div>
  );
}
