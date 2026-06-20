import fs from 'fs';
import path from 'path';
import { 
  User, 
  ResearchSession, 
  Message, 
  NoteFolder, 
  AcademicNote, 
  PDFDocument, 
  VoiceHistoryItem, 
  UserSettings 
} from './types.js';

const DB_FILE = path.join(process.cwd(), 'data', 'academic_db.json');

interface Schema {
  users: User[];
  sessions: ResearchSession[];
  messages: Message[];
  folders: NoteFolder[];
  notes: AcademicNote[];
  pdfDocuments: PDFDocument[];
  voiceHistory: VoiceHistoryItem[];
  settings: UserSettings[];
}

const DEFAULT_DB: Schema = {
  users: [
    {
      id: 'default-user',
      name: 'Josh and Mona',
      email: 'josh.mona@academic.edu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      createdAt: new Date().toISOString()
    }
  ],
  sessions: [],
  messages: [],
  folders: [],
  notes: [],
  pdfDocuments: [],
  voiceHistory: [],
  settings: [
    {
      userId: 'default-user',
      theme: 'dark',
      preferredCitationStyle: 'APA',
      autoSaveEnabled: true,
      speechRate: 1.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

// Database utility class
export class AcademicDB {
  private static load(): Schema {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
        return DEFAULT_DB;
      }
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data) as Schema;
    } catch (e) {
      console.error('Error loading JSON DB, reverting to in-memory default:', e);
      return DEFAULT_DB;
    }
  }

  private static save(schema: Schema) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed writing JSON DB:', e);
    }
  }

  // Users
  static getUsers(): User[] {
    return this.load().users;
  }
  
  static createUser(user: User): User {
    const db = this.load();
    db.users.push(user);
    this.save(db);
    return user;
  }

  // Sessions
  static getSessions(userId: string = 'default-user'): ResearchSession[] {
    return this.load().sessions.filter(s => s.userId === userId);
  }

  static createSession(session: ResearchSession): ResearchSession {
    const db = this.load();
    db.sessions.push(session);
    this.save(db);
    return session;
  }

  static updateSession(sessionId: string, updates: Partial<ResearchSession>): ResearchSession | null {
    const db = this.load();
    const idx = db.sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) return null;
    db.sessions[idx] = { ...db.sessions[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save(db);
    return db.sessions[idx];
  }

  static deleteSession(sessionId: string) {
    const db = this.load();
    db.sessions = db.sessions.filter(s => s.id !== sessionId);
    db.messages = db.messages.filter(m => m.sessionId !== sessionId);
    this.save(db);
  }

  // Messages
  static getMessages(sessionId: string): Message[] {
    return this.load().messages.filter(m => m.sessionId === sessionId);
  }

  static addMessage(message: Message): Message {
    const db = this.load();
    db.messages.push(message);
    this.save(db);
    return message;
  }

  static updateMessage(messageId: string, updates: Partial<Message>): Message | null {
    const db = this.load();
    const idx = db.messages.findIndex(m => m.id === messageId);
    if (idx === -1) return null;
    db.messages[idx] = { ...db.messages[idx], ...updates };
    this.save(db);
    return db.messages[idx];
  }

  // Folders
  static getFolders(userId: string = 'default-user'): NoteFolder[] {
    return this.load().folders.filter(f => f.userId === userId);
  }

  static createFolder(folder: NoteFolder): NoteFolder {
    const db = this.load();
    db.folders.push(folder);
    this.save(db);
    return folder;
  }

  static deleteFolder(folderId: string) {
    const db = this.load();
    db.folders = db.folders.filter(f => f.id !== folderId);
    // Unlink notes in this folder or move to general
    db.notes = db.notes.filter(n => n.folderId !== folderId);
    this.save(db);
  }

  // Notes
  static getNotes(userId: string = 'default-user'): AcademicNote[] {
    return this.load().notes.filter(n => n.userId === userId);
  }

  static createNote(note: AcademicNote): AcademicNote {
    const db = this.load();
    db.notes.push(note);
    this.save(db);
    return note;
  }

  static updateNote(noteId: string, updates: Partial<AcademicNote>): AcademicNote | null {
    const db = this.load();
    const idx = db.notes.findIndex(n => n.id === noteId);
    if (idx === -1) return null;
    db.notes[idx] = { ...db.notes[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save(db);
    return db.notes[idx];
  }

  static deleteNote(noteId: string) {
    const db = this.load();
    db.notes = db.notes.filter(n => n.id !== noteId);
    this.save(db);
  }

  // PDFs
  static getPDFs(userId: string = 'default-user'): PDFDocument[] {
    return this.load().pdfDocuments.filter(p => p.userId === userId);
  }

  static savePDF(pdf: PDFDocument): PDFDocument {
    const db = this.load();
    db.pdfDocuments.push(pdf);
    this.save(db);
    return pdf;
  }

  static deletePDF(pdfId: string) {
    const db = this.load();
    db.pdfDocuments = db.pdfDocuments.filter(p => p.id !== pdfId);
    this.save(db);
  }

  // Voice History
  static getVoiceHistory(userId: string = 'default-user'): VoiceHistoryItem[] {
    return this.load().voiceHistory.filter(v => v.userId === userId);
  }

  static addVoiceLog(log: VoiceHistoryItem): VoiceHistoryItem {
    const db = this.load();
    db.voiceHistory.push(log);
    this.save(db);
    return log;
  }

  // Settings
  static getSettings(userId: string = 'default-user'): UserSettings {
    const db = this.load();
    const userSettings = db.settings.find(s => s.userId === userId);
    if (userSettings) return userSettings;
    
    // Create new defaulted settings
    const newSettings: UserSettings = {
      userId,
      theme: 'dark',
      preferredCitationStyle: 'APA',
      autoSaveEnabled: true,
      speechRate: 1.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.settings.push(newSettings);
    this.save(db);
    return newSettings;
  }

  static updateSettings(userId: string, updates: Partial<UserSettings>): UserSettings {
    const db = this.load();
    let idx = db.settings.findIndex(s => s.userId === userId);
    if (idx === -1) {
      const newSettings: UserSettings = {
        userId,
        theme: 'dark',
        preferredCitationStyle: 'APA',
        autoSaveEnabled: true,
        speechRate: 1.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updates
      };
      db.settings.push(newSettings);
      this.save(db);
      return newSettings;
    }
    
    db.settings[idx] = { ...db.settings[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save(db);
    return db.settings[idx];
  }
}
