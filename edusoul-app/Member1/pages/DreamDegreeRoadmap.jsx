import { useState } from 'react';
import { dreamJobs } from '../data/dreamDegreeData';

export default function DreamDegreeRoadmap({ recommendation, studentData, onBack, onHome }) {
  const [language, setLanguage] = useState('en');
  const [selectedPath, setSelectedPath] = useState('academic');

  const dreamJob = dreamJobs.find(job => job.title === studentData.dreamJob) || dreamJobs[0];
  const university = recommendation.university || 'Your University';
  const degree = recommendation.degree || recommendation.programs?.[0]?.name || 'Your Degree';
  const backendRoadmap = recommendation.roadmap || [];

  const generateRoadmap = () => {
    const academicPath = {
      title: 'Academic Path',
      milestones: [
        {
          year: 'Year 1-2',
          title: 'Foundation Building',
          description: `Complete core courses in ${degree} at ${university}. Build strong fundamentals in ${studentData.academicResults?.stream || 'your field'}.`,
          activities: [
            'Maintain GPA above 3.0',
            'Join relevant student clubs',
            'Complete 2 internships',
            'Build portfolio of projects'
          ],
          skills: ['Technical Fundamentals', 'Research Methods', 'Communication']
        },
        {
          year: 'Year 3-4',
          title: 'Specialization & Research',
          description: `Focus on ${studentData.dreamJob} specialization through electives and final year project.`,
          activities: [
            'Complete final year project',
            'Publish research paper',
            'Industry internship',
            'Build professional network'
          ],
          skills: ['Specialized Knowledge', 'Problem Solving', 'Leadership']
        },
        {
          year: 'Year 5-6',
          title: "Master's Degree (Optional)",
          description: `Pursue advanced studies in ${dreamJob.category} at top universities.`,
          activities: [
            'Apply for scholarships',
            'Research specialization',
            'Teaching assistantship',
            'Network with professors'
          ],
          skills: ['Advanced Theory', 'Research Leadership', 'Academic Writing']
        },
        {
          year: 'Year 7+',
          title: 'PhD or Senior Role',
          description: 'Reach pinnacle of academic career or industry leadership.',
          activities: [
            'Doctoral research',
            'Post-doctoral work',
            'Industry consulting',
            'Mentoring others'
          ],
          skills: ['Expert Knowledge', 'Innovation', 'Strategic Vision']
        }
      ]
    };

    const entrepreneurialPath = {
      title: 'Entrepreneurial Path',
      milestones: [
        {
          year: 'Year 1-2',
          title: 'Skill Acquisition',
          description: `Build technical and business foundations while at ${university}.`,
          activities: ['Learn core technical skills', 'Join entrepreneurship club', 'Participate in hackathons', 'Network with mentors'],
          skills: ['Technical Skills', 'Business Basics', 'Networking']
        },
        {
          year: 'Year 3-4',
          title: 'Idea Validation',
          description: `Identify and validate business ideas in ${dreamJob.category}.`,
          activities: ['Market research', 'Build MVP', 'Customer interviews', 'Business plan development'],
          skills: ['Market Analysis', 'Product Development', 'Pitching']
        },
        {
          year: 'Year 5-7',
          title: 'Startup Launch',
          description: `Launch and scale your venture in the ${dreamJob.category} sector.`,
          activities: ['Register company', 'Secure funding', 'Build team', 'Go-to-market strategy'],
          skills: ['Leadership', 'Financial Management', 'Team Building']
        },
        {
          year: 'Year 8+',
          title: 'Scale & Expansion',
          description: 'Grow startup into established business or explore new ventures.',
          activities: ['Scale operations', 'International expansion', 'New product lines', 'Mentor other entrepreneurs'],
          skills: ['Strategic Planning', 'Global Business', 'Innovation Management']
        }
      ]
    };

    const industryPath = {
      title: 'Industry Professional Path',
      milestones: [
        {
          year: 'Year 1-2',
          title: 'Entry Level',
          description: `Start career as Junior ${studentData.dreamJob} at leading companies.`,
          activities: ['Apply to graduate programs', 'Build technical portfolio', 'Get industry certifications', 'Learn company culture'],
          skills: ['Technical Execution', 'Team Collaboration', 'Professional Communication']
        },
        {
          year: 'Year 3-5',
          title: 'Mid-Level Professional',
          description: `Progress to Senior ${studentData.dreamJob} with increased responsibilities.`,
          activities: ['Lead small projects', 'Mentor juniors', 'Specialize in niche', 'Build industry reputation'],
          skills: ['Project Management', 'Specialization', 'Leadership']
        },
        {
          year: 'Year 6-10',
          title: 'Senior Leadership',
          description: `Reach positions like Team Lead, Manager, or Principal ${studentData.dreamJob}.`,
          activities: ['Lead large teams', 'Strategic planning', 'Cross-functional collaboration', 'Industry speaking'],
          skills: ['Strategic Leadership', 'People Management', 'Business Acumen']
        },
        {
          year: 'Year 10+',
          title: 'Executive Level',
          description: 'Reach C-suite, Director, or start your own consulting firm.',
          activities: ['Executive decision making', 'Board participation', 'Industry thought leadership', 'Strategic partnerships'],
          skills: ['Executive Leadership', 'Strategic Vision', 'Industry Influence']
        }
      ]
    };

    return { academicPath, entrepreneurialPath, industryPath };
  };

  const roadmaps = generateRoadmap();
  const currentRoadmap = roadmaps[selectedPath === 'academic' ? 'academicPath' : selectedPath === 'entrepreneurial' ? 'entrepreneurialPath' : 'industryPath'];

  const bridgingCourses = [
    { name: 'Python Programming', provider: 'Coursera', duration: '3 months', relevance: 95 },
    { name: 'Data Structures & Algorithms', provider: 'edX', duration: '4 months', relevance: 90 },
    { name: 'Business Communication', provider: 'Udemy', duration: '2 months', relevance: 85 },
    { name: 'Project Management', provider: 'LinkedIn Learning', duration: '2 months', relevance: 80 }
  ];

  const microCredentials = [
    { name: 'AWS Cloud Practitioner', issuer: 'Amazon', validity: '2 years', demand: 'High' },
    { name: 'Google Analytics', issuer: 'Google', validity: '1 year', demand: 'Medium' },
    { name: 'Agile Scrum Master', issuer: 'Scrum Alliance', validity: '2 years', demand: 'High' },
    { name: 'Digital Marketing', issuer: 'HubSpot', validity: '1 year', demand: 'High' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Results</span>
          </button>
          <div className="flex items-center space-x-2">
            {['en', 'si', 'ta'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  language === lang
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'si' ? 'SI' : 'TA'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Your Career Roadmap</h1>
          <p className="text-blue-200/60 text-lg">
            Personalized pathway to become a <span className="text-blue-300 font-semibold">{studentData.dreamJob}</span>
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <span className="text-sm bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
              {degree}
            </span>
            <span className="text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
              {university}
            </span>
          </div>
        </div>

        {/* Backend AI Roadmap (if available) */}
        {backendRoadmap.length > 0 && (
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-800/5 rounded-2xl border border-blue-500/20 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <span>AI-Generated Career Steps</span>
            </h2>
            <div className="space-y-3">
              {backendRoadmap.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-4 bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-white/80 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Path Selector */}
        <div className="bg-white/5 rounded-2xl p-1 mb-8 border border-white/10 flex">
          {[
            { id: 'academic', icon: '🎓', label: 'Academic Path', sub: 'Research & Teaching' },
            { id: 'entrepreneurial', icon: '🚀', label: 'Entrepreneurial', sub: 'Start Your Own Business' },
            { id: 'industry', icon: '💼', label: 'Industry Professional', sub: 'Corporate Career' }
          ].map((path) => (
            <button
              key={path.id}
              onClick={() => setSelectedPath(path.id)}
              className={`flex-1 py-4 px-4 rounded-xl transition-all text-center ${
                selectedPath === path.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="text-2xl mb-1">{path.icon}</div>
              <h3 className="font-bold text-sm">{path.label}</h3>
              <p className="text-xs opacity-70">{path.sub}</p>
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-8">{currentRoadmap.title}</h2>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 rounded-full" />

            <div className="space-y-8">
              {currentRoadmap.milestones.map((milestone, index) => (
                <div key={index} className="relative flex items-start ml-16">
                  <div className="absolute -left-12 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
                    {index + 1}
                  </div>

                  <div className="flex-1 bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                          {milestone.year}
                        </span>
                        <h3 className="text-xl font-bold text-white mt-2">{milestone.title}</h3>
                      </div>
                    </div>

                    <p className="text-white/60 mb-4">{milestone.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-white/80 mb-2 text-sm">Key Activities</h4>
                        <ul className="space-y-1.5">
                          {milestone.activities.map((activity, idx) => (
                            <li key={idx} className="text-sm text-white/60 flex items-center">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 flex-shrink-0" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-white/80 mb-2 text-sm">Skills to Develop</h4>
                        <div className="flex flex-wrap gap-2">
                          {milestone.skills.map((skill, idx) => (
                            <span key={idx} className="text-xs bg-purple-500/15 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/20">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Bridging Courses */}
          <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <span className="text-xl">📚</span>
              <span>Recommended Bridging Courses</span>
            </h3>
            <div className="space-y-3">
              {bridgingCourses.map((course, index) => (
                <div key={index} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/10">
                  <div>
                    <p className="font-medium text-white text-sm">{course.name}</p>
                    <p className="text-xs text-white/50">{course.provider} &middot; {course.duration}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    course.relevance >= 90
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {course.relevance}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Micro-Credentials */}
          <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <span className="text-xl">🏆</span>
              <span>Micro-Credentials</span>
            </h3>
            <div className="space-y-3">
              {microCredentials.map((credential, index) => (
                <div key={index} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/10">
                  <div>
                    <p className="font-medium text-white text-sm">{credential.name}</p>
                    <p className="text-xs text-white/50">{credential.issuer} &middot; Valid: {credential.validity}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    credential.demand === 'High'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {credential.demand}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/20 font-medium"
          >
            Back to Results
          </button>
          <button
            onClick={onHome}
            className="w-full sm:w-auto px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/20 font-medium"
          >
            Back to Home
          </button>
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/20 font-medium"
          >
            Print Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}
