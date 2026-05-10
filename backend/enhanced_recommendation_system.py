# Enhanced Recommendation System with Location Data
import math

def recommend_degree_and_university_with_location(student_profile):
    """Enhanced recommendation function with location-based university sorting"""
    z_score = student_profile.get('z_score', 0)
    stream = student_profile.get('stream', '')
    district = student_profile.get('district', '')
    dream_job = student_profile.get('dream_job', '')
    
    # Step 1: Determine eligible degrees based on Z-score and stream
    eligible_degrees = []
    
    if stream == "Bio Science":
        if z_score >= 2.0:
            eligible_degrees.append(("Medicine", 0.9))
        if z_score >= 1.7:
            eligible_degrees.append(("Bio Science", 0.8))
            
    elif stream == "Physical Science":
        if z_score >= 1.8:
            eligible_degrees.append(("Engineering", 0.85))
        if z_score >= 1.5:
            eligible_degrees.append(("Mathematics", 0.8))
        if z_score >= 1.4:
            eligible_degrees.append(("IT", 0.75))
            
    elif stream == "Commerce":
        if z_score >= 1.2:
            eligible_degrees.append(("Business", 0.9))
        if z_score >= 1.4:
            eligible_degrees.append(("IT", 0.6))
            
    elif stream == "Mathematics":
        if z_score >= 1.5:
            eligible_degrees.append(("Mathematics", 0.85))
        if z_score >= 1.4:
            eligible_degrees.append(("IT", 0.8))
            
    elif stream == "Arts":
        if z_score >= 1.0:
            eligible_degrees.append(("Arts", 0.9))
        if z_score >= 1.2:
            eligible_degrees.append(("Business", 0.6))
    
    # Step 2: Adjust scores based on dream job compatibility
    job_degree_compatibility = {
        "Doctor": {"Medicine": 1.0, "Bio Science": 0.7},
        "Software Engineer": {"IT": 1.0, "Engineering": 0.8, "Mathematics": 0.7},
        "Data Scientist": {"IT": 0.9, "Mathematics": 0.9, "Bio Science": 0.6},
        "Entrepreneur": {"Business": 1.0, "IT": 0.7},
        "Accountant": {"Business": 1.0, "Mathematics": 0.7},
        "Civil Engineer": {"Engineering": 1.0, "Mathematics": 0.8},
        "Teacher": {"Arts": 0.9, "Bio Science": 0.7, "Mathematics": 0.8}
    }
    
    if dream_job in job_degree_compatibility:
        for i, (degree, score) in enumerate(eligible_degrees):
            compatibility = job_degree_compatibility[dream_job].get(degree, 0.5)
            eligible_degrees[i] = (degree, score * compatibility)
    
    # Sort by score
    eligible_degrees.sort(key=lambda x: x[1], reverse=True)
    
    # Step 3: Generate university recommendations for top degrees with location data
    recommendations = []
    
    # Sri Lankan university coordinates
    UNIVERSITY_CUTOFFS = {
        "Medicine": {
            "min_z": 2.0,
            "universities": {
                "University of Colombo": {"cutoff": 2.28, "coordinates": {"lat": 6.9271, "lon": 79.8612}},
                "University of Peradeniya": {"cutoff": 2.24, "coordinates": {"lat": 7.2906, "lon": 80.6337}},
                "University of Kelaniya": {"cutoff": 2.15, "coordinates": {"lat": 6.9271, "lon": 79.8612}}
            }
        },
        "Engineering": {
            "min_z": 1.8,
            "universities": {
                "University of Moratuwa": {"cutoff": 1.99, "coordinates": {"lat": 6.7959, "lon": 79.9008}},
                "University of Peradeniya": {"cutoff": 1.85, "coordinates": {"lat": 7.2906, "lon": 80.6337}},
                "University of Colombo": {"cutoff": 1.85, "coordinates": {"lat": 6.9271, "lon": 79.8612}}
            }
        },
        "IT": {
            "min_z": 1.4,
            "universities": {
                "University of Colombo": {"cutoff": 1.65, "coordinates": {"lat": 6.9271, "lon": 79.8612}},
                "University of Moratuwa": {"cutoff": 1.55, "coordinates": {"lat": 6.7959, "lon": 79.9008}},
                "University of Sri Jayewardenepura": {"cutoff": 1.5, "coordinates": {"lat": 6.8919, "lon": 79.8649}}
            }
        },
        "Business": {
            "min_z": 1.2,
            "universities": {
                "University of Colombo": {"cutoff": 1.50, "coordinates": {"lat": 6.9271, "lon": 79.8612}},
                "University of Sri Jayewardenepura": {"cutoff": 1.6, "coordinates": {"lat": 6.8919, "lon": 79.8649}}
            }
        }
    }
    
    # District coordinates
    DISTRICT_COORDINATES = {
        "Colombo": {"lat": 6.9271, "lon": 79.8612},
        "Gampaha": {"lat": 7.0854, "lon": 79.9945},
        "Kandy": {"lat": 7.2906, "lon": 80.6337},
        "Galle": {"lat": 6.0536, "lon": 80.2200},
        "Jaffna": {"lat": 9.6615, "lon": 80.0107},
        "Matara": {"lat": 5.9549, "lon": 80.5550},
        "Batticaloa": {"lat": 7.7102, "lon": 81.6988},
        "Trincomalee": {"lat": 8.5644, "lon": 81.2337},
        "Kurunegala": {"lat": 7.4823, "lon": 80.3627},
        "Anuradhapura": {"lat": 8.3114, "lon": 80.4128},
        "Badulla": {"lat": 6.9919, "lon": 81.0553},
        "Monaragala": {"lat": 7.3539, "lon": 80.4638},
        "Polonnaruwa": {"lat": 7.9333, "lon": 81.0044},
        "Ratnapura": {"lat": 6.7056, "lon": 80.7700},
        "Kegalle": {"lat": 7.2535, "lon": 80.5987},
        "Mannar": {"lat": 8.9775, "lon": 79.9043},
        "Vavuniya": {"lat": 8.7564, "lon": 80.4968},
        "Matale": {"lat": 7.4668, "lon": 80.6224},
        "Nuwara Eliya": {"lat": 6.9128, "lon": 80.2237},
        "Kilinochchi": {"lat": 7.4810, "lon": 80.2345},
        "Hambantota": {"lat": 6.1244, "lon": 81.0553},
        "Puttalam": {"lat": 7.9036, "lon": 81.7779},
        "Ampara": {"lat": 7.3242, "lon": 81.8420}
    }
    
    def calculate_distance(coords1, coords2):
        """Calculate distance between two coordinates in km"""
        lat1, lon1 = math.radians(coords1["lat"]), math.radians(coords1["lon"])
        lat2, lon2 = math.radians(coords2["lat"]), math.radians(coords2["lon"])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a)) * math.cos(lat1) * math.cos(lat2)
        
        return 6371 * c  # Earth's radius in km
    
    for degree, score in eligible_degrees[:3]:  # Top 3 degrees
        if degree in UNIVERSITY_CUTOFFS:
            degree_info = UNIVERSITY_CUTOFFS[degree]
            universities = []
            
            for uni_name, uni_data in degree_info["universities"].items():
                admission_prob = 0.0
                
                if z_score >= uni_data["cutoff"]:
                    admission_prob = min(0.95, 0.5 + (z_score - uni_data["cutoff"]) * 2)
                elif z_score >= uni_data["cutoff"] - 0.2:
                    admission_prob = 0.3
                else:
                    admission_prob = 0.1
                
                # District bonus
                district_bonus = 1.0
                if district in ["Colombo", "Gampaha"] and "Colombo" in uni_name:
                    district_bonus = 1.1
                elif district == "Kandy" and "Peradeniya" in uni_name:
                    district_bonus = 1.1
                elif district == "Jaffna" and "Jaffna" in uni_name:
                    district_bonus = 1.15
                elif district == "Ruhuna" and "Ruhuna" in uni_name:
                    district_bonus = 1.15
                
                admission_prob = min(0.95, admission_prob * district_bonus)
                
                # Calculate distance
                student_coords = DISTRICT_COORDINATES.get(district, DISTRICT_COORDINATES["Colombo"])
                distance = calculate_distance(student_coords, uni_data["coordinates"])
                
                universities.append({
                    "name": uni_name,
                    "admission_probability": admission_prob,
                    "cutoff_z": uni_data["cutoff"],
                    "z_score_gap": max(0, uni_data["cutoff"] - z_score),
                    "distance_km": round(distance, 2),
                    "coordinates": uni_data["coordinates"],
                    "location": uni_name.split()[-1]  # Extract location from name
                })
            
            # Sort universities by admission probability first, then by distance
            universities.sort(key=lambda x: (x["admission_probability"], -x["distance_km"]), reverse=True)
            
            recommendations.append({
                "degree": degree,
                "confidence": score,
                "universities": universities[:3],  # Top 3 universities
                "eligible": z_score >= degree_info["min_z"]
            })
    
    return recommendations

# Test the enhanced system
if __name__ == "__main__":
    test_student = {
        'z_score': 1.6,
        'stream': 'Physical Science',
        'district': 'Jaffna',
        'dream_job': 'Software Engineer'
    }
    
    print("🧪 Testing enhanced recommendation system:")
    print(f"📚 Stream: {test_student['stream']}")
    print(f"🎓 Z-Score: {test_student['z_score']}")
    print(f"📍 District: {test_student['district']}")
    print(f"💼 Dream Job: {test_student['dream_job']}")
    
    recommendations = recommend_degree_and_university_with_location(test_student)
    
    print(f"\n🎯 Top Recommendations:")
    for i, rec in enumerate(recommendations):
        print(f"\n{i+1}. Degree: {rec['degree']} (Confidence: {rec['confidence']:.2f})")
        print(f"   Eligible: {rec['eligible']}")
        print(f"   📍 Universities:")
        
        for j, uni in enumerate(rec['universities'][:2]):  # Show top 2
            print(f"      {j+1}. {uni['name']}")
            print(f"         📍 Distance: {uni['distance_km']} km")
            print(f"         📊 Admission: {uni['admission_probability']:.1%}")
            print(f"         📈 Z-Score Gap: {uni['z_score_gap']}")
