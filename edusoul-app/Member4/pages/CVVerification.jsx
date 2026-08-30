import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { doc, setDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../src/firebase';
import MedalBadge, { getMedalTier, getMedalInfo } from '../components/MedalBadge';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

const CVVerification = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [existingCV, setExistingCV] = useState(null);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const replaceLatestCVVerification = async (verificationData) => {
    const existingSnapshot = await getDocs(query(
      collection(db, 'cvVerifications'),
      where('mentorId', '==', verificationData.mentorId)
    ));
    const batch = writeBatch(db);
    const verificationRef = doc(db, 'cvVerifications', verificationData.id);

    batch.set(verificationRef, verificationData);
    existingSnapshot.docs
      .filter(existingDoc => existingDoc.id !== verificationData.id)
      .forEach(existingDoc => batch.delete(existingDoc.ref));

    await batch.commit();
  };

  const updateMentorVerificationStatus = async (cvScore) => {
    const interviewSnapshot = await getDocs(query(
      collection(db, 'verifications'),
      where('mentorId', '==', user.uid)
    ));
    const latestInterview = interviewSnapshot.docs
      .map(interviewDoc => interviewDoc.data())
      .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))[0];
    const status = cvScore >= 50 && latestInterview?.overallScore >= 50
      ? 'verified'
      : cvScore < 50 || latestInterview?.overallScore < 50
        ? 'needs-retry'
        : 'pending-interview';
    const statusLabels = {
      verified: 'Verified Mentor',
      'needs-retry': 'Needs Re-attempt',
      'pending-interview': 'Interview Verification Required'
    };

    await setDoc(doc(db, 'users', user.uid), {
      mentorVerificationStatus: status,
      mentorVerificationStatusLabel: statusLabels[status],
      isMentorVerified: status === 'verified',
      mentorVerificationStatusUpdatedAt: new Date().toISOString()
    }, { merge: true });
  };

  useEffect(() => {
    if (!user) return;

    getDocs(query(
      collection(db, 'cvVerifications'),
      where('mentorId', '==', user.uid)
    )).then((snapshot) => {
      const latestCV = snapshot.docs
        .map(existingDoc => ({ id: existingDoc.id, ...existingDoc.data() }))
        .sort((first, second) => new Date(second.uploadedAt) - new Date(first.uploadedAt))[0];
      setExistingCV(latestCV || null);
    }).catch((error) => console.error('Error checking existing CV:', error));

    const pendingKey = `pendingCvVerification:${user.uid}`;
    const pendingWrite = localStorage.getItem(pendingKey);
    if (!pendingWrite) return;

    try {
      const pendingVerifications = JSON.parse(pendingWrite);
      const records = Array.isArray(pendingVerifications)
        ? pendingVerifications
        : [pendingVerifications];
      const latestPendingVerification = records[records.length - 1];
      replaceLatestCVVerification(latestPendingVerification)
        .then(() => localStorage.removeItem(pendingKey))
        .catch((error) => console.error('Error retrying CV verification save:', error));
    } catch (error) {
      console.error('Invalid pending CV verification:', error);
      localStorage.removeItem(pendingKey);
    }
  }, [user]);

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

  const handleResubmit = () => {
    setIsResubmitting(true);
    setExistingCV(null);
    setError('');
    fileInputRef.current?.click();
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

  // Real CV text extraction using PDF.js
  const extractTextFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;

          // Check file type and extract text accordingly
          if (file.type === 'application/pdf') {
            // For PDF files, use PDF.js to extract text
            const pdfText = await extractTextFromPDF(arrayBuffer);
            resolve(pdfText);
          } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.type === 'application/msword') {
            // For Word documents, extract text as plain text
            const docText = await extractTextFromWord(arrayBuffer);
            resolve(docText);
          } else {
            // For text files, read directly
            const text = new TextDecoder().decode(arrayBuffer);
            resolve(text);
          }
        } catch (error) {
          console.error('Error extracting text:', error);
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Helper function to extract text from PDF using PDF.js
  const extractTextFromPDF = async (arrayBuffer) => {
    try {
      console.log('Starting PDF extraction...');
      console.log('ArrayBuffer size:', arrayBuffer.byteLength);

      // Dynamically import PDF.js
      const pdfjsLib = await import('pdfjs-dist');
      console.log('PDF.js loaded successfully');

      // Set worker source using local bundled worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded successfully with ${pdf.numPages} pages`);

      let fullText = '';

      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          // Extract text items properly
          const pageText = textContent.items
            .map(item => {
              if (item.str) {
                return item.str;
              }
              return '';
            })
            .join(' ');

          fullText += pageText + '\n';
        } catch (pageError) {
          console.error(`Error extracting text from page ${i}:`, pageError);
          // Continue with other pages if one fails
        }
      }

      console.log(`PDF extraction complete. Extracted ${fullText.length} characters`);

      // Validate extracted text
      if (fullText.length < 100) {
        console.warn('Extracted text is too short, PDF might be image-based');
        throw new Error('Extracted text is too short - PDF might be image-based');
      }

      return fullText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      console.error('Error details:', error.message);

      // Try alternative extraction method
      try {
        console.log('Attempting alternative PDF extraction...');
        const text = new TextDecoder().decode(arrayBuffer);

        // Check if the decoded text looks like actual content
        const hasReadableText = text.length > 100 && /[a-zA-Z]{3,}/.test(text);

        if (hasReadableText) {
          console.log(`Alternative extraction successful: ${text.length} characters`);
          return text;
        } else {
          throw new Error('PDF appears to be image-based or encrypted');
        }
      } catch (fallbackError) {
        console.error('Alternative extraction also failed:', fallbackError);
        throw new Error('Unable to extract text from PDF. The PDF might be image-based, scanned, or password-protected.');
      }
    }
  };

  // Helper function to extract text from Word documents
  const extractTextFromWord = async (arrayBuffer) => {
    try {
      // For Word documents, we'll need a library like mammoth.js
      // For now, return the raw text as a fallback
      // In production, implement mammoth.js for proper Word extraction
      const text = new TextDecoder().decode(arrayBuffer);
      console.log(`Word extraction: ${text.length} characters`);
      return text;
    } catch (error) {
      console.error('Word extraction error:', error);
      return new TextDecoder().decode(arrayBuffer);
    }
  };

  // Generate content fingerprint for unique analysis
  const generateContentFingerprint = (text) => {
    // Create a hash of key content elements
    const keyElements = text.match(/\b\w{4,}\b/g) || [];
    const uniqueWords = [...new Set(keyElements)].slice(0, 20);
    const fingerprint = uniqueWords.join('').substring(0, 32);
    return fingerprint;
  };

  const extractCVProfile = (cvText, analysis) => {
    const normalizedText = cvText.toLowerCase();
    const fieldKeywords = {
      'Software Development': ['software', 'developer', 'programming', 'full-stack', 'backend', 'frontend'],
      'Web Development': ['web development', 'react', 'angular', 'vue', 'javascript', 'html', 'css'],
      'Data & AI': ['data science', 'data analytics', 'machine learning', 'artificial intelligence', 'analytics'],
      'Cloud & DevOps': ['aws', 'azure', 'gcp', 'cloud', 'devops', 'kubernetes', 'docker'],
      'Quality Assurance': ['quality assurance', 'qa', 'testing', 'test automation', 'selenium', 'bug tracking'],
      'Teaching & Mentoring': ['mentor', 'mentoring', 'mentee', 'teaching', 'training', 'coaching', 'guidance'],
      'Research': ['research', 'publication', 'published', 'journal', 'conference']
    };
    const skillKeywords = [
      'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'rust',
      'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring', 'html', 'css',
      'machine learning', 'data science', 'sql', 'mongodb', 'postgresql', 'mysql',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'selenium', 'flutter', 'swift', 'kotlin'
    ];
    const qualificationKeywords = [
      'phd', 'doctorate', 'doctoral', 'master of', 'master\'s', 'masters', 'mba',
      'bachelor of', 'bachelor\'s', 'bachelors', 'b.sc', 'b.eng', 'm.sc', 'm.eng',
      'certified', 'certification', 'professional certificate', 'diploma'
    ];
    const fields = Object.entries(fieldKeywords)
      .filter(([, keywords]) => keywords.some(keyword => normalizedText.includes(keyword)))
      .map(([field]) => field);
    const skills = skillKeywords.filter(skill => normalizedText.includes(skill));
    const qualifications = cvText
      .split(/\r?\n|(?<=\.)\s+/)
      .map(line => line.trim().replace(/^[•*-]\s*/, ''))
      .filter(line => line.length >= 3 && qualificationKeywords.some(keyword => line.toLowerCase().includes(keyword)))
      .slice(0, 10);
    const experienceMatches = normalizedText.match(/\b(\d+)\+?\s*(years?|yrs?)\b/g) || [];
    const experienceYears = experienceMatches.reduce((highest, match) => Math.max(highest, Number(match.match(/\d+/)[0])), 0);
    const profileFields = fields.length > 0 ? fields : ['General Professional Profile'];
    const qualificationSummary = qualifications.length > 0
      ? qualifications.slice(0, 3).join('; ')
      : 'Qualifications identified in the CV analysis results';

    return {
      fields: profileFields,
      skills,
      qualifications,
      experienceYears,
      cvType: analysis.cvType,
      cvBio: `Professional ${analysis.cvType} profile with experience in ${profileFields.slice(0, 3).join(', ')}. ${experienceYears > 0 ? `${experienceYears}+ years of experience. ` : ''}Qualifications: ${qualificationSummary}.`,
      analyzedAt: new Date().toISOString()
    };
  };

  // Enhanced Professional CV Analysis System
  const analyzeCV = async (cvText) => {
    const text = cvText.toLowerCase();

    // Generate content fingerprint for uniqueness
    const contentFingerprint = generateContentFingerprint(text);

    // Log content fingerprint for debugging
    console.log('Content Fingerprint:', contentFingerprint);
    console.log('Text Length:', text.length);
    console.log('Unique Words:', [...new Set(text.match(/\b\w{4,}\b/g) || [])].length);

    // Enhanced scoring criteria with mentor-specific focus
    const criteria = {
      // Education (15%) - Balanced degree detection
      education: {
        advanced: ['phd', 'doctorate', 'doctoral', 'postgraduate', 'post-doctoral'],
        standard: ['master', 'masters', 'mba', 'm.sc', 'm.s', 'm.eng', 'graduate'],
        basic: ['bachelor', 'bachelors', 'b.sc', 'b.s', 'b.eng', 'undergraduate'],
        certifications: ['certified', 'certification', 'professional certificate', 'diploma'],
        institutions: ['university', 'college', 'institute', 'academy'],
        weight: 15,
        score: 0,
        details: []
      },

      // Professional Experience (25%) - Career progression with mentoring focus
      experience: {
        seniority: ['senior', 'lead', 'principal', 'chief', 'head', 'director', 'manager', 'supervisor', 'team lead'],
        years: /\b(\d+)\+?\s*(years?|yrs?)\b/g,
        duration: ['decade', 'decades', '10+', '15+', '20+'],
        mentoring: ['mentor', 'mentoring', 'mentee', 'guidance', 'coaching', 'advising', 'supervising'],
        leadership: ['leadership', 'led', 'managed', 'team', 'department', 'division'],
        weight: 25,
        score: 0,
        details: []
      },

      // Technical Expertise (20%) - Comprehensive technology detection
      technicalSkills: {
        programming: ['python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'go', 'rust', 'scala', 'typescript'],
        web: ['react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'html', 'css'],
        data: ['machine learning', 'data science', 'analytics', 'big data', 'ai', 'artificial intelligence'],
        cloud: ['aws', 'azure', 'gcp', 'cloud', 'devops', 'kubernetes', 'docker'],
        database: ['sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'oracle'],
        mobile: ['android', 'ios', 'react native', 'flutter', 'swift', 'kotlin'],
        weight: 20,
        score: 0,
        details: []
      },

      // Mentoring & Teaching (25%) - Enhanced mentorship indicators
      mentoringSpecific: {
        direct: ['mentor', 'mentoring', 'mentee', 'guided', 'coached', 'advised', 'supervised'],
        teaching: ['taught', 'teaching', 'instructor', 'professor', 'lecturer', 'faculty'],
        training: ['trained', 'training', 'workshop', 'seminar', 'onboarding', 'development'],
        outcomes: ['improved', 'helped', 'supported', 'developed', 'grew', 'achieved', 'succeeded'],
        approach: ['approach', 'methodology', 'style', 'technique', 'strategy'],
        availability: ['available', 'commit', 'hours', 'time', 'dedicated'],
        weight: 25,
        score: 0,
        details: []
      },

      // Achievements & Recognition (10%) - Professional accomplishments
      achievements: {
        awards: ['award', 'awarded', 'recognition', 'honored', 'excellence', 'outstanding'],
        publications: ['published', 'publication', 'paper', 'journal', 'research', 'conference'],
        patents: ['patent', 'invention', 'innovation', 'intellectual property'],
        speaking: ['speaker', 'presented', 'keynote', 'panel', 'talk', 'workshop'],
        projects: ['project', 'developed', 'built', 'created', 'designed', 'implemented'],
        weight: 10,
        score: 0,
        details: []
      },

      // Professional Indicators (5%) - Career maturity signals
      professionalIndicators: {
        networking: ['conference', 'committee', 'board', 'association', 'society', 'community'],
        continuous: ['learning', 'development', 'certification', 'training', 'courses'],
        industry: ['industry', 'professional', 'expert', 'specialist', 'consultant'],
        softSkills: ['communication', 'leadership', 'collaboration', 'problem solving', 'teamwork'],
        weight: 5,
        score: 0,
        details: []
      }
    };

    // Advanced scoring algorithm
    let totalScore = 0;

    // Education scoring
    const eduScore = calculateEducationScore(text, criteria.education);
    criteria.education.score = eduScore.score;
    criteria.education.details = eduScore.details;

    // Experience scoring
    const expScore = calculateExperienceScore(text, criteria.experience);
    criteria.experience.score = expScore.score;
    criteria.experience.details = expScore.details;

    // Technical skills scoring
    const techScore = calculateTechnicalScore(text, criteria.technicalSkills);
    criteria.technicalSkills.score = techScore.score;
    criteria.technicalSkills.details = techScore.details;

    // Mentoring specific scoring
    const mentorScore = calculateMentoringScore(text, criteria.mentoringSpecific);
    criteria.mentoringSpecific.score = mentorScore.score;
    criteria.mentoringSpecific.details = mentorScore.details;

    // Achievements scoring
    const achieveScore = calculateAchievementScore(text, criteria.achievements);
    criteria.achievements.score = achieveScore.score;
    criteria.achievements.details = achieveScore.details;

    // Professional indicators scoring
    const profScore = calculateProfessionalScore(text, criteria.professionalIndicators);
    criteria.professionalIndicators.score = profScore.score;
    criteria.professionalIndicators.details = profScore.details;

    // Calculate total score
    totalScore = Object.values(criteria).reduce((sum, cat) => sum + cat.score, 0);

    // Apply quality bonuses
    const qualityBonus = calculateQualityBonus(text, criteria);
    totalScore = Math.min(100, totalScore + qualityBonus);

    // Apply CV-type specific adjustments
    const cvType = detectCVType(text);
    const typeAdjustment = applyCVTypeAdjustment(text, cvType);
    totalScore = Math.max(0, Math.min(100, totalScore + typeAdjustment));

    // A high score requires evidence of real mentoring impact, not keyword density alone.
    const evidenceGate = calculateEvidenceGate(text, criteria, totalScore, cvType);
    totalScore = evidenceGate.score;

    // Generate professional feedback
    const { feedback, strengths, recommendations } = generateProfessionalFeedback(criteria, totalScore, cvType);

    return {
      overallScore: Math.round(totalScore),
      maxScore: 100,
      contentFingerprint: contentFingerprint,
      textLength: text.length,
      uniqueWordCount: [...new Set(text.match(/\b\w{4,}\b/g) || [])].length,
      criteria: Object.keys(criteria).map(key => ({
        name: formatCategoryName(key),
        score: criteria[key].score,
        maxScore: criteria[key].weight,
        percentage: Math.round((criteria[key].score / criteria[key].weight) * 100),
        details: criteria[key].details
      })),
      feedback: feedback,
      strengths: strengths,
      recommendations: recommendations,
      verdict: determineVerdict(totalScore),
      qualityBonus: qualityBonus,
      typeAdjustment: typeAdjustment,
      evidenceAdjustment: evidenceGate.adjustment,
      cvType: cvType
    };
  };

  // Helper function for education scoring
  const calculateEducationScore = (text, criteria) => {
    let score = 0;
    const details = [];

    // Advanced degrees (highest weight)
    const advancedFound = criteria.advanced.filter(keyword => text.includes(keyword)).length;
    if (advancedFound > 0) {
      score += Math.min(12, advancedFound * 6);
      details.push(`${advancedFound} advanced degree(s) detected`);
    }

    // Standard graduate degrees
    const standardFound = criteria.standard.filter(keyword => text.includes(keyword)).length;
    if (standardFound > 0) {
      score += Math.min(8, standardFound * 4);
      details.push(`${standardFound} graduate degree(s) detected`);
    }

    // Basic degrees - increased scoring for undergraduate mentors
    const basicFound = criteria.basic.filter(keyword => text.includes(keyword)).length;
    if (basicFound > 0) {
      score += Math.min(10, basicFound * 5); // Increased from 4 to 10
      details.push(`${basicFound} undergraduate degree(s) detected`);
    }

    // Professional certifications
    const certFound = criteria.certifications.filter(keyword => text.includes(keyword)).length;
    if (certFound > 0) {
      score += Math.min(5, certFound * 2.5); // Increased from 3 to 5
      details.push(`${certFound} certification(s) detected`);
    }

    // Institution detection - bonus points
    const institutionsFound = criteria.institutions.filter(keyword => text.includes(keyword)).length;
    if (institutionsFound > 0) {
      score += Math.min(5, institutionsFound * 2.5);
      details.push(`${institutionsFound} recognized institution(s) detected`);
    }

    return { score: Math.min(criteria.weight, score), details };
  };

  // Helper function for experience scoring
  const calculateExperienceScore = (text, criteria) => {
    let score = 0;
    const details = [];

    // Seniority indicators
    const seniorityFound = criteria.seniority.filter(keyword => text.includes(keyword)).length;
    if (seniorityFound > 0) {
      score += Math.min(10, seniorityFound * 3);
      details.push(`${seniorityFound} seniority indicators found`);
    }

    // Leadership indicators - increased weight
    const leadershipFound = criteria.leadership.filter(keyword => text.includes(keyword)).length;
    if (leadershipFound > 0) {
      score += Math.min(8, leadershipFound * 3);
      details.push(`${leadershipFound} leadership indicators found`);
    }

    // Years of experience extraction
    const yearMatches = text.match(criteria.years);
    if (yearMatches) {
      const totalYears = yearMatches.reduce((sum, match) => {
        const years = parseInt(match.match(/\d+/)[0]);
        return sum + years;
      }, 0);

      if (totalYears >= 10) {
        score += 12;
        details.push(`10+ years of experience detected`);
      } else if (totalYears >= 5) {
        score += 8;
        details.push(`${totalYears} years of experience detected`);
      } else if (totalYears >= 2) {
        score += 5;
        details.push(`${totalYears} years of experience detected`);
      }
    }

    // Mentoring experience - significantly increased weight
    const mentoringFound = criteria.mentoring.filter(keyword => text.includes(keyword)).length;
    if (mentoringFound > 0) {
      score += Math.min(12, mentoringFound * 3); // Increased from 8 to 12
      details.push(`${mentoringFound} mentoring-related terms found`);
    }

    // Specific time commitment for mentoring
    if (text.includes('10–15 hours') || text.includes('10-15 hours') || text.includes('10 to 15 hours')) {
      score += 5;
      details.push('Specific mentoring time commitment found');
    }

    // Project experience
    if (text.includes('projects') || text.includes('project')) {
      score += 3;
      details.push('Project experience detected');
    }

    return { score: Math.min(criteria.weight, score), details };
  };

  // Helper function for technical skills scoring
  const calculateTechnicalScore = (text, criteria) => {
    let score = 0;
    const details = [];

    // Enhanced technical keywords for modern development
    const enhancedKeywords = {
      programming: ['python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'go', 'rust', 'scala', 'typescript'],
      web: ['react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'html', 'css'],
      data: ['machine learning', 'data science', 'analytics', 'big data', 'ai', 'artificial intelligence'],
      cloud: ['aws', 'azure', 'gcp', 'cloud', 'devops', 'kubernetes', 'docker'],
      database: ['sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'oracle'],
      mobile: ['android', 'ios', 'react native', 'flutter', 'swift', 'kotlin']
    };

    Object.keys(enhancedKeywords).forEach(category => {
      const keywords = enhancedKeywords[category];
      if (Array.isArray(keywords)) {
        const found = keywords.filter(keyword => text.includes(keyword)).length;
        if (found > 0) {
          const categoryScore = Math.min(4, found * 1.5);
          score += categoryScore;
          details.push(`${found} ${category} technologies found`);
        }
      }
    });

    // Bonus for specific skill mentions
    if (text.includes('react development') || text.includes('react')) {
      score += 2;
      details.push('React development expertise detected');
    }

    if (text.includes('web & mobile application development')) {
      score += 3;
      details.push('Full-stack development skills detected');
    }

    return { score: Math.min(criteria.weight, score), details };
  };

  // Helper function for mentoring score
  const calculateMentoringScore = (text, criteria) => {
    let score = 0;
    const details = [];

    Object.keys(criteria).forEach(category => {
      const keywords = criteria[category];
      if (Array.isArray(keywords)) {
        const found = keywords.filter(keyword => text.includes(keyword)).length;
        if (found > 0) {
          const categoryScore = Math.min(5, found * 1.5);
          score += categoryScore;
          details.push(`${found} ${category} indicators found`);
        }
      }
    });

    // Enhanced mentoring-specific bonuses
    if (text.includes('mentoring experience') || text.includes('mentoring approach')) {
      score += 3;
      details.push('Dedicated mentoring sections detected');
    }

    if (text.includes('constructive feedback') || text.includes('guidance')) {
      score += 2;
      details.push('Professional mentoring techniques detected');
    }

    if (text.includes('helped junior students') || text.includes('junior students')) {
      score += 2;
      details.push('Junior student mentoring experience detected');
    }

    if (text.includes('code review') || text.includes('reviewed code')) {
      score += 2;
      details.push('Technical mentoring through code review detected');
    }

    if (text.includes('availability') || text.includes('commit')) {
      score += 1.5;
      details.push('Mentoring availability specified');
    }

    return { score: Math.min(criteria.weight, score), details };
  };

  // Helper function for achievement score
  const calculateAchievementScore = (text, criteria) => {
    let score = 0;
    const details = [];

    Object.keys(criteria).forEach(category => {
      const keywords = criteria[category];
      if (Array.isArray(keywords)) {
        const found = keywords.filter(keyword => text.includes(keyword)).length;
        if (found > 0) {
          score += Math.min(3, found * 1.2);
          details.push(`${found} ${category} items found`);
        }
      }
    });

    return { score: Math.min(criteria.weight, score), details };
  };

  // Helper function for professional indicators score
  const calculateProfessionalScore = (text, criteria) => {
    let score = 0;
    const details = [];

    Object.keys(criteria).forEach(category => {
      const keywords = criteria[category];
      if (Array.isArray(keywords)) {
        const found = keywords.filter(keyword => text.includes(keyword)).length;
        if (found > 0) {
          score += Math.min(2, found * 0.8);
          details.push(`${found} ${category} indicators found`);
        }
      }
    });

    return { score: Math.min(criteria.weight, score), details };
  };

  // Quality bonus calculation
  const calculateQualityBonus = (text, criteria) => {
    let bonus = 0;

    // CV length indicator (comprehensive CV)
    if (text.length > 2000) bonus += 2;
    if (text.length > 3000) bonus += 3;

    // Professional structure indicators
    if (text.includes('summary') || text.includes('objective')) bonus += 1;
    if (text.includes('skills') || text.includes('competencies')) bonus += 1;
    if (text.includes('experience') || text.includes('employment')) bonus += 1;

    // Category-specific bonuses
    if (criteria.mentoringSpecific.score >= 15) bonus += 3;
    if (criteria.experience.score >= 12) bonus += 2;
    if (criteria.technicalSkills.score >= 12) bonus += 2;

    return Math.min(10, bonus);
  };

  // CV Type Detection
  const detectCVType = (text) => {
    const mentorIndicators = ['mentoring experience', 'mentoring approach', 'mentor', 'mentoring', 'guidance', 'coaching', 'mentee'];
    const qaIndicators = ['qa', 'quality assurance', 'testing', 'test automation', 'selenium', 'manual testing', 'bug tracking'];
    const devIndicators = ['developer', 'software engineer', 'full-stack', 'backend', 'frontend'];

    const mentorCount = mentorIndicators.filter(indicator => text.includes(indicator)).length;
    const qaCount = qaIndicators.filter(indicator => text.includes(indicator)).length;
    const devCount = devIndicators.filter(indicator => text.includes(indicator)).length;

    if (mentorCount >= 3) return 'mentor';
    if (qaCount >= 2) return 'qa';
    if (devCount >= 2) return 'developer';
    return 'general';
  };

  // CV Type Adjustment
  const applyCVTypeAdjustment = (text, cvType) => {
    if (cvType === 'mentor') {
      let adjustment = 0;
      if (text.includes('mentoring experience')) adjustment += 5;
      if (text.includes('mentoring approach')) adjustment += 3;
      if (text.includes('availability')) adjustment += 2;
      return adjustment;
    } else if (cvType === 'qa') {
      return -2; // Slight penalty for non-mentor focus
    } else if (cvType === 'developer') {
      return 0; // Neutral for general developers
    }
    return 0;
  };

  const calculateEvidenceGate = (text, criteria, score, cvType) => {
    if (score < 70 || cvType !== 'mentor') {
      return { score, adjustment: 0 };
    }

    const hasQuantifiedEvidence = /\b\d+\+?\s*(years?|mentees?|students?|participants?|engineers?|interns?|users?)\b/.test(text);
    const hasMentoringEvidence = criteria.mentoringSpecific.score >= 15;
    const hasProfessionalEvidence = criteria.experience.score >= 15;

    if (hasQuantifiedEvidence && hasMentoringEvidence && hasProfessionalEvidence) {
      return { score, adjustment: 0 };
    }

    const cappedScore = Math.min(score, 69);
    return { score: cappedScore, adjustment: cappedScore - score };
  };

  // Generate professional feedback
  const generateProfessionalFeedback = (criteria, totalScore) => {
    const feedback = [];
    const strengths = [];
    const recommendations = [];

    // Analyze each category
    if (criteria.education.score >= 15) {
      strengths.push('Exceptional educational qualifications');
    } else if (criteria.education.score < 8) {
      recommendations.push('Consider highlighting advanced degrees or certifications');
    }

    if (criteria.experience.score >= 20) {
      strengths.push('Extensive professional experience');
    } else if (criteria.experience.score < 10) {
      recommendations.push('Add more detail about years of experience and seniority level');
    }

    if (criteria.mentoringSpecific.score >= 10) {
      strengths.push('Strong mentoring and teaching background');
    } else if (criteria.mentoringSpecific.score < 5) {
      recommendations.push('Include specific mentoring experiences and outcomes');
    }

    if (criteria.technicalSkills.score >= 15) {
      strengths.push('Comprehensive technical expertise');
    } else if (criteria.technicalSkills.score < 8) {
      recommendations.push('List relevant technical skills and technologies');
    }

    if (criteria.achievements.score >= 6) {
      strengths.push('Notable professional achievements');
    }

    // Overall feedback based on score
    if (totalScore >= 85) {
      feedback.push('Exceptional candidate profile for mentorship position');
    } else if (totalScore >= 70) {
      feedback.push('Strong candidate with solid qualifications');
    } else if (totalScore >= 50) {
      feedback.push('Good foundation with room for enhancement');
    } else {
      feedback.push('Profile needs significant development for mentorship role');
    }

    return { feedback, strengths, recommendations };
  };

  // Helper functions
  const formatCategoryName = (key) => {
    const names = {
      education: 'Education & Qualifications',
      experience: 'Professional Experience',
      technicalSkills: 'Technical Expertise',
      mentoringSpecific: 'Mentoring & Teaching',
      achievements: 'Achievements & Recognition',
      professionalIndicators: 'Professional Development'
    };
    return names[key] || key;
  };

  const determineVerdict = (score) => {
    if (score >= 85) return 'Exceptional Candidate';
    if (score >= 75) return 'Highly Qualified';
    if (score >= 65) return 'Well Qualified';
    if (score >= 50) return 'Qualified';
    if (score >= 35) return 'Developing Profile';
    return 'Needs Enhancement';
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a PDF file');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      console.log('Extracting text from file:', file.name);
      const cvText = await extractTextFromFile(file);
      console.log('Extracted text length:', cvText.length);

      // Validate extracted text
      if (!cvText || cvText.length < 50) {
        setError('Could not extract sufficient text from the PDF file. Please ensure the PDF contains readable text.');
        setIsAnalyzing(false);
        return;
      }

      // Analyze CV
      const result = await analyzeCV(cvText);
      const cvProfile = extractCVProfile(cvText, result);

      // Show the completed analysis without waiting for Firestore acknowledgement.
      setAnalysisResult(result);

      // Save to Firestore
      const cvVerificationRef = doc(collection(db, 'cvVerifications'));
      const verificationData = {
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
        verdict: result.verdict,
        verificationStatus: result.overallScore >= 50 ? 'qualified' : 'needs-retry',
        verificationStatusLabel: result.overallScore >= 50 ? 'Qualified' : 'Needs Re-attempt',
        cvProfile
      };
      const pendingKey = `pendingCvVerification:${user.uid}`;
      localStorage.setItem(pendingKey, JSON.stringify([verificationData]));

      replaceLatestCVVerification(verificationData).then(() => {
        localStorage.removeItem(pendingKey);
        return updateMentorVerificationStatus(result.overallScore);
      }).catch((saveError) => {
        console.error('Error saving CV verification:', saveError);
        setError('Analysis completed, but the verification could not be saved. Please refresh and try again.');
      });

      // Keep the latest CV profile on the mentor document for matching and discovery.
      setDoc(doc(db, 'users', user.uid), {
        cvProfile,
        cvBio: cvProfile.cvBio,
        latestCVVerificationId: cvVerificationRef.id,
        latestCVAnalyzedAt: cvProfile.analyzedAt
      }, { merge: true }).catch((profileError) => {
        console.error('Error saving CV profile to mentor document:', profileError);
      });
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
            <div className="mx-auto w-32 h-32 mb-4">
              <MedalBadge
                tier={getMedalTier(analysisResult.overallScore)}
                size="lg"
                showLabel={false}
                animated={true}
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">CV Analysis Complete!</h2>
            <p className="text-gray-600">Your CV has been analyzed for mentorship suitability</p>
            <div className="mt-3">
              <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-semibold">
                🏆 {getMedalInfo(getMedalTier(analysisResult.overallScore)).name} Earned!
              </span>
            </div>
          </div>

          {/* Overall Score */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 mb-6 border border-purple-200">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Overall CV Score</p>
              <div className="flex items-center justify-center gap-3">
                <p className={`text-5xl font-bold ${getScoreColor(analysisResult.overallScore, 100).split(' ')[0]}`}>
                  {Math.round(analysisResult.overallScore)}%
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
                <p className="text-xs text-gray-500 mt-1">{Math.round(criterion.percentage)}% match</p>
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

        {existingCV && !isResubmitting && (
          <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-900">You already submitted a CV</p>
                <p className="mt-1 text-sm text-green-700">
                  {existingCV.fileName || 'Previous CV'}
                  {existingCV.uploadedAt && ` • ${new Date(existingCV.uploadedAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResubmit}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-800"
            >
              Resubmit CV
            </button>
          </div>
        )}

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => (!existingCV || isResubmitting) && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6 ${dragActive
              ? 'border-purple-500 bg-purple-50'
              : file
                ? 'border-green-500 bg-green-50'
                : existingCV && !isResubmitting
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-75'
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
          ) : existingCV && !isResubmitting ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-700 mb-1">Your CV is already on file</p>
              <p className="text-sm text-gray-500">Choose “Resubmit CV” above to replace it</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">Drag and drop your CV here</p>
              <p className="text-sm text-gray-500 mb-4">or click to browse</p>
              <p className="text-xs text-gray-400">PDF, DOC, DOCX, TXT (max 5MB)</p>
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
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${!file || isAnalyzing
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
