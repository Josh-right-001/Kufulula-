/**
 * KUFULULA Multilingual & Local Congo Languages Translation Dictionary
 * Precise French 🇫🇷, English 🇺🇸, and Congo National Languages (Lingala, Swahili, Tshiluba, Kikongo) 🇨🇩
 */

export type AppLanguage = 'fr' | 'en' | 'ln' | 'sw' | 'lu' | 'kg';

export interface TranslationDictionary {
  appName: string;
  heroBadge: string;
  heroTitle: string;
  heroSub: string;
  searchPlaceholder: string;
  categoryAll: string;
  categoryElectronics: string;
  categoryFood: string;
  categoryFashion: string;
  categoryHome: string;
  categoryBooks: string;
  noProductFound: string;
  noProductSub: string;
  cartTitle: string;
  addToCart: string;
  buyNow: string;
  negotiate: string;
  share: string;
  like: string;
  comment: string;
  commentsTitle: string;
  writeComment: string;
  postComment: string;
  colorSelect: string;
  angleSelect: string;
  specifications: string;
  vendorLabel: string;
  stockLabel: string;
  priceLabel: string;
  escrowBadge: string;
  escrowActiveBadge: string;
  escrowStatusSecured: string;
  kycVerificationRequired: string;
  backToShop: string;
  settingsTitle: string;
  themeSelect: string;
  fontSelect: string;
  currencyToggle: string;
  adminPortal: string;
  voiceSearchListen: string;
  voiceSearchStop: string;
  lensTitle: string;
  lensScan: string;
  negotiationTitle: string;
  negotiateSubmit: string;
  negotiateCounter: string;
}

