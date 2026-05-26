import React, { useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { UserMinus, UserPlus, Trash, ChevronDown, Check, Coins, Calendar } from 'lucide-react';

export default function DebtManager() {
  const debts = useFinanceStore(state => state.debts);
  const addRepayment = useFinanceStore(state => state.addRepayment);
  const settleDebt = useFinanceStore(state => state.settleDebt);
  const deleteTransaction = useFinanceStore(state => state.deleteTransaction); // We just filter active
  const language = useFinanceStore(state => state.language);
  const getDebtHealthScore = useFinanceStore(state => state.getDebtHealthScore);

  const [activeTab, setActiveTab] = useState('borrowed'); // 'borrowed' or 'lent'
  const [selectedDebtId, setSelectedDebtId] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');

  const health = getDebtHealthScore();

  const t = {
    en: {
      healthTitle: "Debt Risk Indicator",
      safe: "Safe Level",
      manageable: "Manageable",
      dangerous: "Critical Risk",
      borrowedTab: "Money Borrowed",
      lentTab: "Money Lent",
      person: "Person",
      amount: "Total Amount",
      repaid: "Repaid",
      remaining: "Remaining",
      dueDate: "Due",
      actions: "Actions",
      payBtn: "Log Repayment",
      settleBtn: "Settle All",
      noDebts: "No active records found in this category.",
      history: "Settled History",
      partialLabel: "Partial Repayment (৳)",
      activeLabel: "Active Debts"
    },
    bn: {
      healthTitle: "ঋণের ঝুঁকি পরিমাপক",
      safe: "নিরাপদ মাত্রা",
      manageable: "নিয়ন্ত্রণযোগ্য",
      dangerous: "ঝুঁকিপূর্ণ মাত্রা",
      borrowedTab: "ধার নিয়েছি",
      lentTab: "ধার দিয়েছি",
      person: "ব্যক্তি",
      amount: "মোট পরিমাণ",
      repaid: "পরিশোধিত",
      remaining: "অবশিষ্ট",
      dueDate: "ফেরতের ডেট",
      actions: "অ্যাকশন",
      payBtn: "টাকা দিন",
      settleBtn: "সম্পূর্ণ শোধ",
      noDebts: "এই ক্যাটাগরিতে কোনো ঋণের রেকর্ড নেই।",
      history: "পরিশোধিত ঋণের ইতিহাস",
      partialLabel: "আংশিক পরিশোধ (৳)",
      activeLabel: "চলতি ঋণের তালিকা"
    }
  }[language];

  // Group debts
  const activeDebts = debts.filter(d => d.status === 'active' && d.type === activeTab);
  const settledDebts = debts.filter(d => d.status === 'settled');

  const handleRepaySubmit = (e, debtId) => {
    e.preventDefault();
    const amountVal = parseFloat(repayAmount);
    if (!amountVal || amountVal <= 0) {
      alert(language === 'en' ? 'Please enter a valid amount' : 'অনুগ্রহ করে সঠিক পরিমাণ লিখুন।');
      return;
    }
    addRepayment(debtId, amountVal);
    setRepayAmount('');
    setSelectedDebtId(null);
  };

  const getHealthColor = () => {
    if (health.level === 'safe') return 'text-emerald-400 stroke-emerald-500';
    if (health.level === 'manageable') return 'text-amber-400 stroke-amber-500';
    return 'text-rose-500 stroke-rose-600';
  };

  const getHealthBg = () => {
    if (health.level === 'safe') return 'bg-emerald-500/10 border-emerald-500/20';
    if (health.level === 'manageable') return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* 1. Debt Health Meter Widget */}
      <div className={`p-4 rounded-3xl border glass transition-all ${getHealthBg()}`}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.healthTitle}</span>
          <span className={`text-xs font-bold uppercase ${getHealthColor()}`}>
            {t[health.level]}
          </span>
        </div>
        
        <div className="flex items-center gap-5">
          {/* Custom SVG Gauge */}
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                className="stroke-slate-800"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${getHealthColor()} transition-all duration-1000`}
                strokeWidth="3.5"
                strokeDasharray={`${health.score}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-extrabold text-white">{health.score}%</span>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <p className="text-xs text-slate-400 leading-normal">
              {language === 'en' 
                ? "Maintain a high score by lending less than your capital capacity and repaying debts promptly." 
                : "পাওনা টাকা আদায় ও দেনা পরিশোধের মাধ্যমে স্কোর উন্নত রাখুন।"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Debt Tabs */}
      <div className="flex gap-2 p-1 bg-slate-900 border border-slate-850 rounded-2xl">
        <button
          onClick={() => setActiveTab('borrowed')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
            activeTab === 'borrowed'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-md'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          {t.borrowedTab}
        </button>
        <button
          onClick={() => setActiveTab('lent')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
            activeTab === 'lent'
              ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 shadow-md'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          {t.lentTab}
        </button>
      </div>

      {/* 3. Debt List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.activeLabel}</h3>

        {activeDebts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/30 rounded-2xl border border-slate-850">
            <p className="text-xs text-slate-500">{t.noDebts}</p>
          </div>
        ) : (
          activeDebts.map((debt) => {
            const totalRepaid = debt.repayments.reduce((sum, r) => sum + r.amount, 0);
            const remaining = Math.max(0, debt.amount - totalRepaid);
            const isSelected = selectedDebtId === debt.id;

            return (
              <div 
                key={debt.id} 
                className={`p-4 rounded-3xl border glass transition-all space-y-4 ${
                  isSelected ? 'border-slate-700/80 shadow-[0_0_20px_rgba(255,255,255,0.02)]' : 'border-slate-850 hover:border-slate-800'
                }`}
              >
                {/* Header Information */}
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setSelectedDebtId(isSelected ? null : debt.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${
                      debt.type === 'borrowed' 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                        : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                    }`}>
                      {debt.type === 'borrowed' ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{debt.person}</h4>
                      {debt.note && <p className="text-[10px] text-slate-500">{debt.note}</p>}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white">৳{remaining}</span>
                    {debt.dueDate && (
                      <p className="text-[9px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        {debt.dueDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Micro Progress bar */}
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      debt.type === 'borrowed' ? 'bg-amber-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${(totalRepaid / debt.amount) * 100}%` }}
                  />
                </div>

                {/* Sub info */}
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{t.amount}: ৳{debt.amount}</span>
                  <span>{t.repaid}: ৳{totalRepaid}</span>
                </div>

                {/* Action forms shown if row is selected */}
                {isSelected && (
                  <div className="pt-3 border-t border-slate-800 space-y-3 animate-fade-in">
                    
                    {/* Log Repayment Form */}
                    <form onSubmit={(e) => handleRepaySubmit(e, debt.id)} className="flex gap-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        required
                        placeholder={t.partialLabel}
                        value={repayAmount}
                        onChange={e => setRepayAmount(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-700 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        {t.payBtn}
                      </button>
                    </form>

                    {/* Settle Debt Button */}
                    <button
                      type="button"
                      onClick={() => {
                        settleDebt(debt.id);
                        setSelectedDebtId(null);
                      }}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      {t.settleBtn}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Settled Debt History */}
      {settledDebts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.history}</h3>
          
          <div className="space-y-2 max-h-[180px] overflow-y-auto no-scrollbar">
            {settledDebts.map(debt => (
              <div 
                key={debt.id}
                className="p-3.5 bg-slate-950/20 border border-slate-850 rounded-2xl flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-slate-500" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">{debt.person}</h4>
                    <span className="text-[9px] text-slate-500">{debt.type === 'borrowed' ? 'Borrowed settled' : 'Lent settled'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs line-through text-slate-500 font-bold">৳{debt.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
