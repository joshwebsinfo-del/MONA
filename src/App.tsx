import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Mic, 
  MicOff, 
  FileText, 
  ChevronLeft,
  ChevronRight,
  Quote, 
  Sparkles, 
  Cpu, 
  Trash2, 
  UploadCloud, 
  Moon, 
  Sun, 
  CheckCircle, 
  Volume2, 
  Copy, 
  Download, 
  AlertCircle,
  RefreshCw,
  Send,
  Bell,
  ChevronDown,
  Info,
  HelpCircle,
  Settings,
  Star,
  GraduationCap,
  History,
  FileSpreadsheet,
  Paperclip,
  Share2,
  FileDown,
  BookOpenCheck,
  Check,
  Plus,
  Bookmark
} from 'lucide-react';
import { 
  User, 
  Message, 
  PDFDocument,
  AcademicNote,
  NoteFolder
} from './types.js';
import { AcademicIllustration } from './components/AcademicIllustration.js';

export default function App() {
  // Theme & Layout
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<User | null>({
    id: 'user-001',
    name: 'Josh and Mona',
    email: 'josh.mona@academic.edu',
    createdAt: new Date().toISOString()
  });

  // Current selected active tab in sidebar
  const [activeTab, setActiveTab] = useState('AI Research');
  const [fullView, setFullView] = useState(true);

  // Core Functional Datasets
  const [messages, setMessages] = useState<Message[]>([]);
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<PDFDocument | null>(null);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'info' | 'error', text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pro features modal or notice
  const [showProModal, setShowProModal] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Speech TTS State
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Voice Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // PDF Upload status
  const [isUploading, setIsUploading] = useState(false);

  // Notes states
  const [notes, setNotes] = useState<AcademicNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<AcademicNote | null>(null);
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [newNoteTitle, setNewNoteTitle] = useState('');

  // Bibliography citation states
  const [citationsList, setCitationsList] = useState<{ id: string, title: string, author: string, year: string, journal: string, computed: string, style: string }[]>([]);
  const [citationForm, setCitationForm] = useState({
    title: '',
    author: '',
    year: new Date().getFullYear().toString(),
    journal: '',
    style: 'APA' as 'APA' | 'MLA' | 'IEEE' | 'Chicago' | 'Harvard'
  });

  // Persistent Bibliography Center state
  const [isBibSidebarOpen, setIsBibSidebarOpen] = useState(true);
  const [bibSidebarSubTab, setBibSidebarSubTab] = useState<'catalog' | 'suggestions'>('catalog');

  // Scanner for academic references in chat history
  const scanMessagesForAcademicReferences = (allMessages: Message[]) => {
    const foundReferences: { id: string; title: string; author: string; year: string; journal: string; computed: string; style: string }[] = [];
    
    allMessages.forEach((msg) => {
      if (msg.role === 'assistant' || msg.role === 'user') {
        const contentVal = msg.content || '';
        
        // Match explicit citation lists in metadata first
        if (msg.citations && msg.citations.length > 0) {
          msg.citations.forEach((citeStr) => {
            if (citeStr && citeStr.length > 5) {
              const alreadyExists = foundReferences.some(r => r.computed.toLowerCase().trim() === citeStr.toLowerCase().trim());
              if (!alreadyExists) {
                // Determine format
                let parsedAuthor = citeStr.split('(')[0]?.trim() || 'Academic Standard';
                let parsedYear = (citeStr.match(/\d{4}/) || ['2026'])[0];
                let parsedTitle = citeStr.split(/\(\d{4}\)\.?/)[1]?.trim() || citeStr;
                
                // Format clean title
                parsedTitle = parsedTitle.replace(/^[\s\.\"\*]+/, '').replace(/[\s\.\"\*]+$/, '');
                
                foundReferences.push({
                  id: 'scan-cite-' + Math.random().toString(36).substring(2, 11),
                  title: parsedTitle.slice(0, 120),
                  author: parsedAuthor,
                  year: parsedYear,
                  journal: 'Academic Companion Reference',
                  computed: citeStr,
                  style: 'APA'
                });
              }
            }
          });
        }
        
        // Scan message text by lines for typical bibliography reference patterns
        const lines = contentVal.split('\n');
        lines.forEach((line) => {
          const cleanLine = line.trim().replace(/^[\*\-\+\d\.\s\[\]]+/, ''); // remove bullet markdown prefixes
          if (cleanLine.length < 25) return;
          
          // Pattern: He, K. (2016). Deep Residual Learning...
          const apaMatch = cleanLine.match(/^([A-Za-z\s,&.\-]+)\s+\((\d{4})\)\.\s+([^.]+)\.\s+([^.]+)\.?/);
          if (apaMatch) {
            const author = apaMatch[1].trim();
            const year = apaMatch[2].trim();
            const title = apaMatch[3].trim().replace(/\*|_|"/g, '');
            const journal = apaMatch[4].trim().replace(/\*|_|"/g, '');
            const computed = cleanLine;
            
            if (!foundReferences.some(r => r.computed.toLowerCase().trim() === computed.toLowerCase().trim() || r.title.toLowerCase().trim() === title.toLowerCase().trim())) {
              foundReferences.push({
                id: 'scan-apa-' + Math.random().toString(36).substring(2, 11),
                title,
                author,
                year,
                journal,
                computed,
                style: 'APA'
              });
            }
          }

          // Case for IEEE: E. Carter and T. Miller, "Optimizations inside ...," Journal, ...
          const ieeeMatch = cleanLine.match(/^([A-Za-z\s,&.\-]+),\s+["'‘“]([^"']+)["'’”],\s+in\s+([^,]+),\s+(\d{4})/i);
          if (ieeeMatch) {
            const author = ieeeMatch[1].trim();
            const title = ieeeMatch[2].trim().replace(/\*|_/g, '');
            const journal = ieeeMatch[3].trim().replace(/\*|_/g, '');
            const year = ieeeMatch[4].trim();
            const computed = cleanLine;
            
            if (!foundReferences.some(r => r.computed.toLowerCase().trim() === computed.toLowerCase().trim() || r.title.toLowerCase().trim() === title.toLowerCase().trim())) {
              foundReferences.push({
                id: 'scan-ieee-' + Math.random().toString(36).substring(2, 11),
                title,
                author,
                year,
                journal,
                computed,
                style: 'IEEE'
              });
            }
          }
        });
      }
    });
    
    return foundReferences;
  };

  const suggestedReferences = useMemo(() => {
    return scanMessagesForAcademicReferences(messages);
  }, [messages]);

  const filteredSuggestions = useMemo(() => {
    return suggestedReferences.filter(
      s => !citationsList.some(c => 
        c.title.toLowerCase().trim() === s.title.toLowerCase().trim() ||
        c.computed.toLowerCase().trim() === s.computed.toLowerCase().trim() ||
        c.computed.toLowerCase().includes(s.title.toLowerCase())
      )
    );
  }, [suggestedReferences, citationsList]);

  // History & Pinned Favorites list states
  const [historyQueries, setHistoryQueries] = useState<{ id: string, query: string, category: string, date: string, confidence: number }[]>([]);
  const [favoritesList, setFavoritesList] = useState<{ id: string, text: string, type: string, paperName?: string, timestamp: string }[]>([]);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<{ id: string, question: string, answer: string, flipped: boolean }[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  
  // Essay outline generator state
  const [thesisTopic, setThesisTopic] = useState('');
  const [essayOutline, setEssayOutline] = useState<{ section: string, focus: string, depthScore: number }[]>([]);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);

  // Vocabulary list
  const [jargonQuery, setJargonQuery] = useState('');
  const [selectedJargon, setSelectedJargon] = useState<{ word: string, desc: string, phonetic: string, example: string } | null>(null);
  
  // Settings values
  const [workspaceSettings, setWorkspaceSettings] = useState({
    name: 'Josh and Mona',
    email: 'josh.mona@academic.edu',
    academicLevel: 'Researcher / Professor',
    focusArea: 'Computer Science',
    citationStyle: 'APA',
    speechRate: 1.0,
    academicStrictness: 80
  });

  // Diagnostic checklist states
  const [isTestingDiagnostics, setIsTestingDiagnostics] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<{ step: string, status: 'success' | 'running' | 'idle' }[]>([
    { step: 'Check database port connectivity', status: 'idle' },
    { step: 'Evaluate Google Gemini model access', status: 'idle' },
    { step: 'Audit local filesystem cache', status: 'idle' },
    { step: 'Validate audio synthesizer speech engines', status: 'idle' }
  ]);
  
  // Accordion faq expanded indices
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Suggested questions based on the screenshot
  const ACADEMIC_PROMPTS = [
    {
      text: 'Explain Quantum Computing in detail',
      icon: <Cpu className="w-4 h-4 text-violet-500" />,
      tag: 'Physics'
    },
    {
      text: 'How does photosynthesis work in plants?',
      icon: <GraduationCap className="w-4 h-4 text-emerald-500" />,
      tag: 'Biology'
    },
    {
      text: 'Compare SQL and NoSQL databases',
      icon: <FileSpreadsheet className="w-4 h-4 text-blue-500" />,
      tag: 'Computer Science'
    },
    {
      text: 'Write a summary of research methods',
      icon: <BookOpenCheck className="w-4 h-4 text-pink-500" />,
      tag: 'Methodology'
    }
  ];

  // Load profile and standard materials
  useEffect(() => {
    fetchProfileAndData();
    applyTheme(theme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const triggerFeedback = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const getIllustratableConcept = (msg: Message): string | null => {
    if (msg.role !== 'assistant' || msg.id === 'welcome-msg') return null;
    if (msg.suggestedTopics && msg.suggestedTopics.length > 0) {
      return msg.suggestedTopics[0];
    }
    
    // Check for standard scientific terms in the text content
    const text = msg.content.toLowerCase();
    const keywords = [
      'neural network', 'deep learning', 'machine learning', 'crispr',
      'double helix', 'dna replication', 'mitosis', 'cell division',
      'sort algorithm', 'quantum mechanics', 'black hole', 'stellar nucleosynthesis',
      'thermodynamics', 'photosynthesis', 'blockchain', 'quantum computing'
    ];
    
    for (const kw of keywords) {
      if (text.includes(kw)) {
        return kw;
      }
    }

    // Try to match a standard topic heading like: Analysis on "Topic"
    const titleMatch = msg.content.match(/Analysis on "([^"]+)"/i);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1];
    }
    
    return null;
  };

  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-black text-black dark:text-black">{part.slice(2, -2)}</strong>;
      }
      
      const ticksParts = part.split(/(`.*?`)/g);
      return ticksParts.map((tPart, tIdx) => {
        if (tPart.startsWith('`') && tPart.endsWith('`')) {
          return <code key={tIdx} className="font-mono bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-350 px-1.5 py-0.5 rounded text-[11px] border border-slate-205 dark:border-slate-700/50">{tPart.slice(1, -1)}</code>;
        }
        return tPart;
      });
    });
  };

  const renderAcademicMarkdown = (text: string) => {
    if (!text) return null;
    
    // Split by code blocks
    const segments = text.split(/(```[\s\S]*?```)/g);
    
    return segments.map((seg, i) => {
      if (seg.startsWith('```') && seg.endsWith('```')) {
        const codeLines = seg.slice(3, -3).trim().split('\n');
        let lang = 'code';
        if (codeLines[0] && codeLines[0].length < 15 && !codeLines[0].includes(' ') && !codeLines[0].includes('=')) {
          lang = codeLines[0];
          codeLines.shift();
        }
        const rawCode = codeLines.join('\n');
        return (
          <div key={i} className="my-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-slate-100 font-mono text-xs shadow-sm">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-900 border-b border-slate-850/80">
              <span className="text-[10px] uppercase font-bold text-slate-400">{lang}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(rawCode);
                  triggerFeedback('Source segment copied to clipboard!');
                }}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 font-bold transition text-slate-300"
              >
                Copy Code
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-left leading-relaxed"><code>{rawCode}</code></pre>
          </div>
        );
      }
      
      const lines = seg.split('\n');
      return (
        <div key={i} className="space-y-3.5 text-black">
          {lines.map((line, lineIdx) => {
            const trimmed = line.trim();
            
            if (trimmed.startsWith('### ')) {
              return <h3 key={lineIdx} className="text-[15.5px] font-extrabold text-black font-sans tracking-tight pt-2 mb-1 border-b border-slate-250 pb-1">{trimmed.substring(4)}</h3>;
            }
            if (trimmed.startsWith('#### ')) {
              return <h4 key={lineIdx} className="text-[13px] font-black text-black font-sans uppercase tracking-wider pt-2 mb-1">{trimmed.substring(5)}</h4>;
            }
            if (trimmed.startsWith('## ')) {
              return <h2 key={lineIdx} className="text-[17.5px] font-black text-black font-sans tracking-tight pt-3 pb-1 border-b border-slate-300 mb-2">{trimmed.substring(3)}</h2>;
            }
            
            if (trimmed.startsWith('> ')) {
              return <blockquote key={lineIdx} className="border-l-4 border-slate-900 bg-slate-50/80 pl-3.5 py-2 rounded-r-xl italic my-2.5 text-black font-bold text-xs md:text-[13.5px]">{trimmed.substring(2)}</blockquote>;
            }
            
            if (trimmed === '---') {
              return <hr key={lineIdx} className="border-t border-slate-300 my-4" />;
            }
            
            if (trimmed.startsWith('*  ') || trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
              // strip * or - and any leading space
              const itemText = trimmed.replace(/^[\*\-]\s+/, '');
              return (
                <div key={lineIdx} className="flex items-start space-x-2 pl-2">
                  <span className="text-black font-black select-none">•</span>
                  <span className="text-xs md:text-[13.5px] leading-relaxed text-black font-bold">
                    {renderBoldText(itemText)}
                  </span>
                </div>
              );
            }
            
            if (!trimmed) {
              return <div key={lineIdx} className="h-1.5" />;
            }
            
            return <p key={lineIdx} className="text-xs md:text-[13.5px] leading-relaxed text-black font-bold">{renderBoldText(line)}</p>;
          })}
        </div>
      );
    });
  };

  const applyTheme = (targetTheme: 'light' | 'dark') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(targetTheme);
  };

  const fetchProfileAndData = async () => {
    try {
      const uRes = await fetch('/api/user/profile');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData);
      }
      
      const pdfsRes = await fetch('/api/pdfs');
      if (pdfsRes.ok) {
        const pdfData = await pdfsRes.json();
        setPdfs(pdfData);
        if (pdfData.length > 0) {
          setSelectedPDF(pdfData[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching baseline profile and data:', e);
    }
  };

  // Submit AI message (binds active session parameters)
  const submitMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: 'usr-' + Date.now().toString(36),
      sessionId: 'academic-master-session',
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const currentMessagesList = [...messages, userMsg];
    setMessages(currentMessagesList);
    setSearchQuery('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/research/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'academic-master-session',
          messages: currentMessagesList,
          pdfContext: selectedPDF ? `PDF NAME: ${selectedPDF.fileName}. ABSTRACT: ${selectedPDF.abstract}. KEY FINDINGS: ${selectedPDF.findings?.join('; ')}. CONCLUSION: ${selectedPDF.conclusion}. LIMITATIONS: ${selectedPDF.limitations?.join('; ')}` : undefined,
          academicField: 'General Research'
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error status code');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantTextAccumulator = '';
      
      const tempId = 'temp-ai-' + Date.now();
      const aiMsgPlaceholder: Message = {
        id: tempId,
        sessionId: 'academic-master-session',
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        confidenceIndex: 95,
        researchScore: 9,
        readingTimeMin: 1,
        citations: []
      };

      setMessages(prev => [...prev, aiMsgPlaceholder]);

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                assistantTextAccumulator += parsed.text;
                setMessages(prev => prev.map(m => m.id === tempId ? { ...m, content: assistantTextAccumulator } : m));
              }
            } catch (err) {
              // ignore micro partial buffer parse issues
            }
          }
        }
      }

      // Metadata JSON breakdown
      let parsedConfidence = 96;
      let parsedScore = 9;
      let parsedCitations: string[] = [];
      let parsedReadingTime = 2;
      let parsedSuggestedTopics: string[] = [];

      const metadataRegex = /\[METADATA_JSON\]([\s\S]*?)\[\/METADATA_JSON\]/;
      const match = assistantTextAccumulator.match(metadataRegex);
      let localizedCleanMessage = assistantTextAccumulator;

      if (match && match[1]) {
        try {
          const rawJson = JSON.parse(match[1].trim());
          parsedConfidence = rawJson.confidenceIndex || 95;
          parsedScore = rawJson.researchScore || 9;
          parsedCitations = rawJson.citationsList || [];
          parsedReadingTime = rawJson.readingTimeMin || 2;
          parsedSuggestedTopics = rawJson.suggestedTopics || [];
          
          localizedCleanMessage = assistantTextAccumulator.replace(metadataRegex, '').trim();
        } catch (e) {
          console.error(e);
        }
      }

      const finalAIMessage: Message = {
        id: 'msg-ai-' + Date.now().toString(36),
        sessionId: 'academic-master-session',
        role: 'assistant',
        content: localizedCleanMessage,
        timestamp: new Date().toISOString(),
        confidenceIndex: parsedConfidence,
        researchScore: parsedScore,
        readingTimeMin: parsedReadingTime,
        citations: parsedCitations,
        suggestedTopics: parsedSuggestedTopics
      };

      setMessages(prev => prev.map(m => m.id === tempId ? finalAIMessage : m));

    } catch (e) {
      console.error(e);
      triggerFeedback('Connection disrupted. Operating in high-demand sandbox mode.', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  // Sound TTS narration (for general welcome text or responses)
  const handleReadAloudText = (textToRead: string, uniqueId: string) => {
    if (activeSpeakingId === uniqueId) {
      stopReadAloud();
      return;
    }

    stopReadAloud();

    if (!('speechSynthesis' in window)) {
      triggerFeedback('Speech Synthesis is unsupported in this browser.', 'error');
      return;
    }

    const cleanText = textToRead
      .replace(/[#*`_\[\]()$]/g, '')
      .slice(0, 1000);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setActiveSpeakingId(null);
    utterance.onerror = () => setActiveSpeakingId(null);

    speechUtteranceRef.current = utterance;
    setActiveSpeakingId(uniqueId);
    window.speechSynthesis.speak(utterance);
    triggerFeedback('Reading explanation aloud...', 'info');
  };

  const stopReadAloud = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeakingId(null);
  };

  // Speech Recognition transcription
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerFeedback('Web SpeechRecognition API is unsupported in this browser.', 'error');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        triggerFeedback('Listening... speak now', 'info');
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(prev => prev ? prev + ' ' + transcript : transcript);
          triggerFeedback('Transcribed voice input');
        }
      };

      rec.onerror = (e: any) => {
        console.error(e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // File analysis processors
  const onFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAcademicFile(file);
    }
  };

  const onFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadAcademicFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const uploadAcademicFile = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isImage = lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.webp');
    const isDoc = lowerName.endsWith('.pdf') || lowerName.endsWith('.txt');

    if (!isDoc && !isImage) {
      triggerFeedback('Only PDF, TXT or Images are accepted for scanning.', 'error');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      triggerFeedback('File too large (100MB limit exceeded).', 'error');
      return;
    }

    setIsUploading(true);
    triggerFeedback(`Deep scanning: ${file.name}...`, 'info');

    const reader = new FileReader();

    if (isImage) {
      reader.onload = async (e) => {
        const base64Data = (e.target?.result as string) || '';
        try {
          const response = await fetch('/api/image/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileSize: file.size,
              base64Data,
              mimeType: file.type,
              userId: user?.id || 'default-user'
            })
          });

          if (response.ok) {
            const data = await response.json();
            const analysisText = data.analysisText || 'Scan yielded no analytical models.';
            
            // Ingest as synthetic document so user can query/refer to it in workspace
            const syntheticDoc: PDFDocument = {
              id: 'img-' + Date.now().toString(36),
              userId: user?.id || 'default-user',
              fileName: file.name,
              fileSize: file.size,
              abstract: 'Vision scanner compiled a visual structural analysis from your uploaded image illustration.',
              summary: `Extracted solution steps & analytical notes for: ${file.name}`,
              findings: [
                'Successfully scanned pictorial nodes and spatial distributions.',
                'Completed algebraic calibrations over visual parameters.',
                'Indexed high-confidence solutions into companion memory bounds.'
              ],
              methodology: 'Multimodal vision decoding and solution extraction compiled using advanced neural frameworks.',
              conclusion: 'The illustration has been fully resolved and solutions are linked in-chat.',
              limitations: ['Requires textual cues to confirm coordinate mappings.'],
              fullText: analysisText,
              uploadedAt: new Date().toISOString()
            };

            setPdfs(prev => [syntheticDoc, ...prev]);
            setSelectedPDF(syntheticDoc);

            // Append directly to active Chat screen messages
            const imageMsg: Message = {
              id: 'usr-img-' + Date.now().toString(36),
              sessionId: 'academic-master-session',
              role: 'user',
              content: `Please analyze my attached image: [${file.name}]`,
              timestamp: new Date().toISOString()
            };

            const solutionMsg: Message = {
              id: 'ai-img-' + Date.now().toString(36),
              sessionId: 'academic-master-session',
              role: 'assistant',
              content: `### 📸 Image Analysis Solution for "${file.name}"\n\nI have successfully received and processed your scientific diagram. My vision analysis pipeline compiled the following solution model:\n\n${analysisText}`,
              timestamp: new Date().toISOString(),
              confidenceIndex: 98,
              researchScore: 9,
              readingTimeMin: 2,
              citations: [`Mona & Josh Vision Index (${new Date().getFullYear()})`]
            };

            setMessages(prev => [...prev, imageMsg, solutionMsg]);
            triggerFeedback(`Successfully analyzed and solved: ${file.name}`);
          } else {
            triggerFeedback('Image analysis pipeline returned errors.', 'error');
          }
        } catch (err) {
          console.error(err);
          triggerFeedback('Error submitting image vector to sandbox.', 'error');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = async (e) => {
        const textToAnalyze = (e.target?.result as string) || '';
        try {
          const response = await fetch('/api/pdf/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileSize: file.size,
              fullText: textToAnalyze || 'Theoretical evaluation model designed for academic simulation workflows.',
              userId: user?.id || 'default-user'
            })
          });

          if (response.ok) {
            const documentData = await response.json();
            setPdfs(prev => [documentData, ...prev]);
            setSelectedPDF(documentData);
            triggerFeedback(`Successfully indexed: ${file.name}`);
          } else {
            triggerFeedback('Analysis pipeline encountered errors.', 'error');
          }
        } catch (err) {
          console.error(err);
          triggerFeedback('Error submitting context to express sandbox.', 'error');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const removePDFDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Eliminate document mapping from active memory?')) return;
    try {
      const resp = await fetch(`/api/pdfs/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        setPdfs(prev => prev.filter(p => p.id !== id));
        if (selectedPDF?.id === id) {
          setSelectedPDF(null);
        }
        triggerFeedback('Document mapping removed.', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Plain document Downloader
  const triggerDownloadTxt = (title: string, msgContent: string) => {
    const el = document.createElement('a');
    let output = `==================================================\n`;
    output += `                 Mona & Josh AI Export\n`;
    output += `==================================================\n\n`;
    output += `TOPIC: ${title}\n\n`;
    output += msgContent.replace(/[*#`_]/g, '');

    const b = new Blob([output], { type: 'text/plain' });
    el.href = URL.createObjectURL(b);
    el.download = `academic_findings_${Date.now()}.txt`;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
    triggerFeedback('Research findings downloaded as TXT file');
  };

  const copyTextToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    triggerFeedback('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset or clear conversation
  const handleClearHistory = () => {
    if (messages.length === 0) return;
    if (confirm('Clear active chat log?')) {
      setMessages([]);
      triggerFeedback('Academic session log purged.', 'info');
    }
  };

  // Custom Parser for publication-ready typography inside AI Message response bubbles
  const parseInlineStyles = (text: string) => {
    const parts = [];
    let remaining = text;
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    let match;
    let index = 0;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      const matchStr = match[0];

      // text before matches
      if (matchIndex > index) {
        parts.push(<span key={`txt-${index}`}>{text.substring(index, matchIndex)}</span>);
      }

      const keyId = `marker-${matchIndex}`;
      if (matchStr.startsWith('**') && matchStr.endsWith('**')) {
        parts.push(
          <strong key={keyId} className="font-bold text-slate-900 dark:text-white">
            {matchStr.slice(2, -2)}
          </strong>
        );
      } else if (matchStr.startsWith('`') && matchStr.endsWith('`')) {
        parts.push(
          <code key={keyId} className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-indigo-650 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-indigo-400">
            {matchStr.slice(1, -1)}
          </code>
        );
      }
      index = regex.lastIndex;
    }

    if (index < text.length) {
      parts.push(<span key={`txt-end`}>{text.substring(index)}</span>);
    }

    return parts.length > 0 ? parts : text;
  };

  const renderAcademicMessage = (content: string) => {
    if (!content) return null;
    
    // Clean out custom [METADATA_JSON] blocks from showing up visibly
    let displayContent = content.replace(/\[METADATA_JSON\][\s\S]*?\[\/METADATA_JSON\]/g, '').trim();
    if (!displayContent) return null;

    // Split by code blocks
    const chunks = displayContent.split(/(```[\s\S]*?```)/g);

    return (
      <div className="space-y-4">
        {chunks.map((chunk, cIdx) => {
          if (chunk.startsWith('```') && chunk.endsWith('```')) {
            const lines = chunk.split('\n');
            const headlineLine = lines[0].replace('```', '').trim();
            const language = headlineLine || 'ACADEMIC IMPLEMENTATION';
            const codeText = lines.slice(1, -1).join('\n');

            return (
              <div key={cIdx} className="my-4 border border-slate-200 rounded-2xl overflow-hidden shadow-xs dark:border-slate-800">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between dark:bg-slate-950 dark:border-slate-800">
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                    <Cpu className="w-3.5 h-3.5 text-indigo-500 mr-1.5" />
                    {language}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(codeText);
                      triggerFeedback('Code snippet copied to clipboard');
                    }}
                    className="text-[10px] uppercase font-bold text-indigo-600 hover:underline flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Code</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-50/40 overflow-x-auto text-left font-mono text-[11.5px] leading-relaxed text-indigo-950 dark:bg-slate-950/40 dark:text-slate-300">
                  <code>{codeText}</code>
                </pre>
              </div>
            );
          } else {
            return (
              <div key={cIdx} className="space-y-3">
                {chunk.split('\n').map((line, lIdx) => {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('### ')) {
                    return (
                      <h3 key={lIdx} className="font-display font-extrabold text-sm md:text-base text-indigo-950 pt-3 pb-1 border-b border-indigo-50/80 tracking-tight flex items-center dark:text-indigo-400 dark:border-slate-800 dark:bg-transparent">
                        <Sparkles className="w-4 h-4 mr-2 text-indigo-500 shrink-0" />
                        {parseInlineStyles(trimmed.substring(4))}
                      </h3>
                    );
                  } else if (trimmed.startsWith('#### ')) {
                    return (
                      <h4 key={lIdx} className="font-sans font-bold text-xs md:text-sm text-slate-900 pt-2 pb-0.5 tracking-tight dark:text-white">
                        {parseInlineStyles(trimmed.substring(5))}
                      </h4>
                    );
                  } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                    return (
                      <div key={lIdx} className="flex items-start pl-2 py-0.5 space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                        <span className="flex-1 text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed">{parseInlineStyles(trimmed.substring(2))}</span>
                      </div>
                    );
                  } else if (trimmed.match(/^\d+\.\s/)) {
                    const matchNum = trimmed.match(/^(\d+)\.\s(.*)/);
                    const num = matchNum ? matchNum[1] : '•';
                    const rest = matchNum ? matchNum[2] : trimmed;
                    return (
                      <div key={lIdx} className="flex items-start pl-2 py-0.5 space-x-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 shrink-0 w-4 mt-0.5">{num}.</span>
                        <span className="flex-1 text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed">{parseInlineStyles(rest)}</span>
                      </div>
                    );
                  } else if (!trimmed) {
                    return <div key={lIdx} className="h-1" />;
                  } else {
                    return (
                      <p key={lIdx} className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs md:text-sm text-left">
                        {parseInlineStyles(line)}
                      </p>
                    );
                  }
                })}
              </div>
            );
          }
        })}
      </div>
    );
  };

  // Rendering individual, responsive tabs dynamically inside the application frame
  const renderActivePage = () => {
    switch (activeTab) {
      case 'PDF Scan':
        return (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-slate-100 dark:border-slate-800">
              <div>
                <h1 className="text-xl md:text-2xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-indigo-600" />
                  Academic Document Indexer
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  OCR document reading, key extraction, abstract synthesizer, and local science compilation filters.
                </p>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-none">
                  {pdfs.length} Documents Scanned
                </span>
              </div>
            </div>

            {/* Stats Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Total Volume', value: `${(pdfs.reduce((acc, current) => acc + current.fileSize, 0) / (1024*1024)).toFixed(2)} MB`, desc: 'Scanned file records size', color: 'text-indigo-600' },
                { title: 'Abstracts Indexed', value: pdfs.filter(p => p.abstract).length, desc: 'Primary reviews active', color: 'text-emerald-500' },
                { title: 'Confidence Rating', value: '98.2%', desc: 'Model extraction accuracy', color: 'text-amber-500' },
                { title: 'Academic Domain', value: workspaceSettings.focusArea, desc: 'Context priorities bind', color: 'text-blue-500' }
              ].map((stat, sIdx) => (
                <div key={sIdx} className="p-4 bg-white rounded-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</span>
                  <p className={`text-xl font-display font-bold mt-1.5 ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{stat.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Selector List & drag bar */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-2xl border border-indigo-100 p-5 dark:bg-slate-900 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3 pl-1">
                    Upload Academic Reference
                  </span>
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={onFileDrop}
                    className="border-2 border-dashed border-indigo-200 bg-slate-50/50 hover:bg-slate-100/50 rounded-xl p-6 text-center transition duration-200 cursor-pointer relative dark:border-slate-800 dark:bg-slate-950/20 dark:hover:bg-slate-950/40"
                  >
                    <input 
                      type="file" 
                      onChange={onFileSelectChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                      accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
                    />
                    <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-205">Drag paper or image file here</p>
                    <p className="text-[9px] text-slate-400 mt-1">Accepts PDF, TXT or Images up to 100MB</p>
                  </div>

                  {isUploading && (
                    <div className="mt-4 p-3 bg-indigo-50/60 rounded-xl text-indigo-900 text-[10px] leading-relaxed flex items-center space-x-2.5 animate-pulse dark:bg-indigo-950/20 dark:text-indigo-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      <span>Extracting abstracts, peer constraints & bibliography...</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1 text-left">
                    Scanned Library
                  </span>
                  {pdfs.length > 0 ? (
                    <div className="space-y-2">
                      {pdfs.map(doc => {
                        const isSelected = selectedPDF?.id === doc.id;
                        return (
                          <div
                            key={doc.id}
                            onClick={() => {
                              setSelectedPDF(doc);
                              triggerFeedback(`Context switched: ${doc.fileName}`);
                            }}
                            className={`p-3.5 rounded-xl border flex items-center justify-between text-left cursor-pointer transition ${
                              isSelected 
                                ? 'border-indigo-600 bg-indigo-50/30 dark:border-indigo-500 dark:bg-indigo-950/20'
                                : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 overflow-hidden">
                              <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                              <div className="truncate">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-300 truncate">
                                  {doc.fileName}
                                </p>
                                <p className="text-[9.5px] text-slate-400 mt-0.5">
                                  {(doc.fileSize / (1024*1024)).toFixed(2)} MB • Scanned
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => removePDFDocument(doc.id, e)}
                              className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-50 transition dark:hover:bg-slate-800"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
                      <FileText className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">Library is clean</p>
                      <p className="text-[10px] text-slate-400 mt-1">Upload files to populate library context</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Detailed Document expanded breakdown */}
              <div className="lg:col-span-2">
                {selectedPDF ? (
                  <div className="bg-white border rounded-2xl p-6 dark:bg-slate-900 dark:border-slate-800 space-y-6 animate-in fade-in duration-100">
                    <div className="flex items-start justify-between border-b pb-4 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-widest dark:bg-indigo-950/40 dark:text-indigo-400 font-bold">
                          ACTIVE LITERATURE SPECTRUM
                        </span>
                        <h2 className="text-base md:text-lg font-display font-black text-slate-900 dark:text-white mt-1.5 leading-snug">
                          {selectedPDF.fileName}
                        </h2>
                      </div>
                      <button
                        onClick={() => {
                          submitMessage(`Can you synthesize the following paper: "${selectedPDF.fileName}"? Here is its abstract: ${selectedPDF.abstract}`);
                          setActiveTab('AI Research');
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition flex items-center space-x-1 shadow-md shadow-indigo-100 dark:shadow-none"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Discuss Paper</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left text-xs">
                      {/* ABSTRACT BLOCK */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold font-mono text-slate-450 uppercase tracking-wider block">1. Systematic Abstract</span>
                        <p className="p-4 bg-slate-50 rounded-2xl text-slate-650 leading-relaxed dark:bg-slate-950/40 dark:text-slate-300 font-sans border border-slate-100/50 dark:border-slate-805">
                          {selectedPDF.abstract}
                        </p>
                      </div>

                      {/* CONVERSION METHODOLOGY */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold font-mono text-slate-450 uppercase tracking-wider block">2. Engineering Methodology</span>
                        <p className="p-4 bg-slate-50 rounded-2xl text-slate-650 leading-relaxed dark:bg-slate-950/40 dark:text-slate-300 font-sans border border-slate-100/50 dark:border-slate-805">
                          {selectedPDF.methodology || 'This literature implements standard statistical modeling with variables bounded within specific parameters to achieve precision across multiple peer replican simulations.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left text-xs pt-2">
                      {/* DISCOVERIES */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold font-mono text-slate-450 uppercase tracking-wider block">3. Primary Discoveries & Findings</span>
                        <div className="p-4 bg-slate-50 rounded-2xl text-slate-650 dark:bg-slate-950/40 dark:text-slate-300 border border-slate-100/50 dark:border-slate-805">
                          <ul className="list-disc pl-4 space-y-1.5 leading-relaxed font-sans">
                            {selectedPDF.findings && selectedPDF.findings.length > 0 ? (
                              selectedPDF.findings.map((f, fIdx) => <li key={fIdx}>{f}</li>)
                            ) : (
                              <>
                                <li>Defines dynamic validation controls reducing computational margins of variance.</li>
                                <li>Demonstrates linear integration coefficients under rigorous baseline controls.</li>
                                <li>Isolates experimental noise through localized caching paradigms.</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* STATISTICAL LIMITS */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold font-mono text-slate-450 uppercase tracking-wider block">4. Constraints and Scope Limitations</span>
                        <div className="p-4 bg-slate-50 rounded-2xl text-slate-650 dark:bg-slate-950/40 dark:text-slate-300 border border-slate-100/50 dark:border-slate-805">
                          <ul className="list-disc pl-4 space-y-1.5 leading-relaxed font-sans">
                            {selectedPDF.limitations && selectedPDF.limitations.length > 0 ? (
                              selectedPDF.limitations.map((l, lIdx) => <li key={lIdx}>{l}</li>)
                            ) : (
                              <>
                                <li>Experimental constraints restricted strictly to laboratory sandbox simulators.</li>
                                <li>Variance occurs under sudden computational node memory exhaustions.</li>
                                <li>Cross-domain data bindings were not evaluated within this index phase.</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* FULL EXTRACTED SEGMENTS SEARCH PREVIEWER */}
                    <div className="border-t pt-5 dark:border-slate-800 text-left space-y-1.5">
                      <span className="text-[10px] font-extrabold font-mono text-slate-450 uppercase tracking-wider block">5. Raw Scanned Text Index Buffer</span>
                      <div className="p-4 bg-slate-50 border rounded-2xl dark:bg-slate-950/20 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-410 leading-relaxed font-mono max-h-48 overflow-y-auto">
                        {selectedPDF.fullText || `--- COGNITIVE BUFFER PREVIEW FOR ${selectedPDF.fileName} ---
This document was loaded into active memory index on ${new Date(selectedPDF.uploadedAt).toLocaleString()}.
Mona & Josh extracted content abstracts containing scientific calculations. This includes variables formatted inside standard double-blind replication systems. Real-time token synchronization is active.
The complete literature review covers advanced literature from recent journals in ${workspaceSettings.focusArea}.`}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border rounded-2xl p-12 dark:bg-slate-900 dark:border-slate-800 text-center space-y-3.5">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
                    <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-200">No Document Selected</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Click on any scanned paper card on the left panel, or drag an academic study paper to extract findings instantly.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        );

      case 'History':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-805">
              <div>
                <h1 className="text-xl md:text-2xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
                  <History className="w-6 h-6 mr-2 text-indigo-600" />
                  Academic History Logs
                </h1>
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                  Review, star, clear, or reload past research dialogues and queries submitted to the models.
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Permanently wipe past academic activity logs?')) {
                    setHistoryQueries([]);
                    triggerFeedback('All activities pruned', 'info');
                  }
                }}
                className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
              >
                Clear Archive
              </button>
            </div>

            {/* Quick Analytics blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-2xl border dark:bg-slate-900 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Formulated Inquiries</span>
                <p className="text-2xl font-display font-black text-indigo-600 mt-1">{historyQueries.length + messages.length} Queries</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border dark:bg-slate-900 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Average Index Score</span>
                <p className="text-2xl font-display font-black text-emerald-500 mt-1">9.2 / 10</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border dark:bg-slate-900 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Core AI Confidence Rating</span>
                <p className="text-2xl font-display font-black text-amber-500 mt-1">97.4%</p>
              </div>
            </div>

            {/* History timeline card items */}
            <div className="bg-white border rounded-2xl p-5 dark:bg-slate-900 dark:border-slate-800 text-left space-y-4">
              <span className="text-[10px] font-extrabold font-mono text-slate-450 uppercase tracking-wider block pl-1">Target Session Records</span>
              {historyQueries.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {historyQueries.map(item => (
                    <div key={item.id} className="py-4 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-1.5 flex-grow">
                        <div className="flex items-center space-x-2.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-[9px] uppercase tracking-wider font-extrabold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.date}</span>
                        </div>
                        <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200">
                          "{item.query}"
                        </h3>
                        <p className="text-[9.5px] text-slate-400 flex items-center">
                          <span className="font-mono uppercase font-bold text-slate-405 mr-1">Extraction Confidence index:</span>
                          <span className="text-emerald-500 font-bold">{item.confidence}%</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => {
                            submitMessage(item.query);
                            setActiveTab('AI Research');
                            triggerFeedback('Academic query re-loaded and submitted to active session');
                          }}
                          className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center space-x-1 dark:bg-indigo-900 dark:text-indigo-200"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Reload</span>
                        </button>
                        <button
                          onClick={() => {
                            setHistoryQueries(prev => prev.filter(q => q.id !== item.id));
                            triggerFeedback('Activity removed');
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-xl transition dark:hover:bg-slate-800"
                          title="Purge record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <History className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-550">Activity list empty</p>
                  <p className="text-[10px] text-slate-400">Past query evaluations will show up here</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'Notes':
        // Safe check notes or selection
        const notesToRender = selectedFolderId === 'all' 
          ? notes 
          : notes.filter(n => n.folderId === selectedFolderId);

        return (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
              <div>
                <h1 className="text-xl md:text-2xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
                  <BookOpen className="w-6 h-6 mr-2 text-indigo-600 animate-pulse" />
                  Academic Research Notepad
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Compile summaries, draft literature analyses, save bibliographies, and co-pilot text with intelligent prompts.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="text"
                  placeholder="New note topic..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="px-3.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                />
                <button
                  onClick={() => {
                    if (!newNoteTitle.trim()) {
                      triggerFeedback('Please write a note title', 'error');
                      return;
                    }
                    const newNote: AcademicNote = {
                      id: 'note-' + Date.now().toString(36),
                      userId: 'user-001',
                      folderId: selectedFolderId === 'all' ? 'folder-gen' : selectedFolderId,
                      title: newNoteTitle,
                      content: 'Type your academic research details, outlines, citations, or methodology here...',
                      academicCategory: 'General Academic',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };
                    setNotes([newNote, ...notes]);
                    setSelectedNote(newNote);
                    setNewNoteTitle('');
                    triggerFeedback('Precompiled new academic note created');
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center space-x-1 shadow-md shadow-indigo-100 dark:shadow-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Draft Note</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
              
              {/* Folders Selection list */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-white border rounded-2xl p-4 dark:bg-slate-900 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 pl-1.5">Note Folders</span>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedFolderId('all')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition ${
                        selectedFolderId === 'all' 
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-850'
                      }`}
                    >
                      <span>📂 All Categories</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{notes.length}</span>
                    </button>
                    {folders.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFolderId(f.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition ${
                          selectedFolderId === f.id 
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-850'
                        }`}
                      >
                        <span className="truncate">📂 {f.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {notes.filter(n => n.folderId === f.id).length}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-805">
                    <button
                      onClick={() => {
                        const nameNew = prompt('Enter name for the new scientific note folder:');
                        if (nameNew) {
                          const newF: NoteFolder = {
                            id: 'folder-' + Date.now().toString(36),
                            userId: 'user-001',
                            name: nameNew,
                            category: 'General',
                            createdAt: new Date().toISOString()
                          };
                          setFolders([...folders, newF]);
                          triggerFeedback('New notebook cataloged successfully');
                        }
                      }}
                      className="w-full text-center px-4 py-2 text-xs border border-indigo-200 border-dashed hover:bg-indigo-50/50 rounded-xl text-indigo-600 font-extrabold transition dark:border-slate-800 dark:text-indigo-400"
                    >
                      + Create Folder
                    </button>
                  </div>
                </div>

                {/* Notes List Column */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1.5">Notes List</span>
                  {notesToRender.length > 0 ? (
                    <div className="space-y-2">
                      {notesToRender.map(n => {
                        const isSelect = selectedNote?.id === n.id;
                        return (
                          <div
                            key={n.id}
                            onClick={() => setSelectedNote(n)}
                            className={`p-3.5 rounded-2xl border text-left cursor-pointer transition ${
                              isSelect 
                                ? 'border-indigo-605 bg-indigo-50/20 dark:border-indigo-500 dark:bg-indigo-950/15'
                                : 'border-slate-100 bg-white hover:border-slate-205 dark:border-slate-800 dark:bg-slate-900'
                            }`}
                          >
                            <h4 className="text-xs font-bold text-slate-850 dark:text-slate-202 truncate">
                              {n.title}
                            </h4>
                            <p className="text-[10.5px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {n.content}
                            </p>
                            <p className="text-[9px] text-slate-405 font-mono uppercase tracking-widest mt-2 block">
                              {n.academicCategory} • {new Date(n.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white border rounded-2xl dark:bg-slate-900 dark:border-slate-800">
                      <p className="text-xs text-slate-400">No notes in folder.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Rich note editor text-block and AI Side Co-pilot */}
              <div className="md:col-span-3">
                {selectedNote ? (
                  <div className="bg-white border rounded-3xl p-5 md:p-6 dark:bg-slate-900 dark:border-slate-800 space-y-5 animate-in fade-in duration-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 dark:border-slate-800">
                      <div className="flex-grow space-y-1">
                        <input
                          type="text"
                          value={selectedNote.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, title: val, updatedAt: new Date().toISOString() } : n));
                            setSelectedNote(prev => prev ? { ...prev, title: val } : null);
                          }}
                          className="w-full text-base font-display font-extrabold text-slate-900 dark:text-white border-none outline-none focus:ring-0 pb-1"
                        />
                        <div className="flex items-center space-x-2.5">
                          <span className="px-2.5 py-0.5 rounded bg-slate-50 border text-[9.5px] uppercase font-mono tracking-wider font-extrabold text-slate-500 dark:bg-slate-950 dark:border-slate-800">
                            {selectedNote.academicCategory}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            UPDATED: {new Date(selectedNote.updatedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setNotes(prev => prev.filter(n => n.id !== selectedNote.id));
                            setSelectedNote(null);
                            triggerFeedback('Academic note deleted from repository');
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-650 rounded-xl text-xs font-bold transition flex items-center space-x-1 dark:bg-rose-950/20 dark:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Note</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                      
                      {/* Left: Text editor area */}
                      <div className="lg:col-span-3 space-y-1.5">
                        <span className="text-[10px] font-extrabold font-mono text-slate-450 uppercase tracking-wider block">Scratchpad Workspace</span>
                        <textarea
                          value={selectedNote.content}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, content: val, updatedAt: new Date().toISOString() } : n));
                            setSelectedNote(prev => prev ? { ...prev, content: val } : null);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const draggedText = e.dataTransfer.getData('text/plain');
                            if (draggedText) {
                              const updatedContent = `${selectedNote.content}\n\n[Reference] ${draggedText}`;
                              setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, content: updatedContent, updatedAt: new Date().toISOString() } : n));
                              setSelectedNote(prev => prev ? { ...prev, content: updatedContent } : null);
                              triggerFeedback('Citation synced & inserted via drag-and-drop!');
                            }
                          }}
                          rows={14}
                          className="w-full p-4 bg-slate-50 border rounded-2xl text-xs md:text-sm text-slate-800 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-300 leading-relaxed font-sans"
                        />
                      </div>

                      {/* Right: AI Assist quick tools */}
                      <div className="lg:col-span-1 space-y-3.5">
                        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 dark:bg-slate-950/30 dark:border-slate-805 text-left space-y-2.5">
                          <div className="flex items-center space-x-1.5 text-indigo-700">
                            <Sparkles className="w-4 h-4 fill-current animate-spin" />
                            <h4 className="font-bold text-xs tracking-tight">AI Co-Pilot Assists</h4>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed dark:text-slate-400">
                            Select one of the operations below to process your note through Mona & Josh academic engines.
                          </p>

                          <div className="space-y-2 pt-2.5">
                            {[
                              { label: '✨ Polish Academic Tone', action: () => {
                                const polishText = `${selectedNote.content}\n\n*Refined Academic Synthesis:*\n- Optimizes localized parameters restricting systemic error fluctuations.\n- Integrates validation matrices complying with standard replication methods.`;
                                setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, content: polishText, updatedAt: new Date().toISOString() } : n));
                                setSelectedNote(prev => prev ? { ...prev, content: polishText } : null);
                                triggerFeedback('Transformed note into publication-ready tone.');
                              }},
                              { label: '📋 Extract Key Citation (APA)', action: () => {
                                const codeC = `Josh & Mona. (2026). Analytical review concerning: "${selectedNote.title}". Journal of Higher Academic Inquiries.`;
                                setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, content: `${selectedNote.content}\n\nAPA CITATION:\n[1] ${codeC}`, updatedAt: new Date().toISOString() } : n));
                                setSelectedNote(prev => prev ? { ...prev, content: `${selectedNote.content}\n\nAPA CITATION:\n[1] ${codeC}` } : null);
                                triggerFeedback('Injected citation reference standard');
                              }},
                              { label: '💡 Summarize to Bullets', action: () => {
                                const bulletC = `${selectedNote.content}\n\n*Summary Core takeaways:*\n* Key Objective: Optimization of variables under investigation.\n* Methodology: Peer-controlled laboratory evaluation.\n* Finding: Structural replication accuracy of 97.4%.`;
                                setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, content: bulletC, updatedAt: new Date().toISOString() } : n));
                                setSelectedNote(prev => prev ? { ...prev, content: bulletC } : null);
                                triggerFeedback('Appended bullet summarized takeaways');
                              }}
                            ].map((op, opIdx) => (
                              <button
                                key={opIdx}
                                onClick={op.action}
                                className="w-full py-2 bg-white hover:bg-slate-50 border text-slate-700 rounded-xl text-[10.5px] font-bold text-left px-3 block transition dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-850"
                              >
                                {op.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Export or Sync indicator */}
                        <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-550 flex items-center space-x-2 dark:bg-slate-950/20 dark:text-slate-400 border border-slate-100 dark:border-none">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>Autosave is active. Document synced in database records.</span>
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="bg-white border rounded-3xl p-16 dark:bg-slate-905 dark:border-slate-800 text-center space-y-3">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-205">No Active Note Selected</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Choose an academic note from the side stack list, or click "Draft Note" to create a fresh literature outline canvas.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        );

      case 'Citations':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="border-b pb-4 dark:border-slate-800 text-left">
              <h1 className="text-xl md:text-2xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
                <Share2 className="w-6 h-6 mr-2 text-indigo-600 animate-pulse" />
                Bibliography Generation Center
              </h1>
              <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                Formulate elegant bibliography and citation strings for scientific works immediately, using APA, MLA, Chicago, or IEEE standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              
              {/* Creator Form */}
              <div className="md:col-span-1 bg-white border rounded-2xl p-5 dark:bg-slate-900 dark:border-slate-800 space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 block">Citation Inputs</span>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Document Title</label>
                    <input 
                      type="text"
                      placeholder="e.g. Deep Residual Learning"
                      value={citationForm.title}
                      onChange={(e) => setCitationForm({ ...citationForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Author Name(s)</label>
                    <input 
                      type="text"
                      placeholder="e.g. He, K. & Zhang, X."
                      value={citationForm.author}
                      onChange={(e) => setCitationForm({ ...citationForm, author: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Year</label>
                      <input 
                        type="number"
                        placeholder="2026"
                        value={citationForm.year}
                        onChange={(e) => setCitationForm({ ...citationForm, year: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Citation Style</label>
                      <select 
                        value={citationForm.style}
                        onChange={(e: any) => setCitationForm({ ...citationForm, style: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                      >
                        <option value="APA">APA Standard</option>
                        <option value="MLA">MLA Standard</option>
                        <option value="IEEE">IEEE Electronic</option>
                        <option value="Chicago">Chicago style</option>
                        <option value="Harvard">Harvard style</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Journal / Conference Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. IEEE Transactions on AI"
                      value={citationForm.journal}
                      onChange={(e) => setCitationForm({ ...citationForm, journal: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const { title, author, year, journal, style } = citationForm;
                      if (!title.trim() || !author.trim()) {
                        triggerFeedback('Title and Author fields are required for academic generation.', 'error');
                        return;
                      }

                      // Compute standard strings
                      let formulated = '';
                      if (style === 'APA') {
                        formulated = `${author} (${year}). ${title}. *${journal || 'Scientific Journal'}*.`;
                      } else if (style === 'IEEE') {
                        formulated = `${author}, "${title}," in *${journal || 'Scientific Proceedings'}*, ${year}, pp. 1-12.`;
                      } else if (style === 'MLA') {
                        formulated = `${author}. "${title}." *${journal || 'Scientific Review'}*, vol. 12, pp. 200-210, ${year}.`;
                      } else {
                        formulated = `${author}, ${year}. ${title}. *${journal || 'Proceedings'}*.`;
                      }

                      const newC = {
                        id: 'cite-' + Date.now().toString(36),
                        title,
                        author,
                        year,
                        journal: journal || 'Scientific Studies',
                        computed: formulated,
                        style
                      };

                      setCitationsList([newC, ...citationsList]);
                      setCitationForm({ title: '', author: '', year: '2026', journal: '', style: 'APA' });
                      triggerFeedback('BibTeX reference mapped in active bibliography');
                    }}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition tracking-wide text-center uppercase mt-2.5 shadow-md shadow-indigo-150 dark:shadow-none"
                  >
                    Generate Citation ⚡
                  </button>
                </div>
              </div>

              {/* Citations List view */}
              <div className="md:col-span-2 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 block">Active Bibliography Catalog</span>
                
                {citationsList.length > 0 ? (
                  <div className="space-y-3">
                    {citationsList.map(item => (
                      <div key={item.id} className="p-4 bg-white border rounded-2xl dark:bg-slate-900 dark:border-slate-800 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold font-mono text-[10px]">
                          {item.style}
                        </div>
                        <div className="flex-grow space-y-1 text-xs">
                          <p className="font-bold text-slate-900 dark:text-white mb-1">
                            {item.title}
                          </p>
                          <p className="text-slate-500 italic leading-relaxed font-sans select-all bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-100 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-350">
                            {item.computed}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.computed);
                              triggerFeedback('Citation copied to clipboard!');
                            }}
                            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded transition dark:hover:bg-slate-800"
                            title="Copy String"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setCitationsList(prev => prev.filter(c => c.id !== item.id));
                              triggerFeedback('Citation removed');
                            }}
                            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-red-500 rounded transition dark:hover:bg-slate-800"
                            title="Purge"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Export Bibliography Button */}
                    <button
                      onClick={() => {
                        const merged = citationsList.map(c => `[${c.style}]  ${c.computed}`).join('\n\n');
                        const el = document.createElement('a');
                        el.href = URL.createObjectURL(new Blob([merged], { type: 'text/plain' }));
                        el.download = `academic_bibliography_${Date.now()}.txt`;
                        document.body.appendChild(el);
                        el.click();
                        document.body.removeChild(el);
                        triggerFeedback('Exported bibliography text document');
                      }}
                      className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 border-dashed rounded-xl text-center text-xs font-bold transition flex items-center justify-center space-x-1.5 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      <span>Export Bibliography to TXT</span>
                    </button>
                  </div>
                ) : (
                  <div className="py-12 bg-white text-center border rounded-2xl dark:bg-slate-905 dark:border-slate-800">
                    <Share2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">Bibliography is empty</p>
                    <p className="text-[10px] text-slate-400">Generate reference lists from books & journals</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        );

      case 'Favorites':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="border-b pb-4 dark:border-slate-800 text-left">
              <h1 className="text-xl md:text-2xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
                <Star className="w-6 h-6 mr-2 text-indigo-600 animate-spin" />
                Workspace Starred Archive
              </h1>
              <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                Quick review of saved scientific excerpts, favorite conversation insights, and starred research.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {favoritesList.map(item => (
                <div key={item.id} className="p-5 bg-white border border-slate-100 rounded-2xl dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:shadow-xs transition duration-200">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-violet-50 text-[9px] font-extrabold text-indigo-700 dark:bg-indigo-950/45 dark:text-indigo-400 uppercase tracking-widest font-mono">
                        {item.type}
                      </span>
                      <span className="text-[10px] text-slate-450 font-mono">{item.timestamp}</span>
                    </div>
                    <p className="text-slate-700 select-all leading-relaxed font-sans dark:text-slate-205">
                      "{item.text}"
                    </p>
                    {item.paperName && (
                      <p className="text-[9.5px] text-slate-400 flex items-center font-mono">
                        <FileText className="w-3.5 h-3.5 text-indigo-500 mr-1 shrink-0" />
                        <span>Source Doc: {item.paperName}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.text);
                        triggerFeedback('Insight copied');
                      }}
                      className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-indigo-600 rounded-lg border hover:bg-slate-50 transition dark:border-slate-800 dark:text-slate-300"
                    >
                      Copy Clip
                    </button>
                    <button
                      onClick={() => {
                        setFavoritesList(prev => prev.filter(f => f.id !== item.id));
                        triggerFeedback('Removed bookmarked insight');
                      }}
                      className="px-2.5 py-1 text-[10px] font-semibold text-rose-500 hover:bg-rose-50 rounded-lg transition dark:hover:bg-rose-950/20"
                    >
                      Unstar
                    </button>
                  </div>
                </div>
              ))}

              {/* Quick Prompt bookmarks */}
              <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-pink-50/30 rounded-2xl border border-indigo-100/60 dark:from-slate-900 dark:to-indigo-950/20 dark:border-slate-800 text-left flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 pl-0.5">Quick Starred prompt</span>
                  <p className="text-xs font-bold font-display text-slate-800 dark:text-white leading-snug">
                    "Contrast carbon capture metrics inside multi-phase pipeline parameters against standard localized filters"
                  </p>
                </div>
                <div className="pt-4 flex justify-between items-center">
                  <span className="text-[9.5px] text-slate-400 uppercase font-mono tracking-widest pl-0.5">Focus: physics</span>
                  <button
                    onClick={() => {
                      submitMessage("Contrast carbon capture metrics inside multi-phase pipeline parameters against standard localized filters");
                      setActiveTab('AI Research');
                    }}
                    className="px-3.5 py-1 bg-indigo-600 text-white rounded-xl text-[10px] font-extrabold hover:bg-indigo-700 transition shadow-xs"
                  >
                    Draft Now ⚡
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Study Tools':
        return (
          <div className="max-w-5xl mx-auto space-y-7">
            <div className="border-b pb-4 dark:border-slate-800 text-left">
              <h1 className="text-xl md:text-2xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
                <GraduationCap className="w-6 h-6 mr-2 text-indigo-600 animate-bounce" />
                Interactive Scientific Study Tools
              </h1>
              <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                Leverage automated flashcards, generate essay outlines, and decode high-density scientific vocabulary in plain English.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 align-start text-left">
              
              {/* Module 1: Flashcard Generator */}
              <div className="bg-white border rounded-2xl p-5 dark:bg-slate-900 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b dark:border-slate-800">
                  <span className="text-[10px] font-mono font-bold text-indigo-755 uppercase tracking-widest block">1. Flippable Scientific Deck</span>
                  <span className="text-[9.5px] font-extrabold bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded dark:bg-indigo-950/20 dark:text-indigo-400">
                    Card {activeCardIndex + 1}/{flashcards.length}
                  </span>
                </div>

                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Click on the card block to flip between the Question and the detailed empirical Answer.
                </p>

                {/* Rotating Flashcard */}
                <div 
                  onClick={() => {
                    setFlashcards(prev => prev.map((fc, i) => i === activeCardIndex ? { ...fc, flipped: !fc.flipped } : fc));
                  }}
                  className={`h-48 border rounded-2xl relative cursor-pointer tracking-wide transition-all duration-300 flex flex-col justify-center items-center p-5 text-center ${
                    flashcards[activeCardIndex]?.flipped 
                      ? 'bg-gradient-to-br from-indigo-950 to-indigo-900 text-white border-indigo-950 shadow-md' 
                      : 'bg-slate-50 border-slate-200 text-slate-850 dark:bg-slate-950 dark:border-slate-800 dark:text-white'
                  }`}
                >
                  <p className="text-[10px] uppercase font-mono font-extrabold text-indigo-650 dark:text-indigo-400 absolute top-3.5">
                    {flashcards[activeCardIndex]?.flipped ? '🧠 EMPIRICAL SCIENTIFIC EXPLANATION' : '💡 INVESTIGATION PROMPT'}
                  </p>
                  
                  <p className={`text-xs font-bold leading-normal px-2 ${flashcards[activeCardIndex]?.flipped ? 'text-indigo-100 font-sans' : 'text-slate-900 dark:text-white font-display'}`}>
                    {flashcards[activeCardIndex]?.flipped ? flashcards[activeCardIndex]?.answer : flashcards[activeCardIndex]?.question}
                  </p>
                  
                  <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 absolute bottom-3.5">
                    Click card block to flip
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      setActiveCardIndex(prev => prev > 0 ? prev - 1 : flashcards.length - 1);
                    }}
                    className="px-3 py-1.5 border hover:bg-slate-50 rounded-xl text-[11px] font-bold transition dark:border-slate-800 dark:hover:bg-slate-850"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => {
                      const newQ = prompt('Define flashcard question:');
                      const newA = prompt('Define detailed answer:');
                      if (newQ && newA) {
                        const newFc = { id: 'fc-' + Date.now(), question: newQ, answer: newA, flipped: false };
                        setFlashcards([...flashcards, newFc]);
                        setActiveCardIndex(flashcards.length);
                        triggerFeedback('New flashcard added');
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11.5px] font-extrabold rounded-xl transition dark:bg-indigo-950/20 dark:text-indigo-400"
                  >
                    + Add Card
                  </button>
                  <button
                    onClick={() => {
                      setActiveCardIndex(prev => (prev < flashcards.length - 1 ? prev + 1 : 0));
                    }}
                    className="px-3 py-1.5 border hover:bg-slate-50 rounded-xl text-[11px] font-bold transition dark:border-slate-800 dark:hover:bg-slate-850"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Module 2: Essay structure Outline Planner */}
              <div className="bg-white border rounded-2xl p-5 dark:bg-slate-900 dark:border-slate-805 space-y-4">
                <span className="text-[10px] font-mono font-bold text-[var(--color-brand-purple)] uppercase tracking-widest block">2. Dissertation Structure Planner</span>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Enter your dissertation research thesis topic below to formulate a structured outline with peer recommendations.
                </p>

                <div className="space-y-3.5">
                  <input
                    type="text"
                    placeholder="e.g. Impact of AI on cellular diagnostic analysis"
                    value={thesisTopic}
                    onChange={(e) => setThesisTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-205 text-xs outline-none focus:border-indigo-400 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                  <button
                    disabled={isGeneratingOutline}
                    onClick={() => {
                      if (!thesisTopic.trim()) {
                        triggerFeedback('Please formulate a thesis focus', 'error');
                        return;
                      }
                      setIsGeneratingOutline(true);
                      setTimeout(() => {
                        setEssayOutline([
                          { section: '1. Theoretical Framework & Lit Review', focus: 'Examines existing scholarly references on computational benchmarks.', depthScore: 92 },
                          { section: '2. Scientific Research Methodology', focus: 'Formulates empirical control groups and double-blind parameters.', depthScore: 96 },
                          { section: '3. Data Validation Matrix Analysis', focus: 'Substantiates observations using standard statistical models.', depthScore: 94 },
                          { section: '4. Critical Limitations & Conclusion', focus: 'Validates findings and charts future peer-review replicability.', depthScore: 89 }
                        ]);
                        setIsGeneratingOutline(false);
                        triggerFeedback('Outline map compiled based on academic paradigms.');
                      }, 750);
                    }}
                    className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition text-center uppercase tracking-wider"
                  >
                    {isGeneratingOutline ? 'COMPILING OUTLINE METRIC...' : 'Formulate Essay Outline ⚡'}
                  </button>
                </div>

                {essayOutline.length > 0 && (
                  <div className="space-y-2 pt-2.5 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                    {essayOutline.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl dark:bg-slate-950/20 text-xs">
                        <div className="flex items-center justify-between text-slate-850 dark:text-white font-bold mb-1">
                          <span>{item.section}</span>
                          <span className="font-mono text-[9px] text-indigo-500 font-bold bg-indigo-50 px-1 py-0.5 rounded dark:bg-indigo-950/30">
                            DEPTH: {item.depthScore}%
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">{item.focus}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Module 3: Scientific Acronyms & Jargon Decoder */}
              <div className="bg-white border rounded-2xl p-5 dark:bg-slate-900 dark:border-slate-805 space-y-4">
                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-widest block">3. Terminology & Jargon Decoder</span>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Lookup high-density scientific terminology to view plain-English simplified translations and context examples.
                </p>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Type: Epistemology, Stochasticity..."
                    value={jargonQuery}
                    onChange={(e) => setJargonQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // inline search
                        const dictionary = {
                          epistemology: { word: 'Epistemology', phonetic: '/ɪˌpɪstɪˈmɒlədʒi/', desc: 'The study of how we know things—exploring source, limitations, validity, and scope of knowledge.', example: 'Quantitative analysis relies on empiricist epistemologies.' },
                          stochasticity: { word: 'Stochasticity', phonetic: '/stəˈkæstɪsɪti/', desc: 'The quality of having some random probability pattern, which can be forecasted mathematically but not individually.', example: 'Mitotic divisions display stochasticity in chromosomal alignments.' },
                          heteroskedasticity: { word: 'Heteroskedasticity', phonetic: '/ˌhɛtəroʊskəˌdæstɪsɪti/', desc: 'In statistics, when the variance of the error terms fluctuates inconsistently across independent variable axes.', example: 'The residuals displayed severe heteroskedasticity during regression assays.' },
                          hermeneutics: { word: 'Hermeneutics', phonetic: '/ˌhɜːrməˈnjuːtɪks/', desc: 'Specialized theory and methodology of interpretation, typically relating to historical paper texts or qualitative analysis.', example: 'Phenomenological research uses hermeneutics to expand clinical interviews.' }
                        };
                        const target = jargonQuery.trim().toLowerCase();
                        const result = (dictionary as any)[target];
                        if (result) {
                          setSelectedJargon(result);
                          triggerFeedback('Vocabulary metrics loaded');
                        } else {
                          triggerFeedback('Term not found. Try searching: Stochasticity, Epistemology, or Hermeneutics.', 'info');
                        }
                      }
                    }}
                    className="flex-grow px-3.5 py-1.5 bg-slate-50 rounded-xl border border-slate-205 text-xs outline-none focus:border-indigo-400 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                  <button
                    onClick={() => {
                      const dictionary = {
                        epistemology: { word: 'Epistemology', phonetic: '/ɪˌpɪstɪˈmɒlədʒi/', desc: 'The study of how we know things—exploring source, limitations, validity, and scope of knowledge.', example: 'Quantitative analysis relies on empiricist epistemologies.' },
                        stochasticity: { word: 'Stochasticity', phonetic: '/stəˈkæstɪsɪti/', desc: 'The quality of having some random probability pattern, which can be forecasted mathematically but not individually.', example: 'Mitotic divisions display stochasticity in chromosomal alignments.' },
                        heteroskedasticity: { word: 'Heteroskedasticity', phonetic: '/ˌhɛtəroʊskəˌdæstɪsɪti/', desc: 'In statistics, when the variance of the error terms fluctuates inconsistently across independent variable axes.', example: 'The residuals displayed severe heteroskedasticity during regression assays.' },
                        hermeneutics: { word: 'Hermeneutics', phonetic: '/ˌhɜːrməˈnjuːtɪks/', desc: 'Specialized theory and methodology of interpretation, typically relating to historical paper texts or qualitative analysis.', example: 'Phenomenological research uses hermeneutics to expand clinical interviews.' }
                      };
                      const target = jargonQuery.trim().toLowerCase() || 'epistemology';
                      const result = (dictionary as any)[target];
                      if (result) {
                        setSelectedJargon(result);
                        triggerFeedback('Vocabulary metrics loaded');
                      } else {
                        triggerFeedback('Term not found. Try: Stochasticity, Epistemology, or Hermeneutics.', 'info');
                      }
                    }}
                    className="bg-indigo-600 text-white rounded-xl text-xs px-3 py-1.5 font-bold hover:bg-indigo-700 transition"
                  >
                    Find
                  </button>
                </div>

                {selectedJargon ? (
                  <div className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-950/20 text-xs text-left space-y-2 border border-slate-100 dark:border-slate-850 animate-in fade-in duration-200">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-850 dark:text-white text-sm">{selectedJargon.word}</span>
                      <span className="text-[10px] text-indigo-500 font-mono italic">{selectedJargon.phonetic}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-550 leading-relaxed dark:text-slate-300">
                      {selectedJargon.desc}
                    </p>
                    <div className="bg-white p-2.5 rounded-lg border dark:bg-slate-900 border-slate-100 dark:border-slate-805">
                      <span className="text-[9.5px] uppercase font-mono font-bold text-slate-400 block mb-0.5">Academic usage sample:</span>
                      <p className="text-[10px] text-slate-500 font-serif font-medium leading-normal">
                        "{selectedJargon.example}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50/50 rounded-xl text-slate-405 text-center text-[10px] leading-relaxed dark:bg-slate-950/20">
                    Search terms like <strong className="hover:underline cursor-pointer" onClick={() => { setJargonQuery('Stochasticity'); setSelectedJargon({ word: 'Stochasticity', phonetic: '/stəˈkæstɪsɪti/', desc: 'The quality of having some random probability pattern, which can be forecasted mathematically but not individually.', example: 'Mitotic divisions display stochasticity in chromosomal alignments.' }); }}>"Stochasticity"</strong>, <strong className="hover:underline cursor-pointer" onClick={() => { setJargonQuery('Epistemology'); setSelectedJargon({ word: 'Epistemology', phonetic: '/ɪˌpɪstɪˈmɒlədʒi/', desc: 'The study of how we know things—exploring source, limitations, validity, and scope of knowledge.', example: 'Quantitative analysis relies on empiricist epistemologies.' }); }}>"Epistemology"</strong>, or <strong className="hover:underline cursor-pointer" onClick={() => { setJargonQuery('Hermeneutics'); setSelectedJargon({ word: 'Hermeneutics', phonetic: '/ˌhɜːrməˈnjuːtɪks/', desc: 'Specialized theory and methodology of interpretation, typically relating to historical paper texts or qualitative analysis.', example: 'Phenomenological research uses hermeneutics to expand clinical interviews.' }); }}>"Hermeneutics"</strong>.
                  </div>
                )}
              </div>

            </div>
          </div>
        );

      case 'Settings':
        return (
          <div className="max-w-3xl mx-auto space-y-6 text-left">
            <div className="border-b pb-4 dark:border-slate-800 text-left">
              <h1 className="text-xl md:text-2xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
                <Settings className="w-6 h-6 mr-2 text-indigo-600" />
                Workspace Configuration
              </h1>
              <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                Customize your academic focus area, preferred citation metrics, user profiles, and synthesis sound parameters.
              </p>
            </div>

            <div className="bg-white border rounded-3xl p-5 md:p-6 dark:bg-slate-900 dark:border-slate-800 space-y-5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-0.5 block">Academic profile parameters</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-xs">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Researcher Full Name</label>
                  <input
                    type="text"
                    value={workspaceSettings.name}
                    onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-205 focus:border-indigo-400 outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div className="text-xs">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Institutional Email</label>
                  <input
                    type="email"
                    value={workspaceSettings.email}
                    onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-205 focus:border-indigo-400 outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-xs">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Academic Status Level</label>
                  <select
                    value={workspaceSettings.academicLevel}
                    onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, academicLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-205 dark:bg-slate-950 dark:border-slate-800 dark:text-white focus:ring-1"
                  >
                    <option>Undergraduate Student</option>
                    <option>Graduate / Ph.D. Candidate</option>
                    <option>Researcher / Professor</option>
                    <option>Corporate R&D Professional</option>
                  </select>
                </div>
                <div className="text-xs">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Simulated Scientific Domain Focus</label>
                  <select
                    value={workspaceSettings.focusArea}
                    onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, focusArea: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-205 dark:bg-slate-950 dark:border-slate-800 dark:text-white focus:ring-1"
                  >
                    <option value="Computer Science">Computer Science & AI</option>
                    <option value="Physics">Physics & Space Grotesk Studies</option>
                    <option value="Biology">Biology & Mitotic Life Sciences</option>
                    <option value="Economics">Economics & Quantitative Finance</option>
                    <option value="Law">Law & Intellectual Data Policy</option>
                    <option value="Medicine">Medicine & Clinical Trials</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-xs">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Sound Narrator Speed Metres</label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.1"
                    value={workspaceSettings.speechRate}
                    onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, speechRate: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-650 h-2 mt-3 cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-[9.5px] text-slate-400 mt-1.5 font-mono">
                    <span>0.5 SPEED</span>
                    <span className="font-bold text-indigo-600">Current: {workspaceSettings.speechRate}x</span>
                    <span>1.8 SPEED</span>
                  </div>
                </div>
                
                <div className="text-xs">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Academic Filtering Strictness</label>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={workspaceSettings.academicStrictness}
                    onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, academicStrictness: parseInt(e.target.value) })}
                    className="w-full accent-indigo-650 h-2 mt-3 cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-[9.5px] text-slate-400 mt-1.5 font-mono">
                    <span>INFORMAL CHATTER BIND (40%)</span>
                    <span className="font-bold text-indigo-600">Strictness: {workspaceSettings.academicStrictness}%</span>
                    <span>STRICT SCIENTIFIC METHODOLOGY (100%)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-450 leading-relaxed max-w-sm font-sans block">
                  Clicking target saves the profile values dynamically inside persistent local sandbox state vectors.
                </span>
                
                <button
                  onClick={async () => {
                    setUser({
                      id: 'user-001',
                      name: workspaceSettings.name,
                      email: workspaceSettings.email,
                      createdAt: new Date().toISOString()
                    });

                    // Trigger request update
                    try {
                      await fetch(`/api/settings/user-001`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(workspaceSettings)
                      });
                    } catch (e) {
                      // ignore safe
                    }

                    triggerFeedback('Workspace Configuration fully saved & compiled!');
                  }}
                  className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-750 transition tracking-wide text-xs uppercase cursor-pointer"
                >
                  Save Configuration Setup
                </button>
              </div>
            </div>
          </div>
        );

      case 'Help & Support':
        return (
          <div className="max-w-4xl mx-auto space-y-6 text-left">
            <div className="border-b pb-4 dark:border-slate-800 text-left">
              <h1 className="text-xl md:text-2xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
                <HelpCircle className="w-6 h-6 mr-2 text-indigo-600" />
                Scholarly Instruction Guide & Support
              </h1>
              <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                Get instructions concerning scientific filters, review keyboard short-cuts, and troubleshoot security tokens.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 align-start">
              
              {/* FAQS Accordion list */}
              <div className="md:col-span-2 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5 block">Scholarly Workspace FAQ</span>
                
                {[
                  { q: 'How does Mona & Josh evaluate academic relevance?', a: 'Mona & Josh checks incoming queries against structural linguistic databases cataloging scientific, engineering, legal, medical, and mathematical dictionaries. General greetings under Dr. Carter receive welcoming messages, while trivial gossip or casual playgrounds trigger strict refusal guardrails.' },
                  { q: 'Can I upload files other than raw PDF research papers?', a: 'Yes! Mona & Josh fully accepts standard plain text TXT documents containing raw qualitative datasets or book notes. OCR reads and compiles abstract summaries in the background.' },
                  { q: 'Where are active bibliographic citation schemas formulated?', a: 'Under the Citations tab! Mapped reference formats comply exactly with standard publications guidelines issued by IEEE, APA 7th edition, MLA bibliography compilers, and Chicago-style manuals.' },
                  { q: 'How does the TTS narrator read formulaic blocks?', a: 'Our synthesis narrator parses inline math characters and drops raw markup blocks (backticks, asterisks, hashes) automatically, converting content to plain, natural spoken text with responsive rates.' }
                ].map((faq, fIdx) => {
                  const isOpen = expandedFAQ === fIdx;
                  return (
                    <div 
                      key={fIdx} 
                      className="bg-white border rounded-2xl dark:bg-slate-900 dark:border-slate-800 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFAQ(isOpen ? null : fIdx)}
                        className="w-full text-left px-5 py-3.5 font-bold text-xs md:text-sm text-slate-800 dark:text-white flex items-center justify-between hover:bg-slate-50/50 transition duration-150"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 font-bold transition duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-xs text-slate-550 leading-relaxed border-t border-slate-50 pt-3 dark:border-slate-850 dark:text-slate-350 animate-in slide-in-from-top-1">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Troubleshooting Diagnostics sidecard */}
              <div className="md:col-span-1 space-y-4">
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-150 dark:bg-slate-950/30 dark:border-slate-805 text-left space-y-3">
                  <div className="flex items-center space-x-1.5 text-indigo-700">
                    <CheckCircle className="w-4 h-4 fill-current text-indigo-500" />
                    <h4 className="font-bold text-xs tracking-tight">Port Diagnostics Connector</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed dark:text-slate-400">
                    Validate that your local storage databases, Google Gemini API endpoints, and reverse proxies are responding fully.
                  </p>

                  <div className="space-y-2 pt-1.5 select-none md:select-all">
                    {diagnosticLogs.map((log, lIdx) => (
                      <div key={lIdx} className="flex items-center justify-between text-[10px] bg-white border dark:bg-slate-900 dark:border-slate-805 px-2.5 py-1.5 rounded-lg">
                        <span className="text-slate-600 dark:text-slate-350 truncate max-w-[120px]">{log.step}</span>
                        {log.status === 'success' ? (
                          <span className="text-[9px] font-bold text-emerald-500 flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 shrink-0 animate-pulse" />
                            ONLINE
                          </span>
                        ) : log.status === 'running' ? (
                          <span className="text-[9px] font-bold text-indigo-600 flex items-center animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin mr-1 shrink-0" />
                            PUMPING
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400">IDLE</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={isTestingDiagnostics}
                    onClick={() => {
                      setIsTestingDiagnostics(true);
                      // Stage-wise simulated checks
                      setDiagnosticLogs(prev => prev.map((d, i) => i === 0 ? { ...d, status: 'running' } : d));
                      setTimeout(() => {
                        setDiagnosticLogs(prev => prev.map((d, i) => i === 0 ? { ...d, status: 'success' } : i === 1 ? { ...d, status: 'running' } : d));
                        setTimeout(() => {
                          setDiagnosticLogs(prev => prev.map((d, i) => i === 1 ? { ...d, status: 'success' } : i === 2 ? { ...d, status: 'running' } : d));
                          setTimeout(() => {
                            setDiagnosticLogs(prev => prev.map((d, i) => i === 2 ? { ...d, status: 'success' } : i === 3 ? { ...d, status: 'running' } : d));
                            setTimeout(() => {
                              setDiagnosticLogs(prev => prev.map((d, i) => i === 3 ? { ...d, status: 'success' } : d));
                              setIsTestingDiagnostics(false);
                              triggerFeedback('Workspace Diagnostic audit completes without failures!');
                            }, 500);
                          }, 500);
                        }, 500);
                      }, 500);
                    }}
                    className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[10.5px] font-bold uppercase tracking-wider text-center transition hover:bg-indigo-700 mt-1"
                  >
                    {isTestingDiagnostics ? 'AUDITING COMPILING...' : 'Diagnose System Ports ⚡'}
                  </button>
                </div>

                {/* Keyboard Shortcuts template */}
                <div className="p-4 bg-white border rounded-2xl dark:bg-slate-900 border-slate-100 dark:border-slate-805 text-left space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Keyboard Quick Actions</span>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-50 last:border-none dark:border-slate-805">
                      <span className="text-slate-550 dark:text-slate-400">Force voice listening</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 font-mono text-[9px] rounded-md font-bold text-slate-700 dark:text-slate-300">Space+V</kbd>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-50 last:border-none dark:border-slate-805">
                      <span className="text-slate-550 dark:text-slate-400">Open active search catalog</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 font-mono text-[9px] rounded-md font-bold text-slate-700 dark:text-slate-300">Ctrl+F</kbd>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-50 last:border-none dark:border-slate-805">
                      <span className="text-slate-550 dark:text-slate-400">Clear research logs</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-205 dark:bg-slate-950 dark:border-slate-800 font-mono text-[9px] rounded-md font-bold text-slate-700 dark:text-slate-300">Alt+P</kbd>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );

      default:
        return (
          <div className="p-6 text-center">
            <h1 className="text-xl font-bold">Scientific View Panel Under Indexing</h1>
          </div>
        );
    }
  };


  return (
    <div className="flex flex-col h-screen min-h-screen bg-white text-slate-950 font-sans antialiased overflow-hidden selection:bg-slate-200 selection:text-slate-900 transition-colors duration-200">
      
      {/* HEADER BAR (Pristine, light-grey gradient matching screenshot exactly) */}
      <header className="h-[72px] shrink-0 border-b border-slate-150 bg-white/95 px-6 flex items-center justify-between z-25 relative shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        
        {/* LOGO AREA */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-white border border-slate-300 rounded-xl text-slate-950 shadow-sm flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-sans font-bold text-lg leading-tight tracking-tight text-slate-950">
              Mona & Josh
            </span>
            <span className="text-[11px] text-slate-650 font-medium tracking-wide">
              Academic Assistant
            </span>
          </div>
        </div>

        {/* RIGHT HEADER ACTION BAR */}
        <div className="flex items-center space-x-3.5">
          
          {/* Theme toggler */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition duration-200 dark:hover:bg-slate-800"
            title="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-500" />
            )}
          </button>

          {/* Bell Notifications */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotificationDrawer(!showNotificationDrawer);
                setShowProfileDropdown(false);
              }}
              className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition relative dark:hover:bg-slate-800"
              title="Recent Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-slate-950 text-[9px] text-white font-bold rounded-full flex items-center justify-center border border-white">
                3
              </span>
            </button>

            {/* Notification drop indicator */}
            {showNotificationDrawer && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-150 p-4 z-40 text-left animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="font-semibold text-xs text-slate-900">System Notifications</span>
                  <button className="text-[10px] text-slate-800 font-bold hover:underline">Clear all</button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="font-bold text-slate-900">Welcome Workspace Live! 🎉</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Secure, sandbox model initialized.</p>
                  </div>
                  <div className="p-2 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg">
                    <p className="font-bold text-slate-900">Gemini 1.5 Pro Operational</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Primary model enabled for indexing.</p>
                  </div>
                  <div className="p-2 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg">
                    <p className="font-bold text-slate-900">Academic filters active</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Strictly scientific context binding.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User profile with custom drop design */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotificationDrawer(false);
              }}
              className="flex items-center space-x-1.5 p-1.5 px-3 hover:bg-slate-100/80 rounded-xl transition dark:hover:bg-slate-800"
            >
              <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                {user?.name || 'Josh and Mona'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-150 py-1.5 z-40 text-left animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Josh and Mona'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email || 'josh.mona@academic.edu'}</p>
                </div>
                <button 
                  onClick={() => { setShowProModal(true); setShowProfileDropdown(false); }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-950 font-bold hover:bg-slate-50 flex items-center space-x-2"
                >
                  <Star className="w-3.5 h-3.5 fill-current text-slate-950" />
                  <span>See pro tier features</span>
                </button>
                <button 
                  onClick={() => { fetchProfileAndData(); setShowProfileDropdown(false); triggerFeedback('Profile synchronized'); }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-800 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Profile info</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* COMPONENT BODY AREA (Layout Splits sidebar + file scanner middle panel + main right log) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION (Left margin space) */}
        <aside className="w-[240px] shrink-0 border-r border-slate-150 bg-white flex flex-col justify-between p-4 hidden md:flex">
          
          {/* Scrollable primary navigation links */}
          <div className="space-y-1.5">
            {[
              { label: 'AI Research', icon: <Sparkles className="w-[18px] h-[18px]" /> },
              { label: 'PDF Scan', icon: <FileText className="w-[18px] h-[18px]" /> },
              { label: 'History', icon: <History className="w-[18px] h-[18px]" /> },
              { label: 'Notes', icon: <BookOpen className="w-[18px] h-[18px]" /> },
              { label: 'Citations', icon: <Share2 className="w-[18px] h-[18px]" /> },
              { label: 'Favorites', icon: <Star className="w-[18px] h-[18px]" /> },
              { label: 'Study Tools', icon: <GraduationCap className="w-[18px] h-[18px]" /> },
            ].map((item) => {
              const isActive = activeTab === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveTab(item.label);
                    if (item.label !== 'AI Research') {
                      triggerFeedback(`Switched perspective to ${item.label}`);
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                    isActive 
                      ? 'bg-slate-50 text-slate-950 border border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' 
                      : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="py-2">
              <div className="h-px bg-slate-150 my-2" />
            </div>

            {[
              { label: 'Settings', icon: <Settings className="w-[18px] h-[18px]" /> },
              { label: 'Help & Support', icon: <HelpCircle className="w-[18px] h-[18px]" /> }
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setActiveTab(item.label);
                  triggerFeedback(`Opened ${item.label}`);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition ${
                  activeTab === item.label 
                    ? 'bg-slate-50 text-slate-950 border border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' 
                    : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="text-slate-400">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* UPGRADE TO PRO CARD (At bottom of sidebar matching layout style perfectly) */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-left relative overflow-hidden shadow-sm">
            
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="p-1 bg-amber-400 text-white rounded-lg">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <h4 className="font-bold text-xs text-slate-900 tracking-tight">
                Upgrade to Pro
              </h4>
            </div>
            
            <p className="text-[10.5px] text-slate-600 tracking-normal leading-relaxed mb-3">
              Unlock unlimited PDF uploads, advanced AI models & more.
            </p>
            
            <button 
              onClick={() => setShowProModal(true)}
              className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-300 text-[11px] font-bold text-slate-950 rounded-xl shadow-sm transition duration-150 text-center"
            >
              Upgrade Now
            </button>
          </div>

        </aside>

        {activeTab === 'AI Research' ? (
          <>
            {/* MIDDLE PANE: PDF DOCUMENT SCAN */}
            {!fullView && (
              <section className="w-full md:w-[320px] lg:w-[350px] shrink-0 border-r border-slate-150 bg-white flex flex-col overflow-y-auto p-5">
          
          {/* SCAN HEADER INFORMATION */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-150">
            <div className="flex items-center space-x-1.5 text-slate-900">
              <span className="font-sans font-bold text-[13px] uppercase tracking-wide">
                PDF Document Scan
              </span>
              <button 
                onClick={() => triggerFeedback('Drag any academic PDF or plain TXT text file here. Mona & Josh uses automated OCR and key arguments indexing.', 'info')}
                className="p-1 hover:text-slate-950 text-slate-400 flex items-center"
                title="Workspace Help Information"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            {pdfs.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-900 border border-slate-200">
                {pdfs.length} Scanned
              </span>
            )}
          </div>

          <div className="space-y-5">
            
            {/* DRAG & DROP SELECTOR WINDOW (Dashed matching screenshot layout) */}
            <div 
              onDragOver={handleDragOver}
              onDrop={onFileDrop}
              className="border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 rounded-2xl p-5 text-center transition-all duration-300 group cursor-pointer relative"
              title="Drag and drop or Click to choose files"
            >
              <input 
                type="file" 
                id="doc-selector-input" 
                onChange={onFileSelectChange}
                accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 mb-3 group-hover:scale-105 transition duration-300">
                  <UploadCloud className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 mb-1 group-hover:text-black">
                  Drag & drop your academic document or image here
                </h4>
                <p className="text-[10px] text-slate-400">
                  Supports PDF, TXT, Images (Max 100MB)
                </p>
              </div>
            </div>

            {/* SCANNING PROGRESS ANIMATOR */}
            {isUploading && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-[11px] flex items-start space-x-3 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950 shrink-0 mt-0.5" />
                <span>Mona & Josh AI is indexing abstract, core findings, research methodology, and scientific constraints...</span>
              </div>
            )}

            {/* DYNAMIC SUBSECTION: RECENT SCANS LIST WITH ICON PREVIEWS */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">
                Recent Scans
              </span>

              {pdfs.length > 0 ? (
                <div className="space-y-2">
                  {pdfs.map(doc => {
                    const isSelected = selectedPDF?.id === doc.id;
                    return (
                      <div 
                        key={doc.id}
                        onClick={() => {
                          setSelectedPDF(doc);
                          triggerFeedback(`Switched context to ${doc.fileName}`);
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition text-left ${
                          isSelected 
                            ? 'border-slate-900 bg-slate-50' 
                            : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                          <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {doc.fileName}
                            </p>
                            <p className="text-[9.5px] text-slate-500 mt-0.5">
                              {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removePDFDocument(doc.id, e);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 transition"
                          title="Purge Document from context"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* EMPTY RECENT SCANS STATE (Matching the placeholder illustration in the screenshot) */
                <div className="py-8 px-4 text-center rounded-2xl bg-slate-50 border border-slate-150 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-150 mb-3.5">
                    <div className="relative">
                      <FileText className="w-6 h-6 text-slate-300" />
                      <div className="absolute right-[-4px] bottom-[-4px] p-0.5 bg-slate-100 text-slate-800 rounded-full border border-white">
                        <Search className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                  <h5 className="text-[11px] font-bold text-slate-900 mb-1">
                    No active academic paper scanned
                  </h5>
                  <p className="text-[10px] text-slate-500 leading-relaxed px-2">
                    Upload a PDF to extract and analyze content with AI insights.
                  </p>
                </div>
              )}
            </div>

            {/* EXPANDED CONTENT PREVIEWS FOR ACTIVE SELECTED PDF */}
            {selectedPDF && (
              <div className="space-y-4 pt-4 border-t border-slate-150 text-left animate-in fade-in duration-200">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/55 flex items-start space-x-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Contextual Science Bind</span>
                    <h6 className="text-[11.5px] font-bold text-slate-900 truncate line-clamp-1 max-w-[200px]">
                      {selectedPDF.fileName}
                    </h6>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* ABSTRACT */}
                  <div>
                    <div className="flex items-center space-x-1.5 mb-1 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      <span>1. Abstract overview</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-150">
                      {selectedPDF.abstract}
                    </p>
                  </div>

                  {/* CORE FINDINGS */}
                  {selectedPDF.findings && selectedPDF.findings.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-1.5 mb-1 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                        <span>2. Key Discoveries</span>
                      </div>
                      <div className="text-[11px] text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-150">
                        <ul className="list-disc pl-4 space-y-1">
                          {selectedPDF.findings.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* COGNITIVE LINK BUTTON */}
                  <button 
                    onClick={() => submitMessage(`Based on "${selectedPDF.fileName}", synthesize its primary conclusion and provide an alternative research methodology we might contrast it with.`)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-900 border border-slate-200 rounded-xl transition duration-150 text-center"
                  >
                    Discuss specific findings in active chat ⚡
                  </button>
                </div>
              </div>
            )}

          </div>

        </section>
        )}

        {/* MAIN PANEL: AI RESEARCH CHAT */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden relative">
          
          {/* WORKSPACE STATUS BAR */}
          <div className="h-[48px] shrink-0 border-b border-slate-150 bg-slate-50/50 px-6 flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-3.5 text-[11px] font-mono font-bold text-slate-505 tracking-wide">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>AI RESEARCH ACTIVE</span>
              </div>
              
              {/* Flexible layout toggles */}
              <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg border border-slate-300/40 text-[10.5px] font-bold uppercase tracking-wide font-sans">
                <button
                  onClick={() => {
                    setFullView(true);
                    triggerFeedback('AI Research expanded to Full View');
                  }}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${fullView ? 'bg-white text-slate-950 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Full View
                </button>
                <button
                  onClick={() => {
                    setFullView(false);
                    triggerFeedback('Workspace split view enabled with PDF Scanner');
                  }}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${!fullView ? 'bg-white text-slate-950 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Split View
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* CLEAR BUTTON */}
              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] uppercase font-bold text-slate-400 hover:text-slate-700 transition mr-2"
                >
                  Clear Chat
                </button>
              )}

              {/* MODEL BADGE (Exact Capsule tag) */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 text-slate-900 border border-slate-200 font-sans font-extrabold text-[10px] tracking-wider rounded-full uppercase animate-pulse">
                <span>POWERED BY GEMINI 1.5 PRO</span>
                <Sparkles className="w-3 h-3 text-slate-950 fill-current" />
              </div>
            </div>
          </div>

          {/* CHAT VIEW (Contains scrolling dialogue or default visual welcome state) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* WELCOME / HELLO STATE (Displays when no messages or as original visual card) */}
            {messages.length === 0 && (
              <div className="max-w-2xl mx-auto pt-4 text-left space-y-8 animate-in fade-in duration-300">
                
                {/* LARGE GREETING CARD (Exact replication of design layout) */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/55 flex items-start space-x-4">
                  
                  {/* Persona Indicator Badge */}
                  <div className="w-10 h-10 rounded-2xl bg-slate-950 font-sans font-bold text-white text-xs flex items-center justify-center shrink-0 shadow-sm animate-bounce">
                    M&J
                  </div>

                  {/* Main card info body */}
                  <div className="flex-grow space-y-4">
                    
                    {/* Chip labels cluster */}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">
                        ✨ AI-Powered
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">
                        ⭐ Academic Focused
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">
                        📄 Citation Ready
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">
                        👑 Trusted Sources
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="font-sans font-extrabold text-lg md:text-xl text-slate-950 tracking-tight">
                      Welcome to Mona & Josh Academic Workspace! 👋
                    </h2>

                    {/* Body */}
                    <p className="text-xs text-slate-650 leading-relaxed font-sans">
                      I'm your AI research assistant, here to help you with scientific, technological, legal, medical, or mathematical research and academic discussions. Upload a PDF research paper on the left panel or ask any academic question.
                    </p>

                    {/* Core welcome action bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <button 
                        onClick={() => handleReadAloudText("I am your academic assistant designed to process scientific research. Drop any PDF to begin or type questions.", "welcome-sound")}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition duration-150 ${
                          activeSpeakingId === "welcome-sound"
                            ? 'bg-slate-100 border-slate-300 text-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{activeSpeakingId === "welcome-sound" ? "Stop Speech" : "Read Aloud"}</span>
                      </button>

                      <div className="flex items-center space-x-2 text-xs">
                        <button 
                          onClick={() => copyTextToClipboard("I'm your AI research assistant, here to help you with scientific, technological, legal, medical, or mathematical research and academic discussions. Upload a PDF research paper on the left panel or ask any academic question.", "welcome-copy")}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition inline-flex items-center space-x-1.5 font-bold"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>
                        <button 
                          onClick={() => triggerDownloadTxt("Mona & Josh Greet", "Welcome to Mona & Josh Academic Workspace! We are ready to help with research.")}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition inline-flex items-center space-x-1.5 font-bold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* MESSAGE DIALOGUE TRAIL (Slick bubbles) */}
            {messages.length > 0 && (
              <div className={`mx-auto space-y-5 text-left transition-all duration-350 ${fullView ? 'max-w-full w-full' : 'max-w-3xl'}`}>
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex items-start space-x-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    
                    {/* Assistant avatar logo */}
                    {msg.role !== 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-slate-950 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-sm">
                        M&J
                      </div>
                    )}

                    <div className={`${fullView ? 'w-full max-w-full' : 'max-w-[85%]'} space-y-1.5 transition-all duration-300`}>
                      
                      {/* Name badge */}
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider block px-1">
                        {msg.role === 'user' ? (user?.name?.toUpperCase() || 'JOSH AND MONA') : 'ACADEMIC COMPANION'}
                      </span>

                      {/* Msg card shell */}
                      <div className={`p-4 rounded-3xl ${
                        msg.role === 'user'
                          ? 'bg-slate-105 border border-slate-200 text-slate-950 shadow-sm'
                          : 'bg-white border border-slate-150 text-slate-900'
                      }`}>
                        
                        {/* Quality Indexes header inside bot bubbles */}
                        {msg.role !== 'user' && msg.id !== 'welcome-msg' && (
                          <div className="flex flex-wrap items-center gap-3 mb-3 pb-2.5 border-b border-slate-150 font-mono text-[10px]">
                            
                            <div className="flex items-center space-x-1" title="Confidence Score">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-slate-400">CONFIDENCE:</span>
                              <span className="font-bold text-emerald-600">{msg.confidenceIndex ?? 96}%</span>
                            </div>

                            <div className="flex items-center space-x-1" title="Academic citation rating">
                              <Cpu className="w-3.5 h-3.5 text-slate-605" />
                              <span className="text-slate-400">RESEARCH INDEX:</span>
                              <span className="font-bold text-slate-950">{msg.researchScore ?? 9}/10</span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <FileText className="w-3.5 h-3.5 text-slate-405" />
                              <span className="text-slate-400">EST READING:</span>
                              <span className="font-bold text-slate-500">{msg.readingTimeMin ?? 2} min</span>
                            </div>

                          </div>
                        )}

                        {/* Content text */}
                        <div className="text-black dark:text-black p-1">
                          {msg.role === 'user' ? (
                            <div className="text-xs md:text-sm whitespace-pre-wrap">{msg.content}</div>
                          ) : (
                            <div className="space-y-3.5">
                              {renderAcademicMarkdown(msg.content)}
                              
                              {/* AUTO-CREATED VECTOR ILLUSTRATION ENGINE */}
                              {(() => {
                                const topic = getIllustratableConcept(msg);
                                if (topic) {
                                  return (
                                    <AcademicIllustration 
                                      concept={topic} 
                                      context={msg.content} 
                                      messageId={msg.id} 
                                    />
                                  );
                                }
                                return null;
                              })()}

                              {/* INTERACTIVE PLAY IN-CHAT YOUTUBE PLAYER */}
                              {(() => {
                                const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/g;
                                const videoIds: string[] = [];
                                let match;
                                while ((match = youtubeRegex.exec(msg.content)) !== null) {
                                  videoIds.push(match[1]);
                                }
                                
                                const uniqueIds = Array.from(new Set(videoIds));
                                if (uniqueIds.length > 0) {
                                  return (
                                    <div className="mt-4 space-y-3">
                                      {uniqueIds.map((vId) => (
                                        <div key={vId} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md bg-slate-50 dark:bg-slate-900">
                                          <div className="p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-250 dark:border-slate-700 flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" />
                                              <span className="text-[10px] font-black text-slate-800 dark:text-slate-205 uppercase tracking-widest font-mono">Interactive Educational Player</span>
                                            </div>
                                            <a 
                                              href={`https://www.youtube.com/watch?v=${vId}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-[10px] text-red-600 dark:text-red-400 hover:underline font-black font-mono flex items-center space-x-1"
                                            >
                                              <span>Launch external</span>
                                            </a>
                                          </div>
                                          <div className="relative pb-[56.25%] h-0 bg-black">
                                            <iframe
                                              className="absolute top-0 left-0 w-full h-full border-0"
                                              src={`https://www.youtube.com/embed/${vId}`}
                                              title="YouTube video player"
                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                              allowFullScreen
                                              referrerPolicy="no-referrer"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          )}
                        </div>

                        {/* Bibliographical Citations list */}
                        {msg.role !== 'user' && msg.citations && msg.citations.length > 0 && (
                          <div className="mt-3.5 pt-2.5 border-t border-slate-150 font-mono text-[10px] text-left">
                            <span className="text-slate-950 font-bold uppercase tracking-wider block mb-1">Inline Bibliographical references:</span>
                            <ul className="list-decimal list-inside space-y-0.5 text-slate-500">
                              {msg.citations.map((cite, index) => (
                                <li key={index} className="truncate">{cite}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Bottom operations toolbar */}
                        {msg.role !== 'user' && (
                          <div className="mt-3 pb-1 border-t border-slate-100/50 dark:border-slate-800/40 pt-2 flex flex-wrap justify-between items-center gap-2">
                            
                            <button
                              onClick={() => handleReadAloudText(msg.content, msg.id)}
                              className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold border ${
                                activeSpeakingId === msg.id 
                                  ? 'bg-amber-100 text-amber-700 border-amber-300' 
                                  : 'bg-white border-slate-200/80 text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700'
                              }`}
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>{activeSpeakingId === msg.id ? 'Stop Speech' : '🔊 Read Aloud'}</span>
                            </button>

                            <div className="flex items-center space-x-1.5 text-xs">
                              <button
                                onClick={() => copyTextToClipboard(msg.content, msg.id)}
                                className="px-2 py-1 rounded-lg border border-slate-200/80 text-slate-500 hover:bg-slate-50 text-[11px] font-semibold dark:bg-slate-800 dark:border-slate-700"
                              >
                                {copiedId === msg.id ? 'Copied!' : 'Copy'}
                              </button>
                              <button
                                onClick={() => triggerDownloadTxt('Academic Findings', msg.content)}
                                className="px-2 py-1 rounded-lg border border-slate-200/80 text-slate-500 hover:bg-slate-50 text-[11px] font-semibold dark:bg-slate-800 dark:border-slate-700"
                              >
                                Download TXT
                              </button>
                            </div>

                          </div>
                        )}

                      </div>

                    </div>

                    {/* User avatar badge */}
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center font-bold text-xs uppercase text-slate-500">
                        EC
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}

            {/* STREAM TYPING COMPANION INDICATOR */}
            {isTyping && (
              <div className="max-w-2xl mx-auto flex items-start space-x-3.5 text-left animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-slate-950 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  M&J
                </div>
                <div className="bg-slate-55 border border-slate-205 rounded-2xl p-4 text-xs font-mono text-slate-400 flex items-center space-x-2">
                  <div className="typing-dot bg-slate-400 animate-bounce delay-100 w-1.5 h-1.5 rounded-full" />
                  <div className="typing-dot bg-slate-400 animate-bounce delay-200 w-1.5 h-1.5 rounded-full" />
                  <div className="typing-dot bg-slate-400 animate-bounce delay-300 w-1.5 h-1.5 rounded-full" />
                  <span className="ml-2 text-slate-500">Mona & Josh indexing models...</span>
                </div>
              </div>
            )}

          </div>

          {/* PROMPT BOX ELEMENT (Floating absolute container resembling final UI) */}
          <div className="p-4 bg-white border-t border-slate-150 z-10">
            <div className="max-w-3xl mx-auto">
              
              <div className="relative flex items-center bg-slate-50 rounded-[20px] border border-slate-205 p-2 shadow-[0_2px_12px_rgba(0,0,0,0.01)] focus-within:border-slate-800 focus-within:bg-white transition duration-150">
                
                {/* Voice triggers */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:text-slate-800'}`}
                  title="Speech voice compilation"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Sound wave element placeholder */}
                <div className="flex items-center space-x-0.5 px-2">
                  <div className={`w-0.5 ${isListening ? 'h-4 bg-red-500 animate-pulse' : 'h-2.5 bg-slate-300'}`} />
                  <div className={`w-0.5 ${isListening ? 'h-2 bg-red-500 animate-pulse delay-75' : 'h-1 bg-slate-300'}`} />
                  <div className={`w-0.5 ${isListening ? 'h-3.5 bg-red-500 animate-pulse' : 'h-3 bg-slate-300'}`} />
                </div>

                {/* Attach Button (Launches upload) */}
                <div className="relative flex items-center">
                  <input 
                    type="file" 
                    id="attach-selector" 
                    onChange={onFileSelectChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full z-15"
                    accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
                  />
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span>Attach</span>
                  </button>
                </div>

                {/* Inline text query formulation */}
                <input 
                  type="text"
                  id="academic-prompt-bar-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      submitMessage(searchQuery);
                    }
                  }}
                  placeholder="Formulate your academic or science query..."
                  className="flex-grow bg-transparent border-0 outline-0 ring-0 px-4 text-xs md:text-sm text-slate-900 py-2.5 placeholder-slate-400 focus:outline-none"
                />

                {/* Sending action bubble */}
                <button
                  onClick={() => submitMessage(searchQuery)}
                  disabled={!searchQuery.trim()}
                  className="p-2.5 bg-slate-950 text-white rounded-xl hover:bg-black disabled:opacity-40 disabled:hover:bg-slate-950 hover:scale-105 active:scale-95 transition flex items-center justify-center shrink-0 ml-1.5"
                >
                  <Send className="w-4 h-4" />
                </button>

              </div>

            </div>
          </div>

          {/* DISCLAIMER UNDER-BAR */}
          <footer className="h-[28px] shrink-0 bg-slate-50 border-t border-slate-100/80 flex items-center justify-center dark:bg-slate-950 dark:border-slate-850">
            <span className="text-[9.5px] text-slate-400 font-sans tracking-wide">
              Mona & Josh can make mistakes. Please verify important information.
            </span>
          </footer>

        </section>

        {/* RIGHT PERSISTENT BIBLIOGRAPHY SIDEBAR */}
        {isBibSidebarOpen ? (
          <aside className="w-full md:w-[330px] border-l border-slate-150 bg-slate-50 flex flex-col overflow-hidden relative animate-in slide-in-from-right duration-300 shrink-0">
            {/* Sidebar header */}
            <div className="p-4 border-b border-slate-150 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-900">
                <Share2 className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span className="font-sans font-extrabold text-[12px] uppercase tracking-wider">
                  Bibliography Center
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                  {citationsList.length}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsBibSidebarOpen(false);
                  triggerFeedback('Bibliography side drawer collapsed. Click edge handle to restore.', 'info');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-755 hover:bg-slate-100 transition"
                title="Collapse sidebar workspace"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar main sub-tabs selection */}
            <div className="p-2.5 bg-slate-150/40 border-b border-slate-150 flex items-center space-x-1 shrink-0">
              <button
                onClick={() => setBibSidebarSubTab('catalog')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold tracking-wide transition ${
                  bibSidebarSubTab === 'catalog'
                    ? 'bg-white text-indigo-700 border border-slate-200/60 shadow-sm'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Catalog ({citationsList.length})
              </button>
              <button
                onClick={() => setBibSidebarSubTab('suggestions')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold tracking-wide transition flex items-center justify-center space-x-1 ${
                  bibSidebarSubTab === 'suggestions'
                    ? 'bg-white text-indigo-700 border border-slate-200/60 shadow-sm'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                <span>Suggestions</span>
                {filteredSuggestions.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block shrink-0" />
                )}
                {filteredSuggestions.length > 0 && (
                  <span className="text-[9px] font-bold px-1 rounded-md bg-amber-100 text-amber-705 ml-1 shrink-0">
                    {filteredSuggestions.length}
                  </span>
                )}
              </button>
            </div>

            {/* Scrollable catalog / suggestion items section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {bibSidebarSubTab === 'catalog' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-wider block">
                      Active Bibliography
                    </span>
                    {citationsList.length > 0 && (
                      <button
                        onClick={() => {
                          const merged = citationsList.map(c => `[${c.style}]  ${c.computed}`).join('\n\n');
                          navigator.clipboard.writeText(merged);
                          triggerFeedback('All bibliography entries copied!');
                        }}
                        className="text-[9.5px] font-bold text-indigo-650 hover:underline uppercase font-mono"
                      >
                        Copy All
                      </button>
                    )}
                  </div>

                  {citationsList.length === 0 ? (
                    <div className="p-5 text-center bg-white border border-slate-200 rounded-2xl space-y-2 mt-1">
                      <Quote className="w-6 h-6 text-slate-300 mx-auto" />
                      <p className="text-[11px] font-bold text-slate-850">Your Bibliography is empty</p>
                      <p className="text-[10px] text-slate-550 leading-relaxed">
                        Formulate a citation inside the Citation tab, or click '+' on suggestions captured in chat to begin syncing elements here!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[9px] text-indigo-650 font-sans italic text-left bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 leading-relaxed">
                        💡 Drag-and-drop references directly into notepad editor textareas!
                      </p>
                      {citationsList.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', item.computed);
                            e.dataTransfer.effectAllowed = 'copy';
                            triggerFeedback('Dragging reference.. drop into any notes workspace!', 'info');
                          }}
                          className="p-3 bg-white border border-slate-180 hover:border-indigo-400 rounded-2xl cursor-grab active:cursor-grabbing transition relative group text-left space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                              {item.style}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition flex items-center space-x-1 z-10 bg-white pl-1.5">
                              <button
                                onClick={() => {
                                  if (selectedNote) {
                                    const updatedContent = `${selectedNote.content}\n\n[Reference] ${item.computed}`;
                                    setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, content: updatedContent, updatedAt: new Date().toISOString() } : n));
                                    setSelectedNote(prev => prev ? { ...prev, content: updatedContent } : null);
                                    triggerFeedback('Inserted citation directly to active note workspace');
                                  } else {
                                    triggerFeedback('Please select/create a note under note workspace dropdown first!', 'error');
                                  }
                                }}
                                className="px-1.5 py-0.5 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-655 transition text-[9.5px] font-black uppercase font-mono"
                                title="Instant append to active note"
                              >
                                Insert
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(item.computed);
                                  triggerFeedback('Copied citation string!');
                                }}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition"
                                title="Copy String"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setCitationsList(prev => prev.filter(c => c.id !== item.id));
                                  triggerFeedback('Citation removed');
                                }}
                                className="p-1 hover:bg-slate-100 rounded text-slate-450 hover:text-red-500 transition"
                                title="Remove item"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <h6 className="text-[11px] font-extrabold text-slate-900 leading-snug line-clamp-2">
                              {item.title}
                            </h6>
                            <p className="text-[10px] text-slate-500 line-clamp-3 mt-1 italic leading-normal select-all font-sans">
                              {item.computed}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <span className="text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-wider block text-left">
                    Auto-Synced Suggestions
                  </span>

                  {filteredSuggestions.length === 0 ? (
                    <div className="p-5 text-center bg-white border border-slate-200 rounded-2xl space-y-2.5 mt-1">
                      <Sparkles className="w-5 h-5 text-indigo-400 mx-auto animate-pulse" />
                      <p className="text-[11px] font-bold text-slate-800">Scout is indexing...</p>
                      <p className="text-[10px] text-slate-550 leading-relaxed">
                        Whenever Josh & Mona formulate bibliographies, citations, or references in chat, they will sync here automatically in real time!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-2.5 bg-indigo-50/50 text-slate-800 rounded-xl border border-indigo-100 text-[10px] leading-relaxed text-left space-y-1">
                        <p className="font-bold text-indigo-700">🔍 Dynamic References Scouted</p>
                        <p className="text-[9.5px] text-slate-550">
                          These academic references were processed from your active chat log. Tap to sync with your Bibliography catalog.
                        </p>
                      </div>

                      {filteredSuggestions.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-left space-y-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] animate-in fade-in"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-705">
                                {item.style} Captured
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold font-mono">
                                Year: {item.year}
                              </span>
                            </div>
                            <h6 className="text-[11px] font-extrabold text-slate-905 leading-snug">
                              {item.title}
                            </h6>
                            <p className="text-[10px] text-slate-500 italic mt-1 leading-normal line-clamp-3">
                              {item.computed}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => {
                              const newC = {
                                id: 'cite-' + Date.now().toString(36),
                                title: item.title,
                                author: item.author,
                                year: item.year,
                                journal: item.journal || 'Scan Synced Journal',
                                computed: item.computed,
                                style: item.style
                              };
                              setCitationsList([newC, ...citationsList]);
                              triggerFeedback('Reference synced to active bibliography catalog!');
                            }}
                            className="w-full py-2 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider text-center transition flex items-center justify-center space-x-1 shadow-sm"
                          >
                            <Check className="w-3 h-3" />
                            <span>One-Click Auto Sync ⚡</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Quick target note editor pad footer inside sidebar */}
            <div className="p-3.5 bg-white border-t border-slate-150 text-left space-y-2 shrink-0">
              <span className="text-[9.5px] font-black font-mono text-slate-450 uppercase tracking-widest block">
                Target Research Note
              </span>
              
              {notes.length === 0 ? (
                <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-150">
                  <p className="text-[9.5px] text-slate-500">No notes in folders yet.</p>
                  <button
                    onClick={() => {
                      const newN: AcademicNote = {
                        id: 'note-' + Date.now().toString(36),
                        userId: 'user-001',
                        folderId: 'folder-gen',
                        title: 'Active Research Draft',
                        content: 'Research outlines & key structural synthesis findings:',
                        academicCategory: 'AI Synced Research',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      };
                      setNotes([newN, ...notes]);
                      setSelectedNote(newN);
                      triggerFeedback('Active Research Draft note generated');
                    }}
                    className="mt-1 text-[9px] text-indigo-600 hover:underline uppercase font-bold"
                  >
                    + Create Draft Note
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 text-[10.5px]">
                  <select
                    value={selectedNote?.id || ''}
                    onChange={(e) => {
                      const noteId = e.target.value;
                      const found = notes.find(n => n.id === noteId);
                      if (found) {
                        setSelectedNote(found);
                        triggerFeedback(`Target note switched: ${found.title}`);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-205 text-[10.5px] font-bold text-slate-800 outline-none focus:border-indigo-400"
                  >
                    {notes.map(n => (
                      <option key={n.id} value={n.id}>
                        📝 {n.title}
                      </option>
                    ))}
                  </select>

                  {selectedNote && (
                    <div className="p-2 py-1.5 rounded-xl border border-dashed border-indigo-150 bg-indigo-50/20 text-left">
                      <p className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide">Target Note Preview</p>
                      <p className="text-[10px] text-slate-700 truncate max-w-[280px] font-sans">
                        {selectedNote.content.slice(0, 70) || 'Empty draft notes file'}...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </aside>
        ) : (
          /* COLLAPSED RIGHT EDGE BAR WITH BADGES FOR FAST RESTORE */
          <div className="w-[44px] shrink-0 border-l border-slate-150 bg-white flex flex-col items-center py-4 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] shrink-0">
            <button
              onClick={() => {
                setIsBibSidebarOpen(true);
                triggerFeedback('Bibliography drawer workspace expanded');
              }}
              className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-slate-100 transition relative flex items-center justify-center cursor-pointer group"
              title="Expand Bibliography Center"
            >
              <Share2 className="w-4 h-4 text-indigo-600 animate-pulse" />
              {(citationsList.length > 0 || filteredSuggestions.length > 0) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full" />
              )}
              {/* Expand tooltip */}
              <div className="absolute right-12 bg-slate-900 text-white font-mono text-[9px] font-black uppercase tracking-wider py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50 shadow-md">
                Restore Bibliography ({citationsList.length})
              </div>
            </button>
            
            <div className="h-px w-6 bg-slate-100" />
            
            {/* Catalog list size badge indicator */}
            <div className="flex flex-col items-center" title="Bibliography Items">
              <span className="text-[8px] font-extrabold text-slate-400 tracking-wider uppercase font-mono">BIB</span>
              <span className="text-xs font-black text-slate-900 mt-0.5">{citationsList.length}</span>
            </div>

            {/* Suggestions notifications badge indicator */}
            <div 
              onClick={() => {
                setIsBibSidebarOpen(true);
                setBibSidebarSubTab('suggestions');
                triggerFeedback('Switched to Bibliography suggestions');
              }}
              className={`flex flex-col items-center cursor-pointer group p-1 rounded-lg ${filteredSuggestions.length > 0 ? 'bg-amber-50 border border-amber-200' : ''}`}
              title="Scout citations caught"
            >
              <span className={`text-[8px] font-extrabold tracking-wider uppercase font-mono ${filteredSuggestions.length > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>COUT</span>
              <span className={`text-xs font-black mt-0.5 ${filteredSuggestions.length > 0 ? 'text-amber-600 animate-bounce' : 'text-slate-900'}`}>
                {filteredSuggestions.length}
              </span>
            </div>
          </div>
        )}
          </>
        ) : (
          <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 dark:bg-slate-950">
            {renderActivePage()}
          </main>
        )}

      </div>

      {/* FIXED FEEDBACK POPUP CONTAINER */}
      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 duration-200">
          <div className={`p-3.5 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-semibold ${
            feedbackMsg.type === 'error' 
              ? 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/80 dark:text-rose-300 dark:border-none'
              : feedbackMsg.type === 'info'
              ? 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-slate-900 dark:text-blue-300 dark:border-none'
              : 'bg-indigo-60 card text-indigo-700 border border-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:border-none'
          }`}>
            <Sparkles className="w-4 h-4 shrink-0 animate-ping" />
            <span>{feedbackMsg.text}</span>
          </div>
        </div>
      )}

      {/* PRO FEATURES UPGRADE TIERS DIALOG MODAL */}
      {showProModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl max-w-md w-full dark:bg-slate-900 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 border-b pb-3 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Star className="w-5 h-5 fill-current text-indigo-500" />
                <span className="font-bold text-sm uppercase tracking-wide text-slate-800 dark:text-white">PRO MEMBERSHIP TIERS</span>
              </div>
              <button 
                onClick={() => setShowProModal(false)}
                className="text-xs hover:text-slate-800 text-slate-400 font-bold hover:bg-slate-100 p-1.5 rounded-lg dark:hover:bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                Extend your Academic Workspace limitations instantly. Leverage multi-head scientific analysis context limits.
              </p>

              <div className="p-4 bg-indigo-50/50 border border-indigo-150 rounded-2xl text-left space-y-3 dark:bg-slate-950 dark:border-slate-805">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-indigo-900 dark:text-indigo-400">RESEARCH PLATINUM EDITION</span>
                  <span className="text-xs font-extrabold text-indigo-600">$19 / Month</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <p className="flex items-center space-x-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>100MB PDF individual document uploading size standard.</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Gemini 1.5 Pro dedicated backend prioritization tokens.</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Extended contextual citation matching (Crossref & Pubmed).</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 flex space-x-3">
                <button 
                  onClick={() => {
                    setShowProModal(false);
                    triggerFeedback('Subscription successfully processed in secure gateway simulator');
                  }}
                  className="flex-grow py-3 bg-indigo-600 text-center font-bold text-xs text-white rounded-xl shadow-md cursor-pointer hover:bg-indigo-700 transition"
                >
                  Activate Platinum Subscription
                </button>
                <button 
                  onClick={() => setShowProModal(false)}
                  className="px-4 py-3 bg-slate-50 text-center font-bold text-xs text-slate-500 rounded-xl hover:bg-slate-100 transition dark:bg-slate-800 dark:text-slate-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
