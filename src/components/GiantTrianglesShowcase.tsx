import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useAnimation, AnimatePresence } from "framer-motion";
import { Heart, Eye, ArrowRight, ShieldCheck } from "lucide-react";

interface TriangleProduct {
  id: string;
  title: string;
  vendor: string;
  desc: string;
  image: string;
  price: number;
  category: string;
}

interface GiantTrianglesShowcaseProps {
  onViewProduct: (productId: string) => void;
  onLikeToggle: (productId: string) => void;
  isLiked: (productId: string) => boolean;
}

const TRENDING_PRODUCTS: TriangleProduct[] = [
  {
    id: "mwinda-solar",
    title: "MWINDA Solaire Lantern v4",
    vendor: "Kongo-Innovations Ltd",
    desc: "Lumière solaire premium en cuivre brossé avec port USB-C bidirectionnel. Conçue pour résister aux coupures.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop",
    price: 49,
    category: "Electronics"
  },
  {
    id: "car-landcruiser",
    title: "Toyota Land Cruiser V6 Prado",
    vendor: "Mwanza Auto Motors",
    desc: "Véhicule utilitaire tout-terrain robuste, conçu pour affronter les routes rigoureuses du Grand Congo.",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop",
    price: 48000,
    category: "Voiture"
  },
  {
    id: "phone-infinix",
    title: "Infinix Zero Ultra 5G",
    vendor: "Afritech Télécom",
    desc: "Écran incurvé AMOLED 120Hz, appareil photo 200MP et charge ultra-rapide 180W.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
    price: 499,
    category: "Electronics"
  },
  {
    id: "isolele-royal-costume",
    title: "Costume Royal Isolele Élite",
    vendor: "Maison Couture Isolele",
    desc: "Costume d'apparat tissé à la main en lin et fils d'or pur. Pièce royale de la collection Kufulula.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
    price: 12500,
    category: "Mode"
  },
  {
    id: "loma-cafe-kivu",
    title: "Café Noir Arabica Lac Kivu",
    vendor: "Loma Café Bio",
    desc: "Grains torréfiés sur les rives volcaniques du Lac Kivu, offrant un goût riche, corsé et authentique.",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop",
    price: 18,
    category: "Food"
  },
  {
    id: "ebene-statue",
    title: "Buste Perlé Masque Kongo",
    vendor: "Fondeurs de Lubumbashi",
    desc: "Manteau d'apparat majestueux et buste d'ébène orné de perles ancestrales d'Afrique centrale.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    price: 850,
    category: "Artisanat"
  }
];

export default function GiantTrianglesShowcase({ onViewProduct, onLikeToggle, isLiked }: GiantTrianglesShowcaseProps) {
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);

  // Combine arrays for infinite loop rendering
  const items = [...TRENDING_PRODUCTS, ...TRENDING_PRODUCTS, ...TRENDING_PRODUCTS];

  useEffect(() => {
    // If not dragging and no active hover, resume marquee animations smoothly
    if (!isDragging && activeHover === null) {
      startMarquee();
    } else {
      controls.stop();
    }
  }, [isDragging, activeHover]);

  const startMarquee = () => {
    controls.start({
      x: [0, -600],
      transition: {
        ease: "linear",
        duration: 35,
        repeat: Infinity,
      },
    });
  };

  const handleDragStart = () => {
    setIsDragging(true);
    controls.stop();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full py-8 overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/20 backdrop-blur-md shadow-2xl">
      {/* Background gradients for ambient depth removed as per request */}

      {/* Header section without Sparkles icon */}
      <div className="px-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#FF8C00] uppercase font-black flex items-center gap-1.5">
            PRODUITS PHARES EN TENDANCE & VIRAUX D'AFRIQUE
          </span>
          <h2 className="text-sm font-sans font-black text-white uppercase mt-0.5 tracking-tight">
            PRODUITS GÉANTS INTERACTIFS • KUFULULA SELECTION
          </h2>
        </div>
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900/60 border border-white/5 px-2.5 py-1 rounded-full">
          ← GLISSER OU DÉFILER SANS CONTRAINTE →
        </span>
      </div>

      {/* Draggable Track with Marquee Support */}
      <div className="overflow-visible select-none cursor-grab active:cursor-grabbing">
        <motion.div
          ref={scrollRef}
          animate={controls}
          drag="x"
          dragConstraints={{ left: -1200, right: 0 }}
          style={{ x: dragX }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="flex gap-8 w-max px-6 py-4"
        >
          {items.map((item, idx) => {
            const uniqueKey = `triangle-${item.id}-${idx}`;
            const liked = isLiked(item.id);
            const isHovered = activeHover === uniqueKey;

            return (
              <div
                key={uniqueKey}
                onMouseEnter={() => setActiveHover(uniqueKey)}
                onMouseLeave={() => setActiveHover(null)}
                onClick={() => setActiveHover(isHovered ? null : uniqueKey)}
                className="relative w-80 h-[480px] flex-none transition-all duration-500 ease-[0.16, 1, 0.3, 1]"
              >
                {/* 1. Image Container full rectangle */}
                <div
                  className="absolute inset-0 bg-zinc-900 overflow-hidden rounded-3xl border border-white/10 shadow-lg transition-transform duration-500 ease-out"
                >
                  {/* Product Background Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center scale-105 transition-transform duration-700 hover:scale-115 select-none"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle dark bottom gradient inside triangle */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                </div>

                {/* 2. Semi-transparent bottom rectangle overlay containing Product Title and Vendor */}
                <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl text-center space-y-1 z-20 pointer-events-auto">
                  <p className="text-xs font-sans font-black text-white tracking-tight uppercase truncate">
                    {item.title}
                  </p>
                  <p className="text-[9px] text-[#FF8C00] font-mono font-bold tracking-wider uppercase truncate flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> {item.vendor}
                  </p>
                  <p className="text-[10px] font-mono font-bold text-emerald-400 mt-1">
                    ${item.price.toLocaleString("fr-FR")} USD
                  </p>
                </div>

                {/* 3. Detailed Hover Card overlay containing description and interactive buttons */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-x-2 bottom-4 bg-zinc-950 border-2 border-amber-500 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-4 z-30 pointer-events-auto"
                    >
                      <div className="space-y-1 text-center">
                        <span className="text-[8px] font-mono font-bold uppercase text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                          En Tendance Virale
                        </span>
                        <h4 className="text-xs font-sans font-black text-white uppercase tracking-tight line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[9px] text-zinc-500 font-mono truncate">
                          Par {item.vendor}
                        </p>
                      </div>

                      <p className="text-[10px] text-zinc-400 leading-normal text-center font-sans line-clamp-3">
                        {item.desc}
                      </p>

                      <div className="flex gap-2">
                        {/* 1. Main Action Button: View Product */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProduct(item.id);
                          }}
                          className="flex-1 py-2 bg-[#FF8C00] hover:bg-amber-500 text-zinc-950 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[2.5]" /> Voir le produit
                        </button>

                        {/* 2. Like Toggle Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLikeToggle(item.id);
                          }}
                          className={`px-3.5 py-2 rounded-xl border transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                            liked
                              ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30"
                              : "bg-zinc-900 border-white/10 text-zinc-400 hover:text-white"
                          }`}
                          title={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
                        >
                          <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500" : ""}`} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
