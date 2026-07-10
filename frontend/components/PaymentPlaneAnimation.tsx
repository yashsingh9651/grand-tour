'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, AlertTriangle, CheckCircle, Cloud, HelpCircle, Clock } from 'lucide-react'

interface PaymentPlaneAnimationProps {
  status: 'COMPLETED' | 'FAILED' | 'PENDING'
}

export default function PaymentPlaneAnimation({ status }: PaymentPlaneAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(true)

  return (
    <div className="relative w-full h-44 rounded-3xl overflow-hidden bg-slate-950 border border-border flex flex-col justify-center items-center select-none shadow-inner">
      {/* Sky background layers */}
      {status === 'COMPLETED' && (
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950 via-slate-900 to-indigo-950 opacity-90 transition-all duration-500" />
      )}
      {status === 'PENDING' && (
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 opacity-90 transition-all duration-500" />
      )}
      {status === 'FAILED' && (
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950 via-slate-900 to-stone-950 opacity-90 transition-all duration-500" />
      )}

      {/* Clouds in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div
          animate={{ x: [-200, 600] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          className="absolute top-6 left-0 text-white"
        >
          <Cloud className="w-10 h-10" />
        </motion.div>
        <motion.div
          animate={{ x: [600, -200] }}
          transition={{ repeat: Infinity, duration: 35, ease: 'linear' }}
          className="absolute top-20 left-0 text-white"
        >
          <Cloud className="w-14 h-14" />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'COMPLETED' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10"
          >
            {/* Plane takeoff runway and path */}
            <div className="absolute bottom-4 left-6 right-6 h-[2px] bg-dashed bg-white/20" />
            
            <motion.div
              initial={{ x: -120, y: 30, rotate: 0, scale: 0.8 }}
              animate={{ 
                x: [ -120, -60, 0, 180 ],
                y: [ 30, 25, -10, -80 ],
                rotate: [ 0, 5, -15, -25 ],
                scale: [ 0.8, 0.9, 1.1, 0.7 ]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                repeatDelay: 1,
                ease: 'easeInOut' 
              }}
              className="absolute text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]"
            >
              <div className="relative">
                <Plane className="w-10 h-10 transform rotate-[45deg]" />
                {/* Engine fire/trail */}
                <motion.div 
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 0.15 }}
                  className="absolute -bottom-1 -left-2 w-4 h-2 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full blur-[2px]"
                />
              </div>
            </motion.div>

            {/* Status text */}
            <div className="absolute bottom-6 text-center">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 mx-auto w-fit">
                <CheckCircle className="w-3.5 h-3.5" /> Flight Cleared • Verified
              </span>
            </div>
          </motion.div>
        )}

        {status === 'PENDING' && (
          <motion.div
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10"
          >
            {/* Plane circling */}
            <motion.div
              animate={{ 
                rotate: 360,
                x: [0, 60, 0, -60, 0],
                y: [0, 15, 0, -15, 0]
              }}
              transition={{ 
                rotate: { repeat: Infinity, duration: 12, ease: 'linear' },
                x: { repeat: Infinity, duration: 6, ease: 'easeInOut' },
                y: { repeat: Infinity, duration: 3, ease: 'easeInOut' }
              }}
              className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
            >
              <Plane className="w-10 h-10 transform rotate-[45deg]" />
            </motion.div>

            {/* Circular radar rings */}
            <div className="absolute w-28 h-28 border border-amber-500/10 rounded-full animate-ping opacity-30" />

            <div className="absolute bottom-6 text-center">
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 mx-auto w-fit animate-pulse">
                <Clock className="w-3.5 h-3.5" /> Circling Runway • Under Review
              </span>
            </div>
          </motion.div>
        )}

        {status === 'FAILED' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10"
          >
            {/* Plane spinning and crashing */}
            <motion.div
              animate={{ 
                x: [-120, -40, 40, 80],
                y: [-60, -30, 20, 65],
                rotate: [45, 90, 160, 220],
                scale: [1, 0.9, 0.8, 0.3]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: 'easeIn'
              }}
              className="absolute text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"
            >
              <div className="relative">
                <Plane className="w-10 h-10" />
                {/* Smoke Trail */}
                <div className="absolute top-2 -left-6 w-6 h-2 bg-gradient-to-r from-transparent to-stone-600 rounded-full blur-[2px]" />
              </div>
            </motion.div>

            {/* Crash Explosion/Alert Effect at the bottom right */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0, 1, 0],
                scale: [0, 0, 1.5, 0]
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeOut'
              }}
              className="absolute bottom-2 right-12 w-8 h-8 rounded-full bg-orange-600 blur-sm"
            />

            <div className="absolute bottom-6 text-center">
              <span className="text-[10px] uppercase font-black tracking-widest text-rose-400 bg-rose-950/60 border border-rose-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 mx-auto w-fit">
                <AlertTriangle className="w-3.5 h-3.5" /> Flight Aborted • Rejected
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
