import { useState } from 'react';
import { Panel } from '@/components/shared/Panel';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable } from '@/components/shared/DataTable';
import { ModeText } from '@/components/shared/ModeText';
import { ModeDetails } from '@/components/shared/ModeDetails';
import { StatusChip } from '@/components/shared/StatusChip';
import { useSystem } from '@/contexts/SystemContext';
import { skillPackRegistryData, SkillPack } from '@/data/businessSeed';
import { formatCurrency, formatTimeAgo } from '@/lib/formatters';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  ChevronRight,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export default function SkillPackRegistry() {
  const { viewMode, systemState } = useSystem();
  const [selectedPack, setSelectedPack] = useState<SkillPack | null>(null);

  const getStatusType = (status: SkillPack['operatorStatus']) => {
    switch (status) {
      case 'Done': return 'success';
      case 'Needs approval': return 'pending';
      case 'Blocked': return 'critical';
      case 'Failed': return 'critical';
      case 'Needs attention': return 'warning';
      default: return 'neutral';
    }
  };

  const getNextStepAction = (pack: SkillPack) => {
    if (systemState.safetyMode && ['Configure', 'Enable', 'Disable'].some(a => pack.nextStep.includes(a))) {
      return (
        <Button variant="ghost" size="sm" className="h-7 text-xs" disabled title="Restricted when Safety Mode is ON">
          {pack.nextStep}
          <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      );
    }
    return (
      <Button variant="ghost" size="sm" className="h-7 text-xs">
        {pack.nextStep}
        <ChevronRight className="ml-1 h-3 w-3" />
      </Button>
    );
  };

  const operatorColumns = [
    { 
      key: 'displayName', 
      header: 'Staff Member', 
      render: (p: SkillPack) => (
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-medium">{p.displayName}</span>
        </div>
      )
    },
    { 
      key: 'category', 
      header: 'Type', 
      render: (p: SkillPack) => (
        <Badge variant="outline" className="capitalize">{p.category}</Badge>
      )
    },
    { 
      key: 'operatorStatus', 
      header: 'Status', 
      render: (p: SkillPack) => (
        <StatusChip status={getStatusType(p.operatorStatus)} label={p.operatorStatus} />
      )
    },
    { key: 'meaning', header: 'What They Do' },
    { 
      key: 'nextStep', 
      header: 'Next Step', 
      render: (p: SkillPack) => getNextStepAction(p)
    },
  ];

  const engineerColumns = [
    { key: 'packId', header: 'Pack ID', render: (p: SkillPack) => <span className="font-mono text-xs">{p.packId}</span> },
    { 
      key: 'displayName', 
      header: 'Display Name', 
      render: (p: SkillPack) => (
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span>{p.displayName}</span>
        </div>
      )
    },
    { key: 'category', header: 'Category', render: (p: SkillPack) => <span className="capitalize">{p.category}</span> },
    { 
      key: 'status', 
      header: 'Status', 
      render: (p: SkillPack) => (
        <StatusChip 
          status={p.status === 'enabled' ? 'success' : p.status === 'pending_approval' ? 'pending' : 'neutral'} 
          label={p.status} 
        />
      )
    },
    { 
      key: 'autonomyCap', 
      header: 'Autonomy', 
      render: (p: SkillPack) => (
        <Badge variant={p.autonomyCap === 'high' ? 'default' : p.autonomyCap === 'medium' ? 'secondary' : 'outline'}>
          {p.autonomyCap}
        </Badge>
      )
    },
    { 
      key: 'nextStep', 
      header: 'Action', 
      render: (p: SkillPack) => getNextStepAction(p)
    },
  ];

  const getPricingLabel = (pack: SkillPack) => {
    if (pack.pricing.model === 'included') return 'Included';
    if (pack.pricing.model === 'paid') return `${formatCurrency(pack.pricing.price || 0)}/mo`;
    if (pack.pricing.model === 'usage') return 'Usage-based';
    return pack.pricing.model;
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">
          <ModeText operator="Your Staff (Skill Packs)" engineer="Skill Pack Registry" />
        </h1>
        <p className="page-subtitle">
          <ModeText 
            operator="Meet your automated team members" 
            engineer="Agent registry with governance, pricing, and autonomy configuration" 
          />
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title={viewMode === 'operator' ? 'Total Staff' : 'Total Packs'}
          value={skillPackRegistryData.totalPacks}
          icon={<Package className="h-4 w-4" />}
          status="info"
        />
        <KPICard
          title={viewMode === 'operator' ? 'Active Staff' : 'Enabled Packs'}
          value={skillPackRegistryData.enabledPacks}
          icon={<CheckCircle className="h-4 w-4" />}
          status="success"
        />
        <KPICard
          title={viewMode === 'operator' ? 'Need Approval' : 'Packs Requiring Approvals'}
          value={skillPackRegistryData.packsRequiringApprovals}
          icon={<Clock className="h-4 w-4" />}
          status={skillPackRegistryData.packsRequiringApprovals > 0 ? 'warning' : 'success'}
        />
        <KPICard
          title={viewMode === 'operator' ? 'Paid Staff' : 'Monetized Packs'}
          value={skillPackRegistryData.monetizedPacks}
          icon={<DollarSign className="h-4 w-4" />}
          status="info"
        />
        <KPICard
          title={viewMode === 'operator' ? 'With Overages' : 'Packs With Overages'}
          value={skillPackRegistryData.packsWithOverages}
          icon={<AlertTriangle className="h-4 w-4" />}
          status={skillPackRegistryData.packsWithOverages > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Skill Pack Table */}
      <Panel title={viewMode === 'operator' ? 'Your Team' : 'All Skill Packs'} noPadding>
        <DataTable
          columns={viewMode === 'operator' ? operatorColumns : engineerColumns}
          data={skillPackRegistryData.packs}
          keyExtractor={(p) => p.id}
          onRowClick={(p) => setSelectedPack(p)}
        />
      </Panel>

      {/* Details Sheet */}
      <Sheet open={!!selectedPack} onOpenChange={() => setSelectedPack(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {selectedPack?.displayName}
            </SheetTitle>
            <SheetDescription>
              {selectedPack?.meaning}
            </SheetDescription>
          </SheetHeader>
          {selectedPack && (
            <div className="mt-6 space-y-6">
              {/* Status & Category */}
              <div className="flex items-center gap-2">
                <StatusChip 
                  status={getStatusType(selectedPack.operatorStatus)} 
                  label={viewMode === 'operator' ? selectedPack.operatorStatus : selectedPack.status} 
                />
                <Badge variant="outline" className="capitalize">{selectedPack.category}</Badge>
              </div>

              {/* Pack ID (Engineer only) */}
              {viewMode === 'engineer' && (
                <div className="p-3 rounded-lg bg-surface-1 border border-border">
                  <p className="text-xs text-text-secondary mb-1">Pack ID</p>
                  <p className="font-mono text-sm">{selectedPack.packId}</p>
                </div>
              )}

              {/* Constraints */}
              <ModeDetails
                summary={
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-warning" />
                    <span className="font-medium">
                      <ModeText operator="Rules They Follow" engineer="Constraints" />
                    </span>
                  </div>
                }
                details={
                  <ul className="space-y-2 text-sm">
                    {selectedPack.constraints.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-warning">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                }
              />

              {/* Requires Approval */}
              {selectedPack.requiresApprovalFor.length > 0 && (
                <ModeDetails
                  summary={
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        <ModeText operator="Needs Your Approval For" engineer="Requires Approval Actions" />
                      </span>
                    </div>
                  }
                  details={
                    <ul className="space-y-2 text-sm">
                      {selectedPack.requiresApprovalFor.map((a, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  }
                />
              )}

              {/* Autonomy & Receipts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-surface-1 border border-border">
                  <p className="text-xs text-text-secondary mb-1">
                    <ModeText operator="Independence Level" engineer="Autonomy Cap" />
                  </p>
                  <Badge variant={selectedPack.autonomyCap === 'high' ? 'default' : selectedPack.autonomyCap === 'medium' ? 'secondary' : 'outline'}>
                    {selectedPack.autonomyCap}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-surface-1 border border-border">
                  <p className="text-xs text-text-secondary mb-1">
                    <ModeText operator="Actions They Track" engineer="Receipts Expected" />
                  </p>
                  <p className="text-sm">{selectedPack.receiptsExpected.length} types</p>
                </div>
              </div>

              {/* Receipts detail */}
              {viewMode === 'engineer' && (
                <div className="p-3 rounded-lg bg-surface-1 border border-border">
                  <p className="text-xs text-text-secondary mb-2">Receipt Types</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPack.receiptsExpected.map((r, idx) => (
                      <Badge key={idx} variant="outline" className="font-mono text-xs">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="p-4 rounded-lg bg-surface-1 border border-border">
                <p className="text-xs text-text-secondary mb-2">
                  <ModeText operator="Cost" engineer="Pricing Model" />
                </p>
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{getPricingLabel(selectedPack)}</p>
                  {selectedPack.pricing.quota && (
                    <p className="text-sm text-text-secondary">
                      {viewMode === 'operator' 
                        ? `Includes ${selectedPack.pricing.quota} actions`
                        : `Quota: ${selectedPack.pricing.quota} actions/mo`
                      }
                    </p>
                  )}
                  {selectedPack.pricing.overageRate && (
                    <p className="text-sm text-text-secondary">
                      {viewMode === 'operator'
                        ? `Extra actions: ${formatCurrency(selectedPack.pricing.overageRate)} each`
                        : `Overage: ${formatCurrency(selectedPack.pricing.overageRate)}/action`
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Last Updated */}
              <p className="text-xs text-text-tertiary">
                Updated {formatTimeAgo(selectedPack.updatedAt)}
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
