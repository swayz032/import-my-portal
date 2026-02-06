import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';
import type { 
  StaffMember, 
  StaffRuntimeConfig, 
  ToolCatalogEntry,
  ProviderDef,
  SkillpackRef,
  RiskLevel
} from '@/contracts/ecosystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { StaffAvatar } from './StaffAvatar';
import { 
  ChevronDown, 
  Shield, 
  Wrench, 
  Link2, 
  Rocket, 
  AlertCircle,
  Sparkles,
  Mic,
  Mail,
  MessageSquare,
  Cpu,
  Radio,
  Receipt,
  Inbox,
  CheckCircle,
  Zap,
  Server,
  FileCheck,
  TrendingUp
} from 'lucide-react';

interface ConfigEditorProps {
  member: StaffMember;
  config: StaffRuntimeConfig;
  toolCatalog: ToolCatalogEntry[];
  providers: ProviderDef[];
  skillpack: SkillpackRef | null;
  onConfigChange: (config: StaffRuntimeConfig) => void;
}

const channelIcons: Record<string, React.ElementType> = {
  voice: Mic,
  email: Mail,
  text: MessageSquare,
  internal: Cpu,
  multi: Radio,
};

const approvalModeLabels = {
  auto: { operator: 'Automatic', engineer: 'auto' },
  voice_confirm: { operator: 'Live presence required', engineer: 'voice_confirm' },
  async_approval: { operator: 'Queued for approval', engineer: 'async_approval' },
  escalate: { operator: 'Always escalate', engineer: 'escalate' },
};

const riskLabels = {
  low: { operator: 'Safe', engineer: 'low', color: 'bg-success/20 text-success border-success/30' },
  medium: { operator: 'Moderate', engineer: 'medium', color: 'bg-warning/20 text-warning border-warning/30' },
  high: { operator: 'High impact', engineer: 'high', color: 'bg-destructive/20 text-destructive border-destructive/30' },
  critical: { operator: 'Critical', engineer: 'critical', color: 'bg-destructive/30 text-destructive border-destructive/40' },
};

const rolloutLabels = {
  draft: { operator: 'Draft', engineer: 'draft' },
  proposed: { operator: 'Pending Review', engineer: 'proposed' },
  active: { operator: 'Live', engineer: 'active' },
  paused: { operator: 'Paused', engineer: 'paused' },
  deprecated: { operator: 'Retired', engineer: 'deprecated' },
};

const riskColors: Record<RiskLevel, string> = {
  low: 'bg-success/20 text-success border-success/30',
  medium: 'bg-warning/20 text-warning border-warning/30',
  high: 'bg-destructive/20 text-destructive border-destructive/30',
  critical: 'bg-destructive/30 text-destructive border-destructive/40',
};

const PIPELINE_STEPS = [
  { id: 'request', label: 'Request', icon: Inbox, color: 'from-blue-500 to-blue-600' },
  { id: 'policy', label: 'Policy', icon: Shield, color: 'from-purple-500 to-purple-600' },
  { id: 'queue', label: 'Queue', icon: CheckCircle, color: 'from-cyan-500 to-cyan-600' },
  { id: 'outbox', label: 'Outbox', icon: Zap, color: 'from-amber-500 to-amber-600' },
  { id: 'provider', label: 'Provider', icon: Server, color: 'from-green-500 to-green-600' },
  { id: 'receipts', label: 'Receipts', icon: Receipt, color: 'from-emerald-500 to-emerald-600' },
];

