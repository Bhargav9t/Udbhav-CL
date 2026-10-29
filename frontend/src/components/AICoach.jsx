import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, User, Bot, FileText, CheckCircle2, Upload, Trash2, Eye, X, 
  Copy, Check, RotateCcw, AlertCircle, Sparkles, Plus, ArrowRight,
  Briefcase, Loader2, FileCode
} from 'lucide-react';
import { chatWithCoach } from '../lib/ai';
import { extractTextFromFile, formatFileSize } from '../lib/fileParser';

const SAMPLE_PROFILE = {
  name: 'Aarav Sharma (Sample Resume)',
  text: `Aarav Sharma
aarav.sharma@example.com | San Francisco, CA | linkedin.com/in/aarav-sharma

PROFESSIONAL SUMMARY
Senior AI & Full-Stack Engineer with 5+ years of experience developing distributed systems, high-throughput ML pipelines, and production web applications.

TECHNICAL SKILLS
- Programming Languages: Python, JavaScript, TypeScript, Go, SQL
- Frameworks: React, Node.js, FastAPI, PyTorch, LangChain, Tailwind CSS
- Cloud & Infrastructure: AWS (Lambda, ECS, S3, RDS), Docker, Kubernetes, CI/CD, Git
- Databases: PostgreSQL, MongoDB, Redis, Pinecone vector search

EXPERIENCE
Staff AI Engineer | Apex Systems (2023 - Present)
- Architected high-throughput FastAPI inference gateway serving 30M+ daily requests.
- Integrated vector search and RAG retrieval pipelines reducing query latency by 45%.
- Led cross-functional team of 6 engineers across backend and ML infrastructure.

Full-Stack Engineer | CloudScale Tech (2021 - 2023)
- Built responsive client dashboards using React, Vite, and Tailwind CSS.
- Designed scalable PostgreSQL schemas with Row Level Security (RLS) and real-time pub/sub.

EDUCATION
B.S. in Computer Science | University of California, Berkeley (2017 - 2021)

KEY PROJECTS & CERTIFICATIONS
- AWS Certified Solutions Architect - Associate
- Open-source contributor to modern LLM inference tools`
};

