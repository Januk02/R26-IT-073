import MentorStudentChat from '../components/MentorStudentChat';
import { useAuth } from '../contexts/AuthContext';

export default function ChatHub({ onBack, initialMentor = null }) {
  const { userRole } = useAuth();
  const isMentor = userRole === 'mentor';

  return (
    <>
      <style>{`
        .chathub-page {
          min-height: 100vh;
          background: #f8faff;
          padding: 20px 28px;
          display: flex;
          flex-direction: column;
        }

        .chathub-container {
          max-width: 1240px;
          width: 100%;
          margin: 0 auto;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chathub-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .chathub-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .chathub-title {
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
        }

        .chathub-sub {
          font-size: 13px;
          color: #64748b;
          margin-top: 2px;
        }

        .chathub-back-btn {
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .chathub-back-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        @media (max-width: 768px) {
          .chathub-page {
            padding: 12px 10px;
          }
          .chathub-title {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="chathub-page">
        <div className="chathub-container">
          {/* Header */}
          <div className="chathub-header">
            <div>
              <div className="chathub-title-row">
                {onBack && (
                  <button onClick={onBack} className="chathub-back-btn">
                    ← Dashboard
                  </button>
                )}
                <h1 className="chathub-title">
                  💬 {isMentor ? 'Student Mentorship Messages' : 'Mentor Guidance Chat'}
                </h1>
              </div>
              <p className="chathub-sub">
                Real-time 1-on-1 academic and career consultations powered by Firebase Firestore
              </p>
            </div>
          </div>

          {/* Chat Component */}
          <MentorStudentChat initialMentor={initialMentor} isEmbedded={false} />
        </div>
      </div>
    </>
  );
}
