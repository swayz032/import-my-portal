import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';
import type { 
  StaffMember, 
  StaffRuntimeConfig, 
  ToolCatalogEntry,
  ProviderDef,
  SkillpackRef 
} from '@/contracts/ecosystem';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronDown, 
  Shield, 
  Wrench, 
  Link2, 
  Rocket, 
  AlertCircle,
  CheckCircle,
  Info,
  Power
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Staff avatar imports
import avaAvatar from '@/assets/staff/ava.png';
import sarahAvatar from '@/assets/staff/sarah.png';
import eliAvatar from '@/assets/staff/eli.png';
import quinnAvatar from '@/assets/staff/quinn.png';
import noraAvatar from '@/assets/staff/nora.png';

interface ConfigEditorProps {
  member: StaffMember;
  config: StaffRuntimeConfig;
  toolCatalog: ToolCatalogEntry[];
  providers: ProviderDef[];
  skillpack: SkillpackRef | null;
  onConfigChange: (config: StaffRuntimeConfig) => void;
}

const staffAvatars: Record<string, string> = {
  ava: avaAvatar,
  sarah: sarahAvatar,
  eli: eliAvatar,
  quinn: quinnAvatar,
  nora: noraAvatar,
};

const approvalModeLabels = {
  auto: { operator: 'Automatic', engineer: 'auto' },
  voice_confirm: { operator: 'Live presence required', engineer: 'voice_confirm' },
  async_approval: { operator: 'Queued for approval', engineer: 'async_approval' },
  escalate: { operator: 'Always escalate', engineer: 'escalate' },
};

const riskLabels = {
  low: { operator: 'Safe', engineer: 'low', color: 'bg-success/20 text-success' },
  medium: { operator: 'Moderate', engineer: 'medium', color: 'bg-warning/20 text-warning' },
  high: { operator: 'High impact', engineer: 'high', color: 'bg-destructive/20 text-destructive' },
  critical: { operator: 'Critical', engineer: 'critical', color: 'bg-destructive/30 text-destructive' },
};

const rolloutLabels = {
  draft: { operator: 'Draft', engineer: 'draft' },
  proposed: { operator: 'Pending Review', engineer: 'proposed' },
  active: { operator: 'Live', engineer: 'active' },
  paused: { operator: 'Paused', engineer: 'paused' },
  deprecated: { operator: 'Retired', engineer: 'deprecated' },
};

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
  const avatarUrl = staffAvatars[member.staff_id];
  
  const [sectionsOpen, setSectionsOpen] = useState({
    status: true,
    thresholds: true,
    approval: true,
    tools: true,
    providers: true,
    rollout: true,
  });

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const SectionCard = ({ 
    id, 
    icon: Icon, 
    title, 
    description,
    children 
  }: { 
    id: keyof typeof sectionsOpen;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <Collapsible open={sectionsOpen[id]}>
      <Card className="border-border bg-card">
        <CollapsibleTrigger 
          className="w-full"
          onClick={() => toggleSection(id)}
        >
          <div className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <span className="font-medium text-sm text-foreground">{title}</span>
                {description && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
              </div>
            </div>
            <ChevronDown className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              sectionsOpen[id] && 'rotate-180'
            )} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-4 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <Avatar className="h-14 w-14 border-2 border-border">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={member.name} />
            ) : null}
            <AvatarFallback className="text-2xl bg-surface-2">
              {member.avatar_emoji}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">{member.name}</h2>
            <p className="text-sm text-muted-foreground">
              {isOperator ? member.title : `${member.staff_id} • ${member.role}`}
            </p>
            {skillpack && (
              <Badge variant="outline" className="mt-2 text-xs">
                {isOperator ? skillpack.name : `skillpack: ${skillpack.skillpack_id}`}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => onConfigChange({ ...config, enabled })}
            />
            <span className={cn(
              'text-sm font-medium',
              config.enabled ? 'text-success' : 'text-muted-foreground'
            )}>
              {config.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {/* Thresholds */}
          {Object.keys(config.thresholds).length > 0 && (
            <SectionCard
              id="thresholds"
              icon={AlertCircle}
              title={isOperator ? 'Limits & Thresholds' : 'Thresholds'}
              description={isOperator ? 'Set limits for automatic actions' : 'Numeric policy thresholds'}
            >
              <div className="space-y-3">
                {Object.entries(config.thresholds).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-surface-1">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">
                        {isOperator 
                          ? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                          : key
                        }
                      </Label>
                    </div>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => onConfigChange({
                        ...config,
                        thresholds: { ...config.thresholds, [key]: Number(e.target.value) }
                      })}
                      className="w-28 h-9 text-sm"
                    />
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
              <div className="p-4 rounded-lg bg-surface-1 text-center">
                <p className="text-sm text-muted-foreground">
                  {isOperator ? 'No special approval rules — all actions run automatically' : 'approval_rules: []'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {config.approval_rules.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-surface-1 border border-border">
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
              <div className="p-4 rounded-lg bg-surface-1 text-center">
                <p className="text-sm text-muted-foreground">
                  {isOperator ? 'No tools configured for this agent' : 'No tool catalog found'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {toolCatalog.map((tool) => {
                  const isAllowed = config.tool_policy.allowlist.includes(tool.name) ||
                    config.tool_policy.allowlist.includes('*');
                  const risk = riskLabels[tool.risk];

                  return (
                    <div 
                      key={tool.name}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border transition-colors',
                        isAllowed 
                          ? 'bg-surface-1 border-border' 
                          : 'bg-surface-1/50 border-border/50 opacity-60'
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
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {isOperator 
                              ? tool.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                              : tool.name
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn('text-[10px]', risk.color)}>
                          {isOperator ? risk.operator : risk.engineer}
                        </Badge>
                        {tool.requires_approval && (
                          <Badge variant="outline" className="text-[10px]">
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
              <div className="p-4 rounded-lg bg-surface-1 text-center">
                <p className="text-sm text-muted-foreground">
                  {isOperator ? 'No services connected' : 'provider_bindings: []'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {config.provider_bindings.map((binding) => {
                  const provider = providers.find(p => p.provider_id === binding.provider_id);
                  const statusColor = {
                    connected: 'text-success',
                    disconnected: 'text-destructive',
                    degraded: 'text-warning',
                    pending: 'text-muted-foreground',
                  }[binding.connection_status];

                  return (
                    <div 
                      key={binding.provider_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {provider?.name || binding.provider_id}
                        </p>
                        <p className={cn('text-xs', statusColor)}>
                          {isOperator 
                            ? binding.connection_status.replace(/\b\w/g, c => c.toUpperCase())
                            : `status: ${binding.connection_status}`
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground font-mono">
                          {binding.scopes.join(', ')}
                        </div>
                        <div className={cn(
                          'h-2 w-2 rounded-full',
                          binding.connection_status === 'connected' ? 'bg-success' : 'bg-muted-foreground'
                        )} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Rollout State */}
          <SectionCard
            id="rollout"
            icon={Rocket}
            title={isOperator ? 'Deployment' : 'Rollout State'}
            description={isOperator ? 'Current deployment status' : 'rollout_state'}
          >
            <div className="space-y-3">
              <Select
                value={config.rollout_state}
                onValueChange={(value) => onConfigChange({ 
                  ...config, 
                  rollout_state: value as any 
                })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(rolloutLabels).map(([key, labels]) => (
                    <SelectItem key={key} value={key}>
                      {isOperator ? labels.operator : labels.engineer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {isOperator 
                  ? 'Draft → Review → Live → Paused → Retired'
                  : 'draft → proposed → active → paused → deprecated'
                }
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </ScrollArea>
  );
}
