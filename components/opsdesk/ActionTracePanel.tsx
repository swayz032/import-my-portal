import { useState, useMemo } from 'react';
import { useOpsDesk, ActionEvent, ActionEventCategory } from '@/contexts/OpsDeskContext';
import { Panel } from '@/components/shared/Panel';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  CheckCircle, 
  Loader2, 
  AlertTriangle, 
  XCircle,
  Users,
  Globe,
  FolderSearch,
  Database,
  Shield,
  FileCode,
  Server
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';

const categoryConfig: Record<ActionEventCategory, { label: string; icon: React.ReactNode; color: string }> = {
  agent: { label: 'Agent', icon: <Users className="h-3 w-3" />, color: 'bg-primary/20 text-primary border-primary/30' },
  web: { label: 'Web', icon: <Globe className="h-3 w-3" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  files: { label: 'Files', icon: <FolderSearch className="h-3 w-3" />, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  data: { label: 'Data', icon: <Database className="h-3 w-3" />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  provider: { label: 'Provider', icon: <Server className="h-3 w-3" />, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  safety: { label: 'Safety', icon: <Shield className="h-3 w-3" />, color: 'bg-warning/20 text-warning border-warning/30' },
  drafting: { label: 'Drafting', icon: <FileCode className="h-3 w-3" />, color: 'bg-success/20 text-success border-success/30' },
};

const statusIcons: Record<ActionEvent['status'], React.ReactNode> = {
  running: <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />,
  done: <CheckCircle className="h-3.5 w-3.5 text-success" />,
  blocked: <AlertTriangle className="h-3.5 w-3.5 text-warning" />,
  failed: <XCircle className="h-3.5 w-3.5 text-destructive" />,
};

export function ActionTracePanel() {
  const { fullActionTrace } = useOpsDesk();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<ActionEventCategory>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<ActionEvent | null>(null);
  
  const toggleCategory = (category: ActionEventCategory) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };
  
  const filteredEvents = useMemo(() => {
    return fullActionTrace.filter(event => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !event.label.toLowerCase().includes(query) &&
          !event.correlationId.toLowerCase().includes(query) &&
          !event.category.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      
      // Filter by category
      if (selectedCategories.size > 0 && !selectedCategories.has(event.category)) {
        return false;
      }
      
      return true;
    });
  }, [fullActionTrace, searchQuery, selectedCategories]);
  
  return (
    <Panel title="Full Action Trace">
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by label, category, or correlation ID..."
            className="pl-9 bg-surface-1 border-border"
          />
        </div>
        
        {/* Category filter chips */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(categoryConfig) as ActionEventCategory[]).map(category => {
            const config = categoryConfig[category];
            const isSelected = selectedCategories.has(category);
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-colors',
                  isSelected ? config.color : 'bg-surface-1 text-text-secondary border-border hover:bg-surface-2'
                )}
              >
                {config.icon}
                {config.label}
              </button>
            );
          })}
        </div>
        
        {/* Events list */}
        <div className="max-h-64 overflow-y-auto space-y-1">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-text-tertiary">
                {fullActionTrace.length === 0 ? 'No actions recorded yet' : 'No matching actions found'}
              </p>
            </div>
          ) : (
            filteredEvents.map(event => {
              const config = categoryConfig[event.category];
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg bg-surface-1 hover:bg-surface-2 border border-border transition-colors text-left"
                >
                  {/* Status icon */}
                  {statusIcons[event.status]}
                  
                  {/* Category badge */}
                  <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs', config.color)}>
                    {config.icon}
                  </span>
                  
                  {/* Label */}
                  <span className="flex-1 text-sm text-text-secondary truncate">
                    {event.label}
                  </span>
                  
                  {/* Duration */}
                  {event.durationMs && (
                    <span className="text-xs text-text-tertiary">
                      {event.durationMs < 1000 ? `${event.durationMs}ms` : `${(event.durationMs / 1000).toFixed(1)}s`}
                    </span>
                  )}
                  
                  {/* Timestamp */}
                  <span className="text-xs text-text-tertiary">
                    {formatDate(event.timestamp)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
      
      {/* Detail sheet */}
      <Sheet open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <SheetContent className="bg-card border-border">
          <SheetHeader>
            <SheetTitle className="text-text-primary">Action Details</SheetTitle>
          </SheetHeader>
          
          {selectedEvent && (
            <div className="space-y-4 mt-6">
              {/* Status */}
              <div className="flex items-center gap-2">
                {statusIcons[selectedEvent.status]}
                <span className="text-sm font-medium text-text-primary capitalize">
                  {selectedEvent.status}
                </span>
              </div>
              
              {/* Category */}
              <div>
                <p className="text-xs text-text-tertiary mb-1">Category</p>
                <Badge variant="outline" className={categoryConfig[selectedEvent.category].color}>
                  {categoryConfig[selectedEvent.category].icon}
                  <span className="ml-1">{categoryConfig[selectedEvent.category].label}</span>
                </Badge>
              </div>
              
              {/* Label */}
              <div>
                <p className="text-xs text-text-tertiary mb-1">Action</p>
                <p className="text-sm text-text-primary">{selectedEvent.label}</p>
              </div>
              
              {/* Timestamp */}
              <div>
                <p className="text-xs text-text-tertiary mb-1">Timestamp</p>
                <p className="text-sm text-text-secondary">{formatDate(selectedEvent.timestamp)}</p>
              </div>
              
              {/* Correlation ID */}
              <div>
                <p className="text-xs text-text-tertiary mb-1">Correlation ID</p>
                <p className="text-sm text-text-secondary font-mono">{selectedEvent.correlationId}</p>
              </div>
              
              {/* Duration */}
              {selectedEvent.durationMs && (
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Duration</p>
                  <p className="text-sm text-text-secondary">
                    {selectedEvent.durationMs < 1000 
                      ? `${selectedEvent.durationMs}ms` 
                      : `${(selectedEvent.durationMs / 1000).toFixed(2)}s`}
                  </p>
                </div>
              )}
              
              {/* Redacted data placeholders */}
              <div>
                <p className="text-xs text-text-tertiary mb-1">Inputs (redacted)</p>
                <div className="p-3 rounded-lg bg-surface-1 border border-border">
                  <pre className="text-xs text-text-tertiary font-mono whitespace-pre-wrap">
                    {`{\n  "context": "[REDACTED - 1.2KB]",\n  "parameters": "[REDACTED]"\n}`}
                  </pre>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-text-tertiary mb-1">Outputs (redacted)</p>
                <div className="p-3 rounded-lg bg-surface-1 border border-border">
                  <pre className="text-xs text-text-tertiary font-mono whitespace-pre-wrap">
                    {`{\n  "result": "[REDACTED - 856B]",\n  "metadata": "[REDACTED]"\n}`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Panel>
  );
}
