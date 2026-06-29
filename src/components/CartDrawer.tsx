import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from "lucide-react";
import { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onGoToCheckout: () => void;
  activeTheme?: any;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onGoToCheckout,
  activeTheme
}: CartDrawerProps) {
  // Compute total USD vs CDF splits (CDF items aren't mixed, or totals computed separately)
  const usdTotal = cart
    .filter((item) => item.product.currency === "USD")
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const cdfTotal = cart
    .filter((item) => item.product.currency === "CDF")
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const hasItems = cart.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" id="cart_drawer_stage">
          {/* Backdrop Blur Overlays */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/20 backdrop-blur-md"
          />

          {/* Drawer Sliding container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`w-screen max-w-md border-l border-white/10 flex flex-col shadow-2xl ${activeTheme?.cardClass || "bg-zinc-900 text-white"}`}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-[#FF8C00]" />
                  <h2 className="text-base font-sans font-semibold text-white">
                    Votre panier • KUFULULA Soko
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full transition-colors border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Item Stack */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {hasItems ? (
                  cart.map((item) => {
                    const isCdf = item.product.currency === "CDF";
                    return (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-4 p-3 bg-zinc-950 border border-white/5 rounded-2xl"
                      >
                        {/* Img */}
                        <div className="w-20 h-20 bg-zinc-900 rounded-xl overflow-hidden border border-white/5 shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Mid Meta details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="text-xs font-semibold font-sans text-white line-clamp-1">
                                {item.product.title}
                              </h4>
                              <button
                                onClick={() => onRemoveItem(item.product.id)}
                                className="text-zinc-400 hover:text-red-500 p-1 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                              Fournisseur: {item.product.vendor}
                            </span>
                          </div>

                           {/* Control Row */}
                          <div className="flex justify-between items-center mt-2">
                            {/* Quantity buttons */}
                            <div className="flex items-center gap-1.5 border border-white/10 bg-zinc-900 rounded-lg px-1.5 py-1">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, -1)}
                                className="p-0.5 text-zinc-400 hover:text-zinc-200 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-mono font-medium px-1 text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, 1)}
                                className="p-0.5 text-zinc-400 hover:text-zinc-200 transition-colors"
                                disabled={item.quantity >= item.product.stock}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Subtotal */}
                            <span className="text-xs font-mono font-bold text-white">
                              {isCdf 
                                ? `${(item.product.price * item.quantity).toLocaleString("fr-FR")} CDF` 
                                : `$${item.product.price * item.quantity}`}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                    <ShoppingBag className="w-12 h-12 stroke-[1.2] text-zinc-300 dark:text-zinc-700 mb-3" />
                    <p className="text-sm font-sans tracking-tight">Votre panier est encore vide.</p>
                    <p className="text-xs text-zinc-450 mt-1">
                      Explorez le catalogue public e-commerce KUFULULA.
                    </p>
                  </div>
                )}
              </div>              {/* Drawer footer checkout section */}
              {hasItems && (
                <div className="border-t border-white/10 p-6 bg-zinc-950/90 space-y-4">
                  {/* Total splits summary */}
                  <div className="space-y-1.5">
                    {usdTotal > 0 && (
                      <div className="flex justify-between items-center text-xs text-zinc-400 font-mono">
                        <span>Total USD:</span>
                        <span className="font-bold text-white">${usdTotal}</span>
                      </div>
                    )}
                    {cdfTotal > 0 && (
                      <div className="flex justify-between items-center text-xs text-zinc-400 font-mono">
                        <span>Total Franc Congolais (CDF):</span>
                        <span className="font-bold text-white">
                          {cdfTotal.toLocaleString("fr-FR")} CDF
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center text-sm font-semibold">
                      <span className="text-zinc-300">Estimation d'encaissement</span>
                      <span className="text-white font-mono">
                        {usdTotal > 0 ? `$${usdTotal}` : ""}{" "}
                        {usdTotal > 0 && cdfTotal > 0 ? "+" : ""}{" "}
                        {cdfTotal > 0 ? `${cdfTotal.toLocaleString("fr-FR")} CDF` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Escrow badge info */}
                  <div className="flex items-start gap-2 bg-[#FF8C00]/10 border border-[#FF8C00]/25 p-3 rounded-xl text-[11px] text-[#FF8C00]">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-white" />
                    <span>
                      <strong>Garantie Séquestre KUFULULA:</strong> Vos fonds sont bloqués de manière sécurisée en RDC et libérés uniquement après confirmation physique de livraison.
                    </span>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={onGoToCheckout}
                    className="w-full py-4 bg-[#FF8C00] hover:bg-amber-500 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 uppercase font-mono text-xs"
                  >
                    Procéder au tunnel KYC & Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
