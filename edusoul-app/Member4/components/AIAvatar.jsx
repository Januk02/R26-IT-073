import React, { useState, useEffect, useRef } from 'react';

// Free Avatar Personas with DiceBear Free API & Web Speech configurations
export const AVATAR_PERSONAS = [
  {
    id: 'evelyn',
    name: 'Dr. Evelyn',
    role: 'Lead AI Mentorship Evaluator',
    style: 'avataaars',
    seed: 'Evelyn',
    bgColor: 'b6e3f4',
    voicePitch: 1.1,
    voiceRate: 0.95,
    gender: 'female',
    badge: 'Senior Mentor',
    greeting: "Hello! I'm Dr. Evelyn. I'm here to guide you through your mentorship interview."
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    role: 'Senior Tech & Leadership Mentor',
    style: 'persona',
    seed: 'Marcus',
    bgColor: 'd1d4f9',
    voicePitch: 0.85,
    voiceRate: 0.9,
    gender: 'male',
    badge: 'Industry Lead',
    greeting: "Welcome! I'm Marcus. Take your time with each question—there are no wrong answers."
  },
  {
    id: 'aria',
    name: 'Aria Chen',
    role: 'Student Success & Guidance Specialist',
    style: 'lorelei',
    seed: 'Aria',
    bgColor: 'ffd5dc',
    voicePitch: 1.2,
    voiceRate: 1.0,
    gender: 'female',
    badge: 'Academic Coach',
    greeting: "Hi there! I'm Aria. Let's explore your mentoring style together."
  },
  {
    id: 'robomentor',
    name: 'RoboMentor AI',
    role: 'Automated Interview Assistant',
    style: 'bottts',
    seed: 'RoboMentor',
    bgColor: 'c0aede',
    voicePitch: 1.0,
    voiceRate: 0.9,
    gender: 'neutral',
    badge: 'AI Core',
    greeting: "System initialized. I am RoboMentor AI. Ready to administer verification questions."
  }
];

