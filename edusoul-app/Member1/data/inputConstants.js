// Background image - education/university themed
export const BG_IMAGE_URL = 'https://i.pinimg.com/1200x/d7/76/5d/d7765d7445ccfecafbd6546e8e36b813.jpg';

// Real Sri Lankan G.C.E. A/L streams with their compulsory subjects
export const STREAM_SUBJECTS = {
  'Physical Science': {
    icon: '⚛️',
    color: 'from-blue-500 to-indigo-500',
    degrees: 'Engineering, Computer Science, IT, Physical Science, Mathematics, Quantity Surveying, Surveying Science, Town Planning',
    description: 'Foundation in mathematics, physics, and chemistry for engineering and physical science careers',
    hasSubjectBuckets: true,
    subjectBuckets: {
      'Core Subjects': {
        icon: '📚',
        subjects: ['Combined Mathematics', 'Physics', 'Chemistry'],
        maxFromBucket: 3,
        note: 'Select all 3 core subjects'
      },
      'Advanced Mathematics': {
        icon: '🔢',
        subjects: ['Applied Mathematics', 'Further Mathematics', 'Statistics'],
        maxFromBucket: 1,
        note: 'Optional advanced math'
      },
      'Technology': {
        icon: '💻',
        subjects: ['Information & Communication Technology', 'Electronics', 'Computer Science'],
        maxFromBucket: 1,
        note: 'Optional technology subject'
      }
    }
  },
  'Biological Science': {
    icon: '🧬',
    color: 'from-green-500 to-emerald-500',
    degrees: 'Medicine (MBBS), Dentistry (BDS), Veterinary Science, Pharmacy, Nursing, Agriculture, Food Science & Technology, Fisheries & Marine Science, Biological Science',
    description: 'For medicine, healthcare, agriculture, and biological science careers',
    hasSubjectBuckets: true,
    subjectBuckets: {
      'Core Subjects': {
        icon: '📚',
        subjects: ['Biology', 'Chemistry', 'Physics'],
        maxFromBucket: 3,
        note: 'Select all 3 core subjects'
      },
      'Agriculture & Environment': {
        icon: '🌾',
        subjects: ['Agricultural Science', 'Environmental Science', 'Food Science'],
        maxFromBucket: 1,
        note: 'Optional agriculture subject'
      },
      'Technology': {
        icon: '💻',
        subjects: ['Information & Communication Technology', 'Bio Systems Technology'],
        maxFromBucket: 1,
        note: 'Optional technology subject'
      }
    }
  },
  'Commerce': {
    icon: '💼',
    color: 'from-amber-500 to-orange-500',
    degrees: 'Business Administration, Accounting, Finance, Management, Marketing, HRM, Banking & Insurance, Estate Management',
    description: 'For business, finance, management, and accounting careers',
    hasSubjectBuckets: true,
    subjectBuckets: {
      'Core Subjects': {
        icon: '📚',
        subjects: ['Accounting', 'Business Studies', 'Economics'],
        maxFromBucket: 3,
        note: 'Select all 3 core subjects'
      },
      'Technology': {
        icon: '💻',
        subjects: ['Information & Communication Technology', 'Computer Science'],
        maxFromBucket: 1,
        note: 'Optional IT subject'
      },
      'Business Support': {
        icon: '📊',
        subjects: ['Statistics', 'Mathematics', 'Logic & Scientific Method'],
        maxFromBucket: 1,
        note: 'Optional quantitative subject'
      }
    }
  },
  'Arts': {
    icon: '📖',
    color: 'from-rose-500 to-pink-500',
    degrees: 'Arts, Law (LLB), Social Sciences, Education, Languages, Fine Arts, Criminology, Social Work, Public Administration',
    description: 'Choose 3 subjects from the groups below (subject to combination rules)',
    hasSubjectBuckets: true,
    subjectBuckets: {
      'Languages': {
        icon: '🗣️',
        subjects: ['Sinhala', 'Tamil', 'English', 'Pali', 'Sanskrit', 'Arabic', 'French', 'German', 'Hindi', 'Japanese', 'Chinese', 'Korean', 'Malay'],
        maxFromBucket: 2,
        note: 'Maximum 2 language subjects'
      },
      'Civilizations': {
        icon: '🛕',
        subjects: ['Buddhist Civilization', 'Hindu Civilization', 'Islam Civilization', 'Christian Civilization'],
        maxFromBucket: 1,
        note: 'Maximum 1 civilization subject'
      },
      'Social Sciences': {
        icon: '📊',
        subjects: ['Political Science', 'Geography', 'History', 'Economics', 'Logic & Scientific Method', 'Home Economics', 'Communication & Media Studies'],
        maxFromBucket: 3,
        note: 'Up to 3 subjects'
      },
      'Aesthetics': {
        icon: '🎭',
        subjects: ['Art', 'Dancing (Sinhala)', 'Dancing (Bharatha)', 'Music (Oriental)', 'Music (Western)', 'Music (Carnatic)', 'Drama & Theatre (Sinhala)', 'Drama & Theatre (Tamil)'],
        maxFromBucket: 2,
        note: 'Maximum 2 aesthetic subjects'
      }
    }
  },
  'Engineering Technology': {
    icon: '🔧',
    color: 'from-violet-500 to-purple-500',
    degrees: 'Engineering Technology, IT, Software Engineering, Quantity Surveying, Town Planning, Surveying Science',
    description: 'Practical engineering and technology applications',
    hasSubjectBuckets: true,
    subjectBuckets: {
      'Core Subjects': {
        icon: '📚',
        subjects: ['Engineering Technology', 'Science for Technology', 'Information & Communication Technology'],
        maxFromBucket: 3,
        note: 'Select all 3 core subjects'
      },
      'Advanced Technology': {
        icon: '⚡',
        subjects: ['Electronics', 'Computer Science', 'Robotics'],
        maxFromBucket: 1,
        note: 'Optional advanced technology'
      },
      'Mathematics': {
        icon: '🔢',
        subjects: ['Applied Mathematics', 'Statistics'],
        maxFromBucket: 1,
        note: 'Optional mathematics'
      }
    }
  },
  'Bio Systems Technology': {
    icon: '🌱',
    color: 'from-teal-500 to-cyan-500',
    degrees: 'Bio Systems Technology, Agriculture Technology, Food Science & Technology, Environmental Science, Fisheries',
    description: 'Biological systems combined with modern technology',
    hasSubjectBuckets: true,
    subjectBuckets: {
      'Core Subjects': {
        icon: '📚',
        subjects: ['Bio Systems Technology', 'Science for Technology', 'Information & Communication Technology'],
        maxFromBucket: 3,
        note: 'Select all 3 core subjects'
      },
      'Agriculture & Environment': {
        icon: '🌾',
        subjects: ['Agricultural Science', 'Environmental Science', 'Food Science'],
        maxFromBucket: 1,
        note: 'Optional agriculture subject'
      },
      'Advanced Technology': {
        icon: '⚡',
        subjects: ['Electronics', 'Computer Science'],
        maxFromBucket: 1,
        note: 'Optional advanced technology'
      }
    }
  }
};

