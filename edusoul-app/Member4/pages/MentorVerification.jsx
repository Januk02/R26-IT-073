import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { doc, setDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../src/firebase';
import MedalBadge, { getMedalTier, getMedalInfo } from '../components/MedalBadge';
import { mentorshipApi } from '../services/mentorshipApi';
import RealHumanAvatar from '../components/RealHumanAvatar';

const QUESTIONS = [
  {
    id: 1,
    domain: 'Mentorship Skill',
    questions: [
      'How would you describe your mentoring approach?',
      'Can you give one example of supporting a student or junior?'
    ]
  },
  {
    id: 2,
    domain: 'Handling Challenges',
    questions: [
      'How do you support a alumni who is struggling or unmotivated?'
    ]
  },
  {
    id: 3,
    domain: 'Communication & Relationship',
    questions: [
      'How do you build trust with an alumni?',
      'How do you give difficult feedback?'
    ]
  },
  {
    id: 4,
    domain: 'Commitment & Boundaries',
    questions: [
      'How much time can you realistically commit per month?',
      'How do you maintain professional boundaries?'
    ]
  },
  {
    id: 5,
    domain: 'Motivation & Values',
    questions: [
      'Why do you want to mentor students?',
      'What do you think students need most from a mentor?'
    ]
  },
  {
    id: 6,
    domain: 'Expectations',
    questions: [
      'What do you expect from an alumni?'
    ]
  },
  {
    id: 7,
    domain: 'Adaptability',
    questions: [
      'How would you adjust your approach to different students?'
    ]
  },
  {
    id: 8,
    domain: 'Self-awareness / Limits',
    questions: [
      'What kind of mentoring situations would be challenging for you?'
    ]
  },
  {
    id: 9,
    domain: 'Conflict / Rupture Repair',
    questions: [
      'What would you do if a alumni disagreed with your advice?'
    ]
  }
];

const QUESTION_VIDEO_URLS = {
  'How would you describe your mentoring approach?': '/videos/question-01.mp4',
  'Can you give one example of supporting a student or junior?': '/videos/question-02.mp4',
  'How do you support a alumni who is struggling or unmotivated?': '/videos/question-03.mp4',
  'How do you build trust with an alumni?': '/videos/question-04.mp4',
  'How do you give difficult feedback?': '/videos/question-05.mp4',
  'How much time can you realistically commit per month?': '/videos/question-06.mp4',
  'How do you maintain professional boundaries?': '/videos/question-07.mp4',
  'Why do you want to mentor students?': '/videos/question-08.mp4',
  'What do you think students need most from a mentor?': '/videos/question-09.mp4',
  'What do you expect from an alumni?': '/videos/question-10.mp4',
  'How would you adjust your approach to different students?': '/videos/question-11.mp4',
  'What kind of mentoring situations would be challenging for you?': '/videos/question-12.mp4',
  'What would you do if a alumni disagreed with your advice?': '/videos/question-13.mp4'
};

const MentorVerification = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState({});
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true); // Auto-enable voice mode
  const [avatarMode, setAvatarMode] = useState(true); // Interactive AI Avatar mode
  const [transcribing, setTranscribing] = useState(false);
  const [videoTransitioning, setVideoTransitioning] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechSynthesis = window.speechSynthesis;

  const allQuestions = QUESTIONS.flatMap(domain => 
    domain.questions.map(q => ({
      question: q,
      domain: domain.domain,
      videoUrl: QUESTION_VIDEO_URLS[q]
    }))
  );

  const currentQuestion = allQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / allQuestions.length) * 100;

  useEffect(() => {
    if (!currentQuestion?.videoUrl) return;

    setVideoTransitioning(true);
    const transitionTimer = setTimeout(() => setVideoTransitioning(false), 450);
    return () => clearTimeout(transitionTimer);
  }, [currentQuestionIndex, currentQuestion?.videoUrl]);

  // Auto-play question when changing questions (if voice mode is on)
  // IMPORTANT: When avatarMode is ON, RealHumanAvatar handles all speech.
  // This page-level speakQuestion only runs when avatarMode is OFF (text-only mode).
  useEffect(() => {
    if (voiceMode && currentQuestion && !avatarMode && !currentQuestion.videoUrl) {
      const timer = setTimeout(() => {
        speakQuestion(currentQuestion.question);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, voiceMode, avatarMode]);

  // Text-to-speech for voice guide (only used in non-avatar mode)
  const speakQuestion = (text) => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    
    speechSynthesis.speak(utterance);
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordings(prev => ({
          ...prev,
          [currentQuestionIndex]: audioUrl
        }));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to record your answer.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Professional Answer Analysis System
  const analyzeAnswer = async (question, answerText) => {
    const text = answerText.toLowerCase().trim();
    
    // Return 0 score for empty or very short answers (<10 chars)
    if (text.length < 10) {
      return 0;
    }

    // Comprehensive evaluation criteria for each domain
    const evaluationCriteria = {
      'Mentorship Skill': {
        essentialKeywords: ['approach', 'method', 'strategy', 'style', 'technique'],
        qualityKeywords: ['support', 'guide', 'help', 'encourage', 'empower', 'facilitate'],
        exampleKeywords: ['example', 'instance', 'case', 'specific', 'particular', 'time'],
        experienceKeywords: ['experience', 'background', 'years', 'worked', 'practiced'],
        weightings: { essential: 3, quality: 2, example: 2, experience: 1 }
      },
      
      'Handling Challenges': {
        essentialKeywords: ['struggling', 'unmotivated', 'difficult', 'challenge', 'problem'],
        supportKeywords: ['support', 'help', 'assist', 'encourage', 'motivate', 'inspire'],
        strategyKeywords: ['identify', 'understand', 'assess', 'analyze', 'diagnose'],
        solutionKeywords: ['solution', 'approach', 'strategy', 'plan', 'action', 'steps'],
        weightings: { essential: 3, support: 2, strategy: 2, solution: 1 }
      },
      
      'Communication & Relationship': {
        essentialKeywords: ['trust', 'rapport', 'relationship', 'connection', 'bond'],
        feedbackKeywords: ['feedback', 'constructive', 'honest', 'direct', 'tough', 'difficult'],
        listeningKeywords: ['listen', 'understand', 'empathize', 'hear', 'attentive'],
        opennessKeywords: ['open', 'honest', 'transparent', 'sincere', 'genuine'],
        weightings: { essential: 3, feedback: 2, listening: 2, openness: 1 }
      },
      
      'Commitment & Boundaries': {
        essentialKeywords: ['time', 'hours', 'commitment', 'dedication', 'availability'],
        boundaryKeywords: ['boundaries', 'limits', 'professional', 'appropriate', 'ethical'],
        respectKeywords: ['respect', 'confidentiality', 'privacy', 'trust', 'integrity'],
        practicalKeywords: ['realistic', 'practical', 'manageable', 'feasible', 'reasonable'],
        weightings: { essential: 3, boundary: 3, respect: 2, practical: 1 }
      },
      
      'Motivation & Values': {
        essentialKeywords: ['why', 'motivation', 'reason', 'purpose', 'drive'],
        passionKeywords: ['passion', 'love', 'enjoy', 'fulfillment', 'satisfaction'],
        impactKeywords: ['impact', 'difference', 'contribution', 'help', 'make', 'change'],
        growthKeywords: ['growth', 'development', 'learning', 'improvement', 'progress'],
        weightings: { essential: 3, passion: 2, impact: 2, growth: 1 }
      },
      
      'Expectations': {
        essentialKeywords: ['expect', 'requirement', 'need', 'should', 'must'],
        commitmentKeywords: ['commitment', 'effort', 'dedication', 'engagement', 'participation'],
        communicationKeywords: ['communication', 'feedback', 'updates', 'progress', 'check-in'],
        respectKeywords: ['respect', 'professionalism', 'courtesy', 'consideration'],
        weightings: { essential: 3, commitment: 2, communication: 2, respect: 1 }
      },
      
      'Adaptability': {
        essentialKeywords: ['adjust', 'adapt', 'flexible', 'modify', 'change'],
        personalizationKeywords: ['personalize', 'individual', 'custom', 'tailor', 'specific'],
        assessmentKeywords: ['assess', 'evaluate', 'understand', 'identify', 'recognize'],
        approachKeywords: ['approach', 'method', 'technique', 'strategy', 'style'],
        weightings: { essential: 3, personalization: 2, assessment: 2, approach: 1 }
      },
      
      'Self-awareness / Limits': {
        essentialKeywords: ['challenging', 'difficult', 'limit', 'boundary', 'struggle'],
        honestyKeywords: ['honest', 'aware', 'recognize', 'admit', 'acknowledge'],
        referralKeywords: ['refer', 'redirect', 'specialist', 'expert', 'resource'],
        learningKeywords: ['learn', 'improve', 'develop', 'grow', 'seek'],
        weightings: { essential: 3, honesty: 2, referral: 2, learning: 1 }
      },
      
      'Conflict / Rupture Repair': {
        essentialKeywords: ['disagree', 'conflict', 'disagreement', 'tension', 'rupture'],
        respectKeywords: ['respect', 'validate', 'acknowledge', 'understand', 'empathize'],
        discussionKeywords: ['discuss', 'talk', 'communicate', 'dialogue', 'conversation'],
        resolutionKeywords: ['compromise', 'solution', 'resolve', 'agree', 'common ground'],
        weightings: { essential: 3, respect: 2, discussion: 2, resolution: 1 }
      }
    };

    const criteria = evaluationCriteria[question.domain];
    if (!criteria) {
      return 5; // Default score for unknown domains
    }

    // Calculate keyword scores
    let totalScore = 0;
    let maxPossibleScore = 0;
    const foundKeywords = [];

    Object.keys(criteria).forEach(category => {
      if (category === 'weightings') return;
      
      const keywords = criteria[category];
      const weight = criteria.weightings[category.replace('Keywords', '')];
      maxPossibleScore += weight;
      
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          totalScore += weight / keywords.length;
          foundKeywords.push(keyword);
        }
      });
    });

    // Quality assessment using diminishing-returns formula (no length bias)
    let qualityBonus = 0;
    
    // Diminishing-returns word-count bonus (caps at ~1.5 instead of unlimited 2.5)
    const wordCount = text.split(/\s+/).length;
    qualityBonus += Math.min(1.5, Math.log1p(wordCount / 10) * 0.8);

    // Conciseness bonus: high keyword density in fewer words is rewarded
    const keywordDensity = totalScore / maxPossibleScore;
    if (keywordDensity > 0.3 && wordCount < 80) {
        qualityBonus += 0.6; // concise but highly relevant
    }
    
    // Structure and coherence bonuses
    const sentenceCount = text.split(/[.!?]/).filter(s => s.trim()).length;
    if (sentenceCount > 2) qualityBonus += 0.4;
    if (text.includes('example') || text.includes('instance') || text.includes('specific')) qualityBonus += 0.6;
    if (text.includes('because') || text.includes('therefore') || text.includes('so') || text.includes('thus')) qualityBonus += 0.4;
    
    // Professional language bonuses (capped at 1.0)
    const professionalTerms = [
        'professional', 'appropriate', 'effective', 'successful', 'positive', 'constructive',
        'approach', 'strategy', 'method', 'technique', 'process', 'systematic',
        'understand', 'assess', 'evaluate', 'analyze', 'identify', 'recognize',
        'support', 'guide', 'help', 'assist', 'encourage', 'empower', 'facilitate',
        'communication', 'relationship', 'trust', 'rapport', 'connection', 'bond'
    ];
    const profTermsFound = professionalTerms.filter(term => text.includes(term)).length;
    qualityBonus += Math.min(profTermsFound * 0.12, 1.0);
    
    // Avoid generic answers penalty
    const genericPhrases = ['i dont know', 'not sure', 'maybe', 'perhaps'];
    const genericFound = genericPhrases.filter(phrase => text.includes(phrase)).length;
    qualityBonus -= genericFound * 0.5;
    
    // Relevance detection - penalize completely irrelevant answers
    const relevanceScore = totalScore / maxPossibleScore;
    if (relevanceScore < 0.05) {
        qualityBonus -= 2.0;
    }
    
    // Calculate final score with enhanced scaling
    let finalScore = (totalScore / maxPossibleScore) * 6;
    finalScore += qualityBonus;
    
    // Apply domain-specific adjustments
    if (question.domain === 'Mentorship Skill' && text.includes('example')) {
        finalScore += 0.5;
    }
    if (question.domain === 'Handling Challenges' && text.includes('understand') && text.includes('support')) {
        finalScore += 0.5;
    }
    if (question.domain === 'Communication & Relationship' && text.includes('trust') && text.includes('feedback')) {
        finalScore += 0.5;
    }
    
    // Ensure score is within bounds
    finalScore = Math.max(1, Math.min(10, finalScore));
    
    // Round to one decimal place
    return Math.round(finalScore * 10) / 10;
  };

  // Save verification to Firestore
  const saveVerification = async (verificationData) => {
    try {
      const verificationRef = doc(collection(db, 'verifications'));
      await setDoc(verificationRef, {
        ...verificationData,
        id: verificationRef.id,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving verification:', error);
    }
  };

  const getVerificationStatus = (score) => score >= 50 ? 'qualified' : 'needs-retry';
  const getVerificationStatusLabel = (score) => score >= 50 ? 'Qualified' : 'Needs Re-attempt';

  const updateMentorVerificationStatus = async (interviewScore) => {
    const cvSnapshot = await getDocs(query(
      collection(db, 'cvVerifications'),
      where('mentorId', '==', user.uid)
    ));
    const latestCV = cvSnapshot.docs
      .map(cvDoc => cvDoc.data())
      .sort((first, second) => new Date(second.uploadedAt) - new Date(first.uploadedAt))[0];
    const status = interviewScore >= 50 && latestCV?.overallScore >= 50
      ? 'verified'
      : interviewScore < 50 || latestCV?.overallScore < 50
        ? 'needs-retry'
        : 'pending-cv';
    const statusLabels = {
      verified: 'Verified Mentor',
      'needs-retry': 'Needs Re-attempt',
      'pending-cv': 'CV Verification Required'
    };

    await setDoc(doc(db, 'users', user.uid), {
      mentorVerificationStatus: status,
      mentorVerificationStatusLabel: statusLabels[status],
      isMentorVerified: status === 'verified',
      mentorVerificationStatusUpdatedAt: new Date().toISOString()
    }, { merge: true });
  };

  // Navigate to next question
  const handleNext = async () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      setIsAnalyzing(true);

      let newScores = {};
      let percentage = 0;

      // Try server-side scoring first (secure), fall back to client-side
      try {
        const questionsPayload = allQuestions.map(q => ({
          question: q.question,
          domain: q.domain
        }));
        const result = await mentorshipApi.analyzeInterview(questionsPayload, answers);
        // Convert string keys from backend to number keys
        Object.entries(result.scores).forEach(([key, val]) => {
          newScores[Number(key)] = val;
        });
        percentage = Math.round(result.overallScore);
        console.log('✅ Interview scored by backend');
      } catch (backendErr) {
        console.warn('⚠️ Backend unavailable, using client-side scoring:', backendErr.message);
        // Fallback: score locally
        for (let i = 0; i < allQuestions.length; i++) {
          const answer = answers[i] || '';
          const score = await analyzeAnswer(allQuestions[i], answer);
          newScores[i] = score;
        }
        const totalScore = Object.values(newScores).reduce((sum, score) => sum + score, 0);
        const maxPossibleScore = allQuestions.length * 10;
        percentage = Math.round((totalScore / maxPossibleScore) * 100);
      }

      setScores(newScores);
      
      // Save verification to Firestore
      const verificationData = {
        mentorId: user.uid,
        mentorEmail: user.email,
        questions: allQuestions.map(q => q.question),
        questionDomains: allQuestions.map(q => q.domain),
        answers: answers,
        scores: newScores,
        overallScore: Math.round(percentage),
        verificationStatus: getVerificationStatus(percentage),
        verificationStatusLabel: getVerificationStatusLabel(percentage)
      };
      
      await saveVerification(verificationData);
      await updateMentorVerificationStatus(percentage);
      
      setFinalScore(percentage);
      setIsAnalyzing(false);
      setShowResults(true);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // Calculate final score
  const calculateFinalScore = () => {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const maxPossibleScore = allQuestions.length * 10;
    const percentage = (totalScore / maxPossibleScore) * 100;
    setFinalScore(percentage);
  };

  // Handle answer text input
  const handleAnswerChange = (text) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: text
    }));
  };

  // Play recorded audio
  const playRecording = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          {isAnalyzing ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Answers...</h2>
              <p className="text-gray-600">Our AI is evaluating your responses</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-32 h-32 mb-4">
                  <MedalBadge 
                    tier={getMedalTier(finalScore)} 
                    size="lg" 
                    showLabel={false}
                    animated={true}
                  />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Complete!</h2>
                <p className="text-gray-600">Your mentorship interview has been analyzed</p>
                <div className="mt-3">
                  <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-sm font-semibold">
                    🏆 {getMedalInfo(getMedalTier(finalScore)).name} Earned!
                  </span>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-6 mb-6 border border-purple-200">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Overall Performance Score</p>
                  <p className="text-5xl font-bold text-purple-600 mb-2">{Math.round(finalScore)}%</p>
                  <p className="text-sm text-gray-500">
                    {finalScore >= 80 ? 'Excellent' : finalScore >= 60 ? 'Good' : finalScore >= 40 ? 'Satisfactory' : 'Needs Improvement'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Scores are automatically generated by AI analysis</p>
                </div>
              </div>

              <div className="space-y-4 mb-8 max-h-64 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Question-by-Question Scores:</h3>
                {allQuestions.map((q, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-purple-600 font-medium mb-1">{q.domain}</p>
                        <p className="text-sm text-gray-700">{q.question}</p>
                      </div>
                      <div className="ml-4">
                        <span className="text-lg font-bold text-gray-900">
                          {scores[index] || 0}/10
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResults(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Review Answers
                </button>
                <button
                  onClick={onComplete}
                  className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Continue to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-3 py-4 sm:px-6">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 pb-24">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Mentor Verification Interview</h2>
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {allQuestions.length}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-purple-800 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Mode Toggles: AI Avatar & Voice Mode */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 p-4 bg-gradient-to-r from-purple-900/10 via-purple-50 to-indigo-900/10 rounded-xl border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 text-white rounded-lg shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">AI Avatar Interview Host</h4>
              <p className="text-xs text-gray-600">Free Interactive Avatar asks questions & answers clarifications</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Avatar Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">AI Avatar</span>
              <button
                onClick={() => setAvatarMode(!avatarMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  avatarMode ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  avatarMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Voice Mode Toggle */}
            <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
              <span className="text-xs font-semibold text-gray-700">Auto Voice</span>
              <button
                onClick={() => setVoiceMode(!voiceMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  voiceMode ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  voiceMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
          <div>
        {/* Question Card / Photorealistic Human Avatar Host Stage */}
        {avatarMode ? (
          <div className="mb-6">
            {currentQuestion.videoUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-purple-200 bg-black shadow-lg">
                <div className="pointer-events-none absolute left-120 top-70 z-10 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white shadow-md backdrop-blur-sm">
                  Question {currentQuestionIndex + 1} of {allQuestions.length}
                </div>
                <video
                  className={`block aspect-video w-full object-contain transition-all duration-500 ease-out [transform:rotateY(${videoTransitioning ? '3deg' : '0deg'})_scale(${videoTransitioning ? '0.985' : '1'})] ${videoTransitioning ? 'opacity-70' : 'opacity-100'}`}
                  src={currentQuestion.videoUrl}
                  autoPlay
                  preload="auto"
                  playsInline
                  aria-label="AI mentor asking the interview question"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onCanPlay={() => setVideoTransitioning(false)}
                >
                  Your browser does not support video playback.
                </video>
                <div className="bg-purple-950 px-4 py-3 text-white">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-purple-200">
                    {currentQuestion.domain}
                  </span>
                  <p className="text-base font-semibold leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </div>
              </div>
            ) : (
              <RealHumanAvatar 
                currentQuestion={currentQuestion}
                autoPlay={voiceMode}
                onQuestionSpoken={() => setIsPlaying(false)}
              />
            )}
          </div>
        ) : (
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                {currentQuestion.domain}
              </span>
              {voiceMode && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Voice Active
                </span>
              )}
            </div>
            <p className="text-xl text-gray-900 font-medium mb-4">{currentQuestion.question}</p>
            
            {/* Voice Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => speakQuestion(currentQuestion.question)}
                disabled={isPlaying}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-purple-600 hover:text-purple-800 font-medium text-sm shadow-sm transition-all"
              >
                <svg className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                {isPlaying ? 'Speaking...' : '🔊 Read Aloud'}
              </button>
              
              {isRecording && (
                <span className="text-red-600 text-sm font-medium animate-pulse">
                  ● Recording...
                </span>
              )}
            </div>
          </div>
        )}

          </div>
          <div>
        {/* Voice Recording Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 border border-gray-200 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Voice Answer
            </h3>
            {voiceMode && !isRecording && !recordings[currentQuestionIndex] && (
              <span className="text-xs text-gray-500">Click microphone to answer</span>
            )}
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg animate-pulse' 
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
              }`}
            >
              {isRecording ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                  </svg>
                  Stop Recording
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  {recordings[currentQuestionIndex] ? 'Re-record Answer' : 'Start Recording'}
                </>
              )}
            </button>
            
            {recordings[currentQuestionIndex] && (
              <>
                <button
                  onClick={() => playRecording(recordings[currentQuestionIndex])}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Play Answer
                </button>
                
                <button
                  onClick={() => {
                    setTranscribing(true);
                    setTimeout(() => {
                      const mockTranscription = "I've been mentoring students for over 5 years...";
                      handleAnswerChange(mockTranscription);
                      setTranscribing(false);
                    }, 2000);
                  }}
                  disabled={transcribing}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  {transcribing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Transcribing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Transcribe to Text
                    </>
                  )}
                </button>
              </>
            )}
          </div>
          
          {isRecording && (
            <div className="flex items-center gap-3 text-red-600 bg-red-50 p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-1 h-4 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-1 h-4 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
              <span className="text-sm font-medium">Recording in progress... Speak clearly</span>
            </div>
          )}
          
          {recordings[currentQuestionIndex] && !isRecording && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Answer recorded successfully
            </div>
          )}
        </div>

        {/* Text Answer Section for AI Analysis */}
        <div className="bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-200 mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Type Your Answer</h3>
            {recordings[currentQuestionIndex] && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                ✓ Or use transcribed text
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {recordings[currentQuestionIndex] 
              ? 'Review and edit your transcribed answer, or type a new one' 
              : 'Your answer will be analyzed by AI to generate an automatic score'}
          </p>
          <textarea
            value={answers[currentQuestionIndex] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none resize-none"
            placeholder="Type your answer here..."
            required
          />
          <p className="text-xs text-gray-500 mt-2">
            Minimum 50 characters recommended for better analysis
          </p>
        </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="sticky bottom-0 z-20 mt-3 border-t border-gray-200 bg-white/95 px-3 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <div className="mx-auto flex max-w-6xl justify-between gap-3 sm:max-w-none">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            {currentQuestionIndex === allQuestions.length - 1 ? 'Submit & View Results' : 'Next Question'}
          </button>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          Cancel Verification
        </button>
      </div>
    </div>
  );
};

export default MentorVerification;
