import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Bot, Send, User, X, FileText, CheckCircle2, 
  MessageSquare, Zap, Target, Minimize2, Maximize2, Sparkles
} from 'lucide-react';
import { chatWithCoach } from '../lib/ai';
import { extractResumeProfile } from '../lib/skillExtractor';

const STARTER_PROMPTS = [
  "How should I prepare for a Google L5 Systems Engineer interview?",
  "What are my 3 biggest skill gaps based on my resume?",
  "How can I rewrite my work experience to sound more senior?",
  "Suggest a 30-day learning roadmap for distributed systems."
];

export default function AIMascotCoach({
  resumeText,
  setResumeText,
  currentJobContext,
  clearJobContext,
  isOpen,
  setIsOpen
}) {
  // Mascot window open state (can be controlled externally or internally)
  const [internalOpen, setInternalOpen] = useState(false);
  const showWindow = isOpen !== undefined ? isOpen : internalOpen;
  const toggleWindow = useCallback((val) => {
    const nextVal = typeof val === 'boolean' ? val : !showWindow;
    if (setIsOpen) setIsOpen(nextVal);
    else setInternalOpen(nextVal);
  }, [showWindow, setIsOpen]);

  // Window Tab: 'chat' | 'resume'
  const [activeTab, setActiveTab] = useState('chat');

  // Mascot position (bottom-left corner default: 24px from left, 170px from bottom)
  const [position, setPosition] = useState({ x: 24, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isPickedUp, setIsPickedUp] = useState(false);

  // Eye tracking offsets
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Dragging refs
  const mascotRef = useRef(null);
  const visorRef = useRef(null);
  const dragData = useRef({
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    dist: 0
  });

  // Chat conversation state
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I am your **AI Career Coach**. I have full context of your uploaded resume. Ask me anything about engineering interview strategy, bridging skill gaps, or preparing for top tech companies!" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resumeSaved, setResumeSaved] = useState(false);
  const messagesEndRef = useRef(null);

  // Resume profile extraction
  const profile = useMemo(() => {
    return extractResumeProfile(resumeText);
  }, [resumeText]);

  // Set initial position once window dimensions are known
  useEffect(() => {
    const initY = Math.max(20, window.innerHeight - 170);
    setPosition({ x: 24, y: initY });

    const handleWindowResize = () => {
      if (!hasMoved) {
        setPosition({ x: 24, y: Math.max(20, window.innerHeight - 170) });
      }
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [hasMoved]);

  // Eye tracking logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!visorRef.current) return;
      const rect = visorRef.current.getBoundingClientRect();
      const visorCenterX = rect.left + rect.width / 2;
      const visorCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - visorCenterX;
      const dy = e.clientY - visorCenterY;

      const angle = Math.atan2(dy, dx);
      const distance = Math.min(1, Math.hypot(dx, dy) / 220);

      // Clamped eye offsets inside visor bounds
      const maxDistanceX = 5;
      const maxDistanceY = 4;

      setEyeOffset({
        x: Math.cos(angle) * (distance * maxDistanceX),
        y: Math.sin(angle) * (distance * maxDistanceY)
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Periodic blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Drag / Pick up pointer handlers
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    setIsPickedUp(true);
    dragData.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
      dist: 0
    };

    const handlePointerMove = (moveEvt) => {
      const dx = moveEvt.clientX - dragData.current.startX;
      const dy = moveEvt.clientY - dragData.current.startY;
      dragData.current.dist = Math.hypot(dx, dy);

      const newX = Math.max(10, Math.min(window.innerWidth - 120, dragData.current.origX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 150, dragData.current.origY + dy));

      setPosition({ x: newX, y: newY });
      setHasMoved(true);
    };

    const handlePointerUp = () => {
      setIsPickedUp(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      // If moved less than 6px, treat as click to open window
      if (dragData.current.dist < 6) {
        toggleWindow();
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Chat scrolling
  useEffect(() => {
    if (showWindow) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, showWindow]);

  // Context updates from parent
  useEffect(() => {
    if (currentJobContext) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `I see you are evaluating **${currentJobContext.title}** at **${currentJobContext.organization}**. What would you like to explore? Shall we break down requirements, analyze skill alignment, or run a practice interview question?` 
        }
      ]);
      toggleWindow(true);
    }
  }, [currentJobContext, toggleWindow]);

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

  // Calculate window popup position clamped to viewport
  const popupStyle = useMemo(() => {
    const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const isMobile = winWidth < 640;

    if (isMobile) {
      return {
        bottom: '16px',
        left: '12px',
        right: '12px',
        maxHeight: '80vh'
      };
    }

    // Desktop: anchor near the mascot
    let targetLeft = position.x + 115;
    let targetBottom = window.innerHeight - (position.y + 140);

    // If too close to right edge, place window to the left of mascot
    if (targetLeft + 480 > winWidth) {
      targetLeft = Math.max(16, position.x - 490);
    }
    targetBottom = Math.max(16, Math.min(window.innerHeight - 560, targetBottom));

    return {
      left: `${targetLeft}px`,
      bottom: `${targetBottom}px`,
      width: '480px',
      maxHeight: '580px'
    };
  }, [position]);

  return (
    <>
      {/* ================= DRAGGABLE / FLOATING MASCOT ================= */}
      <div
        ref={mascotRef}
        onPointerDown={handlePointerDown}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          touchAction: 'none'
        }}
        className={`fixed top-0 left-0 z-50 select-none cursor-grab active:cursor-grabbing group transition-opacity duration-200 ${
          showWindow ? 'opacity-90' : 'opacity-100'
        }`}
        title="AI Career Coach Mascot (Click to chat, or drag to pick up)"
      >
        <div 
          className={`relative transition-transform duration-150 ${
            isPickedUp 
              ? 'scale-110 -rotate-6 translate-y-[-8px]' 
              : 'hover:scale-105 active:scale-95'
          }`}
          style={!isPickedUp ? { animation: 'mascotBob 3s ease-in-out infinite' } : {}}
        >
          {/* Cute Speech Bubble when idle */}
          {!showWindow && !isPickedUp && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_#000] text-[9px] font-black uppercase text-black pointer-events-none transition-transform group-hover:scale-105">
              <span>Ask AI Coach</span>
            </div>
          )}

          {/* SVG Robot Mascot matching user illustration */}
          <svg 
            width="105" 
            height="125" 
            viewBox="0 0 160 180" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible drop-shadow-[2px_4px_0px_rgba(0,0,0,0.8)]"
          >
            {/* Ground Shadow */}
            <ellipse 
              cx="80" 
              cy="168" 
              rx={isPickedUp ? "22" : "32"} 
              ry={isPickedUp ? "4" : "6"} 
              fill="rgba(0, 0, 0, 0.25)"
              className="transition-all duration-150"
            />

            {/* --- RIGHT ARM (viewer's right, relaxed at side) --- */}
            <circle cx="106" cy="98" r="5" fill="#000000" />
            <rect x="105" y="103" width="12" height="20" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
            <rect x="107" y="108" width="8" height="3" fill="#7DD3FC" />
            <rect x="106" y="123" width="9" height="9" rx="1.5" fill="#000000" />

            {/* --- LEGS & FEET --- */}
            <rect x="68" y="122" width="24" height="6" rx="1" fill="#000000" />
            {/* Left Leg */}
            <rect x="71" y="127" width="6" height="12" fill="#000000" />
            <rect x="62" y="137" width="18" height="16" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
            <rect x="62" y="145" width="10" height="8" rx="1" fill="#7DD3FC" stroke="#000000" strokeWidth="2" />
            {/* Right Leg */}
            <rect x="83" y="127" width="6" height="12" fill="#000000" />
            <rect x="80" y="137" width="18" height="16" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
            <rect x="86" y="145" width="12" height="8" rx="1" fill="#BAE6FD" stroke="#000000" strokeWidth="2" />

            {/* --- TORSO --- */}
            <rect x="58" y="85" width="44" height="38" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="3" />
            {/* Left vent lines */}
            <line x1="64" y1="94" x2="72" y2="94" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="64" y1="100" x2="72" y2="100" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            {/* Right blue panel */}
            <rect x="85" y="86" width="16" height="26" fill="#7DD3FC" stroke="#000000" strokeWidth="2" />

            {/* --- LEFT ARM (viewer's left, waving pose) --- */}
            <circle cx="54" cy="98" r="5" fill="#000000" />
            {/* Upper arm segment */}
            <rect x="36" y="90" width="16" height="8" rx="2" transform="rotate(35 44 94)" fill="#000000" />
            {/* Forearm segment */}
            <rect x="26" y="74" width="14" height="18" rx="2" transform="rotate(35 33 83)" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
            {/* Hand block with cyan cuff */}
            <rect x="22" y="62" width="18" height="14" rx="2" transform="rotate(35 31 69)" fill="#BAE6FD" stroke="#000000" strokeWidth="2.5" />
            {/* Black fingers */}
            <rect x="20" y="58" width="5" height="7" rx="1" transform="rotate(35 22 61)" fill="#000000" />
            <rect x="26" y="54" width="5" height="7" rx="1" transform="rotate(35 28 57)" fill="#000000" />
            {/* Waving sparkle lines */}
            <line x1="16" y1="50" x2="22" y2="56" stroke="#7DD3FC" strokeWidth="3" strokeLinecap="round" />
            <line x1="24" y1="42" x2="27" y2="49" stroke="#7DD3FC" strokeWidth="3" strokeLinecap="round" />

            {/* --- NECK --- */}
            <rect x="73" y="79" width="14" height="7" fill="#000000" />

            {/* --- HEAD --- */}
            {/* Antenna on top-right */}
            <rect x="105" y="14" width="8" height="22" rx="1" fill="#000000" />
            <rect x="109" y="14" width="4" height="18" fill="#7DD3FC" />

            {/* Ear module on right */}
            <rect x="113" y="44" width="16" height="20" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
            <rect x="116" y="47" width="10" height="14" fill="#7DD3FC" stroke="#000000" strokeWidth="1.5" />
            <rect x="119" y="51" width="4" height="6" fill="#000000" />

            {/* Main Head Box with chamfered geometry */}
            <path 
              d="M 52 38 L 102 38 L 114 48 L 114 80 L 104 84 L 52 84 L 46 76 L 46 44 Z" 
              fill="#FFFFFF" 
              stroke="#000000" 
              strokeWidth="3.5" 
              strokeLinejoin="round" 
            />
            {/* Head right isometric bevel */}
            <path 
              d="M 102 38 L 114 48 L 114 80 L 104 84 L 104 46 Z" 
              fill="#BAE6FD" 
              stroke="#000000" 
              strokeWidth="1.5" 
            />
            {/* Black notch on top-left of forehead */}
            <rect x="54" y="44" width="8" height="4" rx="0.5" fill="#000000" />

            {/* --- SCREEN VISOR --- */}
            <rect 
              ref={visorRef}
              x="52" 
              y="44" 
              width="46" 
              height="33" 
              rx="3" 
              fill="#18181B" 
              stroke="#000000" 
              strokeWidth="2.5" 
            />

            {/* --- DYNAMIC EYES (TRACKS MOUSE CURSOR) --- */}
            <g style={{ transform: isBlinking ? 'scaleY(0.1)' : 'none', transformOrigin: '75px 60px', transition: 'transform 0.08s ease-out' }}>
              {/* Left Eye */}
              <rect 
                x={61 + eyeOffset.x} 
                y={51 + eyeOffset.y} 
                width="8" 
                height="17" 
                rx="1.5" 
                fill="#7DD3FC" 
              />
              {/* Right Eye */}
              <rect 
                x={79 + eyeOffset.x} 
                y={51 + eyeOffset.y} 
                width="8" 
                height="17" 
                rx="1.5" 
                fill="#7DD3FC" 
              />
            </g>
          </svg>
        </div>
      </div>

      {/* ================= FLOATING AI COACH POPUP WINDOW ================= */}
      {showWindow && (
        <div 
          style={popupStyle}
          className="fixed z-50 bg-white border-4 border-black shadow-[10px_10px_0px_0px_#000] flex flex-col font-serif overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Window Header */}
          <div className="p-3 sm:p-4 border-b-3 border-black bg-[#7DD3FC] flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 bg-black border-2 border-black flex items-center justify-center text-[#7DD3FC] shadow-[2px_2px_0px_0px_#000]">
                <Bot className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-black text-xs sm:text-sm uppercase tracking-wider leading-none">
                  AI Career Coach
                </h3>
                <span className="text-[9px] font-bold text-black/70 uppercase tracking-widest block mt-0.5">
                  {profile.name} • {profile.allSkills.length} Skills Active
                </span>
              </div>
            </div>

            {/* Tabs & Window Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`px-2 py-0.5 text-[10px] font-black uppercase transition-colors cursor-pointer ${
                    activeTab === 'chat' ? 'bg-black text-[#7DD3FC]' : 'text-black hover:bg-gray-100'
                  }`}
                >
                  Chat
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('resume')}
                  className={`px-2 py-0.5 text-[10px] font-black uppercase transition-colors cursor-pointer border-l-2 border-black ${
                    activeTab === 'resume' ? 'bg-black text-[#7DD3FC]' : 'text-black hover:bg-gray-100'
                  }`}
                >
                  Resume
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggleWindow(false)}
                className="w-7 h-7 bg-white hover:bg-rose-200 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer transition-colors"
                title="Minimize Coach"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Active Job Context Pill */}
          {currentJobContext && (
            <div className="bg-[#BAE6FD] border-b-2 border-black px-3 py-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <Target className="w-3.5 h-3.5 shrink-0" />
                <span className="font-black uppercase text-[10px] truncate">
                  Role Focus: {currentJobContext.title} ({currentJobContext.organization})
                </span>
              </div>
              {clearJobContext && (
                <button
                  type="button"
                  onClick={clearJobContext}
                  className="text-[9px] font-black uppercase underline hover:text-rose-700 ml-2 shrink-0 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* TAB 1: CHAT VIEW */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#F0F9FF]">
              
              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2.5 items-start`}>
                      
                      {/* Avatar */}
                      <div className={`w-7 h-7 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center shrink-0 ${
                        msg.role === 'user' ? 'bg-[#7DD3FC] text-black' : 'bg-black text-[#7DD3FC]'
                      }`}>
                        {msg.role === 'user' ? <User className="w-3.5 h-3.5 stroke-[2.5]" /> : <Bot className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>

                      {/* Message Bubble */}
                      <div className={`p-3 border-2 border-black text-xs shadow-[3px_3px_0px_0px_#000] leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-black text-[#7DD3FC] font-bold' 
                          : 'bg-white text-black font-normal'
                      }`}>
                        {msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <div className="prose prose-xs max-w-none text-black">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 items-center">
                      <div className="w-7 h-7 border-2 border-black bg-black text-[#7DD3FC] shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-white border-2 border-black p-2.5 shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-black animate-bounce"></div>
                        <div className="w-2 h-2 bg-black animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2 h-2 bg-black animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Starter Prompts Row */}
              {messages.length <= 2 && (
                <div className="p-2.5 bg-[#E0F2FE] border-t-2 border-black flex gap-1.5 overflow-x-auto shrink-0">
                  {STARTER_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-black hover:text-[#7DD3FC] text-black border border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000] transition-colors cursor-pointer shrink-0"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Field */}
              <div className="p-3 bg-white border-t-3 border-black shrink-0">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(input);
                  }} 
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={currentJobContext ? `Ask about ${currentJobContext.title}...` : "Ask for interview strategy, skill roadmaps..."}
                    className="flex-1 py-2 px-3 bg-[#F0F9FF] border-2 border-black shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all font-bold text-black placeholder:text-black/40 text-xs"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="py-2 px-3.5 bg-[#7DD3FC] hover:bg-black hover:text-[#7DD3FC] disabled:bg-gray-200 disabled:text-gray-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 font-black uppercase text-xs flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>SEND</span>
                    <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: RESUME CONTEXT VIEW */}
          {activeTab === 'resume' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#F0F9FF] p-4 space-y-3 overflow-y-auto">
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs uppercase text-black">
                    {profile.name}
                  </span>
                  <span className="text-[10px] font-black uppercase bg-[#7DD3FC] px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
                    {profile.yearsOfExperience}+ Yrs Experience
                  </span>
                </div>
                <p className="text-[10px] font-bold text-black/70 uppercase">
                  {profile.title}
                </p>

                {/* Extracted Skills List */}
                <div className="flex flex-wrap gap-1 pt-1 max-h-24 overflow-y-auto">
                  {profile.allSkills.map((sk, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 bg-[#F0F9FF] border border-black text-[9px] font-black uppercase shadow-[1px_1px_0px_0px_#000]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Live Editable Resume Text */}
              <div className="flex-1 flex flex-col min-h-[160px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase text-black/70">
                    Live Resume Text (Syncs to Coach):
                  </span>
                  {resumeSaved && (
                    <span className="text-[9px] font-black uppercase text-emerald-700 bg-white border border-black px-1.5">
                      Saved
                    </span>
                  )}
                </div>
                <textarea
                  value={resumeText}
                  onChange={handleSaveResume}
                  placeholder="Paste or edit resume text here to update coaching context..."
                  className="flex-1 p-2.5 text-xs font-bold text-black bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] focus:outline-none resize-none leading-relaxed"
                />
              </div>

            </div>
          )}

        </div>
      )}
    </>
  );
}
