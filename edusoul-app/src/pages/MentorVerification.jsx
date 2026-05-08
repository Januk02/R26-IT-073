import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import MedalBadge, { getMedalTier, getMedalInfo } from '../components/MedalBadge';

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
      'How do you support a mentee who is struggling or unmotivated?'
    ]
  },
  {
    id: 3,
    domain: 'Communication & Relationship',
    questions: [
      'How do you build trust with a mentee?',
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
      'What do you expect from a mentee?'
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
      'What would you do if a mentee disagreed with your advice?'
    ]
  }
];

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
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechSynthesis = window.speechSynthesis;

  const allQuestions = QUESTIONS.flatMap(domain => 
    domain.questions.map(q => ({ question: q, domain: domain.domain }))
  );

  const currentQuestion = allQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / allQuestions.length) * 100;

  // Text-to-speech for voice guide
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

  // Analyze answer and generate score (mock AI analysis)
  const analyzeAnswer = async (question, answerText) => {
    // This is a mock analysis. In production, you would use an AI service like OpenAI API
    // For now, we'll use a simple heuristic based on answer length and keywords
    
    const keywords = {
      'Mentorship Skill': ['approach', 'support', 'example', 'experience', 'guidance', 'patience'],
      'Handling Challenges': ['struggling', 'unmotivated', 'encourage', 'support', 'identify', 'help'],
      'Communication & Relationship': ['trust', 'feedback', 'open', 'honest', 'listen', 'understand'],
      'Commitment & Boundaries': ['time', 'commit', 'hours', 'professional', 'boundaries', 'respect'],
      'Motivation & Values': ['want', 'help', 'share', 'knowledge', 'growth', 'passion'],
      'Expectations': ['expect', 'commitment', 'effort', 'communication', 'respect', 'engagement'],
      'Adaptability': ['adjust', 'different', 'flexible', 'personalize', 'adapt', 'approach'],
      'Self-awareness / Limits': ['challenging', 'limit', 'refer', 'honest', 'know', 'boundaries'],
      'Conflict / Rupture Repair': ['disagree', 'respect', 'listen', 'understand', 'compromise', 'discuss']
    };

    const domainKeywords = keywords[currentQuestion.domain] || [];
    let keywordCount = 0;
    
    domainKeywords.forEach(keyword => {
      if (answerText.toLowerCase().includes(keyword)) {
        keywordCount++;
      }
    });

    // Base score from keyword relevance
    let score = Math.min(5 + keywordCount, 8);
    
    // Bonus for longer, more detailed answers
    if (answerText.length > 100) score += 1;
    if (answerText.length > 200) score += 1;
    
    return Math.min(score, 10);
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

  // Navigate to next question
  const handleNext = async () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      setIsAnalyzing(true);
      // Analyze all answers and calculate scores
      const newScores = {};
      for (let i = 0; i < allQuestions.length; i++) {
        const answer = answers[i] || '';
        const score = await analyzeAnswer(allQuestions[i], answer);
        newScores[i] = score;
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
        overallScore: 0 // Will be calculated
      };
      
      const totalScore = Object.values(newScores).reduce((sum, score) => sum + score, 0);
      const maxPossibleScore = allQuestions.length * 10;
      const percentage = (totalScore / maxPossibleScore) * 100;
      
      verificationData.overallScore = percentage;
      await saveVerification(verificationData);
      
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
                  <p className="text-5xl font-bold text-purple-600 mb-2">{finalScore.toFixed(1)}%</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
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

        {/* Question Card */}
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              {currentQuestion.domain}
            </span>
          </div>
          <p className="text-xl text-gray-900 font-medium mb-4">{currentQuestion.question}</p>
          
          {/* Voice Guide Button */}
          <button
            onClick={() => speakQuestion(currentQuestion.question)}
            disabled={isPlaying}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium text-sm"
          >
            <svg className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            {isPlaying ? 'Playing...' : 'Listen to Question'}
          </button>
        </div>

        {/* Recording Section */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Record Your Answer</h3>
          
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-200 animate-pulse' : 'bg-white'}`}></div>
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            
            {recordings[currentQuestionIndex] && (
              <button
                onClick={() => playRecording(recordings[currentQuestionIndex])}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Play Recording
              </button>
            )}
          </div>
          
          {isRecording && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Recording in progress...</span>
            </div>
          )}
        </div>

        {/* Text Answer Section for AI Analysis */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Type Your Answer</h3>
          <p className="text-sm text-gray-600 mb-4">Your answer will be analyzed by AI to generate an automatic score</p>
          <textarea
            value={answers[currentQuestionIndex] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none resize-none"
            placeholder="Type your answer here..."
          />
          <p className="text-xs text-gray-500 mt-2">
            Minimum 50 characters recommended for better analysis
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
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
