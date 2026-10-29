import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, User, Bot, FileText, CheckCircle2, Sparkles, 
  RefreshCw, MessageSquare, Zap, Target, BookOpen 
} from 'lucide-react';
import { chatWithCoach } from '../lib/ai';
import { extractResumeProfile } from '../lib/skillExtractor';

const STARTER_PROMPTS = [
  "🎯 How should I prepare for a Google L5 Systems Engineer interview?",
  "⚡ What are my 3 biggest skill gaps based on my resume?",
  "📄 How can I rewrite my work experience to sound more senior?",
  "🚀 Suggest a 30-day learning roadmap for distributed systems."
];

export default function AICoach({ resumeText, setResumeText, currentJobContext, clearJobContext }) {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I am your **AI Career Coach**. I have full context of your uploaded resume on the left. Ask me anything about engineering interview strategy, bridging skill gaps, or preparing for top tech companies." 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resumeSaved, setResumeSaved] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Extract skills from resume
  const profile = useMemo(() => {
    return extractResumeProfile(resumeText);
  }, [resumeText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages, isLoading]);

  useEffect(() => {
    if (currentJobContext) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `I see you are evaluating the **${currentJobContext.title}** role at **${currentJobContext.organization}**. What would you like to explore? Shall we break down requirements, evaluate your skill alignment, or practice technical questions?` 
        }
      ]);
    }
  }, [currentJobContext]);

  const handleSaveResume = (e) => {
    if (setResumeText) setResumeText(e.target.value);
    setResumeSaved(true);
    setTimeout(() => setResumeSaved(false), 2000);
  };

  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : input;
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const apiMessages = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));
    const botResponse = await chatWithCoach(apiMessages, resumeText, currentJobContext);
    
    setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 w-full max-w-7xl mx-auto font-serif text-black">
      
      {/* ================= LEFT COLUMN: RESUME PROFILE ================= */}
      <div className="w-full lg:w-96 xl:w-[420px] flex flex-col bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden shrink-0 h-[450px] lg:h-full">
        
        {/* Profile Card Header */}
        <div className="p-4 border-b-3 border-black bg-[#BAE6FD] flex items-center justify-between">
          <div className="flex items-center gap-2 text-black font-black uppercase text-xs sm:text-sm tracking-wide">
            <div className="p-1 bg-black text-[#7DD3FC] border border-black shadow-[1px_1px_0px_0px_#000]">
              <FileText className="w-4 h-4" />
            </div>
            Active Candidate Resume
          </div>
          {resumeSaved ? (
            <span className="flex items-center text-[10px] font-black uppercase bg-white text-black border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000]">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Saved
            </span>
          ) : (
            <span className="text-[10px] font-black uppercase bg-[#7DD3FC] text-black border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000]">
              {profile.allSkills.length} Skills
            </span>
          )}
        </div>

        {/* Profile Mini Summary */}
        <div className="p-4 bg-[#F0F9FF] border-b-2 border-black space-y-2">
          <div>
            <span className="font-black text-xs uppercase text-black block leading-tight">
              {profile.name}
            </span>
            <span className="text-[10px] font-bold text-black/60 uppercase">
              {profile.title} • {profile.yearsOfExperience}+ Yrs Experience
            </span>
          </div>

          {/* Skill Pills preview */}
          <div className="flex flex-wrap gap-1 pt-1 max-h-16 overflow-y-auto">
            {profile.allSkills.slice(0, 8).map((sk, idx) => (
              <span key={idx} className="px-1.5 py-0.5 bg-white text-black border border-black text-[9px] font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                {sk}
              </span>
            ))}
            {profile.allSkills.length > 8 && (
              <span className="text-[9px] font-bold text-black/60 self-center">
                +{profile.allSkills.length - 8} more
              </span>
            )}
          </div>
        </div>

        {/* Text Area for In-Place Resume Editing */}
        <div className="flex-1 p-4 bg-[#F0F9FF] flex flex-col min-h-0">
          <p className="text-[10px] font-black text-black/70 uppercase mb-2">
            Raw Resume Text (Directly Syncs to AI):
          </p>
          <textarea
            value={resumeText}
            onChange={handleSaveResume}
            placeholder="Paste your raw resume, achievements, or project descriptions here..."
            className="w-full flex-1 p-3 text-xs font-bold text-black bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] focus:shadow-[5px_5px_0px_0px_#000] focus:outline-none resize-none leading-relaxed"
          />
        </div>

      </div>

      {/* ================= RIGHT COLUMN: CONVERSATIONAL AI COACH ================= */}
      <div className="w-full lg:flex-1 flex flex-col bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] h-[600px] lg:h-full">
        
        {/* Chat Header */}
        <div className="p-4 border-b-3 border-black flex justify-between items-center bg-[#7DD3FC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black border-2 border-black flex items-center justify-center text-[#7DD3FC] shadow-[2px_2px_0px_0px_#000]">
              <Bot className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-black text-black text-sm sm:text-base uppercase tracking-wider">
                Conversational AI Coach
              </h2>
              <p className="text-[10px] font-bold text-black/70 uppercase tracking-widest">
                Real-Time Context from {profile.name}'s Resume
              </p>
            </div>
          </div>
          
          {currentJobContext && (
            <button 
              onClick={clearJobContext}
              className="text-[11px] bg-white hover:bg-[#BAE6FD] text-black py-1 px-2.5 border-2 border-black font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-colors cursor-pointer"
            >
              Clear Job Context
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#F0F9FF]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3 items-start`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-[#7DD3FC] text-black' : 'bg-black text-[#7DD3FC]'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 stroke-[2.5]" /> : <Bot className="w-4 h-4 stroke-[2.5]" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 border-2 border-black text-xs sm:text-sm shadow-[3px_3px_0px_0px_#000] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-black text-[#7DD3FC] font-bold' 
                    : 'bg-white text-black font-normal'
                }`}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <div className="prose prose-sm max-w-none text-black">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 border-2 border-black bg-black text-[#7DD3FC] shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border-2 border-black p-3 shadow-[3px_3px_0px_0px_#000] flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-black animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-black animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2.5 h-2.5 bg-black animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Starter Prompts Row */}
        {messages.length <= 2 && (
          <div className="p-3 bg-[#E0F2FE] border-t-2 border-black flex gap-2 overflow-x-auto">
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-3 py-1.5 bg-white hover:bg-black hover:text-[#7DD3FC] text-black border border-black text-[11px] font-black uppercase shadow-[1px_1px_0px_0px_#000] transition-colors cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t-3 border-black">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }} 
            className="relative flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentJobContext ? `Ask about ${currentJobContext.title}...` : "Ask for career strategy, interview prep, or skill roadmap..."}
              className="flex-1 py-3 px-4 bg-[#F0F9FF] border-2 border-black shadow-[3px_3px_0px_0px_#000] focus:shadow-[5px_5px_0px_0px_#000] focus:outline-none transition-all font-bold text-black placeholder:text-black/40 text-xs sm:text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="py-3 px-5 bg-[#7DD3FC] hover:bg-black hover:text-[#7DD3FC] disabled:bg-gray-200 disabled:text-gray-400 text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] font-black uppercase text-xs tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>SEND</span>
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
