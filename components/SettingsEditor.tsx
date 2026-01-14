import React, { useState, useEffect } from 'react';
import { AppSettings, DirectFeedback, IndirectFeedback, FeedbackSetting } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { Save, RotateCcw, Download, Upload, Settings } from 'lucide-react';
import { exportToYaml, parseYaml, downloadFile } from '../utils';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmModal';

interface SettingsEditorProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsEditor: React.FC<SettingsEditorProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // Sync if props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = <T extends 'direct' | 'indirect'>(
    type: T,
    key: T extends 'direct' ? DirectFeedback : IndirectFeedback,
    field: keyof FeedbackSetting,
    value: string | number
  ) => {
    setLocalSettings(prev => {
        const category = prev[type] as any;
        const currentSetting = category[key];
        
        return {
            ...prev,
            [type]: {
                ...category,
                [key]: {
                    ...currentSetting,
                    [field]: value
                }
            }
        };
    });
  };

  const handleSave = () => {
    onSave(localSettings);
    showToast('Settings saved successfully!', 'success');
  };

  const handleReset = async () => {
    if (await confirm({
        title: 'Reset Settings',
        message: 'Reset all feedback settings to default?',
        variant: 'destructive',
        confirmLabel: 'Reset'
    })) {
      setLocalSettings(DEFAULT_SETTINGS);
      onSave(DEFAULT_SETTINGS);
      showToast('Settings reset to default', 'success');
    }
  };

  const handleExport = () => {
    const yamlStr = exportToYaml(localSettings);
    downloadFile(yamlStr, 'interview_settings.yaml', 'text/yaml');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const data = parseYaml(content);
      if (data && data.direct && data.indirect) {
        setLocalSettings(data);
        onSave(data);
        showToast('Settings imported successfully!', 'success');
      } else {
        showToast('Invalid settings YAML file.', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-4 md:px-8 py-4 md:py-5 border-b border-gray-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm z-10">
        <div>
            <div className="flex items-center gap-2 text-gray-400 text-[10px] md:text-xs uppercase font-bold tracking-wider mb-1">
                <Settings className="w-3 h-3" />
                <span>Global Settings</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Feedback Settings</h1>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".yaml,.yml" />
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-xs md:text-sm font-medium transition">
                <Upload className="w-4 h-4" /> Import
            </button>
            <button onClick={handleExport} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-xs md:text-sm font-medium transition">
                <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={handleReset} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-xs md:text-sm font-medium transition">
                <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button onClick={handleSave} className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-xs md:text-sm font-medium shadow-sm transition">
                <Save className="w-4 h-4" /> Save Changes
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-10">
          
          {/* Direct Feedbacks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 animate-slide-up">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                <span className="w-1.5 md:w-2 h-5 md:h-6 bg-primary rounded-full"></span>
                Direct Question Feedbacks
            </h2>
            <div className="grid gap-3 md:gap-4">
              {(Object.keys(localSettings.direct) as DirectFeedback[]).map((key) => {
                const setting = localSettings.direct[key];
                return (
                  <div key={key} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary/20 transition">
                     <div className="w-full sm:w-24 md:w-32 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">{key}</div>
                     <div className="flex-1 w-full">
                        <label className="block text-[10px] text-gray-400 mb-1 font-medium">Label</label>
                        <input 
                            type="text" 
                            value={setting.label} 
                            onChange={(e) => handleChange('direct', key, 'label', e.target.value)}
                            className="w-full px-3 py-1.5 md:py-2 border border-gray-300 bg-white rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none text-xs md:text-sm transition"
                        />
                     </div>
                     <div className="w-full sm:w-24 md:w-32">
                        <label className="block text-[10px] text-gray-400 mb-1 font-medium">Score</label>
                        <input 
                            type="number" 
                            value={setting.score} 
                            onChange={(e) => handleChange('direct', key, 'score', parseFloat(e.target.value))}
                            className="w-full px-3 py-1.5 md:py-2 border border-gray-300 bg-white rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none text-xs md:text-sm transition"
                        />
                     </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Indirect Feedbacks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                 <span className="w-1.5 md:w-2 h-5 md:h-6 bg-accent rounded-full"></span>
                 Indirect Question Feedbacks
            </h2>
            <div className="grid gap-3 md:gap-4">
              {(Object.keys(localSettings.indirect) as IndirectFeedback[]).map((key) => {
                const setting = localSettings.indirect[key];
                return (
                  <div key={key} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-accent/50 transition">
                     <div className="w-full sm:w-24 md:w-32 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">{key}</div>
                     <div className="flex-1 w-full">
                        <label className="block text-[10px] text-gray-400 mb-1 font-medium">Label</label>
                        <input 
                            type="text" 
                            value={setting.label} 
                            onChange={(e) => handleChange('indirect', key, 'label', e.target.value)}
                            className="w-full px-3 py-1.5 md:py-2 border border-gray-300 bg-white rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none text-xs md:text-sm transition"
                        />
                     </div>
                     <div className="w-full sm:w-24 md:w-32">
                        <label className="block text-[10px] text-gray-400 mb-1 font-medium">Score</label>
                        <input 
                            type="number" 
                            value={setting.score} 
                            onChange={(e) => handleChange('indirect', key, 'score', parseFloat(e.target.value))}
                            className="w-full px-3 py-1.5 md:py-2 border border-gray-300 bg-white rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none text-xs md:text-sm transition"
                        />
                     </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
