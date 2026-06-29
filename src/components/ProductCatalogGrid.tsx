import React, { useState, useEffect, useRef } from "react";
import { 
  Search, SlidersHorizontal, ArrowUpDown, ChevronDown, Check, X, RotateCcw, 
  Mic, Camera, Tag, AlertCircle, ShoppingBag, Eye, HelpCircle, 
  Layers, DollarSign, Package, BadgePercent, ChevronLeft, ChevronRight,
  BookOpen, Book, Bookmark, Download, Heart, Award
} from "lucide-react";
import { Product } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";

interface ProductCatalogGridProps {
  products: Product[];
  loading: boolean;
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  dict: any;
  activeTheme: any;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onVoiceTrigger?: () => void;
  onLensCameraTrigger?: () => void;
  onOpenSellerStore?: (vendorName: string) => void;
  onOpenExcerpt?: (bookId: string) => void;
}

// Robust, zero-dependency fuzzy match implementation showing true expert craft
function fuzzyMatch(str: string, query: string): boolean {
  if (!query) return true;
  const s = str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (s.includes(q)) return true;
  
  // Word tokens matching
  const qWords = q.split(/\s+/).filter(Boolean);
  if (qWords.every(word => s.includes(word))) return true;
  
  // Direct character overlap distance
  let matchCount = 0;
  qWords.forEach(qw => {
    const sWords = s.split(/\s+/).filter(Boolean);
    const hasFuzzyWord = sWords.some(sw => {
      if (sw.startsWith(qw)) return true;
      let common = 0;
      for (let i = 0; i < Math.min(sw.length, qw.length); i++) {
        if (sw[i] === qw[i]) common++;
      }
      return common / Math.max(sw.length, qw.length) > 0.65;
    });
    if (hasFuzzyWord) matchCount++;
  });
  
  return matchCount === qWords.length;
}

