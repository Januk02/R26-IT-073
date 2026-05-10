import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import apiService from '@/services/apiService';

// Interfaces for data structures
interface StudentData {
  dreamJob: string;
  district: string;
  zScore: string;
  interests: string[];
  personalityTraits: {
    leadership: number;
    creativity: number;
    analyticalThinking: number;
    riskTaking: number;
    entrepreneurialMindset: number;
  };
  personalityDescription: string;
  locationPreference: string;
  travelTolerance: string;
  familyAttachment: number;
  workEnvironment: string;
  stressTolerance: number;
  socialInteraction: string;
}

const FutureDreamAdvisor: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [detectedTraits, setDetectedTraits] = useState<string[]>([]);
  const [studentData, setStudentData] = useState<StudentData>({
    dreamJob: '',
    district: '',
    zScore: '',
    interests: [],
    personalityTraits: {
      leadership: 3,
      creativity: 3,
      analyticalThinking: 3,
      riskTaking: 3,
      entrepreneurialMindset: 3,
    },
    personalityDescription: '',
    locationPreference: '',
    travelTolerance: '',
    familyAttachment: 3,
    workEnvironment: '',
    stressTolerance: 3,
    socialInteraction: '',
  });

  const dreamJobCategories = [
    {
      name: 'Technology & Engineering',
      icon: '💻',
      color: '#2563EB',
      jobs: [
        { name: 'Software Engineer', icon: '�' },
        { name: 'Engineer', icon: '🔧' },
        { name: 'Data Scientist', icon: '📊' },
        { name: 'Architect', icon: '�️' },
        { name: 'AI Engineer', icon: '🤖' },
        { name: 'Cybersecurity Expert', icon: '�' },
        { name: 'Blockchain Developer', icon: '⛓️' },
        { name: 'Cloud Architect', icon: '☁️' },
        { name: 'Research Scientist', icon: '�' }
      ]
    },
    {
      name: 'Healthcare & Medicine',
      icon: '�‍⚕️',
      color: '#DC2626',
      jobs: [
        { name: 'Doctor', icon: '👨‍⚕️' },
        { name: 'Nurse', icon: '�‍⚕️' },
        { name: 'Pharmacist', icon: '�' },
        { name: 'Psychologist', icon: '🧠' },
        { name: 'Medical Laboratory Technician', icon: '🧪' },
        { name: 'Physiotherapist', icon: '�' },
        { name: 'Nutritionist', icon: '🥗' },
        { name: 'Sports Medicine Doctor', icon: '�' }
      ]
    },
    {
      name: 'Business & Finance',
      icon: '💼',
      color: '#059669',
      jobs: [
        { name: 'Business Manager', icon: '�' },
        { name: 'Accountant', icon: '📈' },
        { name: 'Marketing Manager', icon: '📢' },
        { name: 'Financial Analyst', icon: '📊' },
        { name: 'Investment Banker', icon: '�' },
        { name: 'Insurance Agent', icon: '📋' },
        { name: 'Real Estate Agent', icon: '🏘️' },
        { name: 'Digital Marketer', icon: '�' },
        { name: 'E-commerce Manager', icon: '�' },
        { name: 'HR Manager', icon: '👥' }
      ]
    },
    {
      name: 'Creative Arts & Design',
      icon: '🎨',
      color: '#7C3AED',
      jobs: [
        { name: 'Designer', icon: '🎨' },
        { name: 'Photographer', icon: '📸' },
        { name: 'Videographer', icon: '🎥' },
        { name: 'Fashion Designer', icon: '�' },
        { name: 'Interior Designer', icon: '🏠' },
        { name: 'Journalist', icon: '📰' },
        { name: 'Chef', icon: '�‍🍳' }
      ]
    },
    {
      name: 'Education & Social Services',
      icon: '�‍🏫',
      color: '#EA580C',
      jobs: [
        { name: 'Teacher', icon: '👩‍🏫' },
        { name: 'Social Worker', icon: '�' },
        { name: 'Librarian', icon: '�' },
        { name: 'Career Counselor', icon: '🎯' }
      ]
    },
    {
      name: 'Legal & Government',
      icon: '⚖️',
      color: '#1F2937',
      jobs: [
        { name: 'Lawyer', icon: '⚖️' },
        { name: 'Civil Servant', icon: '�️' },
        { name: 'Police Officer', icon: '�' },
        { name: 'Army Officer', icon: '🪖' },
        { name: 'Navy Officer', icon: '⚓' },
        { name: 'Air Force Officer', icon: '✈️' },
        { name: 'Customs Officer', icon: '�' }
      ]
    },
    {
      name: 'Sri Lankan Industries',
      icon: '🇱🇰',
      color: '#0891B2',
      jobs: [
        { name: 'Tea Plantation Manager', icon: '�' },
        { name: 'Tourism Manager', icon: '🏝️' },
        { name: 'Garments Industry Manager', icon: '�' },
        { name: 'Agricultural Officer', icon: '�' },
        { name: 'Fisheries Officer', icon: '�' }
      ]
    },
    {
      name: 'Skilled Trades & Services',
      icon: '🔧',
      color: '#B45309',
      jobs: [
        { name: 'Electrician', icon: '⚡' },
        { name: 'Plumber', icon: '🔧' },
        { name: 'Mechanic', icon: '🚗' },
        { name: 'Construction Manager', icon: '🏗️' },
        { name: 'Banker', icon: '🏦' }
      ]
    },
    {
      name: 'Sports & Fitness',
      icon: '⚽',
      color: '#16A34A',
      jobs: [
        { name: 'Sports Coach', icon: '⚽' },
        { name: 'Fitness Trainer', icon: '💪' },
        { name: 'Pilot', icon: '✈️' }
      ]
    },
    {
      name: 'Entrepreneurship',
      icon: '🚀',
      color: '#9333EA',
      jobs: [
        { name: 'Entrepreneur', icon: '🚀' }
      ]
    }
  ];

  // Flatten all jobs for backward compatibility
  const dreamJobs = dreamJobCategories.flatMap(category => category.jobs);

  // Personality trait extraction based on text analysis (Trilingual: English, Sinhala, Tamil)
  const extractPersonalityTraits = (text: string): string[] => {
    const traits: string[] = [];
    const lowerText = text.toLowerCase();

    // Leadership indicators (English, Sinhala, Tamil) - Enhanced with work style descriptors
    if (lowerText.includes('lead') || lowerText.includes('manage') || lowerText.includes('organize') || 
        lowerText.includes('team') || lowerText.includes('guide') || lowerText.includes('coordinate') ||
        lowerText.includes('supervise') || lowerText.includes('direct') || lowerText.includes('motivate') ||
        lowerText.includes('inspire') || lowerText.includes('delegate') || lowerText.includes('coach') ||
        // Enhanced work style leadership indicators
        lowerText.includes('take charge') || lowerText.includes('responsible') || lowerText.includes('decision maker') ||
        lowerText.includes('planning') || lowerText.includes('strategic') || lowerText.includes('visionary') ||
        lowerText.includes('influence') || lowerText.includes('persuade') || lowerText.includes('authority') ||
        lowerText.includes('initiative') || lowerText.includes('proactive') || lowerText.includes('ownership') ||
        // Sinhala leadership keywords
        lowerText.includes('නායක') || lowerText.includes('මෙහෙයවරු') || lowerText.includes('කණ්ඩායම') || 
        lowerText.includes('මඟපෙන්වන') || lowerText.includes('උපදෙස්') || lowerText.includes('අධ්යක්ෂ') ||
        // Enhanced Sinhala work style
        lowerText.includes('�වගකිය') || lowerText.includes('තීරණ') || lowerText.includes('දුරදුරන්') ||
        lowerText.includes('බලධාරී') || lowerText.includes('අධ්යක්ෂක') || lowerText.includes('වගකීම') ||
        // Tamil leadership keywords
        lowerText.includes('தலைவர்') || lowerText.includes('நிர்வாகம்') || lowerText.includes('குழு') || 
        lowerText.includes('வழிகாட்டு') || lowerText.includes('ஆலோசனை') || lowerText.includes('மேற்பார்வை') ||
        // Enhanced Tamil work style
        lowerText.includes('பொறுப்பு') || lowerText.includes('தலைமை') || lowerText.includes('முடிவு') ||
        lowerText.includes('தலைவன்') || lowerText.includes('கட்டளை') || lowerText.includes('அதிகாரம்')) {
      traits.push('👑 Natural Leader');
    }

    // Creativity indicators (English, Sinhala, Tamil) - Enhanced with work style descriptors
    if (lowerText.includes('creative') || lowerText.includes('innovative') || lowerText.includes('design') || 
        lowerText.includes('artistic') || lowerText.includes('imagine') || lowerText.includes('invent') ||
        lowerText.includes('brainstorm') || lowerText.includes('original') || lowerText.includes('unique') ||
        lowerText.includes('artistic') || lowerText.includes('expressive') || lowerText.includes('art') ||
        // Enhanced work style creativity indicators
        lowerText.includes('think outside box') || lowerText.includes('new ideas') || lowerText.includes('artistic') ||
        lowerText.includes('visual thinker') || lowerText.includes('abstract') || lowerText.includes('imaginative') ||
        lowerText.includes('artistic expression') || lowerText.includes('colorful') || lowerText.includes('artistic talent') ||
        lowerText.includes('creative solutions') || lowerText.includes('innovative thinking') || lowerText.includes('design thinking') ||
        lowerText.includes('artistic approach') || lowerText.includes('creative mind') || lowerText.includes('visionary') ||
        // Sinhala creativity keywords
        lowerText.includes('නිර්මාණ') || lowerText.includes('නිර්මාණශීලී') || lowerText.includes('නිර්මාණක') ||
        lowerText.includes('කලා') || lowerText.includes('අලුත්') || lowerText.includes('සිතුවිලි') ||
        // Enhanced Sinhala work style
        lowerText.includes('නිර්මාණක සිතුවිලි') || lowerText.includes('අලුත් අදහස්') || lowerText.includes('වර්ණ') ||
        lowerText.includes('කලාත්ම') || lowerText.includes('සිතුවිලි') || lowerText.includes('නිර්මාණ') ||
        // Tamil creativity keywords
        lowerText.includes('படைப்பு') || lowerText.includes('புதுமை') || lowerText.includes('வடிவமைப்பு') ||
        lowerText.includes('கலை') || lowerText.includes('புதிய') || lowerText.includes('கற்பனை') ||
        // Enhanced Tamil work style
        lowerText.includes('படைப்பு சிந்தனை') || lowerText.includes('புதுமையான யோசனை') || lowerText.includes('கலைசார்ந்த') ||
        lowerText.includes('கற்பனை வடிவம்') || lowerText.includes('படைப்பு திறன்') || lowerText.includes('கலைஞர்')) {
      traits.push('💡 Creative Thinker');
    }

    // Analytical indicators (English, Sinhala, Tamil)
    if (lowerText.includes('analyze') || lowerText.includes('data') || lowerText.includes('logic') || 
        lowerText.includes('research') || lowerText.includes('solve') || lowerText.includes('investigate') ||
        lowerText.includes('examine') || lowerText.includes('study') || lowerText.includes('explore') ||
        lowerText.includes('scientific') || lowerText.includes('methodical') || lowerText.includes('systematic') ||
        // Sinhala analytical keywords
        lowerText.includes('විශ්ලේෂණ') || lowerText.includes('දත්ත') || lowerText.includes('තර්කය') ||
        lowerText.includes('පර්යේචන') || lowerText.includes('විසඳ') || lowerText.includes('අධ්යනය') ||
        // Tamil analytical keywords
        lowerText.includes('பகுப்பாய்வு') || lowerText.includes('தரவு') || lowerText.includes('தர்க்கம்') ||
        lowerText.includes('ஆராய்ச்சி') || lowerText.includes('தீர்வு') || lowerText.includes('ஆய்வு')) {
      traits.push('🔍 Analytical Mind');
    }

    // Risk-taking indicators
    if (lowerText.includes('risk') || lowerText.includes('adventure') || lowerText.includes('bold') || 
        lowerText.includes('dare') || lowerText.includes('challenge') || lowerText.includes('experiment') ||
        lowerText.includes('courageous') || lowerText.includes('brave') || lowerText.includes('daring') ||
        lowerText.includes('pioneer') || lowerText.includes('trailblazer') || lowerText.includes('breakthrough')) {
      traits.push('🚀 Risk Taker');
    }

    // Team collaboration indicators (English, Sinhala, Tamil)
    if (lowerText.includes('collaborate') || lowerText.includes('teamwork') || lowerText.includes('together') || 
        lowerText.includes('group') || lowerText.includes('partner') || lowerText.includes('support') ||
        lowerText.includes('cooperate') || lowerText.includes('synergy') || lowerText.includes('unite') ||
        lowerText.includes('harmony') || lowerText.includes('collective') || lowerText.includes('shared') ||
        // Sinhala teamwork keywords
        lowerText.includes('සහයෝගය') || lowerText.includes('එකට') || lowerText.includes('කණ්ඩායම්') ||
        lowerText.includes('සහයෝගයෙන්') || lowerText.includes('එක්ව') || lowerText.includes('එක්ව ක්රියා') ||
        // Tamil teamwork keywords
        lowerText.includes('ஒத்துழைப்பு') || lowerText.includes('ஒன்றாக') || lowerText.includes('குழு') ||
        lowerText.includes('ஒன்றுபட்டு') || lowerText.includes('இணைந்து') || lowerText.includes('கூட்டாய்வு')) {
      traits.push('🤝 Team Player');
    }

    // Entrepreneurial indicators
    if (lowerText.includes('business') || lowerText.includes('startup') || lowerText.includes('venture') || 
        lowerText.includes('opportunity') || lowerText.includes('market') || lowerText.includes('entrepreneur') ||
        lowerText.includes('enterprise') || lowerText.includes('initiative') || lowerText.includes('ambitious') ||
        lowerText.includes('profit') || lowerText.includes('growth') || lowerText.includes('scalable')) {
      traits.push('💼 Entrepreneurial');
    }

    // Communication indicators
    if (lowerText.includes('communicate') || lowerText.includes('talk') || lowerText.includes('present') || 
        lowerText.includes('explain') || lowerText.includes('discuss') || lowerText.includes('share') ||
        lowerText.includes('articulate') || lowerText.includes('express') || lowerText.includes('listen') ||
        lowerText.includes('negotiate') || lowerText.includes('persuade') || lowerText.includes('dialogue')) {
      traits.push('🗣️ Great Communicator');
    }

    // Problem-solving indicators
    if (lowerText.includes('problem') || lowerText.includes('solution') || lowerText.includes('fix') || 
        lowerText.includes('resolve') || lowerText.includes('overcome') || lowerText.includes('tackle') ||
        lowerText.includes('troubleshoot') || lowerText.includes('debug') || lowerText.includes('repair') ||
        lowerText.includes('improve') || lowerText.includes('optimize') || lowerText.includes('enhance')) {
      traits.push('⚙️ Problem Solver');
    }

    // Detail-oriented indicators
    if (lowerText.includes('detail') || lowerText.includes('precise') || lowerText.includes('accurate') || 
        lowerText.includes('careful') || lowerText.includes('thorough') || lowerText.includes('meticulous') ||
        lowerText.includes('exact') || lowerText.includes('specific') || lowerText.includes('focused')) {
      traits.push('🎯 Detail-Oriented');
    }

    // Strategic thinking indicators
    if (lowerText.includes('strategy') || lowerText.includes('plan') || lowerText.includes('vision') || 
        lowerText.includes('long-term') || lowerText.includes('goal') || lowerText.includes('objective') ||
        lowerText.includes('tactical') || lowerText.includes('foresight') || lowerText.includes('roadmap')) {
      traits.push('♟️ Strategic Thinker');
    }

    // Empathy indicators
    if (lowerText.includes('empathy') || lowerText.includes('understand') || lowerText.includes('feel') || 
        lowerText.includes('compassion') || lowerText.includes('care') || lowerText.includes('help') ||
        lowerText.includes('supportive') || lowerText.includes('kind') || lowerText.includes('considerate')) {
      traits.push('❤️ Empathetic Helper');
    }

    // Adaptability indicators
    if (lowerText.includes('adapt') || lowerText.includes('flexible') || lowerText.includes('versatile') || 
        lowerText.includes('adjust') || lowerText.includes('change') || lowerText.includes('learn') ||
        lowerText.includes('open-minded') || lowerText.includes('versatile') || lowerText.includes('agile')) {
      traits.push('🌊 Adaptable');
    }

    // Perseverance indicators
    if (lowerText.includes('persistent') || lowerText.includes('determined') || lowerText.includes('dedicated') || 
        lowerText.includes('committed') || lowerText.includes('hardworking') || lowerText.includes('resilient') ||
        lowerText.includes('tenacious') || lowerText.includes('grit') || lowerText.includes('persevere')) {
      traits.push('💪 Persistent Achiever');
    }

    // Curiosity indicators
    if (lowerText.includes('curious') || lowerText.includes('explore') || lowerText.includes('discover') || 
        lowerText.includes('learn') || lowerText.includes('investigate') || lowerText.includes('question') ||
        lowerText.includes('wonder') || lowerText.includes('inquisitive') || lowerText.includes('seek knowledge')) {
      traits.push('🔬 Curious Explorer');
    }

    // Organizational indicators
    if (lowerText.includes('organize') || lowerText.includes('structure') || lowerText.includes('system') || 
        lowerText.includes('arrange') || lowerText.includes('plan') || lowerText.includes('schedule') ||
        lowerText.includes('methodical') || lowerText.includes('orderly') || lowerText.includes('tidy')) {
      traits.push('📋 Organized Planner');
    }

    // Social indicators
    if (lowerText.includes('social') || lowerText.includes('people') || lowerText.includes('network') || 
        lowerText.includes('connect') || lowerText.includes('relationship') || lowerText.includes('community') ||
        lowerText.includes('outgoing') || lowerText.includes('friendly') || lowerText.includes('sociable')) {
      traits.push('👥 Social Butterfly');
    }

    // Independent indicators
    if (lowerText.includes('independent') || lowerText.includes('autonomous') || lowerText.includes('self-motivated') || 
        lowerText.includes('solo') || lowerText.includes('individual') || lowerText.includes('self-directed') ||
        lowerText.includes('alone') || lowerText.includes('self-reliant') || lowerText.includes('freedom')) {
      traits.push('🚶 Independent Worker');
    }

    // Competitive indicators
    if (lowerText.includes('competitive') || lowerText.includes('win') || lowerText.includes('achieve') || 
        lowerText.includes('excel') || lowerText.includes('best') || lowerText.includes('top') ||
        lowerText.includes('ambitious') || lowerText.includes('driven') || lowerText.includes('goal-oriented')) {
      traits.push('🏆 Competitive Spirit');
    }

    // Provide helpful guidance if no personality traits detected
    if (traits.length === 0) {
      // Check if text is too short or generic
      if (text.length < 20) {
        return ['📝 Tell us more about yourself'];
      } else if (text.toLowerCase().includes('hi') || text.toLowerCase().includes('hello')) {
        return ['🤝 Try describing your work style and interests'];
      } else {
        return ['🎭 Unique Personality'];
      }
    }
    
    return traits;
  };

  // Update detected traits when personality text changes
  const handlePersonalityTextChange = (text: string) => {
    updateStudentData('personalityDescription', text);
    const traits = extractPersonalityTraits(text);
    setDetectedTraits(traits);
  };

  const provinces = [
    {
      name: 'Western Province',
      districts: ['Colombo', 'Gampaha', 'Kalutara']
    },
    {
      name: 'Central Province', 
      districts: ['Kandy', 'Matale', 'Nuwara Eliya']
    },
    {
      name: 'Southern Province',
      districts: ['Galle', 'Matara', 'Hambantota']
    },
    {
      name: 'Northern Province',
      districts: ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu']
    },
    {
      name: 'Eastern Province',
      districts: ['Batticaloa', 'Ampara', 'Trincomalee']
    },
    {
      name: 'North Western Province',
      districts: ['Kurunegala', 'Puttalam']
    },
    {
      name: 'North Central Province',
      districts: ['Anuradhapura', 'Polonnaruwa']
    },
    {
      name: 'Uva Province',
      districts: ['Badulla', 'Monaragala']
    },
    {
      name: 'Sabaragamuwa Province',
      districts: ['Ratnapura', 'Kegalle']
    }
  ];

  const updateStudentData = (field: keyof StudentData, value: string | number | string[]) => {
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updatePersonalityTrait = (trait: keyof StudentData['personalityTraits'], value: number) => {
    setStudentData(prev => ({
      ...prev,
      personalityTraits: {
        ...prev.personalityTraits,
        [trait]: value
      }
    }));
  };

  const getBackwardAnalysis = (dreamJob: string) => {
    const analysisData: { [key: string]: any } = {
      'Software Engineer': {
        requiredEducation: 'Bachelor\'s degree in Computer Science, Software Engineering, or related field',
        keySkills: ['Programming (Python, Java, JavaScript)', 'Data Structures & Algorithms', 'Database Management', 'Problem Solving', 'Team Collaboration'],
        careerPath: ['Junior Developer → Senior Developer → Tech Lead → Engineering Manager → CTO'],
        industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Gaming'],
        timeline: '4 years degree + 2-3 years experience for senior roles',
        salaryRange: '$60,000 - $180,000+ depending on experience and location'
      },
      'Doctor': {
        requiredEducation: 'Bachelor\'s degree + Medical School (MD) + Residency (3-7 years)',
        keySkills: ['Medical Knowledge', 'Patient Care', 'Diagnostic Skills', 'Communication', 'Emotional Intelligence'],
        careerPath: ['Medical Student → Resident → Attending Physician → Department Head → Medical Director'],
        industries: ['Healthcare', 'Research', 'Education', 'Pharmaceutical', 'Insurance'],
        timeline: '8-12 years total education and training',
        salaryRange: '$150,000 - $500,000+ depending on specialty'
      },
      'Engineer': {
        requiredEducation: 'Bachelor\'s degree in Engineering (Civil, Mechanical, Electrical, etc.)',
        keySkills: ['Mathematics', 'Problem Solving', 'Technical Design', 'Project Management', 'Analytical Thinking'],
        careerPath: ['Junior Engineer → Engineer → Senior Engineer → Project Manager → Engineering Director'],
        industries: ['Construction', 'Manufacturing', 'Energy', 'Technology', 'Consulting'],
        timeline: '4 years degree + 2-5 years experience for senior roles',
        salaryRange: '$65,000 - $150,000+ depending on specialization'
      },
      'Lawyer': {
        requiredEducation: 'Bachelor\'s degree + Law School (JD) + Bar Exam',
        keySkills: ['Legal Research', 'Critical Thinking', 'Argumentation', 'Writing', 'Negotiation'],
        careerPath: ['Law Student → Associate → Partner → Senior Partner → Managing Partner'],
        industries: ['Legal Services', 'Government', 'Corporate', 'Non-profit', 'Education'],
        timeline: '7 years total education + bar exam',
        salaryRange: '$80,000 - $300,000+ depending on practice area'
      },
      'Teacher': {
        requiredEducation: 'Bachelor\'s degree + Teaching Certification/License',
        keySkills: ['Subject Matter Expertise', 'Communication', 'Patience', 'Lesson Planning', 'Classroom Management'],
        careerPath: ['Student Teacher → Teacher → Department Head → Principal → District Administrator'],
        industries: ['Education', 'Private Tutoring', 'Curriculum Development', 'Educational Technology'],
        timeline: '4 years degree + 1-2 years certification',
        salaryRange: '$40,000 - $80,000+ depending on location and level'
      },
      'Business Manager': {
        requiredEducation: 'Bachelor\'s degree in Business Administration, Management, or related field',
        keySkills: ['Leadership', 'Strategic Planning', 'Financial Analysis', 'Communication', 'Decision Making'],
        careerPath: ['Management Trainee → Manager → Senior Manager → Director → VP → CEO'],
        industries: ['Corporate', 'Retail', 'Manufacturing', 'Technology', 'Consulting'],
        timeline: '4 years degree + 3-5 years experience for management roles',
        salaryRange: '$70,000 - $200,000+ depending on company size and industry'
      },
      'Data Scientist': {
        requiredEducation: 'Bachelor\'s/Master\'s degree in Computer Science, Statistics, Mathematics, or related field',
        keySkills: ['Statistics', 'Programming (Python, R)', 'Machine Learning', 'Data Visualization', 'Business Acumen'],
        careerPath: ['Junior Data Scientist → Data Scientist → Senior Data Scientist → Lead Data Scientist → Chief Data Officer'],
        industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Research'],
        timeline: '4-6 years education + 2-4 years experience for senior roles',
        salaryRange: '$85,000 - $200,000+ depending on experience and industry'
      },
      'Architect': {
        requiredEducation: 'Bachelor\'s degree in Architecture + Architect License',
        keySkills: ['Design', 'Mathematics', 'Project Management', 'Communication', 'Technical Drawing'],
        careerPath: ['Intern Architect → Licensed Architect → Senior Architect → Project Manager → Firm Partner'],
        industries: ['Architecture', 'Construction', 'Urban Planning', 'Interior Design', 'Real Estate'],
        timeline: '5 years degree + 3 years internship + license exam',
        salaryRange: '$60,000 - $150,000+ depending on experience and location'
      },
      'Pharmacist': {
        requiredEducation: 'Doctor of Pharmacy (Pharm.D.) degree + State License',
        keySkills: ['Pharmaceutical Knowledge', 'Patient Counseling', 'Attention to Detail', 'Communication', 'Ethics'],
        careerPath: ['Pharmacy Student → Pharmacist → Clinical Pharmacist → Pharmacy Manager → Director'],
        industries: ['Healthcare', 'Retail', 'Hospital', 'Pharmaceutical', 'Research'],
        timeline: '6-8 years education + licensing',
        salaryRange: '$100,000 - $150,000+ depending on setting'
      },
      'Accountant': {
        requiredEducation: 'Bachelor\'s degree in Accounting or Finance + CPA (optional)',
        keySkills: ['Accounting Principles', 'Financial Analysis', 'Attention to Detail', 'Tax Knowledge', 'Software Proficiency'],
        careerPath: ['Staff Accountant → Senior Accountant → Manager → Controller → CFO'],
        industries: ['Accounting', 'Finance', 'Corporate', 'Government', 'Non-profit'],
        timeline: '4 years degree + CPA certification (1-2 years)',
        salaryRange: '$50,000 - $120,000+ depending on certification and experience'
      },
      'Marketing Manager': {
        requiredEducation: 'Bachelor\'s degree in Marketing, Business, or Communications',
        keySkills: ['Marketing Strategy', 'Communication', 'Analytics', 'Creativity', 'Project Management'],
        careerPath: ['Marketing Coordinator → Marketing Specialist → Marketing Manager → Director → CMO'],
        industries: ['Corporate', 'Agency', 'Technology', 'Retail', 'Entertainment'],
        timeline: '4 years degree + 3-5 years experience for management',
        salaryRange: '$65,000 - $150,000+ depending on company and industry'
      },
      'Journalist': {
        requiredEducation: 'Bachelor\'s degree in Journalism, Communications, or related field',
        keySkills: ['Writing', 'Research', 'Interviewing', 'Storytelling', 'Digital Media'],
        careerPath: ['Reporter → Senior Reporter → Editor → Managing Editor → Editor-in-Chief'],
        industries: ['Media', 'News', 'Publishing', 'Digital Media', 'Corporate Communications'],
        timeline: '4 years degree + 2-5 years experience for senior roles',
        salaryRange: '$35,000 - $100,000+ depending on medium and experience'
      },
      'Psychologist': {
        requiredEducation: 'Master\'s/Doctorate degree in Psychology + State License',
        keySkills: ['Psychological Assessment', 'Counseling', 'Research', 'Empathy', 'Communication'],
        careerPath: ['Intern → Psychologist → Senior Psychologist → Clinical Director → Practice Owner'],
        industries: ['Healthcare', 'Education', 'Research', 'Private Practice', 'Corporate'],
        timeline: '6-10 years education + licensing',
        salaryRange: '$60,000 - $120,000+ depending on specialization'
      },
      'Research Scientist': {
        requiredEducation: 'Master\'s/PhD in relevant scientific field',
        keySkills: ['Research Methodology', 'Data Analysis', 'Critical Thinking', 'Writing', 'Laboratory Skills'],
        careerPath: ['Research Assistant → Research Scientist → Senior Scientist → Principal Investigator → Lab Director'],
        industries: ['Academia', 'Pharmaceutical', 'Biotechnology', 'Government', 'Technology'],
        timeline: '6-10 years education + postdoctoral research',
        salaryRange: '$70,000 - $150,000+ depending on field and experience'
      },
      'Entrepreneur': {
        requiredEducation: 'No formal education required, but business degree helpful',
        keySkills: ['Business Planning', 'Leadership', 'Risk Management', 'Networking', 'Financial Management'],
        careerPath: ['Startup Founder → Small Business Owner → Serial Entrepreneur → Angel Investor → Venture Capitalist'],
        industries: ['Technology', 'Retail', 'Services', 'Manufacturing', 'Consulting'],
        timeline: 'Variable - can start immediately, success typically takes 3-5 years',
        salaryRange: '$0 - $1,000,000+ highly variable depending on business success'
      },
      'Civil Servant': {
        requiredEducation: 'Bachelor\'s degree + Civil Service Exam',
        keySkills: ['Public Policy', 'Administration', 'Communication', 'Ethics', 'Problem Solving'],
        careerPath: ['Entry Level → Mid-Level → Senior → Manager → Director → Secretary'],
        industries: ['Government', 'Public Administration', 'Policy', 'Regulatory'],
        timeline: '4 years degree + civil service exam + experience',
        salaryRange: '$45,000 - $150,000+ depending on level and agency'
      },
      'Banker': {
        requiredEducation: 'Bachelor\'s degree in Finance, Economics, or Business',
        keySkills: ['Financial Analysis', 'Customer Service', 'Risk Assessment', 'Sales', 'Regulatory Knowledge'],
        careerPath: ['Teller → Personal Banker → Relationship Manager → Branch Manager → Regional Manager'],
        industries: ['Banking', 'Financial Services', 'Investment', 'Insurance'],
        timeline: '4 years degree + certifications + 2-5 years experience',
        salaryRange: '$50,000 - $150,000+ depending on role and institution'
      },
      'Designer': {
        requiredEducation: 'Bachelor\'s degree in Design, Fine Arts, or related field',
        keySkills: ['Design Software', 'Creativity', 'Visual Communication', 'Typography', 'User Experience'],
        careerPath: ['Junior Designer → Designer → Senior Designer → Art Director → Creative Director'],
        industries: ['Design', 'Advertising', 'Technology', 'Publishing', 'Fashion'],
        timeline: '4 years degree + 2-5 years portfolio development',
        salaryRange: '$45,000 - $120,000+ depending on specialization and experience'
      },
      'Chef': {
        requiredEducation: 'Culinary degree/certification + apprenticeship',
        keySkills: ['Cooking Techniques', 'Menu Planning', 'Food Safety', 'Creativity', 'Team Management'],
        careerPath: ['Line Cook → Sous Chef → Executive Chef → Chef Owner → Restaurateur'],
        industries: ['Restaurants', 'Hotels', 'Catering', 'Food Service', 'Media'],
        timeline: '2-4 years culinary training + 5-10 years experience',
        salaryRange: '$40,000 - $100,000+ depending on establishment and reputation'
      },
      'Pilot': {
        requiredEducation: 'High school diploma + Flight School + Commercial License',
        keySkills: ['Flying Skills', 'Navigation', 'Weather Analysis', 'Communication', 'Decision Making'],
        careerPath: ['Student Pilot → Private Pilot → Commercial Pilot → Airline Pilot → Captain'],
        industries: ['Aviation', 'Commercial Airlines', 'Cargo', 'Military', 'Private Charter'],
        timeline: '2-3 years flight training + 1,500+ flight hours for airline',
        salaryRange: '$60,000 - $200,000+ depending on aircraft and airline'
      },
      'Tea Plantation Manager': {
        requiredEducation: 'Bachelor\'s degree in Agriculture, Horticulture, or Plantation Management',
        keySkills: ['Agricultural Science', 'Management', 'Quality Control', 'Business Acumen', 'Leadership'],
        careerPath: ['Assistant Manager → Plantation Manager → Senior Manager → Director → CEO'],
        industries: ['Tea Industry', 'Agriculture', 'Export', 'Tourism', 'Research'],
        timeline: '4 years degree + 2-3 years experience for management roles',
        salaryRange: 'LKR 800,000 - 2,500,000+ depending on plantation size and experience'
      },
      'Tourism Manager': {
        requiredEducation: 'Bachelor\'s degree in Tourism Management, Hospitality, or Business Administration',
        keySkills: ['Customer Service', 'Marketing', 'Languages', 'Cultural Knowledge', 'Event Planning'],
        careerPath: ['Tour Coordinator → Manager → Senior Manager → Director → Tourism Board Member'],
        industries: ['Tourism', 'Hospitality', 'Travel Agencies', 'Government Tourism', 'Event Management'],
        timeline: '4 years degree + 2-4 years experience for management',
        salaryRange: 'LKR 600,000 - 2,000,000+ depending on organization and location'
      },
      'Garments Industry Manager': {
        requiredEducation: 'Bachelor\'s degree in Textile Engineering, Business, or Industrial Management',
        keySkills: ['Production Management', 'Quality Control', 'Supply Chain', 'International Trade', 'Team Leadership'],
        careerPath: ['Supervisor → Manager → Senior Manager → Plant Manager → Director'],
        industries: ['Garments Manufacturing', 'Textiles', 'Export', 'Fashion', 'International Trade'],
        timeline: '4 years degree + 3-5 years experience for management',
        salaryRange: 'LKR 700,000 - 2,200,000+ depending on company size and exports'
      },
      'Agricultural Officer': {
        requiredEducation: 'Bachelor\'s degree in Agriculture, Agronomy, or related field',
        keySkills: ['Agricultural Science', 'Extension Services', 'Research', 'Policy Implementation', 'Farmer Training'],
        careerPath: ['Junior Officer → Agricultural Officer → Senior Officer → District Officer → Director'],
        industries: ['Government Agriculture', 'Research Institutes', 'Private Agriculture', 'NGOs', 'International Organizations'],
        timeline: '4 years degree + government training program',
        salaryRange: 'LKR 500,000 - 1,500,000+ depending on government grade and experience'
      },
      'Fisheries Officer': {
        requiredEducation: 'Bachelor\'s degree in Fisheries Science, Marine Biology, or Aquaculture',
        keySkills: ['Marine Biology', 'Fisheries Management', 'Conservation', 'Policy Implementation', 'Research'],
        careerPath: ['Junior Officer → Fisheries Officer → Senior Officer → District Officer → Director'],
        industries: ['Government Fisheries', 'Aquaculture', 'Marine Research', 'Conservation', 'International Fisheries'],
        timeline: '4 years degree + specialized fisheries training',
        salaryRange: 'LKR 450,000 - 1,400,000+ depending on government grade and specialization'
      },
      'Customs Officer': {
        requiredEducation: 'Bachelor\'s degree + Customs Training Program',
        keySkills: ['Customs Law', 'Investigation', 'Documentation', 'Communication', 'Risk Assessment'],
        careerPath: ['Junior Officer → Customs Officer → Senior Officer → Superintendent → Director General'],
        industries: ['Government Customs', 'Border Control', 'Trade Regulation', 'Law Enforcement', 'International Trade'],
        timeline: '4 years degree + 6 months customs training',
        salaryRange: 'LKR 550,000 - 1,800,000+ depending on grade and experience'
      },
      'Police Officer': {
        requiredEducation: 'GCE A/L + Police Training Academy',
        keySkills: ['Law Enforcement', 'Investigation', 'Physical Fitness', 'Communication', 'Leadership'],
        careerPath: ['Constable → Sergeant → Inspector → Superintendent → DIG → IGP'],
        industries: ['Police Department', 'Law Enforcement', 'Government Security', 'Investigation', 'Traffic Control'],
        timeline: '6 months training academy + ongoing professional development',
        salaryRange: 'LKR 400,000 - 1,200,000+ depending on rank and experience'
      },
      'Army Officer': {
        requiredEducation: 'GCE A/L + Military Training Academy',
        keySkills: ['Military Strategy', 'Leadership', 'Physical Fitness', 'Discipline', 'Strategic Planning'],
        careerPath: ['Second Lieutenant → Lieutenant → Captain → Major → Colonel → General'],
        industries: ['Sri Lanka Army', 'Defense', 'Security', 'Peacekeeping', 'Disaster Relief'],
        timeline: '18 months military academy + continuous training',
        salaryRange: 'LKR 600,000 - 2,000,000+ depending on rank and specialization'
      },
      'Navy Officer': {
        requiredEducation: 'GCE A/L + Naval Training Academy',
        keySkills: ['Naval Operations', 'Navigation', 'Leadership', 'Maritime Law', 'Technical Skills'],
        careerPath: ['Midshipman → Lieutenant → Lieutenant Commander → Commander → Captain → Admiral'],
        industries: ['Sri Lanka Navy', 'Maritime Security', 'Naval Operations', 'International Waters', 'Coast Guard'],
        timeline: '2 years naval academy + sea training',
        salaryRange: 'LKR 650,000 - 2,100,000+ depending on rank and vessel type'
      },
      'Air Force Officer': {
        requiredEducation: 'GCE A/L + Air Force Training Academy',
        keySkills: ['Aviation', 'Technical Skills', 'Leadership', 'Air Operations', 'Strategic Planning'],
        careerPath: ['Pilot Officer → Flying Officer → Flight Lieutenant → Squadron Leader → Wing Commander → Group Captain'],
        industries: ['Sri Lanka Air Force', 'Aviation', 'Air Defense', 'Military Aviation', 'Technical Support'],
        timeline: '2 years air force academy + flight training',
        salaryRange: 'LKR 700,000 - 2,300,000+ depending on rank and aircraft type'
      },
      'AI Engineer': {
        requiredEducation: 'Bachelor\'s/Master\'s degree in Computer Science, AI, or Machine Learning',
        keySkills: ['Machine Learning', 'Deep Learning', 'Python', 'Neural Networks', 'Data Science'],
        careerPath: ['Junior AI Engineer → AI Engineer → Senior AI Engineer → AI Lead → AI Director'],
        industries: ['Technology', 'Healthcare', 'Finance', 'Automotive', 'Research'],
        timeline: '4-6 years education + 2-4 years experience for senior roles',
        salaryRange: '$90,000 - $250,000+ depending on expertise and industry'
      },
      'Cybersecurity Expert': {
        requiredEducation: 'Bachelor\'s degree in Computer Science, Information Security, or related field + Certifications',
        keySkills: ['Network Security', 'Ethical Hacking', 'Risk Assessment', 'Compliance', 'Incident Response'],
        careerPath: ['Security Analyst → Security Engineer → Senior Engineer → Security Manager → CISO'],
        industries: ['Technology', 'Finance', 'Healthcare', 'Government', 'Consulting'],
        timeline: '4 years degree + certifications (CISSP, CEH) + 3-5 years experience',
        salaryRange: '$85,000 - $220,000+ depending on certifications and experience'
      },
      'Blockchain Developer': {
        requiredEducation: 'Bachelor\'s degree in Computer Science + Blockchain Specialization',
        keySkills: ['Blockchain Technology', 'Smart Contracts', 'Cryptography', 'Web3', 'Decentralized Systems'],
        careerPath: ['Junior Developer → Blockchain Developer → Senior Developer → Lead Developer → CTO'],
        industries: ['Fintech', 'Technology', 'Cryptocurrency', 'Supply Chain', 'Digital Identity'],
        timeline: '4 years degree + 6 months blockchain training + 2-3 years experience',
        salaryRange: '$95,000 - $200,000+ depending on expertise and project type'
      },
      'Cloud Architect': {
        requiredEducation: 'Bachelor\'s degree in Computer Science + Cloud Certifications (AWS, Azure, GCP)',
        keySkills: ['Cloud Computing', 'System Architecture', 'DevOps', 'Security', 'Cost Optimization'],
        careerPath: ['Cloud Engineer → Cloud Architect → Senior Architect → Principal Architect → Cloud Director'],
        industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Consulting'],
        timeline: '4 years degree + cloud certifications + 3-5 years experience',
        salaryRange: '$100,000 - $250,000+ depending on certifications and cloud platform'
      },
      'Digital Marketer': {
        requiredEducation: 'Bachelor\'s degree in Marketing, Communications, or Digital Media',
        keySkills: ['SEO/SEM', 'Social Media Marketing', 'Content Marketing', 'Analytics', 'Email Marketing'],
        careerPath: ['Marketing Coordinator → Digital Marketer → Senior Marketer → Marketing Manager → CMO'],
        industries: ['E-commerce', 'Technology', 'Retail', 'Media', 'Advertising Agencies'],
        timeline: '4 years degree + digital marketing certifications + 2-4 years experience',
        salaryRange: '$50,000 - $120,000+ depending on skills and company size'
      },
      'E-commerce Manager': {
        requiredEducation: 'Bachelor\'s degree in Business, Marketing, or E-commerce',
        keySkills: ['E-commerce Platforms', 'Digital Marketing', 'Supply Chain', 'Customer Experience', 'Analytics'],
        careerPath: ['E-commerce Coordinator → Manager → Senior Manager → Director → VP E-commerce'],
        industries: ['Retail', 'E-commerce', 'Technology', 'Fashion', 'Consumer Goods'],
        timeline: '4 years degree + 2-3 years e-commerce experience',
        salaryRange: '$60,000 - $140,000+ depending on company size and revenue'
      },
      'Nurse': {
        requiredEducation: 'Bachelor of Science in Nursing + Nursing License',
        keySkills: ['Patient Care', 'Medical Knowledge', 'Communication', 'Empathy', 'Critical Thinking'],
        careerPath: ['Staff Nurse → Charge Nurse → Nurse Manager → Director of Nursing → Chief Nursing Officer'],
        industries: ['Hospitals', 'Clinics', 'Home Healthcare', 'Schools', 'Community Health'],
        timeline: '4 years nursing degree + licensing exam',
        salaryRange: '$55,000 - $95,000+ depending on specialization and location'
      },
      'Medical Laboratory Technician': {
        requiredEducation: 'Associate\'s/Bachelor\'s degree in Medical Laboratory Science + Certification',
        keySkills: ['Laboratory Procedures', 'Medical Testing', 'Quality Control', 'Attention to Detail', 'Equipment Operation'],
        careerPath: ['Technician → Senior Technician → Lab Manager → Clinical Laboratory Scientist → Lab Director'],
        industries: ['Hospitals', 'Clinics', 'Research Labs', 'Diagnostic Centers', 'Public Health'],
        timeline: '2-4 years degree + certification + 1-2 years experience',
        salaryRange: '$45,000 - $75,000+ depending on certification and specialization'
      },
      'Physiotherapist': {
        requiredEducation: 'Bachelor\'s/Master\'s degree in Physiotherapy + State License',
        keySkills: ['Physical Therapy', 'Anatomy', 'Patient Assessment', 'Exercise Science', 'Rehabilitation'],
        careerPath: ['Junior Physiotherapist → Physiotherapist → Senior Physiotherapist → Clinical Specialist → Department Head'],
        industries: ['Hospitals', 'Clinics', 'Sports Medicine', 'Rehabilitation Centers', 'Private Practice'],
        timeline: '4-6 years degree + licensing + clinical experience',
        salaryRange: '$60,000 - $90,000+ depending on specialization and setting'
      },
      'Nutritionist': {
        requiredEducation: 'Bachelor\'s degree in Nutrition, Dietetics, or Food Science + Certification',
        keySkills: ['Nutrition Science', 'Meal Planning', 'Health Counseling', 'Food Safety', 'Research'],
        careerPath: ['Junior Nutritionist → Nutritionist → Senior Nutritionist → Clinical Nutritionist → Director'],
        industries: ['Hospitals', 'Clinics', 'Food Industry', 'Public Health', 'Private Practice'],
        timeline: '4 years degree + certification + 1-2 years experience',
        salaryRange: '$50,000 - $80,000+ depending on certification and setting'
      },
      'Photographer': {
        requiredEducation: 'High school diploma + Photography training/certification (optional)',
        keySkills: ['Photography', 'Photo Editing', 'Lighting', 'Composition', 'Business Skills'],
        careerPath: ['Assistant Photographer → Photographer → Senior Photographer → Studio Owner → Creative Director'],
        industries: ['Media', 'Advertising', 'Fashion', 'Events', 'Freelance'],
        timeline: '6 months-2 years training + portfolio development',
        salaryRange: '$30,000 - $80,000+ depending on specialization and client base'
      },
      'Videographer': {
        requiredEducation: 'High school diploma + Video Production training',
        keySkills: ['Video Production', 'Editing', 'Camera Operation', 'Storytelling', 'Audio Engineering'],
        careerPath: ['Assistant Videographer → Videographer → Senior Videographer → Director → Production Manager'],
        industries: ['Media', 'Advertising', 'Events', 'Corporate', 'Film Industry'],
        timeline: '1-2 years training + portfolio building',
        salaryRange: '$35,000 - $85,000+ depending on experience and industry'
      },
      'Fashion Designer': {
        requiredEducation: 'Bachelor\'s degree in Fashion Design or related field',
        keySkills: ['Design', 'Sketching', 'Sewing', 'Trend Analysis', 'Business Management'],
        careerPath: ['Assistant Designer → Designer → Senior Designer → Creative Director → Brand Owner'],
        industries: ['Fashion', 'Retail', 'Entertainment', 'Costume Design', 'Bridal'],
        timeline: '4 years degree + portfolio + 2-5 years experience',
        salaryRange: '$45,000 - $120,000+ depending on brand and experience'
      },
      'Interior Designer': {
        requiredEducation: 'Bachelor\'s degree in Interior Design + License/Certification',
        keySkills: ['Design', 'Space Planning', 'CAD Software', 'Project Management', 'Client Communication'],
        careerPath: ['Junior Designer → Interior Designer → Senior Designer → Project Manager → Firm Partner'],
        industries: ['Interior Design', 'Architecture', 'Real Estate', 'Hospitality', 'Retail'],
        timeline: '4 years degree + licensing + 2-4 years experience',
        salaryRange: '$50,000 - $100,000+ depending on projects and location'
      },
      'Financial Analyst': {
        requiredEducation: 'Bachelor\'s degree in Finance, Economics, or Business + CFA (optional)',
        keySkills: ['Financial Analysis', 'Excel Modeling', 'Market Research', 'Risk Assessment', 'Communication'],
        careerPath: ['Junior Analyst → Financial Analyst → Senior Analyst → Manager → Director'],
        industries: ['Finance', 'Banking', 'Investment', 'Corporate', 'Consulting'],
        timeline: '4 years degree + CFA certification + 2-4 years experience',
        salaryRange: '$65,000 - $130,000+ depending on certification and industry'
      },
      'Investment Banker': {
        requiredEducation: 'Bachelor\'s degree in Finance, Economics, or Business + MBA (optional)',
        keySkills: ['Financial Modeling', 'M&A Analysis', 'Valuation', 'Client Relations', 'Market Knowledge'],
        careerPath: ['Analyst → Associate → Vice President → Director → Managing Director'],
        industries: ['Investment Banking', 'Private Equity', 'Venture Capital', 'Corporate Finance'],
        timeline: '4 years degree + MBA + 5-7 years experience for senior roles',
        salaryRange: '$100,000 - $500,000+ depending on firm and performance'
      },
      'Insurance Agent': {
        requiredEducation: 'High school diploma + Insurance License',
        keySkills: ['Sales', 'Insurance Products', 'Customer Service', 'Risk Assessment', 'Communication'],
        careerPath: ['Agent → Senior Agent → Team Leader → Agency Manager → Regional Manager'],
        industries: ['Insurance', 'Financial Services', 'Real Estate', 'Business Insurance'],
        timeline: 'License training + 1-2 years experience',
        salaryRange: '$40,000 - $120,000+ depending on commissions and client base'
      },
      'Real Estate Agent': {
        requiredEducation: 'High school diploma + Real Estate License',
        keySkills: ['Sales', 'Property Knowledge', 'Negotiation', 'Marketing', 'Customer Service'],
        careerPath: ['Agent → Senior Agent → Broker → Agency Owner → Regional Director'],
        industries: ['Real Estate', 'Property Management', 'Commercial Real Estate', 'Development'],
        timeline: 'License training + 2-3 years experience',
        salaryRange: '$35,000 - $150,000+ depending on commissions and market'
      },
      'Social Worker': {
        requiredEducation: 'Bachelor\'s/Master\'s degree in Social Work + State License',
        keySkills: ['Counseling', 'Case Management', 'Advocacy', 'Crisis Intervention', 'Resource Coordination'],
        careerPath: ['Case Worker → Social Worker → Senior Social Worker → Supervisor → Program Director'],
        industries: ['Healthcare', 'Government', 'Non-profits', 'Schools', 'Community Organizations'],
        timeline: '4-6 years degree + licensing + 2-4 years experience',
        salaryRange: '$45,000 - $75,000+ depending on specialization and setting'
      },
      'Librarian': {
        requiredEducation: 'Master\'s degree in Library Science (MLS)',
        keySkills: ['Information Management', 'Cataloging', 'Research', 'Technology', 'Customer Service'],
        careerPath: ['Library Assistant → Librarian → Senior Librarian → Department Head → Library Director'],
        industries: ['Education', 'Public Libraries', 'Corporate Libraries', 'Research', 'Government'],
        timeline: '4 years bachelor\'s + 2 years master\'s + 1-3 years experience',
        salaryRange: '$45,000 - $80,000+ depending on institution and location'
      },
      'Career Counselor': {
        requiredEducation: 'Master\'s degree in Counseling, Psychology, or Education',
        keySkills: ['Counseling', 'Assessment', 'Career Planning', 'Communication', 'Resource Management'],
        careerPath: ['Counselor → Senior Counselor → Program Coordinator → Director → Consultant'],
        industries: ['Education', 'Government', 'Non-profits', 'Corporate', 'Private Practice'],
        timeline: '6 years education + certification + 2-4 years experience',
        salaryRange: '$50,000 - $85,000+ depending on setting and experience'
      },
      'HR Manager': {
        requiredEducation: 'Bachelor\'s degree in Human Resources, Business, or Psychology + HR Certifications',
        keySkills: ['Recruitment', 'Employee Relations', 'Training', 'Compensation', 'Compliance'],
        careerPath: ['HR Coordinator → HR Specialist → HR Manager → Senior Manager → HR Director'],
        industries: ['Corporate', 'Healthcare', 'Technology', 'Manufacturing', 'Government'],
        timeline: '4 years degree + HR certifications + 3-5 years experience',
        salaryRange: '$60,000 - $130,000+ depending on company size and industry'
      },
      'Electrician': {
        requiredEducation: 'High school diploma + Electrical Apprenticeship + License',
        keySkills: ['Electrical Systems', 'Safety Protocols', 'Troubleshooting', 'Reading Blueprints', 'Customer Service'],
        careerPath: ['Apprentice → Journeyman → Master Electrician → Contractor → Business Owner'],
        industries: ['Construction', 'Maintenance', 'Manufacturing', 'Utilities', 'Residential'],
        timeline: '4-5 years apprenticeship + licensing',
        salaryRange: '$45,000 - $85,000+ depending on specialization and location'
      },
      'Plumber': {
        requiredEducation: 'High school diploma + Plumbing Apprenticeship + License',
        keySkills: ['Plumbing Systems', 'Installation', 'Repair', 'Safety', 'Customer Service'],
        careerPath: ['Apprentice → Journeyman → Master Plumber → Contractor → Business Owner'],
        industries: ['Construction', 'Maintenance', 'Residential', 'Commercial', 'Industrial'],
        timeline: '4-5 years apprenticeship + licensing',
        salaryRange: '$40,000 - $80,000+ depending on specialization and business'
      },
      'Mechanic': {
        requiredEducation: 'High school diploma + Technical Training + Certification',
        keySkills: ['Automotive Repair', 'Diagnostics', 'Mechanical Skills', 'Customer Service', 'Technology'],
        careerPath: ['Apprentice Mechanic → Mechanic → Senior Mechanic → Shop Manager → Owner'],
        industries: ['Automotive', 'Transportation', 'Equipment Repair', 'Dealerships', 'Independent Shops'],
        timeline: '1-2 years technical training + 2-4 years experience',
        salaryRange: '$35,000 - $75,000+ depending on specialization and location'
      },
      'Construction Manager': {
        requiredEducation: 'Bachelor\'s degree in Construction Management + Experience',
        keySkills: ['Project Management', 'Construction Knowledge', 'Budgeting', 'Safety', 'Leadership'],
        careerPath: ['Assistant Manager → Construction Manager → Senior Manager → Project Director → VP Operations'],
        industries: ['Construction', 'Real Estate Development', 'Infrastructure', 'Government', 'Commercial'],
        timeline: '4 years degree + 5-8 years experience',
        salaryRange: '$70,000 - $150,000+ depending on project size and location'
      },
      'Sports Coach': {
        requiredEducation: 'Bachelor\'s degree in Physical Education, Sports Science, or related field + Coaching Certifications',
        keySkills: ['Sports Knowledge', 'Training Techniques', 'Leadership', 'Communication', 'Strategy'],
        careerPath: ['Assistant Coach → Coach → Head Coach → Athletic Director → Sports Director'],
        industries: ['Sports', 'Education', 'Recreation', 'Fitness', 'Professional Sports'],
        timeline: '4 years degree + coaching certifications + 3-5 years experience',
        salaryRange: '$35,000 - $90,000+ depending on sport and level'
      },
      'Fitness Trainer': {
        requiredEducation: 'High school diploma + Fitness Certification',
        keySkills: ['Exercise Science', 'Nutrition', 'Motivation', 'Safety', 'Business Skills'],
        careerPath: ['Trainer → Senior Trainer → Fitness Manager → Studio Owner → Regional Manager'],
        industries: ['Fitness', 'Health Clubs', 'Corporate Wellness', 'Personal Training', 'Recreation'],
        timeline: '3-6 months certification + 1-3 years experience',
        salaryRange: '$30,000 - $70,000+ depending on certification and client base'
      },
      'Sports Medicine Doctor': {
        requiredEducation: 'Bachelor\'s degree + Medical School (MD) + Sports Medicine Residency + Board Certification',
        keySkills: ['Sports Medicine', 'Orthopedics', 'Rehabilitation', 'Injury Prevention', 'Performance Enhancement'],
        careerPath: ['Resident → Sports Medicine Physician → Team Doctor → Medical Director → Head Physician'],
        industries: ['Sports Medicine', 'Healthcare', 'Professional Sports', 'Universities', 'Rehabilitation'],
        timeline: '8-10 years education + 3-4 years residency + fellowship',
        salaryRange: '$200,000 - $500,000+ depending on practice and sports team'
      }
    };

    return analysisData[dreamJob] || {
      requiredEducation: 'Education requirements vary by field and employer',
      keySkills: ['Field-specific skills', 'Communication', 'Problem Solving', 'Continuous Learning'],
      careerPath: 'Career progression depends on industry and individual performance',
      industries: 'Various industries depending on specialization',
      timeline: 'Varies by field and career path',
      salaryRange: 'Salary ranges vary significantly by industry and location'
    };
  };

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateDreamPathRecommendations = async () => {
    setLoading(true);
    setShowRecommendations(true);
    
    try {
      // Create comprehensive student profile for backend
      const studentProfile = {
        ...studentData,
        detectedTraits: detectedTraits,
      };

      console.log('Sending comprehensive profile to backend:', {
        dreamJob: studentProfile.dreamJob,
        personalityDescription: studentProfile.personalityDescription,
        detectedTraits: studentProfile.detectedTraits,
        locationPreference: studentProfile.locationPreference,
        travelTolerance: studentProfile.travelTolerance,
        workEnvironment: studentProfile.workEnvironment,
        socialInteraction: studentProfile.socialInteraction,
        zScore: studentProfile.zScore,
        district: studentProfile.district
      });

      // Call backend AI model for recommendations
      const backendRecommendations = await apiService.getRecommendations(studentProfile);
      
      console.log('Backend AI model recommendations:', backendRecommendations);
      
      // Use backend recommendations directly (AI model processes all data)
      setRecommendations(backendRecommendations.recommendations || []);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      Alert.alert('Error', 'Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateComprehensiveRecommendations = (studentProfile, apiRecommendations) => {
    const dreamJobAnalysis = getBackwardAnalysis(studentProfile.dreamJob);
    
    // Calculate personality compatibility scores
    const personalityScores = calculatePersonalityCompatibility(studentProfile.detectedTraits);
    
    // Calculate lifestyle compatibility scores
    const lifestyleScores = calculateLifestyleCompatibility(studentProfile);
    
    // Calculate academic feasibility
    const academicFeasibility = calculateAcademicFeasibility(studentProfile);
    
    // Generate degree recommendations with comprehensive scoring
    const degreeOptions = [
      {
        degree: dreamJobAnalysis.requiredEducation,
        type: 'primary',
        baseScore: 0.9,
        personalityWeight: 0.3,
        lifestyleWeight: 0.2,
        academicWeight: 0.5
      },
      {
        degree: 'Business Administration',
        type: 'alternative',
        baseScore: 0.7,
        personalityWeight: 0.4,
        lifestyleWeight: 0.3,
        academicWeight: 0.3
      },
      {
        degree: 'Information Technology',
        type: 'alternative',
        baseScore: 0.7,
        personalityWeight: 0.4,
        lifestyleWeight: 0.3,
        academicWeight: 0.3
      },
      {
        degree: 'Engineering',
        type: 'alternative',
        baseScore: 0.6,
        personalityWeight: 0.4,
        lifestyleWeight: 0.3,
        academicWeight: 0.3
      }
    ];

    return degreeOptions.map(option => {
      const personalityMatch = calculatePersonalityMatch(option.degree, personalityScores);
      const lifestyleMatch = calculateLifestyleMatch(option.degree, lifestyleScores);
      const academicMatch = calculateAcademicMatch(option.degree, academicFeasibility);
      
      const finalScore = (
        option.baseScore * option.academicWeight +
        personalityMatch * option.personalityWeight +
        lifestyleMatch * option.lifestyleWeight +
        academicMatch * option.academicWeight
      );

      return {
        degree: option.degree,
        type: option.type,
        confidence: Math.round(finalScore * 100) / 100,
        explanation: generateExplanation(option, studentProfile, personalityMatch, lifestyleMatch, academicMatch),
        keySkills: dreamJobAnalysis.keySkills,
        careerPath: dreamJobAnalysis.careerPath,
        timeline: dreamJobAnalysis.timeline,
        salaryRange: dreamJobAnalysis.salaryRange,
        personalityMatch: `${Math.round(personalityMatch * 100)}%`,
        lifestyleMatch: `${Math.round(lifestyleMatch * 100)}%`,
        academicMatch: `${Math.round(academicMatch * 100)}%`,
        comprehensiveScore: Math.round(finalScore * 100) / 100,
        detectedTraits: studentProfile.detectedTraits,
        lifestyleFactors: {
          location: studentProfile.locationPreference,
          travel: studentProfile.travelTolerance,
          workEnvironment: studentProfile.workEnvironment,
          socialInteraction: studentProfile.socialInteraction
        }
      };
    }).sort((a, b) => b.comprehensiveScore - a.comprehensiveScore);
  };

  const calculatePersonalityCompatibility = (detectedTraits) => {
    const scores = {
      leadership: 0.5,
      creativity: 0.5,
      analytical: 0.5,
      teamwork: 0.5,
      riskTaking: 0.5,
      communication: 0.5,
      adaptability: 0.5,
      empathy: 0.5
    };

    detectedTraits.forEach(trait => {
      const traitLower = trait.toLowerCase();
      if (traitLower.includes('leader')) scores.leadership = 1.0;
      if (traitLower.includes('creative')) scores.creativity = 1.0;
      if (traitLower.includes('analytical')) scores.analytical = 1.0;
      if (traitLower.includes('team')) scores.teamwork = 1.0;
      if (traitLower.includes('risk')) scores.riskTaking = 1.0;
      if (traitLower.includes('communicat')) scores.communication = 1.0;
      if (traitLower.includes('adapt')) scores.adaptability = 1.0;
      if (traitLower.includes('empath')) scores.empathy = 1.0;
    });

    return scores;
  };

  const calculateLifestyleCompatibility = (studentProfile) => {
    return {
      location: studentProfile.locationPreference ? 0.8 : 0.5,
      travel: studentProfile.travelTolerance ? 0.8 : 0.5,
      workEnvironment: studentProfile.workEnvironment ? 0.8 : 0.5,
      socialInteraction: studentProfile.socialInteraction ? 0.8 : 0.5
    };
  };

  const calculateAcademicFeasibility = (studentProfile) => {
    const zScore = parseFloat(studentProfile.zScore) || 0;
    const district = studentProfile.district || '';
    
    return {
      zScore: Math.min(zScore / 3.0, 1.0),
      district: district ? 0.8 : 0.5,
      overall: (Math.min(zScore / 3.0, 1.0) + (district ? 0.8 : 0.5)) / 2
    };
  };

  const calculatePersonalityMatch = (degree, personalityScores) => {
    const degreeRequirements = {
      'Business Administration': { leadership: 0.8, creativity: 0.6, analytical: 0.5, teamwork: 0.7 },
      'Information Technology': { analytical: 0.9, creativity: 0.7, teamwork: 0.6, riskTaking: 0.5 },
      'Engineering': { analytical: 0.9, teamwork: 0.7, riskTaking: 0.6, creativity: 0.4 }
    };

    const requirements = degreeRequirements[degree] || { leadership: 0.5, creativity: 0.5, analytical: 0.5, teamwork: 0.5 };
    
    let match = 0;
    let count = 0;
    Object.keys(requirements).forEach(key => {
      if (personalityScores[key] !== undefined) {
        match += Math.min(personalityScores[key], requirements[key]);
        count++;
      }
    });
    
    return count > 0 ? match / count : 0.5;
  };

  const calculateLifestyleMatch = (degree, lifestyleScores) => {
    // Different degrees have different lifestyle requirements
    const degreeLifestyleNeeds = {
      'Business Administration': { location: 0.7, travel: 0.6, workEnvironment: 0.8, socialInteraction: 0.9 },
      'Information Technology': { location: 0.6, travel: 0.4, workEnvironment: 0.9, socialInteraction: 0.5 },
      'Engineering': { location: 0.6, travel: 0.5, workEnvironment: 0.8, socialInteraction: 0.6 }
    };

    const needs = degreeLifestyleNeeds[degree] || { location: 0.5, travel: 0.5, workEnvironment: 0.5, socialInteraction: 0.5 };
    
    let match = 0;
    let count = 0;
    Object.keys(needs).forEach(key => {
      if (lifestyleScores[key] !== undefined) {
        match += Math.min(lifestyleScores[key], needs[key]);
        count++;
      }
    });
    
    return count > 0 ? match / count : 0.5;
  };

  const calculateAcademicMatch = (degree, academicFeasibility) => {
    return academicFeasibility.overall;
  };

  const generateExplanation = (option, studentProfile, personalityMatch, lifestyleMatch, academicMatch) => {
    const traits = studentProfile.detectedTraits.slice(0, 3).join(', ');
    const personalityDesc = personalityMatch > 0.7 ? 'excellent personality fit' : 
                          personalityMatch > 0.5 ? 'good personality fit' : 'moderate personality fit';
    const lifestyleDesc = lifestyleMatch > 0.7 ? 'excellent lifestyle compatibility' : 
                        lifestyleMatch > 0.5 ? 'good lifestyle compatibility' : 'moderate lifestyle compatibility';
    const academicDesc = academicMatch > 0.7 ? 'strong academic profile' : 
                       academicMatch > 0.5 ? 'good academic profile' : 'moderate academic profile';

    return `Based on your dream job as ${studentProfile.dreamJob}, ${option.degree} offers ${personalityDesc} with ${traits} traits, ${lifestyleDesc} for your preferences, and ${academicDesc} for your academic background.`;
  };

  const handleSubmit = async () => {
    if (!studentData.dreamJob) {
      Alert.alert('Missing Information', 'Please select your dream job for analysis.');
      return;
    }

    // Generate recommendations immediately when clicking Get Recommendations
    Alert.alert(
      'Analyzing Your Dream Job',
      'Our AI is performing backward analysis to show you the complete career pathway...',
      [
        {
          text: 'OK',
          onPress: async () => {
            // Generate recommendations within this component
            await generateDreamPathRecommendations();
          }
        }
      ]
    );
  };

  const renderStep1 = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="title" style={styles.stepTitle}>Dream Job Analysis</ThemedText>
      <ThemedText style={styles.subtitle}>Select your dream job for backward career analysis and pathway insights</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Your Dream Job *</ThemedText>
        
        {/* Category Selection */}
        <ScrollView horizontal style={styles.categoryScroll} showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'All' && styles.categoryButtonSelected]}
            onPress={() => setSelectedCategory('All')}
          >
            <Text style={[styles.categoryButtonText, selectedCategory === 'All' && styles.categoryButtonTextSelected]}>
              🎯 All Jobs
            </Text>
          </TouchableOpacity>
          {dreamJobCategories.map(category => (
            <TouchableOpacity
              key={category.name}
              style={[styles.categoryButton, selectedCategory === category.name && styles.categoryButtonSelected]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Text style={[styles.categoryButtonText, selectedCategory === category.name && styles.categoryButtonTextSelected]}>
                {category.icon} {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dream Jobs Grid */}
        <View style={styles.dreamJobGrid}>
          {(selectedCategory === 'All' 
            ? dreamJobs 
            : dreamJobCategories.find(cat => cat.name === selectedCategory)?.jobs || []
          ).map(job => (
            <TouchableOpacity
              key={job.name}
              style={[styles.dreamJobCard, studentData.dreamJob === job.name && styles.dreamJobCardSelected]}
              onPress={() => updateStudentData('dreamJob', job.name)}
            >
              <View style={styles.dreamJobIconContainer}>
                <Text style={styles.dreamJobIcon}>{job.icon}</Text>
              </View>
              <Text style={[styles.dreamJobName, studentData.dreamJob === job.name && styles.dreamJobNameSelected]}>{job.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {studentData.dreamJob && (
        <View style={styles.analysisCard}>
          <ThemedText style={styles.analysisTitle}>Backward Analysis: {studentData.dreamJob}</ThemedText>
          
          <View style={styles.analysisSection}>
            <ThemedText style={styles.analysisSectionTitle}>🎓 Required Education</ThemedText>
            <ThemedText style={styles.analysisContent}>{getBackwardAnalysis(studentData.dreamJob).requiredEducation}</ThemedText>
          </View>

          <View style={styles.analysisSection}>
            <ThemedText style={styles.analysisSectionTitle}>🔑 Key Skills to Develop</ThemedText>
            <View style={styles.skillsList}>
              {getBackwardAnalysis(studentData.dreamJob).keySkills.map((skill: string, index: number) => (
                <Text key={index} style={styles.skillItem}>• {skill}</Text>
              ))}
            </View>
          </View>

          <View style={styles.analysisSection}>
            <ThemedText style={styles.analysisSectionTitle}>📈 Career Progression Path</ThemedText>
            <ThemedText style={styles.analysisContent}>{getBackwardAnalysis(studentData.dreamJob).careerPath}</ThemedText>
          </View>

          <View style={styles.analysisSection}>
            <ThemedText style={styles.analysisSectionTitle}>🏢 Industries & Opportunities</ThemedText>
            <View style={styles.industriesList}>
              {getBackwardAnalysis(studentData.dreamJob).industries.map((industry: string, index: number) => (
                <Text key={index} style={styles.industryItem}>• {industry}</Text>
              ))}
            </View>
          </View>

          <View style={styles.analysisSection}>
            <ThemedText style={styles.analysisSectionTitle}>⏰ Timeline to Success</ThemedText>
            <ThemedText style={styles.analysisContent}>{getBackwardAnalysis(studentData.dreamJob).timeline}</ThemedText>
          </View>

          <View style={styles.analysisSection}>
            <ThemedText style={styles.analysisSectionTitle}>💰 Expected Salary Range</ThemedText>
            <ThemedText style={styles.analysisContent}>{getBackwardAnalysis(studentData.dreamJob).salaryRange}</ThemedText>
          </View>
        </View>
      )}

      {!studentData.dreamJob && (
        <View style={styles.infoCard}>
          <ThemedText style={styles.infoTitle}>What is Dream Job Analysis?</ThemedText>
          <ThemedText style={styles.infoText}>
            Our AI analyzes your dream job to provide backward insights about:
          </ThemedText>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Required education and qualifications</Text>
            <Text style={styles.infoItem}>• Career progression pathways</Text>
            <Text style={styles.infoItem}>• Industry trends and opportunities</Text>
            <Text style={styles.infoItem}>• Skills development roadmap</Text>
          </View>
        </View>
      )}
    </ThemedView>
  );

  const renderStep2 = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="title" style={styles.stepTitle}>Step 2: Personality Assessment</ThemedText>
      <ThemedText style={styles.subtitle}>Tell us about yourself naturally - no scores needed!</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>🧠 Describe Your Personality & Work Style</ThemedText>
        
        <View style={styles.personalityPrompts}>
          <ThemedText style={styles.promptTitle}>💡 Helpful prompts:</ThemedText>
          <Text style={styles.promptText}>• How do you approach solving problems?</Text>
          <Text style={styles.promptText}>• What role do you usually take in group projects?</Text>
          <Text style={styles.promptText}>• How do you handle new challenges or changes?</Text>
          <Text style={styles.promptText}>• What activities or tasks energize you most?</Text>
          <Text style={styles.promptText}>• How do you prefer to work with others?</Text>
        </View>
        
        <TextInput
          style={[styles.input, styles.personalityInput]}
          multiline
          numberOfLines={6}
          value={studentData.personalityDescription || ''}
          onChangeText={handlePersonalityTextChange}
          placeholder="I enjoy leading team projects and finding creative solutions to problems. I prefer working with data and analysis to make decisions, but I'm also comfortable taking calculated risks when needed. I like organizing group activities and helping others achieve their goals..."
        />
        
        <View style={styles.personalityExamples}>
          <ThemedText style={styles.exampleTitle}>📝 Example descriptions:</ThemedText>
          <View style={styles.exampleCard}>
            <Text style={styles.exampleText}>
              "I love analyzing data and finding patterns to solve complex problems. I prefer working independently but enjoy collaborating with others on challenging projects."
            </Text>
          </View>
          <View style={styles.exampleCard}>
            <Text style={styles.exampleText}>
              "I'm naturally creative and enjoy coming up with innovative solutions. I like leading teams and organizing projects from start to finish."
            </Text>
          </View>
        </View>
      </View>
      
      {studentData.personalityDescription && (
        <View style={styles.analysisCard}>
          <ThemedText style={styles.analysisTitle}>🎯 Your Personalized Personality Analysis</ThemedText>
          <ThemedText style={styles.analysisText}>
            Based on your description, we've detected these personality traits:
          </ThemedText>
          <View style={styles.traitIndicators}>
            <ThemedText style={styles.traitTitle}>Detected Traits:</ThemedText>
            {detectedTraits.map((trait, index) => (
              <Text key={index} style={styles.traitText}>• {trait}</Text>
            ))}
          </View>
          {(detectedTraits.length === 1 && detectedTraits[0] === '🎭 Unique Personality') && (
            <View style={styles.uniquePersonalityTip}>
              <Text style={styles.tipText}>
                💡 Tip: Try mentioning activities you enjoy, how you work with others, or what energizes you most!
              </Text>
            </View>
          )}
          
          {(detectedTraits.length === 1 && detectedTraits[0] === '📝 Tell us more about yourself') && (
            <View style={styles.uniquePersonalityTip}>
              <Text style={styles.tipText}>
                📝 Please write at least 2-3 sentences about your work style, interests, and how you interact with others.
              </Text>
            </View>
          )}
          
          {(detectedTraits.length === 1 && detectedTraits[0] === '🤝 Try describing your work style and interests') && (
            <View style={styles.uniquePersonalityTip}>
              <Text style={styles.tipText}>
                🤝 Instead of "hi", try: "I enjoy working with teams and solving problems creatively. I'm curious about new technologies..."
              </Text>
            </View>
          )}
        </View>
      )}
    </ThemedView>
  );

  const renderStep3 = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="title" style={styles.stepTitle}>Step 3: Lifestyle Preferences</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Location Preference</ThemedText>
        <TextInput
          style={styles.input}
          value={studentData.locationPreference}
          onChangeText={(value) => updateStudentData('locationPreference', value)}
          placeholder="e.g., Colombo, Kandy, Anywhere"
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Travel Tolerance</ThemedText>
        <ScrollView horizontal style={styles.optionScroll}>
          {['Less than 30 minutes', '30-60 minutes', '1-2 hours', 'More than 2 hours', 'Willing to relocate'].map(tolerance => (
            <TouchableOpacity
              key={tolerance}
              style={[styles.optionButton, studentData.travelTolerance === tolerance && styles.optionButtonSelected]}
              onPress={() => updateStudentData('travelTolerance', tolerance)}
            >
              <Text style={[styles.optionText, studentData.travelTolerance === tolerance && styles.optionTextSelected]}>{tolerance}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Work Environment</ThemedText>
        <ScrollView horizontal style={styles.optionScroll}>
          {['Office', 'Remote', 'Hybrid', 'Field Work', 'Laboratory', 'Hospital', 'School', 'Factory', 'Outdoor', 'Studio'].map(env => (
            <TouchableOpacity
              key={env}
              style={[styles.optionButton, studentData.workEnvironment === env && styles.optionButtonSelected]}
              onPress={() => updateStudentData('workEnvironment', env)}
            >
              <Text style={[styles.optionText, studentData.workEnvironment === env && styles.optionTextSelected]}>{env}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Social Interaction</ThemedText>
        <ScrollView horizontal style={styles.optionScroll}>
          {['Team-oriented', 'Individual', 'Mixed', 'Leadership', 'Support'].map(interaction => (
            <TouchableOpacity
              key={interaction}
              style={[styles.optionButton, studentData.socialInteraction === interaction && styles.optionButtonSelected]}
              onPress={() => updateStudentData('socialInteraction', interaction)}
            >
              <Text style={[styles.optionText, studentData.socialInteraction === interaction && styles.optionTextSelected]}>{interaction}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Family Attachment (1-10)</ThemedText>
        <View style={styles.sliderContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <TouchableOpacity
              key={num}
              style={[styles.sliderButton, studentData.familyAttachment === num && styles.sliderButtonActive]}
              onPress={() => updateStudentData('familyAttachment', num)}
            >
              <Text style={styles.sliderButtonText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Stress Tolerance (1-10)</ThemedText>
        <View style={styles.sliderContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <TouchableOpacity
              key={num}
              style={[styles.sliderButton, studentData.stressTolerance === num && styles.sliderButtonActive]}
              onPress={() => updateStudentData('stressTolerance', num)}
            >
              <Text style={styles.sliderButtonText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ThemedView>
  );

  const renderRecommendations = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="title" style={styles.stepTitle}>🎯 Your Dream Path Recommendations</ThemedText>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#010066" />
          <ThemedText style={styles.loadingText}>Analyzing your dream job...</ThemedText>
        </View>
      ) : (
        <View style={styles.recommendationsContainer}>
          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationCard}>
              <ThemedText style={styles.recommendationTitle}>{rec.degree}</ThemedText>
              <ThemedText style={styles.recommendationConfidence}>Confidence: {Math.round(rec.confidence * 100)}%</ThemedText>
              <ThemedText style={styles.recommendationExplanation}>{rec.explanation}</ThemedText>
              
              <View style={styles.recommendationDetails}>
                <ThemedText style={styles.detailTitle}>Key Skills:</ThemedText>
                <Text style={styles.detailContent}>
                  {rec.keySkills ? (Array.isArray(rec.keySkills) ? rec.keySkills.join(', ') : rec.keySkills) : 'Technical skills, problem solving, communication'}
                </Text>
                
                <ThemedText style={styles.detailTitle}>Career Path:</ThemedText>
                <Text style={styles.detailContent}>{rec.careerPath || 'Career progression varies by specialization'}</Text>
                
                <ThemedText style={styles.detailTitle}>Timeline:</ThemedText>
                <Text style={styles.detailContent}>{rec.timeline || '4-6 years depending on program'}</Text>
                
                <ThemedText style={styles.detailTitle}>Salary Range:</ThemedText>
                <Text style={styles.detailContent}>{rec.salaryRange || 'Varies by industry and location'}</Text>
                
                {rec.university && (
                  <>
                    <ThemedText style={styles.detailTitle}>University:</ThemedText>
                    <Text style={styles.detailContent}>{rec.university} ({rec.universityType})</Text>
                  </>
                )}
                
                {rec.admissionProbability && (
                  <>
                    <ThemedText style={styles.detailTitle}>Admission Probability:</ThemedText>
                    <Text style={styles.detailContent}>{rec.admissionProbability}</Text>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.title}>Future Dream Degree Advisor</ThemedText>
        <ThemedText style={styles.subtitle}>
          Let us analyze your profile to recommend the perfect degree pathway
        </ThemedText>

        {showRecommendations && (
          <View>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setShowRecommendations(false)}
            >
              <Text style={styles.secondaryButtonText}>← Back to Dream Path</Text>
            </TouchableOpacity>
          </View>
        )}

        {showRecommendations ? (
          renderRecommendations()
        ) : (
          renderCurrentStep()
        )}

        {!showRecommendations && (
          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setCurrentStep(currentStep - 1)}
              >
                <Text style={styles.secondaryButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < 3 ? (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => setCurrentStep(currentStep + 1)}
              >
                <Text style={styles.primaryButtonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.primaryButtonText}>Get Recommendations</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!showRecommendations && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Step {currentStep} of 3</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Province Selection Modal */}
      <Modal
        visible={showProvinceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProvinceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Select Province</ThemedText>
            <ScrollView style={styles.modalScrollView}>
              {provinces.map((province) => (
                <TouchableOpacity
                  key={province.name}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedProvince(province.name);
                    setStudentData(prev => ({ ...prev, district: '' }));
                    setShowProvinceModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{province.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowProvinceModal(false)}>
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* District Selection Modal */}
      <Modal
        visible={showDistrictModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Select District</ThemedText>
            <ScrollView style={styles.modalScrollView}>
              {selectedProvince && provinces
                .find(p => p.name === selectedProvince)
                ?.districts.map((district) => (
                  <TouchableOpacity
                    key={district}
                    style={styles.modalItem}
                    onPress={() => {
                      updateStudentData('district', district);
                      setShowDistrictModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{district}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowDistrictModal(false)}>
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#010066',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
    color: '#010066',
    fontSize: 14,
  },
  stepContainer: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#010066',
    shadowColor: '#010066',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  stepTitle: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#010066',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    marginBottom: 10,
    fontWeight: '700',
    color: '#010066',
    fontSize: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#010066',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionScroll: {
    maxHeight: 60,
  },
  dreamJobGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  dreamJobCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dreamJobCardSelected: {
    borderColor: '#F7931E',
    backgroundColor: '#FFF8F0',
    shadowColor: '#F7931E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  dreamJobIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F7931E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dreamJobIcon: {
    fontSize: 24,
  },
  dreamJobName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#010066',
    textAlign: 'center',
  },
  dreamJobNameSelected: {
    color: '#010066',
    fontWeight: '700',
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: 15,
  },
  categoryButton: {
    backgroundColor: '#F8F9FA',
    borderColor: '#DEE2E6',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
    minWidth: 100,
  },
  categoryButtonSelected: {
    backgroundColor: '#F7931E',
    borderColor: '#F7931E',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  personalityPrompts: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 12,
    color: '#495057',
    marginBottom: 4,
    marginLeft: 10,
  },
  personalityInput: {
    height: 120,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  personalityExamples: {
    marginTop: 15,
  },
  exampleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#010066',
    marginBottom: 10,
  },
  exampleCard: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: '#F7931E',
    padding: 12,
    marginBottom: 8,
    borderRadius: 5,
  },
  exampleText: {
    fontSize: 11,
    color: '#495057',
    fontStyle: 'italic',
  },
  analysisText: {
    fontSize: 12,
    color: '#495057',
    marginBottom: 10,
  },
  traitIndicators: {
    marginTop: 10,
  },
  traitTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#010066',
    marginBottom: 8,
  },
  traitText: {
    fontSize: 11,
    color: '#495057',
    marginBottom: 4,
    marginLeft: 10,
  },
  uniquePersonalityTip: {
    backgroundColor: '#FFF8DC',
    borderLeftWidth: 3,
    borderLeftColor: '#F7931E',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  tipText: {
    fontSize: 11,
    color: '#8B4513',
    fontStyle: 'italic',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 10,
    padding: 15,
  },
  dropdownButtonSelected: {
    borderColor: '#F7931E',
    backgroundColor: '#FFF8F0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#010066',
    flex: 1,
  },
  dropdownTextSelected: {
    color: '#010066',
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#2563EB',
  },
  optionButton: {
    backgroundColor: '#010066',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#010066',
    shadowColor: '#010066',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  optionButtonSelected: {
    backgroundColor: '#F7931E',
    borderColor: '#F7931E',
    shadowColor: '#F7931E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  optionText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  sliderButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sliderButtonActive: {
    backgroundColor: '#F7931E',
    borderColor: '#F7931E',
  },
  sliderButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#010066',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 25,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 12,
    minWidth: 140,
    shadowColor: '#001f3f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#010066',
  },
  secondaryButton: {
    backgroundColor: '#666666',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  progressContainer: {
    marginTop: 25,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
    color: '#010066',
    fontSize: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F7931E',
  },
  mcqContainer: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#010066',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#010066',
    shadowColor: '#010066',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  mcqQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  mcqOptions: {
    gap: 12,
  },
  mcqOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  mcqOptionSelected: {
    backgroundColor: '#F7931E',
    borderColor: '#F7931E',
  },
  mcqRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  mcqRadioSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  mcqOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010066',
    flex: 1,
  },
  mcqOptionTextSelected: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#010066',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#FFFFFF',
  },
  modalItemText: {
    fontSize: 16,
    color: '#010066',
  },
  modalCloseButton: {
    backgroundColor: '#010066',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#010066',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#010066',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#010066',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#010066',
    opacity: 0.8,
    marginBottom: 15,
    lineHeight: 20,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#010066',
    opacity: 0.7,
    paddingLeft: 5,
  },
  infoButton: {
    backgroundColor: '#F7931E',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  infoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  analysisCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F7931E',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#F7931E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#010066',
    marginBottom: 20,
    textAlign: 'center',
  },
  analysisSection: {
    marginBottom: 20,
  },
  analysisSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010066',
    marginBottom: 8,
  },
  analysisContent: {
    fontSize: 14,
    color: '#010066',
    opacity: 0.8,
    lineHeight: 20,
  },
  skillsList: {
    gap: 6,
  },
  skillItem: {
    fontSize: 14,
    color: '#010066',
    opacity: 0.7,
    paddingLeft: 5,
  },
  industriesList: {
    gap: 6,
  },
  industryItem: {
    fontSize: 14,
    color: '#010066',
    opacity: 0.7,
    paddingLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#010066',
    marginTop: 20,
    textAlign: 'center',
  },
  recommendationsContainer: {
    gap: 20,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F7931E',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#F7931E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#010066',
    marginBottom: 10,
  },
  recommendationConfidence: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F7931E',
    marginBottom: 15,
  },
  recommendationExplanation: {
    fontSize: 14,
    color: '#010066',
    opacity: 0.8,
    marginBottom: 20,
    lineHeight: 20,
  },
  recommendationDetails: {
    gap: 15,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010066',
    marginBottom: 5,
  },
  detailContent: {
    fontSize: 14,
    color: '#010066',
    opacity: 0.7,
    lineHeight: 20,
  },
});

export default FutureDreamAdvisor;
