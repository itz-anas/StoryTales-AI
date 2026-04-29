export interface Book {
  id: string;
  title: string;
  genre: string;
  targetAudience: string;
  description: string;
  coverImage?: string; // Base64 data URI
  chapters: Chapter[];
  createdAt: number;
}

export interface Chapter {
  id: string;
  title: string;
  outline: string;
  content: string; // Markdown content
  isGenerating: boolean;
  isComplete: boolean;
}

export type ViewState = 'dashboard' | 'wizard' | 'editor' | 'preview';

export interface WizardFormData {
  title: string;
  genre: string;
  targetAudience: string;
  description: string;
}

export interface GenerateOutlineResponse {
  chapterTitle: string;
  chapterDescription: string;
}