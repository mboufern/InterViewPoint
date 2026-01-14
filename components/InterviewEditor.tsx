import React, { useState } from 'react';
import { InterviewTemplate, Question, Category, QuestionType, CustomFeedback } from '../types';
import { generateId, exportToYaml, downloadFile } from '../utils';
import { Plus, X, GripVertical, Download, Play, ChevronUp, ChevronDown, ListPlus, Trash2 as TrashIcon, FileEdit } from 'lucide-react';

interface InterviewEditorProps {
  template: InterviewTemplate;
  onUpdate: (template: InterviewTemplate) => void;
  onStartInterview: () => void;
  onCategoryAdded?: () => void;
  onQuestionAdded?: () => void;
}

export const InterviewEditor: React.FC<InterviewEditorProps> = ({ 
  template, 
  onUpdate, 
  onStartInterview,
  onCategoryAdded,
  onQuestionAdded
}) => {
  const [newCatName, setNewCatName] = useState('');
  // Track which question's custom settings are open
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);

  // Drag and Drop State
  const [draggableId, setDraggableId] = useState<string | null>(null);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);

  const updateTemplate = (updates: Partial<InterviewTemplate>) => {
    onUpdate({ ...template, ...updates });
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const newCategory: Category = {
      id: generateId(),
      name: newCatName,
      order: template.categories.length
    };
    updateTemplate({ categories: [...template.categories, newCategory] });
    setNewCatName('');
    if (onCategoryAdded) onCategoryAdded();
  };

  const removeCategory = (id: string) => {
    updateTemplate({ 
        categories: template.categories.filter(c => c.id !== id),
        questions: template.questions.filter(q => q.categoryId !== id)
    });
  };

  // --- Drag & Drop Logic ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCategoryId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent ghost image if needed, or default
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedCategoryId === id) return;
    setDragOverCategoryId(id);
  };

  const handleDragEnd = () => {
    setDraggedCategoryId(null);
    setDragOverCategoryId(null);
    setDraggableId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedCategoryId || draggedCategoryId === targetId) {
        handleDragEnd();
        return;
    }

    const sortedCategories = [...template.categories].sort((a, b) => a.order - b.order);
    const sourceIndex = sortedCategories.findIndex(c => c.id === draggedCategoryId);
    const targetIndex = sortedCategories.findIndex(c => c.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // Reorder
    const [movedCat] = sortedCategories.splice(sourceIndex, 1);
    sortedCategories.splice(targetIndex, 0, movedCat);

    // Update order fields
    const updatedCategories = sortedCategories.map((c, index) => ({ ...c, order: index }));
    
    updateTemplate({ categories: updatedCategories });
    handleDragEnd();
  };

  const addQuestion = (categoryId: string) => {
    const newQuestion: Question = {
      id: generateId(),
      text: 'New Question',
      type: 'DIRECT',
      multiplier: 1,
      categoryId,
      order: template.questions.filter(q => q.categoryId === categoryId).length,
      customFeedbacks: []
    };
    updateTemplate({ questions: [...template.questions, newQuestion] });
    if (onQuestionAdded) onQuestionAdded();
  };

  const updateQuestion = (qId: string, updates: Partial<Question>) => {
    updateTemplate({
      questions: template.questions.map(q => q.id === qId ? { ...q, ...updates } : q)
    });
  };

  const removeQuestion = (qId: string) => {
    updateTemplate({ questions: template.questions.filter(q => q.id !== qId) });
  };

  const moveQuestion = (qId: string, direction: 'up' | 'down') => {
      const q = template.questions.find(x => x.id === qId);
      if(!q) return;
      const categoryQuestions = template.questions
        .filter(x => x.categoryId === q.categoryId)
        .sort((a,b) => a.order - b.order);
      
      const index = categoryQuestions.findIndex(x => x.id === qId);
      if (index === -1) return;

      if (direction === 'up' && index > 0) {
          const prev = categoryQuestions[index - 1];
          const newQuestions = template.questions.map(x => {
              if (x.id === q.id) return { ...x, order: prev.order };
              if (x.id === prev.id) return { ...x, order: q.order };
              return x;
          });
          updateTemplate({ questions: newQuestions });
      } else if (direction === 'down' && index < categoryQuestions.length - 1) {
          const next = categoryQuestions[index + 1];
           const newQuestions = template.questions.map(x => {
              if (x.id === q.id) return { ...x, order: next.order };
              if (x.id === next.id) return { ...x, order: q.order };
              return x;
          });
          updateTemplate({ questions: newQuestions });
      }
  };

  // --- Custom Feedback Logic ---
  const addCustomFeedback = (qId: string) => {
    const q = template.questions.find(x => x.id === qId);
    if (!q) return;
    const newFeedback: CustomFeedback = { id: generateId(), label: 'New Feedback', score: 50 };
    updateQuestion(qId, { customFeedbacks: [...(q.customFeedbacks || []), newFeedback] });
  };

  const updateCustomFeedback = (qId: string, fId: string, updates: Partial<CustomFeedback>) => {
    const q = template.questions.find(x => x.id === qId);
    if (!q || !q.customFeedbacks) return;
    updateQuestion(qId, {
        customFeedbacks: q.customFeedbacks.map(f => f.id === fId ? { ...f, ...updates } : f)
    });
  };

  const removeCustomFeedback = (qId: string, fId: string) => {
    const q = template.questions.find(x => x.id === qId);
    if (!q || !q.customFeedbacks) return;
    updateQuestion(qId, {
        customFeedbacks: q.customFeedbacks.filter(f => f.id !== fId)
    });
  };

  const handleExport = () => {
    const yamlStr = exportToYaml(template);
    downloadFile(yamlStr, `${template.name.replace(/\s+/g, '_')}_template.yaml`, 'text/yaml');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-4 md:px-8 py-4 md:py-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white shadow-sm z-10">
        <div className="flex-1 w-full">
            <div className="flex items-center gap-2 text-gray-400 text-[10px] md:text-xs uppercase font-bold tracking-wider mb-1">
                <FileEdit className="w-3 h-3" />
                <span>Editing Template</span>
            </div>
            <input 
                type="text" 
                value={template.name}
                onChange={(e) => updateTemplate({ name: e.target.value })}
                className="text-xl md:text-2xl font-bold text-gray-900 border-b border-transparent hover:border-gray-200 focus:border-primary focus:outline-none w-full placeholder-gray-300 bg-transparent transition-colors"
                placeholder="Interview Name"
            />
        </div>
        <div className="flex w-full md:w-auto gap-2 md:gap-3">
          <button onClick={handleExport} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition shadow-sm font-medium text-xs md:text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button id="editor-start-interview-btn" onClick={onStartInterview} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition shadow-sm font-medium text-xs md:text-sm">
            <Play className="w-4 h-4" /> Start Interview
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-10">
            
            {/* Categories */}
            {template.categories.sort((a,b) => a.order - b.order).map(cat => (
                <div 
                    key={cat.id} 
                    draggable={draggableId === cat.id}
                    onDragStart={(e) => handleDragStart(e, cat.id)}
                    onDragOver={(e) => handleDragOver(e, cat.id)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, cat.id)}
                    className={`bg-white rounded-xl shadow-sm border overflow-hidden animate-slide-up transition-all
                        ${draggedCategoryId === cat.id ? 'opacity-40 border-dashed border-gray-400' : 'border-gray-200'}
                        ${dragOverCategoryId === cat.id ? 'border-primary ring-2 ring-primary/20 scale-[1.01]' : ''}
                    `}
                >
                    <div className="bg-gradient-to-r from-gray-50 to-white px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center gap-2 md:gap-3 flex-1">
                             <div 
                                onMouseDown={() => setDraggableId(cat.id)}
                                onMouseUp={() => setDraggableId(null)}
                                className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-gray-200 rounded hidden md:block"
                             >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                             </div>
                             <input 
                                value={cat.name}
                                onChange={(e) => {
                                    const newCats = template.categories.map(c => c.id === cat.id ? { ...c, name: e.target.value} : c);
                                    updateTemplate({ categories: newCats });
                                }}
                                className="bg-transparent font-semibold text-base md:text-lg text-gray-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 rounded px-2 -ml-2 w-full"
                             />
                        </div>
                        <button onClick={() => removeCategory(cat.id)} className="text-gray-400 hover:text-red-500 transition ml-2">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50/50">
                        {template.questions
                            .filter(q => q.categoryId === cat.id)
                            .sort((a,b) => a.order - b.order)
                            .map((q, idx, arr) => (
                                <div key={q.id} className="flex flex-col gap-2 p-3 md:p-4 bg-white rounded-lg border border-gray-200 shadow-sm group hover:border-primary/30 transition-all duration-300 animate-fade-in">
                                    <div className="flex gap-3 md:gap-4 items-start">
                                        <div className="flex flex-col gap-1 mt-1">
                                            <button 
                                                disabled={idx === 0}
                                                onClick={() => moveQuestion(q.id, 'up')}
                                                className="text-gray-300 hover:text-primary disabled:opacity-20 transition">
                                                <ChevronUp className="w-5 h-5" />
                                            </button>
                                            <button 
                                                disabled={idx === arr.length -1}
                                                onClick={() => moveQuestion(q.id, 'down')}
                                                className="text-gray-300 hover:text-primary disabled:opacity-20 transition">
                                                <ChevronDown className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="flex-1 space-y-3 min-w-0">
                                            <textarea 
                                                value={q.text}
                                                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                                                className="editor-question-textarea w-full bg-transparent border-none p-0 text-gray-800 font-medium focus:ring-0 resize-none text-sm md:text-base"
                                                rows={2}
                                                placeholder="Question text..."
                                            />
                                            <div className="flex flex-wrap gap-2 md:gap-4 text-xs items-center pt-2 border-t border-gray-50">
                                                <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                    <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Type</span>
                                                    <select 
                                                        value={q.type}
                                                        onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType })}
                                                        className="bg-transparent text-gray-700 font-medium text-[10px] md:text-xs focus:outline-none cursor-pointer"
                                                    >
                                                        <option value="DIRECT">Direct</option>
                                                        <option value="INDIRECT">Indirect</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                    <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Mult</span>
                                                    <input 
                                                        type="number" 
                                                        min="0.1" 
                                                        step="0.1"
                                                        value={q.multiplier}
                                                        onChange={(e) => updateQuestion(q.id, { multiplier: parseFloat(e.target.value) })}
                                                        className="w-10 bg-transparent text-gray-700 font-medium text-[10px] md:text-xs focus:outline-none text-right"
                                                    />
                                                </div>
                                                <div className="hidden sm:block flex-1"></div>
                                                <button 
                                                    onClick={() => setOpenSettingsId(openSettingsId === q.id ? null : q.id)}
                                                    className={`flex items-center gap-1 text-[10px] md:text-xs font-medium px-2 md:px-3 py-1 md:py-1.5 rounded-full transition ${openSettingsId === q.id ? 'bg-primary text-accent' : 'text-gray-400 hover:text-primary hover:bg-primary/5'}`}
                                                >
                                                    <ListPlus className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                                    {q.customFeedbacks?.length ? `${q.customFeedbacks.length} Custom` : 'Add Custom'}
                                                </button>
                                            </div>
                                        </div>
                                        <button onClick={() => removeQuestion(q.id)} className="text-gray-300 hover:text-red-500 md:opacity-0 group-hover:opacity-100 transition p-1.5 md:p-2 hover:bg-red-50 rounded-full">
                                            <TrashIcon className="w-3.5 md:w-4 h-3.5 md:h-4" />
                                        </button>
                                    </div>
                                    
                                    {/* Custom Feedbacks Panel */}
                                    {openSettingsId === q.id && (
                                        <div className="mt-2 md:mt-3 ml-8 md:pl-11 border-t border-dashed border-primary/20 pt-3 md:pt-4 animate-fade-in">
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-2 md:mb-3">Custom Feedback Options</p>
                                            <div className="space-y-2 md:space-y-3">
                                                {q.customFeedbacks?.map(f => (
                                                    <div key={f.id} className="flex gap-2 md:gap-3 items-center">
                                                        <div className="flex-1 relative">
                                                            <input 
                                                                type="text" 
                                                                value={f.label} 
                                                                onChange={(e) => updateCustomFeedback(q.id, f.id, { label: e.target.value })}
                                                                placeholder="Label"
                                                                className="w-full text-xs border border-gray-200 bg-white rounded-md py-1 md:py-1.5 px-2 md:px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                                            />
                                                        </div>
                                                        <div className="w-16 md:w-24 relative">
                                                            <input 
                                                                type="number" 
                                                                value={f.score} 
                                                                onChange={(e) => updateCustomFeedback(q.id, f.id, { score: parseFloat(e.target.value) })}
                                                                placeholder="Score"
                                                                className="w-full text-xs border border-gray-200 bg-white rounded-md py-1 md:py-1.5 px-2 md:px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                                            />
                                                        </div>
                                                        <button onClick={() => removeCustomFeedback(q.id, f.id)} className="text-gray-400 hover:text-red-500 p-1">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button onClick={() => addCustomFeedback(q.id)} className="text-[10px] md:text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 mt-1 md:mt-2 px-2 py-1 hover:bg-primary/5 rounded w-fit transition">
                                                    <Plus className="w-3 md:w-3.5 h-3 md:h-3.5" /> Add Option
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        }
                        
                        <button onClick={() => addQuestion(cat.id)} className="editor-add-question-btn w-full py-2 md:py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-primary/40 hover:text-primary flex items-center justify-center gap-2 transition font-medium text-xs md:text-sm bg-white hover:bg-gray-50">
                            <Plus className="w-4 md:w-5 h-4 md:h-5" /> Add Question to {cat.name}
                        </button>
                    </div>
                </div>
            ))}

            {/* Add Category */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <input 
                    id="editor-category-input"
                    type="text" 
                    value={newCatName} 
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    placeholder="Type new category name..." 
                    className="flex-1 px-4 md:px-5 py-2 md:py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm md:text-base"
                />
                <button 
                    id="editor-add-category-btn"
                    onClick={addCategory}
                    className="px-5 md:px-6 py-2 md:py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2 shadow-sm shadow-primary/30 text-sm md:text-base"
                >
                    <Plus className="w-4 md:w-5 h-4 md:h-5" /> Add Category
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};