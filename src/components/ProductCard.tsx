import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Eye, Flame, Heart, MessageCircle, Share2, 
  Handshake, Send, Check, AlertCircle, ShoppingBag 
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
}

export default function ProductCard({ product, onOpenDetails, onAddToCart, dict, activeTheme }: ProductCardProps) {
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

  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [commenterName, setCommenterName] = useState("");

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
    if (isLiked) {
      updateLikesInDB(likes - 1, false);
    } else {
      updateLikesInDB(likes + 1, true);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newCommentObj = {
      id: "comment-" + Date.now(),
      user: commenterName.trim() || "Visiteur anonyme",
      text: newCommentText.trim(),
      date: new Date().toISOString().split("T")[0]
    };

    const updatedComments = [newCommentObj, ...commentsList];
    setCommentsList(updatedComments);
    setNewCommentText("");
    setCommenterName("");
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
    setShowShareToast(true);
    navigator.clipboard.writeText(`${window.location.origin}/#product-${product.id}`);
    setTimeout(() => {
      setShowShareToast(false);
    }, 2500);
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
      <div className="relative aspect-[16/13] w-full bg-black rounded-xl overflow-hidden mb-3">
        <motion.img
          layoutId={`card-img-${product.id}`}
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
          className="absolute inset-x-0 bottom-0 py-2 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] font-mono font-semibold tracking-wide text-amber-500 text-center uppercase"
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
              setShowNegotiation(!showNegotiation);
              setShowComments(false);
            }}
            className={`flex flex-col items-center gap-1.5 py-1.5 rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 ${
              showNegotiation ? "text-[#FF8C00] font-bold" : ""
            }`}
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
            <div className="max-h-24 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {commentsList.length > 0 ? (
                commentsList.map((c) => (
                  <div key={c.id} className="text-[10px] leading-normal pb-1 border-b border-zinc-900/50">
                    <div className="flex justify-between text-zinc-400 font-semibold mb-0.5">
                      <span>{c.user}</span>
                      <span>{c.date}</span>
                    </div>
                    <p className="text-zinc-250 italic font-sans">"{c.text}"</p>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-zinc-600 italic">Aucun commentaire. Soyez le premier à commenter !</div>
              )}
            </div>

            {/* Insert form comment */}
            <form onSubmit={handlePostComment} className="pt-2 border-t border-zinc-805 space-y-1.5">
              <input
                type="text"
                value={commenterName}
                onChange={(e) => setCommenterName(e.target.value)}
                placeholder="Votre nom (ex: Kabasele)"
                className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Écrire un commentaire..."
                  className="flex-1 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="px-2.5 bg-amber-500 text-zinc-950 rounded hover:bg-amber-600 flex items-center justify-center"
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

    </motion.div>
  );
}
