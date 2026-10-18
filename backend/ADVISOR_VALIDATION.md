# Member 1 advisor validation and scoring

The active Flask `/recommend` and `/backward-analysis` endpoints now use
`advisor_engine.py`. The response schema is version `2.0`; rules are `advisor-rules-2.3`. The legacy
`/predict-simple` URL uses the same validated recommendation flow.

## Problems corrected

- Empty, malformed, non-object and oversized requests return JSON errors.
- Required fields, finite numeric ranges, all 25 districts, six supported
  streams, nested assessment types and categorical options are checked.
- Unknown careers return 422 with supported choices and suggestions. They
  are never silently replaced with Software Engineer.
- Zero-valued answers survive frontend mapping and backend normalization.
- Missing skills remain unassessed. Personality scores are not represented
  as evidence of programming, biology or other technical skills.
- Each degree has its own institution matches and reference cutoff gaps.
- No fabricated university, distance or fixed 75% admission chance is added.
- District bonuses from the illustrative catalog are not applied.
- Related degrees are distinguished from direct qualification pathways.
  A Bio Science degree is not presented as qualifying someone as a doctor.
- Chef and Electrician receive vocational-route guidance instead of an
  unrelated Fine Arts or default IT degree.
- Backend exceptions no longer expose internal exception text to clients.
- Profiles are saved to Firestore only after successful backend validation.

## Subject rules and what the results mean

The canonical subject catalog is
`edusoul-app/Member1/data/alSubjectRules.json`. Both React and Python read it.
Package that file at the same relative path when deploying the backend; there
is deliberately no fallback to the old invented subject lists.

Source checked on 2026-10-17: UGC **2025/2026** handbook, sections
2.2.1.1 (Arts, printed pp. 31–34), 2.2.2 (Commerce, p. 43), 2.2.3
(Biological Science), 2.2.4 (Physical Science), 2.2.5 (Engineering
Technology, p. 77), and 2.2.6 (Biosystems Technology, p. 79).
This catalog describes supported admission subject guidance, not the entire
Department of Examinations subject-registration system. Physical Science
subjects are grouped for selecting actual results; course-specific combinations
are checked separately, rather than pretending every science combination
qualifies for every course.

- Technology: ET or BST plus Science for Technology and one approved third
  subject. ICT is an option, not a compulsory third subject.
- Commerce: at least two of Accounting, Business Studies and Economics.
- Arts: four baskets, language exceptions, religion/civilization exclusions,
  aesthetic-area limits, and alternative/technological subject groups.
- Selected course checks: Medicine (two C grades and one S in Biology,
  Chemistry and Physics); Engineering (three S grades in Combined Mathematics,
  Physics and Chemistry); Pharmacy (C in Chemistry and S in Physics/Biology);
  Dental/Veterinary Science/Nursing; Biological/Physical Science; Computer
  Science; core Management/Commerce and Arts; ET/BST qualifications; selected
  multi-stream IT, Law, Architecture and Quantity Surveying entry conditions.
- Nursing/Pharmacy O/L English, examination sitting/attempts, aptitude or
  medical requirements, official recognition and current district cutoffs are
  not collected or verified. Passing the A/L check does not confirm admission.
- Law and Architecture are not restricted to Arts. IT can be considered across
  streams, and Quantity Surveying includes eligible Commerce/Arts combinations.
  Course-specific subject evidence is checked separately from broad route availability.
- Private institutions' rules need separate verification. UGC subject failures
  are not declared equivalent to a rejection by a private provider.
- ET/BST degrees are no longer treated as Engineering or Biological Science
  degrees. Missing institutional reference data remains missing.

The old **Current goal readiness checks** screen is now labelled **What is
checked for your goal?** It describes planning evidence, not whether a student
already holds the career's qualifications. True means supplied support, false
means a specific requirement gap, and null means unknown or official
verification still needed. No unknown check is converted into a failure or a pass.

