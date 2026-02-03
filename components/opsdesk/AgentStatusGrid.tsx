import { Panel } from '@/components/shared/Panel';
import { StatusChip } from '@/components/shared/StatusChip';
import { formatTimeAgo } from '@/lib/formatters';
import { Bot, AlertTriangle, Wrench, Shield, DollarSign, Lightbulb, Code } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'Online' | 'Degraded' | 'Offline';
  lastActivity: string;
  description: string;
}

const agents: Agent[] = [
  {
    id: 'ava',
    name: 'Ava Orchestrator (GPT)',
    icon: Bot,
    status: 'Online',
    lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    description: 'Coordinates analysis and fix planning across all agents.',
  },
  {
    id: 'triage',
    name: 'Incident Triage Agent',
    icon: AlertTriangle,
    status: 'Online',
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    description: 'Classifies and prioritizes incoming incidents.',
  },
  {
    id: 'fix-planner',
    name: 'Fix Planner Agent',
    icon: Wrench,
    status: 'Online',
    lastActivity: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    description: 'Generates remediation steps and rollback plans.',
  },
  {
    id: 'safety',
    name: 'Safety & Policy Guardian',
    icon: Shield,
    status: 'Online',
    lastActivity: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    description: 'Enforces safety constraints and policy compliance.',
  },
  {
    id: 'cost',
    name: 'Cost Sentinel',
    icon: DollarSign,
    status: 'Online',
    lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    description: 'Monitors resource usage and cost implications.',
  },
  {
    id: 'rnd',
    name: 'R&D Scout',
    icon: Lightbulb,
    status: 'Degraded',
    lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    description: 'Researches new patterns and optimization opportunities.',
  },
  {
    id: 'claude',
    name: 'Claude Patch Worker',
    icon: Code,
    status: 'Online',
    lastActivity: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    description: 'Drafts patch proposals and implementation details.',
  },
];

export function AgentStatusGrid() {
  return (
    <Panel title="Agents">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {agents.map(agent => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className="p-3 rounded-lg bg-surface-1 border border-border hover:border-border-hover transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-text-primary">{agent.name}</span>
                </div>
                <StatusChip
                  status={agent.status === 'Online' ? 'success' : agent.status === 'Degraded' ? 'warning' : 'critical'}
                  label={agent.status}
                />
              </div>
              <p className="text-xs text-text-tertiary mb-2">{agent.description}</p>
              <p className="text-xs text-text-secondary">
                Last activity: {formatTimeAgo(agent.lastActivity)}
              </p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
