import { useState, useEffect, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, Search, Filter, ShieldAlert, Sparkles, LogIn, LogOut, 
  ChevronRight, RefreshCw, Smartphone, Check, Heart, Shield, HelpCircle, 
  ShieldCheck, Mic, Camera, Globe, Settings, Sliders, Play, RotateCcw,
  BookOpen, Compass, Package, Users, Eye, Sparkle, MessageCircle, Home, History,
  Palette, Type, QrCode, Copy, Download
} from "lucide-react";

import { Product, CartItem, UserAuth, DirectTransaction } from "./types";
import { KDb, KAuth } from "./lib/firebase";
import { translations, AppLanguage, TranslationDictionary } from "./lib/translations";

// Components
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import CartDrawer from "./components/CartDrawer";
import AdminPanel from "./components/AdminPanel";
import CheckoutTunnel from "./components/CheckoutTunnel";
import WorkspaceIntegrations from "./components/WorkspaceIntegrations";
import MerchantConversationalLounge from "./components/MerchantConversationalLounge";

// Preset Themes for Parameters selection
interface ApplicationTheme {
  id: string;
  name: string;
  bgClass: string;
  cardClass: string;
  textClass: string;
  accentClass: string;
  accentTextClass: string;
  glowColor: string;
  badgeClass: string;
}

const THEMES: ApplicationTheme[] = [
  {
    id: "black-orange-default",
    name: "Black Orange (défaut) 🍊",
    bgClass: "bg-zinc-950",
    cardClass: "bg-zinc-900/80 border border-white/5",
    textClass: "text-white",
    accentClass: "bg-[#FF8C00] hover:bg-amber-500 text-zinc-950 font-bold",
    accentTextClass: "text-[#FF8C00]",
    glowColor: "rgba(255, 140, 0, 0.15)",
    badgeClass: "bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-[#FF8C00]"
  },
  {
    id: "white-clear-black",
    name: "White Claire et Noir 🥛",
    bgClass: "bg-slate-50",
    cardClass: "bg-white border border-slate-200 shadow-sm",
    textClass: "text-slate-900",
    accentClass: "bg-slate-950 hover:bg-slate-800 text-white font-bold",
    accentTextClass: "text-slate-950",
    glowColor: "rgba(0, 0, 0, 0.05)",
    badgeClass: "bg-slate-100 border border-slate-200 text-slate-950"
  },
  {
    id: "abysses",
    name: "Abysses 🌊",
    bgClass: "bg-[#010a12]",
    cardClass: "bg-[#031525]/90 border border-cyan-500/20",
    textClass: "text-cyan-100",
    accentClass: "bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold",
    accentTextClass: "text-cyan-400",
    glowColor: "rgba(6, 182, 212, 0.2)",
    badgeClass: "bg-cyan-950/50 border border-cyan-500/30 text-cyan-400"
  },
  {
    id: "water-glass-gray",
    name: "Water Glass Gray 💎",
    bgClass: "bg-[#18181b]",
    cardClass: "bg-zinc-800/40 backdrop-blur-md border border-white/10",
    textClass: "text-zinc-100",
    accentClass: "bg-sky-400 hover:bg-sky-500 text-zinc-950 font-bold",
    accentTextClass: "text-sky-400",
    glowColor: "rgba(56, 189, 248, 0.15)",
    badgeClass: "bg-sky-450/10 border border-sky-450/30 text-sky-400"
  }
];

// Preset Typography Fonts
interface AppFont {
  id: string;
  name: string;
  fontFamily: string;
  importUrl?: string;
}

const FONTS: AppFont[] = [
  {
    id: "calibri-soft",
    name: "Calibri Signature 🌸",
    fontFamily: '"Calibri", "Rubik", "Inter", sans-serif',
    importUrl: "https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..0,900;1,300..1,900&display=swap"
  },
  {
    id: "calibri-light",
    name: "Calibri Light Soft ✨",
    fontFamily: '"Calibri Light", "Segoe UI Light", "Rubik", sans-serif',
    importUrl: "https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..0,900;1,300..1,900&display=swap"
  },
  {
    id: "fine-prince",
    name: "Fine Prince Royal 👑",
    fontFamily: '"Cormorant Garamond", serif',
    importUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..0,700;1,300..1,700&display=swap"
  },
  {
    id: "cambrillant-royal-rome",
    name: "Cambrillant Royal Rome style 🏛️",
    fontFamily: '"Cinzel", "Playfair Display", serif',
    importUrl: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400..0,900;1,400..1,900&display=swap"
  },
  {
    id: "majestueux-special",
    name: "Majestueux Spécial ⚜️",
    fontFamily: '"Playfair Display", "Times New Roman", serif',
    importUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..0,900;1,400..1,900&display=swap"
  },
  {
    id: "modern-inter",
    name: "Inter Classic 🇨🇭",
    fontFamily: '"Inter", sans-serif',
    importUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@300;450;650;850&display=swap"
  }
];