export function ConfigEditor({ 
  member, 
  config, 
  toolCatalog, 
  providers,
  skillpack,
  onConfigChange 
}: ConfigEditorProps) {
  const { viewMode } = useSystem();
  const isOperator = viewMode === 'operator';
  const ChannelIcon = channelIcons[member.channel] || Radio;
  
  const [sectionsOpen, setSectionsOpen] = useState({
    pipeline: true,
    thresholds: true,
    approval: true,
    tools: true,
    providers: true,
    rollout: true,
  });

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Compute effective tools for the summary
  const effectiveTools = toolCatalog.filter(tool => 
    config.tool_policy.allowlist.includes(tool.name) ||
    config.tool_policy.allowlist.includes('*')
  );

  const riskSummary = effectiveTools.reduce(
    (acc, tool) => {
      acc[tool.risk] = (acc[tool.risk] || 0) + 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0, critical: 0 } as Record<RiskLevel, number>
  );

  const highRiskCount = riskSummary.high + riskSummary.critical;
  const approvalCount = config.approval_rules.filter(r => r.requires_approval).length;
  const connectedProviders = config.provider_bindings.filter(b => b.connection_status === 'connected').length;
  const receiptsCount = effectiveTools.filter(t => t.receipted).length;

  const SectionCard = ({ 
    id, 
    icon: Icon, 
    title, 
    description,
    children,
  }: { 
    id: keyof typeof sectionsOpen;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <Collapsible open={sectionsOpen[id]}>
      <Card className={cn(
        'border-border bg-card overflow-hidden',
        'hover:border-primary/20 transition-colors duration-200',
        'shadow-sm'
      )}>
        <CollapsibleTrigger 
          className="w-full"
          onClick={() => toggleSection(id)}
        >
          <div className={cn(
            'flex items-center justify-between p-4',
            'bg-gradient-to-r from-surface-2/60 to-transparent',
            'hover:from-surface-2 transition-colors'
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center',
                'bg-primary/10'
              )}>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <span className="font-medium text-sm text-foreground">{title}</span>
                {description && (
                  <p className="text-[11px] text-muted-foreground">{description}</p>
                )}
              </div>
            </div>
            <ChevronDown className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              sectionsOpen[id] && 'rotate-180'
            )} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-5 px-5">
            <div className="pt-3 border-t border-border/50">
              {children}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  return (
    <ScrollArea className="h-full">
      <div className="max-w-5xl mx-auto p-6 xl:p-8 2xl:p-10 space-y-6">
        {/* Hero Header — wide, breathing room */}
        <div className={cn(
          'relative rounded-2xl overflow-hidden',
          'bg-gradient-to-br from-card via-card to-surface-2',
          'border border-border shadow-lg',
          'p-6 xl:p-8'
        )}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative flex items-start gap-6">
            <StaffAvatar
              staffId={member.staff_id}
              name={member.name}
              size="lg"
              status={config.rollout_state}
              showStatus
            />
            
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gradient tracking-tight">
                {member.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isOperator ? member.title : `${member.staff_id} • ${member.role}`}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Badge 
                  variant="outline" 
                  className="gap-1.5 bg-primary/10 text-primary border-primary/20"
                >
                  <ChannelIcon className="h-3 w-3" />
                  {isOperator ? member.channel.charAt(0).toUpperCase() + member.channel.slice(1) : member.channel}
                </Badge>
                
                {skillpack && (
                  <Badge variant="outline" className="gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    {isOperator ? skillpack.name : skillpack.skillpack_id}
                  </Badge>
                )}
                
                {member.visibility === 'external' && (
                  <Badge className="bg-success/20 text-success border-success/30">
                    {isOperator ? 'Public Facing' : 'external'}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Status Toggle */}
            <div className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl',
              'bg-surface-1 border border-border'
            )}>
              <Switch
                checked={config.enabled}
                onCheckedChange={(enabled) => onConfigChange({ ...config, enabled })}
                className="data-[state=checked]:bg-success"
              />
              <span className={cn(
                'text-xs font-medium',
                config.enabled ? 'text-success' : 'text-muted-foreground'
              )}>
                {config.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Inline Stats Row */}
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{effectiveTools.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {isOperator ? 'Tools' : 'effective_tools'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn(
                'h-10 w-10 rounded-lg flex items-center justify-center',
                highRiskCount > 0 ? 'bg-warning/10' : 'bg-success/10'
              )}>
                <AlertCircle className={cn('h-5 w-5', highRiskCount > 0 ? 'text-warning' : 'text-success')} />
              </div>
              <div>
                <p className={cn('text-xl font-bold', highRiskCount > 0 ? 'text-warning' : 'text-success')}>
                  {highRiskCount}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {isOperator ? 'High Risk' : 'risk:high+'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{approvalCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {isOperator ? 'Approvals' : 'approval_rules'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{receiptsCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {isOperator ? 'Proof Trail' : 'receipted'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Spine Pipeline — full width */}
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-6 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-xs font-semibold text-primary uppercase tracking-wider">
              {isOperator ? 'Action Pipeline' : 'Trust Spine'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="relative pt-3">
              <div className="absolute top-[23px] left-[24px] right-[24px] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
              <div 
                className="absolute top-[23px] left-[24px] right-[24px] h-0.5 bg-gradient-to-r from-primary via-primary to-primary opacity-40"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s linear infinite',
                }}
              />
              <div className="relative flex items-start justify-between">
                {PIPELINE_STEPS.map((step) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={step.id} className="flex flex-col items-center group">
                      <div className={cn(
                        'relative h-10 w-10 rounded-full flex items-center justify-center',
                        'bg-gradient-to-br', step.color,
                        'shadow-lg group-hover:scale-110 transition-transform duration-200',
                        'ring-2 ring-background'
                      )}>
                        <StepIcon className="h-4 w-4 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-2.5 font-medium">
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Sections — 2-column grid on wide screens */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Thresholds */}
          {Object.keys(config.thresholds).length > 0 && (
            <SectionCard
              id="thresholds"
              icon={AlertCircle}
              title={isOperator ? 'Limits & Thresholds' : 'Thresholds'}
              description={isOperator ? 'Set limits for automatic actions' : 'Numeric policy thresholds'}
            >
              <div className="space-y-3 mt-2">
                {Object.entries(config.thresholds).map(([key, value]) => (
                  <div key={key} className={cn(
                    'flex items-center justify-between gap-4 p-3.5 rounded-xl',
                    'bg-surface-1 border border-border/50',
                  )}>
                    <Label className="text-sm font-medium">
                      {isOperator 
                        ? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                        : key
                      }
                    </Label>
                    <div className="relative">
                      {key.includes('amount') && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      )}
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => onConfigChange({
                          ...config,
                          thresholds: { ...config.thresholds, [key]: Number(e.target.value) }
                        })}
                        className={cn(
                          'w-28 h-9 text-sm font-medium',
                          key.includes('amount') && 'pl-7'
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Approval Rules */}
          <SectionCard
            id="approval"
            icon={Shield}
            title={isOperator ? 'Approval Rules' : 'Approval Config'}
            description={isOperator ? 'When you need to approve actions' : 'approval_rules[] configuration'}
          >
            {config.approval_rules.length === 0 ? (
              <div className="p-5 rounded-xl bg-surface-1 text-center mt-2">
                <div className="h-9 w-9 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-4 w-4 text-success" />
                </div>
                <p className="text-sm font-medium text-foreground">Fully Autonomous</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isOperator ? 'All actions run automatically' : 'approval_rules: []'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {config.approval_rules.map((rule, idx) => (
                  <div key={idx} className={cn(
                    'p-3.5 rounded-xl border',
                    'bg-surface-1 border-border/50'
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {isOperator 
                          ? rule.action_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                          : rule.action_type
                        }
                      </span>
                      <Switch
                        checked={rule.requires_approval}
                        onCheckedChange={(checked) => {
                          const newRules = [...config.approval_rules];
                          newRules[idx] = { ...rule, requires_approval: checked };
                          onConfigChange({ ...config, approval_rules: newRules });
                        }}
                      />
                    </div>
                    {rule.requires_approval && (
                      <Select
                        value={rule.approval_mode}
                        onValueChange={(value) => {
                          const newRules = [...config.approval_rules];
                          newRules[idx] = { ...rule, approval_mode: value as any };
                          onConfigChange({ ...config, approval_rules: newRules });
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(approvalModeLabels).map(([key, labels]) => (
                            <SelectItem key={key} value={key} className="text-xs">
                              {isOperator ? labels.operator : labels.engineer}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {rule.threshold && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {isOperator 
                          ? `Required above $${rule.threshold}`
                          : `threshold: ${rule.threshold} ${rule.threshold_unit || ''}`
                        }
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Tool Policy */}
          <SectionCard
            id="tools"
            icon={Wrench}
            title={isOperator ? 'Capabilities' : 'Tool Policy'}
            description={isOperator ? 'What this agent can do' : 'tool_policy.allowlist'}
          >
            {toolCatalog.length === 0 ? (
              <div className="p-5 rounded-xl bg-surface-1 text-center mt-2">
                <p className="text-sm text-muted-foreground">
                  {isOperator ? 'No tools configured' : 'No tool catalog found'}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 mt-2">
                {toolCatalog.map((tool) => {
                  const isAllowed = config.tool_policy.allowlist.includes(tool.name) ||
                    config.tool_policy.allowlist.includes('*');
                  const risk = riskLabels[tool.risk];

                  return (
                    <div 
                      key={tool.name}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border transition-all duration-150',
                        isAllowed 
                          ? 'bg-surface-1 border-border/50' 
                          : 'bg-surface-1/30 border-border/20 opacity-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isAllowed}
                          onCheckedChange={(checked) => {
                            const newAllowlist = checked
                              ? [...config.tool_policy.allowlist, tool.name]
                              : config.tool_policy.allowlist.filter(t => t !== tool.name);
                            onConfigChange({
                              ...config,
                              tool_policy: { ...config.tool_policy, allowlist: newAllowlist }
                            });
                          }}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {isOperator 
                              ? tool.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                              : tool.name
                            }
                          </p>
                          <p className="text-[11px] text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn('text-[10px]', risk.color)}>
                          {isOperator ? risk.operator : risk.engineer}
                        </Badge>
                        {tool.requires_approval && (
                          <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/20">
                            {isOperator ? 'Approval' : 'req_approval'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Provider Bindings */}
          <SectionCard
            id="providers"
            icon={Link2}
            title={isOperator ? 'Connected Services' : 'Provider Bindings'}
            description={isOperator ? 'External services this agent uses' : 'provider_bindings[]'}
          >
            {config.provider_bindings.length === 0 ? (
              <div className="p-5 rounded-xl bg-surface-1 text-center mt-2">
                <p className="text-sm text-muted-foreground">
                  {isOperator ? 'No services connected' : 'provider_bindings: []'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {config.provider_bindings.map((binding) => {
                  const provider = providers.find(p => p.provider_id === binding.provider_id);
                  const isConnected = binding.connection_status === 'connected';

                  return (
                    <div 
                      key={binding.provider_id}
                      className={cn(
                        'flex items-center justify-between p-3.5 rounded-xl',
                        'bg-surface-1 border border-border/50',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'h-8 w-8 rounded-lg flex items-center justify-center',
                          isConnected ? 'bg-success/10' : 'bg-muted'
                        )}>
                          <Link2 className={cn(
                            'h-4 w-4',
                            isConnected ? 'text-success' : 'text-muted-foreground'
                          )} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {provider?.name || binding.provider_id}
                          </p>
                          <p className={cn(
                            'text-xs',
                            isConnected ? 'text-success' : 'text-muted-foreground'
                          )}>
                            {isOperator 
                              ? binding.connection_status.replace(/\b\w/g, c => c.toUpperCase())
                              : `status: ${binding.connection_status}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] text-muted-foreground font-mono bg-surface-2 px-2 py-1 rounded">
                          {binding.scopes.slice(0, 2).join(', ')}
                          {binding.scopes.length > 2 && ` +${binding.scopes.length - 2}`}
                        </div>
                        <div className={cn(
                          'h-2.5 w-2.5 rounded-full',
                          isConnected ? 'bg-success animate-pulse' : 'bg-muted-foreground'
                        )} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Rollout State — full width at bottom */}
        <Card className={cn(
          'border-border bg-card overflow-hidden',
          'shadow-sm'
        )}>
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Rocket className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="font-medium text-sm text-foreground">
                  {isOperator ? 'Deployment Status' : 'Rollout State'}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {isOperator ? 'Current deployment status' : 'rollout_state'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={cn(
                'px-4 py-2 rounded-lg text-xs',
                config.rollout_state === 'active' && 'bg-success/10 text-success border border-success/20',
                config.rollout_state === 'draft' && 'bg-muted text-muted-foreground border border-border',
                config.rollout_state === 'proposed' && 'bg-warning/10 text-warning border border-warning/20',
                config.rollout_state === 'paused' && 'bg-warning/10 text-warning border border-warning/20',
                config.rollout_state === 'deprecated' && 'bg-destructive/10 text-destructive border border-destructive/20',
              )}>
                {config.rollout_state === 'active' && (isOperator ? '● This agent is live' : 'active — processing enabled')}
                {config.rollout_state === 'draft' && (isOperator ? 'Save as draft' : 'draft — not processing')}
                {config.rollout_state === 'proposed' && (isOperator ? 'Pending review' : 'proposed — pending approval')}
                {config.rollout_state === 'paused' && (isOperator ? 'Temporarily paused' : 'paused — temporarily disabled')}
                {config.rollout_state === 'deprecated' && (isOperator ? 'Retired' : 'deprecated — end of life')}
              </div>
              
              <Select
                value={config.rollout_state}
                onValueChange={(value) => onConfigChange({ 
                  ...config, 
                  rollout_state: value as any 
                })}
              >
                <SelectTrigger className="w-36 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(rolloutLabels).map(([key, labels]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {isOperator ? labels.operator : labels.engineer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>
    </ScrollArea>
  );
}
