// Country and city data for location selection
// All 195 countries organized by region with their major cities

export interface Country {
  value: string
  label: string
  flag: string
  cities: string[]
}

export const COUNTRIES: Country[] = [
  // Europe (50 countries)
  {
    value: 'albania',
    label: 'Albania',
    flag: '🇦🇱',
    cities: ['Tirana', 'Durrës', 'Vlorë', 'Shkodër', 'Fier', 'Korçë', 'Elbasan', 'Berat']
  },
  {
    value: 'andorra',
    label: 'Andorra',
    flag: '🇦🇩',
    cities: ['Andorra la Vella', 'Escaldes-Engordany', 'Encamp', 'Sant Julià de Lòria', 'La Massana']
  },
  {
    value: 'armenia',
    label: 'Armenia',
    flag: '🇦🇲',
    cities: ['Yerevan', 'Gyumri', 'Vanadzor', 'Vagharshapat', 'Hrazdan', 'Abovyan', 'Kapan']
  },
  {
    value: 'austria',
    label: 'Austria',
    flag: '🇦🇹',
    cities: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'St. Pölten']
  },
  {
    value: 'azerbaijan',
    label: 'Azerbaijan',
    flag: '🇦🇿',
    cities: ['Baku', 'Ganja', 'Sumqayit', 'Mingachevir', 'Shirvan', 'Nakhchivan', 'Lankaran']
  },
  {
    value: 'belarus',
    label: 'Belarus',
    flag: '🇧🇾',
    cities: ['Minsk', 'Gomel', 'Mogilev', 'Vitebsk', 'Grodno', 'Brest', 'Bobruisk', 'Baranovichi']
  },
  {
    value: 'belgium',
    label: 'Belgium',
    flag: '🇧🇪',
    cities: ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven', 'Mons']
  },
  {
    value: 'bosnia-herzegovina',
    label: 'Bosnia and Herzegovina',
    flag: '🇧🇦',
    cities: ['Sarajevo', 'Banja Luka', 'Tuzla', 'Zenica', 'Mostar', 'Bijeljina', 'Brčko']
  },
  {
    value: 'bulgaria',
    label: 'Bulgaria',
    flag: '🇧🇬',
    cities: ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Sliven']
  },
  {
    value: 'croatia',
    label: 'Croatia',
    flag: '🇭🇷',
    cities: ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula', 'Slavonski Brod', 'Sesvete']
  },
  {
    value: 'cyprus',
    label: 'Cyprus',
    flag: '🇨🇾',
    cities: ['Nicosia', 'Limassol', 'Larnaca', 'Strovolos', 'Famagusta', 'Paphos', 'Kyrenia']
  },
  {
    value: 'czech-republic',
    label: 'Czech Republic',
    flag: '🇨🇿',
    cities: ['Prague', 'Brno', 'Ostrava', 'Pilsen', 'Liberec', 'Olomouc', 'České Budějovice', 'Hradec Králové']
  },
  {
    value: 'denmark',
    label: 'Denmark',
    flag: '🇩🇰',
    cities: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens']
  },
  {
    value: 'estonia',
    label: 'Estonia',
    flag: '🇪🇪',
    cities: ['Tallinn', 'Tartu', 'Narva', 'Pärnu', 'Kohtla-Järve', 'Viljandi', 'Rakvere']
  },
  {
    value: 'finland',
    label: 'Finland',
    flag: '🇫🇮',
    cities: ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku', 'Jyväskylä', 'Lahti', 'Kuopio']
  },
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
    value: 'georgia',
    label: 'Georgia',
    flag: '🇬🇪',
    cities: ['Tbilisi', 'Kutaisi', 'Batumi', 'Rustavi', 'Zugdidi', 'Gori', 'Poti', 'Khashuri']
  },
  {
    value: 'greece',
    label: 'Greece',
    flag: '🇬🇷',
    cities: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa', 'Volos', 'Rhodes', 'Ioannina']
  },
  {
    value: 'hungary',
    label: 'Hungary',
    flag: '🇭🇺',
    cities: ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét']
  },
  {
    value: 'iceland',
    label: 'Iceland',
    flag: '🇮🇸',
    cities: ['Reykjavík', 'Kópavogur', 'Hafnarfjörður', 'Akureyri', 'Reykjanesbær', 'Garðabær']
  },
  {
    value: 'ireland',
    label: 'Ireland',
    flag: '🇮🇪',
    cities: ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda', 'Dundalk', 'Swords']
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
    value: 'kosovo',
    label: 'Kosovo',
    flag: '🇽🇰',
    cities: ['Pristina', 'Prizren', 'Peja', 'Gjakova', 'Mitrovica', 'Gjilan', 'Ferizaj']
  },
  {
    value: 'latvia',
    label: 'Latvia',
    flag: '🇱🇻',
    cities: ['Riga', 'Daugavpils', 'Liepāja', 'Jelgava', 'Jūrmala', 'Ventspils', 'Rēzekne']
  },
  {
    value: 'liechtenstein',
    label: 'Liechtenstein',
    flag: '🇱🇮',
    cities: ['Vaduz', 'Schaan', 'Balzers', 'Triesen', 'Eschen', 'Mauren']
  },
  {
    value: 'lithuania',
    label: 'Lithuania',
    flag: '🇱🇹',
    cities: ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė']
  },
  {
    value: 'luxembourg',
    label: 'Luxembourg',
    flag: '🇱🇺',
    cities: ['Luxembourg City', 'Esch-sur-Alzette', 'Dudelange', 'Differdange', 'Pétange']
  },
  {
    value: 'malta',
    label: 'Malta',
    flag: '🇲🇹',
    cities: ['Valletta', 'Birkirkara', 'Qormi', 'Mosta', 'Sliema', 'St. Paul\'s Bay', 'Naxxar']
  },
  {
    value: 'moldova',
    label: 'Moldova',
    flag: '🇲🇩',
    cities: ['Chișinău', 'Tiraspol', 'Bălți', 'Bender', 'Rîbnița', 'Cahul', 'Ungheni']
  },
  {
    value: 'monaco',
    label: 'Monaco',
    flag: '🇲🇨',
    cities: ['Monaco', 'Monte Carlo', 'La Condamine', 'Fontvieille']
  },
  {
    value: 'montenegro',
    label: 'Montenegro',
    flag: '🇲🇪',
    cities: ['Podgorica', 'Nikšić', 'Pljevlja', 'Bijelo Polje', 'Cetinje', 'Bar', 'Budva']
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
    value: 'north-macedonia',
    label: 'North Macedonia',
    flag: '🇲🇰',
    cities: ['Skopje', 'Bitola', 'Kumanovo', 'Prilep', 'Tetovo', 'Veles', 'Ohrid', 'Gostivar']
  },
  {
    value: 'norway',
    label: 'Norway',
    flag: '🇳🇴',
    cities: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen', 'Fredrikstad', 'Kristiansand', 'Sandnes']
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
    value: 'romania',
    label: 'Romania',
    flag: '🇷🇴',
    cities: ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați']
  },
  {
    value: 'russia',
    label: 'Russia',
    flag: '🇷🇺',
    cities: [
      'Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Nizhny Novgorod',
      'Chelyabinsk', 'Samara', 'Omsk', 'Rostov-on-Don', 'Ufa', 'Krasnoyarsk', 'Vladivostok'
    ]
  },
  {
    value: 'san-marino',
    label: 'San Marino',
    flag: '🇸🇲',
    cities: ['San Marino', 'Serravalle', 'Borgo Maggiore', 'Domagnano', 'Fiorentino']
  },
  {
    value: 'serbia',
    label: 'Serbia',
    flag: '🇷🇸',
    cities: ['Belgrade', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica', 'Zrenjanin', 'Pančevo']
  },
  {
    value: 'slovakia',
    label: 'Slovakia',
    flag: '🇸🇰',
    cities: ['Bratislava', 'Košice', 'Prešov', 'Žilina', 'Banská Bystrica', 'Nitra', 'Trnava']
  },
  {
    value: 'slovenia',
    label: 'Slovenia',
    flag: '🇸🇮',
    cities: ['Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Velenje', 'Koper', 'Novo Mesto']
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
    value: 'sweden',
    label: 'Sweden',
    flag: '🇸🇪',
    cities: [
      'Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro',
      'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping', 'Lund', 'Umeå'
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
    value: 'ukraine',
    label: 'Ukraine',
    flag: '🇺🇦',
    cities: ['Kyiv', 'Kharkiv', 'Odesa', 'Dnipro', 'Donetsk', 'Zaporizhzhia', 'Lviv', 'Kryvyi Rih']
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
    value: 'vatican-city',
    label: 'Vatican City',
    flag: '🇻🇦',
    cities: ['Vatican City']
  },

  // Asia (48 countries)
  {
    value: 'afghanistan',
    label: 'Afghanistan',
    flag: '🇦🇫',
    cities: ['Kabul', 'Kandahar', 'Herat', 'Mazar-i-Sharif', 'Jalalabad', 'Kunduz']
  },
  {
    value: 'bahrain',
    label: 'Bahrain',
    flag: '🇧🇭',
    cities: ['Manama', 'Muharraq', 'Riffa', 'Hamad Town', 'Isa Town', 'Sitra']
  },
  {
    value: 'bangladesh',
    label: 'Bangladesh',
    flag: '🇧🇩',
    cities: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Rangpur', 'Barisal']
  },
  {
    value: 'bhutan',
    label: 'Bhutan',
    flag: '🇧🇹',
    cities: ['Thimphu', 'Phuntsholing', 'Paro', 'Punakha', 'Wangdue Phodrang']
  },
  {
    value: 'brunei',
    label: 'Brunei',
    flag: '🇧🇳',
    cities: ['Bandar Seri Begawan', 'Kuala Belait', 'Seria', 'Tutong', 'Bangar']
  },
  {
    value: 'cambodia',
    label: 'Cambodia',
    flag: '🇰🇭',
    cities: ['Phnom Penh', 'Siem Reap', 'Battambang', 'Sihanoukville', 'Poipet', 'Kampong Cham']
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
    value: 'indonesia',
    label: 'Indonesia',
    flag: '🇮🇩',
    cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Tangerang']
  },
  {
    value: 'iran',
    label: 'Iran',
    flag: '🇮🇷',
    cities: ['Tehran', 'Mashhad', 'Isfahan', 'Karaj', 'Shiraz', 'Tabriz', 'Qom', 'Ahvaz']
  },
  {
    value: 'iraq',
    label: 'Iraq',
    flag: '🇮🇶',
    cities: ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Kirkuk', 'Najaf', 'Karbala', 'Sulaymaniyah']
  },
  {
    value: 'israel',
    label: 'Israel',
    flag: '🇮🇱',
    cities: ['Jerusalem', 'Tel Aviv', 'Haifa', 'Rishon LeZion', 'Petah Tikva', 'Ashdod', 'Netanya', 'Beersheba']
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
    value: 'jordan',
    label: 'Jordan',
    flag: '🇯🇴',
    cities: ['Amman', 'Zarqa', 'Irbid', 'Russeifa', 'Aqaba', 'Madaba', 'Jerash']
  },
  {
    value: 'kazakhstan',
    label: 'Kazakhstan',
    flag: '🇰🇿',
    cities: ['Almaty', 'Nur-Sultan', 'Shymkent', 'Karaganda', 'Aktobe', 'Taraz', 'Pavlodar']
  },
  {
    value: 'kuwait',
    label: 'Kuwait',
    flag: '🇰🇼',
    cities: ['Kuwait City', 'Hawalli', 'Salmiya', 'Sabah Al-Salem', 'Al Jahra', 'Farwaniya']
  },
  {
    value: 'kyrgyzstan',
    label: 'Kyrgyzstan',
    flag: '🇰🇬',
    cities: ['Bishkek', 'Osh', 'Jalal-Abad', 'Karakol', 'Tokmok', 'Uzgen']
  },
  {
    value: 'laos',
    label: 'Laos',
    flag: '🇱🇦',
    cities: ['Vientiane', 'Pakse', 'Savannakhet', 'Luang Prabang', 'Thakhek', 'Xam Neua']
  },
  {
    value: 'lebanon',
    label: 'Lebanon',
    flag: '🇱🇧',
    cities: ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Nabatieh', 'Jounieh', 'Zahle', 'Baalbek']
  },
  {
    value: 'malaysia',
    label: 'Malaysia',
    flag: '🇲🇾',
    cities: ['Kuala Lumpur', 'George Town', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Johor Bahru', 'Malacca']
  },
  {
    value: 'maldives',
    label: 'Maldives',
    flag: '🇲🇻',
    cities: ['Malé', 'Addu City', 'Fuvahmulah', 'Kulhudhuffushi', 'Thinadhoo']
  },
  {
    value: 'mongolia',
    label: 'Mongolia',
    flag: '🇲🇳',
    cities: ['Ulaanbaatar', 'Erdenet', 'Darkhan', 'Choibalsan', 'Mörön', 'Khovd']
  },
  {
    value: 'myanmar',
    label: 'Myanmar',
    flag: '🇲🇲',
    cities: ['Yangon', 'Mandalay', 'Naypyidaw', 'Mawlamyine', 'Bago', 'Pathein', 'Monywa']
  },
  {
    value: 'nepal',
    label: 'Nepal',
    flag: '🇳🇵',
    cities: ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bharatpur', 'Biratnagar', 'Birgunj', 'Dharan']
  },
  {
    value: 'north-korea',
    label: 'North Korea',
    flag: '🇰🇵',
    cities: ['Pyongyang', 'Hamhung', 'Chongjin', 'Nampo', 'Wonsan', 'Sinuiju']
  },
  {
    value: 'oman',
    label: 'Oman',
    flag: '🇴🇲',
    cities: ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Bahla', 'Ibri']
  },
  {
    value: 'pakistan',
    label: 'Pakistan',
    flag: '🇵🇰',
    cities: ['Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Hyderabad', 'Gujranwala', 'Peshawar']
  },
  {
    value: 'palestine',
    label: 'Palestine',
    flag: '🇵🇸',
    cities: ['Gaza', 'Hebron', 'Nablus', 'Ramallah', 'Khan Yunis', 'Jenin', 'Bethlehem']
  },
  {
    value: 'philippines',
    label: 'Philippines',
    flag: '🇵🇭',
    cities: ['Manila', 'Quezon City', 'Davao', 'Cebu City', 'Zamboanga', 'Antipolo', 'Cagayan de Oro']
  },
  {
    value: 'qatar',
    label: 'Qatar',
    flag: '🇶🇦',
    cities: ['Doha', 'Al Rayyan', 'Umm Salal', 'Al Wakrah', 'Al Khor', 'Dukhan']
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
    value: 'south-korea',
    label: 'South Korea',
    flag: '🇰🇷',
    cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan']
  },
  {
    value: 'sri-lanka',
    label: 'Sri Lanka',
    flag: '🇱🇰',
    cities: ['Colombo', 'Dehiwala-Mount Lavinia', 'Moratuwa', 'Jaffna', 'Negombo', 'Kandy', 'Galle']
  },
  {
    value: 'syria',
    label: 'Syria',
    flag: '🇸🇾',
    cities: ['Damascus', 'Aleppo', 'Homs', 'Latakia', 'Hama', 'Raqqa', 'Deir ez-Zor']
  },
  {
    value: 'tajikistan',
    label: 'Tajikistan',
    flag: '🇹🇯',
    cities: ['Dushanbe', 'Khujand', 'Kulob', 'Qurghonteppa', 'Istaravshan', 'Konibodom']
  },
  {
    value: 'thailand',
    label: 'Thailand',
    flag: '🇹🇭',
    cities: ['Bangkok', 'Nonthaburi', 'Pak Kret', 'Hat Yai', 'Chiang Mai', 'Udon Thani', 'Nakhon Ratchasima']
  },
  {
    value: 'timor-leste',
    label: 'Timor-Leste',
    flag: '🇹🇱',
    cities: ['Dili', 'Dare', 'Baucau', 'Maliana', 'Suai', 'Liquiçá']
  },
  {
    value: 'turkey',
    label: 'Turkey',
    flag: '🇹🇷',
    cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Antalya']
  },
  {
    value: 'turkmenistan',
    label: 'Turkmenistan',
    flag: '🇹🇲',
    cities: ['Ashgabat', 'Türkmenabat', 'Daşoguz', 'Mary', 'Balkanabat', 'Türkmenbaşy']
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
    value: 'uzbekistan',
    label: 'Uzbekistan',
    flag: '🇺🇿',
    cities: ['Tashkent', 'Samarkand', 'Namangan', 'Andijan', 'Bukhara', 'Nukus', 'Fergana']
  },
  {
    value: 'vietnam',
    label: 'Vietnam',
    flag: '🇻🇳',
    cities: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hai Phong', 'Can Tho', 'Bien Hoa', 'Hue']
  },
  {
    value: 'yemen',
    label: 'Yemen',
    flag: '🇾🇪',
    cities: ['Sana\'a', 'Aden', 'Taiz', 'Hodeidah', 'Ibb', 'Mukalla', 'Dhamar']
  },

  // Africa (54 countries)
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
    value: 'angola',
    label: 'Angola',
    flag: '🇦🇴',
    cities: ['Luanda', 'Huambo', 'Lobito', 'Benguela', 'Kuito', 'Lubango', 'Malanje']
  },
  {
    value: 'benin',
    label: 'Benin',
    flag: '🇧🇯',
    cities: ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon', 'Kandi']
  },
  {
    value: 'botswana',
    label: 'Botswana',
    flag: '🇧🇼',
    cities: ['Gaborone', 'Francistown', 'Molepolole', 'Maun', 'Selebi-Phikwe', 'Serowe']
  },
  {
    value: 'burkina-faso',
    label: 'Burkina Faso',
    flag: '🇧🇫',
    cities: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Dédougou']
  },
  {
    value: 'burundi',
    label: 'Burundi',
    flag: '🇧🇮',
    cities: ['Gitega', 'Bujumbura', 'Muyinga', 'Ruyigi', 'Ngozi', 'Kayanza']
  },
  {
    value: 'cabo-verde',
    label: 'Cabo Verde',
    flag: '🇨🇻',
    cities: ['Praia', 'Mindelo', 'Santa Maria', 'Assomada', 'São Filipe']
  },
  {
    value: 'cameroon',
    label: 'Cameroon',
    flag: '🇨🇲',
    cities: ['Yaoundé', 'Douala', 'Garoua', 'Bamenda', 'Bafoussam', 'Maroua', 'Nkongsamba']
  },
  {
    value: 'central-african-republic',
    label: 'Central African Republic',
    flag: '🇨🇫',
    cities: ['Bangui', 'Bimbo', 'Berbérati', 'Carnot', 'Bambari', 'Bouar']
  },
  {
    value: 'chad',
    label: 'Chad',
    flag: '🇹🇩',
    cities: ['N\'Djamena', 'Moundou', 'Sarh', 'Abéché', 'Kelo', 'Koumra']
  },
  {
    value: 'comoros',
    label: 'Comoros',
    flag: '🇰🇲',
    cities: ['Moroni', 'Mutsamudu', 'Fomboni', 'Domoni', 'Tsimbeo']
  },
  {
    value: 'congo-brazzaville',
    label: 'Congo (Brazzaville)',
    flag: '🇨🇬',
    cities: ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Owando']
  },
  {
    value: 'congo-kinshasa',
    label: 'Congo (Kinshasa)',
    flag: '🇨🇩',
    cities: ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani', 'Goma', 'Bukavu']
  },
  {
    value: 'djibouti',
    label: 'Djibouti',
    flag: '🇩🇯',
    cities: ['Djibouti City', 'Ali Sabieh', 'Tadjoura', 'Obock', 'Dikhil']
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
    value: 'equatorial-guinea',
    label: 'Equatorial Guinea',
    flag: '🇬🇶',
    cities: ['Malabo', 'Bata', 'Ebebiyin', 'Aconibe', 'Añisoc']
  },
  {
    value: 'eritrea',
    label: 'Eritrea',
    flag: '🇪🇷',
    cities: ['Asmara', 'Massawa', 'Keren', 'Mendefera', 'Assab', 'Barentu']
  },
  {
    value: 'eswatini',
    label: 'Eswatini',
    flag: '🇸🇿',
    cities: ['Mbabane', 'Manzini', 'Lobamba', 'Siteki', 'Malkerns']
  },
  {
    value: 'ethiopia',
    label: 'Ethiopia',
    flag: '🇪🇹',
    cities: ['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Awasa', 'Bahir Dar', 'Dessie']
  },
  {
    value: 'gabon',
    label: 'Gabon',
    flag: '🇬🇦',
    cities: ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Mouila']
  },
  {
    value: 'gambia',
    label: 'Gambia',
    flag: '🇬🇲',
    cities: ['Banjul', 'Serekunda', 'Brikama', 'Bakau', 'Farafenni']
  },
  {
    value: 'ghana',
    label: 'Ghana',
    flag: '🇬🇭',
    cities: ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Ashaiman', 'Sunyani', 'Cape Coast']
  },
  {
    value: 'guinea',
    label: 'Guinea',
    flag: '🇬🇳',
    cities: ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé', 'Guéckédou']
  },
  {
    value: 'guinea-bissau',
    label: 'Guinea-Bissau',
    flag: '🇬🇼',
    cities: ['Bissau', 'Bafatá', 'Gabú', 'Bissora', 'Bolama']
  },
  {
    value: 'ivory-coast',
    label: 'Ivory Coast',
    flag: '🇨🇮',
    cities: ['Abidjan', 'Bouaké', 'Yamoussoukro', 'Daloa', 'Korhogo', 'San-Pédro']
  },
  {
    value: 'kenya',
    label: 'Kenya',
    flag: '🇰🇪',
    cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi']
  },
  {
    value: 'lesotho',
    label: 'Lesotho',
    flag: '🇱🇸',
    cities: ['Maseru', 'Teyateyaneng', 'Mafeteng', 'Hlotse', 'Mohale\'s Hoek']
  },
  {
    value: 'liberia',
    label: 'Liberia',
    flag: '🇱🇷',
    cities: ['Monrovia', 'Gbarnga', 'Kakata', 'Bensonville', 'Harper', 'Voinjama']
  },
  {
    value: 'libya',
    label: 'Libya',
    flag: '🇱🇾',
    cities: ['Tripoli', 'Benghazi', 'Misrata', 'Zawiya', 'Bayda', 'Ajdabiya']
  },
  {
    value: 'madagascar',
    label: 'Madagascar',
    flag: '🇲🇬',
    cities: ['Antananarivo', 'Toamasina', 'Antsirabe', 'Fianarantsoa', 'Mahajanga', 'Toliara']
  },
  {
    value: 'malawi',
    label: 'Malawi',
    flag: '🇲🇼',
    cities: ['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba', 'Kasungu', 'Mangochi']
  },
  {
    value: 'mali',
    label: 'Mali',
    flag: '🇲🇱',
    cities: ['Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Kayes', 'Ségou', 'Gao']
  },
  {
    value: 'mauritania',
    label: 'Mauritania',
    flag: '🇲🇷',
    cities: ['Nouakchott', 'Nouadhibou', 'Néma', 'Kaédi', 'Rosso', 'Zouérate']
  },
  {
    value: 'mauritius',
    label: 'Mauritius',
    flag: '🇲🇺',
    cities: ['Port Louis', 'Vacoas-Phoenix', 'Curepipe', 'Quatre Bornes', 'Triolet']
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
    value: 'mozambique',
    label: 'Mozambique',
    flag: '🇲🇿',
    cities: ['Maputo', 'Matola', 'Beira', 'Nampula', 'Chimoio', 'Nacala', 'Quelimane']
  },
  {
    value: 'namibia',
    label: 'Namibia',
    flag: '🇳🇦',
    cities: ['Windhoek', 'Rundu', 'Walvis Bay', 'Swakopmund', 'Oshakati', 'Rehoboth']
  },
  {
    value: 'niger',
    label: 'Niger',
    flag: '🇳🇪',
    cities: ['Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua', 'Dosso']
  },
  {
    value: 'nigeria',
    label: 'Nigeria',
    flag: '🇳🇬',
    cities: ['Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt', 'Benin City', 'Kaduna', 'Maiduguri']
  },
  {
    value: 'rwanda',
    label: 'Rwanda',
    flag: '🇷🇼',
    cities: ['Kigali', 'Butare', 'Gitarama', 'Musanze', 'Gisenyi', 'Byumba']
  },
  {
    value: 'sao-tome-principe',
    label: 'São Tomé and Príncipe',
    flag: '🇸🇹',
    cities: ['São Tomé', 'Santo António', 'Neves', 'Santana', 'Trindade']
  },
  {
    value: 'senegal',
    label: 'Senegal',
    flag: '🇸🇳',
    cities: ['Dakar', 'Touba', 'Thiès', 'Kaolack', 'Saint-Louis', 'Ziguinchor', 'Rufisque']
  },
  {
    value: 'seychelles',
    label: 'Seychelles',
    flag: '🇸🇨',
    cities: ['Victoria', 'Anse Boileau', 'Beau Vallon', 'Cascade', 'Takamaka']
  },
  {
    value: 'sierra-leone',
    label: 'Sierra Leone',
    flag: '🇸🇱',
    cities: ['Freetown', 'Bo', 'Kenema', 'Koidu', 'Makeni', 'Waterloo']
  },
  {
    value: 'somalia',
    label: 'Somalia',
    flag: '🇸🇴',
    cities: ['Mogadishu', 'Hargeisa', 'Bosaso', 'Kismayo', 'Merca', 'Baidoa']
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
    value: 'south-sudan',
    label: 'South Sudan',
    flag: '🇸🇸',
    cities: ['Juba', 'Malakal', 'Wau', 'Yei', 'Yambio', 'Bor']
  },
  {
    value: 'sudan',
    label: 'Sudan',
    flag: '🇸🇩',
    cities: ['Khartoum', 'Omdurman', 'Port Sudan', 'Kassala', 'El Obeid', 'Nyala']
  },
  {
    value: 'tanzania',
    label: 'Tanzania',
    flag: '🇹🇿',
    cities: ['Dar es Salaam', 'Dodoma', 'Mwanza', 'Zanzibar City', 'Arusha', 'Mbeya', 'Morogoro']
  },
  {
    value: 'togo',
    label: 'Togo',
    flag: '🇹🇬',
    cities: ['Lomé', 'Sokodé', 'Kara', 'Atakpamé', 'Kpalimé', 'Dapaong']
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
    value: 'uganda',
    label: 'Uganda',
    flag: '🇺🇬',
    cities: ['Kampala', 'Gulu', 'Lira', 'Mbarara', 'Jinja', 'Entebbe', 'Mbale']
  },
  {
    value: 'zambia',
    label: 'Zambia',
    flag: '🇿🇲',
    cities: ['Lusaka', 'Kitwe', 'Ndola', 'Kabwe', 'Chingola', 'Mufulira', 'Livingstone']
  },
  {
    value: 'zimbabwe',
    label: 'Zimbabwe',
    flag: '🇿🇼',
    cities: ['Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Gweru', 'Epworth', 'Kwekwe']
  },

  // North America (23 countries)
  {
    value: 'antigua-barbuda',
    label: 'Antigua and Barbuda',
    flag: '🇦🇬',
    cities: ['St. John\'s', 'All Saints', 'Liberta', 'Potters Village', 'Bolans']
  },
  {
    value: 'bahamas',
    label: 'Bahamas',
    flag: '🇧🇸',
    cities: ['Nassau', 'Lucaya', 'Freeport', 'West Bay', 'Cooper\'s Town']
  },
  {
    value: 'barbados',
    label: 'Barbados',
    flag: '🇧🇧',
    cities: ['Bridgetown', 'Speightstown', 'Oistins', 'Bathsheba', 'Holetown']
  },
  {
    value: 'belize',
    label: 'Belize',
    flag: '🇧🇿',
    cities: ['Belize City', 'San Ignacio', 'Belmopan', 'Orange Walk', 'Dangriga']
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
    value: 'costa-rica',
    label: 'Costa Rica',
    flag: '🇨🇷',
    cities: ['San José', 'Limón', 'San Francisco', 'Alajuela', 'Heredia', 'Cartago']
  },
  {
    value: 'cuba',
    label: 'Cuba',
    flag: '🇨🇺',
    cities: ['Havana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Guantánamo', 'Santa Clara']
  },
  {
    value: 'dominica',
    label: 'Dominica',
    flag: '🇩🇲',
    cities: ['Roseau', 'Portsmouth', 'Marigot', 'Berekua', 'Saint Joseph']
  },
  {
    value: 'dominican-republic',
    label: 'Dominican Republic',
    flag: '🇩🇴',
    cities: ['Santo Domingo', 'Santiago', 'La Romana', 'San Pedro de Macorís', 'San Cristóbal']
  },
  {
    value: 'el-salvador',
    label: 'El Salvador',
    flag: '🇸🇻',
    cities: ['San Salvador', 'Soyapango', 'Santa Ana', 'San Miguel', 'Mejicanos']
  },
  {
    value: 'grenada',
    label: 'Grenada',
    flag: '🇬🇩',
    cities: ['St. George\'s', 'Gouyave', 'Grenville', 'Victoria', 'Saint David\'s']
  },
  {
    value: 'guatemala',
    label: 'Guatemala',
    flag: '🇬🇹',
    cities: ['Guatemala City', 'Mixco', 'Villa Nueva', 'Quetzaltenango', 'Escuintla']
  },
  {
    value: 'haiti',
    label: 'Haiti',
    flag: '🇭🇹',
    cities: ['Port-au-Prince', 'Cap-Haïtien', 'Gonaïves', 'Les Cayes', 'Port-de-Paix']
  },
  {
    value: 'honduras',
    label: 'Honduras',
    flag: '🇭🇳',
    cities: ['Tegucigalpa', 'San Pedro Sula', 'Choloma', 'La Ceiba', 'El Progreso']
  },
  {
    value: 'jamaica',
    label: 'Jamaica',
    flag: '🇯🇲',
    cities: ['Kingston', 'Spanish Town', 'Portmore', 'Montego Bay', 'May Pen', 'Mandeville']
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
  {
    value: 'nicaragua',
    label: 'Nicaragua',
    flag: '🇳🇮',
    cities: ['Managua', 'León', 'Masaya', 'Matagalpa', 'Chinandega', 'Granada']
  },
  {
    value: 'panama',
    label: 'Panama',
    flag: '🇵🇦',
    cities: ['Panama City', 'San Miguelito', 'Tocumen', 'David', 'Arraiján', 'Colón']
  },
  {
    value: 'st-kitts-nevis',
    label: 'Saint Kitts and Nevis',
    flag: '🇰🇳',
    cities: ['Basseterre', 'Charlestown', 'Dieppe Bay Town', 'Middle Island']
  },
  {
    value: 'st-lucia',
    label: 'Saint Lucia',
    flag: '🇱🇨',
    cities: ['Castries', 'Vieux Fort', 'Gros Islet', 'Soufrière', 'Micoud']
  },
  {
    value: 'st-vincent-grenadines',
    label: 'Saint Vincent and the Grenadines',
    flag: '🇻🇨',
    cities: ['Kingstown', 'Georgetown', 'Barrouallie', 'Port Elizabeth', 'Chateaubelair']
  },
  {
    value: 'trinidad-tobago',
    label: 'Trinidad and Tobago',
    flag: '🇹🇹',
    cities: ['Port of Spain', 'Chaguanas', 'San Fernando', 'Arima', 'Marabella']
  },
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

  // South America (12 countries)
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
    value: 'bolivia',
    label: 'Bolivia',
    flag: '🇧🇴',
    cities: ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Oruro', 'Tarija', 'Potosí']
  },
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
    value: 'chile',
    label: 'Chile',
    flag: '🇨🇱',
    cities: [
      'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta',
      'Temuco', 'Rancagua', 'Talca', 'Arica', 'Puerto Montt', 'Iquique'
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
    value: 'ecuador',
    label: 'Ecuador',
    flag: '🇪🇨',
    cities: ['Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala', 'Durán', 'Manta']
  },
  {
    value: 'guyana',
    label: 'Guyana',
    flag: '🇬🇾',
    cities: ['Georgetown', 'Linden', 'New Amsterdam', 'Anna Regina', 'Bartica']
  },
  {
    value: 'paraguay',
    label: 'Paraguay',
    flag: '🇵🇾',
    cities: ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiatá', 'Lambaré']
  },
  {
    value: 'peru',
    label: 'Peru',
    flag: '🇵🇪',
    cities: ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Cusco']
  },
  {
    value: 'suriname',
    label: 'Suriname',
    flag: '🇸🇷',
    cities: ['Paramaribo', 'Lelydorp', 'Nieuw Nickerie', 'Moengo', 'Nieuw Amsterdam']
  },
  {
    value: 'uruguay',
    label: 'Uruguay',
    flag: '🇺🇾',
    cities: ['Montevideo', 'Salto', 'Paysandú', 'Las Piedras', 'Rivera', 'Maldonado']
  },
  {
    value: 'venezuela',
    label: 'Venezuela',
    flag: '🇻🇪',
    cities: ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana']
  },

  // Oceania (14 countries)
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
    value: 'fiji',
    label: 'Fiji',
    flag: '🇫🇯',
    cities: ['Suva', 'Lautoka', 'Nadi', 'Labasa', 'Ba', 'Nasinu']
  },
  {
    value: 'kiribati',
    label: 'Kiribati',
    flag: '🇰🇮',
    cities: ['Tarawa', 'Betio', 'Bikenibeu', 'Teaoraereke']
  },
  {
    value: 'marshall-islands',
    label: 'Marshall Islands',
    flag: '🇲🇭',
    cities: ['Majuro', 'Kwajalein', 'Ebeye', 'Arno', 'Jaluit']
  },
  {
    value: 'micronesia',
    label: 'Micronesia',
    flag: '🇫🇲',
    cities: ['Palikir', 'Weno', 'Kolonia', 'Tofol', 'Colonia']
  },
  {
    value: 'nauru',
    label: 'Nauru',
    flag: '🇳🇷',
    cities: ['Yaren', 'Denigomodu', 'Aiwo', 'Anabar', 'Uaboe']
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
  {
    value: 'palau',
    label: 'Palau',
    flag: '🇵🇼',
    cities: ['Ngerulmud', 'Koror', 'Meyungs', 'Kloulklubed']
  },
  {
    value: 'papua-new-guinea',
    label: 'Papua New Guinea',
    flag: '🇵🇬',
    cities: ['Port Moresby', 'Lae', 'Arawa', 'Mount Hagen', 'Popondetta', 'Madang']
  },
  {
    value: 'samoa',
    label: 'Samoa',
    flag: '🇼🇸',
    cities: ['Apia', 'Vaitele', 'Faleula', 'Siusega', 'Malie']
  },
  {
    value: 'solomon-islands',
    label: 'Solomon Islands',
    flag: '🇸🇧',
    cities: ['Honiara', 'Auki', 'Gizo', 'Buala', 'Tulagi']
  },
  {
    value: 'tonga',
    label: 'Tonga',
    flag: '🇹🇴',
    cities: ['Nukuʻalofa', 'Neiafu', 'Haveluloto', 'Vaini', 'Pangai']
  },
  {
    value: 'tuvalu',
    label: 'Tuvalu',
    flag: '🇹🇻',
    cities: ['Funafuti', 'Vaitupu', 'Nanumea', 'Nui', 'Nukufetau']
  },
  {
    value: 'vanuatu',
    label: 'Vanuatu',
    flag: '🇻🇺',
    cities: ['Port Vila', 'Luganville', 'Isangel', 'Sola', 'Lakatoro']
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
    label: c.label  // Just show country name without flag emoji
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
