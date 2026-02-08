import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';
import type { StaffMember, StaffRuntimeConfig } from '@/contracts/ecosystem';
import { StaffAvatar } from './StaffAvatar';
import { OperatorEngineerToggle } from '@/components/shared/OperatorEngineerToggle';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Search } from 'lucide-react';

interface AgentListViewProps {
  staff: StaffMember[];
  configs: StaffRuntimeConfig[];
  onSelect: (id: string) => void;
}

const rolloutDisplay: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-success/15 text-success border-success/25' },
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-border' },
  proposed: { label: 'Review', className: 'bg-warning/15 text-warning border-warning/25' },
  paused: { label: 'Paused', className: 'bg-warning/15 text-warning border-warning/25' },
  deprecated: { label: 'Retired', className: 'bg-destructive/15 text-destructive border-destructive/25' },
};

export function AgentListView({ staff, configs, onSelect }: AgentListViewProps) {
  const { viewMode } = useSystem();
  const isOperator = viewMode === 'operator';
  const [search, setSearch] = useState('');

  const getConfig = (staffId: string) => configs.find(c => c.staff_id === staffId);

  const filtered = staff.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.staff_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn(
      'flex flex-col',
      '-m-4 md:-m-6 lg:-m-8',
      'h-[calc(100vh-3.5rem)]'
    )}>
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                'h-12 w-12 rounded-2xl flex items-center justify-center',
                'bg-primary/10 border border-primary/20'
              )}>
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {isOperator ? 'Staff' : 'Agents'}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isOperator
                    ? `${staff.length} team members configured`
                    : `${staff.length} agents in registry`}
                </p>
              </div>
            </div>
            <OperatorEngineerToggle />
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="shrink-0 bg-background">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isOperator ? 'Search staff...' : 'Search agents...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-surface-1 border-border"
            />
          </div>
        </div>
      </div>

      {/* Agent table */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 pb-8">
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-1">
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 w-16" />
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    {isOperator ? 'Name' : 'staff_id'}
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    {isOperator ? 'Role' : 'Description'}
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Channel
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member) => {
                  const config = getConfig(member.staff_id);
                  const rolloutState = config?.rollout_state || 'draft';
                  const rollout = rolloutDisplay[rolloutState] || rolloutDisplay.draft;

                  return (
                    <tr
                      key={member.staff_id}
                      onClick={() => onSelect(member.staff_id)}
                      className={cn(
                        'border-b border-border/50 cursor-pointer',
                        'transition-colors duration-150',
                        'hover:bg-accent/30'
                      )}
                    >
                      <td className="px-6 py-4">
                        <StaffAvatar
                          staffId={member.staff_id}
                          name={member.name}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-foreground">
                          {member.name}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-muted-foreground">
                          {isOperator ? member.title : member.description}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-muted-foreground capitalize">
                          {member.channel}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={cn('text-[11px]', rollout.className)}>
                          {rollout.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-sm text-muted-foreground">
                No agents found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
