import { useEffect, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, Save } from "lucide-react";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  getMentorMatchingProfile,
  saveMentorMatchingProfile,
} from "../../src/services/mentorMatchingService";

const EMPTY_PROFILE = {
  name: "",
  highestDegree: "",
  qualifications: "",
  specialization: "",
  industryRole: "",
  yearsExperience: "",
  expertise: "",
  skills: "",
  university: "",
  location: "",
  languages: "",
  availabilityHours: "4",
  bio: "",
};

const toInputValue = (value) =>
  Array.isArray(value) ? value.join(", ") : (value ?? "");

const MentorProfilePage = ({ onBack }) => {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user?.uid) return undefined;

    let active = true;
    getMentorMatchingProfile(user.uid)
      .then((profile) => {
        if (!active) return;
        setForm({
          ...EMPTY_PROFILE,
          ...Object.fromEntries(
            Object.entries(profile || {}).map(([key, value]) => [
              key,
              toInputValue(value),
            ]),
          ),
          name:
            profile?.name ||
            user.displayName ||
            user.email?.split("@")[0] ||
            "",
        });
      })
      .catch((loadError) => {
        if (active)
          setError(loadError.message || "Could not load your profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.uid) return;

    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await saveMentorMatchingProfile(user.uid, {
        ...form,
        name: form.name.trim(),
        yearsExperience: Number(form.yearsExperience) || 0,
        availabilityHours: Number(form.availabilityHours) || 0,
      });
      setSaved(true);
    } catch (saveError) {
      setError(saveError.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <header className="border-b border-slate-200 px-5 py-5 md:px-7">
            <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-blue-700">
              <BriefcaseBusiness size={15} /> Mentor profile
            </p>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Edit your professional details
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              These details help students understand your experience and help
              matching use your expertise.
            </p>
          </header>

          {loading ? (
            <p className="px-5 py-8 text-sm text-slate-500 md:px-7">
              Loading your saved profile…
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid gap-4 px-5 py-6 sm:grid-cols-2 md:px-7"
            >
              <ProfileInput
                label="Display name"
                name="name"
                value={form.name}
                onChange={updateField}
                required
              />
              <ProfileInput
                label="Highest degree"
                name="highestDegree"
                value={form.highestDegree}
                onChange={updateField}
                required
                placeholder="e.g. MSc in Computer Science"
              />
              <ProfileInput
                label="Specialization"
                name="specialization"
                value={form.specialization}
                onChange={updateField}
                required
                placeholder="e.g. Software Engineering"
              />
              <ProfileInput
                label="Current role"
                name="industryRole"
                value={form.industryRole}
                onChange={updateField}
                placeholder="e.g. Senior Software Engineer"
              />
              <ProfileInput
                label="Years of experience"
                name="yearsExperience"
                type="number"
                min="0"
                value={form.yearsExperience}
                onChange={updateField}
              />
              <ProfileInput
                label="University or institution"
                name="university"
                value={form.university}
                onChange={updateField}
              />
              <ProfileInput
                label="Professional qualifications"
                name="qualifications"
                value={form.qualifications}
                onChange={updateField}
                placeholder="Comma-separated"
              />
              <ProfileInput
                label="Expertise"
                name="expertise"
                value={form.expertise}
                onChange={updateField}
                required
                placeholder="Comma-separated areas"
              />
              <ProfileInput
                label="Skills"
                name="skills"
                value={form.skills}
                onChange={updateField}
                placeholder="Comma-separated skills"
              />
              <ProfileInput
                label="Location"
                name="location"
                value={form.location}
                onChange={updateField}
              />
              <ProfileInput
                label="Languages"
                name="languages"
                value={form.languages}
                onChange={updateField}
                placeholder="English, Sinhala"
              />
              <ProfileInput
                label="Available hours per week"
                name="availabilityHours"
                type="number"
                min="0"
                max="80"
                value={form.availabilityHours}
                onChange={updateField}
              />
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Professional bio
                <textarea
                  name="bio"
                  rows="4"
                  value={form.bio}
                  onChange={updateField}
                  className="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  placeholder="Describe your experience and how you support students."
                />
              </label>

              {error && (
                <p
                  role="alert"
                  className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2"
                >
                  {error}
                </p>
              )}
              {saved && (
                <p
                  role="status"
                  className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 sm:col-span-2"
                >
                  Profile saved.
                </p>
              )}

              <div className="flex justify-end pt-2 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
                >
                  <Save size={16} /> {saving ? "Saving…" : "Save profile"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
};

const ProfileInput = ({ label, name, type = "text", ...props }) => (
  <label className="text-sm font-semibold text-slate-700">
    {label}
    <input
      name={name}
      type={type}
      {...props}
      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
    />
  </label>
);

export default MentorProfilePage;
