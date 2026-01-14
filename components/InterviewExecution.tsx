import React, { useState, useMemo } from 'react';
import { InterviewTemplate, InterviewResult, AnswerData, QuestionResult, AppSettings, DirectFeedback, IndirectFeedback, RecruitmentRun } from '../types';
import { FEEDBACK_COLORS, CUSTOM_FEEDBACK_COLOR } from '../constants';
import { generateId, exportToYaml, downloadFile, formatDate } from '../utils';
import { Download, User, FileText, X, PieChart, Layers, Clock } from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useToast } from './Toast';

interface InterviewExecutionProps {
  template?: InterviewTemplate;
  existingResult?: InterviewResult;
  onSaveResult: (result: InterviewResult) => void;
  readOnly?: boolean;
  settings: AppSettings;
  runs?: RecruitmentRun[];
}

// Shadcn-like Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg ring-1 ring-black/5">
        <p className="mb-2 text-xs font-semibold uppercase text-gray-500 tracking-wider">{label}</p>
        <div className="flex flex-col gap-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm font-medium">
              <span 
                className="block h-2 w-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="ml-auto font-bold text-gray-900">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const InterviewExecution: React.FC<InterviewExecutionProps> = ({ template, existingResult, onSaveResult, readOnly = false, settings, runs = [] }) => {
  // State initialization
  const [candidateName, setCandidateName] = useState(existingResult?.candidateName || '');
  const [summary, setSummary] = useState(existingResult?.summary || '');
  const [recruitmentRunId, setRecruitmentRunId] = useState<string | null>(existingResult?.recruitmentRunId || null);
  const { showToast } = useToast();
  
  const [answers, setAnswers] = useState<Record<string, AnswerData>>(() => {
      const initial: Record<string, AnswerData> = {};
      if (existingResult) {
          existingResult.questions.forEach(q => {
              if (q.answer) {
                  initial[q.id] = q.answer;
              }
          });
      }
      return initial;
  });

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const currentTemplate = useMemo(() => {
    if (template) return template;
    
    if (existingResult) {
       return {
           id: 'snapshot',
           name: existingResult.templateName,
           createdAt: existingResult.date,
           categories: existingResult.categories,
           questions: existingResult.questions.map(({ answer, ...rest }) => rest)
       } as InterviewTemplate;
    }

    return { 
      id: '', 
      name: 'Unknown Template', 
      questions: [], 
      categories: [], 
      createdAt: '' 
    } as InterviewTemplate;
  }, [template, existingResult]);

  const activeQuestion = useMemo(() => 
    currentTemplate.questions.find(q => q.id === activeQuestionId), 
  [activeQuestionId, currentTemplate]);

  const calculateScore = () => {
    let total = 0;
    let max = 0;

    currentTemplate.questions.forEach(q => {
      const maxQScore = 100 * q.multiplier; // 100 is max raw score
      max += maxQScore;

      const answer = answers[q.id];
      if (answer) {
        total += answer.score;
      }
    });

    return { total, max, percentage: max > 0 ? (total / max) * 100 : 0 };
  };

  const scoreStats = useMemo(calculateScore, [answers, currentTemplate]);

  // --- Statistics Data Calculation ---
  const statsData = useMemo(() => {
    // 1. Radar Data: Proficiency per category
    const radarData = currentTemplate.categories.map(cat => {
        const catQuestions = currentTemplate.questions.filter(q => q.categoryId === cat.id);
        let catScore = 0;
        let catMax = 0;
        catQuestions.forEach(q => {
            catMax += 100 * q.multiplier;
            const ans = answers[q.id];
            if (ans) catScore += ans.score;
        });
        const proficiency = catMax > 0 ? Math.round((catScore / catMax) * 100) : 0;
        return {
            subject: cat.name,
            proficiency: proficiency,
            fullMark: 100
        };
    });

    // 2. Area Data: Question Scores
    const areaData = currentTemplate.questions
        .sort((a,b) => {
             // Sort by Category order then Question order
             const catA = currentTemplate.categories.find(c => c.id === a.categoryId)?.order || 0;
             const catB = currentTemplate.categories.find(c => c.id === b.categoryId)?.order || 0;
             return catA - catB || a.order - b.order;
        })
        .map((q, idx) => {
            const max = 100 * q.multiplier;
            const score = answers[q.id]?.score || 0;
            return {
                name: `Q${idx + 1}`,
                shortText: q.text.substring(0, 15) + '...',
                score: score,
                missed: max - score,
                max: max
            };
        });

    return { radarData, areaData };
  }, [answers, currentTemplate]);


  const handleFeedback = (qId: string, label: string, score: number, isCustom: boolean = false) => {
    if (readOnly) return;
    
    const question = currentTemplate.questions.find(q => q.id === qId);
    if (!question) return;

    const newAnswer: AnswerData = {
      feedback: label,
      score: score * question.multiplier,
      isCustom
    };

    const newAnswers = { ...answers, [qId]: newAnswer };
    setAnswers(newAnswers);
    setActiveQuestionId(null);
  };

  const constructResult = (): InterviewResult => {
      const questionResults: QuestionResult[] = currentTemplate.questions.map(q => ({
          ...q,
          answer: answers[q.id]
      }));

      return {
          id: existingResult?.id || generateId(),
          recruitmentRunId: recruitmentRunId || undefined,
          templateName: currentTemplate.name,
          candidateName,
          date: existingResult?.date || new Date().toISOString(),
          completedAt: new Date().toISOString(),
          categories: currentTemplate.categories,
          questions: questionResults,
          totalScore: scoreStats.total,
          maxPossibleScore: scoreStats.max,
          summary: summary
      };
  };

  const handleFinishClick = () => {
    if (!candidateName.trim()) {
      showToast("Please enter candidate name", 'error');
      return;
    }
    setShowFinishModal(true);
  };

  const handleConfirmSave = () => {
      onSaveResult(constructResult());
      setShowFinishModal(false);
  };

  const handleExport = () => {
    if (!existingResult && !candidateName) return;
    const resultToExport = existingResult || constructResult();
    const yamlStr = exportToYaml(resultToExport);
    downloadFile(yamlStr, `${candidateName.replace(/\s+/g, '_')}_interview.yaml`, 'text/yaml');
  };

  const getFeedbackColor = (feedback: string, isCustom?: boolean) => {
    if (isCustom) return CUSTOM_FEEDBACK_COLOR;
    for (const key of Object.keys(settings.direct)) {
        if (settings.direct[key as DirectFeedback].label === feedback) {
            return FEEDBACK_COLORS[key] || 'bg-gray-100';
        }
    }
    for (const key of Object.keys(settings.indirect)) {
        if (settings.indirect[key as IndirectFeedback].label === feedback) {
            return FEEDBACK_COLORS[key] || 'bg-gray-100';
        }
    }
    return CUSTOM_FEEDBACK_COLOR;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Header */}
      <div className="px-8 py-5 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between z-10">
        <div>
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">
             <span>{readOnly ? 'Viewing Result' : 'Conducting Interview'}</span>
             <span>•</span>
             <span>{currentTemplate.name}</span>
          </div>
          {readOnly ? (
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{candidateName}</h1>
                {existingResult?.completedAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Completed: {formatDate(existingResult.completedAt)}</span>
                    </div>
                )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Candidate Name"
                    className="text-2xl font-bold text-gray-900 border-b border-transparent focus:border-primary focus:outline-none placeholder-gray-300 bg-transparent transition-colors"
                />
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 font-semibold uppercase">Total Score</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">{scoreStats.total.toFixed(1)}</span>
                    <span className="text-sm text-gray-400 font-medium">/ {scoreStats.max} <span className="text-gray-300">|</span> {scoreStats.percentage.toFixed(0)}%</span>
                </div>
            </div>
            
            <div className="h-10 w-px bg-gray-200"></div>

            {readOnly ? (
               <div className="flex gap-2">
                   <button onClick={() => setShowFinishModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 transition font-medium text-sm">
                        <PieChart className="w-4 h-4" /> View Statistics
                   </button>
                   <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 transition font-medium text-sm">
                        <Download className="w-4 h-4" /> Export Result
                   </button>
               </div>
            ) : (
                <button onClick={handleFinishClick} className="px-6 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary/90 font-medium transition text-sm">
                    Finish & Save
                </button>
            )}
        </div>
      </div>

      {/* Main Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-8">
        <div className="flex gap-6 h-full min-w-max pb-4">
            {currentTemplate.categories.sort((a,b) => a.order - b.order).map((cat, catIdx) => {
                const catQuestions = currentTemplate.questions.filter(q => q.categoryId === cat.id).sort((a,b) => a.order - b.order);
                const answeredCount = catQuestions.filter(q => answers[q.id]).length;

                // Category Score Calculation
                let catScore = 0;
                let catMax = 0;
                catQuestions.forEach(q => {
                   catMax += 100 * q.multiplier;
                   const ans = answers[q.id];
                   if(ans) catScore += ans.score;
                });
                
                const catPercentage = catMax > 0 ? (catScore / catMax) * 100 : 0;

                return (
                    <div key={cat.id} className="w-80 flex flex-col h-full bg-gray-100/50 rounded-xl border border-gray-200/80 overflow-hidden animate-slide-up" style={{ animationDelay: `${catIdx * 0.1}s` }}>
                        <div className="p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-gray-800">{cat.name}</h3>
                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-bold uppercase tracking-wide">{answeredCount} / {catQuestions.length}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-xs text-gray-400 font-medium">Score</span>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-primary">{catScore.toFixed(0)}</span>
                                    <span className="text-[10px] text-gray-400"> / {catMax}</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-accent h-full rounded-full transition-all duration-500" style={{ width: `${catPercentage}%` }}></div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {catQuestions.map(q => {
                                const answer = answers[q.id];
                                return (
                                    <div 
                                        key={q.id} 
                                        onClick={() => !readOnly && setActiveQuestionId(q.id)}
                                        className={`p-4 rounded-lg bg-white border shadow-sm transition-all duration-200 relative animate-fade-in ${
                                            !readOnly ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30' : ''
                                        } ${answer ? 'border-l-4 ' + (answer.score > 0 ? 'border-l-success' : 'border-l-danger') : 'border-gray-200'}`}
                                    >
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${q.type === 'DIRECT' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                                {q.type}
                                            </span>
                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono font-bold">
                                                x{q.multiplier}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-800 leading-relaxed">{q.text}</p>
                                        
                                        {answer && (
                                            <div className={`mt-3 text-xs px-2 py-1 rounded border inline-block font-bold ${getFeedbackColor(answer.feedback, answer.isCustom)}`}>
                                                {answer.feedback}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Feedback Modal */}
      {activeQuestion && !readOnly && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-slide-up">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Rate Candidate's Answer</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{activeQuestion.text}</p>
                </div>
                <div className="p-6 flex flex-col gap-3">
                    {/* Standard Feedbacks */}
                    <div className="grid grid-cols-2 gap-3">
                        {activeQuestion.type === 'DIRECT' ? (
                             Object.keys(settings.direct).map((key) => {
                                 const s = settings.direct[key as DirectFeedback];
                                 return (
                                     <FeedbackButton 
                                        key={key} 
                                        onClick={() => handleFeedback(activeQuestion.id, s.label, s.score)} 
                                        label={s.label} 
                                        color={FEEDBACK_COLORS[key] || 'bg-gray-100'} 
                                     />
                                 );
                             })
                        ) : (
                            Object.keys(settings.indirect).map((key) => {
                                 const s = settings.indirect[key as IndirectFeedback];
                                 return (
                                     <FeedbackButton 
                                        key={key} 
                                        onClick={() => handleFeedback(activeQuestion.id, s.label, s.score)} 
                                        label={s.label} 
                                        color={FEEDBACK_COLORS[key] || 'bg-gray-100'} 
                                     />
                                 );
                             })
                        )}
                    </div>

                    {/* Custom Feedbacks */}
                    {activeQuestion.customFeedbacks && activeQuestion.customFeedbacks.length > 0 && (
                        <>
                            <div className="flex items-center gap-2 mt-2 mb-1">
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Custom</span>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {activeQuestion.customFeedbacks.map(f => (
                                    <FeedbackButton 
                                        key={f.id}
                                        onClick={() => handleFeedback(activeQuestion.id, f.label, f.score, true)}
                                        label={f.label}
                                        sub={`Score: ${f.score}`}
                                        color={CUSTOM_FEEDBACK_COLOR}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <div className="bg-gray-50 p-4 flex justify-end border-t border-gray-100">
                    <button onClick={() => setActiveQuestionId(null)} className="text-gray-500 hover:text-gray-700 font-medium text-sm px-3 py-1 rounded hover:bg-gray-200 transition">Cancel</button>
                </div>
            </div>
        </div>
      )}

      {/* Finish/Statistics Modal */}
      {showFinishModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100 animate-slide-up">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                             <PieChart className="w-5 h-5 text-accent" />
                             {readOnly ? 'Interview Analysis' : 'Finish Interview'}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">Statistics & Summary</p>
                      </div>
                      <button onClick={() => setShowFinishModal(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 bg-white">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                          {/* Left: Radar Chart (Proficiency) */}
                          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col">
                              <h4 className="text-sm font-bold text-gray-600 mb-6 uppercase tracking-wide text-center">Category Proficiency</h4>
                              <div className="w-full h-[400px] relative">
                                  {statsData.radarData.length > 2 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={statsData.radarData}>
                                            <PolarGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                                            <PolarAngleAxis 
                                                dataKey="subject" 
                                                tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }} 
                                            />
                                            <PolarRadiusAxis 
                                                angle={30} 
                                                domain={[0, 100]} 
                                                tick={false} 
                                                axisLine={false} 
                                            />
                                            <Radar
                                                name="Proficiency"
                                                dataKey="proficiency"
                                                stroke="#144346"
                                                strokeWidth={2}
                                                fill="#144346"
                                                fillOpacity={0.2}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-lg">
                                        Not enough categories for radar chart (Need 3+)
                                    </div>
                                  )}
                              </div>
                          </div>

                          {/* Right: Stacked Area Chart (Detailed Scores) */}
                          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col">
                              <h4 className="text-sm font-bold text-gray-600 mb-6 uppercase tracking-wide text-center">Detailed Question Scores</h4>
                              <div className="w-full h-[400px]">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart
                                          data={statsData.areaData}
                                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                      >
                                          <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#144346" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#144346" stopOpacity={0.1}/>
                                            </linearGradient>
                                          </defs>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                          <XAxis 
                                            dataKey="name" 
                                            tick={{ fontSize: 11, fill: '#94a3b8' }} 
                                            axisLine={false} 
                                            tickLine={false}
                                            dy={10} 
                                          />
                                          <YAxis 
                                            tick={{ fontSize: 11, fill: '#94a3b8' }} 
                                            axisLine={false} 
                                            tickLine={false} 
                                          />
                                          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                                          <Area 
                                            type="monotone" 
                                            dataKey="score" 
                                            stackId="1" 
                                            stroke="#144346" 
                                            fill="url(#colorScore)" 
                                            name="Obtained"
                                            strokeWidth={2}
                                          />
                                          <Area 
                                            type="monotone" 
                                            dataKey="missed" 
                                            stackId="1" 
                                            stroke="#cbd5e1" 
                                            fill="#f1f5f9" 
                                            name="Missed" 
                                          />
                                          <Legend 
                                            verticalAlign="top" 
                                            height={36} 
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: '12px', color: '#64748b' }} 
                                          />
                                      </AreaChart>
                                  </ResponsiveContainer>
                              </div>
                          </div>
                      </div>

                      <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                           {readOnly && recruitmentRunId && (
                              <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 flex items-center gap-2">
                                   <Layers className="w-4 h-4" />
                                   <span className="font-bold">Recruitment Run:</span>
                                   <span>{runs.find(r => r.id === recruitmentRunId)?.name || 'Unknown Run'}</span>
                              </div>
                          )}

                           {/* Recruitment Run Selection */}
                          {(!readOnly || isEditing) && runs.length > 0 && (
                              <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6 shadow-sm">
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Recruitment Run (Optional)</label>
                                  <select
                                      value={recruitmentRunId || ''}
                                      onChange={(e) => setRecruitmentRunId(e.target.value || null)}
                                      disabled={readOnly && !isEditing}
                                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm disabled:bg-gray-100 disabled:text-gray-500"
                                  >
                                      <option value="">-- Select a Run --</option>
                                      {runs.filter(r => r.status === 'ACTIVE' || r.id === recruitmentRunId).map(run => (
                                          <option key={run.id} value={run.id}>{run.name}</option>
                                      ))}
                                  </select>
                              </div>
                          )}

                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-4 h-4 text-primary" />
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                {readOnly && !isEditing ? 'Candidate Summary' : 'Summary & Notes'}
                            </h4>
                          </div>
                          <textarea 
                              value={summary}
                              onChange={(e) => (!readOnly || isEditing) && setSummary(e.target.value)}
                              readOnly={readOnly && !isEditing}
                              placeholder={readOnly && !isEditing ? "No summary provided." : "Write your summary here..."}
                              rows={5}
                              className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none text-sm leading-relaxed ${readOnly && !isEditing ? 'bg-transparent border-transparent px-0 font-medium text-gray-700' : 'bg-white border-gray-300 text-gray-900 shadow-sm'}`}
                          />
                      </div>
                  </div>

                  <div className="bg-gray-50 p-6 flex justify-end border-t border-gray-200 gap-3">
                      {readOnly && !isEditing && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="mr-auto text-primary font-medium text-sm hover:underline"
                          >
                              Edit Details
                          </button>
                      )}
                      
                      <button 
                        onClick={() => {
                            if (isEditing) {
                                setIsEditing(false);
                            }
                            setShowFinishModal(false);
                        }} 
                        className="text-gray-600 hover:text-gray-900 font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-gray-200 transition"
                      >
                          {readOnly && !isEditing ? 'Close' : 'Cancel'}
                      </button>

                      {(!readOnly || isEditing) && (
                          <button 
                            onClick={() => {
                                handleConfirmSave();
                                if (isEditing) setIsEditing(false);
                            }} 
                            className="bg-primary text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-lg shadow-primary/30 hover:bg-primary/90 transition transform hover:-translate-y-0.5"
                          >
                              {readOnly ? 'Save Changes' : 'Save Result'}
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

interface FeedbackButtonProps {
    onClick: () => void;
    label: string;
    sub?: string;
    color: string;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({ onClick, label, sub, color }) => (
    <button onClick={onClick} className={`py-3 px-3 rounded-lg border font-medium text-sm transition transform active:scale-[0.98] hover:shadow-sm flex flex-col items-center justify-center text-center h-full ${color}`}>
        <span className="leading-tight">{label}</span>
        {sub && <span className="text-[10px] opacity-70 mt-1 font-bold">{sub}</span>}
    </button>
);