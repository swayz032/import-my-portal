import { createContext, useContext, useState, ReactNode } from 'react';

type ViewMode = 'operator' | 'engineer';
type AutonomyLevel = 'Limited' | 'Standard' | 'Emergency Stop';

interface SystemState {
  safetyMode: boolean;
  autonomyLevel: AutonomyLevel;
}

interface SystemContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  systemState: SystemState;
  toggleSafetyMode: () => void;
  setAutonomyLevel: (level: AutonomyLevel) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('operator');
  const [systemState, setSystemState] = useState<SystemState>({
    safetyMode: false,
    autonomyLevel: 'Standard',
  });

  const toggleSafetyMode = () => {
    setSystemState(prev => ({ ...prev, safetyMode: !prev.safetyMode }));
  };

  const setAutonomyLevel = (level: AutonomyLevel) => {
    setSystemState(prev => ({ ...prev, autonomyLevel: level }));
  };

  return (
    <SystemContext.Provider value={{ viewMode, setViewMode, systemState, toggleSafetyMode, setAutonomyLevel }}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
}
