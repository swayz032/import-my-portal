import { useOpsDesk, OrbState, orbStateLabels, ActionEvent } from '@/contexts/OpsDeskContext';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, Loader2, AlertTriangle, XCircle, ExternalLink, Mic, Brain, Globe, FolderSearch, Database, Users, FileCode, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import avaOrbVideo from '@/assets/ava-orb-video.mp4';

const orbStateColors: Record<OrbState, string> = {
  idle: 'from-surface-2 to-surface-1',
  listening: 'from-primary/30 to-primary/10',
  thinking: 'from-primary/20 to-surface-1',
  searching_web: 'from-blue-500/20 to-blue-500/5',
  searching_files: 'from-amber-500/20 to-amber-500/5',
  querying_data: 'from-purple-500/20 to-purple-500/5',
  connecting_agents: 'from-green-500/20 to-green-500/5',
  drafting: 'from-primary/20 to-surface-1',
  speaking: 'from-primary/30 to-primary/10',
  interrupted: 'from-warning/20 to-warning/5',
  blocked: 'from-warning/20 to-warning/5',
  error: 'from-destructive/20 to-destructive/5',
};

const orbStateIcons: Record<OrbState, React.ReactNode> = {
  idle: <Circle className="h-4 w-4" />,
  listening: <Mic className="h-4 w-4 animate-pulse" />,
  thinking: <Brain className="h-4 w-4 animate-pulse" />,
  searching_web: <Globe className="h-4 w-4 animate-pulse" />,
  searching_files: <FolderSearch className="h-4 w-4 animate-pulse" />,
  querying_data: <Database className="h-4 w-4 animate-pulse" />,
  connecting_agents: <Users className="h-4 w-4 animate-pulse" />,
  drafting: <FileCode className="h-4 w-4 animate-pulse" />,
  speaking: <Mic className="h-4 w-4" />,
  interrupted: <AlertTriangle className="h-4 w-4" />,
  blocked: <Shield className="h-4 w-4" />,
  error: <XCircle className="h-4 w-4" />,
};

const categoryIcons: Record<ActionEvent['category'], React.ReactNode> = {
  agent: <Users className="h-3 w-3" />,
  web: <Globe className="h-3 w-3" />,
  files: <FolderSearch className="h-3 w-3" />,
  data: <Database className="h-3 w-3" />,
  provider: <Globe className="h-3 w-3" />,
  safety: <Shield className="h-3 w-3" />,
  drafting: <FileCode className="h-3 w-3" />,
};

interface AvaOrbProps {
  onViewFullTrace?: () => void;
}

export function AvaOrb({ onViewFullTrace }: AvaOrbProps) {
  const { orbState, liveOrbActions } = useOpsDesk();
  
  const isAnimating = ['listening', 'thinking', 'searching_web', 'searching_files', 'querying_data', 'connecting_agents', 'drafting', 'speaking'].includes(orbState);
  
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Orb - pure video, no overlays */}
      <div 
        className={cn(
          'relative w-56 h-56 rounded-full overflow-hidden transition-all duration-500',
          isAnimating && 'shadow-lg shadow-primary/20'
        )}
      >
        <video
          src={avaOrbVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Pulse ring for active states */}
        {isAnimating && (
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping opacity-30" />
        )}
      </div>
      
      {/* Status below orb */}
      <div className="text-center">
        <div className={cn(
          'text-sm font-medium flex items-center justify-center gap-1.5 mb-1',
          orbState === 'error' && 'text-destructive',
          orbState === 'blocked' && 'text-warning',
          orbState === 'interrupted' && 'text-warning',
          orbState === 'idle' && 'text-muted-foreground',
          isAnimating && 'text-primary'
        )}>
          {orbStateIcons[orbState]}
          {orbStateLabels[orbState]}
        </div>
        <h3 className="text-lg font-semibold text-foreground">Ava</h3>
        <p className="text-xs text-muted-foreground">GPT Orchestrator</p>
      </div>
      
      {/* View full trace link */}
      {liveOrbActions.length > 0 && onViewFullTrace && (
        <button
          onClick={onViewFullTrace}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          View full trace
          <ExternalLink className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
