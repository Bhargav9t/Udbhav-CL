import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, FileText, CheckCircle2 } from 'lucide-react';
import { chatWithCoach } from '../lib/ai';

export default function AICoach({ resumeText, setResumeText, currentJobContext, clearJobContext }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI Career Coach. Please paste your resume below so I can give you personalized advice. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resumeSaved, setResumeSaved] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages, isLoading]);

  // Handle incoming job context
  useEffect(() => {
    if (currentJobContext) {
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: `I see you are interested in the **${currentJobContext.title}** role at ${currentJobContext.organization}. What would you like to know? Do you want me to analyze your skill gaps for this specific role?` }
      ]);
    }
  }, [currentJobContext]);

  const handleSaveResume = (e) => {
    setResumeText(e.target.value);
    setResumeSaved(true);
    setTimeout(() => setResumeSaved(false), 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Filter messages for API (only keep user/assistant roles, avoid custom UI states if any)
    const apiMessages = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));

    const botResponse = await chatWithCoach(apiMessages, resumeText, currentJobContext);
    
    setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 w-full max-w-7xl mx-auto p-4">
      
      {/* Left Column: Resume Input */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-[400px] lg:h-full shrink-0">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 font-bold">
            <FileText className="w-5 h-5" />
            Your Resume / Profile
          </div>
          {resumeSaved && (
            <span className="flex items-center text-xs font-bold text-green-600 animate-pulse">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Saved
            </span>
          )}
        </div>
        <div className="flex-1 p-4 bg-gray-50/50">
          <textarea
            value={resumeText}
            onChange={handleSaveResume}
            placeholder="Paste your resume, skills, or LinkedIn profile text here... The AI Coach will use this to personalize its advice and analyze your fit for opportunities."
            className="w-full h-full p-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none shadow-inner"
          />
        </div>
      </div>

      {/* Right Column: Chat Interface */}
      <div className="w-full lg:w-2/3 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm h-[600px] lg:h-full">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">AI Coach</h2>
              <p className="text-xs text-gray-500">Powered by Groq</p>
            </div>
          </div>
          
          {currentJobContext && (
            <button 
              onClick={clearJobContext}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 py-1.5 px-3 rounded-full font-semibold transition-colors"
            >
              Clear Job Context
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl shadow-sm text-sm ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                }`}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <div className="prose prose-sm prose-indigo max-w-none">
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
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentJobContext ? "Ask about this specific job..." : "Ask for career advice or skill analysis..."}
              className="w-full py-4 pl-6 pr-16 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-gray-900 placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-full transition-transform active:scale-95 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
