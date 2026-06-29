import React from "react";
import { motion } from "framer-motion";

export const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <motion.h1
        className="text-6xl md:text-8xl font-black text-white relative tracking-tighter"
        initial={{ backgroundPosition: "100% 50%" }}
        animate={{ backgroundPosition: "0% 50%" }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{
          background: "linear-gradient(90deg, #FFFFFF 0%, #FF8C00 50%, #FFFFFF 100%)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}
      >
        KUFULULA
      </motion.h1>
      <div className="absolute bottom-10 text-zinc-600 font-mono text-xs uppercase tracking-widest">
        version 1.0.0
      </div>
    </motion.div>
  );
};
