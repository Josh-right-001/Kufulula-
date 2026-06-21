import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Users, ShieldAlert, Sparkles, AlertCircle, ShoppingBag, MessageSquare } from "lucide-react";
import { TranslationDictionary } from "../lib/translations";

interface Merchant {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lang: string;
  accentColor: string;
  introMsg: Record<string, string>;
}

const MERCHANTS: Merchant[] = [
  {
    id: "elikya",
    name: "Papa Elikya",
    role: "Concepteur de l'éclairage Solaire Solar Lantern v3",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Elikya",
    lang: "Lingala 🇨🇩 & Français 🇫🇷",
    accentColor: "from-amber-500 to-orange-600",
    introMsg: {
      fr: "Mbote ndeko ! C'est Papa Elikya. Bienvenue dans notre atelier. Ici, on assemble les lanternes solaires MWINDA pour éclairer les nuits du Congo. Posez-moi vos questions sur nos batteries ou notre partenariat de séquestre !",
      en: "Hello friend! This is Papa Elikya. Welcome to our workshop. Here we build MWINDA solar lanterns to light up Congo. Ask me anything about our hardware or how Kufulula ensures safe payouts!",
      ln: "Mbote ndeko ! Ezali Papa Elikya. Yaka bien na esika ya mosala na biso. Tozo salela kura ya mwinda solaire pona kotalisa na butu. Tuna soki ozo luka oyeba makambo ya kura !",
      sw: "Habari ndugu ! Hapa ni Papa Elikya. Karibu kwenye bandari yetu ya sola Mwinda. Uliza lolote kuhusu solar yetu !",
      lu: "Mbote ndeko ! Mudiakulu Papa Elikya. Biandamayi mu ndaku yetu ya kura sola Mwinda !",
      kg: "Mbote ndeko ! Papa Elikya yawu ke bazolela kura ya nzo sola Mwinda !"
    }
  },
  {
    id: "kabasele",
    name: "Papa Vieux Kabasele",
    role: "Maitre Sculptor of Wenge Lukasa Ledger",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kabasele",
    lang: "Tshiluba 🇨🇩 & Français 🇫🇷",
    accentColor: "from-yellow-600 to-amber-700",
    introMsg: {
      fr: "Nzolo na yo ndeko. Le vieux Kabasele vous salue. Chaque Lukasa Ledger que je sculpte dans le wengé est une alliance de cryptographie moderne et de notre puissance artisanale. Comment puis-je vous guider ?",
      en: "Greetings. Elder Kabasele welcomes you. Every Lukasa Ledger I craft in authentic wenge wood blends cyber-security cryptography with ancestral pride. How can I guide you?",
      ln: "Sango nini ndeko. Papa Kabasele azali kopesa yo losako. Lukasa Ledger nionso ezo sembola bosembo ya makila na biso. Ozo luka nini lelo ?",
      sw: "Salamu ndugu. Papa Kabasele anakulaki hapa. Lukasa Ledger yangu inaleta usalama ya kisasa na ufundi wa jiji !",
      lu: "Nzolo na yo ndeko. Papa Kabasele udi kuela muoyo. Mu nzumbu yetu kua kulela Lukasa ledger ya mase!",
      kg: "Salamu ndeko. Papa Kabasele yawu. Lukasa ledger mumbongo ya lukonku !"
    }
  },
  {
    id: "mwasi",
    name: "Maman Safi (Coopérative Super-Wax)",
    role: "Créatrice de Mode & Pagnes Royaux",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Safi",
    lang: "Swahili 🇨🇩 & Français 🇫🇷",
    accentColor: "from-pink-500 to-purple-600",
    introMsg: {
      fr: "Jambo ! Mambo vipi ! Ici Maman Safi de la Coopérative Féminine de Goma. Nos tissus super-wax d'Égypte sont le reflet de notre élégance congolaise. Et rassurez-vous, le séquestre de Kufulula sécurise nos affaires !",
      en: "Jambo ! How are you ! Here is Maman Safi from Goma's Women Cooperative. Our super-wax fabrics embody Congolese royal elegance. With Kufulula mobile escrow, you can purchase under full safety!",
      ln: "Jambo ndeko ! Maman Safi aza awa pona kotekela yo mapagne malamu ya super-wax d'Égypte. Zala na kimia, mbongo nayo eza mpenza na escrow ya Kufulula !",
      sw: "Jambo ! Mambo vipi ! Maman Safi hapa wa ushirika wa wanawake Goma. Vitenge vyetu ni safi na salama ya pesa yako kupitia Kufulula !",
      lu: "Jambo ! Maman Safi udi ne bilamba bia mapagne bia super-wax d'Égypte !",
      kg: "Jambo ! Maman Safi kibanza ya mapagne ya wax d'Égypte !"
    }
  },
  {
    id: "augustin",
    name: "Papa Augustin",
    role: "Producteur Agricole de Café Kasai Custom Reserve",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Augustin",
    lang: "Kikongo 🇨🇩 & Français 🇫🇷",
    accentColor: "from-green-500 to-emerald-700",
    introMsg: {
      fr: "Mbote na beno ! C'est Papa Augustin. Nous récoltons le délicieux Café Kasaï au cœur de nos forêts fertiles. Prêt à déguster un café équitable protégé par la logistique certifiée de Kufulula ?",
      en: "Welcome! This is Papa Augustin. We harvest our organic Kasai Coffee inside the fertile soils of Congo. Ready to experience ethical farming secured by Kufulula transit registry?",
      ln: "Mbote ndeko ! Ezali Papa Augustin. Café na biso ya Kasai eza elengi mingi mpenza euti na mabele ya drc. Tokosala negoce sikoyo ?",
      sw: "Mbote ndugu ! Papa Augustin hapa. Kahawa yetu ya Kasai ni tamu sana na imehifadhiwa vizuri na Kufulula !",
      lu: "Mbote ndeko ! Papa Augustin udi ne kahawa ya Kasai !",
      kg: "Mbote na beno ! Augustin kele. Kahawa na beto ya Kasai kele mbote !"
    }
  }
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'merchant';
  text: string;
  timestamp: string;
}