The old **Backward-chaining trace** is now **How your plan was worked out**:
career goal → qualification routes → stream comparison → supplied evidence →
university references. This is a rules-based explanation, not a model's hidden
reasoning. The detailed AND/OR logic is available under Technical details.
Subject failures are exposed on each checked recommendation and direct-goal
proof. A high Z-score does not override a known subject or grade failure.
The route remains visible for planning improvements; it is not presented as a
currently supported subject route.

## How ranking works

The goal is expanded into qualification routes and required capabilities.
Provisional stream rules filter the candidate degrees. Direct career routes
are ranked before related routes, which precede alternative degrees.
Within each group the suitability score uses these configured weights:

| Factor | Weight |
| --- | ---: |
| Goal/degree alignment | 35% |
| Reference academic readiness | 25% |
| Supplied personality answers | 15% |
| Supplied lifestyle preferences | 10% |
| Self-reported career skills | 10% |
| Compatible trained-model evidence | 5% |

Missing evidence has no invented midpoint. Model evidence is excluded from ranking
when any model input was defaulted; the optional raw probability remains labelled
with its imputed fields. Its weight is excluded and the
remaining weights are normalized. Every response exposes raw factor values,
effective weights, contributions, missing evidence and the inference trace.
The data-completeness indicator is a supplied-field indicator, not a measure
of the truth or predictive quality of those answers.

Readiness is a bounded research comparison `clip(0.5 + Z-margin/2, 0, 1)`.
It is not calibrated against admissions outcomes. Supplied failing grades
or a Common General Test mark below 30 flag unmet minimum requirements.
Selected UGC course prerequisites are now checked separately from Z-scores.
Missing marks, unimplemented course prerequisites, qualifications, aptitude tests,
recognition and professional registration still require verification.

The model's actual class order is used when decoding probability vectors.
Model probabilities are separately exposed; they never become admission
probabilities. Unknown model categories, incompatible sklearn versions or
invalid probability vectors cause an explicit rules-only response.

## Personalised backward chaining

The response includes:

1. Goal → qualification paths → stream constraints → profile evidence →
   degree-specific institutions.
2. Self-reported skill levels, configured targets and measured gaps.
3. Personality gaps and lifestyle tradeoffs with their evidence basis. The AND/OR proof tree uses three-valued reasoning
   to distinguish supplied support, an unmet requirement and unknown evidence.
4. Unmet requirements, prioritised actions and qualification milestones.
5. Recomputed scenarios for a 0.2 Z-score increase, an explicitly supplied
   potential Z-score, and the largest measured skill gap where available.

Each scenario changes one named input and reports before/after scores for
the same degree. It is a sensitivity analysis, not a causal guarantee.
The goal-only backward-analysis request remains supported, but is labelled
`personalized: false` and does not fabricate a student assessment.

## Validation performed

- 42 backend tests, including a sweep of all 60 careers × six streams and
  all 25 districts, invalid payloads, professional/vocational constraints,
  degree-specific institution matching, missing evidence, score accounting,
  recomputed scenarios and model failure/class-order handling.
- 78 frontend tests, including 34 shared subject-combination cases, payload
  mapping, legacy subject correction, optional evidence, and trilingual copy.
- Production frontend build.
- 24 server-render checks for results, guidance and roadmap in English,
  Sinhala and Tamil against actual normal, blocked and vocational API
  responses, without `NaN` or `undefined` output. This is not a visual
  browser or interaction test.

From the repository root:

```sh
/usr/bin/python3 -m unittest discover -s backend/tests -v
node --test edusoul-app/Member1/tests/*.test.mjs
npm run build --prefix edusoul-app
```

The tested `/usr/bin/python3` has scikit-learn 1.6.1, matching the model
artifact. The existing Conda-based Python 3.13 virtual environment has
scikit-learn 1.9.0 and also crashed importing `readline` through the test
client's debugger dependency. That environment was not modified. A clean
Python 3.9–3.12 environment can use `requirements-advisor.txt`.

