import { useState } from 'react';
import { dreamJobs, languageTranslations } from '../data/dreamDegreeData';

export default function DreamDegreeRoadmap({ recommendation, studentData, onBack, onHome }) {
  const [language, setLanguage] = useState('en');
  const [selectedPath, setSelectedPath] = useState('academic');

  const t = languageTranslations[language];

  const generateRoadmap = () => {
    const dreamJob = dreamJobs.find(job => job.title === studentData.dreamJob);
    const university = recommendation.university;
    const program = recommendation.programs[0];

    const academicPath = {
      title: 'Academic Future Goal Path',
      milestones: [
        {
          year: 'Year 1-2',
          title: 'Foundation Building',
          description: `Complete core courses in ${program.name}. Build strong fundamentals in ${program.stream}.`,
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
          description: `Focus on ${dreamJob.title} specialization through electives and final year project.`,
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
          title: 'Master\'s Degree (Optional)',
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
          description: `Reach pinnacle of academic future goal or industry leadership.`,
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
          description: `Build technical and business foundations while at ${university.name}.`,
          activities: [
            'Learn core technical skills',
            'Join entrepreneurship club',
            'Participate in hackathons',
            'Network with mentors'
          ],
          skills: ['Technical Skills', 'Business Basics', 'Networking']
        },
        {
          year: 'Year 3-4',
          title: 'Idea Validation',
          description: `Identify and validate business ideas in ${dreamJob.category}.`,
          activities: [
            'Market research',
            'Build MVP',
            'Customer interviews',
            'Business plan development'
          ],
          skills: ['Market Analysis', 'Product Development', 'Pitching']
        },
        {
          year: 'Year 5-7',
          title: 'Startup Launch',
          description: `Launch and scale your venture in the ${dreamJob.category} sector.`,
          activities: [
            'Register company',
            'Secure funding',
            'Build team',
            'Go-to-market strategy'
          ],
          skills: ['Leadership', 'Financial Management', 'Team Building']
        },
        {
          year: 'Year 8+',
          title: 'Scale & Expansion',
          description: `Grow startup into established business or explore new ventures.`,
          activities: [
            'Scale operations',
            'International expansion',
            'New product lines',
            'Mentor other entrepreneurs'
          ],
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
          description: `Start future goal as Junior ${dreamJob.title} at leading companies.`,
          activities: [
            'Apply to graduate programs',
            'Build technical portfolio',
            'Get industry certifications',
            'Learn company culture'
          ],
          skills: ['Technical Execution', 'Team Collaboration', 'Professional Communication']
        },
        {
          year: 'Year 3-5',
          title: 'Mid-Level Professional',
          description: `Progress to Senior ${dreamJob.title} with increased responsibilities.`,
          activities: [
            'Lead small projects',
            'Mentor juniors',
            'Specialize in niche',
            'Build industry reputation'
          ],
          skills: ['Project Management', 'Specialization', 'Leadership']
        },
        {
          year: 'Year 6-10',
          title: 'Senior Leadership',
          description: `Reach positions like Team Lead, Manager, or Principal ${dreamJob.title}.`,
          activities: [
            'Lead large teams',
            'Strategic planning',
            'Cross-functional collaboration',
            'Industry speaking'
          ],
          skills: ['Strategic Leadership', 'People Management', 'Business Acumen']
        },
        {
          year: 'Year 10+',
          title: 'Executive Level',
          description: `Reach C-suite, Director, or start your own consulting firm.`,
          activities: [
            'Executive decision making',
            'Board participation',
            'Industry thought leadership',
            'Strategic partnerships'
          ],
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Language Switcher */}
        <div className="flex justify-end mb-6 space-x-2">
          {['en', 'si', 'ta'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                language === lang
                  ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'si' ? 'සිංහල' : 'தமிழ்'}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.roadmap}</h1>
          <p className="text-gray-600 text-lg">
            Your personalized academic and future goal pathway
          </p>
        </div>

        {/* Path Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Choose Your Path</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedPath('academic')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedPath === 'academic'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-3xl mb-2">🎓</div>
              <h3 className="font-bold text-gray-800">Academic Path</h3>
              <p className="text-sm text-gray-600">Research & Teaching</p>
            </button>
            <button
              onClick={() => setSelectedPath('entrepreneurial')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedPath === 'entrepreneurial'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-bold text-gray-800">Entrepreneurial</h3>
              <p className="text-sm text-gray-600">Start Your Own Business</p>
            </button>
            <button
              onClick={() => setSelectedPath('industry')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedPath === 'industry'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-3xl mb-2">💼</div>
              <h3 className="font-bold text-gray-800">Industry Professional</h3>
              <p className="text-sm text-gray-600">Corporate Future Goal</p>
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentRoadmap.title}</h2>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full" />
            
            {/* Milestones */}
            <div className="space-y-8">
              {currentRoadmap.milestones.map((milestone, index) => (
                <div key={index} className="relative flex items-start ml-16">
                  {/* Timeline Dot */}
                  <div className="absolute -left-12 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                  
                  {/* Milestone Card */}
                  <div className="flex-1 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-sm bg-purple-600 text-white px-3 py-1 rounded-full">
                          {milestone.year}
                        </span>
                        <h3 className="text-xl font-bold text-gray-800 mt-2">{milestone.title}</h3>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{milestone.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Key Activities</h4>
                        <ul className="space-y-1">
                          {milestone.activities.map((activity, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center">
                              <span className="w-2 h-2 bg-purple-600 rounded-full mr-2" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Skills to Develop</h4>
                        <div className="flex flex-wrap gap-2">
                          {milestone.skills.map((skill, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
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

        {/* Additional Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Bridging Courses */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Bridging Courses</h3>
            <div className="space-y-3">
              {bridgingCourses.map((course, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{course.name}</p>
                    <p className="text-sm text-gray-600">{course.provider} • {course.duration}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      course.relevance >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.relevance}% relevant
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Micro-Credentials */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Micro-Credentials</h3>
            <div className="space-y-3">
              {microCredentials.map((credential, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{credential.name}</p>
                    <p className="text-sm text-gray-600">{credential.issuer} • Valid: {credential.validity}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      credential.demand === 'High' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {credential.demand} demand
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Results
          </button>

          <button
            onClick={onHome}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>

          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
          >
            📄 Print Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}
