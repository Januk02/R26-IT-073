import { useState } from 'react';
import MentorHub from './pages/MentorHub';
import MentorStudentChat from '../src/components/MentorStudentChat';

export default function Member4MentorHub({ onBack, onNavigateToMessages }) {
  const [selectedMentor, setSelectedMentor] = useState(null);

  const handleSelectMentor = (mentor) => {
    if (onNavigateToMessages) {
      onNavigateToMessages(mentor);
    } else {
      setSelectedMentor(mentor);
    }
  };

  if (selectedMentor) {
    return (
      <div style={{ padding: '24px 32px' }}>
        <button
          onClick={() => setSelectedMentor(null)}
          style={{
            marginBottom: 16,
            padding: '8px 16px',
            background: 'white',
            border: '1.5px solid #e2e8f0',
            borderRadius: 10,
            cursor: 'pointer',
            fontWeight: 700,
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          ← Back to Mentor Directory
        </button>
        <MentorStudentChat initialMentor={selectedMentor} isEmbedded={false} />
      </div>
    );
  }

  return <MentorHub onSelectMentor={handleSelectMentor} />;
}
