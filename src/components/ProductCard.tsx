import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Eye, Flame, Heart, MessageCircle, Share2, 
  Handshake, Send, Check, AlertCircle, ShoppingBag,
  Facebook, Twitter, Instagram, Link, MessageSquare, Smartphone, Mail, Camera
} from "lucide-react";
import { Product } from "../types";
import { TranslationDictionary } from "../lib/translations";
import { KDb } from "../lib/firebase";

interface ProductCardProps {
  key?: any;
  product: Product;
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  dict: TranslationDictionary;
  activeTheme?: any;
  onOpenSellerStore?: (vendorName: string) => void;
}

const getCategoryFallbackImage = (category: string, id: string): string => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % 3;
  
  const electronics = [
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=800&auto=format&fit=crop"
  ];
  const food = [
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop"
  ];
  const fashion = [
    "https://images.unsplash.com/photo-1566207274740-0f8cf6b7d5a5?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop"
  ];
  const home = [
    "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=800&auto=format&fit=crop"
  ];
  const book = [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop"
  ];

  const cat = (category || "").toLowerCase();
  if (cat.includes("food") || cat.includes("agro") || cat.includes("alimen")) {
    return food[index];
  } else if (cat.includes("fash") || cat.includes("mod")) {
    return fashion[index];
  } else if (cat.includes("elect") || cat.includes("tech")) {
    return electronics[index];
  } else if (cat.includes("home") || cat.includes("art") || cat.includes("decor")) {
    return home[index];
  } else if (cat.includes("book") || cat.includes("livr") || cat.includes("educ")) {
    return book[index];
  }
  return electronics[0];
};

