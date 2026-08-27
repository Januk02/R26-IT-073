import { useState } from 'react';
import CoursesHome from './pages/CoursesHome';
import CourseDetail from './pages/CourseDetail';
import MyLearning from './pages/MyLearning';

export default function Member2CoursePlatform({ onBack }) {
  const [view, setView] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setView('detail');
  };

  const handleEnroll = (course) => {
    setEnrolledCourses(prev =>
      prev.find(c => c.id === course.id) ? prev : [...prev, course]
    );
  };

  return (
    <div>
      {view === 'home' && (
        <CoursesHome
          onSelectCourse={handleSelectCourse}
          onViewMyLearning={() => setView('mylearning')}
        />
      )}
      {view === 'detail' && selectedCourse && (
        <CourseDetail
          course={selectedCourse}
          onBack={() => setView('home')}
          onEnroll={handleEnroll}
        />
      )}
      {view === 'mylearning' && (
        <MyLearning
          enrolledCourses={enrolledCourses}
          onBack={() => setView('home')}
          onResume={handleSelectCourse}
        />
      )}
    </div>
  );
}
