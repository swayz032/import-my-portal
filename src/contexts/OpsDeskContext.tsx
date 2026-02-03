import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Types
export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'acting' | 'error';
export type AutomationMode = 'advisory' | 'standard' | 'emergency_stop';
export type ActionEventCategory = 'analysis' | 'planning' | 'execution' | 'approval' | 'release';

export const orbStateLabels: Record<OrbState, string> = {
  idle: 'Ready',
  listening: 'Listening...',
  thinking: 'Thinking...',
  speaking: 'Speaking...',
  acting: 'Acting...',
  error: 'Error',
};

export interface ActionEvent {
  id: string;
  category: ActionEventCategory;
  action: string;
  timestamp: string;
  status: 'pending' | 'in-progress' | 'complete' | 'failed';
  details?: string;
}

export interface OpsDeskReceipt {
  id: string;
  timestamp: string;
  action: string;
  outcome: 'Success' | 'Failed' | 'Pending' | 'Blocked';
  details?: string;
  correlationId?: string;
  actor?: string;
  summary?: string;
  receiptType?: string;
  attachedContext?: ContextAttachment[];
  redactedInputs?: string;
  redactedOutputs?: string;
}

export interface ContextAttachment {
  id: string;
  type: 'incident' | 'customer' | 'approval' | 'provider' | 'timeRange' | 'file';
  label: string;
  entityId: string;
}

export interface OpsDeskAttachment extends ContextAttachment {}

export interface OpsDeskNote {
  id: string;
  content: string;
  body?: string;
  author: string;
  timestamp: string;
  isLLMGenerated?: boolean;
  type?: 'user' | 'llm' | 'system';
}

export interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'ava';
  content: string;
  timestamp: string;
}

export interface PipelineStep {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'complete' | 'failed';
  details?: string;
}

export interface ReleaseChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface AnalysisResult {
  summary: string;
  rootCause: string;
  affectedSystems: string[];
  recommendations: string[];
}

