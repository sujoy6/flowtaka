import React from 'react';
import { useFinanceStore } from '../store/financeStore';
import { Plus, Mic, ArrowDownLeft, ArrowUpRight, Repeat, Trash, Calendar, ShieldAlert } from 'lucide-react';

export default function Dashboard({ onOpenAdd, onOpenVoice }) {
  const transactions = useFinanceStore(state => state.transactions);
  const deleteTransaction = useFinanceStore(state => state.deleteTransaction);
  const addTransaction = useFinanceStore(state => state.addTransaction);
  const language = useFinanceStore(state => state.language);
  
  // Custom finance getters
  const getCurrentBalance = useFinanceStore(state => state.getCurrentBalance);
  const getUsableBalance = useFinanceStore(state => state.getUsableBalance);
  const getSafeToSpendToday = useFinanceStore(state => state.getSafeToSpendToday);
  const getRemainingDays = useFinanceStore(state => state.getRemainingDays);
  const getSubscriptionBurden = useFinanceStore(state => state.getSubscriptionBurden);
  const getDebtHealthScore = useFinanceStore(state => state.getDebtHealthScore);
  const emergencyReserve = useFinanceStore(state => state.emergencyReserve);

  const currentBalance = getCurrentBalance();
  const usableBalance = getUsableBalance();
  const safeToSpend = getSafeToSpendToday();
  const remainingDays = getRemainingDays();
  const subBurden = getSubscriptionBurden();
  const debtHealth = getDebtHealthScore();

  const t = {
    en: {
      safeTitle: "Safe to Spend Today",
      currentBal: "Total Balance",
      usable: "Usable Cash",
      reserve: "Reserve",
      daysLeft: "{days} days left in cycle",
      debtMeter: "Debt Risk",
      timeline: "Recent Activity",
      repeat: "Repeat",
      noActivity: "No transactions recorded yet. Tap below to log.",
      insightText: "Dynamic daily spending allowance adjusts automatically after every expense.",
      lowBalance: "Balance Alert: Low capital reserves!"
    },
    bn: {
      safeTitle: "আজকের খরচ সীমা",
      currentBal: "মোট ব্যালেন্স",
      usable: "ব্যবহারযোগ্য ক্যাশ",
      reserve: "জরুরী তহবিল",
      daysLeft: "চক্রের আর {days} দিন বাকি",
      debtMeter: "ঋণ ঝুঁকি",
      timeline: "সাম্প্রতিক হিসাব",
      repeat: "পুনরাবৃত্তি",
      noActivity: "এখনো কোনো হিসাব যোগ করা হয়নি। নিচে ক্লিক করে যোগ করুন।",
      insightText: "প্রতিবার খরচের পর আজকের সর্বোচ্চ ব্যয়ের লিমিট স্বয়ংক্রিয়ভাবে পরিবর্তিত হয়।",
      lowBalance: "ব্যালেন্স এলার্ট: আপনার সঞ্চিত অর্থ খুব কম!"
    }
  }[language];

  // Repeat transaction helper
  const handleRepeat = (trans) => {
    addTransaction(trans.amount, trans.type, trans.description, 'manual');
  };

  // Helper colors
  const getDebtColorClass = () => {
    if (debtHealth.level === 'safe') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (debtHealth.level === 'manageable') return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    return 'bg-rose-500/10 border-rose-500/20 text-rose-500';
  };

  // Format date helper
  const formatDateLabel = (isoString) => {
    const d = new Date(isoString);
    if (language === 'bn') {
      return `${d.getDate()}/${d.getMonth() + 1} • ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` • ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-24 relative">
      
      {/* 1. Safe to Spend & Dynamic cycle days */}
      <div className="p-6 rounded-3xl border border-slate-850 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-center relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute -left-16 -top-16 w-32 h-32 rounded-full bg-emerald-500/10 filter blur-2xl"></div>
        <div className="absolute -right-16 -bottom-16 w-32 h-32 rounded-full bg-cyan-500/10 filter blur-2xl"></div>

        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1">
          {t.safeTitle}
        </span>
        <h2 className="text-4xl font-extrabold text-white tracking-tight flex justify-center items-center gap-1">
          <span className="text-3xl text-emerald-400 font-bold">৳</span>
          {safeToSpend.toLocaleString('en-US')}
        </h2>
        
        {/* Cycle Days Indicator */}
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-3 py-1 rounded-full inline-block mt-3">
          {t.daysLeft.replace('{days}', remainingDays)}
        </span>

        {/* Usable vs Reserve split */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-900/80 text-left">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">{t.usable}</span>
            <p className="text-sm font-bold text-slate-200">৳{usableBalance.toLocaleString('en-US')}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">{t.reserve}</span>
            <p className="text-sm font-bold text-slate-400">৳{emergencyReserve.toLocaleString('en-US')}</p>
          </div>
        </div>
      </div>

      {/* 2. Micro Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current Balance */}
        <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex justify-between items-center glass">
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-semibold block">{t.currentBal}</span>
            <span className="text-md font-extrabold text-white">৳{currentBalance.toLocaleString('en-US')}</span>
          </div>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentBalance > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {currentBalance > 0 ? <ArrowDownLeft className="w-4.5 h-4.5" /> : <ArrowUpRight className="w-4.5 h-4.5" />}
          </div>
        </div>

        {/* Debt Health Indicator */}
        <div className={`p-4 border rounded-2xl flex justify-between items-center ${getDebtColorClass()}`}>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-semibold block">{t.debtMeter}</span>
            <span className="text-xs font-extrabold uppercase">{language === 'en' ? debtHealth.level : (debtHealth.level === 'safe' ? 'নিরাপদ' : (debtHealth.level === 'manageable' ? 'সহনশীল' : 'ঝুঁকিপূর্ণ'))}</span>
          </div>
          <div className="text-right">
            <span className="text-md font-black">{debtHealth.score}%</span>
          </div>
        </div>
      </div>

      {/* 3. Small Info Text */}
      <p className="text-[10px] text-slate-500 leading-normal text-center italic px-4">
        {t.insightText}
      </p>

      {/* 4. Low Balance Alert if balance <= emergencyReserve */}
      {currentBalance <= emergencyReserve && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-pulse">
          <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
          <span>{t.lowBalance}</span>
        </div>
      )}

      {/* 5. Timeline Activities */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.timeline}</h3>
          <span className="text-[10px] text-slate-500">{transactions.length} total</span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/20 border border-slate-850 rounded-2xl">
            <p className="text-xs text-slate-500 leading-relaxed">{t.noActivity}</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto no-scrollbar">
            {transactions.slice(0, 15).map((trans) => (
              <div 
                key={trans.id} 
                className="p-3.5 rounded-2xl border border-slate-850 bg-slate-900/30 hover:border-slate-850/80 flex justify-between items-center gap-3 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                    trans.type === 'in' 
                      ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/15 text-rose-400'
                  }`}>
                    {trans.type === 'in' ? <ArrowDownLeft className="w-4.5 h-4.5" /> : <ArrowUpRight className="w-4.5 h-4.5" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate max-w-[150px]">{trans.description}</h4>
                    <p className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {formatDateLabel(trans.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`text-xs font-extrabold ${trans.type === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trans.type === 'in' ? '+' : '-'}৳{trans.amount}
                  </span>
                  
                  {/* Actions: Repeat & Delete */}
                  <div className="flex gap-1 border-l border-slate-850 pl-2">
                    <button 
                      onClick={() => handleRepeat(trans)} 
                      title={t.repeat}
                      className="w-6.5 h-6.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-cyan-400 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => deleteTransaction(trans.id)} 
                      className="w-6.5 h-6.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-rose-400 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
