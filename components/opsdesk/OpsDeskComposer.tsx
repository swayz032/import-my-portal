import { useState, useCallback, useRef, KeyboardEvent } from 'react';
import { useOpsDesk, ContextAttachment } from '@/contexts/OpsDeskContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Paperclip, X, FileText, Image, AlertTriangle, FileCheck, Users, Server, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { incidents, approvals, customers, providers } from '@/data/seed';

interface FileAttachment {
  id: string;
  name: string;
  type: 'file' | 'image';
  size: number;
}

export function OpsDeskComposer() {
  const { 
    addTranscriptEntry, 
    runAnalysis, 
    orbState,
    addAttachment,
    attachments,
    removeAttachment,
  } = useOpsDesk();
  
  const [message, setMessage] = useState('');
  const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>([]);
  const [attachDialogOpen, setAttachDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isProcessing = ['listening', 'thinking', 'searching_web', 'searching_files', 'querying_data', 'connecting_agents', 'drafting', 'speaking'].includes(orbState);
  
  const handleSend = useCallback(async () => {
    if (!message.trim() && fileAttachments.length === 0) return;
    
    const text = message.trim();
    setMessage('');
    setFileAttachments([]);
    
    // Add user message to transcript
    addTranscriptEntry('You', text || 'Attached files for analysis');
    
    // If message contains "analyze", run analysis
    if (text.toLowerCase().includes('analyze')) {
      await runAnalysis();
    } else {
      // Default behavior - run analysis with context
      await runAnalysis();
    }
  }, [message, fileAttachments, addTranscriptEntry, runAnalysis]);
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const attachment: FileAttachment = {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        type: isImage ? 'image' : 'file',
        size: file.size,
      };
      setFileAttachments(prev => [...prev, attachment]);
      
      // Add to context attachments
      addAttachment({
        type: 'file',
        label: file.name,
        entityId: attachment.id,
        fileType: isImage ? 'image' : 'document',
      });
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addAttachment]);
  
  const removeFileAttachment = useCallback((id: string) => {
    setFileAttachments(prev => prev.filter(f => f.id !== id));
    // Also remove from context attachments
    const att = attachments.find(a => a.entityId === id);
    if (att) {
      removeAttachment(att.id);
    }
  }, [attachments, removeAttachment]);
  
  const handleAttachContext = (type: ContextAttachment['type']) => {
    switch (type) {
      case 'incident': {
        const incident = incidents[0];
        if (incident && !attachments.some(a => a.type === 'incident' && a.entityId === incident.id)) {
          addAttachment({
            type: 'incident',
            label: `Incident ${incident.id}`,
            entityId: incident.id,
          });
        }
        break;
      }
      case 'approval': {
        const approval = approvals.find(a => a.status === 'Pending');
        if (approval && !attachments.some(a => a.type === 'approval' && a.entityId === approval.id)) {
          addAttachment({
            type: 'approval',
            label: `Approval ${approval.id}`,
            entityId: approval.id,
          });
        }
        break;
      }
      case 'customer': {
        const customer = customers[0];
        if (customer && !attachments.some(a => a.type === 'customer' && a.entityId === customer.id)) {
          addAttachment({
            type: 'customer',
            label: customer.name,
            entityId: customer.id,
          });
        }
        break;
      }
      case 'provider': {
        const provider = providers[0];
        if (provider && !attachments.some(a => a.type === 'provider' && a.entityId === provider.id)) {
          addAttachment({
            type: 'provider',
            label: provider.name,
            entityId: provider.id,
          });
        }
        break;
      }
      case 'timeRange': {
        if (!attachments.some(a => a.type === 'timeRange')) {
          addAttachment({
            type: 'timeRange',
            label: 'Last 24 hours',
            entityId: 'last-24h',
          });
        }
        break;
      }
    }
    setAttachDialogOpen(false);
  };
  
  return (
    <div className="space-y-2">
      {/* File attachment chips */}
      {fileAttachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {fileAttachments.map(file => (
            <div
              key={file.id}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-2 border border-border text-xs"
            >
              {file.type === 'image' ? (
                <Image className="h-3 w-3 text-primary" />
              ) : (
                <FileText className="h-3 w-3 text-text-secondary" />
              )}
              <span className="text-text-secondary truncate max-w-[120px]">{file.name}</span>
              <button
                onClick={() => removeFileAttachment(file.id)}
                className="text-text-tertiary hover:text-text-secondary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Composer row */}
      <div className="flex items-end gap-2">
        {/* Attach button */}
        <Dialog open={attachDialogOpen} onOpenChange={setAttachDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline" className="flex-shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-text-primary">Add Context</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="context" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="context">Context</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>
              <TabsContent value="context" className="space-y-2 mt-4">
                <button
                  onClick={() => handleAttachContext('incident')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface-1 hover:bg-surface-2 border border-border transition-colors text-left"
                >
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Incident</p>
                    <p className="text-xs text-text-tertiary">Attach an active incident</p>
                  </div>
                </button>
                <button
                  onClick={() => handleAttachContext('approval')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface-1 hover:bg-surface-2 border border-border transition-colors text-left"
                >
                  <FileCheck className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Approval</p>
                    <p className="text-xs text-text-tertiary">Attach a pending approval</p>
                  </div>
                </button>
                <button
                  onClick={() => handleAttachContext('customer')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface-1 hover:bg-surface-2 border border-border transition-colors text-left"
                >
                  <Users className="h-4 w-4 text-success" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Customer</p>
                    <p className="text-xs text-text-tertiary">Attach customer context</p>
                  </div>
                </button>
                <button
                  onClick={() => handleAttachContext('provider')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface-1 hover:bg-surface-2 border border-border transition-colors text-left"
                >
                  <Server className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Provider</p>
                    <p className="text-xs text-text-tertiary">Attach provider context</p>
                  </div>
                </button>
                <button
                  onClick={() => handleAttachContext('timeRange')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface-1 hover:bg-surface-2 border border-border transition-colors text-left"
                >
                  <Clock className="h-4 w-4 text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Time Range</p>
                    <p className="text-xs text-text-tertiary">Attach a time window filter</p>
                  </div>
                </button>
              </TabsContent>
              <TabsContent value="files" className="mt-4">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.txt,.md,.json,.yaml,.yml"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                  <p className="text-xs text-text-tertiary mt-2">
                    Images, PDFs, text files supported
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
        
        {/* Multiline input */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message or describe what to analyze..."
          className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-surface-1 border-border"
          rows={1}
          disabled={isProcessing}
        />
        
        {/* Send button */}
        <Button
          size="icon"
          onClick={handleSend}
          disabled={(!message.trim() && fileAttachments.length === 0) || isProcessing}
          className="flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
