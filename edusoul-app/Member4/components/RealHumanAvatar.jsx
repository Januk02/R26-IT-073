import React, { useState, useEffect, useRef, useCallback } from 'react';
import ThreeDAvatar from './ThreeDAvatar';

const FALLBACK_AVATAR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231e1b4b"/><circle cx="50" cy="38" r="22" fill="%23a855f7"/><path d="M15 95 Q50 60 85 95 Z" fill="%239333ea"/></svg>`;

// AI Interview Presenters (3D avatar is default)
export const PRESENTERS = [
  {
    id: '3d_avatar',
    name: 'AI Interview Host',
    role: '3D Lip-Sync Presenter',
    gender: 'female',
    badge: '3D Avatar',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
];

const RealHumanAvatar = ({
  currentQuestion,
  onQuestionSpoken,
  autoPlay = false,
  className = ''
}) => {
  const [presenter] = useState(PRESENTERS[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [soundStatus, setSoundStatus] = useState('ready');

  const speechTimerRef = useRef(null);
  const currentAudioRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  const questionText = typeof currentQuestion === 'string'
    ? currentQuestion
    : currentQuestion?.question || '';

  // ========== BROWSER SPEECH SYNTHESIS (NATURAL SYSTEM HUMAN VOICE FALLBACK) ==========
  const playWebSpeechFallback = useCallback((text) => {
    const synth = synthRef.current || window.speechSynthesis;
    if (!synth) {
      const ms = Math.max(3500, text.length * 70);
      setTimeout(() => {
        setIsSpeaking(false);
        setSoundStatus('ready');
        if (onQuestionSpoken) onQuestionSpoken();
      }, ms);
      return;
    }

    try {
      if (synth.speaking || synth.pending) synth.cancel();
      if (synth.paused) synth.resume();
    } catch (_) {}

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // CRITICAL FIX: Do NOT force utterance.voice assignment in macOS Chrome.
    // Leaving voice un-set allows Chrome to use native system default human voice smoothly!

    utterance.onstart = () => {
      console.log('[Avatar] 🗣️ Browser SpeechSynthesis started');
      setIsSpeaking(true);
      setSoundStatus('playing');
    };

    utterance.onend = () => {
      console.log('[Avatar] 🔇 Browser SpeechSynthesis ended');
      setIsSpeaking(false);
      setSoundStatus('ready');
      if (onQuestionSpoken) onQuestionSpoken();
    };

    utterance.onerror = (e) => {
      console.warn('[Avatar] Browser SpeechSynthesis notice:', e.error);
      setIsSpeaking(false);
      setSoundStatus('ready');
    };

    try {
      synth.speak(utterance);
      console.log('[Avatar] 🔊 synth.speak dispatched for human voice');
    } catch (err) {
      console.error('[Avatar] synth.speak error:', err);
    }
  }, [onQuestionSpoken]);

  // ========== CORE SPEECH FUNCTION (REAL HUMAN VOICE AUDIO STREAM) ==========
  const speakNow = useCallback((text) => {
    if (!text) return;

    // 1. Immediately activate 3D Avatar mouth lip sync & visual state
    setIsSpeaking(true);
    setSoundStatus('playing');

    const estimatedMs = Math.max(3500, text.length * 75);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);

    // Stop any existing SpeechSynthesis or Audio playback
    const synth = synthRef.current || window.speechSynthesis;
    if (synth && synth.speaking) {
      try { synth.cancel(); } catch (_) {}
    }

    // 2. Play Real Human Voice Audio MP3 Stream via HTML5 Audio
    const cleanText = text.replace(/[^a-zA-Z0-9\s.,?']/g, '').trim();
    let audio = currentAudioRef.current;
    if (!audio) {
      audio = new Audio();
      currentAudioRef.current = audio;
    }

    audio.pause();
    audio.currentTime = 0;

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText.slice(0, 180))}&tl=en&client=tw-ob`;
    audio.src = ttsUrl;
    audio.volume = 1.0;

    audio.onplay = () => {
      console.log('[Avatar] 🗣️ Real Human Voice MP3 audio started playing!');
      setIsSpeaking(true);
      setSoundStatus('playing');
    };

    audio.onended = () => {
      console.log('[Avatar] 🔇 Real Human Voice MP3 audio completed');
      setIsSpeaking(false);
      setSoundStatus('ready');
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      if (onQuestionSpoken) onQuestionSpoken();
    };

    audio.onerror = (err) => {
      console.warn('[Avatar] HTML5 Audio notice, using WebSpeech fallback:', err);
      playWebSpeechFallback(text);
    };

    // Play Audio stream (User click unlocks HTML5 Audio playback in browser)
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[Avatar] Audio playback restricted, using WebSpeech fallback:', err);
        playWebSpeechFallback(text);
      });
    }

    // 3. Safety Timer — returns avatar to rest state smoothly when duration completes
    speechTimerRef.current = setTimeout(() => {
      setIsSpeaking(false);
      setSoundStatus('ready');
      if (onQuestionSpoken) onQuestionSpoken();
    }, estimatedMs);

  }, [onQuestionSpoken, playWebSpeechFallback]);

  // ========== PLAY BUTTON HANDLER ==========
  const handlePlayClick = useCallback(() => {
    if (isSpeaking) {
      const synth = synthRef.current || window.speechSynthesis;
      if (synth && synth.speaking) {
        try { synth.cancel(); } catch (_) {}
      }
      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
        } catch (_) {}
      }
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      setIsSpeaking(false);
      setSoundStatus('ready');
    } else {
      speakNow(questionText);
    }
  }, [isSpeaking, questionText, speakNow]);

  // ========== AUTO-PLAY ==========
  useEffect(() => {
    if (autoPlay && questionText) {
      const timer = setTimeout(() => speakNow(questionText), 500);
      return () => clearTimeout(timer);
    }
  }, [questionText, autoPlay]);

  // ========== CLEANUP ON UNMOUNT ==========
  useEffect(() => {
    return () => {
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      if (currentAudioRef.current) {
        try { currentAudioRef.current.pause(); } catch (_) {}
      }
      const synth = synthRef.current || window.speechSynthesis;
      if (synth && synth.speaking) {
        try { synth.cancel(); } catch (_) {}
      }
    };
  }, []);

  // ========== ASK AVATAR HANDLER ==========
  const handleAskAvatar = (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const userText = userQuery.trim();
    const newHistory = [...chatHistory, { sender: 'user', text: userText }];
    setChatHistory(newHistory);
    setUserQuery('');
    setIsThinking(true);

    setTimeout(() => {
      let response = "";
      const lower = userText.toLowerCase();
      if (lower.includes('hint') || lower.includes('example')) {
        response = `Here is a tip: Explain your core values when guiding others, share a specific mentoring instance, and mention how you adapt your approach.`;
      } else if (lower.includes('meaning') || lower.includes('clarify')) {
        response = `For this question: "${questionText}", focus on providing clear, structured insights from your personal mentoring experience.`;
      } else {
        response = `Great question! Be honest and detailed. Highlighting active listening and constructive feedback will yield a top score.`;
      }
      setIsThinking(false);
      setChatHistory([...newHistory, { sender: 'avatar', text: response }]);
      speakNow(response);
    }, 1000);
  };

  return (
    <div className={`bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-purple-500/30 relative overflow-hidden ${className}`}>
      {/* Background Glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg border-2 border-purple-400/50">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-lg">{presenter.name}</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                {presenter.badge}
              </span>
            </div>
            <p className="text-xs text-purple-200/80">{presenter.role}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAskModal(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-semibold text-white rounded-xl shadow-lg border border-purple-400/40 transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Ask Avatar
          </button>

          <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
            isSpeaking
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
              : 'bg-white/5 text-purple-200 border-white/10'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400'}`}></span>
            {isSpeaking ? 'Speaking' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Main Content: 3D Avatar + Question */}
      <div className="flex flex-col md:flex-row items-center gap-6 my-4 relative z-10">
        {/* 3D Avatar Stage */}
        <div className="relative flex-shrink-0">
          <div className={`absolute -inset-3 rounded-3xl blur-2xl transition-all duration-500 ${
            isSpeaking ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-80 animate-pulse' : 'bg-purple-600/20 opacity-30'
          }`}></div>

          <div className="relative w-56 h-64 md:w-64 md:h-72 rounded-2xl overflow-hidden border-2 border-purple-400/60 shadow-2xl bg-slate-950">
            <ThreeDAvatar
              modelUrl="/model.glb"
              isSpeaking={isSpeaking}
              currentText={questionText}
              className="w-full h-full"
            />

            {isSpeaking && (
              <div className="absolute bottom-12 inset-x-0 flex items-center justify-center gap-1.5 z-10">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
                <span className="text-[11px] font-bold text-white bg-slate-900/85 px-3 py-1 rounded-full border border-emerald-400/50 shadow-lg">
                  3D Lip-Sync Active
                </span>
              </div>
            )}

            {/* Status Bar */}
            <div className="absolute bottom-3 inset-x-3 bg-slate-950/85 backdrop-blur-md rounded-xl p-2.5 border border-white/10 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-purple-400'}`}></span>
                <span className="text-[11px] font-bold text-white">
                  {isSpeaking ? 'SPEAKING' : 'AVATAR READY'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                {isSpeaking ? 'ACTIVE' : 'IDLE'}
              </span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="flex-1 w-full bg-slate-900/80 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md relative shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-purple-300 font-bold flex items-center gap-1.5">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              AI Interview Host
            </span>

            <button
              onClick={handlePlayClick}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
                isSpeaking
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-purple-600 text-white hover:bg-purple-500 border border-purple-400/40'
              }`}
            >
              {isSpeaking ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                  Stop Speech
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ▶ Play Question
                </>
              )}
            </button>
          </div>

          <p className="text-xl font-semibold text-white leading-relaxed mb-4">
            "{questionText}"
          </p>

          {/* Audio Visualizer */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/10">
            <div className="flex items-end gap-1 h-5">
              <div className={`w-1 bg-purple-400 rounded-full transition-all duration-150 ${isSpeaking ? 'h-5 animate-bounce' : 'h-1.5'}`} style={{ animationDelay: '0ms' }}></div>
              <div className={`w-1 bg-pink-400 rounded-full transition-all duration-150 ${isSpeaking ? 'h-4 animate-bounce' : 'h-1'}`} style={{ animationDelay: '100ms' }}></div>
              <div className={`w-1 bg-indigo-400 rounded-full transition-all duration-150 ${isSpeaking ? 'h-6 animate-bounce' : 'h-2'}`} style={{ animationDelay: '200ms' }}></div>
              <div className={`w-1 bg-cyan-400 rounded-full transition-all duration-150 ${isSpeaking ? 'h-3 animate-bounce' : 'h-1'}`} style={{ animationDelay: '150ms' }}></div>
            </div>
            <span className="text-xs text-purple-200/80 font-medium">
              {isSpeaking ? `${presenter.name} is speaking...` : 'Click Play to hear the question'}
            </span>
          </div>
        </div>
      </div>

      {/* Ask Avatar Modal */}
      {showAskModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-lg">🤖</div>
                <div>
                  <h4 className="font-bold text-white">Ask {presenter.name}</h4>
                  <p className="text-xs text-purple-300">AI Interview Assistant</p>
                </div>
              </div>
              <button onClick={() => setShowAskModal(false)} className="text-gray-400 hover:text-white p-1">✕</button>
            </div>

            <div className="bg-slate-950/70 rounded-2xl p-4 h-60 overflow-y-auto mb-4 border border-white/5 space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs flex-shrink-0 mt-1">🤖</div>
                <div className="bg-purple-900/40 border border-purple-500/30 rounded-2xl rounded-tl-none p-3 text-xs text-purple-100 max-w-[85%]">
                  Hello! I'm your AI interview assistant. Feel free to ask me anything about this interview!
                </div>
              </div>

              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'avatar' && (
                    <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs flex-shrink-0 mt-1">🤖</div>
                  )}
                  <div className={`rounded-2xl p-3 text-xs max-w-[85%] ${
                    msg.sender === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-purple-900/40 border border-purple-500/30 text-purple-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-purple-300 text-xs py-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
                  <span>{presenter.name} is thinking...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleAskAvatar} className="flex gap-2">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Ask the AI host a question..."
                className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <button type="submit" disabled={!userQuery.trim() || isThinking} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealHumanAvatar;
