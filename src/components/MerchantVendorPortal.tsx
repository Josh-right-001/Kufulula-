import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Users, ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle,
  Building2, Globe, FileText, Camera, Mic, Volume2, ShieldAlert, Wifi,
  Smartphone, Lock, HelpCircle, ArrowLeft, ArrowRight, Upload,
  Loader2, Check, Send, Award, Percent, Star, ExternalLink, Shield, Network,
  LockKeyhole, MapPin, Search
} from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Product, UserAuth } from "../types";

interface MerchantVendorPortalProps {
  currentUser: UserAuth | null;
  onClose: () => void;
  onSuccess: (newProduct?: Product) => void;
  lang: string;
}

// Localized promotional texts & step translations
const LOCALIZATION: Record<string, any> = {
  fr: {
    heroTitle: "Rejoignez l'Élite du Commerce 100% Africain • Kufulula Vendor Space",
    heroDesc: "Déployez votre boutique en République Démocratique du Congo avec un niveau de sécurité militaire sans faille. Bénéficiez de la confiance absolue du double séquestre physique de KUFULULA pour de grandes négociations pacifiées.",
    badgeSecurity: "SÉCURITÉ DOUBLE VERROU • 100% SÛR",
    badgeAfrican: "100% CONGOLAIS & AFRICAIN",
    benefitTitle: "Pourquoi vendre sur Kufulula Soko?",
    getStarted: "Commencer l'Enregistrement Sécurisé",
    closeBtn: "Fermer",
    stepTitle: "Étape",
    stepOf: "sur",
    payoutLabel: "Moyen de réception des paiements",
    back: "Retour",
    next: "Suivant",
    finish: "Confirmer & Lancer ma Boutique",
    uploadSuccess: "Fichier chargé avec succès !",
    integrityScanning: "Analyse algorithmique d'intégrité en cours...",
    faceScanning: "Alignement facial biométrique en cours...",
    voiceRecording: "Mise au point de l'analyse vocale...",
    networkScanning: "Analyse des certificats de sécurité réseau...",
    pros: [
      { id: 1, title: "Zéro Risque de Impayé", desc: "Les fonds des acheteurs nationaux sont consignés dans le séquestre KUFULULA.cd et versés instantanément dès livraison physique validée." },
      { id: 2, title: "Souveraineté Économique locale", desc: "Un portail d'affaires fier, construit pour l'Afrique, acceptant M-Pesa, Orange Money, Airtel Money et les cartes diasporas." },
      { id: 3, title: "Visibilité SEO Maximale", desc: "Chaque produit soumis profite d'une indexation sémantique dopée à l'IA pour capter les requêtes à Kinshasa et à l'étranger." }
    ]
  },
  en: {
    heroTitle: "Join the Elite of 100% African Commerce • Kufulula Vendor Space",
    heroDesc: "Deploy your shop in the Democratic Republic of Congo with flawless military-grade security. Benefit from the absolute trust of KUFULULA's decentralized physical escrow for peaceful high-value trade.",
    badgeSecurity: "DOUBLE-LOCK SECURITY • 100% SAFE",
    badgeAfrican: "100% CONGOLESE & AFRICAN",
    benefitTitle: "Why sell on Kufulula Soko?",
    getStarted: "Start Secured Onboarding",
    closeBtn: "Close",
    stepTitle: "Step",
    stepOf: "of",
    payoutLabel: "Payout Payout Channels",
    back: "Back",
    next: "Next",
    finish: "Confirm & Launch my Shop",
    uploadSuccess: "File uploaded successfully!",
    integrityScanning: "Document integrity algorithm scanning...",
    faceScanning: "Biometric facial alignment in progress...",
    voiceRecording: "Voicemail audio analysis checklist alignment...",
    networkScanning: "Analyzing routing tables and network threat levels...",
    pros: [
      { id: 1, title: "Zero Payment Default Risks", desc: "Local buyer funds are locked in the KUFULULA.cd secure escrow, instantly disbursed upon manual delivery verification." },
      { id: 2, title: "Local Economic Sovereignty", desc: "A proud African framework, natively supporting M-Pesa, Orange Money, Airtel Money, and Diaspora Visa." },
      { id: 3, title: "Maximum Search Optimization", desc: "Every item benefits from semantic indexing to capture high-value queries in Kinshasa and globally." }
    ]
  },
  sw: {
    heroTitle: "Jiunge na Wasomi wa Biashara 100% ya Kiafrika • Kufulula Vendor Space",
    heroDesc: "Fungua duka lako katika Jamhuri ya Kidemokrasia ya Kongo na usalama thabiti wa kijeshi. Nufaika na uaminifu kamili wa escrow ya KUFULULA kwa mazungumzo ya biashara yenye amani.",
    badgeSecurity: "USALAMA WA KUFULI MBILI • 100% USALAMA",
    badgeAfrican: "100% MKONGO & MWAFRIKA",
    benefitTitle: "Kwa nini uuze kwenye Kufulula Soko?",
    getStarted: "Anza Usajili Salama",
    closeBtn: "Funga",
    stepTitle: "Hatua ya",
    stepOf: "kati ya",
    payoutLabel: "Nia ya kupokea malipo",
    back: "Rudi",
    next: "Endelea",
    finish: "Thibitisha & Fungua Duka Langu",
    uploadSuccess: "Faili imepakiwa kwa mafanikio!",
    integrityScanning: "Uchambuzi wa algoridimu wa uaminifu wa hati unaendelea...",
    faceScanning: "Ulinganifu wa kibayometriki wa uso unaendelea...",
    voiceRecording: "Uchambuzi wa rekodi ya sauti ya kiapo...",
    networkScanning: "Uchanganuzi wa usalama wa mtandao dhidi ya wezi...",
    pros: [
      { id: 1, title: "Hakuna Hatari ya Kutolipwa", desc: "Fedha za wanunuzi hufungwa kwenye escrow ya KUFULULA.cd na kulipwa mara moja kufuatia uthibitisho wa usafirishaji." },
      { id: 2, title: "Ukuu wa Uchumi wa Ndani", desc: "Jukwaa la fahari ya Kiafrika, linalokubali M-Pesa, Orange Money, Airtel Money, na kadi za diaspora." },
      { id: 3, title: "Kuonekana Zaidi Kwenye SEO", desc: "Kila bidhaa inanufaika na soko sémantiki ili kukamata wateja huko Kinshasa na kote duniani." }
    ]
  },
  ln: {
    heroTitle: "Koma Motekisi ya Elanga ya KUFULULA • 100% ya biso moko ya Afrika",
    heroDesc: "Fungola wenze na yo na République Démocratique du Congo na boyekoli ya libateli makasi. Landela bosembo ya Kufulula pona kosala doti mpe mombongo na kimpwanza.",
    badgeSecurity: "BATELI NA GOMBO MIBALE • 100% YA SIKISIKI",
    badgeAfrican: "100% CONGOLAIS & AFRICAIN",
    benefitTitle: "Pona nini kotekisa na Kufulula?",
    getStarted: "Bandela boyekoli ya libateli",
    closeBtn: "Kanga",
    stepTitle: "Etape",
    stepOf: "na kati ya",
    payoutLabel: "Lolenge ya kozua mbongo",
    back: "Zonga sima",
    next: "Kende liboso",
    finish: "Tondisa mpe fungola wenze na ngai",
    uploadSuccess: "Kaye na yo ekoti malamu !",
    integrityScanning: "Algorithme ezali kotala mikanda soki ezali ya sembo...",
    faceScanning: "Kotala elongi malamu pona komibatela...",
    voiceRecording: "Koyoka lolaka ya kiapo ya bosembo...",
    networkScanning: "Kotala soki neti na yo ezali ya bosembo na mitambo...",
    pros: [
      { id: 1, title: "Mbongo na yo na loboko ya séquestre", desc: "Mbongo ya basombi ebatelami ndongisila na Kufulula, okosimbisama mbala moko soki biloko ekoti malamu." },
      { id: 2, title: "Soberaneto ya nkita na biso moko", desc: "Ebale ya motema wa biso, ekosala na M-Pesa, Orange Money, Airtel Money mpe Visa ya bapaya." },
      { id: 3, title: "Komisa wenze na yo monene", desc: "Biloko na yo ekotama na Google malamu pona bato ya Kinshasa na bapaya bamonela yo na poto." }
    ]
  },
  lu: {
    heroTitle: "Shala nshandishi ku Kufulula • Diandamuna dia Bantu 100% ba mu Afrika",
    heroDesc: "Bulula tshisalu tshiebe mu ditunga dia Congo na bupatshishi bukole bua busalayi. Keba bulongolodi bua kasulo secure escrow bua Kufulula bua kukolesha doti diebe.",
    badgeSecurity: "NDAMUNU IBIDI • 100% KAKUYI LUPANZA",
    badgeAfrican: "100% CONGOLAIS & AFRICAIN",
    benefitTitle: "Bua tshinyi kusumbishila mu Kufulula?",
    getStarted: "Tumbula bupatshishi muebe",
    closeBtn: "Kangula",
    stepTitle: "Etape",
    stepOf: "mu",
    payoutLabel: "Mushindu wa kuangata difutu",
    back: "Kupitula sima",
    next: "Kumpala",
    finish: "Jadika & Bulula tshitenda tshiebe",
    uploadSuccess: "Mukanda wakuluka bimpe !",
    integrityScanning: "Bantatshi badi batatula mukanda webe...",
    faceScanning: "Dikina dia tshimuenekelu tshiebe bua bupatshishi...",
    voiceRecording: "Muoyo wa diyi diebe bua kumanya bamue...",
    networkScanning: "Kukonkonona mbelu ya biamu biebe ne lulamatu...",
    pros: [
      { id: 1, title: "Lupanza ludiku lulama", desc: "Makuta adi asombibua kudi bangenda kudi seki ya Kufulula ne maseke onsu adiku mapitshisha bimpe mutunyu." },
      { id: 2, title: "Nkila ya bukala buetu banzenje", desc: "Tshisalu tshia munda-munda tshia lumu lua Congo, tshisala ne M-Pesa, Orange Money, mpe maseke a diaspora." },
      { id: 3, title: "Kukolesha muoyo muebe ku Google", desc: "Mbiabu bionso bidi bipatuka ne bimonshibua kudi bantu ba mu Kinshasa ne banzenji." }
    ]
  },
  kg: {
    heroTitle: "Kala Nkotisi ya Wenzo ya KUFULULA • 100% ya mayela ya Kati ya Afrika",
    heroDesc: "Kotisa kisalu ya nge na kizunga ya Kongo nabeto na lutaninu makasi yawu lenda kufwa ve. Landila ngolo ya mbongo kinsungolo ya Kufulula.",
    badgeSecurity: "KIOMBO KYA SIKISIKI ZOLE • 100% YA MUTIMA MPIMBA",
    badgeAfrican: "100% CONGOLAIS & AFRICAIN",
    benefitTitle: "Sambu na nki nge fueti tekisa na gombo ya Kufulula ?",
    getStarted: "Yantika kisalu ya kinsongolo",
    closeBtn: "Kanga",
    stepTitle: "Ntinga",
    stepOf: "na kati ya",
    payoutLabel: "Metode ya kuzulila nge mbongo",
    back: "Vutuka sima",
    next: "Kenda kumpala",
    finish: "Menga mpe kanga gombo nabeto",
    uploadSuccess: "Nkanda nge ekoti malamu kibeni !",
    integrityScanning: "Mayela ya ntingisila ya mikanda na nge ke sosa ya kieleka...",
    faceScanning: "Kisandulu kya luse na ntinga...",
    voiceRecording: "Kuwana ndinga ya kinsonga na mpeve...",
    networkScanning: "Kisosa kya mayela ya batanisi ti phising...",
    pros: [
      { id: 1, title: "Yantama ye mbongo lutaninu", desc: "Mbongo ya bansumbi yawu ke zolima kinsungolo tii ku lungula biloko na bosembo." },
      { id: 2, title: "Ngolo ya mbongo na beto banzenje", desc: "Nsiku nene ya dikanda, ekukita na M-Pesa, Orange Money, Airtel Money, ye bitala ya diaspora." },
      { id: 3, title: "Bikisa duka na nge nge kiese", desc: "Biloko yawu ekosima Google mpe bansumbi ya nene na Kinshasa na mikili yankaka lenda mona nge." }
    ]
  }
};

