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
    value: 'afghanistan',
    label: 'Afghanistan',
    letter: 'A',
    regions: [
      { name: 'Kabul', cities: ['Kabul', 'Paghman', 'Chaharasyab', 'Mir Bacha Kot'] },
      { name: 'Balkh', cities: ['Mazar-i-Sharif', 'Balkh', 'Dehdadi', 'Dowlatabad'] },
      { name: 'Kandahar', cities: ['Kandahar', 'Spin Boldak', 'Maywand', 'Arghandab'] },
      { name: 'Herat', cities: ['Herat', 'Guzara', 'Injil', 'Pashtun Zarghun'] },
      { name: 'Nangarhar', cities: ['Jalalabad', 'Behsud', 'Surkhrod', 'Kama'] },
      { name: 'Kunduz', cities: ['Kunduz', 'Imam Sahib', 'Khan Abad', 'Char Dara'] },
    ]
  },
  { value: 'albania', label: 'Albania', letter: 'A', regions: [{ name: 'Central', cities: ['Tirana', 'Durrës', 'Vlorë', 'Shkodër', 'Fier'] }] },
  {
    value: 'algeria',
    label: 'Algeria',
    letter: 'A',
    regions: [
      { name: 'Algiers', cities: ['Algiers', 'Bab El Oued', 'Birtouta', 'Dar El Beïda', 'Draria'] },
      { name: 'Oran', cities: ['Oran', 'Bir El Djir', 'Es Senia', 'Arzew', 'Bethioua'] },
      { name: 'Constantine', cities: ['Constantine', 'El Khroub', 'Hamma Bouziane', 'Didouche Mourad'] },
    ]
  },
  { value: 'andorra', label: 'Andorra', letter: 'A', regions: [{ name: 'Central', cities: ['Andorra la Vella', 'Escaldes-Engordany', 'Encamp', 'La Massana'] }] },
  {
    value: 'angola',
    label: 'Angola',
    letter: 'A',
    regions: [
      { name: 'Luanda', cities: ['Luanda', 'Viana', 'Cacuaco', 'Belas', 'Cazenga'] },
      { name: 'Huambo', cities: ['Huambo', 'Longonjo', 'Caicúnda', 'Mungo'] },
      { name: 'Benguela', cities: ['Benguela', 'Lobito', 'Catumbela', 'Ganda', 'Balombo'] },
      { name: 'Huíla', cities: ['Lubango', 'Chibia', 'Quilengues', 'Chicomba'] },
      { name: 'Bie', cities: ['Kuito', 'Andulo', 'Camacupa', 'Catabola'] },
    ]
  },
  { value: 'antigua-barbuda', label: 'Antigua and Barbuda', letter: 'A', regions: [{ name: 'Central', cities: ['St. John\'s', 'All Saints', 'Liberta', 'Potters Village'] }] },
  {
    value: 'argentina',
    label: 'Argentina',
    letter: 'A',
    regions: [
      { name: 'Buenos Aires', cities: ['Buenos Aires', 'La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil'] },
      { name: 'Córdoba', cities: ['Córdoba', 'Villa María', 'Río Cuarto', 'Carlos Paz', 'Alta Gracia'] },
      { name: 'Santa Fe', cities: ['Rosario', 'Santa Fe', 'Rafaela', 'Reconquista', 'Venado Tuerto'] },
      { name: 'Mendoza', cities: ['Mendoza', 'San Rafael', 'Godoy Cruz', 'Luján de Cuyo', 'Maipú'] },
    ]
  },
  { value: 'armenia', label: 'Armenia', letter: 'A', regions: [{ name: 'Central', cities: ['Yerevan', 'Gyumri', 'Vanadzor', 'Vagharshapat', 'Hrazdan'] }] },
  {
    value: 'australia',
    label: 'Australia',
    letter: 'A',
    regions: [
      { name: 'New South Wales', cities: ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Maitland', 'Wagga Wagga', 'Albury', 'Port Macquarie', 'Tamworth', 'Orange', 'Dubbo', 'Bathurst', 'Lismore', 'Nowra'] },
      { name: 'Victoria', cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton', 'Mildura', 'Wodonga', 'Warrnambool', 'Traralgon', 'Frankston', 'Dandenong', 'Sunbury'] },
      { name: 'Queensland', cities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns', 'Toowoomba', 'Mackay', 'Rockhampton', 'Bundaberg', 'Hervey Bay', 'Gladstone', 'Maryborough'] },
      { name: 'Western Australia', cities: ['Perth', 'Mandurah', 'Bunbury', 'Albany', 'Kalgoorlie', 'Geraldton', 'Broome', 'Busselton', 'Rockingham', 'Joondalup', 'Fremantle'] },
      { name: 'South Australia', cities: ['Adelaide', 'Mount Gambier', 'Whyalla', 'Murray Bridge', 'Port Augusta', 'Port Lincoln', 'Victor Harbor', 'Gawler', 'Port Pirie'] },
      { name: 'Tasmania', cities: ['Hobart', 'Launceston', 'Devonport', 'Burnie', 'Kingston', 'Ulverstone', 'Glenorchy', 'Clarence'] },
      { name: 'Australian Capital Territory', cities: ['Canberra', 'Belconnen', 'Woden Valley', 'Tuggeranong', 'Gungahlin', 'Weston Creek'] },
      { name: 'Northern Territory', cities: ['Darwin', 'Palmerston', 'Alice Springs', 'Katherine', 'Nhulunbuy', 'Tennant Creek'] },
    ]
  },
  {
    value: 'austria',
    label: 'Austria',
    letter: 'A',
    regions: [
      { name: 'Vienna', cities: ['Vienna', 'Favoriten', 'Donaustadt', 'Floridsdorf', 'Döbling'] },
      { name: 'Styria', cities: ['Graz', 'Leoben', 'Kapfenberg', 'Bruck an der Mur'] },
      { name: 'Upper Austria', cities: ['Linz', 'Wels', 'Steyr', 'Leonding'] },
      { name: 'Salzburg', cities: ['Salzburg', 'Hallein', 'Saalfelden', 'St. Johann'] },
      { name: 'Tyrol', cities: ['Innsbruck', 'Kufstein', 'Schwaz', 'Hall in Tirol'] },
    ]
  },
  { value: 'azerbaijan', label: 'Azerbaijan', letter: 'A', regions: [{ name: 'Central', cities: ['Baku', 'Ganja', 'Sumqayit', 'Mingachevir', 'Lankaran'] }] },

  // B
  { value: 'bahamas', label: 'Bahamas', letter: 'B', regions: [{ name: 'Central', cities: ['Nassau', 'Freeport', 'West End', 'Cooper\'s Town', 'Marsh Harbour'] }] },
  { value: 'bahrain', label: 'Bahrain', letter: 'B', regions: [{ name: 'Central', cities: ['Manama', 'Muharraq', 'Riffa', 'Hamad Town', 'A\'ali'] }] },
  {
    value: 'bangladesh',
    label: 'Bangladesh',
    letter: 'B',
    regions: [
      { name: 'Dhaka Division', cities: ['Dhaka', 'Narayanganj', 'Gazipur', 'Tangail', 'Munshiganj', 'Manikganj'] },
      { name: 'Chittagong Division', cities: ['Chittagong', 'Cox\'s Bazar', 'Comilla', 'Brahmanbaria', 'Feni'] },
      { name: 'Khulna Division', cities: ['Khulna', 'Jessore', 'Bagerhat', 'Satkhira', 'Kushtia'] },
      { name: 'Rajshahi Division', cities: ['Rajshahi', 'Bogra', 'Pabna', 'Sirajganj', 'Natore'] },
      { name: 'Sylhet Division', cities: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'] },
      { name: 'Rangpur Division', cities: ['Rangpur', 'Dinajpur', 'Thakurgaon', 'Kurigram'] },
    ]
  },
  { value: 'barbados', label: 'Barbados', letter: 'B', regions: [{ name: 'Central', cities: ['Bridgetown', 'Speightstown', 'Oistins', 'Bathsheba', 'Holetown'] }] },
  {
    value: 'belarus',
    label: 'Belarus',
    letter: 'B',
    regions: [
      { name: 'Minsk', cities: ['Minsk', 'Borisov', 'Soligorsk', 'Molodechno', 'Dzerzhinsk', 'Slutsk'] },
      { name: 'Gomel', cities: ['Gomel', 'Mozyr', 'Zhlobin', 'Svetlogorsk', 'Rechitsa'] },
      { name: 'Mogilev', cities: ['Mogilev', 'Bobruisk', 'Orsha', 'Krichev', 'Gorki'] },
      { name: 'Vitebsk', cities: ['Vitebsk', 'Orsha', 'Novopolotsk', 'Polotsk', 'Glubokoe'] },
      { name: 'Grodno', cities: ['Grodno', 'Lida', 'Volkovysk', 'Slonim', 'Smorgon'] },
      { name: 'Brest', cities: ['Brest', 'Baranovichi', 'Pinsk', 'Kobrin', 'Luninets'] },
    ]
  },
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
  { value: 'belize', label: 'Belize', letter: 'B', regions: [{ name: 'Central', cities: ['Belize City', 'San Ignacio', 'Belmopan', 'Orange Walk', 'Dangriga'] }] },
  { value: 'benin', label: 'Benin', letter: 'B', regions: [{ name: 'Central', cities: ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Abomey'] }] },
  { value: 'bhutan', label: 'Bhutan', letter: 'B', regions: [{ name: 'Central', cities: ['Thimphu', 'Phuntsholing', 'Paro', 'Punakha', 'Wangdue'] }] },
  {
    value: 'bolivia',
    label: 'Bolivia',
    letter: 'B',
    regions: [
      { name: 'La Paz', cities: ['La Paz', 'El Alto', 'Viacha', 'Achocalla', 'Laja'] },
      { name: 'Santa Cruz', cities: ['Santa Cruz de la Sierra', 'Montero', 'Warnes', 'La Guardia', 'Cotaóka'] },
      { name: 'Cochabamba', cities: ['Cochabamba', 'Sacaba', 'Quillacollo', 'Colcapirhua', 'Tiquipaya'] },
      { name: 'Chuquisaca', cities: ['Sucre', 'Yotala', 'Poroma', 'Tarabuco'] },
      { name: 'Oruro', cities: ['Oruro', 'Huanuni', 'Challapata', 'Machacamarca'] },
      { name: 'Tarija', cities: ['Tarija', 'Yacuiba', 'Villamontes', 'Bermejo'] },
    ]
  },
  { value: 'bosnia', label: 'Bosnia and Herzegovina', letter: 'B', regions: [{ name: 'Central', cities: ['Sarajevo', 'Banja Luka', 'Tuzla', 'Zenica', 'Mostar'] }] },
  { value: 'botswana', label: 'Botswana', letter: 'B', regions: [{ name: 'Central', cities: ['Gaborone', 'Francistown', 'Molepolole', 'Maun', 'Selebi-Phikwe'] }] },
  {
    value: 'brazil',
    label: 'Brazil',
    letter: 'B',
    regions: [
      { name: 'São Paulo', cities: ['São Paulo', 'Campinas', 'Santos', 'São Bernardo do Campo', 'Santo André', 'Sorocaba', 'Ribeirão Preto', 'Osasco', 'São José dos Campos', 'Guarulhos', 'Mauá', 'Diadema'] },
      { name: 'Rio de Janeiro', cities: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu', 'São Gonçalo', 'Belford Roxo', 'São João de Meriti', 'Campos dos Goytacazes', 'Petrópolis', 'Volta Redonda'] },
      { name: 'Minas Gerais', cities: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga'] },
      { name: 'Bahia', cities: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna', 'Juazeiro', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas'] },
      { name: 'Paraná', cities: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá'] },
      { name: 'Rio Grande do Sul', cities: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Alvorada'] },
      { name: 'Pernambuco', cities: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns'] },
      { name: 'Ceará', cities: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu'] },
      { name: 'Pará', cities: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Castanhal', 'Parauapebas', 'Itaituba', 'Cametá', 'Bragança'] },
      { name: 'Federal District', cities: ['Brasília', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Planaltina', 'Águas Claras', 'Gama', 'Sobradinho'] },
    ]
  },
  { value: 'brunei', label: 'Brunei', letter: 'B', regions: [{ name: 'Central', cities: ['Bandar Seri Begawan', 'Kuala Belait', 'Seria', 'Tutong', 'Bangar'] }] },
  {
    value: 'bulgaria',
    label: 'Bulgaria',
    letter: 'B',
    regions: [
      { name: 'Sofia City', cities: ['Sofia', 'Bankya', 'Novi Iskar'] },
      { name: 'Plovdiv', cities: ['Plovdiv', 'Asenovgrad', 'Karlovo', 'Pârvomay'] },
      { name: 'Varna', cities: ['Varna', 'Devnya', 'Aksakovo', 'Beloslav'] },
      { name: 'Burgas', cities: ['Burgas', 'Nessebar', 'Pomorie', 'Sozopol', 'Aytos'] },
      { name: 'Ruse', cities: ['Ruse', 'Razgrad', 'Silistra', 'Byala'] },
      { name: 'Stara Zagora', cities: ['Stara Zagora', 'Kazanlak', 'Nova Zagora', 'Chirpan'] },
    ]
  },
  { value: 'burkina-faso', label: 'Burkina Faso', letter: 'B', regions: [{ name: 'Central', cities: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora'] }] },
  { value: 'burundi', label: 'Burundi', letter: 'B', regions: [{ name: 'Central', cities: ['Gitega', 'Bujumbura', 'Muyinga', 'Ruyigi', 'Ngozi'] }] },

  // C
  {
    value: 'cambodia',
    label: 'Cambodia',
    letter: 'C',
    regions: [
      { name: 'Phnom Penh', cities: ['Phnom Penh', 'Chbar Ampov', 'Dangkao', 'Mean Chey', 'Russey Keo'] },
      { name: 'Siem Reap', cities: ['Siem Reap', 'Angkor Thom', 'Prasat Bakong', 'Puok'] },
      { name: 'Battambang', cities: ['Battambang', 'Pailin', 'Samlout', 'Mongkol Borei'] },
      { name: 'Preah Sihanouk', cities: ['Sihanoukville', 'Koh Kong', 'Kampot', 'Kep'] },
      { name: 'Kampong Cham', cities: ['Kampong Cham', 'Suong', 'Prey Chhor', 'Dambae'] },
    ]
  },
  {
    value: 'cameroon',
    label: 'Cameroon',
    letter: 'C',
    regions: [
      { name: 'Centre', cities: ['Yaoundé', 'Mbalmayo', 'Akonolinga', 'Bafia'] },
      { name: 'Littoral', cities: ['Douala', 'Edea', 'Nkongsamba', 'Mbanga'] },
      { name: 'North', cities: ['Garoua', 'Maroua', 'Ngaoundéré', 'Guider'] },
      { name: 'West', cities: ['Bafoussam', 'Dschang', 'Mbouda', 'Bafang'] },
      { name: 'North-West', cities: ['Bamenda', 'Kumbo', 'Wum', 'Ndop'] },
      { name: 'South-West', cities: ['Buea', 'Limbe', 'Kumba', 'Tiko'] },
    ]
  },
  {
    value: 'canada',
    label: 'Canada',
    letter: 'C',
    regions: [
      { name: 'Ontario', cities: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Markham', 'Vaughan', 'Kitchener', 'Windsor', 'Richmond Hill', 'Oakville', 'Burlington', 'Oshawa', 'Barrie', 'Guelph', 'Cambridge', 'Whitby'] },
      { name: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke', 'Saguenay', 'Lévis', 'Trois-Rivières', 'Terrebonne', 'Saint-Jean-sur-Richelieu', 'Brossard', 'Drummondville', 'Saint-Jérôme'] },
      { name: 'British Columbia', cities: ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Abbotsford', 'Coquitlam', 'Kelowna', 'Victoria', 'Saanich', 'Delta', 'Langley', 'Kamloops', 'Nanaimo', 'Prince George'] },
      { name: 'Alberta', cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert', 'Medicine Hat', 'Grande Prairie', 'Airdrie', 'Spruce Grove', 'Okotoks', 'Fort McMurray'] },
      { name: 'Manitoba', cities: ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie', 'Winkler', 'Selkirk', 'Morden'] },
      { name: 'Saskatchewan', cities: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current', 'Yorkton', 'North Battleford', 'Estevan'] },
      { name: 'Nova Scotia', cities: ['Halifax', 'Cape Breton', 'Dartmouth', 'Truro', 'New Glasgow', 'Glace Bay', 'Sydney', 'Amherst'] },
      { name: 'New Brunswick', cities: ['Moncton', 'Saint John', 'Fredericton', 'Dieppe', 'Bathurst', 'Miramichi', 'Edmundston', 'Campbellton'] },
    ]
  },
  { value: 'cape-verde', label: 'Cape Verde', letter: 'C', regions: [{ name: 'Central', cities: ['Praia', 'Mindelo', 'Santa Maria', 'Assomada', 'Porto Novo'] }] },
  { value: 'central-african-republic', label: 'Central African Republic', letter: 'C', regions: [{ name: 'Central', cities: ['Bangui', 'Bimbo', 'Berbérati', 'Carnot', 'Bambari'] }] },
  { value: 'chad', label: 'Chad', letter: 'C', regions: [{ name: 'Central', cities: ['N\'Djamena', 'Moundou', 'Sarh', 'Abéché', 'Kelo'] }] },
  {
    value: 'chile',
    label: 'Chile',
    letter: 'C',
    regions: [
      { name: 'Santiago Metropolitan', cities: ['Santiago', 'Puente Alto', 'Maipú', 'La Florida', 'Las Condes', 'San Bernardo', 'Ñuñoa'] },
      { name: 'Valparaíso', cities: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'San Antonio'] },
      { name: 'Biobío', cities: ['Concepción', 'Talcahuano', 'Los Ángeles', 'Chillán', 'Coronel'] },
      { name: 'Coquimbo', cities: ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel'] },
      { name: 'Antofagasta', cities: ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones'] },
      { name: 'Araucanía', cities: ['Temuco', 'Villarrica', 'Pucón', 'Angol'] },
    ]
  },
  {
    value: 'china',
    label: 'China',
    letter: 'C',
    regions: [
      { name: 'Beijing', cities: ['Beijing', 'Haidian', 'Chaoyang', 'Dongcheng', 'Xicheng', 'Fengtai', 'Shijingshan', 'Tongzhou', 'Changping', 'Daxing'] },
      { name: 'Shanghai', cities: ['Shanghai', 'Pudong', 'Minhang', 'Baoshan', 'Jiading', 'Yangpu', 'Hongkou', 'Putuo', 'Jingan', 'Xuhui', 'Changning'] },
      { name: 'Guangdong', cities: ['Guangzhou', 'Shenzhen', 'Dongguan', 'Foshan', 'Zhongshan', 'Zhuhai', 'Huizhou', 'Jiangmen', 'Shantou', 'Zhaoqing', 'Shaoguan'] },
      { name: 'Zhejiang', cities: ['Hangzhou', 'Ningbo', 'Wenzhou', 'Jinhua', 'Shaoxing', 'Taizhou', 'Jiaxing', 'Huzhou', 'Quzhou', 'Lishui'] },
      { name: 'Jiangsu', cities: ['Nanjing', 'Suzhou', 'Wuxi', 'Changzhou', 'Nantong', 'Xuzhou', 'Yangzhou', 'Zhenjiang', 'Yancheng', 'Huaian'] },
      { name: 'Sichuan', cities: ['Chengdu', 'Mianyang', 'Deyang', 'Nanchong', 'Yibin', 'Luzhou', 'Leshan', 'Neijiang', 'Zigong'] },
      { name: 'Shandong', cities: ['Qingdao', 'Jinan', 'Yantai', 'Weifang', 'Zibo', 'Weihai', 'Linyi', 'Jining', 'Tai\'an', 'Dongying'] },
      { name: 'Henan', cities: ['Zhengzhou', 'Luoyang', 'Kaifeng', 'Xinxiang', 'Anyang', 'Nanyang', 'Pingdingshan', 'Shangqiu', 'Xuchang'] },
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
  { value: 'comoros', label: 'Comoros', letter: 'C', regions: [{ name: 'Central', cities: ['Moroni', 'Mutsamudu', 'Fomboni', 'Domoni', 'Mitsamiouli'] }] },
  { value: 'congo-brazzaville', label: 'Congo (Brazzaville)', letter: 'C', regions: [{ name: 'Central', cities: ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Ouesso'] }] },
  { value: 'congo-kinshasa', label: 'Congo (Kinshasa)', letter: 'C', regions: [{ name: 'Kinshasa', cities: ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani'] }] },
  { value: 'costa-rica', label: 'Costa Rica', letter: 'C', regions: [{ name: 'San José', cities: ['San José', 'Limón', 'Alajuela', 'Heredia', 'Cartago', 'Puntarenas'] }] },
  {
    value: 'croatia',
    label: 'Croatia',
    letter: 'C',
    regions: [
      { name: 'Zagreb', cities: ['Zagreb', 'Sesvete', 'Velika Gorica', 'Samobor', 'Zaprešić'] },
      { name: 'Split-Dalmatia', cities: ['Split', 'Kaštela', 'Solin', 'Sinj', 'Omiš'] },
      { name: 'Primorje-Gorski Kotar', cities: ['Rijeka', 'Opatija', 'Crikvenica', 'Kastav', 'Krk'] },
      { name: 'Osijek-Baranja', cities: ['Osijek', 'Đakovo', 'Valpovo', 'Beli Manastir', 'Donji Miholjac'] },
      { name: 'Zadar', cities: ['Zadar', 'Biograd na Moru', 'Benkovac', 'Nin'] },
      { name: 'Istria', cities: ['Pula', 'Rovinj', 'Poreč', 'Umag', 'Labin'] },
    ]
  },
  { value: 'cuba', label: 'Cuba', letter: 'C', regions: [{ name: 'Havana', cities: ['Havana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Santa Clara'] }] },
  { value: 'cyprus', label: 'Cyprus', letter: 'C', regions: [{ name: 'Central', cities: ['Nicosia', 'Limassol', 'Larnaca', 'Paphos', 'Famagusta'] }] },
  {
    value: 'czech-republic',
    label: 'Czech Republic',
    letter: 'C',
    regions: [
      { name: 'Prague', cities: ['Prague', 'Prague 1', 'Prague 2', 'Prague 3', 'Prague 4', 'Prague 5'] },
      { name: 'South Moravian', cities: ['Brno', 'Brno-Střed', 'Brno-sever', 'Brno-jih', 'Znojmo'] },
      { name: 'Moravian-Silesian', cities: ['Ostrava', 'Karviná', 'Havířov', 'Opava', 'Frýdek-Místek'] },
      { name: 'Plzeň', cities: ['Plzeň', 'Klatovy', 'Domaažlice', 'Rokycany'] },
      { name: 'Liberec', cities: ['Liberec', 'Jablonec nad Nisou', 'Česká Lípa', 'Semily'] },
      { name: 'Olomouc', cities: ['Olomouc', 'Prostějov', 'Přerov', 'Šumperk'] },
    ]
  },

  // D
  {
    value: 'denmark',
    label: 'Denmark',
    letter: 'D',
    regions: [
      { name: 'Capital Region', cities: ['Copenhagen', 'Frederiksberg', 'Gentofte', 'Gladsaxe', 'Hvidovre'] },
      { name: 'Central Denmark', cities: ['Aarhus', 'Randers', 'Horsens', 'Viborg', 'Silkeborg'] },
      { name: 'Southern Denmark', cities: ['Odense', 'Esbjerg', 'Kolding', 'Vejle', 'Sønderborg'] },
      { name: 'North Denmark', cities: ['Aalborg', 'Frederikshavn', 'Hjørring', 'Brønderslev'] },
    ]
  },
  { value: 'djibouti', label: 'Djibouti', letter: 'D', regions: [{ name: 'Central', cities: ['Djibouti City', 'Ali Sabieh', 'Tadjoura', 'Obock', 'Dikhil'] }] },
  { value: 'dominica', label: 'Dominica', letter: 'D', regions: [{ name: 'Central', cities: ['Roseau', 'Portsmouth', 'Marigot', 'Berekua', 'Mahaut'] }] },
  {
    value: 'dominican-republic',
    label: 'Dominican Republic',
    letter: 'D',
    regions: [
      { name: 'Distrito Nacional', cities: ['Santo Domingo', 'Santo Domingo Este', 'Santo Domingo Oeste', 'Santo Domingo Norte'] },
      { name: 'Santiago', cities: ['Santiago de los Caballeros', 'Villa González', 'Tamboril', 'Licey al Medio'] },
      { name: 'La Romana', cities: ['La Romana', 'Villa Hermosa', 'Guaymate'] },
      { name: 'San Pedro de Macorís', cities: ['San Pedro de Macorís', 'Los Llanos', 'Ramón Santana'] },
      { name: 'Puerto Plata', cities: ['Puerto Plata', 'Sosúa', 'Cabarete', 'Luperón'] },
      { name: 'La Vega', cities: ['La Vega', 'Constanza', 'Jarabacoa', 'Moca'] },
    ]
  },

  // E
  {
    value: 'ecuador',
    label: 'Ecuador',
    letter: 'E',
    regions: [
      { name: 'Pichincha', cities: ['Quito', 'Cayambe', 'Mejía', 'Rumiahui', 'San Miguel de los Bancos'] },
      { name: 'Guayas', cities: ['Guayaquil', 'Durán', 'Milagro', 'Daule', 'Samborondón'] },
      { name: 'Azuay', cities: ['Cuenca', 'Gualaceo', 'Paúte', 'Sig Sig', 'Girón'] },
      { name: 'Manabí', cities: ['Manta', 'Portoviejo', 'Montecristi', 'Jaramijó', 'Chone'] },
      { name: 'Santo Domingo', cities: ['Santo Domingo', 'La Concordia', 'Valle Hermoso'] },
      { name: 'El Oro', cities: ['Machala', 'Huaquillas', 'Santa Rosa', 'El Guabo', 'Arenillas'] },
    ]
  },
  {
    value: 'egypt',
    label: 'Egypt',
    letter: 'E',
    regions: [
      { name: 'Cairo', cities: ['Cairo', 'Giza', 'Qalyub', '6th of October City', 'Helwan'] },
      { name: 'Alexandria', cities: ['Alexandria', 'Borg El Arab', 'Abu Qir', 'Montaza'] },
      { name: 'Giza', cities: ['Giza', '6th of October', 'Sheikh Zayed', 'Dokki', 'Agouza'] },
    ]
  },
  { value: 'el-salvador', label: 'El Salvador', letter: 'E', regions: [{ name: 'San Salvador', cities: ['San Salvador', 'Santa Ana', 'San Miguel', 'Mejicanos', 'Soyapango'] }] },
  { value: 'equatorial-guinea', label: 'Equatorial Guinea', letter: 'E', regions: [{ name: 'Central', cities: ['Malabo', 'Bata', 'Ebebiyin', 'Aconibe', 'Añisoc'] }] },
  { value: 'eritrea', label: 'Eritrea', letter: 'E', regions: [{ name: 'Central', cities: ['Asmara', 'Keren', 'Massawa', 'Assab', 'Mendefera'] }] },
  { value: 'estonia', label: 'Estonia', letter: 'E', regions: [{ name: 'Harju', cities: ['Tallinn', 'Tartu', 'Narva', 'Pärnu', 'Kohtla-Järve'] }] },
  { value: 'eswatini', label: 'Eswatini', letter: 'E', regions: [{ name: 'Central', cities: ['Mbabane', 'Manzini', 'Big Bend', 'Malkerns', 'Nhlangano'] }] },
  {
    value: 'ethiopia',
    label: 'Ethiopia',
    letter: 'E',
    regions: [
      { name: 'Addis Ababa', cities: ['Addis Ababa', 'Bole', 'Arada', 'Kirkos', 'Yeka', 'Nifas Silk-Lafto'] },
      { name: 'Oromia', cities: ['Adama', 'Jimma', 'Bishoftu', 'Shashamane', 'Ambo'] },
      { name: 'Amhara', cities: ['Bahir Dar', 'Gondar', 'Dessie', 'Debre Birhan'] },
      { name: 'Tigray', cities: ['Mekelle', 'Adigrat', 'Axum', 'Shire'] },
      { name: 'Dire Dawa', cities: ['Dire Dawa', 'Kezira', 'Goro'] },
    ]
  },

  // F
  { value: 'fiji', label: 'Fiji', letter: 'F', regions: [{ name: 'Central', cities: ['Suva', 'Lautoka', 'Nadi', 'Labasa', 'Ba'] }] },
  {
    value: 'finland',
    label: 'Finland',
    letter: 'F',
    regions: [
      { name: 'Uusimaa', cities: ['Helsinki', 'Espoo', 'Vantaa', 'Kauniainen', 'Kerava', 'Järvenpää'] },
      { name: 'Pirkanmaa', cities: ['Tampere', 'Nokia', 'Lempäälä', 'Yljärvi', 'Kangasala'] },
      { name: 'Varsinais-Suomi', cities: ['Turku', 'Salo', 'Raisio', 'Kaarina', 'Naantali'] },
      { name: 'North Ostrobothnia', cities: ['Oulu', 'Raahe', 'Ylivieska', 'Oulainen'] },
      { name: 'Päijät-Häme', cities: ['Lahti', 'Heinola', 'Hollola', 'Asikkala'] },
    ]
  },
  {
    value: 'france',
    label: 'France',
    letter: 'F',
    regions: [
      { name: 'Île-de-France', cities: ['Paris', 'Versailles', 'Boulogne-Billancourt', 'Nanterre', 'Argenteuil', 'Montreuil', 'Saint-Denis', 'Créteil', 'Aulnay-sous-Bois', 'Vitry-sur-Seine', 'Colombes', 'Asnières-sur-Seine'] },
      { name: 'Auvergne-Rhône-Alpes', cities: ['Lyon', 'Grenoble', 'Saint-Étienne', 'Villeurbanne', 'Annecy', 'Chambéry', 'Clermont-Ferrand', 'Valence', 'Vénissieux', 'Caluire-et-Cuire', 'Annemasse', 'Bourg-en-Bresse'] },
      { name: 'Provence-Alpes-Côte d\'Azur', cities: ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Cannes', 'Antibes', 'Avignon', 'Hyères', 'Fréjus', 'Arles', 'Grasse', 'La Seyne-sur-Mer', 'Gap', 'Menton'] },
      { name: 'Occitanie', cities: ['Toulouse', 'Montpellier', 'Nîmes', 'Perpignan', 'Béziers', 'Carcassonne', 'Narbonne', 'Albi', 'Tarbes', 'Sète', 'Rodez', 'Castres', 'Auch', 'Cahors'] },
      { name: 'Nouvelle-Aquitaine', cities: ['Bordeaux', 'Limoges', 'Poitiers', 'La Rochelle', 'Pau', 'Bayonne', 'Mérignac', 'Pessac', 'Angoulême', 'Brive-la-Gaillarde', 'Niort', 'Agen', 'Périgueux', 'Mont-de-Marsan'] },
      { name: 'Grand Est', cities: ['Strasbourg', 'Reims', 'Metz', 'Mulhouse', 'Nancy', 'Colmar', 'Troyes', 'Charleville-Mézières', 'Épinal', 'Thionville', 'Châlons-en-Champagne', 'Haguenau', 'Verdun'] },
      { name: 'Hauts-de-France', cities: ['Lille', 'Amiens', 'Roubaix', 'Tourcoing', 'Calais', 'Dunkirk', 'Villeneuve-d\'Ascq', 'Beauvais', 'Valenciennes', 'Lens', 'Boulogne-sur-Mer', 'Douai', 'Arras', 'Compiègne'] },
      { name: 'Pays de la Loire', cities: ['Nantes', 'Angers', 'Le Mans', 'Saint-Nazaire', 'Laval', 'Cholet', 'La Roche-sur-Yon', 'Saint-Herblain', 'Rezé', 'Saint-Sébastien-sur-Loire'] },
      { name: 'Bretagne', cities: ['Rennes', 'Brest', 'Quimper', 'Lorient', 'Vannes', 'Saint-Malo', 'Saint-Brieuc', 'Lanester', 'Fougères', 'Lannion', 'Concarneau', 'Vitré'] },
      { name: 'Normandie', cities: ['Le Havre', 'Rouen', 'Caen', 'Cherbourg', 'Évreux', 'Dieppe', 'Sotteville-lès-Rouen', 'Saint-Étienne-du-Rouvray', 'Le Grand-Quevilly', 'Alençon', 'Lisieux'] },
      { name: 'Bourgogne-Franche-Comté', cities: ['Dijon', 'Besançon', 'Belfort', 'Chalon-sur-Saône', 'Nevers', 'Auxerre', 'Mâcon', 'Dole', 'Montbéliard', 'Sens'] },
      { name: 'Centre-Val de Loire', cities: ['Orléans', 'Tours', 'Bourges', 'Blois', 'Chartres', 'Châteauroux', 'Joué-lès-Tours', 'Olivet', 'Dreux', 'Vierzon'] },
      { name: 'Corse', cities: ['Ajaccio', 'Bastia', 'Porto-Vecchio', 'Corte', 'Bonifacio', 'Calvi', 'Propriano', 'Sartène'] },
    ]
  },

  // G
  { value: 'gabon', label: 'Gabon', letter: 'G', regions: [{ name: 'Central', cities: ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda'] }] },
  { value: 'gambia', label: 'Gambia', letter: 'G', regions: [{ name: 'Central', cities: ['Banjul', 'Serekunda', 'Brikama', 'Bakau', 'Farafenni'] }] },
  { value: 'georgia', label: 'Georgia', letter: 'G', regions: [{ name: 'Tbilisi', cities: ['Tbilisi', 'Kutaisi', 'Batumi', 'Rustavi', 'Zugdidi'] }] },
  {
    value: 'germany',
    label: 'Germany',
    letter: 'G',
    regions: [
      { name: 'Berlin', cities: ['Berlin', 'Charlottenburg', 'Mitte', 'Kreuzberg', 'Prenzlauer Berg', 'Neukölln', 'Friedrichshain', 'Spandau', 'Tempelhof'] },
      { name: 'Bavaria', cities: ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg', 'Ingolstadt', 'Würzburg', 'Fürth', 'Erlangen', 'Bamberg', 'Bayreuth', 'Landshut', 'Passau'] },
      { name: 'North Rhine-Westphalia', cities: ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Mönchengladbach', 'Gelsenkirchen', 'Aachen', 'Krefeld'] },
      { name: 'Baden-Württemberg', cities: ['Stuttgart', 'Mannheim', 'Karlsruhe', 'Freiburg', 'Heidelberg', 'Ulm', 'Heilbronn', 'Pforzheim', 'Reutlingen', 'Esslingen', 'Ludwigsburg', 'Tübingen'] },
      { name: 'Hesse', cities: ['Frankfurt', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach', 'Hanau', 'Gießen', 'Marburg', 'Fulda', 'Rüsselsheim'] },
      { name: 'Saxony', cities: ['Leipzig', 'Dresden', 'Chemnitz', 'Zwickau', 'Plauen', 'Görlitz', 'Freiberg', 'Bautzen', 'Meißen'] },
      { name: 'Lower Saxony', cities: ['Hanover', 'Brunswick', 'Oldenburg', 'Osnabrück', 'Wolfsburg', 'Göttingen', 'Salzgitter', 'Hildesheim'] },
      { name: 'Rhineland-Palatinate', cities: ['Mainz', 'Ludwigshafen', 'Koblenz', 'Trier', 'Kaiserslautern', 'Worms', 'Neuwied', 'Speyer'] },
      { name: 'Hamburg', cities: ['Hamburg', 'Altona', 'Eimsbüttel', 'Wandsbek', 'Harburg'] },
    ]
  },
  {
    value: 'ghana',
    label: 'Ghana',
    letter: 'G',
    regions: [
      { name: 'Greater Accra', cities: ['Accra', 'Tema', 'Madina', 'Teshie', 'Nungua', 'Labadi'] },
      { name: 'Ashanti', cities: ['Kumasi', 'Obuasi', 'Mampong', 'Ejisu', 'Bekwai'] },
      { name: 'Northern', cities: ['Tamale', 'Yendi', 'Savelugu', 'Bimbilla'] },
      { name: 'Western', cities: ['Takoradi', 'Sekondi', 'Tarkwa', 'Prestea'] },
      { name: 'Central', cities: ['Cape Coast', 'Winneba', 'Kasoa', 'Swedru'] },
    ]
  },
  {
    value: 'greece',
    label: 'Greece',
    letter: 'G',
    regions: [
      { name: 'Attica', cities: ['Athens', 'Piraeus', 'Kallithea', 'Peristeri', 'Nikaia', 'Glyfada'] },
      { name: 'Central Macedonia', cities: ['Thessaloniki', 'Katerini', 'Veria', 'Serres', 'Kilkis'] },
      { name: 'Western Greece', cities: ['Patras', 'Agrinio', 'Messolonghi', 'Pyrgos'] },
      { name: 'Crete', cities: ['Heraklion', 'Chania', 'Rethymno', 'Agios Nikolaos', 'Ierapetra'] },
      { name: 'Thessaly', cities: ['Larissa', 'Volos', 'Trikala', 'Karditsa'] },
    ]
  },
  { value: 'grenada', label: 'Grenada', letter: 'G', regions: [{ name: 'Central', cities: ['St. George\'s', 'Gouyave', 'Grenville', 'Victoria', 'Sauteurs'] }] },
  {
    value: 'guatemala',
    label: 'Guatemala',
    letter: 'G',
    regions: [
      { name: 'Guatemala Department', cities: ['Guatemala City', 'Mixco', 'Villa Nueva', 'San Miguel Petapa', 'Amatitlán'] },
      { name: 'Quetzaltenango', cities: ['Quetzaltenango', 'Salcajá', 'San Martín Sacatepéquez', 'Olintepeque'] },
      { name: 'Escuintla', cities: ['Escuintla', 'Santa Lucía Cotzumalguapa', 'Tiquisate', 'La Democracia'] },
      { name: 'Alta Verapaz', cities: ['Cobán', 'San Pedro Carchá', 'San Cristóbal Verapaz'] },
      { name: 'Huehuetenango', cities: ['Huehuetenango', 'Chiantla', 'Malacatancito', 'Cuilco'] },
    ]
  },
  { value: 'guinea', label: 'Guinea', letter: 'G', regions: [{ name: 'Conakry', cities: ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé'] }] },
  { value: 'guinea-bissau', label: 'Guinea-Bissau', letter: 'G', regions: [{ name: 'Central', cities: ['Bissau', 'Bafatá', 'Gabú', 'Bissorã', 'Bolama'] }] },
  { value: 'guyana', label: 'Guyana', letter: 'G', regions: [{ name: 'Central', cities: ['Georgetown', 'Linden', 'New Amsterdam', 'Anna Regina', 'Bartica'] }] },

  // H
  { value: 'haiti', label: 'Haiti', letter: 'H', regions: [{ name: 'Ouest', cities: ['Port-au-Prince', 'Carrefour', 'Delmas', 'Cap-Haïtien', 'Pétion-Ville'] }] },
  {
    value: 'honduras',
    label: 'Honduras',
    letter: 'H',
    regions: [
      { name: 'Francisco Morazán', cities: ['Tegucigalpa', 'Valle de Ángeles', 'Santa Lucía', 'San Antonio de Oriente'] },
      { name: 'Cortés', cities: ['San Pedro Sula', 'Choloma', 'La Lima', 'Villanueva', 'Omoa'] },
      { name: 'Atlántida', cities: ['La Ceiba', 'Tela', 'El Porvenir', 'Arizona'] },
      { name: 'Yoro', cities: ['El Progreso', 'Yoro', 'Olanchito', 'Morazán'] },
      { name: 'Choluteca', cities: ['Choluteca', 'Marcovia', 'El Triunfo', 'Pespire'] },
    ]
  },
  {
    value: 'hungary',
    label: 'Hungary',
    letter: 'H',
    regions: [
      { name: 'Budapest', cities: ['Budapest', 'Pest', 'Buda', 'Óbuda', 'Újpest', 'Kőbánya'] },
      { name: 'Hajdú-Bihar', cities: ['Debrecen', 'Hajdúböszörmény', 'Balmazújváros', 'Berettyóújfalu'] },
      { name: 'Csongrád-Csanád', cities: ['Szeged', 'Hódmezővásárhely', 'Makó', 'Szentes'] },
      { name: 'Borsod-Abaúj-Zemplén', cities: ['Miskolc', 'Ózd', 'Kazincbarcika', 'Sátoraljaújhely'] },
      { name: 'Baranya', cities: ['Pécs', 'Komló', 'Szigetvár', 'Mohács'] },
      { name: 'Győr-Moson-Sopron', cities: ['Győr', 'Sopron', 'Mosonmagyaróvár', 'Csorna'] },
    ]
  },

  // I
  { value: 'iceland', label: 'Iceland', letter: 'I', regions: [{ name: 'Capital Region', cities: ['Reykjavik', 'Kópavogur', 'Hafnarfjörður', 'Akureyri', 'Reykjanesbær'] }] },
  {
    value: 'india',
    label: 'India',
    letter: 'I',
    regions: [
      { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Navi Mumbai', 'Kalyan', 'Vasai-Virar', 'Kolhapur', 'Sangli'] },
      { name: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum', 'Gulbarga', 'Davangere', 'Bellary', 'Bijapur', 'Shimoga', 'Tumkur'] },
      { name: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul'] },
      { name: 'Delhi', cities: ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Connaught Place', 'Karol Bagh', 'Saket', 'Lajpat Nagar', 'Vasant Kunj', 'Janakpuri'] },
      { name: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Navsari'] },
      { name: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Haldia', 'Kharagpur', 'Kalyani'] },
      { name: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad'] },
      { name: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Noida'] },
      { name: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar'] },
      { name: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Batala', 'Pathankot'] },
    ]
  },
  {
    value: 'indonesia',
    label: 'Indonesia',
    letter: 'I',
    regions: [
      { name: 'Jakarta', cities: ['Jakarta', 'South Jakarta', 'East Jakarta', 'West Jakarta', 'Central Jakarta', 'North Jakarta', 'Thousand Islands'] },
      { name: 'East Java', cities: ['Surabaya', 'Malang', 'Kediri', 'Blitar', 'Probolinggo', 'Pasuruan', 'Mojokerto', 'Madiun'] },
      { name: 'West Java', cities: ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Cirebon', 'Tasikmalaya', 'Sukabumi', 'Cimahi'] },
      { name: 'Central Java', cities: ['Semarang', 'Surakarta', 'Salatiga', 'Pekalongan', 'Tegal', 'Magelang'] },
      { name: 'North Sumatra', cities: ['Medan', 'Binjai', 'Pematangsiantar', 'Tebing Tinggi', 'Tanjungbalai'] },
      { name: 'Bali', cities: ['Denpasar', 'Badung', 'Gianyar', 'Tabanan', 'Ubud', 'Sanur', 'Kuta', 'Seminyak'] },
      { name: 'Banten', cities: ['Tangerang', 'South Tangerang', 'Serang', 'Cilegon', 'Tangerang City'] },
      { name: 'South Sulawesi', cities: ['Makassar', 'Parepare', 'Palopo', 'Gowa', 'Maros'] },
    ]
  },
  {
    value: 'iran',
    label: 'Iran',
    letter: 'I',
    regions: [
      { name: 'Tehran', cities: ['Tehran', 'Rey', 'Shemiranat', 'Eslamshahr', 'Pakdasht'] },
      { name: 'Razavi Khorasan', cities: ['Mashhad', 'Neyshabur', 'Sabzevar', 'Torbat-e Heydarieh'] },
      { name: 'Isfahan', cities: ['Isfahan', 'Kashan', 'Najafabad', 'Khomeynishahr'] },
      { name: 'Alborz', cities: ['Karaj', 'Fardis', 'Nazarabad', 'Eshtehard'] },
      { name: 'Fars', cities: ['Shiraz', 'Marvdasht', 'Jahrom', 'Kazerun'] },
      { name: 'East Azerbaijan', cities: ['Tabriz', 'Maragheh', 'Marand', 'Sarab'] },
    ]
  },
  {
    value: 'iraq',
    label: 'Iraq',
    letter: 'I',
    regions: [
      { name: 'Baghdad', cities: ['Baghdad', 'Al-Kadhimiya', 'Al-Adhamiya', 'New Baghdad', 'Al-Sadr City'] },
      { name: 'Basra', cities: ['Basra', 'Al-Zubair', 'Abu Al-Khaseeb', 'Al-Faw'] },
      { name: 'Nineveh', cities: ['Mosul', 'Tel Afar', 'Al-Hamdaniya', 'Sinjar'] },
      { name: 'Erbil', cities: ['Erbil', 'Shaqlawa', 'Koya', 'Soran'] },
      { name: 'Najaf', cities: ['Najaf', 'Kufa', 'Al-Mishkhab'] },
      { name: 'Karbala', cities: ['Karbala', 'Al-Hindiya', 'Ain Al-Tamur'] },
    ]
  },
  {
    value: 'ireland',
    label: 'Ireland',
    letter: 'I',
    regions: [
      { name: 'Leinster', cities: ['Dublin', 'Drogheda', 'Dundalk', 'Swords', 'Bray', 'Navan'] },
      { name: 'Munster', cities: ['Cork', 'Limerick', 'Waterford', 'Tralee', 'Ennis', 'Killarney'] },
      { name: 'Connacht', cities: ['Galway', 'Sligo', 'Castlebar', 'Carrick-on-Shannon'] },
      { name: 'Ulster (ROI)', cities: ['Letterkenny', 'Dundalk', 'Drogheda', 'Monaghan'] },
    ]
  },
  {
    value: 'israel',
    label: 'Israel',
    letter: 'I',
    regions: [
      { name: 'Jerusalem District', cities: ['Jerusalem', 'Mevaseret Zion', 'Abu Ghosh'] },
      { name: 'Tel Aviv District', cities: ['Tel Aviv', 'Ramat Gan', 'Holon', 'Bat Yam', 'Bnei Brak', 'Givatayim'] },
      { name: 'Haifa District', cities: ['Haifa', 'Nesher', 'Kfar Saba', 'Tirat Carmel'] },
      { name: 'Central District', cities: ['Rishon LeZion', 'Petah Tikva', 'Rehovot', 'Netanya', 'Kfar Saba', 'Raanana'] },
      { name: 'Southern District', cities: ['Ashdod', 'Ashkelon', 'Beersheba', 'Eilat'] },
      { name: 'Northern District', cities: ['Nazareth', 'Acre', 'Safed', 'Tiberias'] },
    ]
  },
  {
    value: 'italy',
    label: 'Italy',
    letter: 'I',
    regions: [
      { name: 'Lazio', cities: ['Rome', 'Latina', 'Frosinone', 'Viterbo', 'Rieti', 'Guidonia', 'Fiumicino', 'Aprilia', 'Civitavecchia'] },
      { name: 'Lombardy', cities: ['Milan', 'Brescia', 'Monza', 'Bergamo', 'Como', 'Pavia', 'Varese', 'Busto Arsizio', 'Cremona', 'Mantua', 'Lecco', 'Lodi'] },
      { name: 'Campania', cities: ['Naples', 'Salerno', 'Caserta', 'Torre del Greco', 'Giugliano', 'Pozzuoli', 'Castellammare', 'Aversa', 'Benevento', 'Acerra'] },
      { name: 'Sicily', cities: ['Palermo', 'Catania', 'Messina', 'Syracuse', 'Ragusa', 'Trapani', 'Agrigento', 'Caltanissetta', 'Enna', 'Marsala'] },
      { name: 'Veneto', cities: ['Venice', 'Verona', 'Padua', 'Vicenza', 'Treviso', 'Rovigo', 'Belluno', 'Chioggia', 'Mestre'] },
      { name: 'Piedmont', cities: ['Turin', 'Alessandria', 'Novara', 'Asti', 'Cuneo', 'Vercelli', 'Biella', 'Verbania', 'Moncalieri'] },
      { name: 'Emilia-Romagna', cities: ['Bologna', 'Parma', 'Modena', 'Reggio Emilia', 'Ravenna', 'Ferrara', 'Rimini', 'Forlì', 'Cesena', 'Piacenza'] },
      { name: 'Tuscany', cities: ['Florence', 'Pisa', 'Prato', 'Livorno', 'Arezzo', 'Pistoia', 'Lucca', 'Siena', 'Grosseto', 'Massa'] },
    ]
  },
  {
    value: 'ivory-coast',
    label: 'Ivory Coast',
    letter: 'I',
    regions: [
      { name: 'Abidjan Autonomous District', cities: ['Abidjan', 'Abobo', 'Yopougon', 'Cocody', 'Adjamé', 'Treichville'] },
      { name: 'Vallée du Bandama', cities: ['Bouaké', 'Katiola', 'Dabakala', 'Sakassou'] },
      { name: 'Haut-Sassandra', cities: ['Daloa', 'Issia', 'Vavoua', 'Zuénoula'] },
      { name: 'Bas-Sassandra', cities: ['San-Pédro', 'Sassandra', 'Tabou', 'Soubré'] },
      { name: 'Yamoussoukro Autonomous District', cities: ['Yamoussoukro', 'Attikouékro'] },
    ]
  },

  // J
  { value: 'jamaica', label: 'Jamaica', letter: 'J', regions: [{ name: 'Kingston', cities: ['Kingston', 'Spanish Town', 'Portmore', 'Montego Bay', 'Mandeville'] }] },
  {
    value: 'japan',
    label: 'Japan',
    letter: 'J',
    regions: [
      { name: 'Tokyo', cities: ['Tokyo', 'Shibuya', 'Shinjuku', 'Minato', 'Chiyoda', 'Chūō', 'Toshima', 'Nakano', 'Shinagawa', 'Setagaya', 'Suginami', 'Koto', 'Taito', 'Edogawa'] },
      { name: 'Osaka', cities: ['Osaka', 'Sakai', 'Higashiosaka', 'Toyonaka', 'Suita', 'Takatsuki', 'Ibaraki', 'Moriguchi', 'Neyagawa', 'Yao', 'Hirakata'] },
      { name: 'Kanagawa', cities: ['Yokohama', 'Kawasaki', 'Sagamihara', 'Fujisawa', 'Yokosuka', 'Chigasaki', 'Atsugi', 'Yamato', 'Odawara', 'Kamakura'] },
      { name: 'Aichi', cities: ['Nagoya', 'Toyota', 'Okazaki', 'Ichinomiya', 'Kasugai', 'Anjo', 'Toyohashi', 'Nissin', 'Kariya', 'Seto'] },
      { name: 'Saitama', cities: ['Saitama', 'Kawaguchi', 'Kawagoe', 'Tokorozawa', 'Koshigaya', 'Ageo', 'Sōka', 'Kasukabe', 'Kumagaya', 'Niiza'] },
      { name: 'Hyogo', cities: ['Kobe', 'Himeji', 'Nishinomiya', 'Amagasaki', 'Akashi', 'Kakogawa', 'Takarazuka', 'Itami', 'Sanda', 'Ashiya'] },
      { name: 'Hokkaido', cities: ['Sapporo', 'Asahikawa', 'Hakodate', 'Kushiro', 'Obihiro', 'Tomakomai', 'Otaru', 'Kitami', 'Iwamizawa', 'Ebetsu'] },
      { name: 'Fukuoka', cities: ['Fukuoka', 'Kitakyushu', 'Kurume', 'Omuta', 'Iizuka', 'Kasuga', 'Onojo', 'Munakata', 'Nogata', 'Tagawa'] },
      { name: 'Chiba', cities: ['Chiba', 'Funabashi', 'Matsudo', 'Ichikawa', 'Kashiwa', 'Ichihara', 'Narita', 'Sakura', 'Narashino', 'Urayasu'] },
      { name: 'Kyoto', cities: ['Kyoto', 'Uji', 'Kameoka', 'Maizuru', 'Fukuchiyama', 'Kyotanabe', 'Nagaokakyo', 'Joyo', 'Ayabe', 'Miyazu'] },
    ]
  },
  {
    value: 'jordan',
    label: 'Jordan',
    letter: 'J',
    regions: [
      { name: 'Amman', cities: ['Amman', 'Sahab', 'Al-Jizah', 'Wadi as-Sir', 'Al-Quwaysimah'] },
      { name: 'Zarqa', cities: ['Zarqa', 'Russeifa', 'Al-Hashimiyya', 'Bayt Ras'] },
      { name: 'Irbid', cities: ['Irbid', 'Ramtha', 'Mafraq', 'Ajloun', 'Jerash'] },
      { name: 'Aqaba', cities: ['Aqaba', 'Wadi Rum', 'Quweira', 'Disah'] },
      { name: 'Al Karak', cities: ['Al Karak', 'Mazar', 'Qasr', 'Al-Qatraneh'] },
      { name: 'Ma\'an', cities: ['Ma\'an', 'Petra', 'Wadi Musa', 'Ash Shawbak'] },
    ]
  },

  // K
  { value: 'kazakhstan', label: 'Kazakhstan', letter: 'K', regions: [{ name: 'Almaty', cities: ['Almaty', 'Nur-Sultan', 'Shymkent', 'Karaganda', 'Aktobe'] }] },
  {
    value: 'kenya',
    label: 'Kenya',
    letter: 'K',
    regions: [
      { name: 'Nairobi', cities: ['Nairobi', 'Westlands', 'Karen', 'Kilimani', 'Kasarani', 'Embakasi'] },
      { name: 'Mombasa', cities: ['Mombasa', 'Likoni', 'Changamwe', 'Kisauni', 'Nyali'] },
      { name: 'Kisumu', cities: ['Kisumu', 'Ahero', 'Maseno', 'Kondele'] },
      { name: 'Nakuru', cities: ['Nakuru', 'Naivasha', 'Gilgil', 'Njoro'] },
      { name: 'Uasin Gishu', cities: ['Eldoret', 'Burnt Forest', 'Kapseret', 'Soy'] },
    ]
  },
  { value: 'kiribati', label: 'Kiribati', letter: 'K', regions: [{ name: 'Central', cities: ['Tarawa', 'Betio', 'Bikenibeu', 'Teaoraereke'] }] },
  {
    value: 'kuwait',
    label: 'Kuwait',
    letter: 'K',
    regions: [
      { name: 'Capital Governorate', cities: ['Kuwait City', 'Kaifan', 'Dasma', 'Sharq', 'Daiya'] },
      { name: 'Hawalli', cities: ['Hawalli', 'Salmiya', 'Bayan', 'Mishref', 'Salwa', 'Rumaithiya'] },
      { name: 'Farwaniya', cities: ['Farwaniya', 'Jleeb Al-Shuyoukh', 'Khaitan', 'Ardiya'] },
      { name: 'Ahmadi', cities: ['Ahmadi', 'Fahaheel', 'Mangaf', 'Mahboula', 'Abu Halifa'] },
      { name: 'Mubarak Al-Kabeer', cities: ['Sabah Al Salem', 'Adan', 'Al-Qurain', 'Funaitees'] },
    ]
  },
  { value: 'kyrgyzstan', label: 'Kyrgyzstan', letter: 'K', regions: [{ name: 'Bishkek', cities: ['Bishkek', 'Osh', 'Jalal-Abad', 'Karakol', 'Tokmok'] }] },

  // L
  { value: 'laos', label: 'Laos', letter: 'L', regions: [{ name: 'Vientiane', cities: ['Vientiane', 'Pakse', 'Savannakhet', 'Luang Prabang', 'Thakhek'] }] },
  { value: 'latvia', label: 'Latvia', letter: 'L', regions: [{ name: 'Riga', cities: ['Riga', 'Daugavpils', 'Liepāja', 'Jelgava', 'Jūrmala'] }] },
  {
    value: 'lebanon',
    label: 'Lebanon',
    letter: 'L',
    regions: [
      { name: 'Beirut', cities: ['Beirut', 'Achrafieh', 'Hamra', 'Verdun', 'Ain el-Mreisseh'] },
      { name: 'Mount Lebanon', cities: ['Jounieh', 'Byblos', 'Baabda', 'Aley', 'Metn'] },
      { name: 'North Governorate', cities: ['Tripoli', 'Zgharta', 'Batroun', 'Bsharri', 'Koura'] },
      { name: 'South Governorate', cities: ['Sidon', 'Tyre', 'Jezzine', 'Nabatieh'] },
      { name: 'Beqaa', cities: ['Zahlé', 'Baalbek', 'Rashaya', 'Western Beqaa'] },
    ]
  },
  { value: 'lesotho', label: 'Lesotho', letter: 'L', regions: [{ name: 'Central', cities: ['Maseru', 'Teyateyaneng', 'Mafeteng', 'Hlotse', 'Mohale\'s Hoek'] }] },
  { value: 'liberia', label: 'Liberia', letter: 'L', regions: [{ name: 'Montserrado', cities: ['Monrovia', 'Gbarnga', 'Kakata', 'Bensonville', 'Harper'] }] },
  { value: 'libya', label: 'Libya', letter: 'L', regions: [{ name: 'Tripoli', cities: ['Tripoli', 'Benghazi', 'Misrata', 'Bayda', 'Zawiya'] }] },
  { value: 'liechtenstein', label: 'Liechtenstein', letter: 'L', regions: [{ name: 'Central', cities: ['Vaduz', 'Schaan', 'Balzers', 'Triesen', 'Eschen'] }] },
  { value: 'lithuania', label: 'Lithuania', letter: 'L', regions: [{ name: 'Vilnius', cities: ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys'] }] },
  { value: 'luxembourg', label: 'Luxembourg', letter: 'L', regions: [{ name: 'Luxembourg', cities: ['Luxembourg City', 'Esch-sur-Alzette', 'Dudelange', 'Differdange'] }] },

  // M
  { value: 'madagascar', label: 'Madagascar', letter: 'M', regions: [{ name: 'Analamanga', cities: ['Antananarivo', 'Toamasina', 'Antsirabe', 'Fianarantsoa', 'Mahajanga'] }] },
  { value: 'malawi', label: 'Malawi', letter: 'M', regions: [{ name: 'Central', cities: ['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba', 'Mangochi'] }] },
  {
    value: 'malaysia',
    label: 'Malaysia',
    letter: 'M',
    regions: [
      { name: 'Kuala Lumpur', cities: ['Kuala Lumpur', 'Bukit Bintang', 'KLCC', 'Bangsar', 'Cheras', 'Sentul'] },
      { name: 'Selangor', cities: ['Shah Alam', 'Petaling Jaya', 'Subang Jaya', 'Klang', 'Ampang', 'Puchong', 'Kajang'] },
      { name: 'Penang', cities: ['George Town', 'Butterworth', 'Bayan Lepas', 'Bukit Mertajam', 'Tanjung Bungah'] },
      { name: 'Johor', cities: ['Johor Bahru', 'Iskandar Puteri', 'Muar', 'Batu Pahat', 'Kluang'] },
      { name: 'Perak', cities: ['Ipoh', 'Taiping', 'Teluk Intan', 'Kuala Kangsar', 'Lumut'] },
      { name: 'Sabah', cities: ['Kota Kinabalu', 'Sandakan', 'Tawau', 'Lahad Datu', 'Keningau'] },
      { name: 'Sarawak', cities: ['Kuching', 'Miri', 'Sibu', 'Bintulu', 'Limbang'] },
    ]
  },
  { value: 'maldives', label: 'Maldives', letter: 'M', regions: [{ name: 'Central', cities: ['Malé', 'Addu City', 'Fuvahmulah', 'Kulhudhuffushi', 'Thinadhoo'] }] },
  { value: 'mali', label: 'Mali', letter: 'M', regions: [{ name: 'Bamako', cities: ['Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Kayes'] }] },
  { value: 'malta', label: 'Malta', letter: 'M', regions: [{ name: 'Central', cities: ['Valletta', 'Birkirkara', 'Mosta', 'Qormi', 'Sliema'] }] },
  { value: 'marshall-islands', label: 'Marshall Islands', letter: 'M', regions: [{ name: 'Central', cities: ['Majuro', 'Ebeye', 'Arno', 'Jabor', 'Wotje'] }] },
  { value: 'mauritania', label: 'Mauritania', letter: 'M', regions: [{ name: 'Nouakchott', cities: ['Nouakchott', 'Nouadhibou', 'Néma', 'Kaédi', 'Rosso'] }] },
  { value: 'mauritius', label: 'Mauritius', letter: 'M', regions: [{ name: 'Central', cities: ['Port Louis', 'Beau Bassin', 'Vacoas', 'Curepipe', 'Quatre Bornes'] }] },
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
  { value: 'micronesia', label: 'Micronesia', letter: 'M', regions: [{ name: 'Central', cities: ['Palikir', 'Weno', 'Kolonia', 'Tofol', 'Colonia'] }] },
  { value: 'moldova', label: 'Moldova', letter: 'M', regions: [{ name: 'Chișinău', cities: ['Chișinău', 'Tiraspol', 'Bălți', 'Bender', 'Rîbnița'] }] },
  { value: 'monaco', label: 'Monaco', letter: 'M', regions: [{ name: 'Central', cities: ['Monaco', 'Monte Carlo', 'La Condamine', 'Fontvieille'] }] },
  { value: 'mongolia', label: 'Mongolia', letter: 'M', regions: [{ name: 'Ulaanbaatar', cities: ['Ulaanbaatar', 'Erdenet', 'Darkhan', 'Choibalsan', 'Mörön'] }] },
  { value: 'montenegro', label: 'Montenegro', letter: 'M', regions: [{ name: 'Central', cities: ['Podgorica', 'Nikšić', 'Pljevlja', 'Bijelo Polje', 'Cetinje'] }] },
  {
    value: 'morocco',
    label: 'Morocco',
    letter: 'M',
    regions: [
      { name: 'Casablanca-Settat', cities: ['Casablanca', 'Mohammedia', 'El Jadida', 'Settat', 'Berrechid', 'Khouribga', 'Bouskoura', 'Nouaceur', 'Mediouna', 'Benslimane', 'Sidi Bennour'] },
      { name: 'Rabat-Salé-Kénitra', cities: ['Rabat', 'Salé', 'Témara', 'Kénitra', 'Khémisset', 'Skhirat', 'Sidi Slimane', 'Sidi Kacem', 'Tiflet', 'Youssoufia'] },
      { name: 'Fès-Meknès', cities: ['Fès', 'Meknes', 'Taza', 'Sefrou', 'Ifrane', 'El Hajeb', 'Azrou', 'Taounate', 'Boulemane', 'Moulay Yacoub'] },
      { name: 'Marrakech-Safi', cities: ['Marrakech', 'Safi', 'El Kelaa des Sraghna', 'Essaouira', 'Youssoufia', 'Benguerir', 'Chichaoua', 'Rhamna', 'Al Haouz'] },
      { name: 'Tanger-Tétouan-Al Hoceïma', cities: ['Tangier', 'Tétouan', 'Al Hoceima', 'Larache', 'Ksar El Kebir', 'Asilah', 'Chefchaouen', 'Ouezzane', 'M\'diq', 'Fnideq'] },
      { name: 'Oriental', cities: ['Oujda', 'Nador', 'Berkane', 'Taourirt', 'Jerada', 'Guercif', 'Driouch', 'Figuig'] },
      { name: 'Souss-Massa', cities: ['Agadir', 'Inezgane', 'Taroudant', 'Tiznit', 'Ouarzazate', 'Ait Melloul', 'Biougra', 'Taliouine'] },
      { name: 'Drâa-Tafilalet', cities: ['Errachidia', 'Ouarzazate', 'Zagora', 'Tinghir', 'Midelt', 'Goulmima', 'Erfoud'] },
      { name: 'Béni Mellal-Khénifra', cities: ['Béni Mellal', 'Khénifra', 'Khouribga', 'Fquih Ben Salah', 'Azilal', 'Kasba Tadla'] },
      { name: 'Guelmim-Oued Noun', cities: ['Guelmim', 'Tan-Tan', 'Sidi Ifni', 'Assa', 'Bouizakarne'] },
      { name: 'Laâyoune-Sakia El Hamra', cities: ['Laâyoune', 'Boujdour', 'Tarfaya', 'Es-Semara'] },
      { name: 'Dakhla-Oued Ed-Dahab', cities: ['Dakhla', 'Aousserd', 'Lagouira'] },
    ]
  },
  { value: 'mozambique', label: 'Mozambique', letter: 'M', regions: [{ name: 'Maputo', cities: ['Maputo', 'Matola', 'Nampula', 'Beira', 'Chimoio'] }] },
  {
    value: 'myanmar',
    label: 'Myanmar',
    letter: 'M',
    regions: [
      { name: 'Yangon', cities: ['Yangon', 'South Dagon', 'North Dagon', 'Thaketa', 'Hlaingthaya', 'Mingaladon'] },
      { name: 'Mandalay', cities: ['Mandalay', 'PyinOoLwin', 'Kyaukse', 'Amarapura', 'Meiktila'] },
      { name: 'Naypyidaw', cities: ['Naypyidaw', 'Lewe', 'Pyinmana', 'Tatkon'] },
      { name: 'Ayeyarwady', cities: ['Pathein', 'Hinthada', 'Myaungmya', 'Maubin'] },
      { name: 'Mon', cities: ['Mawlamyine', 'Thaton', 'Ye', 'Mudon'] },
      { name: 'Bago', cities: ['Bago', 'Pyay', 'Taungoo', 'Nyaunglebin'] },
    ]
  },

  // N
  { value: 'namibia', label: 'Namibia', letter: 'N', regions: [{ name: 'Khomas', cities: ['Windhoek', 'Rundu', 'Walvis Bay', 'Swakopmund', 'Oshakati'] }] },
  { value: 'nauru', label: 'Nauru', letter: 'N', regions: [{ name: 'Central', cities: ['Yaren', 'Denigomodu', 'Aiwo', 'Buada', 'Meneng'] }] },
  {
    value: 'nepal',
    label: 'Nepal',
    letter: 'N',
    regions: [
      { name: 'Bagmati', cities: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kirtipur', 'Madhyapur Thimi'] },
      { name: 'Gandaki', cities: ['Pokhara', 'Beni', 'Gorkha', 'Besisahar'] },
      { name: 'Province 1', cities: ['Biratnagar', 'Dharan', 'Itahari', 'Damak'] },
      { name: 'Madhesh', cities: ['Janakpur', 'Birgunj', 'Bardibas', 'Gaur'] },
      { name: 'Lumbini', cities: ['Butwal', 'Bhairahawa', 'Tansen', 'Tulsipur'] },
      { name: 'Karnali', cities: ['Birendranagar', 'Jumla', 'Dailekh'] },
    ]
  },
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
  {
    value: 'new-zealand',
    label: 'New Zealand',
    letter: 'N',
    regions: [
      { name: 'Auckland', cities: ['Auckland', 'Manukau', 'North Shore', 'Waitakere', 'Hamilton'] },
      { name: 'Wellington', cities: ['Wellington', 'Lower Hutt', 'Upper Hutt', 'Porirua', 'Kapiti'] },
      { name: 'Canterbury', cities: ['Christchurch', 'Timaru', 'Ashburton', 'Rangiora'] },
      { name: 'Bay of Plenty', cities: ['Tauranga', 'Rotorua', 'Whakatane', 'Taupo'] },
      { name: 'Waikato', cities: ['Hamilton', 'Cambridge', 'Te Awamutu', 'Tokoroa'] },
      { name: 'Otago', cities: ['Dunedin', 'Queenstown', 'Wanaka', 'Oamaru'] },
    ]
  },
  { value: 'nicaragua', label: 'Nicaragua', letter: 'N', regions: [{ name: 'Managua', cities: ['Managua', 'León', 'Masaya', 'Matagalpa', 'Chinandega'] }] },
  { value: 'niger', label: 'Niger', letter: 'N', regions: [{ name: 'Niamey', cities: ['Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua'] }] },
  {
    value: 'nigeria',
    label: 'Nigeria',
    letter: 'N',
    regions: [
      { name: 'Lagos', cities: ['Lagos', 'Ikeja', 'Lekki', 'Victoria Island', 'Surulere', 'Ikoyi', 'Yaba'] },
      { name: 'Kano', cities: ['Kano', 'Sabon Gari', 'Ungwa Uku', 'Fagge'] },
      { name: 'Oyo', cities: ['Ibadan', 'Oyo', 'Ogbomosho', 'Iseyin'] },
      { name: 'Federal Capital Territory', cities: ['Abuja', 'Gwagwalada', 'Kuje', 'Bwari'] },
      { name: 'Rivers', cities: ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Oyigbo'] },
      { name: 'Edo', cities: ['Benin City', 'Ekpoma', 'Auchi', 'Uromi'] },
      { name: 'Kaduna', cities: ['Kaduna', 'Zaria', 'Kafanchan'] },
    ]
  },
  { value: 'north-korea', label: 'North Korea', letter: 'N', regions: [{ name: 'Pyongyang', cities: ['Pyongyang', 'Hamhung', 'Chongjin', 'Nampo', 'Wonsan'] }] },
  { value: 'north-macedonia', label: 'North Macedonia', letter: 'N', regions: [{ name: 'Skopje', cities: ['Skopje', 'Bitola', 'Kumanovo', 'Prilep', 'Tetovo'] }] },
  {
    value: 'norway',
    label: 'Norway',
    letter: 'N',
    regions: [
      { name: 'Oslo', cities: ['Oslo', 'Bærum', 'Asker', 'Lørenskog', 'Drammen'] },
      { name: 'Vestland', cities: ['Bergen', 'Stavanger', 'Sandnes', 'Haugesund'] },
      { name: 'Trøndelag', cities: ['Trondheim', 'Steinkjer', 'Levanger'] },
      { name: 'Viken', cities: ['Fredrikstad', 'Sarpsborg', 'Tønsberg', 'Moss', 'Sandefjord'] },
      { name: 'Rogaland', cities: ['Stavanger', 'Sandnes', 'Haugesund', 'Egersund'] },
    ]
  },

  // O
  {
    value: 'oman',
    label: 'Oman',
    letter: 'O',
    regions: [
      { name: 'Muscat', cities: ['Muscat', 'Seeb', 'Bawshar', 'Al Amarat', 'Muttrah'] },
      { name: 'Dhofar', cities: ['Salalah', 'Taqah', 'Mirbat', 'Thumrait'] },
      { name: 'Al Batinah North', cities: ['Sohar', 'Shinas', 'Liwa', 'Saham'] },
      { name: 'Al Batinah South', cities: ['Rustaq', 'Al Awabi', 'Nakhal', 'Wadi Bani Kharus'] },
      { name: 'Ad Dakhiliyah', cities: ['Nizwa', 'Bahla', 'Adam', 'Izki'] },
      { name: 'Ash Sharqiyah North', cities: ['Ibra', 'Al Mudaybi', 'Al Qabil', 'Wadi Bani Khalid'] },
    ]
  },

  // P
  {
    value: 'pakistan',
    label: 'Pakistan',
    letter: 'P',
    regions: [
      { name: 'Sindh', cities: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpur Khas'] },
      { name: 'Punjab', cities: ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha'] },
      { name: 'Islamabad Capital Territory', cities: ['Islamabad', 'Rawalpindi', 'Margalla', 'Bhara Kahu'] },
      { name: 'Khyber Pakhtunkhwa', cities: ['Peshawar', 'Mardan', 'Abbottabad', 'Kohat', 'Swat'] },
      { name: 'Balochistan', cities: ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Hub'] },
      { name: 'Azad Kashmir', cities: ['Muzaffarabad', 'Mirpur', 'Rawalakot', 'Kotli'] },
    ]
  },
  { value: 'palau', label: 'Palau', letter: 'P', regions: [{ name: 'Central', cities: ['Ngerulmud', 'Koror', 'Melekeok', 'Airai', 'Peleliu'] }] },
  { value: 'palestine', label: 'Palestine', letter: 'P', regions: [{ name: 'West Bank', cities: ['Ramallah', 'Gaza', 'Hebron', 'Nablus', 'Bethlehem'] }] },
  { value: 'panama', label: 'Panama', letter: 'P', regions: [{ name: 'Panama', cities: ['Panama City', 'San Miguelito', 'Tocumen', 'David', 'Arraiján'] }] },
  { value: 'papua-new-guinea', label: 'Papua New Guinea', letter: 'P', regions: [{ name: 'National Capital', cities: ['Port Moresby', 'Lae', 'Madang', 'Mount Hagen', 'Popondetta'] }] },
  { value: 'paraguay', label: 'Paraguay', letter: 'P', regions: [{ name: 'Asunción', cities: ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiatá'] }] },
  {
    value: 'peru',
    label: 'Peru',
    letter: 'P',
    regions: [
      { name: 'Lima', cities: ['Lima', 'Callao', 'San Juan de Lurigancho', 'San Martín de Porres', 'Ate', 'Comas', 'Villa El Salvador'] },
      { name: 'Arequipa', cities: ['Arequipa', 'Cayma', 'Cerro Colorado', 'Paucarpata'] },
      { name: 'La Libertad', cities: ['Trujillo', 'Chimbote', 'Huamachuco'] },
      { name: 'Lambayeque', cities: ['Chiclayo', 'Lambayeque', 'Ferreñafe'] },
      { name: 'Cusco', cities: ['Cusco', 'Sicuani', 'Urubamba', 'Ollantaytambo'] },
      { name: 'Piura', cities: ['Piura', 'Sullana', 'Talara', 'Paita'] },
    ]
  },
  {
    value: 'philippines',
    label: 'Philippines',
    letter: 'P',
    regions: [
      { name: 'Metro Manila', cities: ['Manila', 'Quezon City', 'Caloocan', 'Makati', 'Pasig', 'Taguig', 'Parañaque', 'Las Piñas', 'Malabon', 'Navotas', 'Valenzuela', 'Marikina'] },
      { name: 'Cebu', cities: ['Cebu City', 'Mandaue', 'Lapu-Lapu', 'Talisay', 'Danao', 'Toledo'] },
      { name: 'Davao', cities: ['Davao City', 'Tagum', 'Panabo', 'Digos', 'Mati'] },
      { name: 'Zamboanga', cities: ['Zamboanga City', 'Pagadian', 'Dipolog', 'Dapitan'] },
      { name: 'Cagayan de Oro', cities: ['Cagayan de Oro', 'Iligan', 'Valencia', 'Malaybalay'] },
      { name: 'Iloilo', cities: ['Iloilo City', 'Bacolod', 'Roxas', 'Kalibo'] },
    ]
  },
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

  // Q
  { value: 'qatar', label: 'Qatar', letter: 'Q', regions: [{ name: 'Doha', cities: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Umm Salal'] }] },

  // R
  {
    value: 'romania',
    label: 'Romania',
    letter: 'R',
    regions: [
      { name: 'Bucharest', cities: ['Bucharest', 'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6'] },
      { name: 'Cluj', cities: ['Cluj-Napoca', 'Dej', 'Turda', 'Gherla', 'Câmpia Turzii'] },
      { name: 'Timiș', cities: ['Timișoara', 'Lugoj', 'Sannicolau Mare', 'Jimbolia'] },
      { name: 'Iași', cities: ['Iași', 'Pășcani', 'Hârlău', 'Târgu Frumos'] },
      { name: 'Constanța', cities: ['Constanța', 'Mangalia', 'Medgidia', 'Năvodari'] },
      { name: 'Dolj', cities: ['Craiova', 'Băilești', 'Calafat', 'Filiași'] },
    ]
  },
  {
    value: 'russia',
    label: 'Russia',
    letter: 'R',
    regions: [
      { name: 'Moscow', cities: ['Moscow', 'Balashikha', 'Khimki', 'Podolsk', 'Mytishchi', 'Lyubertsy', 'Krasnogorsk'] },
      { name: 'Saint Petersburg', cities: ['Saint Petersburg', 'Kolpino', 'Pushkin', 'Kronstadt', 'Peterhof'] },
      { name: 'Novosibirsk Oblast', cities: ['Novosibirsk', 'Berdsk', 'Iskitim', 'Ob'] },
      { name: 'Sverdlovsk Oblast', cities: ['Yekaterinburg', 'Nizhny Tagil', 'Kamensk-Uralsky', 'Pervouralsk'] },
      { name: 'Tatarstan', cities: ['Kazan', 'Naberezhnye Chelny', 'Nizhnekamsk', 'Almetyevsk'] },
      { name: 'Nizhny Novgorod Oblast', cities: ['Nizhny Novgorod', 'Dzerzhinsk', 'Arzamas', 'Sarov'] },
      { name: 'Krasnodar Krai', cities: ['Krasnodar', 'Sochi', 'Novorossiysk', 'Armavir', 'Yeisk'] },
      { name: 'Rostov Oblast', cities: ['Rostov-on-Don', 'Taganrog', 'Shakhty', 'Novocherkassk'] },
    ]
  },
  { value: 'rwanda', label: 'Rwanda', letter: 'R', regions: [{ name: 'Kigali', cities: ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri', 'Gisenyi'] }] },

  // S
  { value: 'saint-kitts-nevis', label: 'Saint Kitts and Nevis', letter: 'S', regions: [{ name: 'Central', cities: ['Basseterre', 'Charlestown', 'Dieppe Bay', 'Monkey Hill'] }] },
  { value: 'saint-lucia', label: 'Saint Lucia', letter: 'S', regions: [{ name: 'Central', cities: ['Castries', 'Vieux Fort', 'Micoud', 'Soufrière', 'Dennery'] }] },
  { value: 'saint-vincent-grenadines', label: 'Saint Vincent and the Grenadines', letter: 'S', regions: [{ name: 'Central', cities: ['Kingstown', 'Georgetown', 'Byera', 'Biabou', 'Barrouallie'] }] },
  { value: 'samoa', label: 'Samoa', letter: 'S', regions: [{ name: 'Central', cities: ['Apia', 'Vaitele', 'Faleula', 'Siusega', 'Vaiusu'] }] },
  { value: 'san-marino', label: 'San Marino', letter: 'S', regions: [{ name: 'Central', cities: ['San Marino', 'Serravalle', 'Borgo Maggiore', 'Domagnano'] }] },
  { value: 'sao-tome-principe', label: 'Sao Tome and Principe', letter: 'S', regions: [{ name: 'Central', cities: ['São Tomé', 'Trindade', 'Neves', 'Santana', 'Guadalupe'] }] },
  {
    value: 'saudi-arabia',
    label: 'Saudi Arabia',
    letter: 'S',
    regions: [
      { name: 'Riyadh Region', cities: ['Riyadh', 'Al Kharj', 'Al Majmaah', 'Al Zulfi', 'Diriyah', 'Al Muzahimiyah', 'Dhurma', 'Al Ghat', 'Shaqra', 'Afif', 'Dawadmi', 'Al Quwayiyah'] },
      { name: 'Makkah Region', cities: ['Jeddah', 'Mecca', 'Taif', 'Rabigh', 'Khulais', 'Qunfudhah', 'Al Lith', 'Adham', 'Al Kamil', 'Ranyah', 'Turubah', 'Al Jumum'] },
      { name: 'Madinah Region', cities: ['Medina', 'Yanbu', 'Badr', 'Al-Ula', 'Khaybar', 'Mahd ad Dahab', 'Al Ais', 'Al Hanakiyah'] },
      { name: 'Eastern Province', cities: ['Dammam', 'Khobar', 'Dhahran', 'Jubail', 'Qatif', 'Al Hasa', 'Hofuf', 'Al Mubarraz', 'Ras Tanura', 'Abqaiq', 'Khafji', 'Safwa', 'Saihat', 'Tarout'] },
      { name: 'Asir Region', cities: ['Abha', 'Khamis Mushait', 'Bisha', 'Muhayil', 'Sarat Abidah', 'Ahad Rafidah', 'Rijal Alma', 'Bareq'] },
      { name: 'Tabuk Region', cities: ['Tabuk', 'Duba', 'Tayma', 'Haql', 'Al Wajh', 'Umluj', 'Al Bada', 'Dhiba'] },
      { name: 'Qassim Region', cities: ['Buraidah', 'Unaizah', 'Ar Rass', 'Al Mithnab', 'Al Badaya', 'Riyadh Al Khabra', 'Al Bukayriyah', 'Al Asyah'] },
      { name: 'Ha\'il Region', cities: ['Ha\'il', 'Baqaa', 'Al Ghazalah', 'Ash Shinan', 'Simira', 'Al Mustajiddah'] },
      { name: 'Jazan Region', cities: ['Jazan', 'Sabya', 'Abu Arish', 'Samtah', 'Damad', 'Baish', 'Al Darb', 'Al Aridah'] },
      { name: 'Najran Region', cities: ['Najran', 'Sharourah', 'Hubuna', 'Badr Al Janoub', 'Yadamah', 'Thar'] },
      { name: 'Al Bahah Region', cities: ['Al Bahah', 'Baljurashi', 'Al Mandaq', 'Al Mikhwah', 'Qilwah', 'Al Aqiq'] },
      { name: 'Al Jawf Region', cities: ['Sakakah', 'Dumat Al Jandal', 'Tabarjal', 'Qurayyat', 'Tuwayr'] },
      { name: 'Northern Borders Region', cities: ['Arar', 'Rafha', 'Turaif', 'Al Uwayqilah'] },
    ]
  },
  {
    value: 'senegal',
    label: 'Senegal',
    letter: 'S',
    regions: [
      { name: 'Dakar', cities: ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque', 'Mbao'] },
      { name: 'Diourbel', cities: ['Touba', 'Diourbel', 'Mbacké', 'Bambey'] },
      { name: 'Thiès', cities: ['Thiès', 'Mbour', 'Tiva', 'Joal-Fadiouth'] },
      { name: 'Kaolack', cities: ['Kaolack', 'Nioro du Rip', 'Kaffrine', 'Koungheul'] },
      { name: 'Saint-Louis', cities: ['Saint-Louis', 'Dagana', 'Podor', 'Richard Toll'] },
    ]
  },
  {
    value: 'serbia',
    label: 'Serbia',
    letter: 'S',
    regions: [
      { name: 'Belgrade', cities: ['Belgrade', 'Zemun', 'Novi Beograd', 'Palilula', 'Vračar'] },
      { name: 'Vojvodina', cities: ['Novi Sad', 'Subotica', 'Zrenjanin', 'Pančevo', 'Sombor'] },
      { name: 'Nišava', cities: ['Niš', 'Pirot', 'Aleksinački', 'Gadne'] },
      { name: 'Šumadija', cities: ['Kragujevac', 'Ćuprija', 'Jagodina', 'Paraćin'] },
      { name: 'Southern Serbia', cities: ['Leskovac', 'Vranje', 'Prokuplje', 'Bujanovac'] },
    ]
  },
  { value: 'seychelles', label: 'Seychelles', letter: 'S', regions: [{ name: 'Central', cities: ['Victoria', 'Anse Boileau', 'Beau Vallon', 'Cascade', 'Takamaka'] }] },
  { value: 'sierra-leone', label: 'Sierra Leone', letter: 'S', regions: [{ name: 'Western Area', cities: ['Freetown', 'Bo', 'Kenema', 'Koidu', 'Makeni'] }] },
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
  { value: 'slovakia', label: 'Slovakia', letter: 'S', regions: [{ name: 'Bratislava', cities: ['Bratislava', 'Košice', 'Prešov', 'Žilina', 'Nitra'] }] },
  { value: 'slovenia', label: 'Slovenia', letter: 'S', regions: [{ name: 'Central', cities: ['Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Velenje'] }] },
  { value: 'solomon-islands', label: 'Solomon Islands', letter: 'S', regions: [{ name: 'Central', cities: ['Honiara', 'Auki', 'Gizo', 'Buala', 'Kirakira'] }] },
  { value: 'somalia', label: 'Somalia', letter: 'S', regions: [{ name: 'Banaadir', cities: ['Mogadishu', 'Hargeisa', 'Kismayo', 'Berbera', 'Merca'] }] },
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
    value: 'south-korea',
    label: 'South Korea',
    letter: 'S',
    regions: [
      { name: 'Seoul', cities: ['Seoul', 'Gangnam', 'Seocho', 'Songpa', 'Gangdong', 'Gwanak', 'Yongsan', 'Jung-gu', 'Jongno'] },
      { name: 'Busan', cities: ['Busan', 'Haeundae', 'Suyeong', 'Sasang', 'Busanjin', 'Nam-gu', 'Dong-gu'] },
      { name: 'Gyeonggi', cities: ['Suwon', 'Seongnam', 'Goyang', 'Yongin', 'Bucheon', 'Ansan', 'Anyang', 'Hwaseong', 'Namyangju'] },
      { name: 'Incheon', cities: ['Incheon', 'Namdong', 'Bupyeong', 'Seo-gu', 'Yeonsu'] },
      { name: 'Daegu', cities: ['Daegu', 'Suseong', 'Dalseo', 'Buk-gu', 'Nam-gu'] },
      { name: 'Daejeon', cities: ['Daejeon', 'Yuseong', 'Seo-gu', 'Daedeok', 'Jung-gu'] },
      { name: 'Gwangju', cities: ['Gwangju', 'Buk-gu', 'Nam-gu', 'Seo-gu', 'Gwangsan'] },
      { name: 'Ulsan', cities: ['Ulsan', 'Nam-gu', 'Dong-gu', 'Buk-gu', 'Ulju'] },
    ]
  },
  { value: 'south-sudan', label: 'South Sudan', letter: 'S', regions: [{ name: 'Central Equatoria', cities: ['Juba', 'Wau', 'Malakal', 'Yei', 'Bor'] }] },
  {
    value: 'spain',
    label: 'Spain',
    letter: 'S',
    regions: [
      { name: 'Madrid', cities: ['Madrid', 'Móstoles', 'Alcalá de Henares', 'Fuenlabrada', 'Getafe', 'Leganés', 'Alcorcón', 'Torrejón de Ardoz', 'Parla', 'Alcobendas'] },
      { name: 'Catalonia', cities: ['Barcelona', 'L\'Hospitalet', 'Badalona', 'Terrassa', 'Sabadell', 'Tarragona', 'Lleida', 'Mataró', 'Santa Coloma de Gramenet', 'Reus', 'Girona', 'Cornellà'] },
      { name: 'Andalusia', cities: ['Seville', 'Málaga', 'Córdoba', 'Granada', 'Jerez', 'Almería', 'Huelva', 'Marbella', 'Dos Hermanas', 'Cádiz', 'Jaén', 'Algeciras'] },
      { name: 'Valencia', cities: ['Valencia', 'Alicante', 'Elche', 'Castellón', 'Torrevieja', 'Orihuela', 'Gandía', 'Torrent', 'Paterna', 'Sagunto', 'Alzira'] },
      { name: 'Basque Country', cities: ['Bilbao', 'Vitoria-Gasteiz', 'San Sebastián', 'Barakaldo', 'Getxo', 'Irun', 'Portugalete', 'Santurtzi'] },
      { name: 'Galicia', cities: ['Vigo', 'A Coruña', 'Ourense', 'Lugo', 'Santiago de Compostela', 'Pontevedra', 'Ferrol', 'Narón'] },
      { name: 'Castile and León', cities: ['Valladolid', 'Burgos', 'Salamanca', 'León', 'Palencia', 'Zamora', 'Ávila', 'Segovia', 'Soria'] },
      { name: 'Canary Islands', cities: ['Las Palmas', 'Santa Cruz de Tenerife', 'La Laguna', 'Telde', 'Arona', 'San Bartolomé de Tirajana'] },
    ]
  },
  {
    value: 'sri-lanka',
    label: 'Sri Lanka',
    letter: 'S',
    regions: [
      { name: 'Western Province', cities: ['Colombo', 'Dehiwala-Mount Lavinia', 'Moratuwa', 'Negombo', 'Gampaha', 'Kalutara'] },
      { name: 'Central Province', cities: ['Kandy', 'Matale', 'Nuwara Eliya', 'Gampola', 'Dambulla'] },
      { name: 'Southern Province', cities: ['Galle', 'Matara', 'Hambantota', 'Tangalle', 'Hikkaduwa'] },
      { name: 'Northern Province', cities: ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya'] },
      { name: 'Eastern Province', cities: ['Trincomalee', 'Batticaloa', 'Ampara', 'Kalmunai'] },
      { name: 'North Western Province', cities: ['Kurunegala', 'Puttalam', 'Chilaw', 'Kuliyapitiya'] },
    ]
  },
  { value: 'sudan', label: 'Sudan', letter: 'S', regions: [{ name: 'Khartoum', cities: ['Khartoum', 'Omdurman', 'Port Sudan', 'Kassala', 'Nyala'] }] },
  { value: 'suriname', label: 'Suriname', letter: 'S', regions: [{ name: 'Paramaribo', cities: ['Paramaribo', 'Lelydorp', 'Nieuw Nickerie', 'Moengo', 'Nieuw Amsterdam'] }] },
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
  { value: 'syria', label: 'Syria', letter: 'S', regions: [{ name: 'Damascus', cities: ['Damascus', 'Aleppo', 'Homs', 'Latakia', 'Hama'] }] },

  // T
  { value: 'taiwan', label: 'Taiwan', letter: 'T', regions: [{ name: 'Taipei', cities: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Hsinchu'] }] },
  { value: 'tajikistan', label: 'Tajikistan', letter: 'T', regions: [{ name: 'Dushanbe', cities: ['Dushanbe', 'Khujand', 'Kulob', 'Qurghonteppa', 'Istaravshan'] }] },
  {
    value: 'tanzania',
    label: 'Tanzania',
    letter: 'T',
    regions: [
      { name: 'Dar es Salaam', cities: ['Dar es Salaam', 'Kinondoni', 'Ilala', 'Temeke', 'Ubungo'] },
      { name: 'Mwanza', cities: ['Mwanza', 'Nyamagana', 'Ilemela', 'Kwimba'] },
      { name: 'Arusha', cities: ['Arusha', 'Moshi', 'Karatu', 'Monduli', 'Namanga'] },
      { name: 'Dodoma', cities: ['Dodoma', 'Kondoa', 'Mpwapwa', 'Bahi'] },
      { name: 'Mbeya', cities: ['Mbeya', 'Tukuyu', 'Kyela', 'Chunya'] },
      { name: 'Morogoro', cities: ['Morogoro', 'Mvomero', 'Kilosa', 'Ulanga'] },
      { name: 'Kilimanjaro', cities: ['Moshi', 'Same', 'Hai', 'Rombo'] },
    ]
  },
  {
    value: 'thailand',
    label: 'Thailand',
    letter: 'T',
    regions: [
      { name: 'Bangkok', cities: ['Bangkok', 'Thonburi', 'Bang Rak', 'Phaya Thai', 'Ratchathewi', 'Din Daeng'] },
      { name: 'Chiang Mai', cities: ['Chiang Mai', 'Hang Dong', 'San Kamphaeng', 'Doi Saket', 'Saraphi'] },
      { name: 'Chonburi', cities: ['Pattaya', 'Chonburi', 'Laem Chabang', 'Bang Lamung', 'Si Racha'] },
      { name: 'Phuket', cities: ['Phuket City', 'Patong', 'Kathu', 'Chalong', 'Rawai'] },
      { name: 'Nakhon Ratchasima', cities: ['Nakhon Ratchasima', 'Pak Chong', 'Muak Lek', 'Kaeng Sanam Nang'] },
      { name: 'Songkhla', cities: ['Hat Yai', 'Songkhla', 'Rattaphum', 'Sadao'] },
    ]
  },
  { value: 'timor-leste', label: 'Timor-Leste', letter: 'T', regions: [{ name: 'Dili', cities: ['Dili', 'Baucau', 'Lospalos', 'Maliana', 'Suai'] }] },
  { value: 'togo', label: 'Togo', letter: 'T', regions: [{ name: 'Maritime', cities: ['Lomé', 'Sokodé', 'Kara', 'Atakpamé', 'Kpalimé'] }] },
  { value: 'tonga', label: 'Tonga', letter: 'T', regions: [{ name: 'Central', cities: ['Nuku\'alofa', 'Mu\'a', 'Neiafu', 'Haveluloto', 'Vaini'] }] },
  { value: 'trinidad-tobago', label: 'Trinidad and Tobago', letter: 'T', regions: [{ name: 'Port of Spain', cities: ['Port of Spain', 'Chaguanas', 'San Fernando', 'Arima', 'Point Fortin'] }] },
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
  { value: 'turkmenistan', label: 'Turkmenistan', letter: 'T', regions: [{ name: 'Ashgabat', cities: ['Ashgabat', 'Türkmenabat', 'Daşoguz', 'Mary', 'Balkanabat'] }] },
  { value: 'tuvalu', label: 'Tuvalu', letter: 'T', regions: [{ name: 'Central', cities: ['Funafuti', 'Vaiaku', 'Alapi', 'Asau', 'Lolua'] }] },

  // U
  {
    value: 'uganda',
    label: 'Uganda',
    letter: 'U',
    regions: [
      { name: 'Central Region', cities: ['Kampala', 'Entebbe', 'Mukono', 'Wakiso', 'Mpigi', 'Masaka'] },
      { name: 'Eastern Region', cities: ['Jinja', 'Mbale', 'Tororo', 'Iganga', 'Soroti', 'Busia'] },
      { name: 'Northern Region', cities: ['Gulu', 'Lira', 'Arua', 'Kitgum', 'Moroto'] },
      { name: 'Western Region', cities: ['Mbarara', 'Fort Portal', 'Kasese', 'Kabale', 'Hoima', 'Bushenyi'] },
    ]
  },
  {
    value: 'ukraine',
    label: 'Ukraine',
    letter: 'U',
    regions: [
      { name: 'Kyiv', cities: ['Kyiv', 'Brovary', 'Bila Tserkva', 'Boryspil', 'Fastiv', 'Irpin'] },
      { name: 'Kharkiv', cities: ['Kharkiv', 'Lozova', 'Chuhuiv', 'Izyum', 'Balakliia'] },
      { name: 'Odesa', cities: ['Odesa', 'Bilhorod-Dnistrovskyi', 'Chornomorsk', 'Podilsk', 'Yuzhne'] },
      { name: 'Dnipropetrovsk', cities: ['Dnipro', 'Kryvyi Rih', 'Kamianske', 'Nikopol', 'Pavlohrad'] },
      { name: 'Lviv', cities: ['Lviv', 'Drohobych', 'Chervonohrad', 'Stryi', 'Sambir'] },
      { name: 'Zaporizhzhia', cities: ['Zaporizhzhia', 'Melitopol', 'Berdiansk', 'Enerhodar'] },
      { name: 'Donetsk', cities: ['Mariupol', 'Kramatorsk', 'Sloviansk', 'Bakhmut', 'Pokrovsk'] },
    ]
  },
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
      { name: 'England - London', cities: ['London', 'Westminster', 'Camden', 'Islington', 'Hackney', 'Tower Hamlets', 'Greenwich', 'Lambeth', 'Southwark', 'Lewisham', 'Wandsworth', 'Hammersmith'] },
      { name: 'England - South East', cities: ['Brighton', 'Oxford', 'Cambridge', 'Reading', 'Southampton', 'Portsmouth', 'Milton Keynes', 'Luton', 'Canterbury', 'Crawley', 'Slough', 'Maidstone'] },
      { name: 'England - South West', cities: ['Bristol', 'Plymouth', 'Bournemouth', 'Swindon', 'Exeter', 'Bath', 'Gloucester', 'Torbay', 'Cheltenham'] },
      { name: 'England - North West', cities: ['Manchester', 'Liverpool', 'Bolton', 'Salford', 'Stockport', 'Preston', 'Blackpool', 'Warrington', 'Oldham', 'Chester', 'Blackburn', 'Wigan'] },
      { name: 'England - Midlands', cities: ['Birmingham', 'Nottingham', 'Leicester', 'Coventry', 'Wolverhampton', 'Derby', 'Stoke-on-Trent', 'Northampton', 'Worcester'] },
      { name: 'England - Yorkshire', cities: ['Leeds', 'Sheffield', 'Bradford', 'York', 'Hull', 'Huddersfield', 'Wakefield', 'Doncaster', 'Rotherham', 'Barnsley'] },
      { name: 'England - North East', cities: ['Newcastle', 'Sunderland', 'Middlesbrough', 'Gateshead', 'Durham', 'Hartlepool', 'Darlington'] },
      { name: 'Scotland', cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness', 'Stirling', 'Perth', 'Paisley', 'East Kilbride', 'Livingston'] },
      { name: 'Wales', cities: ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry', 'Merthyr Tydfil', 'Neath', 'Cwmbran', 'Pontypridd', 'Llanelli'] },
      { name: 'Northern Ireland', cities: ['Belfast', 'Derry', 'Lisburn', 'Newry', 'Armagh', 'Bangor', 'Craigavon', 'Ballymena', 'Newtownabbey'] },
    ]
  },
  {
    value: 'usa',
    label: 'United States',
    letter: 'U',
    regions: [
      { name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Oakland', 'Fresno', 'Long Beach', 'Santa Ana', 'Anaheim', 'Riverside', 'Bakersfield', 'Irvine', 'Fremont'] },
      { name: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica', 'White Plains', 'Troy'] },
      { name: 'Texas', cities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Laredo', 'Lubbock', 'Irving', 'Garland', 'Frisco'] },
      { name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'Tallahassee', 'St. Petersburg', 'Hialeah', 'Port St. Lucie', 'Cape Coral', 'Pembroke Pines', 'Hollywood'] },
      { name: 'Illinois', cities: ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield', 'Peoria', 'Elgin', 'Waukegan', 'Cicero', 'Champaign', 'Bloomington'] },
      { name: 'Pennsylvania', cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster', 'Harrisburg', 'Altoona', 'York'] },
      { name: 'Ohio', cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Youngstown', 'Lorain', 'Hamilton'] },
      { name: 'Georgia', cities: ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Macon', 'Albany', 'Warner Robins'] },
      { name: 'North Carolina', cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington', 'High Point', 'Asheville'] },
      { name: 'Michigan', cities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Flint', 'Dearborn', 'Livonia', 'Troy'] },
      { name: 'Massachusetts', cities: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'Quincy', 'Lynn', 'New Bedford', 'Newton', 'Somerville'] },
      { name: 'Washington', cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Spokane Valley', 'Federal Way'] },
      { name: 'Arizona', cities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe', 'Peoria', 'Surprise'] },
      { name: 'Virginia', cities: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Roanoke', 'Portsmouth', 'Arlington'] },
      { name: 'Colorado', cities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Westminster', 'Pueblo', 'Boulder'] },
    ]
  },
  { value: 'uruguay', label: 'Uruguay', letter: 'U', regions: [{ name: 'Montevideo', cities: ['Montevideo', 'Salto', 'Paysandú', 'Las Piedras', 'Rivera'] }] },
  { value: 'uzbekistan', label: 'Uzbekistan', letter: 'U', regions: [{ name: 'Tashkent', cities: ['Tashkent', 'Samarkand', 'Namangan', 'Andijan', 'Bukhara'] }] },

  // V
  { value: 'vanuatu', label: 'Vanuatu', letter: 'V', regions: [{ name: 'Central', cities: ['Port Vila', 'Luganville', 'Norsup', 'Isangel', 'Sola'] }] },
  { value: 'vatican-city', label: 'Vatican City', letter: 'V', regions: [{ name: 'Central', cities: ['Vatican City'] }] },
  {
    value: 'venezuela',
    label: 'Venezuela',
    letter: 'V',
    regions: [
      { name: 'Capital District', cities: ['Caracas', 'La Guaira', 'Los Teques', 'Guarenas', 'Guatire'] },
      { name: 'Zulia', cities: ['Maracaibo', 'Cabimas', 'Ciudad Ojeda', 'Machiques', 'Santa Rita'] },
      { name: 'Carabobo', cities: ['Valencia', 'Puerto Cabello', 'Guacara', 'San Diego', 'Naguanagua'] },
      { name: 'Lara', cities: ['Barquisimeto', 'Cabudare', 'Quibor', 'El Tocuyo', 'Carora'] },
      { name: 'Aragua', cities: ['Maracay', 'Turmero', 'Cagua', 'La Victoria', 'El Limón'] },
      { name: 'Anzoátegui', cities: ['Barcelona', 'Puerto La Cruz', 'Lechería', 'El Tigre'] },
    ]
  },
  {
    value: 'vietnam',
    label: 'Vietnam',
    letter: 'V',
    regions: [
      { name: 'Hanoi', cities: ['Hanoi', 'Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Đống Đa', 'Tay Hồ', 'Cầu Giấy'] },
      { name: 'Ho Chi Minh City', cities: ['Ho Chi Minh City', 'Quận 1', 'Quận 3', 'Thủ Đức', 'Bình Thạnh', 'Tân Bình', 'Phú Nhuận'] },
      { name: 'Da Nang', cities: ['Da Nang', 'Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn'] },
      { name: 'Hai Phong', cities: ['Hai Phong', 'Hồng Bàng', 'Lê Chân', 'Ngô Quyền', 'Kiến An'] },
      { name: 'Can Tho', cities: ['Can Tho', 'Ninh Kiều', 'Cái Răng', 'Bình Thủy', 'Ố Môn'] },
      { name: 'Đồng Nai', cities: ['Bien Hoa', 'Long Khánh', 'Nhơn Trạch', 'Trảng Bom'] },
    ]
  },

  // Y
  {
    value: 'yemen',
    label: 'Yemen',
    letter: 'Y',
    regions: [
      { name: 'Sana\'a', cities: ['Sana\'a', 'Bani Hushaysh', 'Sanhan', 'Bilad Al Rus'] },
      { name: 'Aden', cities: ['Aden', 'Khormaksar', 'Crater', 'Al Mansura', 'Sheikh Othman'] },
      { name: 'Taiz', cities: ['Taiz', 'Al Turbah', 'Mawza', 'Al Wazi\'iyah'] },
      { name: 'Al Hudaydah', cities: ['Al Hudaydah', 'Bajil', 'Zabid', 'Bayt al-Faqih'] },
      { name: 'Ibb', cities: ['Ibb', 'Jiblah', 'Yarim', 'Al Makhadir'] },
      { name: 'Hadramaut', cities: ['Mukalla', 'Ash Shihr', 'Sayun', 'Tarim'] },
    ]
  },

  // Z
  { value: 'zambia', label: 'Zambia', letter: 'Z', regions: [{ name: 'Lusaka', cities: ['Lusaka', 'Kitwe', 'Ndola', 'Kabwe', 'Chingola'] }] },
  {
    value: 'zimbabwe',
    label: 'Zimbabwe',
    letter: 'Z',
    regions: [
      { name: 'Harare', cities: ['Harare', 'Chitungwiza', 'Epworth', 'Norton'] },
      { name: 'Bulawayo', cities: ['Bulawayo', 'Pumula', 'Nkulumane', 'Entumbane'] },
      { name: 'Manicaland', cities: ['Mutare', 'Rusape', 'Chipinge', 'Nyanga'] },
      { name: 'Midlands', cities: ['Gweru', 'Kwekwe', 'Redcliff', 'Gokwe'] },
      { name: 'Mashonaland East', cities: ['Marondera', 'Ruwa', 'Macheke', 'Goromonzi'] },
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
