import React, { useRef } from 'react';
import { Plus, FileText, Download, Upload, Trash2, Copy, History, Settings, Briefcase, BarChart3 } from 'lucide-react';
import { InterviewTemplate, InterviewResult, ViewMode } from '../types';
import { parseYaml } from '../utils';

interface SidebarProps {
  templates: InterviewTemplate[];
  results: InterviewResult[];
  activeTemplateId: string | null;
  activeResultId: string | null;
  onSelectTemplate: (id: string) => void;
  onSelectResult: (id: string) => void;
  onCreateTemplate: () => void;
  onImport: (data: any) => void;
  onDeleteTemplate: (id: string) => void;
  onDuplicateTemplate: (id: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  templates,
  results,
  activeTemplateId,
  activeResultId,
  onSelectTemplate,
  onSelectResult,
  onCreateTemplate,
  onImport,
  onDeleteTemplate,
  onDuplicateTemplate,
  viewMode,
  setViewMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Templates Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase font-bold text-accent/70 tracking-wider">Templates</h2>
            <button 
                onClick={onCreateTemplate} 
                className="p-1 hover:bg-white/10 rounded text-accent hover:text-white transition" 
                title="Create New Template"
            >
                <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            {templates.length === 0 && <p className="text-xs text-slate-400 italic">No templates yet.</p>}
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
        </div>

        {/* Results Section */}
        <div className="p-4 border-t border-white/10">
           <h2 className="text-xs uppercase font-bold text-accent/70 tracking-wider mb-3">Past Interviews</h2>
           <div className="space-y-1">
            {results.length === 0 && <p className="text-xs text-slate-400 italic">No interviews conducted.</p>}
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