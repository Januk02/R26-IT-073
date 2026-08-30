import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Text } from '@react-three/drei';
import { universities, dreamJobs, languageTranslations } from '../data/dreamDegreeData';

/* ------------------------------------------------------------------ */
/*  JOB THEMES — maps a job title to an outfit / prop / headwear look  */
/* ------------------------------------------------------------------ */

const JOB_THEMES = [
  {
    name: 'Medical',
    keywords: ['doctor', 'physician', 'surgeon', 'nurse', 'dentist', 'pharmacist', 'medical', 'medicine'],
    bodyColor: '#f8fafc',
    limbColor: '#f8fafc',
    accentColor: '#0ea5e9',
    headwear: 'cap',
    prop: 'stethoscope',
    propColor: '#0ea5e9',
  },
  {
    name: 'Engineering',
    keywords: ['engineer', 'engineering', 'architect', 'construction', 'civil'],
    bodyColor: '#1e293b',
    limbColor: '#1e293b',
    accentColor: '#f59e0b',
    headwear: 'hardhat',
    prop: 'blueprint',
    propColor: '#f59e0b',
  },
  {
    name: 'Technology',
    keywords: ['software', 'developer', 'programmer', 'data scien', 'it ', 'tech', 'computer', 'cyber'],
    bodyColor: '#111827',
    limbColor: '#111827',
    accentColor: '#22d3ee',
    headwear: 'none',
    prop: 'laptop',
    propColor: '#22d3ee',
  },
  {
    name: 'Law',
    keywords: ['lawyer', 'judge', 'advocate', 'legal', 'attorney'],
    bodyColor: '#0f172a',
    limbColor: '#0f172a',
    accentColor: '#a78bfa',
    headwear: 'none',
    prop: 'gavel',
    propColor: '#a78bfa',
  },
  {
    name: 'Education',
    keywords: ['teacher', 'professor', 'lecturer', 'educat', 'academic'],
    bodyColor: '#78350f',
    limbColor: '#78350f',
    accentColor: '#fbbf24',
    headwear: 'none',
    prop: 'book',
    propColor: '#fbbf24',
  },
  {
    name: 'Science',
    keywords: ['scientist', 'research', 'chemist', 'biolog', 'physicist', 'lab'],
    bodyColor: '#f1f5f9',
    limbColor: '#f1f5f9',
    accentColor: '#34d399',
    headwear: 'goggles',
    prop: 'flask',
    propColor: '#34d399',
  },
  {
    name: 'Business',
    keywords: ['business', 'account', 'finance', 'bank', 'manager', 'entrepreneur', 'economist', 'marketing'],
    bodyColor: '#1e3a5f',
    limbColor: '#1e3a5f',
    accentColor: '#fb923c',
    headwear: 'none',
    prop: 'briefcase',
    propColor: '#fb923c',
  },
  {
    name: 'Creative',
    keywords: ['design', 'artist', 'creative', 'fashion', 'media', 'film'],
    bodyColor: '#701a75',
    limbColor: '#701a75',
    accentColor: '#f472b6',
    headwear: 'none',
    prop: 'palette',
    propColor: '#f472b6',
  },
  {
    name: 'Aviation',
    keywords: ['pilot', 'aviation', 'aeronaut'],
    bodyColor: '#1e3a8a',
    limbColor: '#1e3a8a',
    accentColor: '#facc15',
    headwear: 'cap',
    prop: 'wings',
    propColor: '#facc15',
  },
];

const DEFAULT_THEME = {
  name: 'Student',
  bodyColor: '#0f172a',
  limbColor: '#1e293b',
  accentColor: '#60a5fa',
  headwear: 'gradcap',
  prop: 'gradcap-hand',
  propColor: '#60a5fa',
};

function getJobTheme(jobTitle = '') {
  const lower = (jobTitle || '').toLowerCase();
  const match = JOB_THEMES.find((t) => t.keywords.some((k) => lower.includes(k)));
  return match || DEFAULT_THEME;
}

