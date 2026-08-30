import { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../src/firebase';
import MentorshipMatching from '../components/MentorshipMatching';

const MentorshipPage = ({ onBack }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(9);
  
  // Get unique values for filters
  const [allFields, setAllFields] = useState([]);
  const [allLocations, setAllLocations] = useState([]);

  // Fetch real students from Firestore
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        
        // Try multiple collection names
        const collectionsToTry = ['assessmentResults', 'assessments', 'students', 'mentees'];
        let querySnapshot = null;
        let foundCollection = '';
        
        for (const collName of collectionsToTry) {
          try {
            console.log(`Trying collection: ${collName}`);
            // First try without status filter
            let q = query(collection(db, collName));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              querySnapshot = snapshot;
              foundCollection = collName;
              console.log(`✅ Found data in collection: ${collName} (${snapshot.size} docs)`);
              break;
            }
          } catch (e) {
            console.log(`Collection ${collName} not accessible:`, e.message);
          }
        }
        
        if (!querySnapshot) {
          console.warn('No data found in any collection');
          setStudents([]);
          setLoading(false);
          return;
        }
        const studentsData = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Handle Firestore array/object conversion
          const parseArrayField = (field) => {
            if (!field) return [];
            if (Array.isArray(field)) return field;
            // Firestore sometimes stores arrays as objects with numeric keys
            if (typeof field === 'object') {
              return Object.values(field);
            }
            return [];
          };
          
          // Transform the data to match the expected mentee format
          studentsData.push({
            id: doc.id,
            mentee_id: doc.id,
            name: data.name || 'Anonymous',
            email: data.email || '',
            university: data.alResults?.university || data.university || 'Unknown University',
            field_of_study: data.alResults?.stream || data.stream || 'General',
            career_goals: parseArrayField(data.careerAspirations),
            interests: parseArrayField(data.interests),
            location: data.locationPreference || data.location || 'Not specified',
            personality_traits: data.personalityTraits || {},
            work_environment: data.workEnvironment || 'Not specified',
            social_interaction: data.socialInteraction || 'Not specified',
            z_score: data.zScore || data.z_score || '0',
            al_results: data.alResults || {},
            stress_tolerance: data.stressTolerance || 3,
            travel_tolerance: data.travelTolerance || 'Not specified',
            status: data.status,
            raw_data: data // Keep raw data for reference
          });
        });
        
        setStudents(studentsData);
        setFilteredStudents(studentsData);
        
        // Extract unique values for filters
        const fields = [...new Set(studentsData.map(s => s.field_of_study || 'General').filter(Boolean))].sort();
        const locations = [...new Set(studentsData.map(s => s.location || 'Not specified').filter(Boolean))].sort();
        setAllFields(fields);
        setAllLocations(locations);
        
        console.log(`✅ Fetched ${studentsData.length} students from Firestore`);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);
  
  // Apply filters
  useEffect(() => {
    let filtered = students;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.interests || []).some(interest => 
          interest.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Field filter
    if (selectedField !== 'all') {
      filtered = filtered.filter(student => student.field_of_study === selectedField);
    }
    
    // Location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(student => student.location === selectedLocation);
    }
    
    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [students, searchTerm, selectedField, selectedLocation]);
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedField('all');
    setSelectedLocation('all');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">AI Mentorship Matching</span>
                <p className="text-xs text-gray-500">Powered by ML Model</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {students.length} Students Available
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-900">How it works</h3>
              <p className="text-sm text-blue-700 mt-1">
                The ML model analyzes student profiles (AL results, interests, personality traits) 
                and matches them with the most compatible mentors from our database of 11,000+ mentors.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading students from database...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Professional Filters Section */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Student Database</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {filteredStudents.length} of {students.length} students
                  </span>
                  {(searchTerm || selectedField !== 'all' || selectedLocation !== 'all') && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name, email, or interests..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
                
                {/* Field Filter */}
                <div>
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    <option value="all">All Fields</option>
                    {allFields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
                
                {/* Location Filter */}
                <div>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    <option value="all">All Locations</option>
                    {allLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Results Display */}
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p>No completed student assessments found in the database.</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No students match your current filters.</p>
                  <button
                    onClick={resetFilters}
                    className="mt-2 text-purple-600 hover:text-purple-800 font-medium text-sm"
                  >
                    Clear filters to see all students
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {currentStudents.map((student) => (
                      <div key={student.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-lg font-bold text-purple-700">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-600">{student.field_of_study}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-600 truncate">{student.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-gray-600">{student.location}</span>
                          </div>
                          <div className="flex items-start gap-1">
                            <svg className="w-3 h-3 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-gray-600 line-clamp-2">
                              {(student.interests || []).slice(0, 3).join(', ') || 'No interests'}
                            </span>
                          </div>
                          {student.al_results?.physics && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-600">Physics: {student.al_results.physics}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {[...Array(totalPages)].map((_, i) => {
                            const page = i + 1;
                            const isCurrentPage = page === currentPage;
                            const isNearCurrent = Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
                            
                            if (!isNearCurrent && i > 0 && i < totalPages - 1) {
                              return <span key={page} className="px-2 text-gray-400">...</span>;
                            }
                            
                            if (isNearCurrent) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    isCurrentPage
                                      ? 'bg-purple-600 text-white'
                                      : 'border border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            }
                            return null;
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ML Matching Component */}
            <MentorshipMatching 
              externalStudents={students} 
              showRawData={true}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MentorshipPage;
