/**
 * KUFULULA Core Firebase & Mock Persistence Layer
 * Integrates real Firebase configuration if available, otherwise runs a high-fidelity
 * LocalStorage fallback to support fully persisted states and dynamic CRUD operations in standard sandbox.
 */

import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut as fbSignOut } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, getDoc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { Product, DirectTransaction, UserAuth, UserRole } from "../types";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // CRITICAL: The app will break without this line
export const auth = getAuth(app);

// Handle Firestore Errors (Mandated by SKILL.md guide)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection to Firestore (As mandated by SKILL.md guide)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Helper to provide realistic matching images for products
const getUnsplashImagesForCategory = (category: string, index: number): string[] => {
  const imagesMap: Record<string, string[][]> = {
    "Electronics": [
      [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517055729445-fa7d27394b48?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop"
      ],
      [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=800&auto=format&fit=crop"
      ],
      [
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?q=80&w=800&auto=format&fit=crop"
      ]
    ],
    "Food": [
      [
        "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
      ],
      [
        "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1553530979-7ee52a2670c4?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1579613832125-5d34a13fee2a?q=80&w=800&auto=format&fit=crop"
      ]
    ],
    "Fashion": [
      [
        "https://images.unsplash.com/photo-1566207274740-0f8cf6b7d5a5?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop"
      ],
      [
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"
      ]
    ],
    "Home": [
      [
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=800&auto=format&fit=crop"
      ],
      [
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop"
      ]
    ],
    "Livre": [
      [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop"
      ],
      [
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format&fit=crop"
      ]
    ]
  };

  const pool = imagesMap[category] || imagesMap["Electronics"];
  const listIdx = index % pool.length;
  return pool[listIdx];
};