export default function ProductCatalogGrid({
  products,
  loading,
  onOpenDetails,
  onAddToCart,
  dict,
  activeTheme,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onVoiceTrigger,
  onLensCameraTrigger,
  onOpenSellerStore,
  onOpenExcerpt
}: ProductCatalogGridProps) {
  // Advanced Filter state
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [escrowType, setEscrowType] = useState<'all' | 'escrow_physical' | 'escrow_digital'>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'likes' | 'price_asc' | 'price_desc' | 'newest'>('likes');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Autocomplete suggestions
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Auto-detect maximum price in current products dataset to calibrate sliders
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.price);
      const maxInDb = Math.max(...prices);
      setMaxPrice(Math.ceil(maxInDb));
    }
  }, [products]);

  // Compute fuzzy & multi-criteria filtering outcome on client state
  const filteredProducts = products.filter(p => {
    // 1. Category Filter
    if (selectedCategory !== "All" && p.category !== selectedCategory) {
      return false;
    }

    // 2. Fuzzy Search Match
    const searchString = `${p.title} ${p.vendor || ""} ${p.description || ""} ${p.category} ${(p.tags || []).join(" ")}`;
    if (!fuzzyMatch(searchString, searchQuery)) {
      return false;
    }

    // 3. Price Filter
    if (p.price < minPrice || p.price > maxPrice) {
      return false;
    }

    // 4. Escrow & Product Type Filter
    if (escrowType !== 'all') {
      const isServiceOrDigital = p.price >= 500 || p.id.includes("wedding") || p.id.includes("livre") || p.tags?.includes("Service") || p.category === "Livre";
      if (escrowType === 'escrow_digital' && !isServiceOrDigital) return false;
      if (escrowType === 'escrow_physical' && isServiceOrDigital) return false;
    }

    // 5. Stock Filter
    if (inStockOnly && (p.stock || 0) <= 0) {
      return false;
    }

    return true;
  });

  // Sort outputs
  const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'likes') {
      return (b.likesCount || 0) - (a.likesCount || 0);
    }
    if (sortBy === 'price_asc') {
      return a.price - b.price;
    }
    if (sortBy === 'price_desc') {
      return b.price - a.price;
    }
    if (sortBy === 'newest') {
      // simulate newest by product ID, falling back to typical chronological indexes
      return b.id.localeCompare(a.id);
    }
    return 0;
  });

  // Calculate dynamic autocomplete suggestions list based on user typing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const matchedSuggestions = new Set<string>();
    const normalizedQuery = searchQuery.trim().toLowerCase();

    // Scan product titles, tags & categories for quick autofill matches
    products.forEach(p => {
      if (p.title.toLowerCase().includes(normalizedQuery)) {
        matchedSuggestions.add(p.title);
      }
      p.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(normalizedQuery)) {
          matchedSuggestions.add(`#${tag}`);
        }
      });
      if (p.category.toLowerCase().includes(normalizedQuery)) {
        matchedSuggestions.add(`Catégorie: ${p.category}`);
      }
    });

    setSuggestions(Array.from(matchedSuggestions).slice(0, 6));
  }, [searchQuery, products]);

  // Handle outside clicks to close suggestion layers safely
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApplySuggestion = (suggestion: string) => {
    let cleanVal = suggestion;
    if (suggestion.startsWith("#")) {
      cleanVal = suggestion.replace("#", "");
    } else if (suggestion.startsWith("Catégorie: ")) {
      cleanVal = suggestion.replace("Catégorie: ", "");
      const matchedCat = ["Electronics", "Food", "Fashion", "Home", "Livre"].find(
        c => c.toLowerCase() === cleanVal.toLowerCase()
      );
      if (matchedCat) {
        setSelectedCategory(matchedCat);
        setSearchQuery("");
        setShowSuggestions(false);
        return;
      }
    }
    setSearchQuery(cleanVal);
    setShowSuggestions(false);
  };

  const handleResetFilters = () => {
    setMinPrice(0);
    setSearchQuery("");
    setEscrowType('all');
    setInStockOnly(false);
    setSelectedCategory("All");
    if (products.length > 0) {
      const maxInDb = Math.max(...products.map(p => p.price));
      setMaxPrice(Math.ceil(maxInDb));
    }
  };

  // Render a responsive loading state with professional shimmering gradients (3D Depth emulation)
  const renderLoadingSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-1">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
        <div 
          key={id} 
          className={`border rounded-3xl p-4 space-y-4 shadow-sm overflow-hidden relative ${
            activeTheme.id === 'sahel-noir'
              ? 'bg-[#09101d] border-emerald-500/10'
              : activeTheme.id === 'terracotta-clay'
              ? 'bg-[#faf8f5] border-[#f0e8dc]'
              : activeTheme.id === 'urban-brutalist'
              ? 'bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]'
              : activeTheme.id === 'abysses'
              ? 'bg-[#031c30] border-cyan-500/15'
              : activeTheme.id === 'glass-water'
              ? 'bg-white/35 border-white/50'
              : 'bg-zinc-900 border-white/5'
          }`}
        >
          {/* Shimmer absolute bar */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          
          <div className="aspect-[16/13] w-full bg-zinc-800/40 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
          
          <div className="space-y-2">
            <div className="h-4 bg-zinc-800/40 dark:bg-zinc-800/40 rounded w-2/3 animate-pulse" />
            <div className="h-3 bg-zinc-800/40 dark:bg-zinc-800/40 rounded w-full animate-pulse" />
            <div className="h-4 bg-zinc-800/40 dark:bg-zinc-800/40 rounded w-1/3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-7">
      
      {/* Search and Action Bar Panel with Autocomplete */}
      <div className="relative space-y-3">
        <div className="relative w-full max-w-2xl mx-auto" ref={suggestionsRef}>
          <div className="relative">
            <Search className={`absolute left-4 top-4 w-4 h-4 ${
              activeTheme.id === 'urban-brutalist' 
                ? 'text-black font-bold' 
                : activeTheme.id === 'terracotta-clay' 
                ? 'text-[#8F3E2B]' 
                : activeTheme.id === 'abysses' 
                ? 'text-cyan-400' 
                : 'text-zinc-400'
            }`} />
            
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder={dict.searchPlaceholder || "Rechercher par mot-clé..."}
              className={`w-full pl-11 pr-28 py-3.5 rounded-2xl focus:outline-none focus:ring-1 text-xs transition-all duration-300 ${
                activeTheme.id === 'sahel-noir'
                  ? 'bg-zinc-900/95 border border-emerald-500/40 text-white focus:ring-[#00FF66] placeholder-zinc-500 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                  : activeTheme.id === 'terracotta-clay'
                  ? 'bg-white border border-[#E8DFD0] text-[#4E2A25] focus:ring-[#8F3E2B] placeholder-[#8F3E2B]/50 shadow-sm'
                  : activeTheme.id === 'urban-brutalist'
                  ? 'bg-white border-2 border-black text-black font-bold focus:ring-black placeholder-zinc-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : activeTheme.id === 'abysses'
                  ? 'bg-[#021424] border border-cyan-500/35 text-white focus:ring-cyan-400 placeholder-slate-500'
                  : activeTheme.id === 'glass-water'
                  ? 'bg-white/55 border border-white text-zinc-900 focus:ring-slate-400 placeholder-zinc-500 shadow-sm backdrop-blur-sm'
                  : 'bg-zinc-900/95 border border-white/10 text-white focus:ring-amber-500 placeholder-zinc-500 shadow-xl'
              }`}
            />

            {/* Clear Button if query present */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-24 top-4 text-zinc-400 hover:text-white transition-colors"
                title="Calculer à zéro"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Micro Action Buttons matching elite code patterns */}
            <div className="absolute right-3.5 top-2 flex items-center gap-1">
              
              {/* Voice Ingestion */}
              {onVoiceTrigger && (
                <button
                  onClick={onVoiceTrigger}
                  className="p-1.5 text-zinc-400 hover:text-amber-500 bg-transparent active:scale-95 transition-all text-xs border border-transparent rounded-lg"
                  title="Commande vocale"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}

              <div className="w-px h-5 bg-white/10 mx-0.5" />

              {/* Camera match */}
              {onLensCameraTrigger && (
                <button
                  onClick={onLensCameraTrigger}
                  className="p-1.5 text-zinc-400 hover:text-cyan-400 bg-transparent active:scale-95 transition-all relative"
                  title="AI Scan"
                >
                  <Camera className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
                </button>
              )}
            </div>
          </div>

          {/* Autocomplete suggestions dropdown panel */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 7 }}
                className={`absolute left-0 right-0 mt-2 rounded-2xl p-2.5 z-50 border shadow-2xl max-h-[280px] overflow-y-auto ${
                  activeTheme.id === 'sahel-noir'
                    ? 'bg-zinc-950 border-emerald-500/30 text-white'
                    : activeTheme.id === 'terracotta-clay'
                    ? 'bg-white border-[#E8DFD0] text-[#4E2A25]'
                    : activeTheme.id === 'urban-brutalist'
                    ? 'bg-white border-2 border-black text-black'
                    : activeTheme.id === 'abysses'
                    ? 'bg-[#021424] border-cyan-500/35 text-sky-100'
                    : activeTheme.id === 'glass-water'
                    ? 'bg-white/95 border border-white text-zinc-800 backdrop-blur-md'
                    : 'bg-zinc-900 border-white/10 text-white'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-mono px-2 py-1 text-zinc-500 border-b border-white/5 pb-1.5 mb-1.5">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-amber-500" /> Suggestions de recherche</span>
                  <span>Auto-completion</span>
                </div>
                <div className="space-y-0.5">
                  {suggestions.map((suggestion, valIdx) => (
                    <button
                      key={valIdx}
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/5 dark:hover:bg-white/5 hover:bg-zinc-100 flex items-center justify-between gap-1 transition-all group"
                    >
                      <span className="flex items-center gap-2 truncate">
                        {suggestion.startsWith("#") ? (
                          <Tag className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                        ) : suggestion.startsWith("Catégorie") ? (
                          <Layers className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                        ) : (
                          <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="truncate">{suggestion}</span>
                      </span>
                      <span className="text-[9px] font-mono opacity-0 group-hover:opacity-100 text-zinc-500 transition-opacity">
                        Remplir
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Categories tag switcher Row: single-row scrollable with left & right arrow triggers */}
        <div className="relative flex items-center w-full max-w-4xl mx-auto px-8 group/cat">
          {/* Scroll Left Button */}
          <button
            onClick={() => {
              const el = document.getElementById("category-scroll-container");
              if (el) el.scrollBy({ left: -200, behavior: "smooth" });
            }}
            className="absolute left-0 z-20 p-2 bg-zinc-950/95 border border-white/10 hover:border-amber-500 rounded-full text-zinc-400 hover:text-amber-500 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer opacity-0 group-hover/cat:opacity-100 duration-300"
            title="Défiler vers la gauche"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Categories Container */}
          <div
            id="category-scroll-container"
            className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scroll-smooth w-full select-none no-scrollbar flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {[
              { tag: "All", label: "Tous les départements", icon: <Layers className="w-3.5 h-3.5" /> },
              { tag: "Artisanat", label: "Art & Artisanat", icon: <BadgePercent className="w-3.5 h-3.5" /> },
              { tag: "Agroalimentaire", label: "Agriculture & Agroalimentaire", icon: <Package className="w-3.5 h-3.5" /> },
              { tag: "Technologie", label: "Technologie & Services Digitaux", icon: <DollarSign className="w-3.5 h-3.5" /> },
              { tag: "Livre", label: "E-Books & Livres", icon: <BookOpen className="w-3.5 h-3.5 text-blue-400" /> },
              { tag: "Sante", label: "Santé & Pharmacopée Naturelle", icon: <Heart className="w-3.5 h-3.5 text-rose-500" /> },
              { tag: "Mode", label: "Mode & Design Africain", icon: <Award className="w-3.5 h-3.5 text-amber-500" /> }
            ].map((item) => (
              <button
                key={item.tag}
                onClick={() => setSelectedCategory(item.tag)}
                className={`px-4 py-2.5 rounded-xl text-[11px] font-bold tracking-tight whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer select-none shrink-0 ${
                  selectedCategory === item.tag
                    ? activeTheme.id === 'abysses'
                      ? "bg-cyan-400 text-zinc-950 border-cyan-400 scale-95 shadow-md font-mono"
                      : activeTheme.id === 'terracotta-clay'
                      ? "bg-[#8F3E2B] text-white border-[#8F3E2B] scale-95 shadow-md font-serif"
                      : activeTheme.id === 'urban-brutalist'
                      ? "bg-black text-white border-black scale-95 shadow-md font-serif"
                      : "bg-amber-500 text-zinc-950 border-amber-500 scale-95 shadow-md"
                    : activeTheme.id === 'sahel-noir'
                    ? "bg-[#09101d] text-zinc-400 border-emerald-500/10 hover:text-white"
                    : activeTheme.id === 'terracotta-clay'
                    ? "bg-[#FCFAF7] text-zinc-600 border-[#E8DFD0] hover:bg-[#FAF6F0]"
                    : activeTheme.id === 'urban-brutalist'
                    ? "bg-white text-zinc-800 border-2 border-black hover:bg-zinc-100"
                    : "bg-zinc-900 text-zinc-400 border-white/5 hover:text-white hover:bg-zinc-850"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => {
              const el = document.getElementById("category-scroll-container");
              if (el) el.scrollBy({ left: 200, behavior: "smooth" });
            }}
            className="absolute right-0 z-20 p-2 bg-zinc-950/95 border border-white/10 hover:border-amber-500 rounded-full text-zinc-400 hover:text-amber-500 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer opacity-0 group-hover/cat:opacity-100 duration-300"
            title="Défiler vers la droite"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Senior Developer Collapsible Filters Bar */}
      <div className={`p-4 rounded-2xl border transition-all ${
        activeTheme.id === 'sahel-noir'
          ? 'bg-zinc-900/50 border-emerald-500/15'
          : activeTheme.id === 'terracotta-clay'
          ? 'bg-[#FCFAF7] border-[#E8DFD0]'
          : activeTheme.id === 'urban-brutalist'
          ? 'bg-white border-2 border-black'
          : activeTheme.id === 'abysses'
          ? 'bg-[#021424]/60 border-cyan-500/15'
          : activeTheme.id === 'glass-water'
          ? 'bg-white/20 border-white/40 shadow-sm backdrop-blur-sm'
          : 'bg-zinc-900/60 border-white/5'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase cursor-pointer border ${
                showFilters 
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                : 'bg-zinc-950/20 hover:bg-zinc-950/45 text-zinc-400 border-white/5'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Multi-critères {showFilters ? 'ouvert' : 'filtrer'}</span>
            </button>
            
            {/* Show Badge Count of filters applied */}
            {(minPrice > 0 || escrowType !== 'all' || inStockOnly) && (
              <span className="bg-amber-500 text-zinc-950 text-[9px] font-mono px-2 py-0.5 rounded-full font-black animate-pulse">
                Actifs
              </span>
            )}
          </div>

          {/* Quick sorting dropdown select with zero trashy icons */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 font-mono text-[10px] uppercase">Ranger :</span>
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className={`pl-2 pr-8 py-1.5 rounded-xl text-[10px] font-bold font-mono tracking-tight appearance-none border focus:outline-none cursor-pointer ${
                  activeTheme.id === 'sahel-noir'
                    ? 'bg-[#09101d] border-emerald-500/20 text-emerald-400'
                    : activeTheme.id === 'terracotta-clay'
                    ? 'bg-white border-[#E8DFD0] text-[#8F3E2B]'
                    : activeTheme.id === 'urban-brutalist'
                    ? 'bg-white border-2 border-black text-black'
                    : activeTheme.id === 'abysses'
                    ? 'bg-[#021424] border-cyan-500/35 text-cyan-400'
                    : 'bg-zinc-950 border-white/10 text-amber-500'
                }`}
              >
                <option value="likes">Mieux Aimés</option>
                <option value="price_asc">Prix : Bas à Élevé</option>
                <option value="price_desc">Prix : Élevé à Bas</option>
                <option value="newest">Derniers Ajouts</option>
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2.5 pointer-events-none text-zinc-500" />
            </div>
          </div>
        </div>

        {/* Collapsible Panel with custom Range and Switch sliders */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 mt-3 border-t border-white/5 text-xs">
                
                {/* Min Price Slider */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Prix Minimum : <span className="font-bold text-amber-500">{minPrice} USD</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={minPrice}
                    onChange={(e) => setMinPrice(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-zinc-950 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                    <span>0 USD</span>
                    <span>1000+ USD</span>
                  </div>
                </div>

                {/* Maximum Price threshold */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Prix Maximum : <span className="font-bold text-amber-500">{maxPrice} USD</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-zinc-950 rounded-lg cursor-pointer animate-none"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                    <span>100 USD</span>
                    <span>5000 USD</span>
                  </div>
                </div>

                {/* Multi-rail Escrow Category filtering options */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Type de Séquestre :
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { key: 'all', label: 'Indifférent' },
                      { key: 'escrow_physical', label: 'Séquestre Physique (Livraison)' },
                      { key: 'escrow_digital', label: 'Séquestre Électronique (Service)' }
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setEscrowType(opt.key as any)}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-medium border flex items-center justify-between cursor-pointer transition-all ${
                          escrowType === opt.key
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                            : 'bg-zinc-950/20 border-white/5 text-zinc-400 hover:bg-zinc-950/40'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {escrowType === opt.key && <Check className="w-3 h-3 text-amber-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock availability & reset switch */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/20 border border-white/5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">En main uniquement</span>
                    <button
                      onClick={() => setInStockOnly(!inStockOnly)}
                      className={`w-10 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                        inStockOnly ? 'bg-amber-500' : 'bg-zinc-800'
                      }`}
                    >
                      <div className={`bg-zinc-950 w-5 h-5 rounded-full shadow-md transform duration-300 ${
                        inStockOnly ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Reset All Filters Button */}
                  <button
                    onClick={handleResetFilters}
                    className="w-full py-2 bg-[#8F3E2B]/10 hover:bg-[#8F3E2B]/20 border border-[#8F3E2B]/20 text-[#8F3E2B] font-mono font-bold text-[9.5px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Réinitialiser les filtres</span>
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RENDER DYNAMIC CATALOG GRID */}
      {loading ? (
        renderLoadingSkeletons()
      ) : selectedCategory === "Livre" ? (
        /* STUNNING CUSTOM E-BOOK STORE LANDSCAPE */
        <div className="space-y-8">
          {/* Elegant Book Store Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/10 bg-gradient-to-r from-zinc-950 via-zinc-900/60 to-zinc-950 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
            <div className="space-y-1.5 max-w-xl text-left">
              <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase font-black flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5" /> BIBLIOTHÈQUE NUMÉRIQUE • KUFULULA SOKO
              </span>
              <h3 className="text-sm font-sans font-black text-white uppercase tracking-tight">
                Portail des Savoirs, Littérature & Récits d'Afrique Centrale
              </h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                Accédez à nos e-books exclusifs sur l'administration locale, les récits de l'ancien Kongo et le développement d'affaires. Lisez un extrait instantanément avant de débloquer l'oeuvre complète via notre séquestre sécurisé.
              </p>
            </div>
            <div className="flex gap-2 shrink-0 font-mono text-[10px]">
              <span className="px-3.5 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-bold flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> PDF & EPUB
              </span>
              <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Séquestre Direct
              </span>
            </div>
          </div>

          {/* E-Bookshelf Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {sortedAndFilteredProducts.map((p) => {
              const bookId = p.id.includes("zaire") ? "zaire" : p.id.includes("wolf") ? "wolf" : "zaire";
              return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -6, rotate: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col justify-between p-4 bg-zinc-950/40 border border-white/5 hover:border-blue-500/25 rounded-2xl shadow-xl hover:shadow-[0_15px_30px_-5px_rgba(59,130,246,0.15)] transition-all h-[420px]"
                >
                  {/* 3D Book Cover Stage */}
                  <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden shadow-[3px_5px_12px_rgba(0,0,0,0.6)] flex mb-3 group/book">
                    {/* Spine Cover Overlay */}
                    <div className="w-[12px] bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 shrink-0 border-r border-white/10 z-10" />
                    
                    {/* Book Image Cover */}
                    <div className="flex-1 relative bg-zinc-900 overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover/book:scale-105 transition-transform duration-500"
                      />
                      {/* Gradient Shadow Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/10" />
                    </div>

                    {/* Book Badge (Format) */}
                    <span className="absolute top-2.5 right-2.5 bg-zinc-950/90 border border-white/10 text-blue-400 text-[8px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-md z-10">
                      E-Book
                    </span>

                    {/* Quick Hover Actions Menu */}
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm opacity-0 group-hover/book:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4 gap-3 z-20">
                      <span className="text-[9px] font-mono font-black text-blue-400 uppercase tracking-widest">
                        Option de lecture
                      </span>
                      <button
                        onClick={() => onOpenExcerpt && onOpenExcerpt(bookId)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Lire l'extrait
                      </button>
                      <button
                        onClick={() => onAddToCart(p)}
                        className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Acheter ($ {p.price})
                      </button>
                    </div>
                  </div>

                  {/* Book Metadata */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-sans font-black text-white uppercase tracking-tight line-clamp-1">
                      {p.title}
                    </h4>
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-[#FF8C00] truncate max-w-[120px] font-bold">
                        {p.vendor}
                      </span>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ${p.price.toLocaleString("fr-FR")} USD
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : sortedAndFilteredProducts.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-1">
            {sortedAndFilteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpenDetails={onOpenDetails}
                onAddToCart={onAddToCart}
                dict={dict}
                activeTheme={activeTheme}
                onOpenSellerStore={onOpenSellerStore}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Empty Results fallback */
        <div className={`py-12 text-center rounded-3xl p-6 border space-y-4 ${
          activeTheme.id === 'sahel-noir'
            ? 'bg-[#09101d] border-emerald-500/15'
            : activeTheme.id === 'terracotta-clay'
            ? 'bg-[#FCFAF7] border-[#E8DFD0]'
            : 'bg-zinc-900/50 border-white/5'
        }`}>
          <AlertCircle className="w-10 h-10 text-amber-500/60 mx-auto animate-bounce" />
          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-sm font-extrabold uppercase tracking-tight">
              {dict.noProductFound || 'Aucun résultat trouvé'}
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-mono">
              {dict.noProductSub || 'Ajustez les termes de recherche, le fardeau des prix ou l\'option de séquestre.'}
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-zinc-950/50 hover:bg-zinc-950 border border-white/5 hover:border-amber-500/20 text-zinc-400 hover:text-amber-500 font-mono font-bold text-[9.5px] uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Réinitialiser la recherche (Fuzzy match)</span>
          </button>
        </div>
      )}

    </div>
  );
}
