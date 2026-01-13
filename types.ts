export type QuestionType = 'DIRECT' | 'INDIRECT';

export enum DirectFeedback {
  CORRECT = 'CORRECT',
  WRONG = 'WRONG',
  TRIED = 'TRIED',
  SILENT = 'SILENT',
}

export enum IndirectFeedback {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  NOT_GOOD = 'NOT_GOOD',
  BAD = 'BAD',
}

export type FeedbackValue = string; // Changed from enum to string to support custom labels

export interface CustomFeedback {
  id: string;
  label: string;
  score: number;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  multiplier: number;
  categoryId: string;
  order: number;
  customFeedbacks?: CustomFeedback[];
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface InterviewTemplate {
  id: string;
  name: string;
  createdAt: string;
  categories: Category[];
  questions: Question[];
}

export interface AnswerData {
  feedback: FeedbackValue; // Stores the label (Standard key or Custom label)
  score: number;
  note?: string;
  isCustom?: boolean;
}

export interface QuestionResult extends Question {
  answer?: AnswerData;
}

export interface InterviewResult {
  id: string;
  templateName: string;
  candidateName: string;
  date: string;
  categories: Category[];
  questions: QuestionResult[];
  totalScore: number;
  maxPossibleScore: number;
  summary?: string;
}

export interface FeedbackSetting {
  label: string;
  score: number;
}

export interface AppSettings {
  direct: Record<DirectFeedback, FeedbackSetting>;
  indirect: Record<IndirectFeedback, FeedbackSetting>;
}

export type ViewMode = 'EDITOR' | 'EXECUTION' | 'DASHBOARD' | 'SETTINGS' | 'STATISTICS';