// All 25 Sri Lankan districts
export const ALL_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

// Dream job category colors (light theme)
export const CATEGORY_COLORS = {
  'Technology': { bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', accent: 'from-violet-500 to-purple-500' },
  'Healthcare': { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', accent: 'from-emerald-500 to-teal-500' },
  'Engineering': { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', accent: 'from-amber-500 to-orange-500' },
  'Business': { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', accent: 'from-blue-500 to-cyan-500' },
  'Finance': { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', accent: 'from-green-500 to-emerald-500' },
  'Education': { bg: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700', accent: 'from-rose-500 to-pink-500' },
  'Legal': { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700', accent: 'from-slate-500 to-gray-500' },
  'Arts': { bg: 'bg-pink-50', border: 'border-pink-200', badge: 'bg-pink-100 text-pink-700', accent: 'from-pink-500 to-rose-500' },
  'Design': { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', badge: 'bg-fuchsia-100 text-fuchsia-700', accent: 'from-fuchsia-500 to-pink-500' },
  'Media': { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', accent: 'from-orange-500 to-red-500' },
  'Science': { bg: 'bg-teal-50', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-700', accent: 'from-teal-500 to-cyan-500' },
  'Trades': { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', accent: 'from-yellow-500 to-amber-500' },
  'Hospitality': { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', accent: 'from-red-500 to-orange-500' },
  'Aviation': { bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-700', accent: 'from-sky-500 to-blue-500' },
  'Agriculture': { bg: 'bg-lime-50', border: 'border-lime-200', badge: 'bg-lime-100 text-lime-700', accent: 'from-lime-500 to-green-500' },
  'Public Service': { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', accent: 'from-indigo-500 to-blue-500' },
  'Social Services': { bg: 'bg-cyan-50', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-700', accent: 'from-cyan-500 to-teal-500' },
};

export const DEFAULT_COLORS = { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700', accent: 'from-gray-500 to-slate-500' };
