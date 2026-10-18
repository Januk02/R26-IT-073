import { careerExpansionMessages } from './advisorCareerExpansionTranslations.js';
import { stateUniversityMessages } from './stateUniversityTranslations.js';
import careerCatalog from './careerCatalog.json' with { type: 'json' };
import { dreamJobs } from './dreamDegreeData.js';
import { extraMessages } from './advisorExtraTranslations.js';
import { pathMessages } from './advisorPathTranslations.js';
import { careerMessages, careerDescriptions } from './advisorCareerTranslations.js';
import { advisorTemplates } from './advisorTemplates.js';
import { academicMessages } from './advisorAcademicTranslations.js';
import { evidenceMessages } from './advisorEvidenceTranslations.js';
import { subjectMessages } from './advisorSubjectTranslations.js';
import { workspaceMessages } from './advisorWorkspaceTranslations.js';

// Display translations only: identifiers and values sent to the API stay unchanged.
export const advisorMessages = {
  'Rate yourself on each trait from 0 (lowest) to 10 (highest)': ['සෑම ලක්ෂණයකටම 0 (අවම) සිට 10 (උපරිම) දක්වා ඔබට ලකුණු දෙන්න', 'ஒவ்வொரு பண்புக்கும் 0 (குறைந்தது) முதல் 10 (அதிகமானது) வரை மதிப்பிடுங்கள்'],
  'Select district': ['දිස්ත්‍රික්කය තෝරන්න', 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்'],
  'Select Your Dream Career': ['ඔබේ අපේක්ෂිත වෘත්තිය තෝරන්න', 'உங்கள் கனவுத் தொழிலைத் தேர்ந்தெடுக்கவும்'],
  'Demand': ['ඉල්ලුම', 'தேவை'],
  "Can't find your dream career? Type it below:": ['ඔබේ අපේක්ෂිත වෘත්තිය හමු නොවුණාද? පහත ඇතුළත් කරන්න:', 'உங்கள் கனவுத் தொழில் இல்லையா? கீழே உள்ளிடுங்கள்:'],
  'Selected Career': ['තෝරාගත් වෘත්තිය', 'தேர்ந்தெடுத்த தொழில்'],
  'Leads to:': ['යොමු වන ක්ෂේත්‍ර:', 'தொடர்புடைய துறைகள்:'],
  'Typical range: 0.00 - 3.00. Medicine requires ~1.90+': ['සාමාන්‍ය පරාසය: 0.00–3.00. වෛද්‍ය විද්‍යාවට ආසන්න වශයෙන් 1.90+ අවශ්‍ය වේ', 'பொதுவான வரம்பு: 0.00–3.00. மருத்துவத்திற்கு சுமார் 1.90+ தேவை'],
  '(Optional)': ['(අත්‍යවශ්‍ය නොවේ)', '(விருப்பத்தேர்வு)'],
  '(Optional — Z-score is the primary factor)': ['(අත්‍යවශ්‍ය නොවේ — Z අගය ප්‍රධාන සාධකයයි)', '(விருப்பத்தேர்வு — Z மதிப்பே முக்கியக் காரணி)'],
  'STEP': ['පියවර', 'படி'],
  'Best Degree': ['හොඳම උපාධිය', 'சிறந்த பட்டப்படிப்பு'],
  'Universities': ['විශ්වවිද්‍යාල', 'பல்கலைக்கழகங்கள்'],
  'Degree Predictions': ['උපාධි නිර්දේශ', 'பட்டப்படிப்புப் பரிந்துரைகள்'],
  'Universities & Cutoffs': ['විශ්වවිද්‍යාල සහ කඩඉම් අගයන්', 'பல்கலைக்கழகங்களும் வெட்டுப்புள்ளிகளும்'],
  'Map View': ['සිතියම් දසුන', 'வரைபடக் காட்சி'],
  'Career Analysis': ['වෘත්තීය විශ්ලේෂණය', 'தொழில் பகுப்பாய்வு'],
  'Academic Fit': ['අධ්‍යාපනික ගැළපීම', 'கல்விப் பொருத்தம்'],
  'Lifestyle': ['ජීවන රටාව', 'வாழ்க்கை முறை'],
  'Personality': ['පෞරුෂය', 'ஆளுமை'],
  'Daily Travel Tolerance': ['දෛනික ගමන් කිරීමේ කැමැත්ත', 'தினசரிப் பயண விருப்பம்'],
  'Preferred Work Environment': ['කැමති රැකියා පරිසරය', 'விருப்பமான பணிச்சூழல்'],
  'Social Interaction Preference': ['සමාජ සබඳතා පිළිබඳ කැමැත්ත', 'சமூகத் தொடர்பு விருப்பம்'],
  'Office': ['කාර්යාලය', 'அலுவலகம்'],
  'Remote': ['දුරස්ථ', 'தொலைநிலை'],
  'Hybrid': ['මිශ්‍ර', 'கலப்பு'],
  'Field': ['ක්ෂේත්‍රය', 'களப்பணி'],
  'Location Preference': ['කැමති ස්ථානය', 'விருப்பமான இடம்'],
  'Entrepreneurial Path': ['ව්‍යවසායක මාර්ගය', 'தொழில்முனைவுப் பாதை'],
  'Industry Path': ['කර්මාන්ත මාර්ගය', 'தொழில் துறைப் பாதை'],
  'Foundation Building': ['මූලික දැනුම ගොඩනැගීම', 'அடிப்படை அறிவை வளர்த்தல்'],
  'Specialization': ['විශේෂීකරණය', 'சிறப்புத் தேர்ச்சி'],
  'Career Entry': ['වෘත්තියට පිවිසීම', 'தொழிலில் நுழைதல்'],
  'Personalized improvement recommendations based on your profile': ['ඔබේ තොරතුරු අනුව පුද්ගලික දියුණු කිරීමේ නිර්දේශ', 'உங்கள் தகவல்களின் அடிப்படையிலான தனிப்பட்ட மேம்பாட்டுப் பரிந்துரைகள்'],
  'Immediate (Next 1-3 months)': ['වහාම (ඊළඟ මාස 1–3)', 'உடனடியாக (அடுத்த 1–3 மாதங்கள்)'],
  'Short-term (3-6 months)': ['කෙටි කාලීන (මාස 3–6)', 'குறுகிய காலம் (3–6 மாதங்கள்)'],
  'Medium-term (6-12 months)': ['මධ්‍ය කාලීන (මාස 6–12)', 'நடுத்தர காலம் (6–12 மாதங்கள்)'],
  'Long-term (1+ years)': ['දිගු කාලීන (වසර 1කට වැඩි)', 'நீண்ட காலம் (1 ஆண்டுக்கு மேல்)'],
  'Focus on academic improvements': ['අධ්‍යාපනික දියුණුවට අවධානය යොමු කරන්න', 'கல்வி மேம்பாட்டில் கவனம் செலுத்துங்கள்'],
  'Research district quota benefits': ['දිස්ත්‍රික් කෝටා ප්‍රතිලාභ සොයන්න', 'மாவட்ட ஒதுக்கீட்டு நன்மைகளை ஆராயுங்கள்'],
  'Explore alternative pathways': ['විකල්ප මාර්ග සොයන්න', 'மாற்றுப் பாதைகளை ஆராயுங்கள்'],
  'Develop key personality traits': ['ප්‍රධාන පෞරුෂ ලක්ෂණ දියුණු කරන්න', 'முக்கிய ஆளுமைப் பண்புகளை வளர்த்துக்கொள்ளுங்கள்'],
  'Complete bridging courses': ['පාලම් පාඨමාලා සම්පූර්ණ කරන්න', 'இணைப்புப் பாடநெறிகளை நிறைவு செய்யுங்கள்'],
  'Build professional network': ['වෘත්තීය සබඳතා ගොඩනගන්න', 'தொழில்சார் தொடர்புகளை வளர்த்துக்கொள்ளுங்கள்'],
  'Apply to multiple universities': ['විශ්වවිද්‍යාල කිහිපයකට අයදුම් කරන්න', 'பல பல்கலைக்கழகங்களுக்கு விண்ணப்பியுங்கள்'],
  'Secure internships': ['සීමාවාසික අවස්ථා ලබාගන්න', 'பயிற்சிப் பணிகளைப் பெறுங்கள்'],
  'Prepare for interviews': ['සම්මුඛ පරීක්ෂණ සඳහා සූදානම් වන්න', 'நேர்காணல்களுக்குத் தயாராகுங்கள்'],
  'Excel in chosen program': ['තෝරාගත් පාඨමාලාවේ දක්ෂතා දක්වන්න', 'தேர்ந்தெடுத்த பாடநெறியில் சிறந்து விளங்குங்கள்'],
  'Build specialized skills': ['විශේෂිත කුසලතා ගොඩනගන්න', 'சிறப்புத் திறன்களை வளர்த்துக்கொள்ளுங்கள்'],
  'Plan advanced education': ['උසස් අධ්‍යාපනය සැලසුම් කරන්න', 'மேல்நிலைக் கல்வியைத் திட்டமிடுங்கள்'],
  'Back': ['ආපසු', 'பின்செல்'],
  'Back to Results': ['ප්‍රතිඵල වෙත ආපසු', 'முடிவுகளுக்குத் திரும்பு'],
  'Home': ['මුල් පිටුව', 'முகப்பு'],
  'Next': ['ඊළඟ', 'அடுத்து'],
  'Results': ['ප්‍රතිඵල', 'முடிவுகள்'],
  'Improvement': ['වැඩිදියුණු කිරීම', 'மேம்பாடு'],
  'Guidance': ['මඟපෙන්වීම', 'வழிகாட்டுதல்'],
  'How AI Works': ['AI ක්‍රියා කරන ආකාරය', 'AI செயல்படும் விதம்'],
  'AI Model Transparency': ['AI ආකෘතිය පිළිබඳ විස්තර', 'AI மாதிரி விவரங்கள்'],
  'Prediction Model': ['පුරෝකථන ආකෘතිය', 'கணிப்பு மாதிரி'],
  'Confidence Score': ['විශ්වාසනීයතා අගය', 'நம்பகத்தன்மை மதிப்பெண்'],
  'Input Factors Analyzed': ['විශ්ලේෂණය කළ දත්ත', 'பகுப்பாய்வு செய்த தகவல்கள்'],
  'Database Coverage': ['දත්ත සමුදා ආවරණය', 'தரவுத்தளப் பரப்பு'],
  'Matched': ['ගැළපෙන', 'பொருந்தியவை'],
  'Total Universities': ['මුළු විශ්වවිද්‍යාල', 'மொத்தப் பல்கலைக்கழகங்கள்'],
  'Smart insights,': ['බුද්ධිමත් අවබෝධයක්,', 'சிறந்த நுண்ணறிவு,'],
  'made for': ['සකස් කළේ', 'உருவாக்கப்பட்டது'],
  'you': ['ඔබ වෙනුවෙන්', 'உங்களுக்காக'],
  'Confidence': ['විශ්වාසනීයතාව', 'நம்பகத்தன்மை'],
  'Admission': ['ඇතුළත් වීම', 'சேர்க்கை'],
  'Available Programs': ['පවතින පාඨමාලා', 'கிடைக்கும் பாடநெறிகள்'],
  'Tuition Fees (LKR/Year)': ['වාර්ෂික පාඨමාලා ගාස්තු (රු.)', 'வருடாந்தப் பாடநெறிக் கட்டணம் (ரூ.)'],
  'AI Explanation (XAI)': ['AI පැහැදිලි කිරීම (XAI)', 'AI விளக்கம் (XAI)'],
  'Academic Feasibility Breakdown': ['අධ්‍යාපනික සුදුසුකම් විශ්ලේෂණය', 'கல்வித் தகுதிப் பகுப்பாய்வு'],
  'Z-Score Fit': ['Z අගයේ ගැළපීම', 'Z மதிப்புப் பொருத்தம்'],
  'District Adj.': ['දිස්ත්‍රික් ගැළපීම', 'மாவட்டச் சரிசெய்தல்'],
  'Z-Score Gap': ['Z අගයේ පරතරය', 'Z மதிப்பு இடைவெளி'],
  'Skill Match Breakdown': ['කුසලතා ගැළපීම', 'திறன் பொருத்தம்'],
  'Future Roadmap Preview': ['අනාගත මාර්ග සැලැස්ම', 'எதிர்காலத் திட்ட முன்னோட்டம்'],
  'Preferred': ['කැමති', 'விருப்பமானவை'],
  'Government Universities': ['රාජ්‍ය විශ්වවිද්‍යාල', 'அரசுப் பல்கலைக்கழகங்கள்'],
  'Private Universities': ['පෞද්ගලික විශ්වවිද්‍යාල', 'தனியார் பல்கலைக்கழகங்கள்'],
  'No university matches found for your profile.': ['ඔබේ තොරතුරුවලට ගැළපෙන විශ්වවිද්‍යාල හමු නොවීය.', 'உங்கள் தகவல்களுக்குப் பொருந்தும் பல்கலைக்கழகங்கள் கிடைக்கவில்லை.'],
  'No degree predictions returned from the model.': ['ආකෘතියෙන් උපාධි නිර්දේශ ලැබී නැත.', 'மாதிரியிலிருந்து பட்டப்படிப்புப் பரிந்துரைகள் கிடைக்கவில்லை.'],
  'Try adjusting your profile or Z-Score.': ['ඔබේ තොරතුරු හෝ Z අගය වෙනස් කර බලන්න.', 'உங்கள் தகவல்களை அல்லது Z மதிப்பை மாற்றிப் பார்க்கவும்.'],
  'Loading map...': ['සිතියම පූරණය වෙමින්...', 'வரைபடம் ஏற்றப்படுகிறது...'],
  'No Preferred Universities Selected': ['කැමති විශ්වවිද්‍යාල තෝරා නැත', 'விருப்பப் பல்கலைக்கழகங்கள் தேர்ந்தெடுக்கப்படவில்லை'],
  'Browse Universities': ['විශ්වවිද්‍යාල බලන්න', 'பல்கலைக்கழகங்களைப் பார்'],
  'Quick Comparison': ['කෙටි සැසඳීම', 'விரைவான ஒப்பீடு'],
  'University': ['විශ්වවිද්‍යාලය', 'பல்கலைக்கழகம்'],
  'Type': ['වර්ගය', 'வகை'],
  'Admission %': ['ඇතුළත් වීම %', 'சேர்க்கை %'],
  'Your Z-Score': ['ඔබේ Z අගය', 'உங்கள் Z மதிப்பு'],
  'Status': ['තත්ත්වය', 'நிலை'],
  'Key Skills Required': ['අවශ්‍ය ප්‍රධාන කුසලතා', 'தேவையான முக்கியத் திறன்கள்'],
  'Required Education': ['අවශ්‍ය අධ්‍යාපනය', 'தேவையான கல்வி'],
  'Future Path': ['අනාගත මාර්ගය', 'எதிர்காலப் பாதை'],
  'Industries': ['කර්මාන්ත', 'தொழில் துறைகள்'],
  'Salary Range': ['වැටුප් පරාසය', 'சம்பள வரம்பு'],
  'Timeline': ['කාලසටහන', 'காலவரிசை'],
  'AI Improvement Guidance': ['AI වැඩිදියුණු කිරීමේ මඟපෙන්වීම', 'AI மேம்பாட்டு வழிகாட்டுதல்'],
  'Your Profile Summary': ['ඔබේ තොරතුරු සාරාංශය', 'உங்கள் தகவல் சுருக்கம்'],
  'Current Profile Summary': ['වත්මන් තොරතුරු සාරාංශය', 'தற்போதைய தகவல் சுருக்கம்'],
  'Dream Job': ['අපේක්ෂිත රැකියාව', 'கனவு வேலை'],
  'Stream': ['විෂය ධාරාව', 'பாடப்பிரிவு'],
  'District': ['දිස්ත්‍රික්කය', 'மாவட்டம்'],
  'Location Preference': ['කැමති ස්ථානය', 'விருப்பமான இடம்'],
  'Priority Actions': ['ප්‍රමුඛ ක්‍රියාමාර්ග', 'முன்னுரிமை நடவடிக்கைகள்'],
  'If-Then Improvement Scenarios': ['වෙනස්කම් අනුව දියුණුවන අවස්ථා', 'மாற்றங்களின் அடிப்படையிலான மேம்பாட்டு வாய்ப்புகள்'],
  'Current:': ['වත්මන්:', 'தற்போதைய:'],
  'If-Then Scenario:': ['වෙනස්කම් අනුව අවස්ථාව:', 'மாற்றத்தின் அடிப்படையிலான வாய்ப்பு:'],
  'Actionable Steps:': ['ගත හැකි පියවර:', 'செயல்படுத்தக்கூடிய படிகள்:'],
  'Map your dream.': ['ඔබේ සිහිනය සැලසුම් කරන්න.', 'உங்கள் கனவைத் திட்டமிடுங்கள்.'],
  'Make it real': ['එය සැබෑ කරන්න', 'அதை நனவாக்குங்கள்'],
  'Your Future, One Step Ahead': ['ඔබේ අනාගතයට තවත් පියවරක්', 'உங்கள் எதிர்காலத்திற்கான அடுத்த படி'],
  'Key Activities': ['ප්‍රධාන ක්‍රියාකාරකම්', 'முக்கிய செயல்பாடுகள்'],
  'Skills to Develop': ['දියුණු කළ යුතු කුසලතා', 'வளர்க்க வேண்டிய திறன்கள்'],
  'Recommended Bridging Courses': ['නිර්දේශිත පාලම් පාඨමාලා', 'பரிந்துரைக்கப்பட்ட இணைப்புப் பாடநெறிகள்'],
  'Micro-Credentials': ['කෙටි සහතික පාඨමාලා', 'குறுகிய சான்றிதழ் பாடநெறிகள்'],
  'Academic Path': ['අධ්‍යාපන මාර්ගය', 'கல்விப் பாதை'],
  'Alternative Path': ['විකල්ප මාර්ගය', 'மாற்றுப் பாதை'],
  'G.C.E. A/L Stream': ['අ.පො.ස. උසස් පෙළ විෂය ධාරාව', 'க.பொ.த. உயர்தரப் பாடப்பிரிவு'],
  'Physical Science': ['භෞතික විද්‍යාව', 'பௌதிக அறிவியல்'],
  'Biological Science': ['ජීව විද්‍යාව', 'உயிரியல் அறிவியல்'],
  'Commerce': ['වාණිජ', 'வணிகம்'],
  'Arts': ['කලා', 'கலை'],
  'Technology': ['තාක්ෂණවේදය', 'தொழில்நுட்பம்'],
  'Engineering Technology': ['ඉංජිනේරු තාක්ෂණවේදය', 'பொறியியல் தொழில்நுட்பம்'],
  'Urban': ['නාගරික', 'நகர்ப்புறம்'],
  'Suburban': ['අර්ධ නාගරික', 'புறநகர்ப்புறம்'],
  'Rural': ['ග්‍රාමීය', 'கிராமப்புறம்'],
  'High': ['ඉහළ', 'அதிகம்'],
  'Medium': ['මධ්‍යම', 'நடுத்தரம்'],
  'Low': ['අඩු', 'குறைவு'],
  'Very High': ['ඉතා ඉහළ', 'மிக அதிகம்'],
  'Very Important': ['ඉතා වැදගත්', 'மிக முக்கியம்'],
  'Important': ['වැදගත්', 'முக்கியம்'],
  'Moderate': ['මධ්‍යස්ථ', 'மிதமானது'],
  'Not Important': ['වැදගත් නැත', 'முக்கியமில்லை'],
  'Introvert': ['අන්තර්මුඛ', 'உள்முகம்'],
  'Extrovert': ['බාහිරමුඛ', 'வெளிமுகம்'],
  'Ambivert': ['දෙවර්ගයටම අයත්', 'இருவகையும்'],
  'Choose what matters most to you in your future career': ['ඔබේ අනාගත රැකියාවේ වැදගත් දේ තෝරන්න', 'உங்கள் எதிர்கால வேலையில் முக்கியமானவற்றைத் தேர்ந்தெடுக்கவும்'],
  'Analytical Thinking': ['විශ්ලේෂණාත්මක චින්තනය', 'பகுப்பாய்வுச் சிந்தனை'],
  'Creativity': ['නිර්මාණශීලීත්වය', 'படைப்பாற்றல்'],
  'Leadership': ['නායකත්වය', 'தலைமைத்துவம்'],
  'Risk Taking': ['අවදානම් ගැනීම', 'ஆபத்தை ஏற்றல்'],
  'Communication': ['සන්නිවේදනය', 'தொடர்பாடல்'],
  'Problem Solving': ['ගැටලු විසඳීම', 'சிக்கல் தீர்த்தல்'],
  'Teamwork': ['කණ්ඩායම් වැඩ', 'குழுப்பணி'],
  'Entrepreneurial Mindset': ['ව්‍යවසායක චින්තනය', 'தொழில்முனைவுச் சிந்தனை'],
  'Business Acumen': ['ව්‍යාපාරික අවබෝධය', 'வணிக அறிவு'],
  'Work-Life Balance': ['රැකියාව සහ ජීවිතයේ සමබරතාව', 'வேலை மற்றும் வாழ்க்கைச் சமநிலை'],
  'Family Attachment': ['පවුලට ඇති බැඳීම', 'குடும்பப் பற்று'],
  'Salary Expectation': ['වැටුප් අපේක්ෂාව', 'சம்பள எதிர்பார்ப்பு'],
  'Travel Tolerance': ['ගමන් කිරීමේ කැමැත්ත', 'பயண விருப்பம்'],
  'Stress Tolerance': ['ආතතිය දරාගැනීම', 'மன அழுத்தத்தைத் தாங்குதல்'],
  'Social Interaction': ['සමාජ සබඳතා', 'சமூகத் தொடர்பு'],
  'Career Growth': ['රැකියා වර්ධනය', 'தொழில் வளர்ச்சி'],
  'Social Impact': ['සමාජ බලපෑම', 'சமூகத் தாக்கம்'],
  'Core Subjects': ['ප්‍රධාන විෂයයන්', 'முக்கியப் பாடங்கள்'],
  'Optional Subjects': ['විකල්ප විෂයයන්', 'விருப்பப் பாடங்கள்'],
  'Combined Mathematics': ['සංයුක්ත ගණිතය', 'இணைந்த கணிதம்'],
  'Physics': ['භෞතික විද්‍යාව', 'பௌதிகவியல்'],
  'Chemistry': ['රසායන විද්‍යාව', 'இரசாயனவியல்'],
  'Biology': ['ජීව විද්‍යාව', 'உயிரியல்'],
  'Accounting': ['ගිණුම්කරණය', 'கணக்கியல்'],
  'Economics': ['ආර්ථික විද්‍යාව', 'பொருளியல்'],
  'Business Studies': ['ව්‍යාපාර අධ්‍යයනය', 'வணிகக் கல்வி'],
  'Government': ['රාජ්‍ය', 'அரசு'],
  'Private': ['පෞද්ගලික', 'தனியார்'],
  'All': ['සියලු', 'அனைத்தும்'],
};

Object.assign(advisorMessages, extraMessages, pathMessages, careerMessages, academicMessages, evidenceMessages, workspaceMessages, subjectMessages, careerExpansionMessages, stateUniversityMessages);
for (const career of dreamJobs) {
  if (careerDescriptions[career.id]) advisorMessages[career.description] = careerDescriptions[career.id];
}

// Career identifiers remain English in API payloads; only display copy is localised.
for (const job of careerCatalog.jobs) {
  for (const step of [...(job.roadmapSteps || []), ...(job.futurePathSteps || [])]) {
    for (const value of [step.title, step.description]) advisorMessages[value.en] = [value.si, value.ta];
  }
  for (const value of [job.title, job.description, job.summary, job.qualification, job.project, ...[job.registrationNote].filter(Boolean)]) {
    advisorMessages[value.en] = [value.si, value.ta];
  }
}
for (const value of [...Object.values(careerCatalog.copy), ...Object.values(careerCatalog.foundations)]) {
  advisorMessages[value.en] = [value.si, value.ta];
}

const templatePatterns = Object.entries(advisorTemplates).map(([source, values]) => {
  const escaped = source.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = escaped.replace(/\\\{\d+\\\}/g, '(.+?)');
  return { regex: new RegExp(`^${pattern}$`), values };
});

export function translateAdvisor(text, language = 'en') {
  if (Array.isArray(text)) return text.map(item => translateAdvisor(item, language));
  if (typeof text !== 'string' || language === 'en') return text;
  const index = language === 'si' ? 0 : language === 'ta' ? 1 : -1;
  if (index < 0) return text;
  const trimmed = text.trim();
  const value = advisorMessages[trimmed]?.[index];
  if (value) return text.replace(trimmed, value);
  const normalized = trimmed.replace(/^skill_scores\./, '').replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  if (advisorMessages[normalized]) return advisorMessages[normalized][index];
  if (!/[A-Za-z]/.test(trimmed)) return text;
  const degree = trimmed.match(/^(BSc(?: in)?|MSc|Diploma in|PhD) (.+)$/);
  if (degree) {
    const prefixes = { BSc: ['විද්‍යාවේදී', 'விஞ்ஞான இளமாணி'], 'BSc in': ['විද්‍යාවේදී', 'விஞ்ஞான இளமாணி'], MSc: ['විද්‍යාපති', 'விஞ்ஞான முதுமாணி'], 'Diploma in': ['ඩිප්ලෝමාව', 'டிப்ளோமா'], PhD: ['ආචාර්ය උපාධිය', 'கலாநிதிப் பட்டம்'] };
    return `${translateAdvisor(degree[2], language)} ${prefixes[degree[1]][index]}`;
  }
  const bonus = trimmed.match(/^(Your Z-score.+?)( and you receive a .+?% district bonus for .+?)\. (Admission probability: .+)$/);
  if (bonus) return `${translateAdvisor(bonus[1], language)} ${translateAdvisor(bonus[2], language)}. ${translateAdvisor(bonus[3], language)}`;
  for (const { regex, values } of templatePatterns) {
    const match = trimmed.match(regex);
    if (match && !match.slice(1).some(value => /\.\s/.test(value))) {
      return values[index].replace(/\{(\d+)\}/g, (_, position) => translateAdvisor(match[Number(position) + 1], language)).trim();
    }
  }
  // Backend explanations can contain several independently translated sentences.
  const sentences = trimmed.split(/(?<=\.)\s+/);
  if (sentences.length > 1) return sentences.map(sentence => translateAdvisor(sentence, language)).join(' ');
  const list = trimmed.split(', ');
  if (list.length > 1) return list.map(item => translateAdvisor(item, language)).join(', ');
  const punctuation = trimmed.match(/^(.+?)([.:])$/);
  if (punctuation && advisorMessages[punctuation[1]]) return `${translateAdvisor(punctuation[1], language)}${punctuation[2]}`;
  return text;
}