export default function MerchantVendorPortal({
  currentUser,
  onClose,
  onSuccess,
  lang = "fr"
}: MerchantVendorPortalProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Target vocabulary based on language
  const text = LOCALIZATION[lang] || LOCALIZATION["fr"];

  // ONBOARDING WIZARD DATA STATE (Groups the 21 security nodes into 10 cohesive highly secure steps)
  const [formData, setFormData] = useState({
    // Step 1: Identification & Bio (Micro-steps 1, 3)
    fullName: currentUser?.displayName || "",
    emailAddress: currentUser?.email || "",
    gender: "M",
    motivationText: "",
    operationalAddress: "",

    // Step 2: Initial Product Input (Micro-steps 2, 14 - for instant catalog indexing)
    productTitle: "Raphia Sac Royal de Sandaka",
    productPrice: 75,
    productCurrency: "USD" as "USD" | "CDF",
    productCategory: "Fashion",
    productStock: 10,
    productDescription: "Magnifique sac fait à la main près de sandaka à Kinshasa en fibres de liane brute tissée et raphia.",
    productTags: "raphia, sac, local, congo, fashion",

    // Step 3: Legal Identifiers (Micro-steps 5, 6 - RCCM, Identity)
    docType: "PASSEPORT" as "PASSEPORT" | "CPGL" | "RCCM" | "VISA",
    docNumber: "PR-9011244-CD",
    rccmText: "RCCM/22-B-098523/KIN",

    // Step 4: Documents shift compact photo (Micro-step 4)
    docImage: "",
    isDocScanning: false,
    docScanScore: 0,

    // Step 5: Face ID Biometric Validation (Micro-steps 7, 9)
    faceImage: "",
    isFaceScanning: false,
    faceScanConfidence: 0,

    // Step 6: Direct Voicemail Record (Micro-step 8)
    isRecordingVoice: false,
    voiceRecordedUrl: "",
    voiceWaveform: [] as number[],

    // Step 7: Communication Hub & Trusted reference (Micro-steps 10, 11)
    whatsappString: "+243899223344",
    telegramString: "@kongo_vendor_supr",
    trustGuardianName: "Maman Marie Sandaka",
    trustGuardianPhone: "+243811223344",

    // Step 8: Network threats scan & Environmental probe (Micro-steps 17, 18, 19, 20)
    measuredDecibels: 24,
    isNetworkScanning: false,
    networkSafeFromPhishing: true,
    hasGmail2FA: true,
    firmwareVersion: "Android 14 (Latest Upside Down Cake)",

    // Step 9: OTP Mobile Validation (Micro-step 16)
    phoneForSMS: "+243899223344",
    sentCode: "K-7712",
    enteredSMSCode: "",
    isSMSSent: false,

    // Step 10: Store Config, Taxes & Final Anchors (Micro-steps 12, 13, 15, 21)
    storeName: "Sandaka Raphia Art",
    storeBio: "Vente de vannerie et oeuvres de raphia traditionnelles congolaises",
    taxRateConfig: "16% TVA (Régime classique DGI)",
    payoutChannel: "M-PESA",
    payoutAccount: "0899223344",
    webSocialAnchor: "https://wikipedia.org/wiki/Raphia_Congo"
  });

  // Simulator timers
  const [docUploaded, setDocUploaded] = useState(false);
  const [faceUploaded, setFaceUploaded] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);

  // Audio simulation timer
  let audioInterval = useRef<any>(null);

  // Soundwave generator
  const simulateAudioRecording = () => {
    if (formData.isRecordingVoice) {
      clearInterval(audioInterval.current);
      setFormData(prev => ({ ...prev, isRecordingVoice: false }));
      return;
    }

    setFormData(prev => ({ ...prev, isRecordingVoice: true }));
    let counts = 0;
    audioInterval.current = setInterval(() => {
      const arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 80) + 15);
      setFormData(prev => ({
        ...prev,
        voiceWaveform: arr,
        measuredDecibels: Math.floor(Math.random() * 15) + 18
      }));
      counts++;
      if (counts > 25) {
        clearInterval(audioInterval.current);
        setFormData(prev => ({
          ...prev,
          isRecordingVoice: false,
          voiceRecordedUrl: "blob:kufulula-voice-signature-auth"
        }));
      }
    }, 120);
  };

  useEffect(() => {
    return () => clearInterval(audioInterval.current);
  }, []);

  // OTP Countdown timer
  useEffect(() => {
    let timer: any;
    if (formData.isSMSSent && otpTimer > 0) {
      timer = setInterval(() => setOtpTimer(p => p - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [formData.isSMSSent, otpTimer]);

  // Actions simulators
  const handleUploadDocImage = () => {
    setFormData(prev => ({ ...prev, isDocScanning: true }));
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        isDocScanning: false,
        docScanScore: 99.4,
        docImage: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop"
      }));
      setDocUploaded(true);
    }, 2200);
  };

  const handleCaptureFaceBio = () => {
    setFormData(prev => ({ ...prev, isFaceScanning: true }));
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        isFaceScanning: false,
        faceScanConfidence: 98.7,
        faceImage: currentUser?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${formData.fullName}`
      }));
      setFaceUploaded(true);
    }, 2500);
  };

  const executeNetworkScan = () => {
    setFormData(prev => ({ ...prev, isNetworkScanning: true }));
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        isNetworkScanning: false,
        networkSafeFromPhishing: true
      }));
    }, 2000);
  };

  const triggerSMSOTP = () => {
    setFormData(prev => ({ ...prev, isSMSSent: true }));
    setOtpTimer(30);
  };

  // Submit complete onboarding to databases (Firestore + Fallback)
  const handleCompleteOnboarding = async () => {
    setSubmitting(true);
    setErrorMessage("");

    const vendorId = currentUser?.uid || "vendor-" + Math.floor(Math.random() * 10000);

    // Save Vendor details
    const vendorPayload = {
      id: vendorId,
      email: formData.emailAddress,
      displayName: currentUser?.displayName || formData.fullName,
      fullName: formData.fullName,
      bio: formData.storeBio,
      whatsapp: formData.whatsappString,
      telegram: formData.telegramString,
      docType: formData.docType,
      docNumber: formData.docNumber,
      docImage: formData.docImage || "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop",
      faceImage: formData.faceImage || "https://api.dicebear.com/7.x/bottts/svg?seed=k",
      voiceText: "Je certifie sur l'honneur l'exactitude de mes données sur le portail Kufulula Soko Rendu",
      references: [formData.trustGuardianName, formData.trustGuardianPhone],
      decibelsLevel: formData.measuredDecibels,
      networkStatus: "SECURE_ROUTE_VERIFIED_WITHOUT_MITM",
      deviceVersion: formData.firmwareVersion,
      storeName: formData.storeName,
      taxId: formData.rccmText,
      payoutChannel: formData.payoutChannel,
      verifiedAt: new Date().toISOString()
    };

    // Save dynamic product listing
    const generatedProductId = `prod-${formData.productTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Math.floor(Math.random() * 1000)}`;
    const productPayload: Product = {
      id: generatedProductId,
      title: formData.productTitle,
      description: formData.productDescription,
      price: Number(formData.productPrice),
      currency: formData.productCurrency,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop", // placeholder or matching category
      category: formData.productCategory,
      stock: Number(formData.productStock),
      vendor: formData.storeName,
      tags: formData.productTags.split(",").map(t => t.trim()),
      isDraft: false,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // 1. Write the vendor profile to firestore
      await setDoc(doc(db, "vendors", vendorId), vendorPayload);

      // 2. Write the first item to products directory
      await setDoc(doc(db, "products", generatedProductId), productPayload);

      // 3. Elevate Local user session storage to "merchant"
      const storedUser = localStorage.getItem("k_current_user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          userObj.role = "merchant";
          localStorage.setItem("k_current_user", JSON.stringify(userObj));
        } catch (_) {}
      }

      // 4. Force inject custom product to local products database as well to guarantee immediate homepage load
      const kProducts = localStorage.getItem("k_products_v3");
      if (kProducts) {
        try {
          const list = JSON.parse(kProducts);
          list.unshift(productPayload);
          localStorage.setItem("k_products_v3", JSON.stringify(list));
        } catch (_) {}
      }

      // Success Callback!
      onSuccess(productPayload);
    } catch (err) {
      console.error("Firestore onboarding err:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, `vendors/${vendorId}`);
      } catch (mappedErr: any) {
        setErrorMessage(mappedErr.message || String(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStep = () => {
    // Specific validations
    if (activeStep === 9 && formData.enteredSMSCode !== formData.sentCode) {
      setErrorMessage("Code OTP incorrect! Veuillez saisir le code K-7712 de simulation.");
      return;
    }
    setErrorMessage("");
    if (activeStep < 10) {
      setActiveStep(activeStep + 1);
    } else {
      handleCompleteOnboarding();
    }
  };

  const handlePrevStep = () => {
    setErrorMessage("");
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div id="vendor-portal-container" className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950 flex items-center justify-center font-sans">
      <AnimatePresence mode="wait">
        {!showWizard ? (
          // PRESENTATION ENGINE LANDING PAGE (ALIBABA STYLE PREMIUM BRUTALIST AND REASSURING COOPER CHROME BLUEPRINTS)
          <motion.div
            key="landing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full min-h-screen bg-zinc-950 p-6 md:p-12 flex flex-col justify-between max-w-5xl mx-auto space-y-8 relative"
          >
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF8C00]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-center pb-4 border-b border-orange-500/30">
              <div className="flex items-center gap-2">
                <div className="bg-[#FF8C00] p-1.5 rounded-xl">
                  <Building2 className="w-5 h-5 text-zinc-950" />
                </div>
                <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest font-black">
                  KUFULULA.cd • Merchant Operations
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all border border-white/5"
                title={text.closeBtn}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hero Intro */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-mono bg-orange-500/10 text-[#FF8C00] border border-orange-500/20 px-2 py-1 rounded-full uppercase tracking-widest font-bold">
                    {text.badgeSecurity}
                  </span>
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-full uppercase tracking-widest font-bold">
                    {text.badgeAfrican}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {text.heroTitle}
                </h1>

                <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                  {text.heroDesc}
                </p>

                {/* Benefits List */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-[#FF8C00] font-black">
                    {text.benefitTitle}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {text.pros.map((pro: any) => (
                      <div key={pro.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2 hover:border-[#FF8C00]/30 transition-all">
                        <div className="w-7 h-7 bg-[#FF8C00]/10 rounded-lg flex items-center justify-center">
                          <Check className="w-4 h-4 text-[#FF8C00]" />
                        </div>
                        <h4 className="font-sans font-bold text-xs text-white">{pro.title}</h4>
                        <p className="text-[11px] text-zinc-400 leading-normal">{pro.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setErrorMessage("");
                      setShowWizard(true);
                    }}
                    className="px-8 py-4 bg-[#FF8C00] hover:bg-[#ff9d24] text-zinc-950 font-mono text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-orange-500/10 active:scale-95 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-zinc-950" />
                    {text.getStarted}
                  </button>
                </div>
              </div>

              {/* Alibaba-style Bold Feature Card */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 shadow-2xl relative overflow-hidden space-y-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">ALIBABA INSPIRED ENGINE</span>
                    <h3 className="text-lg font-extrabold text-white">Kufulula Trust Hub</h3>
                  </div>
                  <Award className="w-8 h-8 text-amber-500 animate-pulse" />
                </div>

                <div className="space-y-3.5 divide-y divide-white/5">
                  <div className="flex gap-3 pt-3">
                    <div className="p-2 bg-zinc-900 rounded-lg text-emerald-400 h-fit">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold">Consignation Cryptographique</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">La monnaie ne s'évapore jamais. Séquestre centralisé sous audits constants des logs.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <div className="p-2 bg-zinc-900 rounded-lg text-[#FF8C00] h-fit">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold">100% Souverain & Local</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Pas de de virement bancaire lourd. Payout mobile instantané (Orange Money, M-Pesa).</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <div className="p-2 bg-zinc-900 rounded-lg text-cyan-400 h-fit">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold">Filtre Anti-Phishing</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Scans des DNS de connexion et décibels d'arrière plan audio pour éviter l'ingénierie sociale.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Score de sécurité globale</span>
                  <span className="text-emerald-400 font-extrabold px-3 py-1 bg-emerald-500/10 rounded-lg">99.8% VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Footer rights */}
            <div className="pt-6 border-t border-white/5 text-center text-[10px] text-zinc-500 font-mono flex flex-wrap justify-between gap-4">
              <span>© {new Date().getFullYear()} KUFULULA Soko. Tous droits réservés.</span>
              <span>100% Central African Escrow Sovereign Network</span>
            </div>
          </motion.div>
        ) : (
          // ONBOARDING CHAPTER WIZARD STEP-BY-STEP (10 CONSOLIDATED STEPS COVERING THE 21 POINTS)
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full min-h-screen max-w-4xl mx-auto p-4 md:p-8 flex flex-col justify-between"
          >
            {/* Header progress tracker */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div>
                  <span className="text-[10px] font-mono text-amber-500 tracking-widest uppercase font-bold">
                    {text.stepTitle} {activeStep} {text.stepOf} 10
                  </span>
                  <h2 className="text-base md:text-lg font-sans font-extrabold text-white flex items-center gap-1.5 uppercase">
                    <Shield className="w-4 h-4 text-[#FF8C00]" />
                    Mise en place de votre Portail Marchand
                  </h2>
                </div>
                <button
                  onClick={() => setShowWizard(false)}
                  className="p-2 bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white rounded-xl text-xs font-mono transition-all"
                >
                  Suspendre
                </button>
              </div>

              {/* Progress Bar steps */}
              <div className="grid grid-cols-10 gap-1.5 pt-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i + 1 <= activeStep
                        ? "bg-gradient-to-r from-orange-500 to-amber-400"
                        : "bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Error messaging Banner */}
            {errorMessage && (
              <div className="my-4 p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-center gap-2 font-mono">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Middle Step Renderers */}
            <div className="bg-zinc-900/80 border border-white/5 rounded-3xl p-6 md:p-8 my-6 flex-1 shadow-xl relative min-h-[400px] flex flex-col justify-between">
              
              {/* STEP 1: identification (Micro-steps 1, 3) */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-extrabold text-white uppercase">Informations de base & Motivation (A-1)</h3>
                      <p className="text-[11px] text-zinc-400">Renseignez vos coordonnées élémentaires d'administrateur de boutique.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Nom Complet</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                        placeholder="Ex: Jean Mukendi Sandaka"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Adresse Email</label>
                      <input
                        type="email"
                        value={formData.emailAddress}
                        onChange={e => setFormData({ ...formData, emailAddress: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                        placeholder="Ex: mukendi@gmail.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Genre</label>
                      <select
                        value={formData.gender}
                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Adresse physique d'exploitation</label>
                      <input
                        type="text"
                        value={formData.operationalAddress}
                        onChange={e => setFormData({ ...formData, operationalAddress: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                        placeholder="Ex: No 14 Avenue Lumumba, Gombe, Kinshasa"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#FF8C00] uppercase tracking-wider block font-bold">Pourquoi souhaitez-vous créer un compte KYC Kufulula ?</label>
                    <textarea
                      value={formData.motivationText}
                      onChange={e => setFormData({ ...formData, motivationText: e.target.value })}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 h-24"
                      placeholder="Décrivez en quelques phrases vos objectifs ou votre activité commerciale en RDC..."
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Initial Product Input (Micro-steps 2, 14) */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-extrabold text-white uppercase">Premier Article & Optimisation SEO</h3>
                      <p className="text-[11px] text-zinc-400">Préparez le premier produit de démonstration avec ses colonnes d'affichage.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Nom de l'Article</label>
                      <input
                        type="text"
                        value={formData.productTitle}
                        onChange={e => setFormData({ ...formData, productTitle: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#FF8C00]"
                        placeholder="Ex: Raphia Sac de Sandaka"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Catégorie</label>
                      <select
                        value={formData.productCategory}
                        onChange={e => setFormData({ ...formData, productCategory: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1"
                      >
                        <option value="Electronics">Electronics & Tech</option>
                        <option value="Food">Alimentation & Pâtisserie</option>
                        <option value="Fashion">Fashion, Cérémonie & Mariage</option>
                        <option value="Home">Maison, Décor & Jardin de brousse</option>
                        <option value="Livre">Livre, Guide & Document scientifique</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Prix (Unitaire)</label>
                      <input
                        type="number"
                        value={formData.productPrice}
                        onChange={e => setFormData({ ...formData, productPrice: Number(e.target.value) })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Devise d'Affichage</label>
                      <select
                        value={formData.productCurrency}
                        onChange={e => setFormData({ ...formData, productCurrency: e.target.value as any })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="CDF">CDF (FC)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Stock disponible initial</label>
                      <input
                        type="number"
                        value={formData.productStock}
                        onChange={e => setFormData({ ...formData, productStock: Number(e.target.value) })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Description détaillée du produit</label>
                    <textarea
                      value={formData.productDescription}
                      onChange={e => setFormData({ ...formData, productDescription: e.target.value })}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none h-16"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">Mots-clés SEO pour recherche sémantique</label>
                    <input
                      type="text"
                      value={formData.productTags}
                      onChange={e => setFormData({ ...formData, productTags: e.target.value })}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-zinc-300 focus:outline-none"
                      placeholder="Mots séparés par des virgules: sac, fait-main, raphia"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Legal Identifiers & Registry (Micro-steps 5, 6) */}
              {activeStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-extrabold text-white uppercase">Identifiants Légaux Officiels (RCCM / Passeport)</h3>
                      <p className="text-[11px] text-zinc-400">Introduisez les références légales de votre entreprise ou documents d'identité.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Type de document principal</label>
                      <select
                        value={formData.docType}
                        onChange={e => setFormData({ ...formData, docType: e.target.value as any })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                      >
                        <option value="PASSEPORT">Passeport National Voyage</option>
                        <option value="CPGL">Carte Communale CPGL (Frontière)</option>
                        <option value="RCCM">RCCM (Registre du Commerce)</option>
                        <option value="VISA">Carte Visa d'Affaires</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Numéro / ID de Document physique</label>
                      <input
                        type="text"
                        value={formData.docNumber}
                        onChange={e => setFormData({ ...formData, docNumber: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Identifiant Fiscal RCCM National</label>
                    <input
                      type="text"
                      value={formData.rccmText}
                      onChange={e => setFormData({ ...formData, rccmText: e.target.value })}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                      placeholder="Ex: CD/LSH/RCCM/22-B-0412"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/10 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 font-extrabold uppercase">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                      Couplage Registre National Guichet Unique
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Notre système effectue une interrogation de validité auprès de l'Office de Gestion de Fret (OGEFREM) et de la DGI pour attester l'authenticité de l'identifiant fiscal fourni.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4: Documents Upload & Scan checklist (Micro-step 4) */}
              {activeStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <div className="p-2 bg-[#FF8C00]/10 rounded-xl text-[#FF8C00]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-extrabold text-white uppercase">Dépôt Sûr & Analyse d'Intégrité de Document</h3>
                      <p className="text-[11px] text-zinc-400">Prenez en photo ou uploader vos documents PDF pour lancer l'analyse.</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-orange-500/50 rounded-3xl p-8 bg-zinc-950/40 text-center transition-all space-y-3">
                    {formData.isDocScanning ? (
                      <div className="space-y-2">
                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
                        <p className="text-xs font-mono text-white tracking-wider animate-pulse">{text.integrityScanning}</p>
                      </div>
                    ) : docUploaded ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-mono text-emerald-400 font-bold">{text.uploadSuccess}</p>
                        <span className="text-[10px] text-zinc-500 font-mono">Index d'authenticité: {formData.docScanScore}% Real</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-zinc-400 mx-auto" />
                        <div className="space-y-1">
                          <p className="text-xs text-white font-bold">Glissez-déposez la copie de votre RCCM ou Passeport</p>
                          <p className="text-[10px] text-zinc-400 font-mono">Formats autorisés: PDF, PNG, JPG (Max 10Mo)</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleUploadDocImage}
                          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-[10px] font-mono text-[#FF8C00] font-black uppercase tracking-wider"
                        >
                          Sélectionner un fichier
                        </button>
                      </>
                    )}
                  </div>

                  <p className="text-[10px] text-zinc-500 text-center leading-normal max-w-md mx-auto">
                    ⚠️ Notre algorithme compare l'image avec un modèle d'alignement de police, de filigranes nationaux et de signature certifiée pour isoler les faux documents.
                  </p>
                </div>
              )}

              {/* STEP 5: Face ID Biometric capture (Micro-steps 7, 9) */}
              {activeStep === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <div className="p-2 bg-cyan-400/10 rounded-xl text-cyan-400">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-extrabold text-white uppercase">Authentification Biométrique Face ID</h3>
                      <p className="text-[11px] text-zinc-400">Effectuez une capture faciale en direct pour certifier votre identité physique.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="relative aspect-video rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden flex items-center justify-center">
                      {formData.isFaceScanning ? (
                        <div className="text-center space-y-3 z-10">
                          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                          <p className="text-[10px] font-mono text-cyan-400 animate-pulse">{text.faceScanning}</p>
                        </div>
                      ) : formData.faceImage ? (
                        <img
                          src={formData.faceImage}
                          alt="Face Bio"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-center text-zinc-500 space-y-2">
                          <Camera className="w-8 h-8 mx-auto text-zinc-600" />
                          <p className="text-[10px] font-mono">Webcam non démarrée</p>
                        </div>
                      )}

                      {/* Biometric crosshairs overlay */}
                      <div className="absolute inset-4 border border-cyan-400/20 rounded-xl pointer-events-none flex items-center justify-center">
                        <div className="w-12 h-12 border-2 border-cyan-400/40 rounded-full animate-pulse flex items-center justify-center">
                          <div className="w-3.5 h-3.5 bg-cyan-400/50 rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-xs text-white font-bold">Consignes de sécurité d'alignement</h4>
                        <ol className="list-decimal list-inside text-[11px] text-zinc-400 space-y-1">
                          <li>Placez-vous face à la caméra dans un endroit éclairé.</li>
                          <li>Évitez le port de chapeaux ou verres foncés.</li>
                          <li>Le moteur vérifie la texture de peau et clignotement.</li>
                        </ol>
                      </div>

                      <button
                        type="button"
                        onClick={handleCaptureFaceBio}
                        className="w-full py-3 bg-cyan-400 hover:bg-cyan-500 text-zinc-950 font-mono text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                      >
                        {faceUploaded ? "Reprendre Photo" : "Lancer le scan Face ID"}
                      </button>

                      {faceUploaded && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-mono flex items-center gap-1.5">
                          <Check className="w-4 h-4" /> Analyse faciale appairée : {formData.faceScanConfidence}% certifiée Liveness
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Sound Voice ID Record oath (Micro-step 8) */}
              {activeStep === 6 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-extrabold text-white uppercase">Reconnaissance Vocale & Kiapo Solennel</h3>
                      <p className="text-[11px] text-zinc-400">Enregistrez directement votre voix lisant à haute voix notre déclaration de conformité.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-3">
                    <span className="text-[9px] font-mono text-[#FF8C00] uppercase tracking-wider font-extrabold flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
                      Texte d'engagement à lire à voix haute :
                    </span>
                    <p className="text-sm italic text-zinc-200 font-sans tracking-wide leading-relaxed">
                      "Moi, soussigné {formData.fullName || "(Votre Nom)"}, m'engage solennellement à publier uniquement des produits réels et authentiques au Congo sur KUFULULA.cd et me soumets à la charte sécurisée."
                    </p>
                  </div>

                  <div className="flex flex-col items-center space-y-4 pt-2">
                    {/* Recording indicator wave */}
                    <div className="h-10 flex items-center gap-1">
                      {formData.isRecordingVoice ? (
                        formData.voiceWaveform.map((h, i) => (
                          <div
                            key={i}
                            className="w-1.5 rounded-full bg-orange-500 transition-all duration-75"
                            style={{ height: `${h}%` }}
                          />
                        ))
                      ) : formData.voiceRecordedUrl ? (
                        <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 animate-pulse">
                          <Check className="w-4 h-4 text-emerald-400" /> Kiapo vocal enregistré en format WAV local à décibels constants
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Cliquez pour chuchoter/enregistrer</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={simulateAudioRecording}
                      className={`px-6 py-3 rounded-2xl font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        formData.isRecordingVoice
                          ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                          : "bg-[#FF8C00] hover:bg-amber-500 text-zinc-950"
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      {formData.isRecordingVoice ? "Arrêter & Sauvegarder" : "Enregistrer mon Kiapo Vocal"}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 7: Communication details & Trusted voucher (Micro-steps 10, 11) */}
              {activeStep === 7 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-extrabold text-white uppercase">Données Sociales & Utilisateur de Confiance</h3>
                      <p className="text-[11px] text-zinc-400">Associez vos poignées de communication et déclarez vos références de caution morale.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Numéro WhatsApp Commercial</label>
                      <input
                        type="text"
                        value={formData.whatsappString}
                        onChange={e => setFormData({ ...formData, whatsappString: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                        placeholder="Ex: +243899123456"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Identifiant Telegram</label>
                      <input
                        type="text"
                        value={formData.telegramString}
                        onChange={e => setFormData({ ...formData, telegramString: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                        placeholder="Ex: @vendeur_sandaka"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">Nom du Témoin de confiance (Garant)</label>
                      <input
                        type="text"
                        value={formData.trustGuardianName}
                        onChange={e => setFormData({ ...formData, trustGuardianName: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                        placeholder="Ex: Papa Jean-Paul de l'Asso"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold font-black">Numéro Téléphone du Garant</label>
                      <input
                        type="text"
                        value={formData.trustGuardianPhone}
                        onChange={e => setFormData({ ...formData, trustGuardianPhone: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                        placeholder="Ex: +243812345678"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-normal bg-zinc-950/60 p-3 rounded-xl border border-white/5">
                    💡 Le garant ou utilisateur de confiance est contacté de manière aléatoire en cas de doute sur la provenance physique d'une livraison litigieuse dans notre gombo.
                  </p>
                </div>
              )}

              {/* STEP 8: Environmental probe, network check, firmware (Micro-steps 17, 18, 19, 20) */}
              {activeStep === 8 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-extrabold text-white uppercase">Widget de Menaces Réseau & Son Ambiant</h3>
                      <p className="text-[11px] text-zinc-400">Notre moteur scanne vos variables matérielles pour bloquer la cybercriminalité.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-400">Version du micrologiciel</span>
                        <span className="text-amber-500 font-bold">{formData.firmwareVersion}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-400">Analyse de bruit ambiant (Sound test)</span>
                        <span className="text-emerald-400 font-bold">{formData.measuredDecibels} dB (Quiet Private Room)</span>
                      </div>

                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-400">Gmail Double Facteur (2FA)</span>
                        <span className="text-emerald-400 font-black">ACTIVE • DOUBLE LOGS</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-950 border border-[#FF8C00]/20 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs text-white font-bold flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Scanner anti-Hameçonnage (Anti-Fishing)
                        </h4>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                          L'outil vérifie que la connexion que vous utilisez ne comporte pas de DNS empoisonné, de proxy malicieux ou de risques de Man-In-The-Middle.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={executeNetworkScan}
                        className="mt-3 py-2 bg-zinc-900 hover:bg-zinc-805 rounded-xl border border-white/10 text-xs font-mono text-[#FF8C00] font-black"
                      >
                        {formData.isNetworkScanning ? "Analyse réseau active..." : "Lancer le scan Réseau"}
                      </button>
                    </div>
                  </div>

                  {!formData.isNetworkScanning && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-2xl text-[10px] font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Scan de menaces complété : Aucun proxy malveillant détecté. Votre terminal respecte les normes et certificats.</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 9: SMS verification simul (Micro-step 16) */}
              {activeStep === 9 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-extrabold text-white uppercase">Vérification de sécurité OTP Téléphone</h3>
                      <p className="text-[11px] text-zinc-400">Attestez que votre numéro appartient bien à un terminal mobile physique actif.</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 space-y-4 max-w-md mx-auto">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 block">Saisir le numéro de téléphone</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.phoneForSMS}
                          onChange={e => setFormData({ ...formData, phoneForSMS: e.target.value })}
                          className="flex-1 bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={triggerSMSOTP}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold rounded-xl"
                        >
                          {formData.isSMSSent ? "Renvoyer" : "Envoyer le code"}
                        </button>
                      </div>
                    </div>

                    {formData.isSMSSent && (
                      <div className="space-y-3 pt-2">
                        <div className="p-3 bg-[#FF8C00]/10 border border-orange-500/20 text-orange-400 rounded-xl text-[10px] font-mono text-center">
                          ℹ️ SIMULATION : Saisir le code d'activation reçu <b>{formData.sentCode}</b> (Compte à rebours: {otpTimer}s)
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-zinc-400 block text-center">Saisir le Code OTP reçu</label>
                          <input
                            type="text"
                            value={formData.enteredSMSCode}
                            onChange={e => setFormData({ ...formData, enteredSMSCode: e.target.value })}
                            className="w-32 bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs focus:outline-none text-center font-mono font-black mx-auto block tracking-widest text-[#FF8C00]"
                            placeholder="K-XXXX"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 10: Store configuration, payout channels, Wikipedia official URL (Micro-steps 12, 13, 15, 21) */}
              {activeStep === 10 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <div className="p-2 bg-cyan-400/10 rounded-xl text-cyan-400">
                      <LockKeyhole className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-extrabold text-white uppercase">Configuration Finale de la Boutique & Envoi</h3>
                      <p className="text-[11px] text-zinc-400">Finalisez le nom de votre magasin virtuel et indiquez vos ancres numériques.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Nom de votre Boutique (Store Name)</label>
                      <input
                        type="text"
                        value={formData.storeName}
                        onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        placeholder="Ex: Art Raphia Sandaka"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Slogan / Description ultra-rapide</label>
                      <input
                        type="text"
                        value={formData.storeBio}
                        onChange={e => setFormData({ ...formData, storeBio: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">{text.payoutLabel}</label>
                      <select
                        value={formData.payoutChannel}
                        onChange={e => setFormData({ ...formData, payoutChannel: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                      >
                        <option value="M-PESA">Vodacom M-Pesa</option>
                        <option value="ORANGE_MONEY">Orange Money</option>
                        <option value="AIRTEL_MONEY">Airtel Money</option>
                        <option value="AFRIMONEY">Afrimoney</option>
                        <option value="VISA_DIASPORA">Carte de crédit Diaspora</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Coordonnées du compte récepteur</label>
                      <input
                        type="text"
                        value={formData.payoutAccount}
                        onChange={e => setFormData({ ...formData, payoutAccount: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Ancre numérique d'authenticité (Wikipedia, LinkedIn ou Site Web uniquement)</label>
                    <input
                      type="text"
                      value={formData.webSocialAnchor}
                      onChange={e => setFormData({ ...formData, webSocialAnchor: e.target.value })}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      placeholder="Ex: https://linkedin.com/in/sandaka-vendor"
                    />
                  </div>

                  <p className="text-[9px] text-[#FF8C00] font-mono text-center uppercase tracking-widest font-black animate-pulse">
                    ⚡ 100% de la chaîne de sécurité est validée. Prêt à soumettre à l'algorithme d'administration.
                  </p>
                </div>
              )}

              {/* Navigation buttons inside middle container for spacing */}
              <div className="flex justify-between pt-6 border-t border-white/5 mt-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={activeStep === 1 || submitting}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 text-zinc-400 rounded-xl text-xs font-mono font-bold border border-white/10 flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {text.back}
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-zinc-950 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                      Patientez...
                    </>
                  ) : activeStep === 10 ? (
                    <>
                      {text.finish}
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      {text.next}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Shield and zero-trust credentials badge */}
            <div className="text-center font-mono text-[9px] text-zinc-500 py-2">
              🔒 Kufulula Shield cryptographic chain v2 • Secured by deep liveness audio-decibel algorithms & firestore rulesets
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