## Limits that testing cannot remove

The model metadata identifies `balanced_synthetic_v3_complete_srilanka` as
its dataset. Its reported 97.28% test accuracy is on generated data, not
validated real student outcomes. This work does not establish real-world
prediction accuracy, admission probability, fairness or calibration.

The bundled university cutoffs, fees and course/stream mappings lack a
verified current district/year provenance. They remain labelled research
references. No annual official cutoff dataset has been imported by this
change. Verify against the [UGC 2025/2026 handbook](https://www.ugc.ac.lk/downloads/admissions/Handbook_2025_26/student_handbook_english.pdf)
and current institution/professional requirements before relying on a route.

For a research claim of improved predictive accuracy, evaluate a consented,
representative real-world holdout dataset with a predeclared baseline,
top-k relevance labels, subgroup results and calibrated uncertainty.
Do not use the synthetic test accuracy as a replacement for that evaluation.

## Expanded local and international career pathways

`edusoul-app/Member1/data/careerCatalog.json` is the shared catalog for 60
careers (30 added). `backend/career_pathways.py` extends the validated engine
with those identifiers and supplies a structured plan for every supported goal.
Deploy this JSON with the backend at the same relative path as the subject
catalog. The existing trained model was **not retrained** for the added careers;
new goal/pathway associations are curated rules and must not be presented as
newly measured prediction accuracy or employment probabilities.

Every plan contains a brief role explanation, qualification route, skill focus,
a practical milestone, Sri Lankan provider checks, international recognition
checks, and six stages: entry → qualification → foundations → practical work →
supervised experience → applications. Stages have no invented fixed duration.
Senior management roles explicitly require relevant experience. International
checks are planning guidance, not country-specific eligibility or immigration
approval. CareerOneStop is a US occupational reference, not global labour-market
data. No live vacancies, salary forecasts or demand percentages are inferred.

Skilled trades and Tour Guide have training pathways without fabricated degree
recommendations, and a results-level button opens their career roadmap even
when the degree recommendation list is empty. UGC university A/L and Common
General Test conditions are not treated as universal vocational entry rules.
Training-provider entry conditions stay unverified. Tour Guide includes the
SLTDA registration reference; private and overseas recognition still require
provider/destination checks.

Food Technologist, Industrial Laboratory Technician, UX Designer and Animation
Artist expose the specialist qualification/portfolio needed; their broad degree
foundations are not labelled equivalent specialist qualifications. Industrial
laboratory guidance does not grant clinical diagnostic eligibility.

All 60 titles, summaries, descriptions, qualification explanations and roadmap
copy have Sinhala and Tamil display translations. API career and skill
identifiers remain unchanged. Tests assert that the frontend and backend expose
exactly the same 60 careers and that each receives a complete plan.

Saved-profile subject cleanup: the intake now keeps only subjects supported by
the selected stream and renders exactly three slots. If more than three valid
saved subjects remain, it resets to ungraded required core subjects (or blank
slots) and asks the student to reselect the actual exam subjects. It does not
choose an arbitrary subset of grades. Unrelated legacy subjects cannot enter
the new submission; the original saved record is unchanged until submission.

The intake catalog now has separate `intakeGroups`/`intakeRequired` fields for
common school-stream choices. Biology offers Biology/Chemistry plus Physics or
Agricultural Science; Maths offers Combined Mathematics/Physics plus Chemistry
or ICT; Commerce offers Accounting, Business Studies, Economics, Business
Statistics and ICT. Arts uses the requested five display categories, with the
underlying Arts basket restrictions still checked. ET/BST keep their separate
UGC stream identifiers, fix ET/BST plus SFT, and show the six common third
options listed in the student form. Main subject names are locked; their grades
remain editable and unassessed until provided.

These narrower form choices do not replace the broader UGC course-entry
reference rules. The shared JSON keeps `groups` and course rules for reference
validation separately from the form's common combinations. In particular,
Higher Mathematics and other verified reference combinations are not falsely
removed from backend course eligibility rules. Browser checks exercised the
mixed saved profile and switching through all six admission streams.

The final subject field component renders fixed core names as read-only text
fields, keeps their grades editable, and omits incompatible dropdown choices
instead of displaying disabled options. The form normalizes its current draft
before rendering and submission, preventing stale in-memory subject maps from
submitting evidence hidden by the UI. Regression tests cover compatible option
lists and normalization idempotency; browser checks verify submitted subjects
match the visible form and that Tamil mobile fields fit the viewport.

## District-to-university map distances

The results map now receives the student's selected district. Representative
main-town points for all 25 districts are stored in
`edusoul-app/Member1/data/districtOrigins.json`, with GeoNames place identifiers,
source, retrieval date and CC BY 4.0 attribution. These points are not a home
address or district polygon centroids. This map does not use the older backend
district-coordinate tables.

`universityDistances.js` uses the Haversine formula and a 6371.0088 km mean Earth
radius to calculate approximate straight-line distances to the university
coordinates supplied in recommendations. The origin marker, connecting lines,
popups and nearest-first map list update when the selected district changes.
This does not alter recommendation ranking or academic scores. Missing district
or university coordinates produce unavailable distances, with no Colombo
fallback or fabricated zero. External map tiles retain OpenStreetMap attribution.
Google Maps driving links pass the selected origin and exact university
coordinates. Map View also requests an OSRM driving route for the selected
university, draws its road geometry and shows road distance, estimated driving
time, and ordered road names/references. Driving estimates exclude live traffic,
stops and public transport waiting times. Failed or timed-out requests clear
old route data and retain only a labelled straight-line fallback with retry.
Bus/train options open Google Maps transit directions with the same endpoints;
bus numbers, fares, transfers and timetables are not verified or computed in-app.
The existing university reference coordinates are still only as accurate as the
bundled catalog.

Distance tests cover all 25 origins, zero/symmetric/known-distance cases,
invalid coordinates, missing origins, deduplication, sorting and directions
parameters. Browser checks exercise Galle → universities, changes to Colombo,
origin markers and polylines, missing data, Tamil labels and mobile layout.


Road routing uses the public `https://router.project-osrm.org` service by
default. For a production deployment, configure frontend `VITE_OSRM_BASE_URL`
to your own or managed OSRM-compatible HTTPS service with browser CORS enabled,
then rebuild. The public endpoint has no availability guarantee. No API key is
required for the default endpoint or external Google Maps directions links.
Only representative town and catalog campus coordinates are sent to routing;
student names, grades and other profile fields are not sent.

Road tests cover units, coordinate ordering, invalid/no-route responses, HTTP
failures, cancellation signal forwarding and transit link parameters. A live
Galle → stored Rajarata coordinate request returned 304.8865 km and 317 rounded
minutes during verification (an estimate, not a guaranteed journey duration).
Browser checks replayed that response to verify geometry, permanent distance/time
labels, route selection, error/retry handling, Tamil labels and mobile layout.


## Complete state-university directory

The shared `Member1/data/stateUniversities.json` lists 22 state universities:
17 under UGC and five other state universities, with official website and
location references. The catalog remains shared across backend and frontend. The separate All state
universities tab has been removed at user request; all 22 institutions remain
available to degree matching. Listing an institution does not establish eligibility.

`state_universities.py` normalises the legacy catalog to those 22 universities.
SLIIT remains non-state only, UCSC course references are merged into Colombo,
and the spurious separate visual-arts university and SLIATE-as-university entries
are removed. Open University, Vavuniya, Gampaha Wickramarachchi, Bhiksu,
Vocational Technology and Ocean University are added. New study-area mappings
are broad discovery references, not verified programme equivalences.

Unknown cutoffs produce null readiness and gap values and institution
verification status. Institution-specific routes (including OUSL and KDU) do
not inherit UGC-style cutoffs. Existing bundled cutoffs remain unverified
research references. Missing/unverified campus coordinates remain null; campus
search links are provided in the directory and no fake map distance is generated.
KDU's incorrect legacy Kandana location is replaced with Ratmalana and its
unverified coordinate is cleared. No complete current programme-level admissions
dataset is claimed.

Validation: 42 backend tests, 78 frontend tests and production build pass. Browser
checks cover all 22 entries, 17/5 groups, search, official/campus links, Tamil
names, mobile width and absence of runtime errors.


## University recommendation corrections (rules 2.3)

The top-level university list combines all displayed degree pathways, not just
the first one. Institutions are deduplicated by name within sector. Each entry
retains matched_degrees and full degree_matches evidence; primary score fields
refer to the first matching ranked degree and are labelled with that degree in
the UI. Programme-specific readiness/status values remain separate.

Private and institution-specific entry routes do not use generic bundled
Z-score thresholds. Their readiness, cutoff and gap stay null, and admission
requirements require institution verification. Those scores cannot inflate
degree academic-readiness factors. Programme and fee records in the legacy
private catalog remain unverified; these changes do not turn that catalog into
a current official admissions dataset.

The Universities and Map tabs share a degree filter. All-pathway mode shows the
merged list, while a selected degree uses only its own institution options.
Preferences remain available across filters. Unknown admission values show an
actionable label and no empty cutoff panel. Explanations distinguish related
institutions with unknown requirements from absent institution mappings.

Browser regression checks use an actual backend response for Software Engineer,
Physical Science, Galle, Z-score 1.2: 40 merged entries, six Computer Science
options, no private cutoff percentage, consistent filtered map markers, and
persistent preferences. Rapid tab changes no longer trigger a Leaflet zoom
transition callback after map removal (fitBounds animation and map zoom
animation disabled).


## University screen presentation correction

The All state universities tab is removed. Results now default to the first
ranked degree and allow selection of one degree at a time; mixed-degree mode
is removed from the cards and map. Each degree card has a View universities
for this degree button. Career relationship badges explicitly say Direct career
pathway or Related career pathway instead of an unexplained direct label.

University readiness percentages are removed from degree headers, university
cards, map popups and map cards. The backend research scores remain available
for compatibility; the screens show stored-cutoff, entry-gap or verification
statuses instead. Institutions below stored cutoffs or with checked subject
gaps appear in a collapsed Universities with entry gaps section. Counts say
institutions listed, not qualified matches. Missing selection is explained
from the actual degree-specific options, not No verified reference match.

The cutoff panel states that stored values are not district-specific. This is
a presentation correction, not verification of the legacy admissions dataset.
Regression checks reproduced Ratnapura / 0.834 / Civil Engineer with Engineering
ranked first, then checked IT filtering, consistent map status, Tamil, mobile
layout, removed tab and absence of browser runtime exceptions.


Degree predictions now include an always-visible university section beneath
each degree, before its expandable analysis. The preview shows up to three
government and three private options, entry statuses and available district
straight-line distances. Entry-gap institutions remain collapsed separately.
View all university options opens the full list for that degree; View on map
selects both the degree and exact institution. Missing institution mappings
produce an explicit empty state, with no cross-degree fallback. Browser checks
cover government/private rendering, degree isolation, gap groups, both actions,
district distance, Tamil labels, mobile layout and runtime exceptions.


## Trained-model degree and catalog university summary

The API exposes `trained_model_recommendation`, separate from the existing
goal-directed `best_degree`. It uses actual validated predict_proba values,
filters to stream-compatible, career-related pathways without known failed
subject prerequisites, prioritises direct career pathways, then takes the
highest model probability. The selected pathway is retained among the four
displayed degree results. This does not retrain the synthetic classifier.

The classifier predicts degree categories only. Its university option is
selected separately from the chosen degree's catalog: a stored-cutoff match
first, otherwise an institution whose admission needs verification. Institutions
below a stored cutoff or with checked minimum-entry failures are not promoted
to the model university. No candidate means null university. The response
records distinct degree/university sources, actual model probability, pathway
relationship, selection basis and estimated feature names. Unsupported or
unavailable inference produces an explicit status without a fake prediction.

Degree Predictions begins with the trained-model summary, university, model
score, university/map actions and disclosures for synthetic training data and
estimated profile features. The older overall degree metric is labelled
Goal-aligned degree to distinguish it from this model-specific selection.
Browser checks used the actual compatible classifier response and verified
degree, university, score, both actions, unavailable state, Tamil, mobile width
and absence of runtime errors. All 42 backend and 78 frontend tests pass.


## Recommendation-only Map View

Map View no longer includes the degree filter, catalog university selector,
all-university toggle, catalog counts, separate starting-district introduction
or duplicate university distance cards. It uses the model-recommended degree
and institution by default. View on map from a result selects that exact degree
and university. The full degree filter remains on the Universities tab.

The map receives a single result university, retaining the route, road distance,
time estimate and external driving/transit links. Recommendation resolution
never replaces an explicitly selected campus with another university when its
coordinates are missing. It displays a missing-coordinate state instead.
Missing recommendation mappings prompt selection from the degree results.

Regression checks cover model selection, explicit selection, missing campuses,
removed dropdowns, two route markers, consistent Ratnapura-to-CINEC result links,
mobile width and no browser runtime exceptions. 78 frontend tests pass.


The focused map now includes a visible district-to-university summary: selected
district, recommended university, route distance and estimated driving time.
Before a road response arrives (or on failure), the distance is explicitly
labelled approximate straight-line and time is loading/unavailable. Valid road
responses replace the summary distance with road kilometres; the map line
retains its permanent route/distance label. Galle → stored Rajarata coordinates
was checked in-browser with the previously verified OSRM response. Checks also
cover changing district, clearing stale time on failure, translated labels and
mobile width.


The road-distance summary now always reserves its main distance field for
road routing only, with one decimal kilometre precision. Loading and unavailable
states do not substitute a straight-line number into that field. Approximate
straight-line distance is shown separately. The main district-town/campus
origin basis is stated beside the summary. A live OSRM request from Ratnapura
(6.6858,80.4036) to the stored Rajarata coordinate (8.3551,80.3976) returned
226.215 km and 271 rounded minutes during verification. This remains a routing
estimate to the catalog location, not a home-address or guaranteed journey
measurement. A Ratnapura endpoint regression test and browser checks cover
road precision, origin, time, persistent line label, failure separation, district
change, translations and mobile layout. All 78 frontend tests pass.


## Campus-coordinate and road-route repair

Root cause: newly added state universities had explicit null campus coordinates,
so university cards could not compute distance and Map View had no destination
marker from which to request roads. Sourced campus references now fill those
records (KDU, OUSL, GWUIM, Vavuniya, Buddhist and Pali, Bhiksu, UoVT and Ocean).
Each updated record stores coordinate_source, coordinate_basis and checked date.
UoVT's official site is updated to uovt.ac.lk. All 22 state entries now have
numeric Sri Lankan campus coordinates after normalization. Older inherited
reference points are not all audited programme-specific campus entrances.

KDU and Bhiksu use official contact-map centres; Vavuniya uses the official
contact page's plus code 6MW2QC56+F78; OUSL uses the named OSM main gate node;
Ocean uses its OSM campus node; GWUIM uses its campus Wikidata coordinate; BPU
and UoVT use official contact-map destinations. Source URLs are in the JSON.
Rajarata's incorrect Anuradhapura city pin is replaced with the Mihintale campus
OSM node, cross-checked with the official campus map. Eastern's city reference
is replaced with its official Vantharumoolai campus map centre. Previous
Galle/Ratnapura-to-Rajarata measurements in earlier verification notes used
the old coordinate and are superseded. The corrected Ratnapura-to-Mihintale
request returned 239.0162 km and 262 rounded minutes during verification.

The frontend resolves sourced campus records by canonical name or alias before
using older response coordinates. Thus saved null or stale campus coordinates
are repaired in university cards, degree previews, the model map action and
map markers without replacing the recommended institution. A direct View on map
action is also available on full university cards.

OSRM requests alternatives=true and the parser selects the smallest distance
among valid returned alternatives, keeping geometry, road names and duration
from that same route. This is the shortest returned alternative, not a claim
of global shortest-path optimality. Invalid alternatives do not hide valid
ones. The UI states the route-selection limitation.

42 backend tests, 78 frontend tests, production build and browser regression
checks pass. A real browser with an old saved null-coordinate KDU result
confirmed recovered card distance, working model map action, two markers,
actual road geometry, 76.8 km / 1 hr 33 min from the live routing service,
permanent map distance label, mobile width and no runtime exceptions.

### Consistent road distances on university cards

UniversityDistance now displays routed road kilometres and estimated driving time as its primary measurement, rather than the previous prominent straight-line distance. Straight-line distance remains in a collapsed, explicitly labelled detail. The map and cards share a five-minute route cache, deduplicate concurrent requests, and limit routing to three concurrent calls. Failed requests can be retried and never substitute a straight-line value for road kilometres. Route-line tooltips also show routing status instead of a straight-line number while waiting.

Live browser verification on 2026-10-18: Ratnapura town to the sourced KDU Ratmalana campus showed 76.8 km and 1 hr 33 min on both card and map, with the same road-line tooltip. Desktop/mobile checks passed without runtime exceptions. This is a road-routing estimate, not an exact home-to-campus measurement or live traffic ETA. All 81 frontend tests and the production build passed; backend behaviour is unchanged.

### Doctor-specific backward chaining (advisor-rules-2.4)

The Doctor career now has trilingual medical milestones: A/L Medicine entry checks, a recognised medical degree, provisional SLMC registration, supervised one-year internship, full registration, and optional specialist training. The results show required dependencies in reverse order and the roadmap displays the forward sequence. Foreign-graduate guidance directs students to SLMC recognition and applicable ERPM requirements. Related science, nursing and pharmacy degrees are explicitly not substitutes for a medical qualification. No graduation, internship or registration completion is inferred from school grades.

The next-step assessment distinguishes missing subject evidence, failed subject/grade requirements, a stream outside the checked UGC Medicine route, and supported subject minima. Supported subject minima are never presented as admission or licensing eligibility. The applicable UGC 2025/2026 handbook remains the source for the two-C/one-S Biology/Chemistry/Physics minimum; current district/year selection and examination history require verification. Registration steps were crosschecked against https://slmc.gov.lk/en/registration and https://slmc.gov.lk/en/services/overseas-graduates on 2026-10-18.

Validation: 44 backend tests, 81 frontend tests and production build passed. Live local browser checks confirmed reverse dependency order, profile-specific guidance, Sinhala/Tamil presentation, mobile layout and no runtime errors.

### Software engineering Future Path in Career Analysis

Software Engineer analysis now returns seven career_path_steps with trilingual titles and descriptions: university/degree choice, programming foundations, portfolio, internship, junior role, software engineer, and senior progression. The UI renders a numbered list in the existing Future Path section. Existing saved Software Engineer results use the shared catalog if the structured field is absent. Other careers retain their own existing path text. Senior progression is described as skill- and responsibility-based rather than a guaranteed promotion or fixed duration, and Z-score checks apply only where relevant to the entry route.

Validation: 45 backend tests, 81 frontend tests and production build passed. Browser checks covered seven steps on saved results, Sinhala/Tamil titles and descriptions, mobile layout, and no runtime exceptions.