/// Raw definitions for 50 Congolese products (10 per category) in Electronics, Food, Fashion, Home, and Livre.
const PRODUCTS_DATA_SOURCE = [
  // --- ELECTRONICS & TECHNOLOGY (10 Items) ---
  {
    category: "Electronics",
    items: [
      { 
        id: "mwinda-solar", 
        title: "MWINDA Solaire Lantern v4", 
        price: 49, 
        originalPrice: 65, 
        vendor: "Kongo-Innovations Ltd", 
        desc: "Lumière solaire premium en cuivre brossé et diffuseur opale, équipée d'un port USB-C bidirectionnel. Conçue pour résister aux coupures d'électricité de Kinshasa.", 
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop",
        tags: ["Solar", "Home", "Solaire", "Kinshasa"] 
      },
      { 
        id: "moto-router", 
        title: "MOTO Smart Hybrid Router 4G", 
        price: 129, 
        originalPrice: 159, 
        vendor: "Kinshasa Digital Labs", 
        desc: "Routeur durci 4G/LTE + Wi-Fi 6 multi-opérateurs (Airtel, Vodacom, Orange) avec batterie de secours de 18 heures pour une connectivité continue.", 
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
        tags: ["Tech", "Internet", "Hardware", "Goma"] 
      },
      { 
        id: "lukasa-ledger", 
        title: "LUKASA Smart Key Ledger Wood", 
        price: 249, 
        originalPrice: 299, 
        vendor: "Kufulula Labs Ltd", 
        desc: "Clé matérielle cryptographique gravée en bois de wengé naturel d'Afrique centrale. Sécurité biométrique numérique de pointe.", 
        image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=800&auto=format&fit=crop",
        tags: ["Crypto", "Premium", "Wenge", "Lubumbashi"] 
      },
      { 
        id: "kivu-charger", 
        title: "Chargeur Solaire Kivu-Power v2", 
        price: 35, 
        originalPrice: 45, 
        vendor: "Kivu Tech Builders", 
        desc: "Batterie externe solaire de 20000mAh incassable, idéale pour charger vos téléphones lors des missions sur le terrain.", 
        image: "https://images.unsplash.com/photo-1609592424085-78e763b6bb83?q=80&w=800&auto=format&fit=crop",
        tags: ["Solar", "Charger", "Utility", "Bukavu"] 
      },
      { 
        id: "kolwezi-panel", 
        title: "Kit Solaire Kolwezi Sun 150W", 
        price: 399, 
        originalPrice: 450, 
        vendor: "Lualaba Solar Solutions", 
        desc: "Panneau solaire complet de 150W avec onduleur intégré et régulateur intelligent de charge pour sécuriser l'alimentation domestique.", 
        image: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?q=80&w=800&auto=format&fit=crop",
        tags: ["Solar", "Energy", "Home", "Kolwezi"] 
      },
      { 
        id: "robot-stem", 
        title: "Kit Scientifique Robotique CongoStem", 
        price: 149, 
        originalPrice: 195, 
        vendor: "Bomoko EduTech", 
        desc: "Kit d'apprentissage robotique et électronique pour étudiants congolais. Permet de concevoir des petits circuits de programmation et science appliquée.", 
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop",
        tags: ["Science", "Education", "Robotics", "Technology"] 
      },
      { 
        id: "car-diag-service", 
        title: "OBD-2 Diagnostic Électrique Auto", 
        price: 39, 
        originalPrice: 55, 
        vendor: "Kinshasa Auto Diagnostics", 
        desc: "Service professionnel de diagnostic électrique complet par scanner OBD2 pour toutes marques de voitures. Identification rapide des pannes.", 
        image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=800&auto=format&fit=crop",
        tags: ["Service", "Car", "Electrical", "Diagnostics"] 
      },
      { 
        id: "microscope-sc", 
        title: "Microscope Numérique Pro Science", 
        price: 180, 
        originalPrice: 240, 
        vendor: "Kisangani Tools & Scientific", 
        desc: "Microscope de poche numérique haute définition avec connexion USB pour étude botanique et scientifique sur le terrain.", 
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop",
        tags: ["Science", "Digital", "Microscope", "Kisangani"] 
      },
      { 
        id: "kongobeat-spk", 
        title: "Enceinte Musique KongoBeat Bluetooth", 
        price: 69, 
        originalPrice: 90, 
        vendor: "Matadi Waves", 
        desc: "Enceinte sans fil étanche en bois acoustique avec haut-parleur optimisé pour vibrer au rythme de la rumba et soukous congolais.", 
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop",
        tags: ["Music", "Audio", "Wenge", "Boma"] 
      },
      { 
        id: "smart-drone-bot", 
        title: "Drone Botanique Virunga-Sky Tracker", 
        price: 299, 
        originalPrice: 399, 
        vendor: "Virunga Inverters & Drone Tech", 
        desc: "Drone miniature intelligent pour le survol de forêts tropicales, la reconnaissance des sols et cartographie agricole interactive rdc.", 
        image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop",
        tags: ["Tech", "Drone", "Botany", "Virunga"] 
      }
    ]
  },
  // --- ALIMENTATION, CUISINE & PÂTISSERIE (10 Items) ---
  {
    category: "Food",
    items: [
      { 
        id: "kasai-coffee", 
        title: "Café de Kasaï Custom Reserve", 
        price: 19, 
        originalPrice: 24, 
        vendor: "Collectif Café Kivu & Kasaï", 
        desc: "Café de spécialité torréfié à la main, issu des hauts plateaux du Congo. Notes légères de chocolat noir et fruits des forêts.", 
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop",
        tags: ["Coffee", "Organic", "Bukavu", "Kasai"] 
      },
      { 
        id: "bakery-pastry", 
        title: "Menu Pâtissier Boulanger du Fleuve", 
        price: 85, 
        originalPrice: 110, 
        vendor: "La Renaissance Kinshasa", 
        desc: "Service traiteur de viennoiseries, gâteaux et pains spéciaux pour événements. Idéal pour baptêmes, réunions professionnelles.", 
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop",
        tags: ["Baking", "Pastry", "Catering", "Kinshasa"] 
      },
      { 
        id: "catering-wedding", 
        title: "Service Traiteur Buffet Mariage Chic", 
        price: 1200, 
        originalPrice: 1500, 
        vendor: "Congo Prestige Traiteur", 
        desc: "Buffet gastronomique haut de gamme pour 100 invités, alliant mets occidentaux de prestige et plats classiques congolais raffinés.", 
        image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop",
        tags: ["Catering", "Wedding", "Gastronomy", "Service"] 
      },
      { 
        id: "chef-service", 
        title: "Service de Chef Cuisine à Domicile", 
        price: 150, 
        originalPrice: 220, 
        vendor: "Congo Gastronomy Club", 
        desc: "Un chef d'élite prépare chez vous un menu typique congolais revisité (Moambe de poulet de brousse, Pondu d'exception, Liboke).", 
        image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop",
        tags: ["Cuisine", "Chef", "Service", "Kinshasa"] 
      },
      { 
        id: "gbado-pili", 
        title: "Piment Rouge Séché de Gbadolite", 
        price: 7, 
        originalPrice: 10, 
        vendor: "Gbadolite Épices", 
        desc: "Véritable pili-pili traditionnel fort en goût, séché à l'ensoleillement naturel. Apporte le vrai piquant requis de la cuisine congolaise.", 
        image: "https://images.unsplash.com/photo-1588252303782-cb80119cb4bb?q=80&w=800&auto=format&fit=crop",
        tags: ["Pepper", "Spicy", "Equateur", "Organic"] 
      },
      { 
        id: "equator-honey", 
        title: "Miel Sauvage Bio de l'Équateur", 
        price: 15, 
        originalPrice: 18, 
        vendor: "Ruchers de Mbandaka", 
        desc: "Miel d'abeille féroce sauvage récolté au coeur de la grande forêt équatoriale primaire rdc. Riche arôme liquoreux boisé.", 
        image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?q=80&w=800&auto=format&fit=crop",
        tags: ["Honey", "Pure", "Mbandaka", "Eco"] 
      },
      { 
        id: "manioc-kamina", 
        title: "Farine de Manioc Suprême Kamina", 
        price: 12, 
        originalPrice: 15, 
        vendor: "Minoterie de Kamina", 
        desc: "Foufou de manioc blanc deux fois moulu. Texture extra fine idéale pour une pâte souple sans grumeaux.", 
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop",
        tags: ["Meal", "Fufu", "Kamina", "Local"] 
      },
      { 
        id: "bukavu-tea", 
        title: "Infusion Thé Noir de Bukavu Artisanal", 
        price: 8, 
        originalPrice: 11, 
        vendor: "Plantations du Kivu", 
        desc: "Feuilles entières de thé noir de montagne cultivées en altitude près de Bukavu. Riche en antioxydants naturels.", 
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=800&auto=format&fit=crop",
        tags: ["Tea", "Organic", "Bukavu", "Relax"] 
      },
      { 
        id: "mayombe-choco", 
        title: "Chocolat Mayombe Noir Intense 80%", 
        price: 6, 
        originalPrice: 8, 
        vendor: "Artisans du Mayombe", 
        desc: "Tablette fine de chocolat d'origine produit à partir de fèves de cacao biologiques de la vallée forestière du Kongo Central.", 
        image: "https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop",
        tags: ["Chocolat", "Sweet", "Mayombe", "KongoCentral"] 
      },
      { 
        id: "bolobo-mango", 
        title: "Nectar Pur jus Mangue de Bolobo", 
        price: 5, 
        originalPrice: 7, 
        vendor: "Pressoirs de Bolobo", 
        desc: "Nectar épais et juteux, pressé de mangues sauvages mûries sur l'arbre de Bolobo. Zéro sucre ajouté, goût tropical brut.", 
        image: "https://images.unsplash.com/photo-1534080564883-140030b130e8?q=80&w=800&auto=format&fit=crop",
        tags: ["Juice", "Mango", "Équateur", "Organic"] 
      }
    ]
  },
  // --- FASHION, CÉRÉMONIES & MARIAGES (10 Items) ---
  {
    category: "Fashion",
    items: [
      { 
        id: "superwax-congo", 
        title: "Super-Wax Block Congo Impérial", 
        price: 75, 
        originalPrice: 95, 
        vendor: "Maison de Pagne Kinshasa", 
        desc: "Tissu wax haut de gamme en pur coton peigné, longueur 6 yards. Motifs festifs authentiques colorés pour dote et cérémonies.", 
        image: "https://images.unsplash.com/photo-1566207274740-0f8cf6b7d5a5?q=80&w=800&auto=format&fit=crop",
        tags: ["Pagne", "Cotton", "Premium", "Kinshasa"] 
      },
      { 
        id: "wedding-planning", 
        title: "Service d'Organisation Mariage de Rêve", 
        price: 2500, 
        originalPrice: 3200, 
        vendor: "Kufulula Cérémonies", 
        desc: "Planification intégrale de votre dote ou mariage civil : décoration somptueuse, location de salle, gestion sonore, protocole et KYC.", 
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
        tags: ["Service", "Wedding", "Decoration", "Planning"] 
      },
      { 
        id: "robe-mariee", 
        title: "Robe de Mariée en Soie & Wax Royal", 
        price: 650, 
        originalPrice: 850, 
        vendor: "Couture Spéciale Kinshasa", 
        desc: "Majestueuse robe de mariée sur mesure combinant la mousseline de soie blanche et de fins rappels de véritable wax royal congolais.", 
        image: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=800&auto=format&fit=crop",
        tags: ["Wedding", "Gown", "Fashion", "Congo"] 
      },
      { 
        id: "kimono-wenge", 
        title: "Boubou Kimono Wengé Coutures", 
        price: 120, 
        originalPrice: 150, 
        vendor: "Atelier Wenge Sarl", 
        desc: "Pièce haute couture moderne alliant la découpe kimono épurée et les traditions de motifs imprimés à Lubumbashi.", 
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
        tags: ["Wear", "Kimono", "Style", "Lubumbashi"] 
      },
      { 
        id: "masina-sandals", 
        title: "Sandales Cuir Cuisson Masina", 
        price: 35, 
        originalPrice: 45, 
        vendor: "Artisans du Cuir Masina", 
        desc: "Sandales d'été résistantes cousues en cuir de buffle tanné et assemblées sur semelle de pneu recyclé ultra-endurante face au sable.", 
        image: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?q=80&w=800&auto=format&fit=crop",
        tags: ["Shoes", "Leather", "Craft", "Masina"] 
      },
      { 
        id: "jacket-kasai", 
        title: "Bomber Jacket Velours Kasaï", 
        price: 140, 
        originalPrice: 180, 
        vendor: "Kasai Couture", 
        desc: "Veste homme de coupe bomber urbaine avec impressions géométriques inspirées du célèbre tissage kuba velours du Kasaï.", 
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop",
        tags: ["Jacket", "Luxury", "Design", "Kananga"] 
      },
      { 
        id: "shirt-tshela", 
        title: "Chemise Col Officier Kongo-Blanc", 
        price: 49, 
        originalPrice: 60, 
        vendor: "Tshela Confection", 
        desc: "Chemise de ville homme en fil de coton fin de Tshela. Coupe impeccable et boutons nacrés.", 
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop",
        tags: ["Shirt", "Cotton", "White", "Tshela"] 
      },
      { 
        id: "leopard-attire", 
        title: "Boubou Traditionnel de Chef Léopard", 
        price: 210, 
        originalPrice: 260, 
        vendor: "Couture Royale Kinshasa", 
        desc: "Robe traditionnelle africaine symbole de sagesse et force. Tissu soyeux orné broderies dorées.", 
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
        tags: ["Royalty", "Rich", "Traditional", "Kinshasa"] 
      },
      { 
        id: "cap-kinvibe", 
        title: "Casquette Streetwear Urban Kin-Vibe", 
        price: 18, 
        originalPrice: 25, 
        vendor: "KinVibe Streetwear", 
        desc: "Casquette brodée à broderie épaisse illustrant l'art graffiti de Kinshasa et l'énergie des jeunes ambianceurs.", 
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop",
        tags: ["Cap", "Streetwear", "Youth", "Kinshasa"] 
      },
      { 
        id: "suit-wedding", 
        title: "Costume de Marié sur Mesure de Luxe", 
        price: 390, 
        originalPrice: 480, 
        vendor: "Maison de la Dote & Elégance", 
        desc: "Ensemble complet 3 pièces cintré pour marié. Laine légère italienne assemblée à la main à Gombe.", 
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
        tags: ["Groom", "Suit", "Wedding", "Kinshasa"] 
      }
    ]
  },
  // --- INVENTAIRE MAISON, BOTANIQUE, DECOR & JARDIN (10 Items) ---
  {
    category: "Home",
    items: [
      { 
        id: "mortier-wenge", 
        title: "Mortier & Pilon Traditionnel Wengé", 
        price: 45, 
        originalPrice: 55, 
        vendor: "Ébénistes de Kimpese", 
        desc: "Mortier sculpté dans une pièce massive de wengé noir. Parfait pour piler le pondu, les condiments ou le cacao de jardin.", 
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
        tags: ["Kitchen", "Wood", "Cooking", "Kimpese"] 
      },
      { 
        id: "kikwit-raphi", 
        title: "Tapis Mural tressé Kikwit Raphia", 
        price: 85, 
        originalPrice: 110, 
        vendor: "Tissage de Kikwit", 
        desc: "Tenture décorative faite de fibres naturelles séchées de raphia et lianes indigènes. Teintures biologiques.", 
        image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop",
        tags: ["Decor", "Raphia", "Wall", "Kikwit"] 
      },
      { 
        id: "copper-lamp", 
        title: "Lampe de Bureau Lubumbashi Cuivre", 
        price: 115, 
        originalPrice: 140, 
        vendor: "Fondeurs de Lubumbashi", 
        desc: "Belle lampe design avec bras flexible forgée à la main en cuivre brillant d'origine locale.", 
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
        tags: ["Lamp", "Home", "Copper", "Lubumbashi"] 
      },
      { 
        id: "bonsai-palm", 
        title: "Bonsaï Palmier Sauvage Équateur", 
        price: 59, 
        originalPrice: 75, 
        vendor: "Jardins Botaniques de Kisantu", 
        desc: "Botanique d'intérieur : miniature de palmier indigène dressée avec patience dans un pot en argile typique congolais.", 
        image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=800&auto=format&fit=crop",
        tags: ["Botany", "Plant", "Bonsai", "Kisantu"] 
      },
      { 
        id: "organic-seeds", 
        title: "Kit Semences Bio Plantes Médicinales", 
        price: 25, 
        originalPrice: 35, 
        vendor: "Laboratoire Botanique National RDC", 
        desc: "Kit complet pour cultiver chez vous vos plantes médicinales et botaniques (Citronnelle sauvage, Artemisia, Moringa).", 
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop",
        tags: ["Botanique", "Science", "Seeds", "Organic"] 
      },
      { 
        id: "bio-fertilizer", 
        title: "Fertilisant Botanique Algues du Fleuve", 
        price: 19, 
        originalPrice: 25, 
        vendor: "Kongo Agri-Botanique", 
        desc: "Nourriture végétale et fertilisant liquide biologique extrait d'algues douces du grand fleuve Congo rdc.", 
        image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=800&auto=format&fit=crop",
        tags: ["Botany", "Fertilizer", "Bio", "Science"] 
      },
      { 
        id: "garden-service", 
        title: "Service Paysagiste & Végétalisation Goma", 
        price: 350, 
        originalPrice: 450, 
        vendor: "Kivu Paysages & Flore", 
        desc: "Service professionnel pour aménagement de jardins, cours intérieures et végétalisation verticale à base de plantes endémiques du Nord-Kivu.", 
        image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=800&auto=format&fit=crop",
        tags: ["Service", "Botanique", "Lawn", "Goma"] 
      },
      { 
        id: "safari-chair", 
        title: "Fauteuil Teck Safari de l'Ituri", 
        price: 295, 
        originalPrice: 350, 
        vendor: "Menuisiers Solidaires de Goma", 
        desc: "Pliant classique de camping de luxe ou de véranda. Teck de culture certifiée durable et cuir brun.", 
        image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=800&auto=format&fit=crop",
        tags: ["Furniture", "Teak", "Luxury", "Ituri"] 
      },
      { 
        id: "volcan-stone", 
        title: "Bougeoirs Trio en Pierre de Goma", 
        price: 32, 
        originalPrice: 45, 
        vendor: "Art Sculptural Virunga", 
        desc: "Ensemble de 3 bougeoirs sculptés dans de la roche basaltique noire du volcan Nyiragongo.", 
        image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=800&auto=format&fit=crop",
        tags: ["Stone", "Decor", "Volcano", "Goma"] 
      },
      { 
        id: "congo-carafe", 
        title: "Carafe d'Argile Bas-Congo Purificatrice", 
        price: 38, 
        originalPrice: 50, 
        vendor: "Potiers d'Inkissi", 
        desc: "Récipient traditionnel en argile poreuse agissant comme filtre réfrigérant physique. Garde l'eau pure et fraîche.", 
        image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=800&auto=format&fit=crop",
        tags: ["Clay", "Kitchen", "Water", "Inkissi"] 
      }
    ]
  },
  // --- LIVRES, GUIDES & DOCUMENTAIRES SCIENTIFIQUES (10 Items) ---
  {
    category: "Livre",
    items: [
      { 
        id: "kongo-dynas", 
        title: "La Dynastie Kongo & ses Secrets", 
        price: 20, 
        originalPrice: 28, 
        vendor: "Éditions du Mayombe", 
        desc: "Roman d'histoire approfondi analysant l'organisation politique, sociale et spirituelle de l'ancien Royaume du Kongo.", 
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
        tags: ["Books", "History", "Kongo", "Scholar"] 
      },
      { 
        id: "roman-bukavu", 
        title: "L'Amour sous le Ciel de Bukavu", 
        price: 14, 
        originalPrice: 19, 
        vendor: "Cercle des Plumiers Littéraires", 
        desc: "Un roman dramatique captivant sur le destin de deux amants dans le tumulte côtier et romantique du lac Kivu.", 
        image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format&fit=crop",
        tags: ["Books", "Novel", "Romance", "Bukavu"] 
      },
      { 
        id: "guide-botanique", 
        title: "Index des Plantes Médicinales RDC", 
        price: 28, 
        originalPrice: 38, 
        vendor: "Presses Académiques de Kinshasa", 
        desc: "Livre scientifique de référence détaillant les propriétés thérapeutiques de 250 espèces de la flore tropicale botanique du fleuve.", 
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop",
        tags: ["Books", "Science", "Botany", "Medicinal"] 
      },
      { 
        id: "car-repair-manual", 
        title: "Guide de Maintenance Automobile RDC", 
        price: 35, 
        originalPrice: 45, 
        vendor: "Auto Académie Kinshasa", 
        desc: "Livre technique indispensable pour l'apprentissage de la mécanique automobile générale et la réparation des circuits électriques automobiles.", 
        image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=800&auto=format&fit=crop",
        tags: ["Books", "Car", "Technical", "Learning"] 
      },
      { 
        id: "sci-kids", 
        title: "Cahier d'Activités Sciences Junior", 
        price: 15, 
        originalPrice: 22, 
        vendor: "Éditions Scolaires KongoStem", 
        desc: "Manuel d'expérimentation éducative pour les enfants. Contient des petites expériences de botanique rdc, physique et chimie amusante.", 
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop",
        tags: ["Books", "Science", "Education", "Kids"] 
      },
      { 
        id: "lingala-gram", 
        title: "Grammaire Appliquée du Lingala", 
        price: 15, 
        originalPrice: 20, 
        vendor: "Centre de Linguistique de Kinshasa", 
        desc: "Guide d'apprentissage progressif écrit par des académiciens pour assimiler l'orthographe nationale et les coutumes verbales d'ici.", 
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
        tags: ["Books", "Language", "Lingala", "Learn"] 
      },
      { 
        id: "congo-une-hist", 
        title: "Congo : Une Histoire Contemporaine", 
        price: 25, 
        originalPrice: 32, 
        vendor: "Éditions de l'Équateur", 
        desc: "Ouvrage de sociologie majeur détaillant le parcours contemporain de la RDC depuis l'émancipation coloniale du pays.", 
        image: "https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?q=80&w=800&auto=format&fit=crop",
        tags: ["Books", "Society", "Politics", "Congo"] 
      },
      { 
        id: "culi-congo", 
        title: "La Cuisine Congolaise Ancestrale", 
        price: 22, 
        originalPrice: 30, 
        vendor: "Éditions Bolobo Cuisine", 
        desc: "Guide culinaire de ménage complet décrivant les herbes aromatiques de botanique et recettes du grand terroir congolais.", 
        image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop",
        tags: ["Books", "Cooking", "Gastronomy", "Recipe"] 
      },
      { 
        id: "negoc-art", 
        title: "L'Art Subtil de la Négociation KUFULULA", 
        price: 16, 
        originalPrice: 22, 
        vendor: "Kufulula Business Academy", 
        desc: "Le best-seller éducatif expliquant comment négocier efficacement sur les marchés d'affaires africains et sécuriser son séquestre commercial.", 
        image: "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=800&auto=format&fit=crop",
        tags: ["Books", "Business", "Negotiation", "Kufulula"] 
      },
      { 
        id: "swahili-dict", 
        title: "Dictionnaire Pratique Swahili-Français", 
        price: 19, 
        originalPrice: 25, 
        vendor: "Université de Goma Presses", 
        desc: "Plus de 25000 termes et expressions idiomatiques de l'Est pour maîtriser le swahili commercial d'aujourd'hui.", 
        image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop",
        tags: ["Books", "Language", "Swahili", "Education"] 
      }
    ]
  }
];

