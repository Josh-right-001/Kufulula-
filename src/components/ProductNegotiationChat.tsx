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
  
  // Vendor data
  const vendorName = product.vendor || "Marchand";
  const vendorAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${vendorName}`;

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

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#000000] font-sans">
      {/* iOS WhatsApp Header */}
      <div className="flex items-center justify-between px-2 pt-12 pb-2 bg-[#1C1C1E] border-b border-[#2C2C2E] text-white">
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="p-2 text-[#0A84FF] hover:opacity-80 flex items-center gap-1">
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
        <div className="flex items-center gap-4 pr-4 text-[#0A84FF]">
          <Video className="w-6 h-6" />
          <Phone className="w-6 h-6" />
        </div>
      </div>

      {/* WhatsApp Chat Area background pattern (simulated) */}
      <div className="flex-1 overflow-y-auto bg-[#000000] relative px-4 py-6"
           style={{ backgroundImage: "radial-gradient(#2C2C2E 1px, transparent 1px)", backgroundSize: "20px 20px", opacity: 0.8 }}>
        
        {/* Product reference bubble */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#1C1C1E] text-zinc-300 text-[11px] px-4 py-1.5 rounded-full border border-[#2C2C2E]">
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
                    isUser 
                      ? 'bg-[#007AFF] text-white rounded-br-none' 
                      : 'bg-[#1C1C1E] text-white rounded-bl-none border border-[#2C2C2E]'
                  }`}
                >
                  {msg.type === 'image' && msg.mediaUrl && (
                    <img src={msg.mediaUrl} alt="Attached" className="w-full max-w-sm rounded-xl mb-2 object-cover" />
                  )}
                  {msg.text && <p className="mb-3 pr-8">{msg.text}</p>}
                  <span className={`absolute bottom-1.5 right-2.5 text-[10px] ${isUser ? 'text-blue-200' : 'text-zinc-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#1C1C1E] text-white rounded-2xl rounded-bl-none px-4 py-3 border border-[#2C2C2E] flex items-center gap-1">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* iOS WhatsApp Input Area */}
      <div className="bg-[#1C1C1E] pb-safe border-t border-[#2C2C2E]">
        <div className="flex items-end px-2 py-2 gap-2">
          <button onClick={handleAttachment} className="p-2 text-[#0A84FF] shrink-0 mb-1">
            <Plus className="w-6 h-6" />
          </button>
          
          <form onSubmit={handleSendMessage} className="flex-1 flex items-end relative bg-[#000000] border border-[#2C2C2E] rounded-[20px]">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message"
              className="w-full bg-transparent text-white px-4 py-2 min-h-[40px] focus:outline-none text-[16px]"
            />
            <button type="button" className="p-2 text-[#0A84FF] shrink-0">
              <Smile className="w-5 h-5" />
            </button>
          </form>

          {inputText.trim() ? (
            <button onClick={(e) => handleSendMessage(e)} className="p-2 bg-[#0A84FF] text-white rounded-full shrink-0 mb-1 w-10 h-10 flex items-center justify-center">
              <Send className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <div className="flex items-center gap-1 mb-1">
              <button className="p-2 text-[#0A84FF]">
                <Camera className="w-6 h-6" />
              </button>
              <button className="p-2 text-[#0A84FF]">
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
