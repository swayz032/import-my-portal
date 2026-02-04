import { useState } from 'react';
import { useSystem } from '@/contexts/SystemContext';
import type { StaffRuntimeConfig } from '@/contracts/ecosystem';
import { staff } from '@/ecosystem/snapshot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Rocket, 
  Pause, 
  RotateCcw,
  Clock,
  User,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Staff avatar imports
import avaAvatar from '@/assets/staff/ava.png';
import sarahAvatar from '@/assets/staff/sarah.png';
import eliAvatar from '@/assets/staff/eli.png';
import quinnAvatar from '@/assets/staff/quinn.png';
import noraAvatar from '@/assets/staff/nora.png';

interface DeployTabProps {
  configs: StaffRuntimeConfig[];
}

const staffAvatars: Record<string, string> = {
  ava: avaAvatar,
  sarah: sarahAvatar,
  eli: eliAvatar,
  quinn: quinnAvatar,
  nora: noraAvatar,
};

interface RolloutEntry {
  staff_id: string;
  environment: 'development' | 'staging' | 'production';
  percentage: number;
  status: 'active' | 'paused' | 'rolling_back';
  updated_at: string;
  updated_by: string;
  history: { timestamp: string; action: string; actor: string; percentage: number }[];
}

// Realistic mock data
const MOCK_ROLLOUTS: RolloutEntry[] = [
  {
    staff_id: 'sarah',
    environment: 'production',
    percentage: 100,
    status: 'active',
    updated_at: '2024-01-15T14:30:00Z',
    updated_by: 'admin@company.com',
    history: [
      { timestamp: '2024-01-15T14:30:00Z', action: 'Rolled out to 100%', actor: 'admin@company.com', percentage: 100 },
      { timestamp: '2024-01-14T10:00:00Z', action: 'Rolled out to 50%', actor: 'admin@company.com', percentage: 50 },
      { timestamp: '2024-01-13T09:00:00Z', action: 'Created rollout', actor: 'admin@company.com', percentage: 10 },
    ]
  },
  {
    staff_id: 'quinn',
    environment: 'production',
    percentage: 75,
    status: 'active',
    updated_at: '2024-01-14T11:00:00Z',
    updated_by: 'admin@company.com',
    history: [
      { timestamp: '2024-01-14T11:00:00Z', action: 'Rolled out to 75%', actor: 'admin@company.com', percentage: 75 },
      { timestamp: '2024-01-12T15:00:00Z', action: 'Created rollout', actor: 'admin@company.com', percentage: 25 },
    ]
  },
  {
    staff_id: 'eli',
    environment: 'staging',
    percentage: 100,
    status: 'active',
    updated_at: '2024-01-10T09:00:00Z',
    updated_by: 'admin@company.com',
    history: [
      { timestamp: '2024-01-10T09:00:00Z', action: 'Created rollout', actor: 'admin@company.com', percentage: 100 },
    ]
  },
];

const statusLabels = {
  active: { label: 'Active', color: 'bg-success/20 text-success border-success/30' },
  paused: { label: 'Paused', color: 'bg-warning/20 text-warning border-warning/30' },
  rolling_back: { label: 'Rolling Back', color: 'bg-destructive/20 text-destructive border-destructive/30' },
};

const envLabels = {
  development: { label: 'Dev', color: 'bg-muted text-muted-foreground' },
  staging: { label: 'Staging', color: 'bg-primary/20 text-primary' },
  production: { label: 'Prod', color: 'bg-success/20 text-success' },
};

