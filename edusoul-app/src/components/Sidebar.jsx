import { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Rocket,
  Brain,
  Users,
  MessageSquare,
  Globe,
  Sparkles,
  Info,
  Mic,
  FileText,
  Clock,
  WandSparkles,
  LogIn,
  LogOut,
  Menu,
  X,
  UserRound,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const SIDEBAR_WIDTH = 260;

const publicNav = [
  { id: "home", label: "Home", icon: Globe, section: "Explore" },
  {
    id: "features",
    label: "Features",
    icon: Sparkles,
    section: "Explore",
    anchor: true,
  },
  {
    id: "about",
    label: "About Us",
    icon: Info,
    section: "Explore",
    anchor: true,
  },
  {
    id: "students",
    label: "For Students",
    icon: GraduationCap,
    section: "Audiences",
    anchor: true,
  },
  {
    id: "mentors",
    label: "For Mentors",
    icon: Users,
    section: "Audiences",
    anchor: true,
  },
  {
    id: "login",
    label: "Dream Degree Advisor",
    icon: WandSparkles,
    section: "AI Tools",
    requiresAuth: true,
  },
];

const studentNav = [
  {
    id: "studentHome",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "Overview",
  },
  {
    id: "dreamDegreeAdvisor",
    label: "Dream Advisor",
    icon: GraduationCap,
    section: "AI Tools",
    accent: "#3B82F6",
  },
  {
    id: "courses",
    label: "Career Pathway",
    icon: Rocket,
    section: "AI Tools",
    accent: "#8B5CF6",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: Brain,
    section: "AI Tools",
    accent: "#0EA5E9",
  },
  {
    id: "mentorHub",
    label: "Mentor Hub",
    icon: Users,
    section: "Community",
    accent: "#14B8A6",
  },
  {
    id: "messages",
    label: "Messages",
    icon: MessageSquare,
    section: "Community",
    accent: "#94A3B8",
  },
];

const mentorNav = [
  { id: "home", label: "Home", icon: Globe, section: "Overview" },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "Overview",
  },
  {
    id: "messages",
    label: "Messages",
    icon: MessageSquare,
    section: "Overview",
  },
  {
    id: "verification",
    label: "Verification",
    icon: Mic,
    section: "Verification",
  },
  {
    id: "cvVerification",
    label: "CV Analysis",
    icon: FileText,
    section: "Verification",
  },
  {
    id: "mentorHub",
    label: "AI Matching",
    icon: Sparkles,
    section: "Mentorship",
  },
  {
    id: "mentorProfile",
    label: "Edit Profile",
    icon: UserRound,
    section: "Mentorship",
  },
  { id: "history", label: "History", icon: Clock, section: "Mentorship" },
];

// Group nav items by their section while preserving order
const groupBySection = (items) =>
  items.reduce((groups, item) => {
    const last = groups[groups.length - 1];
    if (last && last.section === item.section) last.items.push(item);
    else groups.push({ section: item.section, items: [item] });
    return groups;
  }, []);

