import { useState, ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useSystem } from '@/contexts/SystemContext';
import { AlertTriangle } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { systemState } = useSystem();

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {systemState.safetyMode && (
          <div className="safety-banner">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>
              <strong>Safety Mode is active.</strong> Write operations are restricted and risky automations are paused.
            </span>
          </div>
        )}
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
