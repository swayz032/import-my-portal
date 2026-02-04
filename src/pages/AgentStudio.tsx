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
import { Users, Sparkles, Rocket } from 'lucide-react';
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
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border bg-background">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              {isOperator ? 'Agent Studio' : 'Agent Configuration'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isOperator 
                ? 'Configure and deploy your AI workforce'
                : 'staff_runtime_config + registry_items management'
              }
            </p>
          </div>
          <OperatorEngineerToggle />
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-surface-1 h-10 p-1 gap-1">
            <TabsTrigger 
              value="staff" 
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4" />
              {isOperator ? 'Staff' : 'Staff Registry'}
            </TabsTrigger>
            <TabsTrigger 
              value="custom" 
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              {isOperator ? 'Custom' : 'Custom Agents'}
            </TabsTrigger>
            <TabsTrigger 
              value="deploy" 
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
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
            {/* Left: Staff List */}
            <div className="w-72 shrink-0 border-r border-border">
              <StaffList
                staff={staff}
                configs={configs}
                selectedId={selectedStaffId}
                onSelect={setSelectedStaffId}
              />
            </div>

            {/* Center: Config Editor */}
            <div className="flex-1 min-w-0 bg-background overflow-auto">
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
                    <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {isOperator ? 'Select a team member to configure' : 'Select staff_id to edit'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Effective Config Preview */}
            <div className="w-80 shrink-0 border-l border-border">
              {selectedMember && selectedConfig ? (
                <EffectiveConfig
                  member={selectedMember}
                  config={selectedConfig}
                  toolCatalog={toolCatalog}
                  skillpack={skillpack || null}
                />
              ) : (
                <div className="h-full bg-surface-1 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">
                    {isOperator ? 'Configuration preview' : 'effective_config preview'}
                  </p>
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
