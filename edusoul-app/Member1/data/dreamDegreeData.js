import careerCatalog from './careerCatalog.json' with { type: 'json' };

// Dummy data for Future Dream Degree Advisor

export const dreamJobs = careerCatalog.jobs.map(job => ({
  id: job.id,
  title: job.title.en,
  category: job.category,
  icon: '',
  description: job.description.en,
  requiredSkills: Object.keys(job.skillTargets).map(key => key.replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())),
  requiredQualifications: [job.qualification.en],
  aliases: job.aliases,
  routeType: job.routeType,
  marketDemand: null,
  sustainabilityScore: null,
  averageSalary: null,
}));

export const universities = [
  // ═══════════════════════════════════════════════
  // GOVERNMENT UNIVERSITIES (19)
  // Z-score cutoffs aligned with backend flask_app.py
  // ═══════════════════════════════════════════════
  {
    id: 1,
    name: "University of Colombo",
    type: "Government",
    district: "Colombo",
    programs: [
      { name: "BSc Computer Science", zScoreCutoff: 1.60, duration: "4 years", stream: "Physical Science" },
      { name: "BSc IT", zScoreCutoff: 1.55, duration: "4 years", stream: "Physical Science" },
      { name: "MBBS (Medicine)", zScoreCutoff: 1.99, duration: "5 years", stream: "Biological Science" },
      { name: "BSc Business Administration", zScoreCutoff: 1.45, duration: "4 years", stream: "Commerce" },
      { name: "BSc Management", zScoreCutoff: 1.45, duration: "4 years", stream: "Commerce" },
      { name: "LLB (Law)", zScoreCutoff: 1.65, duration: "4 years", stream: "Arts" },
      { name: "BSc Nursing", zScoreCutoff: 1.40, duration: "4 years", stream: "Biological Science" },
      { name: "BA Arts", zScoreCutoff: 0.85, duration: "3 years", stream: "Arts" },
      { name: "BSc Education", zScoreCutoff: 0.80, duration: "4 years", stream: "Arts" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 1
  },
  {
    id: 2,
    name: "University of Peradeniya",
    type: "Government",
    district: "Kandy",
    programs: [
      { name: "BSc Engineering", zScoreCutoff: 1.50, duration: "4 years", stream: "Physical Science" },
      { name: "BSc IT", zScoreCutoff: 1.40, duration: "4 years", stream: "Physical Science" },
      { name: "MBBS (Medicine)", zScoreCutoff: 1.95, duration: "5 years", stream: "Biological Science" },
      { name: "BDS (Dental)", zScoreCutoff: 1.85, duration: "5 years", stream: "Biological Science" },
      { name: "BSc Agriculture", zScoreCutoff: 1.30, duration: "4 years", stream: "Biological Science" },
      { name: "BSc Veterinary Science", zScoreCutoff: 1.60, duration: "5 years", stream: "Biological Science" },
      { name: "BSc Pharmacy", zScoreCutoff: 1.55, duration: "4 years", stream: "Biological Science" },
      { name: "BSc Nursing", zScoreCutoff: 1.35, duration: "4 years", stream: "Biological Science" },
      { name: "BA Arts", zScoreCutoff: 0.90, duration: "3 years", stream: "Arts" }
    ],
    hostelAvailable: true,
    urbanLocation: false,
    nationalRanking: 2
  },
  {
    id: 3,
    name: "University of Moratuwa",
    type: "Government",
    district: "Colombo",
    programs: [
      { name: "BSc Engineering", zScoreCutoff: 1.55, duration: "4 years", stream: "Physical Science" },
      { name: "BSc IT", zScoreCutoff: 1.50, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Computer Science", zScoreCutoff: 1.55, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Architecture", zScoreCutoff: 1.40, duration: "5 years", stream: "Physical Science" },
      { name: "BSc Quantity Surveying", zScoreCutoff: 1.35, duration: "4 years", stream: "Physical Science" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 3
  },
  {
    id: 4,
    name: "University of Sri Jayewardenepura",
    type: "Government",
    district: "Colombo",
    programs: [
      { name: "BSc Business Administration", zScoreCutoff: 1.30, duration: "4 years", stream: "Commerce" },
      { name: "BSc IT", zScoreCutoff: 1.35, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Management", zScoreCutoff: 1.40, duration: "4 years", stream: "Commerce" },
      { name: "BSc Accounting", zScoreCutoff: 1.35, duration: "4 years", stream: "Commerce" },
      { name: "BSc Finance", zScoreCutoff: 1.30, duration: "4 years", stream: "Commerce" },
      { name: "BSc Nursing", zScoreCutoff: 1.35, duration: "4 years", stream: "Biological Science" },
      { name: "BSc Bio Science", zScoreCutoff: 1.50, duration: "4 years", stream: "Biological Science" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 4
  },
  {
    id: 5,
    name: "University of Kelaniya",
    type: "Government",
    district: "Gampaha",
    programs: [
      { name: "BSc Business Administration", zScoreCutoff: 1.25, duration: "4 years", stream: "Commerce" },
      { name: "MBBS (Medicine)", zScoreCutoff: 1.90, duration: "5 years", stream: "Biological Science" },
      { name: "BSc Bio Science", zScoreCutoff: 1.45, duration: "4 years", stream: "Biological Science" },
      { name: "BA Arts", zScoreCutoff: 0.80, duration: "3 years", stream: "Arts" },
      { name: "BSc Education", zScoreCutoff: 0.75, duration: "4 years", stream: "Arts" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 5
  },
  {
    id: 6,
    name: "University of Jaffna",
    type: "Government",
    district: "Jaffna",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.15, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Engineering", zScoreCutoff: 1.25, duration: "4 years", stream: "Physical Science" },
      { name: "MBBS (Medicine)", zScoreCutoff: 1.80, duration: "5 years", stream: "Biological Science" },
      { name: "BSc Business Administration", zScoreCutoff: 1.10, duration: "4 years", stream: "Commerce" },
      { name: "BSc Agriculture", zScoreCutoff: 1.20, duration: "4 years", stream: "Biological Science" },
      { name: "BA Arts", zScoreCutoff: 0.70, duration: "3 years", stream: "Arts" }
    ],
    hostelAvailable: true,
    urbanLocation: false,
    nationalRanking: 6
  },
  {
    id: 7,
    name: "Eastern University",
    type: "Government",
    district: "Batticaloa",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.05, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Business Administration", zScoreCutoff: 1.05, duration: "4 years", stream: "Commerce" },
      { name: "BSc Agriculture", zScoreCutoff: 1.15, duration: "4 years", stream: "Biological Science" },
      { name: "BA Arts", zScoreCutoff: 0.65, duration: "3 years", stream: "Arts" }
    ],
    hostelAvailable: true,
    urbanLocation: false,
    nationalRanking: 7
  },
  {
    id: 8,
    name: "South Eastern University",
    type: "Government",
    district: "Ampara",
    programs: [
      { name: "BSc IT", zScoreCutoff: 0.95, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Business Administration", zScoreCutoff: 0.95, duration: "4 years", stream: "Commerce" },
      { name: "BA Arts", zScoreCutoff: 0.60, duration: "3 years", stream: "Arts" }
    ],
    hostelAvailable: true,
    urbanLocation: false,
    nationalRanking: 8
  },
  {
    id: 9,
    name: "Ruhuna University",
    type: "Government",
    district: "Matara",
    programs: [
      { name: "BSc Engineering", zScoreCutoff: 1.30, duration: "4 years", stream: "Physical Science" },
      { name: "BSc IT", zScoreCutoff: 1.20, duration: "4 years", stream: "Physical Science" },
      { name: "MBBS (Medicine)", zScoreCutoff: 1.85, duration: "5 years", stream: "Biological Science" },
      { name: "BSc Business Administration", zScoreCutoff: 1.15, duration: "4 years", stream: "Commerce" },
      { name: "BSc Agriculture", zScoreCutoff: 1.25, duration: "4 years", stream: "Biological Science" },
      { name: "BSc Pharmacy", zScoreCutoff: 1.40, duration: "4 years", stream: "Biological Science" },
      { name: "BSc Nursing", zScoreCutoff: 1.30, duration: "4 years", stream: "Biological Science" }
    ],
    hostelAvailable: true,
    urbanLocation: false,
    nationalRanking: 9
  },
  {
    id: 10,
    name: "Sabaragamuwa University",
    type: "Government",
    district: "Ratnapura",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.05, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Business Administration", zScoreCutoff: 1.05, duration: "4 years", stream: "Commerce" },
      { name: "BSc Bio Science", zScoreCutoff: 1.25, duration: "4 years", stream: "Biological Science" },
      { name: "BSc Agriculture", zScoreCutoff: 1.10, duration: "4 years", stream: "Biological Science" }
    ],
    hostelAvailable: true,
    urbanLocation: false,
    nationalRanking: 10
  },
  {
    id: 11,
    name: "Wayamba University",
    type: "Government",
    district: "Kurunegala",
    programs: [
      { name: "BSc IT", zScoreCutoff: 0.95, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Business Administration", zScoreCutoff: 0.95, duration: "4 years", stream: "Commerce" },
      { name: "BSc Agriculture", zScoreCutoff: 1.05, duration: "4 years", stream: "Biological Science" },
      { name: "BSc Bio Science", zScoreCutoff: 1.15, duration: "4 years", stream: "Biological Science" }
    ],
    hostelAvailable: true,
    urbanLocation: false,
    nationalRanking: 11
  },
  {
    id: 12,
    name: "Uva Wellassa University",
    type: "Government",
    district: "Badulla",
    programs: [
      { name: "BSc IT", zScoreCutoff: 0.95, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Business Administration", zScoreCutoff: 0.90, duration: "4 years", stream: "Commerce" },
      { name: "BSc Bio Science", zScoreCutoff: 1.10, duration: "4 years", stream: "Biological Science" },
      { name: "BSc Entrepreneurship", zScoreCutoff: 0.85, duration: "4 years", stream: "Commerce" }
    ],
    hostelAvailable: true,
    urbanLocation: false,
    nationalRanking: 12
  },
  {
    id: 13,
    name: "Rajarata University",
    type: "Government",
    district: "Anuradhapura",
    programs: [
      { name: "BSc IT", zScoreCutoff: 0.85, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Business Administration", zScoreCutoff: 0.85, duration: "4 years", stream: "Commerce" },
      { name: "MBBS (Medicine)", zScoreCutoff: 1.75, duration: "5 years", stream: "Biological Science" },
      { name: "BSc Agriculture", zScoreCutoff: 1.00, duration: "4 years", stream: "Biological Science" },
      { name: "BSc Management", zScoreCutoff: 0.90, duration: "4 years", stream: "Commerce" }
    ],
    hostelAvailable: true,
    urbanLocation: false,
    nationalRanking: 13
  },
  {
    id: 14,
    name: "University of Visual and Performing Arts",
    type: "Government",
    district: "Colombo",
    programs: [
      { name: "BA Fine Arts", zScoreCutoff: 1.00, duration: "4 years", stream: "Arts" }
    ],
    hostelAvailable: false,
    urbanLocation: true,
    nationalRanking: 14
  },
  {
    id: 15,
    name: "Sri Lanka Institute of Advanced Technology",
    type: "Government",
    district: "Gampaha",
    programs: [
      { name: "BSc Advanced Technology", zScoreCutoff: 1.30, duration: "4 years", stream: "Engineering Technology" },
      { name: "BSc Engineering", zScoreCutoff: 1.25, duration: "4 years", stream: "Engineering Technology" },
      { name: "BSc IT", zScoreCutoff: 1.25, duration: "4 years", stream: "Engineering Technology" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 16
  },
  {
    id: 16,
    name: "University of Colombo School of Computing (UCSC)",
    type: "Government",
    district: "Colombo",
    programs: [
      { name: "BSc Computer Science", zScoreCutoff: 1.60, duration: "4 years", stream: "Physical Science" },
      { name: "BSc IT", zScoreCutoff: 1.50, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Data Science", zScoreCutoff: 1.55, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Cyber Security", zScoreCutoff: 1.60, duration: "4 years", stream: "Physical Science" }
    ],
    hostelAvailable: false,
    urbanLocation: true,
    nationalRanking: 1
  },
  {
    id: 17,
    name: "Sri Lanka Institute of Information Technology (SLIIT - Gov)",
    type: "Government",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.40, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Computer Science", zScoreCutoff: 1.50, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Software Engineering", zScoreCutoff: 1.50, duration: "4 years", stream: "Physical Science" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 17
  },
  {
    id: 18,
    name: "General Sir John Kotelawala Defence University (KDU)",
    type: "Government",
    district: "Gampaha",
    programs: [
      { name: "BSc Engineering", zScoreCutoff: 1.35, duration: "4 years", stream: "Physical Science" },
      { name: "MBBS (Medicine)", zScoreCutoff: 1.80, duration: "5 years", stream: "Biological Science" },
      { name: "BSc IT", zScoreCutoff: 1.25, duration: "4 years", stream: "Physical Science" },
      { name: "BSc Business Administration", zScoreCutoff: 1.15, duration: "4 years", stream: "Commerce" },
      { name: "LLB (Law)", zScoreCutoff: 1.50, duration: "4 years", stream: "Arts" },
      { name: "BSc Nursing", zScoreCutoff: 1.30, duration: "4 years", stream: "Biological Science" },
      { name: "BSc Computer Science", zScoreCutoff: 1.30, duration: "4 years", stream: "Physical Science" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 18
  },
  {
    id: 19,
    name: "University of Buddhist and Pali",
    type: "Government",
    district: "Colombo",
    programs: [
      { name: "BA Buddhist Studies", zScoreCutoff: 1.00, duration: "3 years", stream: "Arts" },
      { name: "BA Pali", zScoreCutoff: 1.00, duration: "3 years", stream: "Arts" },
      { name: "BA Philosophy", zScoreCutoff: 1.10, duration: "3 years", stream: "Arts" }
    ],
    hostelAvailable: false,
    urbanLocation: true,
    nationalRanking: 19
  },

  // ═══════════════════════════════════════════════
  // PRIVATE UNIVERSITIES (25)
  // More flexible admission - Z-score cutoffs are
  // minimum requirements, not competitive cutoffs
  // ═══════════════════════════════════════════════
  {
    id: 20,
    name: "SLIIT (Private)",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 500,000 - 800,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 400,000 - 700,000/yr" },
      { name: "BSc Engineering", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 600,000 - 900,000/yr" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 1
  },
  {
    id: 21,
    name: "CINEC",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc Engineering", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 700,000 - 1,200,000/yr" },
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 600,000 - 900,000/yr" },
      { name: "BSc Maritime Studies", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 800,000 - 1,300,000/yr" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 2
  },
  {
    id: 22,
    name: "NSBM Green University",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 600,000 - 900,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 500,000 - 800,000/yr" },
      { name: "BSc Engineering", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 700,000 - 1,000,000/yr" },
      { name: "LLB (Law)", zScoreCutoff: 1.00, duration: "4 years", stream: "Arts", tuitionFee: "LKR 800,000 - 1,200,000/yr" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 4
  },
  {
    id: 23,
    name: "APIIT Sri Lanka",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 900,000 - 1,300,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 800,000 - 1,200,000/yr" },
      { name: "LLB (Law)", zScoreCutoff: 1.00, duration: "4 years", stream: "Arts", tuitionFee: "LKR 700,000 - 1,100,000/yr" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 8
  },
  {
    id: 24,
    name: "American College",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 600,000 - 900,000/yr" },
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 700,000 - 1,000,000/yr" },
      { name: "BSc Psychology", zScoreCutoff: 1.00, duration: "4 years", stream: "Biological Science", tuitionFee: "LKR 650,000 - 950,000/yr" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 3
  },
  {
    id: 25,
    name: "ICBT Campus",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 500,000 - 800,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 400,000 - 700,000/yr" },
      { name: "BSc Hospitality", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 450,000 - 750,000/yr" }
    ],
    hostelAvailable: false,
    urbanLocation: true,
    nationalRanking: 5
  },
  {
    id: 26,
    name: "Informatics Institute of Technology",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 500,000 - 800,000/yr" },
      { name: "BSc Data Science", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 600,000 - 900,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 400,000 - 700,000/yr" }
    ],
    hostelAvailable: false,
    urbanLocation: true,
    nationalRanking: 6
  },
  {
    id: 27,
    name: "Esoft Metro Campus",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 400,000 - 700,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 350,000 - 600,000/yr" },
      { name: "BSc Engineering", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 600,000 - 900,000/yr" }
    ],
    hostelAvailable: false,
    urbanLocation: true,
    nationalRanking: 7
  },
  {
    id: 28,
    name: "ANC Education",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 800,000 - 1,200,000/yr" },
      { name: "MBBS (Medicine)", zScoreCutoff: 1.00, duration: "5 years", stream: "Biological Science", tuitionFee: "LKR 2,000,000 - 3,000,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 700,000 - 1,100,000/yr" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 9
  },
  {
    id: 29,
    name: "Royal Institute",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 550,000 - 850,000/yr" },
      { name: "BSc Engineering", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 650,000 - 950,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 450,000 - 750,000/yr" }
    ],
    hostelAvailable: false,
    urbanLocation: true,
    nationalRanking: 10
  },
  {
    id: 30,
    name: "BMS (Business Management School)",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 400,000 - 700,000/yr" },
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 500,000 - 800,000/yr" },
      { name: "BSc Management", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 450,000 - 750,000/yr" }
    ],
    hostelAvailable: false,
    urbanLocation: true,
    nationalRanking: 12
  },
  {
    id: 31,
    name: "Saegis Campus",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 550,000 - 850,000/yr" },
      { name: "BSc Engineering", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 650,000 - 950,000/yr" },
      { name: "LLB (Law)", zScoreCutoff: 1.00, duration: "4 years", stream: "Arts", tuitionFee: "LKR 700,000 - 1,000,000/yr" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 13
  },
  {
    id: 32,
    name: "Lanka Education",
    type: "Private",
    district: "Kandy",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 450,000 - 700,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 350,000 - 600,000/yr" },
      { name: "BSc Hospitality", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 400,000 - 650,000/yr" }
    ],
    hostelAvailable: false,
    urbanLocation: false,
    nationalRanking: 14
  },
  {
    id: 33,
    name: "Sri Lanka Institute of Tourism & Hotel Management",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc Tourism", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 300,000 - 500,000/yr" },
      { name: "BSc Hospitality", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 350,000 - 550,000/yr" }
    ],
    hostelAvailable: false,
    urbanLocation: true,
    nationalRanking: 15
  },
  {
    id: 34,
    name: "International College of Business",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 400,000 - 650,000/yr" },
      { name: "BSc Management", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 450,000 - 700,000/yr" },
      { name: "BSc Finance", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 500,000 - 750,000/yr" }
    ],
    hostelAvailable: false,
    urbanLocation: true,
    nationalRanking: 16
  },
  {
    id: 35,
    name: "American International College",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 600,000 - 900,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 500,000 - 800,000/yr" },
      { name: "BSc Psychology", zScoreCutoff: 1.00, duration: "4 years", stream: "Biological Science", tuitionFee: "LKR 550,000 - 850,000/yr" }
    ],
    hostelAvailable: false,
    urbanLocation: true,
    nationalRanking: 11
  },
  {
    id: 36,
    name: "London Metropolitan University (Colombo)",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 900,000 - 1,300,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 800,000 - 1,200,000/yr" },
      { name: "LLB (Law)", zScoreCutoff: 1.00, duration: "4 years", stream: "Arts", tuitionFee: "LKR 850,000 - 1,250,000/yr" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 20
  },
  {
    id: 37,
    name: "Middlesex University (Colombo)",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 1,000,000 - 1,400,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 900,000 - 1,300,000/yr" },
      { name: "BSc Psychology", zScoreCutoff: 1.00, duration: "4 years", stream: "Biological Science", tuitionFee: "LKR 850,000 - 1,250,000/yr" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 21
  },
  {
    id: 38,
    name: "University of West London (Colombo)",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 950,000 - 1,350,000/yr" },
      { name: "BSc Hospitality", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 750,000 - 1,150,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 850,000 - 1,250,000/yr" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 22
  },
  {
    id: 39,
    name: "De Montfort University (Colombo)",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 900,000 - 1,300,000/yr" },
      { name: "BSc Engineering", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 1,000,000 - 1,500,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 800,000 - 1,200,000/yr" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 23
  },
  {
    id: 40,
    name: "University of Wolverhampton (Colombo)",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 850,000 - 1,250,000/yr" },
      { name: "BSc Engineering", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 950,000 - 1,400,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 750,000 - 1,150,000/yr" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 24
  },
  {
    id: 41,
    name: "University of Northampton (Colombo)",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 800,000 - 1,200,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 700,000 - 1,100,000/yr" },
      { name: "BSc Psychology", zScoreCutoff: 1.00, duration: "4 years", stream: "Biological Science", tuitionFee: "LKR 650,000 - 1,000,000/yr" }
    ],
    hostelAvailable: true,
    urbanLocation: true,
    nationalRanking: 25
  },
  {
    id: 42,
    name: "Colombo International Institute",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 500,000 - 800,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 400,000 - 700,000/yr" },
      { name: "BSc Engineering", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 600,000 - 900,000/yr" }
    ],
    hostelAvailable: false,
    urbanLocation: true,
    nationalRanking: 17
  },
  {
    id: 43,
    name: "Asia Pacific Institute",
    type: "Private",
    district: "Kandy",
    programs: [
      { name: "BSc IT", zScoreCutoff: 1.00, duration: "4 years", stream: "Physical Science", tuitionFee: "LKR 550,000 - 800,000/yr" },
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 450,000 - 700,000/yr" },
      { name: "BSc Hospitality", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 400,000 - 600,000/yr" }
    ],
    hostelAvailable: false,
    urbanLocation: false,
    nationalRanking: 18
  },
  {
    id: 44,
    name: "Wisdom Business College",
    type: "Private",
    district: "Colombo",
    programs: [
      { name: "BSc Business", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 350,000 - 600,000/yr" },
      { name: "BSc Management", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 400,000 - 650,000/yr" },
      { name: "BSc Marketing", zScoreCutoff: 1.00, duration: "4 years", stream: "Commerce", tuitionFee: "LKR 300,000 - 550,000/yr" }
    ],
    hostelAvailable: false,
    urbanLocation: true,
    nationalRanking: 19
  }
];

export const personalityTraits = {
  analytical_thinking: {
    icon: "🔍",
    label: "Analytical Thinking",
    description: "Ability to analyze complex problems logically",
    lowLabel: "Intuitive",
    highLabel: "Highly Analytical"
  },
  creativity: {
    icon: "🎨",
    label: "Creativity",
    description: "Ability to think outside the box and innovate",
    lowLabel: "Practical",
    highLabel: "Highly Creative"
  },
  leadership: {
    icon: "👑",
    label: "Leadership",
    description: "Ability to guide and influence others",
    lowLabel: "Supportive",
    highLabel: "Strong Leader"
  },
  communication: {
    icon: "💬",
    label: "Communication",
    description: "Skill in expressing ideas clearly",
    lowLabel: "Reserved",
    highLabel: "Excellent Communicator"
  },
  problem_solving: {
    icon: "🧩",
    label: "Problem Solving",
    description: "Ability to find solutions to challenges",
    lowLabel: "Seeks Guidance",
    highLabel: "Independent Solver"
  },
  teamwork: {
    icon: "🤝",
    label: "Teamwork",
    description: "Ability to collaborate with others effectively",
    lowLabel: "Solo Worker",
    highLabel: "Great Team Player"
  },
  adaptability: {
    icon: "🔄",
    label: "Adaptability",
    description: "Ability to adjust to new situations",
    lowLabel: "Routine-oriented",
    highLabel: "Highly Adaptable"
  },
  attention_to_detail: {
    icon: "🎯",
    label: "Attention to Detail",
    description: "Precision and thoroughness in work",
    lowLabel: "Big Picture",
    highLabel: "Detail-oriented"
  },
  entrepreneurial_mindset: {
    icon: "🚀",
    label: "Entrepreneurial Mindset",
    description: "Interest in starting businesses and innovation",
    lowLabel: "Employee mindset",
    highLabel: "Entrepreneurial"
  },
  risk_taking: {
    icon: "⚡",
    label: "Risk Taking",
    description: "Willingness to take calculated risks",
    lowLabel: "Risk-averse",
    highLabel: "Risk-taker"
  }
};

export const lifestyleFactors = {
  locationPreference: {
    icon: "📍",
    label: "Location Preference",
    description: "Where would you prefer to live and work?",
    options: [
      { value: "Urban", label: "Urban", icon: "🏙️", desc: "City life with easy access" },
      { value: "Suburban", label: "Suburban", icon: "🏘️", desc: "Quiet but connected" },
      { value: "Rural", label: "Rural", icon: "🌿", desc: "Peaceful countryside" },
      { value: "Any", label: "Any", icon: "🌍", desc: "No preference" }
    ]
  },
  workLifeBalance: {
    icon: "⚖️",
    label: "Work-Life Balance",
    description: "How important is work-life balance to you?",
    options: [
      { value: "Very Important", label: "Very Important", icon: "🧘", desc: "Top priority" },
      { value: "Important", label: "Important", icon: "⚖️", desc: "Matters a lot" },
      { value: "Moderate", label: "Moderate", icon: "🤝", desc: "Balanced view" },
      { value: "Not Important", label: "Not Important", icon: "💪", desc: "Career first" }
    ]
  },
  familyAttachment: {
    icon: "👨‍👩‍👧‍👦",
    label: "Family Attachment",
    description: "How important is staying close to family?",
    options: [
      { value: "Very Important", label: "Very Close", icon: "🏠", desc: "Need to stay nearby" },
      { value: "Important", label: "Close", icon: "👨‍👩‍👧", desc: "Regular visits" },
      { value: "Moderate", label: "Moderate", icon: "📞", desc: "Occasional visits" },
      { value: "Not Important", label: "Independent", icon: "✈️", desc: "Comfortable far away" }
    ]
  },
  salaryExpectation: {
    icon: "💰",
    label: "Salary Expectation",
    description: "How important is a high salary to you?",
    options: [
      { value: "Very High", label: "Very High", icon: "💎", desc: "Top earning priority" },
      { value: "High", label: "High", icon: "💰", desc: "Important factor" },
      { value: "Medium", label: "Medium", icon: "💵", desc: "Comfortable enough" },
      { value: "Low", label: "Low", icon: "🌱", desc: "Passion over pay" }
    ]
  },
  careerGrowth: {
    icon: "📈",
    label: "Career Growth",
    description: "How important is long-term career progression?",
    options: [
      { value: "Very Important", label: "Very Important", icon: "🚀", desc: "Rapid advancement" },
      { value: "Important", label: "Important", icon: "📈", desc: "Steady growth" },
      { value: "Moderate", label: "Moderate", icon: "🎯", desc: "Balanced approach" },
      { value: "Not Important", label: "Not Important", icon: "😌", desc: "Stability preferred" }
    ]
  },
  stressTolerance: {
    icon: "🧠",
    label: "Stress Tolerance",
    description: "How well do you handle high-pressure situations?",
    options: [
      { value: "High", label: "High", icon: "💪", desc: "Thrive under pressure" },
      { value: "Medium", label: "Medium", icon: "😊", desc: "Handle it okay" },
      { value: "Low", label: "Low", icon: "🧘", desc: "Prefer calm environments" }
    ]
  },
  socialImpact: {
    icon: "🌍",
    label: "Social Impact",
    description: "How important is making a difference in society?",
    options: [
      { value: "Very Important", label: "Very Important", icon: "🌟", desc: "Core motivation" },
      { value: "Important", label: "Important", icon: "❤️", desc: "Matters to me" },
      { value: "Moderate", label: "Moderate", icon: "🤝", desc: "Nice to have" },
      { value: "Not Important", label: "Not Important", icon: "💼", desc: "Personal goals first" }
    ]
  },
  travelTolerance: {
    icon: "🚗",
    label: "Daily Travel Tolerance",
    description: "How far are you willing to travel daily?",
    options: [
      { value: "Low", label: "Low", icon: "🏠", desc: "Within 30 mins" },
      { value: "Medium", label: "Medium", icon: "🚗", desc: "30-60 mins" },
      { value: "High", label: "High", icon: "✈️", desc: "60+ mins acceptable" }
    ]
  },
  workEnvironment: {
    icon: "🏢",
    label: "Preferred Work Environment",
    description: "Where do you prefer to work?",
    options: [
      { value: "Office", label: "Office", icon: "🏢", desc: "Traditional workplace" },
      { value: "Remote", label: "Remote", icon: "🏠", desc: "Work from home" },
      { value: "Hybrid", label: "Hybrid", icon: "🔄", desc: "Mix of both" },
      { value: "Field", label: "Field", icon: "🌳", desc: "Outdoor/on-site" }
    ]
  },
  socialInteraction: {
    icon: "👥",
    label: "Social Interaction Preference",
    description: "What's your preferred work style?",
    options: [
      { value: "Introvert", label: "Introvert", icon: "🔇", desc: "Independent work" },
      { value: "Ambivert", label: "Ambivert", icon: "⚖️", desc: "Balanced mix" },
      { value: "Extrovert", label: "Extrovert", icon: "🔊", desc: "Team-oriented" }
    ]
  }
};

export const sampleStudentData = {
  personalInfo: {
    name: "Kamal Perera",
    age: 19,
    district: "Colombo"
  },
  academicResults: {
    olResults: {
      mathematics: "A",
      science: "A",
      english: "B",
      sinhala: "A",
      buddhism: "A"
    },
    alResults: {
      stream: "Physical Science",
      combinedMathematics: "B",
      physics: "A",
      chemistry: "B",
      zScore: 2.35
    },
    predictedPerformance: {
      improvement: "Medium",
      potentialZScore: 2.5
    }
  },
  dreamJob: "Software Engineer",
  personalityScores: {
    leadership: 7,
    creativity: 8,
    analytical_thinking: 9,
    risk_taking: 6,
    entrepreneurial_mindset: 5
  },
  lifestylePreferences: {
    locationPreference: "Urban",
    travelTolerance: "Medium (max 1hr)",
    familyAttachment: "Medium - occasional visits",
    workEnvironment: "Office-based",
    stressTolerance: "High",
    socialInteraction: "Medium - balanced"
  },
  interests: ["Programming", "Problem Solving", "Technology", "Innovation"]
};

export const languageTranslations = {
  en: {
    title: "Future Dream Degree Advisor",
    subtitle: "Discover your ideal academic pathway based on your future goal",
    dreamJob: "Future Goal",
    academicResults: "Academic Results",
    personality: "Personality Assessment",
    lifestyle: "Lifestyle Preferences",
    analyze: "Analyze My Pathway",
    results: "Your Results",
    roadmap: "Future Goal Roadmap",
    guidance: "Improvement Guidance"
  },
  si: {
    title: "අනාගත සිහින උපාධි උපදේශක",
    subtitle: "ඔබේ සිහින වෘත්තිය අනුව ඔබේ පරිපූර්ණ අධ්‍යාපන මාර්ගය සොයාගන්න",
    dreamJob: "සිහින රැකියාව/ඉලක්කය",
    academicResults: "අධ්‍යාපන ප්‍රතිඵල",
    personality: "පෞරුෂත්ව ඇගයීම",
    lifestyle: "ජීවන රටා අභිරුචි",
    analyze: "මගේ මාර්ගය විශ්ලේෂණය කරන්න",
    results: "ඔබේ ප්‍රතිඵල",
    roadmap: "වෘත්තියේ මාර්ගය",
    guidance: "වැඩිදියුණු මඟපෙන්වීම"
  },
  ta: {
    title: "எதிர்கால கனவு பட்டய ஆலோசகர்",
    subtitle: "உங்கள் கனவு தொழிலின் அடிப்படையில் உங்கள் சிறந்த கல்வி பாதையைக் கண்டறியவும்",
    dreamJob: "கனவு வேலை/தொழில் இலக்கு",
    academicResults: "கல்வி முடிவுகள்",
    personality: "ஆளுமை மதிப்பீடு",
    lifestyle: "வாழ்க்கை விருப்பங்கள்",
    analyze: "எனது பாதையை பகுப்பாய்வு செய்யவும்",
    results: "உங்கள் முடிவுகள்",
    roadmap: "தொழில் வழிகாட்டி",
    guidance: "மேம்பாட்டு வழிகாட்டுதல்"
  }
};
