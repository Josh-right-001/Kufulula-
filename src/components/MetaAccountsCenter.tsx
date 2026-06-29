import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Shield, Lock, CreditCard, Building2, Globe, Palette, Type, 
  MapPin, Camera, Check, ShieldCheck, AlertCircle, Trash, Plus, Share2, 
  TrendingUp, BarChart3, MessageSquare, Heart, Eye, Users, ChevronRight, 
  Send, Upload, Settings, ShieldAlert, BadgeCheck
} from "lucide-react";
import { Product, UserAuth } from "../types";

interface MetaAccountsCenterProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAuth | null;
  onAddProduct: (product: Product) => void;
  language: string;
  setLanguage: (lang: string) => void;
  activeTheme: any;
  setActiveTheme: (theme: any) => void;
  THEMES: any[];
  activeFont: any;
  setActiveFont: (font: any) => void;
  FONTS: any[];
  permissionsState: { camera: boolean; microphone: boolean; geolocation: boolean };
  onTogglePermission: (permission: "camera" | "microphone" | "geolocation") => void;
}

export default function MetaAccountsCenter({
  isOpen,
  onClose,
  currentUser,
  onAddProduct,
  language,
  setLanguage,
  activeTheme,
  setActiveTheme,
  THEMES,
  activeFont,
  setActiveFont,
  FONTS,
  permissionsState,
  onTogglePermission
}: MetaAccountsCenterProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "personal-info" | "security" | "google-pay" | "onboarding" | "vendor-dashboard" | "preferences"
  >("profile");

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState(() => {
    const saved = localStorage.getItem("k_personal_info");
    return saved ? JSON.parse(saved) : {
      fullName: currentUser?.displayName || "Kabamba Jean-Paul",
      email: currentUser?.email || "jp.kabamba@kufulula.cd",
      phone: "+243 821 908 678",
      address: "72, Avenue de la République, Quartier Royal, Gombe, Kinshasa",
      region: "RDC (République Démocratique du Congo)"
    };
  });

  const handlePersonalInfoChange = (field: keyof typeof personalInfo, value: string) => {
    const newInfo = { ...personalInfo, [field]: value };
    setPersonalInfo(newInfo);
    localStorage.setItem("k_personal_info", JSON.stringify(newInfo));
  };

  // Merchant State
  const [isMerchantVerified, setIsMerchantVerified] = useState(() => {
    return localStorage.getItem("k_merchant_verified") === "true";
  });

  // Onboarding Steps State
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [scannedDoc, setScannedDoc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedData, setScannedData] = useState<any | null>(null);

  // Form State for Professional Account Onboarding
  const [companyName, setCompanyName] = useState("");
  const [rccmNumber, setRccmNumber] = useState("");
  const [businessType, setBusinessType] = useState("Automobile");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");

  // Form State for Posting New Product
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("Electronics");
  const [newDesc, setNewDesc] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [productPostSuccess, setProductPostSuccess] = useState(false);

  // Comments/Reviews List on Merchant Dashboard
  const [commentsList, setCommentsList] = useState([
    { id: "cm-1", user: "Kabamba Jean-Paul", rating: 5, comment: "Le séquestre KUFULULA m'a sauvé ! Expérience d'achat automobile parfaite.", date: "Il y a 2 heures", status: "Approved" },
    { id: "cm-2", user: "Mwanza Chantal", rating: 4, comment: "Le téléphone Infinix correspond exactement à la description, livraison soignée.", date: "Il y a 1 jour", status: "Approved" },
    { id: "cm-3", user: "Ilunga Samuel", rating: 5, comment: "Livraison rapide à Lubumbashi via le pont Ruzizi. Très professionnel !", date: "Il y a 3 jours", status: "Pending" }
  ]);

  // Page Followers / Likes List
  const [followers, setFollowers] = useState([
    { id: "fol-1", name: "Mukendi Samuel", location: "Kinshasa Gombe", likedProduct: "Toyota Land Cruiser Prado", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop", following: false },
    { id: "fol-2", name: "Kavira Alice", location: "Goma, Nord-Kivu", likedProduct: "Infinix Zero 30", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop", following: true },
    { id: "fol-3", name: "Ngoy Benjamin", location: "Lubumbashi", likedProduct: "Buste Perlé Masque Kongo", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop", following: false }
  ]);

  // Google Pay / Wallet Cards
  const [walletCards, setWalletCards] = useState([
    { id: "card-1", type: "VISA", last4: "8839", holder: "KABAMBA JEAN-PAUL", exp: "12/28", color: "from-blue-600 to-indigo-800", provider: "Rawbank DRC" },
    { id: "card-2", type: "MASTERCARD", last4: "4092", holder: "KABAMBA JEAN-PAUL", exp: "06/27", color: "from-zinc-800 to-zinc-950", provider: "Equity BCDC" }
  ]);
  const [mobileMoneyAccounts, setMobileMoneyAccounts] = useState([
    { id: "mm-1", type: "M-PESA", phone: "+243 821 908 678", name: "KUFULULA Direct" },
    { id: "mm-2", type: "ORANGE MONEY", phone: "+243 897 500 231", name: "KUFULULA Escrow" }
  ]);

  useEffect(() => {
    if (isMerchantVerified) {
      setActiveTab("vendor-dashboard");
    }
  }, [isMerchantVerified]);

  // Document scan simulation (using Google Document AI)
  const handleStartScan = (docType: string) => {
    setIsScanning(true);
    setScanProgress(0);
    setScannedDoc(docType);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          // Set Scanned Data
          setScannedData({
            name: "KABAMBA JEAN-PAUL",
            idNumber: docType === "ID" ? "DRC-ID-98721389-A" : "DRC-PP-109283-F",
            birthday: "12/04/1988",
            origin: "Kinshasa, RDC",
            authority: "Ministère de l'Intérieur et de la Sécurité"
          });
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem("k_merchant_verified", "true");
    setIsMerchantVerified(true);
    setActiveTab("vendor-dashboard");
  };

  const handlePostProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    const imgUrl = newImageUrl.trim() || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop";

    const customProd: Product = {
      id: `prod-custom-${Date.now()}`,
      title: newTitle,
      description: newDesc || `Produit officiel de ${companyName || "Mon Espace Vendeur"}. Qualité garantie par KUFULULA.`,
      price: parseFloat(newPrice),
      currency: "USD",
      image: imgUrl,
      category: newCategory,
      stock: 45,
      vendor: companyName || "Mon Espace Vendeur",
      tags: ["Onboarded", "Local", newCategory],
      isDraft: false,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddProduct(customProd);
    setNewTitle("");
    setNewPrice("");
    setNewDesc("");
    setNewImageUrl("");
    setProductPostSuccess(true);
    setTimeout(() => setProductPostSuccess(false), 4000);
  };

  const handleToggleFollow = (id: string) => {
    setFollowers(prev => prev.map(f => f.id === id ? { ...f, following: !f.following } : f));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-zinc-950 border border-white/10 rounded-3xl max-w-6xl w-full h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]"
        style={{ fontFamily: activeFont.fontFamily }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-full text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SIDEBAR NAVIGATION (Meta Accounts Center Style) */}
        <div className="w-full md:w-80 bg-zinc-900/50 border-b md:border-b-0 md:border-r border-white/10 p-5 flex flex-col gap-6 overflow-y-auto shrink-0">
          {/* Header Branding */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white text-lg font-black tracking-tighter">
                K
              </div>
              <div>
                <h2 className="text-sm font-sans font-black text-white uppercase tracking-tight">
                  Espace Comptes
                </h2>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  KUFULULA SERVICES
                </p>
              </div>
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal font-sans pt-1">
              Gérez vos identités, informations de paiement, audits de sécurité et activités de commerce.
            </p>
          </div>

          {/* Nav List */}
          <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 scrollbar-none shrink-0">
            {[
              { id: "profile", label: "Votre Profil Soko", icon: <User className="w-4 h-4" /> },
              { id: "personal-info", label: "Infos Personnelles", icon: <Lock className="w-4 h-4" /> },
              { id: "security", label: "Sécurité & Accès", icon: <Shield className="w-4 h-4" /> },
              { id: "google-pay", label: "Google Pay Wallet", icon: <CreditCard className="w-4 h-4" /> },
              ...(!isMerchantVerified 
                ? [{ id: "onboarding", label: "Onboarding Vendeur", icon: <Building2 className="w-4 h-4 text-amber-500" /> }]
                : [{ id: "vendor-dashboard", label: "Portail Vendeur", icon: <Building2 className="w-4 h-4 text-emerald-500" /> }]
              ),
              { id: "preferences", label: "Réglages Système", icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-3 rounded-2xl text-[11px] font-bold tracking-tight text-left flex items-center gap-3 transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-blue-600/15 border border-blue-500/30 text-blue-400"
                    : "border border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex mt-auto items-center gap-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest border-t border-white/5 pt-4">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> K-Shield Protection
          </div>
        </div>

        {/* MAIN PANEL CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-950 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* TAB CONTENT: PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" /> Profil Soko Certifié
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                    Identité vérifiée sur le réseau KUFULULA RDC
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/5 flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                      alt="Avatar"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-md bg-zinc-800"
                    />
                    <span className="absolute -bottom-1.5 -right-1.5 bg-blue-500 text-white p-1 rounded-full border-2 border-zinc-950 shadow">
                      <BadgeCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="space-y-1.5 text-center sm:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h4 className="text-base font-sans font-black text-white uppercase">
                        Kabamba Jean-Paul
                      </h4>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black tracking-widest font-mono uppercase px-2 py-0.5 rounded-full border border-emerald-500/25">
                        Compte Actif
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-400">
                      jp.kabamba@kufulula.cd • +243 821 908 678
                    </p>
                    <p className="text-[10px] text-zinc-500 leading-normal max-w-lg">
                      Inscrit depuis Juin 2026. Utilisateur de confiance Gold. Double séquestre physique validé avec 100% de taux de négociation pacifiée.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-1">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase">Solde Escrow Actif</p>
                    <p className="text-xl font-mono font-black text-emerald-400">$2,450.00 USD</p>
                    <p className="text-[9px] text-zinc-500 leading-snug">Fonds garantis par double verrou KUFULULA direct</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-1">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase">Mode de réception</p>
                    <p className="text-base font-sans font-extrabold text-white">M-PESA / Orange Money</p>
                    <p className="text-[9px] text-zinc-500 leading-snug">Payouts directs instantanés à Kinshasa</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PERSONAL INFO */}
            {activeTab === "personal-info" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-500" /> Informations Personnelles
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                    Données d'identité légale et de facturation sécurisées
                  </p>
                </div>

                <div className="space-y-3.5">
                  {[
                    { key: "fullName", label: "Nom complet officiel", type: "text" },
                    { key: "email", label: "Adresse e-mail de contact", type: "email" },
                    { key: "phone", label: "Numéro de téléphone mobile money", type: "tel" },
                    { key: "address", label: "Adresse physique de livraison", type: "text" },
                    { key: "region", label: "Région fiscale principale", type: "text" }
                  ].map((info) => (
                    <div key={info.key} className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/10 transition-colors">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider shrink-0 w-1/3">{info.label}</span>
                      <input 
                        type={info.type}
                        value={personalInfo[info.key as keyof typeof personalInfo]}
                        onChange={(e) => handlePersonalInfoChange(info.key as keyof typeof personalInfo, e.target.value)}
                        className="w-full sm:w-2/3 text-xs font-sans font-bold text-white bg-zinc-950/50 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-left sm:text-right"
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex justify-end">
                  <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
                    <Check className="w-4 h-4" /> Sauvegarder les modifications
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SECURITY */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" /> Sécurité & Audit d'Accès
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                    Protection de compte et sessions actives
                  </p>
                </div>

                <div className="p-4 rounded-3xl bg-zinc-900/60 border border-emerald-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-black uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Score de Sécurité : 98.5% Élevé
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                    Votre compte est protégé par la double authentification biométrique et la validation de clé matérielle LUKASA en wengé.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono text-[#FF8C00] uppercase tracking-widest font-black">
                    SESSIONS ACTIVES EN COURS
                  </h4>
                  <div className="space-y-2">
                    {[
                      { device: "Chrome sur macOS • Kinshasa Gombe", status: "Session active actuelle", time: "Maintenant" },
                      { device: "Safari sur iPhone 15 • Goma", status: "Vérifié via M-PESA 2FA", time: "Il y a 3 heures" }
                    ].map((session, idx) => (
                      <div key={idx} className="p-3 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{session.device}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{session.status}</p>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-lg">
                          {session.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: GOOGLE PAY WALLET */}
            {activeTab === "google-pay" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" /> Google Pay Wallet API
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                    Gérez vos cartes virtuelles et portefeuilles mobiles
                  </p>
                </div>

                {/* Google Pay Wallet Banner */}
                <div className="bg-gradient-to-r from-blue-700/20 via-indigo-900/20 to-zinc-900 border border-blue-500/20 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
                  <div className="space-y-1">
                    <span className="bg-blue-500 text-zinc-950 text-[8px] font-black tracking-widest font-mono uppercase px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                      GOOGLE WALLET API NATIVE
                    </span>
                    <h4 className="text-sm font-sans font-extrabold text-white uppercase tracking-tight">
                      Intégration d'écosystème financier sécurisé
                    </h4>
                    <p className="text-[10px] text-zinc-400 max-w-md font-sans">
                      Ajoutez instantanément vos cartes ou portefeuilles pour effectuer des paiements automatiques rapides lors de l'achat des produits ou livres.
                    </p>
                  </div>
                  <button className="px-4 py-2.5 bg-white text-zinc-950 font-mono text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
                    <Plus className="w-4 h-4" /> Ajouter à G-Pay
                  </button>
                </div>

                {/* Credit Cards Grid */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-black">
                    CARTES DE CRÉDIT ENREGISTRÉES
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {walletCards.map((card) => (
                      <div key={card.id} className={`p-5 rounded-3xl bg-gradient-to-br ${card.color} border border-white/10 text-white flex flex-col justify-between h-40 shadow-xl relative overflow-hidden group`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                        <div className="flex justify-between items-start z-10">
                          <div>
                            <p className="text-[9px] font-mono text-white/60 tracking-wider uppercase">{card.provider}</p>
                            <p className="text-xs font-bold font-mono tracking-tight">{card.type}</p>
                          </div>
                          <span className="text-[10px] font-black tracking-widest font-mono bg-white/10 px-2 py-0.5 rounded-md uppercase">G-PAY</span>
                        </div>
                        <div className="z-10 mt-4">
                          <p className="text-lg font-mono font-black tracking-widest">•••• •••• •••• {card.last4}</p>
                        </div>
                        <div className="flex justify-between items-end z-10 pt-2 border-t border-white/5">
                          <div>
                            <p className="text-[8px] font-mono text-white/50 uppercase">Titulaire</p>
                            <p className="text-[10px] font-mono font-bold tracking-tight truncate">{card.holder}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-mono text-white/50 uppercase">Validité</p>
                            <p className="text-[10px] font-mono font-bold">{card.exp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Money Direct Links */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-mono text-[#FF8C00] uppercase tracking-widest font-black">
                    SÉQUESTRES MOBILE MONEY LIÉS
                  </h4>
                  <div className="space-y-2">
                    {mobileMoneyAccounts.map((mm) => (
                      <div key={mm.id} className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center text-[10px] font-black font-mono border border-white/10 text-[#FF8C00]">
                            {mm.type}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-white uppercase">{mm.type} Direct</p>
                            <p className="text-[10px] text-zinc-500 font-mono">{mm.phone}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase font-black">
                          Prêt à l'Escrow
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: MERCHANT ONBOARDING (Google AI scan ID card) */}
            {activeTab === "onboarding" && !isMerchantVerified && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-500 animate-pulse" /> Enregistrement Vendeur Certifié
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                    Processus professionnel obligatoire sécurisé par Google Document AI
                  </p>
                </div>

                {/* Steps Indicator */}
                <div className="flex gap-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        onboardingStep >= step ? "bg-amber-500" : "bg-zinc-800"
                      }`}
                    />
                  ))}
                </div>

                {/* Step 1: Company Details */}
                {onboardingStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-sans font-black text-white uppercase tracking-tight">
                        Étape 1: Profil Professionnel de la Boutique
                      </h4>
                      <p className="text-[10px] text-zinc-500 leading-normal font-sans">
                        Renseignez les détails officiels de votre commerce enregistré en République Démocratique du Congo.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-black">Nom de l'entreprise</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Ex: Mwanza Auto Motors"
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-sans font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-black">Numéro RCCM RDC</label>
                        <input
                          type="text"
                          value={rccmNumber}
                          onChange={(e) => setRccmNumber(e.target.value)}
                          placeholder="Ex: CD/KIN/RCCM/24-B-9981"
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-sans font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-black">Domaine / Secteur principal</label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-sans font-medium"
                        >
                          <option value="Automobile">Automobile & Concessionnaire</option>
                          <option value="Téléphonie">Téléphonie & Électronique</option>
                          <option value="Couture">Haute Couture & Mode</option>
                          <option value="Librairie">E-Books & Éducation</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-black">Numéro de téléphone professionnel</label>
                        <input
                          type="text"
                          value={businessPhone}
                          onChange={(e) => setBusinessPhone(e.target.value)}
                          placeholder="Ex: +243 821 908 678"
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-sans font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase font-black">Adresse du Siège Social</label>
                      <input
                        type="text"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="Ex: 72, Avenue de la République, Gombe, Kinshasa"
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-sans font-medium"
                      />
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => setOnboardingStep(2)}
                        disabled={!companyName || !rccmNumber}
                        className="px-6 py-2.5 bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-mono text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        Passer à l'Étape 2 &gt;
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Upload Doc or Scanning */}
                {onboardingStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-sans font-black text-white uppercase tracking-tight">
                        Étape 2: Validation d'Identité via Google AI Scanner
                      </h4>
                      <p className="text-[10px] text-zinc-500 leading-normal font-sans">
                        Sélectionnez ou téléchargez un document d'identité officiel de la RDC pour vérification instantanée.
                      </p>
                    </div>

                    {!scannedDoc ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => handleStartScan("ID")}
                          className="p-6 rounded-3xl bg-zinc-900/60 border border-white/5 hover:border-amber-500/20 text-center space-y-3 hover:bg-zinc-900 transition-all cursor-pointer"
                        >
                          <User className="w-8 h-8 text-amber-500 mx-auto" />
                          <div>
                            <p className="text-xs font-bold text-white uppercase">Carte d'Identité Nationale</p>
                            <p className="text-[9px] text-zinc-500 font-mono">Format physique ou scan PDF</p>
                          </div>
                        </button>
                        <button
                          onClick={() => handleStartScan("PASSPORT")}
                          className="p-6 rounded-3xl bg-zinc-900/60 border border-white/5 hover:border-amber-500/20 text-center space-y-3 hover:bg-zinc-900 transition-all cursor-pointer"
                        >
                          <Globe className="w-8 h-8 text-blue-400 mx-auto" />
                          <div>
                            <p className="text-xs font-bold text-white uppercase">Passeport RDC Électronique</p>
                            <p className="text-[9px] text-zinc-500 font-mono">Passeport biométrique valide</p>
                          </div>
                        </button>
                      </div>
                    ) : isScanning ? (
                      /* Scanning Screen with moving laser line and real time percentage */
                      <div className="relative h-64 rounded-3xl bg-zinc-950 border-2 border-dashed border-amber-500/30 overflow-hidden flex flex-col items-center justify-center space-y-4">
                        {/* Interactive scanning laser sweep bar */}
                        <motion.div
                          animate={{ y: [0, 240, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#00FF66] to-transparent shadow-[0_0_15px_#00FF66] z-10"
                        />

                        <div className="z-10 text-center space-y-2">
                          <Upload className="w-8 h-8 text-zinc-400 animate-bounce mx-auto" />
                          <p className="text-xs font-mono font-bold text-white uppercase tracking-wider animate-pulse">
                            VÉRIFICATION PAR GOOGLE CLOUD DOCUMENT AI EN COURS...
                          </p>
                          <p className="text-[9.5px] font-mono text-zinc-500 leading-normal max-w-sm mx-auto">
                            Lecture des caractères OCR, extraction de l'identité nationale et audit d'authenticité de signature d'autorité...
                          </p>
                          <p className="text-base font-mono font-black text-[#00FF66] pt-2">
                            {scanProgress}%
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Scan Success State */
                      <div className="p-5 rounded-3xl bg-zinc-900/40 border border-emerald-500/20 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-emerald-400 uppercase tracking-tight">IDENTITÉ EXTRACTÉE & VERIFIÉE PAR GOOGLE AI</p>
                            <p className="text-[9.5px] font-mono text-zinc-400">Authentification gouvernementale valide à 99.8%</p>
                          </div>
                        </div>

                        {scannedData && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-950/80 p-4 rounded-2xl border border-white/5 font-mono text-[10px]">
                            <p className="text-zinc-500 uppercase">Nom officiel : <span className="text-white font-sans font-bold">{scannedData.name}</span></p>
                            <p className="text-zinc-500 uppercase">Numéro de pièce : <span className="text-white font-sans font-bold">{scannedData.idNumber}</span></p>
                            <p className="text-zinc-500 uppercase">Date de naissance : <span className="text-white font-sans font-bold">{scannedData.birthday}</span></p>
                            <p className="text-zinc-500 uppercase">Lieu de délivrance : <span className="text-white font-sans font-bold">{scannedData.origin}</span></p>
                          </div>
                        )}

                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => { setScannedDoc(null); setScannedData(null); }}
                            className="px-4 py-2 bg-zinc-950 border border-white/5 text-zinc-400 font-mono text-[10px] font-black uppercase tracking-wider rounded-xl transition-all hover:text-white"
                          >
                            Recommencer le scan
                          </button>
                          <button
                            onClick={() => setOnboardingStep(3)}
                            className="px-5 py-2 bg-emerald-500 text-zinc-950 font-mono text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
                          >
                            Continuer &gt;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Payout and Confirm */}
                {onboardingStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-sans font-black text-white uppercase tracking-tight">
                        Étape 3: Configuration du Séquestre Mobile Money direct
                      </h4>
                      <p className="text-[10px] text-zinc-500 leading-normal font-sans">
                        Configurez votre canal préféré de réception des gains de livraison. Les fonds des clients sont consignés en séquestre.
                      </p>
                    </div>

                    <div className="p-4 rounded-3xl bg-zinc-900/40 border border-white/5 space-y-3">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Canal de réception préféré</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 bg-zinc-950 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-white uppercase">M-PESA Direct</p>
                            <p className="text-[9px] text-zinc-500 font-mono">+243 821 908 678</p>
                          </div>
                          <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-zinc-950 text-[9px] font-bold">✓</span>
                        </div>
                        <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl flex items-center justify-between opacity-50">
                          <div>
                            <p className="text-xs font-bold text-white uppercase">Orange Money</p>
                            <p className="text-[9px] text-zinc-500 font-mono">Non configuré</p>
                          </div>
                          <span className="w-4 h-4 rounded-full border border-white/10" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-900/20 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-bold text-emerald-400 uppercase">Protection du Vendeur Actif</p>
                        <p className="text-[9.5px] text-zinc-500 leading-normal font-sans">
                          En confirmant, vous acceptez de respecter le double séquestre physique de KUFULULA.cd : les colis de vos acheteurs sont sécurisés et vos paiements débloqués sous 5 minutes après validation de réception sur le terrain.
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between gap-3">
                      <button
                        onClick={() => setOnboardingStep(2)}
                        className="px-4 py-2 bg-zinc-950 border border-white/5 text-zinc-400 font-mono text-[10px] font-black uppercase tracking-wider rounded-xl transition-all hover:text-white"
                      >
                        Retour
                      </button>
                      <button
                        onClick={handleCompleteOnboarding}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-mono text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" /> Confirmer & Ouvrir ma Boutique
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: VENDOR PORTAL (Unlocked Dashboard) */}
            {activeTab === "vendor-dashboard" && isMerchantVerified && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-emerald-500" /> Mon Portail Vendeur Pro
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                      Boutique : {companyName || "Mwanza Auto Motors"} • RCCM : {rccmNumber || "CD/KIN/RCCM/24-B-9981"}
                    </p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[8.5px] font-black tracking-widest font-mono uppercase px-2.5 py-1 rounded-full border border-emerald-500/25 flex items-center gap-1.5 shadow">
                    <ShieldCheck className="w-3.5 h-3.5" /> CERTIFIÉ CONGO SOKO GOLD
                  </span>
                </div>

                {/* Sub-tabs: Performance Metrics / Post Product / Reviews / Followers */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Post new product and followers list */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* A. POST NEW PRODUCT */}
                    <div className="p-5 rounded-3xl bg-zinc-900/40 border border-white/5 space-y-4">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-sans font-black text-white uppercase tracking-tight">
                          Poster une nouvelle annonce sur le Soko
                        </h4>
                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                          Mise en vente instantanée avec indexation sémantique complète
                        </p>
                      </div>

                      <form onSubmit={handlePostProduct} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase font-black">Titre du produit</label>
                            <input
                              type="text"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              placeholder={businessType === "Automobile" ? "Ex: Toyota Hilux D-4D 2024" : "Ex: iPhone 15 Pro Max"}
                              className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans font-medium"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase font-black">Prix ($ USD)</label>
                            <input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              placeholder={businessType === "Automobile" ? "34000" : "1299"}
                              className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans font-medium"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase font-black">Catégorie</label>
                            <select
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                              className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans font-medium"
                            >
                              <option value="Electronics">Technologie & Électronique</option>
                              <option value="Fashion">Mode & Design Africain</option>
                              <option value="Home">Maison & Ameublement</option>
                              <option value="Livre">E-Books & Savoirs</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase font-black">Lien d'image Unsplash (Optionnel)</label>
                            <input
                              type="text"
                              value={newImageUrl}
                              onChange={(e) => setNewImageUrl(e.target.value)}
                              placeholder="Ex: https://images.unsplash.com/photo-..."
                              className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 uppercase font-black">Description du produit</label>
                          <textarea
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            placeholder="Décrivez précisément l'état de l'appareil ou du véhicule, sa provenance, sa garantie, etc."
                            className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans font-medium h-20 resize-none"
                          />
                        </div>

                        {productPostSuccess && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10.5px] font-mono rounded-xl flex items-center gap-1.5 animate-pulse">
                            <Check className="w-4 h-4 stroke-[2.5]" /> Produit publié avec succès et indexé sur le Soko !
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-emerald-500 text-zinc-950 font-mono text-[10.5px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" /> Mettre en vente
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* B. REVIEWS & COMMENTS MANAGER */}
                    <div className="p-5 rounded-3xl bg-zinc-900/40 border border-white/5 space-y-4">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-sans font-black text-white uppercase tracking-tight">
                          Gestion des Commentaires & Retours Client
                        </h4>
                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                          Interagissez en direct avec vos clients et validez les avis authentifiés
                        </p>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {commentsList.map((c) => (
                          <div key={c.id} className="p-3 bg-zinc-950/60 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10.5px]">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white font-sans">{c.user}</span>
                                <span className="text-[8px] font-mono text-zinc-500">{c.date}</span>
                                <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded uppercase ${
                                  c.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"
                                }`}>{c.status}</span>
                              </div>
                              <p className="text-zinc-400 font-sans leading-relaxed">{c.comment}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setCommentsList(prev => prev.filter(item => item.id !== c.id))}
                                className="p-2 bg-zinc-900 border border-white/5 text-zinc-500 hover:text-red-500 hover:border-red-500/15 rounded-xl transition-all cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                              {c.status === "Pending" && (
                                <button
                                  onClick={() => setCommentsList(prev => prev.map(item => item.id === c.id ? { ...item, status: "Approved" } : item))}
                                  className="px-2.5 py-1.5 bg-emerald-500 text-zinc-950 font-mono text-[9px] font-bold uppercase rounded-xl transition-all cursor-pointer"
                                >
                                  Approuver
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Dynamic SVG Performance Charts & Followers checking */}
                  <div className="space-y-6">
                    {/* A. PERFORMANCE METRICS (SVG CHART) */}
                    <div className="p-5 rounded-3xl bg-zinc-900/40 border border-white/5 space-y-4">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-sans font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-400" /> Performance & Ventes
                        </h4>
                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                          Revenu de vente sous séquestre validé
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">Chiffre d'Affaires Brut</p>
                        <p className="text-2xl font-mono font-black text-emerald-400">$84,500.00 USD</p>
                        <div className="flex items-center gap-1 text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-0.5 rounded-full w-max">
                          +18.4% cette semaine
                        </div>
                      </div>

                      {/* Pure SVG Custom Line Chart representing sales growth */}
                      <div className="h-28 w-full bg-zinc-950 rounded-2xl border border-white/5 p-2 flex items-end relative overflow-hidden">
                        <svg className="w-full h-full absolute inset-0 z-10" viewBox="0 0 100 50" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Grid lines */}
                          <line x1="0" y1="12" x2="100" y2="12" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          <line x1="0" y1="37" x2="100" y2="37" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          
                          {/* Area path */}
                          <path d="M 0 50 Q 20 40 40 28 T 80 15 L 100 8 L 100 50 Z" fill="url(#chart-grad)" />
                          {/* Stroke path */}
                          <path d="M 0 50 Q 20 40 40 28 T 80 15 L 100 8" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
                          {/* Active point dots */}
                          <circle cx="100" cy="8" r="2" fill="#10B981" />
                          <circle cx="80" cy="15" r="1.5" fill="#10B981" />
                        </svg>
                        <div className="flex justify-between w-full text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest z-20 px-1 select-none">
                          <span>Lun</span>
                          <span>Mer</span>
                          <span>Ven</span>
                          <span>Dim</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
                        <div className="p-2.5 bg-zinc-950 border border-white/5 rounded-xl">
                          <p className="text-zinc-500 uppercase text-[8px]">Clics de Page</p>
                          <p className="text-white font-bold text-xs pt-0.5">14,200</p>
                        </div>
                        <div className="p-2.5 bg-zinc-950 border border-white/5 rounded-xl">
                          <p className="text-zinc-500 uppercase text-[8px]">Commandes</p>
                          <p className="text-white font-bold text-xs pt-0.5">112</p>
                        </div>
                      </div>
                    </div>

                    {/* B. FOLLOWERS & PAGE MEMBERS */}
                    <div className="p-5 rounded-3xl bg-zinc-900/40 border border-white/5 space-y-4">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-sans font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-blue-400" /> Abonnés & Likes Boutique
                        </h4>
                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                          Consultez qui a intégré ou aimé votre page
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        {followers.map((f) => (
                          <div key={f.id} className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-zinc-950/40 border border-white/5">
                            <div className="flex items-center gap-2">
                              <img
                                src={f.avatar}
                                alt={f.name}
                                className="w-8 h-8 rounded-xl object-cover bg-zinc-900 border border-white/10"
                              />
                              <div>
                                <p className="text-xs font-bold text-white font-sans">{f.name}</p>
                                <p className="text-[8.5px] text-zinc-500 font-mono">{f.location} • A aimé {f.likedProduct.split(" ")[0]}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleFollow(f.id)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                                f.following 
                                  ? "bg-zinc-800 text-zinc-400 border border-white/5 hover:text-white" 
                                  : "bg-blue-600 hover:bg-blue-500 text-white"
                              }`}
                            >
                              {f.following ? "Abonné" : "Suivre"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PREFERENCES */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Settings className="w-5 h-5 text-zinc-400 animate-spin-slow" /> Réglages Système & Langues
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                    Configurez vos préférences d'apparence et de langues locales
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Language Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-black flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400" /> SÉLECTION DE LA LANGUE
                    </label>
                    <div className="relative">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 text-white rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-amber-500 appearance-none font-sans"
                      >
                        <option value="fr">Français</option>
                        <option value="ln">Lingala (Congo Ouest)</option>
                        <option value="sw">Swahili (Congo Est)</option>
                        <option value="lu">Tshiluba (Kasaï)</option>
                        <option value="kg">Kikongo (Kongo Central)</option>
                        <option value="en">English (International)</option>
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500 text-[9px]">▼</span>
                    </div>
                  </div>

                  {/* Theme Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-black flex items-center gap-2">
                      <Palette className="w-4 h-4 text-purple-400" /> THÈME VISUEL ACTIF
                    </label>
                    <div className="relative">
                      <select
                        value={activeTheme.id}
                        onChange={(e) => {
                          const found = THEMES.find((t) => t.id === e.target.value);
                          if (found) setActiveTheme(found);
                        }}
                        className="w-full bg-zinc-950 border border-white/10 text-white rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-amber-500 appearance-none font-sans"
                      >
                        {THEMES.map((theme) => (
                          <option key={theme.id} value={theme.id}>
                            {theme.name.replace(/🌳|🟢|🏺|⚡|🍊|🔲|🌊|❄️/g, "").trim()}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500 text-[9px]">▼</span>
                    </div>
                  </div>

                  {/* Font Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-black flex items-center gap-2">
                      <Type className="w-4 h-4 text-emerald-400" /> TYPOGRAPHIE & POLICE
                    </label>
                    <div className="relative">
                      <select
                        value={activeFont.id}
                        onChange={(e) => {
                          const found = FONTS.find((f) => f.id === e.target.value);
                          if (found) setActiveFont(found);
                        }}
                        className="w-full bg-zinc-950 border border-white/10 text-white rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-amber-500 appearance-none font-sans"
                      >
                        {FONTS.map((font) => (
                          <option key={font.id} value={font.id}>
                            {font.name.replace(/⚡|🏺|🟢|🌸|🇨🇭|🍒/g, "").trim()}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500 text-[9px]">▼</span>
                    </div>
                  </div>

                  {/* Permissions Checklist */}
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <label className="text-[10px] font-mono text-[#FF8C00] uppercase tracking-widest block font-black">
                      AUTORISATIONS MATÉRIELLES PERSISTANTES
                    </label>
                    <div className="space-y-2">
                      {[
                        { key: "camera" as const, label: "Caméra Physique (Scan codes QR & Documents)", icon: <Camera className="w-4 h-4 text-amber-500" /> },
                        { key: "microphone" as const, label: "Microphone d'Appareil (Recherche Vocale)", icon: <User className="w-4 h-4 text-purple-400" /> },
                        { key: "geolocation" as const, label: "Géolocalisation GPS (Suivi de Colis & Cartes)", icon: <MapPin className="w-4 h-4 text-cyan-400" /> }
                      ].map((perm) => (
                        <div key={perm.key} className="flex items-center justify-between p-3 bg-zinc-900/40 border border-white/5 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-zinc-950 rounded-lg">{perm.icon}</div>
                            <span className="text-xs font-bold text-zinc-300">{perm.label}</span>
                          </div>
                          <button
                            onClick={() => onTogglePermission(perm.key)}
                            className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${
                              permissionsState[perm.key] ? "bg-emerald-500" : "bg-zinc-800"
                            }`}
                          >
                            <div
                              className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                permissionsState[perm.key] ? "translate-x-4.5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* FOOTER */}
          <div className="border-t border-white/10 pt-4 mt-6 flex justify-between items-center text-[10px] font-mono text-zinc-500 select-none uppercase tracking-widest shrink-0">
            <span>Meta Accounts Center v3.8</span>
            <span>Sécurité validée • KUFULULA.cd</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
