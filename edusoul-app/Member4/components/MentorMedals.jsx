import { useState, useEffect } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../src/firebase";
import MedalBadge, { getMedalTier, getMedalInfo } from "./MedalBadge";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Mic,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

const MentorMedals = ({ mentorId, publicView = false }) => {
  const { user } = useAuth();
  const [medals, setMedals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedal, setSelectedMedal] = useState(null);
  const [stats, setStats] = useState({
    totalVerifications: 0,
    averageScore: 0,
    highestTier: null,
    bestVerification: null,
    interviewCount: 0,
    cvCount: 0,
    interviewAvg: 0,
    cvAvg: 0,
    combinedScore: 0,
  });

  const targetMentorId = mentorId || user?.uid;

  useEffect(() => {
    if (targetMentorId) {
      fetchMedals();
    }
  }, [targetMentorId]);

  const fetchMedals = async () => {
    try {
      setLoading(true);

      const pendingKey = `pendingCvVerification:${targetMentorId}`;
      const pendingWrite = localStorage.getItem(pendingKey);
      if (pendingWrite) {
        const pendingVerifications = JSON.parse(pendingWrite);
        const records = Array.isArray(pendingVerifications)
          ? pendingVerifications
          : [pendingVerifications];
        const saveResults = await Promise.allSettled(
          records.map((pendingVerification) =>
            setDoc(
              doc(db, "cvVerifications", pendingVerification.id),
              pendingVerification,
            ).then(() => pendingVerification.id),
          ),
        );
        const savedIds = saveResults
          .filter(({ status }) => status === "fulfilled")
          .map(({ value }) => value);
        const remaining = records.filter(({ id }) => !savedIds.includes(id));
        if (remaining.length > 0) {
          localStorage.setItem(pendingKey, JSON.stringify(remaining));
        } else {
          localStorage.removeItem(pendingKey);
        }
      }

      // Fetch interview verifications
      const interviewQuery = query(
        collection(db, "verifications"),
        where("mentorId", "==", targetMentorId),
      );
      const interviewSnapshot = await getDocs(interviewQuery);
      const interviews = interviewSnapshot.docs.map((doc) => ({
        ...doc.data(),
        type: "interview",
        id: doc.id,
      }));

      // Fetch CV verifications
      const cvQuery = query(
        collection(db, "cvVerifications"),
        where("mentorId", "==", targetMentorId),
      );
      const cvSnapshot = await getDocs(cvQuery);
      const cvs = cvSnapshot.docs.map((doc) => ({
        ...doc.data(),
        type: "cv",
        id: doc.id,
      }));

      // Combine all verifications
      const allVerifications = [...interviews, ...cvs];

      // Sort by date (newest first)
      allVerifications.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.uploadedAt);
        const dateB = new Date(b.createdAt || b.uploadedAt);
        return dateB - dateA;
      });

      // Calculate stats
      const earnedMedals = allVerifications.map((v) => ({
        ...v,
        tier: getMedalTier(v.score || v.overallScore || 0),
        score: v.score || v.overallScore || 0,
        date: v.createdAt || v.uploadedAt || new Date().toISOString(),
      }));

      // Find highest tier
      const tierHierarchy = [
        "platinum",
        "gold",
        "silver",
        "bronze",
        "rising",
        "participant",
      ];
      let highestTier = null;
      for (const tier of tierHierarchy) {
        if (earnedMedals.some((m) => m.tier === tier)) {
          highestTier = tier;
          break;
        }
      }

      // Separate interview and CV medals for specific averages
      const interviewMedals = earnedMedals.filter((m) => m.type === "interview");
      const cvMedals = earnedMedals.filter((m) => m.type === "cv");

      const interviewAvg =
        interviewMedals.length > 0
          ? interviewMedals.reduce((sum, m) => sum + m.score, 0) /
            interviewMedals.length
          : 0;

      const highestInterviewScore =
        interviewMedals.length > 0
          ? Math.max(...interviewMedals.map((m) => m.score))
          : 0;

      const cvAvg =
        cvMedals.length > 0
          ? cvMedals.reduce((sum, m) => sum + m.score, 0) / cvMedals.length
          : 0;

      const currentInterviewScore = highestInterviewScore || interviewAvg;

      const combinedScore =
        interviewMedals.length > 0 && cvMedals.length > 0
          ? currentInterviewScore * 0.6 + cvAvg * 0.4
          : interviewMedals.length > 0
            ? currentInterviewScore
            : cvAvg;

      const avgScore =
        earnedMedals.length > 0
          ? earnedMedals.reduce((sum, m) => sum + m.score, 0) /
            earnedMedals.length
          : 0;

      const bestVerification =
        earnedMedals.length > 0
          ? earnedMedals.reduce((best, current) =>
              current.score > best.score ? current : best,
            )
          : null;

      setMedals(earnedMedals);
      setStats({
        totalVerifications: earnedMedals.length,
        averageScore: Math.round(avgScore),
        highestTier,
        bestVerification,
        interviewCount: interviewMedals.length,
        cvCount: cvMedals.length,
        interviewAvg: Math.round(interviewAvg),
        cvAvg: Math.round(cvAvg),
        combinedScore: Math.round(combinedScore),
        currentInterviewScore: Math.round(currentInterviewScore),
      });
    } catch (error) {
      console.error("Error fetching medals:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (medals.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600">
          <Award size={32} strokeWidth={1.8} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-1">
          No Verification Medals Yet
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Complete your AI oral interview and upload your CV to earn verified faculty credentials and unlock student matching.
        </p>
      </div>
    );
  }

  const currentTier = getMedalTier(stats.combinedScore);
  const stageOrder = [
    "participant",
    "rising",
    "bronze",
    "silver",
    "gold",
    "platinum",
  ];
  const currentIndex = stageOrder.indexOf(currentTier);
  const displayStages = [
    ...new Set([
      currentTier,
      stageOrder[Math.max(0, currentIndex - 1)],
      stageOrder[Math.min(stageOrder.length - 1, currentIndex + 1)],
    ]),
  ];

  const displayMedals = displayStages.map((tier) => ({
    tier,
    score: stats.combinedScore,
    date: new Date().toISOString(),
    type: "current-stage",
    id: `stage-${tier}`,
  }));

  return (
    <div className="space-y-8">
      {/* ── 4 Executive Telemetry Metrics Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-purple-200/80 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <p className="text-3xl font-black text-purple-700 tracking-tight">
            {stats.totalVerifications}
          </p>
          <p className="text-xs text-purple-900 font-bold uppercase tracking-wider mt-1">
            Total Verifications
          </p>
          <div className="flex items-center gap-2 mt-2.5 text-xs text-purple-600 font-semibold">
            <span className="bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">{stats.interviewCount} Interview</span>
            <span>•</span>
            <span className="bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">{stats.cvCount} CV</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-blue-300 shadow-sm ring-2 ring-blue-500/10 transition-all hover:shadow-md hover:-translate-y-1">
          <p className="text-3xl font-black text-blue-700 tracking-tight">
            {stats.combinedScore}%
          </p>
          <p className="text-xs font-black text-blue-900 uppercase tracking-wider mt-1">
            Current Stage Score
          </p>
          {(stats.interviewAvg > 0 || stats.cvAvg > 0) && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-blue-700 font-bold">
              {stats.currentInterviewScore > 0 && (
                <span className="bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">Best: {stats.currentInterviewScore}%</span>
              )}
              {stats.cvAvg > 0 && (
                <span className="bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">CV: {stats.cvAvg}%</span>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <p className="text-3xl font-black text-emerald-700 tracking-tight">
            {displayMedals.length}
          </p>
          <p className="text-xs text-emerald-900 font-bold uppercase tracking-wider mt-1">Medals Earned</p>
          <div className="mt-2.5 text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <span className="bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">Verified Pedagogy</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-300 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <p className="text-xl font-black text-amber-700 truncate tracking-tight">
            {getMedalInfo(getMedalTier(stats.combinedScore)).name}
          </p>
          <p className="text-xs font-black text-amber-900 uppercase tracking-wider mt-1">
            Overall Combined Rank
          </p>
          <div className="mt-2.5 text-xs text-amber-700 font-bold flex items-center gap-1">
            <span className="bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-100">Accredited Tier</span>
          </div>
        </div>
      </div>

      {/* ── Main Combined Score & Accreditation Status Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-7 text-white shadow-2xl relative overflow-hidden border border-purple-800/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 flex-shrink-0 bg-white/10 rounded-2xl p-2 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <MedalBadge
                tier={getMedalTier(stats.combinedScore)}
                size="sm"
                showLabel={false}
                animated={true}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs uppercase tracking-wider font-extrabold text-purple-200 bg-purple-500/30 px-3 py-1 rounded-full border border-purple-300/30">
                  Primary Mentor Status
                </span>
                {stats.interviewCount > 0 && stats.cvCount > 0 ? (
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    ✓ Full Dual-Evaluation (Interview 60% + CV 40%)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                    ⚠️ Partial Evaluation
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                Current Stage:{" "}
                <span className="text-yellow-300">
                  {getMedalInfo(getMedalTier(stats.combinedScore)).name}
                </span>
              </h3>
              <p className="text-purple-100 text-xs sm:text-sm mt-1">
                Current Combined Score:{" "}
                <span className="font-extrabold text-white text-base">
                  {stats.combinedScore}%
                </span>
                <span className="text-purple-300 text-xs ml-2">
                  (Best Oral Interview: {stats.currentInterviewScore || stats.interviewAvg}% × 60% • CV Analysis: {stats.cvAvg}% × 40%)
                </span>
              </p>
            </div>
          </div>

          {/* Qualification Verdict */}
          <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
            {stats.combinedScore >= 70 ? (
              <div className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 px-5 py-3 rounded-2xl backdrop-blur-md text-left md:text-right w-full md:w-auto shadow-lg">
                <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                  Accreditation Verdict
                </p>
                <p className="text-base font-black text-emerald-100 flex items-center gap-2 mt-0.5">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <span>QUALIFIED FACULTY MENTOR</span>
                </p>
              </div>
            ) : (
              <div className="bg-amber-500/25 border border-amber-400/50 text-amber-100 px-5 py-3 rounded-2xl backdrop-blur-md text-left md:text-right w-full md:w-auto shadow-lg">
                <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                  Accreditation Verdict — 70% Required
                </p>
                <p className="text-base font-black text-amber-200 flex items-center gap-2 mt-0.5">
                  <AlertTriangle size={18} className="text-amber-400" />
                  <span>Needs Re-attempt (&lt; 70%)</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-purple-700/40 text-xs text-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>
            {stats.combinedScore >= 70
              ? "Accreditation active. Your profile is automatically prioritized in AI Mentee Matching."
              : `Your overall mentor qualification is based on the combined score (Interview 60% + CV 40%). Current score is ${stats.combinedScore}%. Minimum 70% required.`}
          </span>
          {stats.combinedScore < 70 && (
            <span className="font-bold text-yellow-300 bg-yellow-400/20 px-3 py-1 rounded-lg border border-yellow-400/30 text-xs flex-shrink-0">
              Breakdown: Interview {stats.interviewAvg}% | CV {stats.cvAvg}%
            </span>
          )}
        </div>
      </div>

      {/* ── Medal Honors Showcase ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award size={20} className="text-purple-600" />
            Faculty Medal Collection & Honors
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            Click any medal to view cryptographic certificate
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Featured Combined Score Medal Card */}
          <div
            className="cursor-pointer transform hover:scale-105 transition-all bg-gradient-to-b from-purple-50 via-white to-purple-50/40 p-4 rounded-2xl border-2 border-purple-400 shadow-md text-center relative group"
            onClick={() =>
              setSelectedMedal({
                tier: getMedalTier(stats.combinedScore),
                score: stats.combinedScore,
                date: new Date().toISOString(),
                type: "combined",
                id: "combined-final",
              })
            }
          >
            <span className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-purple-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
              Overall Rank
            </span>
            <div className="mt-2">
              <MedalBadge
                tier={getMedalTier(stats.combinedScore)}
                size="md"
                showLabel={true}
                animated={true}
              />
            </div>
            <p className="text-xs font-black text-purple-900 mt-2">
              {stats.combinedScore}% Combined
            </p>
          </div>

          {displayMedals.map((medal, index) => (
            <div
              key={index}
              className="cursor-pointer transform hover:scale-105 transition-all bg-white p-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-lg text-center"
              onClick={() => setSelectedMedal(medal)}
            >
              <MedalBadge
                tier={medal.tier}
                size="md"
                showLabel={true}
                animated={false}
              />
              <p className="text-[11px] font-bold text-slate-500 text-center mt-2">
                Stage {index + 1}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── High-Tech Recent Verification Audit Stream ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-600" />
            <h4 className="font-bold text-slate-900 text-sm">Recent Faculty Verifications Stream</h4>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {medals.length} Total Records
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {medals.slice(0, 5).map((medal, index) => (
            <div
              key={index}
              className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors cursor-pointer"
              onClick={() => setSelectedMedal(medal)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex-shrink-0">
                  <MedalBadge tier={medal.tier} size="sm" showLabel={false} />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {getMedalInfo(medal.tier).name}
                  </p>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        medal.type === "cv"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {medal.type === "cv" ? "CV & Skill Audit" : "AI Oral Assessment"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(medal.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="font-black text-slate-900 text-base">
                    {Math.round(medal.score)}%
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Verdict Score</p>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Luxury Credential Detail Modal ── */}
      {selectedMedal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMedal(null)}
        >
          <div
            className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedMedal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-3">
                <MedalBadge
                  tier={selectedMedal.tier}
                  size="lg"
                  showLabel={false}
                  animated={true}
                />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {getMedalInfo(selectedMedal.tier).name}
              </h3>
              <p className="text-purple-700 font-extrabold text-base mt-0.5">
                Evaluation Score: {Math.round(selectedMedal.score)}%
              </p>
            </div>

            <div className="space-y-2.5 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Evaluation Type</span>
                <span className="font-bold text-slate-900">
                  {selectedMedal.type === "combined"
                    ? "Overall Combined Rank"
                    : selectedMedal.type === "cv"
                    ? "CV & Skill Audit"
                    : "AI Oral Assessment"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Accreditation Date</span>
                <span className="font-bold text-slate-900">
                  {new Date(selectedMedal.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">Pedagogical Standing</span>
                <span className="font-bold text-purple-700 capitalize">
                  {selectedMedal.tier === "platinum"
                    ? "Exceptional Faculty Tier"
                    : selectedMedal.tier === "gold"
                    ? "Outstanding Faculty Tier"
                    : selectedMedal.tier === "silver"
                    ? "Strong Verified Tier"
                    : "Accredited Foundation"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedMedal(null)}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
            >
              Close Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorMedals;