const AIAvatar = ({ 
  currentQuestion, 
  onQuestionSpoken, 
  autoPlay = true,
  className = ''
}) => {
  const [selectedPersona, setSelectedPersona] = useState(AVATAR_PERSONAS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [avatarResponse, setAvatarResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const speechSynthesis = window.speechSynthesis;
  const audioContextRef = useRef(null);

  // Load browser speech synthesis voices
  useEffect(() => {
    const updateVoices = () => {
      if (speechSynthesis) {
        const voices = speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Pick best matching voice based on persona
        const matchingVoice = voices.find(v => 
          selectedPersona.gender === 'female' 
            ? (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google US English') || v.name.includes('Zira'))
            : (v.name.includes('Male') || v.name.includes('Alex') || v.name.includes('David') || v.name.includes('Daniel'))
        ) || voices[0];
        
        setSelectedVoice(matchingVoice);
      }
    };

    updateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedPersona]);

  // Handle question auto-play when question changes
  useEffect(() => {
    if (autoPlay && currentQuestion) {
      speakText(currentQuestion.question);
    }
  }, [currentQuestionIndexQuestion(currentQuestion)]);

  function currentQuestionIndexQuestion(q) {
    return typeof q === 'string' ? q : q?.question || '';
  }

  // Speak text using SpeechSynthesis and trigger visual lip sync
  const speakText = (text) => {
    if (!speechSynthesis) return;

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = selectedPersona.voiceRate;
    utterance.pitch = selectedPersona.voicePitch;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsSpeaking(false);
      if (onQuestionSpoken) onQuestionSpoken();
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsPlaying(false);
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis && speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setIsSpeaking(false);
    }
  };

  // Handle asking the avatar a question
  const handleAskAvatar = (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const questionText = currentQuestionIndexQuestion(currentQuestion);
    const userText = userQuery.trim();
    
    // Add user message to chat history
    const updatedHistory = [...chatHistory, { sender: 'user', text: userText }];
    setChatHistory(updatedHistory);
    setUserQuery('');
    setIsThinking(true);

    // Contextual intelligent avatar response simulation
    setTimeout(() => {
      let response = "";
      const lower = userText.toLowerCase();

      if (lower.includes('hint') || lower.includes('example') || lower.includes('help')) {
        response = `Here is a helpful tip for this question: Focus on specific steps you take, such as listening actively, setting clear goals, and giving constructive feedback. Mentioning real examples makes your answer much stronger!`;
      } else if (lower.includes('meaning') || lower.includes('what do you mean') || lower.includes('clarify')) {
        response = `Regarding "${questionText}": We want to understand your mindset, values, and practical experience when working with students or mentees.`;
      } else if (lower.includes('score') || lower.includes('how will') || lower.includes('evaluated')) {
        response = `Your response will be evaluated on clarity, specific mentoring strategies, professionalism, and practical examples. Take your time to write a detailed answer!`;
      } else {
        response = `That's a great question! For "${questionText}", share your authentic perspective. Elaborate on your approach, how you maintain clear communication, and how you adapt to different learning needs.`;
      }

      setIsThinking(false);
      setAvatarResponse(response);
      setChatHistory([...updatedHistory, { sender: 'avatar', text: response }]);
      speakText(response);
    }, 1200);
  };

  // Construct free avatar image URL from DiceBear API
  const avatarUrl = `https://api.dicebear.com/7.x/${selectedPersona.style}/svg?seed=${selectedPersona.seed}&backgroundColor=${selectedPersona.bgColor}&radius=50`;

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl p-6 shadow-2xl border border-purple-800/40 relative overflow-hidden ${className}`}>
      {/* Background Glowing Mesh Effects */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={avatarUrl} 
              alt={selectedPersona.name} 
              className="w-12 h-12 rounded-full border-2 border-purple-400/60 shadow-lg bg-white/10 backdrop-blur-md"
              onError={(e) => {
                // Fallback SVG avatar placeholder
                e.target.onerror = null;
                e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%239333ea"><circle cx="50" cy="35" r="25"/><path d="M10 90 Q50 60 90 90 Z"/></svg>`;
              }}
            />
            <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
              isSpeaking ? 'bg-green-400 animate-ping' : 'bg-emerald-500'
            }`}></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-lg tracking-wide">{selectedPersona.name}</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                {selectedPersona.badge}
              </span>
            </div>
            <p className="text-xs text-purple-200/80">{selectedPersona.role}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPersonaSelector(!showPersonaSelector)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-medium text-purple-100 rounded-lg border border-white/10 backdrop-blur-sm transition-all"
            title="Switch AI Avatar Persona"
          >
            <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Switch Avatar
          </button>

          <button
            onClick={() => setShowAskModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-semibold text-white rounded-lg shadow-md transition-all border border-purple-400/30"
          >
            <svg className="w-4 h-4 text-amber-300 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Ask Avatar
          </button>
        </div>
      </div>

      {/* Persona Selection Dropdown Drawer */}
      {showPersonaSelector && (
        <div className="mb-6 bg-slate-800/90 rounded-xl p-4 border border-purple-500/30 backdrop-blur-md animate-fade-in z-20">
          <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3">
            Choose Your AI Interview Host Avatar:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {AVATAR_PERSONAS.map(persona => (
              <button
                key={persona.id}
                onClick={() => {
                  setSelectedPersona(persona);
                  setShowPersonaSelector(false);
                  speakText(`Switched avatar to ${persona.name}. How can I assist you?`);
                }}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                  selectedPersona.id === persona.id
                    ? 'bg-purple-600/40 border-purple-400 text-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-purple-400/50'
                }`}
              >
                <img 
                  src={`https://api.dicebear.com/7.x/${persona.style}/svg?seed=${persona.seed}&backgroundColor=${persona.bgColor}&radius=50`}
                  alt={persona.name}
                  className="w-10 h-10 rounded-full border border-purple-300/40"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{persona.name}</p>
                  <p className="text-[11px] text-purple-200/70 truncate">{persona.badge}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Avatar Stage / Visualization */}
      <div className="flex flex-col md:flex-row items-center gap-6 my-4 relative z-10">
        {/* Avatar Presentation Circle */}
        <div className="relative group flex-shrink-0">
          {/* Animated Glow Aura when Speaking */}
          <div className={`absolute -inset-3 rounded-full blur-xl transition-all duration-500 ${
            isSpeaking ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-80 animate-pulse' : 'bg-purple-600/20 opacity-40'
          }`}></div>

          <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-indigo-400 to-pink-500 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-900/90 overflow-hidden flex items-center justify-center relative">
              <img 
                src={avatarUrl} 
                alt={selectedPersona.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isSpeaking ? 'scale-105 animate-wiggle' : 'hover:scale-105'
                }`}
              />

              {/* Dynamic Lip Sync Sound Wave Overlay */}
              {isSpeaking && (
                <div className="absolute bottom-2 inset-x-0 flex items-end justify-center gap-1 h-8 bg-gradient-to-t from-slate-950/80 to-transparent pb-1">
                  <div className="w-1 bg-purple-400 rounded-full animate-bounce h-4" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 bg-pink-400 rounded-full animate-bounce h-6" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 bg-indigo-400 rounded-full animate-bounce h-7" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-1 bg-cyan-400 rounded-full animate-bounce h-5" style={{ animationDelay: '100ms' }}></div>
                  <div className="w-1 bg-purple-400 rounded-full animate-bounce h-3" style={{ animationDelay: '200ms' }}></div>
                </div>
              )}
            </div>
          </div>

          {/* Status Badge below Avatar */}
          <div className="absolute -bottom-2 inset-x-0 flex justify-center">
            <span className={`px-3 py-0.5 rounded-full text-[11px] font-semibold shadow-md flex items-center gap-1.5 ${
              isSpeaking
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white animate-pulse'
                : 'bg-slate-800 text-purple-200 border border-purple-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-white' : 'bg-purple-400'}`}></span>
              {isSpeaking ? 'Asking Question...' : 'Ready & Listening'}
            </span>
          </div>
        </div>

        {/* Question Display & Speech Output Speech Bubble */}
        <div className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative">
          {/* Speech Bubble Arrow for Desktop */}
          <div className="hidden md:block absolute -left-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-white/10"></div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-purple-300 font-bold flex items-center gap-1.5">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              AI Host Audio Guide
            </span>

            {/* Read Aloud / Replay Voice Controls */}
            <div className="flex items-center gap-2">
              {isPlaying ? (
                <button
                  onClick={stopSpeaking}
                  className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                  Stop Voice
                </button>
              ) : (
                <button
                  onClick={() => speakText(currentQuestionIndexQuestion(currentQuestion))}
                  className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Replay Question
                </button>
              )}
            </div>
          </div>

          <p className="text-lg font-medium text-white leading-relaxed mb-3">
            "{currentQuestionIndexQuestion(currentQuestion)}"
          </p>

          {/* Equalizer Soundbar Visualization */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <div className="flex items-end gap-1 h-4">
              <div className={`w-1 bg-purple-400 rounded-full transition-all duration-200 ${isSpeaking ? 'h-4 animate-bounce' : 'h-1.5'}`}></div>
              <div className={`w-1 bg-indigo-400 rounded-full transition-all duration-200 ${isSpeaking ? 'h-3 animate-bounce' : 'h-1'}`}></div>
              <div className={`w-1 bg-pink-400 rounded-full transition-all duration-200 ${isSpeaking ? 'h-4 animate-bounce' : 'h-2'}`}></div>
              <div className={`w-1 bg-cyan-400 rounded-full transition-all duration-200 ${isSpeaking ? 'h-2 animate-bounce' : 'h-1'}`}></div>
            </div>
            <span className="text-xs text-purple-200/70">
              {isSpeaking ? 'Avatar is speaking question aloud...' : 'Click Replay or Ask Avatar for guidance'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive "Ask Avatar" Modal Overlay */}
      {showAskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={avatarUrl} 
                  alt={selectedPersona.name}
                  className="w-10 h-10 rounded-full border border-purple-400"
                />
                <div>
                  <h4 className="font-bold text-white">Ask {selectedPersona.name}</h4>
                  <p className="text-xs text-purple-300">AI Assistant for Interview Clarifications & Hints</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAskModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Chat History Box */}
            <div className="bg-slate-950/60 rounded-xl p-4 h-60 overflow-y-auto mb-4 border border-white/5 space-y-3">
              <div className="flex items-start gap-2">
                <img src={avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full flex-shrink-0 mt-1" />
                <div className="bg-purple-900/40 border border-purple-500/30 rounded-2xl rounded-tl-none p-3 text-xs text-purple-100 max-w-[85%]">
                  {selectedPersona.greeting} Feel free to ask me for hints, clarification, or tips on answering this question!
                </div>
              </div>

              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'avatar' && (
                    <img src={avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full flex-shrink-0 mt-1" />
                  )}
                  <div className={`rounded-2xl p-3 text-xs max-w-[85%] ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-purple-900/40 border border-purple-500/30 text-purple-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-purple-300 text-xs py-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
                  <span>{selectedPersona.name} is thinking...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => setUserQuery("Can you give me a hint for this question?")}
                className="text-xs bg-white/5 hover:bg-white/10 text-purple-200 border border-white/10 px-3 py-1.5 rounded-full transition-all"
              >
                💡 Give me a hint
              </button>
              <button
                type="button"
                onClick={() => setUserQuery("What are key points to cover in my answer?")}
                className="text-xs bg-white/5 hover:bg-white/10 text-purple-200 border border-white/10 px-3 py-1.5 rounded-full transition-all"
              >
                📝 Key points to cover
              </button>
              <button
                type="button"
                onClick={() => setUserQuery("How will this question be evaluated?")}
                className="text-xs bg-white/5 hover:bg-white/10 text-purple-200 border border-white/10 px-3 py-1.5 rounded-full transition-all"
              >
                🎯 How is this evaluated?
              </button>
            </div>

            {/* Query Input Form */}
            <form onSubmit={handleAskAvatar} className="flex gap-2">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Ask the AI avatar a question..."
                className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!userQuery.trim() || isThinking}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-1"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAvatar;