export default function ProductCard({ product, onOpenDetails, onAddToCart, dict, activeTheme, onOpenSellerStore }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(product.image || "");

  useEffect(() => {
    if (product.image) {
      setImgSrc(product.image);
    }
  }, [product.image]);
  const isCdf = product.currency === "CDF";
  
  // Real Interactive counters backed by state and localStorage synched
  const [likes, setLikes] = useState<number>(() => {
    const saved = localStorage.getItem(`k_likes_${product.id}`);
    return saved ? parseInt(saved) : (product.likesCount || 0);
  });
  const [isLiked, setIsLiked] = useState<boolean>(() => {
    return localStorage.getItem(`k_liked_state_${product.id}`) === "true";
  });

  const [commentsList, setCommentsList] = useState<any[]>(() => {
    const saved = localStorage.getItem(`k_comments_${product.id}`);
    return saved ? JSON.parse(saved) : (product.comments || []);
  });

  // Sync state with database-loaded product properties
  useEffect(() => {
    if (product.likesCount !== undefined) {
      setLikes(product.likesCount);
    }
  }, [product.likesCount]);

  useEffect(() => {
    if (product.comments !== undefined) {
      setCommentsList(product.comments);
    }
  }, [product.comments]);

  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [commenterName, setCommenterName] = useState("");
  const [newCommentTag, setNewCommentTag] = useState("");
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Negotiate simulator states (AI-Powered Congo Bargaining Chat)
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [customerOffer, setCustomerOffer] = useState<string>("");
  const [negotiationMessage, setNegotiationMessage] = useState<string>("");
  const [negotiationStep, setNegotiationStep] = useState<'idle' | 'offered' | 'success' | 'rejected' | 'negotiating' | 'accepted'>('idle');
  const [merchantReply, setMerchantReply] = useState("");
  const [finalAgreedPrice, setFinalAgreedPrice] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'merchant'; text: string }[]>([]);
  const [isNegotiatingAPI, setIsNegotiatingAPI] = useState(false);

  // Share overlay toast
  const [showShareToast, setShowShareToast] = useState(false);

  // Save changes to localStorage and KDb
  const updateLikesInDB = async (newLikes: number, likedState: boolean) => {
    setLikes(newLikes);
    setIsLiked(likedState);
    localStorage.setItem(`k_likes_${product.id}`, newLikes.toString());
    localStorage.setItem(`k_liked_state_${product.id}`, likedState ? "true" : "false");
    await KDb.updateProductInteractions(product.id, newLikes, commentsList);
  };

  const handleLikeToggle = () => {
    const nextLiked = !isLiked;
    const nextLikes = isLiked ? Math.max(0, likes - 1) : likes + 1;
    updateLikesInDB(nextLikes, nextLiked);
    
    // Synchronize k_persistent_favorites
    let favList: Product[] = [];
    const stored = localStorage.getItem("k_persistent_favorites");
    if (stored) {
      try { favList = JSON.parse(stored); } catch(e) {}
    }
    if (nextLiked) {
      if (!favList.some(p => p.id === product.id)) {
        favList.push(product);
      }
    } else {
      favList = favList.filter(p => p.id !== product.id);
    }
    localStorage.setItem("k_persistent_favorites", JSON.stringify(favList));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("La taille de l'image ne doit pas dépasser 2 Mo.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCommentImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    const updatedComments = commentsList.map(c => {
      if (c.id === commentId) {
        const likedUsers = c.likedUsers || [];
        const alreadyLiked = likedUsers.includes("visitor_user");
        let nextLikedUsers = [...likedUsers];
        let nextLikes = c.likes || 0;
        
        if (alreadyLiked) {
          nextLikedUsers = nextLikedUsers.filter((u: string) => u !== "visitor_user");
          nextLikes = Math.max(0, nextLikes - 1);
        } else {
          nextLikedUsers.push("visitor_user");
          nextLikes += 1;
        }
        
        return {
          ...c,
          likes: nextLikes,
          likedUsers: nextLikedUsers
        };
      }
      return c;
    });

    setCommentsList(updatedComments);
    localStorage.setItem(`k_comments_${product.id}`, JSON.stringify(updatedComments));
    await KDb.updateProductInteractions(product.id, likes, updatedComments);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() && !commentImage) return;

    let customTags: string[] = [];
    if (newCommentTag.trim()) {
      customTags = newCommentTag.trim().split(/[\s,]+/).map(t => {
        const trimmed = t.trim();
        return (trimmed.startsWith('@') || trimmed.startsWith('#')) ? trimmed : `@${trimmed}`;
      });
    }

    const newCommentObj = {
      id: "comment-" + Date.now(),
      user: commenterName.trim() || "Visiteur anonyme",
      text: newCommentText.trim(),
      tags: customTags,
      date: new Date().toISOString().split("T")[0],
      image: commentImage || undefined,
      likes: 0,
      likedUsers: []
    };

    const updatedComments = [newCommentObj, ...commentsList];
    setCommentsList(updatedComments);
    setNewCommentText("");
    setCommenterName("");
    setNewCommentTag("");
    setCommentImage(null);
    localStorage.setItem(`k_comments_${product.id}`, JSON.stringify(updatedComments));
    await KDb.updateProductInteractions(product.id, likes, updatedComments);
  };

  // Negotiation Logic (Congo Bargaining Simulator powered by Gemini Chat API)
  const handleNegotiatePrice = async () => {
    const offerNum = parseFloat(customerOffer);
    if (isNaN(offerNum) || offerNum <= 0) {
      setNegotiationStep('rejected');
      setMerchantReply("Ah ! S'il vous plaît, proposez un vrai prix en chiffres !");
      return;
    }

    setIsNegotiatingAPI(true);
    setNegotiationStep('offered');

    const roundedOffer = Math.round(offerNum);
    const offerMsg = negotiationMessage.trim();
    const userDisplayMsg = `Offre de ${roundedOffer}${isCdf ? ' CDF' : '$'} : "${offerMsg || 'Je propose ce prix, soyons d\'accord ndeko !'}"`;

    const updatedHistory = [...chatHistory, { sender: 'user' as const, text: userDisplayMsg }];
    setChatHistory(updatedHistory);

    try {
      const response = await fetch("/api/gemini/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          title: product.title,
          originalPrice: product.price,
          vendor: product.vendor,
          currency: product.currency,
          offerPrice: roundedOffer,
          message: offerMsg,
          chatHistory: chatHistory
        })
      });

      const data = await response.json();
      if (data.success) {
        setMerchantReply(data.reply);
        setFinalAgreedPrice(data.counterOffer);
        // Translate API state to match our local states
        if (data.status === 'accepted') {
          setNegotiationStep('success');
        } else if (data.status === 'rejected') {
          setNegotiationStep('rejected');
        } else {
          setNegotiationStep('negotiating');
        }
        setChatHistory([...updatedHistory, { sender: 'merchant' as const, text: data.reply }]);
      } else {
        throw new Error(data.error || "Bargaining failed");
      }
    } catch (err) {
      console.warn("Negotiation API error, falling back to offline rules:", err);
      const priceBase = product.price;
      const lowerLimit = priceBase * 0.70;
      let reply = "";
      let status: 'success' | 'rejected' | 'negotiating' = 'negotiating';
      let finalPrice = Math.round(priceBase * 0.85);

      if (offerNum >= priceBase) {
        status = 'success';
        reply = `Toya ! C'est parfait, c'est le prix d'achat initial. Ajoute l'article directement au panier !`;
        finalPrice = priceBase;
      } else if (offerNum >= lowerLimit) {
        status = 'success';
        reply = `Hmm, tu es un négociateur féroce ! C'est difficile pour moi de baisser mais comme Kufulula sécurise notre transaction, je valide de bon cœur pour ${offerNum}${isCdf ? ' CDF' : '$'}. Toyokana !`;
        finalPrice = offerNum;
      } else if (offerNum >= priceBase * 0.50) {
        status = 'negotiating';
        finalPrice = Math.round(priceBase * 0.80);
        reply = `Ah ndeko, ${offerNum}${isCdf ? ' CDF' : '$'} c'est serré pour ce produit de qualité supérieure. Coupons la poire en deux à ${finalPrice}${isCdf ? ' CDF' : '$'} ? C'est honnête.`;
      } else {
        status = 'rejected';
        reply = `Wapi ndeko ! Offrir ${offerNum}${isCdf ? ' CDF' : '$'} pour un produit de ${priceBase}${isCdf ? ' CDF' : '$'} ? Tu veux me ruiner ! Fais un vrai effort décent.`;
      }

      setMerchantReply(reply);
      setFinalAgreedPrice(finalPrice);
      setNegotiationStep(status);
      setChatHistory([...updatedHistory, { sender: 'merchant' as const, text: reply }]);
    } finally {
      setIsNegotiatingAPI(false);
      setNegotiationMessage("");
    }
  };

  const handleAddNegotiatedToCart = () => {
    const negotiatedItem = {
      ...product,
      price: finalAgreedPrice || product.price,
      title: `${product.title} (Négocié)`
    };
    onAddToCart(negotiatedItem);
    setShowNegotiation(false);
    setNegotiationStep('idle');
    setCustomerOffer("");
    setChatHistory([]);
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  return (
    <motion.div
      layoutId={`card-container-${product.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col justify-between overflow-hidden ${activeTheme ? activeTheme.cardClass : "bg-zinc-950/80 border border-zinc-850"} rounded-2xl p-4 shadow-xl text-white backdrop-blur-md`}
    >
      
      {/* Product Image Stage */}
      <div 
        onClick={(e) => {
          // If the target is the button or contains it, let it zoom details instead
          const isZoomBtn = (e.target as HTMLElement).closest('.zoom-btn');
          if (!isZoomBtn && onOpenSellerStore && product.vendor) {
            onOpenSellerStore(product.vendor);
          } else {
            onOpenDetails(product);
          }
        }}
        className="relative aspect-[16/13] w-full bg-black rounded-xl overflow-hidden mb-3 cursor-pointer group/img-stage"
      >
        <motion.img
          layoutId={`card-img-${product.id}`}
          src={imgSrc}
          onError={() => {
            setImgSrc(getCategoryFallbackImage(product.category, product.id));
          }}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img-stage:scale-105"
        />

        {/* Live Floating Indicators */}
        {product.stock <= 10 && (
          <div className="absolute top-2.5 left-2.5 bg-red-600/90 text-white text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
            <Flame className="w-3 h-3 animate-pulse text-amber-300" />
            Reste {product.stock}
          </div>
        )}

        <div className="absolute top-2.5 right-2.5 bg-zinc-900/90 border border-white/10 text-amber-500 text-[8px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-md">
          {product.category}
        </div>

        {/* Image Spec glance hover effect */}
        <button
          onClick={() => onOpenDetails(product)}
          className="zoom-btn absolute inset-x-0 bottom-0 py-2 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] font-mono font-semibold tracking-wide text-amber-500 text-center uppercase"
        >
          Spécification de l'article • Zoom
        </button>
      </div>

      {/* Main product information */}
      <div className="space-y-1">
        <div className="flex justify-between items-start gap-2">
          <h3 
            onClick={() => onOpenDetails(product)}
            className="font-sans text-sm font-extrabold text-white hover:text-amber-500 cursor-pointer transition-colors line-clamp-1 flex-1 tracking-tight"
          >
            {product.title}
          </h3>
          <span className="font-mono text-xs font-bold text-amber-500 shrink-0">
            {isCdf ? `${product.price.toLocaleString("fr-FR")} CDF` : `$${product.price}`}
          </span>
        </div>

        {product.originalPrice && (
          <div className="flex gap-2 items-center text-[10px] filter saturate-150">
            <span className="font-mono line-through text-zinc-500">
              {isCdf ? `${product.originalPrice.toLocaleString("fr-FR")} CDF` : `$${product.originalPrice}`}
            </span>
            <span className="text-[9px] text-green-500 font-mono font-semibold">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 105)}%
            </span>
          </div>
        )}

        <p className="text-zinc-400 text-[11.5px] leading-relaxed line-clamp-2 pb-2">
          {product.description}
        </p>
      </div>

      {/* INSTAGRAM & COMMERCE GRID ACTION TRAY */}
      <div className="mt-auto space-y-3 pt-3 border-t border-zinc-900">
        
        {/* Row 1: Large Prominent Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl font-mono text-xs font-black tracking-wider flex items-center justify-center gap-2 transition-all shadow-md uppercase active:scale-95"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{dict.addToCart}</span>
        </button>

        {/* Row 2: Instagram-style Reaction Tray */}
        <div className="grid grid-cols-4 gap-1 text-[11px] font-mono border-t border-zinc-900/50 pt-2.5">
          
          {/* Reaction 1: Like Button */}
          <button
            onClick={handleLikeToggle}
            className={`flex flex-col items-center gap-1.5 py-1.5 rounded-lg transition-colors hover:bg-zinc-900 select-none ${
              isLiked ? "text-red-500" : "text-zinc-400"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
            <span>{likes}</span>
          </button>

          {/* Reaction 2: Comment Button */}
          <button
            onClick={() => {
              setShowComments(!showComments);
              setShowNegotiation(false);
            }}
            className={`flex flex-col items-center gap-1.5 py-1.5 rounded-lg transition-colors hover:bg-zinc-900 ${
              showComments ? "text-amber-500" : "text-zinc-400"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{commentsList.length}</span>
          </button>

          {/* Reaction 3: Share Button */}
          <button
            onClick={handleShareClick}
            className={`flex flex-col items-center gap-1.5 py-1.5 rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 ${
              showShareToast ? "text-cyan-400" : ""
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>{showShareToast ? "Copié !" : "Share"}</span>
          </button>

          {/* Reaction 4: Negotiate (Bargain) Button */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('openNegotiation', { detail: product }));
            }}
            className={`flex flex-col items-center gap-1.5 py-1.5 rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-[#FF8C00]`}
          >
            <Handshake className="w-4 h-4 text-[#FF8C00]" />
            <span className="text-[#FF8C00] font-semibold">{dict.negotiate}</span>
          </button>

        </div>

        {/* Vendor cert line */}
        <div className="text-[9px] font-mono text-zinc-500 flex justify-between items-center bg-zinc-900/40 p-2 rounded-lg border border-zinc-900/50">
          <span>Certifié : {product.vendor}</span>
          <span className="text-zinc-600 block">K-Trust Core</span>
        </div>
      </div>

      {/* EXPANDABLE COMMENTS AREA (Inline Real Comments Flow) */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-2 bg-zinc-900/90 rounded-xl p-3 border border-zinc-800 space-y-2 text-xs"
          >
            <div className="flex justify-between items-center pb-1.5 border-b border-zinc-805">
              <span className="font-bold text-amber-500 text-[10px] uppercase font-mono">Discussions en direct ({commentsList.length})</span>
              <button 
                onClick={() => setShowComments(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* List of comments scrolling */}
            <div className="max-h-56 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {commentsList.length > 0 ? (
                commentsList.map((c) => {
                  const hasLikedComment = c.likedUsers?.includes("visitor_user");
                  return (
                    <div key={c.id} className="text-[10px] leading-normal pb-2 border-b border-zinc-900/50 flex items-start gap-2 justify-between animate-none">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-zinc-400 font-semibold mb-0.5">
                          <span>{c.user}</span>
                          <span className="text-[8px] text-zinc-600">•</span>
                          <span className="text-[8px] text-zinc-500">{c.date}</span>
                        </div>
                        <p className="text-zinc-250 italic font-sans">"{c.text}"</p>
                        
                        {c.image && (
                          <div className="mt-1.5 max-w-[140px] rounded-lg overflow-hidden border border-zinc-800/80 shadow-md">
                            <img src={c.image} alt="Pièce jointe" className="w-full h-auto object-cover max-h-[100px]" referrerPolicy="no-referrer" />
                          </div>
                        )}

                        {c.tags && c.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {c.tags.map((tg: string, idx: number) => (
                              <span 
                                key={idx} 
                                className={`text-[8px] px-1 py-0.5 rounded font-mono font-semibold ${
                                  tg.startsWith('#') 
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                }`}
                              >
                                {tg}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Small comment like button on right side */}
                      <button
                        type="button"
                        onClick={() => handleLikeComment(c.id)}
                        className={`flex flex-col items-center gap-0.5 shrink-0 px-1 py-1 rounded hover:bg-zinc-950/40 transition-colors select-none ${
                          hasLikedComment ? "text-red-500" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                        title="Aimer le commentaire"
                      >
                        <Heart className={`w-3 h-3 ${hasLikedComment ? "fill-red-500" : ""}`} />
                        <span className="text-[8px] font-mono">{c.likes || 0}</span>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-zinc-600 italic">Aucun commentaire. Soyez le premier à commenter !</div>
              )}
            </div>

            {/* Insert form comment */}
            <form onSubmit={handlePostComment} className="pt-2 border-t border-zinc-805 space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={commenterName}
                  onChange={(e) => setCommenterName(e.target.value)}
                  placeholder="Votre nom (ex: Kabasele)"
                  className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-500 text-white"
                />
                <input
                  type="text"
                  value={newCommentTag}
                  onChange={(e) => setNewCommentTag(e.target.value)}
                  placeholder="Tag d'ami (ex: @jean, #wax)"
                  className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-500 text-white"
                />
              </div>

              {commentImage && (
                <div className="relative inline-block mt-1">
                  <img src={commentImage} alt="Preview comment attachment" className="w-12 h-12 object-cover rounded-lg border border-zinc-700" />
                  <button
                    type="button"
                    onClick={() => setCommentImage(null)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[8px] font-bold hover:bg-red-500"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex gap-1.5 items-center">
                <label className="flex items-center justify-center p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer text-zinc-500 hover:text-amber-500 transition-colors shrink-0" title="Ajouter une photo">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={commentImage ? "Décrivez cette photo..." : "Écrire un commentaire..."}
                  className="flex-1 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-500 text-white"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim() && !commentImage}
                  className="px-2.5 py-1 bg-amber-500 text-zinc-950 rounded hover:bg-amber-600 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXPANDABLE CONGO BARGAINING / NEGOTIATION SIMULATOR (GEMINI REAL-TIME CHAT) */}
      <AnimatePresence>
        {showNegotiation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-2 bg-[#170e0a] rounded-xl p-3 border border-amber-900/30 space-y-3 text-xs"
          >
            <div className="flex justify-between items-center pb-1.5 border-b border-amber-950/40">
              <span className="font-bold text-amber-500 text-[10.5px] uppercase font-mono flex items-center gap-1.5">
                <Handshake className="w-3.5 h-3.5 animate-pulse" />
                Discussion Prix : Papa {product.vendor.split(" ")[0]}
              </span>
              <button 
                onClick={() => {
                  setShowNegotiation(false);
                  setNegotiationStep('idle');
                }}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Chat message bubbles scroll window */}
            <div className="max-h-48 overflow-y-auto space-y-2.5 p-2 rounded-lg bg-zinc-950/70 border border-zinc-900/60 flex flex-col custom-scrollbar">
              {/* Default Welcome bubble */}
              <div className="max-w-[90%] self-start bg-zinc-900 text-zinc-100 rounded-2xl rounded-tl-none px-3 py-2 border border-zinc-800 text-[10.5px] leading-relaxed">
                <div className="text-[9px] text-amber-500 font-bold mb-0.5">Papa {product.vendor}</div>
                <p className="italic font-sans text-zinc-300">
                  "Mbote ndeko (Bonjour mon ami) ! Toyokana ! Je vends cet excellent produit de qualité pour d'habitude <span className="text-amber-400 font-semibold">{isCdf ? `${product.price.toLocaleString()} CDF` : `$${product.price}`}</span>.
                  Dis-moi, quelle est ton offre décente et ton petit mot doux pour me convaincre de baisser le prix ?"
                </p>
              </div>

              {/* Chat history mapping */}
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-[10.5px] leading-relaxed ${
                    msg.sender === "user"
                      ? "self-end bg-amber-600/25 text-amber-100 rounded-tr-none border border-amber-500/15"
                      : "self-start bg-zinc-900 text-zinc-200 rounded-tl-none border border-zinc-850"
                  }`}
                >
                  <div className="text-[9px] font-bold mb-0.5 text-zinc-400">
                    {msg.sender === "user" ? "Vous" : `Papa ${product.vendor.split(" ")[0]}`}
                  </div>
                  <p className={msg.sender === "merchant" ? "italic font-sans text-zinc-300" : "font-sans"}>
                    {msg.sender === "user" ? msg.text : `"${msg.text}"`}
                  </p>
                </div>
              ))}

              {/* Real-time typing reflection spinner */}
              {isNegotiatingAPI && (
                <div className="self-start max-w-[75%] bg-zinc-900/60 rounded-2xl rounded-tl-none px-3 py-2 border border-zinc-850 text-[10px] text-zinc-400 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="italic font-mono">Le commerçant calcule sa marge...</span>
                </div>
              )}
            </div>

            {/* Decision/Input actions container */}
            {negotiationStep === 'success' ? (
              <div className="space-y-2 pt-1 border-t border-amber-950/20 text-center">
                <div className="py-2 px-3 bg-green-950/30 border border-green-950 rounded-lg">
                  <p className="text-[10.5px] text-green-400 font-mono font-semibold flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4 text-green-500" />
                    Offre validée : {isCdf ? `${finalAgreedPrice?.toLocaleString()} CDF` : `$${finalAgreedPrice}`} !
                  </p>
                  <p className="text-[9.5px] text-zinc-400 mt-1">
                    Papa {product.vendor.split(" ")[0]} a accepté votre offre. Ajoutez-le directement au panier !
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleAddNegotiatedToCart}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-mono font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Ajouter au panier négocié
                  </button>
                  <button
                    onClick={() => {
                      setNegotiationStep('idle');
                      setCustomerOffer("");
                      setChatHistory([]);
                    }}
                    className="px-3 bg-zinc-900 text-zinc-400 hover:bg-zinc-850 rounded-lg text-[9px] font-mono uppercase cursor-pointer"
                  >
                    Recommencer
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-1.5 border-t border-amber-950/20">
                <div className="flex gap-2">
                  {/* Numeric price offer block */}
                  <div className="w-1/3 relative">
                    <span className="absolute left-2.5 top-2 text-zinc-500 font-mono text-[10px]">
                      {isCdf ? "FC" : "$"}
                    </span>
                    <input
                      type="number"
                      required
                      value={customerOffer}
                      onChange={(e) => setCustomerOffer(e.target.value)}
                      placeholder="Ex: 40"
                      className="w-full pl-6 pr-1.5 py-1.5 bg-zinc-955 border border-zinc-800 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold"
                    />
                  </div>

                  {/* Accompanying message input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={negotiationMessage}
                      onChange={(e) => setNegotiationMessage(e.target.value)}
                      placeholder="Votre mot doux (ex: S'il vous plaît papa...)"
                      className="w-full px-2.5 py-1.5 bg-zinc-955 border border-zinc-800 rounded text-[11px] text-white placeholder-zinc-650 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Bargaining Send/Negotiate trigger */}
                  <button
                    onClick={handleNegotiatePrice}
                    disabled={isNegotiatingAPI || !customerOffer}
                    className="px-3.5 bg-amber-500 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-600 font-bold font-mono rounded text-[10px] uppercase hover:bg-amber-600 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {negotiationStep !== 'idle' && (
                  <div className="flex justify-between items-center text-[10px] px-0.5 text-zinc-500">
                    <span>
                      Proposition actuelle : <strong className="text-amber-500 font-mono">{finalAgreedPrice ? (isCdf ? `${finalAgreedPrice.toLocaleString()} CDF` : `$${finalAgreedPrice}`) : "Aucune"}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setNegotiationStep('idle');
                        setCustomerOffer("");
                        setChatHistory([]);
                      }}
                      className="text-[9px] text-amber-650 hover:underline"
                    >
                      Réinitialiser la négociation
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHARING PORTABLE APP POPUP OVERLAY */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-3xl p-6 space-y-4 text-center shadow-2xl relative"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[10px] font-bold font-mono tracking-wider text-amber-500 uppercase">Partager l'article</span>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="w-7 h-7 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* High-Fidelity Rich Preview Link Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-left space-y-2 relative overflow-hidden">
                <div className="text-[7.5px] font-mono tracking-widest text-zinc-500 uppercase">Aperçu du lien partagé</div>
                <div className="flex gap-2.5 items-center">
                  <img src={product.image} alt={product.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h5 className="text-[10px] font-bold text-white truncate">{product.title}</h5>
                    <p className="text-[8.5px] text-zinc-450 line-clamp-2 leading-normal">{product.description}</p>
                    <span className="text-[9px] font-mono font-bold text-amber-500 block mt-0.5">{isCdf ? `${product.price.toLocaleString()} CDF` : `$${product.price}`}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white leading-tight">{product.title}</h4>
                <p className="text-[9px] text-zinc-500">Sélectionnez une application pour recevoir ce lien :</p>
              </div>

              {/* Direct Native App Trigger Button */}
              {navigator.share && (
                <button
                  onClick={() => {
                    navigator.share({
                      title: product.title,
                      text: product.description,
                      url: `${window.location.origin}/#product/${product.id}`
                    }).catch((e) => console.log("Native share cancelled", e));
                    setShowShareModal(false);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-zinc-950 font-black font-mono text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-zinc-950" />
                  <span>Applications Système Appareil</span>
                </button>
              )}

              {/* Grid of installed apps icons list */}
              <div className="grid grid-cols-4 gap-2.5 py-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Regarde ce produit magnifique sur KUFULULA : " + product.title + " " + window.location.origin + "/#product/" + product.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowShareModal(false)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-xs transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span className="text-[8px] font-mono text-zinc-400">WhatsApp</span>
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + "/#product/" + product.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowShareModal(false)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-xs transition-colors"
                >
                  <Facebook className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                  <span className="text-[8px] font-mono text-zinc-400">Facebook</span>
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Regarde ce produit magnifique sur KUFULULA : " + product.title)}&url=${encodeURIComponent(window.location.origin + "/#product/" + product.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowShareModal(false)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-xs transition-colors"
                >
                  <Twitter className="w-5 h-5 text-sky-400" />
                  <span className="text-[8px] font-mono text-zinc-400">Twitter X</span>
                </a>

                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin + "/#product/" + product.id)}&text=${encodeURIComponent(product.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowShareModal(false)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-xs transition-colors"
                >
                  <Send className="w-5 h-5 text-cyan-400" />
                  <span className="text-[8px] font-mono text-zinc-400">Telegram</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/#product/${product.id}`);
                    setShowShareToast(true);
                    setShowShareModal(false);
                    setTimeout(() => setShowShareToast(false), 2000);
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-xs transition-colors cursor-pointer w-full"
                >
                  <Instagram className="w-5 h-5 text-pink-500" />
                  <span className="text-[8px] font-mono text-zinc-400">Instagram</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/#product/${product.id}`);
                    setShowShareToast(true);
                    setShowShareModal(false);
                    setTimeout(() => setShowShareToast(false), 2000);
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-xs transition-colors cursor-pointer w-full"
                >
                  <Smartphone className="w-5 h-5 text-yellow-400" />
                  <span className="text-[8px] font-mono text-zinc-400">Snapchat</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/#product/${product.id}`);
                    setShowShareToast(true);
                    setShowShareModal(false);
                    setTimeout(() => setShowShareToast(false), 2000);
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-xs transition-colors cursor-pointer w-full"
                >
                  <Mail className="w-5 h-5 text-indigo-400" />
                  <span className="text-[8px] font-mono text-zinc-400">SMS</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/#product/${product.id}`);
                    setShowShareToast(true);
                    setShowShareModal(false);
                    setTimeout(() => setShowShareToast(false), 2000);
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold border border-amber-600 text-xs transition-colors cursor-pointer w-full"
                >
                  <Link className="w-5 h-5 text-zinc-950" />
                  <span className="text-[8px] font-mono font-bold">Lien</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floated Share Toast Confirmation banner */}
      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-green-500 text-zinc-950 text-xs font-mono font-semibold px-4 py-2 rounded-full shadow-lg">
          Lien de l'article copié et prêt à être partagé ! 😊
        </div>
      )}

    </motion.div>
  );
}