export default function AICoach({ resumeText, setResumeText, currentJobContext, clearJobContext }) {
  // Chat state with persistent history
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('career_ladder_coach_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved coach messages:', e);
    }
    return [
      { 
        role: 'assistant', 
        content: "Hi! I'm your AI Career Coach. Upload your resume or paste your profile on the left so I can give you personalized guidance and skill gap analysis. How can I help you today?" 
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resumeSaved, setResumeSaved] = useState(false);

  // Resume / File management state
  const [activeTab, setActiveTab] = useState('files'); // 'files' | 'text'
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    try {
      const saved = localStorage.getItem('career_ladder_uploaded_files');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load saved files metadata:', e);
    }
    return [];
  });
  const [additionalNotes, setAdditionalNotes] = useState(() => {
    return localStorage.getItem('career_ladder_profile_notes') || '';
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [copiedPreview, setCopiedPreview] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const lastJobContextKeyRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages, isLoading]);

  // Persist chat messages
  useEffect(() => {
    try {
      localStorage.setItem('career_ladder_coach_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save coach messages:', e);
    }
  }, [messages]);

  // Persist uploaded files metadata & additional notes
  useEffect(() => {
    try {
      localStorage.setItem('career_ladder_uploaded_files', JSON.stringify(uploadedFiles));
      localStorage.setItem('career_ladder_profile_notes', additionalNotes);
    } catch (e) {
      console.warn('Failed to save profile state:', e);
    }
  }, [uploadedFiles, additionalNotes]);

  // Auto-clean any legacy corrupted/binary state from localStorage
  useEffect(() => {
    let modified = false;
    const sanitized = uploadedFiles.map(f => {
      // If a file has > 6000 words or starts with %PDF, it was parsed as raw binary in legacy code
      if (f.wordCount > 5000 || (f.text && f.text.includes('%PDF-'))) {
        modified = true;
        const cleaned = (f.text || '').replace(/%PDF-\d\.\d[\s\S]*?%%EOF/gi, '').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
        const words = cleaned.split(/\s+/).filter(w => w.length > 0).slice(0, 1000).join(' ');
        return {
          ...f,
          text: words,
          wordCount: words ? words.split(/\s+/).length : 0
        };
      }
      return f;
    });

    if (modified) {
      setUploadedFiles(sanitized);
      syncProfileToResume(sanitized, additionalNotes);
    }
  }, []);

  // Helper to compile text from multiple uploaded files + additional notes
  const compileProfileText = (files, notes) => {
    const parts = [];
    if (files && files.length > 0) {
      files.forEach((f, idx) => {
        parts.push(`=== DOCUMENT ${idx + 1}: ${f.name} ===\n${f.text || ''}`);
      });
    }
    if (notes && notes.trim()) {
      parts.push(`=== ADDITIONAL PROFILE NOTES & TARGET GOALS ===\n${notes.trim()}`);
    }
    return parts.join('\n\n');
  };

  // Sync combined text into parent resumeText
  const syncProfileToResume = (files, notes) => {
    const compiled = compileProfileText(files, notes);
    setResumeText(compiled);
    setResumeSaved(true);
    setTimeout(() => setResumeSaved(false), 2000);
  };

  // =========================================================================
  // FIX: Handle incoming job context with strict deduplication
  // =========================================================================
  useEffect(() => {
    if (!currentJobContext) {
      lastJobContextKeyRef.current = null;
      return;
    }

    const currentKey = `${currentJobContext.id || ''}_${currentJobContext.title || ''}_${currentJobContext.organization || ''}`;
    
    // Strict Guard 1: Don't re-run if this exact job context has already been announced
    if (lastJobContextKeyRef.current === currentKey) {
      return;
    }
    lastJobContextKeyRef.current = currentKey;

    const jobGreeting = `I see you are interested in the **${currentJobContext.title}** role at ${currentJobContext.organization}. What would you like to know? Do you want me to analyze your skill gaps for this specific role?`;

    setMessages(prev => {
      // Strict Guard 2: Inspect existing messages to prevent duplicate
      const alreadyPresent = prev.some(
        m => m.role === 'assistant' && (
          m.content === jobGreeting || 
          (m.content.includes(currentJobContext.title) && m.content.includes(currentJobContext.organization))
        )
      );
      if (alreadyPresent) {
        return prev;
      }

      // If user hasn't chatted yet, replace initial generic greeting cleanly
      const hasUserMessages = prev.some(m => m.role === 'user');
      if (!hasUserMessages) {
        return [{ role: 'assistant', content: jobGreeting }];
      }

      // Otherwise append context switch note once
      return [
        ...prev, 
        { role: 'assistant', content: jobGreeting }
      ];
    });
  }, [currentJobContext]);

  // Handle direct text changes in the Text tab
  const handleDirectTextChange = (e) => {
    const val = e.target.value;
    setResumeText(val);
    setResumeSaved(true);
    setTimeout(() => setResumeSaved(false), 2000);
  };

  // Handle additional notes changes in the Files tab
  const handleAdditionalNotesChange = (e) => {
    const val = e.target.value;
    setAdditionalNotes(val);
    syncProfileToResume(uploadedFiles, val);
  };

  // File Processing Handler (multiple files)
  const processFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;

    setIsProcessingFiles(true);
    const newItems = [];

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const parsed = await extractTextFromFile(file);

      newItems.push({
        id: `${file.name}-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || 'file',
        text: parsed.text || '',
        wordCount: parsed.wordCount || 0,
        error: parsed.error || null,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    setUploadedFiles(prev => {
      // Remove any existing duplicate filename to allow re-upload/replacement
      const newNames = new Set(newItems.map(item => item.name));
      const filtered = prev.filter(item => !newNames.has(item.name));
      const updated = [...filtered, ...newItems];
      syncProfileToResume(updated, additionalNotes);
      return updated;
    });

    setIsProcessingFiles(false);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      await processFiles(e.dataTransfer.files);
    }
  };

  // Remove a single uploaded file
  const handleRemoveFile = (fileId) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      syncProfileToResume(updated, additionalNotes);
      return updated;
    });
  };

  // Clear all files and profile text
  const handleClearAllProfile = () => {
    if (window.confirm('Are you sure you want to clear your uploaded files and profile text?')) {
      setUploadedFiles([]);
      setAdditionalNotes('');
      setResumeText('');
      localStorage.removeItem('career_ladder_uploaded_files');
      localStorage.removeItem('career_ladder_profile_notes');
      localStorage.removeItem('career_ladder_resume');
      setResumeSaved(true);
      setTimeout(() => setResumeSaved(false), 1500);
    }
  };

  // Load sample resume for instant demonstration
  const handleLoadSampleResume = () => {
    const sampleItem = {
      id: `sample-${Date.now()}`,
      name: 'Aarav_Sharma_Resume.pdf',
      size: 48500,
      type: 'application/pdf',
      text: SAMPLE_PROFILE.text,
      wordCount: SAMPLE_PROFILE.text.split(/\s+/).length,
      uploadedAt: 'Sample'
    };

    setUploadedFiles([sampleItem]);
    setAdditionalNotes('Interested in full-stack AI engineering, distributed systems, and Summer 2026 roles.');
    syncProfileToResume([sampleItem], 'Interested in full-stack AI engineering, distributed systems, and Summer 2026 roles.');
    setActiveTab('files');
  };

  // Send message to AI Coach
  const executeSendMessage = async (textToSend) => {
    const query = (textToSend !== undefined ? textToSend : input).trim();
    if (!query || isLoading) return;

    const userMessage = { role: 'user', content: query };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = nextMessages.map(m => ({ role: m.role, content: m.content }));
      const botResponse = await chatWithCoach(apiMessages, resumeText, currentJobContext);
      setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: "I encountered an issue connecting to the AI Coach. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    executeSendMessage();
  };

  // Reset entire chat
  const handleResetChat = () => {
    const resetMsg = currentJobContext 
      ? `I see you are interested in the **${currentJobContext.title}** role at ${currentJobContext.organization}. What would you like to know? Do you want me to analyze your skill gaps for this specific role?`
      : "Hi! I'm your AI Career Coach. Upload your resume or paste your profile on the left so I can give you personalized advice. How can I help you today?";
    
    setMessages([{ role: 'assistant', content: resetMsg }]);
    lastJobContextKeyRef.current = currentJobContext 
      ? `${currentJobContext.id || ''}_${currentJobContext.title || ''}_${currentJobContext.organization || ''}` 
      : null;
    localStorage.removeItem('career_ladder_coach_messages');
  };

  // Copy preview modal content
  const handleCopyPreview = () => {
    if (previewFile?.text) {
      navigator.clipboard.writeText(previewFile.text);
      setCopiedPreview(true);
      setTimeout(() => setCopiedPreview(false), 2000);
    }
  };

  // Total words across compiled profile
  const totalWords = (resumeText || '').trim() ? resumeText.trim().split(/\s+/).length : 0;

  // Contextual quick prompt chips
  const promptSuggestions = currentJobContext ? [
    { label: "📊 Analyze my skill gaps", prompt: `Analyze my skill gaps for the ${currentJobContext.title} role at ${currentJobContext.organization} based on my resume.` },
    { label: "📝 How to tailor my resume", prompt: `Give me 3 specific bullet points on how to tailor my resume for the ${currentJobContext.title} position at ${currentJobContext.organization}.` },
    { label: "💡 Standout project ideas", prompt: `What side project could I build to dramatically increase my chances for ${currentJobContext.title}?` },
    { label: "🎯 Likely interview questions", prompt: `What are 4 key technical or behavioral interview questions I should prepare for this ${currentJobContext.title} role?` }
  ] : [
    { label: "🔍 Review my resume strengths", prompt: "Review my resume and highlight my 3 biggest technical strengths and 2 areas to improve." },
    { label: "🚀 High-impact skills for 2026", prompt: "Based on my current background, what are 2 high-impact skills or frameworks I should learn next?" },
    { label: "💼 Behavioral interview prep", prompt: "How should I structure my 'Tell me about yourself' pitch based on my background?" }
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 w-full max-w-7xl mx-auto p-2 sm:p-4 min-h-[640px]">
      
      {/* ========================================================================= */}
      {/* Left Column: Multi-File Upload & Profile Text Panel                       */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[420px] xl:w-[460px] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-[540px] lg:h-full shrink-0">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Your Resume / Profile</span>
            {uploadedFiles.length > 0 && (
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {resumeSaved && (
              <span className="flex items-center text-xs font-bold text-green-600 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Saved
              </span>
            )}
            {(uploadedFiles.length > 0 || (resumeText && resumeText.trim().length > 0)) && (
              <button
                onClick={handleClearAllProfile}
                title="Clear all uploaded files and profile text"
                className="text-xs text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher: Files vs Direct Text */}
        <div className="flex border-b border-gray-200 bg-gray-100/70 p-1 shrink-0">
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Files {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Direct Text / Preview
          </button>
        </div>

        {/* Tab 1: Multi-File Upload & Additional Notes */}
        {activeTab === 'files' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 bg-gray-50/50">
            
            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                isDragging 
                  ? 'border-indigo-500 bg-indigo-50/80 scale-[0.99]' 
                  : 'border-gray-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt,.md,.rtf,.json,.csv"
                onChange={(e) => processFiles(e.target.files)}
                className="hidden"
              />

              {isProcessingFiles ? (
                <div className="flex flex-col items-center py-2">
                  <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mb-2" />
                  <p className="text-xs font-bold text-gray-700">Extracting text from files...</p>
                  <p className="text-[11px] text-gray-400">Parsing PDF & DOCX contents</p>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-gray-800 mb-0.5">
                    Drag & drop files or <span className="text-indigo-600 underline">browse</span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Upload multiple files: PDF, DOCX, TXT, Markdown
                  </p>
                </>
              )}
            </div>

            {/* Quick Demo Sample Action */}
            {uploadedFiles.length === 0 && (
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] text-gray-400">Don't have a file ready?</span>
                <button
                  type="button"
                  onClick={handleLoadSampleResume}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Load Sample Profile
                </button>
              </div>
            )}

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 px-0.5">
                  <span>Attached Documents ({uploadedFiles.length})</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-[11px] font-medium"
                  >
                    <Plus className="w-3 h-3" /> Add More
                  </button>
                </div>

                <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                  {uploadedFiles.map((file) => {
                    const isPdf = file.name.toLowerCase().endsWith('.pdf');
                    const isDoc = file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc');

                    return (
                      <div 
                        key={file.id}
                        className="bg-white border border-gray-200 rounded-xl p-2.5 flex items-center justify-between shadow-2xs hover:border-indigo-200 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase shrink-0 ${
                            isPdf 
                              ? 'bg-red-50 text-red-600 border border-red-100' 
                              : isDoc 
                                ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {isPdf ? 'PDF' : isDoc ? 'DOC' : 'TXT'}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-800 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span>{formatFileSize(file.size)}</span>
                              <span>•</span>
                              <span className="text-emerald-600 font-medium">{file.wordCount} words</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => setPreviewFile(file)}
                            title="Preview extracted text"
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveFile(file.id)}
                            title="Remove file"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Additional Notes Textarea */}
            <div className="flex-1 flex flex-col min-h-[120px]">
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Additional Notes & Target Goals (Optional)</span>
                <span className="text-[10px] text-gray-400 font-normal">Included in AI context</span>
              </label>
              <textarea
                value={additionalNotes}
                onChange={handleAdditionalNotesChange}
                placeholder="Type additional skills, target roles, or specific focus areas... (e.g. Currently preparing for Summer 2026 SWE roles, proficient in Python and React)."
                className="w-full flex-1 p-3 text-xs text-gray-700 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none shadow-2xs placeholder-gray-400"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Direct Text & Full Profile Editor */}
        {activeTab === 'text' && (
          <div className="flex-1 p-4 flex flex-col bg-gray-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">
                Full Compiled Profile Text ({totalWords} words)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSampleResume}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Load Sample
                </button>
              </div>
            </div>

            <textarea
              value={resumeText}
              onChange={handleDirectTextChange}
              placeholder="Paste your resume, skills, or LinkedIn profile text here... The AI Coach will use this to personalize its advice and analyze your fit for opportunities."
              className="w-full flex-1 p-3.5 text-xs text-gray-800 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none shadow-2xs font-mono leading-relaxed"
            />
          </div>
        )}

        {/* Panel Footer: Summary info */}
        <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between text-[11px] text-gray-500 shrink-0">
          <span className="truncate">
            {uploadedFiles.length > 0 
              ? `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} • ${totalWords} total words`
              : totalWords > 0 
                ? `${totalWords} words ready for AI` 
                : 'No resume provided yet'}
          </span>
          <span className="text-indigo-600 font-semibold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Synced with AI
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Right Column: AI Coach Chat Interface                                     */}
      {/* ========================================================================= */}
      <div className="w-full lg:flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm h-[600px] lg:h-full">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900 text-sm sm:text-base">AI Career Coach</h2>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full">
                  Groq LLM
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate max-w-[280px] sm:max-w-md">
                {currentJobContext ? (
                  <span className="text-indigo-600 font-medium">
                    Focused on: <strong>{currentJobContext.title}</strong> @ {currentJobContext.organization}
                  </span>
                ) : (
                  "Personalized guidance, skill gap analysis & interview prep"
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {currentJobContext && (
              <button 
                onClick={clearJobContext}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-full font-semibold transition-colors cursor-pointer"
                title="Exit job-specific coaching mode"
              >
                Clear Job Context
              </button>
            )}

            <button
              onClick={handleResetChat}
              title="Reset conversation"
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50/70">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[90%] sm:max-w-[82%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-purple-600 text-white shadow-xs' : 'bg-indigo-100 text-indigo-600 shadow-xs'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl shadow-2xs text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-xs' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-xs'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm prose-indigo max-w-none text-gray-800 prose-headings:font-bold prose-headings:text-gray-900 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-medium mr-2">Coach is thinking</span>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            Suggestions:
          </span>
          {promptSuggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => executeSendMessage(item.prompt)}
              className="text-xs px-2.5 py-1.5 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-full whitespace-nowrap transition-colors font-medium shrink-0 cursor-pointer disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl shrink-0">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentJobContext ? `Ask about ${currentJobContext.title} or skill gaps...` : "Ask for career advice, resume critique, or skill analysis..."}
              className="w-full py-3.5 pl-5 pr-14 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-full transition-transform active:scale-95 flex items-center justify-center cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Extracted Text Preview Modal                                              */}
      {/* ========================================================================= */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm truncate max-w-md">
                  {previewFile.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {formatFileSize(previewFile.size)} • {previewFile.wordCount} words extracted
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPreview}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  {copiedPreview ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Text
                    </>
                  )}
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 font-mono text-xs leading-relaxed text-gray-800 whitespace-pre-wrap select-text">
              {previewFile.text || 'No text extracted from this file.'}
            </div>

            <div className="p-3 border-t border-gray-200 bg-white flex justify-end">
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
