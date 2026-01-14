import React, { useState, useEffect } from 'react';
import { RecruitmentRun, InterviewResult } from '../types';
import { GlobalStatistics } from './GlobalStatistics';
import { exportToYaml, downloadFile } from '../utils';
import { Download, Calendar, Save, Trash2, Clock, BarChart3 } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

interface RunDetailsProps {
  run: RecruitmentRun;
  results: InterviewResult[]; // These should be already filtered by the parent
  onUpdateRun: (run: RecruitmentRun) => void;
  onDeleteRun: (id: string) => void;
  onSelectResult?: (id: string) => void;
}

export const RunDetails: React.FC<RunDetailsProps> = ({ run, results, onUpdateRun, onDeleteRun, onSelectResult }) => {
  const [name, setName] = useState(run.name);
  const [description, setDescription] = useState(run.description || '');
  const [startDate, setStartDate] = useState(run.startDate);
  const [endDate, setEndDate] = useState(run.endDate || '');
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'TIMELINE'>('ANALYTICS');

  // Sync local state when run prop changes (switching between runs)
  useEffect(() => {
    setName(run.name);
    setDescription(run.description || '');
    setStartDate(run.startDate);
    setEndDate(run.endDate || '');
    setIsDirty(false);
    setActiveTab('ANALYTICS'); // Reset tab on run switch
  }, [run.id]);

  const handleSave = () => {
    onUpdateRun({
        ...run,
        name,
        description,
        startDate,
        endDate: endDate || undefined
    });
    setIsDirty(false);
  };

  const handleExport = () => {
    // Export Run Meta + Results
    const exportData = {
        runInfo: run,
        results: results
    };
    const yamlStr = exportToYaml(exportData);
    downloadFile(yamlStr, `Run_${run.name.replace(/\s+/g, '_')}.yaml`, 'text/yaml');
  };

  const calendarEvents = results.map(r => ({
      id: r.id,
      title: r.candidateName,
      date: r.date.split('T')[0],
      backgroundColor: '#144346',
      borderColor: 'transparent',
      extendedProps: { score: r.totalScore }
  }));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <style>{`
            .fc .fc-toolbar-title { font-size: 0.9rem; font-weight: 700; color: #1e293b; }
            @media (min-width: 768px) { .fc .fc-toolbar-title { font-size: 1rem; } }
            .fc .fc-button { font-size: 0.7rem; padding: 0.2rem 0.4rem; }
            @media (min-width: 768px) { .fc .fc-button { font-size: 0.75rem; padding: 0.25rem 0.5rem; } }
            .fc .fc-button-primary { background-color: #ffffff; color: #475569; border-color: #e2e8f0; font-weight: 500; text-transform: capitalize; }
            .fc .fc-button-primary:hover { background-color: #f8fafc; border-color: #cbd5e1; color: #1e293b; }
            .fc .fc-button-primary:not(:disabled).fc-button-active { background-color: #f1f5f9; border-color: #cbd5e1; color: #0f172a; }
            .fc-daygrid-day-number { font-size: 0.7rem; color: #64748b; padding: 2px; }
            @media (min-width: 768px) { .fc-daygrid-day-number { font-size: 0.75rem; padding: 4px; } }
            .fc-event { border-radius: 2px; font-size: 0.65rem; padding: 0px 1px; }
            @media (min-width: 768px) { .fc-event { font-size: 0.7rem; padding: 1px 2px; } }
      `}</style>

      {/* Header / Editor */}
      <div className="bg-white border-b border-gray-200 shadow-sm z-10 shrink-0">
        <div className="px-4 md:px-8 py-4 md:py-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1 w-full max-w-2xl">
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
                        className="text-xl md:text-2xl font-bold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none w-full bg-transparent transition-colors mb-1 md:mb-2"
                        placeholder="Run Name"
                    />
                    <textarea 
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); setIsDirty(true); }}
                        rows={1}
                        className="w-full text-xs md:text-sm text-gray-600 border-none focus:ring-0 resize-none bg-transparent placeholder-gray-400 p-0"
                        placeholder="Add a description..."
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {isDirty && (
                        <button onClick={handleSave} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition shadow-sm font-medium text-xs md:text-sm animate-fade-in">
                            <Save className="w-4 h-4" /> Save
                        </button>
                    )}
                    <button onClick={handleExport} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition shadow-sm font-medium text-xs md:text-sm">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => onDeleteRun(run.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition" title="Delete Run">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs md:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="flex items-center gap-1.5">
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setIsDirty(true); }}
                            className="bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 md:px-2 md:py-1 focus:ring-1 focus:ring-primary outline-none text-[10px] md:text-sm"
                        />
                        <span className="text-gray-400 text-[10px] md:text-xs">to</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setIsDirty(true); }}
                            className="bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 md:px-2 md:py-1 focus:ring-1 focus:ring-primary outline-none text-[10px] md:text-sm"
                        />
                    </div>
                </div>
                <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
                <div className="font-medium text-gray-500">
                    {results.length} Interviews Conducted
                </div>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-4 md:px-8 gap-4 md:gap-6 border-t border-gray-100 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveTab('ANALYTICS')}
                className={`flex items-center gap-2 py-2.5 md:py-3 text-[10px] md:text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === 'ANALYTICS' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
                <BarChart3 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                Analytics
            </button>
            <button 
                onClick={() => setActiveTab('TIMELINE')}
                className={`flex items-center gap-2 py-2.5 md:py-3 text-[10px] md:text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === 'TIMELINE' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
                <Clock className="w-3.5 md:w-4 h-3.5 md:h-4" />
                Timeline
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
           {activeTab === 'TIMELINE' ? (
               <div className="h-full p-3 md:p-6 overflow-hidden flex flex-col bg-white">
                   <div className="flex-1 border rounded-lg md:rounded-xl overflow-hidden bg-white shadow-sm p-2 md:p-4 min-h-0">
                       <FullCalendar
                            plugins={[ dayGridPlugin, interactionPlugin ]}
                            initialView="dayGridMonth"
                            events={calendarEvents}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth'
                            }}
                            height="100%"
                            initialDate={startDate} 
                            eventClick={(info) => onSelectResult && onSelectResult(info.event.id)}
                       />
                   </div>
               </div>
           ) : (
               <div className="h-full overflow-y-auto">
                   <GlobalStatistics 
                        results={results} 
                        onSelectResult={onSelectResult}
                        title={`${run.name} Statistics`}
                        runInfo={{
                            name: run.name,
                            dates: `${new Date(run.startDate).toLocaleDateString()} - ${run.endDate ? new Date(run.endDate).toLocaleDateString() : 'Ongoing'}`
                        }}
                   />
               </div>
           )}
      </div>
    </div>
  );
};