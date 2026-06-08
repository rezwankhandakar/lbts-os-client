
// ═══════════════════════════════════════════════════════════════════
//  Bangladesh — Complete 64 Districts & all Thanas (Upazilas / Metro Thanas)
//  FIXED VERSION — duplicate Sadar thanas removed
// ═══════════════════════════════════════════════════════════════════
//
//  Source: Bangladesh Police (police.gov.bd), DMP/CMP/RMP/KMP/SMP/BMP/RpMP/GMP,
//  bangladesh.gov.bd, Wikipedia (verified Nov 2025).
//
//  ⚠️  IMPORTANT CHANGE FROM PREVIOUS VERSION:
//    The earlier version listed BOTH the canonical police-name AND
//    a "<District> Sadar" alias inside each district array, e.g.:
//        "Rangamati": ["Kotwali", "Rangamati Sadar", ...]
//    This duplicated the same thana into the flat ALL_THANAS list and
//    poisoned THANA_TO_DISTRICTS for multi-district names like "Kotwali".
//    Now each district lists each thana EXACTLY ONCE under its canonical
//    police name. The "<District> Sadar" alias is handled via
//    THANA_ALIASES instead, which is the right place for user-typed
//    variants.
//
//  Affected districts (canonical name kept, "<District> Sadar" removed):
//     Shariatpur  → "Palong"      (was: Palong, Shariatpur Sadar)
//     Noakhali    → "Sudharam"    (was: Sudharam, Noakhali Sadar)
//     Rangamati   → "Kotwali"     (was: Kotwali, Rangamati Sadar)
//     Chattogram  → "Kotwali"     (was: Kotwali, Chattogram Sadar)
//     Rajshahi    → "Boalia"      (was: Boalia, Rajshahi Sadar)
//     Rangpur     → "Kotwali"     (was: Kotwali, Rangpur Sadar)
//
//  Used by:
//    - localAddressMatcher.js  (fuzzy detect thana+district from address text)
//    - AddChallan thana / district fields  (1-2 letter typeahead suggestions)
// ═══════════════════════════════════════════════════════════════════

