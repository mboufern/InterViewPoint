import { DirectFeedback, IndirectFeedback, AppSettings } from './types';

// These color mappings remain hardcoded as they represent the "semantic" meaning of the base types
export const FEEDBACK_COLORS: Record<string, string> = {
  [DirectFeedback.CORRECT]: 'bg-green-100 text-green-800 border-green-300',
  [DirectFeedback.WRONG]: 'bg-red-100 text-red-800 border-red-300',
  [DirectFeedback.TRIED]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [DirectFeedback.SILENT]: 'bg-gray-100 text-gray-800 border-gray-300',
  [IndirectFeedback.EXCELLENT]: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  [IndirectFeedback.GOOD]: 'bg-blue-100 text-blue-800 border-blue-300',
  [IndirectFeedback.NOT_GOOD]: 'bg-orange-100 text-orange-800 border-orange-300',
  [IndirectFeedback.BAD]: 'bg-red-100 text-red-800 border-red-300',
};

export const CUSTOM_FEEDBACK_COLOR = 'bg-purple-100 text-purple-800 border-purple-300';

export const DEFAULT_SETTINGS: AppSettings = {
  direct: {
    [DirectFeedback.CORRECT]: { label: 'Correct Answer', score: 100 },
    [DirectFeedback.TRIED]: { label: 'Tried but Failed', score: 40 },
    [DirectFeedback.WRONG]: { label: 'Wrong Answer', score: 0 },
    [DirectFeedback.SILENT]: { label: 'Silent / No Answer', score: 0 },
  },
  indirect: {
    [IndirectFeedback.EXCELLENT]: { label: 'Excellent', score: 100 },
    [IndirectFeedback.GOOD]: { label: 'Good', score: 75 },
    [IndirectFeedback.NOT_GOOD]: { label: 'Not Good', score: 25 },
    [IndirectFeedback.BAD]: { label: 'Bad', score: 0 },
  }
};