/* Jobs shown as rotating cards around the student */
const ROTATING_JOBS = [
  { icon: '💻', title: 'Software Engineer', tag: 'Tech' },
  { icon: '🧬', title: 'Biomedical Researcher', tag: 'Health' },
  { icon: '🏗️', title: 'Civil Engineer', tag: 'Engineering' },
  { icon: '🚀', title: 'Data Scientist', tag: 'Tech' },
  { icon: '🦾', title: 'Robotics Engineer', tag: 'Engineering' },
  { icon: '🌍', title: 'Environmental Scientist', tag: 'Environment' },
  { icon: '🎨', title: 'UX/UI Designer', tag: 'Design' },
  { icon: '🔐', title: 'Cybersecurity Analyst', tag: 'Tech' },
  { icon: '📊', title: 'Financial Analyst', tag: 'Finance' },
  { icon: '⚕️', title: 'Medical Doctor', tag: 'Health' },
  { icon: '🎓', title: 'Professor', tag: 'Education' },
  { icon: '🔬', title: 'Research Scientist', tag: 'Science' },
  { icon: '🎬', title: 'Film Director', tag: 'Arts' },
  { icon: '📱', title: 'App Developer', tag: 'Tech' },
  { icon: '⚖️', title: 'Lawyer', tag: 'Legal' },
  { icon: '🎮', title: 'Game Developer', tag: 'Tech' }
];

/* ------------------------------------------------------------------ */
/*  GLOBE OF JOB CARDS                                                 */
/* ------------------------------------------------------------------ */

