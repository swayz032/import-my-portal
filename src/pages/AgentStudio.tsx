import { useState, useMemo } from 'react';
import { useSystem } from '@/contexts/SystemContext';
import { 
  staff, 
  staffConfigs, 
  providers, 
  getSkillpackById, 
  getToolCatalog 
} from '@/ecosystem/snapshot';
import type { StaffMember, StaffRuntimeConfig } from '@/contracts/ecosystem';
import { StaffList } from '@/components/agent-studio/StaffList';
import { ConfigEditor } from '@/components/agent-studio/ConfigEditor';
import { EffectiveConfig } from '@/components/agent-studio/EffectiveConfig';
import { CustomAgentsTab } from '@/components/agent-studio/CustomAgentsTab';
import { DeployTab } from '@/components/agent-studio/DeployTab';
import { OperatorEngineerToggle } from '@/components/shared/OperatorEngineerToggle';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, Sparkles, Rocket, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AgentStudio() {
  const { viewMode } = useSystem();
  const isOperator = viewMode === 'operator';
  
  const [activeTab, setActiveTab] = useState('staff');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(
    staff.length > 0 ? staff[0].staff_id : null
  );
  const [configs, setConfigs] = useState<StaffRuntimeConfig[]>(staffConfigs);

  const selectedMember = staff.find(s => s.staff_id === selectedStaffId);
  const selectedConfig = configs.find(c => c.staff_id === selectedStaffId);
  const skillpack = selectedMember?.default_skillpack_id 
    ? getSkillpackById(selectedMember.default_skillpack_id) 
    : null;
  const toolCatalog = selectedMember?.default_skillpack_id
    ? getToolCatalog(selectedMember.default_skillpack_id)
    : [];

  const handleConfigChange = (newConfig: StaffRuntimeConfig) => {
    setConfigs(prev => 
      prev.map(c => c.staff_id === newConfig.staff_id ? newConfig : c)
    );
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
      {/* Premium Header */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border bg-gradient-to-r from-surface-1/50 to-transparent">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className={cn(
              'h-12 w-12 rounded-xl flex items-center justify-center',
              'bg-gradient-to-br from-primary/20 to-primary/5',
              'border border-primary/20',
              'shadow-[0_0_30px_hsl(var(--primary)/0.15)]'
            )}>
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {isOperator ? 'Agent Studio' : 'Agent Configuration'}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isOperator 
                  ? 'Configure and deploy your AI workforce'
                  : 'staff_runtime_config + registry_items management'
                }
              </p>
            </div>
          </div>
          <OperatorEngineerToggle />
        </div>

        {/* Premium Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn(
            'h-11 p-1 gap-1',
            'bg-surface-1 border border-border',
            'shadow-inner'
          )}>
            <TabsTrigger 
              value="staff" 
              className={cn(
                'gap-2 px-4 transition-all duration-200',
                'data-[state=active]:bg-background data-[state=active]:shadow-md',
                'data-[state=active]:text-primary'
              )}
            >
              <Users className="h-4 w-4" />
              {isOperator ? 'Staff' : 'Staff Registry'}
            </TabsTrigger>
            <TabsTrigger 
              value="custom" 
              className={cn(
                'gap-2 px-4 transition-all duration-200',
                'data-[state=active]:bg-background data-[state=active]:shadow-md',
                'data-[state=active]:text-primary'
              )}
            >
              <Sparkles className="h-4 w-4" />
              {isOperator ? 'Custom' : 'Custom Agents'}
            </TabsTrigger>
            <TabsTrigger 
              value="deploy" 
              className={cn(
                'gap-2 px-4 transition-all duration-200',
                'data-[state=active]:bg-background data-[state=active]:shadow-md',
                'data-[state=active]:text-primary'
              )}
            >
              <Rocket className="h-4 w-4" />
              {isOperator ? 'Deploy' : 'Rollouts'}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'staff' && (
          <div className="h-full flex">
            {/* Left Rail: Staff List - Desktop optimized width */}
            <div className="w-80 min-w-[320px] shrink-0 border-r border-border">
              <StaffList
                staff={staff}
                configs={configs}
                selectedId={selectedStaffId}
                onSelect={setSelectedStaffId}
              />
            </div>

            {/* Center: Config Editor - Flexible width */}
            <div className="flex-1 min-w-[500px] bg-background overflow-auto">
              {selectedMember && selectedConfig ? (
                <ConfigEditor
                  member={selectedMember}
                  config={selectedConfig}
                  toolCatalog={toolCatalog}
                  providers={providers}
                  skillpack={skillpack || null}
                  onConfigChange={handleConfigChange}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className={cn(
                      'h-16 w-16 rounded-2xl mx-auto mb-4',
                      'bg-gradient-to-br from-muted to-muted/50',
                      'flex items-center justify-center'
                    )}>
                      <Users className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      {isOperator ? 'Select a team member to configure' : 'Select staff_id to edit'}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Choose from the list on the left
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Rail: Effective Config Preview - Desktop optimized width */}
            <div className="w-[360px] min-w-[360px] shrink-0 border-l border-border">
              {selectedMember && selectedConfig ? (
                <EffectiveConfig
                  member={selectedMember}
                  config={selectedConfig}
                  toolCatalog={toolCatalog}
                  skillpack={skillpack || null}
                />
              ) : (
                <div className="h-full bg-surface-1 flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-xs text-muted-foreground">
                      {isOperator ? 'Configuration preview' : 'effective_config preview'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <CustomAgentsTab />
        )}

        {activeTab === 'deploy' && (
          <DeployTab configs={configs} />
        )}
      </div>
    </div>
  );
}
