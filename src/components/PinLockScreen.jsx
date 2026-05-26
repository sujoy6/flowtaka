import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { Lock, Delete, ShieldAlert } from 'lucide-react';

export default function PinLockScreen() {
  const pinCode = useFinanceStore(state => state.pinCode);
  const setLocked = useFinanceStore(state => state.setLocked);
  const language = useFinanceStore(state => state.language);
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);

  const t = {
    en: {
      title: "FlowTaka Secured",
      enter: "Enter your 4-digit security PIN",
      mismatch: "Incorrect PIN. Try again.",
    },
    bn: {
      title: "ফ্লোটাকা লকড",
      enter: "আপনার ৪-ডিজিট সিকিউরিটি পিন লিখুন",
      mismatch: "ভুল পিন। আবার চেষ্টা করুন।",
    }
  }[language];

  const handleKeyPress = (num) => {
    if (input.length < 4) {
      const newVal = input + num;
      setInput(newVal);
      if (newVal.length === 4) {
        if (newVal === pinCode) {
          setTimeout(() => {
            setLocked(false);
          }, 150);
        } else {
          // Wrong pin, trigger shake animation
          setTimeout(() => {
            setShake(true);
            setTimeout(() => {
              setShake(false);
              setInput('');
            }, 500);
          }, 150);
        }
      }
    }
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-svh w-full flex flex-col justify-between p-8 relative overflow-hidden bg-slate-950 text-white z-50">
      <div className="ambient-glow -top-20 -right-20 bg-emerald-500/10"></div>
      
      {/* Locked Header */}
      <div className="flex flex-col items-center mt-12 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <Lock className="w-5 h-5 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">{t.title}</h2>
        <p className="text-xs text-slate-400">{t.enter}</p>
      </div>

      {/* Code Dots */}
      <div className="flex justify-center items-center gap-4 my-8">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
              shake 
                ? 'border-red-500 bg-red-500/30 animate-bounce' 
                : index < input.length 
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 border-transparent scale-125 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                  : 'border-slate-700 bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Numerical Keypad */}
      <div className="max-w-xs w-full mx-auto mb-12">
        <div className="grid grid-cols-3 gap-y-4 gap-x-6 text-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="py-4 text-2xl font-semibold bg-slate-900/50 active:bg-slate-800 border border-slate-900 hover:border-slate-800 rounded-2xl transition-all cursor-pointer"
            >
              {num}
            </button>
          ))}
          
          {/* Empty spacer */}
          <div />
          
          <button
            onClick={() => handleKeyPress(0)}
            className="py-4 text-2xl font-semibold bg-slate-900/50 active:bg-slate-800 border border-slate-900 hover:border-slate-800 rounded-2xl transition-all cursor-pointer"
          >
            0
          </button>
          
          <button
            onClick={handleDelete}
            className="py-4 flex items-center justify-center text-slate-400 hover:text-white bg-slate-900/50 active:bg-slate-800 rounded-2xl cursor-pointer"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
        
        {shake && (
          <div className="flex items-center justify-center gap-1.5 mt-6 text-red-400 text-xs font-semibold animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            {t.mismatch}
          </div>
        )}
      </div>
    </div>
  );
}