function CareerGlobe({ jobs, isPaused, onJobClick, selectedJob }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current && !isPaused) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={groupRef}>
      {jobs.map((job, index) => {
        const phi = Math.acos(-1 + (2 * index) / jobs.length);
        const theta = Math.sqrt(jobs.length * Math.PI) * phi;
        const radius = 3.5;

        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);

        const isSelected = selectedJob === job.title;

        return (
          <Float key={index} speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
            <group 
              position={[x, y, z]} 
              rotation={[0, theta, 0]}
            >
              {/* Card Front - clickable */}
              <mesh 
                position={[0, 0, 0.04]}
                onClick={() => onJobClick(job.title)}
              >
                <boxGeometry args={[1.4, 0.9, 0.02]} />
                <meshStandardMaterial 
                  color={isSelected ? "#f97316" : "#1e3a5f"} 
                  metalness={0.4}
                  roughness={0.3}
                  emissive={isSelected ? "#f97316" : "#3b82f6"}
                  emissiveIntensity={isSelected ? 0.3 : 0.15}
                />
              </mesh>

              {/* Front Content */}
              <Text
                position={[0, 0.2, 0.05]}
                fontSize={0.25}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {job.icon}
              </Text>
              <Text
                position={[0, -0.15, 0.05]}
                fontSize={0.12}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.2}
              >
                {job.title}
              </Text>
              <Text
                position={[0, -0.32, 0.05]}
                fontSize={0.07}
                color="#60a5fa"
                anchorX="center"
                anchorY="middle"
              >
                {job.tag}
              </Text>
            </group>
          </Float>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  HEADWEAR + PROP PRIMITIVES                                         */
/* ------------------------------------------------------------------ */

function Headwear({ type, accentColor }) {
  switch (type) {
    case 'cap':
      return (
        <mesh position={[0, 1.92, 0]} castShadow>
          <sphereGeometry args={[0.34, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
          <meshStandardMaterial color={accentColor} metalness={0.2} roughness={0.5} />
        </mesh>
      );
    case 'hardhat':
      return (
        <mesh position={[0, 1.96, 0]} castShadow>
          <sphereGeometry args={[0.36, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#facc15" metalness={0.3} roughness={0.4} />
        </mesh>
      );
    case 'goggles':
      return (
        <>
          <mesh position={[-0.1, 1.72, 0.28]} castShadow>
            <torusGeometry args={[0.06, 0.015, 8, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.2} />
          </mesh>
          <mesh position={[0.1, 1.72, 0.28]} castShadow>
            <torusGeometry args={[0.06, 0.015, 8, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.2} />
          </mesh>
        </>
      );
    case 'gradcap':
      return (
        <group position={[0, 1.97, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.04, 0.5]} />
            <meshStandardMaterial color="#0f172a" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.06, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.26, 0.12, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[0.24, -0.05, 0.24]} castShadow>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#facc15" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

function HandProp({ type, propColor }) {
  // Positioned near the right hand (~[0.45, 0.4, 0.08]) of the parent right-arm group.
  switch (type) {
    case 'stethoscope':
      return (
        <mesh position={[0, -0.45, 0.35]} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.22, 0.015, 8, 24, Math.PI * 1.4]} />
          <meshStandardMaterial color={propColor} metalness={0.5} roughness={0.3} />
        </mesh>
      );
    case 'blueprint':
      return (
        <mesh position={[0.06, -0.02, 0.05]} rotation={[0, 0, 0.9]}>
          <cylinderGeometry args={[0.04, 0.04, 0.32, 12]} />
          <meshStandardMaterial color={propColor} metalness={0.1} roughness={0.6} />
        </mesh>
      );
    case 'laptop':
      return (
        <group position={[0.05, -0.05, 0.1]} rotation={[0.2, 0.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.02, 0.18]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.4} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.09, -0.09]} rotation={[-0.6, 0, 0]} castShadow>
            <boxGeometry args={[0.26, 0.18, 0.015]} />
            <meshStandardMaterial color={propColor} emissive={propColor} emissiveIntensity={0.3} />
          </mesh>
        </group>
      );
    case 'gavel':
      return (
        <group position={[0.05, -0.03, 0.05]} rotation={[0, 0, 0.6]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.12, 12]} />
            <meshStandardMaterial color={propColor} metalness={0.2} roughness={0.5} />
          </mesh>
        </group>
      );
    case 'book':
      return (
        <mesh position={[0.05, -0.02, 0.08]} rotation={[0.2, 0.3, 0]}>
          <boxGeometry args={[0.2, 0.05, 0.26]} />
          <meshStandardMaterial color={propColor} roughness={0.6} />
        </mesh>
      );
    case 'flask':
      return (
        <group position={[0.05, -0.02, 0.08]}>
          <mesh>
            <coneGeometry args={[0.08, 0.16, 12]} />
            <meshStandardMaterial color="#e2e8f0" transparent opacity={0.5} metalness={0.2} roughness={0.1} />
          </mesh>
          <mesh position={[0, -0.03, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color={propColor} emissive={propColor} emissiveIntensity={0.5} />
          </mesh>
        </group>
      );
    case 'briefcase':
      return (
        <mesh position={[0.05, -0.08, 0.05]}>
          <boxGeometry args={[0.22, 0.16, 0.06]} />
          <meshStandardMaterial color={propColor} metalness={0.3} roughness={0.4} />
        </mesh>
      );
    case 'palette':
      return (
        <mesh position={[0.05, -0.02, 0.08]} rotation={[0.3, 0.2, 0]} scale={[1, 0.7, 1]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.7} />
        </mesh>
      );
    case 'wings':
      return (
        <mesh position={[0.05, -0.02, 0.05]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.28, 0.05, 0.04]} />
          <meshStandardMaterial color={propColor} metalness={0.6} roughness={0.3} />
        </mesh>
      );
    case 'gradcap-hand':
      return (
        <mesh position={[0.05, -0.02, 0.06]} rotation={[0.4, 0.3, 0]}>
          <boxGeometry args={[0.22, 0.02, 0.22]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  AVATAR — now themed by job                                         */
/* ------------------------------------------------------------------ */

function GuidanceAvatar({ isReaching, targetPosition, theme = DEFAULT_THEME, scale = 1.2 }) {
  const groupRef = useRef();
  const rightArmRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }

    if (rightArmRef.current && isReaching && targetPosition) {
      const t = Math.min(state.clock.elapsedTime % 2, 1);
      rightArmRef.current.rotation.z = -0.3 - t * 0.5;
      rightArmRef.current.rotation.x = t * 0.3;
    } else if (rightArmRef.current) {
      rightArmRef.current.rotation.z = -0.3;
      rightArmRef.current.rotation.x = 0;
    }
  });

  const bodyColor = theme.bodyColor || DEFAULT_THEME.bodyColor;
  const limbColor = theme.limbColor || bodyColor;
  const accentColor = theme.accentColor || DEFAULT_THEME.accentColor;

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Head */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#f5d0c5" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <sphereGeometry args={[0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Job-specific headwear */}
      <Headwear type={theme.headwear} accentColor={accentColor} />

      {/* Eyes */}
      <mesh position={[-0.1, 1.72, 0.24]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.1, 1.72, 0.24]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.1, 1.72, 0.26]} castShadow>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0.1, 1.72, 0.26]} castShadow>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>

      {/* Body (job-colored) */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.26, 0.75, 8, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Accent collar / trim */}
      <mesh position={[0, 1.22, 0]} castShadow>
        <torusGeometry args={[0.22, 0.025, 8, 24]} />
        <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Left Arm */}
      <mesh position={[-0.32, 0.95, 0]} rotation={[0, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
        <meshStandardMaterial color={limbColor} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[-0.4, 0.6, 0.05]} rotation={[0, 0, 0.15]} castShadow>
        <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
        <meshStandardMaterial color={limbColor} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[-0.45, 0.4, 0.08]} castShadow>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#f5d0c5" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* Right Arm - Animated, holds the job prop */}
      <group ref={rightArmRef}>
        <mesh position={[0.32, 0.95, 0]} rotation={[0, 0, -0.3]} castShadow>
          <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
          <meshStandardMaterial color={limbColor} metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0.4, 0.6, 0.05]} rotation={[0, 0, -0.15]} castShadow>
          <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
          <meshStandardMaterial color={limbColor} metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0.45, 0.4, 0.08]} castShadow>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#f5d0c5" metalness={0.1} roughness={0.7} />
        </mesh>
        <mesh position={[0.52, 0.42, 0.1]} rotation={[0, 0, -0.3]} castShadow>
          <capsuleGeometry args={[0.02, 0.12, 8, 16]} />
          <meshStandardMaterial color="#f5d0c5" metalness={0.1} roughness={0.7} />
        </mesh>

        <group position={[0.45, 0.4, 0.08]}>
          <HandProp type={theme.prop} propColor={theme.propColor || accentColor} />
        </group>
      </group>

      {/* Legs */}
      <mesh position={[-0.14, 0.15, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.65, 8, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0.14, 0.15, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.65, 8, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.14, -0.18, 0.06]} castShadow>
        <boxGeometry args={[0.14, 0.08, 0.22]} />
        <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.14, -0.18, 0.06]} castShadow>
        <boxGeometry args={[0.14, 0.08, 0.22]} />
        <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN HERO SCENE                                                     */
