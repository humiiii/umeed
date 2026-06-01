'use client';

import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center relative overflow-hidden">
      {/* Animated ambient mesh glow in the background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-r from-violet-600/10 via-pink-500/10 to-emerald-400/10 blur-[100px] pointer-events-none rounded-full animate-pulse-slow" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6 relative z-10"
      >        
        <h1 className="text-7xl sm:text-9xl font-black tracking-tight select-none">
            Umeed
        </h1>
      </motion.div>
    </div>
  );
}