export const DISTRICTS_WITH_THANAS = {
  // ───── 1. Dhaka Division ─────
  "Dhaka": [
    "Ramna", "Dhanmondi", "New Market", "Kalabagan", "Shahbagh",
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
    "Savar", "Ashulia", "Dhamrai", "Keraniganj",
    "South Keraniganj", "Nawabganj", "Dohar"
  ],
  "Gazipur": [
    "Gazipur Sadar", "Joydebpur", "Basan", "Konabari", "Gacha",
    "Tongi East", "Tongi West", "Kashimpur", "Pubail",
    "Kaliganj", "Kapasia", "Sreepur", "Kaliakair"
  ],
  "Narayanganj": [
    "Narayanganj Sadar", "Bandar", "Fatullah Model", "Siddhirganj",
    "Araihazar", "Sonargaon", "Rupganj"
  ],
  "Tangail": [
    "Tangail Sadar", "Bhuapur", "Ghatail", "Mirzapur", "Nagarpur",
    "Madhupur", "Dhanbari", "Gopalpur", "Kalihati", "Basail", "Sakhipur",
    "Delduar"
  ],
  "Kishoreganj": [
    "Kishoreganj Sadar", "Hossainpur", "Karimganj", "Tarail",
    "Pakundia", "Katiadi Model", "Kuliarchar", "Bhairab", "Nikli",
    "Bajitpur", "Itna", "Mithamoin", "Austagram"
  ],
  "Manikganj": [
    "Manikganj Sadar", "Singair", "Shibalaya", "Saturia",
    "Harirampur", "Ghior", "Daulatpur"
  ],
  "Munshiganj": [
    "Munshiganj Sadar", "Sreenagar", "Sirajdikhan", "Louhajang",
    "Gazaria", "Tongibari"
  ],
  "Narsingdi": [
    "Narsingdi Sadar", "Palash", "Shibpur", "Monohardi", "Belabo",
    "Raipura"
  ],
  "Faridpur": [
    "Faridpur Sadar", "Boalmari", "Alfadanga", "Madhukhali", "Bhanga",
    "Nagarkanda", "Charbhadrasan", "Sadarpur", "Saltha"
  ],
  "Gopalganj": [
    "Gopalganj Sadar", "Tungipara", "Kotalipara", "Kashiani", "Muksudpur"
  ],
  "Madaripur": [
    "Madaripur Sadar", "Shibchar", "Kalkini", "Rajoir", "Dasar"
  ],
  // ✅ FIX: Shariatpur — removed "Shariatpur Sadar" duplicate; Palong is canonical.
  "Shariatpur": [
    "Palong", "Naria", "Zajira", "Gosairhat", "Bhedarganj", "Damudya"
  ],
  "Rajbari": [
    "Rajbari Sadar", "Goalanda", "Pangsha", "Baliakandi", "Kalukhali"
  ],

  // ───── 2. Chattogram Division ─────
  // ✅ FIX: Chattogram — removed "Chattogram Sadar" duplicate; Kotwali is canonical.
  "Chattogram": [
    "Kotwali", "Panchlaish", "Chandgaon", "Double Mooring", "Pahartali",
    "Bandar", "Bayezid Bostami", "Halishahar", "Karnaphuli", "Patenga",
    "Bakalia", "Akbar Shah", "Sadarghat", "EPZ", "Chawkbazar", "Khulshi",
    "Mirsharai", "Sitakunda", "Sandwip", "Fatikchhari", "Hathazari",
    "Raozan", "Rangunia", "Boalkhali", "Anwara", "Chandanaish", "Patiya",
    "Satkania", "Lohagara", "Banshkhali"
  ],
  "Cox's Bazar": [
    "Cox's Bazar Sadar", "Ramu", "Chakaria", "Ukhia", "Teknaf",
    "Maheshkhali", "Kutubdia", "Pekua", "Eidgaon"
  ],
  "Cumilla": [
    "Cumilla Sadar", "Sadar Dakshin", "Daudkandi", "Homna",
    "Muradnagar", "Debidwar", "Chandina", "Barura", "Laksam",
    "Chouddagram", "Brahmanpara", "Meghna", "Titas", "Monohorganj",
    "Lalmai", "Nangalkot", "Burichang"
  ],
  "Brahmanbaria": [
    "Brahmanbaria Sadar", "Nabinagar", "Nasirnagar", "Sarail",
    "Ashuganj", "Akhaura", "Kasba", "Bancharampur", "Bijoynagar"
  ],
  "Chandpur": [
    "Chandpur Sadar", "Faridganj", "Haimchar", "Kachua",
    "Shahrasti", "Matlab South", "Hajiganj", "Matlab North"
  ],
  "Feni": [
    "Feni Sadar", "Chhagalnaiya", "Fulgazi", "Parshuram",
    "Daganbhuiyan", "Sonagazi"
  ],
  "Lakshmipur": [
    "Lakshmipur Sadar", "Raipur", "Ramgati", "Kamalnagar", "Ramganj"
  ],
  // ✅ FIX: Noakhali — removed "Noakhali Sadar" duplicate; Sudharam is canonical.
  "Noakhali": [
    "Sudharam", "Companiganj", "Begumganj", "Hatiya", "Subarnachar",
    "Kabirhat", "Senbagh", "Chatkhil", "Sonaimuri"
  ],
  // ✅ FIX: Rangamati — removed "Rangamati Sadar" duplicate; Kotwali is canonical.
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
  // ✅ FIX: Rajshahi — removed "Rajshahi Sadar" duplicate; Boalia is canonical.
  "Rajshahi": [
    "Boalia", "Rajpara", "Motihar", "Chandrima", "Shah Makhdum",
    "Kashiadanga", "Airport", "Damkura", "Karnahar", "Katakhali", "Paba",
    "Belpukur",
    "Godagari", "Tanore", "Mohonpur", "Bagmara", "Durgapur", "Puthia",
    "Charghat", "Bagha"
  ],
  "Chapainawabganj": [
    "Chapainawabganj Sadar", "Gomastapur", "Nachole", "Bholahat",
    "Shibganj"
  ],
  "Naogaon": [
    "Naogaon Sadar", "Raninagar", "Atrai", "Niamatpur", "Manda",
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
  // ✅ FIX: Rangpur — removed "Rangpur Sadar" duplicate; Kotwali is canonical.
  "Rangpur": [
    "Kotwali", "Haragach", "Mahiganj", "Tajhat", "Parshuram", "Hajirhat",
    "Badarganj", "Mithapukur", "Pirganj", "Kaunia", "Taraganj",
    "Pirgachha", "Gangachara"
  ],
  "Dinajpur": [
    "Dinajpur Sadar", "Nawabganj", "Birganj", "Ghoraghat", "Birampur",
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
    "Bagerhat Sadar", "Fakirhat", "Mollahat", "Chitalmari", "Kachua",
    "Morrelganj", "Sharankhola", "Rampal", "Mongla"
  ],
  "Satkhira": [
    "Satkhira Sadar", "Assasuni", "Debhata", "Kaliganj", "Kalaroa", "Tala",
    "Shyamnagar"
  ],
  "Jashore": [
    "Jashore Sadar", "Sharsha", "Jhikargachha", "Chaugachha", "Abhaynagar",
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
    "Kushtia Sadar", "Kumarkhali", "Khoksa", "Bheramara", "Mirpur",
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
    "Barishal Sadar", "Kawnia", "Bandar", "Airport",
    "Bakerganj", "Babuganj", "Wazirpur", "Banaripara", "Gauranadi",
    "Agailjhara", "Mehendiganj", "Muladi", "Hizla"
  ],
  "Bhola": [
    "Bhola Sadar", "Borhanuddin", "Charfasson", "Daulatkhan",
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
    "Sylhet Sadar", "Jalalabad", "Airport", "South Surma", "Shahporan",
    "Moglabazar",
    "Bishwanath", "Osmaninagar", "Balaganj", "Golapganj", "Beanibazar",
    "Fenchuganj", "Zakiganj", "Kanaighat", "Jaintiapur", "Gowainghat",
    "Companiganj"
  ],
  "Moulvibazar": [
    "Moulvibazar Sadar", "Barlekha", "Juri", "Kulaura", "Rajnagar",
    "Sreemangal", "Kamalganj"
  ],
  "Habiganj": [
    "Habiganj Sadar", "Nabiganj", "Bahubal", "Ajmiriganj",
    "Baniachong", "Lakhai", "Chunarughat", "Madhabpur", "Shaistaganj"
  ],
  "Sunamganj": [
    "Sunamganj Sadar", "South Sunamganj", "Bishwambharpur", "Chhatak",
    "Jagannathpur", "Doarabazar", "Tahirpur", "Dharmapasha", "Jamalganj",
    "Shalla", "Dirai", "Madhyanagar"
  ],

  // ───── 8. Mymensingh Division ─────
  "Mymensingh": [
    "Mymensingh Sadar", "Trishal", "Bhaluka", "Muktagachha", "Fulbaria",
    "Haluaghat", "Dhobaura", "Iswarganj", "Nandail", "Gouripur",
    "Gafargaon", "Tarakanda", "Fulpur"
  ],
  "Jamalpur": [
    "Jamalpur Sadar", "Melandaha", "Islampur", "Dewanganj", "Sarishabari",
    "Madarganj", "Bakshiganj"
  ],
  "Netrokona": [
    "Netrokona Sadar", "Barhatta", "Durgapur", "Kendua", "Atpara", "Madan",
    "Khaliajuri", "Kalmakanda", "Mohanganj", "Purbadhala"
  ],
  "Sherpur": [
    "Sherpur Sadar", "Nalitabari", "Sreebardi", "Nakla", "Jhinaigati"
  ],
};

// ═══════════════════════════════════════════════════════════════════
//  Sadar / Metropolitan-area thanas (the ⭐ wala thanas in the source).
//  Used to decide the auto-computed `location` field on submit:
//
//    • Dhaka district  →  ⭐ thana = "ISD"
//                         non-⭐ thana = "OSD-Thana"
//                         (Dhaka outside-metro thanas:
//                          Savar, Ashulia, Dhamrai, Keraniganj,
//                          South Keraniganj, Nawabganj, Dohar)
//    • Other districts →  ⭐ thana (Sadar / Metro) = "OSD-Metro"
//                         non-⭐ thana            = "OSD-Thana"
//
//  ✅ FIX: same dedup applied here as in DISTRICTS_WITH_THANAS.
// ═══════════════════════════════════════════════════════════════════

export const SADAR_METRO_THANAS = {
  // ── Dhaka District: DMP (Metropolitan) thanas — all ⭐ ──
  "Dhaka": new Set([
    "Ramna", "Dhanmondi", "New Market", "Kalabagan", "Shahbagh",
    "Tejgaon", "Tejgaon Industrial Area", "Mohammadpur", "Adabor",
    "Sher-e-Bangla Nagar", "Hazaribagh", "Lalbagh", "Chawkbazar",
    "Kotwali", "Bangshal", "Sutrapur", "Wari", "Gendaria",
    "Kamrangirchar", "Motijheel", "Paltan Model", "Shahjahanpur",
    "Rampura", "Khilgaon", "Sabujbagh", "Mugda", "Demra", "Jatrabari",
    "Kadamtoli", "Shyampur", "Mirpur Model", "Pallabi", "Kafrul",
    "Shah Ali", "Darus Salam", "Rupnagar", "Bhashantek", "Gulshan",
    "Banani", "Badda", "Bhatara", "Cantonment", "Khilkhet",
    "Uttara East", "Uttara West", "Turag", "Dakshinkhan", "Uttarkhan",
    "Airport", "Hatirjheel"
  ]),
  // ── Gazipur District: GMP (Metropolitan) thanas ──
  "Gazipur": new Set([
    "Gazipur Sadar", "Joydebpur", "Basan", "Konabari", "Gacha",
    "Tongi East", "Tongi West", "Kashimpur", "Pubail"
  ]),
  "Narayanganj":   new Set(["Narayanganj Sadar"]),
  "Tangail":       new Set(["Tangail Sadar"]),
  "Kishoreganj":   new Set(["Kishoreganj Sadar"]),
  "Manikganj":     new Set(["Manikganj Sadar"]),
  "Munshiganj":    new Set(["Munshiganj Sadar"]),
  "Narsingdi":     new Set(["Narsingdi Sadar"]),
  "Faridpur":      new Set(["Faridpur Sadar"]),
  "Gopalganj":     new Set(["Gopalganj Sadar"]),
  "Madaripur":     new Set(["Madaripur Sadar"]),
  "Shariatpur":    new Set(["Palong"]),                  // ✅ FIX
  "Rajbari":       new Set(["Rajbari Sadar"]),

  // ── Chattogram District: CMP (Metropolitan) thanas ──
  "Chattogram": new Set([
    "Kotwali", "Panchlaish", "Chandgaon", "Double Mooring", "Pahartali",
    "Bandar", "Bayezid Bostami", "Halishahar", "Karnaphuli", "Patenga",
    "Bakalia", "Akbar Shah", "Sadarghat", "EPZ", "Chawkbazar", "Khulshi"
  ]),                                                     // ✅ FIX (removed Chattogram Sadar)
  "Cox's Bazar":   new Set(["Cox's Bazar Sadar"]),
  "Cumilla":       new Set(["Cumilla Sadar"]),
  "Brahmanbaria":  new Set(["Brahmanbaria Sadar"]),
  "Chandpur":      new Set(["Chandpur Sadar"]),
  "Feni":          new Set(["Feni Sadar"]),
  "Lakshmipur":    new Set(["Lakshmipur Sadar"]),
  "Noakhali":      new Set(["Sudharam"]),                 // ✅ FIX
  "Rangamati":     new Set(["Kotwali"]),                  // ✅ FIX
  "Khagrachhari":  new Set(["Khagrachhari Sadar"]),
  "Bandarban":     new Set(["Bandarban Sadar"]),

  // ── Rajshahi District: RMP (Metropolitan) thanas ──
  "Rajshahi": new Set([
    "Boalia", "Rajpara", "Motihar", "Chandrima",
    "Shah Makhdum", "Kashiadanga", "Airport", "Damkura",
    "Karnahar", "Katakhali", "Paba", "Belpukur"
  ]),                                                     // ✅ FIX (removed Rajshahi Sadar)
  "Chapainawabganj": new Set(["Chapainawabganj Sadar"]),
  "Naogaon":      new Set(["Naogaon Sadar"]),
  "Natore":       new Set(["Natore Sadar"]),
  "Pabna":        new Set(["Pabna Sadar"]),
  "Sirajganj":    new Set(["Sirajganj Sadar"]),
  "Bogura":       new Set(["Bogura Sadar"]),
  "Joypurhat":    new Set(["Joypurhat Sadar"]),

  // ── Rangpur District: RpMP (Metropolitan) thanas ──
  "Rangpur": new Set([
    "Kotwali", "Haragach", "Mahiganj", "Tajhat", "Parshuram", "Hajirhat"
  ]),                                                     // ✅ FIX (removed Rangpur Sadar)
  "Dinajpur":     new Set(["Dinajpur Sadar"]),
  "Kurigram":     new Set(["Kurigram Sadar"]),
  "Gaibandha":    new Set(["Gaibandha Sadar"]),
  "Lalmonirhat":  new Set(["Lalmonirhat Sadar"]),
  "Nilphamari":   new Set(["Nilphamari Sadar"]),
  "Panchagarh":   new Set(["Panchagarh Sadar"]),
  "Thakurgaon":   new Set(["Thakurgaon Sadar"]),

  // ── Khulna District: KMP (Metropolitan) thanas ──
  "Khulna": new Set([
    "Khulna Sadar", "Sonadanga", "Khalishpur", "Daulatpur",
    "Khanjahan Ali", "Labanchara", "Harintana", "Aranghata"
  ]),
  "Bagerhat":     new Set(["Bagerhat Sadar"]),
  "Satkhira":     new Set(["Satkhira Sadar"]),
  "Jashore":      new Set(["Jashore Sadar"]),
  "Magura":       new Set(["Magura Sadar"]),
  "Jhenaidah":    new Set(["Jhenaidah Sadar"]),
  "Narail":       new Set(["Narail Sadar"]),
  "Kushtia":      new Set(["Kushtia Sadar"]),
  "Chuadanga":    new Set(["Chuadanga Sadar"]),
  "Meherpur":     new Set(["Meherpur Sadar"]),

  // ── Barishal District: BMP (Metropolitan) thanas ──
  "Barishal": new Set([
    "Barishal Sadar", "Kawnia", "Bandar", "Airport"
  ]),
  "Bhola":        new Set(["Bhola Sadar"]),
  "Pirojpur":     new Set(["Pirojpur Sadar"]),
  "Patuakhali":   new Set(["Patuakhali Sadar"]),
  "Barguna":      new Set(["Barguna Sadar"]),
  "Jhalokati":    new Set(["Jhalokati Sadar"]),

  // ── Sylhet District: SMP (Metropolitan) thanas ──
  "Sylhet": new Set([
    "Sylhet Sadar", "Jalalabad", "Airport",
    "South Surma", "Shahporan", "Moglabazar"
  ]),
  "Moulvibazar":  new Set(["Moulvibazar Sadar"]),
  "Habiganj":     new Set(["Habiganj Sadar"]),
  "Sunamganj":    new Set(["Sunamganj Sadar"]),

  // ── Mymensingh District (district police, not metro) ──
  "Mymensingh":   new Set(["Mymensingh Sadar"]),
  "Jamalpur":     new Set(["Jamalpur Sadar"]),
  "Netrokona":    new Set(["Netrokona Sadar"]),
  "Sherpur":      new Set(["Sherpur Sadar"]),
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
 *  (e.g. "Kotwali" exists in Dhaka, Chattogram, Rangamati, Rangpur).
 *  Lowercase key → array of districts.
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

// ═══════════════════════════════════════════════════════════════════
//  THANA_ALIASES — User-typed name variants & bazar/area names
//  ═══════════════════════════════════════════════════════════════════
//
//  Real Bangladesh addresses often use:
//    • Spelling variations           ("Newmarket" vs "New Market")
//    • Bazar / town / area names     ("Madhobdi", "Bashundhara")
//    • District-prefixed Sadar       ("Gazipur Sadar")
//    • Without "Model/Sadar" suffix  ("Kotwali")
//
//  This map provides EXPLICIT {thana, district} resolution for each
//  alias, so there is NO cross-district ambiguity.
//
//  ⚠️ All `thana` values below MUST EXIST in DISTRICTS_WITH_THANAS
//     under the matching `district`. Otherwise validation will reject
//     them on the server side.
//
//  Key  : normalised lowercase alias (no apostrophe/hyphen)
//  Value: { thana: <canonical thana from DISTRICTS_WITH_THANAS>,
//           district: <canonical district> }
//
//  Add new aliases here as you encounter them — system gets smarter.
// ═══════════════════════════════════════════════════════════════════

export const THANA_ALIASES = {
  // ──────────────────────────────────────────────────────────
  //  DHAKA DISTRICT — spelling variations & area names
  // ──────────────────────────────────────────────────────────
  "newmarket":           { thana: "New Market",            district: "Dhaka" },
  "ramna":               { thana: "Ramna",                 district: "Dhaka" },
  "sher e bangla":       { thana: "Sher-e-Bangla Nagar",   district: "Dhaka" },
  "shere bangla":        { thana: "Sher-e-Bangla Nagar",   district: "Dhaka" },
  "sher e bangla nagar": { thana: "Sher-e-Bangla Nagar",   district: "Dhaka" },
  "vatara":              { thana: "Bhatara",               district: "Dhaka" },
  "paltan":              { thana: "Paltan Model",          district: "Dhaka" },
  "uttara":              { thana: "Uttara West",           district: "Dhaka" },
  "savar":               { thana: "Savar",                 district: "Dhaka" },
  "keraniganj":          { thana: "Keraniganj",            district: "Dhaka" },
  "tejgaon industrial":  { thana: "Tejgaon Industrial Area", district: "Dhaka" },
  "rajarbagh":  { thana: "Shahjahanpur", district: "Dhaka" },

  // Dhaka — Popular bazar / sub-area names mapping to real thana
  "bashundhara":         { thana: "Bhatara",               district: "Dhaka" },
  "bashundhara ra":      { thana: "Bhatara",               district: "Dhaka" },
  "bashundhara r a":     { thana: "Bhatara",               district: "Dhaka" },
  "mohakhali":           { thana: "Banani",                district: "Dhaka" },
  "tejgaon":             { thana: "Tejgaon",               district: "Dhaka" },
  "niketan":             { thana: "Gulshan",               district: "Dhaka" },
  "baridhara":           { thana: "Gulshan",               district: "Dhaka" },
  "baridhara dohs":      { thana: "Cantonment",            district: "Dhaka" },
  "dohs":                { thana: "Cantonment",            district: "Dhaka" },
  "banasree":            { thana: "Khilgaon",              district: "Dhaka" },
  "aftabnagar":          { thana: "Badda",                 district: "Dhaka" },
  "merul badda":         { thana: "Badda",                 district: "Dhaka" },
  "rampura banasree":    { thana: "Rampura",               district: "Dhaka" },
  "agargaon":            { thana: "Sher-e-Bangla Nagar",   district: "Dhaka" },
  "shyamoli":            { thana: "Adabor",                district: "Dhaka" },
  "mohammadpur bus stand": { thana: "Mohammadpur",         district: "Dhaka" },
  "lalmatia":            { thana: "Mohammadpur",           district: "Dhaka" },
  "old dhaka":           { thana: "Lalbagh",               district: "Dhaka" },
  "azimpur":             { thana: "Lalbagh",               district: "Dhaka" },
  "elephant road":       { thana: "New Market",            district: "Dhaka" },
  "polashi":             { thana: "Lalbagh",               district: "Dhaka" },
  "shyamoli ring road":  { thana: "Adabor",                district: "Dhaka" },
  "mirpur":              { thana: "Mirpur Model",          district: "Dhaka" },
  "mirpur 1":            { thana: "Darus Salam",           district: "Dhaka" },
  "mirpur 2":            { thana: "Darus Salam",           district: "Dhaka" },
  "mirpur 10":           { thana: "Mirpur Model",          district: "Dhaka" },
  "mirpur 11":           { thana: "Pallabi",               district: "Dhaka" },
  "mirpur 12":           { thana: "Pallabi",               district: "Dhaka" },
  "mirpur 13":           { thana: "Pallabi",               district: "Dhaka" },
  "mirpur 14":           { thana: "Kafrul",                district: "Dhaka" },
  "kazipara":            { thana: "Mirpur Model",          district: "Dhaka" },
  "shewrapara":          { thana: "Mirpur Model",          district: "Dhaka" },
  "ibrahimpur":          { thana: "Kafrul",                district: "Dhaka" },
  "monipur":             { thana: "Mirpur Model",          district: "Dhaka" },
  "kalshi":              { thana: "Pallabi",               district: "Dhaka" },
  "uttara sector":       { thana: "Uttara West",           district: "Dhaka" },
  "uttara 3":            { thana: "Uttara West",           district: "Dhaka" },
  "uttara 7":            { thana: "Uttara West",           district: "Dhaka" },
  "uttara 11":           { thana: "Uttara West",           district: "Dhaka" },
  "uttara 13":           { thana: "Uttara West",           district: "Dhaka" },
  "tongi":               { thana: "Tongi East",            district: "Gazipur" },
  "abdullahpur":         { thana: "Uttara West",           district: "Dhaka" },
  "diabari":             { thana: "Turag",                 district: "Dhaka" },
  "ashkona":             { thana: "Dakshinkhan",           district: "Dhaka" },

  // ──────────────────────────────────────────────────────────
  //  GAZIPUR DISTRICT
  // ──────────────────────────────────────────────────────────
  "gazipur sadar":       { thana: "Gazipur Sadar",         district: "Gazipur" },
  "sadar gazipur":       { thana: "Gazipur Sadar",         district: "Gazipur" },
  "chowrasta":           { thana: "Gazipur Sadar",         district: "Gazipur" },
  "board bazar":         { thana: "Gacha",                 district: "Gazipur" },
  "national university": { thana: "Gacha",                 district: "Gazipur" },
  "tongi east":          { thana: "Tongi East",            district: "Gazipur" },
  "tongi west":          { thana: "Tongi West",            district: "Gazipur" },
  "tongi station":       { thana: "Tongi East",            district: "Gazipur" },

  // ──────────────────────────────────────────────────────────
  //  NARAYANGANJ DISTRICT
  // ──────────────────────────────────────────────────────────
  "narayanganj sadar":   { thana: "Narayanganj Sadar",     district: "Narayanganj" },
  "sadar narayanganj":   { thana: "Narayanganj Sadar",     district: "Narayanganj" },
  "fatullah":            { thana: "Fatullah Model",        district: "Narayanganj" },
  "chashara":            { thana: "Narayanganj Sadar",     district: "Narayanganj" },

  // ──────────────────────────────────────────────────────────
  //  NARSINGDI DISTRICT — including Madhobdi / Madhabdi case
  // ──────────────────────────────────────────────────────────
  "narsingdi sadar":     { thana: "Narsingdi Sadar",       district: "Narsingdi" },
  "sadar narsingdi":     { thana: "Narsingdi Sadar",       district: "Narsingdi" },
  "madhobdi":            { thana: "Narsingdi Sadar",       district: "Narsingdi" },
  "madhabdi":            { thana: "Narsingdi Sadar",       district: "Narsingdi" },
  "ghorashal":           { thana: "Palash",                district: "Narsingdi" },
  "panchdona":           { thana: "Narsingdi Sadar",       district: "Narsingdi" },

  // ──────────────────────────────────────────────────────────
  //  Other Dhaka Division Sadar disambiguation
  // ──────────────────────────────────────────────────────────
  "tangail sadar":       { thana: "Tangail Sadar",         district: "Tangail" },
  "sadar tangail":       { thana: "Tangail Sadar",         district: "Tangail" },
  "kishoreganj sadar":   { thana: "Kishoreganj Sadar",     district: "Kishoreganj" },
  "sadar kishoreganj":   { thana: "Kishoreganj Sadar",     district: "Kishoreganj" },
  "manikganj sadar":     { thana: "Manikganj Sadar",       district: "Manikganj" },
  "sadar manikganj":     { thana: "Manikganj Sadar",       district: "Manikganj" },
  "munshiganj sadar":    { thana: "Munshiganj Sadar",      district: "Munshiganj" },
  "sadar munshiganj":    { thana: "Munshiganj Sadar",      district: "Munshiganj" },
  "faridpur sadar":      { thana: "Faridpur Sadar",        district: "Faridpur" },
  "sadar faridpur":      { thana: "Faridpur Sadar",        district: "Faridpur" },
  "gopalganj sadar":     { thana: "Gopalganj Sadar",       district: "Gopalganj" },
  "sadar gopalganj":     { thana: "Gopalganj Sadar",       district: "Gopalganj" },
  "madaripur sadar":     { thana: "Madaripur Sadar",       district: "Madaripur" },
  "sadar madaripur":     { thana: "Madaripur Sadar",       district: "Madaripur" },
  // ✅ FIX: Shariatpur Sadar → canonical "Palong"
  "shariatpur sadar":    { thana: "Palong",                district: "Shariatpur" },
  "sadar shariatpur":    { thana: "Palong",                district: "Shariatpur" },
  "palong":              { thana: "Palong",                district: "Shariatpur" },
  "rajbari sadar":       { thana: "Rajbari Sadar",         district: "Rajbari" },
  "sadar rajbari":       { thana: "Rajbari Sadar",         district: "Rajbari" },

  // ──────────────────────────────────────────────────────────
  //  CHATTOGRAM DIVISION
  // ──────────────────────────────────────────────────────────
  // ✅ FIX: Chattogram Sadar → canonical "Kotwali" (under Chattogram)
  "chattogram sadar":    { thana: "Kotwali",               district: "Chattogram" },
  "sadar chattogram ":    { thana: "Kotwali",               district: "Chattogram" },
  "chittagong sadar":    { thana: "Kotwali",               district: "Chattogram" },
  "sadar chittagong":    { thana: "Kotwali",               district: "Chattogram" },
  "sadar ctg":    { thana: "Kotwali",               district: "Chattogram" },
  "ctg sadar":    { thana: "Kotwali",               district: "Chattogram" },
  "agrabad":             { thana: "Double Mooring",        district: "Chattogram" },
  "gec":                 { thana: "Panchlaish",            district: "Chattogram" },
  "nasirabad":           { thana: "Panchlaish",            district: "Chattogram" },
  "oxygen":              { thana: "Bayezid Bostami",       district: "Chattogram" },
  "muradpur":            { thana: "Panchlaish",            district: "Chattogram" },
  "coxs bazar sadar":    { thana: "Cox's Bazar Sadar",     district: "Cox's Bazar" },
  "sadar coxs bazar":    { thana: "Cox's Bazar Sadar",     district: "Cox's Bazar" },
  "cumilla sadar":       { thana: "Cumilla Sadar",         district: "Cumilla" },
  "sadar cumilla":       { thana: "Cumilla Sadar",         district: "Cumilla" },
  "comilla sadar":       { thana: "Cumilla Sadar",         district: "Cumilla" },
  "sadar comilla":       { thana: "Cumilla Sadar",         district: "Cumilla" },
  "comilla kotwali":     { thana: "Cumilla Sadar",         district: "Cumilla" },
  "kandirpar":           { thana: "Cumilla Sadar",         district: "Cumilla" },
  "brahmanbaria sadar":  { thana: "Brahmanbaria Sadar",    district: "Brahmanbaria" },
  "sadar brahmanbaria":  { thana: "Brahmanbaria Sadar",    district: "Brahmanbaria" },
  "chandpur sadar":      { thana: "Chandpur Sadar",        district: "Chandpur" },
  "sadar chandpur":      { thana: "Chandpur Sadar",        district: "Chandpur" },
  "feni sadar":          { thana: "Feni Sadar",            district: "Feni" },
  "sadar feni":          { thana: "Feni Sadar",            district: "Feni" },
  "lakshmipur sadar":    { thana: "Lakshmipur Sadar",      district: "Lakshmipur" },
  "sadar lakshmipur":    { thana: "Lakshmipur Sadar",      district: "Lakshmipur" },
  // ✅ FIX: Noakhali Sadar → canonical "Sudharam"
  "noakhali sadar":      { thana: "Sudharam",              district: "Noakhali" },
  "sadar noakhali":      { thana: "Sudharam",              district: "Noakhali" },
  "sudharam":            { thana: "Sudharam",              district: "Noakhali" },
  "maijdee":             { thana: "Sudharam",              district: "Noakhali" },
  "maijdi":              { thana: "Sudharam",              district: "Noakhali" },
  "chowmuhani":          { thana: "Begumganj",             district: "Noakhali" },
  // ✅ FIX: Rangamati Sadar → canonical "Kotwali" (under Rangamati)
  "rangamati sadar":     { thana: "Kotwali",               district: "Rangamati" },
  "sadar rangamati":     { thana: "Kotwali",               district: "Rangamati" },
  "khagrachari":         { thana: "Khagrachhari Sadar",    district: "Khagrachhari" },
  "khagrachari sadar":   { thana: "Khagrachhari Sadar",    district: "Khagrachhari" },
  "sadar khagrachari":   { thana: "Khagrachhari Sadar",    district: "Khagrachhari" },
  "bandarban sadar":     { thana: "Bandarban Sadar",       district: "Bandarban" },
  "sadar bandarban":     { thana: "Bandarban Sadar",       district: "Bandarban" },

  // ──────────────────────────────────────────────────────────
  //  RAJSHAHI DIVISION
  // ──────────────────────────────────────────────────────────
  // ✅ FIX: Rajshahi Sadar → canonical "Boalia"
  "rajshahi sadar":      { thana: "Boalia",                district: "Rajshahi" },
  "sadar rajshahi":      { thana: "Boalia",                district: "Rajshahi" },
  "rajsahi":             { thana: "Boalia",                district: "Rajshahi" },  // typo
  "shaheb bazar":        { thana: "Boalia",                district: "Rajshahi" },
  "boalia":              { thana: "Boalia",                district: "Rajshahi" },
  "binodpur":            { thana: "Motihar",               district: "Rajshahi" },
  "chapainawabganj sadar": { thana: "Chapainawabganj Sadar", district: "Chapainawabganj" },
  "sadar chapainawabganj": { thana: "Chapainawabganj Sadar", district: "Chapainawabganj" },
  "chapai":              { thana: "Chapainawabganj Sadar", district: "Chapainawabganj" },
  "nawabganj":           { thana: "Chapainawabganj Sadar", district: "Chapainawabganj" },
  "naogaon sadar":       { thana: "Naogaon Sadar",         district: "Naogaon" },
  "sadar naogaon":       { thana: "Naogaon Sadar",         district: "Naogaon" },
  "natore sadar":        { thana: "Natore Sadar",          district: "Natore" },
  "sadar natore":        { thana: "Natore Sadar",          district: "Natore" },
  "pabna sadar":         { thana: "Pabna Sadar",           district: "Pabna" },
  "sadar pabna":         { thana: "Pabna Sadar",           district: "Pabna" },
  "sirajganj sadar":     { thana: "Sirajganj Sadar",       district: "Sirajganj" },
  "sadar sirajganj":     { thana: "Sirajganj Sadar",       district: "Sirajganj" },
  "bogura sadar":        { thana: "Bogura Sadar",          district: "Bogura" },
  "sadar bogura":        { thana: "Bogura Sadar",          district: "Bogura" },
  "bogra":               { thana: "Bogura Sadar",          district: "Bogura" },
  "bogra sadar":         { thana: "Bogura Sadar",          district: "Bogura" },
  "joypurhat sadar":     { thana: "Joypurhat Sadar",       district: "Joypurhat" },
  "sadar joypurhat":     { thana: "Joypurhat Sadar",       district: "Joypurhat" },

  // ──────────────────────────────────────────────────────────
  //  RANGPUR DIVISION
  // ──────────────────────────────────────────────────────────
  // ✅ FIX: Rangpur Sadar → canonical "Kotwali" (under Rangpur)
  "rangpur sadar":       { thana: "Kotwali",               district: "Rangpur" },
  "sadar rangpur":       { thana: "Kotwali",               district: "Rangpur" },
  "modern more":         { thana: "Kotwali",               district: "Rangpur" },
  "dinajpur sadar":      { thana: "Dinajpur Sadar",        district: "Dinajpur" },
  "sadar dinajpur":      { thana: "Dinajpur Sadar",        district: "Dinajpur" },
  "kurigram sadar":      { thana: "Kurigram Sadar",        district: "Kurigram" },
  "sadar kurigram":      { thana: "Kurigram Sadar",        district: "Kurigram" },
  "gaibandha sadar":     { thana: "Gaibandha Sadar",       district: "Gaibandha" },
  "sadar gaibandha":     { thana: "Gaibandha Sadar",       district: "Gaibandha" },
  "lalmonirhat sadar":   { thana: "Lalmonirhat Sadar",     district: "Lalmonirhat" },
  "sadar lalmonirhat":   { thana: "Lalmonirhat Sadar",     district: "Lalmonirhat" },
  "nilphamari sadar":    { thana: "Nilphamari Sadar",      district: "Nilphamari" },
  "sadar nilphamari":    { thana: "Nilphamari Sadar",      district: "Nilphamari" },
  "panchagarh sadar":    { thana: "Panchagarh Sadar",      district: "Panchagarh" },
  "sadar panchagarh":    { thana: "Panchagarh Sadar",      district: "Panchagarh" },
  "thakurgaon sadar":    { thana: "Thakurgaon Sadar",      district: "Thakurgaon" },
  "sadar thakurgaon":    { thana: "Thakurgaon Sadar",      district: "Thakurgaon" },
  "syedpur":             { thana: "Saidpur",               district: "Nilphamari" },

  // ──────────────────────────────────────────────────────────
  //  KHULNA DIVISION
  // ──────────────────────────────────────────────────────────
  "khulna sadar":        { thana: "Khulna Sadar",          district: "Khulna" },
  "sadar khulna":        { thana: "Khulna Sadar",          district: "Khulna" },
  "newmarket khulna":    { thana: "Khulna Sadar",          district: "Khulna" },
  "bagerhat sadar":      { thana: "Bagerhat Sadar",        district: "Bagerhat" },
  "sadar bagerhat":      { thana: "Bagerhat Sadar",        district: "Bagerhat" },
  "satkhira sadar":      { thana: "Satkhira Sadar",        district: "Satkhira" },
  "sadar satkhira":      { thana: "Satkhira Sadar",        district: "Satkhira" },
  "jashore sadar":       { thana: "Jashore Sadar",         district: "Jashore" },
  "sadar jashore":       { thana: "Jashore Sadar",         district: "Jashore" },
  "jessore":             { thana: "Jashore Sadar",         district: "Jashore" },
  "jessore sadar":       { thana: "Jashore Sadar",         district: "Jashore" },
  "magura sadar":        { thana: "Magura Sadar",          district: "Magura" },
  "sadar magura":        { thana: "Magura Sadar",          district: "Magura" },
  "jhenaidah sadar":     { thana: "Jhenaidah Sadar",       district: "Jhenaidah" },
  "sadar jhenaidah":     { thana: "Jhenaidah Sadar",       district: "Jhenaidah" },
  "jhenaidha":           { thana: "Jhenaidah Sadar",       district: "Jhenaidah" },
  "narail sadar":        { thana: "Narail Sadar",          district: "Narail" },
  "sadar narail":        { thana: "Narail Sadar",          district: "Narail" },
  "kushtia sadar":       { thana: "Kushtia Sadar",         district: "Kushtia" },
  "sadar kushtia":       { thana: "Kushtia Sadar",         district: "Kushtia" },
  "kustia":              { thana: "Kushtia Sadar",         district: "Kushtia" },
  "chuadanga sadar":     { thana: "Chuadanga Sadar",       district: "Chuadanga" },
  "sadar chuadanga":     { thana: "Chuadanga Sadar",       district: "Chuadanga" },
  "meherpur sadar":      { thana: "Meherpur Sadar",        district: "Meherpur" },
  "sadar meherpur":      { thana: "Meherpur Sadar",        district: "Meherpur" },

  // ──────────────────────────────────────────────────────────
  //  BARISHAL DIVISION
  // ──────────────────────────────────────────────────────────
  "barishal sadar":      { thana: "Barishal Sadar",        district: "Barishal" },
  "sadar barishal":      { thana: "Barishal Sadar",        district: "Barishal" },
  "barisal sadar":       { thana: "Barishal Sadar",        district: "Barishal" },
  "sadar barisal":       { thana: "Barishal Sadar",        district: "Barishal" },
  "bhola sadar":         { thana: "Bhola Sadar",           district: "Bhola" },
  "sadar bhola":         { thana: "Bhola Sadar",           district: "Bhola" },
  "pirojpur sadar":      { thana: "Pirojpur Sadar",        district: "Pirojpur" },
  "sadar pirojpur":      { thana: "Pirojpur Sadar",        district: "Pirojpur" },
  "patuakhali sadar":    { thana: "Patuakhali Sadar",      district: "Patuakhali" },
  "sadar patuakhali":    { thana: "Patuakhali Sadar",      district: "Patuakhali" },
  "barguna sadar":       { thana: "Barguna Sadar",         district: "Barguna" },
  "sadar barguna":       { thana: "Barguna Sadar",         district: "Barguna" },
  "jhalokati sadar":     { thana: "Jhalokati Sadar",       district: "Jhalokati" },
  "sadar jhalokati":     { thana: "Jhalokati Sadar",       district: "Jhalokati" },
  "jhalokathi":          { thana: "Jhalokati Sadar",       district: "Jhalokati" },

  // ──────────────────────────────────────────────────────────
  //  SYLHET DIVISION
  // ──────────────────────────────────────────────────────────
  "sylhet sadar":        { thana: "Sylhet Sadar",          district: "Sylhet" },
  "sadar sylhet":        { thana: "Sylhet Sadar",          district: "Sylhet" },
  "zindabazar":          { thana: "Sylhet Sadar",          district: "Sylhet" },
  "amberkhana":          { thana: "Sylhet Sadar",          district: "Sylhet" },
  "moulvibazar sadar":   { thana: "Moulvibazar Sadar",     district: "Moulvibazar" },
  "sadar moulvibazar":   { thana: "Moulvibazar Sadar",     district: "Moulvibazar" },
  "sunamganj sadar":     { thana: "Sunamganj Sadar",       district: "Sunamganj" },
  "sadar sunamganj":     { thana: "Sunamganj Sadar",       district: "Sunamganj" },
  "habiganj sadar":      { thana: "Habiganj Sadar",        district: "Habiganj" },
  "sadar habiganj":      { thana: "Habiganj Sadar",        district: "Habiganj" },

  // ──────────────────────────────────────────────────────────
  //  MYMENSINGH DIVISION
  // ──────────────────────────────────────────────────────────
  "mymensingh sadar":    { thana: "Mymensingh Sadar",      district: "Mymensingh" },
  "sadar mymensingh":    { thana: "Mymensingh Sadar",      district: "Mymensingh" },
  "jamalpur sadar":      { thana: "Jamalpur Sadar",        district: "Jamalpur" },
  "sadar jamalpur":      { thana: "Jamalpur Sadar",        district: "Jamalpur" },
  "netrokona sadar":     { thana: "Netrokona Sadar",       district: "Netrokona" },
  "sadar netrokona":     { thana: "Netrokona Sadar",       district: "Netrokona" },
  "netrakona":           { thana: "Netrokona Sadar",       district: "Netrokona" },
  "sherpur sadar":       { thana: "Sherpur Sadar",         district: "Sherpur" },
  "sadar sherpur":       { thana: "Sherpur Sadar",         district: "Sherpur" },
};