/* ------------------------------------------------------------------ */

function GuidanceScene({ jobs, isPaused, onJobClick, selectedJob, theme }) {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 50 }} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[5, -5, 5]} intensity={0.3} color="#f97316" />

      <Sphere args={[1.8, 32, 32]}>
        <meshStandardMaterial color="#1e3a5f" transparent opacity={0.1} metalness={0.5} roughness={0.2} />
      </Sphere>

      <Sphere args={[1.8, 16, 16]}>
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.15} />
      </Sphere>

      <CareerGlobe jobs={jobs} isPaused={isPaused} onJobClick={onJobClick} selectedJob={selectedJob} />

      <Float floatIntensity={0.3} speed={2}>
        <GuidanceAvatar isReaching={false} targetPosition={null} theme={theme} />
      </Float>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate={!isPaused} autoRotateSpeed={0.5} />
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                                */
/* ------------------------------------------------------------------ */

export default function DreamDegreeGuidance({ studentData, backendResults, onBack, onHome, onComplete }) {
  const [language, setLanguage] = useState('en');
  const [isPaused, setIsPaused] = useState(false);
  const [selectedJob, setSelectedJob] = useState(studentData.dreamJob || dreamJobs[0].title);

  const jobTheme = getJobTheme(selectedJob);

  const handleJobClick = (jobTitle) => {
    setSelectedJob(jobTitle);
  };

  const t = languageTranslations[language];

  const generateCounterfactuals = () => {
    const zScore = parseFloat(studentData.academicResults.zScore) || 0;
    const dreamJob = dreamJobs.find((job) => job.title === studentData.dreamJob) || dreamJobs[0];

    const guidance = [];

    if (zScore < 2.0) {
      guidance.push({
        category: 'Academic',
        icon: '📚',
        title: 'Improve Z-Score',
        current: zScore,
        target: 2.0,
        impact: 'High',
        suggestions: [
          'Focus on improving A/L subject grades through retake or additional study',
          'Consider alternative streams with lower cutoff requirements',
          'Enroll in bridging courses to strengthen weak subjects',
          'Seek tutoring in key subjects like Mathematics and Science',
        ],
        ifThen: `If you increase your Z-Score to 2.0+, you could qualify for 3-4 more university programs.`,
      });
    } else if (zScore < 2.5) {
      guidance.push({
        category: 'Academic',
        icon: '📚',
        title: 'Strengthen Academic Profile',
        current: zScore,
        target: 2.5,
        impact: 'Medium',
        suggestions: [
          'Take advanced level courses in relevant subjects',
          'Participate in academic competitions and Olympiads',
          'Complete online certifications from recognized platforms',
          'Maintain strong performance in current studies',
        ],
        ifThen: `If you reach Z-Score 2.5+, top universities like University of Colombo become accessible.`,
      });
    }

    const lowPersonalityTraits = Object.entries(studentData.personalityScores || {})
      .filter(([, score]) => score < 6)
      .map(([trait, score]) => ({ trait, score }));

    if (lowPersonalityTraits.length > 0) {
      lowPersonalityTraits.forEach(({ trait, score }) => {
        guidance.push({
          category: 'Personality',
          icon: '🧠',
          title: `Develop ${trait.replace(/_/g, ' ')}`,
          current: score,
          target: 7,
          impact: 'Medium',
          suggestions: [
            `Join clubs and activities that require ${trait.replace(/_/g, ' ')}`,
            'Take on leadership roles in group projects',
            'Practice through real-world scenarios and challenges',
            'Seek mentorship from professionals in your field',
          ],
          ifThen: `Improving ${trait.replace(/_/g, ' ')} will better align you with ${dreamJob.title} requirements.`,
        });
      });
    }

    if (studentData.lifestylePreferences.locationPreference === 'Urban') {
      const urbanUniversities = universities.filter((u) => u.urbanLocation);
      guidance.push({
        category: 'Lifestyle',
        icon: '🏙️',
        title: 'Consider Location Flexibility',
        current: 'Urban only',
        target: 'Flexible',
        impact: 'Medium',
        suggestions: [
          'Consider universities in suburban areas for better options',
          'Evaluate hostel facilities at non-urban universities',
          'Research transportation options to various university locations',
          'Balance location preference with program quality',
        ],
        ifThen: `If you consider suburban locations, you could access ${urbanUniversities.length + 2} additional university options.`,
      });
    }

    if (studentData.personalInfo.district) {
      const districtUniversities = universities.filter((u) => u.district === studentData.personalInfo.district);
      if (districtUniversities.length === 0) {
        guidance.push({
          category: 'Strategic',
          icon: '🎯',
          title: 'Leverage District Quota',
          current: 'No district advantage',
          target: 'Maximize quota benefits',
          impact: 'High',
          suggestions: [
            'Research universities in your district with relevant programs',
            'Consider applying to multiple universities within your district',
            'Understand district quota allocation policies',
            'Prepare strong applications highlighting local ties',
          ],
          ifThen: `If you strategically use district quota, you may qualify with 0.2-0.3 lower Z-Score requirements.`,
        });
      }
    }

    guidance.push({
      category: 'Alternative',
      icon: '🔄',
      title: 'Explore Alternative Pathways',
      current: 'Traditional university route',
      target: 'Multiple pathways',
      impact: 'High',
      suggestions: [
        'Consider private universities with flexible admission',
        'Look into degree programs at international branch campuses',
        'Explore online degree programs from accredited institutions',
        'Research vocational pathways that lead to your dream job',
      ],
      ifThen: `If you explore alternative pathways, you could start your degree journey within 6-12 months.`,
    });

    return guidance;
  };

  const counterfactuals = generateCounterfactuals();

  // Merge backend counterfactual guidance if available
  const backendGuidance = backendResults?.counterfactual_guidance || {};
  if (backendGuidance.skill_improvement) {
    counterfactuals.unshift({
      category: 'AI Insight',
      icon: '🤖',
      title: 'AI Skill Improvement Advice',
      current: 'Current skills',
      target: 'Optimal level',
      impact: 'High',
      suggestions: [backendGuidance.skill_improvement],
      ifThen: backendGuidance.z_score_improvement || 'Follow the AI recommendations to improve your chances.',
    });
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* 3D Hero Section */}
      <section className="relative w-full h-[50vh] flex flex-col overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900" />
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-20 px-8 py-4 flex justify-end">
          {['en', 'si', 'ta'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`ml-2 px-4 py-2 rounded-lg font-medium transition-all backdrop-blur-sm ${
                language === lang
                  ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'si' ? 'සිංහල' : 'தமிழ்'}
            </button>
          ))}
        </div>

        <div className="relative z-20 text-center py-4">
          <p className="text-xs tracking-widest text-blue-300 uppercase font-mono">
            Future Goal <span className="text-orange-400 font-bold">Explorer</span> — click a job to see the outfit
          </p>
        </div>

        <div
          className="relative flex-1 flex items-center justify-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <GuidanceScene
            jobs={ROTATING_JOBS}
            isPaused={isPaused}
            onJobClick={handleJobClick}
            selectedJob={selectedJob}
            theme={jobTheme}
          />
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t.guidance}</h1>
          <p className="text-blue-200/80 text-lg">Personalized improvement recommendations based on your profile</p>
        </div>

        {/* Current Profile Summary */}
        <div className="bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Current Profile Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-500/20 p-4 rounded-lg text-center border border-blue-500/30">
              <p className="text-sm text-blue-200 mb-1">Selected Job</p>
              <p className="font-bold text-white">{selectedJob || studentData.dreamJob || 'Not selected'}</p>
              <p className="text-xs mt-1" style={{ color: jobTheme.accentColor }}>
                {jobTheme.name} track
              </p>
            </div>
            <div className="bg-orange-500/20 p-4 rounded-lg text-center border border-orange-500/30">
              <p className="text-sm text-orange-200 mb-1">Z-Score</p>
              <p className="font-bold text-white">{studentData.academicResults.zScore || 'N/A'}</p>
            </div>
            <div className="bg-blue-500/20 p-4 rounded-lg text-center border border-blue-500/30">
              <p className="text-sm text-blue-200 mb-1">District</p>
              <p className="font-bold text-white">{studentData.personalInfo.district || 'Not specified'}</p>
            </div>
            <div className="bg-orange-500/20 p-4 rounded-lg text-center border border-orange-500/30">
              <p className="text-sm text-orange-200 mb-1">Location Preference</p>
              <p className="font-bold text-white">{studentData.lifestylePreferences.locationPreference || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Counterfactual Guidance */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">If-Then Improvement Scenarios</h2>

          {counterfactuals.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(item.impact)}`}>
                      {item.impact} Impact
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-200">Current: {item.current}</p>
                  <p className="text-sm font-bold text-orange-400">Target: {item.target}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/20 to-orange-500/20 p-4 rounded-lg mb-4 border border-white/10">
                <p className="font-medium text-white">
                  <span className="text-blue-400 font-bold">If-Then Scenario:</span> {item.ifThen}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Actionable Steps:</h4>
                <ul className="space-y-2">
                  {item.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-6 h-6 bg-gradient-to-br from-blue-600 to-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-blue-100">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Priority Actions */}
        <div className="bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl p-6 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">🎯 Priority Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-500/20 p-4 rounded-lg border border-red-500/30">
              <h3 className="font-bold text-red-300 mb-2">Immediate (Next 1-3 months)</h3>
              <ul className="space-y-1 text-sm text-blue-100">
                <li>• Focus on academic improvements</li>
                <li>• Research district quota benefits</li>
                <li>• Explore alternative pathways</li>
              </ul>
            </div>
            <div className="bg-orange-500/20 p-4 rounded-lg border border-orange-500/30">
              <h3 className="font-bold text-orange-300 mb-2">Short-term (3-6 months)</h3>
              <ul className="space-y-1 text-sm text-blue-100">
                <li>• Develop key personality traits</li>
                <li>• Complete bridging courses</li>
                <li>• Build professional network</li>
              </ul>
            </div>
            <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
              <h3 className="font-bold text-blue-300 mb-2">Medium-term (6-12 months)</h3>
              <ul className="space-y-1 text-sm text-blue-100">
                <li>• Apply to multiple universities</li>
                <li>• Secure internships</li>
                <li>• Prepare for interviews</li>
              </ul>
            </div>
            <div className="bg-gray-500/20 p-4 rounded-lg border border-gray-500/30">
              <h3 className="font-bold text-gray-300 mb-2">Long-term (1+ years)</h3>
              <ul className="space-y-1 text-sm text-blue-100">
                <li>• Excel in chosen program</li>
                <li>• Build specialized skills</li>
                <li>• Plan advanced education</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
          >
            Back to Results
          </button>

          <button
            onClick={onHome}
            className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
          >
            Back to Home
          </button>

          <button
            onClick={onComplete}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-lg hover:from-blue-700 hover:to-orange-600 transition-colors shadow-lg"
          >
            View Roadmap →
          </button>
        </div>
      </div>
    </div>
  );
}