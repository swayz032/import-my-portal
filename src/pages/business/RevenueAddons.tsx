import { useState } from 'react';
import { Panel } from '@/components/shared/Panel';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable } from '@/components/shared/DataTable';
import { ModeText } from '@/components/shared/ModeText';
import { StatusChip } from '@/components/shared/StatusChip';
import { useSystem } from '@/contexts/SystemContext';
import { revenueAddonsData, RevenueSKU } from '@/data/businessSeed';
import { formatCurrency } from '@/lib/formatters';
import { 
  DollarSign, 
  Package, 
  Cpu, 
  TrendingDown, 
  AlertTriangle,
  ChevronRight,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['hsl(187, 82%, 53%)', 'hsl(142, 71%, 45%)', 'hsl(262, 83%, 58%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)'];

export default function RevenueAddons() {
  const { viewMode } = useSystem();

  const getTypeLabel = (type: RevenueSKU['type']) => {
    switch (type) {
      case 'base': return 'Base Plan';
      case 'office_addon': return 'Office Add-on';
      case 'suite_addon': return 'Suite Add-on';
      case 'skill_pack': return 'Skill Pack';
      case 'overage': return 'Overage';
      default: return type;
    }
  };

  const getTypeStatus = (type: RevenueSKU['type']) => {
    switch (type) {
      case 'base': return 'success';
      case 'office_addon': return 'pending';
      case 'suite_addon': return 'pending';
      case 'skill_pack': return 'info';
      case 'overage': return 'warning';
      default: return 'neutral';
    }
  };

  const pieData = [
    { name: 'Base Plans', value: revenueAddonsData.breakdown.base },
    { name: 'Office Add-ons', value: revenueAddonsData.breakdown.officeAddons },
    { name: 'Suite Add-ons', value: revenueAddonsData.breakdown.suiteAddons },
    { name: 'Skill Packs', value: revenueAddonsData.breakdown.skillPacks },
    { name: 'Overages', value: revenueAddonsData.breakdown.overages },
  ];

  const operatorColumns = [
    { key: 'sku', header: 'Product' },
    { 
      key: 'type', 
      header: 'Type', 
      render: (s: RevenueSKU) => (
        <StatusChip 
          status={getTypeStatus(s.type)} 
          label={viewMode === 'operator' ? getTypeLabel(s.type) : s.type} 
        />
      )
    },
    { 
      key: 'mrr', 
      header: 'Monthly', 
      render: (s: RevenueSKU) => <span className="font-medium">{formatCurrency(s.mrr)}</span> 
    },
    { key: 'meaning', header: 'What This Is' },
    { 
      key: 'nextStep', 
      header: 'Next Step', 
      render: (s: RevenueSKU) => (
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          {s.nextStep}
          <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      )
    },
  ];

  const engineerColumns = [
    { key: 'id', header: 'SKU ID', render: (s: RevenueSKU) => <span className="font-mono text-xs">{s.id}</span> },
    { key: 'sku', header: 'SKU Name' },
    { 
      key: 'type', 
      header: 'Type', 
      render: (s: RevenueSKU) => <span className="text-text-secondary">{s.type}</span>
    },
    { 
      key: 'mrr', 
      header: 'MRR', 
      render: (s: RevenueSKU) => <span className="font-medium">{formatCurrency(s.mrr)}</span> 
    },
    { 
      key: 'customerCount', 
      header: 'Customers', 
      render: (s: RevenueSKU) => <span>{s.customerCount}</span> 
    },
    { 
      key: 'nextStep', 
      header: 'Action', 
      render: (s: RevenueSKU) => (
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          {s.nextStep}
          <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">
          <ModeText operator="Revenue & Add-ons" engineer="Revenue & Add-ons Analysis" />
        </h1>
        <p className="page-subtitle">
          <ModeText 
            operator="Your recurring revenue breakdown" 
            engineer="MRR by SKU, add-ons, skill packs, and overages" 
          />
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title={viewMode === 'operator' ? 'Total Monthly Revenue' : 'Total MRR'}
          value={formatCurrency(revenueAddonsData.totalMRR)}
          icon={<DollarSign className="h-4 w-4" />}
          status="success"
        />
        <KPICard
          title={viewMode === 'operator' ? 'Add-on Revenue' : 'Add-on MRR'}
          value={formatCurrency(revenueAddonsData.addonMRR)}
          icon={<Package className="h-4 w-4" />}
          status="success"
        />
        <KPICard
          title={viewMode === 'operator' ? 'Skill Pack Revenue' : 'Skill Pack MRR'}
          value={formatCurrency(revenueAddonsData.skillPackMRR)}
          icon={<Cpu className="h-4 w-4" />}
          status="success"
        />
        <KPICard
          title={viewMode === 'operator' ? 'Expected Overages' : 'Overage Projected'}
          value={formatCurrency(revenueAddonsData.overageProjected)}
          icon={<AlertTriangle className="h-4 w-4" />}
          status="info"
        />
        <KPICard
          title="Churn"
          value={`${revenueAddonsData.churnPercent}%`}
          icon={<TrendingDown className="h-4 w-4" />}
          status={revenueAddonsData.churnPercent > 2 ? 'warning' : 'success'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Breakdown Chart */}
        <Panel title={viewMode === 'operator' ? 'Revenue Mix' : 'Revenue Breakdown'}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(220 18% 11%)', 
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.92)'
                  }}
                />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Revenue Cards */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-surface-1 border border-border">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Base Plans</p>
            <p className="text-2xl font-semibold text-primary">{formatCurrency(revenueAddonsData.breakdown.base)}</p>
            <p className="text-xs text-text-tertiary mt-1">Core subscriptions</p>
          </div>
          <div className="p-4 rounded-lg bg-surface-1 border border-border">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Office Add-ons</p>
            <p className="text-2xl font-semibold text-success">{formatCurrency(revenueAddonsData.breakdown.officeAddons)}</p>
            <p className="text-xs text-text-tertiary mt-1">Support, seats, branding</p>
          </div>
          <div className="p-4 rounded-lg bg-surface-1 border border-border">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Suite Add-ons</p>
            <p className="text-2xl font-semibold text-success">{formatCurrency(revenueAddonsData.breakdown.suiteAddons)}</p>
            <p className="text-xs text-text-tertiary mt-1">Analytics, API access</p>
          </div>
          <div className="p-4 rounded-lg bg-surface-1 border border-border">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Skill Packs</p>
            <p className="text-2xl font-semibold text-[hsl(262,83%,58%)]">{formatCurrency(revenueAddonsData.breakdown.skillPacks)}</p>
            <p className="text-xs text-text-tertiary mt-1">Agent automation</p>
          </div>
          <div className="p-4 rounded-lg bg-surface-1 border border-border">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Usage Overages</p>
            <p className="text-2xl font-semibold text-warning">{formatCurrency(revenueAddonsData.breakdown.overages)}</p>
            <p className="text-xs text-text-tertiary mt-1">API & storage excess</p>
          </div>
        </div>
      </div>

      {/* What Needs Attention */}
      <Panel title={viewMode === 'operator' ? 'What Needs Attention' : 'Action Items'}>
        <div className="space-y-3">
          {revenueAddonsData.attentionItems.map((item) => (
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

      {/* SKU Table */}
      <Panel title={viewMode === 'operator' ? 'All Products' : 'Revenue by SKU'} noPadding>
        <DataTable
          columns={viewMode === 'operator' ? operatorColumns : engineerColumns}
          data={revenueAddonsData.skus}
          keyExtractor={(s) => s.id}
        />
      </Panel>
    </div>
  );
}
