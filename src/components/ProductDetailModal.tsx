import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Flame, Sparkles, Check, HelpCircle, AlertCircle } from "lucide-react";
import { Product } from "../types";
import { useState, useEffect } from "react";
import { TranslationDictionary } from "../lib/translations";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  dict: TranslationDictionary;
  activeTheme?: any;
}

export default function ProductDetailModal({ product, onClose, onAddToCart, dict, activeTheme }: ProductDetailModalProps) {
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<{ name: string; value: string } | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");

  // Gemini Image Generator States
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState("");
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      // Load custom generated image from cache if it exists
      const persistedCustom = localStorage.getItem(`k_custom_img_${product.id}`);
      setActiveImage(persistedCustom || product.image);
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      } else {
        setSelectedColor(null);
      }
    }
  }, [product]);

  if (!product) return null;
  const isCdf = product.currency === "CDF";

  const handleAddWithConfirm = () => {
    // Generate modified item based on selected color before adding to cart
    const customizedProduct = {
      ...product,
      image: activeImage,
      title: selectedColor ? `${product.title} (${selectedColor.name})` : product.title
    };
    onAddToCart(customizedProduct);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Safe fetch of multi-angle detailed images if exist
  const angles = product.imagesDetail && product.imagesDetail.length > 0 
    ? product.imagesDetail 
    : [product.image];

  // Dynamic Image generation powered by Gemini Banana 🍌
  const handleGenerateAiImage = async () => {
    setIsGenerating(true);
    setGenError(null);
    setGenProgress("Extraction du prompt...");

    // Progress updates to delight the user
    const timer1 = setTimeout(() => setGenProgress("Connexion au serveur Gemini..."), 700);
    const timer2 = setTimeout(() => setGenProgress("Analyse de la coupe de tissu..."), 1400);
    const timer3 = setTimeout(() => setGenProgress("Génération Banana-Imagen..."), 2100);

    try {
      const prompt = product.imageGeneratorPrompt || `Professional pristine product studio photography of ${product.title}, high-end catalog, clean solid neutral background, couture details, realistic.`;
      const response = await fetch("/api/gemini/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      if (data.imageUrl) {
        setActiveImage(data.imageUrl);
        localStorage.setItem(`k_custom_img_${product.id}`, data.imageUrl);
        product.image = data.imageUrl;
      } else if (data.simulated) {
        const categoryImgMap: { [key: string]: string } = {
          "electronics": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop",
          "food": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop",
          "fashion": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
          "home": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop",
          "livre": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop"
        };
        const selected = categoryImgMap[product.category.toLowerCase()] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop";
        setActiveImage(selected);
        localStorage.setItem(`k_custom_img_${product.id}`, selected);
        product.image = selected;
      } else {
        throw new Error(data.error || "Rendu non complété");
      }
    } catch (err: any) {
      console.error(err);
      setGenError("Fichier de secours activé.");
      const categoryImgMap: { [key: string]: string } = {
        "electronics": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop",
        "food": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop",
        "fashion": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
        "home": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop",
        "livre": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop"
      };
      const selected = categoryImgMap[product.category.toLowerCase()] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop";
      setActiveImage(selected);
      localStorage.setItem(`k_custom_img_${product.id}`, selected);
      product.image = selected;
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
        id="detail_modal_backdrop"
      >
        {/* Blur Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/70 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          layoutId={`card-container-${product.id}`}
          className={`relative ${activeTheme ? activeTheme.cardClass : "bg-zinc-950 border border-zinc-800"} w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh] md:max-h-[85vh] z-10 text-white`}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white shadow-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Product Image stage & Gallery Viewer */}
          <div className="w-full md:w-1/2 bg-zinc-950 flex flex-col justify-between p-4 md:p-6 border-b md:border-b-0 md:border-r border-zinc-850">
            
            {/* Active stage viewer */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-center justify-center mb-4">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={activeImage || product.image}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                transition={{ duration: 0.3 }}
              />
              {product.stock < 10 && (
                <div className="absolute bottom-3 left-3 bg-red-600 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                  <Flame className="w-3 h-3 animate-pulse" />
                  {product.stock} {dict.stockLabel.toLowerCase()}
                </div>
              )}
            </div>

            {/* Thumbnail Multi Angle Views (Alibaba style angle selector) */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block mb-1.5">
                {dict.angleSelect}
              </span>
              <div className="flex gap-2 pb-2 overflow-x-auto">
                {angles.map((imgUrl, angleIdx) => (
                  <button
                    key={angleIdx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-900 border-2 transition-all shrink-0 ${
                      activeImage === imgUrl ? "border-amber-500 scale-95 shadow-lg" : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Angle ${angleIdx + 1}`} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0.5 right-0.5 py-0.2 px-1 rounded bg-black/60 text-[8px] font-mono text-zinc-300">
                      #{angleIdx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Image Generation Widget (Gemini Banana 🍌) */}
            <div className="mt-4 p-3 bg-zinc-900/80 border border-white/5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono tracking-widest text-[#FF8C00] uppercase font-black flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-[#FF8C00]" />
                  Générateur Gemini Soko Rendu
                </span>
                <span className="text-[8px] font-mono text-[#00FF66] bg-[#00FF66]/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">STUDIO LIVE</span>
              </div>
              
              <p className="text-[10px] text-zinc-400">
                La photo de l'article est générique ? Re-générez un rendu 3D ultra-réaliste par notre intelligence artificielle logistique.
              </p>

              {genError && (
                <p className="text-[9px] text-[#FF8C00] font-mono flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-[#FF8C00] shrink-0" />
                  <span>{genError}</span>
                </p>
              )}

              <button
                disabled={isGenerating}
                onClick={handleGenerateAiImage}
                className="w-full py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-amber-500 disabled:opacity-50 text-zinc-950 text-[10px] font-black font-mono uppercase tracking-wide rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-1.5 text-[9px] animate-pulse font-extrabold text-zinc-950">
                    <span className="w-2.5 h-2.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    {genProgress}
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Régénérer par IA (Gemini Banana 🍌)
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Right Product Specifications Content */}
          <div className="w-full md:w-1/2 p-5 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-none">
            <div className="space-y-4">
              {/* Category */}
              <span className="text-[9px] font-mono tracking-widest text-amber-500 uppercase block">
                {dict.appName} // {product.category}
              </span>

              {/* Title */}
              <h2 className="text-xl md:text-2xl font-sans tracking-tight font-extrabold text-white leading-tight">
                {product.title}
              </h2>

              {/* Price row */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-mono font-bold text-amber-550">
                  {isCdf ? `${product.price.toLocaleString("fr-FR")} CDF` : `$${product.price}`}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-sm font-mono line-through text-zinc-500">
                      {isCdf ? `${product.originalPrice.toLocaleString("fr-FR")} CDF` : `$${product.originalPrice}`}
                    </span>
                    <span className="text-xs text-green-500 font-mono font-medium">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* Alibaba Color Picker Area */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-850">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                    {dict.colorSelect} <strong className="text-amber-500 font-semibold">{selectedColor?.name}</strong>
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((color, colorIdx) => (
                      <button
                        key={colorIdx}
                        onClick={() => setSelectedColor(color)}
                        className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 transition-all ${
                          selectedColor?.name === color.name 
                            ? "border-amber-500 bg-amber-500/10 text-white" 
                            : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-zinc-400"
                        }`}
                      >
                        <span 
                          style={{ backgroundColor: color.value }} 
                          className="w-3 h-3 rounded-full border border-white/20 block shadow-inner"
                        />
                        <span className="text-[10px] font-mono tracking-tight">{color.name}</span>
                        {selectedColor?.name === color.name && (
                          <Check className="w-3 h-3 text-amber-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-850">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  {dict.specifications}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {product.description}
                </p>
              </div>

              {/* Vendor & Specs checklist */}
              <div className="grid grid-cols-2 gap-3 py-3 border-t border-zinc-850 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-mono text-zinc-500">{dict.vendorLabel}</span>
                  <p className="text-xs font-semibold text-zinc-300">{product.vendor}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-zinc-500">Logistique</span>
                  <p className="text-xs font-semibold text-zinc-300">Séquestre Kufulula</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-zinc-500">{dict.stockLabel}</span>
                  <p className="text-xs font-semibold text-zinc-300">{product.stock} pièces</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-zinc-500">Sécurité</span>
                  <p className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Double KYC Escrow
                  </p>
                </div>
              </div>
            </div>

            {/* Action panel */}
            <div className="flex flex-col gap-2.5 pt-4 border-t border-zinc-850">
              <button
                onClick={handleAddWithConfirm}
                className={`w-full py-3 md:py-3.5 rounded-xl font-medium tracking-tight flex items-center justify-center gap-2 shadow-lg transition-all duration-300 font-mono text-xs ${
                  added 
                    ? "bg-green-600 text-white shadow-green-600/20" 
                    : "bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold uppercase tracking-wider"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4.5 h-4.5" />
                    Ajouté !
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4.5 h-4.5" />
                    {dict.addToCart} • {isCdf ? `${product.price.toLocaleString("fr-FR")} CDF` : `$${product.price}`}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1 text-zinc-500 text-[9px] font-mono text-center">
                <Sparkles className="w-3 h-3 text-amber-550" />
                {dict.escrowBadge}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
