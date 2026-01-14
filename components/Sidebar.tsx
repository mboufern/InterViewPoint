import React, { useRef, useState } from 'react';
import { Plus, FileText, Upload, Trash2, Copy, History, Settings, Briefcase, BarChart3, Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { InterviewTemplate, InterviewResult, ViewMode, RecruitmentRun } from '../types';
import { parseYaml } from '../utils';

interface SidebarProps {
  templates: InterviewTemplate[];
  results: InterviewResult[];
  runs: RecruitmentRun[];
  activeTemplateId: string | null;
  activeResultId: string | null;
  activeRunId: string | null;
  onSelectTemplate: (id: string) => void;
  onSelectResult: (id: string) => void;
  onSelectRun: (id: string) => void;
  onCreateTemplate: () => void;
  onCreateRun: () => void;
  onImport: (data: any) => void;
  onDeleteTemplate: (id: string) => void;
  onDeleteRun: (id: string) => void;
  onDuplicateTemplate: (id: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  templates,
  results,
  runs,
  activeTemplateId,
  activeResultId,
  activeRunId,
  onSelectTemplate,
  onSelectResult,
  onSelectRun,
  onCreateTemplate,
  onCreateRun,
  onImport,
  onDeleteTemplate,
  onDeleteRun,
  onDuplicateTemplate,
  viewMode,
  setViewMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isRunsOpen, setIsRunsOpen] = useState(true);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(true);
  const [isResultsOpen, setIsResultsOpen] = useState(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const data = parseYaml(content);
      if (data) onImport(data);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const SectionHeader = ({ title, isOpen, onToggle, action }: { title: string, isOpen: boolean, onToggle: () => void, action?: React.ReactNode }) => (
    <div className="flex items-center justify-between mb-1 px-2 py-1.5 hover:bg-white/5 rounded transition cursor-pointer select-none" onClick={onToggle}>
        <div className="flex items-center gap-2">
            {isOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
            <h2 className="text-xs uppercase font-bold text-accent/70 tracking-wider">{title}</h2>
        </div>
        {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
    </div>
  );

  return (
    <div className="w-72 bg-primary text-slate-100 flex flex-col h-full border-r border-primary/50 shadow-xl z-20">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-primary/50">
        <h1 className="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
          <Briefcase className="w-6 h-6 text-accent" />
          <span className="text-white">InterViewPoint</span>
        </h1>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".yaml,.yml" />
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="p-2 hover:bg-white/10 rounded-full text-accent hover:text-white transition" 
          title="Import YAML"
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        
        {/* Runs Section */}
        <div>
          <SectionHeader 
            title="Recruitment Runs" 
            isOpen={isRunsOpen} 
            onToggle={() => setIsRunsOpen(!isRunsOpen)}
            action={
                <button 
                    onClick={onCreateRun} 
                    className="p-1 hover:bg-white/10 rounded text-accent hover:text-white transition" 
                    title="Create New Run"
                >
                    <Plus className="w-4 h-4" />
                </button>
            }
          />
          
          {isRunsOpen && (
              <div className="space-y-1 pl-2">
                {runs.length === 0 && <p className="text-xs text-slate-400 italic px-2 py-1">No active runs.</p>}
                {runs.map(run => (
                <div
                    key={run.id}
                    className={`group flex items-center justify-between p-2 rounded-md text-sm cursor-pointer transition-all duration-200 ${
                    activeRunId === run.id && viewMode === 'RUN_DETAILS' ? 'bg-accent text-primary font-medium shadow-md translate-x-1' : 'hover:bg-white/5 text-slate-300 hover:text-white'
                    }`}
                    onClick={() => onSelectRun(run.id)}
                >
                    <div className="flex items-center gap-2 truncate">
                    <Layers className={`w-4 h-4 ${activeRunId === run.id && viewMode === 'RUN_DETAILS' ? 'text-primary' : 'text-slate-500'}`} />
                    <span className="truncate">{run.name}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteRun(run.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-opacity" title="Delete">
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
                ))}
              </div>
          )}
        </div>

        <div className="h-px bg-white/10 mx-2"></div>

        {/* Templates Section */}
        <div>
          <SectionHeader 
            title="Templates" 
            isOpen={isTemplatesOpen} 
            onToggle={() => setIsTemplatesOpen(!isTemplatesOpen)}
            action={
                <button 
                    onClick={onCreateTemplate} 
                    className="p-1 hover:bg-white/10 rounded text-accent hover:text-white transition" 
                    title="Create New Template"
                >
                    <Plus className="w-4 h-4" />
                </button>
            }
          />
          
          {isTemplatesOpen && (
              <div className="space-y-1 pl-2">
                {templates.length === 0 && <p className="text-xs text-slate-400 italic px-2 py-1">No templates yet.</p>}
                {templates.map(t => (
                <div
                    key={t.id}
                    className={`group flex items-center justify-between p-2 rounded-md text-sm cursor-pointer transition-all duration-200 ${
                    activeTemplateId === t.id && viewMode === 'EDITOR' ? 'bg-accent text-primary font-medium shadow-md translate-x-1' : 'hover:bg-white/5 text-slate-300 hover:text-white'
                    }`}
                    onClick={() => onSelectTemplate(t.id)}
                >
                    <div className="flex items-center gap-2 truncate">
                    <FileText className={`w-4 h-4 ${activeTemplateId === t.id && viewMode === 'EDITOR' ? 'text-primary' : 'text-slate-500'}`} />
                    <span className="truncate">{t.name}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onDuplicateTemplate(t.id); }} className={`p-1 rounded ${activeTemplateId === t.id ? 'hover:bg-primary/20' : 'hover:bg-white/20'}`} title="Duplicate">
                        <Copy className="w-3 h-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteTemplate(t.id); }} className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded" title="Delete">
                        <Trash2 className="w-3 h-3" />
                    </button>
                    </div>
                </div>
                ))}
              </div>
          )}
        </div>

        <div className="h-px bg-white/10 mx-2"></div>

        {/* Results Section */}
        <div>
           <SectionHeader 
            title="Past Interviews" 
            isOpen={isResultsOpen} 
            onToggle={() => setIsResultsOpen(!isResultsOpen)}
           />

           {isResultsOpen && (
               <div className="space-y-1 pl-2">
                {results.length === 0 && <p className="text-xs text-slate-400 italic px-2 py-1">No interviews conducted.</p>}
                {results.map(r => (
                <button
                    key={r.id}
                    onClick={() => onSelectResult(r.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer transition-all duration-200 text-left ${
                    activeResultId === r.id && viewMode === 'EXECUTION' ? 'bg-white/10 text-accent font-medium shadow-md border-l-2 border-accent' : 'hover:bg-white/5 text-slate-300 hover:text-white'
                    }`}
                >
                    <History className={`w-4 h-4 ${activeResultId === r.id && viewMode === 'EXECUTION' ? 'text-accent' : 'text-slate-500'}`} />
                    <div className="truncate flex-1">
                    <div className="truncate">{r.candidateName}</div>
                    <div className="text-[10px] opacity-60 truncate">{r.templateName}</div>
                    </div>
                </button>
                ))}
            </div>
           )}
        </div>
      </div>
      
      <div className="p-4 border-t border-white/10 bg-black/20 space-y-2">
           <button 
            onClick={() => setViewMode('STATISTICS')}
            className={`w-full flex items-center gap-2 p-2 rounded text-sm transition ${viewMode === 'STATISTICS' ? 'bg-accent text-primary font-medium' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
              <BarChart3 className="w-4 h-4" />
              <span>Statistics</span>
          </button>
          <button 
            onClick={() => setViewMode('SETTINGS')}
            className={`w-full flex items-center gap-2 p-2 rounded text-sm transition ${viewMode === 'SETTINGS' ? 'bg-accent text-primary font-medium' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
              <Settings className="w-4 h-4" />
              <span>Global Settings</span>
          </button>
      </div>
    </div>
  );
};