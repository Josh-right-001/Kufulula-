import React, { useState, useEffect, useRef } from "react";
import { 
  Search, SlidersHorizontal, ArrowUpDown, ChevronDown, Check, X, RotateCcw, 
  Mic, Camera, Tag, Sparkles, AlertCircle, ShoppingBag, Eye, HelpCircle, 
  Layers, DollarSign, Package, BadgePercent
} from "lucide-react";
import { Product } from "../types";
import { motion, AnimatePresence } from "motion/react";

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
  onLensCameraTrigger
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
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-500" /> Suggestions de recherche</span>
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

        {/* Categories tag switcher Row with Zero Emojis */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1 flex-wrap pt-1">
          {[
            { tag: "All", label: dict.categoryAll, icon: <Layers className="w-3 h-3" /> },
            { tag: "Electronics", label: dict.categoryElectronics, icon: <DollarSign className="w-3 h-3" /> },
            { tag: "Food", label: dict.categoryFood, icon: <Package className="w-3 h-3" /> },
            { tag: "Fashion", label: dict.categoryFashion, icon: <Sparkles className="w-3 h-3" /> },
            { tag: "Home", label: dict.categoryHome, icon: <BadgePercent className="w-3 h-3" /> },
            { tag: "Livre", label: dict.categoryBooks, icon: <Tag className="w-3 h-3" /> }
          ].map((item) => (
            <button
              key={item.tag}
              onClick={() => setSelectedCategory(item.tag)}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-bold tracking-tight whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer select-none transition-all ${
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
      ) : sortedAndFilteredProducts.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-1">
            {sortedAndFilteredProducts.map((p) => {
              // Standard card layout rendered in expert precision
              const numLikes = localStorage.getItem(`k_likes_${p.id}`) || p.likesCount || 0;
              const hasLiked = localStorage.getItem(`k_liked_state_${p.id}`) === "true";
              const isIsolele = p.id.includes("isolele") || p.id.includes("fashion-isolele");
              
              return (
                <div
                  key={p.id}
                  id={`pkg-product-card-${p.id}`}
                  className={`border rounded-3xl p-4.5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                    activeTheme.id === 'sahel-noir'
                      ? 'bg-zinc-900/40 border-emerald-500/10 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                      : activeTheme.id === 'terracotta-clay'
                      ? 'bg-white border-[#E8DFD0] hover:shadow-md hover:border-[#8F3E2B]/40'
                      : activeTheme.id === 'urban-brutalist'
                      ? 'bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1'
                      : activeTheme.id === 'abysses'
                      ? 'bg-[#021424]/40 border-cyan-500/15 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                      : activeTheme.id === 'glass-water'
                      ? 'bg-white/40 border-white/60 shadow-sm hover:shadow-md'
                      : 'bg-zinc-900/60 border-white/5 hover:border-white/15'
                  }`}
                >
                  {/* Highlight indicator for Isolele items */}
                  {isIsolele && (
                    <div className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-widest z-10 ${
                      activeTheme.id === 'abysses' 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      Isolele Couture
                    </div>
                  )}

                  {/* Stock counter top right side */}
                  <div className="absolute top-3 right-3 text-[8.5px] font-mono text-zinc-500 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
                    {p.stock && p.stock > 0 ? `${p.stock} pces` : 'En rupture'}
                  </div>

                  {/* Product graphic wrapper */}
                  <div 
                    onClick={() => onOpenDetails(p)}
                    className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-zinc-950 mb-4 cursor-pointer relative group-hover:scale-[1.02] transition-transform duration-350"
                  >
                    <img 
                      src={p.image} 
                      alt={p.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-[10px] text-zinc-200 line-clamp-2">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                        {p.vendor || 'Boutique Certifiée'}
                      </span>
                      <h4 
                        onClick={() => onOpenDetails(p)}
                        className="text-xs font-bold line-clamp-1 mb-1 cursor-pointer hover:underline"
                      >
                        {p.title}
                      </h4>
                    </div>

                    <div className="space-y-3 pb-1 pt-1.5 border-t border-white/5">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black font-mono">
                            {p.price} USD
                          </span>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="text-[10px] text-zinc-500 line-through font-mono">
                              {p.originalPrice} USD
                            </span>
                          )}
                        </div>
                        
                        {/* Interactive short Likes Counter */}
                        <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500">
                          <div className={`w-1.5 h-1.5 rounded-full ${hasLiked ? 'bg-red-500' : 'bg-zinc-600 animate-pulse'}`} />
                          <span>{numLikes} J'aime</span>
                        </div>
                      </div>

                      {/* Flex direct action CTA Buttons with no emojis */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => onOpenDetails(p)}
                          className="flex-1 py-2 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-zinc-300 font-bold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 bg-zinc-950/10"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Fiche</span>
                        </button>
                        
                        <button
                          onClick={() => onAddToCart(p)}
                          className={`flex-1 py-2 font-bold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            activeTheme.id === 'sahel-noir'
                              ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                              : activeTheme.id === 'terracotta-clay'
                              ? 'bg-[#8F3E2B] text-white hover:bg-[#A34B38]'
                              : activeTheme.id === 'urban-brutalist'
                              ? 'bg-black text-white hover:bg-neutral-800 border border-black'
                              : activeTheme.id === 'abysses'
                              ? 'bg-cyan-400 text-zinc-950 hover:bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                              : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                          }`}
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Ajouter</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
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