// Flat master mapper to generate the 50 typed objects
const build52InitialProducts = (): Product[] => {
  const list: Product[] = [];
  let indexCounter = 0;

  for (const group of PRODUCTS_DATA_SOURCE) {
    const category = group.category;
    for (const item of group.items) {
      const idx = indexCounter++;
      const singleImage = item.image || "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop";
      
      const p: Product = {
        id: `prod-${item.id}`,
        title: item.title,
        description: item.desc,
        price: item.price,
        originalPrice: item.originalPrice,
        currency: "USD",
        image: singleImage,
        category: category,
        stock: Math.floor(10 + (idx * 3) % 110),
        vendor: item.vendor,
        tags: item.tags,
        isDraft: false,
        isPublished: true,
        createdAt: new Date(Date.now() - (idx % 15) * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - (idx % 15) * 24 * 3600 * 1000).toISOString()
      };

      // Custom attributes for user request (Infinite previews)
      (p as any).likesCount = Math.floor((idx * 7) % 87);
      (p as any).comments = [
        { id: "c1", user: "Kabamba Jean-Paul", text: category === "Livre" ? "Excellent ouvrage de référence scientifique !" : "L'engagement de séquestre KUFULULA donne une confiance absolue ! Produit de haute qualité.", date: "2026-05-20" },
        { id: "c2", user: "Mwanza Chantal", text: "Je recommande vivement cet article de commerce local.", date: "2026-06-01" }
      ];
      (p as any).colors = [
        { name: "Slate Noir Ébène", value: "#121212" },
        { name: "Congo Copper", value: "#B87333" },
        { name: "Amber Orange Glow", value: "#FF8C00" },
        { name: "Kongo White Cotton", value: "#F4F4F6" }
      ];
      (p as any).imagesDetail = [singleImage];
      (p as any).specifications = [
        { label: "Prestataire / Fabricant", value: item.vendor },
        { label: "Origine Terroir RDC", value: item.tags[item.tags.length - 1] || "Kinshasa" },
        { label: "Garantie de Sécurité", value: "Double Séquestre Physiquement Validé par KUFULULA" }
      ];

      list.push(p);
    }
  }

  return list;
};

