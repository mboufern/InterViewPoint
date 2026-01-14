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
import { DEFAULT_SETTINGS } from './constants';
import { ToastProvider, useToast } from './components/Toast';
import { ConfirmProvider, useConfirm } from './components/ConfirmModal';

import { Menu } from 'lucide-react';

import { OnboardingTour } from './components/OnboardingTour';

const AppContent: React.FC = () => {
  // --- Hooks ---
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // --- State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [runTour, setRunTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('ivp_tour_completed');
    if (!tourCompleted) {
      setRunTour(true);
    }
  }, []);

  const handleTourFinish = () => {
    setRunTour(false);
    setTourStep(0);
    localStorage.setItem('ivp_tour_completed', 'true');
  };
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [runs, setRuns] = useState<RecruitmentRun[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('EDITOR');
const defaultTemplate: InterviewTemplate = {
          id: generateId(), // Or generateId() if you prefer dynamic IDs
          name: 'New Entry Level Internship Interview',
          createdAt: new Date().toISOString(),
          categories: [
              { id: 'cat_intro_01', name: 'Introduction & Interest', order: 0 },
              { id: 'cat_basics_02', name: 'General Web Concepts', order: 1 },
              { id: 'cat_collab_03', name: 'Collaboration & Learning', order: 2 },
              { id: 'cat_backend_04', name: 'Backend Basics (NestJS)', order: 3 },
              { id: 'cat_frontend_05', name: 'Frontend Basics (React)', order: 4 },
          ],
          questions: [
              // --- Introduction & Interest ---
              {
                  id: 'q_intro_01',
                  text: 'Tell us about yourself and what made you interested in applying for this specific internship?',
                  type: 'DIRECT',
                  multiplier: 1,
                  categoryId: 'cat_intro_01',
                  order: 0,
                  customFeedbacks: []
              },
              {
                  id: 'q_intro_02',
                  text: 'What was your favorite course or subject at school so far and why?',
                  type: 'DIRECT',
                  multiplier: 1,
                  categoryId: 'cat_intro_01',
                  order: 1,
                  customFeedbacks: []
              },

              // --- General Web Concepts ---
              {
                  id: 'q_web_01',
                  text: 'In your own words, what is the difference between Frontend and Backend?',
                  type: 'DIRECT',
                  multiplier: 1,
                  categoryId: 'cat_basics_02',
                  order: 0,
                  customFeedbacks: []
              },
              {
                  id: 'q_web_02',
                  text: 'Have you used Git or GitHub before? How do you save your code?',
                  type: 'DIRECT',
                  multiplier: 1,
                  categoryId: 'cat_basics_02',
                  order: 1,
                  customFeedbacks: []
              },
              {
                  id: 'q_web_03',
                  text: 'What is an API and why do we need them?',
                  type: 'DIRECT',
                  multiplier: 1,
                  categoryId: 'cat_basics_02',
                  order: 2,
                  customFeedbacks: []
              },

              // --- Collaboration & Learning ---
              {
                  id: 'q_collab_01',
                  text: 'Tell me about a school project where you worked with other students. How did you split the work?',
                  type: 'INDIRECT',
                  multiplier: 1,
                  categoryId: 'cat_collab_03',
                  order: 0,
                  customFeedbacks: []
              },
              {
                  id: 'q_collab_02',
                  text: 'When you get an error in your code that you don\'t understand, what is the first thing you do?',
                  type: 'DIRECT',
                  multiplier: 1,
                  categoryId: 'cat_collab_03',
                  order: 1,
                  customFeedbacks: []
              },

              // --- Backend Basics (NestJS) ---
              {
                  id: 'q_back_01',
                  text: 'Why should we use TypeScript instead of normal JavaScript? What are the benefits?',
                  type: 'DIRECT',
                  multiplier: 1,
                  categoryId: 'cat_backend_04',
                  order: 0,
                  customFeedbacks: []
              },
              {
                  id: 'q_back_02',
                  text: 'In NestJS (or any backend framework), what is the role of a "Controller"?',
                  type: 'DIRECT',
                  multiplier: 1,
                  categoryId: 'cat_backend_04',
                  order: 1,
                  customFeedbacks: []
              },
              {
                  id: 'q_back_03',
                  text: 'Do you know what a Database ORM is (like Prisma or TypeORM)? Why do we use it?',
                  type: 'DIRECT',
                  multiplier: 1,
                  categoryId: 'cat_backend_04',
                  order: 2,
                  customFeedbacks: []
              },

              // --- Frontend Basics (React) ---
              {
                  id: 'q_front_01',
                  text: 'What is a "Component" in React? Can you give a simple example?',
                  type: 'DIRECT',
                  multiplier: 1,
                  categoryId: 'cat_frontend_05',
                  order: 0,
                  customFeedbacks: []
              },
              {
                  id: 'q_front_02',
                  text: 'What is the difference between "State" and "Props"?',
                  type: 'DIRECT',
                  multiplier: 2,
                  categoryId: 'cat_frontend_05',
                  order: 1,
                  customFeedbacks: []
              },
              {
                  id: 'q_front_03',
                  text: 'How do you create a variable that changes (like a counter) in React? (Hint: useState)',
                  type: 'DIRECT',
                  multiplier: 1,
                  categoryId: 'cat_frontend_05',
                  order: 2,
                  customFeedbacks: []
              },
              {
                  id: 'q_front_04',
                  text: 'If you want to fetch data from an API when the page loads, which React Hook would you use?',
                  type: 'DIRECT',
                  multiplier: 1,
                  categoryId: 'cat_frontend_05',
                  order: 3,
                  customFeedbacks: []
              }
          ]
      };
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
    setIsSidebarOpen(false);
    showToast('New template created', 'success');
    
    // Advance tour step with a delay to allow Editor to render
    if (runTour && tourStep === 0) {
        setTimeout(() => setTourStep(1), 500);
    }
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

  const handleCategoryAdded = () => {
    if (runTour && tourStep === 2) {
        setTimeout(() => setTourStep(3), 400);
    }
  };

  const handleQuestionAdded = () => {
    if (runTour && tourStep === 3) {
        setTimeout(() => setTourStep(4), 400);
    }
  };

  const handleStartInterview = () => {
    if (!activeTemplateId) return;
    setViewMode('EXECUTION');
    setActiveResultId(null); // New result
    setActiveRunId(null);
    setIsSidebarOpen(false);

    if (runTour && tourStep === 5) {
        handleTourFinish();
    }
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
    setIsSidebarOpen(false);
    showToast('New recruitment run created', 'success');
  };

  const handleSelectRun = (id: string) => {
      setActiveRunId(id);
      setViewMode('RUN_DETAILS');
      setActiveTemplateId(null);
      setActiveResultId(null);
      setIsSidebarOpen(false);
  };

  const handleSelectResult = (id: string) => {
      setActiveResultId(id);
      setViewMode('EXECUTION');
      setActiveTemplateId(null);
      setActiveRunId(null);
      setIsSidebarOpen(false);
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
    <div className="flex h-screen w-full bg-white font-sans text-slate-900 relative">
      <OnboardingTour 
        runTour={runTour} 
        onTourFinish={handleTourFinish} 
        stepIndex={tourStep}
        setStepIndex={setTourStep}
      />
      <Sidebar
        templates={templates}
        results={results}
        runs={runs}
        activeTemplateId={activeTemplateId}
        activeResultId={activeResultId}
        activeRunId={activeRunId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectTemplate={(id) => { setActiveTemplateId(id); setViewMode('EDITOR'); setActiveResultId(null); setActiveRunId(null); setIsSidebarOpen(false); }}
        onSelectResult={handleSelectResult}
        onSelectRun={handleSelectRun}
        onCreateTemplate={handleCreateTemplate}
        onCreateRun={handleCreateRun}
        onImport={handleImport}
        onDeleteTemplate={handleDeleteTemplate}
        onDeleteRun={handleDeleteRun}
        onDuplicateTemplate={handleDuplicateTemplate}
        viewMode={viewMode}
        setViewMode={(mode) => { setViewMode(mode); setIsSidebarOpen(false); }}
      />

      <main className="flex-1 h-full overflow-hidden relative flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center gap-3 shadow-sm z-10 shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md">
                <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-lg text-primary">InterViewPoint</h1>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
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
            onCategoryAdded={handleCategoryAdded}
            onQuestionAdded={handleQuestionAdded}
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
        </div>
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