export interface FixPlanResult {
  steps: string[];
  estimatedDuration: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PatchDraftResult {
  description: string;
  changes: string[];
  testPlan: string;
}

interface OpsDeskContextType {
  receipts: OpsDeskReceipt[];
  addReceipt: (receipt: Omit<OpsDeskReceipt, 'id' | 'timestamp'>) => void;
  attachments: ContextAttachment[];
  addAttachment: (attachment: Omit<ContextAttachment, 'id'>) => void;
  removeAttachment: (id: string) => void;
  notes: OpsDeskNote[];
  addNote: (content: string, author?: string, isLLMGenerated?: boolean) => void;
  transcript: TranscriptEntry[];
  addTranscriptEntry: (speaker: 'user' | 'ava', content: string) => void;
  pipelineSteps: PipelineStep[];
  updatePipelineStep: (id: string, status: PipelineStep['status'], details?: string) => void;
  orbState: OrbState;
  setOrbState: (state: OrbState) => void;
  liveOrbActions: ActionEvent[];
  fullActionTrace: ActionEvent[];
  automationMode: AutomationMode;
  setAutomationMode: (mode: AutomationMode) => void;
  analysisResult: AnalysisResult | null;
  fixPlanResult: FixPlanResult | null;
  patchDraftResult: PatchDraftResult | null;
  createdApprovalId: string | null;
  releaseChecklist: ReleaseChecklistItem[];
  runAnalysis: () => Promise<void>;
  runFixPlan: () => Promise<void>;
  runPatchDraft: () => Promise<void>;
  createApproval: () => Promise<void>;
  toggleReleaseChecklistItem: (id: string) => void;
  isConversationActive: boolean;
  startConversation: () => void;
  endConversation: () => void;
  interruptSpeaking: () => void;
  isAnalyzing: boolean;
  isGeneratingPlan: boolean;
  isDraftingPatch: boolean;
  seedDemoData: () => void;
  clearAll: () => void;
}

const OpsDeskContext = createContext<OpsDeskContextType | undefined>(undefined);

const initialPipelineSteps: PipelineStep[] = [
  { id: 'analyze', label: 'Analyze Issue', status: 'pending' },
  { id: 'identify', label: 'Identify Root Cause', status: 'pending' },
  { id: 'plan', label: 'Plan Fix', status: 'pending' },
  { id: 'execute', label: 'Execute Fix', status: 'pending' },
  { id: 'verify', label: 'Verify Resolution', status: 'pending' },
];

const initialReleaseChecklist: ReleaseChecklistItem[] = [
  { id: 'tests', label: 'All tests passing', checked: false },
  { id: 'review', label: 'Code review complete', checked: false },
  { id: 'rollback', label: 'Rollback plan ready', checked: false },
  { id: 'monitoring', label: 'Monitoring configured', checked: false },
];

export function OpsDeskProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<OpsDeskReceipt[]>([]);
  const [attachments, setAttachments] = useState<ContextAttachment[]>([]);
  const [notes, setNotes] = useState<OpsDeskNote[]>([]);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(initialPipelineSteps);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [liveOrbActions] = useState<ActionEvent[]>([]);
  const [fullActionTrace] = useState<ActionEvent[]>([]);
  const [automationMode, setAutomationMode] = useState<AutomationMode>('standard');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [fixPlanResult, setFixPlanResult] = useState<FixPlanResult | null>(null);
  const [patchDraftResult, setPatchDraftResult] = useState<PatchDraftResult | null>(null);
  const [createdApprovalId, setCreatedApprovalId] = useState<string | null>(null);
  const [releaseChecklist, setReleaseChecklist] = useState<ReleaseChecklistItem[]>(initialReleaseChecklist);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isDraftingPatch, setIsDraftingPatch] = useState(false);

  const addReceipt = useCallback((receipt: Omit<OpsDeskReceipt, 'id' | 'timestamp'>) => {
    setReceipts(prev => [...prev, { ...receipt, id: `RCP-${Date.now()}`, timestamp: new Date().toISOString() }]);
  }, []);

  const addAttachment = useCallback((attachment: Omit<ContextAttachment, 'id'>) => {
    setAttachments(prev => {
      if (prev.some(a => a.entityId === attachment.entityId)) return prev;
      return [...prev, { ...attachment, id: `ATT-${Date.now()}` }];
    });
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  const addNote = useCallback((content: string, author = 'You', isLLMGenerated = false) => {
    setNotes(prev => [...prev, {
      id: `NOTE-${Date.now()}`,
      content,
      body: content,
      author,
      timestamp: new Date().toISOString(),
      isLLMGenerated,
      type: isLLMGenerated ? 'llm' : 'user',
    }]);
  }, []);

  const addTranscriptEntry = useCallback((speaker: 'user' | 'ava', content: string) => {
    setTranscript(prev => [...prev, { id: `TR-${Date.now()}`, speaker, content, timestamp: new Date().toISOString() }]);
  }, []);

  const updatePipelineStep = useCallback((id: string, status: PipelineStep['status'], details?: string) => {
    setPipelineSteps(prev => prev.map(step => step.id === id ? { ...step, status, details } : step));
  }, []);

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setOrbState('thinking');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnalysisResult({ summary: 'Payment processing failure', rootCause: 'Expired API key', affectedSystems: ['Stripe'], recommendations: ['Rotate API key'] });
    updatePipelineStep('analyze', 'complete');
    updatePipelineStep('identify', 'complete');
    setIsAnalyzing(false);
    setOrbState('idle');
  }, [updatePipelineStep]);

  const runFixPlan = useCallback(async () => {
    setIsGeneratingPlan(true);
    setOrbState('thinking');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFixPlanResult({ steps: ['Generate new API key', 'Update vault', 'Restart services'], estimatedDuration: '15 min', riskLevel: 'low' });
    updatePipelineStep('plan', 'complete');
    setIsGeneratingPlan(false);
    setOrbState('idle');
  }, [updatePipelineStep]);

  const runPatchDraft = useCallback(async () => {
    setIsDraftingPatch(true);
    setOrbState('acting');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPatchDraftResult({ description: 'Credential rotation', changes: ['Updated STRIPE_API_KEY'], testPlan: 'Run smoke tests' });
    updatePipelineStep('execute', 'complete');
    setIsDraftingPatch(false);
    setOrbState('idle');
  }, [updatePipelineStep]);

  const createApproval = useCallback(async () => {
    const id = `APR-${Date.now()}`;
    setCreatedApprovalId(id);
    addReceipt({ action: 'Created approval', outcome: 'Success', details: `Approval ${id} created` });
  }, [addReceipt]);

  const toggleReleaseChecklistItem = useCallback((id: string) => {
    setReleaseChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  }, []);

  const startConversation = useCallback(() => { setIsConversationActive(true); setOrbState('listening'); }, []);
  const endConversation = useCallback(() => { setIsConversationActive(false); setOrbState('idle'); }, []);
  const interruptSpeaking = useCallback(() => { if (orbState === 'speaking') setOrbState('idle'); }, [orbState]);

  const seedDemoData = useCallback(() => {
    setTranscript([
      { id: 'TR-1', speaker: 'user', content: 'Ava, analyze the Stripe failure', timestamp: new Date(Date.now() - 300000).toISOString() },
      { id: 'TR-2', speaker: 'ava', content: 'Expired API key detected. Recommend rotating credentials.', timestamp: new Date(Date.now() - 240000).toISOString() },
    ]);
    setReceipts([
      { id: 'RCP-001', timestamp: new Date(Date.now() - 60000).toISOString(), action: 'Analyzed incident', outcome: 'Success', actor: 'Ava', summary: 'Analysis complete' },
    ]);
    setPipelineSteps([
      { id: 'analyze', label: 'Analyze Issue', status: 'complete', details: 'Reviewed logs' },
      { id: 'identify', label: 'Identify Root Cause', status: 'complete', details: 'Expired key' },
      { id: 'plan', label: 'Plan Fix', status: 'in-progress', details: 'Preparing rotation' },
      { id: 'execute', label: 'Execute Fix', status: 'pending' },
      { id: 'verify', label: 'Verify Resolution', status: 'pending' },
    ]);
    setAnalysisResult({ summary: 'Payment failure', rootCause: 'Expired Stripe key', affectedSystems: ['Stripe'], recommendations: ['Rotate key'] });
  }, []);

  const clearAll = useCallback(() => {
    setReceipts([]); setAttachments([]); setNotes([]); setTranscript([]);
    setPipelineSteps(initialPipelineSteps); setOrbState('idle');
    setAnalysisResult(null); setFixPlanResult(null); setPatchDraftResult(null);
    setCreatedApprovalId(null); setReleaseChecklist(initialReleaseChecklist);
    setIsConversationActive(false);
  }, []);

  return (
    <OpsDeskContext.Provider value={{
      receipts, addReceipt, attachments, addAttachment, removeAttachment,
      notes, addNote, transcript, addTranscriptEntry, pipelineSteps, updatePipelineStep,
      orbState, setOrbState, liveOrbActions, fullActionTrace,
      automationMode, setAutomationMode,
      analysisResult, fixPlanResult, patchDraftResult, createdApprovalId, releaseChecklist,
      runAnalysis, runFixPlan, runPatchDraft, createApproval, toggleReleaseChecklistItem,
      isConversationActive, startConversation, endConversation, interruptSpeaking,
      isAnalyzing, isGeneratingPlan, isDraftingPatch, seedDemoData, clearAll,
    }}>
      {children}
    </OpsDeskContext.Provider>
  );
}

export function useOpsDesk() {
  const context = useContext(OpsDeskContext);
  if (!context) throw new Error('useOpsDesk must be used within an OpsDeskProvider');
  return context;
}
