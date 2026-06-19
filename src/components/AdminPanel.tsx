import React, { useState, useEffect } from "react";
import { 
  Database, Plus, Wand2, RefreshCw, FileText, Globe, Check, 
  Trash2, Eye, ShieldAlert, BarChart2, DollarSign, Tag, Info 
} from "lucide-react";
import { Product, UserAuth } from "../types";
import { KDb, KAuth } from "../lib/firebase";

interface AdminPanelProps {
  onBackToShop: () => void;
  adminUser: UserAuth | null;
  onAdminLogin: (email: string) => void;
  onSignOut: () => void;
}

export default function AdminPanel({ onBackToShop, adminUser, onAdminLogin, onSignOut }: AdminPanelProps) {
  // Tabs: 'dashboard', 'products', 'onboarding'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'onboarding'>('dashboard');
  const [loginEmail, setLoginEmail] = useState("admin@kufulula.cd");
  
  // Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Manual Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(50);
  const [currency, setCurrency] = useState<'USD' | 'CDF'>("USD");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [stock, setStock] = useState(20);
  const [vendor, setVendor] = useState("");
  const [tagsStr, setTagsStr] = useState("");

  // Mass Gemini unstructured text ingestion state
  const [rawText, setRawText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [draftProduct, setDraftProduct] = useState<Partial<Product> | null>(null);
  const [draftImagePrompt, setDraftImagePrompt] = useState("");

  // Load Admin Data
  useEffect(() => {
    if (adminUser) {
      loadProducts();
    }
  }, [adminUser]);

  const loadProducts = async () => {
    setLoading(true);
    const list = await KDb.getAllProductsAdmin();
    setProducts(list);
    setLoading(false);
  };

  // Standard creation handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price || !vendor) {
      alert("Veuillez remplir les informations obligatoires.");
      return;
    }

    const defaultImages = [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop"
    ];

    const newProduct: Product = {
      id: "prod-" + Date.now(),
      title,
      description,
      price: Number(price),
      currency,
      image: image || defaultImages[Math.floor(Math.random() * defaultImages.length)],
      category,
      stock: Number(stock),
      vendor,
      tags: tagsStr.split(",").map(t => t.trim()).filter(Boolean),
      isDraft: false,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await KDb.saveProduct(newProduct);
    resetForm();
    loadProducts();
    setActiveTab('products');
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice(50);
    setImage("");
    setStock(20);
    setVendor("");
    setTagsStr("");
  };

  // Mass autonomous Gemini extraction
  const handleGeminiExtract = async () => {
    if (!rawText.trim()) return;
    setExtracting(true);
    setDraftProduct(null);

    try {
      const response = await fetch("/api/gemini/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });

      if (!response.ok) {
        throw new Error("L'extraction Gemini a rencontré un incident technique");
      }

      const structuredResult = await response.json();
      console.log("Structured result:", structuredResult);

      const generatedId = "prod-gem-" + Date.now();
      
      const newDraft: Partial<Product> = {
        id: generatedId,
        title: structuredResult.title || "Produit Ingesté",
        description: structuredResult.description || "",
        price: Number(structuredResult.price) || 85,
        currency: (structuredResult.currency as 'USD' | 'CDF') || "USD",
        category: structuredResult.suggestedCategory || "Electronics",
        stock: 50,
        vendor: "KUFULULA Autonomous Supply",
        tags: structuredResult.tags || ["ai-ingested"],
        isDraft: true,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDraftProduct(newDraft);
      setDraftImagePrompt(structuredResult.imageGeneratorPrompt || "");

      // Immediately trigger Imagen/Gemini photo generation
      generateDraftImage(structuredResult.imageGeneratorPrompt, generatedId);
    } catch (err: any) {
      alert("Erreur extraction: " + err.message);
    } finally {
      setExtracting(false);
    }
  };

  const generateDraftImage = async (promptText: string, prodId: string) => {
    try {
      const resp = await fetch("/api/gemini/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });
      const data = await resp.json();

      if (data.imageUrl) {
        setDraftProduct(prev => prev && prev.id === prodId ? { ...prev, image: data.imageUrl } : prev);
      } else {
        // Creative Fallback stock category photos on Unsplash if image gen keys lack credit
        const categorySearch = promptText.toLowerCase().includes("lumière") || promptText.toLowerCase().includes("solar") ? "lantern" : "hub";
        const fallbackUrl = `https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=800&auto=format&fit=crop`;
        setDraftProduct(prev => prev && prev.id === prodId ? { ...prev, image: fallbackUrl } : prev);
      }
    } catch (e) {
      console.error("Image generation error", e);
    }
  };

  // Publish Draft Product
  const handlePublishDraft = async () => {
    if (!draftProduct) return;

    // Secure image fallbacks
    const finalizedImg = draftProduct.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop";

    const finalProduct: Product = {
      id: draftProduct.id!,
      title: draftProduct.title!,
      description: draftProduct.description!,
      price: draftProduct.price!,
      currency: draftProduct.currency!,
      image: finalizedImg,
      category: draftProduct.category || "Electronics",
      stock: draftProduct.stock || 20,
      vendor: draftProduct.vendor || "IA Auto Supply",
      tags: draftProduct.tags || [],
      isDraft: false,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await KDb.saveProduct(finalProduct);
    setDraftProduct(null);
    setRawText("");
    loadProducts();
    setActiveTab('products');
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Supprimer ce produit de la base?")) {
      await KDb.deleteProduct(id);
      loadProducts();
    }
  };

  // Render Authentication Modal if not logged in
  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 font-sans">
        <div className="absolute top-4 left-4">
          <button 
            onClick={onBackToShop}
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-medium rounded-lg text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50"
          >
            ← Retourner sur la Boutique
          </button>
        </div>
        
        <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3.5 bg-indigo-50 dark:bg-zinc-800 text-indigo-605 dark:text-indigo-400 rounded-2xl mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white font-sans tracking-tight">
              Espace Administrateur Kufulula
            </h1>
            <p className="text-xs text-zinc-400 font-mono text-center mt-1">
              #admin • Authentification Sécurisée
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 block mb-1">
                Adresse e-mail
              </label>
              <input 
                type="email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-650"
              />
            </div>

            <button
              onClick={() => onAdminLogin(loginEmail)}
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-medium tracking-tight flex items-center justify-center gap-2 shadow-lg"
            >
              Sign in with Google (Simulé)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate quick metrics for dashboard
  const publishedCount = products.filter(p => p.isPublished).length;
  const outOfStockCount = products.filter(p => !p.stock || p.stock === 0).length;
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50">
      {/* Admin Top Banner */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200/60 dark:border-zinc-850 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold font-sans tracking-tight">
              KUFULULA CONTROL CENTER
            </h1>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              Role: <span className="text-green-600 font-semibold">{adminUser.role.toUpperCase()}</span> • {adminUser.email}
            </p>
          </div>
        </div>

        {/* Header Action toolbar */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onBackToShop}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            ← Boutique Publique
          </button>
          <button 
            onClick={onSignOut}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-650 dark:text-red-400 text-xs font-medium rounded-lg transition-colors border border-red-200/40"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-1 flex flex-col gap-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 rounded-2xl p-4 h-fit">
          <span className="text-[10px] uppercase font-mono text-zinc-400 px-3 mb-2">Back-office SaaS</span>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-mono tracking-tight rounded-xl transition-all flex items-center gap-2.5 ${
              activeTab === 'dashboard'
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            01_Statistiques
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-mono tracking-tight rounded-xl transition-all flex items-center gap-2.5 ${
              activeTab === 'products'
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
            }`}
          >
            <Database className="w-4 h-4" />
            02_Catalogue_Db ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('onboarding')}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-mono tracking-tight rounded-xl transition-all flex items-center gap-2.5 ${
              activeTab === 'onboarding'
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
            }`}
          >
            <Wand2 className="w-4 h-4" />
            03_Ingestion_IA
          </button>
        </div>

        {/* Right Work Desk Panel */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: DASHBOARD METRICS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Bento cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-450">Articles En Vente</span>
                    <h3 className="text-3xl font-mono font-bold text-zinc-900 dark:text-white mt-1">{publishedCount}</h3>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-zinc-800 dark:text-white">
                    <Globe className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-450">Volume Total Stock</span>
                    <h3 className="text-3xl font-mono font-bold text-zinc-900 dark:text-white mt-1">{totalStockCount}</h3>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-zinc-800 dark:text-white">
                    <Database className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-450">Ruptures Stock</span>
                    <h3 className={`text-3xl font-mono font-bold mt-1 ${outOfStockCount > 0 ? "text-amber-500" : "text-green-600"}`}>
                      {outOfStockCount}
                    </h3>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-zinc-800 dark:text-white">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Graphic Simulator */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-zinc-600" />
                  Performance Logistique KUFULULA (Kinshasa • Goma • Bukavu)
                </h3>
                
                {/* Simulated visual bar chart using CSS grids */}
                <div className="h-64 flex items-end justify-between gap-4 pt-4 border-b border-zinc-200 dark:border-zinc-800 pb-1 font-mono text-[10px]">
                  <div className="flex flex-col items-center flex-1 group">
                    <div className="w-full bg-zinc-900 dark:bg-white rounded-t-lg transition-all group-hover:bg-indigo-600" style={{ height: "45%" }}>
                      <div className="opacity-0 group-hover:opacity-100 bg-zinc-800 text-white p-1 rounded -top-8 relative text-center">45k USD</div>
                    </div>
                    <span className="mt-2 text-zinc-405">Jan</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 group">
                    <div className="w-full bg-zinc-900 dark:bg-white rounded-t-lg transition-all group-hover:bg-indigo-600" style={{ height: "65%" }}>
                      <div className="opacity-0 group-hover:opacity-100 bg-zinc-800 text-white p-1 rounded -top-8 relative text-center">65k USD</div>
                    </div>
                    <span className="mt-2 text-zinc-405">Fév</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 group">
                    <div className="w-full bg-zinc-900 dark:bg-white rounded-t-lg transition-all group-hover:bg-indigo-600" style={{ height: "55%" }}>
                      <div className="opacity-0 group-hover:opacity-100 bg-zinc-800 text-white p-1 rounded -top-8 relative text-center">55k USD</div>
                    </div>
                    <span className="mt-2 text-zinc-405">Mar</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 group">
                    <div className="w-full bg-zinc-900 dark:bg-white rounded-t-lg transition-all group-hover:bg-indigo-600" style={{ height: "85%" }}>
                      <div className="opacity-0 group-hover:opacity-100 bg-zinc-800 text-white p-1 rounded -top-8 relative text-center">85k USD</div>
                    </div>
                    <span className="mt-2 text-zinc-405">Avr</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 group">
                    <div className="w-full bg-zinc-900 dark:bg-white rounded-t-lg transition-all group-hover:bg-indigo-600" style={{ height: "95%" }}>
                      <div className="opacity-0 group-hover:opacity-100 bg-zinc-800 text-white p-1 rounded -top-8 relative text-center">95k USD</div>
                    </div>
                    <span className="mt-2 text-zinc-405">Mai (Actu)</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 text-[10px] font-mono text-zinc-405">
                  <span>Moteur de Trust: Geometrical Face OCR Activé</span>
                  <span>Passerelle Multirails Mobile Money: CDF/USD</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT & MANUAL FORM */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {/* Product grid list */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-850 flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Articles enregistrés dans la Database</h3>
                  <button 
                    onClick={loadProducts}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"
                    title="Rafraîchir"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs font-mono">
                    <thead className="bg-zinc-50 dark:bg-zinc-950/60 uppercase border-b border-zinc-100 dark:border-zinc-850 text-zinc-400">
                      <tr>
                        <th className="p-4">Image</th>
                        <th className="p-4">Titre</th>
                        <th className="p-4">Prix</th>
                        <th className="p-4">Fournisseur</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                      {products.map((p) => {
                        const isCdf = p.currency === "CDF";
                        return (
                          <tr key={p.id} className="hover:bg-zinc-50/50">
                            <td className="p-4">
                              <img src={p.image} alt="" className="w-10 h-10 object-cover rounded-lg" />
                            </td>
                            <td className="p-4 font-semibold font-sans">{p.title}</td>
                            <td className="p-4">{isCdf ? `${p.price.toLocaleString("fr-FR")} CDF` : `$${p.price}`}</td>
                            <td className="p-4 text-zinc-600 dark:text-zinc-400">{p.vendor}</td>
                            <td className="p-4">{p.stock} pcs</td>
                            <td className="p-4">
                              <span className="bg-green-105 dark:bg-green-950/40 text-green-700 dark:text-green-400 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-green-200/30">
                                Publié
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2 shrink-0">
                              <button 
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-zinc-400 hover:text-red-500 rounded transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Manual standard addition form */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Onboarding Manuel (Standard)
                </h3>

                <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 block mb-1">
                        Nom de l'article *
                      </label>
                      <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: MWINDA Solar Lantern"
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 block mb-1">
                        Fournisseur / Vendeur *
                      </label>
                      <input 
                        type="text" 
                        value={vendor}
                        onChange={(e) => setVendor(e.target.value)}
                        placeholder="Ex: Kongo Tech"
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 block mb-1">
                      Description du produit *
                    </label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Fiche technique et arguments SEO..."
                      rows={3}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none text-xs leading-relaxed"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 block mb-1">
                        Prix de vente *
                      </label>
                      <input 
                        type="number" 
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 block mb-1">
                        Devise *
                      </label>
                      <select 
                        value={currency} 
                        onChange={(e) => setCurrency(e.target.value as 'USD' | 'CDF')}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="CDF">CDF (FC)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 block mb-1">
                        Stock Pièces *
                      </label>
                      <input 
                        type="number" 
                        value={stock}
                        onChange={(e) => setStock(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 block mb-1">
                        Catégorie
                      </label>
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none"
                      >
                        <option value="Electronics">Électroniques</option>
                        <option value="Food">Alimentation</option>
                        <option value="Fashion">Mode / Beauté</option>
                        <option value="Home">Maison / Éco</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 block mb-1">
                        Image URL (Optionnel)
                      </label>
                      <input 
                        type="text" 
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="Laisser vide pour photo auto"
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 block mb-1">
                        Tags (Séparés par des virgules)
                      </label>
                      <input 
                        type="text" 
                        value={tagsStr}
                        onChange={(e) => setTagsStr(e.target.value)}
                        placeholder="Solar, Goma, Énergie, Durable"
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-zinc-900 border border-zinc-800 text-white dark:bg-white dark:text-zinc-950 font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    Enregistrer et Publier le Produit
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 3: INGESTION AUTONOME PAR GEMINI AI */}
          {activeTab === 'onboarding' && (
            <div className="space-y-6">
              
              {/* mass text area instruction */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-2xl shadow-sm">
                <div className="flex items-start gap-3.5 mb-5">
                  <div className="p-2.5 bg-indigo-50 dark:bg-zinc-850 text-indigo-605 dark:text-indigo-400 rounded-xl">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Option B : Ingestion Autonome par Gemini AI</h3>
                    <p className="text-xs text-zinc-405 leading-relaxed mt-1">
                      Déposez les données brutes, non structurées et informelles de vos arrivages de produits. Gemini analysera, optimisera pour le SEO, traduira, structurera vos fiches techniques et générera des visuels photoréalistes en arrière-plan.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-405 block mb-1">
                      Dépôt textuel de masse (Données Brutes)
                    </label>
                    <textarea 
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="Exemple: Arrivage exceptionnel de 30 sacs bananes en cuir robuste pour aventuriers, couleur marron foncé patiné, fabrication de l'atelier Solidaire de Bukavu, prix cible 40 USD, tags style, congo-art, robuste. Idéal pour sortir sous la pluie tropicale."
                      rows={5}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none text-xs leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={handleGeminiExtract}
                    disabled={extracting || !rawText.trim()}
                    className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {extracting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyse cognitive Gemini AI & Ingestion Logistique...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Lancer l'Ingestion Autonome (Gemini Pipeline)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* WYSIWYG Draft pipeline review */}
              {draftProduct && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="border-b border-zinc-100 dark:border-zinc-850 pb-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-widest text-indigo-605 dark:text-indigo-400">
                        Pipeline de Validation (Draft & Publish Mode)
                      </h4>
                      <p className="text-[10px] text-zinc-405 mt-0.5">Vérifiez les données structurées extraites de Gemini</p>
                    </div>
                    <span className="bg-amber-105 text-amber-705 text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-amber-200/30">
                      Brouillon en validation
                    </span>
                  </div>

                  {/* WYSIWYG side-by-side elements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Generative Image visual preview */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono uppercase text-zinc-404">Rendu Photoréaliste Imagen</span>
                      <div className="aspect-square bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-850 overflow-hidden flex items-center justify-center relative">
                        {draftProduct.image ? (
                          <img src={draftProduct.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-405">
                            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-indigo-505" />
                            <p className="font-mono text-[10px]">Génération spatiale Imagen v4.0...</p>
                          </div>
                        )}
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 p-3 rounded-xl">
                        <span className="text-[9px] uppercase font-mono text-indigo-600 block mb-1">Visual Prompt</span>
                        <p className="text-[10px] text-zinc-600 line-clamp-2 leading-relaxed italic">
                          "{draftImagePrompt || 'Génération de prompt sémantique en cours...'}"
                        </p>
                      </div>
                    </div>

                    {/* Metadata fields editable WYSIWYG */}
                    <div className="space-y-4 text-xs font-mono">
                      <div>
                        <label className="text-zinc-400 block mb-1">Titre Opti SEO</label>
                        <input 
                          type="text" 
                          value={draftProduct.title || ""}
                          onChange={(e) => setDraftProduct(prev => prev ? { ...prev, title: e.target.value } : prev)}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none font-sans font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1">Prix & Devise</label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            value={draftProduct.price || 0}
                            onChange={(e) => setDraftProduct(prev => prev ? { ...prev, price: Number(e.target.value) } : prev)}
                            className="w-1/2 px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none"
                          />
                          <select 
                            value={draftProduct.currency || "USD"}
                            onChange={(e) => setDraftProduct(prev => prev ? { ...prev, currency: e.target.value as 'USD' | 'CDF' } : prev)}
                            className="w-1/2 px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="CDF">CDF (FC)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1">Fiche Technique</label>
                        <textarea 
                          value={draftProduct.description || ""}
                          onChange={(e) => setDraftProduct(prev => prev ? { ...prev, description: e.target.value } : prev)}
                          rows={4}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none leading-relaxed font-sans"
                        />
                      </div>

                      <div className="flex gap-2 font-sans">
                        <div className="flex-1">
                          <span className="text-zinc-400 block text-[10px] font-mono uppercase mb-1">Mots-clés</span>
                          <p className="text-xs bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-100 flex flex-wrap gap-1">
                            {draftProduct.tags?.map((tag, idx) => (
                              <span key={idx} className="bg-white px-1 rounded border text-[9px] text-zinc-500">#{tag}</span>
                            ))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* WYSIWYG publication CTA */}
                  <div className="pt-4 border-t border-zinc-150 dark:border-zinc-850 flex gap-3">
                    <button
                      onClick={() => setDraftProduct(null)}
                      className="px-4 py-3 border border-zinc-200 rounded-xl text-xs font-medium hover:bg-zinc-50 flex-1 sm:flex-initial"
                    >
                      Annuler Brouillon
                    </button>
                    <button
                      onClick={handlePublishDraft}
                      className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 rounded-xl text-xs font-medium flex-1 flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      <Check className="w-4 h-4" />
                      Publier et injecter dans Firestore
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
