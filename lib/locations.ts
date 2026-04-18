// Comprehensive location data with Country → Region/State → City hierarchy
// Organized alphabetically by country with letter classification

export interface City {
  name: string
}

export interface Region {
  name: string
  cities: string[]
}

export interface Country {
  value: string
  label: string
  letter: string
  regions: Region[]
}

export const COUNTRIES: Country[] = [
  // A
  {
    value: 'algeria',
    label: 'Algeria',
    letter: 'A',
    regions: [
      { name: 'Algiers', cities: ['Algiers', 'Bab El Oued', 'Birtouta', 'Dar El Beïda', 'Draria'] },
      { name: 'Oran', cities: ['Oran', 'Bir El Djir', 'Es Senia', 'Arzew', 'Bethioua'] },
      { name: 'Constantine', cities: ['Constantine', 'El Khroub', 'Hamma Bouziane', 'Didouche Mourad'] },
      { name: 'Batna', cities: ['Batna', 'Arris', 'Barika', 'Merouana', 'Tazoult'] },
      { name: 'Sétif', cities: ['Sétif', 'El Eulma', 'Béni Ourtilane', 'Ain Arnat'] },
      { name: 'Annaba', cities: ['Annaba', 'El Hadjar', 'Berrahal', 'Seraïdi'] },
    ]
  },
  {
    value: 'argentina',
    label: 'Argentina',
    letter: 'A',
    regions: [
      { name: 'Buenos Aires', cities: ['Buenos Aires', 'La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil'] },
      { name: 'Córdoba', cities: ['Córdoba', 'Villa María', 'Río Cuarto', 'Carlos Paz', 'Alta Gracia'] },
      { name: 'Santa Fe', cities: ['Rosario', 'Santa Fe', 'Rafaela', 'Reconquista', 'Venado Tuerto'] },
      { name: 'Mendoza', cities: ['Mendoza', 'San Rafael', 'Godoy Cruz', 'Luján de Cuyo', 'Maipú'] },
      { name: 'Tucumán', cities: ['San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo', 'Concepción'] },
    ]
  },
  {
    value: 'australia',
    label: 'Australia',
    letter: 'A',
    regions: [
      { name: 'New South Wales', cities: ['Sydney', 'Newcastle', 'Wollongong', 'Canberra', 'Wagga Wagga'] },
      { name: 'Victoria', cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton'] },
      { name: 'Queensland', cities: ['Brisbane', 'Gold Coast', 'Townsville', 'Cairns', 'Toowoomba'] },
      { name: 'Western Australia', cities: ['Perth', 'Mandurah', 'Bunbury', 'Kalgoorlie', 'Geraldton'] },
      { name: 'South Australia', cities: ['Adelaide', 'Mount Gambier', 'Whyalla', 'Murray Bridge'] },
    ]
  },

  // B
  {
    value: 'belgium',
    label: 'Belgium',
    letter: 'B',
    regions: [
      { name: 'Brussels', cities: ['Brussels', 'Schaerbeek', 'Anderlecht', 'Ixelles', 'Etterbeek'] },
      { name: 'Flemish Brabant', cities: ['Leuven', 'Vilvoorde', 'Halle', 'Asse', 'Diest'] },
      { name: 'Antwerp', cities: ['Antwerp', 'Mechelen', 'Turnhout', 'Heist-op-den-Berg', 'Mol'] },
      { name: 'East Flanders', cities: ['Ghent', 'Aalst', 'Sint-Niklaas', 'Dendermonde', 'Eeklo'] },
      { name: 'Liège', cities: ['Liège', 'Seraing', 'Verviers', 'Herstal', 'Spa'] },
    ]
  },
  {
    value: 'brazil',
    label: 'Brazil',
    letter: 'B',
    regions: [
      { name: 'São Paulo', cities: ['São Paulo', 'Campinas', 'Guarulhos', 'Santos', 'São Bernardo', 'Ribeirão Preto'] },
      { name: 'Rio de Janeiro', cities: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu', 'Petrópolis'] },
      { name: 'Minas Gerais', cities: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Montes Claros'] },
      { name: 'Bahia', cities: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna'] },
      { name: 'Paraná', cities: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'] },
    ]
  },

  // C
  {
    value: 'canada',
    label: 'Canada',
    letter: 'C',
    regions: [
      { name: 'Ontario', cities: ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London', 'Kitchener', 'Windsor'] },
      { name: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke'] },
      { name: 'British Columbia', cities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond', 'Kelowna'] },
      { name: 'Alberta', cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat'] },
      { name: 'Manitoba', cities: ['Winnipeg', 'Brandon', 'Steinbach', 'Portage la Prairie'] },
    ]
  },
  {
    value: 'china',
    label: 'China',
    letter: 'C',
    regions: [
      { name: 'Beijing', cities: ['Beijing', 'Haidian', 'Chaoyang', 'Dongcheng', 'Xicheng'] },
      { name: 'Shanghai', cities: ['Shanghai', 'Pudong', 'Minhang', 'Baoshan', 'Jiading'] },
      { name: 'Guangdong', cities: ['Guangzhou', 'Shenzhen', 'Dongguan', 'Foshan', 'Zhongshan', 'Zhuhai'] },
      { name: 'Zhejiang', cities: ['Hangzhou', 'Ningbo', 'Wenzhou', 'Jinhua', 'Shaoxing'] },
      { name: 'Jiangsu', cities: ['Nanjing', 'Suzhou', 'Wuxi', 'Changzhou', 'Nantong'] },
    ]
  },
  {
    value: 'colombia',
    label: 'Colombia',
    letter: 'C',
    regions: [
      { name: 'Bogotá', cities: ['Bogotá', 'Soacha', 'Chía', 'Zipaquirá', 'Facatativá'] },
      { name: 'Antioquia', cities: ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Rionegro'] },
      { name: 'Valle del Cauca', cities: ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago'] },
      { name: 'Atlántico', cities: ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga'] },
      { name: 'Santander', cities: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta'] },
    ]
  },

  // E
  {
    value: 'egypt',
    label: 'Egypt',
    letter: 'E',
    regions: [
      { name: 'Cairo', cities: ['Cairo', 'Giza', 'Qalyub', '6th of October City', 'Helwan'] },
      { name: 'Alexandria', cities: ['Alexandria', 'Borg El Arab', 'Abu Qir', 'Montaza'] },
      { name: 'Giza', cities: ['Giza', '6th of October', 'Sheikh Zayed', 'Dokki', 'Agouza'] },
      { name: 'Qalyubia', cities: ['Banha', 'Qalyub', 'Shubra El Kheima', 'Khanka'] },
    ]
  },

  // F
  {
    value: 'france',
    label: 'France',
    letter: 'F',
    regions: [
      { name: 'Île-de-France', cities: ['Paris', 'Versailles', 'Boulogne-Billancourt', 'Nanterre', 'Argenteuil', 'Montreuil'] },
      { name: 'Auvergne-Rhône-Alpes', cities: ['Lyon', 'Grenoble', 'Saint-Étienne', 'Villeurbanne', 'Annecy', 'Chambéry'] },
      { name: 'Provence-Alpes-Côte d\'Azur', cities: ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Cannes', 'Antibes'] },
      { name: 'Occitanie', cities: ['Toulouse', 'Montpellier', 'Nîmes', 'Perpignan', 'Béziers', 'Carcassonne'] },
      { name: 'Nouvelle-Aquitaine', cities: ['Bordeaux', 'Limoges', 'Poitiers', 'La Rochelle', 'Pau', 'Bayonne'] },
      { name: 'Grand Est', cities: ['Strasbourg', 'Reims', 'Metz', 'Mulhouse', 'Nancy', 'Colmar'] },
      { name: 'Hauts-de-France', cities: ['Lille', 'Amiens', 'Roubaix', 'Tourcoing', 'Calais', 'Dunkirk'] },
      { name: 'Pays de la Loire', cities: ['Nantes', 'Angers', 'Le Mans', 'Saint-Nazaire', 'Laval'] },
      { name: 'Bretagne', cities: ['Rennes', 'Brest', 'Quimper', 'Lorient', 'Vannes', 'Saint-Malo'] },
      { name: 'Normandie', cities: ['Le Havre', 'Rouen', 'Caen', 'Cherbourg', 'Évreux'] },
    ]
  },

  // G
  {
    value: 'germany',
    label: 'Germany',
    letter: 'G',
    regions: [
      { name: 'Berlin', cities: ['Berlin', 'Charlottenburg', 'Mitte', 'Kreuzberg', 'Prenzlauer Berg'] },
      { name: 'Bavaria', cities: ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg', 'Ingolstadt', 'Würzburg'] },
      { name: 'North Rhine-Westphalia', cities: ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Duisburg', 'Bochum'] },
      { name: 'Baden-Württemberg', cities: ['Stuttgart', 'Mannheim', 'Karlsruhe', 'Freiburg', 'Heidelberg', 'Ulm'] },
      { name: 'Hesse', cities: ['Frankfurt', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach'] },
      { name: 'Saxony', cities: ['Leipzig', 'Dresden', 'Chemnitz', 'Zwickau', 'Plauen'] },
    ]
  },

  // I
  {
    value: 'india',
    label: 'India',
    letter: 'I',
    regions: [
      { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'] },
      { name: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'] },
      { name: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'] },
      { name: 'Delhi', cities: ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Connaught Place'] },
      { name: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'] },
      { name: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'] },
    ]
  },
  {
    value: 'italy',
    label: 'Italy',
    letter: 'I',
    regions: [
      { name: 'Lazio', cities: ['Rome', 'Latina', 'Frosinone', 'Viterbo', 'Rieti'] },
      { name: 'Lombardy', cities: ['Milan', 'Brescia', 'Monza', 'Bergamo', 'Como', 'Pavia'] },
      { name: 'Campania', cities: ['Naples', 'Salerno', 'Caserta', 'Torre del Greco', 'Giugliano'] },
      { name: 'Sicily', cities: ['Palermo', 'Catania', 'Messina', 'Syracuse', 'Ragusa'] },
      { name: 'Veneto', cities: ['Venice', 'Verona', 'Padua', 'Vicenza', 'Treviso'] },
      { name: 'Piedmont', cities: ['Turin', 'Alessandria', 'Novara', 'Asti', 'Cuneo'] },
    ]
  },

  // J
  {
    value: 'japan',
    label: 'Japan',
    letter: 'J',
    regions: [
      { name: 'Tokyo', cities: ['Tokyo', 'Shibuya', 'Shinjuku', 'Minato', 'Setagaya', 'Chiyoda'] },
      { name: 'Osaka', cities: ['Osaka', 'Sakai', 'Higashiosaka', 'Toyonaka', 'Suita'] },
      { name: 'Kanagawa', cities: ['Yokohama', 'Kawasaki', 'Sagamihara', 'Fujisawa', 'Yokosuka'] },
      { name: 'Aichi', cities: ['Nagoya', 'Toyota', 'Okazaki', 'Ichinomiya', 'Kasugai'] },
      { name: 'Hokkaido', cities: ['Sapporo', 'Asahikawa', 'Hakodate', 'Kushiro', 'Obihiro'] },
    ]
  },

  // M
  {
    value: 'mexico',
    label: 'Mexico',
    letter: 'M',
    regions: [
      { name: 'Mexico City', cities: ['Mexico City', 'Iztapalapa', 'Ecatepec', 'Guadalajara', 'Puebla'] },
      { name: 'Jalisco', cities: ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Puerto Vallarta'] },
      { name: 'Nuevo León', cities: ['Monterrey', 'Guadalupe', 'San Nicolás', 'Apodaca', 'San Pedro'] },
      { name: 'Puebla', cities: ['Puebla', 'Tehuacán', 'San Martín Texmelucan', 'Atlixco'] },
      { name: 'Baja California', cities: ['Tijuana', 'Mexicali', 'Ensenada', 'Rosarito', 'Tecate'] },
    ]
  },
  {
    value: 'morocco',
    label: 'Morocco',
    letter: 'M',
    regions: [
      { name: 'Casablanca-Settat', cities: ['Casablanca', 'Mohammedia', 'El Jadida', 'Settat', 'Berrechid'] },
      { name: 'Rabat-Salé-Kénitra', cities: ['Rabat', 'Salé', 'Témara', 'Kénitra', 'Khémisset'] },
      { name: 'Fès-Meknès', cities: ['Fès', 'Meknes', 'Taza', 'Sefrou', 'Ifrane'] },
      { name: 'Marrakech-Safi', cities: ['Marrakech', 'Safi', 'El Kelaa des Sraghna', 'Essaouira'] },
      { name: 'Tanger-Tétouan-Al Hoceïma', cities: ['Tangier', 'Tétouan', 'Al Hoceima', 'Larache'] },
    ]
  },

  // N
  {
    value: 'netherlands',
    label: 'Netherlands',
    letter: 'N',
    regions: [
      { name: 'North Holland', cities: ['Amsterdam', 'Haarlem', 'Zaanstad', 'Haarlemmermeer', 'Alkmaar'] },
      { name: 'South Holland', cities: ['Rotterdam', 'The Hague', 'Leiden', 'Dordrecht', 'Zoetermeer'] },
      { name: 'Utrecht', cities: ['Utrecht', 'Amersfoort', 'Nieuwegein', 'Veenendaal', 'Zeist'] },
      { name: 'North Brabant', cities: ['Eindhoven', 'Tilburg', 'Breda', 's-Hertogenbosch', 'Helmond'] },
      { name: 'Gelderland', cities: ['Nijmegen', 'Arnhem', 'Apeldoorn', 'Ede', 'Doetinchem'] },
    ]
  },

  // P
  {
    value: 'poland',
    label: 'Poland',
    letter: 'P',
    regions: [
      { name: 'Masovian', cities: ['Warsaw', 'Radom', 'Płock', 'Siedlce', 'Ostrołęka'] },
      { name: 'Lesser Poland', cities: ['Kraków', 'Tarnów', 'Nowy Sącz', 'Oświęcim', 'Chrzanów'] },
      { name: 'Silesian', cities: ['Katowice', 'Częstochowa', 'Sosnowiec', 'Gliwice', 'Zabrze', 'Bytom'] },
      { name: 'Lower Silesian', cities: ['Wrocław', 'Wałbrzych', 'Legnica', 'Jelenia Góra'] },
      { name: 'Greater Poland', cities: ['Poznań', 'Kalisz', 'Konin', 'Piła', 'Ostrów Wielkopolski'] },
    ]
  },
  {
    value: 'portugal',
    label: 'Portugal',
    letter: 'P',
    regions: [
      { name: 'Lisbon', cities: ['Lisbon', 'Amadora', 'Loures', 'Odivelas', 'Cascais', 'Sintra'] },
      { name: 'Porto', cities: ['Porto', 'Vila Nova de Gaia', 'Matosinhos', 'Gondomar', 'Maia'] },
      { name: 'Braga', cities: ['Braga', 'Guimarães', 'Barcelos', 'Famalicão', 'Esposende'] },
      { name: 'Setúbal', cities: ['Setúbal', 'Almada', 'Seixal', 'Barreiro', 'Montijo'] },
    ]
  },

  // S
  {
    value: 'saudi-arabia',
    label: 'Saudi Arabia',
    letter: 'S',
    regions: [
      { name: 'Riyadh', cities: ['Riyadh', 'Al Kharj', 'Al Majmaah', 'Al Zulfi', 'Diriyah'] },
      { name: 'Makkah', cities: ['Jeddah', 'Mecca', 'Taif', 'Rabigh', 'Khulais'] },
      { name: 'Eastern Province', cities: ['Dammam', 'Khobar', 'Dhahran', 'Jubail', 'Qatif'] },
      { name: 'Madinah', cities: ['Medina', 'Yanbu', 'Badr', 'Al-Ula'] },
    ]
  },
  {
    value: 'singapore',
    label: 'Singapore',
    letter: 'S',
    regions: [
      { name: 'Central', cities: ['Downtown Core', 'Marina Bay', 'Orchard', 'Newton', 'Bugis'] },
      { name: 'East', cities: ['Tampines', 'Bedok', 'Pasir Ris', 'Changi', 'Simei'] },
      { name: 'North', cities: ['Woodlands', 'Yishun', 'Sembawang', 'Admiralty'] },
      { name: 'West', cities: ['Jurong', 'Clementi', 'Bukit Batok', 'Choa Chu Kang'] },
    ]
  },
  {
    value: 'south-africa',
    label: 'South Africa',
    letter: 'S',
    regions: [
      { name: 'Gauteng', cities: ['Johannesburg', 'Pretoria', 'Soweto', 'Sandton', 'Midrand', 'Centurion'] },
      { name: 'Western Cape', cities: ['Cape Town', 'Stellenbosch', 'Paarl', 'George', 'Mossel Bay'] },
      { name: 'KwaZulu-Natal', cities: ['Durban', 'Pietermaritzburg', 'Richards Bay', 'Newcastle'] },
      { name: 'Eastern Cape', cities: ['Port Elizabeth', 'East London', 'Mthatha', 'Bhisho'] },
    ]
  },
  {
    value: 'spain',
    label: 'Spain',
    letter: 'S',
    regions: [
      { name: 'Madrid', cities: ['Madrid', 'Móstoles', 'Alcalá de Henares', 'Fuenlabrada', 'Getafe'] },
      { name: 'Catalonia', cities: ['Barcelona', 'L\'Hospitalet', 'Badalona', 'Terrassa', 'Sabadell'] },
      { name: 'Andalusia', cities: ['Seville', 'Málaga', 'Córdoba', 'Granada', 'Jerez', 'Almería'] },
      { name: 'Valencia', cities: ['Valencia', 'Alicante', 'Elche', 'Castellón', 'Torrevieja'] },
      { name: 'Basque Country', cities: ['Bilbao', 'Vitoria-Gasteiz', 'San Sebastián', 'Barakaldo'] },
    ]
  },
  {
    value: 'sweden',
    label: 'Sweden',
    letter: 'S',
    regions: [
      { name: 'Stockholm', cities: ['Stockholm', 'Solna', 'Sundbyberg', 'Nacka', 'Huddinge'] },
      { name: 'Västra Götaland', cities: ['Gothenburg', 'Borås', 'Trollhättan', 'Uddevalla', 'Skövde'] },
      { name: 'Skåne', cities: ['Malmö', 'Helsingborg', 'Lund', 'Kristianstad', 'Landskrona'] },
      { name: 'Uppsala', cities: ['Uppsala', 'Enköping', 'Tierp', 'Håbo'] },
    ]
  },
  {
    value: 'switzerland',
    label: 'Switzerland',
    letter: 'S',
    regions: [
      { name: 'Zurich', cities: ['Zurich', 'Winterthur', 'Uster', 'Dübendorf', 'Dietikon'] },
      { name: 'Geneva', cities: ['Geneva', 'Vernier', 'Lancy', 'Meyrin', 'Carouge'] },
      { name: 'Basel-Stadt', cities: ['Basel', 'Riehen', 'Bettingen'] },
      { name: 'Vaud', cities: ['Lausanne', 'Yverdon-les-Bains', 'Montreux', 'Renens', 'Nyon'] },
      { name: 'Bern', cities: ['Bern', 'Biel/Bienne', 'Thun', 'Köniz', 'Steffisburg'] },
    ]
  },

  // T
  {
    value: 'tunisia',
    label: 'Tunisia',
    letter: 'T',
    regions: [
      { name: 'Tunis', cities: ['Tunis', 'Ariana', 'Ben Arous', 'La Marsa', 'Manouba'] },
      { name: 'Sfax', cities: ['Sfax', 'Sakiet Ezzit', 'Sakiet Eddaïer', 'Agareb'] },
      { name: 'Sousse', cities: ['Sousse', 'Hammam Sousse', 'Msaken', 'Kalâa Kebira'] },
      { name: 'Bizerte', cities: ['Bizerte', 'Menzel Bourguiba', 'Mateur', 'Ras Jebel'] },
    ]
  },
  {
    value: 'turkey',
    label: 'Turkey',
    letter: 'T',
    regions: [
      { name: 'Istanbul', cities: ['Istanbul', 'Kadıköy', 'Üsküdar', 'Beşiktaş', 'Şişli', 'Beyoğlu'] },
      { name: 'Ankara', cities: ['Ankara', 'Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak'] },
      { name: 'Izmir', cities: ['Izmir', 'Konak', 'Bornova', 'Karşıyaka', 'Çiğli'] },
      { name: 'Bursa', cities: ['Bursa', 'Osmangazi', 'Nilüfer', 'Yıldırım', 'Gemlik'] },
    ]
  },

  // U
  {
    value: 'uae',
    label: 'United Arab Emirates',
    letter: 'U',
    regions: [
      { name: 'Dubai', cities: ['Dubai', 'Deira', 'Bur Dubai', 'Jumeirah', 'Dubai Marina'] },
      { name: 'Abu Dhabi', cities: ['Abu Dhabi', 'Al Ain', 'Bani Yas', 'Khalifa City', 'Yas Island'] },
      { name: 'Sharjah', cities: ['Sharjah', 'Al Majaz', 'Al Qasimia', 'Al Nahda', 'Muwailih'] },
      { name: 'Ajman', cities: ['Ajman', 'Al Nuaimia', 'Al Rashidiya', 'Al Jurf'] },
    ]
  },
  {
    value: 'uk',
    label: 'United Kingdom',
    letter: 'U',
    regions: [
      { name: 'England - London', cities: ['London', 'Westminster', 'Camden', 'Islington', 'Hackney', 'Tower Hamlets'] },
      { name: 'England - South East', cities: ['Brighton', 'Oxford', 'Cambridge', 'Reading', 'Southampton'] },
      { name: 'England - North West', cities: ['Manchester', 'Liverpool', 'Leeds', 'Sheffield', 'Newcastle'] },
      { name: 'Scotland', cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness'] },
      { name: 'Wales', cities: ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry'] },
      { name: 'Northern Ireland', cities: ['Belfast', 'Derry', 'Lisburn', 'Newry', 'Armagh'] },
    ]
  },
  {
    value: 'usa',
    label: 'United States',
    letter: 'U',
    regions: [
      { name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Oakland'] },
      { name: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany'] },
      { name: 'Texas', cities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso'] },
      { name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'Tallahassee'] },
      { name: 'Illinois', cities: ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield'] },
      { name: 'Pennsylvania', cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading'] },
      { name: 'Ohio', cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton'] },
      { name: 'Georgia', cities: ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens'] },
      { name: 'North Carolina', cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem'] },
      { name: 'Michigan', cities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor'] },
      { name: 'Massachusetts', cities: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell'] },
      { name: 'Washington', cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue'] },
    ]
  },
]

// Helper functions
export function getCountryOptions() {
  return COUNTRIES.map(c => ({
    value: c.value,
    label: c.label,
    letter: c.letter
  }))
}

export function getRegionsForCountry(countryValue: string) {
  const country = COUNTRIES.find(c => c.value === countryValue)
  if (!country) return []
  
  return country.regions.map(r => ({
    value: r.name,
    label: r.name
  }))
}

export function getCitiesForRegion(countryValue: string, regionName: string) {
  const country = COUNTRIES.find(c => c.value === countryValue)
  if (!country) return []
  
  const region = country.regions.find(r => r.name === regionName)
  if (!region) return []
  
  return region.cities.map(city => ({
    value: city,
    label: city
  }))
}

export function getCountriesByLetter() {
  const grouped: Record<string, typeof COUNTRIES> = {}
  
  COUNTRIES.forEach(country => {
    if (!grouped[country.letter]) {
      grouped[country.letter] = []
    }
    grouped[country.letter].push(country)
  })
  
  return grouped
}