const INITIAL_PRODUCTS = build52InitialProducts();

// Helper to initialize storage
const getStorageItem = (key: string, defaultValue: any) => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item);
  } catch (e) {
    return defaultValue;
  }
};

const setStorageItem = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// INITIALIZE MOCK DB
let localProducts: Product[] = getStorageItem("k_products_v3", INITIAL_PRODUCTS);
let localTransactions: DirectTransaction[] = getStorageItem("k_transactions", []);
let localCurrentUser: UserAuth | null = getStorageItem("k_current_user", null);

// FIREBASE INTEGRATION & PERSISTENCE ENGINE
export const KDb = {
  // Products with interactive updates
  async getProducts(): Promise<Product[]> {
    try {
      const colRef = collection(db, "products");
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const list: Product[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Product);
        });
        return list.filter((p: Product) => !p.isDraft);
      }
    } catch (e) {
      console.warn("Firestore read failed, using localStorage fallback:", e);
    }
    return getStorageItem("k_products_v3", INITIAL_PRODUCTS).filter((p: Product) => !p.isDraft);
  },

  async getAllProductsAdmin(): Promise<Product[]> {
    try {
      const colRef = collection(db, "products");
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const list: Product[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Product);
        });
        return list;
      }
    } catch (e) {
      console.warn("Firestore admin read failed, using localStorage:", e);
    }
    return getStorageItem("k_products_v3", INITIAL_PRODUCTS);
  },

  async saveProduct(product: Product): Promise<void> {
    const updatedProd = { ...product, updatedAt: new Date().toISOString() };
    const products = getStorageItem("k_products_v3", INITIAL_PRODUCTS);
    const index = products.findIndex((p: Product) => p.id === product.id);
    if (index >= 0) {
      products[index] = updatedProd;
    } else {
      products.push(updatedProd);
    }
    setStorageItem("k_products_v3", products);

    try {
      await setDoc(doc(db, "products", product.id), updatedProd);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `products/${product.id}`);
    }
  },

  async updateProductInteractions(productId: string, likes: number, comments: any[]): Promise<void> {
    const products = getStorageItem("k_products_v3", INITIAL_PRODUCTS);
    const index = products.findIndex((p: Product) => p.id === productId);
    if (index >= 0) {
      products[index] = {
        ...products[index],
        likesCount: likes,
        comments: comments
      } as any;
      setStorageItem("k_products_v3", products);
    }

    try {
      await setDoc(doc(db, "products", productId), {
        likesCount: likes,
        comments: comments
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `products/${productId}`);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const products = getStorageItem("k_products_v3", INITIAL_PRODUCTS);
    const filtered = products.filter((p: Product) => p.id !== id);
    setStorageItem("k_products_v3", filtered);

    try {
      await deleteDoc(doc(db, "products", id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `products/${id}`);
    }
  },

  // Transactions / Escrow & KYC
  async getTransactions(): Promise<DirectTransaction[]> {
    try {
      const colRef = collection(db, "transactions");
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const list: DirectTransaction[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as DirectTransaction);
        });
        return list;
      }
    } catch (e) {
      console.warn("Firestore getTransactions failed, using local fallback", e);
    }
    return getStorageItem("k_transactions", []);
  },

  async saveTransaction(transaction: DirectTransaction): Promise<void> {
    const txs = getStorageItem("k_transactions", []);
    const index = txs.findIndex((t: DirectTransaction) => t.id === transaction.id);
    if (index >= 0) {
      txs[index] = transaction;
    } else {
      txs.push(transaction);
    }
    setStorageItem("k_transactions", txs);

    try {
      await setDoc(doc(db, "transactions", transaction.id), transaction);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `transactions/${transaction.id}`);
    }
  }
};

