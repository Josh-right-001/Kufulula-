import React, { useState, useEffect, useRef, ChangeEvent, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Search, Filter, ShieldAlert, LogIn, LogOut, 
  ChevronRight, RefreshCw, Smartphone, Check, Heart, Shield, HelpCircle, 
  ShieldCheck, Mic, Camera, Globe, Settings, Sliders, Play, RotateCcw,
  BookOpen, Compass, Package, Users, Eye, Sparkle, MessageCircle, Home, History,
  Palette, Type, QrCode, Copy, Download, ArrowLeft, ArrowUpRight, Share, Share2, X,
  Star, CheckCircle, AlertCircle,
  Bell, MapPin, Music, Flame, Award, Crown, Lock, AlertTriangle, Ticket, MessageSquare, Building2
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
import ProductCatalogGrid from "./components/ProductCatalogGrid";
import MerchantVendorPortal from "./components/MerchantVendorPortal";
import GiantTrianglesShowcase from "./components/GiantTrianglesShowcase";
import MetaAccountsCenter from "./components/MetaAccountsCenter";
import { LoadingScreen } from "./components/LoadingScreen";
import ProductNegotiationChat from "./components/ProductNegotiationChat";

// Static local assets safely handled by Vite
// @ts-ignore
import kufululaDesignOptions from "./assets/images/kufulula_design_options_1780511171548.png";

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
    id: "sahel-noir",
    name: "Option A: SAHEL NOIR",
    bgClass: "bg-[#030712]",
    cardClass: "bg-zinc-900/90 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    textClass: "text-white",
    accentClass: "bg-[#00FF66] hover:bg-green-400 text-black font-extrabold shadow-sm transition-all",
    accentTextClass: "text-[#00FF66]",
    glowColor: "rgba(0, 255, 102, 0.2)",
    badgeClass: "bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] font-mono"
  },
  {
    id: "terracotta-clay",
    name: "Option B: TERRACOTTA CLAY",
    bgClass: "bg-[#FAF6F0]",
    cardClass: "bg-[#FCFAF7] border border-[#E8DFD0] shadow-sm hover:shadow-md text-[#4E2A25] transition-all",
    textClass: "text-[#4E2A25]",
    accentClass: "bg-[#8F3E2B] hover:bg-[#A34B38] text-white font-bold transition-all",
    accentTextClass: "text-[#8F3E2B]",
    glowColor: "rgba(143, 62, 43, 0.15)",
    badgeClass: "bg-[#8F3E2B]/10 border border-[#8F3E2B]/30 text-[#8F3E2B] font-serif font-bold"
  },
  {
    id: "urban-brutalist",
    name: "Option C: URBAN BRUTALIST",
    bgClass: "bg-white",
    cardClass: "bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black",
    textClass: "text-black",
    accentClass: "bg-[#004BFF] hover:bg-[#0038C7] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black transition-all",
    accentTextClass: "text-[#004BFF]",
    glowColor: "rgba(0, 75, 255, 0.15)",
    badgeClass: "bg-white border border-black text-black font-mono font-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
  },
  {
    id: "white-noir",
    name: "White / Noir",
    bgClass: "bg-slate-50 text-black",
    cardClass: "bg-white border border-slate-200/80 shadow-sm text-black",
    textClass: "text-slate-900",
    accentClass: "bg-black hover:bg-slate-800 text-white font-bold transition-all border border-black",
    accentTextClass: "text-black",
    glowColor: "rgba(0, 0, 0, 0.05)",
    badgeClass: "bg-slate-100 border border-slate-300 text-black"
  },
  {
    id: "abysses",
    name: "Abysses",
    bgClass: "bg-[#010a12] text-white",
    cardClass: "bg-[#021424]/90 border border-cyan-500/30 text-sky-100 shadow-[0_0_15px_rgba(34,211,238,0.1)]",
    textClass: "text-slate-200",
    accentClass: "bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold shadow-[0_0_10px_rgba(34,211,238,0.25)]",
    accentTextClass: "text-cyan-400",
    glowColor: "rgba(34, 211, 238, 0.2)",
    badgeClass: "bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-mono font-bold"
  },
  {
    id: "glass-water",
    name: "Glass Water",
    bgClass: "bg-[#e8f1f2]",
    cardClass: "backdrop-blur-md bg-white/40 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] text-zinc-800",
    textClass: "text-zinc-800",
    accentClass: "bg-zinc-400 hover:bg-zinc-500 text-white font-bold backdrop-blur-sm shadow-sm",
    accentTextClass: "text-zinc-650",
    glowColor: "rgba(100, 116, 139, 0.15)",
    badgeClass: "backdrop-blur-sm bg-white/20 border border-neutral-300 text-zinc-650"
  },
  {
    id: "black-orange-default",
    name: "Black Orange (défaut)",
    bgClass: "bg-zinc-950",
    cardClass: "bg-zinc-900/80 border border-white/5",
    textClass: "text-white",
    accentClass: "bg-[#FF8C00] hover:bg-amber-500 text-zinc-950 font-bold",
    accentTextClass: "text-[#FF8C00]",
    glowColor: "rgba(255, 140, 0, 0.15)",
    badgeClass: "bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-[#FF8C00]"
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
    id: "space-grotesk",
    name: "Space Grotesk (Brutalist)",
    fontFamily: '"Space Grotesk", "Inter", sans-serif',
    importUrl: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap"
  },
  {
    id: "cormorant-garamond",
    name: "Cormorant (Terracotta)",
    fontFamily: '"Cormorant Garamond", serif',
    importUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..0,700;1,300..1,700&display=swap"
  },
  {
    id: "jetbrains-mono",
    name: "JetBrains (Sahel Noir)",
    fontFamily: '"JetBrains Mono", monospace',
    importUrl: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
  },
  {
    id: "calibri-soft",
    name: "Calibri Signature",
    fontFamily: '"Calibri", "Rubik", "Inter", sans-serif',
    importUrl: "https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..0,900;1,300..1,900&display=swap"
  },
  {
    id: "modern-inter",
    name: "Inter Classic",
    fontFamily: '"Inter", sans-serif',
    importUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@300;450;650;850&display=swap"
  },
  {
    id: "flavour-mix",
    name: "Flavour Mix",
    fontFamily: '"Space Grotesk", "JetBrains Mono", "Cormorant Garamond", "Calibri", sans-serif',
    importUrl: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300..0,700&family=JetBrains+Mono:wght@400;700&family=Inter:wght@450;650&display=swap"
  }
];

interface GiantRectangleCardProps {
  key?: any;
  product: Product;
  onOpenDetails: (product: Product) => void;
  onOpenSellerStore?: (vendorName: string) => void;
  activeTheme: any;
}

