/**
 * Emergency report templates for the seeded demo corpus.
 *
 * DEMO DATA. Not real incidents, not real people, not real phone numbers. The
 * console marks every case built from these as seeded, and the Pipeline tab
 * excludes them from its live-traffic counts, so nothing here is ever presented
 * as traffic this deployment handled.
 *
 * Written per language rather than translated from English, so the phrasing is
 * what a frightened person actually types — compressed, code-mixed, often
 * ungrammatical — instead of textbook prose run through a translator.
 *
 * Reviewed before landing. Two templates were cut for staging a real, named
 * disaster (the 2024 Wayanad and 2018 Kodagu landslides) at its actual location;
 * regenerating a named community's disaster as sample data is not acceptable in
 * a public repo. Several severities were corrected too — a domestic assault in
 * progress was filed MEDIUM, which would teach the console to deprioritise
 * exactly the call that must not wait.
 *
 * 162 templates across 13 languages.
 */

export type ReportTemplate = {
  lang: string;
  langCode: string;
  native: string;
  translit: string;
  english: string;
  category: string;
  severity: string;
  /** A plausible second message from the same caller, adding one new fact. */
  followUp: string;
};

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    "lang": "Hindi",
    "langCode": "hi-IN",
    "native": "आग लग गई है बिल्डिंग में!! धुआं इतना है कि सांस नहीं ले पा रहे। फायर ब्रिगेड जल्दी भेजो, इतवारी बस स्टैंड के पीछे वाली बिल्डिंग, नागपुर",
    "translit": "aag lag gayi hai building mein!! dhuan itna hai ki saans nahi le paa rahe. fire brigade jaldi bhejo, Itwari bus stand ke peeche wali building, Nagpur",
    "english": "There's a fire in the building! There's so much smoke we can't breathe. Send the fire brigade quickly, the building behind Itwari bus stand, Nagpur.",
    "category": "FIRE",
    "severity": "CRITICAL",
    "followUp": "हम चौथी मंजिल पर हैं, सीढ़ी की तरफ आग है, नीचे नहीं उतर सकते"
  },
  {
    "lang": "Hindi",
    "langCode": "hi-IN",
    "native": "सर बिजली के खंभे से चिंगारी निकल रही है, तार टूट के लटक गया है। स्कूल के पास वाली गली है, बच्चे आते जाते रहते हैं यहां से",
    "translit": "sir bijli ke khambe se chingari nikal rahi hai, taar toot ke latak gaya hai. school ke paas wali gali hai, bachche aate jaate rehte hain yahan se",
    "english": "Sir, sparks are coming off the electricity pole, a wire has snapped and is hanging down. It's the lane near the school, children pass through here all the time.",
    "category": "FIRE",
    "severity": "MEDIUM",
    "followUp": "आग अभी नहीं लगी है, पर तार ज़मीन से मुश्किल से एक फुट ऊपर लटक रहा है"
  },
  {
    "lang": "Hindi",
    "langCode": "hi-IN",
    "native": "पानी घर में घुस गया है, कमर तक आ चुका है। बाहर नहीं निकल पा रहे, बोट भेजिए please. पिंपरी वाला इलाका",
    "translit": "paani ghar mein ghus gaya hai, kamar tak aa chuka hai. bahar nahi nikal paa rahe, boat bhejiye please. Pimpri wala ilaaka",
    "english": "Water has come into the house, it's already waist-deep. We can't get out, please send a boat. The Pimpri area.",
    "category": "FLOOD",
    "severity": "HIGH",
    "followUp": "घर में पांच लोग हैं, एक 80 साल की दादी हैं जो खुद से चल नहीं सकतीं"
  },
  {
    "lang": "Hindi",
    "langCode": "hi-IN",
    "native": "भैया अंडरपास में पानी भर गया है, गाड़ियां बीच में बंद हो रही हैं। किसी ने बैरिकेड नहीं लगाया है, कोई खड़ा भी नहीं है वहां",
    "translit": "bhaiya underpass mein paani bhar gaya hai, gaadiyan beech mein band ho rahi hain. kisi ne barricade nahi lagaya hai, koi khada bhi nahi hai wahan",
    "english": "Brother, the underpass has filled with water, vehicles are stalling in the middle. Nobody has put up a barricade, there's no one posted there either.",
    "category": "FLOOD",
    "severity": "MEDIUM",
    "followUp": "अभी एक स्कूटी वाला गिरते गिरते बचा, पानी करीब दो फुट है बीच में"
  },
  {
    "lang": "Hindi",
    "langCode": "hi-IN",
    "native": "हाईवे पे एक्सीडेंट हो गया है, ट्रक ने बाइक को टक्कर मारी!! खून बहुत बह रहा है, ambulance जल्दी भेजो जल्दी",
    "translit": "highway pe accident ho gaya hai, truck ne bike ko takkar maari!! khoon bahut beh raha hai, ambulance jaldi bhejo jaldi",
    "english": "There's been an accident on the highway, a truck hit a motorcycle! There's a lot of bleeding, send an ambulance quickly, quickly.",
    "category": "ACCIDENT",
    "severity": "CRITICAL",
    "followUp": "बाइक पर दो लोग थे, एक होश में है और बात कर रहा है, दूसरा कोई जवाब नहीं दे रहा"
  },
  {
    "lang": "Hindi",
    "langCode": "hi-IN",
    "native": "ऑटो पलट गया है सर, मोड़ पे speed ज़्यादा थी। सवारी अंदर ही फंसी हुई है, हम खींच नहीं पा रहे",
    "translit": "auto palat gaya hai sir, mod pe speed zyada thi. sawaari andar hi phansi hui hai, hum kheench nahi paa rahe",
    "english": "An auto-rickshaw has overturned, sir, it was going too fast at the turn. The passengers are still stuck inside, we can't pull them out.",
    "category": "ACCIDENT",
    "severity": "HIGH",
    "followUp": "अंदर तीन लोग हैं, तीनों बात कर रहे हैं पर एक का पैर सीट के नीचे दबा है"
  },
  {
    "lang": "Hindi",
    "langCode": "hi-IN",
    "native": "पापा को सीने में दर्द हो रहा था और अब बेहोश हो गए हैं!! ambulance भेजो, मुझे बताओ मैं क्या करूं तब तक",
    "translit": "papa ko seene mein dard ho raha tha aur ab behosh ho gaye hain!! ambulance bhejo, mujhe batao main kya karun tab tak",
    "english": "My father was having chest pain and now he's become unconscious! Send an ambulance, tell me what to do until then.",
    "category": "MEDICAL",
    "severity": "CRITICAL",
    "followUp": "सांस चल रही है पर बहुत धीमी, उम्र 62 है और दिल की दवा पहले से चलती है उनकी"
  },
  {
    "lang": "Hindi",
    "langCode": "hi-IN",
    "native": "मेरी पत्नी को लेबर पेन शुरू हो गया है, गांव में कोई गाड़ी नहीं मिल रही। रात का टाइम है, कोई साधन नहीं है यहां",
    "translit": "meri patni ko labour pain shuru ho gaya hai, gaon mein koi gaadi nahi mil rahi. raat ka time hai, koi saadhan nahi hai yahan",
    "english": "My wife's labour pains have started, we can't find any vehicle in the village. It's night time, there's no transport here.",
    "category": "MEDICAL",
    "severity": "HIGH",
    "followUp": "नौवां महीना पूरा है, दर्द अब हर पांच मिनट में आ रहा है"
  },
  {
    "lang": "Hindi",
    "langCode": "hi-IN",
    "native": "दादी बाथरूम में गिर गई हैं, कूल्हे में दर्द है और उठ नहीं पा रहीं। होश में हैं, बात कर रही हैं हमसे",
    "translit": "dadi bathroom mein gir gayi hain, koolhe mein dard hai aur uth nahi paa rahin. hosh mein hain, baat kar rahi hain humse",
    "english": "My grandmother has fallen in the bathroom, her hip hurts and she can't get up. She's conscious and talking to us.",
    "category": "MEDICAL",
    "severity": "MEDIUM",
    "followUp": "कहीं से खून नहीं निकला है, पर एक पैर टेढ़ा सा लग रहा है"
  },
  {
    "lang": "Hindi",
    "langCode": "hi-IN",
    "native": "अभी अभी दो लड़के बाइक पर आके चेन खींच के भाग गए!! मेरी बहन सड़क पर गिर गई है",
    "translit": "abhi abhi do ladke bike par aake chain kheench ke bhaag gaye!! meri behen sadak par gir gayi hai",
    "english": "Just now two boys came on a motorcycle, snatched a chain and fled! My sister has fallen on the road.",
    "category": "CRIME",
    "severity": "HIGH",
    "followUp": "बाइक काले रंग की थी, नंबर नहीं देख पाए, वो सिग्नल की तरफ भागे हैं"
  },
  {
    "lang": "Hindi",
    "langCode": "hi-IN",
    "native": "बगल वाले फ्लैट में बहुत झगड़ा चल रहा है, चीखने की आवाज़ आ रही है। दरवाजा खटखटाया पर कोई खोल नहीं रहा",
    "translit": "bagal wale flat mein bahut jhagda chal raha hai, cheekhne ki aawaaz aa rahi hai. darwaza khatkhataya par koi khol nahi raha",
    "english": "There's a bad fight going on in the next flat, we can hear screaming. I knocked on the door but no one is opening it.",
    "category": "CRIME",
    "severity": "HIGH",
    "followUp": "औरत की आवाज़ है, और अंदर एक छोटा बच्चा भी रो रहा है"
  },
  {
    "lang": "Hindi",
    "langCode": "hi-IN",
    "native": "साइट की दीवार गिर गई है, मजदूर नीचे दब गए हैं!! हम लोग हाथ से मलबा हटा रहे हैं पर हट नहीं रहा, टीम भेजो",
    "translit": "site ki deewar gir gayi hai, mazdoor neeche dab gaye hain!! hum log haath se malba hata rahe hain par hat nahi raha, team bhejo",
    "english": "The site wall has collapsed, workers are buried under it! We're clearing the rubble by hand but it isn't moving, send a team.",
    "category": "RESCUE",
    "severity": "CRITICAL",
    "followUp": "दो आदमी दबे हैं, एक की आवाज़ अभी भी आ रही है, दूसरे का कुछ पता नहीं चल रहा"
  },
  {
    "lang": "Hindi",
    "langCode": "hi-IN",
    "native": "सर रात के बारह बज रहे हैं, आस पास कोई दवाई की दुकान खुली है क्या? बुखार की दवा चाहिए थी",
    "translit": "sir raat ke baarah baj rahe hain, aas paas koi dawai ki dukaan khuli hai kya? bukhaar ki dawa chahiye thi",
    "english": "Sir, it's twelve at night, is any chemist shop open nearby? I need fever medicine.",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Hindi",
    "langCode": "hi-IN",
    "native": "हमारी गली की सारी स्ट्रीट लाइट दो हफ्ते से बंद हैं, और नाली का ढक्कन भी टूटा पड़ा है। रात में कोई गिर सकता है, बता दीजिए शिकायत किसको करनी है",
    "translit": "hamari gali ki saari street light do hafte se band hain, aur naali ka dhakkan bhi toota pada hai. raat mein koi gir sakta hai, bata dijiye shikayat kisko karni hai",
    "english": "All the street lights in our lane have been off for two weeks, and the drain cover is broken too. Someone could fall in at night — please tell me who to complain to.",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Bengali",
    "langCode": "bn-IN",
    "native": "আগুন লেগে গেছে!! বাগুইআটিতে, চার তলা বিল্ডিং। সিঁড়ি পুরো ধোঁয়ায় ভরে গেছে, নামতে পারছি না। তাড়াতাড়ি গাড়ি পাঠান",
    "translit": "Agun lege gechhe!! Baguiati-te, char tola building. Siṛi puro dhõyay bhore gechhe, namte parchhi na. Taratari gari pathan",
    "english": "Fire has broken out!! In Baguiati, a four-storey building. The stairwell is completely full of smoke, we can't get down. Send a fire engine quickly",
    "category": "FIRE",
    "severity": "CRITICAL",
    "followUp": "আমরা তিন তলায় আটকে আছি, ছয় জন, দুটো বাচ্চা আছে সাথে"
  },
  {
    "lang": "Bengali",
    "langCode": "bn-IN",
    "native": "রাস্তার ট্রান্সফরমার থেকে স্পার্ক হচ্ছে, ধোঁয়া বেরোচ্ছে। নিচে প্লাস্টিকের দোকান। শ্রীরামপুর, বাজার মোড়",
    "translit": "Rastar transformer theke spark hochchhe, dhõya berochchhe. Niche plastic-er dokan. Serampore, bazar mor",
    "english": "The street transformer is sparking, smoke is coming out. There's a plastics shop right under it. Serampore, near the bazaar crossing",
    "category": "FIRE",
    "severity": "MEDIUM",
    "followUp": "আগুন এখনো ধরেনি, কিন্তু ভিতরে আওয়াজ হচ্ছে। আশপাশে চার-পাঁচটা দোকান এখনো খোলা"
  },
  {
    "lang": "Bengali",
    "langCode": "bn-IN",
    "native": "বাঁধ ভেঙে গেছে, জল হু হু করে ঢুকছে। উঠোন ডুবে গেছে, ঘরে জল উঠে এল বলে। গোসাবার দিকে। নৌকা লাগবে",
    "translit": "Bãdh bhenge gechhe, jol hu hu kore dhukchhe. Uthon dube gechhe, ghore jol uthe elo bole. Gosaba-r dike. Nouka lagbe",
    "english": "The embankment has broken, water is rushing in. The yard is under water, it's about to come into the house. Towards Gosaba. We need a boat",
    "category": "FLOOD",
    "severity": "HIGH",
    "followUp": "আমরা টিনের চালে উঠে গেছি, সাত জন। মা হাঁটতে পারেন না, ওঁকে তুলতে পারছি না"
  },
  {
    "lang": "Bengali",
    "langCode": "bn-IN",
    "native": "সারা রাত বৃষ্টি, আন্ডারপাসে কোমর সমান জল। স্কুলের গাড়ি আটকে গেছে, কেউ কিছু বলছে না। হাওড়া, সাঁতরাগাছির কাছে",
    "translit": "Sara rat brishti, underpass-e komor saman jol. School-er gari atke gechhe, keu kichhu bolchhe na. Howrah, Santragachhi-r kachhe",
    "english": "Rain all night, waist-deep water in the underpass. A school van is stuck, nobody is telling us anything. Howrah, near Santragachhi",
    "category": "FLOOD",
    "severity": "MEDIUM",
    "followUp": "গাড়িতে বাচ্চারা আছে, জল আর বাড়ছে না, তবে ওরা নেমে আসতে পারছে না"
  },
  {
    "lang": "Bengali",
    "langCode": "bn-IN",
    "native": "৩৪ নম্বর রোডে লরি আর বাইকের ধাক্কা লেগেছে। একজন রাস্তায় পড়ে আছে, রক্ত বেরোচ্ছে। কেউ থামছে না ভাই",
    "translit": "Chouttish nombor road-e lorry ar bike-er dhakka legechhe. Ekjon rastay pore achhe, rokto berochchhe. Keu thamchhe na bhai",
    "english": "A lorry and a bike have collided on the 34 road. One person is lying on the road, bleeding. Nobody is stopping, brother",
    "category": "ACCIDENT",
    "severity": "HIGH",
    "followUp": "বাইকে দুজন ছিল। একজন উঠে বসেছে, আরেকজন ডাকলে সাড়া দিচ্ছে না"
  },
  {
    "lang": "Bengali",
    "langCode": "bn-IN",
    "native": "টোটো উল্টে গেছে মোড়ের কাছে, চার-পাঁচ জন ছিল ভিতরে। সবার হাত-পা ছড়ে গেছে। বহরমপুর, স্টেশন রোডের দিকে",
    "translit": "Toto ulte gechhe morer kachhe, char-pãch jon chhilo bhitore. Sobar hat-pa chhore gechhe. Baharampur, station road-er dike",
    "english": "An e-rickshaw has overturned near the crossing, four or five people were inside. Everyone has scrapes on their arms and legs. Baharampur, towards Station Road",
    "category": "ACCIDENT",
    "severity": "MEDIUM",
    "followUp": "সবাই উঠে দাঁড়িয়েছে, শুধু একজন বয়স্ক লোক পা নাড়াতে পারছেন না"
  },
  {
    "lang": "Bengali",
    "langCode": "bn-IN",
    "native": "বাবার বুকে চাপ ধরেছে, খুব ঘামছে, শ্বাস নিতে পারছে না। অ্যাম্বুলেন্স পাঠান প্লিজ। বেহালা, ১২ নম্বর ওয়ার্ড",
    "translit": "Babar buke chap dhorechhe, khub ghamchhe, shwas nite parchhe na. Ambulance pathan please. Behala, 12 nombor ward",
    "english": "My father has tightness in his chest, he's sweating a lot, can't breathe. Please send an ambulance. Behala, Ward 12",
    "category": "MEDICAL",
    "severity": "CRITICAL",
    "followUp": "বয়স ৬২, আগে একবার হার্ট অ্যাটাক হয়েছিল। জ্ঞান আছে, কিন্তু কথা বলতে পারছে না"
  },
  {
    "lang": "Bengali",
    "langCode": "bn-IN",
    "native": "বৌদির প্রসব ব্যথা উঠেছে, গ্রামে গাড়ি নেই, রাস্তা কাদা হয়ে আছে। হাসপাতাল ১৮ কিলোমিটার দূরে। কিছু একটা করুন",
    "translit": "Boudir prosob byatha uthechhe, grame gari nei, rasta kada hoye achhe. Hospital 18 kilometre dure. Kichhu ekta korun",
    "english": "My sister-in-law has gone into labour, there's no vehicle in the village, the road is all mud. The hospital is 18 km away. Please do something",
    "category": "MEDICAL",
    "severity": "HIGH",
    "followUp": "ব্যথা এখন দশ মিনিট পরপর আসছে। সাথে আশা দিদি আছেন, উনি বলছেন দেরি করা যাবে না"
  },
  {
    "lang": "Bengali",
    "langCode": "bn-IN",
    "native": "ঠাকুমা বাথরুমে পড়ে গেছেন, কোমরে লেগেছে, উঠতে পারছেন না। মাথায় লাগেনি। খড়দহ",
    "translit": "Thakuma bathroom-e pore gechhen, komore legechhe, uthte parchhen na. Mathay lageni. Khardah",
    "english": "My grandmother has fallen in the bathroom, hurt her hip, she can't get up. No head injury. Khardah",
    "category": "MEDICAL",
    "severity": "MEDIUM",
    "followUp": "জ্ঞান পুরো আছে, কথা বলছেন, কিন্তু ডান পা নাড়াতে গেলেই ব্যথায় চিৎকার করছেন"
  },
  {
    "lang": "Bengali",
    "langCode": "bn-IN",
    "native": "দোকানের শাটার ভাঙছে দুজন লোক, আমি উল্টো দিকের বাড়ির জানলা থেকে দেখছি। বর্ধমান, স্টেশন রোড। জলদি পাঠান",
    "translit": "Dokaner shutter bhangchhe dujon lok, ami ulto diker barir janla theke dekhchhi. Bardhaman, station road. Joldi pathan",
    "english": "Two men are breaking a shop's shutter, I'm watching from the window of the house opposite. Bardhaman, Station Road. Send someone fast",
    "category": "CRIME",
    "severity": "HIGH",
    "followUp": "একজনের হাতে রড আছে, বাইক নিয়ে এসেছে। এখনো ভিতরে ঢোকেনি"
  },
  {
    "lang": "Bengali",
    "langCode": "bn-IN",
    "native": "বাইক চুরি হয়ে গেছে। বাজারের সামনে লক করে রেখেছিলাম, ফিরে এসে দেখি নেই। আধ ঘণ্টাও হয়নি। শিলিগুড়ি",
    "translit": "Bike churi hoye gechhe. Bazarer samne lock kore rekhechhilam, phire ese dekhi nei. Adh ghontao hoyni. Siliguri",
    "english": "My bike has been stolen. I had locked it in front of the market, came back and it's gone. Not even half an hour ago. Siliguri",
    "category": "CRIME",
    "severity": "MEDIUM",
    "followUp": "পাশের দোকানদার বলছেন ওই মোড়ে সিসিটিভি আছে। গাড়ির নম্বরটা আমার কাছে আছে"
  },
  {
    "lang": "Bengali",
    "langCode": "bn-IN",
    "native": "নির্মাণের দেয়াল ধসে পড়েছে, নিচে লোক চাপা পড়ে আছে। কাঁথির রাস্তায়, ইটভাটার পাশে। আমরা হাতে সরাতে পারছি না",
    "translit": "Nirmaner deyal dhose porechhe, niche lok chapa pore achhe. Kanthir rastay, itbhatar pashe. Amra hate sorate parchhi na",
    "english": "A wall under construction has collapsed, people are trapped underneath. On the Contai road, beside the brick kiln. We can't shift it by hand",
    "category": "RESCUE",
    "severity": "CRITICAL",
    "followUp": "দুজন চাপা পড়েছে। একজনের গলা শোনা যাচ্ছে, অন্যজনের কোনো সাড়া নেই"
  },
  {
    "lang": "Bengali",
    "langCode": "bn-IN",
    "native": "রাত ১টা বাজে, বাচ্চার খুব জ্বর, ঘরের ওষুধ শেষ। এদিকে কোন ওষুধের দোকান খোলা আছে বলতে পারবেন? দমদম ক্যান্টনমেন্ট",
    "translit": "Rat 1ta baje, bachchar khub jor, gharer oshudh shesh. Edike kon oshudher dokan khola achhe bolte parben? Dum Dum Cantonment",
    "english": "It's 1 in the morning, my child has a high fever and we're out of medicine at home. Can you tell me which pharmacy is open around here? Dum Dum Cantonment",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Bengali",
    "langCode": "bn-IN",
    "native": "আমাদের গলির ল্যাম্পপোস্টের আলো তিন দিন ধরে জ্বলছে না, পাশেই ড্রেনের ঢাকনা ভাঙা। রাতে কেউ পড়ে যাবে। ৯ নম্বর ওয়ার্ড, ব্যারাকপুর",
    "translit": "Amader golir lamppost-er alo tin din dhore jolchhe na, pashei drain-er dhakna bhanga. Rate keu pore jabe. 9 nombor ward, Barrackpore",
    "english": "The streetlight in our lane hasn't worked for three days, and the drain cover right next to it is broken. Someone will fall in at night. Ward 9, Barrackpore",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Marathi",
    "langCode": "mr-IN",
    "native": "आग लागली!! कोथरूडला बिल्डिंगमध्ये आग लागलीये, सगळीकडे धूर, वरच्या मजल्यावर लोक अडकलेत. लवकर पाठवा प्लीज",
    "translit": "Aag lagli!! Kothrudla building madhye aag lagliye, sagalikade dhur, varchya majlyavar lok adaklet. Lavkar pathva please",
    "english": "Fire!! A building in Kothrud is on fire, smoke everywhere, people trapped on an upper floor. Please send help fast",
    "category": "FIRE",
    "severity": "CRITICAL",
    "followUp": "चौथा मजला आहे, तिथे तीन कुटुंबं राहतात. जिना धुराने भरलाय"
  },
  {
    "lang": "Marathi",
    "langCode": "mr-IN",
    "native": "गॅस लीक होतोय, किचनमध्ये वास भरलाय, रेग्युलेटर निघत नाहीये. नागपूर, जरीपटका. काय करू सांगा लवकर",
    "translit": "Gas leak hotoy, kitchen madhye vaas bharlay, regulator nighat nahiye. Nagpur, Jaripatka. Kay karu sanga lavkar",
    "english": "There's a gas leak, the kitchen is full of the smell, the regulator won't come off. Nagpur, Jaripatka. Tell me quickly what to do",
    "category": "FIRE",
    "severity": "HIGH",
    "followUp": "घरात आम्ही दोघंच आहोत, मी आणि आई. आम्ही बाहेर अंगणात आलोय, दार उघडं ठेवलंय"
  },
  {
    "lang": "Marathi",
    "langCode": "mr-IN",
    "native": "घरात पाणी शिरलंय, गुडघाभर झालंय आणि वाढतच चाललंय. नदीच्या बाजूची वस्ती आहे. खालच्या मजल्यावर वयस्कर लोक आहेत",
    "translit": "Gharaat paani shirlay, gudghabhar zalay ani vadhatach challay. Nadichya bajuchi vasti aahe. Khalchya majlyavar vayaskar lok aahet",
    "english": "Water has come into the house, knee-deep now and still rising. Our settlement is beside the river. There are elderly people on the ground floor",
    "category": "FLOOD",
    "severity": "HIGH",
    "followUp": "आमच्या गल्लीत जवळपास वीस घरं आहेत, सगळ्यांच्या घरात पाणी आलंय"
  },
  {
    "lang": "Marathi",
    "langCode": "mr-IN",
    "native": "सिंहगड रोडच्या अंडरपासमध्ये पाणी साचलंय, गाड्या बंद पडल्यात. कुणी वाहून गेलेलं नाही पण ट्रॅफिक पूर्ण जाम आहे",
    "translit": "Sinhagad Road chya underpass madhye paani sachlay, gadya band padlyat. Kuni vahun gelela nahi pan traffic purna jam aahe",
    "english": "Water has collected in the Sinhagad Road underpass, vehicles have stalled. Nobody has been swept away but the traffic is completely jammed",
    "category": "FLOOD",
    "severity": "MEDIUM",
    "followUp": "एक रिक्षा मधोमध अडकलीय, ड्रायव्हर अजून आतच बसून आहे"
  },
  {
    "lang": "Marathi",
    "langCode": "mr-IN",
    "native": "अपघात झालाय!!! हायवेवर ट्रकने दुचाकीला उडवलं. माणूस रस्त्यावर पडलाय, रक्तस्त्राव होतोय. अँब्युलन्स लवकर पाठवा",
    "translit": "Apghat zalay!!! Highway var truck ne duchakila udavla. Manus rastyavar padlay, raktastrav hotoy. Ambulance lavkar pathva",
    "english": "There's been an accident!!! A truck hit a two-wheeler on the highway. A man is down on the road and bleeding. Send an ambulance quickly",
    "category": "ACCIDENT",
    "severity": "CRITICAL",
    "followUp": "तो शुद्धीवर नाही, पण श्वास चालू आहे. आम्ही तिघं जण थांबलोय इथे"
  },
  {
    "lang": "Marathi",
    "langCode": "mr-IN",
    "native": "दुचाकी घसरून पडली, मित्राचा पाय खूप दुखतोय, उठता येत नाहीये. बाणेर रोडला बस स्टॉपजवळ. गाडी पाठवता का",
    "translit": "Duchaki ghasrun padli, mitracha paay khup dukhtoy, uthta yet nahiye. Baner Road la bus stop javal. Gadi pathavta ka",
    "english": "The bike skidded and fell, my friend's leg hurts a lot, he can't get up. On Baner Road near the bus stop. Can you send a vehicle",
    "category": "ACCIDENT",
    "severity": "MEDIUM",
    "followUp": "डोक्याला हेल्मेट होतं, डोक्याला काही लागलेलं नाही. पण घोटा खूप सुजलाय"
  },
  {
    "lang": "Marathi",
    "langCode": "mr-IN",
    "native": "बाबांना छातीत खूप दुखतंय, दरदरून घाम आलाय, डावा हात पण दुखतोय. वय ६२ आहे. लवकर अँब्युलन्स पाठवा प्लीज",
    "translit": "Babanna chhatit khup dukhtay, dardarun gham aalay, dava haat pan dukhtoy. Vay 62 aahe. Lavkar ambulance pathva please",
    "english": "My father has severe chest pain, he's sweating heavily, his left arm hurts too. He's 62. Please send an ambulance quickly",
    "category": "MEDICAL",
    "severity": "CRITICAL",
    "followUp": "ते अजून बोलतायत पण श्वास घ्यायला त्रास होतोय. आम्ही तिसऱ्या मजल्यावर राहतो, लिफ्ट नाही"
  },
  {
    "lang": "Marathi",
    "langCode": "mr-IN",
    "native": "बायकोला कळा सुरू झाल्यात, नववा महिना चालू आहे. रात्रीची वेळ, इथे गाडी मिळत नाहीये. हडपसर भागात आहोत",
    "translit": "Baykola kala suru zalyat, navva mahina chalu aahe. Ratrichi vel, ithe gadi milat nahiye. Hadapsar bhagat aahot",
    "english": "My wife's labour pains have started, she's in her ninth month. It's night, we can't get any vehicle here. We're in the Hadapsar area",
    "category": "MEDICAL",
    "severity": "HIGH",
    "followUp": "कळा दर पाच मिनिटांनी येतायत. घरी सोबत माझी आई आहे"
  },
  {
    "lang": "Marathi",
    "langCode": "mr-IN",
    "native": "चेन खेचून पळाले!! दोघं होते बाईकवर, बाईंना धक्का लागून त्या पडल्या. गंगापूर रोडला, आत्ताच घडलं",
    "translit": "Chain khechun palale!! Dogha hote bike var, bainna dhakka lagun tya padlya. Gangapur Road la, aattach ghadla",
    "english": "They snatched a chain and fled!! Two of them on a bike, the woman was shoved and fell. On Gangapur Road, it just happened",
    "category": "CRIME",
    "severity": "HIGH",
    "followUp": "बाईक काळ्या रंगाची होती, नंबर दिसला नाही. त्या बाई ठीक आहेत, फक्त हाताला खरचटलंय"
  },
  {
    "lang": "Marathi",
    "langCode": "mr-IN",
    "native": "घराचं कुलूप तोडलंय, गावाहून परत आलो तर कपाट उघडं पडलंय. आत आता कुणी नाहीये. पुढे काय करायचं",
    "translit": "Gharacha kulup todlay, gavahun parat aalo tar kapat ughda padlay. Aat aata kuni nahiye. Pudhe kay karaycha",
    "english": "The lock on our house has been broken, we came back from our village and the cupboard was lying open. Nobody is inside now. What do we do next",
    "category": "CRIME",
    "severity": "MEDIUM",
    "followUp": "दागिने आणि रोख पैसे गेलेत. शेजारी म्हणतायत काल रात्री आवाज आला होता"
  },
  {
    "lang": "Marathi",
    "langCode": "mr-IN",
    "native": "गाडीत लहान मूल आत अडकलंय, दरवाजा लॉक झाला आणि चावी आतच राहिली. ऊन खूप आहे. लवकर कुणाला तरी पाठवा",
    "translit": "Gadit lahan mul aat adaklay, darvaja lock zala ani chavi aatach rahili. Oon khup aahe. Lavkar kunala tari pathva",
    "english": "A small child is stuck inside the car, the door locked and the key is inside. The sun is very strong. Please send someone quickly",
    "category": "RESCUE",
    "severity": "HIGH",
    "followUp": "मूल दोन वर्षांचं आहे, रडतंय पण ठीक दिसतंय. काच फोडू का सांगा"
  },
  {
    "lang": "Marathi",
    "langCode": "mr-IN",
    "native": "रात्रीच्या वादळात मोठं झाड पडलंय, रस्ता पूर्ण बंद. एक गाडी खाली अडकलीय पण आतले सगळे बाहेर आलेत, कुणी जखमी नाही",
    "translit": "Ratrichya vadalat motha zaad padlay, rasta purna band. Ek gadi khali adaklay pan aatle sagle baher aalet, kuni jakhmi nahi",
    "english": "A big tree came down in last night's storm, the road is completely blocked. A car is stuck under it but everyone got out, nobody is hurt",
    "category": "RESCUE",
    "severity": "MEDIUM",
    "followUp": "झाडासोबत विजेची तार पण लोंबकळतेय, लोक जवळ जाऊन बघतायत"
  },
  {
    "lang": "Marathi",
    "langCode": "mr-IN",
    "native": "रात्रीचे साडेबारा वाजलेत, आजीचं औषध संपलंय. कोथरूडजवळ चालू असलेलं मेडिकल कुठे मिळेल सांगाल का? इमर्जन्सी नाहीये",
    "translit": "Ratriche sadebara vajlet, ajicha aushadh samplay. Kothrud javal chalu asleela medical kuthe milel sangal ka? Emergency nahiye",
    "english": "It's half past midnight and my grandmother's medicine has run out. Could you tell me where there's an open pharmacy near Kothrud? It's not an emergency",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Marathi",
    "langCode": "mr-IN",
    "native": "आमच्या गल्लीतले तीन स्ट्रीटलाईट आठवडाभरापासून बंद आहेत, रात्री काहीच दिसत नाही. परवा एक जण पडला होता. कुठे तक्रार करायची?",
    "translit": "Aamchya gallitle teen streetlight athavdabharapasun band aahet, ratri kahich disat nahi. Parva ek jan padla hota. Kuthe takrar karaychi?",
    "english": "Three streetlights in our lane have been out for a week, you can't see anything at night. Someone fell the other day. Where should I file a complaint?",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Telugu",
    "langCode": "te-IN",
    "native": "అన్నా మా అపార్ట్‌మెంట్‌లో మంటలు, పొగ అంతా నిండిపోయింది. మెట్ల మీద నుంచి కిందకి రాలేకపోతున్నాం. కూకట్‌పల్లి, జేఎన్టీయూ దగ్గర. తొందరగా రండి",
    "translit": "annā mā apartment-lō maṇṭalu, poga antā niṇḍipōyindi. meṭla mīda nuñchi kindaki rālēkapōtunnām. Kūkaṭpalli, JNTU daggara. tondaragā raṇḍi",
    "english": "Brother, there's fire in our apartment, smoke has filled everything. We can't get down the stairs. Kukatpally, near JNTU. Come quickly.",
    "category": "FIRE",
    "severity": "CRITICAL",
    "followUp": "మేము మూడో ఫ్లోర్‌లో ఉన్నాం, ఆరుగురం, ఇద్దరు పిల్లలు కూడా ఉన్నారు"
  },
  {
    "lang": "Telugu",
    "langCode": "te-IN",
    "native": "హోటల్ కిచెన్‌లో గ్యాస్ లీక్ అవుతోంది, వాసన భరించలేకపోతున్నాం. సిలిండర్ ఆఫ్ చేయలేకపోయాం. వరంగల్ బస్టాండ్ దగ్గర",
    "translit": "hōṭal kitchen-lō gas leak avutōndi, vāsana bhariñchalēkapōtunnām. cylinder off chēyalēkapōyām. Varangal bastāṇḍ daggara",
    "english": "There's a gas leak in the hotel kitchen, we can't bear the smell. We couldn't turn the cylinder off. Near Warangal bus stand.",
    "category": "FIRE",
    "severity": "HIGH",
    "followUp": "పక్కనే ఇంకో మూడు సిలిండర్లు ఉన్నాయి, హోటల్ మాత్రం ఖాళీ చేయించేశాం"
  },
  {
    "lang": "Telugu",
    "langCode": "te-IN",
    "native": "సార్ వరద నీళ్ళు గంటలోనే ఇంత పెరిగాయి, ఇంట్లోకి వచ్చేశాయి. మేము డాబా మీదకి ఎక్కాం. కరెంటు లేదు. భీమవరం పక్కన మా ఊరు",
    "translit": "sār varada nīḷḷu gaṇṭalōnē inta peragāyi, iṇṭlōki vachchēśāyi. mēmu ḍābā mīdaki ekkām. karaṇṭu lēdu. Bhīmavaram pakkana mā ūru",
    "english": "Sir, the flood water rose this much in just an hour, it has come into the house. We climbed onto the roof. There's no power. Our village is next to Bhimavaram.",
    "category": "FLOOD",
    "severity": "HIGH",
    "followUp": "ఇంట్లో ఏడుగురం ఉన్నాం, మా నానమ్మ నడవలేదు, పడవ పంపించండి"
  },
  {
    "lang": "Telugu",
    "langCode": "te-IN",
    "native": "మా కాలనీలో డ్రైనేజీ పొంగి రోడ్డంతా మునిగిపోయింది, మోకాలి లోతు నీళ్ళు. బండ్లు వెళ్ళట్లేదు, పిల్లలు స్కూల్ నుంచి ఎలా రావాలో తెలియట్లేదు. ఎల్బీ నగర్",
    "translit": "mā kālanīlō drainage poṅgi rōḍḍantā munigipōyindi, mōkāli lōtu nīḷḷu. baṇḍlu veḷḷaṭlēdu, pillalu school nuñchi elā rāvālō teliyaṭlēdu. LB Nagar",
    "english": "The drainage overflowed in our colony and the whole road is under water, knee-deep. Vehicles can't pass, we don't know how the children will get back from school. LB Nagar.",
    "category": "FLOOD",
    "severity": "MEDIUM",
    "followUp": "ఒక మ్యాన్‌హోల్ మూత కొట్టుకుపోయింది, నీళ్ళల్లో కనబడట్లేదు, ఎవరైనా పడిపోతారు"
  },
  {
    "lang": "Telugu",
    "langCode": "te-IN",
    "native": "హైవే మీద లారీ బైక్‌ని గుద్దేసింది, ఇద్దరు రోడ్డు మీద పడి ఉన్నారు, కదలట్లేదు. హైదరాబాద్ – విజయవాడ రోడ్డు, చౌటుప్పల్ దాటాక. అంబులెన్స్ పంపండి",
    "translit": "highway mīda lārī bike-ni guddēsindi, iddaru rōḍḍu mīda paḍi unnāru, kadalaṭlēdu. Haidarābād – Vijayavāḍa rōḍḍu, Chauṭuppal dāṭāka. ambulance paṇḍi",
    "english": "A lorry hit a bike on the highway, two people are lying on the road, not moving. Hyderabad–Vijayawada road, past Choutuppal. Send an ambulance.",
    "category": "ACCIDENT",
    "severity": "CRITICAL",
    "followUp": "ఒకాయన ఊపిరి పీలుస్తున్నాడు, రెండో అతను స్పృహలో లేడు, తలకి దెబ్బ తగిలింది"
  },
  {
    "lang": "Telugu",
    "langCode": "te-IN",
    "native": "ఆటో స్కిడ్ అయి పక్కకి పడిపోయింది, లోపల నలుగురు ఉన్నారు. చిన్న చిన్న దెబ్బలే, కానీ ఒకామెకి కాలు వాచిపోయింది. గుంటూరు, అరండల్‌పేట",
    "translit": "auto skid ayi pakkaki paḍipōyindi, lōpala naluguru unnāru. chinna chinna debbalē, kānī okāmeki kālu vāchipōyindi. Guṇṭūru, Araṇḍalpēṭa",
    "english": "An auto skidded and fell on its side, four people were inside. Only minor injuries, but one woman's leg has swollen up. Guntur, Arundelpet.",
    "category": "ACCIDENT",
    "severity": "MEDIUM",
    "followUp": "అందరూ బయటకి వచ్చేశారు, మాట్లాడుతున్నారు, ఆ ఆమెని మాత్రం లేపలేకపోతున్నాం"
  },
  {
    "lang": "Telugu",
    "langCode": "te-IN",
    "native": "మా నాన్నకి ఛాతీలో నొప్పి వచ్చి కింద పడిపోయారు, పిలిస్తే పలకట్లేదు. వయసు 62. తిరుపతి, కొర్లగుంట. ప్లీజ్ అంబులెన్స్ పంపండి",
    "translit": "mā nānnaki chātīlō noppi vachchi kinda paḍipōyāru, pilistē palakaṭlēdu. vayasu 62. Tirupati, Korlagunṭa. please ambulance paṇḍi",
    "english": "My father got chest pain and collapsed, he's not responding when we call him. Age 62. Tirupati, Korlagunta. Please send an ambulance.",
    "category": "MEDICAL",
    "severity": "CRITICAL",
    "followUp": "ఊపిరి తీసుకుంటున్నారు కానీ చాలా నెమ్మదిగా, పక్కకి తిప్పి పడుకోబెట్టాం"
  },
  {
    "lang": "Telugu",
    "langCode": "te-IN",
    "native": "మా వదినకి నెలలు నిండాయి, నొప్పులు మొదలయ్యాయి. ఊర్లో వాహనం లేదు, రాత్రి పూట ఎవరూ లేరు. నల్గొండ జిల్లా, మండల కేంద్రం నుంచి 12 కిలోమీటర్లు",
    "translit": "mā vadinaki nelalu niṇḍāyi, noppulu modalayyāyi. ūrlō vāhanaṁ lēdu, rātri pūṭa evarū lēru. Nalgoṇḍa jillā, maṇḍala kēndraṁ nuñchi 12 kilōmīṭarlu",
    "english": "My sister-in-law is full term and the labour pains have started. There's no vehicle in the village, nobody is around at night. Nalgonda district, 12 km from the mandal headquarters.",
    "category": "MEDICAL",
    "severity": "HIGH",
    "followUp": "నొప్పులు ఇప్పుడు ప్రతి ఐదు నిమిషాలకి వస్తున్నాయి, ఇది మొదటి కాన్పు"
  },
  {
    "lang": "Telugu",
    "langCode": "te-IN",
    "native": "మా పక్కింట్లో ఎవరో దూరారు, తలుపు పగలగొట్టిన శబ్దం వచ్చింది. లోపల ఆంటీ ఒక్కరే ఉన్నారు. నేను బయటికి వెళ్ళలేదు. విశాఖపట్నం, ఎంవీపీ కాలనీ. పోలీస్ పంపండి",
    "translit": "mā pakkiṇṭlō evarō dūrāru, talupu pagalagoṭṭina śabdaṁ vachchindi. lōpala auntie okkarē unnāru. nēnu bayaṭiki veḷḷalēdu. Viśākhapaṭnaṁ, MVP kālanī. police paṇḍi",
    "english": "Someone has broken into the house next door, I heard the sound of the door being forced. The aunty inside is alone. I haven't gone outside. Visakhapatnam, MVP Colony. Send police.",
    "category": "CRIME",
    "severity": "HIGH",
    "followUp": "ఇద్దరు ఉన్నారు, గేటు దగ్గర బైక్ స్టార్ట్ చేసి ఉంచారు"
  },
  {
    "lang": "Telugu",
    "langCode": "te-IN",
    "native": "బస్టాండ్‌లో నా ఫోన్, పర్స్ ఎత్తుకెళ్ళిపోయారు. ఇప్పుడే, పది నిమిషాల క్రితం. ఫ్రెండ్ ఫోన్ నుంచి మెసేజ్ చేస్తున్నా. కర్నూలు బస్టాండ్",
    "translit": "bastāṇḍ-lō nā phone, purse ettukeḷḷipōyāru. ippuḍē, padi nimiṣāla kritaṁ. friend phone nuñchi message chēstunnā. Karnūlu bastāṇḍ",
    "english": "Someone snatched my phone and purse at the bus stand. Just now, ten minutes ago. I'm messaging from a friend's phone. Kurnool bus stand.",
    "category": "CRIME",
    "severity": "MEDIUM",
    "followUp": "ఆ వ్యక్తి ఎర్ర టీషర్టు వేసుకున్నాడు, ప్లాట్‌ఫారం 4 వైపు పరిగెత్తాడు"
  },
  {
    "lang": "Telugu",
    "langCode": "te-IN",
    "native": "లిఫ్ట్‌లో ఇరుక్కుపోయాం, కరెంట్ పోయింది, తలుపు తెరుచుకోవట్లేదు. సెక్యూరిటీ ఎవరూ కనబడట్లేదు. మాదాపూర్, ఆఫీస్ బిల్డింగ్",
    "translit": "lift-lō irukkupōyām, current pōyindi, talupu teruchukōvaṭlēdu. security evarū kanabaḍaṭlēdu. Mādāpūr, office building",
    "english": "We're stuck in the lift, the power went out, the door won't open. No security staff anywhere. Madhapur, an office building.",
    "category": "RESCUE",
    "severity": "HIGH",
    "followUp": "ముగ్గురం ఉన్నాం, ఒకామెకి ఊపిరాడట్లేదు అంటోంది, లోపల చాలా వేడిగా ఉంది"
  },
  {
    "lang": "Telugu",
    "langCode": "te-IN",
    "native": "కాలువలో ఒకాయన కొట్టుకుపోతున్నాడు, నీళ్ళ ప్రవాహం చాలా ఎక్కువగా ఉంది. మేము ఒడ్డున ఉన్నాం, దిగలేకపోతున్నాం. నెల్లూరు, కాలువ బ్రిడ్జి దగ్గర",
    "translit": "kāluvalō okāyana koṭṭukupōtunnāḍu, nīḷḷa pravāhaṁ chālā ekkuvagā undi. mēmu oḍḍuna unnām, digalēkapōtunnām. Nellūru, kāluva briḍji daggara",
    "english": "A man is being swept away in the canal, the current is very strong. We're on the bank, we can't get in. Nellore, near the canal bridge.",
    "category": "RESCUE",
    "severity": "CRITICAL",
    "followUp": "ఒక చెట్టు కొమ్మ పట్టుకుని ఆగాడు, ఇంకా కనిపిస్తున్నాడు, తాడు ఉన్నవాళ్ళని పంపండి"
  },
  {
    "lang": "Telugu",
    "langCode": "te-IN",
    "native": "మా వీధిలో రెండు వారాలుగా స్ట్రీట్ లైట్లు వెలగట్లేదు, పక్కనే డ్రైనేజీ గుంత మూత లేకుండా తెరిచి ఉంది. రాత్రిపూట నడవడం ప్రమాదంగా ఉంది. ఖమ్మం, ఆరో వార్డు. ఎవరికి చెప్పాలో చెప్పండి",
    "translit": "mā vīdhilō reṇḍu vārālugā street lights velagaṭlēdu, pakkanē drainage gunta mūta lēkuṇḍā terichi undi. rātripūṭa naḍavaḍaṁ pramādaṅgā undi. Khammaṁ, ārō vārḍu. evariki cheppālō cheppaṇḍi",
    "english": "The street lights on our lane haven't been working for two weeks, and right next to them a drain pit is open with no cover. Walking at night is dangerous. Khammam, Ward 6. Please tell me who to report this to.",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Telugu",
    "langCode": "te-IN",
    "native": "అర్ధరాత్రి అయిపోయింది, ఇక్కడ దగ్గర్లో ఏదైనా మెడికల్ షాప్ తెరిచి ఉందా? షుగర్ మాత్రలు అయిపోయాయి. సికింద్రాబాద్ రైల్వే స్టేషన్ దగ్గర. ఎమర్జెన్సీ కాదు, తెలిస్తే చెప్పండి",
    "translit": "ardharātri ayipōyindi, ikkaḍa daggarlō ēdainā medical shop terichi undā? sugar mātralu ayipōyāyi. Sikindarābād railway station daggara. emergency kādu, telistē cheppaṇḍi",
    "english": "It's past midnight, is any pharmacy open nearby? My diabetes tablets have run out. Near Secunderabad railway station. It's not an emergency, just let me know if you know of one.",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Tamil",
    "langCode": "ta-IN",
    "native": "ஐயா ரொம்ப அவசரம்! எங்க அபார்ட்மெண்ட்ல தீ பத்திக்கிச்சு, புகை மட்டும் தான் தெரியுது. கீழ இறங்க முடியல. மேல இன்னும் ரெண்டு குடும்பம் இருக்கு. சீக்கிரம் வாங்க",
    "translit": "Aiyā rompa avasaram! Enga apartment-la tī patthikkichchu, pugai mattum thān theriyudhu. Kīzha iranga mudiyala. Mēla innum rendu kudumbam irukku. Sīkkiram vānga",
    "english": "Sir, very urgent! Fire has broken out in our apartment, all I can see is smoke. We can't get downstairs. There are two more families above us. Come quickly.",
    "category": "FIRE",
    "severity": "CRITICAL",
    "followUp": "நாலாவது ஃப்ளோர். மொத்தம் ஏழு பேர். ஒரு பாட்டி நடக்க முடியாதவங்க"
  },
  {
    "lang": "Tamil",
    "langCode": "ta-IN",
    "native": "சமையலறையில சிலிண்டர்ல இருந்து gas leak ஆகுது, வாசனை ரொம்ப கடுமையா இருக்கு. ரெகுலேட்டர் ஆஃப் பண்ணிட்டேன், ஆனா வாசனை போகல. கரண்ட் ஸ்விட்ச் தொடலாமா? பயமா இருக்கு",
    "translit": "Samaiyalaṟaiyila cylinder-la irundhu gas leak āgudhu, vāsanai rompa kadumaiyā irukku. Regulator off paṇṇittēn, ānā vāsanai pōgala. Current switch thodalāmā? Bayamā irukku",
    "english": "Gas is leaking from the cylinder in the kitchen, the smell is very strong. I've switched off the regulator but the smell won't go. Can I touch the light switch? I'm scared.",
    "category": "FIRE",
    "severity": "HIGH",
    "followUp": "பக்கத்துல ரெண்டு வீடு ஒட்டி இருக்கு. நாங்க கீழ தளம், டீ கடை பின்னாடி"
  },
  {
    "lang": "Tamil",
    "langCode": "ta-IN",
    "native": "கடலூர் பக்கம் எங்க தெருல தண்ணி வேகமா ஏறுது, இடுப்பு அளவுக்கு வந்துடுச்சு. நாங்க மாடிக்கு ஏறிட்டோம். போட் ஏதாவது வருமா? கீழ வீட்ல வயசானவங்க இருக்காங்க",
    "translit": "Kadalūr pakkam enga theruvula thaṇṇi vēgamā ēṟudhu, idupu aḷavukku vandhuduchchu. Nānga mādikku ēṟittōm. Boat ēthāvadhu varumā? Kīzha vīttula vayasānavanga irukkānga",
    "english": "Near Cuddalore, the water on our street is rising fast, it's already waist-high. We've climbed to the upper floor. Will a boat come? There are elderly people in the house below.",
    "category": "FLOOD",
    "severity": "CRITICAL",
    "followUp": "எங்க வீட்ல ஆறு பேர், அதுல ரெண்டு சின்ன குழந்தை. கரண்ட் போயிடுச்சு"
  },
  {
    "lang": "Tamil",
    "langCode": "ta-IN",
    "native": "மழை தண்ணி தேங்கி ரோடே ஆறு மாதிரி இருக்கு. மேன்ஹோல் மூடி எங்க இருக்குன்னே தெரியல. ஸ்கூல் பசங்க அந்த வழியா தான் போவாங்க. யாராவது வந்து பாருங்க",
    "translit": "Mazhai thaṇṇi thēngi rōdē āṟu mādhiri irukku. Manhole mūdi enga irukkunnē theriyala. School pasanga andha vazhiyā thān pōvānga. Yārāvadhu vandhu pārunga",
    "english": "Rainwater has collected and the road looks like a river. We can't tell where the manhole cover is. The school kids go that way. Please send someone to check.",
    "category": "FLOOD",
    "severity": "MEDIUM",
    "followUp": "வார்டு 12, பஸ் ஸ்டாண்ட் பின்னாடி உள்ள தெரு. இப்போ முழங்கால் அளவு தண்ணி இருக்கு"
  },
  {
    "lang": "Tamil",
    "langCode": "ta-IN",
    "native": "ஹைவேல லாரி ஒன்னு பைக் மேல மோதிடுச்சு. ரெண்டு பேர் ரோட்ல கிடக்காங்க, ஒருத்தர் அசையவே இல்ல. ஆம்புலன்ஸ் உடனே அனுப்புங்க ஐயா",
    "translit": "Highway-la lorry onnu bike mēla mōdhiduchchu. Rendu pēr rōttula kidakkānga, oruththar asaiyavē illa. Ambulance udanē anuppunga aiyā",
    "english": "On the highway a lorry hit a bike. Two people are lying on the road, one isn't moving at all. Send an ambulance immediately, sir.",
    "category": "ACCIDENT",
    "severity": "CRITICAL",
    "followUp": "இன்னொருத்தர் பேசுறார், கால் முறிஞ்சிருக்கு போல. ரெண்டு பேரும் ஹெல்மெட் போட்டிருந்தாங்க. மைல்கல் 42 பக்கம்"
  },
  {
    "lang": "Tamil",
    "langCode": "ta-IN",
    "native": "ஆட்டோ ஒன்னு ஸ்கூட்டி மேல லேசா இடிச்சிடுச்சு. ஓட்டுன பொண்ணு கீழ விழுந்துட்டாங்க, முழங்கால்ல சிராய்ப்பு. நல்லா பேசுறாங்க ஆனா எழுந்திரிக்க கஷ்டப்படுறாங்க. ட்ராஃபிக் ஜாம் ஆகிட்டு இருக்கு",
    "translit": "Auto onnu Scooty mēla lēsā idichchiduchchu. Ōttuna poṇṇu kīzha vizhundhuttānga, muzhangāla sirāyppu. Nallā pēsuṟānga ānā ezhundhirikka kashtappaduṟānga. Traffic jam āgittu irukku",
    "english": "An auto lightly hit a scooter. The young woman riding it fell down, she has grazes on her knee. She's talking fine but is struggling to stand up. Traffic is building up.",
    "category": "ACCIDENT",
    "severity": "MEDIUM",
    "followUp": "அவங்களுக்கு தலைச்சுற்றல்னு சொல்றாங்க. ஒரே ஒருத்தருக்கு தான் காயம். சிக்னல் பக்கம் நிக்கிறோம்"
  },
  {
    "lang": "Tamil",
    "langCode": "ta-IN",
    "native": "அப்பாவுக்கு திடீர்னு நெஞ்சு வலி, வியர்த்து கொட்டுது. இப்போ பேசுறது கூட சரியா இல்ல. என்ன பண்றதுன்னே தெரியல. ஆம்புலன்ஸ் பிளீஸ்",
    "translit": "Appāvukku thideernu nenju vali, viyarththu kottudhu. Ippō pēsuṟadhu kūda sariyā illa. Enna paṇṟadhunnē theriyala. Ambulance please",
    "english": "My father suddenly has chest pain and is sweating heavily. Now even his speech isn't clear. I don't know what to do. Ambulance please.",
    "category": "MEDICAL",
    "severity": "CRITICAL",
    "followUp": "மூச்சு இருக்கு ஆனா கண்ணு மூடிட்டாங்க. வயசு 62, சுகர் மாத்திரை சாப்பிடுறவங்க"
  },
  {
    "lang": "Tamil",
    "langCode": "ta-IN",
    "native": "என் அண்ணிக்கு full month, வலி ஐஞ்சு நிமிஷத்துக்கு ஒரு தடவ வருது. ஊர்ல வண்டி எதுவும் கிடைக்கல, மழை வேற விடாம பெய்யுது. ஆம்புலன்ஸ் அனுப்ப முடியுமா",
    "translit": "En aṇṇikku full month, vali ainju nimishaththukku oru thadava varudhu. Ūrla vaṇdi edhuvum kidaikkala, mazhai vēṟa vidāma peyyudhu. Ambulance anuppa mudiyumā",
    "english": "My sister-in-law is full term, the pains are coming every five minutes. No vehicle is available in the village and it's raining non-stop. Can you send an ambulance?",
    "category": "MEDICAL",
    "severity": "HIGH",
    "followUp": "தண்ணி உடைஞ்சிடுச்சு ங்க. முதல் பிரசவம். ஊருக்குள்ள வர ஒரே ஒரு ரோடு தான் இருக்கு"
  },
  {
    "lang": "Tamil",
    "langCode": "ta-IN",
    "native": "பாட்டி பாத்ரூம்ல வழுக்கி விழுந்துட்டாங்க. இடுப்பு வலிக்குதுன்னு சொல்றாங்க, எழுந்திரிக்க முடியல. மயக்கம் ஒன்னும் இல்ல, பேசுறாங்க. வண்டி வர எவ்ளோ நேரம் ஆகும்",
    "translit": "Pātti bathroom-la vazhukki vizhundhuttānga. Idupu valikkudhunnu solṟānga, ezhundhirikka mudiyala. Mayakkam onnum illa, pēsuṟānga. Vaṇdi vara evḷō nēram āgum",
    "english": "My grandmother slipped and fell in the bathroom. She says her hip hurts and she can't get up. She hasn't blacked out, she's talking. How long will a vehicle take?",
    "category": "MEDICAL",
    "severity": "MEDIUM",
    "followUp": "வலது காலை அசைக்க முடியலைன்னு சொல்றாங்க. வயசு 78. வீட்ல நான் மட்டும் தான் இருக்கேன்"
  },
  {
    "lang": "Tamil",
    "langCode": "ta-IN",
    "native": "யாரோ பக்கத்து வீட்டு பூட்ட உடைக்க முயற்சி பண்றாங்க, ரெண்டு பேர் இருக்காங்க. உள்ள ஆண்ட்டி தனியா தான் இருக்காங்க. போலீஸ் சீக்கிரம் அனுப்புங்க, நான் ஜன்னல் வழியா பாத்துட்டு இருக்கேன்",
    "translit": "Yārō pakkaththu vīttu pūtta udaikka muyaṟchi paṇṟānga, rendu pēr irukkānga. Uḷḷa aunty thaniyā thān irukkānga. Police sīkkiram anuppunga, nān jannal vazhiyā pāththuttu irukkēn",
    "english": "Someone is trying to break the lock of the house next door, there are two of them. The aunty inside is alone. Send police quickly, I'm watching through the window.",
    "category": "CRIME",
    "severity": "HIGH",
    "followUp": "இப்போ பின்பக்கம் போயிட்டாங்க. ஆண்ட்டி போன் எடுக்க மாட்டேங்குறாங்க. தெரு லைட்டும் எரியல"
  },
  {
    "lang": "Tamil",
    "langCode": "ta-IN",
    "native": "பஸ் ஸ்டாண்ட் பக்கத்துல என் அம்மா செயின பைக்ல வந்தவன் புடுங்கிட்டு போயிட்டான். அம்மா கீழ விழுந்துட்டாங்க, பெரிய காயம் இல்ல. கம்ப்ளைண்ட் எப்படி கொடுக்குறது",
    "translit": "Bus stand pakkaththula en ammā chain-a bike-la vandhavan pudungittu pōyittān. Ammā kīzha vizhundhuttānga, periya kāyam illa. Complaint eppadi kodukkuṟadhu",
    "english": "Near the bus stand someone on a bike snatched my mother's chain and rode off. My mother fell down, no serious injury. How do we file a complaint?",
    "category": "CRIME",
    "severity": "MEDIUM",
    "followUp": "கருப்பு பைக், ரெண்டு பேர் இருந்தாங்க. நம்பர் பாக்க முடியல. மெயின் ரோடு பக்கமா போனாங்க"
  },
  {
    "lang": "Tamil",
    "langCode": "ta-IN",
    "native": "நாகை பக்கம் கடலுக்கு போன படகு ஒன்னு இன்னும் திரும்பி வரல. காத்து ரொம்ப பலமா இருக்கு, ரேடியோ தொடர்பும் இல்ல. கோஸ்ட் கார்ட்க்கு தகவல் சொல்ல முடியுமா",
    "translit": "Nāgai pakkam kadalukku pōna padagu onnu innum thirumbi varala. Kāththu rompa balamā irukku, radio thodarbum illa. Coast Guard-kku thagaval solla mudiyumā",
    "english": "A boat that went out to sea near Nagapattinam still hasn't come back. The wind is very strong and there's no radio contact. Can you inform the Coast Guard?",
    "category": "RESCUE",
    "severity": "HIGH",
    "followUp": "படகுல ஆறு பேர் போனாங்க. காலைல ஐஞ்சு மணிக்கு கிளம்பினாங்க, கடைசியா பேசினது பத்து மணிக்கு"
  },
  {
    "lang": "Tamil",
    "langCode": "ta-IN",
    "native": "இப்போ ராத்திரி பன்னிரெண்டு மணி, குழந்தைக்கு காய்ச்சல். இந்த பக்கத்துல எந்த மெடிக்கல் ஷாப் ஓபன்ல இருக்கும்னு சொல்ல முடியுமா? அவசரம் ஒன்னும் இல்ல, பாராசிட்டமால் தான் வேணும்",
    "translit": "Ippō rāththiri panniraṇdu maṇi, kuzhandhaikku kāychal. Indha pakkaththula endha medical shop open-la irukkumnu solla mudiyumā? Avasaram onnum illa, paracetamol thān vēṇum",
    "english": "It's midnight now and my child has a fever. Can you tell me which pharmacy near here is open? It's not an emergency, I just need paracetamol.",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Tamil",
    "langCode": "ta-IN",
    "native": "எங்க தெருல மூணு நாளா ஸ்ட்ரீட் லைட் எரியல. இரவுல ரொம்ப இருட்டா இருக்கு, பக்கத்துல குழி வேற தோண்டி வச்சிருக்காங்க. யாருக்கு சொல்றதுன்னு தெரியல, கார்ப்பரேஷன்ல சொல்லுங்களேன்",
    "translit": "Enga theruvula mūṇu nāḷā street light eriyala. Iravula rompa iruttā irukku, pakkaththula kuzhi vēṟa thōṇdi vachchirukkānga. Yārukku solṟadhunnu theriyala, corporation-la sollungaḷēn",
    "english": "The street light on our road hasn't been working for three days. It's very dark at night, and they've also dug a pit nearby. I don't know who to tell — please inform the corporation.",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Malayalam",
    "langCode": "ml-IN",
    "native": "തീ പിടിച്ചു!! ഫ്ലാറ്റിൽ തീയാ, പുക നിറഞ്ഞു, പുറത്തിറങ്ങാൻ പറ്റുന്നില്ല. കലൂർ ഭാഗത്താ. വേഗം വരണം",
    "translit": "Thee pidichu!! Flattil theeyaa, puka niranju, purathirangaan pattunnilla. Kaloor bhaagathaa. Vegam varanam",
    "english": "Fire!! There's a fire in the flat, it's full of smoke, we can't get out. We're in the Kaloor area. Come fast",
    "category": "FIRE",
    "severity": "CRITICAL",
    "followUp": "ആറാം നിലയിലാ ഞങ്ങൾ. നാല് പേരുണ്ട്, കൂടെ ഒരു അമ്മൂമ്മയും"
  },
  {
    "lang": "Malayalam",
    "langCode": "ml-IN",
    "native": "അച്ഛന് നെഞ്ചുവേദന, നല്ല വിയർപ്പ്, ശ്വാസം കിട്ടുന്നില്ല. 68 വയസ്സാ. തൃശൂർ പൂങ്കുന്നം. ഞാൻ എന്ത് ചെയ്യണം",
    "translit": "Achchanu nenchuvedana, nalla viyarppu, swasam kittunnilla. 68 vayassaa. Thrissur Poonkunnam. Njaan enthu cheyyanam",
    "english": "My father has chest pain, he's sweating a lot, he can't breathe. He's 68. Thrissur, Poonkunnam. What should I do",
    "category": "MEDICAL",
    "severity": "CRITICAL",
    "followUp": "ബോധമുണ്ട്, സംസാരിക്കുന്നുണ്ട്. രണ്ട് കൊല്ലം മുൻപ് ബൈപാസ് സർജറി കഴിഞ്ഞതാ"
  },
  {
    "lang": "Malayalam",
    "langCode": "ml-IN",
    "native": "വെള്ളം വീട്ടിൽ കയറി, അര മണിക്കൂർ കൊണ്ട് അരയ്ക്കൊപ്പമായി. പുഴ കരകവിഞ്ഞു. ബോട്ട് വേണം, വേഗം",
    "translit": "Vellam veettil kayari, ara manikkoor kondu araykkoppamaayi. Puzha karakavinju. Boat venam, vegam",
    "english": "Water has come into the house, in half an hour it's up to my waist. The river has broken its banks. We need a boat, quickly",
    "category": "FLOOD",
    "severity": "HIGH",
    "followUp": "മുകളിലത്തെ നിലയിലേക്ക് കയറി. ആറ് പേരുണ്ട്, അതിൽ രണ്ട് കുട്ടികളാ"
  },
  {
    "lang": "Malayalam",
    "langCode": "ml-IN",
    "native": "ബൈക്കും ലോറിയും കൂട്ടിയിടിച്ചു, ആലുവ ബൈപാസിന് അടുത്ത്. ഒരാൾ റോഡിൽ കിടക്കുന്നു. ആംബുലൻസ് വേഗം വിടണം",
    "translit": "Bikkum loriyum koottiyidichu, Aluva bypassinu aduthu. Oraal roadil kidakkunnu. Ambulance vegam vidanam",
    "english": "A bike and a lorry collided, near the Aluva bypass. One person is lying on the road. Send an ambulance fast",
    "category": "ACCIDENT",
    "severity": "HIGH",
    "followUp": "ബോധമുണ്ട്, കാലിന് ഒടിവുണ്ടെന്ന് തോന്നുന്നു. ഹെൽമെറ്റ് ഊരിയിട്ടില്ല, ഞങ്ങൾ അനക്കിയിട്ടുമില്ല"
  },
  {
    "lang": "Malayalam",
    "langCode": "ml-IN",
    "native": "വീട്ടിൽ ആരോ കയറിയിട്ടുണ്ട്. താഴത്തെ വാതിൽ പൊളിച്ചിരിക്കുന്നു, മുകളിൽ ആള് നടക്കുന്ന ശബ്ദം കേൾക്കുന്നു. ഞാൻ ബാത്റൂമിൽ ഒളിച്ചിരിക്കുവാ. പേടിയാവുന്നു",
    "translit": "Veettil aaro kayariyittundu. Thaazhathe vaathil polichirikkunnu, mukalil aalu nadakkunna sabdam kelkkunnu. Njaan bathroomil olichirikkuvaa. Pediyaavunnu",
    "english": "Someone has got into the house. The downstairs door has been forced, I can hear someone walking upstairs. I'm hiding in the bathroom. I'm scared",
    "category": "CRIME",
    "severity": "HIGH",
    "followUp": "ഞാൻ ഒറ്റയ്ക്കാ വീട്ടിൽ. രണ്ട് പേരുടെ ശബ്ദമുണ്ട്. കടവന്ത്രയിലാ, അഡ്രസ്സ് അയക്കാം"
  },
  {
    "lang": "Malayalam",
    "langCode": "ml-IN",
    "native": "ഭാര്യക്ക് പ്രസവവേദന തുടങ്ങി, ഒൻപത് മാസമായി. ആംബുലൻസ് വേണം. റോഡിൽ വെള്ളം കയറിയതുകൊണ്ട് വണ്ടി എടുക്കാൻ പറ്റുന്നില്ല",
    "translit": "Bhaaryakku prasavavedana thudangi, onpathu maasamaayi. Ambulance venam. Roadil vellam kayariyathukondu vandi edukkaan pattunnilla",
    "english": "My wife's labour pains have started, she's nine months. We need an ambulance. The road is flooded so I can't take the car out",
    "category": "MEDICAL",
    "severity": "HIGH",
    "followUp": "പത്ത് മിനിറ്റ് ഇടവിട്ടാ വേദന വരുന്നത്. വെള്ളം പൊട്ടിയിട്ടില്ല. ആദ്യത്തെ പ്രസവമാ"
  },
  {
    "lang": "Malayalam",
    "langCode": "ml-IN",
    "native": "ലിഫ്റ്റിൽ കുടുങ്ങിപ്പോയി. കറന്റ് പോയി, വാതിൽ തുറക്കുന്നില്ല. ബാംഗ്ലൂർ HSR ലേഔട്ട്. ഉള്ളിൽ ശ്വാസം മുട്ടുന്നു",
    "translit": "Liftil kudungippoyi. Current poyi, vaathil thurakkunnilla. Bangalore HSR Layout. Ullil swaasam muttunnu",
    "english": "We're stuck in the lift. The power went, the door won't open. Bangalore, HSR Layout. It's stifling inside",
    "category": "RESCUE",
    "severity": "HIGH",
    "followUp": "മൂന്ന് പേരുണ്ട്, ഒരാൾക്ക് ആസ്ത്മയുണ്ട്. നാലാം നിലയ്ക്കും അഞ്ചാം നിലയ്ക്കും ഇടയിലാ ലിഫ്റ്റ് നിന്നത്"
  },
  {
    "lang": "Malayalam",
    "langCode": "ml-IN",
    "native": "അടുക്കളയിൽ gas leak ആണെന്ന് തോന്നുന്നു, റെഗുലേറ്ററിന്റെ ഭാഗത്ത് നിന്ന് നല്ല മണം. തീ ഒന്നുമില്ല. ജനലൊക്കെ തുറന്നിട്ടിട്ടുണ്ട്. ആരെയെങ്കിലും വിടാമോ",
    "translit": "Adukkalayil gas leak aanennu thonnunnu, regulatorinte bhaagathu ninnu nalla manam. Thee onnumilla. Janalokke thurannittittundu. Aareyenkilum vidaamo",
    "english": "I think there's a gas leak in the kitchen, a strong smell from around the regulator. There's no fire. I've opened all the windows. Can you send someone",
    "category": "FIRE",
    "severity": "MEDIUM",
    "followUp": "സിലിണ്ടർ ഓഫ് ചെയ്ത് പുറത്ത് കൊണ്ടുവെച്ചു. ഫ്ലാറ്റിൽ വേറെ എട്ട് കുടുംബമുണ്ട്"
  },
  {
    "lang": "Malayalam",
    "langCode": "ml-IN",
    "native": "സ്കൂട്ടർ സ്ലിപ്പായി വീണു. കാലിന് മുറിവുണ്ട്, എഴുന്നേൽക്കാൻ പറ്റുന്നില്ല. കോഴിക്കോട് ബീച്ച് റോഡ്, മഴ കാരണം റോഡ് മുഴുവൻ വഴുക്കലാ",
    "translit": "Scooter slippaayi veenu. Kaalinu murivundu, ezhunnelkkaan pattunnilla. Kozhikode Beach Road, mazha kaaranam road muzhuvan vazhukkalaa",
    "english": "My scooter skidded and I fell. My leg is cut, I can't get up. Kozhikode Beach Road, the whole road is slippery from the rain",
    "category": "ACCIDENT",
    "severity": "MEDIUM",
    "followUp": "ഞങ്ങൾ രണ്ട് പേരുണ്ടായിരുന്നു, ഞാനും അനിയത്തിയും. അവൾക്ക് കുഴപ്പമില്ല. ആർക്കും ബോധം പോയിട്ടില്ല"
  },
  {
    "lang": "Malayalam",
    "langCode": "ml-IN",
    "native": "ബൈക്കിൽ വന്ന രണ്ട് പേര് മാല പൊട്ടിച്ചോണ്ട് പോയി. ഇപ്പോ കഴിഞ്ഞതേ ഉള്ളൂ. എനിക്ക് പരിക്കൊന്നുമില്ല. ചങ്ങനാശ്ശേരി ബസ് സ്റ്റാൻഡിന് അടുത്താ",
    "translit": "Bikkil vanna randu peru maala pottichondu poyi. Ippo kazhinjathe ullu. Enikku parikkonnumilla. Changanassery bus standinu adutthaa",
    "english": "Two men on a bike snatched my chain and rode off. It just happened. I'm not hurt. It's near the Changanassery bus stand",
    "category": "CRIME",
    "severity": "MEDIUM",
    "followUp": "കറുത്ത ബൈക്കായിരുന്നു, നമ്പർ കാണാൻ പറ്റിയില്ല. രണ്ടാളും ഹെൽമെറ്റ് വെച്ചിരുന്നു. കോട്ടയം റോഡിലേക്കാ പോയത്"
  },
  {
    "lang": "Malayalam",
    "langCode": "ml-IN",
    "native": "കോളനിയിൽ വെള്ളം കയറിത്തുടങ്ങി, മുറ്റത്ത് മുട്ടൊപ്പമുണ്ട്. അമ്മയ്ക്ക് നടക്കാൻ വയ്യ, ക്യാമ്പിലേക്ക് മാറ്റാൻ സഹായം വേണം. ഇപ്പോഴും മഴ നിന്നിട്ടില്ല",
    "translit": "Colonyil vellam kayarithudangi, muttathu muttoppamundu. Ammaykku nadakkaan vayya, campilekku maattaan sahaayam venam. Ippozhum mazha ninnittilla",
    "english": "Water is coming into our colony, it's knee-deep in the yard. My mother can't walk, we need help to move her to the camp. The rain still hasn't stopped",
    "category": "FLOOD",
    "severity": "MEDIUM",
    "followUp": "വീട്ടിൽ മൂന്ന് പേരാ. അമ്മ വീൽചെയറിലാ. ഒരു ജീപ്പ് വന്നാൽ കയറ്റാൻ പറ്റും"
  },
  {
    "lang": "Malayalam",
    "langCode": "ml-IN",
    "native": "അത്യാവശ്യമൊന്നുമില്ല. ഈ സമയത്ത് തുറന്ന ഒരു മെഡിക്കൽ ഷോപ്പ് എവിടെയെങ്കിലും ഉണ്ടോ? കുഞ്ഞിന് പനിക്കുള്ള മരുന്ന് വേണം. പേരൂർക്കട ഭാഗത്താ",
    "translit": "Athyaavasyamonnumilla. Ee samayathu thuranna oru medical shop evideyenkilum undo? Kunjinu panikkulla marunnu venam. Peroorkkada bhaagathaa",
    "english": "It's not an emergency. Is there any pharmacy open at this hour? I need fever medicine for my child. I'm around Peroorkkada",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Malayalam",
    "langCode": "ml-IN",
    "native": "ഇത് എമർജൻസി അല്ല. ഞങ്ങളുടെ റോഡിലെ സ്ട്രീറ്റ് ലൈറ്റ് ഒരാഴ്ചയായി കത്തുന്നില്ല. റോഡിൽ കുഴിയുമുണ്ട്, രാത്രി ആള്ക്കാര് വീഴുന്നു. ഇത് ആരോടാ പറയേണ്ടത്?",
    "translit": "Ithu emergency alla. Njangalude roadile street light oraazhchayaayi kathunnilla. Roadil kuzhiyumundu, raathri aalkkaaru veezhunnu. Ithu aarodaa parayendathu?",
    "english": "This isn't an emergency. The street light on our road hasn't worked for a week. There's a pothole too, and people fall at night. Who should I report this to?",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Gujarati",
    "langCode": "gu-IN",
    "native": "અંકલેશ્વર GIDC મા કેમિકલ ફેક્ટરી મા આગ લાગી છે. ધુમાડો બહુ છે, અંદર માણસો છે. જલદી મોકલો સાહેબ",
    "translit": "Ankleshwar GIDC ma chemical factory ma aag lagi chhe. Dhumado bahu chhe, andar manaso chhe. Jaldi moklo saheb",
    "english": "There's a fire at a chemical factory in Ankleshwar GIDC. Heavy smoke, there are people inside. Send someone quickly, sir",
    "category": "FIRE",
    "severity": "CRITICAL",
    "followUp": "બીજા માળે ચાર-પાંચ જણ ફસાયા છે, નીચે ઉતરી નથી શકતા"
  },
  {
    "lang": "Gujarati",
    "langCode": "gu-IN",
    "native": "NH 48 પર વડોદરા બાજુ ટ્રક અને કાર ભટકાઈ ગયા. કાર સાવ ચીપાઈ ગઈ છે, અંદર માણસ છે. એમ્બ્યુલન્સ જલદી",
    "translit": "NH 48 par Vadodara baju truck ane car bhatkai gaya. Car saav chipai gai chhe, andar manas chhe. Ambulance jaldi",
    "english": "A truck and a car have collided on NH 48 towards Vadodara. The car is completely crushed, there's someone inside. Ambulance, quickly",
    "category": "ACCIDENT",
    "severity": "CRITICAL",
    "followUp": "બે જણ છે અંદર. ડ્રાઈવર બોલતો નથી, બાજુ વાળા બહેન ભાનમાં છે"
  },
  {
    "lang": "Gujarati",
    "langCode": "gu-IN",
    "native": "સર ફેક્ટરી ના ટાંકા મા સફાઈ કરવા ઉતરેલો મજૂર બહાર નથી આવ્યો. ગેસ જેવું લાગે છે. બીજો ઉતર્યો એ પણ નીચે પડી ગયો",
    "translit": "Sir factory na tanka ma safai karva utarelo majoor bahar nathi aavyo. Gas jevu lage chhe. Bijo utaryo e pan niche padi gayo",
    "english": "Sir, a worker who went down into the factory tank to clean it hasn't come out. Seems like there's gas. A second man went down and he collapsed too",
    "category": "RESCUE",
    "severity": "CRITICAL",
    "followUp": "બે જણ અંદર છે, ટાંકો આશરે પંદર ફૂટ ઊંડો છે"
  },
  {
    "lang": "Gujarati",
    "langCode": "gu-IN",
    "native": "મારા પપ્પા ને છાતી મા દુખાવો થાય છે, પરસેવો બહુ વળે છે. ૬૨ વરસ ના છે. ઘાટલોડિયા, અમદાવાદ. એમ્બ્યુલન્સ મોકલો પ્લીઝ",
    "translit": "Mara pappa ne chhati ma dukhavo thay chhe, pasevo bahu vale chhe. 62 varas na chhe. Ghatlodia, Ahmedabad. Ambulance moklo please",
    "english": "My father has chest pain and is sweating a lot. He's 62. Ghatlodia, Ahmedabad. Please send an ambulance",
    "category": "MEDICAL",
    "severity": "HIGH",
    "followUp": "ભાનમાં છે પણ શ્વાસ ચડે છે. એમને BP ની દવા ચાલુ છે"
  },
  {
    "lang": "Gujarati",
    "langCode": "gu-IN",
    "native": "સાહેબ પાણી ઘર મા ઘુસી ગયું, કમર સુધી આવી ગયું છે. અગાસી નથી અમારે. ઘર મા વૃદ્ધ માજી છે. બોટ મોકલો",
    "translit": "Saheb paani ghar ma ghusi gayu, kamar sudhi aavi gayu chhe. Agasi nathi amare. Ghar ma vruddh maji chhe. Boat moklo",
    "english": "Sir, water has come into the house, it's up to the waist now. We don't have a terrace. There's an elderly lady in the house. Send a boat",
    "category": "FLOOD",
    "severity": "HIGH",
    "followUp": "અમે કુલ સાત જણ છીએ, એક બહેન ને પગે ફ્રેક્ચર છે, ચાલી નથી શકતા"
  },
  {
    "lang": "Gujarati",
    "langCode": "gu-IN",
    "native": "હમણાં જ બે જણ બાઈક પર આવી ને મારી મમ્મી ની ચેન ખેંચી ગયા. મમ્મી પડી ગઈ. બાઈક કાળી હતી, રિંગ રોડ બાજુ ભાગ્યા",
    "translit": "Hamna j be jan bike par aavi ne mari mummy ni chain khenchi gaya. Mummy padi gai. Bike kali hati, Ring Road baju bhagya",
    "english": "Two men on a bike just snatched my mother's chain. She fell down. The bike was black, they went off towards Ring Road",
    "category": "CRIME",
    "severity": "HIGH",
    "followUp": "મમ્મી ના માથા મા વાગ્યું છે, લોહી નીકળે છે. નંબર પ્લેટ નહોતી દેખાણી"
  },
  {
    "lang": "Gujarati",
    "langCode": "gu-IN",
    "native": "ગાડી મા બાળક લોક થઈ ગયું છે, ચાવી અંદર રહી ગઈ. તડકો બહુ છે. બાળક બે વરસ નું છે. કોઈ ને જલદી મોકલો",
    "translit": "Gaadi ma balak lock thai gayu chhe, chavi andar rahi gai. Tadko bahu chhe. Balak be varas nu chhe. Koi ne jaldi moklo",
    "english": "A child is locked inside the car, the keys got left inside. It's very hot in the sun. The child is two years old. Send someone quickly",
    "category": "RESCUE",
    "severity": "HIGH",
    "followUp": "બાળક રડે છે. ગાડી લગભગ વીસ મિનિટ થી તડકા મા ઊભી છે, બારી જરાય ખુલ્લી નથી"
  },
  {
    "lang": "Gujarati",
    "langCode": "gu-IN",
    "native": "અમારા ફ્લેટ મા gas leak ની વાસ બહુ આવે છે. સિલિન્ડર બંધ કર્યો તોય વાસ જતી નથી. બધા બહાર નીકળી ગયા છીએ",
    "translit": "Amara flat ma gas leak ni vaas bahu aave chhe. Cylinder bandh karyo toy vaas jati nathi. Badha bahar nikli gaya chhiye",
    "english": "There's a strong smell of a gas leak in our flat. We shut the cylinder but the smell isn't going. We've all come outside",
    "category": "FIRE",
    "severity": "MEDIUM",
    "followUp": "ત્રીજા માળે છે. એ માળે ચાર ફ્લેટ છે, અત્યારે કોઈ ને તકલીફ નથી"
  },
  {
    "lang": "Gujarati",
    "langCode": "gu-IN",
    "native": "બાઈક સ્લીપ થઈ ગઈ, પગ મા બહુ વાગ્યું છે, ઊભા નથી થવાતું. રસ્તા ની બાજુ મા જ બેઠો છું. મહેસાણા હાઇવે પાસે",
    "translit": "Bike slip thai gai, pag ma bahu vagyu chhe, ubha nathi thavatu. Rasta ni baju ma j betho chhu. Mehsana highway pase",
    "english": "My bike skidded, my leg is badly hurt, I can't stand up. I'm sitting at the side of the road. Near the Mehsana highway",
    "category": "ACCIDENT",
    "severity": "MEDIUM",
    "followUp": "એકલો છું. માથા મા નથી વાગ્યું, હેલ્મેટ પહેરેલી હતી"
  },
  {
    "lang": "Gujarati",
    "langCode": "gu-IN",
    "native": "મારી પત્ની ને ડિલિવરી નો દુખાવો ચાલુ થયો છે, નવમો મહિનો છે. ગાડી નથી અમારી પાસે. એમ્બ્યુલન્સ મળશે? રાજકોટ, ગોંડલ રોડ",
    "translit": "Mari patni ne delivery no dukhavo chalu thayo chhe, navmo mahino chhe. Gaadi nathi amari pase. Ambulance malshe? Rajkot, Gondal Road",
    "english": "My wife's labour pains have started, she's in the ninth month. We don't have a vehicle. Can we get an ambulance? Rajkot, Gondal Road",
    "category": "MEDICAL",
    "severity": "HIGH",
    "followUp": "દુખાવો દસ-દસ મિનિટે આવે છે, પાણી હજી નથી પડ્યું"
  },
  {
    "lang": "Gujarati",
    "langCode": "gu-IN",
    "native": "રોડ પર ઘૂંટણ સુધી પાણી ભરાયું છે અને એક ગટર નું ઢાંકણું ખુલ્લું છે, પાણી મા દેખાતું નથી. કોઈ પડી જશે, સ્કૂલ નો ટાઈમ છે",
    "translit": "Road par ghuntan sudhi paani bharayu chhe ane ek gutter nu dhankanu khullu chhe, paani ma dekhatu nathi. Koi padi jashe, school no time chhe",
    "english": "There's knee-deep water on the road and one manhole cover is open, you can't see it under the water. Someone will fall in, it's school time",
    "category": "FLOOD",
    "severity": "MEDIUM",
    "followUp": "ચાર રસ્તા થી થોડે આગળ, વોર્ડ ૧૨ મા. અત્યારે અમે બે જણ ત્યાં ઊભા રહી ને લોકો ને રોકીએ છીએ"
  },
  {
    "lang": "Gujarati",
    "langCode": "gu-IN",
    "native": "બાજુ વાળા ના ઘર મા બહુ ઝઘડો ચાલે છે, બહેન ની બૂમો સંભળાય છે. રોજ નું થયું છે હવે. પોલીસ મોકલો, પણ મારું નામ ના આપતા",
    "translit": "Baju vala na ghar ma bahu zaghdo chale chhe, behen ni boomo sambhlay chhe. Roj nu thayu chhe have. Police moklo, pan maru naam na aapta",
    "english": "There's a bad fight going on in the neighbour's house, we can hear the woman shouting. It's become a daily thing now. Send police, but don't give my name",
    "category": "CRIME",
    "severity": "HIGH",
    "followUp": "બીજા માળે નો ફ્લેટ છે. ઘર મા નાનું છોકરું પણ છે"
  },
  {
    "lang": "Gujarati",
    "langCode": "gu-IN",
    "native": "સાહેબ રાત ના બે વાગ્યા છે, બાળક ને તાવ છે. આજુબાજુ કોઈ મેડિકલ સ્ટોર ખુલ્લું હોય તો કહેશો? નડિયાદ મા છીએ",
    "translit": "Saheb raat na be vagya chhe, balak ne taav chhe. Ajubaju koi medical store khullu hoy to kahesho? Nadiad ma chhiye",
    "english": "Sir, it's two at night and my child has a fever. Could you tell me if any chemist nearby is open? We're in Nadiad",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Gujarati",
    "langCode": "gu-IN",
    "native": "અમારી શેરી ની બધી લાઈટ ચાર-પાંચ દિવસ થી બંધ છે, સાવ અંધારું રહે છે. વળાંક પર છે એટલે વાહન વાળા ને કંઈ દેખાતું નથી. ફરિયાદ નોંધી લેશો",
    "translit": "Amari sheri ni badhi light char-panch divas thi bandh chhe, saav andharu rahe chhe. Valank par chhe etle vahan vala ne kai dekhatu nathi. Fariyad nondhi lesho",
    "english": "All the streetlights in our lane have been out for four or five days, it's pitch dark. It's on a bend, so drivers can't see anything. Please register a complaint",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Punjabi",
    "langCode": "pa-IN",
    "native": "ਫੈਕਟਰੀ ਚ ਅੱਗ ਲੱਗ ਗਈ!! ਫੋਕਲ ਪੁਆਇੰਟ ਲੁਧਿਆਣਾ। ਧੂੰਆਂ ਈ ਧੂੰਆਂ ਆ, ਬੰਦੇ ਅੰਦਰ ਫਸੇ ਪਏ ਨੇ। ਗੱਡੀ ਭੇਜੋ ਛੇਤੀ ਜੀ",
    "translit": "Factory ch agg lagg gayi!! Focal Point Ludhiana. Dhuaan ee dhuaan aa, bande andar phase pae ne. Gaddi bhejo chheti ji",
    "english": "Fire has broken out in the factory!! Focal Point, Ludhiana. Smoke everywhere, men are trapped inside. Send a fire engine quickly, sir.",
    "category": "FIRE",
    "severity": "CRITICAL",
    "followUp": "ਦੂਜੀ ਮੰਜ਼ਿਲ ਤੇ ਨੇ, ਸੱਤ ਅੱਠ ਜਣੇ। ਪੌੜੀਆਂ ਵਾਲੇ ਪਾਸਿਓਂ ਅੱਗ ਆਈ ਆ"
  },
  {
    "lang": "Punjabi",
    "langCode": "pa-IN",
    "native": "ਜੀਟੀ ਰੋਡ ਤੇ ਐਕਸੀਡੈਂਟ ਹੋ ਗਿਆ ਜੀ, ਫਿਲੌਰ ਪੁਲ ਤੋਂ ਥੋੜ੍ਹਾ ਅੱਗੇ। ਟਰੱਕ ਨੇ ਕਾਰ ਨੂੰ ਮਾਰੀ ਆ। ਬੰਦੇ ਗੱਡੀ ਦੇ ਅੰਦਰ ਈ ਫਸੇ ਪਏ ਆ। ਐਂਬੂਲੈਂਸ ਭੇਜੋ",
    "translit": "GT Road te accident ho gaya ji, Philaur pul ton thorha agge. Truck ne car nu maari aa. Bande gaddi de andar ee phase pae aa. Ambulance bhejo",
    "english": "There's been an accident on the GT Road, sir, a little past the Phillaur bridge. A truck hit a car. The people are still trapped inside the vehicle. Send an ambulance.",
    "category": "ACCIDENT",
    "severity": "CRITICAL",
    "followUp": "ਕਾਰ ਚ ਤਿੰਨ ਜਣੇ ਨੇ। ਇੱਕ ਬੋਲਦਾ ਪਿਆ, ਬਾਕੀ ਦੋ ਹਿੱਲਦੇ ਈ ਨਹੀਂ"
  },
  {
    "lang": "Punjabi",
    "langCode": "pa-IN",
    "native": "ਮੇਰੇ ਪਿਤਾ ਜੀ ਨੂੰ ਛਾਤੀ ਚ ਬਹੁਤ ਦਰਦ ਹੋਇਆ ਤੇ ਡਿੱਗ ਪਏ। ਸਾਹ ਠੀਕ ਨਹੀਂ ਆ ਰਿਹਾ। ਅੰਮ੍ਰਿਤਸਰ, ਰਣਜੀਤ ਐਵੇਨਿਊ ਬਲਾਕ ਬੀ। ਪਲੀਜ਼ ਜਲਦੀ",
    "translit": "Mere pita ji nu chhaati ch bahut dard hoya te digg pae. Saah theek nahi aa riha. Amritsar, Ranjit Avenue Block B. Please jaldi",
    "english": "My father had severe chest pain and collapsed. He isn't breathing properly. Amritsar, Ranjit Avenue Block B. Please hurry.",
    "category": "MEDICAL",
    "severity": "CRITICAL",
    "followUp": "ਉਮਰ ਸੱਠ ਸਾਲ ਆ, ਪਹਿਲਾਂ ਤੋਂ ਦਿਲ ਦੀ ਦਵਾਈ ਚੱਲਦੀ ਆ। ਹੁਣ ਬੋਲ ਨਹੀਂ ਰਹੇ"
  },
  {
    "lang": "Punjabi",
    "langCode": "pa-IN",
    "native": "ਰਸੋਈ ਚ ਗੈਸ ਲੀਕ ਹੋ ਰਹੀ ਆ, ਪੂਰੇ ਘਰ ਚ ਮੁਸ਼ਕ ਫੈਲ ਗਿਆ। ਸਿਲੰਡਰ ਦੀ ਪਾਈਪ ਫਟ ਗਈ ਲੱਗਦੀ ਆ। ਅਸੀਂ ਬਾਹਰ ਆ ਗਏ ਆਂ। ਮਾਡਲ ਟਾਊਨ ਜਲੰਧਰ",
    "translit": "Rasoi ch gas leak ho rahi aa, poore ghar ch mushk phail gaya. Cylinder di pipe phat gayi laggdi aa. Asi bahar aa gaye aan. Model Town Jalandhar",
    "english": "Gas is leaking in the kitchen, the smell has spread through the whole house. Looks like the cylinder pipe has burst. We've come outside. Model Town, Jalandhar.",
    "category": "FIRE",
    "severity": "HIGH",
    "followUp": "ਉੱਪਰ ਵਾਲੇ ਪੋਰਸ਼ਨ ਚ ਬਜ਼ੁਰਗ ਬੀਬੀ ਇਕੱਲੀ ਆ, ਉਹ ਅਜੇ ਅੰਦਰ ਈ ਆ"
  },
  {
    "lang": "Punjabi",
    "langCode": "pa-IN",
    "native": "ਸਤਲੁਜ ਦਾ ਪਾਣੀ ਬੰਨ੍ਹ ਟੱਪ ਕੇ ਪਿੰਡ ਵੜ ਗਿਆ। ਘਰਾਂ ਚ ਗੋਡੇ ਗੋਡੇ ਪਾਣੀ ਆ ਗਿਆ। ਮੰਡੀ ਵਾਲੇ ਪਾਸੇ ਦੇ ਘਰ ਖਾਲੀ ਕਰਵਾਉਣੇ ਪੈਣੇ ਨੇ। ਫਿਰੋਜ਼ਪੁਰ ਲਾਗੇ",
    "translit": "Satluj da paani bannh tapp ke pind varh gaya. Gharaan ch gode gode paani aa gaya. Mandi wale pase de ghar khali karvaune paine ne. Ferozepur laage",
    "english": "The Sutlej water has come over the embankment into the village. There's knee-deep water in the houses. The houses on the mandi side will have to be evacuated. Near Ferozepur.",
    "category": "FLOOD",
    "severity": "HIGH",
    "followUp": "ਪੰਦਰਾਂ ਕੁ ਟੱਬਰ ਨੇ ਓਸ ਪਾਸੇ, ਬਹੁਤੇ ਛੱਤਾਂ ਤੇ ਚੜ੍ਹ ਗਏ ਨੇ। ਕਿਸ਼ਤੀ ਚਾਹੀਦੀ ਆ"
  },
  {
    "lang": "Punjabi",
    "langCode": "pa-IN",
    "native": "ਡਾਈਂਗ ਯੂਨਿਟ ਚ ਇਕ ਮਜ਼ਦੂਰ ਸਫਾਈ ਕਰਨ ਲਈ ਟੈਂਕੀ ਚ ਉੱਤਰਿਆ ਸੀ, ਬਾਹਰ ਨਹੀਂ ਆਇਆ। ਅਵਾਜ਼ਾਂ ਮਾਰਦੇ ਆਂ, ਜਵਾਬ ਨਹੀਂ ਦਿੰਦਾ। ਲੁਧਿਆਣਾ ਤਾਜਪੁਰ ਰੋਡ",
    "translit": "Dyeing unit ch ik mazdoor safai karan layi tanki ch uttreya si, bahar nahi aaya. Awaazan maarde aan, jawaab nahi dinda. Ludhiana Tajpur Road",
    "english": "At a dyeing unit a worker went down into a tank to clean it and hasn't come back out. We keep calling to him, he doesn't answer. Tajpur Road, Ludhiana.",
    "category": "RESCUE",
    "severity": "CRITICAL",
    "followUp": "ਇਕ ਹੋਰ ਬੰਦਾ ਉਹਨੂੰ ਕੱਢਣ ਲਈ ਅੰਦਰ ਗਿਆ ਸੀ, ਹੁਣ ਦੋਵੇਂ ਥੱਲੇ ਨੇ"
  },
  {
    "lang": "Punjabi",
    "langCode": "pa-IN",
    "native": "ਸਾਡੇ ਗੁਆਂਢ ਚ ਲੜਾਈ ਹੋ ਰਹੀ ਆ, ਬੰਦਾ ਸ਼ਰਾਬ ਪੀ ਕੇ ਆਇਆ ਤੇ ਘਰਵਾਲੀ ਨੂੰ ਕੁੱਟ ਰਿਹਾ। ਜਨਾਨੀ ਚੀਕਾਂ ਮਾਰ ਰਹੀ ਆ। ਪੁਲਿਸ ਭੇਜੋ। ਬਠਿੰਡਾ, ਵਾਰਡ 12",
    "translit": "Saade guaandh ch larhai ho rahi aa, banda sharaab pee ke aaya te gharwali nu kutt riha. Janani cheekaan maar rahi aa. Police bhejo. Bathinda, Ward 12",
    "english": "There's a fight in our neighbourhood — a man came home drunk and is beating his wife. The woman is screaming. Send police. Bathinda, Ward 12.",
    "category": "CRIME",
    "severity": "HIGH",
    "followUp": "ਦੋ ਨਿਆਣੇ ਵੀ ਘਰੇ ਨੇ। ਦਰਵਾਜ਼ਾ ਉਹਨੇ ਅੰਦਰੋਂ ਬੰਦ ਕਰ ਲਿਆ"
  },
  {
    "lang": "Punjabi",
    "langCode": "pa-IN",
    "native": "ਬਠਿੰਡਾ ਬਾਈਪਾਸ ਤੇ ਮੋਟਰਸਾਈਕਲ ਵਾਲੇ ਨੂੰ ਕਿਸੇ ਗੱਡੀ ਨੇ ਮਾਰ ਦਿੱਤਾ ਤੇ ਭੱਜ ਗਿਆ। ਮੁੰਡਾ ਸੜਕ ਤੇ ਪਿਆ, ਲੱਤ ਚੋਂ ਖੂਨ ਆ ਰਿਹਾ। ਅਸੀਂ ਲਾਗੇ ਖੜ੍ਹੇ ਆਂ",
    "translit": "Bathinda bypass te motorcycle wale nu kise gaddi ne maar ditta te bhajj gaya. Munda sarhak te pya, latt chon khoon aa riha. Asi laage kharhe aan",
    "english": "On the Bathinda bypass some vehicle hit a motorcyclist and drove off. The young man is lying on the road, bleeding from his leg. We're standing right here.",
    "category": "ACCIDENT",
    "severity": "HIGH",
    "followUp": "ਹੋਸ਼ ਚ ਆ, ਗੱਲ ਕਰ ਰਿਹਾ। ਹੈਲਮਟ ਪਾਇਆ ਹੋਇਆ ਸੀ, ਸਿਰ ਤੇ ਸੱਟ ਨਹੀਂ ਲੱਗੀ ਲੱਗਦੀ"
  },
  {
    "lang": "Punjabi",
    "langCode": "pa-IN",
    "native": "ਮੇਰੀ ਭਰਜਾਈ ਨੂੰ ਜਣੇਪੇ ਦੀਆਂ ਪੀੜਾਂ ਲੱਗੀਆਂ ਨੇ, ਪਿੰਡ ਚ ਕੋਈ ਗੱਡੀ ਨਹੀਂ ਮਿਲ ਰਹੀ। ਐਂਬੂਲੈਂਸ ਭੇਜ ਦਿਓ ਜੀ। ਪਿੰਡ ਸੰਗਰੂਰ ਤੋਂ ਅੱਠ ਕੁ ਕਿਲੋਮੀਟਰ",
    "translit": "Meri bharjai nu janepe dian peerhan laggian ne, pind ch koi gaddi nahi mil rahi. Ambulance bhej dio ji. Pind Sangrur ton atth ku kilometre",
    "english": "My sister-in-law has gone into labour and we can't get any vehicle in the village. Please send an ambulance. The village is about eight km from Sangrur.",
    "category": "MEDICAL",
    "severity": "HIGH",
    "followUp": "ਨੌਵਾਂ ਮਹੀਨਾ ਚੱਲ ਰਿਹਾ, ਪਹਿਲਾ ਬੱਚਾ ਆ। ਹਾਲੇ ਹੋਸ਼ ਚ ਆ ਤੇ ਗੱਲ ਕਰ ਰਹੀ ਆ"
  },
  {
    "lang": "Punjabi",
    "langCode": "pa-IN",
    "native": "ਰਾਤ ਦੇ ਮੀਂਹ ਨਾਲ ਸਾਡੀ ਗਲੀ ਚ ਪਾਣੀ ਖੜ੍ਹ ਗਿਆ, ਸੀਵਰੇਜ ਬਲਾਕ ਆ। ਸਕੂਲ ਵਾਲੀ ਗਲੀ ਬੰਦ ਹੋ ਗਈ, ਨਿਆਣੇ ਲੰਘ ਨਹੀਂ ਸਕਦੇ। ਪਟਿਆਲਾ",
    "translit": "Raat de meenh naal saadi gali ch paani kharh gaya, sewerage block aa. School wali gali band ho gayi, niane langh nahi sakde. Patiala",
    "english": "Last night's rain has left water standing in our lane, the sewer is blocked. The lane to the school is cut off, the children can't get through. Patiala.",
    "category": "FLOOD",
    "severity": "MEDIUM",
    "followUp": "ਪਾਣੀ ਕਮਰ ਤੱਕ ਨਹੀਂ, ਗਿੱਟਿਆਂ ਤੋਂ ਉੱਤੇ ਆ, ਪਰ ਇਕ ਖੁੱਲ੍ਹਾ ਮੈਨਹੋਲ ਵੀ ਓਸੇ ਪਾਣੀ ਚ ਆ"
  },
  {
    "lang": "Punjabi",
    "langCode": "pa-IN",
    "native": "ਹੁਣੇ ਦੋ ਮੁੰਡਿਆਂ ਨੇ ਬਾਈਕ ਤੇ ਆ ਕੇ ਮੇਰਾ ਫ਼ੋਨ ਤੇ ਪਰਸ ਖੋਹ ਲਿਆ। ਬੱਸ ਅੱਡੇ ਲਾਗੇ ਦੀ ਗੱਲ ਆ, ਮੋਗਾ। ਮੈਨੂੰ ਸੱਟ ਨਹੀਂ ਲੱਗੀ ਪਰ ਰਿਪੋਰਟ ਕਰਨੀ ਆ",
    "translit": "Hune do mundian ne bike te aa ke mera phone te purse khoh lya. Bus adde laage di gall aa, Moga. Mainu satt nahi laggi par report karni aa",
    "english": "Just now two boys came up on a bike and snatched my phone and purse. It was near the bus stand, Moga. I'm not hurt, but I want to report it.",
    "category": "CRIME",
    "severity": "MEDIUM",
    "followUp": "ਬਾਈਕ ਕਾਲੇ ਰੰਗ ਦਾ ਸੀ, ਨੰਬਰ ਪਲੇਟ ਤੇ ਚਿੱਕੜ ਲੱਗਾ ਹੋਇਆ ਸੀ। ਉਹ ਰੇਲਵੇ ਰੋਡ ਵੱਲ ਨੂੰ ਗਏ"
  },
  {
    "lang": "Punjabi",
    "langCode": "pa-IN",
    "native": "ਨਾਲ ਵਾਲੇ ਘਰ ਬਜ਼ੁਰਗ ਬੀਬੀ ਇਕੱਲੀ ਰਹਿੰਦੀ ਆ। ਦੋ ਦਿਨ ਤੋਂ ਦਰਵਾਜ਼ਾ ਨਹੀਂ ਖੁੱਲ੍ਹਿਆ ਤੇ ਅੰਦਰੋਂ ਕੋਈ ਜਵਾਬ ਨਹੀਂ ਆਉਂਦਾ। ਕੁੰਡਾ ਅੰਦਰੋਂ ਲੱਗਾ ਹੋਇਆ। ਕੋਈ ਆ ਕੇ ਵੇਖੋ ਜੀ",
    "translit": "Naal wale ghar bazurg bibi ikalli rehndi aa. Do din ton darwaza nahi khulhya te androan koi jawaab nahi aunda. Kunda androan lagga hoya. Koi aa ke vekho ji",
    "english": "An elderly woman lives alone in the house next door. The door hasn't opened for two days and there's no answer from inside. It's latched from within. Please send someone to check.",
    "category": "RESCUE",
    "severity": "MEDIUM",
    "followUp": "ਸਵੇਰ ਦੀ ਲਾਈਟ ਵੀ ਜਗਦੀ ਪਈ ਆ ਤੇ ਦੁੱਧ ਵਾਲਾ ਲਿਫ਼ਾਫ਼ਾ ਬਾਹਰ ਈ ਪਿਆ"
  },
  {
    "lang": "Punjabi",
    "langCode": "pa-IN",
    "native": "ਜੀ ਰਾਤ ਦੇ ਬਾਰਾਂ ਵੱਜੇ ਨੇ, ਬੱਚੇ ਨੂੰ ਬੁਖਾਰ ਆ ਤੇ ਦਵਾਈ ਮੁੱਕ ਗਈ। ਪਟਿਆਲੇ ਚ ਕੋਈ ਮੈਡੀਕਲ ਸਟੋਰ ਖੁੱਲ੍ਹਾ ਹੋਵੇ ਤਾਂ ਦੱਸ ਦਿਓ",
    "translit": "Ji raat de baaran vajje ne, bache nu bukhaar aa te dawai mukk gayi. Patiale ch koi medical store khulha hove taan dass dio",
    "english": "Sir, it's twelve at night, my child has a fever and the medicine has run out. If any chemist in Patiala is open, please let me know.",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Punjabi",
    "langCode": "pa-IN",
    "native": "ਸਾਡੀ ਗਲੀ ਦੀਆਂ ਸਟਰੀਟ ਲਾਈਟਾਂ ਹਫ਼ਤੇ ਤੋਂ ਬੰਦ ਨੇ, ਮੋੜ ਤੇ ਬਿਲਕੁਲ ਹਨੇਰਾ ਰਹਿੰਦਾ। ਕੁੜੀਆਂ ਕੋਚਿੰਗ ਤੋਂ ਲੇਟ ਮੁੜਦੀਆਂ ਨੇ। ਨਗਰ ਨਿਗਮ ਨੂੰ ਦੱਸ ਦਿਓ, ਐਮਰਜੈਂਸੀ ਨਹੀਂ ਆ",
    "translit": "Saadi gali dian street lights hafte ton band ne, morh te bilkul hanera rehnda. Kurhian coaching ton late murhdian ne. Nagar Nigam nu dass dio, emergency nahi aa",
    "english": "The street lights in our lane have been out for a week; the corner is pitch dark. Girls come back late from coaching. Please pass it on to the municipal corporation — it isn't an emergency.",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Kannada",
    "langCode": "kn-IN",
    "native": "ಬೆಂಕಿ!! ಕೋರಮಂಗಲ 5ನೇ ಬ್ಲಾಕ್ ಅಪಾರ್ಟ್‌ಮೆಂಟ್‌ನಲ್ಲಿ ಬೆಂಕಿ ಹತ್ತಿದೆ, ಮೇಲಿನ ಫ್ಲೋರ್ ಪೂರ್ತಿ ಹೊಗೆ, ಜನ ಇನ್ನೂ ಒಳಗಿದ್ದಾರೆ. ಬೇಗ ಬನ್ನಿ ಪ್ಲೀಸ್",
    "translit": "Benki!! Koramangala 5ne block apartment-nalli benki hattide, melina floor poorti hoge, jana innu olagiddare. Bega banni please",
    "english": "Fire!! Fire has broken out in an apartment in Koramangala 5th Block, the upper floor is full of smoke, people are still inside. Come quickly please",
    "category": "FIRE",
    "severity": "CRITICAL",
    "followUp": "4ನೇ ಫ್ಲೋರ್ ಸಾರ್. ಎರಡು ಮನೆಯವರು ಇನ್ನೂ ಒಳಗೇ ಇದ್ದಾರೆ, ಅವರಲ್ಲಿ ಮಕ್ಕಳೂ ಇದ್ದಾರೆ"
  },
  {
    "lang": "Kannada",
    "langCode": "kn-IN",
    "native": "ಸಿಲಿಂಡರ್ ಲೀಕ್ ಆಗ್ತಿದೆ, ಪೂರ್ತಿ ಗ್ಯಾಸ್ ವಾಸನೆ ಹೊಡೀತಿದೆ. ಚಾಮರಾಜಪೇಟೆ ಮೆಸ್ ಅಡುಗೆಮನೇಲಿ. ಬೆಂಕಿ ಇನ್ನೂ ಹತ್ತಿಲ್ಲ ಆದ್ರೆ ಯಾವಾಗ ಬೇಕಾದ್ರೂ ಆಗಬಹುದು",
    "translit": "Cylinder leak aagtide, poorti gas vaasane hodeetide. Chamarajpet mess adugemaneli. Benki innu hattilla aadre yaavaga bekaadru aagabahudu",
    "english": "A cylinder is leaking, there is a strong smell of gas everywhere. In the kitchen of a mess in Chamarajpet. It hasn't caught fire yet but it could any moment",
    "category": "FIRE",
    "severity": "HIGH",
    "followUp": "ಅಂಗಡಿ ಖಾಲಿ ಮಾಡಿಸಿದ್ದೀವಿ, 6 ಜನ ಹೊರಗಡೆ ರೋಡಲ್ಲಿ ನಿಂತಿದೀವಿ. ಅಡುಗೆಮನೇಲಿ ಇನ್ನೂ ಮೂರು ಸಿಲಿಂಡರ್ ಇದೆ"
  },
  {
    "lang": "Kannada",
    "langCode": "kn-IN",
    "native": "ಮಳೆ ನೀರು ಮನೆ ಒಳಗೆ ನುಗ್ತಿದೆ, ಬೊಮ್ಮನಹಳ್ಳಿ ಕಡೆ ಇಡೀ ರೋಡ್ ಮುಳುಗಿದೆ. ಗ್ರೌಂಡ್ ಫ್ಲೋರ್‌ನಲ್ಲಿ ವಯಸ್ಸಾದವರು ಇದ್ದಾರೆ, ಏನ್ ಮಾಡೋದು",
    "translit": "Male neeru mane olage nugtide, Bommanahalli kade idee road mulugide. Ground floor-nalli vayassaadavaru iddare, en maadodu",
    "english": "Rainwater is coming into the house, the whole road near Bommanahalli is under water. There are elderly people on the ground floor, what do we do",
    "category": "FLOOD",
    "severity": "HIGH",
    "followUp": "ನೀರು ಈಗ ಸೊಂಟದ ಮಟ್ಟಕ್ಕೆ ಬಂದಿದೆ. ಮನೇಲಿ ಒಟ್ಟು 5 ಜನ, ಅಜ್ಜಿಗೆ ನಡೆಯಕ್ಕೇ ಆಗಲ್ಲ"
  },
  {
    "lang": "Kannada",
    "langCode": "kn-IN",
    "native": "ವಿರಾಜಪೇಟೆ ದಾರೀಲಿ ಮರ ಬಿದ್ದು ನೀರು ನಿಂತಿದೆ, ಊರಿಗೆ ಹೋಗೋ ರಸ್ತೆ ಪೂರ್ತಿ ಬಂದ್ ಆಗಿದೆ. ಸದ್ಯಕ್ಕೆ ಯಾರಿಗೂ ಅಪಾಯ ಇಲ್ಲ ಆದ್ರೆ ಸ್ಕೂಲ್ ಬಸ್ ಒಂದು ಸಿಕ್ಕಿಕೊಂಡಿದೆ",
    "translit": "Virajpet daareeli mara biddu neeru nintide, oorige hogo raste poorti band aagide. Sadyakke yaarigoo apaaya illa aadre school bus ondu sikkikondide",
    "english": "A tree has fallen on the Virajpet road and water has collected, the road to the village is completely blocked. Nobody is in danger right now but a school bus is stuck",
    "category": "FLOOD",
    "severity": "MEDIUM",
    "followUp": "ಬಸ್‌ನಲ್ಲಿ ಸುಮಾರು 20 ಮಕ್ಕಳಿದ್ದಾರೆ, ಎಲ್ರೂ ಬಸ್ ಒಳಗೇ ಸೇಫ್ ಆಗಿದ್ದಾರೆ. ನೀರು ಇನ್ನೂ ಏರ್ತಿಲ್ಲ"
  },
  {
    "lang": "Kannada",
    "langCode": "kn-IN",
    "native": "ಲಿಫ್ಟ್ ಮಧ್ಯದಲ್ಲೇ ನಿಂತೋಗಿದೆ, ಒಳಗೆ ಜನ ಸಿಕ್ಕಿಕೊಂಡಿದ್ದಾರೆ. ಕರೆಂಟ್ ಹೋಗಿದೆ, ವಾಚ್‌ಮನ್ ಕೂಡ ಇಲ್ಲ. ಬಾಗಿಲು ತೆಗೆಯಕ್ಕೆ ಆಗ್ತಿಲ್ಲ",
    "translit": "Lift madhyadalle nintogide, olage jana sikkikondiddaare. Current hogide, watchman kooda illa. Baagilu tegeyakke aagtilla",
    "english": "The lift has stopped midway, people are stuck inside. The power is out and the watchman isn't around either. We can't get the door open",
    "category": "RESCUE",
    "severity": "HIGH",
    "followUp": "ಒಳಗೆ ಮೂರು ಜನ, ಒಬ್ಬ ಚಿಕ್ಕ ಹುಡುಗ ಇದ್ದಾನೆ. ಎಲ್ರೂ ಮಾತಾಡ್ತಿದ್ದಾರೆ, 7ನೇ ಫ್ಲೋರ್ ಹತ್ರ ನಿಂತಿದೆ"
  },
  {
    "lang": "Kannada",
    "langCode": "kn-IN",
    "native": "ಔಟರ್ ರಿಂಗ್ ರೋಡ್ ಮಾರತ್ತಹಳ್ಳಿ ಹತ್ರ ಬೈಕ್ ಲಾರಿ ಡಿಕ್ಕಿ ಆಗಿದೆ. ಹುಡುಗ ರೋಡ್ ಮೇಲೇ ಬಿದ್ದಿದ್ದಾನೆ, ಆಂಬ್ಯುಲೆನ್ಸ್ ಬೇಗ ಕಳಿಸಿ",
    "translit": "Outer Ring Road Marathahalli hatra bike lorry dikki aagide. Huduga road melee biddiddaane, ambulance bega kalisi",
    "english": "A bike and a lorry have collided near Marathahalli on Outer Ring Road. A young man is lying on the road, send an ambulance quickly",
    "category": "ACCIDENT",
    "severity": "HIGH",
    "followUp": "ಅವನಿಗೆ ಎಚ್ಚರ ಇದೆ, ಮಾತಾಡ್ತಿದ್ದಾನೆ, ಆದ್ರೆ ಕಾಲು ಅಲ್ಲಾಡಿಸಕ್ಕೆ ಆಗ್ತಿಲ್ಲ. ಒಬ್ನೇ ಇದ್ದಿದ್ದು"
  },
  {
    "lang": "Kannada",
    "langCode": "kn-IN",
    "native": "ಜಯನಗರ 4ನೇ ಬ್ಲಾಕ್ ಸಿಗ್ನಲ್ ಹತ್ರ ಆಟೋ ಸ್ಕೂಟರ್ ತಗುಲಿದೆ. ಯಾರಿಗೂ ದೊಡ್ಡ ಪೆಟ್ಟಾಗಿಲ್ಲ, ಆದ್ರೆ ಆಂಟಿಗೆ ಕೈ ಉಳುಕಿದೆ ಅನ್ಸುತ್ತೆ. ಪೊಲೀಸ್ ಬರ್ತಾರಾ",
    "translit": "Jayanagar 4ne block signal hatra auto scooter tagulide. Yaarigoo dodda pettaagilla, aadre auntyge kai ulukide ansutte. Police bartaara",
    "english": "An auto and a scooter have hit each other near the Jayanagar 4th Block signal. Nobody is badly hurt, but I think the lady has sprained her arm. Will the police come",
    "category": "ACCIDENT",
    "severity": "MEDIUM",
    "followUp": "ಇಬ್ರಿಗೂ ಎಚ್ಚರ ಇದೆ, ಮಹಿಳೆಯ ಕೈ ಊದಿಕೊಂಡಿದೆ. ಎರಡೂ ವಾಹನ ಪಕ್ಕಕ್ಕೆ ಸರಿಸಿದ್ದೀವಿ"
  },
  {
    "lang": "Kannada",
    "langCode": "kn-IN",
    "native": "ಅಪ್ಪಂಗೆ ಎದೆ ನೋವು, ಬೆವರು ಸುರೀತಿದೆ, ಸರಿಯಾಗಿ ಮಾತಾಡ್ತಿಲ್ಲ. ಆಂಬ್ಯುಲೆನ್ಸ್ ಈಗ್ಲೇ ಬೇಕು. ವಿಜಯನಗರ",
    "translit": "Appange ede novu, bevaru sureetide, sariyaagi maataadtilla. Ambulance eegle beku. Vijayanagar",
    "english": "My father has chest pain, he's sweating heavily and can't speak properly. I need an ambulance right now. Vijayanagar",
    "category": "MEDICAL",
    "severity": "CRITICAL",
    "followUp": "ಉಸಿರಾಟ ಇದೆ ಆದ್ರೆ ಕರೆದ್ರೆ ಎಚ್ಚರ ಆಗ್ತಿಲ್ಲ. ವಯಸ್ಸು 62, ಶುಗರ್ ಮತ್ತೆ ಬಿಪಿ ಎರಡೂ ಇದೆ"
  },
  {
    "lang": "Kannada",
    "langCode": "kn-IN",
    "native": "ಅಜ್ಜಿ ಬಾತ್‌ರೂಮ್‌ನಲ್ಲಿ ಜಾರಿ ಬಿದ್ದಿದ್ದಾರೆ, ಸೊಂಟ ನೋವು ಅಂತಿದ್ದಾರೆ, ಏಳಕ್ಕೆ ಆಗ್ತಿಲ್ಲ. ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಿಗುತ್ತಾ",
    "translit": "Ajji bathroom-nalli jaari biddiddaare, sonta novu antiddaare, yelakke aagtilla. Ambulance sigutta",
    "english": "My grandmother slipped and fell in the bathroom, she says her hip hurts and she can't get up. Can we get an ambulance",
    "category": "MEDICAL",
    "severity": "MEDIUM",
    "followUp": "ಚೆನ್ನಾಗಿ ಮಾತಾಡ್ತಿದ್ದಾರೆ, ವಯಸ್ಸು 78. ನಾವಿರೋದು ಮೂರನೇ ಮಹಡಿ, ಲಿಫ್ಟ್ ಇಲ್ಲ"
  },
  {
    "lang": "Kannada",
    "langCode": "kn-IN",
    "native": "ಸರ ಕಿತ್ಕೊಂಡು ಓಡಿದ್ರು, ಬೈಕ್‌ನಲ್ಲಿ ಇಬ್ರು ಇದ್ರು. ಬನಶಂಕರಿ ಪಾರ್ಕ್ ಹತ್ರ, ಈಗಷ್ಟೇ ಆಗಿದ್ದು",
    "translit": "Sara kitkondu odidru, bike-nalli ibru idru. Banashankari park hatra, eegashtee aagiddu",
    "english": "They snatched my chain and rode off, there were two of them on a bike. Near Banashankari park, it just happened",
    "category": "CRIME",
    "severity": "HIGH",
    "followUp": "ಕಪ್ಪು ಬೈಕ್, ಇಬ್ರೂ ಹೆಲ್ಮೆಟ್ ಹಾಕಿದ್ರು, ಮೈಸೂರು ರೋಡ್ ಕಡೆ ಹೋದ್ರು. ನನಗೆ ಕುತ್ತಿಗೆ ತರಚಿದೆ ಅಷ್ಟೇ"
  },
  {
    "lang": "Kannada",
    "langCode": "kn-IN",
    "native": "ಯಾರೋ ಬಾಗಿಲು ಮುರಿಯಕ್ಕೆ ನೋಡ್ತಿದ್ದಾರೆ, ಮನೇಲಿ ನಾನೊಬ್ಳೇ ಇದ್ದೀನಿ. ಹೆಬ್ಬಾಳ ಹತ್ರ. ಪ್ಲೀಸ್ ಬೇಗ ಬನ್ನಿ",
    "translit": "Yaaro baagilu muriyakke nodtiddaare, maneli naanobley iddeeni. Hebbal hatra. Please bega banni",
    "english": "Someone is trying to break the door open, I'm alone at home. Near Hebbal. Please come quickly",
    "category": "CRIME",
    "severity": "HIGH",
    "followUp": "ಇಬ್ರು ಇದ್ದಾರೆ ಅನ್ಸುತ್ತೆ, ಈಗ ಹಿಂದಿನ ಕಿಟಕಿ ಕಡೆ ಹೋಗ್ತಿದ್ದಾರೆ. ನಾನು ಬೆಡ್‌ರೂಮ್ ಒಳಗೆ ಬಾಗಿಲು ಹಾಕ್ಕೊಂಡಿದೀನಿ"
  },
  {
    "lang": "Kannada",
    "langCode": "kn-IN",
    "native": "ರಾತ್ರಿ ಈ ಟೈಮ್‌ಗೆ ತೆಗೆದಿರೋ ಮೆಡಿಕಲ್ ಶಾಪ್ ಎಲ್ಲಿದೆ ಹೇಳ್ತೀರಾ? ರಾಜಾಜಿನಗರ ಹತ್ರ. ಅಜ್ಜಿಗೆ ಬಿಪಿ ಮಾತ್ರೆ ಖಾಲಿ ಆಗಿದೆ, ಎಮರ್ಜೆನ್ಸಿ ಏನಿಲ್ಲ",
    "translit": "Raatri ee time-ge tegediro medical shop ellide helteera? Rajajinagar hatra. Ajjige BP maatre khaali aagide, emergency enilla",
    "english": "Could you tell me which pharmacy is open at this hour? Near Rajajinagar. My grandmother's BP tablets have run out, it's not an emergency",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Kannada",
    "langCode": "kn-IN",
    "native": "ನಮ್ಮ ಬೀದಿ ಲೈಟ್ ಒಂದು ವಾರದಿಂದ ಹೋಗಿದೆ, ಕತ್ತಲಲ್ಲಿ ರಸ್ತೆ ಗುಂಡಿ ಕಾಣಲ್ಲ, ಸ್ಕೂಟರ್‌ನವರು ಬೀಳ್ತಿದ್ದಾರೆ. ಇದನ್ನ ಯಾರಿಗೆ ಹೇಳಬೇಕು?",
    "translit": "Namma beedi light ondu vaaradinda hogide, kattalalli raste gundi kaanalla, scooter-navaru beeltiddaare. Idanna yaarige helabeku?",
    "english": "Our street light has been out for a week, you can't see the potholes in the dark and people on scooters are falling. Who should I report this to?",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Odia",
    "langCode": "or-IN",
    "native": "ନିଆଁ! ଘରେ ନିଆଁ ଲାଗିଗଲା... ଭିତରେ ଲୋକ ଅଛନ୍ତି, ଦୁଆର ଖୋଲୁନି। ଜଲଦି ଆସନ୍ତୁ — ମଙ୍ଗଳାବାଗ ଗଳି, କଟକ",
    "translit": "Niañ! Ghare niañ lagigala... bhitare loka achhanti, duara kholuni. Jaladi asantu — Mangalabag gali, Cuttack",
    "english": "Fire! The house has caught fire... there are people inside, the door won't open. Come quickly — Mangalabag lane, Cuttack.",
    "category": "FIRE",
    "severity": "CRITICAL",
    "followUp": "ଉପର ମହଲାରେ ଦୁଇ ଜଣ ଅଛନ୍ତି, କଥା କହୁଛନ୍ତି କିନ୍ତୁ ତଳକୁ ଆସିପାରୁନାହାନ୍ତି"
  },
  {
    "lang": "Odia",
    "langCode": "or-IN",
    "native": "ପାଣି ଘର ଭିତରକୁ ପଶିଗଲା, ଆମେ ସବୁ ଛାତ ଉପରକୁ ଚଢ଼ି ବସିଛୁ। ନାଆ ପଠାନ୍ତୁ। କେନ୍ଦ୍ରାପଡ଼ା ପାଖ ଗାଁ, ୱାର୍ଡ ୧୨",
    "translit": "Pani ghara bhitaraku pashigala, ame sabu chhata uparaku chadhi basichhu. Naa pathantu. Kendrapada pakha gañ, ward 12",
    "english": "Water has come inside the house, we've all climbed up onto the roof. Send a boat. Village near Kendrapara, Ward 12.",
    "category": "FLOOD",
    "severity": "CRITICAL",
    "followUp": "ଆମେ ସାତ ଜଣ, ଦୁଇଟା ସାନ ପିଲା ଅଛନ୍ତି। ପାଣି ଏବେ ବି ବଢ଼ୁଛି"
  },
  {
    "lang": "Odia",
    "langCode": "or-IN",
    "native": "ବାପା ହଠାତ୍ ଛାତିରେ ଯନ୍ତ୍ରଣା କହି ପଡ଼ିଗଲେ, ଡାକିଲେ ଉତ୍ତର ଦେଉନାହାନ୍ତି। ଆମ୍ବୁଲାନ୍ସ ପଠାନ୍ତୁ ପ୍ଲିଜ୍। ଭୁବନେଶ୍ୱର, ଲକ୍ଷ୍ମୀସାଗର",
    "translit": "Bapa hathat chhatire jantrana kahi padigale, dakile uttara deunahanti. Ambulance pathantu, please. Bhubaneswar, Laxmisagar",
    "english": "Father suddenly said he had chest pain and collapsed; he isn't responding when we call him. Please send an ambulance. Bhubaneswar, Laxmisagar.",
    "category": "MEDICAL",
    "severity": "CRITICAL",
    "followUp": "ନିଶ୍ୱାସ ଚାଲୁଛି କିନ୍ତୁ ଆଖି ଖୋଲୁନାହାନ୍ତି। ବୟସ ୬୨, ଆଗରୁ ବି ହାର୍ଟର ଅସୁବିଧା ଥିଲା"
  },
  {
    "lang": "Odia",
    "langCode": "or-IN",
    "native": "୧୬ ନମ୍ବର NHରେ ବାଇକ୍ ଓ ଟ୍ରକ୍ ଧକ୍କା ହୋଇଛି। ଜଣେ ରାସ୍ତା କଡ଼ରେ ପଡ଼ିଛନ୍ତି, ରକ୍ତ ଯାଉଛି। ବାଲେଶ୍ୱର ଆଡ଼କୁ, ପେଟ୍ରୋଲ ପମ୍ପ ପାଖରେ",
    "translit": "16 nambara NH-re bike o truck dhakka hoichhi. Jane rasta kadare padichhanti, rakta jauchhi. Baleswar adaku, petrol pump pakhare",
    "english": "A bike and a truck have collided on NH-16. One person is lying at the roadside and bleeding. Towards Balasore, near the petrol pump.",
    "category": "ACCIDENT",
    "severity": "HIGH",
    "followUp": "ବାଇକରେ ଦୁଇ ଜଣ ଥିଲେ — ଜଣେ ଠିଆ ହୋଇପାରୁଛନ୍ତି, ଆଉ ଜଣକ ଗୋଡ଼ ନଡ଼ାଇ ପାରୁନାହାନ୍ତି"
  },
  {
    "lang": "Odia",
    "langCode": "or-IN",
    "native": "ରାତି ଝଡ଼ରେ ବଡ଼ ଗଛଟା ଘର ଉପରେ ପଡ଼ିଗଲା। ଭିତରେ ଆଈ ଅଛନ୍ତି, ଆମେ ଛାତ କାଟି ପାରୁନାହୁଁ। ଜଗତସିଂହପୁର ପାଖ ଗାଁ",
    "translit": "Rati jhadare bada gachhata ghara upare padigala. Bhitare aai achhanti, ame chhata kati parunahun. Jagatsinghpur pakha gañ",
    "english": "A big tree fell on the house in the night storm. Grandmother is inside; we can't cut through the roof. Village near Jagatsinghpur.",
    "category": "RESCUE",
    "severity": "HIGH",
    "followUp": "ସେ ଭିତରୁ କଥା କହୁଛନ୍ତି, ହାତ ଚାପି ହୋଇଯାଇଛି। ରାସ୍ତାରେ ବି ଗଛ ପଡ଼ିଛି, ଗାଡ଼ି ଭିତରକୁ ଆସିପାରିବ ନାହିଁ"
  },
  {
    "lang": "Odia",
    "langCode": "or-IN",
    "native": "ଘର ପଛ ଝରକା ଭାଙ୍ଗି କିଏ ଭିତରକୁ ପଶୁଛି। ଆମେ ଦୁଇ ଜଣ ଘରେ ଏକା ଅଛୁ, ଦୁଆର ବନ୍ଦ କରି ଦେଇଛୁ। ରାଉରକେଲା, ସେକ୍ଟର ୭",
    "translit": "Ghara pachha jharaka bhangi kie bhitaraku pashuchhi. Ame dui jana ghare eka achhu, duara banda kari deichhu. Rourkela, Sector 7",
    "english": "Someone is breaking in through the back window. The two of us are alone at home, we've locked the door. Rourkela, Sector 7.",
    "category": "CRIME",
    "severity": "HIGH",
    "followUp": "ମୁଁ ଭିତର ରୁମରୁ ଫୋନ୍ କରୁଛି। ମନେ ହେଉଛି ଦୁଇ ଜଣ ଅଛନ୍ତି, ଏବେ ହଲ ଭିତରେ"
  },
  {
    "lang": "Odia",
    "langCode": "or-IN",
    "native": "ଧାନ ଜମିରେ କାମ କରୁଥିବା ବେଳେ ମୋ ଭାଇକୁ ସାପ କାମୁଡ଼ିଛି। ଗୋଡ଼ ଫୁଲିଯାଉଛି। ଏଠି ଗାଡ଼ି ମିଳୁନି — ଅନୁଗୁଳ ପାଖ ଗାଁ",
    "translit": "Dhana jamire kama karuthiba bele mo bhaiku sapa kamudichhi. Goda phuliyauchhi. Ethi gadi miluni — Anugul pakha gañ",
    "english": "A snake bit my brother while he was working in the paddy field. His leg is swelling. No vehicle is available here — village near Angul.",
    "category": "MEDICAL",
    "severity": "HIGH",
    "followUp": "ସେ ଏବେ ସୁଦ୍ଧା ସଚେତ ଅଛନ୍ତି, କଥା କହୁଛନ୍ତି। କାମୁଡ଼ିଥିବାର ପ୍ରାୟ ୨୦ ମିନିଟ୍ ହେଲାଣି"
  },
  {
    "lang": "Odia",
    "langCode": "or-IN",
    "native": "ନଦୀ ବନ୍ଧ ଭାଙ୍ଗିଗଲାଣି, ପାଣି ଗାଁ ଆଡ଼କୁ ଆସୁଛି। ଲୋକେ ସ୍କୁଲ ଆଡ଼କୁ ଯାଉଛନ୍ତି। ଜାଜପୁର ବ୍ଲକ ପାଖରେ",
    "translit": "Nadi bandha bhangigalani, pani gañ adaku asuchhi. Loke skula adaku jauchhanti. Jajpur block pakhare",
    "english": "The river embankment has given way, water is coming towards the village. People are moving to the school. Near Jajpur block.",
    "category": "FLOOD",
    "severity": "HIGH",
    "followUp": "ପ୍ରାୟ ୪୦ ଘର ପାଣି ବାଟରେ ଅଛି। କେତେକ ବୁଢ଼ା ଲୋକ ଚାଲି ପାରୁନାହାନ୍ତି, ସେମାନଙ୍କୁ ନେବାକୁ ଗାଡ଼ି ଦରକାର"
  },
  {
    "lang": "Odia",
    "langCode": "or-IN",
    "native": "ବସ୍ ଡିଭାଇଡରରେ ଧକ୍କା ଖାଇ ରାସ୍ତା ମଝିରେ ଅଟକିଛି। କେତେ ଜଣଙ୍କୁ ଟିକେ ଲାଗିଛି, କେହି ଗମ୍ଭୀର ନୁହନ୍ତି। ସମ୍ବଲପୁର ବସ୍ ଷ୍ଟାଣ୍ଡ ପାଖରେ",
    "translit": "Bus divider-re dhakka khai rasta majhire atakichhi. Kete jananku tike lagichhi, kehi gambhira nuhanti. Sambalpur bus stand pakhare",
    "english": "A bus hit the divider and is stuck in the middle of the road. A few people have minor injuries, nobody serious. Near Sambalpur bus stand.",
    "category": "ACCIDENT",
    "severity": "MEDIUM",
    "followUp": "ପ୍ରାୟ ୨୫ ଯାତ୍ରୀ ଥିଲେ, ସମସ୍ତେ ତଳକୁ ଓହ୍ଲାଇ ଆସିଛନ୍ତି। ଜଣେ ମହିଳାଙ୍କ ମୁଣ୍ଡରୁ ଟିକେ ରକ୍ତ ଯାଉଛି"
  },
  {
    "lang": "Odia",
    "langCode": "or-IN",
    "native": "ଏଇ ଏବେ ଦୁଇ ଜଣ ବାଇକରେ ଆସି ମୋ ଫୋନ୍ ଛଡ଼ାଇ ନେଇ ପଳାଇଲେ। ମୁଁ ଠିକ୍ ଅଛି, ଚୋଟ ଲାଗିନି। ଦୋକାନୀଙ୍କ ଫୋନରୁ କରୁଛି — ପୁରୀ, ସ୍ୱର୍ଗଦ୍ୱାର ରାସ୍ତା",
    "translit": "Ei ebe dui jana bike-re asi mo phone chhadai nei palaile. Mun thik achhi, chota lagini. Dokaninka phone-ru karuchhi — Puri, Swargadwar rasta",
    "english": "Just now two men on a bike snatched my phone and rode off. I'm fine, not hurt. Calling from a shopkeeper's phone — Puri, Swargadwar road.",
    "category": "CRIME",
    "severity": "MEDIUM",
    "followUp": "ବାଇକ୍ ଲାଲ୍ ରଙ୍ଗର ଥିଲା, ନମ୍ବର ପ୍ଲେଟ ଦେଖିପାରିଲି ନାହିଁ। ଦୁହେଁ ହେଲମେଟ ପିନ୍ଧିଥିଲେ"
  },
  {
    "lang": "Odia",
    "langCode": "or-IN",
    "native": "ପାଣି ପାର ହେବାକୁ ଯାଇ ଅଟୋଟା ରାସ୍ତା ମଝିରେ ବନ୍ଦ ହୋଇଗଲା। ଆମେ ଭିତରେ ବସିଛୁ, ପାଣିକୁ ଓହ୍ଲାଇବାକୁ ଡର ଲାଗୁଛି। ଖୋର୍ଦ୍ଧା ରୋଡ଼ ପାଖ",
    "translit": "Pani para hebaku jai auto-ta rasta majhire banda hoigala. Ame bhitare basichhu, paniku ohlaibaku dara laguchhi. Khordha Road pakha",
    "english": "The auto stalled in the middle of the road while trying to cross the water. We're sitting inside, afraid to step down into it. Near Khurda Road.",
    "category": "RESCUE",
    "severity": "MEDIUM",
    "followUp": "ଆମେ ପାଞ୍ଚ ଜଣ, ଭିତରେ ଜଣେ ଗର୍ଭବତୀ ମହିଳା ଅଛନ୍ତି। ପାଣି ଏବେ ଆଣ୍ଠୁ ପର୍ଯ୍ୟନ୍ତ"
  },
  {
    "lang": "Odia",
    "langCode": "or-IN",
    "native": "ଝଡ଼ ପରେ କରେଣ୍ଟ ତାର ଛିଡ଼ି ରାସ୍ତା ଉପରେ ଝୁଲୁଛି, ରହି ରହି ସ୍ପାର୍କ ହେଉଛି। ପିଲାମାନେ ସେଇ ବାଟେ ସ୍କୁଲ ଯାଆନ୍ତି। ଭଦ୍ରକ, ୱାର୍ଡ ୫",
    "translit": "Jhada pare karenta tara chhidi rasta upare jhuluchhi, rahi rahi spark heuchhi. Pilamane sei bate skula jaanti. Bhadrak, ward 5",
    "english": "After the storm a power line has snapped and is hanging over the road, sparking now and then. Children go to school along that road. Bhadrak, Ward 5.",
    "category": "FIRE",
    "severity": "HIGH",
    "followUp": "ତାରଟା ପାଣି ଜମିଥିବା ଗାତ ଉପରେ ପଡ଼ିଛି। ଆମେ ଦୁଇ ପଟେ ବାଉଁଶ ଦେଇ ଲୋକଙ୍କୁ ଅଟକାଉଛୁ"
  },
  {
    "lang": "Odia",
    "langCode": "or-IN",
    "native": "ଆମ ଗଳିର ଷ୍ଟ୍ରିଟ ଲାଇଟ ପନ୍ଦର ଦିନ ହେଲା ଜଳୁନାହିଁ। ପାଖରେ ନାଳ ଖୋଲା ଅଛି, ରାତିରେ ଲୋକେ ପଡ଼ିଯିବାର ଭୟ। କେଉଁଠି ଜଣାଇବି? ବ୍ରହ୍ମପୁର, ୱାର୍ଡ ୨୨",
    "translit": "Ama galira street light pandara dina hela jalunahin. Pakhare nala khola achhi, ratire loke padijibara bhaya. Keunthi janaibi? Brahmapur, ward 22",
    "english": "The streetlight in our lane hasn't worked for fifteen days. There's an open drain beside it and people could fall in at night. Where should I report this? Berhampur, Ward 22.",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Odia",
    "langCode": "or-IN",
    "native": "ରାତି ୧୧ଟା ବାଜିଲାଣି — ପାଖରେ କେଉଁ ଔଷଧ ଦୋକାନ ଖୋଲା ଅଛି କହିପାରିବେ? ଜ୍ୱର ଔଷଧ ଦରକାର, ଜରୁରୀ ଅବସ୍ଥା କିଛି ନାହିଁ। କଟକ, ବକ୍ସିବଜାର ପାଖ",
    "translit": "Rati 11ta bajilani — pakhare keun ausadha dokana khola achhi kahiparibe? Jwara ausadha darakara, jaruri abastha kichhi nahin. Cuttack, Buxi Bazar pakha",
    "english": "It's already 11 at night — can you tell me which pharmacy nearby is open? I need fever medicine; it isn't an emergency. Cuttack, near Buxi Bazar.",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": ""
  },
  {
    "lang": "Spanish",
    "langCode": "es",
    "native": "hay humo en el pasillo del hotel, mucho humo, la alarma no suena. estoy en el cuarto piso, somos tres. no sé la dirección, es un hotel cerca de un mercado muy grande, no puedo leer los carteles",
    "translit": "hay humo en el pasillo del hotel, mucho humo, la alarma no suena. estoy en el cuarto piso, somos tres. no se la direccion, es un hotel cerca de un mercado muy grande, no puedo leer los carteles",
    "english": "there's smoke in the hotel corridor, a lot of smoke, the alarm isn't going off. I'm on the fourth floor, there are three of us. I don't know the address, it's a hotel near a very big market, I can't read the signs",
    "category": "FIRE",
    "severity": "HIGH",
    "followUp": "no podemos salir por las escaleras, el humo entra por debajo de la puerta. estamos en el baño con toallas mojadas. el nombre del hotel tiene la palabra Grand, es lo único que entiendo"
  },
  {
    "lang": "Spanish",
    "langCode": "es",
    "native": "mi amigo no puede respirar, comió algo hace diez minutos y es alérgico a los frutos secos. tiene la cara hinchada. no trae su inyector. estamos en un restaurante, no sé qué calle es, les mando la ubicación",
    "translit": "mi amigo no puede respirar, comio algo hace diez minutos y es alergico a los frutos secos. tiene la cara hinchada. no trae su inyector. estamos en un restaurante, no se que calle es, les mando la ubicacion",
    "english": "my friend can't breathe, he ate something ten minutes ago and he's allergic to nuts. his face is swollen. he doesn't have his injector. we're in a restaurant, I don't know what street this is, I'm sending you the location",
    "category": "MEDICAL",
    "severity": "CRITICAL",
    "followUp": "lo pusimos de lado, respira poquito pero ya no contesta cuando le hablo. el del restaurante dice que estamos cerca de una estación de tren"
  },
  {
    "lang": "Spanish",
    "langCode": "es",
    "native": "accidente, un auto chocó con una moto justo enfrente de mí. el de la moto está tirado en el suelo, no se levanta, le sangra la pierna. soy turista, no sé dónde estoy, hay tráfico parado por todos lados",
    "translit": "accidente, un auto choco con una moto justo enfrente de mi. el de la moto esta tirado en el suelo, no se levanta, le sangra la pierna. soy turista, no se donde estoy, hay trafico parado por todos lados",
    "english": "accident, a car hit a motorbike right in front of me. the guy on the bike is down on the ground, he isn't getting up, his leg is bleeding. I'm a tourist, I don't know where I am, there's traffic stopped everywhere",
    "category": "ACCIDENT",
    "severity": "HIGH",
    "followUp": "lo movieron a la acera, está consciente pero no puede mover la pierna. un señor dice que él también llamó. seguimos en la misma esquina, no me muevo de aquí"
  },
  {
    "lang": "Spanish",
    "langCode": "es",
    "native": "me robaron la mochila, dos hombres en moto pasaron y me la jalaron. ahí iba mi pasaporte y el dinero. no estoy herida. estoy parada en una calle con muchas tiendas, no sé el nombre, no puedo leer los letreros",
    "translit": "me robaron la mochila, dos hombres en moto pasaron y me la jalaron. ahi iba mi pasaporte y el dinero. no estoy herida. estoy parada en una calle con muchas tiendas, no se el nombre, no puedo leer los letreros",
    "english": "they stole my backpack, two men on a motorbike went past and yanked it off me. my passport and my money were in it. I'm not hurt. I'm standing on a street with lots of shops, I don't know the name, I can't read the signs",
    "category": "CRIME",
    "severity": "MEDIUM",
    "followUp": "una señora de una tienda me dejó esperar adentro. fue hace como diez minutos, la moto era roja. necesito saber a qué comisaría tengo que ir y qué hago con lo del pasaporte"
  },
  {
    "lang": "Spanish",
    "langCode": "es",
    "native": "el agua está subiendo en la calle, ya me llega a las rodillas y sigue lloviendo muy fuerte. no puedo volver al hotel y no sé cómo se llama esta zona. estoy con mi esposa y hay más gente aquí, algunos mayores",
    "translit": "el agua esta subiendo en la calle, ya me llega a las rodillas y sigue lloviendo muy fuerte. no puedo volver al hotel y no se como se llama esta zona. estoy con mi esposa y hay mas gente aqui, algunos mayores",
    "english": "the water is rising in the street, it's up to my knees already and it's still raining hard. I can't get back to the hotel and I don't know what this area is called. I'm with my wife and there are other people here, some of them elderly",
    "category": "FLOOD",
    "severity": "HIGH",
    "followUp": "nos subimos a la escalera de un edificio, el agua ya tapó las motos de abajo. hay un señor mayor que no puede subir solo, entre dos lo estamos ayudando"
  },
  {
    "lang": "Spanish",
    "langCode": "es",
    "native": "estamos atrapados en el ascensor del hotel, se fue la luz, somos cuatro. el botón de emergencia no funciona y nadie contesta. hace muchísimo calor aquí adentro y una señora se está poniendo mal del pecho",
    "translit": "estamos atrapados en el ascensor del hotel, se fue la luz, somos cuatro. el boton de emergencia no funciona y nadie contesta. hace muchisimo calor aqui adentro y una senora se esta poniendo mal del pecho",
    "english": "we're stuck in the hotel lift, the power went out, there are four of us. the emergency button doesn't work and nobody answers. it's extremely hot in here and a woman is starting to have chest trouble",
    "category": "RESCUE",
    "severity": "HIGH",
    "followUp": "ya avisamos en recepción pero dicen que el técnico tarda una hora. la señora está sentada, le estamos dando aire. creo que estamos entre el quinto y el sexto piso"
  },
  {
    "lang": "Spanish",
    "langCode": "es",
    "native": "llevo dos días con diarrea y fiebre, hoy vomito todo lo que tomo. estoy muy débil y mareada. creo que no necesito ambulancia pero sí un médico, ojalá que hable inglés. estoy en un hostal, les mando el pin",
    "translit": "llevo dos dias con diarrea y fiebre, hoy vomito todo lo que tomo. estoy muy debil y mareada. creo que no necesito ambulancia pero si un medico, ojala que hable ingles. estoy en un hostal, les mando el pin",
    "english": "I've had diarrhoea and fever for two days, today I throw up everything I drink. I'm very weak and dizzy. I don't think I need an ambulance but I do need a doctor, hopefully one who speaks English. I'm at a hostel, I'm sending the pin",
    "category": "MEDICAL",
    "severity": "MEDIUM",
    "followUp": "me tomé la temperatura, 39. no he podido retener agua desde la mañana. el chico del hostal dice que hay una clínica cerca pero no sé cómo llegar ni si atienden a esta hora"
  },
  {
    "lang": "Spanish",
    "langCode": "es",
    "native": "hola, creo que no es emergencia. me bajé del tren en la estación equivocada, ya es de noche y no sé dónde estoy. me queda 8% de batería. solo quiero saber si puedo esperar aquí o si tomo un taxi. viajo sola",
    "translit": "hola, creo que no es emergencia. me baje del tren en la estacion equivocada, ya es de noche y no se donde estoy. me queda 8% de bateria. solo quiero saber si puedo esperar aqui o si tomo un taxi. viajo sola",
    "english": "hello, I don't think this is an emergency. I got off the train at the wrong station, it's night already and I don't know where I am. I have 8% battery left. I just want to know if I can wait here or if I should take a taxi. I'm travelling alone",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": "vi que hay una caseta de policía aquí mismo en la estación, voy para allá y espero ahí. muchas gracias"
  },
  {
    "lang": "Japanese",
    "langCode": "ja",
    "native": "ホテルで火事です 煙がすごい 廊下に出られない 住所が読めません 部屋は412 助けて",
    "translit": "hoteru de kaji desu kemuri ga sugoi rouka ni derarenai juusho ga yomemasen heya wa yonhyaku-juuni tasukete",
    "english": "Fire at the hotel. Heavy smoke. I can't get out into the corridor. I can't read the address. My room is 412. Help.",
    "category": "FIRE",
    "severity": "CRITICAL",
    "followUp": "窓を開けました 下に大きい道路と市場みたいなのが見えます タオルを濡らしてドアの隙間をふさぎました"
  },
  {
    "lang": "Japanese",
    "langCode": "ja",
    "native": "同僚が倒れました 胸が痛いと言ってすぐ意識がなくなった 息をしてるか分かりません オフィスの会議室です ビルの名前が読めません",
    "translit": "douryou ga taoremashita mune ga itai to itte sugu ishiki ga nakunatta iki wo shiteru ka wakarimasen ofisu no kaigishitsu desu biru no namae ga yomemasen",
    "english": "My colleague collapsed. He said his chest hurt and lost consciousness right away. I can't tell if he's breathing. We're in an office meeting room. I can't read the name of the building.",
    "category": "MEDICAL",
    "severity": "CRITICAL",
    "followUp": "受付の人が救急車を呼んでるけど通じてるか分かりません 五十代の男性です まだ反応がありません"
  },
  {
    "lang": "Japanese",
    "langCode": "ja",
    "native": "乗ってたタクシーが事故りました バイクとぶつかった バイクの人が道に倒れてる 私は多分大丈夫 場所が分かりません 大きい道路です",
    "translit": "notteta takushii ga jikorimashita baiku to butsukatta baiku no hito ga michi ni taoreteru watashi wa tabun daijoubu basho ga wakarimasen ookii douro desu",
    "english": "The taxi I was in crashed. It hit a motorbike. The rider is down on the road. I think I'm okay. I don't know where this is. It's a big road.",
    "category": "ACCIDENT",
    "severity": "HIGH",
    "followUp": "運転手が近くの店の名前を言ってるけど私には読めません 地図のピンを送ります バイクの人は意識はあるけど足が動かないみたいです"
  },
  {
    "lang": "Japanese",
    "langCode": "ja",
    "native": "道が完全に水です 膝より上まで来てる ホテルに戻れない 雨がずっと止まりません ここがどこか説明できません",
    "translit": "michi ga kanzen ni mizu desu hiza yori ue made kiteru hoteru ni modorenai ame ga zutto yamimasen koko ga doko ka setsumei dekimasen",
    "english": "The road is completely underwater. It's above my knees. I can't get back to my hotel. The rain won't stop. I can't explain where I am.",
    "category": "FLOOD",
    "severity": "HIGH",
    "followUp": "近くの店の二階に上げてもらいました 水はまだ増えてます 私を入れて六人います"
  },
  {
    "lang": "Japanese",
    "langCode": "ja",
    "native": "エレベーターに閉じ込められました 三人います ボタンを押しても誰も出ない 中が暑くて息苦しい ホテルの名前が読めません 外国人です",
    "translit": "erebeetaa ni tojikomeraremashita sannin imasu botan wo oshite mo daremo denai naka ga atsukute ikigurushii hoteru no namae ga yomemasen gaikokujin desu",
    "english": "We're trapped in a lift. Three of us. I press the button but nobody answers. It's hot in here and hard to breathe. I can't read the hotel's name. I'm a foreigner.",
    "category": "RESCUE",
    "severity": "HIGH",
    "followUp": "電話の電池が20パーセントです 一緒にいる年配の女性が気分が悪いと言ってます 表示は5階と6階の間で止まってます"
  },
  {
    "lang": "Japanese",
    "langCode": "ja",
    "native": "バッグを盗られました パスポートと財布が中です 大きい市場の中で 男の人が走って行った 追いかけられませんでした ここがどこか分かりません",
    "translit": "baggu wo toraremashita pasupooto to saifu ga naka desu ookii ichiba no naka de otoko no hito ga hashitte itta oikakeraremasen deshita koko ga doko ka wakarimasen",
    "english": "My bag was stolen. My passport and wallet were inside. It was in a big market. A man ran off with it. I couldn't chase him. I don't know where I am.",
    "category": "CRIME",
    "severity": "MEDIUM",
    "followUp": "近くの店の人が警察署まで連れて行くと言ってます 行っていいですか 日本大使館の番号も知りたいです"
  },
  {
    "lang": "Japanese",
    "langCode": "ja",
    "native": "道に迷いました 女一人です もう暗い 携帯の電池が12パーセント 看板が読めなくて自分がどこにいるか言えません ホテルの名前はメモにあるけど住所が分かりません",
    "translit": "michi ni mayoimashita onna hitori desu mou kurai keitai no denchi ga juuni paasento kanban ga yomenakute jibun ga doko ni iru ka iemasen hoteru no namae wa memo ni aru kedo juusho ga wakarimasen",
    "english": "I'm lost. I'm a woman on my own. It's already dark. My phone battery is at 12 percent. I can't read the signs so I can't say where I am. I have the hotel name in a note but not the address.",
    "category": "GENERAL",
    "severity": "MEDIUM",
    "followUp": "今は明るいお店の前に立ってます 店の人に電話を代わってもらってもいいですか"
  },
  {
    "lang": "Japanese",
    "langCode": "ja",
    "native": "昨日から熱と下痢が続いてます 救急車は必要ないです 薬局か病院を教えてほしい 英語か日本語が通じるところ ホテルの近くで",
    "translit": "kinou kara netsu to geri ga tsuzuitemasu kyuukyuusha wa hitsuyou nai desu yakkyoku ka byouin wo oshiete hoshii eigo ka nihongo ga tsuujiru tokoro hoteru no chikaku de",
    "english": "I've had a fever and diarrhoea since yesterday. I don't need an ambulance. I'd like to know a pharmacy or clinic — somewhere English or Japanese is understood, near my hotel.",
    "category": "MEDICAL",
    "severity": "LOW",
    "followUp": "熱は38度くらいです 水は飲めてます ホテルの人に頼めば病院まで行けると思います"
  },
  {
    "lang": "Arabic",
    "langCode": "ar",
    "native": "النار في الفندق! الدخان مالي الممر وما أقدر أنزل من الدرج. أنا زائر ومو عارف المنطقة — الطابق السادس، غرفة ٦١٢",
    "translit": "an-naar fi al-funduq! ad-dukhaan maali al-mamarr w ma aqdar anzil min ad-daraj. ana zaa'ir w mu 3aarif al-mantiqa — at-taabiq as-saadis, ghurfa 612",
    "english": "Fire in the hotel! Smoke has filled the corridor and I can't get down the stairs. I'm a visitor and I don't know this area — sixth floor, room 612.",
    "category": "FIRE",
    "severity": "CRITICAL",
    "followUp": "إحنا ثلاثة بالغرفة. سكّرنا الباب وحطينا مناشف مبلولة تحته. بعثت موقعي على الخريطة"
  },
  {
    "lang": "Arabic",
    "langCode": "ar",
    "native": "زوجتي تعبانة مرة، وجع قوي بصدرها وتعرق بارد. عمرها ٥٨ وعندها ضغط. إحنا بشقة مستأجرة وما نعرف وين أقرب مستشفى",
    "translit": "zawjti ta3baana marra, waja3 qawi b-sadr-ha w ta3arruq baarid. 3umr-ha 58 w 3indha daght. ihna b-shaqqa musta'jara w ma na3rif wein aqrab mustashfa",
    "english": "My wife is very unwell — bad chest pain and cold sweating. She's 58 and has high blood pressure. We're in a rented flat and we don't know where the nearest hospital is.",
    "category": "MEDICAL",
    "severity": "HIGH",
    "followUp": "نفسها صار أثقل والوجع نازل لذراعها اليسار. حطيت الدبوس على الخريطة"
  },
  {
    "lang": "Arabic",
    "langCode": "ar",
    "native": "حادث! التوكتوك اللي كنا فيه انقلب. السائق ينزف من راسه وأنا واقف على طرف الشارع. ما أعرف أقرأ اللوحات — شارع عريض وسيارات كثيرة",
    "translit": "haadith! at-tuktuk illi kunna feeh inqalab. as-saa'iq yanzif min raas-uh w ana waaqif 3ala taraf ash-shaari3. ma a3rif aqra al-lawhaat — shaari3 3areed w sayyaaraat katheera",
    "english": "Accident! The auto-rickshaw we were in turned over. The driver is bleeding from his head and I'm standing at the side of the road. I can't read the signs — it's a wide road with a lot of traffic.",
    "category": "ACCIDENT",
    "severity": "HIGH",
    "followUp": "في ناس وقفوا يساعدونا. السائق واعي بس دايخ ونزيفه ما وقف"
  },
  {
    "lang": "Arabic",
    "langCode": "ar",
    "native": "سرقوا شنطتي! واحد على موتوسيكل خطفها من كتفي وراح. جوازي وفلوسي كانوا فيها. أنا بسوق كبير زحمة وما أعرف اسمه",
    "translit": "saraqu shantati! waahid 3ala mutusikl khatafha min kitfi w raah. jawaazi w floosi kaanu feeha. ana b-sooq kabeer zahma w ma a3rif ism-uh",
    "english": "They stole my bag! Someone on a motorbike snatched it off my shoulder and rode off. My passport and my money were inside. I'm in a big crowded market and I don't know its name.",
    "category": "CRIME",
    "severity": "MEDIUM",
    "followUp": "لقيت الشنطة مرمية بعد شارعين، بس الجواز والفلوس مو موجودين"
  },
  {
    "lang": "Arabic",
    "langCode": "ar",
    "native": "المياه طالعة بالشارع بسرعة ووصلت لباب النزل. صاحب النزل يقول نطلع فوق. معنا وحدة كبيرة بالسن ما تقدر تمشي",
    "translit": "al-miyaah taal3a b-ash-shaari3 b-sur3a w wasalat li-baab an-nuzul. saahib an-nuzul yiqool nitla3 fawq. ma3na wahda kabeera b-as-sinn ma tiqdar timshi",
    "english": "The water is rising in the street fast and it's reached the guesthouse door. The owner says we should go upstairs. There's an elderly woman with us who can't walk.",
    "category": "FLOOD",
    "severity": "HIGH",
    "followUp": "المي صارت لحد الركبة بالاستقبال. طلعنا الطابق الثاني وإحنا ستة أشخاص"
  },
  {
    "lang": "Arabic",
    "langCode": "ar",
    "native": "صاحبي دخل البحر وما قدر يرجع، التيار يسحبه بعيد! إحنا نصرخ وما في حد قريب. الشاطئ بعيد عن الفندق ومو عارفين اسمه — بعثنا الموقع",
    "translit": "saahbi dakhal al-bahr w ma qidar yirja3, at-tayyaar yis-habuh ba3eed! ihna nusrukh w ma fee had qareeb. ash-shaati' ba3eed 3an al-funduq w mu 3aarfeen ism-uh — ba3athna al-mawqi3",
    "english": "My friend went into the sea and couldn't get back — the current is pulling him out! We're shouting and there's nobody nearby. The beach is far from our hotel and we don't know its name — we've sent the location.",
    "category": "RESCUE",
    "severity": "CRITICAL",
    "followUp": "في رجل من أهل المكان نزل بحبل يحاول يوصله. لسه ما طلعوا"
  },
  {
    "lang": "Arabic",
    "langCode": "ar",
    "native": "مو حالة طارئة. ضعت عن مجموعتي من ساعة والبطارية ٧٪. ما أقرأ اللافتات ولا أعرف اسم الحي. أحتاج حد يدلني على أقرب مركز شرطة",
    "translit": "mu haala taari'a. du3t 3an majmoo3ati min saa3a w al-battaariya 7%. ma aqra al-laafitaat wala a3rif ism al-hayy. ahtaaj had yidillni 3ala aqrab markaz shurta",
    "english": "Not an emergency. I got separated from my group an hour ago and my battery is at 7%. I can't read the signs and I don't know the name of this neighbourhood. I need someone to direct me to the nearest police station.",
    "category": "GENERAL",
    "severity": "LOW",
    "followUp": "لقيت محل صرافة وصاحبه خلاني أشحن شوي. راح أنتظر هنا"
  },
  {
    "lang": "Arabic",
    "langCode": "ar",
    "native": "ريحة غاز قوية بمطبخ الشقة. سكّرت الأسطوانة وفتحت الشبابيك بس الريحة باقية. إحنا ضيوف هنا وما نعرف نتصل بمين",
    "translit": "reehat ghaaz qawiyya b-matbakh ash-shaqqa. sakkart al-ustuwaana w fataht ash-shabaabeek bas ar-reeha baaqya. ihna duyoof hina w ma na3rif nittasil b-meen",
    "english": "A strong smell of gas in the flat's kitchen. I shut off the cylinder and opened the windows but the smell is still there. We're guests here and we don't know who to call.",
    "category": "FIRE",
    "severity": "MEDIUM",
    "followUp": "طلعنا كلنا برا الشقة. صاحب البيت ما يرد على التلفون"
  }
];
