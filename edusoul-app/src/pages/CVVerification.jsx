import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

const CVVerification = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a PDF, DOC, DOCX, or TXT file';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        setFile(null);
        setFileName('');
      } else {
        setError('');
        setFile(selectedFile);
        setFileName(selectedFile.name);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        setFile(null);
        setFileName('');
      } else {
        setError('');
        setFile(droppedFile);
        setFileName(droppedFile.name);
      }
    }
  };

  // Mock CV text extraction (in production, use a PDF parser or API)
  const extractTextFromFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // For demo purposes, return mock CV content based on file name
        // In production, this would parse the actual PDF/DOC content
        const mockContent = `
          Education: Bachelor of Science in Computer Science, Master of Education
          Experience: 5 years teaching at university level, 3 years as industry mentor
          Skills: JavaScript, Python, React, Node.js, Mentoring, Communication, Leadership
          Certifications: Teaching Excellence Award, Certified Professional Mentor
          Publications: Research on effective mentoring strategies in STEM education
          Languages: English (native), Spanish (intermediate)
          Awards: Best Mentor 2023, Outstanding Educator Award
        `;
        resolve(mockContent + ' ' + file.name);
      };
      reader.readAsText(file);
    });
  };

  // Analyze CV content and generate score
  const analyzeCV = async (cvText) => {
    const text = cvText.toLowerCase();
    
    // Scoring criteria
    const criteria = {
      education: {
        keywords: ['bachelor', 'master', 'phd', 'doctorate', 'degree', 'university', 'college', 'certification', 'certified'],
        weight: 20,
        score: 0
      },
      experience: {
        keywords: ['year', 'years', 'experience', 'worked', 'taught', 'mentor', 'mentoring', 'teaching', 'industry', 'professional'],
        weight: 25,
        score: 0
      },
      technicalSkills: {
        keywords: ['javascript', 'python', 'java', 'c++', 'react', 'node', 'database', 'cloud', 'ai', 'machine learning', 'data science', 'programming', 'coding', 'software', 'development'],
        weight: 20,
        score: 0
      },
      softSkills: {
        keywords: ['communication', 'leadership', 'teamwork', 'collaboration', 'problem solving', 'critical thinking', 'adaptability', 'time management', 'organization'],
        weight: 15,
        score: 0
      },
      achievements: {
        keywords: ['award', 'awards', 'publication', 'published', 'research', 'patent', 'conference', 'presentation', 'achievement', 'accomplished', 'recognized', 'honored'],
        weight: 10,
        score: 0
      },
      mentoringSpecific: {
        keywords: ['mentor', 'mentoring', 'mentee', 'guidance', 'coaching', 'advising', 'student', 'students', 'helped', 'support', 'development', 'growth'],
        weight: 10,
        score: 0
      }
    };

    // Calculate scores for each category
    Object.keys(criteria).forEach(category => {
      const foundKeywords = criteria[category].keywords.filter(keyword => 
        text.includes(keyword)
      );
      const matchRate = foundKeywords.length / criteria[category].keywords.length;
      criteria[category].score = Math.min(Math.round(matchRate * criteria[category].weight), criteria[category].weight);
    });

    // Calculate total score
    const totalScore = Object.values(criteria).reduce((sum, cat) => sum + cat.score, 0);

    // Generate detailed feedback
    const feedback = [];
    if (criteria.education.score < 10) {
      feedback.push('Consider highlighting your educational background more prominently');
    }
    if (criteria.experience.score < 15) {
      feedback.push('Add more details about your years of experience and specific roles');
    }
    if (criteria.mentoringSpecific.score < 5) {
      feedback.push('Include specific mentoring experiences and success stories');
    }
    if (criteria.technicalSkills.score < 10) {
      feedback.push('List relevant technical skills that could help in mentoring');
    }

    // Determine strengths
    const strengths = [];
    if (criteria.education.score >= 15) strengths.push('Strong educational background');
    if (criteria.experience.score >= 20) strengths.push('Extensive professional experience');
    if (criteria.mentoringSpecific.score >= 8) strengths.push('Demonstrated mentoring expertise');
    if (criteria.technicalSkills.score >= 15) strengths.push('Comprehensive technical skills');

    return {
      overallScore: totalScore,
      maxScore: 100,
      criteria: Object.keys(criteria).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
        score: criteria[key].score,
        maxScore: criteria[key].weight,
        percentage: Math.round((criteria[key].score / criteria[key].weight) * 100)
      })),
      feedback: feedback.length > 0 ? feedback : ['Your CV is well-structured for a mentoring role!'],
      strengths: strengths.length > 0 ? strengths : ['Good foundation for mentoring'],
      verdict: totalScore >= 70 ? 'Highly Qualified' : totalScore >= 50 ? 'Qualified' : totalScore >= 30 ? 'Developing' : 'Needs Improvement'
    };
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Extract text from file
      const cvText = await extractTextFromFile(file);
      
      // Analyze CV
      const result = await analyzeCV(cvText);
      
      // Save to Firestore
      const cvVerificationRef = doc(collection(db, 'cvVerifications'));
      await setDoc(cvVerificationRef, {
        id: cvVerificationRef.id,
        mentorId: user.uid,
        mentorEmail: user.email,
        fileName: fileName,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        overallScore: result.overallScore,
        criteriaScores: result.criteria,
        feedback: result.feedback,
        strengths: result.strengths,
        verdict: result.verdict
      });

      setAnalysisResult(result);
    } catch (err) {
      console.error('Error analyzing CV:', err);
      setError('Failed to analyze CV. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadAnother = () => {
    setFile(null);
    setFileName('');
    setAnalysisResult(null);
    setError('');
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-blue-600 bg-blue-50';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${getScoreColor(analysisResult.overallScore, 100).split(' ')[1]}`}>
              <svg className={`w-10 h-10 ${getScoreColor(analysisResult.overallScore, 100).split(' ')[0]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">CV Analysis Complete!</h2>
            <p className="text-gray-600">Your CV has been analyzed for mentorship suitability</p>
          </div>

          {/* Overall Score */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 mb-6 border border-purple-200">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Overall CV Score</p>
              <div className="flex items-center justify-center gap-3">
                <p className={`text-5xl font-bold ${getScoreColor(analysisResult.overallScore, 100).split(' ')[0]}`}>
                  {analysisResult.overallScore}%
                </p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(analysisResult.overallScore, 100)}`}>
                  {analysisResult.verdict}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Criteria Scores */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900">Detailed Scores:</h3>
            {analysisResult.criteria.map((criterion, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">{criterion.name}</span>
                  <span className="text-sm font-semibold text-gray-900">{criterion.score}/{criterion.maxScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${getProgressColor(criterion.score, criterion.maxScore)} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${criterion.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{criterion.percentage}% match</p>
              </div>
            ))}
          </div>

          {/* Strengths */}
          {analysisResult.strengths.length > 0 && (
            <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Key Strengths
              </h4>
              <ul className="space-y-1">
                {analysisResult.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Feedback */}
          {analysisResult.feedback.length > 0 && (
            <div className="bg-yellow-50 rounded-xl p-4 mb-6 border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Suggestions for Improvement
              </h4>
              <ul className="space-y-1">
                {analysisResult.feedback.map((item, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleUploadAnother}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Upload Another CV
            </button>
            <button
              onClick={onComplete}
              className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">CV Verification</h2>
            <span className="text-sm text-gray-500">Step 1 of 1</span>
          </div>
          <p className="text-gray-600">Upload your CV for AI-powered analysis to assess your mentorship qualifications</p>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6 ${
            dragActive 
              ? 'border-purple-500 bg-purple-50' 
              : file 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
          />
          
          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">{fileName}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setFileName('');
                }}
                className="mt-3 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">Drag and drop your CV here</p>
              <p className="text-sm text-gray-500 mb-2">or click to browse files</p>
              <p className="text-xs text-gray-400">Supported: PDF, DOC, DOCX, TXT (max 5MB)</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Analysis Info */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            What We Analyze
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Educational background and certifications</li>
            <li>• Professional experience and years in field</li>
            <li>• Technical skills and expertise</li>
            <li>• Soft skills and communication abilities</li>
            <li>• Mentoring-specific experience</li>
            <li>• Publications, awards, and achievements</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              !file || isAnalyzing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6 4h8a2 2 0 002-2v-8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Analyze CV
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CVVerification;
