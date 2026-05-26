import React, { useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { Coins, PiggyBank, ArrowRight, Languages } from 'lucide-react';

export default function SetupScreen() {
  const setupUser = useFinanceStore(state => state.setupUser);
  const [startingBalance, setStartingBalance] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [emergencyReserve, setEmergencyReserve] = useState('');
  const [cycleStartDate, setCycleStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [lang, setLang] = useState('en');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startingBalance || Number(startingBalance) < 0) {
      alert(lang === 'en' ? 'Please enter a valid starting balance.' : 'অনুগ্রহ করে সঠিক প্রারম্ভিক ব্যালেন্স লিখুন।');
      return;
    }
    setupUser(startingBalance, monthlyIncome, emergencyReserve, cycleStartDate);
  };

  const t = {
    en: {
      welcome: "Welcome to FlowTaka",
      subtitle: "Establish your starting balance and budget constraints to calculate your dynamic daily allowance.",
      startBal: "Current Total Money (৳)",
      startBalSub: "All cash, bank accounts, and mobile wallets combined",
      monthlyInc: "Expected Monthly Income (৳)",
      monthlyIncSub: "Used to compute progress metrics",
      reserve: "Emergency Reserve (৳)",
      reserveSub: "Locked away, excluded from daily spending limit",
      cycleStart: "Billing Cycle Start Date",
      cycleStartSub: "Resets your 30-day budget period",
      button: "Establish Ledger",
    },
    bn: {
      welcome: "ফ্লোটাকা-তে স্বাগতম",
      subtitle: "আপনার দৈনিক খরচের হিসাব স্বয়ংক্রিয়ভাবে পরিচালনা করতে ব্যালেন্স ও বাজেট সেট করুন।",
      startBal: "মোট বর্তমান টাকা (৳)",
      startBalSub: "নগদ টাকা, ব্যাংক ও মোবাইল ওয়ালেটের মোট হিসাব",
      monthlyInc: "প্রত্যাশিত মাসিক আয় (৳)",
      monthlyIncSub: "আপনার মাসিক অগ্রগতি পরিমাপের জন্য ব্যবহৃত হবে",
      reserve: "জরুরী তহবিল (৳)",
      reserveSub: "এই টাকাটি আপনার দৈনিক খরচের হিসাবের বাইরে থাকবে",
      cycleStart: "হিসাব চক্র শুরুর তারিখ",
      cycleStartSub: "প্রতি ৩০ দিনে বাজেট চক্র পুনরায় শুরু হবে",
      button: "হিসাব শুরু করুন",
    }
  }[lang];

  return (
    <div className="min-h-svh w-full flex flex-col justify-between p-6 relative overflow-hidden bg-slate-950">
      {/* Background glowing ambient spots */}
      <div className="ambient-glow -top-20 -left-20 bg-emerald-500/10"></div>
      <div className="ambient-glow -bottom-20 -right-20 bg-cyan-500/10"></div>

      {/* Language Selector Header */}
      <header className="flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            FlowTaka
          </span>
        </div>
        <button
          onClick={() => setLang(l => l === 'en' ? 'bn' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <Languages className="w-3.5 h-3.5" />
          {lang === 'en' ? 'বাংলা' : 'English'}
        </button>
      </header>

      {/* Form Content */}
      <main className="my-auto py-8 z-10 max-w-sm w-full mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            {t.welcome}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Starting Balance */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              {t.startBal}
            </label>
            <input
              type="number"
              inputMode="numeric"
              required
              placeholder="e.g. 35000"
              value={startingBalance}
              onChange={e => setStartingBalance(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
            />
            <p className="text-[11px] text-slate-500">{t.startBalSub}</p>
          </div>

          {/* Monthly Income */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-cyan-400" />
              {t.monthlyInc}
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 25000"
              value={monthlyIncome}
              onChange={e => setMonthlyIncome(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
            />
            <p className="text-[11px] text-slate-500">{t.monthlyIncSub}</p>
          </div>

          {/* Emergency Reserve */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Coins className="w-4 h-4 text-purple-400" />
              {t.reserve} <span className="text-[10px] text-slate-500 font-normal">({lang === 'en' ? 'optional' : 'ঐচ্ছিক'})</span>
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 5000"
              value={emergencyReserve}
              onChange={e => setEmergencyReserve(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-all font-medium"
            />
            <p className="text-[11px] text-slate-500">{t.reserveSub}</p>
          </div>

          {/* Cycle Start Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              {t.cycleStart}
            </label>
            <input
              type="date"
              value={cycleStartDate}
              onChange={e => setCycleStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-amber-500/50 transition-all font-medium"
            />
            <p className="text-[11px] text-slate-500">{t.cycleStartSub}</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 active:scale-95 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all cursor-pointer"
          >
            {t.button}
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </form>
      </main>

      {/* Footer Branding */}
      <footer className="text-center text-[10px] text-slate-600 py-2 z-10">
        FlowTaka 1.0.0 • Mobile Ledger Platform
      </footer>
    </div>
  );
}
