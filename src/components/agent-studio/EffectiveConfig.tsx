import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';
import type { 
  StaffMember, 
  StaffRuntimeConfig, 
  ToolCatalogEntry,
  SkillpackRef,
  RiskLevel 
} from '@/contracts/ecosystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Wrench, 
  Receipt, 
  AlertTriangle, 
  Link2, 
  FileCheck,
  ChevronRight,
  Shield,
  Zap,
  Server,
  CheckCircle,
  Inbox
} from 'lucide-react';

interface EffectiveConfigProps {
  member: StaffMember;
  config: StaffRuntimeConfig;
  toolCatalog: ToolCatalogEntry[];
  skillpack: SkillpackRef | null;
}

const riskColors: Record<RiskLevel, string> = {
  low: 'bg-success/20 text-success',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
  critical: 'bg-destructive/30 text-destructive',
};

const PIPELINE_STEPS = [
  { label: 'Request', icon: Inbox },
  { label: 'Policy', icon: Shield },
  { label: 'Queue', icon: CheckCircle },
  { label: 'Outbox', icon: Zap },
  { label: 'Provider', icon: Server },
  { label: 'Receipts', icon: Receipt },
];

export function EffectiveConfig({ 
  member, 
  config, 
  toolCatalog,
  skillpack 
}: EffectiveConfigProps) {
  const { viewMode } = useSystem();
  const isOperator = viewMode === 'operator';

  // Compute effective tools
  const effectiveTools = toolCatalog.filter(tool => 
    config.tool_policy.allowlist.includes(tool.name) ||
    config.tool_policy.allowlist.includes('*')
  );

  // Compute expected receipts
  const expectedReceipts = effectiveTools
    .filter(tool => tool.receipted)
    .map(tool => `${member.default_skillpack_id || member.staff_id}.${tool.name}`);

  // Compute risk summary
  const riskSummary = effectiveTools.reduce(
    (acc, tool) => {
      acc[tool.risk] = (acc[tool.risk] || 0) + 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0, critical: 0 } as Record<RiskLevel, number>
  );

  const totalRisk = Object.values(riskSummary).reduce((a, b) => a + b, 0);
  const highRiskCount = riskSummary.high + riskSummary.critical;

  return (
    <div className="h-full flex flex-col bg-surface-1">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">
          {isOperator ? 'Effective Configuration' : 'Runtime Preview'}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {isOperator ? 'What this agent will do' : 'Computed effective_config'}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Trust Spine Pipeline */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {isOperator ? 'Action Pipeline' : 'Trust Spine'}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="flex items-center justify-between">
                {PIPELINE_STEPS.map((step, idx) => (
                  <div key={step.label} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <step.icon className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-[8px] text-muted-foreground mt-1 text-center leading-tight">
                        {step.label}
                      </span>
                    </div>
                    {idx < PIPELINE_STEPS.length - 1 && (
                      <ChevronRight className="h-3 w-3 text-border mx-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-2xl font-semibold text-foreground">{effectiveTools.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase">
                {isOperator ? 'Enabled' : 'Tools'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className={cn(
                'text-2xl font-semibold',
                highRiskCount > 0 ? 'text-warning' : 'text-success'
              )}>
                {highRiskCount}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase">
                {isOperator ? 'High Risk' : 'Critical'}
              </p>
            </div>
          </div>

          {/* Enabled Tools */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="h-3.5 w-3.5 text-primary" />
                  <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {isOperator ? 'Enabled Tools' : 'Effective Tools'}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] h-5">
                  {effectiveTools.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {effectiveTools.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  {isOperator ? 'No tools enabled' : 'effective_tools: []'}
                </p>
              ) : (
                <div className="space-y-1">
                  {effectiveTools.slice(0, 5).map((tool) => (
                    <div 
                      key={tool.name}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-xs text-foreground truncate flex-1">
                        {isOperator 
                          ? tool.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                          : tool.name
                        }
                      </span>
                      <div className="flex items-center gap-1.5 ml-2">
                        <Badge className={cn('text-[9px] px-1.5 h-4', riskColors[tool.risk])}>
                          {tool.risk}
                        </Badge>
                        {tool.receipted && (
                          <FileCheck className="h-3 w-3 text-success" />
                        )}
                      </div>
                    </div>
                  ))}
                  {effectiveTools.length > 5 && (
                    <p className="text-[10px] text-muted-foreground pt-1">
                      +{effectiveTools.length - 5} more
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval Rules Summary */}
          {config.approval_rules.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {isOperator ? 'Approval Required' : 'Approval Rules'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="space-y-1">
                  {config.approval_rules.filter(r => r.requires_approval).map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-foreground">
                        {isOperator 
                          ? rule.action_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                          : rule.action_type
                        }
                      </span>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {isOperator 
                          ? (rule.approval_mode === 'voice_confirm' ? 'Live' : 'Queue')
                          : rule.approval_mode
                        }
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expected Receipts */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-3.5 w-3.5 text-success" />
                  <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {isOperator ? 'Proof Trail' : 'Expected Receipts'}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] h-5 border-success/30 text-success">
                  {expectedReceipts.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {expectedReceipts.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  {isOperator ? 'No proof records' : 'expected_receipts: []'}
                </p>
              ) : (
                <div className="space-y-1">
                  {expectedReceipts.slice(0, 4).map((receipt) => (
                    <p key={receipt} className="text-[10px] font-mono text-muted-foreground truncate">
                      {receipt}
                    </p>
                  ))}
                  {expectedReceipts.length > 4 && (
                    <p className="text-[10px] text-muted-foreground">
                      +{expectedReceipts.length - 4} more
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Provider Bindings */}
          {config.provider_bindings.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center gap-2">
                  <Server className="h-3.5 w-3.5 text-muted-foreground" />
                  <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {isOperator ? 'Services' : 'Provider Bindings'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {config.provider_bindings.map((binding) => (
                    <Badge 
                      key={binding.provider_id}
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        binding.connection_status === 'connected' && 'border-success/50 text-success'
                      )}
                    >
                      {binding.provider_id}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Linked Skillpack */}
          {skillpack && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center gap-2">
                  <Link2 className="h-3.5 w-3.5 text-primary" />
                  <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {isOperator ? 'Skill Set' : 'Skillpack'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <p className="text-sm font-medium text-foreground">
                  {skillpack.name}
                </p>
                {!isOperator && (
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">
                    {skillpack.skillpack_id}
                  </p>
                )}
                <div className="flex gap-1.5 mt-2">
                  <Badge variant="outline" className="text-[10px] h-5">
                    {skillpack.channel}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] h-5">
                    v{skillpack.version}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
