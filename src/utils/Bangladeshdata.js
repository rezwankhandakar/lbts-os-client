// ═══════════════════════════════════════════════════════════════════
//  Bangladesh — Complete 64 Districts & all Thanas (Upazilas / Metro Thanas)
// ═══════════════════════════════════════════════════════════════════
//
//  Source: Bangladesh Police (police.gov.bd), DMP/CMP/RMP/KMP/SMP/BMP/RpMP/GMP,
//  bangladesh.gov.bd, Wikipedia (verified Nov 2025).
//
//  Structure:
//    DISTRICTS_WITH_THANAS = {
//      "Dhaka": ["Ramna Model", "Dhanmondi", ..., "Dohar"],
//      "Gazipur": ["Joydebpur", ...],
//      ...
//    }
//
//  Used by:
//    - localAddressMatcher.js  (fuzzy detect thana+district from address text)
//    - AddChallan thana / district fields  (1-2 letter typeahead suggestions)
// ═══════════════════════════════════════════════════════════════════

export const DISTRICTS_WITH_THANAS = {
  // ───── 1. Dhaka Division ─────
  "Dhaka": [
    "Ramna Model", "Dhanmondi", "New Market", "Kalabagan", "Shahbagh",
    "Tejgaon", "Tejgaon Industrial Area", "Mohammadpur", "Adabor",
    "Sher-e-Bangla Nagar", "Hazaribagh", "Lalbagh", "Chawkbazar",
    "Kotwali", "Bangshal", "Sutrapur", "Wari", "Gendaria",
    "Kamrangirchar", "Motijheel", "Paltan Model", "Shahjahanpur",
    "Rampura", "Khilgaon", "Sabujbagh", "Mugda", "Demra", "Jatrabari",
    "Kadamtoli", "Shyampur", "Mirpur Model", "Pallabi", "Kafrul",
    "Shah Ali", "Darus Salam", "Rupnagar", "Bhashantek", "Gulshan",
    "Banani", "Badda", "Bhatara", "Cantonment", "Khilkhet",
    "Uttara East", "Uttara West", "Turag", "Dakshinkhan", "Uttarkhan",
    "Airport", "Hatirjheel",
    "Savar Model", "Ashulia", "Dhamrai", "Keraniganj Model",
    "South Keraniganj", "Nawabganj", "Dohar"
  ],
  "Gazipur": [
    "Joydebpur", "Basan", "Konabari", "Gacha", "Tongi East", "Tongi West",
    "Kashimpur", "Pubail",
    "Kaliganj", "Kapasia", "Sreepur", "Kaliakair"
  ],
  "Narayanganj": [
    "Narayanganj Sadar Model", "Bandar", "Fatullah Model", "Siddhirganj",
    "Araihazar", "Sonargaon", "Rupganj"
  ],
  "Tangail": [
    "Tangail Sadar Model", "Bhuapur", "Ghatail", "Mirzapur", "Nagarpur",
    "Madhupur", "Dhanbari", "Gopalpur", "Kalihati", "Basail", "Sakhipur",
    "Delduar"
  ],
  "Kishoreganj": [
    "Kishoreganj Sadar Model", "Hossainpur", "Karimganj", "Tarail",
    "Pakundia", "Katiadi Model", "Kuliarchar", "Bhairab", "Nikli",
    "Bajitpur", "Itna", "Mithamoin", "Austagram"
  ],
  "Manikganj": [
    "Manikganj Sadar Model", "Singair", "Shibalaya", "Saturia",
    "Harirampur", "Ghior", "Daulatpur"
  ],
  "Munshiganj": [
    "Munshiganj Sadar Model", "Sreenagar", "Sirajdikhan", "Louhajang",
    "Gazaria", "Tongibari"
  ],
  "Narsingdi": [
    "Narsingdi Sadar Model", "Palash", "Shibpur", "Monohardi", "Belabo",
    "Raipura"
  ],
  "Faridpur": [
    "Faridpur Kotwali", "Boalmari", "Alfadanga", "Madhukhali", "Bhanga",
    "Nagarkanda", "Charbhadrasan", "Sadarpur", "Saltha"
  ],
  "Gopalganj": [
    "Gopalganj Sadar", "Tungipara", "Kotalipara", "Kashiani", "Muksudpur"
  ],
  "Madaripur": [
    "Madaripur Sadar", "Shibchar", "Kalkini", "Rajoir", "Dasar"
  ],
  "Shariatpur": [
    "Palong", "Naria", "Zajira", "Gosairhat", "Bhedarganj", "Damudya"
  ],
  "Rajbari": [
    "Rajbari Sadar", "Goalanda", "Pangsha", "Baliakandi", "Kalukhali"
  ],

  // ───── 2. Chattogram Division ─────
  "Chattogram": [
    "Kotwali", "Panchlaish", "Chandgaon", "Double Mooring", "Pahartali",
    "Bandar", "Bayezid Bostami", "Halishahar", "Karnaphuli", "Patenga",
    "Bakalia", "Akbar Shah", "Sadarghat", "EPZ", "Chawkbazar", "Khulshi",
    "Mirsharai", "Sitakunda", "Sandwip", "Fatikchhari", "Hathazari",
    "Raozan", "Rangunia", "Boalkhali", "Anwara", "Chandanaish", "Patiya",
    "Satkania", "Lohagara", "Banshkhali"
  ],
  "Cox's Bazar": [
    "Cox's Bazar Sadar Model", "Ramu", "Chakaria", "Ukhia", "Teknaf",
    "Maheshkhali", "Kutubdia", "Pekua", "Eidgaon"
  ],
  "Cumilla": [
    "Kotwali Model", "Sadar Dakshin Model", "Daudkandi", "Homna",
    "Muradnagar", "Debidwar", "Chandina", "Barura", "Laksam",
    "Chouddagram", "Brahmanpara", "Meghna", "Titas", "Monohorganj",
    "Lalmai", "Nangalkot", "Burichang"
  ],
  "Brahmanbaria": [
    "Brahmanbaria Sadar Model", "Nabinagar", "Nasirnagar", "Sarail",
    "Ashuganj", "Akhaura", "Kasba", "Bancharampur", "Bijoynagar"
  ],
  "Chandpur": [
    "Chandpur Sadar Model", "Faridganj", "Haimchar", "Kachua",
    "Shahrasti", "Matlab South", "Hajiganj", "Matlab North"
  ],
  "Feni": [
    "Feni Sadar Model", "Chhagalnaiya", "Fulgazi", "Parshuram",
    "Daganbhuiyan", "Sonagazi"
  ],
  "Lakshmipur": [
    "Lakshmipur Sadar Model", "Raipur", "Ramgati", "Kamalnagar", "Ramganj"
  ],
  "Noakhali": [
    "Sudharam Model", "Companiganj", "Begumganj", "Hatiya", "Subarnachar",
    "Kabirhat", "Senbagh", "Chatkhil", "Sonaimuri"
  ],
  "Rangamati": [
    "Kotwali", "Kaptai", "Kawkhali", "Baghaichhari", "Barkal", "Langadu",
    "Rajasthali", "Bilaichhari", "Juraichhari", "Naniarchar"
  ],
  "Khagrachhari": [
    "Khagrachhari Sadar", "Dighinala", "Panchhari", "Lakshmichhari",
    "Mahalchhari", "Manikchhari", "Ramgarh", "Matiranga", "Guimara"
  ],
  "Bandarban": [
    "Bandarban Sadar", "Alikadam", "Naikhongchhari", "Rowangchhari",
    "Lama", "Ruma", "Thanchi"
  ],

  // ───── 3. Rajshahi Division ─────
  "Rajshahi": [
    "Boalia Model", "Rajpara", "Motihar", "Chandrima", "Shah Makhdum",
    "Kashiadanga", "Airport", "Damkura", "Karnahar", "Katakhali", "Paba",
    "Belpukur",
    "Godagari", "Tanore", "Mohonpur", "Bagmara", "Durgapur", "Puthia",
    "Charghat", "Bagha"
  ],
  "Chapainawabganj": [
    "Chapainawabganj Sadar Model", "Gomastapur", "Nachole", "Bholahat",
    "Shibganj"
  ],
  "Naogaon": [
    "Naogaon Sadar Model", "Raninagar", "Atrai", "Niamatpur", "Manda",
    "Badalgachhi", "Patnitala", "Dhamoirhat", "Mahadebpur", "Porsha",
    "Sapahar"
  ],
  "Natore": [
    "Natore Sadar", "Singra", "Baraigram", "Bagatipara", "Lalpur",
    "Gurudaspur", "Naldanga"
  ],
  "Pabna": [
    "Pabna Sadar", "Sujanagar", "Ishwardi", "Bhangura", "Chatmohar",
    "Faridpur", "Bera", "Atgharia", "Santhia"
  ],
  "Sirajganj": [
    "Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur",
    "Raiganj", "Shahjadpur", "Tarash", "Ullapara"
  ],
  "Bogura": [
    "Bogura Sadar", "Kahaloo", "Shajahanpur", "Shibganj", "Sariakandi",
    "Sonatala", "Dhunat", "Gabtali", "Nandigram", "Sherpur", "Dupchanchia",
    "Adamdighi"
  ],
  "Joypurhat": [
    "Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi"
  ],

  // ───── 4. Rangpur Division ─────
  "Rangpur": [
    "Kotwali", "Haragach", "Mahiganj", "Tajhat", "Parshuram", "Hajirhat",
    "Badarganj", "Mithapukur", "Pirganj", "Kaunia", "Taraganj",
    "Pirgachha", "Gangachara"
  ],
  "Dinajpur": [
    "Kotwali Model", "Nawabganj", "Birganj", "Ghoraghat", "Birampur",
    "Parbatipur", "Bochaganj", "Kaharole", "Fulbari", "Biral", "Hakimpur",
    "Khansama", "Chirirbandar"
  ],
  "Kurigram": [
    "Kurigram Sadar", "Nageshwari", "Bhurungamari", "Fulbari", "Rajarhat",
    "Ulipur", "Chilmari", "Rowmari", "Char Rajibpur"
  ],
  "Gaibandha": [
    "Gaibandha Sadar", "Sadullapur", "Palashbari", "Saghata",
    "Gobindaganj", "Sundarganj", "Fulchhari"
  ],
  "Lalmonirhat": [
    "Lalmonirhat Sadar", "Kaliganj", "Hatibandha", "Patgram", "Aditmari"
  ],
  "Nilphamari": [
    "Nilphamari Sadar", "Saidpur", "Jaldhaka", "Kishoreganj", "Domar",
    "Dimla"
  ],
  "Panchagarh": [
    "Panchagarh Sadar", "Debiganj", "Boda", "Atwari", "Tetulia"
  ],
  "Thakurgaon": [
    "Thakurgaon Sadar", "Pirganj", "Ranisankail", "Haripur", "Baliadangi"
  ],

  // ───── 5. Khulna Division ─────
  "Khulna": [
    "Khulna Sadar", "Sonadanga", "Khalishpur", "Daulatpur", "Khanjahan Ali",
    "Labanchara", "Harintana", "Aranghata",
    "Dighalia", "Phultala", "Terokhada", "Rupsha", "Batiaghata",
    "Dumuria", "Dakope", "Paikgachha", "Koyra"
  ],
  "Bagerhat": [
    "Bagerhat Sadar Model", "Fakirhat", "Mollahat", "Chitalmari", "Kachua",
    "Morrelganj", "Sharankhola", "Rampal", "Mongla"
  ],
  "Satkhira": [
    "Satkhira Sadar", "Assasuni", "Debhata", "Kaliganj", "Kalaroa", "Tala",
    "Shyamnagar"
  ],
  "Jashore": [
    "Kotwali Model", "Sharsha", "Jhikargachha", "Chaugachha", "Abhaynagar",
    "Manirampur", "Keshabpur", "Bagherpara", "Benapole Port"
  ],
  "Magura": [
    "Magura Sadar", "Sreepur", "Mohammadpur", "Shalikha"
  ],
  "Jhenaidah": [
    "Jhenaidah Sadar", "Shailkupa", "Harinakunda", "Kaliganj", "Kotchandpur",
    "Maheshpur"
  ],
  "Narail": [
    "Narail Sadar", "Lohagara", "Kalia"
  ],
  "Kushtia": [
    "Kushtia Model", "Kumarkhali", "Khoksa", "Bheramara", "Mirpur",
    "Daulatpur"
  ],
  "Chuadanga": [
    "Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"
  ],
  "Meherpur": [
    "Meherpur Sadar", "Gangni", "Mujibnagar"
  ],

  // ───── 6. Barishal Division ─────
  "Barishal": [
    "Kotwali Model", "Kawnia", "Bandar", "Airport",
    "Bakerganj", "Babuganj", "Wazirpur", "Banaripara", "Gauranadi",
    "Agailjhara", "Mehendiganj", "Muladi", "Hizla"
  ],
  "Bhola": [
    "Bhola Sadar Model", "Borhanuddin", "Charfasson", "Daulatkhan",
    "Monpura", "Tazumuddin", "Lalmohan"
  ],
  "Pirojpur": [
    "Pirojpur Sadar", "Nazirpur", "Kawkhali", "Indurkani", "Bhandaria",
    "Mathbaria", "Nesarabad"
  ],
  "Patuakhali": [
    "Patuakhali Sadar", "Bauphal", "Dumki", "Dashmina", "Galachipa",
    "Kalapara", "Mirzaganj", "Rangabali"
  ],
  "Barguna": [
    "Barguna Sadar", "Amtali", "Betagi", "Bamna", "Patharghata", "Taltali"
  ],
  "Jhalokati": [
    "Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"
  ],

  // ───── 7. Sylhet Division ─────
  "Sylhet": [
    "Kotwali Model", "Jalalabad", "Airport", "South Surma", "Shahporan",
    "Moglabazar",
    "Bishwanath", "Osmaninagar", "Balaganj", "Golapganj", "Beanibazar",
    "Fenchuganj", "Zakiganj", "Kanaighat", "Jaintiapur", "Gowainghat",
    "Companiganj"
  ],
  "Moulvibazar": [
    "Moulvibazar Sadar Model", "Barlekha", "Juri", "Kulaura", "Rajnagar",
    "Sreemangal", "Kamalganj"
  ],
  "Habiganj": [
    "Habiganj Sadar Model", "Nabiganj", "Bahubal", "Ajmiriganj",
    "Baniachong", "Lakhai", "Chunarughat", "Madhabpur", "Shaistaganj"
  ],
  "Sunamganj": [
    "Sunamganj Sadar Model", "South Sunamganj", "Bishwambharpur", "Chhatak",
    "Jagannathpur", "Doarabazar", "Tahirpur", "Dharmapasha", "Jamalganj",
    "Shalla", "Dirai", "Madhyanagar"
  ],

  // ───── 8. Mymensingh Division ─────
  "Mymensingh": [
    "Kotwali Model", "Trishal", "Bhaluka", "Muktagachha", "Fulbaria",
    "Haluaghat", "Dhobaura", "Iswarganj", "Nandail", "Gouripur",
    "Gafargaon", "Tarakanda", "Fulpur"
  ],
  "Jamalpur": [
    "Jamalpur Sadar", "Melandaha", "Islampur", "Dewanganj", "Sarishabari",
    "Madarganj", "Bakshiganj"
  ],
  "Netrokona": [
    "Netrokona Model", "Barhatta", "Durgapur", "Kendua", "Atpara", "Madan",
    "Khaliajuri", "Kalmakanda", "Mohanganj", "Purbadhala"
  ],
  "Sherpur": [
    "Sherpur Sadar", "Nalitabari", "Sreebardi", "Nakla", "Jhinaigati"
  ],
};

// ─────────────────────────────────────────────────────────────────
//  Flat helper arrays
// ─────────────────────────────────────────────────────────────────

/** All 64 districts (plain English names). */
export const ALL_DISTRICTS = Object.keys(DISTRICTS_WITH_THANAS);

/** Flat list of every thana with its district (for fast scanning). */
export const ALL_THANAS = (() => {
  const list = [];
  for (const district of ALL_DISTRICTS) {
    for (const thana of DISTRICTS_WITH_THANAS[district]) {
      list.push({ thana, district });
    }
  }
  return list;
})();

/**
 *  THANA_TO_DISTRICTS — same thana name can exist in multiple districts
 *  (e.g. "Kotwali" exists in many districts).  Lowercase key → array.
 */
export const THANA_TO_DISTRICTS = (() => {
  const map = new Map();
  for (const { thana, district } of ALL_THANAS) {
    const key = thana.toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(district);
  }
  return map;
})();