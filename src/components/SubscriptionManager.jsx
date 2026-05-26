import React, { useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { Plus, Trash, CreditCard, Calendar, Check, AlertCircle } from 'lucide-react';

export default function SubscriptionManager() {
  const subscriptions = useFinanceStore(state => state.subscriptions);
  const addSubscription = useFinanceStore(state => state.addSubscription);
  const deleteSubscription = useFinanceStore(state => state.deleteSubscription);
  const getSubscriptionBurden = useFinanceStore(state => state.getSubscriptionBurden);
  const monthlyIncome = useFinanceStore(state => state.monthlyIncome);
  const language = useFinanceStore(state => state.language);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [nextDueDate, setNextDueDate] = useState('');

  const monthlyBurden = getSubscriptionBurden();
  // Percentage of income consumed by subscriptions
  const burdenPercent = monthlyIncome > 0 ? Math.min(100, Math.round((monthlyBurden / monthlyIncome) * 100)) : 0;

  const t = {
    en: {
      burdenTitle: "Monthly Subscription Load",
      burdenDesc: "consumes {percent}% of your monthly income.",
      addBtn: "Add Subscription",
      nameLabel: "Subscription Name",
      amountLabel: "Amount (৳)",
      freqLabel: "Frequency",
      dateLabel: "Next Due Date",
      saveBtn: "Save Recurring Bill",
      cancelBtn: "Cancel",
      noSubs: "No recurring subscriptions configured.",
      monthly: "Monthly",
      yearly: "Yearly",
      placeholderName: "e.g. Netflix, Wifi, Rent",
      activeLabel: "Recurring Payments",
      burdenProjected: "৳{burden} monthly burden"
    },
    bn: {
      burdenTitle: "মাসিক নিয়মিত খরচের লোড",
      burdenDesc: "যা আপনার মাসিক আয়ের {percent}% গ্রহণ করছে।",
      addBtn: "রেকারিং খরচ যোগ করুন",
      nameLabel: "সাবস্ক্রিপশন / খরচের নাম",
      amountLabel: "টাকার পরিমাণ (৳)",
      freqLabel: "ফ্রিকোয়েন্সি (চক্র)",
      dateLabel: "পরবর্তী বিলের তারিখ",
      saveBtn: "সংরক্ষণ করুন",
      cancelBtn: "বাতিল",
      noSubs: "কোনো নিয়মিত খরচ তালিকাভুক্ত নেই।",
      monthly: "মাসিক",
      yearly: "বাৎসরিক",
      placeholderName: "যেমন: নেটফ্লিক্স, ওয়াইফাই বিল, ঘরভাড়া",
      activeLabel: "নিয়মিত খরচসমূহ",
      burdenProjected: "৳{burden} মাসিক আনুমানিক খরচ"
    }
  }[language];

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const amountVal = parseFloat(amount);
    if (!amountVal || amountVal <= 0) return;

    addSubscription(name.trim(), amountVal, frequency, nextDueDate);
    
    // Reset
    setName('');
    setAmount('');
    setFrequency('monthly');
    setNextDueDate('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 pb-24">

      {/* 1. Subscription burden analytics card */}
      <div className="p-5 rounded-3xl border border-slate-850 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 backdrop-blur-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-purple-500/10 filter blur-xl"></div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.burdenTitle}</span>
          <span className="text-xs font-extrabold text-purple-400">
            {t.burdenProjected.replace('{burden}', Math.round(monthlyBurden))}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden mb-3.5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
            style={{ width: `${burdenPercent}%` }}
          />
        </div>

        <p className="text-xs text-slate-400 leading-normal flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <span>
            {language === 'en' 
              ? `Subscriptions and bills consume ${burdenPercent}% of your monthly income (৳${monthlyIncome}). This amount is automatically reserved in Safe-to-Spend calculations.` 
              : `সাবস্ক্রিপশন আপনার মাসিক আয়ের (${monthlyIncome} ৳) প্রায় ${burdenPercent}% খরচ করছে। সেফ-টু-স্পেন্ড গণনায় এই টাকাটি স্বয়ংক্রিয়ভাবে বাদ দেওয়া হয়।`}
          </span>
        </p>
      </div>

      {/* 2. Toggle Add Form Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-850 active:scale-98 border border-slate-800 text-slate-200 font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-md"
        >
          <Plus className="w-4 h-4 text-purple-400" />
          {t.addBtn}
        </button>
      )}

      {/* 3. Add Subscription Form */}
      {showAddForm && (
        <form onSubmit={handleSave} className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 animate-fade-in">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400">{t.nameLabel}</label>
            <input
              type="text"
              required
              placeholder={t.placeholderName}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-700 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">{t.amountLabel}</label>
              <input
                type="number"
                required
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-700 focus:outline-none focus:border-purple-500/50 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">{t.freqLabel}</label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500/50"
              >
                <option value="monthly">{t.monthly}</option>
                <option value="yearly">{t.yearly}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400">{t.dateLabel}</label>
            <input
              type="date"
              value={nextDueDate}
              onChange={e => setNextDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer"
            >
              {t.saveBtn}
            </button>
          </div>
        </form>
      )}

      {/* 4. Subscriptions Feed */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.activeLabel}</h3>

        {subscriptions.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/30 rounded-2xl border border-slate-850">
            <p className="text-xs text-slate-500">{t.noSubs}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div 
                key={sub.id} 
                className="p-4 rounded-3xl border border-slate-850 hover:border-slate-800 glass transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                    <CreditCard className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-normal">{sub.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 px-1.5 py-0.5 rounded-full font-bold">
                        {sub.frequency === 'yearly' ? t.yearly : t.monthly}
                      </span>
                      {sub.nextDueDate && (
                        <span className="text-[9px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {sub.nextDueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-white">৳{sub.amount}</span>
                  <button
                    onClick={() => deleteSubscription(sub.id)}
                    className="w-7 h-7 rounded-full bg-slate-950 border border-slate-850 text-slate-600 hover:text-red-400 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