function GiantRectangleCard({ product, onOpenDetails, onOpenSellerStore, activeTheme }: GiantRectangleCardProps) {
  const [likesCount, setLikesCount] = useState<number>(() => {
    const saved = localStorage.getItem(`k_likes_${product.id}`);
    return saved ? parseInt(saved) : (product.likesCount || 12);
  });
  const [isLiked, setIsLiked] = useState<boolean>(() => {
    return localStorage.getItem(`k_liked_state_${product.id}`) === "true";
  });
  const [imgSrc, setImgSrc] = useState<string>(product.image || "");

  useEffect(() => {
    if (product.image) {
      setImgSrc(product.image);
    }
  }, [product.image]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextLiked);
    setLikesCount(nextCount);
    localStorage.setItem(`k_liked_state_${product.id}`, nextLiked ? "true" : "false");
    localStorage.setItem(`k_likes_${product.id}`, nextCount.toString());
    KDb.updateProductInteractions(product.id, nextCount, product.comments || []);
  };

  const handleCardClick = () => {
    if (onOpenSellerStore && product.vendor) {
      onOpenSellerStore(product.vendor);
    } else {
      onOpenDetails(product);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col justify-end h-[480px] md:h-[520px] rounded-2xl overflow-hidden border border-white/5 bg-zinc-950 transition-all duration-550 shadow-xl cursor-pointer"
    >
      {/* Background product image with zoom on hover */}
      <img 
        src={imgSrc} 
        alt={product.title} 
        onError={() => {
          setImgSrc("https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop");
        }}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
      />

      {/* Modern gradient overlay for clear contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent group-hover:via-black/60 transition-all duration-300" />

      {/* Floating Category Label */}
      <div className="absolute top-3.5 left-3.5 bg-amber-500/15 backdrop-blur-md text-amber-500 text-[8px] font-black tracking-widest border border-amber-500/20 px-2 py-0.5 rounded uppercase">
        {product.category}
      </div>

      {/* Live active Indicator */}
      <div className="absolute top-3.5 right-3.5 bg-zinc-950/80 backdrop-blur-md text-zinc-400 text-[8px] font-mono border border-white/10 px-2 py-0.5 rounded uppercase">
        {product.vendor}
      </div>

      {/* Dynamic Content Overlay */}
      <div className="relative p-5 space-y-3 z-10">
        
        {/* Title and Pricing info (standard visible state) */}
        <div className="space-y-1">
          <h3 className="text-sm md:text-base font-extrabold text-white tracking-tight line-clamp-1 group-hover:text-amber-500 transition-colors">
            {product.title}
          </h3>
          <p className="text-amber-500 text-xs font-mono font-bold">
            {product.currency === "CDF" ? `${product.price.toLocaleString("fr-FR")} CDF` : `$${product.price}`}
          </p>
        </div>

        {/* Small concise product description (slide up and fade in on hover) */}
        <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-3 opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-20 transition-all duration-550 overflow-hidden font-mono">
          {product.description || "Aucune description supplémentaire disponible pour cet article d'Afrique Centrale."}
        </p>

        {/* Action Trays: Large "Voir plus" button + Small "Like" button with dynamic count */}
        <div className="flex gap-2 pt-2.5 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black font-mono text-[9.5px] uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Voir plus</span>
          </button>

          <button
            onClick={handleLike}
            className={`px-3 py-2 border transition-all active:scale-95 rounded-xl cursor-pointer flex items-center gap-1.5 ${
              isLiked 
                ? "bg-red-600/25 border-red-500/40 text-red-500 font-bold" 
                : "bg-zinc-900/95 border-white/10 text-zinc-400 hover:text-red-500"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500" : ""}`} />
            <span className="text-[9.5px] font-mono font-bold">{likesCount}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default function App() {
  // Global States: View mode, active language, active theme, active font (using persistent keys)
  const [viewMode, setViewMode] = useState<'shop' | 'favorites' | 'chat' | 'checkout' | 'workspace' | 'product-detail' | 'seller-shop' | 'settings'>('shop');
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAuth | null>(null);
  const [shopInitialProduct, setShopInitialProduct] = useState<Product | null>(null);
  const [negotiatingProduct, setNegotiatingProduct] = useState<Product | null>(null);
  const [similarLimit, setSimilarLimit] = useState(4);
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const s = localStorage.getItem("kufulula_language");
    return (s as AppLanguage) || 'fr';
  });
  const [activeTheme, setActiveTheme] = useState<ApplicationTheme>(() => {
    const s = localStorage.getItem("kufulula_theme");
    const found = THEMES.find(t => t.id === s);
    return found || THEMES[0];
  });
  const [activeFont, setActiveFont] = useState<AppFont>(() => {
    const s = localStorage.getItem("kufulula_font");
    const found = FONTS.find(f => f.id === s);
    return found || FONTS[0];
  });

  // Keep chosen values persistent across page refreshes
  useEffect(() => {
    localStorage.setItem("kufulula_language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("kufulula_theme", activeTheme.id);
  }, [activeTheme]);

  useEffect(() => {
    localStorage.setItem("kufulula_font", activeFont.id);
  }, [activeFont]);

  useEffect(() => {
    KAuth.getCurrentUser().then(setCurrentUser);
  }, []);

  useEffect(() => {
    const handleNegotiation = (e: any) => setNegotiatingProduct(e.detail);
    window.addEventListener('openNegotiation', handleNegotiation as any);
    return () => window.removeEventListener('openNegotiation', handleNegotiation as any);
  }, []);

  // Is parameters modal open
  const [isParamsOpen, setIsParamsOpen] = useState(false);
  const [showMerchantPortal, setShowMerchantPortal] = useState(false);
  const [activeSubPage, setActiveSubPage] = useState<'home' | 'about' | 'works' | 'impact' | 'awards' | 'contact'>('home');
  const [excerptBook, setExcerptBook] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(25);
  const [donationCarrier, setDonationCarrier] = useState<string>("M-Pesa");
  const [donationStatus, setDonationStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "diplomatic", message: "" });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  // System Web Permissions & KYC Verification State
  const [permissionsState, setPermissionsState] = useState(() => {
    const saved = localStorage.getItem("kufulula_permissions_state_v3");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      camera: true,
      microphone: true,
      geolocation: true,
      notifications: true,
      autoinstall: true,
      kyc: true,
      media: true
    };
  });

  const [showPermissionsModal, setShowPermissionsModal] = useState(() => {
    return localStorage.getItem("kufulula_permissions_configured_v3") !== "true";
  });

  const handleTogglePermission = (key: string) => {
    setPermissionsState((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveAllPermissions = (allGranted: boolean) => {
    let newState = { ...permissionsState };
    if (allGranted) {
      newState = {
        camera: true,
        microphone: true,
        geolocation: true,
        notifications: true,
        autoinstall: true,
        kyc: true,
        media: true
      };
      setPermissionsState(newState);
    }
    localStorage.setItem("kufulula_permissions_state_v3", JSON.stringify(newState));
    localStorage.setItem("kufulula_permissions_configured_v3", "true");
    setShowPermissionsModal(false);
  };

  // Active fashion product currently showcased in the giant hero banner
  const [heroCoutureId, setHeroCoutureId] = useState<string>("design");

  // Typewriter effect states for the landing hero
  const [typedLine1, setTypedLine1] = useState("");
  const [typedLine2, setTypedLine2] = useState("");
  const [activeTransitionTag, setActiveTransitionTag] = useState<string | null>(null);

  useEffect(() => {
    let index1 = 0;
    let index2 = 0;
    const line1Text = "Le Premier Soko d'Afrique Centrale";
    const line2Text = "Sécurisé par Double Séquestre";
    
    setTypedLine1("");
    setTypedLine2("");
    let interval1: NodeJS.Timeout;
    let interval2: NodeJS.Timeout;
    
    interval1 = setInterval(() => {
      setTypedLine1(line1Text.substring(0, index1 + 1));
      index1++;
      if (index1 >= line1Text.length) {
        clearInterval(interval1);
        
        // Start typing line 2 line-by-line
        interval2 = setInterval(() => {
          setTypedLine2(line2Text.substring(0, index2 + 1));
          index2++;
          if (index2 >= line2Text.length) {
            clearInterval(interval2);
          }
        }, 45);
      }
    }, 45);
    
    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, [activeTheme.id]);

  const handleTagClickWithTransition = (tag: string) => {
    setActiveTransitionTag(tag);
    setTimeout(() => {
      setSelectedCategory("All");
      setSearchQuery(tag);
      setViewMode('shop');
      setActiveTransitionTag(null);
    }, 1200); // Cinematic transition duration
  };

  // Pinterest reactivity states and action triggers
  const [likedUpdatedTrigger, setLikedUpdatedTrigger] = useState(0);
  const [shareToastText, setShareToastText] = useState<string | null>(null);

  const handlePinterestLikeToggle = (pId: string) => {
    const key = `k_liked_state_${pId}`;
    const wasLiked = localStorage.getItem(key) === "true";
    const nextLiked = !wasLiked;
    localStorage.setItem(key, nextLiked ? "true" : "false");
    
    const likesKey = `k_likes_${pId}`;
    const savedLikes = localStorage.getItem(likesKey);
    const prod = allProducts.find(p => p.id === pId);
    const currentLikes = savedLikes ? parseInt(savedLikes) : (prod?.likesCount || 0);
    localStorage.setItem(likesKey, Math.max(0, currentLikes + (nextLiked ? 1 : -1)).toString());

    // Update k_persistent_favorites
    let favList: Product[] = [];
    const stored = localStorage.getItem("k_persistent_favorites");
    if (stored) {
      try { favList = JSON.parse(stored); } catch(e) {}
    }
    if (nextLiked) {
      if (prod && !favList.some(p => p.id === pId)) {
        favList.push(prod);
      }
    } else {
      favList = favList.filter(p => p.id !== pId);
    }
    localStorage.setItem("k_persistent_favorites", JSON.stringify(favList));

    setLikedUpdatedTrigger(prev => prev + 1);
  };

  const handlePinterestShare = (title: string, pId: string) => {
    const url = `${window.location.origin}/#product/${pId}`;
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Regarde ce produit superbe sur KUFULULA !`,
        url: url
      }).catch(() => {
        navigator.clipboard.writeText(url).then(() => {
          setShareToastText(`Lien de partage copié : "${title}" 🚀`);
          setTimeout(() => setShareToastText(null), 3000);
        });
      });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setShareToastText(`Lien de partage copié : "${title}" 🚀`);
        setTimeout(() => setShareToastText(null), 3000);
      });
    }
  };

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

  // Reset similar count limit on product selection changes
  useEffect(() => {
    setSimilarLimit(4);
  }, [selectedProduct]);

  // Cart Status (Interactive sliding drawer)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout transaction
  const [successfulTransaction, setSuccessfulTransaction] = useState<DirectTransaction | null>(null);

  // Futuristic Voice Search Simulator states
  const [showVoiceSearchModal, setShowVoiceSearchModal] = useState(false);
  const [voiceSearchStatus, setVoiceSearchStatus] = useState<'idle' | 'listening' | 'analyzing' | 'done'>('idle');
  const [vocalQueryText, setVocalQueryText] = useState("");

  // AI Google Lens Search state (dedicated to Search Camera triggers)
  const [showAiLensModal, setShowAiLensModal] = useState(false);
  const [aiLensScanStatus, setAiLensScanStatus] = useState<'idle' | 'scanning' | 'matched' | 'failed'>('idle');
  const [aiLensError, setAiLensError] = useState<string | null>(null);
  const [selectedLensPreset, setSelectedLensPreset] = useState<string | null>(null);
  const [aiLensCapturedImage, setAiLensCapturedImage] = useState<string | null>(null);
  const [aiLensResult, setAiLensResult] = useState<{
    detectedCategory: string;
    primaryObject: string;
    suggestedTags: string[];
    confidenceScore: number;
    description: string;
  } | null>(null);

  const LENS_PHOTO_PRESETS = [
    {
      id: "lens-mwinda",
      name: "Lanterne Mwinda Solaire",
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1540206395-68808572332f?w=500&auto=format&fit=crop&q=60",
      description: "Lanterne solaire autonome d'urgence"
    },
    {
      id: "lens-coffee",
      name: "Pâtisserie du Fleuve",
      category: "Food",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60",
      description: "Service traiteur et viennoiseries de terroir"
    },
    {
      id: "lens-fashion",
      name: "Mode & Fashion Isolele",
      category: "Fashion",
      image: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=500&auto=format&fit=crop&q=60",
      description: "Draperies d'élégance africaine imprimée en cire"
    },
    {
      id: "lens-book",
      name: "La Dynastie Kongo",
      category: "Livre",
      image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500&auto=format&fit=crop&q=60",
      description: "Roman sur l'héritage ancestral Kongo"
    }
  ];

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

  // Automated Infinite scroll similar products loader in product detail page
  useEffect(() => {
    if (viewMode !== 'product-detail') return;

    const handleSimilarScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const totalPageHeight = document.documentElement.scrollHeight;

      if (totalPageHeight - scrollPosition < 450) {
        setSimilarLimit(prev => prev + 4);
      }
    };

    window.addEventListener("scroll", handleSimilarScroll);
    return () => window.removeEventListener("scroll", handleSimilarScroll);
  }, [viewMode]);

  // Fetch expanded catalog products (52 rich items)
  useEffect(() => {
    loadCatalog();
    loadSessionAuth();
  }, [isAdminViewActive]);

  const loadCatalog = async () => {
    setLoading(true);
    let list: Product[] = [];
    try {
      const res = await fetch("https://fakestoreapi.com/products");
      const fakeProducts = await res.json();
      list = fakeProducts.map((p: any) => ({
        id: `fake-${p.id}`,
        title: p.title,
        description: p.description,
        price: p.price,
        currency: "USD",
        image: p.image,
        category: p.category,
        stock: 50,
        vendor: "Fakestore Merchant",
        tags: [p.category],
        isDraft: false,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.error("Failed to fetch fakestore API", e);
      list = await KDb.getProducts();
    }

    // Define custom high-fidelity cars, phones, and tablets to satisfy specific vendor shops
    const customShowcaseProducts: Product[] = [
      {
        id: "car-landcruiser",
        title: "Toyota Land Cruiser V6 Prado 2024",
        description: "Véhicule tout-terrain de prestige, moteur V6 turbodiesel, boîte de transfert robuste, suspensions renforcées KUFULULA Gold. Parfait pour les liaisons interprovinciales en RDC.",
        price: 48000,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop",
        category: "Electronics",
        stock: 5,
        vendor: "Mwanza Auto Motors",
        tags: ["Voiture", "Auto", "Toyota", "Premium", "Kinshasa"],
        isDraft: false,
        isPublished: true,
        createdAt: "2026-06-26T00:00:00Z",
        updatedAt: "2026-06-26T00:00:00Z"
      },
      {
        id: "car-gclass",
        title: "Mercedes-Benz G63 AMG Black",
        description: "L'icône absolue de l'autorité sur route. Blindage léger de carrosserie, intérieur cuir nappa ébène et puissance ultime pour la haute bourgeoisie de Kinshasa Gombe.",
        price: 125000,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?q=80&w=800&auto=format&fit=crop",
        category: "Electronics",
        stock: 2,
        vendor: "Mwanza Auto Motors",
        tags: ["Voiture", "Auto", "Mercedes", "Prestige", "Gombe"],
        isDraft: false,
        isPublished: true,
        createdAt: "2026-06-26T00:00:00Z",
        updatedAt: "2026-06-26T00:00:00Z"
      },
      {
        id: "car-tucson",
        title: "Hyundai Tucson Executive",
        description: "SUV urbain compact, boîte automatique, écran tactile géant, consommation de carburant optimisée pour les embouteillages du boulevard du 30 Juin.",
        price: 26000,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop",
        category: "Electronics",
        stock: 12,
        vendor: "Mwanza Auto Motors",
        tags: ["Voiture", "Auto", "Hyundai", "Urbain"],
        isDraft: false,
        isPublished: true,
        createdAt: "2026-06-26T00:00:00Z",
        updatedAt: "2026-06-26T00:00:00Z"
      },
      {
        id: "car-hilux",
        title: "Toyota Hilux Double Cabine 4x4",
        description: "Le pick-up légendaire indestructible pour vos convois miniers à Kolwezi ou vos chantiers agricoles dans le Bas-Congo. Double pont renforcé.",
        price: 34000,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=800&auto=format&fit=crop",
        category: "Electronics",
        stock: 8,
        vendor: "Mwanza Auto Motors",
        tags: ["Voiture", "Auto", "Pick-up", "Toyota", "Kolwezi"],
        isDraft: false,
        isPublished: true,
        createdAt: "2026-06-26T00:00:00Z",
        updatedAt: "2026-06-26T00:00:00Z"
      },
      {
        id: "phone-infinix",
        title: "Infinix Zero 30 Ultra 5G",
        description: "Écran incurvé AMOLED 120Hz, appareil photo 200MP et charge ultra-rapide 180W. Design simili-cuir texturé doré.",
        price: 320,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop",
        category: "Electronics",
        stock: 50,
        vendor: "Afritech Télécom",
        tags: ["Phone", "Téléphone", "Android", "Infinix", "5G"],
        isDraft: false,
        isPublished: true,
        createdAt: "2026-06-26T00:00:00Z",
        updatedAt: "2026-06-26T00:00:00Z"
      },
      {
        id: "phone-s24",
        title: "Samsung Galaxy S24 Ultra AI",
        description: "Intégration d'intelligence artificielle en temps réel pour vos traductions d'affaires swahili-lingala-français, stylet S-Pen de précision et capteur photo 200MP.",
        price: 1249,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop",
        category: "Electronics",
        stock: 25,
        vendor: "Afritech Télécom",
        tags: ["Phone", "Téléphone", "Android", "Samsung", "AI"],
        isDraft: false,
        isPublished: true,
        createdAt: "2026-06-26T00:00:00Z",
        updatedAt: "2026-06-26T00:00:00Z"
      },
      {
        id: "phone-iphone15",
        title: "iPhone 15 Pro Max Titanium",
        description: "Le fleuron d'Apple avec boîtier en titane de qualité aérospatiale, puce A17 Pro ultra-puissante et zoom optique 5x pour immortaliser les couchers de soleil du fleuve Congo.",
        price: 1399,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
        category: "Electronics",
        stock: 18,
        vendor: "Afritech Télécom",
        tags: ["Phone", "Téléphone", "iPhone", "Apple", "Titanium"],
        isDraft: false,
        isPublished: true,
        createdAt: "2026-06-26T00:00:00Z",
        updatedAt: "2026-06-26T00:00:00Z"
      },
      {
        id: "phone-ipad",
        title: "iPad Air 11\" M2 Liquid Retina",
        description: "Tablette de productivité ultime pour les professionnels de l'administration et de l'éducation. Compatible Apple Pencil et Magic Keyboard.",
        price: 699,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
        category: "Electronics",
        stock: 15,
        vendor: "Afritech Télécom",
        tags: ["Tablette", "iPad", "Apple", "Education"],
        isDraft: false,
        isPublished: true,
        createdAt: "2026-06-26T00:00:00Z",
        updatedAt: "2026-06-26T00:00:00Z"
      }
    ];

    // Inject custom products if they don't exist
    customShowcaseProducts.forEach((prod) => {
      if (!list.some(p => p.id === prod.id)) {
        list.push(prod);
      }
    });
    
    // Read persisted favorites from local storage to prevent loss of dynamic or custom generated items
    const storedFavsJson = localStorage.getItem("k_persistent_favorites");
    if (storedFavsJson) {
      try {
        const storedFavs: Product[] = JSON.parse(storedFavsJson);
        storedFavs.forEach((fav) => {
          if (!list.some(p => p.id === fav.id)) {
            list.push(fav);
          }
        });
      } catch (err) {
        console.error("Failed to parse k_persistent_favorites:", err);
      }
    }
    
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

  // Play a beautiful, futuristic double coin chime sound when adding to the cart
  const playCartSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(1100, ctx.currentTime);
      gain1.gain.setValueAtTime(0.1, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.12);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.setValueAtTime(1400, ctx.currentTime + 0.06);
      gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + 0.22);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.06);
      osc2.stop(ctx.currentTime + 0.22);
    } catch (e) {
      console.warn("Audio Context cart sound error", e);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    playCartSound();
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

  // AI GOOGLE LENS MOUNT & HANDLERS
  const aiVideoRef = useRef<HTMLVideoElement>(null);
  const [aiCameraStream, setAiCameraStream] = useState<MediaStream | null>(null);

  const handleOpenAiLens = async () => {
    setShowAiLensModal(true);
    setAiLensScanStatus('idle');
    setAiLensResult(null);
    setSelectedLensPreset(null);
    setAiLensError(null);
    setAiLensCapturedImage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setAiCameraStream(stream);
      setTimeout(() => {
        if (aiVideoRef.current) {
          aiVideoRef.current.srcObject = stream;
        }
      }, 350);
    } catch (err: any) {
      console.warn("AI Camera access issue:", err);
      setAiLensError("Caméra physique non accessible dans ce mode. Veuillez importer un fichier ou choisir un modèle de démo ci-dessous !");
    }
  };

  const handleCloseAiLens = () => {
    if (aiCameraStream) {
      try {
        aiCameraStream.getTracks().forEach(track => track.stop());
      } catch (e) {}
      setAiCameraStream(null);
    }
    setShowAiLensModal(false);
  };

  const handleCaptureAiPhoto = () => {
    if (aiVideoRef.current) {
      try {
        const video = aiVideoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const b64 = canvas.toDataURL("image/jpeg");
          setAiLensCapturedImage(b64);
          setSelectedLensPreset(null);
        }
      } catch (e) {
        console.error("Failed capturing AI snapshot", e);
      }
    }
  };

  const handleAiLensFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setAiLensCapturedImage(b64);
      setSelectedLensPreset(null);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerAiLensSearch = async () => {
    setAiLensScanStatus('scanning');
    setAiLensError(null);

    const payloadImage = selectedLensPreset ? `preset:${selectedLensPreset}` : aiLensCapturedImage;

    if (!payloadImage) {
      setAiLensError("Veuillez d'abord prendre une photo, charger une image ou sélectionner un de nos modèles ci-dessous.");
      setAiLensScanStatus('failed');
      return;
    }

    try {
      const response = await fetch("/api/gemini/lens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ imageBase64: payloadImage })
      });

      if (!response.ok) {
        throw new Error("L'intelligence artificielle n'a pas répondu.");
      }

      const result = await response.json();
      if (result && result.primaryObject) {
        setAiLensResult(result);
        setAiLensScanStatus('matched');
        playBeepSound();

        // Stagger transitions to allow beautiful search update
        setTimeout(() => {
          setSearchQuery(result.primaryObject);
          setSelectedCategory(result.detectedCategory || "All");
          handleCloseAiLens();

          const section = document.getElementById("catalog-section");
          if (section) {
            section.scrollIntoView({ behavior: "smooth" });
          }
        }, 3200);
      } else {
        throw new Error("Résultat d'analyse AI vide.");
      }
    } catch (err: any) {
      console.error("AI Lens Search Error:", err);
      setAiLensError("Échec de l'IA. Essai avec simulation de secours...");
      setAiLensScanStatus('failed');
    }
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
      <AnimatePresence>
        {loading && <LoadingScreen />}
      </AnimatePresence>
      <AnimatePresence>
        {negotiatingProduct && (
          <ProductNegotiationChat
            product={negotiatingProduct}
            onClose={() => setNegotiatingProduct(null)}
            activeTheme={activeTheme}
          />
        )}
      </AnimatePresence>
      
      {/* Dynamic Theme skinning & Flavour Mix typography injection */}
      <style>{`
        ${activeFont.id === 'flavour-mix' ? `
          h1, h2, h3, .heading-font, [class*="font-sans"] { font-family: 'Space Grotesk', 'Inter', sans-serif !important; letter-spacing: -0.015em; }
          p, span, div, .body-font { font-family: 'Inter', sans-serif !important; }
          .mono-font, .quantity, .price, .number, [class*="font-mono"] { font-family: 'JetBrains Mono', monospace !important; }
          .signature-font, .italic-styled { font-family: 'Calibri', 'Rubik', sans-serif !important; font-style: italic !important; }
        ` : ''}

        ${activeTheme.id === 'abysses' ? `
          /* Reposition orange colors to celestial abyssal cyan */
          .text-[#FF8C00], .text-amber-500, .text-amber-400, .text-amber-600 { color: #22d3ee !important; }
          .bg-[#FF8C00], .bg-amber-500, .bg-amber-600 { background-color: #22d3ee !important; color: #010a12 !important; }
          .border-[#FF8C00], .border-amber-500 { border-color: #22d3ee !important; }
          .bg-[#FF8C00]/10, .bg-amber-500/10, .bg-amber-500\\/10 { background-color: rgba(34, 211, 238, 0.1) !important; color: #22d3ee !important; }
          .bg-[#FF8C00]/20, .bg-amber-500/20, .bg-amber-500\\/20 { background-color: rgba(34, 211, 238, 0.15) !important; }
          /* Override hover and transition states */
          .hover\\:bg-amber-600:hover, .hover\\:text-amber-500:hover { background-color: #22d3ee !important; color: #010a12 !important; }
          .shadow-orange-500\\/10 { --tw-shadow-color: rgba(34, 211, 238, 0.15) !important; }
        ` : activeTheme.id === 'glass-water' ? `
          /* Reposition orange colors to glass grey and drop effects */
          .text-[#FF8C00], .text-amber-500, .text-amber-400, .text-zinc-650 { color: #ffffff !important; }
          .bg-[#FF8C00], .bg-amber-500, .bg-amber-600 { background-color: #64748b !important; color: #ffffff !important; }
          .border-[#FF8C00], .border-amber-500 { border-color: #94a3b8 !important; }
          .bg-[#FF8C00]/10, .bg-amber-500/10, .bg-amber-500\\/10 { background-color: rgba(255, 255, 255, 0.2) !important; color: #ffffff !important; }
          .bg-[#FF8C00]/20, .bg-amber-500/20, .bg-amber-500\\/20 { background-color: rgba(255, 255, 255, 0.3) !important; }
          .hover\\:bg-amber-600:hover, .hover\\:text-amber-500:hover { background-color: #64748b !important; color: #ffffff !important; }
        ` : activeTheme.id === 'white-noir' ? `
          /* Reposition orange to crisp solid black and white aesthetics */
          .text-[#FF8C00], .text-amber-500, .text-amber-400 { color: #000000 !important; }
          .bg-[#FF8C00], .bg-amber-500, .bg-amber-600 { background-color: #000000 !important; color: #ffffff !important; }
          .border-[#FF8C00], .border-amber-500 { border-color: #000000 !important; }
          .bg-[#FF8C00]/10, .bg-amber-500/10 { background-color: rgba(0, 0, 0, 0.05) !important; color: #000000 !important; }
          .bg-[#FF8C00]/20, .bg-amber-500/20 { background-color: rgba(0, 0, 0, 0.1) !important; }
        ` : ''}

        /* Ensure heart likes are strictly bright red always */
        .liked-heart, .heart-pulse { color: #ef4444 !important; fill: #ef4444 !important; }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
      `}</style>

      {/* Atmospheric Ephemeral Cloud Blobs (Abysses Theme Only) */}
      {activeTheme.id === 'abysses' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-cyan-500/5 rounded-full blur-[110px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[40%] right-[5%] w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
          <div className="absolute bottom-[10%] left-[20%] w-80 h-80 bg-sky-400/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
        </div>
      )}

      {/* Water Drops Backdrop Effect (Glass Water Theme Only) */}
      {activeTheme.id === 'glass-water' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-br from-[#e0f2fe]/40 via-[#f0f9ff]/50 to-[#e8f1f2]/40">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[100px]" />
          <div className="absolute top-[30%] left-[-100px] w-80 h-80 bg-slate-300/10 rounded-full blur-[90px]" />
        </div>
      )}
      
      {/* MODERNE FLOATING PILL CAPSULE HEADER */}
      <div className="pt-4 px-4 sticky top-0 z-40 w-full max-w-7xl mx-auto">
        <header className={`px-4 md:px-6 py-3 rounded-2xl md:rounded-3xl flex items-center justify-between gap-4 transition-all duration-300 ${
          activeTheme.id === 'sahel-noir'
            ? 'bg-zinc-950/90 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-white'
            : activeTheme.id === 'terracotta-clay'
            ? 'bg-white/95 border border-[#E8DFD0] text-[#4E2A25] shadow-sm'
            : activeTheme.id === 'urban-brutalist'
            ? 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black'
            : activeTheme.id === 'abysses'
            ? 'bg-[#021424]/90 border border-cyan-500/30 text-white shadow-[0_0_15px_rgba(34,211,238,0.15)] backdrop-blur-md'
            : activeTheme.id === 'glass-water'
            ? 'backdrop-blur-md bg-white/40 border border-white/60 text-zinc-900 shadow-lg'
            : 'bg-zinc-950/80 border border-white/10 backdrop-blur-md text-white shadow-xl'
        }`}>
          <div className="flex items-center gap-2 shrink-0">
            {/* Authentic glowing logo */}
            {activeTheme.id === 'sahel-noir' ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-zinc-900 border border-emerald-500/55 rounded-lg flex items-center justify-center font-bold text-[#00FF66] text-sm shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse">
                  K
                </div>
                <span className="text-sm md:text-base font-black tracking-widest text-white uppercase select-none font-sans">
                  KUFULULA Shop
                </span>
              </div>
            ) : activeTheme.id === 'terracotta-clay' ? (
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded bg-[#FAF6F0] border border-[#8F3E2B]/40 flex items-center justify-center font-serif font-black text-[#8F3E2B] text-xs">
                  👑
                </div>
                <span className="text-sm md:text-base font-serif font-black tracking-tight text-[#8F3E2B] select-none">
                  KUFULULA
                </span>
              </div>
            ) : activeTheme.id === 'urban-brutalist' ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#004BFF] border-2 border-black rounded flex items-center justify-center font-black text-white text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                  K
                </div>
                <span className="text-sm md:text-base font-mono font-black tracking-tight text-black uppercase select-none">
                  KUFULULA
                </span>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setViewMode('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-base md:text-xl font-black tracking-widest text-[#FF8C00] hover:opacity-95 uppercase select-none font-sans flex items-center gap-1.5 transition-all text-left"
              >
                <ShieldCheck className="w-5 h-5 text-white animate-pulse" />
                {dict.appName}
              </button>
            )}
          </div>

          {/* Global actions: parameters trigger, cart tracker */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* UNIFIED PARAMETERS / LANGUAGE DIALOG TRIGGER */}
            <button
              onClick={() => setIsParamsOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all relative ${
                activeTheme.id === 'sahel-noir'
                  ? 'border border-emerald-500/40 bg-zinc-900 text-emerald-400 font-mono hover:bg-zinc-850'
                  : activeTheme.id === 'terracotta-clay'
                  ? 'border border-[#8F3E2B]/30 bg-[#FAF6F0] text-[#8F3E2B] font-serif hover:bg-[#E2D5C3]'
                  : activeTheme.id === 'urban-brutalist'
                  ? 'border-2 border-black bg-white text-black font-mono font-bold hover:bg-zinc-100 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]'
                  : activeTheme.id === 'abysses'
                  ? 'border border-cyan-500/40 bg-slate-950 text-cyan-400 font-mono hover:bg-cyan-950/85 shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                  : activeTheme.id === 'glass-water'
                  ? 'border border-slate-300 bg-white/50 text-slate-700 font-sans hover:bg-white/85 shadow-sm'
                  : 'border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-amber-500 font-mono'
              }`}
              title="Langues, Thèmes & Polices"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px] font-bold">Réglages</span>
              <Settings className="w-3.5 h-3.5 animate-spin-slow" />
              <span className={`absolute top-0 right-0 w-2 h-2 ${activeTheme.id === 'abysses' ? 'bg-cyan-400' : 'bg-amber-500'} rounded-full animate-ping`} />
            </button>

            {/* Cart Tracker */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
                activeTheme.id === 'sahel-noir'
                  ? 'bg-[#00FF66] text-black hover:bg-green-400 font-mono font-bold shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                  : activeTheme.id === 'terracotta-clay'
                  ? 'bg-[#8F3E2B] text-white hover:bg-[#A34B38] font-serif font-bold'
                  : activeTheme.id === 'urban-brutalist'
                  ? 'bg-[#004BFF] text-white font-mono font-bold border-2 border-black hover:bg-[#0038C7] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : activeTheme.id === 'abysses'
                  ? 'bg-cyan-400 text-zinc-950 hover:bg-cyan-300 font-mono font-bold shadow-[0_0_10px_rgba(34,211,238,0.35)]'
                  : activeTheme.id === 'glass-water'
                  ? 'bg-slate-500 text-white hover:bg-slate-600 font-sans font-bold shadow-md'
                  : 'bg-[#FF8C00] text-zinc-950 hover:bg-amber-500 font-mono font-bold shadow-md hover:scale-105 active:scale-95'
              }`}
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
            <div className={`relative overflow-hidden min-h-[420px] md:min-h-[480px] rounded-3xl p-6 md:p-10 transition-all duration-300 ${
              activeTheme.id === 'sahel-noir'
                ? 'border border-emerald-500/30 bg-black text-white shadow-[0_0_20px_rgba(16,185,129,0.08)]'
                : activeTheme.id === 'terracotta-clay'
                ? 'border border-[#E8DFD0] bg-gradient-to-tr from-[#FAF6F0] to-[#EAD8C3] text-[#4E2A25] shadow-sm'
                : activeTheme.id === 'urban-brutalist'
                ? 'border-2 border-black bg-white text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                : 'border border-white/5 bg-gradient-to-tr from-black via-zinc-950 to-zinc-900/40 text-white shadow-2xl'
            }`}>
              
              {/* Visual backdrop accents */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
              {activeTheme.id !== 'urban-brutalist' && (
                <>
                  <div className={`absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 rounded-full filter blur-[120px] pointer-events-none ${
                    activeTheme.id === 'sahel-noir' ? 'bg-emerald-500/10' : activeTheme.id === 'terracotta-clay' ? 'bg-[#8F3E2B]/10' : 'bg-amber-600/12'
                  }`} />
                  <div className={`absolute bottom-0 right-1/4 w-[500px] h-36 rounded-full filter blur-[100px] pointer-events-none ${
                    activeTheme.id === 'sahel-noir' ? 'bg-green-500/10' : activeTheme.id === 'terracotta-clay' ? 'bg-[#EAD8C3]/20' : 'bg-[#FF8C00]/8'
                  }`} />
                </>
              )}

              {/* High-Fidelity Split-Screen Editorial Grid */}
              <div className="relative w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
                
                {/* Left Side: Elegant Branding and Copy */}
                <div className="lg:col-span-7 space-y-4 md:space-y-6">
                  
                  {/* Luxury Badging */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[9px] md:text-[10px] uppercase font-mono tracking-widest font-black flex items-center gap-1 px-3 py-1 rounded-full backdrop-blur-md ${
                      activeTheme.id === 'sahel-noir'
                        ? 'text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/30'
                        : activeTheme.id === 'terracotta-clay'
                        ? 'text-[#8F3E2B] bg-[#8F3E2B]/10 border border-[#8F3E2B]/30 font-serif'
                        : activeTheme.id === 'urban-brutalist'
                        ? 'text-white bg-[#004BFF] border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]'
                        : 'text-[#FF8C00] bg-[#FF8C00]/10 border border-amber-500/35 shadow-[0_0_15px_rgba(255,140,0,0.15)] animate-pulse'
                    }`}>
                      <Compass className="w-3.5 h-3.5" />
                      {activeTheme.id === 'sahel-noir'
                        ? "FUTURE TECH | MINIMALIST ARCHITECTURE"
                        : activeTheme.id === 'terracotta-clay'
                        ? "ARTISANAT DU CONGO | BOUE ET TERRE CRUE"
                        : activeTheme.id === 'urban-brutalist'
                        ? "STREET SELECTS | ZERO COMPROMISE"
                        : "KUFULULA SOKO SECURE COMMERCE"
                      }
                    </span>

                    <span className="text-[9px] font-mono border border-white/10 bg-white/5 text-zinc-400 px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                      <Crown className="w-3 h-3 text-amber-500 fill-amber-500/20" /> COMPTOIR D'AFRIQUE CENTRALE
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-sans tracking-tight font-extrabold leading-[1.08] text-white">
                    {activeTheme.id === 'sahel-noir' ? (
                      <>
                        Le Soko Tech <br />
                        <span className="text-[#00FF66]">Sécurité Totale.</span>
                      </>
                    ) : activeTheme.id === 'terracotta-clay' ? (
                      <>
                        Poterie de la Dote <br />
                        <span className="text-[#8F3E2B]">Terre du fleuve.</span>
                      </>
                    ) : (
                      <>
                        <span className="block text-2xl md:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-400 tracking-tight font-extrabold pb-1">
                          {typedLine1}
                        </span>
                        {typedLine1.length >= "Le Premier Soko d'Afrique Centrale".length - 2 && (
                          <span className={`block text-xl md:text-3xl lg:text-4xl font-mono mt-1 ${activeTheme.id === 'abysses' ? 'text-cyan-400' : 'text-amber-500'}`}>
                            {typedLine2}
                            <span className="animate-pulse font-light ml-1">|</span>
                          </span>
                        )}
                      </>
                    )}
                  </h1>

                  {/* Subtext */}
                  <p className={`text-xs md:text-sm max-w-xl leading-relaxed ${
                    activeTheme.id === 'terracotta-clay' ? 'text-[#6E534E]' : activeTheme.id === 'urban-brutalist' ? 'text-zinc-800' : 'text-zinc-350'
                  }`}>
                    {activeTheme.id === 'sahel-noir'
                      ? "Le grand carrefour autonome sécurisé par double signature de dépôt fiduciaire Mobile Money (Airtel, M-Pesa, Orange Money)."
                      : activeTheme.id === 'terracotta-clay'
                      ? "Découvrez l'élégance de nos pièces de terracotta façonnées à la main par nos maîtres potiers du Kongo Central."
                      : "Achetez les créations, services et produits d'ici en toute tranquillité d'esprit. Le double séquestre actif KUFULULA sécurise instantanément vos transactions."
                    }
                  </p>

                  {/* Structural Trust Badges & System Labels */}
                  <div className={`pt-2 flex flex-wrap items-center gap-4 text-[10px] font-mono ${
                    activeTheme.id === 'terracotta-clay' ? 'text-[#8F3E2B]' : activeTheme.id === 'urban-brutalist' ? 'text-black font-black' : 'text-zinc-400'
                  }`}>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
                      activeTheme.id === 'urban-brutalist' ? 'bg-zinc-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white/5 border border-white/5'
                    }`}>
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                      <span>Double Séquestre Mobile Money</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
                      activeTheme.id === 'urban-brutalist' ? 'bg-zinc-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white/5 border border-white/5'
                    }`}>
                      <Check className="w-4 h-4 text-amber-500" />
                      <span>IA de Recherche & Analyse Visuelle</span>
                    </div>
                  </div>

                  {/* Live Interaction Stats */}
                  <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/5 text-zinc-500 text-[10px] font-mono font-medium">
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/10" />
                      <span><span className="text-white font-bold">14.2k</span> Visiteurs</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span><span className="text-amber-500 font-bold">Atelier Certifié</span></span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-green-400" />
                      <span><span className="text-green-400 font-bold">Double KYC</span></span>
                    </div>
                  </div>

                </div>

                {/* Right Side: Sleek, Ultra-Professional Trust Escrow Flow Card */}
                <div className="lg:col-span-5 w-full flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-[340px] p-5 bg-zinc-950/90 border border-white/10 hover:border-amber-500/40 rounded-2xl transition-all duration-550 shadow-[0_15px_35px_rgba(0,0,0,0.6)] space-y-4">
                    
                    <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                      <span className="text-[10px] font-mono font-bold text-amber-500 tracking-wider uppercase flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> K-Trust Escrow Hub
                      </span>
                      <span className="text-[8px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full uppercase">
                        Actif • 100% Sécurisé
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                      Visualisation en temps réel de notre mécanisme de double signature fiduciaire Mobile Money :
                    </p>

                    <div className="space-y-3">
                      {/* Step 1 */}
                      <div className="flex gap-3 items-start bg-white/5 p-2.5 rounded-xl border border-white/5">
                        <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-[10px] font-bold text-white font-mono uppercase">1. Consignation du Dépôt</h4>
                          <p className="text-[9px] text-zinc-400">L'acheteur verse les fonds sur le séquestre sécurisé Kufulula.</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-3 items-start bg-white/5 p-2.5 rounded-xl border border-white/5">
                        <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-[10px] font-bold text-white font-mono uppercase">2. Expédition & Signature</h4>
                          <p className="text-[9px] text-zinc-400">Le vendeur expédie le bien. Les deux parties valident la conformité.</p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex gap-3 items-start bg-white/5 p-2.5 rounded-xl border border-white/5">
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-[10px] font-bold text-white font-mono uppercase">3. Déblocage Garanti</h4>
                          <p className="text-[9px] text-zinc-400">Les fonds sont reversés en toute transparence et traçabilité.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-center">
                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest">
                        ZÉRO ARNAQUE • ZÉRO TRACAS
                      </span>
                    </div>

                  </div>
                </div>

              </div>

            </div>

            {/* INTERACTIVE GIANT TRIANGLES MARQUEE */}
            <div className="relative overflow-visible w-full">
              <GiantTrianglesShowcase
                onViewProduct={(id) => {
                  const found = allProducts.find(p => p.id === id);
                  if (found) {
                    setShopInitialProduct(found);
                    setSelectedSeller(found.vendor);
                    setViewMode('seller-shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                onLikeToggle={(id) => handlePinterestLikeToggle(id)}
                isLiked={(id) => localStorage.getItem("k_liked_state_" + id) === "true"}
              />
            </div>

            {/* EXCLUSIVE ISOLELE COLLECTION & DRC MOST LOVED PRODUCT SHOWCASE */}
            <div className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-2.5">
                <div>
                  <h2 className="text-sm font-sans font-black tracking-tight text-[#FF8C00] uppercase flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-white animate-pulse" />
                    Le Soko Prestige : Sélection d'Afrique Centrale 🇨🇩
                  </h2>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Fiches de présentation interactives avec survol immersif, spécifications et double signature active.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase mt-1 sm:mt-0 tracking-wider">
                  Séquestre Double Actif
                </span>
              </div>

              {/* Grid with 5 columns for vertical rectangles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {allProducts
                  .filter(p => p.id.includes("isolele") || p.id.includes("fashion-isolele") || p.id.includes("superwax-congo"))
                  .slice(0, 5) // Display first 5 matched
                  .map((p) => (
                    <GiantRectangleCard
                      key={p.id}
                      product={p}
                      onOpenDetails={(item) => {
                        setShopInitialProduct(item);
                        setSelectedSeller(item.vendor);
                        setViewMode('seller-shop');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onOpenSellerStore={(vendorName) => {
                        setSelectedSeller(vendorName);
                        setViewMode('seller-shop');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      activeTheme={activeTheme}
                    />
                  ))}
              </div>
            </div>



                {/* REVOLUTIONARY DYNAMIC PRODUCT CATALOG GRID WITH FUZZY SEARCH, AUTO-COMPLETE, AND ATOMIC SHIMMER FILTERS */}
                <ProductCatalogGrid
                  products={allProducts}
                  loading={loading}
                  onOpenDetails={(item) => {
                    setShopInitialProduct(item);
                    setSelectedSeller(item.vendor);
                    setViewMode('seller-shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onAddToCart={handleAddToCart}
                  dict={dict}
                  activeTheme={activeTheme}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onVoiceTrigger={handleVoiceTrigger}
                  onLensCameraTrigger={handleOpenAiLens}
                  onOpenSellerStore={(vendorName) => {
                    setSelectedSeller(vendorName);
                    setViewMode('seller-shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onOpenExcerpt={(bookId) => setExcerptBook(bookId)}
                />

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
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#FF8C00] font-black">VOS TRÉSORS PRÉFÉRÉS</span>
              <h1 className="text-2xl font-sans font-extrabold flex items-center justify-center gap-2 text-white">
                <Heart className="w-5.5 h-5.5 text-red-500 fill-red-500 animate-pulse" />
                Mes Coups de Cœur
              </h1>
              <p className="text-xs text-zinc-400">
                Retrouvez vos articles coup de cœur sous forme de galerie asymétrique Pinterest premium.
              </p>
            </div>

            {/* Pinterest Masonry Layout */}
            {allProducts.filter(p => localStorage.getItem(`k_liked_state_${p.id}`) === "true").length > 0 ? (
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
                {allProducts
                  .filter(p => localStorage.getItem(`k_liked_state_${p.id}`) === "true")
                  .map((p, idx) => {
                    const heights = ["h-64", "h-80", "h-72", "h-96", "h-[280px]", "h-[400px]", "h-[320px]"];
                    const hClass = heights[idx % heights.length];
                    const numLikes = localStorage.getItem(`k_likes_${p.id}`) || p.likesCount || 0;

                    return (
                      <div 
                        key={p.id}
                        className="break-inside-avoid relative group overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/40 p-2 text-white transition-all duration-300 hover:shadow-2xl hover:border-white/20 mb-5"
                      >
                        {/* Pure Image block with variable height */}
                        <div 
                          className={`relative rounded-2xl overflow-hidden cursor-pointer ${hClass}`}
                          onClick={() => {
                            setShopInitialProduct(p);
                            setSelectedSeller(p.vendor);
                            setViewMode('seller-shop');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          <img 
                            src={p.image} 
                            alt={p.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {/* Hover effect to read more */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-bold flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Détails complets (cliquer)
                            </span>
                          </div>
                        </div>

                        {/* Product details below the image */}
                        <div className="p-3.5 space-y-2">
                          <h3 
                            onClick={() => {
                              setShopInitialProduct(p);
                              setSelectedSeller(p.vendor);
                              setViewMode('seller-shop');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs font-black tracking-tight leading-snug truncate hover:text-[#FF8C00] transition-colors cursor-pointer"
                          >
                            {p.title}
                          </h3>
                          <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                          
                          {/* Exactly two actions: Like (left) and Share (right) */}
                          <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <button 
                              onClick={() => handlePinterestLikeToggle(p.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-00 rounded-full text-[10px] font-mono transition-all duration-200"
                              title="Aimer l'article"
                            >
                              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 liked-heart" />
                              <span className="liked-heart font-bold">{numLikes}</span>
                            </button>

                            <button 
                              onClick={() => handlePinterestShare(p.title, p.id)}
                              className="p-1.5 bg-zinc-900/80 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-full transition-all duration-200"
                              title="Partager le soko"
                            >
                              <Share className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            ) : (
              <div className="py-20 text-center max-w-sm mx-auto space-y-4 bg-zinc-900/10 border border-white/5 rounded-3xl p-6">
                <Heart className="w-12 h-12 stroke-[1.2] text-zinc-600 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Aucun coup de cœur</p>
                  <p className="text-xs text-zinc-500 leading-normal">
                    Laissez parler vos sens en cliquant sur l'icône de cœur <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline align-middle mx-1" /> de vos produits préférés lors de votre exploration du marché.
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

        {/* FULL PRODUCT DETAIL VIEW */}
        {viewMode === 'product-detail' && (
          <motion.main
            key="product-detail-view"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-4xl mx-auto px-4 py-8 space-y-8"
          >
            {/* Back button */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setViewMode('shop')}
                className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/5"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au Soko
              </button>
              <span className="text-[10px] font-mono tracking-widest text-[#FF8C00] uppercase font-bold">
                Fiche d'Origine Premium
              </span>
            </div>

            {selectedProduct ? (
              <div className="space-y-10">
                {/* Product Title and Brand */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full uppercase border border-amber-500/20 font-bold">
                      {selectedProduct.category}
                    </span>
                    {selectedProduct.vendor && (
                      <span className="text-[10px] font-mono text-zinc-400">
                        Par {selectedProduct.vendor}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-white">
                    {selectedProduct.title}
                  </h1>
                </div>

                {/* Horizontal perspective scrollbar (At least 5 perspectives) */}
                <div className="space-y-2">
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#FF8C00]" />
                    Galerie multi-angles d'orfèvre (Défiler horizontalement ↔)
                  </p>
                  
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-850 scrollbar-track-transparent snap-x">
                    {[
                      selectedProduct.image,
                      // Synthetic varied angles based on category/title to guarantee high resolution match
                      selectedProduct.category === "Livre" 
                        ? "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80" // Book page macro
                        : selectedProduct.category === "Fashion"
                        ? "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80" // Fabric luxury
                        : "https://images.unsplash.com/photo-1468495244122-4a67e719000a?auto=format&fit=crop&w=600&q=80", // Close metallic
                      
                      selectedProduct.category === "Livre"
                        ? "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"
                        : selectedProduct.category === "Fashion"
                        ? "https://images.unsplash.com/photo-1483981588606-2719b29e001a?auto=format&fit=crop&w=600&q=80"
                        : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",

                      selectedProduct.category === "Livre"
                        ? "https://images.unsplash.com/photo-1474932430478-367db2683bfc?auto=format&fit=crop&w=600&q=80"
                        : selectedProduct.category === "Fashion"
                        ? "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80"
                        : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",

                      selectedProduct.category === "Livre"
                        ? "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80" 
                        : selectedProduct.category === "Fashion"
                        ? "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80"
                        : "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80",

                      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80" // High detail presentation box/packaging
                    ].map((imgUrl, i) => (
                      <div 
                        key={i} 
                        className="flex-none w-72 h-48 md:w-80 md:h-56 rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 snap-center cursor-zoom-in group relative"
                      >
                        <img 
                          src={imgUrl} 
                          alt={`${selectedProduct.title} - angle ${i+1}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[8px] font-mono font-bold tracking-wider uppercase text-zinc-300">
                          Angle #{i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strict Two Buttons: Like and Share ONLY */}
                <div className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-2xl border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Prix conseillé</p>
                    <p className="text-xl font-mono font-black text-amber-500">
                      {selectedProduct.price.toLocaleString()} {selectedProduct.currency || "USD"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Like button on the left */}
                    <button 
                      onClick={() => handlePinterestLikeToggle(selectedProduct.id)}
                      className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-mono font-bold transition-all border border-red-500/25 active:scale-95"
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-red-500 liked-heart" />
                      <span className="liked-heart font-bold">
                        {localStorage.getItem(`k_likes_${selectedProduct.id}`) || selectedProduct.likesCount || 0}
                      </span>
                    </button>

                    {/* Share button on the right */}
                    <button 
                      onClick={() => handlePinterestShare(selectedProduct.title, selectedProduct.id)}
                      className="flex items-center gap-2 px-6 py-3 bg-zinc-850 hover:bg-zinc-800 text-white rounded-xl text-xs font-mono font-bold transition-all border border-white/5 active:scale-95"
                    >
                      <Share className="w-4 h-4" />
                      <span>Partager</span>
                    </button>
                  </div>
                </div>

                {/* Description and Clickable Tags */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                      Description authentique
                    </h3>
                    <p className="text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                      Tags de Référence (cliquables)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        selectedProduct.category,
                        ...(selectedProduct.tags || []),
                        selectedProduct.vendor || "Isolele"
                      ].map((tag, i) => (
                        <button
                          key={i}
                          onClick={() => handleTagClickWithTransition(tag)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-[#FF8C00] rounded-xl border border-white/5 transition-all text-left uppercase flex items-center gap-1.5 hover:border-amber-500/30 font-bold"
                        >
                          # {tag}
                          <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-zinc-500 italic leading-snug">
                      Cliquez sur un tag pour afficher un flux d'articles similaires de même type avec une transition fluide.
                    </p>
                  </div>
                </div>

                {/* Similar Products continuously loading infinite feed */}
                <div className="border-t border-white/5 pt-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h2 className="text-lg font-sans font-extrabold text-white">
                        Articles Similaires Recommandés
                      </h2>
                      <p className="text-xs text-zinc-400">
                        Inspiré par vos goûts esthétiques sur le Soko de Kufulula.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {allProducts
                      .filter(p => p.id !== selectedProduct.id && p.category === selectedProduct.category)
                      .slice(0, similarLimit)
                      .map((p) => {
                        const numLikes = localStorage.getItem(`k_likes_${p.id}`) || p.likesCount || 0;
                        return (
                          <div 
                            key={p.id}
                            className="p-3 bg-zinc-900/30 hover:bg-zinc-900/60 rounded-2xl border border-white/5 transition-all flex gap-4 cursor-pointer group"
                            onClick={() => {
                              setSelectedProduct(p);
                              // Scroll up smoothly to read updated product
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-950 flex-none relative">
                              <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex flex-col justify-between py-1 min-w-0">
                              <div className="space-y-1 min-w-0">
                                <h4 className="text-xs font-bold text-white truncate group-hover:text-[#FF8C00] transition-colors">
                                  {p.title}
                                </h4>
                                <p className="text-[10px] text-zinc-400 line-clamp-2">
                                  {p.description}
                                </p>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-mono font-semibold pt-1">
                                <span className="text-amber-500">{p.price.toLocaleString()} {p.currency || "USD"}</span>
                                <span className="text-zinc-500 flex items-center gap-1">
                                  <Heart className="w-2.5 h-2.5 text-zinc-650" /> {numLikes}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>

                  {/* Endless scrolling infinite stream simulator */}
                  {allProducts.filter(p => p.id !== selectedProduct.id && p.category === selectedProduct.category).length > similarLimit ? (
                    <div className="py-8 text-center space-y-4 border-t border-white/5">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
                        Flux d'articles similaires disponible en continu ({selectedProduct.category})
                      </p>
                      <button
                        onClick={() => setSimilarLimit(prev => prev + 4)}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 border border-amber-600 rounded-xl text-xs font-mono text-zinc-950 font-bold transition-all hover:scale-95 cursor-pointer"
                      >
                        ∞ Faire défiler et afficher plus de produits similaires
                      </button>
                    </div>
                  ) : (
                    <div className="py-8 text-center border-t border-white/5">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest italic">
                        Vous avez atteint la limite de notre collection exceptionnelle d'articles de type {selectedProduct.category} 🎉
                      </p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <p className="text-sm text-zinc-400">Aucun produit sélectionné.</p>
                <button
                  onClick={() => setViewMode('shop')}
                  className="px-4 py-2 bg-amber-500 text-zinc-950 rounded-xl text-xs font-bold uppercase font-mono"
                >
                  Retourner au Soko
                </button>
              </div>
            )}
          </motion.main>
        )}

        {/* SELLER STORE VIEW */}
        {viewMode === 'seller-shop' && selectedSeller && (
          <motion.main
            key="seller-shop-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8"
          >
            {(() => {
              const info = (() => {
                const name = (selectedSeller || "").toLowerCase();
                if (name.includes("mwanza") || name.includes("auto") || name.includes("motor")) {
                  return {
                    cover: "https://images.unsplash.com/photo-1562141961-b5d144297424?q=80&w=1200&auto=format&fit=crop",
                    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=200&auto=format&fit=crop",
                    sector: "Voitures de Prestige & Logistique d'Afrique Centrale",
                    bio: "Premier concessionnaire premium de Kinshasa spécialisé dans l'importation de véhicules neufs et d'occasion certifiés. Adaptabilité tout-terrain pour les routes congolaises.",
                    location: "Limete Industriel, Kinshasa (DRC)"
                  };
                } else if (name.includes("afritech") || name.includes("télécom") || name.includes("telecom") || name.includes("phone")) {
                  return {
                    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
                    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
                    sector: "Téléphonie Mobile, Tablettes & Matériel Réseau",
                    bio: "Distributeur agréé des plus grandes marques mondiales d'appareils intelligents (Apple, Samsung, Infinix). Garantie constructeur de 12 mois incluse.",
                    location: "Gombe Center, Kinshasa (DRC)"
                  };
                } else if (name.includes("isolele") || name.includes("couture") || name.includes("wax") || name.includes("mode") || name.includes("roi")) {
                  return {
                    cover: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop",
                    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
                    sector: "Haute Couture & Prêt-à-Porter Africain",
                    bio: "Maison de mode contemporaine spécialisée dans le wax, le basin et les parures d'Afrique Centrale revisitées.",
                    location: "Gombe, Kinshasa (DRC)"
                  };
                } else if (name.includes("café") || name.includes("loma") || name.includes("food") || name.includes("miel") || name.includes("ferme") || name.includes("coopérative")) {
                  return {
                    cover: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&auto=format&fit=crop",
                    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
                    sector: "Agriculture & Produits Bio du Terroir",
                    bio: "Coopérative de producteurs indépendants pour la torréfaction de café d'altitude et de miel sauvage de Kivu.",
                    location: "Goma, Nord-Kivu (DRC)"
                  };
                } else if (name.includes("ébène") || name.includes("sculp") || name.includes("art") || name.includes("bois") || name.includes("congo")) {
                  return {
                    cover: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=1200&auto=format&fit=crop",
                    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
                    sector: "Ébénisterie & Art d'Exception",
                    bio: "Atelier familial de sculpture fine sur bois d'ébène et bronze, gardien des drapes et statuettes commémoratives.",
                    location: "Lubumbashi, Haut-Katanga (DRC)"
                  };
                }
                return {
                  cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
                  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
                  sector: "Technologie & Services Digitaux",
                  bio: "Fournisseur certifié de routeurs connectés, kits d'énergie solaire ruraux et modems de communication par satellite.",
                  location: "Limete, Kinshasa (DRC)"
                };
              })();

              const sellerProducts = allProducts.filter(p => p.vendor === selectedSeller);

              return (
                <div className="space-y-8">
                  {/* Banner & Cover Row */}
                  <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-zinc-900 h-48 md:h-64 shadow-lg">
                    <img
                      src={info.cover}
                      alt={selectedSeller}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                    
                    {/* Back button */}
                    <button
                      onClick={() => {
                        setViewMode('shop');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="absolute top-4 left-4 px-4 py-2 bg-zinc-950/90 border border-white/10 text-zinc-300 hover:text-amber-500 rounded-xl text-[10.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Retourner au Soko
                    </button>
                  </div>

                  {/* Seller Profiler Card with verified indicators */}
                  <div className="relative -mt-16 md:-mt-24 px-6 md:px-10">
                    <div className="p-6 md:p-8 rounded-3xl bg-zinc-950 border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-6">
                      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <img
                          src={info.avatar}
                          alt={selectedSeller}
                          className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-amber-500 shadow-md bg-zinc-900"
                        />
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-xl md:text-3xl font-sans font-black text-white tracking-tight">
                              {selectedSeller}
                            </h1>
                            <span className="bg-amber-500 text-zinc-950 text-[8px] font-black tracking-widest font-mono uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                              <ShieldCheck className="w-3.5 h-3.5" /> Vendeur Certifié
                            </span>
                          </div>

                          <p className="text-xs text-amber-500 font-mono font-semibold">
                            {info.sector}
                          </p>

                          <p className="text-[11px] md:text-xs text-zinc-400 max-w-3xl leading-relaxed">
                            {info.bio}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-zinc-500 pt-1.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-500" /> {info.location}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> 4.9/5 (18 avis clients)
                            </span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                            <span className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="w-3.5 h-3.5 text-green-400" /> K-Trust Gold • Séquestre Actif
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {shopInitialProduct && (
                    <div className="pt-4 border-t border-white/5 space-y-4">
                      <div className="rounded-3xl border border-white/5 bg-zinc-950/40 p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
                        <img 
                          src={shopInitialProduct.image} 
                          alt={shopInitialProduct.title}
                          className="w-48 h-48 object-contain rounded-2xl bg-white p-4 shadow-xl"
                        />
                        <div className="space-y-4">
                          <h2 className="text-xl md:text-2xl font-black text-white">{shopInitialProduct.title}</h2>
                          <div className="text-2xl font-bold text-[#FF8C00]">{shopInitialProduct.price} {shopInitialProduct.currency}</div>
                          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">{shopInitialProduct.description}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(shopInitialProduct);
                            }}
                            className="px-6 py-3 bg-[#FF8C00] hover:bg-amber-500 text-black font-bold uppercase text-xs tracking-wider rounded-xl transition-colors"
                          >
                            Ajouter au panier
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Seller Catalog Title */}
                  <div className="pt-4 border-t border-white/5 space-y-1.5 mt-8">
                    <h2 className="text-sm font-sans font-black tracking-widest text-[#FF8C00] uppercase">
                      Boutique de {selectedSeller} - Articles similaires
                    </h2>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                      Achetez en toute sécurité grâce à notre séquestre fiduciaire Mobile Money.
                    </p>
                  </div>

                  {/* Seller Catalog Grid - Pinterest Style */}
                  {sellerProducts.length > 0 ? (
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
                      {sellerProducts
                        .filter(p => !shopInitialProduct || p.id !== shopInitialProduct.id)
                        .filter(p => !shopInitialProduct || p.category === shopInitialProduct.category)
                        .map((p, idx) => {
                        const heights = ["h-64", "h-80", "h-72", "h-96", "h-[280px]", "h-[400px]", "h-[320px]"];
                        const hClass = heights[idx % heights.length];
                        
                        return (
                          <div 
                            key={p.id}
                            className="break-inside-avoid relative group overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/40 p-2 text-white transition-all duration-300 hover:shadow-2xl hover:border-white/20 mb-5"
                          >
                            <div 
                              className={`relative rounded-2xl overflow-hidden cursor-pointer ${hClass}`}
                              onClick={() => {
                                setShopInitialProduct(p);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              <img 
                                src={p.image} 
                                alt={p.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-bold flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  Voir l'article
                                </span>
                              </div>
                            </div>

                            <div className="p-3.5 space-y-2">
                              <h3 
                                onClick={() => {
                                  setShopInitialProduct(p);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-xs font-black tracking-tight leading-snug truncate hover:text-[#FF8C00] transition-colors cursor-pointer"
                              >
                                {p.title}
                              </h3>
                              <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                                {p.description}
                              </p>
                              <div className="font-bold text-amber-500 text-xs">
                                {p.price} {p.currency}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center rounded-3xl bg-zinc-900/40 border border-white/5 space-y-2">
                      <AlertCircle className="w-10 h-10 text-amber-500/60 mx-auto animate-bounce" />
                      <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                        Aucun autre produit publié par ce vendeur pour le moment.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
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
              activeTheme={activeTheme}
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

        {/* FACEBOOK META-STYLE ACCOUNTS CENTER VIEW */}
        {viewMode === 'settings' && (
          <motion.div
            key="settings-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <MetaAccountsCenter
              isOpen={true}
              onClose={() => setViewMode('shop')}
              currentUser={currentUser}
              onAddProduct={(prod) => {
                setAllProducts((prev) => [prod, ...prev]);
                setFilteredProducts((prev) => [prod, ...prev]);
              }}
              language={language}
              setLanguage={setLanguage}
              activeTheme={activeTheme}
              setActiveTheme={setActiveTheme}
              THEMES={THEMES}
              activeFont={activeFont}
              setActiveFont={setActiveFont}
              FONTS={FONTS}
              permissionsState={permissionsState}
              onTogglePermission={handleTogglePermission}
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
              className={`relative ${activeTheme ? activeTheme.cardClass : "bg-zinc-900/95 border border-white/10 text-white"} p-6 rounded-3xl max-w-sm w-full shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <div className="space-y-0.5">
                  <span className={`text-[9px] font-mono tracking-widest ${activeTheme.id === 'abysses' ? 'text-cyan-400' : 'text-amber-500'} uppercase font-bold`}>KUFULULA PREFERENCES Hub</span>
                  <h3 className="text-sm font-sans font-extrabold uppercase flex items-center gap-1.5">
                    <Sliders className={`w-4 h-4 ${activeTheme.id === 'abysses' ? 'text-cyan-400' : 'text-amber-500'}`} />
                    {dict.settingsTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setIsParamsOpen(false)}
                  className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-white/5 rounded-full text-zinc-400 hover:text-white transition-all"
                  title="Fermer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Language Selection - Dropdown List */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block flex items-center gap-1.5 font-bold">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  Sélection de la langue
                </label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full bg-zinc-950/80 border border-white/10 text-white rounded-xl p-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-sans font-medium appearance-none"
                  >
                    <option value="fr" className="bg-zinc-900 text-white">Français</option>
                    <option value="en" className="bg-zinc-900 text-white">English</option>
                    <option value="sw" className="bg-zinc-900 text-white">Swahili</option>
                    <option value="lu" className="bg-zinc-900 text-white">Tshiluba</option>
                    <option value="kg" className="bg-zinc-900 text-white">Kikongo</option>
                    <option value="ln" className="bg-zinc-900 text-white">Lingala</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                    <span className="text-[9px]">▼</span>
                  </div>
                </div>
              </div>

              {/* Theme Configuration - Dropdown List */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block flex items-center gap-1.5 font-bold">
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  {dict.themeSelect}
                </label>
                <div className="relative">
                  <select
                    value={activeTheme.id}
                    onChange={(e) => {
                      const found = THEMES.find(t => t.id === e.target.value);
                      if (found) setActiveTheme(found);
                    }}
                    className="w-full bg-zinc-950/80 border border-white/10 text-white rounded-xl p-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-sans font-medium appearance-none"
                  >
                    {THEMES.map((theme) => (
                      <option key={theme.id} value={theme.id} className="bg-zinc-900 text-white">
                        {theme.name.replace(/🌳|🟢|🏺|⚡|🍊|🔲|🌊|❄️/g, "").trim()}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                    <span className="text-[9px]">▼</span>
                  </div>
                </div>
              </div>

              {/* Font typography select - Dropdown List */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block flex items-center gap-1.5 font-bold">
                  <Type className="w-3.5 h-3.5 text-emerald-400" />
                  {dict.fontSelect}
                </label>
                <div className="relative">
                  <select
                    value={activeFont.id}
                    onChange={(e) => {
                      const found = FONTS.find(f => f.id === e.target.value);
                      if (found) setActiveFont(found);
                    }}
                    className="w-full bg-zinc-950/80 border border-white/10 text-white rounded-xl p-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-sans font-medium appearance-none"
                    style={{ fontFamily: activeFont.fontFamily }}
                  >
                    {FONTS.map((font) => (
                      <option key={font.id} value={font.id} className="bg-zinc-900 text-white" style={{ fontFamily: font.fontFamily }}>
                        {font.name.replace(/⚡|🏺|🟢|🌸|🇨🇭|🍒/g, "").trim()}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                    <span className="text-[9px]">▼</span>
                  </div>
                </div>
              </div>

              {/* System Permissions and Security Access Button */}
              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setIsParamsOpen(false);
                    setShowPermissionsModal(true);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-zinc-950/90 hover:bg-zinc-900 border border-white/10 rounded-xl text-zinc-300 hover:text-white transition-all text-xs font-mono group"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-105 transition-transform" />
                    🔒 Gérer mes Autorisations & KYC
                  </span>
                  <span className="text-[10px] text-amber-500 font-extrabold tracking-wider uppercase">Gérer &gt;</span>
                </button>
              </div>

              {/* Espacement et Section Espace Marchand / Become Vendor */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-orange-500/10 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#FF8C00] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                    ESPACE MARCHAND • PRO HUB
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                    {{
                      fr: "Devenez vendeur certifié sur Kufulula Soko! Créez votre boutique moderne, configurez vos paiements et vendez en toute sécurité.",
                      en: "Become a certified vendor on Kufulula Soko! Create your modern shop, set up payouts and sell securely.",
                      sw: "Kuwa muuzaji aliyeidhinishwa kwenye Kufulula Soko! Fungua duka lako, weka njia za malipo na uuze kwa salama.",
                      ln: "Koma motekisi ya sembo na Kufulula Soko! Fungola wenze na yo, zua mbongo na yo mpe tekisa na bolingi.",
                      lu: "Shala nshandishi ku Kufulula Soko! Bulula tshitenda tshiebe, dipatula de maseke onsu.",
                      kg: "Kala nkotisi ya kieleka na Kufulula Soko! Kanga wenzo ya mbote mpe kotisa kisalu ya bosembo."
                    }[language] || "Devenez vendeur certifié sur Kufulula Soko! Créez votre boutique moderne, configurez vos paiements et vendez en toute sécurité."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsParamsOpen(false);
                      setShowMerchantPortal(true);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-zinc-950 font-mono text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    {{
                      fr: "Devenir Marchand 🚀",
                      en: "Become Vendor 🚀",
                      sw: "Kuwa Muuzaji 🚀",
                      ln: "Koma Motekisi 🚀",
                      lu: "Shala Nshandishi 🚀",
                      kg: "Kala Ntekisi 🚀"
                    }[language] || "Devenir Marchand 🚀"}
                  </button>
                </div>
              </div>

              {/* Unified buttons footer */}
              <div className="flex gap-2.5 pt-2 border-t border-white/5">
                <button
                  onClick={() => setIsParamsOpen(false)}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-black tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-95"
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

      {/* SYSTEM ACCESS & SECURITY KYC PORTAL OVERLAY */}
      <AnimatePresence>
        {showPermissionsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPermissionsModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-lg"
            />

            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              className="relative bg-zinc-950/95 border border-amber-500/20 text-white p-6 rounded-3xl max-w-md w-full shadow-2xl z-10 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="text-center space-y-1.5 pb-3 border-b border-white/10">
                <div className="w-12 h-12 bg-amber-500/15 rounded-2xl flex items-center justify-center text-amber-500 mx-auto border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-black">Sécurité & Accès</span>
                  <h3 className="text-sm font-sans font-extrabold uppercase text-zinc-100 flex items-center justify-center gap-2">
                    🔑 AUTORISATIONS SYSTEME & KYC
                  </h3>
                </div>
                <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  Autorisez de manière persistante les modules matériels de KUFULULA.cd pour ce navigateur afin d can commercer l'esprit tranquille.
                </p>
              </div>

              {/* Scrollable list of permissions checkboxes/toggles */}
              <div className="space-y-2 max-h-[48vh] overflow-y-auto pr-1">
                {/* 1. Camera */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Caméra Physique</p>
                      <p className="text-[10px] text-zinc-500 leading-snug">Scans de Codes QR & KYC Face instantané</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePermission('camera')}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${permissionsState.camera ? 'bg-amber-500' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${permissionsState.camera ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* 2. Microphone */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Microphone (Audio)</p>
                      <p className="text-[10px] text-zinc-500 leading-snug">Filtres vocaux & marchand intelligent</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePermission('microphone')}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${permissionsState.microphone ? 'bg-amber-500' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${permissionsState.microphone ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* 3. Geo-localisation */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Géo-localisation</p>
                      <p className="text-[10px] text-zinc-500 leading-snug">Calcul de frais Mobile Money & points relais</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePermission('geolocation')}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${permissionsState.geolocation ? 'bg-amber-500' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${permissionsState.geolocation ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* 4. Notification */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Notifications Système</p>
                      <p className="text-[10px] text-zinc-500 leading-snug">Alertes de livraison, séquestre & offres</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePermission('notifications')}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${permissionsState.notifications ? 'bg-amber-500' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${permissionsState.notifications ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* 5. Auto installation */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/10 text-pink-400 rounded-xl">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Auto-Installation</p>
                      <p className="text-[10px] text-zinc-500 leading-snug">Raccourci PWA & exécution ultra-rapide</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePermission('autoinstall')}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${permissionsState.autoinstall ? 'bg-amber-500' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${permissionsState.autoinstall ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* 6. KYC Security */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Sécurité & KYC Civil</p>
                      <p className="text-[10px] text-zinc-500 leading-snug">Escrow biométrique anti-fraude d'identité</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePermission('kyc')}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${permissionsState.kyc ? 'bg-amber-500' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${permissionsState.kyc ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* 7. Media apps */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Applications Médias</p>
                      <p className="text-[10px] text-zinc-500 leading-snug">Lecteurs audio & flux culturels congolais</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePermission('media')}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${permissionsState.media ? 'bg-amber-500' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${permissionsState.media ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Dual Actions Footer Block */}
              <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleSaveAllPermissions(true)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-black tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Tout Activer & Commencer
                </button>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveAllPermissions(false)}
                    className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 rounded-xl text-zinc-300 hover:text-white text-xs font-mono border border-white/5 whitespace-nowrap active:scale-95"
                  >
                    Enregistrer la Sélection
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPermissionsModal(false)}
                    className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-400 text-xs font-mono rounded-xl border border-white/5 active:scale-95"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MERCHAND VENDOR ONBOARDING PORTAL (Alibaba Design & 10 Certified Steps) */}
      <AnimatePresence>
        {showMerchantPortal && (
          <MerchantVendorPortal
            currentUser={adminUser}
            lang={language}
            onClose={() => setShowMerchantPortal(false)}
            onSuccess={(newProduct) => {
              setShowMerchantPortal(false);
              loadCatalog();
              loadSessionAuth();
              if (newProduct) {
                setAllProducts(prev => [newProduct, ...prev]);
                setFilteredProducts(prev => [newProduct, ...prev]);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* BOOK EXCERPT MODAL */}
      <AnimatePresence>
        {excerptBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-amber-500/30 rounded-3xl p-6 max-w-xl w-full relative overflow-hidden text-left"
            >
              <button
                onClick={() => setExcerptBook(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                  <span className="text-2xl">📖</span>
                  <div>
                    <h3 className="text-sm font-mono font-black text-amber-500 uppercase">
                      {excerptBook === 'zaire' ? "ZAIÏRE : Le Prince du Kongo" : "WOLF OF CONGO : Le Prince de Kinshasa"}
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono">Lecture de l'extrait officiel</p>
                  </div>
                </div>

                <div className="text-zinc-300 text-xs md:text-sm leading-relaxed font-serif max-h-[300px] overflow-y-auto pr-2 space-y-3 italic select-none">
                  {excerptBook === 'zaire' ? (
                    <>
                      <p>"Au cœur de la forêt équatoriale, là où le fleuve Congo dessine une boucle majestueuse, l'ancien Royaume des Pindi gardait jalousement ses mystères.</p>
                      <p>Le Prince héritier s'avança devant l'autel de pierre. Dans sa main droite reposait le Collier du Destin, hérité de ses ancêtres. Les saphirs gravés d'écritures précoloniales pulsaient d'un éclat d'un autre monde.</p>
                      <p>— 'Le récit ne sera plus jamais écrit par d'autres,' murmura-t-il, alors que la double signature de l'accord s'illuminait au-dessus des eaux.'"</p>
                    </>
                  ) : (
                    <>
                      <p>"Grandir à Kinshasa n'est pas seulement apprendre à vivre ; c'est apprendre à danser sous l'orage.</p>
                      <p>Éloigné du confort douillet, j'ai vu la persévérance briller dans les yeux de ma mère chaque soir de retard systémique. C'est de là, des poussières rouges des rues populeuses, que s'est éveillée l'intégrité de ma destinée royale.</p>
                      <p>La royauté n'est pas une question de couronne dorée, mais de fardeau de responsabilité partagée pour élever tout un peuple vers la lumière de la souveraineté complète."</p>
                    </>
                  )}
                </div>

                <div className="border-t border-white/5 pt-4 text-center">
                  <p className="text-[10px] text-zinc-500 font-mono mb-2">
                    Commandez la version intégrale en séquestre Mobile Money direct.
                  </p>
                  <button
                    onClick={() => setExcerptBook(null)}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-mono text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
                  >
                    Fermer l'extrait
                  </button>
                </div>
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
                  <div className="flex flex-col gap-1.5 text-[11px] font-mono text-center pt-2">
                    <button
                      onClick={() => handleSelectSimulatedVoiceQuery("mwinda solar")}
                      className="px-3 py-2 rounded bg-zinc-950 border border-white/5 text-amber-400 hover:border-amber-500 transition flex items-center justify-center gap-2"
                    >
                      <Mic className="w-3.5 h-3.5 text-amber-500" /> "Mwinda Solaire"
                    </button>
                    <button
                      onClick={() => handleSelectSimulatedVoiceQuery("Coffee Reserve")}
                      className="px-3 py-2 rounded bg-zinc-950 border border-white/5 text-amber-400 hover:border-amber-500 transition flex items-center justify-center gap-2"
                    >
                      <Mic className="w-3.5 h-3.5 text-amber-500" /> "Café de Kasai"
                    </button>
                    <button
                      onClick={() => handleSelectSimulatedVoiceQuery("Légende Kongo")}
                      className="px-3 py-2 rounded bg-zinc-950 border border-white/5 text-amber-400 hover:border-amber-500 transition flex items-center justify-center gap-2"
                    >
                      <Mic className="w-3.5 h-3.5 text-amber-500" /> "Livre Dynastie Kongo"
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

      {/* AI GOOGLE LENS MOUNT & HANDLERS MODAL */}
      <AnimatePresence>
        {showAiLensModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              onClick={handleCloseAiLens}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-3xl w-full text-white z-10 shadow-2xl space-y-4 overflow-y-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    KUFULULA GOOGLE LENS AI
                  </h3>
                </div>
                <button 
                  onClick={handleCloseAiLens}
                  className="text-zinc-550 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Status Information */}
              <p className="text-[11.5px] text-zinc-400 leading-normal">
                Prenez une photo en direct, importez un fichier image, ou utilisez l'un des presets de démonstration ci-dessous pour lancer une analyse visuelle intelligente via <strong className="text-cyan-400">Gemini AI / Google Lens</strong> et rechercher automatiquement un produit correspondant au catalogue !
              </p>

              {aiLensError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{aiLensError}</span>
                </div>
              )}

              {/* MAIN RECTANGLE VIEWS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* STAGE A: Camera / Capture Frame */}
                <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden aspect-video relative flex flex-col justify-between p-3">
                  
                  {/* Floating corners decorative frame */}
                  <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-400" />

                  {/* Rendering Content (Live camera, upload snapshot or scan matching results) */}
                  {aiLensScanStatus === 'scanning' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 z-20 bg-zinc-950/80 animate-fade-in">
                      <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 animate-pulse">
                        ANALYSE EN COURS PAR GEMINI AI...
                      </p>
                      {/* Laser sweep animation line */}
                      <div className="absolute left-0 w-full h-1 bg-cyan-400/50 blur-[3px] animate-bounce top-1/2" />
                    </div>
                  ) : null}

                  {aiLensCapturedImage ? (
                    <img 
                      src={aiLensCapturedImage} 
                      alt="Captured Preview" 
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : aiCameraStream ? (
                    <video 
                      ref={aiVideoRef}
                      autoPlay 
                      playsInline 
                      muted
                      className="absolute inset-0 h-full w-full object-cover filter brightness-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-zinc-600 text-xs">
                      <Camera className="w-12 h-12 stroke-[1] mb-2 text-zinc-800 animate-bounce" />
                      Caméra inactive ou permission restreinte.
                    </div>
                  )}

                  {/* Controls on camera stage */}
                  <div className="relative z-10 mt-auto flex justify-between w-full">
                    {aiCameraStream && !aiLensCapturedImage ? (
                      <button
                        type="button"
                        onClick={handleCaptureAiPhoto}
                        className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-500 text-zinc-950 text-[10px] font-mono font-black uppercase rounded-lg shadow transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        Capture d'écran <Camera className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                    
                    {aiLensCapturedImage ? (
                      <button
                        type="button"
                        onClick={() => setAiLensCapturedImage(null)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-mono font-black uppercase rounded-lg shadow transition-all active:scale-95 ml-auto"
                      >
                        Annuler la photo x
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* STAGE B: Visual Matching Result / Action */}
                <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative">
                  
                  {/* Results Display */}
                  {aiLensScanStatus === 'matched' && aiLensResult ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-3 text-center md:text-left h-full flex flex-col justify-center"
                    >
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono font-extrabold uppercase tracking-wider mx-auto md:mx-0">
                        <Check className="w-3.5 h-3.5 animate-bounce" />
                        IDENTIFICATION RECONNUE • CIBLÉ !
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-white hover:text-cyan-400 font-sans tracking-tight leading-snug">
                          {aiLensResult.primaryObject}
                        </h4>
                        <div className="flex flex-wrap gap-1.5 justify-center md:justify-start pt-1.5">
                          <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md uppercase font-bold">
                            Catégorie : {aiLensResult.detectedCategory}
                          </span>
                          <span className="text-[9px] font-mono bg-white/5 text-zinc-400 border border-white/5 px-2 py-0.5 rounded-md font-bold">
                            Précision : {aiLensResult.confidenceScore}%
                          </span>
                        </div>
                      </div>

                      <p className="text-[11.5px] text-zinc-400 leading-relaxed italic border-l-2 border-cyan-400/50 pl-3 pt-1">
                        "{aiLensResult.description}"
                      </p>

                      <div className="pt-2 text-center text-[10px] font-mono text-zinc-550 animate-pulse uppercase tracking-wider">
                        Filtrage du catalogue actif ... redirection en cours !
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col justify-center space-y-3">
                      <div>
                        <span className="text-[9px] text-zinc-550 font-mono font-bold block uppercase tracking-widest leading-none">ÉTAPE ACTIVE</span>
                        <h4 className="text-xs font-mono font-bold text-zinc-350 pt-0.5">Soumettre la photo à l'I.A.</h4>
                      </div>
                      
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Une fois que vous avez enregistré une capture d'écran, importé un fichier image de votre appareil, ou sélectionné l'un de nos presets ci-dessous, lancez la recherche intelligente en un clic !
                      </p>

                      {selectedLensPreset && (
                        <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-1 flex items-center gap-3">
                          <img 
                            src={LENS_PHOTO_PRESETS.find(p => p.id === selectedLensPreset)?.image}
                            alt="Preset preview"
                            className="w-10 h-10 object-cover rounded-lg border border-white/10"
                          />
                          <div>
                            <span className="text-[9px] font-mono text-cyan-400 uppercase font-black tracking-wider block">PRESET ASSIGNÉ</span>
                            <span className="text-xs text-white font-extrabold">{LENS_PHOTO_PRESETS.find(p => p.id === selectedLensPreset)?.name}</span>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={(!aiLensCapturedImage && !selectedLensPreset) || aiLensScanStatus === 'scanning'}
                        onClick={handleTriggerAiLensSearch}
                        className="w-full py-3 px-4 bg-cyan-400 hover:bg-cyan-500 text-zinc-950 rounded-xl font-mono text-xs font-black tracking-wider uppercase transition-all disabled:opacity-20 flex items-center justify-center gap-2 shadow-md shadow-cyan-400/10 active:scale-95"
                      >
                        <Compass className="w-4 h-4 text-zinc-950 animate-pulse" />
                        Lancer l'Analyse Visuelle (Lens)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* DEMO PHOTO SAMPLES RAIL */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase block font-bold text-center md:text-left">
                  🌟 EXEMPLES DE PRISES DE VUE (SANS BESOIN DE CAMÉRA PHYSIQUE)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {LENS_PHOTO_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedLensPreset(p.id);
                        setAiLensCapturedImage(null);
                        setAiLensError(null);
                      }}
                      className={`relative flex flex-col items-stretch text-left rounded-xl p-2 bg-zinc-950/50 border transition-all hover:bg-zinc-950/85 ${
                        selectedLensPreset === p.id 
                          ? "border-cyan-400 ring-1 ring-cyan-400 bg-zinc-950" 
                          : "border-white/5"
                      }`}
                    >
                      <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-black mb-1.5 relative">
                        <img 
                          src={p.image} 
                          alt={p.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-1 right-1 px-1 bg-black/80 border border-white/10 text-[7px] font-mono text-zinc-400 rounded-sm">
                          {p.category}
                        </span>
                      </div>
                      <div className="space-y-0.5 leading-none">
                        <span className="text-[10px] font-black text-zinc-200 line-clamp-1 block">{p.name}</span>
                        <span className="text-[8px] font-mono text-zinc-500 line-clamp-1 block">{p.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex gap-3 justify-end pt-2 border-t border-white/5 text-xs font-mono">
                {/* File Upload Trigger */}
                <label className="px-4 py-2.5 bg-[#FF8C00]/10 border border-[#FF8C00]/30 hover:bg-[#FF8C00] hover:text-zinc-950 text-[#FF8C00] rounded-xl text-center font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-95">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAiLensFileUpload}
                    className="hidden"
                  />
                  <span>📁 Charger un fichier</span>
                </label>

                <button
                  type="button"
                  onClick={handleCloseAiLens}
                  className="px-5 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-950 font-bold rounded-xl transition-colors"
                >
                  Fermer
                </button>
              </div>
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
                  className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                    qrTab === 'scan' 
                      ? "bg-[#FF8C00] text-zinc-950 shadow-md animate-pulse" 
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Scanneur QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setQrTab('create')}
                  className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                    qrTab === 'create' 
                      ? "bg-[#FF8C00] text-zinc-950 shadow-md" 
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Créateur QR Code
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
                          className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-white/5 text-amber-500 rounded-lg hover:border-amber-400 flex items-center gap-1.5"
                        >
                          <Flame className="w-3.5 h-3.5" /> QR Énergie MOTO Solaire
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrCreatorText("coupon:KUFULULA20")}
                          className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-white/5 text-[#FF8C00] rounded-lg hover:border-[#FF8C00] flex items-center gap-1.5"
                        >
                          <Ticket className="w-3.5 h-3.5" /> QR Coupon Réduction -20$
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrCreatorText("action:support-chat")}
                          className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-white/5 text-green-400 rounded-lg hover:border-green-400 flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> QR Assistant Discussion
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
      <div className="fixed bottom-0 inset-x-0 z-40 bg-zinc-950/10 pointer-events-none pb-2">
        <div className="max-w-md mx-auto px-4 pointer-events-auto">
          <div className={`transition-all duration-300 rounded-2xl h-16 flex items-center justify-around px-4 shadow-2xl relative ${
            activeTheme.id === 'sahel-noir'
              ? 'bg-zinc-950/90 border border-emerald-500/40 text-white'
              : activeTheme.id === 'terracotta-clay'
              ? 'bg-white/95 border border-[#E8DFD0] text-[#4E2A25]'
              : activeTheme.id === 'urban-brutalist'
              ? 'bg-white border-2 border-black text-black'
              : activeTheme.id === 'abysses'
              ? 'bg-[#021424]/95 border border-cyan-500/35 text-white shadow-[0_0_20px_rgba(34,211,238,0.15)] backdrop-blur-md'
              : activeTheme.id === 'glass-water'
              ? 'backdrop-blur-md bg-white/40 border border-white/60 text-zinc-800 shadow-lg'
              : 'bg-zinc-950/80 border border-white/10 backdrop-blur-md text-white'
          }`}>
            
            {/* Dock Item 1: Accueil */}
            <button
               id="nav-btn-home"
              onClick={() => setViewMode('shop')}
              className={`flex flex-col items-center gap-1 transition-all select-none ${
                viewMode === 'shop' 
                  ? (activeTheme.id === 'abysses' ? "text-cyan-400 scale-105 font-bold" : activeTheme.id === 'glass-water' ? "text-slate-800 scale-105 font-bold" : "text-[#FF8C00] scale-105 font-bold") 
                  : "text-zinc-500 hover:text-white"
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
                viewMode === 'favorites' 
                  ? (activeTheme.id === 'abysses' ? "text-cyan-400 scale-105 font-bold" : activeTheme.id === 'glass-water' ? "text-slate-800 scale-105 font-bold" : "text-[#FF8C00] scale-105 font-bold") 
                  : "text-zinc-500 hover:text-white"
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
                viewMode === 'chat' 
                  ? (activeTheme.id === 'abysses' ? "text-cyan-400 scale-105 font-bold" : activeTheme.id === 'glass-water' ? "text-slate-800 scale-105 font-bold" : "text-[#FF8C00] scale-105 font-bold") 
                  : "text-zinc-500 hover:text-white"
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
                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all outline-none ${
                  activeTheme.id === 'sahel-noir'
                    ? 'text-black bg-[#00FF66] border-4 border-zinc-950 hover:bg-green-400'
                    : activeTheme.id === 'terracotta-clay'
                    ? 'text-white bg-[#8F3E2B] border-4 border-white hover:bg-[#A34B38]'
                    : activeTheme.id === 'urban-brutalist'
                    ? 'text-white bg-black border-4 border-white hover:bg-neutral-800'
                    : activeTheme.id === 'abysses'
                    ? 'text-zinc-950 bg-cyan-400 border-4 border-slate-950 hover:bg-cyan-300'
                    : activeTheme.id === 'glass-water'
                    ? 'text-white bg-slate-500 border-4 border-white hover:bg-slate-650 shadow-md'
                    : 'text-zinc-950 bg-[#FF8C00] border-4 border-zinc-950 hover:bg-amber-500'
                }`}
                title="Scanner QR Code"
              >
                <QrCode className="w-5 h-5 stroke-[2.2] animate-pulse" />
                <span className={`text-[7.5px] font-mono font-black uppercase tracking-wider mt-0.5 leading-none ${activeTheme.id === 'glass-water' ? 'text-white' : 'text-zinc-950'}`}>QR CODE</span>
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
                viewMode === 'workspace' 
                  ? (activeTheme.id === 'sahel-noir' ? "text-emerald-400 scale-105 font-bold" : activeTheme.id === 'abysses' ? "text-cyan-400 scale-105 font-bold" : "text-green-500 scale-105 font-bold") 
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-[8px] font-mono uppercase tracking-tight">Histoire</span>
            </button>

            {/* Dock Item 7: Réglages */}
            <button
               id="nav-btn-settings"
              onClick={() => setViewMode('settings')}
              className={`flex flex-col items-center gap-1 transition-all select-none ${
                viewMode === 'settings' 
                  ? (activeTheme.id === 'abysses' ? "text-cyan-400 scale-105 font-bold" : activeTheme.id === 'glass-water' ? "text-slate-800 scale-105 font-bold" : "text-[#FF8C00] scale-105 font-bold") 
                  : "text-zinc-500 hover:text-white"
              }`}
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

      {/* Modern floating motion-toast alert indicator */}
      <AnimatePresence>
        {shareToastText && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-zinc-950/95 border border-amber-500/30 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-sans tracking-wide flex items-center gap-2.5 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span className="font-semibold">{shareToastText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LUXURIOUS FULLSCREEN TRANSITION SPLASH ON TAG CLICK */}
      <AnimatePresence>
        {activeTransitionTag && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-8 text-center ${
              activeTheme.id === 'abysses' 
                ? 'bg-[#010a12] text-white' 
                : activeTheme.id === 'glass-water'
                ? 'bg-[#e8f1f2]/95 backdrop-blur-xl text-zinc-900'
                : activeTheme.id === 'white-noir'
                ? 'bg-slate-50 text-black'
                : 'bg-zinc-950 text-white'
            }`}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 max-w-md"
            >
              <div className="relative w-20 h-20 mx-auto">
                <div className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin ${
                  activeTheme.id === 'abysses' ? 'border-cyan-400' : 'border-amber-500'
                }`} />
                <Compass className={`w-10 h-10 absolute inset-0 m-auto animate-pulse ${
                  activeTheme.id === 'abysses' ? 'text-cyan-400' : 'text-amber-500'
                }`} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                  Exploration du Soko Isolele
                </span>
                <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">
                  Flux de référence <span className={activeTheme.id === 'abysses' ? 'text-cyan-400' : 'text-amber-500'}>#{activeTransitionTag}</span>
                </h2>
                <p className="text-xs text-zinc-400 font-mono animate-pulse">
                  Filtrage et synchronisation du double séquestre...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