export const translations: Record<AppLanguage, TranslationDictionary> = {
  fr: {
    appName: "KUFULULA",
    heroBadge: "Espace Public Libre de Commerce & Séquestre",
    heroTitle: "L'écosystème de confiance pour l'Afrique.",
    heroSub: "Achetez en toute sécurité avec notre protocole de séquestre KYC multi-rails Mobile Money en RDC.",
    searchPlaceholder: "Rechercher par mot-clé, commande vocale, ou Code QR...",
    categoryAll: "Tous les articles",
    categoryElectronics: "Électronique",
    categoryFood: "Alimentation",
    categoryFashion: "Mode & Pagne",
    categoryHome: "Maison",
    categoryBooks: "Livres",
    noProductFound: "Aucun résultat trouvé dans la base.",
    noProductSub: "Ajustez vos filtres ou effectuez une recherche par caméra/voix.",
    cartTitle: "Votre Panier Direct",
    addToCart: "Ajouter au Panier",
    buyNow: "Acheter Maintenant",
    negotiate: "Négocier",
    share: "Partager",
    like: "Liker",
    comment: "Commenter",
    commentsTitle: "Commentaires réels de la communauté",
    writeComment: "Écrire un commentaire amical...",
    postComment: "Publier",
    colorSelect: "Sélectionner la couleur :",
    angleSelect: "Angle de vue :",
    specifications: "Fiche Spécifications",
    vendorLabel: "Vendeur certifié",
    stockLabel: "Quantité en stock",
    priceLabel: "Calcul direct",
    escrowBadge: "Séquestre Mobile Money Garanti",
    escrowActiveBadge: "Séquestre actif",
    escrowStatusSecured: "Fonds sécurisés",
    kycVerificationRequired: "Vérification KYC instantanée nécessaire pour le déblocage",
    backToShop: "Retour à la boutique",
    settingsTitle: "Paramètres d'Affichage & Personnalisation",
    themeSelect: "Thème d'interface",
    fontSelect: "Style de police",
    currencyToggle: "Convertir les prix",
    adminPortal: "Portail Administratif",
    voiceSearchListen: "Écoute vocale en cours... Parler de l'article souhaité",
    voiceSearchStop: "Traitement de l'audio par Gemini...",
    lensTitle: "Scanner & Créateur de Code QR",
    lensScan: "Alignez le Code QR de votre produit pour l'ouvrir instantanément !...",
    negotiationTitle: "Harcèlement commercial & Négociation de prix",
    negotiateSubmit: "Proposer mon prix",
    negotiateCounter: "Contre-offre du marchand"
  },
  en: {
    appName: "KUFULULA",
    heroBadge: "Free Trade & Escrow Public Workspace",
    heroTitle: "The trust ecosystem for Central Africa.",
    heroSub: "Buy safely backed by our DRC multi-rail Mobile Money escrow protocol and instant face verification.",
    searchPlaceholder: "Search by keyword, voice query, or QR Code...",
    categoryAll: "All Collections",
    categoryElectronics: "Electronics",
    categoryFood: "Groceries",
    categoryFashion: "Fashion & Prints",
    categoryHome: "Home utilities",
    categoryBooks: "Books",
    noProductFound: "No available matching products found.",
    noProductSub: "Adjust filter query or launch camera / voice translation helper.",
    cartTitle: "Your Shopping Bag",
    addToCart: "Add to Bag",
    buyNow: "Checkout securely",
    negotiate: "Haggle",
    share: "Share",
    like: "Like",
    comment: "Comment",
    commentsTitle: "Real Community Discussions",
    writeComment: "Post an honest review...",
    postComment: "Comment",
    colorSelect: "Choose product color:",
    angleSelect: "Viewport Angle:",
    specifications: "Technical Specs sheet",
    vendorLabel: "Certified Vendor",
    stockLabel: "Available in stock",
    priceLabel: "Direct Pricing",
    escrowBadge: "Guaranteed Mobile Money Escrow",
    escrowActiveBadge: "Escrow enabled",
    escrowStatusSecured: "Funds secured",
    kycVerificationRequired: "Instant KYC confirmation required to disburse",
    backToShop: "Return to Catalog",
    settingsTitle: "Design Parameters & Experience",
    themeSelect: "Interface Custom Skin",
    fontSelect: "Typography style",
    currencyToggle: "Toggle rate converter",
    adminPortal: "Administrative Panel",
    voiceSearchListen: "Listening to query... State desired item out loud",
    voiceSearchStop: "Processing audio with Gemini AI model...",
    lensTitle: "QR Code Scanner & Creator",
    lensScan: "Align the product or shipment QR Code to scan it instantly!...",
    negotiationTitle: "Price Negotiation & Counter-offer",
    negotiateSubmit: "Propose purchase price",
    negotiateCounter: "Merchant response"
  },
  ln: {
    appName: "KUFULULA",
    heroBadge: "Esika ya Bopeto ya Bobandi & Botia-Motema",
    heroTitle: "Ecosystème ya bosembo pon'Africa.",
    heroSub: "Somba na kiyungulu na mindondo te na nzela ya escrow ya Mobile Money na RDC.",
    searchPlaceholder: "Luka biloko na mongongo to na foti na bilili...",
    categoryAll: "Biloko nionso",
    categoryElectronics: "Kura na Masini",
    categoryFood: "Bilia ya Kolia",
    categoryFashion: "Lilangwa ya Liputa",
    categoryHome: "Biloko ya Ndako",
    categoryBooks: "Mikanda",
    noProductFound: "Eloko moko te emonani na motango.",
    noProductSub: "Bongisa lifiltre to sala kosalela na mongongo to foti ya fono.",
    cartTitle: "Kapo nayo ya Bosombi",
    addToCart: "Bakisa na Kapo",
    buyNow: "Somba Sikoyo na Kimia",
    negotiate: "Meka Talo",
    share: "Kabola na baninga",
    like: "Linga eloko",
    comment: "Tia Liloba",
    commentsTitle: "Malamu ya Bato nionso ya mboka",
    writeComment: "Koma likambo ya bosembo...",
    postComment: "Tia likambo",
    colorSelect: "Pona langi ya eloko :",
    angleSelect: "Liko kotala :",
    specifications: "Biyekoli ya Mozindo",
    vendorLabel: "Moteki ya bosembo",
    stockLabel: "Motango ya motako",
    priceLabel: "Talo ya nka",
    escrowBadge: "Escrow ya Mobile Money na Kimia",
    escrowActiveBadge: "Botia-motema ezali",
    escrowStatusSecured: "Mbongo ebatelami",
    kycVerificationRequired: "Kotala elongi KYC ya nka ezali na tina",
    backToShop: "Zonga na motango",
    settingsTitle: "Boponi ya elongi ya l'application",
    themeSelect: "Langi ya Langi",
    fontSelect: "Lolenge ya kokoma",
    currencyToggle: "Bongola mbongo",
    adminPortal: "Bokonzi ya Molongi",
    voiceSearchListen: "Azali koyoka yo... Loba eloko olingi kosomba",
    voiceSearchStop: "Gemini AI azali kotala audio...",
    lensTitle: "Google Lens na Gemini foti Scanner",
    lensScan: "Tia foti ya eloko mpo kura ekanga...",
    negotiationTitle: "Koloba talo na moteki ya biloko",
    negotiateSubmit: "Kopesa talo na ngai",
    negotiateCounter: "Liloba ya moteki"
  },
  sw: {
    appName: "KUFULULA",
    heroBadge: "Soko Huria ya Biashara na Usalama wa Escrow",
    heroTitle: "Mfumo wa uaminifu kwa Afrika ya Kati.",
    heroSub: "Nunua kwa salama kupitia escrow ya Mobile Money na uthibitisho wa uso ya KYC.",
    searchPlaceholder: "Tafuta bidhaa kwa maneno, sauti au picha ya lens...",
    categoryAll: "Mikusanyiko Yote",
    categoryElectronics: "Vifaa vya Umeme",
    categoryFood: "Chakula na Matunda",
    categoryFashion: "Mavazi na Vitenge",
    categoryHome: "Vyombo vya Ndani",
    categoryBooks: "Vitabu ya Maarifa",
    noProductFound: "Hakuna bidhaa inayolingana na ombi lako.",
    noProductSub: "Badilisha kichujio to omba msaada wa sauti na picha.",
    cartTitle: "Kikapu Chako cha Manunuzi",
    addToCart: "Weka Kwenye Kikapu",
    buyNow: "Lipia Maagizo Sikoyo kikawaida",
    negotiate: "Elewana Bei",
    share: "Shiriki na Wengi",
    like: "Pendezwa",
    comment: "Andika Maoni",
    commentsTitle: "Maoni kutoka kwa Jamii",
    writeComment: "Andika maoni ya kweli...",
    postComment: "Tuma Maoni",
    colorSelect: "Chagua rangi ya bidhaa:",
    angleSelect: "Pembe ya picha:",
    specifications: "Ufafanuzi kamili wa kiufundi",
    vendorLabel: "Muuzaji aliyeidhinishwa",
    stockLabel: "Kiasi kilichopo ghalani",
    priceLabel: "Hesabu ya bei",
    escrowBadge: "Dhamana ya Escrow ya Mobile Money",
    escrowActiveBadge: "Dhamana imewezeshwa",
    escrowStatusSecured: "Pesa ziko salama",
    kycVerificationRequired: "Uthibitisho wa KYC kwa sekunde moja unahitajika",
    backToShop: "Rudi Kwenye Orodha",
    settingsTitle: "Mipangilio ya Jinsi Web inavyoonekana",
    themeSelect: "Mandhari ya Rangi",
    fontSelect: "Muundo wa Herufi",
    currencyToggle: "Badilisha hesabu ya pesa",
    adminPortal: "Tovuti ya Usimamizi",
    voiceSearchListen: "Inasikiliza sasa... Taja jina la bidhaa yako",
    voiceSearchStop: "Gemini inachambua sauti yako...",
    lensTitle: "Scanner na Muundaji wa Code QR",
    lensScan: "Lenga alama ya kadi ya Code QR kukelula...",
    negotiationTitle: "Majadiliano ya Bei na Ofa Mbadala",
    negotiateSubmit: "Tuma bei ninayotaka kulipia",
    negotiateCounter: "Majibu ya muuzaji"
  },
  lu: {
    appName: "KUFULULA",
    heroBadge: "Mbuilu wa Bianda ne Kudisungila kua Diatamba",
    heroTitle: "Bulongolodi bua dieyemena bua Centrafrique.",
    heroSub: "Sumba mianya ne butekemenu buonso mu diambuluisha dia escrow ya Mobile Money mu RDC.",
    searchPlaceholder: "Keba bintu ne miaku to ne foti ya kashi...",
    categoryAll: "Bintu Bionso mutupu",
    categoryElectronics: "Mashinyi ne Diambuluisha",
    categoryFood: "Biakudia bia ditunda",
    categoryFashion: "Bilamba bia kapia",
    categoryHome: "Nzubilu ne Bilamba",
    categoryBooks: "Mikanda ya Tshisumbu",
    noProductFound: "Kakuena eloko mimonike mu liste to.",
    noProductSub: "Keba bikuabo bintu to munda mua foti to ne diyi.",
    cartTitle: "Tshisaku tshebe tshia Manunza",
    addToCart: "Ela mu tshisaku",
    buyNow: "Sumba ne ditalala",
    negotiate: "Yukidila Talo",
    share: "Kabola bionso bionso",
    like: "Linga eloko",
    comment: "Akula tshinyi",
    commentsTitle: "Malu mimonika kundi ku bantu",
    writeComment: "Funda malu a jiji...",
    postComment: "Ela diyi",
    colorSelect: "Sola nkuluka ya bintu :",
    angleSelect: "Kutangila kua mianya :",
    specifications: "Mukanda wa Bipapu bionso",
    vendorLabel: "Muledi mupishibue",
    stockLabel: "Bintu bishaleko",
    priceLabel: "Ditala talo",
    escrowBadge: "Escrow ya Mobile Money ifidibue ne Kimia",
    escrowActiveBadge: "Diyemena didiko",
    escrowStatusSecured: "Mfalanga miaba misungidibue",
    kycVerificationRequired: "Kutangila mianya ya elongi KYC ne muenji",
    backToShop: "Pinganaye mu tshisumbu",
    settingsTitle: "Dilongolola dia visual ya web",
    themeSelect: "Langi ya Nzubilu",
    fontSelect: "Mushindu wa mufundilu",
    currencyToggle: "Shintulula lupolo",
    adminPortal: "Lubanza lua Batatabi",
    voiceSearchListen: "Teleja diyi lusezo... Akulaye eloko mudi usumba",
    voiceSearchStop: "Gemini AI utangila diyi...",
    lensTitle: "Scanner ne Kienji kia Code QR",
    lensScan: "Tia kumpala kua Code QR mpo na foti...",
    negotiationTitle: "Muyukidilu wa Talo ne ofe wa muledi",
    negotiateSubmit: "Fila talo wanyi mudiko",
    negotiateCounter: "Andamina wa muteki"
  },
  kg: {
    appName: "KUFULULA",
    heroBadge: "Kisika ya Bumbote ya Mumbongo ne Mboko-Lukonku",
    heroTitle: "Kinungi ya luvuvamu beto na RDC.",
    heroSub: "Sumba bima na luvuvamu yawu yonso na nzela ya escrow ya fuku ya mbongo na RDC.",
    searchPlaceholder: "Sosa bima na mbila ya ndinga to na kifoto...",
    categoryAll: "Bima yonso yawu",
    categoryElectronics: "Bima ya kura ne mpesa",
    categoryFood: "Madia ya kwidia",
    categoryFashion: "Binkutu ne bilele",
    categoryHome: "Bima ya nzo na nzo",
    categoryBooks: "Mikanda ya mayele",
    noProductFound: "Ata kima mosi veto mutangilu.",
    noProductSub: "Zibula lifiltre to sadila ndingula to kibanza ya kifoto ya kashi.",
    cartTitle: "Kiteki na nge ya nsombilu",
    addToCart: "Tulula na kiteki",
    buyNow: "Sumba dyaka nswalu kwikila",
    negotiate: "Zonza Talu",
    share: "Kabula na banduku",
    like: "Zola kima",
    comment: "Tuba mambu",
    commentsTitle: "Nsamu ya bampangi yonso",
    writeComment: "Sonika dilongi ya masonga...",
    postComment: "Tika mambu",
    colorSelect: "Pona mutindu ya nitu :",
    angleSelect: "Nsulukusu ya ntalulu :",
    specifications: "Ukilu yonso ya kima ya mumbongo",
    vendorLabel: "Muteki ya ntembe mosi te",
    stockLabel: "Ntangilu ya kisalu",
    priceLabel: "Talu yawu mosi",
    escrowBadge: "Kukangama ya Mbongo ya mumbongo na kiyungulu",
    escrowActiveBadge: "Lukonku ya ndungunu keti",
    escrowStatusSecured: "Mbongo me batama",
    kycVerificationRequired: "Kutalulula elongi KYC nswalu yawu mfunu",
    backToShop: "Vutuka na soko",
    settingsTitle: "Mponilu ya mutindu ya kura ya web",
    themeSelect: "Mutindu ya kura",
    fontSelect: "Mutindu ya bisono",
    currencyToggle: "Sobula mbongo",
    adminPortal: "Minyati ya luyalu",
    voiceSearchListen: "Yandi ke wila nge... Tuba kima o ke sosa sumba",
    voiceSearchStop: "Gemini me talula ndinga na nge...",
    lensTitle: "Scanner ye Kienji kia Code QR",
    lensScan: "Nata kifoto ya Code QR sambu na kukelula...",
    negotiationTitle: "Nsonikolo ya Talu ne ndungulu ya muteki",
    negotiateSubmit: "Pesana talu wanyi",
    negotiateCounter: "Ntalulu ya muteki beto"
  }
};
