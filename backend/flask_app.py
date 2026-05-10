#!/usr/bin/env python3
"""
FutureDream Flask App - Direct Model Execution
Runs the backward-chaining AI model without Uvicorn
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
from enhanced_trained_model import TrainedModelPredictor, UniversityRecommender

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize trained model predictor
model_predictor = TrainedModelPredictor()
university_recommender = UniversityRecommender()

print("🚀 FutureDream Backend Starting...")
print("📊 Model: Trained Random Forest + Backward-Chaining")
print("🎓 University Database: 19 Government + 25 Private Universities (ALL Sri Lankan Universities)")

# Complete Sri Lankan University Database - ALL Universities
UNIVERSITY_DATABASE = {
    "government": {
        # Major National Universities
        "University of Colombo": {
            "degrees": ["IT", "Business", "Bio Science", "Mathematics", "Medicine", "Law", "Arts"],
            "z_score_requirements": {"IT": 1.8, "Business": 1.7, "Bio Science": 2.1, "Mathematics": 1.9, "Medicine": 3.8, "Law": 2.5, "Arts": 1.2},
            "district_bonus": {"Colombo": 0.1, "Gampaha": 0.05},
            "location": "Colombo",
            "rankings": {"national": 1, "international": 1001},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Hospital", "Law Library"],
            "specialties": ["Computer Science", "Business Administration", "Medicine", "Law"]
        },
        "University of Peradeniya": {
            "degrees": ["Engineering", "IT", "Bio Science", "Mathematics", "Medicine", "Agriculture", "Arts", "Dental"],
            "z_score_requirements": {"Engineering": 1.7, "IT": 1.6, "Bio Science": 1.9, "Mathematics": 1.7, "Medicine": 3.7, "Agriculture": 1.8, "Arts": 1.3, "Dental": 3.5},
            "district_bonus": {"Kandy": 0.1, "Matale": 0.05},
            "location": "Kandy",
            "rankings": {"national": 2, "international": 1200},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Hospital", "Agricultural Farm", "Dental Hospital"],
            "specialties": ["Engineering", "Agriculture", "Medicine", "Veterinary Science"]
        },
        "University of Moratuwa": {
            "degrees": ["Engineering", "IT", "Architecture", "Town Planning", "Design"],
            "z_score_requirements": {"Engineering": 1.9, "IT": 1.8, "Architecture": 1.7, "Town Planning": 1.6, "Design": 1.5},
            "district_bonus": {"Colombo": 0.05, "Gampaha": 0.05},
            "location": "Moratuwa",
            "rankings": {"national": 3, "international": 800},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Engineering Workshops"],
            "specialties": ["Engineering", "Architecture", "Technology", "Design"]
        },
        "University of Sri Jayewardenepura": {
            "degrees": ["Business", "IT", "Bio Science", "Mathematics", "Management", "Applied Science"],
            "z_score_requirements": {"Business": 1.6, "IT": 1.5, "Bio Science": 1.8, "Mathematics": 1.6, "Management": 1.7, "Applied Science": 1.6},
            "district_bonus": {"Colombo": 0.05},
            "location": "Nugegoda",
            "rankings": {"national": 4, "international": 1500},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Business Center"],
            "specialties": ["Business Management", "Computer Science", "Applied Sciences"]
        },
        "University of Kelaniya": {
            "degrees": ["Business", "Bio Science", "Mathematics", "Arts", "Commerce", "Medicine"],
            "z_score_requirements": {"Business": 1.5, "Bio Science": 1.7, "Mathematics": 1.5, "Arts": 1.2, "Commerce": 1.6, "Medicine": 3.6},
            "district_bonus": {"Gampaha": 0.1, "Colombo": 0.05},
            "location": "Kelaniya",
            "rankings": {"national": 5, "international": 1800},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Medical Faculty"],
            "specialties": ["Commerce", "Science", "Humanities", "Medicine"]
        },
        "University of Jaffna": {
            "degrees": ["IT", "Engineering", "Business", "Bio Science", "Arts", "Medicine", "Agriculture"],
            "z_score_requirements": {"IT": 1.4, "Engineering": 1.5, "Business": 1.4, "Bio Science": 1.6, "Arts": 1.1, "Medicine": 3.4, "Agriculture": 1.5},
            "district_bonus": {"Jaffna": 0.15, "Mannar": 0.1, "Vavuniya": 0.05},
            "location": "Jaffna",
            "rankings": {"national": 6, "international": 2000},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Medical Faculty", "Agricultural Farm"],
            "specialties": ["Engineering", "Agriculture", "Medicine", "Tamil Studies"]
        },
        "Eastern University": {
            "degrees": ["Business", "IT", "Bio Science", "Agriculture", "Arts"],
            "z_score_requirements": {"Business": 1.3, "IT": 1.3, "Bio Science": 1.5, "Agriculture": 1.4, "Arts": 1.1},
            "district_bonus": {"Batticaloa": 0.15, "Ampara": 0.1, "Trincomalee": 0.1},
            "location": "Batticaloa",
            "rankings": {"national": 7, "international": 2500},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Agricultural Farm"],
            "specialties": ["Agriculture", "Business", "Science", "Cultural Studies"]
        },
        "South Eastern University": {
            "degrees": ["Business", "IT", "Arts", "Islamic Studies"],
            "z_score_requirements": {"Business": 1.2, "IT": 1.2, "Arts": 1.0, "Islamic Studies": 1.1},
            "district_bonus": {"Ampara": 0.1},
            "location": "Sammanthurai",
            "rankings": {"national": 8, "international": 3000},
            "facilities": ["Library", "Labs", "Sports", "Hostels"],
            "specialties": ["Business", "Computer Science", "Islamic Studies"]
        },
        "Ruhuna University": {
            "degrees": ["Engineering", "IT", "Business", "Bio Science", "Medicine", "Agriculture", "Fisheries"],
            "z_score_requirements": {"Engineering": 1.5, "IT": 1.4, "Business": 1.4, "Bio Science": 1.7, "Medicine": 3.5, "Agriculture": 1.6, "Fisheries": 1.3},
            "district_bonus": {"Matara": 0.1, "Galle": 0.05, "Hambantota": 0.1},
            "location": "Matara",
            "rankings": {"national": 9, "international": 2200},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Medical Faculty", "Marine Research Center"],
            "specialties": ["Engineering", "Medicine", "Agriculture", "Marine Science"]
        },
        "Sabaragamuwa University": {
            "degrees": ["Business", "Bio Science", "IT", "Applied Science", "Agriculture"],
            "z_score_requirements": {"Business": 1.3, "Bio Science": 1.5, "IT": 1.3, "Applied Science": 1.4, "Agriculture": 1.4},
            "district_bonus": {"Ratnapura": 0.1, "Kegalle": 0.05},
            "location": "Belihuloya",
            "rankings": {"national": 10, "international": 2800},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Gemology Lab"],
            "specialties": ["Applied Sciences", "Agricultural Sciences", "Gemology"]
        },
        "Wayamba University": {
            "degrees": ["Business", "Bio Science", "IT", "Agriculture", "Plantation Management"],
            "z_score_requirements": {"Business": 1.2, "Bio Science": 1.4, "IT": 1.2, "Agriculture": 1.3, "Plantation Management": 1.2},
            "district_bonus": {"Kurunegala": 0.1, "Puttalam": 0.05},
            "location": "Kuliyapitiya",
            "rankings": {"national": 11, "international": 3200},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Agricultural Farm"],
            "specialties": ["Agriculture", "Business Management", "Plantation Management"]
        },
        "Uva Wellassa University": {
            "degrees": ["Business", "IT", "Bio Science", "Entrepreneurship", "Management"],
            "z_score_requirements": {"Business": 1.2, "IT": 1.2, "Bio Science": 1.4, "Entrepreneurship": 1.1, "Management": 1.3},
            "district_bonus": {"Badulla": 0.1, "Monaragala": 0.1},
            "location": "Badulla",
            "rankings": {"national": 12, "international": 3500},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Business Incubator"],
            "specialties": ["Entrepreneurship", "Management", "Applied Sciences"]
        },
        "Rajarata University": {
            "degrees": ["Business", "Bio Science", "IT", "Agriculture", "Medicine"],
            "z_score_requirements": {"Business": 1.1, "Bio Science": 1.3, "IT": 1.1, "Agriculture": 1.3, "Medicine": 3.3},
            "district_bonus": {"Anuradhapura": 0.1, "Polonnaruwa": 0.1},
            "location": "Anuradhapura",
            "rankings": {"national": 13, "international": 3800},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Medical Faculty"],
            "specialties": ["Agriculture", "Business Studies", "Medicine"]
        },
        
        # Specialized Universities
        "University of Visual and Performing Arts": {
            "degrees": ["Fine Arts", "Music", "Drama", "Dance", "Design"],
            "z_score_requirements": {"Fine Arts": 1.0, "Music": 1.0, "Drama": 1.0, "Dance": 1.0, "Design": 1.1},
            "district_bonus": {"Colombo": 0.05},
            "location": "Colombo",
            "rankings": {"national": 14, "international": 4000},
            "facilities": ["Art Studios", "Theaters", "Music Rooms", "Dance Studios"],
            "specialties": ["Visual Arts", "Performing Arts", "Design"]
        },
        "University of the Visual Arts": {
            "degrees": ["Visual Arts", "Sculpture", "Painting", "Graphic Design"],
            "z_score_requirements": {"Visual Arts": 1.0, "Sculpture": 1.0, "Painting": 1.0, "Graphic Design": 1.1},
            "district_bonus": {"Colombo": 0.05},
            "location": "Colombo",
            "rankings": {"national": 15, "international": 4200},
            "facilities": ["Art Studios", "Gallery", "Workshops"],
            "specialties": ["Visual Arts", "Sculpture", "Painting"]
        },
        "Sri Lanka Institute of Advanced Technology": {
            "degrees": ["Advanced Technology", "Engineering", "IT"],
            "z_score_requirements": {"Advanced Technology": 1.6, "Engineering": 1.5, "IT": 1.5},
            "district_bonus": {"Gampaha": 0.05},
            "location": "Malabe",
            "rankings": {"national": 16, "international": 4500},
            "facilities": ["Advanced Labs", "Workshops", "Library"],
            "specialties": ["Advanced Technology", "Engineering", "IT"]
        },
        
        # Campus Universities (Under Main Universities)
        "University of Colombo School of Computing": {
            "degrees": ["Computer Science", "IT", "Data Science", "Cyber Security"],
            "z_score_requirements": {"Computer Science": 1.9, "IT": 1.8, "Data Science": 1.8, "Cyber Security": 1.9},
            "district_bonus": {"Colombo": 0.1},
            "location": "Colombo",
            "rankings": {"national": 1, "international": 1001},
            "facilities": ["Computer Labs", "Library", "Research Centers"],
            "specialties": ["Computer Science", "IT", "Data Science"]
        },
        "Sri Lanka Institute of Information Technology": {
            "degrees": ["IT", "Computer Science", "Software Engineering", "Business IT"],
            "z_score_requirements": {"IT": 1.7, "Computer Science": 1.8, "Software Engineering": 1.8, "Business IT": 1.6},
            "district_bonus": {"Colombo": 0.05, "Gampaha": 0.05},
            "location": "Malabe",
            "rankings": {"national": 17, "international": 4000},
            "facilities": ["Computer Labs", "Library", "Research Centers", "Incubator"],
            "specialties": ["Information Technology", "Software Engineering"]
        },
        
        # Defense Universities
        "General Sir John Kotelawala Defence University": {
            "degrees": ["Engineering", "Medicine", "IT", "Business", "Law", "Management"],
            "z_score_requirements": {"Engineering": 1.6, "Medicine": 3.4, "IT": 1.5, "Business": 1.4, "Law": 2.3, "Management": 1.5},
            "district_bonus": {"Colombo": 0.05, "Gampaha": 0.05},
            "location": "Kandana",
            "rankings": {"national": 18, "international": 4300},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Medical Center", "Training Facilities"],
            "specialties": ["Defense Studies", "Engineering", "Medicine", "Management"]
        },
        
        # Buddhist Universities
        "University of Buddhist and Pali": {
            "degrees": ["Buddhist Studies", "Pali", "Philosophy", "Archaeology"],
            "z_score_requirements": {"Buddhist Studies": 1.0, "Pali": 1.0, "Philosophy": 1.1, "Archaeology": 1.1},
            "district_bonus": {"Colombo": 0.05},
            "location": "Homagama",
            "rankings": {"national": 19, "international": 5000},
            "facilities": ["Library", "Research Centers", "Meditation Center"],
            "specialties": ["Buddhist Studies", "Pali Language", "Archaeology"]
        }
    },
    "private": {
        # Major Private Universities
        "SLIIT": {
            "degrees": ["IT", "Business", "Engineering", "Architecture", "Management"],
            "z_score_requirements": {"IT": 1.0, "Business": 1.0, "Engineering": 1.0, "Architecture": 1.0, "Management": 1.0},
            "tuition_fee_range": {"IT": "500,000-800,000", "Business": "400,000-700,000", "Engineering": "600,000-900,000", "Architecture": "700,000-1,000,000", "Management": "450,000-750,000"},
            "location": "Malabe",
            "rankings": {"national": 1, "international": 4000},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Industry Partnerships", "Research Centers"],
            "specialties": ["Information Technology", "Business Administration", "Engineering"],
            "accreditation": ["UGC", "IET", "BCS"]
        },
        "CINEC": {
            "degrees": ["Engineering", "IT", "Business", "Maritime Studies", "Logistics"],
            "z_score_requirements": {"Engineering": 1.0, "IT": 1.0, "Business": 1.0, "Maritime Studies": 1.0, "Logistics": 1.0},
            "tuition_fee_range": {"Engineering": "700,000-1,200,000", "IT": "600,000-900,000", "Business": "500,000-800,000", "Maritime Studies": "800,000-1,300,000", "Logistics": "550,000-850,000"},
            "location": "Malabe",
            "rankings": {"national": 2, "international": 4500},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Maritime Training", "Simulators"],
            "specialties": ["Maritime Studies", "Engineering", "IT"],
            "accreditation": ["UGC", "IMarEST"]
        },
        "American College": {
            "degrees": ["Business", "IT", "Psychology", "Marketing"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Psychology": 1.0, "Marketing": 1.0},
            "tuition_fee_range": {"Business": "600,000-900,000", "IT": "700,000-1,000,000", "Psychology": "650,000-950,000", "Marketing": "550,000-850,000"},
            "location": "Colombo",
            "rankings": {"national": 3, "international": 5000},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Psychology Lab"],
            "specialties": ["Business Administration", "Computer Science", "Psychology"],
            "accreditation": ["UGC", "American University Partnerships"]
        },
        "NSBM": {
            "degrees": ["Business", "IT", "Engineering", "Management", "Law"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Engineering": 1.0, "Management": 1.0, "Law": 1.0},
            "tuition_fee_range": {"Business": "500,000-800,000", "IT": "600,000-900,000", "Engineering": "700,000-1,000,000", "Management": "450,000-750,000", "Law": "800,000-1,200,000"},
            "location": "Homagama",
            "rankings": {"national": 4, "international": 5200},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Modern Campus", "Moot Court"],
            "specialties": ["Management", "Computing", "Engineering"],
            "accreditation": ["UGC", "Plymouth University UK"]
        },
        "ICBT": {
            "degrees": ["Business", "IT", "Hospitality", "Engineering"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Hospitality": 1.0, "Engineering": 1.0},
            "tuition_fee_range": {"Business": "400,000-700,000", "IT": "500,000-800,000", "Hospitality": "450,000-750,000", "Engineering": "650,000-950,000"},
            "location": "Colombo",
            "rankings": {"national": 5, "international": 5500},
            "facilities": ["Library", "Labs", "Sports", "Hospitality Training Center"],
            "specialties": ["Business Studies", "Information Technology", "Hospitality"],
            "accreditation": ["UGC", "UK University Partnerships"]
        },
        "Informatics": {
            "degrees": ["IT", "Business", "Data Science", "Cyber Security"],
            "z_score_requirements": {"IT": 1.0, "Business": 1.0, "Data Science": 1.0, "Cyber Security": 1.0},
            "tuition_fee_range": {"IT": "500,000-800,000", "Business": "400,000-700,000", "Data Science": "600,000-900,000", "Cyber Security": "650,000-950,000"},
            "location": "Colombo",
            "rankings": {"national": 6, "international": 5800},
            "facilities": ["Library", "Labs", "Sports", "Security Lab"],
            "specialties": ["Computing", "Business Management", "Data Science"],
            "accreditation": ["UGC", "University Partnerships"]
        },
        "Esoft": {
            "degrees": ["IT", "Business", "Engineering", "Architecture"],
            "z_score_requirements": {"IT": 1.0, "Business": 1.0, "Engineering": 1.0, "Architecture": 1.0},
            "tuition_fee_range": {"IT": "400,000-700,000", "Business": "350,000-600,000", "Engineering": "600,000-900,000", "Architecture": "550,000-850,000"},
            "location": "Colombo",
            "rankings": {"national": 7, "international": 6000},
            "facilities": ["Library", "Labs", "Sports", "Engineering Workshops"],
            "specialties": ["Software Engineering", "Business Studies", "Architecture"],
            "accreditation": ["UGC", "International Partnerships"]
        },
        "APIIT": {
            "degrees": ["Business", "IT", "Law", "Management"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Law": 1.0, "Management": 1.0},
            "tuition_fee_range": {"Business": "800,000-1,200,000", "IT": "900,000-1,300,000", "Law": "700,000-1,100,000", "Management": "750,000-1,150,000"},
            "location": "Colombo",
            "rankings": {"national": 8, "international": 4800},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Moot Court"],
            "specialties": ["Business Administration", "Information Technology", "Law"],
            "accreditation": ["UGC", "UK University Partnerships"]
        },
        
        # Additional Private Universities
        "ANC Education": {
            "degrees": ["Business", "IT", "Engineering", "Medicine", "Law"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Engineering": 1.0, "Medicine": 1.0, "Law": 1.0},
            "tuition_fee_range": {"Business": "700,000-1,100,000", "IT": "800,000-1,200,000", "Engineering": "900,000-1,400,000", "Medicine": "2,000,000-3,000,000", "Law": "850,000-1,250,000"},
            "location": "Colombo",
            "rankings": {"national": 9, "international": 6200},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Medical Facilities"],
            "specialties": ["Business", "IT", "Medicine", "Law"],
            "accreditation": ["UGC", "International Partnerships"]
        },
        "Royal Institute": {
            "degrees": ["Business", "IT", "Engineering", "Architecture"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Engineering": 1.0, "Architecture": 1.0},
            "tuition_fee_range": {"Business": "450,000-750,000", "IT": "550,000-850,000", "Engineering": "650,000-950,000", "Architecture": "600,000-900,000"},
            "location": "Colombo",
            "rankings": {"national": 10, "international": 6500},
            "facilities": ["Library", "Labs", "Sports", "Engineering Workshops"],
            "specialties": ["Business Studies", "IT", "Engineering"],
            "accreditation": ["UGC", "UK University Partnerships"]
        },
        "American International College": {
            "degrees": ["Business", "IT", "Hospitality", "Psychology"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Hospitality": 1.0, "Psychology": 1.0},
            "tuition_fee_range": {"Business": "500,000-800,000", "IT": "600,000-900,000", "Hospitality": "450,000-750,000", "Psychology": "550,000-850,000"},
            "location": "Colombo",
            "rankings": {"national": 11, "international": 6800},
            "facilities": ["Library", "Labs", "Sports", "Hospitality Training"],
            "specialties": ["Business", "IT", "Hospitality Management"],
            "accreditation": ["UGC", "International Partnerships"]
        },
        "BMS": {
            "degrees": ["Business", "IT", "Management", "Marketing"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Management": 1.0, "Marketing": 1.0},
            "tuition_fee_range": {"Business": "400,000-700,000", "IT": "500,000-800,000", "Management": "450,000-750,000", "Marketing": "350,000-650,000"},
            "location": "Colombo",
            "rankings": {"national": 12, "international": 7000},
            "facilities": ["Library", "Labs", "Sports", "Business Center"],
            "specialties": ["Business Management", "IT", "Marketing"],
            "accreditation": ["UGC", "International Partnerships"]
        },
        "Saegis Campus": {
            "degrees": ["Business", "IT", "Engineering", "Law"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Engineering": 1.0, "Law": 1.0},
            "tuition_fee_range": {"Business": "450,000-750,000", "IT": "550,000-850,000", "Engineering": "650,000-950,000", "Law": "700,000-1,000,000"},
            "location": "Nugegoda",
            "rankings": {"national": 13, "international": 7200},
            "facilities": ["Library", "Labs", "Sports", "Hostels"],
            "specialties": ["Business", "IT", "Engineering"],
            "accreditation": ["UGC", "University Partnerships"]
        },
        "Lanka Education": {
            "degrees": ["Business", "IT", "Hospitality", "Tourism"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Hospitality": 1.0, "Tourism": 1.0},
            "tuition_fee_range": {"Business": "350,000-600,000", "IT": "450,000-700,000", "Hospitality": "400,000-650,000", "Tourism": "300,000-550,000"},
            "location": "Kandy",
            "rankings": {"national": 14, "international": 7500},
            "facilities": ["Library", "Labs", "Sports", "Hospitality Training"],
            "specialties": ["Business", "IT", "Hospitality"],
            "accreditation": ["UGC", "International Partnerships"]
        },
        "Sri Lanka Institute of Tourism": {
            "degrees": ["Tourism", "Hospitality", "Business", "Management"],
            "z_score_requirements": {"Tourism": 1.0, "Hospitality": 1.0, "Business": 1.0, "Management": 1.0},
            "tuition_fee_range": {"Tourism": "300,000-500,000", "Hospitality": "350,000-550,000", "Business": "400,000-600,000", "Management": "450,000-650,000"},
            "location": "Colombo",
            "rankings": {"national": 15, "international": 7800},
            "facilities": ["Library", "Labs", "Sports", "Hospitality Training Center"],
            "specialties": ["Tourism Management", "Hospitality"],
            "accreditation": ["UGC", "Tourism Authority"]
        },
        "International College of Business": {
            "degrees": ["Business", "Management", "Marketing", "Finance"],
            "z_score_requirements": {"Business": 1.0, "Management": 1.0, "Marketing": 1.0, "Finance": 1.0},
            "tuition_fee_range": {"Business": "400,000-650,000", "Management": "450,000-700,000", "Marketing": "350,000-600,000", "Finance": "500,000-750,000"},
            "location": "Colombo",
            "rankings": {"national": 16, "international": 8000},
            "facilities": ["Library", "Labs", "Sports", "Business Center"],
            "specialties": ["Business Administration", "Management"],
            "accreditation": ["UGC", "International Partnerships"]
        },
        "Colombo International Institute": {
            "degrees": ["IT", "Business", "Engineering", "Architecture"],
            "z_score_requirements": {"IT": 1.0, "Business": 1.0, "Engineering": 1.0, "Architecture": 1.0},
            "tuition_fee_range": {"IT": "500,000-800,000", "Business": "400,000-700,000", "Engineering": "600,000-900,000", "Architecture": "550,000-850,000"},
            "location": "Colombo",
            "rankings": {"national": 17, "international": 8200},
            "facilities": ["Library", "Labs", "Sports", "Engineering Workshops"],
            "specialties": ["IT", "Business", "Engineering"],
            "accreditation": ["UGC", "International Partnerships"]
        },
        "Asia Pacific Institute": {
            "degrees": ["Business", "IT", "Management", "Hospitality"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Management": 1.0, "Hospitality": 1.0},
            "tuition_fee_range": {"Business": "450,000-700,000", "IT": "550,000-800,000", "Management": "400,000-650,000", "Hospitality": "400,000-600,000"},
            "location": "Kandy",
            "rankings": {"national": 18, "international": 8500},
            "facilities": ["Library", "Labs", "Sports", "Business Center"],
            "specialties": ["Business Management", "IT", "Hospitality"],
            "accreditation": ["UGC", "International Partnerships"]
        },
        "Wisdom Business College": {
            "degrees": ["Business", "Management", "Marketing", "HR"],
            "z_score_requirements": {"Business": 1.0, "Management": 1.0, "Marketing": 1.0, "HR": 1.0},
            "tuition_fee_range": {"Business": "350,000-600,000", "Management": "400,000-650,000", "Marketing": "300,000-550,000", "HR": "350,000-600,000"},
            "location": "Colombo",
            "rankings": {"national": 19, "international": 8800},
            "facilities": ["Library", "Labs", "Sports", "Business Center"],
            "specialties": ["Business Administration", "Management"],
            "accreditation": ["UGC", "International Partnerships"]
        },
        "London Metropolitan University": {
            "degrees": ["Business", "IT", "Law", "Management"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Law": 1.0, "Management": 1.0},
            "tuition_fee_range": {"Business": "800,000-1,200,000", "IT": "900,000-1,300,000", "Law": "850,000-1,250,000", "Management": "750,000-1,150,000"},
            "location": "Colombo",
            "rankings": {"national": 20, "international": 4600},
            "facilities": ["Library", "Labs", "Sports", "Hostels"],
            "specialties": ["Business", "IT", "Law"],
            "accreditation": ["UGC", "London Metropolitan University UK"]
        },
        "Middlesex University": {
            "degrees": ["Business", "IT", "Law", "Psychology"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Law": 1.0, "Psychology": 1.0},
            "tuition_fee_range": {"Business": "900,000-1,300,000", "IT": "1,000,000-1,400,000", "Law": "950,000-1,350,000", "Psychology": "850,000-1,250,000"},
            "location": "Colombo",
            "rankings": {"national": 21, "international": 4400},
            "facilities": ["Library", "Labs", "Sports", "Psychology Lab"],
            "specialties": ["Business", "IT", "Law", "Psychology"],
            "accreditation": ["UGC", "Middlesex University UK"]
        },
        "University of West London": {
            "degrees": ["Business", "IT", "Hospitality", "Law"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Hospitality": 1.0, "Law": 1.0},
            "tuition_fee_range": {"Business": "850,000-1,250,000", "IT": "950,000-1,350,000", "Hospitality": "750,000-1,150,000", "Law": "900,000-1,300,000"},
            "location": "Colombo",
            "rankings": {"national": 22, "international": 4200},
            "facilities": ["Library", "Labs", "Sports", "Hospitality Training"],
            "specialties": ["Business", "IT", "Hospitality"],
            "accreditation": ["UGC", "University of West London UK"]
        },
        "De Montfort University": {
            "degrees": ["Business", "IT", "Engineering", "Law"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Engineering": 1.0, "Law": 1.0},
            "tuition_fee_range": {"Business": "800,000-1,200,000", "IT": "900,000-1,300,000", "Engineering": "1,000,000-1,500,000", "Law": "850,000-1,250,000"},
            "location": "Colombo",
            "rankings": {"national": 23, "international": 4000},
            "facilities": ["Library", "Labs", "Sports", "Engineering Workshops"],
            "specialties": ["Business", "IT", "Engineering"],
            "accreditation": ["UGC", "De Montfort University UK"]
        },
        "University of Wolverhampton": {
            "degrees": ["Business", "IT", "Engineering", "Law"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Engineering": 1.0, "Law": 1.0},
            "tuition_fee_range": {"Business": "750,000-1,150,000", "IT": "850,000-1,250,000", "Engineering": "950,000-1,400,000", "Law": "800,000-1,200,000"},
            "location": "Colombo",
            "rankings": {"national": 24, "international": 3800},
            "facilities": ["Library", "Labs", "Sports", "Engineering Workshops"],
            "specialties": ["Business", "IT", "Engineering"],
            "accreditation": ["UGC", "University of Wolverhampton UK"]
        },
        "University of Northampton": {
            "degrees": ["Business", "IT", "Law", "Psychology"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Law": 1.0, "Psychology": 1.0},
            "tuition_fee_range": {"Business": "700,000-1,100,000", "IT": "800,000-1,200,000", "Law": "750,000-1,150,000", "Psychology": "650,000-1,000,000"},
            "location": "Colombo",
            "rankings": {"national": 25, "international": 3600},
            "facilities": ["Library", "Labs", "Sports", "Psychology Lab"],
            "specialties": ["Business", "IT", "Law"],
            "accreditation": ["UGC", "University of Northampton UK"]
        }
    }
}

# Personality Analysis Functions
def extract_personality_traits_from_text(description, detected_traits):
    """Convert detected traits to personality scores"""
    # Start with low baseline - scores will vary based on detected traits
    personality_scores = {
        'leadership': 1,
        'creativity': 1,
        'analytical': 1,
        'risk_taking': 1,
        'entrepreneurial': 1,
        'teamwork': 1,
        'communication': 1,
        'adaptability': 1,
        'empathy': 1,
        'independence': 1,
        'competition': 1
    }
    
    # Convert detected traits to scores (1-5 scale)
    if detected_traits:
        for trait in detected_traits:
            trait_lower = trait.lower()
            
            # Leadership traits - significant impact
            if 'leader' in trait_lower or 'natural leader' in trait_lower:
                personality_scores['leadership'] = min(5, personality_scores['leadership'] + 3)
                personality_scores['teamwork'] = min(5, personality_scores['teamwork'] + 2)
                personality_scores['communication'] = min(5, personality_scores['communication'] + 1)
            elif 'competitive' in trait_lower or 'competitive spirit' in trait_lower:
                personality_scores['leadership'] = min(5, personality_scores['leadership'] + 2)
                personality_scores['competition'] = min(5, personality_scores['competition'] + 3)
                personality_scores['risk_taking'] = min(5, personality_scores['risk_taking'] + 1)
                
            # Creativity traits - significant impact
            elif 'creative' in trait_lower or 'creative thinker' in trait_lower:
                personality_scores['creativity'] = min(5, personality_scores['creativity'] + 3)
                personality_scores['adaptability'] = min(5, personality_scores['adaptability'] + 2)
                personality_scores['entrepreneurial'] = min(5, personality_scores['entrepreneurial'] + 1)
            elif 'curious' in trait_lower or 'curious explorer' in trait_lower:
                personality_scores['creativity'] = min(5, personality_scores['creativity'] + 2)
                personality_scores['analytical'] = min(5, personality_scores['analytical'] + 2)
                
            # Analytical traits - significant impact
            elif 'analytical' in trait_lower or 'analytical mind' in trait_lower:
                personality_scores['analytical'] = min(5, personality_scores['analytical'] + 3)
                personality_scores['problem solving'] = min(5, personality_scores.get('problem_solving', 1) + 2)
                personality_scores['teamwork'] = min(5, personality_scores['teamwork'] + 1)
            elif 'problem' in trait_lower or 'problem solver' in trait_lower:
                personality_scores['analytical'] = min(5, personality_scores['analytical'] + 2)
                personality_scores['problem solving'] = min(5, personality_scores.get('problem_solving', 1) + 3)
                
            # Risk-taking traits
            elif 'risk' in trait_lower or 'risk taker' in trait_lower:
                personality_scores['risk_taking'] = min(5, personality_scores['risk_taking'] + 3)
                personality_scores['entrepreneurial'] = min(5, personality_scores['entrepreneurial'] + 2)
                personality_scores['leadership'] = min(5, personality_scores['leadership'] + 1)
                
            # Teamwork traits
            elif 'team' in trait_lower or 'team player' in trait_lower:
                personality_scores['teamwork'] = min(5, personality_scores['teamwork'] + 3)
                personality_scores['communication'] = min(5, personality_scores['communication'] + 2)
                personality_scores['leadership'] = min(5, personality_scores['leadership'] + 1)
                
            # Entrepreneurial traits
            elif 'entrepreneurial' in trait_lower or 'entrepreneur' in trait_lower:
                personality_scores['entrepreneurial'] = min(5, personality_scores['entrepreneurial'] + 3)
                personality_scores['risk_taking'] = min(5, personality_scores['risk_taking'] + 2)
                personality_scores['leadership'] = min(5, personality_scores['leadership'] + 2)
                
            # Communication traits
            elif 'communicator' in trait_lower or 'great communicator' in trait_lower:
                personality_scores['communication'] = min(5, personality_scores['communication'] + 3)
                personality_scores['teamwork'] = min(5, personality_scores['teamwork'] + 2)
                personality_scores['empathy'] = min(5, personality_scores['empathy'] + 1)
                
            # Adaptability traits
            elif 'adaptable' in trait_lower:
                personality_scores['adaptability'] = min(5, personality_scores['adaptability'] + 3)
                personality_scores['teamwork'] = min(5, personality_scores['teamwork'] + 1)
                personality_scores['creativity'] = min(5, personality_scores['creativity'] + 1)
                
            # Empathy traits
            elif 'empathetic' in trait_lower or 'empathetic helper' in trait_lower:
                personality_scores['empathy'] = min(5, personality_scores['empathy'] + 3)
                personality_scores['teamwork'] = min(5, personality_scores['teamwork'] + 2)
                personality_scores['communication'] = min(5, personality_scores['communication'] + 1)
                
            # Independence traits
            elif 'independent' in trait_lower or 'independent worker' in trait_lower:
                personality_scores['independence'] = min(5, personality_scores['independence'] + 3)
                personality_scores['analytical'] = min(5, personality_scores['analytical'] + 1)
                personality_scores['creativity'] = min(5, personality_scores['creativity'] + 1)
                
            # Competitive traits
            elif 'competitive' in trait_lower or 'competitive spirit' in trait_lower:
                personality_scores['competition'] = min(5, personality_scores['competition'] + 3)
                personality_scores['leadership'] = min(5, personality_scores['leadership'] + 2)
                personality_scores['risk_taking'] = min(5, personality_scores['risk_taking'] + 1)
    
    return personality_scores
                
            # Communication traits
            elif 'communicator' in trait_lower or 'great communicator' in trait_lower:
                personality_scores['communication'] = min(5, personality_scores['communication'] + 2)
                personality_scores['teamwork'] = min(5, personality_scores['teamwork'] + 1)
                
            # Adaptability traits
            elif 'adaptable' in trait_lower:
                personality_scores['adaptability'] = min(5, personality_scores['adaptability'] + 2)
                
            # Empathy traits
            elif 'empathetic' in trait_lower or 'empathetic helper' in trait_lower:
                personality_scores['empathy'] = min(5, personality_scores['empathy'] + 2)
                personality_scores['teamwork'] = min(5, personality_scores['teamwork'] + 1)
                
            # Independence traits
            elif 'independent' in trait_lower or 'independent worker' in trait_lower:
                personality_scores['independence'] = min(5, personality_scores['independence'] + 2)
                
            # Social traits
            elif 'social' in trait_lower or 'social butterfly' in trait_lower:
                personality_scores['communication'] = min(5, personality_scores['communication'] + 1)
                personality_scores['teamwork'] = min(5, personality_scores['teamwork'] + 1)
                
            # Persistence traits
            elif 'persistent' in trait_lower or 'persistent achiever' in trait_lower:
                personality_scores['analytical'] = min(5, personality_scores['analytical'] + 1)
                personality_scores['leadership'] = min(5, personality_scores['leadership'] + 1)
    
    return personality_scores

def analyze_personality_description(description):
    """Analyze personality description for traits"""
    if not description:
        return {'leadership': 3, 'creativity': 3, 'analytical': 3, 'risk_taking': 3, 'entrepreneurial': 3}
    
    traits = []
    lower_desc = description.lower()
    
    # Leadership indicators
    if any(word in lower_desc for word in ['lead', 'manage', 'organize', 'team', 'guide', 'coordinate']):
        traits.append('👑 Natural Leader')
    
    # Creativity indicators
    if any(word in lower_desc for word in ['creative', 'innovative', 'design', 'artistic', 'imagine', 'invent']):
        traits.append('💡 Creative Thinker')
    
    # Analytical indicators
    if any(word in lower_desc for word in ['analyze', 'data', 'logic', 'research', 'solve', 'investigate']):
        traits.append('🔍 Analytical Mind')
    
    # Risk-taking indicators
    if any(word in lower_desc for word in ['risk', 'adventure', 'bold', 'dare', 'challenge', 'experiment']):
        traits.append('🚀 Risk Taker')
    
    # Team collaboration indicators
    if any(word in lower_desc for word in ['collaborate', 'teamwork', 'together', 'group', 'partner', 'support']):
        traits.append('🤝 Team Player')
    
    # Entrepreneurial indicators
    if any(word in lower_desc for word in ['business', 'startup', 'venture', 'opportunity', 'market', 'entrepreneur']):
        traits.append('💼 Entrepreneurial')
    
    return traits

# Enhanced Backward-Chaining Model (from notebook)
class BackwardChainingModel:
    def __init__(self):
        self.career_knowledge = {
            "Software Engineer": {
                "required_skills": {"programming": 0.9, "logic": 0.85, "problem_solving": 0.8, "mathematics": 0.7},
                "personality_traits": {"analytical": 0.8, "creativity": 0.6, "risk_taking": 0.5},
                "degree_paths": {"IT": 0.85, "Engineering": 0.4, "Business": 0.2},
                "z_score_threshold": 1.2,
                "future_demand": 0.95,
                "stress_level": 0.6,
                "work_environment": {"office": 0.8, "remote": 0.7}
            },
            "Doctor": {
                "required_skills": {"biology": 0.95, "memory": 0.9, "stress_handling": 0.85, "empathy": 0.8},
                "personality_traits": {"analytical": 0.7, "leadership": 0.6, "risk_taking": 0.3},
                "degree_paths": {"Medicine": 0.95, "Bio Science": 0.3},
                "z_score_threshold": 2.0,
                "future_demand": 0.9,
                "stress_level": 0.9,
                "work_environment": {"hospital": 0.9, "clinic": 0.6}
            },
            "Data Scientist": {
                "required_skills": {"statistics": 0.9, "programming": 0.85, "analysis": 0.8, "mathematics": 0.75},
                "personality_traits": {"analytical": 0.9, "creativity": 0.7, "risk_taking": 0.4},
                "degree_paths": {"IT": 0.8, "Mathematics": 0.6, "Business": 0.3},
                "z_score_threshold": 1.4,
                "future_demand": 0.92,
                "stress_level": 0.5,
                "work_environment": {"office": 0.7, "remote": 0.8}
            },
            "Entrepreneur": {
                "required_skills": {"leadership": 0.9, "creativity": 0.85, "risk_management": 0.8, "communication": 0.75},
                "personality_traits": {"risk_taking": 0.9, "leadership": 0.85, "creativity": 0.8},
                "degree_paths": {"Business": 0.7, "IT": 0.4, "Engineering": 0.3},
                "z_score_threshold": 1.0,
                "future_demand": 0.7,
                "stress_level": 0.8,
                "work_environment": {"office": 0.4, "remote": 0.3, "field": 0.6}
            },
            "Accountant": {
                "required_skills": {"numbers": 0.95, "accuracy": 0.9, "analysis": 0.7, "ethics": 0.8},
                "personality_traits": {"analytical": 0.8, "risk_taking": 0.2, "creativity": 0.3},
                "degree_paths": {"Business": 0.9, "Finance": 0.7},
                "z_score_threshold": 1.1,
                "future_demand": 0.75,
                "stress_level": 0.4,
                "work_environment": {"office": 0.9}
            },
            "Civil Engineer": {
                "required_skills": {"mathematics": 0.9, "design": 0.85, "physics": 0.8, "project_management": 0.75},
                "personality_traits": {"analytical": 0.8, "creativity": 0.7, "leadership": 0.6},
                "degree_paths": {"Engineering": 0.95, "Architecture": 0.4},
                "z_score_threshold": 1.5,
                "future_demand": 0.85,
                "stress_level": 0.6,
                "work_environment": {"office": 0.5, "field": 0.8}
            }
        }

    def backward_chain(self, dream_job, student_profile):
        """Main backward chaining algorithm with probabilistic reasoning"""
        if dream_job not in self.career_knowledge:
            return {"error": "Career not found in knowledge base"}

        career_info = self.career_knowledge[dream_job]
        results = {
            "dream_job": dream_job,
            "degree_recommendations": {},
            "skill_match_scores": {},
            "personality_match": {},
            "academic_feasibility": {},
            "lifestyle_compatibility": {},
            "overall_scores": {},
            "university_recommendations": {}
        }

        # Calculate degree path probabilities
        for degree, base_prob in career_info["degree_paths"].items():
            adjusted_prob = self._calculate_degree_probability(
                degree, base_prob, student_profile, career_info
            )
            results["degree_recommendations"][degree] = adjusted_prob

        # Calculate skill compatibility
        results["skill_match_scores"] = self._calculate_skill_match(career_info, student_profile)

        # Calculate personality compatibility
        results["personality_match"] = self._calculate_personality_match(career_info, student_profile)

        # Calculate academic feasibility
        results["academic_feasibility"] = self._calculate_academic_feasibility(career_info, student_profile)

        # Calculate lifestyle compatibility
        results["lifestyle_compatibility"] = self._calculate_lifestyle_compatibility(career_info, student_profile)

        # Calculate overall scores for each degree
        for degree in results["degree_recommendations"]:
            overall_score = self._calculate_overall_score(degree, results, student_profile)
            results["overall_scores"][degree] = overall_score

        # Generate university recommendations
        results["university_recommendations"] = self._recommend_universities(results["degree_recommendations"], student_profile)

        return results

    def _recommend_universities(self, degree_recommendations, student_profile):
        """Recommend universities based on degree preferences and student profile"""
        university_recommendations = {}
        student_z_score = safe_float(student_profile.get('z_score', 0))
        student_district = student_profile.get('district', 'Colombo')
        
        # Sort degrees by recommendation score
        sorted_degrees = sorted(degree_recommendations.items(), key=lambda x: x[1], reverse=True)
        
        for degree, score in sorted_degrees[:3]:  # Top 3 degrees
            university_recommendations[degree] = {
                "government": [],
                "private": []
            }
            
            # Government universities
            for uni_name, uni_info in UNIVERSITY_DATABASE["government"].items():
                if degree in uni_info["degrees"]:
                    admission_score = self._calculate_admission_probability(
                        student_z_score, uni_info["z_score_requirements"].get(degree, 1.5),
                        student_district, uni_info.get("district_bonus", {})
                    )
                    
                    if admission_score > 0.3:  # Minimum threshold
                        university_recommendations[degree]["government"].append({
                            "name": uni_name,
                            "location": uni_info["location"],
                            "admission_probability": admission_score,
                            "z_score_requirement": uni_info["z_score_requirements"].get(degree, 1.5),
                            "rankings": uni_info["rankings"],
                            "facilities": uni_info["facilities"],
                            "specialties": uni_info["specialties"],
                            "district_bonus": uni_info.get("district_bonus", {}),
                            "explanation": self._generate_university_explanation(
                                admission_score, student_z_score, uni_info["z_score_requirements"].get(degree, 1.5),
                                student_district, uni_info.get("district_bonus", {})
                            )
                        })
            
            # Private universities
            for uni_name, uni_info in UNIVERSITY_DATABASE["private"].items():
                if degree in uni_info["degrees"]:
                    # Private universities have more flexible admission
                    admission_score = min(1.0, student_z_score / 1.0 + 0.2)  # Base score + bonus
                    
                    university_recommendations[degree]["private"].append({
                        "name": uni_name,
                        "location": uni_info["location"],
                        "admission_probability": admission_score,
                        "tuition_fee_range": uni_info.get("tuition_fee_range", {}).get(degree, "N/A"),
                        "rankings": uni_info["rankings"],
                        "facilities": uni_info["facilities"],
                        "specialties": uni_info["specialties"],
                        "accreditation": uni_info.get("accreditation", []),
                        "explanation": f"Flexible admission with good facilities and industry partnerships"
                    })
            
            # Sort universities by admission probability
            university_recommendations[degree]["government"].sort(
                key=lambda x: x["admission_probability"], reverse=True
            )
            university_recommendations[degree]["private"].sort(
                key=lambda x: x["admission_probability"], reverse=True
            )
        
        return university_recommendations

    def _calculate_admission_probability(self, student_z_score, required_z_score, student_district, district_bonuses):
        """Calculate probability of admission to a university"""
        # Base probability based on Z-score difference
        z_score_diff = student_z_score - required_z_score
        
        if z_score_diff >= 0:
            base_probability = 0.9  # High chance if meets requirement
        elif z_score_diff >= -0.2:
            base_probability = 0.6  # Moderate chance if slightly below
        elif z_score_diff >= -0.5:
            base_probability = 0.3  # Low chance if significantly below
        else:
            base_probability = 0.1  # Very low chance
        
        # Apply district bonus
        district_bonus = district_bonuses.get(student_district, 0)
        adjusted_probability = min(1.0, base_probability + district_bonus)
        
        return adjusted_probability

    def _generate_university_explanation(self, admission_prob, student_z_score, required_z_score, student_district, district_bonuses):
        """Generate explanation for university admission probability"""
        z_score_diff = student_z_score - required_z_score
        district_bonus = district_bonuses.get(student_district, 0)
        
        if z_score_diff >= 0:
            z_score_text = f"Your Z-score of {student_z_score} meets the requirement of {required_z_score}"
        elif z_score_diff >= -0.2:
            z_score_text = f"Your Z-score of {student_z_score} is slightly below the requirement of {required_z_score}"
        else:
            z_score_text = f"Your Z-score of {student_z_score} is below the requirement of {required_z_score}"
        
        if district_bonus > 0:
            district_text = f" and you receive a {district_bonus*100}% district bonus for {student_district}"
        else:
            district_text = ""
        
        return f"{z_score_text}{district_text}. Admission probability: {admission_prob*100:.1f}%."

    def _calculate_degree_probability(self, degree, base_prob, student_profile, career_info):
        """Calculate adjusted probability for degree based on student profile"""
        z_score = float(student_profile.get('z_score', 0))
        threshold = career_info.get('z_score_threshold', 1.5)
        
        # Academic adjustment
        if z_score >= threshold:
            academic_factor = 1.0 + (z_score - threshold) * 0.1
        else:
            academic_factor = 0.5 + (z_score / threshold) * 0.5
        
        # Stream compatibility
        stream = student_profile.get('stream', '').lower()
        if degree == "IT" and ('mathematics' in stream or 'physical science' in stream):
            stream_factor = 1.2
        elif degree == "Engineering" and ('physical science' in stream or 'mathematics' in stream):
            stream_factor = 1.2
        elif degree == "Medicine" and ('biology' in stream or 'physical science' in stream):
            stream_factor = 1.2
        elif degree == "Business":
            stream_factor = 1.0
        else:
            stream_factor = 0.8
        
        return base_prob * academic_factor * stream_factor

    def _calculate_skill_match(self, career_info, student_profile):
        """Calculate skill compatibility scores"""
        skills = career_info["required_skills"]
        skill_scores = {}
        
        # Map student skills to career requirements
        skill_mapping = {
            'programming': safe_int(student_profile.get('analytical_skill', 3)) / 5.0,
            'logic': safe_int(student_profile.get('problem_solving', 3)) / 5.0,
            'problem_solving': safe_int(student_profile.get('problem_solving', 3)) / 5.0,
            'mathematics': safe_int(student_profile.get('analytical_skill', 3)) / 5.0,
            'biology': safe_int(student_profile.get('analytical_skill', 3)) / 5.0,
            'memory': safe_int(student_profile.get('analytical_skill', 3)) / 5.0,
            'stress_handling': safe_int(student_profile.get('stress_tolerance', 3)) / 5.0,
            'empathy': safe_int(student_profile.get('communication_skill', 3)) / 5.0,
            'statistics': safe_int(student_profile.get('analytical_skill', 3)) / 5.0,
            'analysis': safe_int(student_profile.get('problem_solving', 3)) / 5.0,
            'numbers': safe_int(student_profile.get('analytical_skill', 3)) / 5.0,
            'accuracy': safe_int(student_profile.get('problem_solving', 3)) / 5.0,
            'ethics': safe_int(student_profile.get('communication_skill', 3)) / 5.0,
            'design': safe_int(student_profile.get('creativity', 3)) / 5.0,
            'physics': safe_int(student_profile.get('analytical_skill', 3)) / 5.0,
            'project_management': safe_int(student_profile.get('leadership', 3)) / 5.0,
            'risk_management': safe_int(student_profile.get('risk_taking', 3)) / 5.0,
            'communication': safe_int(student_profile.get('communication_skill', 3)) / 5.0,
            'leadership': safe_int(student_profile.get('leadership', 3)) / 5.0
        }
        
        for skill, required_level in skills.items():
            student_level = skill_mapping.get(skill, 0.6)
            skill_scores[skill] = min(1.0, student_level / required_level)
        
        return skill_scores

    def _calculate_personality_match(self, career_info, student_profile):
        """Calculate personality compatibility scores"""
        traits = career_info["personality_traits"]
        personality_scores = {}
        
        trait_mapping = {
            'analytical': safe_int(student_profile.get('analytical_skill', 3)) / 5.0,
            'creativity': safe_int(student_profile.get('creativity', 3)) / 5.0,
            'risk_taking': safe_int(student_profile.get('risk_taking', 3)) / 5.0,
            'leadership': safe_int(student_profile.get('leadership', 3)) / 5.0
        }
        
        for trait, required_level in traits.items():
            student_level = trait_mapping.get(trait, 0.6)
            personality_scores[trait] = min(1.0, student_level / required_level)
        
        return personality_scores

    def _calculate_academic_feasibility(self, career_info, student_profile):
        """Calculate academic feasibility scores"""
        z_score = safe_float(student_profile.get('z_score', 0))
        threshold = career_info.get('z_score_threshold', 1.5)
        
        z_score_feasibility = min(1.0, z_score / threshold)
        district_adjustment = 0.8  # Simplified district adjustment
        threshold_gap = max(0, threshold - z_score)
        
        return {
            "z_score_feasibility": z_score_feasibility,
            "district_adjustment": district_adjustment,
            "threshold_gap": threshold_gap
        }

    def _calculate_lifestyle_compatibility(self, career_info, student_profile):
        """Calculate lifestyle compatibility scores"""
        stress_level = career_info.get('stress_level', 0.5)
        student_stress_tolerance = safe_int(student_profile.get('stress_tolerance', 3)) / 5.0
        
        stress_match = min(1.0, student_stress_tolerance / stress_level)
        location_match = 0.7  # Simplified
        social_match = 0.6  # Simplified
        travel_match = 0.5  # Simplified
        
        return {
            "stress_match": stress_match,
            "location_match": location_match,
            "social_match": social_match,
            "travel_match": travel_match
        }

    def _calculate_overall_score(self, degree, results, student_profile):
        """Calculate overall score for degree recommendation"""
        degree_prob = results["degree_recommendations"][degree]
        skill_avg = np.mean(list(results["skill_match_scores"].values()))
        personality_avg = np.mean(list(results["personality_match"].values()))
        academic_avg = results["academic_feasibility"]["z_score_feasibility"]
        lifestyle_avg = np.mean(list(results["lifestyle_compatibility"].values()))
        
        # Weighted combination
        overall_score = (
            0.3 * degree_prob +
            0.25 * skill_avg +
            0.2 * personality_avg +
            0.15 * academic_avg +
            0.1 * lifestyle_avg
        )
        
        return overall_score

# Utility functions
def generate_roadmap(degree, dream_job):
    """Generate career roadmap based on degree and dream job"""
    roadmaps = {
        "IT": [
            f"Bachelor of Computer Science (4 years)",
            f"Specialize in AI/ML/Software Engineering",
            f"Consider Master's in Computer Science (2 years)",
            f"Pursue certifications (AWS, Google Cloud)",
            f"Career paths: {dream_job}, Data Scientist, AI Researcher"
        ],
        "Engineering": [
            f"Bachelor of Engineering (4 years)",
            f"Professional qualification (IEEESL)",
            f"Consider Master's in Engineering (2 years)",
            f"Specialization (Structural, Mechanical, etc.)",
            f"Career paths: Civil Engineer, Project Manager, Consultant"
        ],
        "Business": [
            f"Bachelor of Business Administration (4 years)",
            f"Professional qualifications (CIM, ACCA)",
            f"Consider MBA (2 years)",
            f"Specialize in Marketing/Finance/Management",
            f"Career paths: Manager, Entrepreneur, Consultant"
        ],
        "Medicine": [
            f"Bachelor of Medicine (5 years)",
            f"Medical internship (1 year)",
            f"Consider specialization (3-5 years)",
            f"Continuous medical education",
            f"Career paths: Doctor, Specialist, Medical Researcher"
        ],
        "Bio Science": [
            f"Bachelor of Bio Science (4 years)",
            f"Laboratory training",
            f"Consider Master's in Biology (2 years)",
            f"Research specialization",
            f"Career paths: Researcher, Lab Manager, Biotechnologist"
        ],
        "Mathematics": [
            f"Bachelor of Mathematics (4 years)",
            f"Statistical analysis training",
            f"Consider Master's in Mathematics (2 years)",
            f"Specialize in Applied Mathematics",
            f"Career paths: Data Analyst, Mathematician, Academic"
        ],
        "Finance": [
            f"Bachelor of Finance (4 years)",
            f"Financial modeling training",
            f"Consider CFA qualification",
            f"Specialize in Investment Banking",
            f"Career paths: Financial Analyst, Investment Banker, CFO"
        ],
        "Architecture": [
            f"Bachelor of Architecture (5 years)",
            f"Design portfolio development",
            f"Consider Master's in Architecture (2 years)",
            f"Licensure and certification",
            f"Career paths: Architect, Urban Planner, Designer"
        ]
    }
    
    return roadmaps.get(degree, [
        f"Bachelor's degree in {degree} (4 years)",
        f"Professional development",
        f"Consider advanced studies",
        f"Specialization in chosen field",
        f"Career paths: Professional, Specialist, Manager"
    ])

def generate_counterfactual_guidance(student_data, results):
    """Generate counterfactual improvement guidance"""
    guidance = {}
    
    z_score = float(student_data.get('z_score', 0))
    if z_score < 2.0:
        guidance["z_score_improvement"] = f"Improve Z-score from {z_score} to 2.0+ for better opportunities"
    
    # Skill improvement suggestions
    skills = results.get("skill_match_scores", {})
    weak_skills = [skill for skill, score in skills.items() if score < 0.7]
    if weak_skills:
        guidance["skill_improvement"] = f"Focus on improving: {', '.join(weak_skills[:2])}"
    
    return guidance

# Helper function to safely convert values
def safe_int(value, default=3):
    """Safely convert value to int, handling string inputs"""
    try:
        if isinstance(value, str):
            if value.isdigit():
                return int(value)
            else:
                # Handle string values like "Medium", "High", etc.
                return default
        return int(value) if value is not None else default
    except (ValueError, TypeError):
        return default

def safe_float(value, default=1.5):
    """Safely convert value to float"""
    try:
        return float(value) if value is not None else default
    except (ValueError, TypeError):
        return default

# Flask routes
@app.route('/')
def home():
    return jsonify({
        "message": "FutureDream Degree Advisor API",
        "version": "1.0.0",
        "framework": "Flask"
    })

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "model_loaded": True})

@app.route('/recommend', methods=['POST'])
def get_recommendations():
    try:
        student_profile = request.json
        print(f"Received student data: {student_profile}")
        
        # Process personality description if available
        personality_description = student_profile.get('personality_description', '')
        detected_traits = student_profile.get('detected_traits', [])
        
        if personality_description and detected_traits:
            # Extract personality scores from text analysis
            personality_scores = extract_personality_traits_from_text(personality_description, detected_traits)
            
            # Update student profile with enhanced personality data
            student_profile['analytical_skill'] = personality_scores['analytical']
            student_profile['creativity'] = personality_scores['creativity']
            student_profile['leadership'] = personality_scores['leadership']
            student_profile['risk_taking'] = personality_scores['risk_taking']
            
            print(f"Processed personality: {personality_scores}")
        
        # Use trained model for prediction
        prediction_result = model_predictor.predict_degree(student_profile)
        predicted_degree = prediction_result["predicted_degree"]
        confidence = prediction_result["confidence"]
        method_used = prediction_result["method"]
        
        print(f"Model prediction: {predicted_degree} (confidence: {confidence:.3f}, method: {method_used})")
        
        # Generate university recommendations
        university_recommendations = university_recommender.recommend_universities(
            prediction_result['predicted_degree'], 
            float(student_profile.get('z_score', 0)), 
            student_profile.get('district', '')
        )
        
        # Get multiple degree recommendations from model
        if 'recommendations' in prediction_result:
            degree_recommendations = prediction_result['recommendations']
        else:
            # Fallback to single degree if multiple not available
            degree_recommendations = [{
                "degree": predicted_degree,
                "probability": confidence,
                "overall_score": confidence,
                "skill_match": {
                    "analytical": float(student_profile.get('analytical_skill', 3) / 5.0),
                    "creativity": float(student_profile.get('creativity', 3) / 5.0),
                    "risk_taking": float(student_profile.get('risk_taking', 3) / 5.0)
                },
                "personality_match": {
                    "analytical": float(student_profile.get('analytical_skill', 3) / 5.0),
                    "creativity": float(student_profile.get('creativity', 3) / 5.0),
                    "risk_taking": float(student_profile.get('risk_taking', 3) / 5.0),
                    "leadership": float(student_profile.get('leadership', 3) / 5.0)
                },
                "academic_feasibility": {
                    "z_score_feasibility": min(1.0, float(student_profile.get('z_score', 0)) / 2.0),
                    "district_adjustment": 0.8,
                    "threshold_gap": max(0, 2.0 - float(student_profile.get('z_score', 0)))
                },
                "lifestyle_compatibility": {
                    "stress_match": 0.8,
                    "location_match": 0.7,
                    "social_match": 0.6,
                    "travel_match": 0.5
                },
                "explanation": f"Based on your {student_profile.get('stream', '')} stream and {student_profile.get('z_score', 0)} Z-score, {predicted_degree} offers strong alignment with your {student_profile.get('dream_job', '')} career goals.",
                "roadmap": _generate_roadmap(predicted_degree)
            }]
        
        # Combine recommendations with university data
        enhanced_recommendations = []
        for rec in degree_recommendations:
            # Get best university for this degree
            best_uni = None
            best_uni_type = None
            best_uni_location = None
            best_uni_distance = None
            best_admission_prob = 0
            
            # Check government universities
            for uni in university_recommendations.get('government', []):
                if uni.get('admission_probability', 0) > best_admission_prob:
                    best_uni = uni
                    best_uni_type = 'Government'
                    best_uni_location = uni.get('location', 'Unknown')
                    best_uni_distance = uni.get('distance_km')
                    best_admission_prob = uni.get('admission_probability', 0)
            
            # Check private universities
            for uni in university_recommendations.get('private', []):
                if uni.get('admission_probability', 0) > best_admission_prob:
                    best_uni = uni
                    best_uni_type = 'Private'
                    best_uni_location = uni.get('location', 'Unknown')
                    best_uni_distance = uni.get('distance_km')
                    best_admission_prob = uni.get('admission_probability', 0)
            
            enhanced_rec = rec.copy()
            if best_uni:
                enhanced_rec.update({
                    'university': best_uni.get('name', 'Unknown University'),
                    'universityLocation': best_uni_location,
                    'universityType': best_uni_type,
                    'admissionProbability': f"{best_admission_prob * 100:.0f}%",
                    'distance_km': best_uni_distance
                })
            else:
                # Get default university based on degree
                default_universities = {
                    "Medicine": "University of Colombo",
                    "Bio Science": "University of Peradeniya", 
                    "Engineering": "University of Moratuwa",
                    "IT": "University of Colombo",
                    "Computer Science": "University of Colombo",
                    "Physical Science": "University of Peradeniya",
                    "Mathematics": "University of Colombo",
                    "Statistics": "University of Colombo",
                    "Business": "University of Sri Jayewardenepura",
                    "Accounting": "University of Sri Jayewardenepura",
                    "Finance": "University of Sri Jayewardenepura",
                    "Management": "University of Sri Jayewardenepura",
                    "Arts": "University of Peradeniya",
                    "Literature": "University of Peradeniya",
                    "Social Sciences": "University of Colombo",
                    "Education": "University of Colombo",
                    "Agriculture": "University of Peradeniya",
                    "Engineering Technology": "University of Moratuwa",
                    "Information Technology": "SLIIT"
                }
                
                default_uni_name = default_universities.get(rec.get('degree', 'IT'), "University of Colombo")
                default_uni_type = "Government" if "University of" in default_uni_name else "Private"
                
                enhanced_rec.update({
                    'university': default_uni_name,
                    'universityLocation': 'Colombo',
                    'universityType': default_uni_type,
                    'admissionProbability': '75%',
                    'distance_km': 0.0
                })
            
            enhanced_recommendations.append(enhanced_rec)
        
        return jsonify({
            "method": method_used,
            "recommendations": enhanced_recommendations,
            "university_recommendations": university_recommendations,
            "best_degree": predicted_degree,
            "counterfactual_guidance": {
                "skill_improvement": f"Focus on improving key skills for {student_profile.get('dream_job', '')}",
                "z_score_improvement": f"Improve Z-score from {student_profile.get('z_score', 0)} to 2.0+ for better opportunities"
            }
        }), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"Error processing recommendation: {str(e)}"}), 500

def _generate_roadmap(degree):
    """Generate career roadmap based on degree"""
    roadmaps = {
            "IT": ["Bachelor of Computer Science (4 years)", "Specialize in AI/ML/Software Engineering", "Consider Master's in Computer Science (2 years)", "Career paths: Software Engineer, Data Scientist, AI Researcher"],
            "Engineering": ["Bachelor of Engineering (4 years)", "Choose specialization (Civil/Mechanical/Electrical)", "Professional certification (P.Eng)", "Career paths: Engineer, Project Manager, Consultant"],
            "Medicine": ["MBBS (5 years)", "Internship (1 year)", "Specialization training (3-5 years)", "Career paths: Doctor, Specialist, Medical Researcher"],
            "Business": ["Bachelor of Business Administration (4 years)", "MBA or specialized Master's (2 years)", "Professional certification", "Career paths: Business Manager, Entrepreneur, Consultant"],
            "Bio Science": ["Bachelor of Science in Bio Science (4 years)", "Research specialization", "Master's/PhD program", "Career paths: Researcher, Lab Technician, Academic"],
            "Mathematics": ["Bachelor of Mathematics (4 years)", "Applied specialization", "Advanced degree", "Career paths: Mathematician, Data Analyst, Academic"],
            "Arts": ["Bachelor of Arts (4 years)", "Specialization in chosen field", "Professional development", "Career paths: Teacher, Writer, Public Service"]
        }
    return roadmaps.get(degree, ["General degree pathway (4 years)", "Specialization", "Professional development", "Career advancement"])

@app.route('/predict-simple', methods=['POST'])
def simple_prediction():
    """Simple prediction endpoint for testing"""
    try:
        data = request.get_json()
        dream_job = data.get('dream_job', 'Software Engineer')
        z_score = float(data.get('z_score', 1.5))
        stream = data.get('stream', 'Physical Science')
        
        # Simple rule-based prediction
        if dream_job == 'Software Engineer' and z_score >= 1.5:
            degree = 'IT'
            confidence = 0.85
        elif dream_job == 'Doctor' and z_score >= 2.0:
            degree = 'Medicine'
            confidence = 0.90
        elif dream_job == 'Data Scientist' and z_score >= 1.4:
            degree = 'IT'
            confidence = 0.80
        else:
            degree = 'Business'
            confidence = 0.60
        
        return jsonify({
            "dream_job": dream_job,
            "z_score": z_score,
            "stream": stream,
            "method": "simple_rule_based"
        })
        
    except Exception as e:
        return jsonify({"error": f"Error in prediction: {str(e)}"}), 500

if __name__ == "__main__":
    print("🚀 Starting FutureDream Flask Server...")
    print("📊 AI Model: Trained Random Forest + Backward-Chaining")
    print("🌐 Server: http://localhost:8005")
    print("🔗 Health Check: http://localhost:8005/health")
    print("📝 Recommendations: http://localhost:8005/recommend")
    
    app.run(host='0.0.0.0', port=8005, debug=True)
