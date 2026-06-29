import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Video, Info, Plus, Camera, Mic, Send, Smile, Paperclip } from "lucide-react";
import { Product } from "../types";

interface ChatMessage {
  id: string;
  sender: 'user' | 'merchant';
  text: string;
  type?: 'text' | 'image' | 'audio' | 'video';
  mediaUrl?: string;
  timestamp: string;
}

interface ProductNegotiationChatProps {
  product: Product;
  onClose: () => void;
  activeTheme?: any;
}

export default function ProductNegotiationChat({ product, onClose, activeTheme }: ProductNegotiationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  
  const vendorName = "Store Kufulula";
  const vendorAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=Kufulula`;

  useEffect(() => {
    // Initial welcome message from vendor
    setMessages([
      {
        id: "msg-0",
        sender: "merchant",
        text: `Mbote ndeko ! Toyokana ! Je vends cet excellent produit "${product.title}" pour d'habitude ${product.price} ${product.currency}. Quelle est ton offre ?`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [product]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent, mediaUrl?: string, mediaType?: 'image'|'audio'|'video') => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !mediaUrl) return;

    const userText = inputText.trim();
    setInputText("");

    const timestampStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newUserMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      type: mediaType || 'text',
      mediaUrl,
      timestamp: timestampStr
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      // Simulate API call for negotiation
      const res = await fetch("/api/gemini/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          title: product.title,
          originalPrice: product.price,
          currency: product.currency,
          vendor: product.vendor,
          offerPrice: Number(userText.replace(/[^0-9.]/g, '')) || (product.price * 0.8), // basic extraction
          message: userText,
          chatHistory: updatedMessages
        })
      });

      const data = await res.json();
      
      const newMerchantMsg: ChatMessage = {
        id: `msg-${Date.now()+1}`,
        sender: 'merchant',
        text: data.reply || "Je réfléchis à votre offre...",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, newMerchantMsg]);
    } catch (error) {
      console.error(error);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now()+1}`,
        sender: 'merchant',
        text: "Désolé, problème de réseau. Disons que c'est accordé à un bon prix si vous êtes sérieux.",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAttachment = () => {
    // Simulate attaching a photo/video
    const dummyImage = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80";
    handleSendMessage(undefined, dummyImage, 'image');
  };

  const handleCamera = () => {
    const dummyCameraImage = "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&q=80";
    handleSendMessage(undefined, dummyCameraImage, 'image');
  };

  const handleMic = () => {
    // Simulate sending audio
    handleSendMessage(undefined, undefined, 'audio');
  };

  const themeBg = activeTheme?.id === 'white-noir' ? 'bg-white text-black' : 
                  activeTheme?.id === 'urban-brutalist' ? 'bg-[#FFDE59] text-black border-4 border-black' : 
                  'bg-zinc-950 text-white';
                  
  const themeHeaderBg = activeTheme?.id === 'white-noir' ? 'bg-zinc-100 border-b border-zinc-200' :
                        activeTheme?.id === 'urban-brutalist' ? 'bg-white border-b-4 border-black' :
                        'bg-zinc-900 border-b border-zinc-800 text-white';
                        
  const themeInputBg = activeTheme?.id === 'white-noir' ? 'bg-zinc-100 border-t border-zinc-200' :
                       activeTheme?.id === 'urban-brutalist' ? 'bg-white border-t-4 border-black' :
                       'bg-zinc-900 border-t border-zinc-800';

  const themeAccent = activeTheme?.id === 'abysses' ? 'text-cyan-400' :
                      activeTheme?.id === 'glass-water' ? 'text-slate-800' :
                      activeTheme?.id === 'sahel-noir' ? 'text-emerald-400' :
                      activeTheme?.id === 'urban-brutalist' ? 'text-black' :
                      'text-[#FF8C00]';

  const userBubbleBg = activeTheme?.id === 'abysses' ? 'bg-cyan-600 text-white' :
                       activeTheme?.id === 'sahel-noir' ? 'bg-emerald-600 text-white' :
                       activeTheme?.id === 'urban-brutalist' ? 'bg-black text-white rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]' :
                       activeTheme?.id === 'white-noir' ? 'bg-black text-white' :
                       'bg-[#FF8C00] text-white';
                       
  const merchantBubbleBg = activeTheme?.id === 'white-noir' ? 'bg-zinc-100 text-black border border-zinc-200' :
                           activeTheme?.id === 'urban-brutalist' ? 'bg-white text-black rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
                           'bg-zinc-800 text-white border border-zinc-700';

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col font-sans ${themeBg}`}>
      {/* iOS WhatsApp Header */}
      <div className={`flex items-center justify-between px-2 pt-12 pb-2 ${themeHeaderBg}`}>
        <div className="flex items-center gap-1">
          <button onClick={onClose} className={`p-2 ${themeAccent} hover:opacity-80 flex items-center gap-1`}>
            <ArrowLeft className="w-6 h-6" />
            <div className="relative">
              <img src={vendorAvatar} alt={vendorName} className="w-10 h-10 rounded-full bg-zinc-800" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1C1C1E]"></div>
            </div>
          </button>
          <div className="flex flex-col ml-1">
            <span className="font-semibold text-[17px] tracking-tight">{vendorName}</span>
            <span className="text-[12px] text-zinc-400">en ligne</span>
          </div>
        </div>
        <div className={`flex items-center gap-4 pr-4 ${themeAccent}`}>
          <Video className="w-6 h-6" />
          <Phone className="w-6 h-6" />
        </div>
      </div>

      {/* WhatsApp Chat Area background pattern (simulated) */}
      <div className="flex-1 overflow-y-auto relative px-4 py-6"
           style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "20px 20px", opacity: 0.9 }}>
        
        {/* Product reference bubble */}
        <div className="flex justify-center mb-6">
          <div className={`text-[11px] px-4 py-1.5 rounded-full ${merchantBubbleBg}`}>
            Négociation pour: {product.title}
          </div>
        </div>

        <div className="space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 relative shadow-sm text-[16px] leading-snug ${
                    isUser ? userBubbleBg : merchantBubbleBg
                  } ${!isUser && activeTheme?.id !== 'urban-brutalist' ? 'rounded-bl-none' : ''} ${isUser && activeTheme?.id !== 'urban-brutalist' ? 'rounded-br-none' : ''}`}
                >
                  {msg.type === 'image' && msg.mediaUrl && (
                    <img src={msg.mediaUrl} alt="Attached" className="w-full max-w-sm rounded-xl mb-2 object-cover" />
                  )}
                  {msg.type === 'audio' && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-black/10 rounded-xl">
                      <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                         <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-current ml-1"></div>
                      </div>
                      <div className="flex-1 h-1 bg-current opacity-30 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-current opacity-50"></div>
                      </div>
                      <span className="text-xs font-mono">0:04</span>
                    </div>
                  )}
                  {msg.text && <p className="mb-3 pr-8">{msg.text}</p>}
                  <span className={`absolute bottom-1.5 right-2.5 text-[10px] ${isUser ? 'opacity-70' : 'opacity-60'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className={`px-4 py-3 rounded-2xl flex items-center gap-1 ${merchantBubbleBg} ${activeTheme?.id !== 'urban-brutalist' ? 'rounded-bl-none' : ''}`}>
                <span className="w-2 h-2 bg-current opacity-60 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-current opacity-60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-current opacity-60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* iOS WhatsApp Input Area */}
      <div className={`${themeInputBg} pb-safe`}>
        <div className="flex items-end px-2 py-2 gap-2">
          <button onClick={handleAttachment} className={`p-2 ${themeAccent} shrink-0 mb-1`}>
            <Plus className="w-6 h-6" />
          </button>
          
          <form onSubmit={handleSendMessage} className={`flex-1 flex items-end relative rounded-[20px] ${activeTheme?.id === 'white-noir' ? 'bg-white border border-zinc-300' : activeTheme?.id === 'urban-brutalist' ? 'bg-white border-4 border-black rounded-none' : 'bg-black border border-zinc-700'}`}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message"
              className={`w-full bg-transparent px-4 py-2 min-h-[40px] focus:outline-none text-[16px] ${activeTheme?.id === 'white-noir' || activeTheme?.id === 'urban-brutalist' ? 'text-black' : 'text-white'}`}
            />
            <button type="button" className={`p-2 ${themeAccent} shrink-0`}>
              <Smile className="w-5 h-5" />
            </button>
          </form>

          {inputText.trim() ? (
            <button onClick={(e) => handleSendMessage(e)} className={`p-2 ${userBubbleBg} ${activeTheme?.id !== 'urban-brutalist' ? 'rounded-full' : ''} shrink-0 mb-1 w-10 h-10 flex items-center justify-center`}>
              <Send className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <div className="flex items-center gap-1 mb-1">
              <button onClick={handleCamera} className={`p-2 ${themeAccent}`}>
                <Camera className="w-6 h-6" />
              </button>
              <button onClick={handleMic} className={`p-2 ${themeAccent}`}>
                <Mic className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
        <div className="h-6" /> {/* Safe area padding */}
      </div>
    </div>
  );
}