export function DeployTab({ configs }: DeployTabProps) {
  const { viewMode, systemState } = useSystem();
  const isOperator = viewMode === 'operator';
  const safetyMode = systemState.safetyMode;
  
  const [rollouts] = useState<RolloutEntry[]>(MOCK_ROLLOUTS);
  const [selectedRollout, setSelectedRollout] = useState<RolloutEntry | null>(null);
  const [newPercentage, setNewPercentage] = useState<number>(0);

  const getStaffMember = (staffId: string) => staff.find(s => s.staff_id === staffId);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const handleOpenDetail = (rollout: RolloutEntry) => {
    setSelectedRollout(rollout);
    setNewPercentage(rollout.percentage);
  };

  // Find staff that are not deployed yet
  const notDeployed = staff.filter(s => !rollouts.some(r => r.staff_id === s.staff_id));

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          {/* Safety Mode Warning */}
          {safetyMode && (
            <Card className="border-warning/50 bg-warning/10">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isOperator ? 'Safety Mode Active' : 'safety_mode: true'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isOperator 
                      ? 'Deploy controls are locked. Disable Safety Mode to make changes.'
                      : 'Rollout mutations disabled while safety_mode=true'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Rollouts */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4">
              {isOperator ? 'Active Deployments' : 'Rollouts'}
            </h2>
            <div className="space-y-2">
              {rollouts.map((rollout) => {
                const member = getStaffMember(rollout.staff_id);
                if (!member) return null;
                const status = statusLabels[rollout.status];
                const env = envLabels[rollout.environment];
                const avatarUrl = staffAvatars[rollout.staff_id];

                return (
                  <Card 
                    key={`${rollout.staff_id}-${rollout.environment}`}
                    className="border-border hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => handleOpenDetail(rollout)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-border">
                          {avatarUrl ? (
                            <AvatarImage src={avatarUrl} alt={member.name} />
                          ) : null}
                          <AvatarFallback className="text-lg bg-surface-2">
                            {member.avatar_emoji}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{member.name}</span>
                            <Badge variant="outline" className={cn('text-[10px] h-5', env.color)}>
                              {env.label}
                            </Badge>
                            <Badge variant="outline" className={cn('text-[10px] h-5', status.color)}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isOperator ? member.title : member.staff_id}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-semibold text-foreground">{rollout.percentage}%</p>
                          <p className="text-xs text-muted-foreground">{formatDate(rollout.updated_at)}</p>
                        </div>

                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {rollouts.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <Rocket className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {isOperator ? 'No active deployments' : 'No rollouts configured'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Not Yet Deployed */}
          {notDeployed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-4">
                {isOperator ? 'Not Yet Deployed' : 'Pending Rollouts'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {notDeployed.map((member) => {
                  const avatarUrl = staffAvatars[member.staff_id];
                  return (
                    <Card key={member.staff_id} className="border-dashed opacity-60">
                      <CardContent className="p-3 text-center">
                        <Avatar className="h-10 w-10 mx-auto mb-2 border border-border">
                          {avatarUrl ? (
                            <AvatarImage src={avatarUrl} alt={member.name} />
                          ) : null}
                          <AvatarFallback className="text-lg bg-surface-2">
                            {member.avatar_emoji}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground">Not deployed</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Rollout Detail Drawer */}
      <Sheet open={!!selectedRollout} onOpenChange={(open) => !open && setSelectedRollout(null)}>
        <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
          {selectedRollout && (
            <>
              <SheetHeader className="p-6 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-border">
                    {staffAvatars[selectedRollout.staff_id] ? (
                      <AvatarImage src={staffAvatars[selectedRollout.staff_id]} />
                    ) : null}
                    <AvatarFallback className="text-xl">
                      {getStaffMember(selectedRollout.staff_id)?.avatar_emoji}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle>{getStaffMember(selectedRollout.staff_id)?.name}</SheetTitle>
                    <p className="text-sm text-muted-foreground">
                      {isOperator 
                        ? `${envLabels[selectedRollout.environment].label} deployment`
                        : `${selectedRollout.staff_id} • ${selectedRollout.environment}`
                      }
                    </p>
                  </div>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  {/* Current Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <p className="text-3xl font-bold text-foreground">{selectedRollout.percentage}%</p>
                        <p className="text-xs text-muted-foreground">
                          {isOperator ? 'Current Rollout' : 'percentage'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <Badge className={cn('text-sm', statusLabels[selectedRollout.status].color)}>
                          {statusLabels[selectedRollout.status].label}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isOperator ? 'Status' : 'status'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Set Percentage */}
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        {isOperator ? 'Adjust Rollout' : 'Set Percentage'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Target</span>
                          <span className="text-lg font-semibold">{newPercentage}%</span>
                        </div>
                        <Slider
                          value={[newPercentage]}
                          onValueChange={([val]) => setNewPercentage(val)}
                          max={100}
                          step={10}
                          disabled={safetyMode}
                        />
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button 
                              className="w-full" 
                              disabled={safetyMode || newPercentage === selectedRollout.percentage}
                            >
                              <Rocket className="h-4 w-4 mr-2" />
                              {isOperator ? 'Apply Changes' : 'Set Percentage'}
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {safetyMode && (
                          <TooltipContent>
                            Disabled while Safety Mode is active
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex-1">
                          <Button variant="outline" className="w-full" disabled={safetyMode}>
                            <Pause className="h-4 w-4 mr-2" />
                            {isOperator ? 'Pause' : 'Pause Rollout'}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {safetyMode && (
                        <TooltipContent>Disabled while Safety Mode is active</TooltipContent>
                      )}
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex-1">
                          <Button variant="outline" className="w-full" disabled={safetyMode}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            {isOperator ? 'Rollback' : 'Rollback'}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {safetyMode && (
                        <TooltipContent>Disabled while Safety Mode is active</TooltipContent>
                      )}
                    </Tooltip>
                  </div>

                  {/* History */}
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        {isOperator ? 'History' : 'Rollout History'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedRollout.history.map((entry, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                              {idx < selectedRollout.history.length - 1 && (
                                <div className="w-px flex-1 bg-border mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="text-sm font-medium text-foreground">{entry.action}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <User className="h-3 w-3" />
                                <span>{entry.actor}</span>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(entry.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
