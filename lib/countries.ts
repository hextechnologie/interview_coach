// Country and city data for location selection
// Countries are organized by region with their major cities

export interface Country {
  value: string
  label: string
  flag: string
  cities: string[]
}

export const COUNTRIES: Country[] = [
  // Europe
  {
    value: 'france',
    label: 'France',
    flag: '🇫🇷',
    cities: [
      'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
      'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre',
      'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne'
    ]
  },
  {
    value: 'germany',
    label: 'Germany',
    flag: '🇩🇪',
    cities: [
      'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart',
      'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden',
      'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bonn'
    ]
  },
  {
    value: 'uk',
    label: 'United Kingdom',
    flag: '🇬🇧',
    cities: [
      'London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow', 'Liverpool',
      'Edinburgh', 'Bristol', 'Sheffield', 'Cardiff', 'Belfast', 'Newcastle',
      'Nottingham', 'Southampton', 'Leicester', 'Brighton', 'Cambridge', 'Oxford'
    ]
  },
  {
    value: 'spain',
    label: 'Spain',
    flag: '🇪🇸',
    cities: [
      'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga',
      'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba',
      'Valladolid', 'Vigo', 'Gijón', 'Granada', 'San Sebastián'
    ]
  },
  {
    value: 'italy',
    label: 'Italy',
    flag: '🇮🇹',
    cities: [
      'Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna',
      'Florence', 'Bari', 'Catania', 'Venice', 'Verona', 'Messina', 'Padua',
      'Trieste', 'Brescia', 'Prato', 'Taranto', 'Modena', 'Reggio Calabria'
    ]
  },
  {
    value: 'netherlands',
    label: 'Netherlands',
    flag: '🇳🇱',
    cities: [
      'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg',
      'Groningen', 'Almere', 'Breda', 'Nijmegen', 'Enschede', 'Haarlem',
      'Arnhem', 'Zaanstad', 'Amersfoort', 'Apeldoorn', 'Leiden'
    ]
  },
  {
    value: 'belgium',
    label: 'Belgium',
    flag: '🇧🇪',
    cities: [
      'Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges',
      'Namur', 'Leuven', 'Mons', 'Aalst', 'Mechelen', 'La Louvière'
    ]
  },
  {
    value: 'switzerland',
    label: 'Switzerland',
    flag: '🇨🇭',
    cities: [
      'Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern', 'Winterthur',
      'Lucerne', 'St. Gallen', 'Lugano', 'Biel/Bienne', 'Thun', 'Köniz'
    ]
  },
  {
    value: 'portugal',
    label: 'Portugal',
    flag: '🇵🇹',
    cities: [
      'Lisbon', 'Porto', 'Braga', 'Funchal', 'Coimbra', 'Setúbal',
      'Almada', 'Aveiro', 'Viseu', 'Guimarães', 'Faro', 'Évora'
    ]
  },
  {
    value: 'sweden',
    label: 'Sweden',
    flag: '🇸🇪',
    cities: [
      'Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro',
      'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping', 'Lund', 'Umeå'
    ]
  },
  {
    value: 'poland',
    label: 'Poland',
    flag: '🇵🇱',
    cities: [
      'Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk',
      'Szczecin', 'Bydgoszcz', 'Lublin', 'Katowice', 'Białystok', 'Gdynia'
    ]
  },
  
  // North America
  {
    value: 'usa',
    label: 'United States',
    flag: '🇺🇸',
    cities: [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
      'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
      'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis',
      'Seattle', 'Denver', 'Washington DC', 'Boston', 'Nashville', 'Detroit',
      'Portland', 'Las Vegas', 'Miami', 'Atlanta', 'Raleigh', 'Minneapolis'
    ]
  },
  {
    value: 'canada',
    label: 'Canada',
    flag: '🇨🇦',
    cities: [
      'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa',
      'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria',
      'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'Regina', 'St. John\'s'
    ]
  },
  {
    value: 'mexico',
    label: 'Mexico',
    flag: '🇲🇽',
    cities: [
      'Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León',
      'Juárez', 'Zapopan', 'Mérida', 'San Luis Potosí', 'Aguascalientes',
      'Querétaro', 'Cancún', 'Hermosillo', 'Saltillo', 'Culiacán'
    ]
  },

  // Africa & Middle East
  {
    value: 'algeria',
    label: 'Algeria',
    flag: '🇩🇿',
    cities: [
      'Algiers', 'Oran', 'Constantine', 'Batna', 'Djelfa', 'Sétif',
      'Annaba', 'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'El Oued', 'Skikda',
      'Tiaret', 'Béjaïa', 'Tlemcen', 'Béchar', 'Mostaganem', 'Bordj Bou Arréridj'
    ]
  },
  {
    value: 'morocco',
    label: 'Morocco',
    flag: '🇲🇦',
    cities: [
      'Casablanca', 'Fès', 'Tangier', 'Marrakech', 'Salé', 'Meknes',
      'Rabat', 'Oujda', 'Kenitra', 'Agadir', 'Tétouan', 'Safi'
    ]
  },
  {
    value: 'tunisia',
    label: 'Tunisia',
    flag: '🇹🇳',
    cities: [
      'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès',
      'Ariana', 'La Marsa', 'Monastir', 'Nabeul', 'Hammamet'
    ]
  },
  {
    value: 'egypt',
    label: 'Egypt',
    flag: '🇪🇬',
    cities: [
      'Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said',
      'Suez', 'Luxor', 'Mansoura', 'Tanta', 'Asyut', 'Ismailia', 'Faiyum'
    ]
  },
  {
    value: 'south-africa',
    label: 'South Africa',
    flag: '🇿🇦',
    cities: [
      'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
      'Bloemfontein', 'East London', 'Polokwane', 'Pietermaritzburg', 'Nelspruit'
    ]
  },
  {
    value: 'uae',
    label: 'United Arab Emirates',
    flag: '🇦🇪',
    cities: [
      'Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah',
      'Fujairah', 'Umm Al Quwain', 'Khor Fakkan', 'Dibba Al-Fujairah'
    ]
  },
  {
    value: 'saudi-arabia',
    label: 'Saudi Arabia',
    flag: '🇸🇦',
    cities: [
      'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar',
      'Tabuk', 'Buraidah', 'Khamis Mushait', 'Najran', 'Abha', 'Taif'
    ]
  },

  // Asia & Oceania
  {
    value: 'india',
    label: 'India',
    flag: '🇮🇳',
    cities: [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
      'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur',
      'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna'
    ]
  },
  {
    value: 'china',
    label: 'China',
    flag: '🇨🇳',
    cities: [
      'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou',
      'Wuhan', 'Xi\'an', 'Chongqing', 'Tianjin', 'Nanjing', 'Suzhou',
      'Dongguan', 'Shenyang', 'Qingdao', 'Dalian', 'Zhengzhou', 'Changsha'
    ]
  },
  {
    value: 'japan',
    label: 'Japan',
    flag: '🇯🇵',
    cities: [
      'Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka',
      'Kobe', 'Kyoto', 'Kawasaki', 'Saitama', 'Hiroshima', 'Sendai'
    ]
  },
  {
    value: 'singapore',
    label: 'Singapore',
    flag: '🇸🇬',
    cities: [
      'Singapore City', 'Jurong', 'Woodlands', 'Tampines', 'Bedok',
      'Hougang', 'Choa Chu Kang', 'Yishun', 'Bukit Batok', 'Punggol'
    ]
  },
  {
    value: 'australia',
    label: 'Australia',
    flag: '🇦🇺',
    cities: [
      'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast',
      'Canberra', 'Newcastle', 'Wollongong', 'Hobart', 'Geelong', 'Townsville'
    ]
  },
  {
    value: 'new-zealand',
    label: 'New Zealand',
    flag: '🇳🇿',
    cities: [
      'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga',
      'Dunedin', 'Palmerston North', 'Napier', 'Porirua', 'Rotorua'
    ]
  },

  // South America
  {
    value: 'brazil',
    label: 'Brazil',
    flag: '🇧🇷',
    cities: [
      'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza',
      'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
      'Belém', 'Goiânia', 'Guarulhos', 'Campinas', 'São Luís'
    ]
  },
  {
    value: 'argentina',
    label: 'Argentina',
    flag: '🇦🇷',
    cities: [
      'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata',
      'San Miguel de Tucumán', 'Mar del Plata', 'Salta', 'Santa Fe',
      'San Juan', 'Resistencia', 'Neuquén', 'Posadas', 'Bahía Blanca'
    ]
  },
  {
    value: 'colombia',
    label: 'Colombia',
    flag: '🇨🇴',
    cities: [
      'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta',
      'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Pasto', 'Manizales'
    ]
  },
  {
    value: 'chile',
    label: 'Chile',
    flag: '🇨🇱',
    cities: [
      'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta',
      'Temuco', 'Rancagua', 'Talca', 'Arica', 'Puerto Montt', 'Iquique'
    ]
  },
]

// Helper function to get cities for a country
export function getCitiesForCountry(countryValue: string): string[] {
  const country = COUNTRIES.find(c => c.value === countryValue)
  return country?.cities || []
}

// Helper function to get country options for Select component
export function getCountryOptions() {
  return COUNTRIES.map(c => ({
    value: c.value,
    label: `${c.flag} ${c.label}`
  }))
}

// Helper function to get city options for Select component
export function getCityOptions(countryValue: string) {
  const cities = getCitiesForCountry(countryValue)
  return cities.map(city => ({
    value: city,
    label: city
  }))
}