export default function Sidebar({ currentView, setCurrentView }) {
  const { user, userRole, logout } = useAuth();
  const [open, setOpen] = useState(false); // mobile drawer

  const isAuth = !!user;
  const isMentor = userRole === "mentor";
  const navItems = !isAuth ? publicNav : isMentor ? mentorNav : studentNav;
  const groups = groupBySection(navItems);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";

  const handleNav = (item) => {
    if (item.anchor) {
      const el = document.getElementById(item.id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      setCurrentView(item.id);
    }
    setOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView("home");
  };

  const isActive = (id) => currentView === id;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        /* ── Hamburger (mobile only) ── */
        .sb-hamburger {
          display: none;
          position: fixed;
          top: 16px; left: 16px;
          z-index: 1100;
          background: rgba(11, 16, 32, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          width: 42px; height: 42px;
          align-items: center; justify-content: center;
          cursor: pointer;
          color: white;
        }

        /* ── Backdrop (mobile) ── */
        .sb-backdrop {
          display: none;
          position: fixed; inset: 0;
          background: rgba(2, 6, 23, 0.55);
          backdrop-filter: blur(2px);
          z-index: 900;
        }

        /* ── Sidebar shell ── */
        .sb-root {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: ${SIDEBAR_WIDTH}px;
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
          background:
            radial-gradient(120% 40% at 0% 0%, rgba(99, 102, 241, 0.22) 0%, transparent 60%),
            radial-gradient(90% 35% at 100% 100%, rgba(139, 92, 246, 0.16) 0%, transparent 65%),
            #0B1020;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          border-right: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
        }

        /* faint grid texture */
        .sb-root::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: linear-gradient(180deg, black 0%, transparent 40%);
          -webkit-mask-image: linear-gradient(180deg, black 0%, transparent 40%);
          pointer-events: none;
        }

        .sb-root > * { position: relative; z-index: 1; }

        /* ── Logo area ── */
        .sb-logo {
          display: flex; align-items: center; gap: 12px;
          padding: 22px 20px 18px;
        }

        .sb-logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 55%, #38BDF8 100%);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; font-weight: 800; color: white;
          flex-shrink: 0;
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45), inset 0 1px 0 rgba(255,255,255,0.3);
        }

        .sb-logo-text { line-height: 1.2; }

        .sb-logo-name {
          font-size: 17px; font-weight: 800;
          color: #F8FAFC;
          letter-spacing: -0.02em;
        }

        .sb-logo-name span {
          background: linear-gradient(135deg, #A5B4FC, #C4B5FD);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sb-logo-sub {
          font-size: 9px; letter-spacing: 1.8px;
          color: #64748B; font-weight: 700;
          margin-top: 2px;
        }

        /* ── Portal chip ── */
        .sb-portal {
          margin: 0 14px 6px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; gap: 10px;
        }

        .sb-portal-mark {
          width: 28px; height: 28px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .sb-portal.student .sb-portal-mark { background: rgba(99,102,241,0.18); color: #A5B4FC; }
        .sb-portal.mentor  .sb-portal-mark { background: rgba(139,92,246,0.18); color: #C4B5FD; }

        .sb-portal-text { flex: 1; min-width: 0; line-height: 1.25; }
        .sb-portal-title { font-size: 12.5px; font-weight: 700; color: #E2E8F0; }
        .sb-portal-sub { font-size: 10.5px; color: #64748B; font-weight: 500; }

        .sb-live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #22C55E;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.15);
          flex-shrink: 0;
        }

        /* ── Nav ── */
        .sb-nav { flex: 1; overflow-y: auto; padding: 4px 12px 12px; }
        .sb-nav::-webkit-scrollbar { width: 4px; }
        .sb-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        .sb-section-label {
          font-size: 10px; font-weight: 700;
          color: #475569; letter-spacing: 1.4px;
          text-transform: uppercase;
          padding: 16px 10px 8px;
        }

        .sb-item {
          position: relative;
          display: flex; align-items: center; gap: 11px;
          padding: 9px 10px;
          border-radius: 10px;
          cursor: pointer;
          margin-bottom: 2px;
          border: 1px solid transparent;
          font-size: 13.5px; font-weight: 600;
          color: #94A3B8;
          transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
        }

        .sb-item:hover {
          background: rgba(255,255,255,0.045);
          color: #F1F5F9;
        }

        .sb-item.active {
          color: #FFFFFF;
          background: linear-gradient(90deg, rgba(99,102,241,0.22) 0%, rgba(139,92,246,0.08) 100%);
          border-color: rgba(129,140,248,0.22);
        }

        /* gradient indicator bar */
        .sb-item.active::before {
          content: '';
          position: absolute;
          left: -12px; top: 50%;
          transform: translateY(-50%);
          width: 3px; height: 20px;
          border-radius: 0 4px 4px 0;
          background: linear-gradient(180deg, #818CF8, #C084FC);
          box-shadow: 0 0 12px rgba(129,140,248,0.8);
        }

        .sb-item-icon {
          width: 30px; height: 30px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: inherit;
          background: transparent;
          transition: all 0.2s ease;
        }

        .sb-item:hover .sb-item-icon {
          color: var(--item-accent, #A5B4FC);
          background: rgba(255,255,255,0.05);
        }

        .sb-item.active .sb-item-icon {
          color: #FFFFFF;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          box-shadow: 0 4px 12px rgba(99,102,241,0.4);
        }

        .sb-item-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* ── Login-required badge ── */
        .sb-login-badge {
          padding: 2px 7px;
          border-radius: 6px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.5px;
          background: rgba(251,191,36,0.12);
          color: #FBBF24;
          border: 1px solid rgba(251,191,36,0.22);
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── Bottom area ── */
        .sb-bottom {
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(2, 6, 23, 0.25);
        }

        .sb-auth-btn {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px; font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          margin-bottom: 8px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        .sb-auth-btn:last-child { margin-bottom: 0; }

        .sb-auth-btn.login {
          background: rgba(255,255,255,0.04);
          color: #E2E8F0;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .sb-auth-btn.login:hover { background: rgba(255,255,255,0.08); }

        .sb-auth-btn.register {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          border: none;
          box-shadow: 0 6px 18px rgba(99,102,241,0.35);
        }

        .sb-auth-btn.register:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(99,102,241,0.45);
        }

        /* User card */
        .sb-user {
          display: flex; align-items: center; gap: 10px;
          padding: 8px;
          border-radius: 12px;
          transition: background 0.2s ease;
        }

        .sb-user:hover { background: rgba(255,255,255,0.04); }

        .sb-user-avatar {
          position: relative;
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366F1, #A855F7);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; color: white;
          flex-shrink: 0;
        }

        .sb-user-avatar::after {
          content: '';
          position: absolute;
          right: -2px; bottom: -2px;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #22C55E;
          border: 2px solid #0B1020;
        }

        .sb-user-info { flex: 1; min-width: 0; line-height: 1.3; }

        .sb-user-name {
          font-size: 13px; font-weight: 700; color: #F1F5F9;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          text-transform: capitalize;
        }

        .sb-user-email {
          font-size: 11px; color: #64748B;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .sb-logout {
          width: 32px; height: 32px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          background: transparent;
          color: #64748B;
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .sb-logout:hover {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.3);
          color: #F87171;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .sb-hamburger { display: flex; }
          .sb-root { transform: translateX(-100%); }
          .sb-root.open { transform: translateX(0); box-shadow: 20px 0 60px rgba(0,0,0,0.4); }
          .sb-backdrop.open { display: block; }
        }
      `}</style>

      {/* Hamburger toggle */}
      <button
        className="sb-hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile backdrop */}
      <div
        className={`sb-backdrop ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sb-root ${open ? "open" : ""}`}>
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-icon">S</div>
          <div className="sb-logo-text">
            <div className="sb-logo-name">
              Study<span>Fyx</span>
            </div>
            <div className="sb-logo-sub">AI EDUCATION PLATFORM</div>
          </div>
        </div>

        {/* Portal chip */}
        {isAuth && (
          <div className={`sb-portal ${isMentor ? "mentor" : "student"}`}>
            <div className="sb-portal-mark">
              {isMentor ? <Users size={15} /> : <GraduationCap size={15} />}
            </div>
            <div className="sb-portal-text">
              <div className="sb-portal-title">
                {isMentor ? "Mentor Portal" : "Student Portal"}
              </div>
              <div className="sb-portal-sub">
                {isMentor ? "Guide & verify" : "Learn & grow"}
              </div>
            </div>
            <span className="sb-live-dot" title="Online" />
          </div>
        )}

        {/* Nav */}
        <nav className="sb-nav">
          {groups.map((group) => (
            <div key={group.section}>
              <div className="sb-section-label">{group.section}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`sb-item ${isActive(item.id) ? "active" : ""}`}
                    style={
                      item.accent ? { "--item-accent": item.accent } : undefined
                    }
                    onClick={() => handleNav(item)}
                  >
                    <div className="sb-item-icon">
                      <Icon size={17} strokeWidth={2} />
                    </div>
                    <span className="sb-item-label">{item.label}</span>
                    {item.requiresAuth && (
                      <span className="sb-login-badge">LOGIN</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="sb-bottom">
          {!isAuth ? (
            <>
              <button
                className="sb-auth-btn login"
                onClick={() => {
                  setCurrentView("login");
                  setOpen(false);
                }}
              >
                <LogIn size={15} /> Sign In
              </button>
              <button
                className="sb-auth-btn register"
                onClick={() => {
                  setCurrentView("register");
                  setOpen(false);
                }}
              >
                <Sparkles size={15} /> Get Started Free
              </button>
            </>
          ) : (
            <div className="sb-user">
              <div className="sb-user-avatar">
                {(displayName[0] || "U").toUpperCase()}
              </div>
              <div className="sb-user-info">
                <div className="sb-user-name">{displayName}</div>
                <div className="sb-user-email">{user?.email}</div>
              </div>
              <button
                className="sb-logout"
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export { SIDEBAR_WIDTH };
