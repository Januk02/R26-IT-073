import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  Compass,
  GraduationCap,
  Layers3,
  MessageSquare,
  Search,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  findAndAssignMentorsForStudent,
  subscribeToStudentMatches,
  syncStudentMatchingProfile,
} from "../services/mentorMatchingService";
import studyfyxLogo from "../assets/studyfyxlogo.png";
import "./StudentDashboard.css";

export default function StudentDashboard({
  onStartDreamDegreeAdvisor,
  onNavigateToCourses,
  onNavigateToAnalytics,
  onNavigateToMentorHub,
  onNavigateToMessages,
}) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All tools");
  const [matchedMentors, setMatchedMentors] = useState([]);
  const [matchError, setMatchError] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const firstName =
    user?.displayName?.trim().split(/\s+/)[0] ||
    user?.email?.split("@")[0] ||
    "Student";
  const initial = firstName.charAt(0).toUpperCase();
  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  const modules = [
    {
      id: "degree",
      icon: GraduationCap,
      category: "Planning",
      label: "DEGREE & UNIVERSITY",
      title: "Dream Degree Advisor",
      description:
        "Connect your A/L profile and career goal with degree pathways, university options and a practical roadmap.",
      action: "Explore my degree path",
      onClick: onStartDreamDegreeAdvisor,
      tone: "blue",
    },
    {
      id: "skills",
      icon: Target,
      category: "Planning",
      label: "CAREER & SKILLS",
      title: "Career Pathway",
      description:
        "Understand the skills your chosen career needs and find learning opportunities to help you move forward.",
      action: "Build my career plan",
      onClick: onNavigateToCourses,
      tone: "orange",
    },
    {
      id: "wellbeing",
      icon: Brain,
      category: "Wellbeing",
      label: "STUDY & BALANCE",
      title: "Study & Stress Analytics",
      description:
        "Explore your study patterns and wellbeing insights to create a more balanced approach to learning.",
      action: "Open my analytics",
      onClick: onNavigateToAnalytics,
      tone: "blue",
    },
    {
      id: "mentors",
      icon: Users,
      category: "Community",
      label: "PEOPLE & GUIDANCE",
      title: "Mentorship Hub",
      description:
        "Find mentors who can help you understand your options, strengthen your skills and plan your next step.",
      action: "Explore mentors",
      onClick: onNavigateToMentorHub,
      tone: "orange",
    },
    {
      id: "messages",
      icon: MessageSquare,
      category: "Community",
      label: "CONVERSATIONS",
      title: "Mentor Messages",
      description:
        "Keep your questions, feedback and conversations with mentors together in one place.",
      action: "Open messages",
      onClick: onNavigateToMessages || onNavigateToMentorHub,
      tone: "blue",
    },
  ];
  const visibleModules = modules.filter(
    (module) =>
      (category === "All tools" || module.category === category) &&
      `${module.title} ${module.description} ${module.label}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const journey = [
    {
      title: "Find your direction",
      text: "Start with your subjects and future goal.",
      icon: Compass,
      action: onStartDreamDegreeAdvisor,
    },
    {
      title: "Build your capabilities",
      text: "Turn your career plan into useful skills.",
      icon: BookOpen,
      action: onNavigateToCourses,
    },
    {
      title: "Learn with guidance",
      text: "Get perspective from a mentor.",
      icon: Users,
      action: onNavigateToMentorHub,
    },
  ];

  useEffect(() => {
    if (!user?.uid) return undefined;

    const unsubscribe = subscribeToStudentMatches(
      user.uid,
      setMatchedMentors,
      (error) => {
        console.warn("Could not load mentor matches:", error);
        setMatchError("Matched mentors are temporarily unavailable.");
      },
    );

    syncStudentMatchingProfile(user.uid)
      .then((profile) => profile && findAndAssignMentorsForStudent(user.uid))
      .catch((error) => {
        console.warn(
          "Could not sync student profile or auto-assign mentors:",
          error,
        );
      });

    return unsubscribe;
  }, [user?.uid]);

  const handleRefreshMentors = async () => {
    if (!user?.uid) return;
    setIsMatching(true);
    setMatchError("");
    try {
      await syncStudentMatchingProfile(user.uid);
      await findAndAssignMentorsForStudent(user.uid);
    } catch (error) {
      setMatchError("Failed to refresh mentor matches. Please try again.");
      console.error("Error refreshing mentors:", error);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="study-dashboard">
      <header className="sd-topbar">
        <div className="sd-brand">
          <img src={studyfyxLogo} alt="Studyfyx" />
          <span className="sd-brand-divider" />
          <div>
            <span className="sd-eyebrow">YOUR PERSONAL WORKSPACE</span>
            <p>Student dashboard</p>
          </div>
        </div>
        <div className="sd-topbar-right">
          <span className="sd-date">
            <CalendarDays size={15} aria-hidden="true" />
            {today.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="sd-avatar" aria-label={`Signed in as ${firstName}`}>
            {initial}
          </span>
        </div>
      </header>

      <div className="sd-content">
        <div className="sd-welcome">
          <div>
            <p>
              {greeting}, <strong>{firstName}</strong>
            </p>
            <h1>A clearer direction. A stronger future.</h1>
          </div>
          <span className="sd-workspace-label">
            <Layers3 size={15} aria-hidden="true" /> Your learning workspace
          </span>
        </div>

        <section className="sd-hero" aria-labelledby="sd-hero-title">
          <div className="sd-hero-copy">
            <span className="sd-hero-kicker">
              <Sparkles size={14} aria-hidden="true" /> PURPOSEFUL PLANNING,
              PERSONAL TO YOU
            </span>
            <h2 id="sd-hero-title">
              Big ambitions.
              <br />
              <span>Clear next steps.</span>
            </h2>
            <p>
              Bring your education, skills and career goals together. Start with
              a direction, then build a path that works for you.
            </p>
            <button
              type="button"
              className="sd-primary"
              onClick={onStartDreamDegreeAdvisor}
            >
              Plan my future <ArrowRight size={17} aria-hidden="true" />
            </button>
            <span className="sd-hero-footnote">
              <Check size={14} aria-hidden="true" /> Degree pathways · Career
              skills · Personal guidance
            </span>
          </div>
          <div className="sd-hero-visual">
            <div className="sd-path-heading">
              <span className="sd-path-icon">
                <Compass size={22} aria-hidden="true" />
              </span>
              <div>
                <span>THE BIG PICTURE</span>
                <h3>Your ambition, connected.</h3>
              </div>
            </div>
            <div className="sd-path-line">
              {journey.map((step, index) => (
                <div className="sd-path-stop" key={step.title}>
                  <span className={`sd-path-number sd-path-number-${index}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="sd-path-note">
              <span /> A pathway you can make your own.
            </div>
          </div>
        </section>

        <section
          className="mb-8 rounded-xl border border-teal-200 bg-white p-5 shadow-sm md:p-7"
          aria-labelledby="mentor-matches-heading"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-teal-700">
                Your mentor matches
              </p>
              <h2
                id="mentor-matches-heading"
                className="mt-1 text-xl font-extrabold text-slate-900"
              >
                Guidance matched to your goals
              </h2>
            </div>
            <button
              type="button"
              onClick={handleRefreshMentors}
              disabled={isMatching}
              className="rounded-md border border-teal-300 px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-50"
            >
              {isMatching
                ? "Refreshing..."
                : matchedMentors.length
                  ? "Refresh Matches"
                  : "Find Mentors"}
            </button>
          </div>
          {matchedMentors.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {matchedMentors.map((match) => (
                <article
                  key={match.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4"
                >
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-900">
                      {match.mentorName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {match.mentorSpecialization}
                      {match.mentorHighestDegree
                        ? ` · ${match.mentorHighestDegree}`
                        : ""}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-teal-700">
                      {Math.round(match.compatibilityScore || 0)}% compatibility
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigateToMessages?.({
                        uid: match.mentorId,
                        name: match.mentorName,
                        field: match.mentorField,
                      })
                    }
                    className="shrink-0 rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    Open chat
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              No mentors matched yet. Use “Find Mentors” to refresh
              recommendations based on your profile.
            </p>
          )}
          {matchError && (
            <p
              role="status"
              className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800"
            >
              {matchError}
            </p>
          )}
        </section>

        <div className="sd-workspace-grid">
          <section className="sd-tools" aria-labelledby="sd-tools-heading">
            <div className="sd-section-heading">
              <div>
                <span className="sd-eyebrow">BUILT AROUND YOUR NEXT STEP</span>
                <h2 id="sd-tools-heading">Your tools, all in one place</h2>
              </div>
              <span className="sd-tool-count">{modules.length} tools</span>
            </div>
            <div className="sd-tools-controls">
              <div
                className="sd-filters"
                role="group"
                aria-label="Filter tools"
              >
                {["All tools", "Planning", "Wellbeing", "Community"].map(
                  (item) => (
                    <button
                      type="button"
                      key={item}
                      aria-pressed={category === item}
                      onClick={() => setCategory(item)}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
              <div className="sd-search">
                <Search size={16} aria-hidden="true" />
                <input
                  aria-label="Search dashboard tools"
                  type="search"
                  placeholder="Find a tool…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear tool search"
                    onClick={() => setQuery("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <p className="sd-sr-only" role="status">
              {visibleModules.length} tools shown
            </p>
            <div className="sd-tool-grid">
              {visibleModules.map((module) => {
                const Icon = module.icon;
                return (
                  <article
                    className={`sd-tool-card sd-tool-${module.tone}`}
                    key={module.id}
                    data-tool={module.id}
                  >
                    <div className="sd-tool-card-top">
                      <span className="sd-tool-icon">
                        <Icon size={23} strokeWidth={1.7} aria-hidden="true" />
                      </span>
                      <span>{module.category}</span>
                    </div>
                    <span className="sd-tool-label">{module.label}</span>
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                    <button
                      type="button"
                      onClick={module.onClick}
                      className="sd-tool-action"
                    >
                      {module.action}
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </button>
                  </article>
                );
              })}
            </div>
            {!visibleModules.length && (
              <div className="sd-empty">
                <Search size={24} aria-hidden="true" />
                <h3>No matching tools</h3>
                <p>Try a different search or view all your tools.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory("All tools");
                  }}
                >
                  Reset filters
                </button>
              </div>
            )}
          </section>

          <aside className="sd-aside" aria-label="Planning guidance">
            <section className="sd-guide">
              <span className="sd-eyebrow">A LITTLE STRUCTURE HELPS</span>
              <h2>Start with what matters.</h2>
              <p>
                You don’t have to figure everything out at once. Take one useful
                step today.
              </p>
              <ol>
                {journey.map((step, index) => (
                  <li key={step.title}>
                    <button type="button" onClick={step.action}>
                      <span className="sd-guide-number">{index + 1}</span>
                      <span>
                        <strong>{step.title}</strong>
                        <span>{step.text}</span>
                      </span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ol>
            </section>
            <section className="sd-mentor-note">
              <span className="sd-mentor-icon">
                <MessageSquare size={22} aria-hidden="true" />
              </span>
              <h2>A conversation can open a new direction.</h2>
              <p>
                Bring your questions to someone who has been there. Explore
                mentors and find a perspective that helps.
              </p>
              <button type="button" onClick={onNavigateToMentorHub}>
                Find guidance <ArrowRight size={16} aria-hidden="true" />
              </button>
            </section>
          </aside>
        </div>
        <footer className="sd-footer">
          <span>
            Studyfyx <span aria-hidden="true">/</span> Built for your next
            chapter.
          </span>
          <span>Plan thoughtfully. Grow confidently.</span>
        </footer>
      </div>
    </div>
  );
}