interface MerchantConversationalLoungeProps {
  activeTheme?: any;
  dict: TranslationDictionary;
  language: string;
}

export default function MerchantConversationalLounge({
  activeTheme,
  dict,
  language
}: MerchantConversationalLoungeProps) {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant>(MERCHANTS[0]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages thread on load
  useEffect(() => {
    const initialThreads: Record<string, ChatMessage[]> = {};
    MERCHANTS.forEach(m => {
      initialThreads[m.id] = [
        {
          id: `welcome-${m.id}`,
          sender: 'merchant',
          text: m.introMsg[language] || m.introMsg['fr'],
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }
      ];
    });
    setMessages(initialThreads);
  }, [language]);

  // Scroll to bottom of active thread
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedMerchant, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText.trim();
    setInputText("");

    const currentThread = messages[selectedMerchant.id] || [];
    const timestampStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: timestampStr
    };

    // Update state instantly with user's message
    const updatedThread = [...currentThread, newUserMsg];
    setMessages(prev => ({
      ...prev,
      [selectedMerchant.id]: updatedThread
    }));

    setIsTyping(true);

    try {
      // Map current thread to format expected by server API
      const apiHistory = updatedThread.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await fetch("/api/gemini/merchant-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantName: selectedMerchant.name,
          userMessage: userMsgText,
          chatHistory: apiHistory.slice(-6) // Include up to last 6 dialogue segments for context
        })
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.success && data.reply) {
        const replyMsg: ChatMessage = {
          id: `reply-${Date.now()}`,
          sender: 'merchant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => ({
          ...prev,
          [selectedMerchant.id]: [...prev[selectedMerchant.id], replyMsg]
        }));
      } else {
        throw new Error("Chat reply invalid");
      }

    } catch (err) {
      console.warn("API Error, falling back to rich character offline response generator:", err);
      setTimeout(() => {
        setIsTyping(false);
        let fallbackReply = "";
        
        if (selectedMerchant.id === "elikya") {
          fallbackReply = `Ndeko oza malamu ! Mon réseau est capricieux ici à l'atelier, mais sache que notre double séquestre Kufulula protège chaque Mobile Money à 100%. L'argent n'est débloqué que si tu indiques la réception conforme de ta lanterne Mwinda !`;
        } else if (selectedMerchant.id === "kabasele") {
          fallbackReply = `Waye ndeko. La connexion est un peu lente d'ici à Lubumbashi, mais comme l'écosystème Kufulula est sécurisé et persistant, sois tranquille. Pose-moi n'importe quelle question sur le grain de mon wengé véritable ou l'intégration !`;
        } else if (selectedMerchant.id === "mwasi") {
          fallbackReply = `Oh, mambo ! Goma est bien animée aujourd'hui. Si tu rates mon message, sache que tous nos pagnes super-wax sont certifiés et expédiés sous pli sécurisé. On conclut l'accord en route !`;
        } else {
          fallbackReply = `Mbote ! C'est Papa Augustin. Une petite interruption réseau mais notre engagement équitable est inébranlable. Dis-moi si tu as besoin de conseils sur la mouture parfaite du café !`;
        }

        const replyMsg: ChatMessage = {
          id: `reply-fallback-${Date.now()}`,
          sender: 'merchant',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => ({
          ...prev,
          [selectedMerchant.id]: [...prev[selectedMerchant.id], replyMsg]
        }));
      }, 1500);
    }
  };

  const activeThread = messages[selectedMerchant.id] || [];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-sans font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 md:w-6 h-5 md:h-6 text-[#FF8C00] animate-pulse" />
            Le Salon de Discussion • Négociations en Direct <MessageSquare className="w-4 md:w-5 h-4 md:h-5 text-amber-500 inline-block align-middle ml-1" />
          </h1>
          <p className="text-xs text-zinc-400">
            Parlez en temps réel avec les Papas et Mamans marchands du Congo pour négocier vos deals et certifier les livraisons.
          </p>
        </div>
        <div className="bg-[#FF8C00]/10 border border-[#FF8C00]/30 rounded-full px-3 py-1 flex items-center gap-1.5 self-start md:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-[#FF8C00] animate-spin-slow" />
          <span className="text-[10px] font-mono uppercase text-[#FF8C00] font-bold">DOUBLE SÉQUESTRE GARANTI</span>
        </div>
      </div>

      {/* Main chat board layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-zinc-900/60 border border-white/5 rounded-3xl overflow-hidden min-h-[460px] md:min-h-[580px] shadow-2xl backdrop-blur-md">
        
        {/* Left column sidebar lists of Papas */}
        <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between">
          <div className="p-4 bg-black/40 border-b border-white/5">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#FF8C00] font-black">Sélectionnez votre Marchand</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {MERCHANTS.map((m) => {
              const isSelected = selectedMerchant.id === m.id;
              const lastMsgText = messages[m.id]?.slice(-1)[0]?.text || "...";

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMerchant(m)}
                  className={`w-full p-4 text-left flex items-start gap-3 transition-all ${
                    isSelected 
                      ? "bg-white/10 border-l-4 border-[#FF8C00]" 
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-950 border border-white/15 overflow-hidden flex items-center justify-center p-0.5">
                      <img src={m.avatar} alt={m.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-zinc-900 rounded-full animate-pulse" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-sans font-bold text-white truncate">{m.name}</h3>
                      <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/5 text-zinc-500">PRO</span>
                    </div>
                    <p className="text-[9.5px] text-zinc-400 font-sans truncate">{m.role}</p>
                    <p className="text-[9px] text-[#FF8C00] font-mono">{m.lang}</p>
                    <p className="text-[9.5px] text-zinc-500 italic mt-1 line-clamp-1 truncate font-serif">"{lastMsgText}"</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Secure trade info card below panel */}
          <div className="p-4 bg-zinc-950/70 border-t border-white/5 space-y-2 text-[10.5px]">
            <div className="flex gap-2 text-amber-500 font-bold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Protocole d'Échange Sûr</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[10px]">
              Chaque discussion avec nos marchands soutient l'ingestion de négociations de prix en un clic. À tout moment, convenez d'un prix de confiance pour l'ajouter au panier !
            </p>
          </div>
        </div>

        {/* Right column Chat Workspace Box */}
        <div className="md:col-span-8 flex flex-col justify-between h-[450px] md:h-auto bg-black/30">
          
          {/* Header of active participant */}
          <div className="p-4 bg-black/40 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-950 border border-white/10 overflow-hidden shrink-0">
              <img src={selectedMerchant.avatar} alt={selectedMerchant.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-sans font-bold text-white">{selectedMerchant.name}</h2>
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
                <span className="text-[8.5px] text-green-500 font-mono tracking-widest uppercase">EN LIGNE</span>
              </div>
              <p className="text-[10px] text-zinc-400 line-clamp-1">{selectedMerchant.role}</p>
            </div>
          </div>

          {/* Message threads scrolling */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {activeThread.map((m) => {
              const isMe = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} items-start gap-2.5 max-w-[85%] ${
                    isMe ? "ml-auto" : "mr-auto"
                  }`}
                >
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-zinc-950 border border-white/10 p-0.5 overflow-hidden shrink-0 mt-0.5">
                      <img src={selectedMerchant.avatar} alt={selectedMerchant.name} className="w-full h-full object-contain" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div
                      className={`p-3 rounded-2xl ${
                        isMe
                          ? "bg-gradient-to-tr from-[#FF8C00] to-amber-500 text-zinc-950 rounded-tr-none font-sans font-medium"
                          : "bg-zinc-900 border border-white/5 text-zinc-100 rounded-tl-none font-serif font-light leading-relaxed text-xs"
                      } text-xs shadow-md`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[8.5px] font-mono text-zinc-500 block text-right">
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Simulated Gemini thinking dots */}
            {isTyping && (
              <div className="flex justify-start items-center gap-2.5 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-zinc-950 border border-white/10 p-0.5 overflow-hidden shrink-0">
                  <img src={selectedMerchant.avatar} alt={selectedMerchant.name} className="w-full h-full object-contain animate-bounce" />
                </div>
                <div className="bg-zinc-900 border border-white/5 p-3 rounded-2xl rounded-tl-none text-zinc-400 text-xs flex items-center gap-1.5 shadow-md">
                  <span className="font-mono text-[9px] text-[#FF8C00] font-bold animate-pulse">{selectedMerchant.name} est en train d'écrire</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={threadEndRef} />
          </div>

          {/* Form write fields below thread */}
          <form onSubmit={handleSendMessage} className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Écrire à ${selectedMerchant.name.split(" ")[0]} (ex: Mwinda Solar, négociation, etc.)`}
              className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#FF8C00] leading-relaxed"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-4 bg-[#FF8C00] text-zinc-950 hover:bg-amber-500 rounded-xl transition-all font-mono font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
