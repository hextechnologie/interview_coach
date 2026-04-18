// Universities organized by country for smart autocomplete
// Data compiled from major universities worldwide

export const universitiesByCountry: Record<string, string[]> = {
  "Algeria": [
    "USTHB - Université des Sciences et de la Technologie Houari Boumediene",
    "ESI - École nationale Supérieure d'Informatique",
    "ENP - École Nationale Polytechnique",
    "Université d'Alger 1 - Benyoucef Benkhedda",
    "Université d'Oran 1 Ahmed Ben Bella",
    "Université Abderrahmane Mira de Béjaïa",
    "Université Ferhat Abbas Sétif",
    "Université Constantine 1",
    "Université Badji Mokhtar Annaba",
    "USTHB Alger",
  ],
  "France": [
    "Université Paris-Sorbonne",
    "École Polytechnique",
    "HEC Paris",
    "CentraleSupélec",
    "INSA Lyon",
    "Université Pierre et Marie Curie (UPMC)",
    "Sciences Po Paris",
    "École Normale Supérieure (ENS)",
    "Université Paris-Saclay",
    "Grenoble INP",
    "Télécom Paris",
    "ESSEC Business School",
    "ESCP Business School",
    "École des Ponts ParisTech",
  ],
  "Morocco": [
    "Université Mohammed V de Rabat",
    "École Mohammadia d'Ingénieurs (EMI)",
    "Al Akhawayn University",
    "ENCG Casablanca",
    "INSEA Rabat",
    "Université Hassan II Casablanca",
    "Université Cadi Ayyad Marrakech",
    "ENSA École Nationale des Sciences Appliquées",
  ],
  "Tunisia": [
    "Université de Tunis",
    "École Polytechnique de Tunisie",
    "ESPRIT - École Supérieure Privée d'Ingénierie et de Technologies",
    "Université de Carthage",
    "ISG Institut Supérieur de Gestion",
    "INSAT Institut National des Sciences Appliquées et de Technologie",
  ],
  "Egypt": [
    "Cairo University",
    "American University in Cairo (AUC)",
    "Ain Shams University",
    "Alexandria University",
    "The German University in Cairo (GUC)",
    "Nile University",
    "Helwan University",
  ],
  "Saudi Arabia": [
    "King Abdullah University of Science and Technology (KAUST)",
    "King Saud University",
    "King Fahd University of Petroleum and Minerals (KFUPM)",
    "King Abdulaziz University",
    "Princess Nourah bint Abdulrahman University",
    "Imam Muhammad ibn Saud Islamic University",
  ],
  "United Arab Emirates": [
    "Khalifa University",
    "American University of Sharjah",
    "United Arab Emirates University",
    "American University in Dubai",
    "Zayed University",
    "University of Dubai",
  ],
  "United States": [
    "Massachusetts Institute of Technology (MIT)",
    "Stanford University",
    "Harvard University",
    "Carnegie Mellon University",
    "UC Berkeley",
    "Princeton University",
    "Yale University",
    "Columbia University",
    "University of Pennsylvania",
    "Cornell University",
    "Duke University",
    "Northwestern University",
    "University of Michigan",
    "Georgia Institute of Technology",
    "University of Illinois Urbana-Champaign",
    "UT Austin",
    "UCLA",
    "UC San Diego",
  ],
  "United Kingdom": [
    "University of Oxford",
    "University of Cambridge",
    "Imperial College London",
    "UCL (University College London)",
    "London School of Economics (LSE)",
    "University of Edinburgh",
    "King's College London",
    "University of Manchester",
    "University of Warwick",
    "University of Bristol",
  ],
  "Canada": [
    "University of Toronto",
    "McGill University",
    "University of British Columbia (UBC)",
    "University of Waterloo",
    "University of Alberta",
    "McMaster University",
    "Université de Montréal",
    "Queen's University",
  ],
  "Germany": [
    "Technical University of Munich (TUM)",
    "Ludwig Maximilian University of Munich",
    "Heidelberg University",
    "Humboldt University of Berlin",
    "RWTH Aachen University",
    "Free University of Berlin",
    "Karlsruhe Institute of Technology (KIT)",
  ],
  "Spain": [
    "IE University",
    "ESADE Business School",
    "Universitat Autònoma de Barcelona",
    "Complutense University of Madrid",
    "University of Barcelona",
    "Universitat Politècnica de Catalunya",
  ],
  "India": [
    "Indian Institute of Technology (IIT) Bombay",
    "Indian Institute of Technology (IIT) Delhi",
    "Indian Institute of Science (IISc) Bangalore",
    "IIT Madras",
    "IIT Kanpur",
    "IIT Kharagpur",
    "Delhi University",
    "University of Mumbai",
  ],
  "China": [
    "Tsinghua University",
    "Peking University",
    "Fudan University",
    "Shanghai Jiao Tong University",
    "Zhejiang University",
    "University of Science and Technology of China",
  ],
  "Australia": [
    "University of Melbourne",
    "Australian National University (ANU)",
    "University of Sydney",
    "University of Queensland",
    "Monash University",
    "UNSW Sydney",
  ],
  "Singapore": [
    "National University of Singapore (NUS)",
    "Nanyang Technological University (NTU)",
    "Singapore Management University (SMU)",
  ],
}

// Get all universities as flat array for general search
export const allUniversities = Object.values(universitiesByCountry).flat()

// Search universities with fuzzy matching
export function searchUniversities(query: string, userCountry?: string): string[] {
  if (!query || query.length < 2) return []
  
  const lowerQuery = query.toLowerCase()
  const results: string[] = []
  
  // Prioritize universities from user's country
  if (userCountry && universitiesByCountry[userCountry]) {
    const countryMatches = universitiesByCountry[userCountry].filter(uni =>
      uni.toLowerCase().includes(lowerQuery)
    )
    results.push(...countryMatches)
  }
  
  // Then add matches from other countries
  for (const [country, universities] of Object.entries(universitiesByCountry)) {
    if (country === userCountry) continue // Skip already added
    const matches = universities.filter(uni =>
      uni.toLowerCase().includes(lowerQuery)
    )
    results.push(...matches)
  }
  
  return results.slice(0, 10) // Limit to 10 results
}

// Common certifications
export const commonCertifications = [
  "AWS Certified Solutions Architect",
  "AWS Certified Developer",
  "Google Cloud Professional",
  "Azure Solutions Architect",
  "PMP - Project Management Professional",
  "CISSP - Certified Information Systems Security Professional",
  "Certified Scrum Master (CSM)",
  "CFA - Chartered Financial Analyst",
  "CPA - Certified Public Accountant",
  "IELTS",
  "TOEFL",
  "CompTIA Security+",
  "ITIL Foundation",
  "Six Sigma Green Belt",
  "Salesforce Certified Administrator",
]

// Common online learning platforms
export const onlinePlatforms = [
  "Coursera",
  "Udemy",
  "edX",
  "Le Wagon",
  "Simplon",
  "OpenClassrooms",
  "Udacity",
  "Pluralsight",
  "LinkedIn Learning",
  "freeCodeCamp",
  "Codecademy",
  "DataCamp",
  "YouTube",
  "Other",
]