export const KAuth = {
  async getCurrentUser(): Promise<UserAuth | null> {
    const local = getStorageItem("k_current_user", null);
    if (local) return local;

    const fbUser = auth.currentUser;
    if (fbUser) {
      const email = fbUser.email || "customer@kufulula.cd";
      let role: UserRole = "customer";
      if (email.includes("admin") || email.includes("tumalink") || email === "admin@kufulula.cd") {
        role = "admin";
      } else if (email.includes("merchant") || email.includes("vendor")) {
        role = "merchant";
      }
      return {
        uid: fbUser.uid,
        email: email,
        displayName: fbUser.displayName || email.split("@")[0].toUpperCase().replace(".", " "),
        photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
        role: role,
        isVerified: fbUser.emailVerified
      };
    }
    return null;
  },

  async signInWithGoogleReal(): Promise<UserAuth> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    const email = fbUser.email || "customer@kufulula.cd";

    let role: UserRole = "customer";
    if (email.includes("admin") || email.includes("tumalink") || email === "admin@kufulula.cd") {
      role = "admin";
    } else if (email.includes("merchant") || email.includes("vendor")) {
      role = "merchant";
    }

    const user: UserAuth = {
      uid: fbUser.uid,
      email: email,
      displayName: fbUser.displayName || email.split("@")[0].toUpperCase().replace(".", " "),
      photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
      role: role,
      isVerified: fbUser.emailVerified
    };

    setStorageItem("k_current_user", user);
    return user;
  },

  async signInWithGoogleSimulated(email: string = "customer@kufulula.cd"): Promise<UserAuth> {
    let role: UserRole = "customer";
    if (email.includes("admin") || email.includes("tumalink") || email === "admin@kufulula.cd") {
      role = "admin";
    } else if (email.includes("merchant") || email.includes("vendor")) {
      role = "merchant";
    }

    const mockUser: UserAuth = {
      uid: "usr-" + Math.floor(Math.random() * 100000),
      email: email,
      displayName: email.split("@")[0].toUpperCase().replace(".", " "),
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
      role: role,
      isVerified: true
    };

    setStorageItem("k_current_user", mockUser);
    return mockUser;
  },

  async signOut(): Promise<void> {
    localStorage.removeItem("k_current_user");
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn("Firebase sign out failed", e);
    }
  }
};
