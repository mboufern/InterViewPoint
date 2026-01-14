import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { InterviewEditor } from './components/InterviewEditor';
import { InterviewExecution } from './components/InterviewExecution';
import { SettingsEditor } from './components/SettingsEditor';
import { GlobalStatistics } from './components/GlobalStatistics';
import { RunDetails } from './components/RunDetails';
import { CalendarView } from './components/CalendarView';
import { InterviewTemplate, InterviewResult, ViewMode, AppSettings, RecruitmentRun } from './types';
import { generateId } from './utils';
import { INITIAL_CATEGORIES, DEFAULT_SETTINGS } from './constants';
import { ToastProvider, useToast } from './components/Toast';
import { ConfirmProvider, useConfirm } from './components/ConfirmModal';

const AppContent: React.FC = () => {
  // --- Hooks ---
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // --- State ---
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [runs, setRuns] = useState<RecruitmentRun[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('EDITOR');

  // --- Persistence ---
  useEffect(() => {
    const storedTemplates = localStorage.getItem('ivp_templates');
    const storedResults = localStorage.getItem('ivp_results');
    const storedSettings = localStorage.getItem('ivp_settings');
    const storedRuns = localStorage.getItem('ivp_runs');
    
    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    } else {
        // Create a default demo template if empty
        const defaultTemplate: InterviewTemplate = {
            id: generateId(),
            name: 'Full Stack Developer Internship',
            createdAt: new Date().toISOString(),
            categories: INITIAL_CATEGORIES,
            questions: [
                { id: 'q1', text: 'Explain the event loop in JavaScript.', type: 'DIRECT', multiplier: 1.5, categoryId: 'cat-2', order: 0 },
                { id: 'q2', text: 'How do you handle state management in a large React app?', type: 'INDIRECT', multiplier: 1.2, categoryId: 'cat-2', order: 1 },
                { id: 'q3', text: 'Difference between SQL and NoSQL?', type: 'DIRECT', multiplier: 1.0, categoryId: 'cat-3', order: 0 },
            ]
        };
        setTemplates([defaultTemplate]);
    }

    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }

    if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
    }

    if (storedRuns) {
        setRuns(JSON.parse(storedRuns));
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ivp_templates', JSON.stringify(templates));
    }
  }, [templates, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ivp_results', JSON.stringify(results));
    }
  }, [results, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ivp_settings', JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
        localStorage.setItem('ivp_runs', JSON.stringify(runs));
    }
  }, [runs, isLoaded]);


  // --- Handlers ---
  const handleCreateTemplate = () => {
    const newTemplate: InterviewTemplate = {
      id: generateId(),
      name: 'New Interview Template',
      createdAt: new Date().toISOString(),
      categories: [{ id: generateId(), name: 'General', order: 0 }],
      questions: []
    };
    setTemplates([...templates, newTemplate]);
    setActiveTemplateId(newTemplate.id);
    setViewMode('EDITOR');
    setActiveResultId(null);
    setActiveRunId(null);
    showToast('New template created', 'success');
  };

  const handleDeleteTemplate = async (id: string) => {
    if (await confirm({
        title: 'Delete Template',
        message: 'Are you sure? This will not delete past interview results based on this template.',
        variant: 'destructive',
        confirmLabel: 'Delete'
    })) {
        setTemplates(templates.filter(t => t.id !== id));
        if (activeTemplateId === id) setActiveTemplateId(null);
        showToast('Template deleted', 'info');
    }
  };

  const handleDuplicateTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
        const copy: InterviewTemplate = {
            ...template,
            id: generateId(),
            name: `${template.name} (Copy)`,
            questions: template.questions.map(q => ({...q, id: generateId(), customFeedbacks: q.customFeedbacks ? [...q.customFeedbacks] : []})),
            categories: template.categories.map(c => ({...c, id: generateId()})) 
        };
        // Fix category references
        const catMap: Record<string, string> = {};
        const newCats = template.categories.map(c => {
            const newId = generateId();
            catMap[c.id] = newId;
            return { ...c, id: newId };
        });
        const newQs = template.questions.map(q => ({
            ...q,
            id: generateId(),
            categoryId: catMap[q.categoryId]
        }));
        
        copy.categories = newCats;
        copy.questions = newQs;
        
        setTemplates([...templates, copy]);
        showToast('Template duplicated', 'success');
    }
  };

  const handleImport = (data: any) => {
    if (data.runInfo && Array.isArray(data.results)) {
         // Import Run + Results
        const run = data.runInfo as RecruitmentRun;
        // Check if run exists, if so update, else add
        const runExists = runs.some(r => r.id === run.id);
        if (runExists) {
             setRuns(runs.map(r => r.id === run.id ? run : r));
        } else {
             setRuns([...runs, run]);
        }
        
        // Merge results (avoid duplicates by ID)
        const newResults = [...results];
        data.results.forEach((r: InterviewResult) => {
            if (!newResults.some(nr => nr.id === r.id)) {
                newResults.push(r);
            }
        });
        setResults(newResults);
        showToast('Run and Results Imported Successfully', 'success');
    } else if (data.candidateName && Array.isArray(data.questions)) {
        const r = data as InterviewResult;
        r.id = generateId();
        setResults([...results, r]);
        showToast('Result Imported Successfully', 'success');
    } else if (data.categories && data.questions) {
        const t = data as InterviewTemplate;
        t.id = generateId(); 
        setTemplates([...templates, t]);
        showToast('Template Imported Successfully', 'success');
    } else {
        showToast('Unknown file format', 'error');
    }
  };

  const handleUpdateTemplate = (updated: InterviewTemplate) => {
    setTemplates(templates.map(t => t.id === updated.id ? updated : t));
  };

  const handleStartInterview = () => {
    if (!activeTemplateId) return;
    setViewMode('EXECUTION');
    setActiveResultId(null); // New result
    setActiveRunId(null);
  };

  const handleSaveResult = (result: InterviewResult) => {
    setResults(prevResults => {
      const exists = prevResults.some(r => r.id === result.id);
      if (exists) {
        return prevResults.map(r => r.id === result.id ? result : r);
      }
      return [result, ...prevResults];
    });
    setActiveResultId(result.id);
    showToast('Interview Saved!', 'success');
  };

  const handleSettingsSave = (newSettings: AppSettings) => {
    setSettings(newSettings);
    // Toast is handled in SettingsEditor now? No, App doesn't need to know unless we move logic up.
    // Actually, SettingsEditor calls onSave which updates state here. 
    // The alert "Settings saved successfully" was in SettingsEditor. I'll handle it there.
  };

  const handleCreateRun = () => {
    const newRun: RecruitmentRun = {
        id: generateId(),
        name: 'New Recruitment Run',
        startDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
    };
    setRuns([...runs, newRun]);
    setActiveRunId(newRun.id);
    setViewMode('RUN_DETAILS');
    setActiveTemplateId(null);
    setActiveResultId(null);
    showToast('New recruitment run created', 'success');
  };

  const handleSelectRun = (id: string) => {
      setActiveRunId(id);
      setViewMode('RUN_DETAILS');
      setActiveTemplateId(null);
      setActiveResultId(null);
  };

  const handleSelectResult = (id: string) => {
      setActiveResultId(id);
      setViewMode('EXECUTION');
      setActiveTemplateId(null);
      setActiveRunId(null);
  };

  const handleUpdateRun = (run: RecruitmentRun) => {
    setRuns(runs.map(r => r.id === run.id ? run : r));
  };

  const handleDeleteRun = async (id: string) => {
      if (await confirm({
          title: 'Delete Run',
          message: 'Delete this recruitment run? This will NOT delete the interview results, only the run organization.',
          variant: 'destructive',
          confirmLabel: 'Delete Run'
      })) {
          setRuns(runs.filter(r => r.id !== id));
          if (activeRunId === id) {
              setActiveRunId(null);
              setViewMode('EDITOR'); // Fallback
          }
          showToast('Recruitment run deleted', 'success');
      }
  };

  // --- Render ---
  const activeTemplate = templates.find(t => t.id === activeTemplateId);
  const activeResult = results.find(r => r.id === activeResultId);
  const activeRun = runs.find(r => r.id === activeRunId);

  return (
    <div className="flex h-screen w-full bg-white font-sans text-slate-900">
      <Sidebar
        templates={templates}
        results={results}
        runs={runs}
        activeTemplateId={activeTemplateId}
        activeResultId={activeResultId}
        activeRunId={activeRunId}
        onSelectTemplate={(id) => { setActiveTemplateId(id); setViewMode('EDITOR'); setActiveResultId(null); setActiveRunId(null); }}
        onSelectResult={handleSelectResult}
        onSelectRun={handleSelectRun}
        onCreateTemplate={handleCreateTemplate}
        onCreateRun={handleCreateRun}
        onImport={handleImport}
        onDeleteTemplate={handleDeleteTemplate}
        onDeleteRun={handleDeleteRun}
        onDuplicateTemplate={handleDuplicateTemplate}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <main className="flex-1 h-full overflow-hidden relative">
        {viewMode === 'SETTINGS' ? (
          <SettingsEditor settings={settings} onSave={handleSettingsSave} />
        ) : viewMode === 'STATISTICS' ? (
          <GlobalStatistics 
            results={results} 
            onSelectResult={handleSelectResult} 
          />
        ) : viewMode === 'CALENDAR' ? (
          <CalendarView 
            runs={runs} 
            results={results} 
            onSelectRun={handleSelectRun} 
          />
        ) : viewMode === 'RUN_DETAILS' && activeRun ? (
          <RunDetails 
            run={activeRun}
            results={results.filter(r => r.recruitmentRunId === activeRun.id)}
            onUpdateRun={handleUpdateRun}
            onDeleteRun={handleDeleteRun}
            onSelectResult={handleSelectResult}
          />
        ) : viewMode === 'EDITOR' && activeTemplate ? (
          <InterviewEditor 
            template={activeTemplate} 
            onUpdate={handleUpdateTemplate}
            onStartInterview={handleStartInterview}
          />
        ) : viewMode === 'EXECUTION' && (activeTemplate || activeResult) ? (
           <InterviewExecution
             key={activeResultId || activeTemplateId} 
             template={activeTemplate}
             existingResult={activeResult}
             onSaveResult={handleSaveResult}
             readOnly={!!activeResult}
             settings={settings}
             runs={runs}
           />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <p>Select a template to edit or start an interview.</p>
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AppContent />
      </ConfirmProvider>
    </ToastProvider>
  );
};

export default App;
