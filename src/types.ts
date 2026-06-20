export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface ResearchSession {
  id: string;
  userId: string;
  title: string;
  category: string;
  isPinned: boolean;
  isStarred: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isBookmarked?: boolean;
  // Metadata fields for academic quality:
  confidenceIndex?: number; // scale of 0-100%
  researchScore?: number; // scale of 1-10
  readingTimeMin?: number; // estimated reading time
  citations?: string[]; // inline references
  suggestedTopics?: string[];
}

export interface NoteFolder {
  id: string;
  userId: string;
  name: string;
  category: 'Database' | 'AI' | 'Programming' | 'Networking' | 'Robotics' | 'Mathematics' | 'General';
  createdAt: string;
}

export interface AcademicNote {
  id: string;
  userId: string;
  folderId: string;
  title: string;
  content: string;
  citationText?: string;
  academicCategory: string;
  createdAt: string;
  updatedAt: string;
}

export interface PDFDocument {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  filePath?: string;
  abstract?: string;
  summary?: string;
  findings?: string[];
  methodology?: string;
  conclusion?: string;
  limitations?: string[];
  fullText?: string;
  uploadedAt: string;
}

export interface VoiceHistoryItem {
  id: string;
  userId: string;
  transcript: string;
  durationSeconds: number;
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  preferredCitationStyle: 'APA' | 'MLA' | 'Harvard' | 'Chicago' | 'IEEE';
  autoSaveEnabled: boolean;
  speechRate: number; // voice synthesis rate
  createdAt: string;
  updatedAt: string;
}

export interface ChatInteraction {
  sessionId: string;
  messageText: string;
  academicField?: string;
  pdfContext?: string;
}