export default function App() {
  // Global States: View mode, active language, active theme, active font
  const [viewMode, setViewMode] = useState<'shop' | 'favorites' | 'chat' | 'checkout' | 'workspace'>('shop');
  const [language, setLanguage] = useState<AppLanguage>('fr');
  const [activeTheme, setActiveTheme] = useState<ApplicationTheme>(THEMES[0]);
  const [activeFont, setActiveFont] = useState<AppFont>(FONTS[0]);

  // Is parameters modal open
  const [isParamsOpen, setIsParamsOpen] = useState(false);

  // Active dictionary mapping
  const dict: TranslationDictionary = translations[language];

  // Hash route listener for Administrative invisibility (#admin)
  const [isAdminViewActive, setIsAdminViewActive] = useState(false);
  const [adminUser, setAdminUser] = useState<UserAuth | null>(null);

  // Catalog Products & Lazy Loading Infinite Scroll
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(12); // Lazy loading, starts at 12
  const [loading, setLoading] = useState(true);

  // Search and Category filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Selection detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart Status (Interactive sliding drawer)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout transaction
  const [successfulTransaction, setSuccessfulTransaction] = useState<DirectTransaction | null>(null);

  // Futuristic Voice Search Simulator states
  const [showVoiceSearchModal, setShowVoiceSearchModal] = useState(false);
  const [voiceSearchStatus, setVoiceSearchStatus] = useState<'idle' | 'listening' | 'analyzing' | 'done'>('idle');
  const [vocalQueryText, setVocalQueryText] = useState("");

  // QR Code Simulator & Generator states
  const [showCameraLensModal, setShowCameraLensModal] = useState(false); // Map to existing control to prevent breakage, but renaming variables inside
  const [qrTab, setQrTab] = useState<'scan' | 'create'>('scan');
  const [lensScanStatus, setLensScanStatus] = useState<'idle' | 'scanning' | 'matched' | 'failed'>('idle'); // map lensScanStatus to qrScanStatus
  const [lensScanResult, setLensScanResult] = useState<any>(null); // map lensScanResult to qrScanResult
  const [selectedLensSample, setSelectedLensSample] = useState<string | null>(null); // map selectedLensSample to selectedQrPreset
  const [qrCreatorText, setQrCreatorText] = useState("https://kufulula.cd/shop");
  const [qrCreatorLogo, setQrCreatorLogo] = useState(true);
  const [qrCreatorBg, setQrCreatorBg] = useState("#FFFFFF");
  const [qrCreatorColor, setQrCreatorColor] = useState("#FF8C00");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; value: number } | null>(null);

  // Browser-native WebRTC Camera stream and file fallbacks
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isExpanding = useRef(false);

  // Play a browser native scanner beep sound utilizing the Web Audio API
  const playBeepSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(950, ctx.currentTime); // 950Hz crisp barcode scanner bip sound
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("Audio Context beep error", e);
    }
  };

  const QR_SCANNABLE_PRESETS = [
    {
      id: "qr-prod-mwinda-solar",
      name: "MWINDA Solaire Lantern v4",
      data: "product:prod-mwinda-solar",
      image: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=product:prod-mwinda-solar&color=12-12-12&bgcolor=244-244-246",
      description: "Code QR direct vers l'article Électrique & Solaire"
    },
    {
      id: "qr-prod-bakery-pastry",
      name: "Menu Pâtissier du Fleuve",
      data: "product:prod-bakery-pastry",
      image: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=product:prod-bakery-pastry&color=12-12-12&bgcolor=244-244-246",
      description: "Code QR direct vers le service de Pâtisserie & Viennoiseries"
    },
    {
      id: "qr-promo-kufulula",
      name: "Bon de réduction -20$ KUFULULA20",
      data: "coupon:KUFULULA20",
      image: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=coupon:KUFULULA20&color=255-140-0&bgcolor=244-244-246",
      description: "Code QR promotionnel pour créditer le portefeuille d'achats"
    },
    {
      id: "qr-support-chat",
      name: "Discussion Négociation Direct",
      data: "action:support-chat",
      image: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=action:support-chat&color=12-12-12&bgcolor=244-244-246",
      description: "Ouvre l'assistant de harcèlement commercial de la N'sele"
    }
  ];

  // Dynamically load Google fonts in document head when user changes fonts
  useEffect(() => {
    FONTS.forEach(font => {
      if (font.importUrl) {
        let existing = document.querySelector(`link[href="${font.importUrl}"]`);
        if (!existing) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = font.importUrl;
          document.head.appendChild(link);
        }
      }
    });
  }, []);

  // Sync route administration (#admin)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#admin") {
        setIsAdminViewActive(true);
      } else {
        setIsAdminViewActive(false);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Fetch expanded catalog products (52 rich items)
  useEffect(() => {
    loadCatalog();
    loadSessionAuth();
  }, [isAdminViewActive]);

  const loadCatalog = async () => {
    setLoading(true);
    const list = await KDb.getProducts();
    setAllProducts(list);
    setFilteredProducts(list);
    setLoading(false);
  };

  const loadSessionAuth = async () => {
    const user = await KAuth.getCurrentUser();
    setAdminUser(user);
  };

  // Dynamic filter cascade (fuzzy search by query and category)
  useEffect(() => {
    let result = allProducts;

    if (selectedCategory !== "All") {
      result = result.filter(v => v.category === selectedCategory);
    }

    if (searchQuery.trim() !== "") {
      const s = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.title.toLowerCase().includes(s) || 
        p.description.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        p.tags.some(t => t.toLowerCase().includes(s))
      );
    }

    setFilteredProducts(result);
    setVisibleCount(12); // reset pagination
  }, [searchQuery, selectedCategory, allProducts]);

  // Infinite Scroll Trigger (Auto bottom sensing & dynamic limitless generation)
  useEffect(() => {
    const handleScroll = () => {
      if (viewMode !== 'shop') return;
      
      const threshold = 250; // trigger early for silky smooth loading
      const totalHeight = document.documentElement.scrollHeight;
      const scrolledHeight = window.innerHeight + window.scrollY;

      if (totalHeight - scrolledHeight <= threshold) {
        if (visibleCount < filteredProducts.length) {
          setVisibleCount(prev => prev + 12);
        } else if (!isExpanding.current && filteredProducts.length > 0) {
          isExpanding.current = true;
          
          // Generate 12 more customized variations from the current active filtered product list
          const baseList = filteredProducts;
          const count = baseList.length;
          const newBatch: Product[] = [];
          
          for (let i = 0; i < 12; i++) {
            const baseProduct = baseList[i % count];
            const uniqueId = `prod-inf-${count + i}-${Math.floor(Math.random() * 100000)}`;
            const priceOffset = Math.floor(Math.random() * 11) - 5; // vary price slightly
            const newPrice = Math.max(5, baseProduct.price + priceOffset);
            
            const variations = [
              "Édition Limitée", "Série Impériale", "Qualité Export", 
              "Spécial Kinshasa", "Sélection Kivu", "Artisanal Premium",
              "Authentique RDC", "Série Secundo"
            ];
            const variation = variations[Math.floor(Math.random() * variations.length)];
            const newTitle = `${baseProduct.title} (${variation})`;
            
            newBatch.push({
              ...baseProduct,
              id: uniqueId,
              title: newTitle,
              price: newPrice,
              stock: Math.floor(10 + Math.random() * 80),
              createdAt: new Date().toISOString()
            });
          }
          
          // Append to master state so that downstream calculations work perfectly
          setAllProducts(prevAll => [...prevAll, ...newBatch]);
          setVisibleCount(prev => prev + 12);
          
          // Lift guard debouncer
          setTimeout(() => {
            isExpanding.current = false;
          }, 600);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredProducts, visibleCount, viewMode]);

  // Admin and Auth procedures
  const handleAdminLogin = async (email: string) => {
    const user = await KAuth.signInWithGoogleSimulated(email);
    setAdminUser(user);
  };

  const handleSignOut = async () => {
    await KAuth.signOut();
    setAdminUser(null);
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const index = prevCart.findIndex((item) => item.product.id === product.id);
      if (index >= 0) {
        const updated = [...prevCart];
        if (updated[index].quantity < product.stock) {
          updated[index] = {
            ...updated[index],
            quantity: updated[index].quantity + 1,
          };
        }
        return updated;
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      const index = prevCart.findIndex((item) => item.product.id === productId);
      if (index >= 0) {
        const updated = [...prevCart];
        const newQty = updated[index].quantity + delta;
        if (newQty <= 0) {
          return prevCart.filter((item) => item.product.id !== productId);
        } else if (newQty <= updated[index].product.stock) {
          updated[index] = { ...updated[index], quantity: newQty };
          return updated;
        }
      }
      return prevCart;
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const handleResetCheckout = () => {
    setCart([]);
    setSuccessfulTransaction(null);
    setViewMode('shop');
  };

  const handleCheckoutSuccess = (tx: DirectTransaction) => {
    setSuccessfulTransaction(tx);
    setViewMode('workspace');
  };

  // BROWSER NATIVE SPEECH RECOGNITION & FALLBACKS
  const recognitionRef = useRef<any>(null);

  const handleVoiceTrigger = () => {
    setShowVoiceSearchModal(true);
    setVoiceSearchStatus('listening');
    setVocalQueryText("");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = language === "en" ? "en-US" : "fr-FR";
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        console.log("Native speech engine listening...");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVocalQueryText(transcript);
        setVoiceSearchStatus('analyzing');

        setTimeout(() => {
          setSearchQuery(transcript);
          setVoiceSearchStatus('done');
          setSelectedCategory("All");
          setTimeout(() => {
            setShowVoiceSearchModal(false);
            setVoiceSearchStatus('idle');
          }, 1200);
        }, 1000);
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition restricted/denied:", e);
        // Allow simulated options fallback
      };

      rec.onend = () => {
        console.log("Speech listening session end.");
      };

      recognitionRef.current = rec;
      try {
        rec.start();
      } catch (err) {
        console.warn("speech start index error:", err);
      }
    } else {
      console.log("Speech recognition not supported natively in this client agent.");
    }
  };

  const handleCloseVoiceModal = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setShowVoiceSearchModal(false);
    setVoiceSearchStatus('idle');
  };

  const handleSelectSimulatedVoiceQuery = (queryString: string) => {
    setVocalQueryText(queryString);
    setVoiceSearchStatus('analyzing');

    setTimeout(() => {
      setVoiceSearchStatus('done');
      setSearchQuery(queryString);
      setTimeout(() => {
        setShowVoiceSearchModal(false);
        setVoiceSearchStatus('idle');
      }, 1000);
    }, 1200);
  };

  // QR CODE WEBRTC CAM & UPLOAD HANDLERS
  const handleOpenLensCamera = async () => {
    setShowCameraLensModal(true);
    setLensScanStatus('idle');
    setLensScanResult(null);
    setSelectedLensSample(null);
    setCameraError(null);
    setCapturedImage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 350);
    } catch (err: any) {
      console.warn("Camera stream restricted by sandboxed context or denied permissions:", err);
      setCameraError("Caméra physique non accessible (veuillez accorder l'autorisation ou choisir un exemple de démo ou tapez ci-dessous !)");
    }
  };

  const handleCloseLensCamera = () => {
    if (cameraStream) {
      try {
        cameraStream.getTracks().forEach(track => track.stop());
      } catch (e) {}
      setCameraStream(null);
    }
    setShowCameraLensModal(false);
  };

  // Core handler that decodes any QR string and runs appropriate shop operations
  const processDecodedQr = (data: string) => {
    playBeepSound();
    
    // 1. If product link
    if (data.startsWith("product:")) {
      const prodId = data.replace("product:", "").trim();
      // Try to find the product
      const found = allProducts.find(p => p.id === prodId || p.id === `prod-${prodId}` || p.id.toLowerCase().includes(prodId.toLowerCase()));
      if (found) {
        setLensScanResult({
          type: "product",
          payload: data,
          title: found.name,
          description: `Code QR déchiffré ! Produit « ${found.name} » reconnu instantanément dans la base KUFULULA.`,
          matchedProduct: found
        });
        setLensScanStatus('matched');
        
        // Auto open product modal!
        setTimeout(() => {
          setSelectedProduct(found);
          handleCloseLensCamera();
        }, 1500);
      } else {
        setLensScanResult({
          type: "text",
          payload: data,
          title: "Produit Introuvable",
          description: `Code QR lu avec succès (ID : ${prodId}) mais cet article n'existe plus dans le catalogue local.`
        });
        setLensScanStatus('matched');
      }
    }
    // 2. If coupon code
    else if (data.startsWith("coupon:")) {
      const code = data.replace("coupon:", "").toUpperCase().trim();
      setAppliedDiscount({ code, value: 20 });
      setLensScanResult({
        type: "coupon",
        payload: data,
        title: `BON DE RÉDUCTION ACTIF (${code})`,
        description: `Code promo de -20$ validé ! Une déduction automatique de 20 dollars ou équivalent FC de la N'sele sera appliquée sur votre panier.`
      });
      setLensScanStatus('matched');
    }
    // 3. If action support chat
    else if (data.startsWith("action:")) {
      const act = data.replace("action:", "").trim();
      if (act === "support-chat") {
        setLensScanResult({
          type: "action",
          payload: data,
          title: "ASSISTANT NEGOTIATOR KUFULULA",
          description: "Raccordement sécurisé ... Redirection instantanée vers le salon de discussion."
        });
        setLensScanStatus('matched');
        setTimeout(() => {
          setViewMode('chat');
          handleCloseLensCamera();
        }, 1500);
      }
    }
    // 4. Any other text
    else {
      setLensScanResult({
        type: "text",
        payload: data,
        title: "TEXTE / LIEN EXTERNE",
        description: `Contenu décodé : "${data}" (Veuillez copier ou ouvrir si vous faites confiance à cette source)`
      });
      setLensScanStatus('matched');
    }
  };

  // Convert File Picker uploads to simulated QR code scans
  const handleFileCaptureUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLensScanStatus('scanning');
    setSelectedLensSample(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setCapturedImage(b64);
      
      // Simulate scanning decoder analysis
      setTimeout(() => {
        let simulatedPayload = "coupon:KUFULULA20"; // standard default fallback
        
        const nameLower = file.name.toLowerCase();
        if (nameLower.includes("solar") || nameLower.includes("lantern") || nameLower.includes("mwinda")) {
          simulatedPayload = "product:prod-mwinda-solar";
        } else if (nameLower.includes("pastry") || nameLower.includes("boulanger") || nameLower.includes("bakery") || nameLower.includes("fleuve")) {
          simulatedPayload = "product:prod-bakery-pastry";
        } else if (nameLower.includes("chat") || nameLower.includes("support") || nameLower.includes("negotiat")) {
          simulatedPayload = "action:support-chat";
        } else if (nameLower.includes("20") || nameLower.includes("coupon") || nameLower.includes("reduc")) {
          simulatedPayload = "coupon:KUFULULA20";
        }
        
        processDecodedQr(simulatedPayload);
      }, 1200);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerLensScan = () => {
    setLensScanStatus('scanning');
    
    setTimeout(() => {
      if (selectedLensSample) {
        const foundPreset = QR_SCANNABLE_PRESETS.find(p => p.id === selectedLensSample);
        if (foundPreset) {
          processDecodedQr(foundPreset.data);
          return;
        }
      }
      
      // Fallback manual input or upload
      processDecodedQr(qrCreatorText || "coupon:KUFULULA20");
    }, 1200);
  };

  if (isAdminViewActive) {
    return (
      <AdminPanel 
        adminUser={adminUser}
        onAdminLogin={handleAdminLogin}
        onSignOut={handleSignOut}
        onBackToShop={() => {
          window.location.hash = "";
        }}
      />
    );
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const productsToDisplay = filteredProducts.slice(0, visibleCount);

  return (
    <div 
      style={{ fontFamily: activeFont.fontFamily }} 
      className={`min-h-screen ${activeTheme.bgClass} ${activeTheme.textClass} transition-all duration-300 relative pb-24`}
    >
      
      {/* MODERNE FLOATING PILL CAPSULE HEADER */}
      <div className="pt-4 px-4 sticky top-0 z-40 w-full max-w-7xl mx-auto">
        <header className="bg-zinc-950/80 border border-white/10 backdrop-blur-md px-4 md:px-6 py-3 rounded-2xl md:rounded-3xl shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Authentic glowing logo */}
            <span className="text-base md:text-xl font-black tracking-widest text-[#FF8C00] uppercase select-none font-sans flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-white animate-pulse" />
              {dict.appName}
            </span>
            <span className="bg-white/10 border border-white/10 text-white text-[8px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded font-bold">
              DRC TRUSTED
            </span>
          </div>

          {/* Global actions: parameters trigger, cart tracker */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* UNIFIED PARAMETERS / LANGUAGE DIALOG TRIGGER */}
            <button
              onClick={() => setIsParamsOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-amber-400 text-xs font-mono transition-all relative"
              title="Langues, Thèmes & Polices"
            >
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline text-white text-[10px] font-bold">Réglages</span>
              <Settings className="w-3.5 h-3.5 animate-spin-slow text-amber-500" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
            </button>

            {/* Cart Tracker */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-3 py-1.5 bg-[#FF8C00] text-zinc-950 hover:bg-amber-500 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="font-extrabold">{cartCount}</span>
            </button>
          </div>
        </header>
      </div>

      {/* CORE PAGES VIEW ROUTING */}
      <AnimatePresence mode="wait">
        
        {/* REVOLUTIONARY SHOP HOMEPAGE */}
        {viewMode === 'shop' && (
          <motion.main
            key="shop-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6 md:space-y-10"
          >
            {/* IMMERSIVE BLACK, ORANGE, WHITE HERO CARD WITH GLASSMORPHISM OUTSTANDING VISUALS */}
            <div className="relative text-white overflow-hidden flex flex-col justify-end min-h-[240px] md:min-h-[300px] rounded-3xl p-6 md:p-12 border border-white/10 bg-gradient-to-tr from-black via-zinc-950 to-zinc-900/60 shadow-2xl">
              
              {/* Visual backdrop accents */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
              <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-72 h-72 bg-amber-600/10 rounded-full filter blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-10 w-96 h-28 bg-[#FF8C00]/10 rounded-full filter blur-2xl pointer-events-none" />

              <div className="relative space-y-3 z-10 max-w-3xl">
                <span className="text-[9px] md:text-[10px] uppercase font-mono tracking-widest text-[#FF8C00] font-black flex items-center gap-1 bg-[#FF8C00]/10 border border-[#FF8C00]/30 w-max px-3 py-1 rounded-full backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  {dict.heroBadge}
                </span>
                
                <h1 className="text-3xl md:text-5xl font-sans tracking-tight font-extrabold text-white leading-tight">
                  {dict.heroTitle.split(".")[0]} <span className="text-[#FF8C00]">Kufulula.</span>
                </h1>
                
                <p className="text-xs md:text-sm text-zinc-350 max-w-xl leading-relaxed">
                  {dict.heroSub}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-[10px] font-mono text-zinc-400">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>Double Séquestre Mobile Money</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
                    <Check className="w-4 h-4 text-amber-500" />
                    <span>Intégration Google Lens & Gemini AI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTROLS AREA AND SEARCH OMNIBOX */}
            <div className="space-y-4">
              
              {/* Core interactive Search bar & Camera voice lookup triggers */}
              <div className="relative w-full max-w-2xl mx-auto">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={dict.searchPlaceholder}
                  className="w-full pl-12 pr-28 py-3.5 bg-zinc-900/95 border border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs text-white shadow-xl placeholder-zinc-550"
                />

                {/* Micro clean transparent action icons on right side */}
                <div className="absolute right-3.5 top-1.5 flex items-center gap-1.5">
                  
                  {/* Voice Ingestion */}
                  <button
                    onClick={handleVoiceTrigger}
                    className="p-2 text-zinc-500 hover:text-amber-500 bg-transparent active:scale-95 transition-all text-xs border border-transparent rounded-lg"
                    title="Recherche par commande vocale"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <div className="w-px h-6 bg-white/10" />

                  {/* Camera / Google Lens Ingestion */}
                  <button
                    onClick={handleOpenLensCamera}
                    className="p-2 text-zinc-500 hover:text-cyan-400 bg-transparent active:scale-95 transition-all relative"
                    title="Camera / Google Lens matching"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                  </button>
                </div>
              </div>

              {/* Dynamic filter tags + "LIVRE" catalog switcher added */}
              <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-2 flex-wrap pt-2">
                {[
                  { tag: "All", label: dict.categoryAll },
                  { tag: "Electronics", label: dict.categoryElectronics },
                  { tag: "Food", label: dict.categoryFood },
                  { tag: "Fashion", label: dict.categoryFashion },
                  { tag: "Home", label: dict.categoryHome },
                  { tag: "Livre", label: dict.categoryBooks }
                ].map((item) => (
                  <button
                    key={item.tag}
                    onClick={() => setSelectedCategory(item.tag)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-tight whitespace-nowrap transition-all border transition-all ${
                      selectedCategory === item.tag
                        ? "bg-amber-500 text-zinc-950 border-amber-500 scale-95 shadow-md"
                        : "bg-zinc-900 text-zinc-400 border-white/5 hover:text-white hover:bg-zinc-850"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Reset Search results button */}
              {searchQuery && (
                <div className="text-center">
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-amber-500 font-mono hover:underline flex items-center gap-1.5 mx-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Réinitialiser la recherche (Fuzzy match)</span>
                  </button>
                </div>
              )}
            </div>

            {/* CATALOG PRODUCTS DISPLAY GRID WITH LAZY RENDERING */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((loaderId) => (
                  <div key={loaderId} className="bg-zinc-900 border border-white/5 rounded-2xl p-4 space-y-4 animate-pulse">
                    <div className="aspect-[16/13] bg-zinc-950 rounded-xl" />
                    <div className="h-4 bg-zinc-950 rounded w-2/3" />
                    <div className="h-3 bg-zinc-950 rounded w-full" />
                    <div className="h-4 bg-zinc-950 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : productsToDisplay.length > 0 ? (
              <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {productsToDisplay.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onOpenDetails={(item) => setSelectedProduct(item)}
                      onAddToCart={handleAddToCart}
                      dict={dict}
                      activeTheme={activeTheme}
                    />
                  ))}
                </div>

                {/* Progressive Infinite Scroll indicator */}
                {visibleCount < filteredProducts.length && (
                  <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#FF8C00] border-t-transparent animate-spin" />
                    <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase animate-pulse">
                      Chargement de l'écosystème ({visibleCount} / {filteredProducts.length} articles vus)
                    </p>
                    <button
                      onClick={() => setVisibleCount(c => c + 12)}
                      className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-white/10 rounded-xl text-xs font-mono text-white text-semibold transition-all active:scale-95"
                    >
                      Charger plus d'articles (Scroll infini actif)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-zinc-500 max-w-sm mx-auto">
                <Filter className="w-12 h-12 stroke-[1.2] mb-3 text-zinc-700 mx-auto" />
                <p className="text-sm font-sans tracking-tight font-bold">{dict.noProductFound}</p>
                <p className="text-xs text-zinc-500 mt-1">{dict.noProductSub}</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="mt-4 px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-mono text-amber-500 hover:bg-zinc-850"
                >
                  Effacer les filtres
                </button>
              </div>
            )}
          </motion.main>
        )}

        {/* FAVORITES VIEW */}
        {viewMode === 'favorites' && (
          <motion.main
            key="favorites-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6 md:space-y-10"
          >
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-red-500 font-black">VOS TRÉSORS PRÉFÉRÉS</span>
              <h1 className="text-2xl font-sans font-extrabold flex items-center justify-center gap-2 text-white">
                <Heart className="w-5.5 h-5.5 text-red-500 fill-red-500 animate-pulse" />
                Mes Coups de Cœur
              </h1>
              <p className="text-xs text-zinc-400">
                Retrouvez ici tous les articles coup de cœur que vous avez sélectionnés d'un simple clic sur le Soko de Kufulula.
              </p>
            </div>

            {/* Grid of Liked Products */}
            {allProducts.filter(p => localStorage.getItem(`k_liked_state_${p.id}`) === "true").length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allProducts
                  .filter(p => localStorage.getItem(`k_liked_state_${p.id}`) === "true")
                  .map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onOpenDetails={(item) => setSelectedProduct(item)}
                      onAddToCart={handleAddToCart}
                      dict={dict}
                      activeTheme={activeTheme}
                    />
                  ))
                }
              </div>
            ) : (
              <div className="py-20 text-center max-w-sm mx-auto space-y-4 bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
                <Heart className="w-12 h-12 stroke-[1.2] text-zinc-650 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Aucun coup de cœur</p>
                  <p className="text-xs text-zinc-500 leading-normal">
                    Laissez parler vos sens en cliquant sur l'icône de cœur ❤️ de vos produits préférés lors de votre exploration du marché.
                  </p>
                </div>
                <button
                  onClick={() => setViewMode('shop')}
                  className="px-5 py-2.5 bg-amber-500 text-zinc-950 font-mono text-xs font-bold rounded-xl hover:bg-amber-600 transition-all uppercase"
                >
                  Découvrir le Soko
                </button>
              </div>
            )}
          </motion.main>
        )}

        {/* CHAT/CONVERSATION MERCHANT LOUNGE */}
        {viewMode === 'chat' && (
          <motion.div
            key="chat-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <MerchantConversationalLounge 
              activeTheme={activeTheme}
              dict={dict}
              language={language}
            />
          </motion.div>
        )}
        
        {/* CHECKOUT KYC TUNNEL */}
        {viewMode === 'checkout' && (
          <motion.div
            key="checkout-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <CheckoutTunnel
              cart={cart}
              onSuccess={handleCheckoutSuccess}
              onCancel={() => setViewMode('shop')}
            />
          </motion.div>
        )}

        {/* WORKSPACE TRACKER AREA */}
        {viewMode === 'workspace' && (
          <motion.div
            key="workspace-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <WorkspaceIntegrations
              transaction={successfulTransaction}
              onResetCheckout={handleResetCheckout}
            />
          </motion.div>
        )}

      </AnimatePresence>

      {/* PARAMETERS CONFIGURATOR MODAL PANEL (Unified Languages, Themes & Typography Fonts Selectors) */}
      <AnimatePresence>
        {isParamsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsParamsOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-lg w-full text-white shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono tracking-widest text-[#FF8C00] uppercase font-bold">KUFULULA PREFERENCES Hub</span>
                  <h3 className="text-sm font-sans font-extrabold text-white uppercase flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    {dict.settingsTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setIsParamsOpen(false)}
                  className="p-2 bg-zinc-950 hover:bg-zinc-800 border border-white/5 rounded-full text-zinc-400 hover:text-white transition-all text-xs"
                  title="Fermer"
                >
                  ✕
                </button>
              </div>

              {/* Language Selection Grid */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block flex items-center gap-1.5 font-bold">
                  <Globe className="w-3.5 h-3.5" />
                  Sélection de la langue
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'fr', name: 'Français', flag: '🇫🇷' },
                    { id: 'en', name: 'English', flag: '🇺🇸' },
                    { id: 'ln', name: 'Lingala', flag: '🇨🇩' },
                    { id: 'sw', name: 'Swahili', flag: '🇨🇩' },
                    { id: 'lu', name: 'Tshiluba', flag: '🇨🇩' },
                    { id: 'kg', name: 'Kikongo', flag: '🇨🇩' }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setLanguage(lang.id as any)}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left text-xs ${
                        language === lang.id
                          ? "border-amber-500 bg-amber-500/10 text-white font-bold"
                          : "border-white/5 bg-zinc-950/40 text-zinc-400 hover:border-white/10"
                      }`}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <div className="min-w-0">
                        <p className="font-bold leading-tight truncate text-[11px]">{lang.name}</p>
                        <p className="text-[8px] text-zinc-500 font-mono uppercase">{lang.id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Configuration */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block flex items-center gap-1.5 font-bold">
                  <Palette className="w-3.5 h-3.5" />
                  {dict.themeSelect}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setActiveTheme(theme)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs ${
                        activeTheme.id === theme.id
                          ? "border-amber-500 bg-amber-500/10 text-white font-bold"
                          : "border-white/5 bg-zinc-950/40 text-zinc-400 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ backgroundColor: theme.glowColor }} className="w-3 h-3 rounded-full block border border-white/10" />
                        <span className="text-[11px]">{theme.name}</span>
                      </div>
                      {activeTheme.id === theme.id && <Check className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font typography select */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block flex items-center gap-1.5 font-bold">
                  <Type className="w-3.5 h-3.5" />
                  {dict.fontSelect}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FONTS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setActiveFont(font)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs ${
                        activeFont.id === font.id
                          ? "border-amber-500 bg-amber-500/10 text-white font-bold"
                          : "border-white/5 bg-zinc-950/40 text-zinc-400 hover:border-white/10"
                      }`}
                      style={{ fontFamily: font.fontFamily }}
                    >
                      <span className="text-[11px]">{font.name}</span>
                      {activeFont.id === font.id && <Check className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unified buttons footer */}
              <div className="flex gap-2.5 pt-2 border-t border-white/5">
                <button
                  onClick={() => setIsParamsOpen(false)}
                  className="flex-1 py-3 bg-[#FF8C00] hover:bg-amber-500 text-zinc-950 font-mono text-xs font-black tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-95"
                >
                  Appliquer & Fermer
                </button>
                <button
                  onClick={() => setIsParamsOpen(false)}
                  className="px-4 py-3 bg-zinc-950 hover:bg-zinc-850 rounded-xl text-zinc-400 text-xs font-mono border border-white/5 whitespace-nowrap active:scale-95"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VOICE SEARCH MODAL OVERLAY */}
      <AnimatePresence>
        {showVoiceSearchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              onClick={() => setShowVoiceSearchModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md" 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full text-center z-10 text-white space-y-6 shadow-2xl"
            >
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#FF8C00]">Kufulula Voice Recognition</h3>
                <p className="text-[11px] text-zinc-400">{dict.voiceSearchListen}</p>
              </div>

              {/* Animated audio wave ripples */}
              <div className="flex justify-center items-end gap-1.5 h-16 py-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((waveId) => (
                  <motion.div
                    key={waveId}
                    animate={{
                      height: voiceSearchStatus === 'listening' 
                        ? [12, Math.floor(Math.random() * 40 + 15), 12] 
                        : [10, 10]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.5 + waveId * 0.08,
                      ease: "easeInOut"
                    }}
                    className={`w-1 rounded-full ${voiceSearchStatus === 'analyzing' ? 'bg-cyan-500 animate-pulse' : 'bg-amber-500'}`}
                  />
                ))}
              </div>

              {voiceSearchStatus === 'listening' ? (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-500 italic">Dis quelque chose... comme "mwinda solaire", "café de kasai", "livret d'historie"</p>
                  
                  {/* Congo simulated vocal recommendations clickables to mimic real input */}
                  <div className="flex flex-col gap-1 text-[11px] font-mono text-center pt-2">
                    <button
                      onClick={() => handleSelectSimulatedVoiceQuery("mwinda solar")}
                      className="px-3 py-2 rounded bg-zinc-950 border border-white/5 text-amber-400 hover:border-amber-500 transition"
                    >
                      🗣️ "Mwinda Solaire"
                    </button>
                    <button
                      onClick={() => handleSelectSimulatedVoiceQuery("Coffee Reserve")}
                      className="px-3 py-2 rounded bg-zinc-950 border border-white/5 text-amber-400 hover:border-amber-500 transition"
                    >
                      🗣️ "Café de Kasai"
                    </button>
                    <button
                      onClick={() => handleSelectSimulatedVoiceQuery("Légende Kongo")}
                      className="px-3 py-2 rounded bg-zinc-950 border border-white/5 text-amber-400 hover:border-amber-500 transition"
                    >
                      🗣️ "Livre Dynastie Kongo"
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-mono font-bold text-cyan-400 animate-pulse">
                    {voiceSearchStatus === 'analyzing' ? dict.voiceSearchStop : "Succès !"}
                  </p>
                  {vocalQueryText && (
                    <span className="text-sm italic block bg-zinc-950 border border-white/5 py-2.5 rounded-xl font-semibold">
                      "{vocalQueryText}"
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowVoiceSearchModal(false)}
                className="w-full py-2 bg-zinc-950 hover:bg-zinc-850 rounded-xl text-zinc-400 text-xs font-mono border border-white/10"
              >
                Annuler
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* KUFULULA QR CODE SCANNER & CREATOR HUB MODAL */}
      <AnimatePresence>
        {showCameraLensModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              onClick={handleCloseLensCamera}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-2xl w-full text-white z-10 shadow-2xl space-y-4 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#FF8C00] animate-pulse" />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#FF8C00] font-bold">
                    KUFULULA QR HUB
                  </h3>
                </div>
                <button 
                  onClick={handleCloseLensCamera}
                  className="text-zinc-550 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* TABS SWITCHER (Scanner vs Creator) */}
              <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-white/5 rounded-xl text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setQrTab('scan')}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    qrTab === 'scan' 
                      ? "bg-[#FF8C00] text-zinc-950 shadow-md animate-pulse" 
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  🔍 Scanneur QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setQrTab('create')}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    qrTab === 'create' 
                      ? "bg-[#FF8C00] text-zinc-950 shadow-md" 
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  ✨ Créateur QR Code
                </button>
              </div>

              {qrTab === 'scan' ? (
                // TAB 1: SCANNER VIEW
                <div className="space-y-4">
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    {dict.lensScan} Visez un QR Code avec votre caméra ou sélectionnez l'un des exemples pré-générés ci-dessous pour déclencher un processus sécurisé automatique (ouverture de produit, crédit de compte, etc.).
                  </p>

                  {/* Main Scanner viewport frame */}
                  <div className="relative aspect-video rounded-2xl bg-black border border-white/5 overflow-hidden flex items-center justify-center">
                    
                    {/* Simulated Lens brackets focus graphics */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#FF8C00] z-20 pointer-events-none" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#FF8C00] z-20 pointer-events-none" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#FF8C00] z-20 pointer-events-none" />
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#FF8C00] z-20 pointer-events-none" />

                    {/* Draw active browser stream if available */}
                    {cameraStream ? (
                      <div className="relative h-full w-full">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                        {lensScanStatus === 'scanning' && (
                          <motion.div
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute left-0 right-0 h-0.5 bg-[#FF8C00] shadow-[0_0_12px_rgba(255,140,0,0.8)] z-10"
                          />
                        )}
                      </div>
                    ) : capturedImage ? (
                      <div className="relative h-full w-full bg-zinc-950 flex items-center justify-center">
                        <img
                          src={capturedImage}
                          alt="Captured Frame"
                          className="max-h-full max-w-full object-contain"
                        />
                        {lensScanStatus === 'scanning' && (
                          <motion.div
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute left-0 right-0 h-1 bg-[#FF8C00] shadow-[0_0_12px_rgba(255,140,0,0.8)] z-10"
                          />
                        )}
                      </div>
                    ) : selectedLensSample ? (
                      <div className="relative h-full w-full bg-zinc-950 flex items-center justify-center p-4">
                        <img
                          src={QR_SCANNABLE_PRESETS.find(s => s.id === selectedLensSample)?.image}
                          alt="Sample to scan"
                          className="max-h-full max-w-full object-contain transition duration-350 filter brightness-110 p-2 bg-white rounded-lg"
                        />
                        {lensScanStatus === 'scanning' && (
                          <motion.div
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute left-0 right-0 h-1 bg-[#FF8C00] shadow-[0_0_12px_rgba(255,140,0,0.8)] z-10"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="text-center space-y-2 p-6 flex flex-col items-center">
                        <QrCode className="w-10 h-10 text-zinc-700 stroke-[1.2] animate-pulse" />
                        {cameraError ? (
                          <p className="text-[10px] text-zinc-500 font-mono max-w-sm px-4">{cameraError}</p>
                        ) : (
                          <p className="text-[11px] text-zinc-500 italic font-mono">Démarrage du flux caméra ou choix d'exemples ci-dessous...</p>
                        )}
                      </div>
                    )}

                    {/* QR SCAN STATUS OVERLAYS */}
                    {lensScanStatus === 'scanning' && (
                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center z-20">
                        <div className="bg-zinc-900/95 px-4 py-2 border border-[#FF8C00]/40 rounded-xl text-xs font-mono font-bold text-[#FF8C00] animate-pulse flex items-center gap-2 shadow-xl">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#FF8C00]" />
                          DÉCODAGE DE LA PROTO-MATRICE QR...
                        </div>
                      </div>
                    )}

                    {lensScanStatus === 'matched' && lensScanResult && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-x-4 bottom-4 bg-zinc-950/95 border border-[#FF8C00] p-3 rounded-xl space-y-1.5 backdrop-blur-md z-30"
                      >
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className="text-[#FF8C00] font-bold tracking-widest uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                            DÉCODAGE TERMINÉ AVEC SUCCÈS
                          </span>
                          <span className="text-emerald-500 font-mono font-bold">KUFULULA SECURE</span>
                        </div>
                        <div className="text-xs">
                          <h4 className="font-extrabold text-white text-xs">{lensScanResult.title}</h4>
                          <p className="text-[10px] text-zinc-300 leading-normal font-sans">{lensScanResult.description}</p>
                        </div>
                        <div className="flex justify-between items-center text-[9px] bg-white/5 px-2 py-1 rounded font-mono text-zinc-400">
                          <span>Donnée brute : <strong className="text-amber-500">{lensScanResult.payload}</strong></span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Manual Quick Entry input bar for high accessibility testing */}
                  <div className="flex items-center gap-2 border border-white/5 bg-zinc-950/40 p-2 rounded-xl text-xs font-mono">
                    <span className="text-zinc-500 pl-1 uppercase text-[9px] font-black">Code Manuel :</span>
                    <input
                      type="text"
                      value={qrCreatorText}
                      onChange={(e) => setQrCreatorText(e.target.value)}
                      placeholder="Ex: product:prod-mwinda-solar"
                      className="flex-1 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF8C00] text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => processDecodedQr(qrCreatorText)}
                      className="bg-zinc-805 hover:bg-[#FF8C00]/20 font-bold px-3 py-1.5 rounded-lg border border-white/10 hover:border-[#FF8C00] text-[#FF8C00] transition-colors"
                    >
                      Décoder
                    </button>
                  </div>

                  {/* Browse real customized files fallback option on devices */}
                  <div className="flex items-center justify-between text-[11px] font-mono border border-white/5 bg-zinc-950/40 px-3 py-2 rounded-xl">
                    <span className="text-zinc-500">Ou chargez un fichier QR Code :</span>
                    <label className="cursor-pointer bg-zinc-900 hover:bg-zinc-850 px-3 py-1.5 rounded-lg border border-white/10 hover:border-[#FF8C00] transition-all text-[#FF8C00] font-black">
                      📁 Importer un fichier
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileCaptureUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* QR SAMPLES CHOICES */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Codes QR du catalogue (cliquez pour scanner)</span>
                    <div className="grid grid-cols-4 gap-2 mr-0.5">
                      {QR_SCANNABLE_PRESETS.map((sample) => (
                        <button
                          key={sample.id}
                          onClick={() => {
                            setSelectedLensSample(sample.id);
                            setLensScanStatus('idle');
                            setLensScanResult(null);
                            setCapturedImage(null);
                            // Immediate trigger!
                            setLensScanStatus('scanning');
                            setTimeout(() => {
                              processDecodedQr(sample.data);
                            }, 1000);
                          }}
                          className={`relative aspect-square py-2 rounded-xl overflow-hidden border bg-zinc-950 transition-all text-left group flex flex-col items-center justify-center p-1.5 ${
                            selectedLensSample === sample.id ? "border-[#FF8C00] scale-95 shadow-md shadow-[#FF8C00]/10" : "border-white/5 hover:border-white/10"
                          }`}
                        >
                          <img 
                            src={sample.image} 
                            alt={sample.name} 
                            className="w-14 h-14 object-contain p-0.5 bg-white rounded-md grayscale group-hover:grayscale-0 transition-all" 
                          />
                          <span className="text-[7.5px] font-mono text-center text-zinc-400 truncate w-full mt-1.5 block">
                            {sample.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // TAB 2: CREATOR/GENERATOR VIEW
                <div className="space-y-4">
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Entrez n'importe quel texte ou URL ci-dessous pour générer un Code QR haute définition totalement fonctionnel, adapté à la Charte Visuelle de votre boutique.
                  </p>

                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">CONTENU DU CODE QR (URL ou texte) :</label>
                      <input
                        type="text"
                        value={qrCreatorText}
                        onChange={(e) => setQrCreatorText(e.target.value)}
                        placeholder="Tapez un lien comme https://kufulula.cd/shop/art-1..."
                        className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF8C00] text-xs text-white"
                      />
                    </div>

                    {/* Pre-packaged shortcuts to help click generation */}
                    <div>
                      <label className="block text-zinc-500 mb-1.5 font-bold uppercase text-[9px]">Générer un raccourci rapide :</label>
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setQrCreatorText("product:prod-mwinda-solar")}
                          className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-white/5 text-amber-500 rounded-lg hover:border-amber-400"
                        >
                          🔦 QR Énergie MOTO Solaire
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrCreatorText("coupon:KUFULULA20")}
                          className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-white/5 text-[#FF8C00] rounded-lg hover:border-[#FF8C00]"
                        >
                          🎟️ QR Coupon Réduction -20$
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrCreatorText("action:support-chat")}
                          className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-white/5 text-green-400 rounded-lg hover:border-green-400"
                        >
                          💬 QR Assistant Discussion
                        </button>
                      </div>
                    </div>

                    {/* Customizer settings */}
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-zinc-400 mb-1.5 font-bold uppercase text-[9px]">Couleur principale :</label>
                        <div className="flex gap-2">
                          {[
                            { name: 'Kongo Orange', hex: '#FF8C00' },
                            { name: 'Kivu Green', hex: '#10B981' },
                            { name: 'Teal Shield', hex: '#00E5FF' },
                            { name: 'Royal Gold', hex: '#FABF2C' },
                            { name: 'Monochrome', hex: '#121212' }
                          ].map((col) => (
                            <button
                              key={col.hex}
                              type="button"
                              onClick={() => setQrCreatorColor(col.hex)}
                              className={`w-6 h-6 rounded-full border relative transition-all ${
                                qrCreatorColor === col.hex ? "ring-2 ring-white scale-110 shadow-lg" : "scale-100 hover:scale-105"
                              }`}
                              style={{ backgroundColor: col.hex === '#121212' ? '#CCCCCC' : col.hex }}
                              title={col.name}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col justify-center">
                        <label className="flex items-center gap-2 cursor-pointer text-zinc-400 select-none">
                          <input
                            type="checkbox"
                            checked={qrCreatorLogo}
                            onChange={(e) => setQrCreatorLogo(e.target.checked)}
                            className="rounded border-white/15 text-[#FF8C00] focus:ring-0 bg-zinc-950"
                          />
                          <span className="text-[10px] leading-tight">Incruster le logo de certification KUFULULA</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* DISPLAY DYNAMIC CODE RESULT */}
                  <div className="bg-zinc-950 border border-white/5 p-6 rounded-2xl flex flex-col items-center gap-4 relative overflow-hidden">
                    
                    {/* Generative watermark background décor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8C00]/5 rounded-full blur-3xl pointer-events-none" />

                    {/* Dynamically created QR Image utilizing the high-speed rendering API */}
                    <div className="relative p-2 bg-white rounded-2xl shadow-xl w-40 h-40 flex items-center justify-center">
                      <img
                        id="generated-qrcode-image"
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCreatorText)}&color=${qrCreatorColor.replace('#', '')}&bgcolor=${qrCreatorBg.replace('#', '')}`}
                        alt="Dynamic Generated QR"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />

                      {/* Brand Logo overlay inside the physical center of the QR matrix to ensure maximum premium identity */}
                      {qrCreatorLogo && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-950 border-2 border-white rounded-lg flex items-center justify-center shadow-lg">
                          <ShieldCheck className="w-4 h-4 text-[#FF8C00]" />
                        </div>
                      )}
                    </div>

                    <div className="text-center font-mono space-y-1">
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">CODE QR GÉNÉRÉ</span>
                      <span className="text-xs text-zinc-300 font-extrabold truncate max-w-sm block px-4 italic">"{qrCreatorText}"</span>
                    </div>

                    {/* Action outputs buttons */}
                    <div className="flex gap-2 w-full text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          const imgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCreatorText)}&color=${qrCreatorColor.replace('#', '')}&bgcolor=${qrCreatorBg.replace('#', '')}`;
                          navigator.clipboard.writeText(imgUrl);
                          alert("Le lien de l'image du QR Code a été copié avec succès !");
                        }}
                        className="flex-1 py-1.5 bg-zinc-900 border border-white/10 hover:border-amber-400 hover:text-amber-400 text-zinc-300 rounded-lg text-center font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copier l'image
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Let's test this QR instantly inside the Scanner tab!
                          setQrTab('scan');
                          setSelectedLensSample(null);
                          setCapturedImage(null);
                          setLensScanStatus('scanning');
                          setTimeout(() => {
                            processDecodedQr(qrCreatorText);
                          }, 1000);
                        }}
                        className="flex-1 py-1.5 bg-[#FF8C00]/10 border border-[#FF8C00]/30 hover:bg-[#FF8C00] text-[#FF8C00] hover:text-zinc-950 rounded-lg text-center font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <QrCode className="w-4 h-4" />
                        Tester le QR
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER ACTIONS */}
              <div className="flex gap-3 pt-2">
                {qrTab === 'scan' && (
                  <button
                    disabled={(!selectedLensSample && !cameraStream && !capturedImage) || lensScanStatus === 'scanning'}
                    onClick={handleTriggerLensScan}
                    className="flex-1 py-3 bg-[#FF8C00] hover:bg-amber-500 font-mono text-xs font-black tracking-wider uppercase rounded-xl text-zinc-950 transition-all disabled:opacity-30 disabled:hover:bg-[#FF8C00] flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10"
                  >
                    <Play className="w-4 h-4" />
                    Déclencher le Scan
                  </button>
                )}
                <button
                  onClick={handleCloseLensCamera}
                  className="px-5 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-950 rounded-xl text-xs font-mono font-bold transition-colors"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESPONSIVE BOTTOM MOBILE FLOATING NAVIGATION DOCK (Glassmorphism & Center Raised Action button) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-zinc-950/20 pointer-events-none pb-2">
        <div className="max-w-md mx-auto px-4 pointer-events-auto">
          <div className="bg-zinc-950/80 border border-white/10 backdrop-blur-md rounded-2xl h-16 flex items-center justify-around px-4 shadow-2xl relative">
            
            {/* Dock Item 1: Accueil */}
            <button
               id="nav-btn-home"
              onClick={() => setViewMode('shop')}
              className={`flex flex-col items-center gap-1 transition-all select-none ${
                viewMode === 'shop' ? "text-[#FF8C00] scale-105 font-bold" : "text-zinc-500 hover:text-white"
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[8px] font-mono uppercase tracking-tight">Accueil</span>
            </button>

            {/* Dock Item 2: Favoris */}
            <button
               id="nav-btn-favorites"
              onClick={() => setViewMode('favorites')}
              className={`flex flex-col items-center gap-1 transition-all select-none ${
                viewMode === 'favorites' ? "text-[#FF8C00] scale-105 font-bold" : "text-zinc-500 hover:text-white"
              }`}
            >
              <Heart className="w-5 h-5 animate-pulse" />
              <span className="text-[8px] font-mono uppercase tracking-tight">Favoris</span>
            </button>

            {/* Dock Item 3: Discussion (Chat standard tab) */}
            <button
               id="nav-btn-chat"
              onClick={() => setViewMode('chat')}
              className={`flex flex-col items-center gap-1 transition-all select-none ${
                viewMode === 'chat' ? "text-[#FF8C00] scale-105 font-bold" : "text-zinc-500 hover:text-white"
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[8px] font-mono uppercase tracking-tight">Discussion</span>
            </button>

            {/* Dock Item 4: Scanner QR Code & Créateur (Elevated Central Center Action) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
              <button
                id="nav-btn-camera-scanner"
                onClick={handleOpenLensCamera}
                className="w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all text-zinc-950 bg-[#FF8C00] border-4 border-zinc-950 hover:bg-amber-500 hover:shadow-orange-500/20"
                title="Scanner QR Code"
              >
                <QrCode className="w-5 h-5 stroke-[2.2] animate-pulse" />
                <span className="text-[7.5px] font-mono font-black uppercase tracking-wider text-zinc-950 mt-0.5 leading-none">QR CODE</span>
              </button>
            </div>

            {/* Symmetrical grid placeholder spacer */}
            <div className="w-10" />

            {/* Dock Item 5: Panier */}
            <button
               id="nav-btn-cart"
              onClick={() => setIsCartOpen(true)}
              className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-all select-none relative"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[8px] font-mono uppercase tracking-tight">Panier</span>
            </button>

            {/* Dock Item 6: Histoire */}
            <button
               id="nav-btn-history"
              onClick={() => setViewMode('workspace')}
              className={`flex flex-col items-center gap-1 transition-all select-none ${
                viewMode === 'workspace' ? "text-green-500 scale-105 font-bold" : "text-zinc-500 hover:text-white"
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-[8px] font-mono uppercase tracking-tight">Histoire</span>
            </button>

            {/* Dock Item 7: Réglages */}
            <button
               id="nav-btn-settings"
              onClick={() => setIsParamsOpen(true)}
              className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-all select-none"
            >
              <Settings className="w-5 h-5" />
              <span className="text-[8px] font-mono uppercase tracking-tight">Réglages</span>
            </button>

          </div>
        </div>
      </div>

      {/* Sliding Direct Cart Slider Bar */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onGoToCheckout={() => {
          setIsCartOpen(false);
          setViewMode('checkout');
        }}
      />

      {/* Deep details Fiche and specs with custom dynamic translations dictionary */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        dict={dict}
        activeTheme={activeTheme}
      />

    </div>
  );
}
