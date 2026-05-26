import React, { useState, useEffect, useRef } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { X, Check, ArrowDownCircle, ArrowUpCircle, UserMinus, UserPlus, Calendar } from 'lucide-react';

export default function AddTransactionModal({ isOpen, onClose }) {
  const addTransaction = useFinanceStore(state => state.addTransaction);
  const addDebt = useFinanceStore(state => state.addDebt);
  const language = useFinanceStore(state => state.language);
  const transactions = useFinanceStore(state => state.transactions);

  const [type, setType] = useState('out'); // 'in', 'out', 'borrowed', 'lent'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [person, setPerson] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const descInputRef = useRef(null);

  // Auto suggestions based on past entries
  const [suggestions, setSuggestions] = useState([]);
  
  useEffect(() => {
    if (description.trim().length > 0) {
      const uniqueSuggestions = Array.from(
        new Set(
          transactions
            .filter(t => t.description.toLowerCase().includes(description.toLowerCase()))
            .map(t => t.description)
        )
      ).slice(0, 3);
      setSuggestions(uniqueSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [description, transactions]);

  if (!isOpen) return null;

  const t = {
    en: {
      amount: "Amount (৳)",
      desc: "Description / Notes",
      suggest: "Suggestions",
      date: "Date",
      save: "Save Transaction",
      person: "Person Name",
      dueDate: "Due Date",
      in: "Money In",
      out: "Money Out",
      borrowed: "Borrowed",
      lent: "Lent",
      placeholderDesc: "e.g. Lunch, Rickshaw, Salary",
      placeholderPerson: "e.g. Rakib, Mom, Sumon",
    },
    bn: {
      amount: "পরিমাণ (৳)",
      desc: "বিবরণ / নোট",
      suggest: "পরামর্শ",
      date: "তারিখ",
      save: "হিসাব রাখুন",
      person: "ব্যক্তির নাম",
      dueDate: "ফেরতের শেষ তারিখ",
      in: "টাকা জমা",
      out: "টাকা খরচ",
      borrowed: "ধার নিলাম",
      lent: "ধার দিলাম",
      placeholderDesc: "যেমন: দুপুরের খাবার, রিকশাভাড়া, বেতন",
      placeholderPerson: "যেমন: রাকিব, মা, সুমন",
    }
  }[language];

  // Number pad helper
  const handleNumPress = (val) => {
    if (val === '.') {
      if (!amount.includes('.')) {
        setAmount(prev => (prev === '' ? '0.' : prev + '.'));
      }
    } else {
      setAmount(prev => prev + val);
    }
  };

  const handleBackspace = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  const handleQuickChip = (val) => {
    setAmount(prev => {
      const current = parseFloat(prev) || 0;
      return (current + val).toString();
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const amountVal = parseFloat(amount);
    if (!amountVal || amountVal <= 0) {
      alert(language === 'en' ? 'Please enter a valid amount.' : 'অনুগ্রহ করে সঠিক পরিমাণ লিখুন।');
      return;
    }

    if (type === 'borrowed' || type === 'lent') {
      if (!person.trim()) {
        alert(language === 'en' ? 'Please enter a name.' : 'অনুগ্রহ করে ব্যক্তির নাম লিখুন।');
        return;
      }
      addDebt(person.trim(), amountVal, type, dueDate, description.trim());
    } else {
      // Normal transaction
      const descVal = description.trim() || (type === 'in' ? 'Income' : 'Expense');
      addTransaction(amountVal, type, descVal, 'manual', date);
    }

    // Reset fields and close
    setAmount('');
    setDescription('');
    setPerson('');
    setDueDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Invisible close trigger on tap outside */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Slide up sheet */}
      <div className="relative w-full max-w-md bg-slate-900/95 border-t border-slate-800 rounded-t-[32px] shadow-[0_-15px_40px_rgba(0,0,0,0.5)] z-10 overflow-hidden max-h-[92svh] flex flex-col animate-slide-up">
        {/* Decorative drag handle */}
        <div className="w-12 h-1.5 bg-slate-700/50 rounded-full mx-auto my-3 cursor-pointer" onClick={onClose}></div>
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 pb-2">
          <h2 className="text-lg font-bold text-white">
            {type === 'borrowed' || type === 'lent' 
              ? (language === 'en' ? 'Add Debt Record' : 'ঋণের হিসাব যোগ করুন')
              : (language === 'en' ? 'Quick Add Entry' : 'নতুন হিসাব যোগ')}
          </h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 no-scrollbar">
          
          {/* Quick Transaction Type Selector */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80">
            {[
              { id: 'out', label: t.out, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
              { id: 'in', label: t.in, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { id: 'borrowed', label: t.borrowed, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
              { id: 'lent', label: t.lent, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all text-center cursor-pointer ${
                  type === item.id 
                    ? item.color + ' shadow-[0_0_10px_rgba(255,255,255,0.02)]' 
                    : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Amount Display with interactive input */}
          <div className="text-center py-3 bg-slate-950/40 rounded-2xl border border-slate-800/40 relative">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">{t.amount}</span>
            <div className="flex justify-center items-center gap-1">
              <span className="text-xl text-slate-400 font-bold">৳</span>
              <input
                type="text"
                readOnly
                placeholder="0"
                value={amount}
                className="text-3xl font-extrabold text-white bg-transparent outline-none border-none text-center max-w-[200px]"
              />
            </div>
            {/* Quick increase chips */}
            <div className="flex justify-center gap-2 mt-2 px-3">
              {[100, 500, 1000, 2000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickChip(val)}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-800 border border-slate-700 text-slate-300 active:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                >
                  +৳{val}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional inputs for Debts */}
          {(type === 'borrowed' || type === 'lent') && (
            <div className="space-y-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  {type === 'borrowed' ? <UserMinus className="w-3 h-3 text-amber-400" /> : <UserPlus className="w-3 h-3 text-cyan-400" />}
                  {t.person}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.placeholderPerson}
                  value={person}
                  onChange={e => setPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {t.dueDate}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
            </div>
          )}

          {/* Description & Note input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 block">{t.desc}</label>
            <input
              type="text"
              ref={descInputRef}
              placeholder={t.placeholderDesc}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-slate-700 transition-all"
            />
            {/* Auto Suggestions list */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {suggestions.map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setDescription(sug);
                      setSuggestions([]);
                    }}
                    className="px-2 py-1 text-[10px] rounded-md bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Non-debt standard date picker */}
          {type !== 'borrowed' && type !== 'lent' && (
            <div className="flex gap-4 items-center bg-slate-950/20 p-2.5 border border-slate-850 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400">{t.date}</span>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-transparent border-none text-white text-xs outline-none flex-1 font-semibold"
              />
            </div>
          )}

          {/* Numeric Keypad layout for fast thumbs */}
          <div className="grid grid-cols-3 gap-1.5 max-w-[280px] mx-auto py-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumPress(num.toString())}
                className="py-2.5 text-lg font-bold bg-slate-950/40 hover:bg-slate-800 active:bg-slate-900 border border-slate-800/40 hover:border-slate-700/60 rounded-xl transition-all cursor-pointer text-white"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleNumPress('.')}
              className="py-2.5 text-lg font-bold bg-slate-950/40 hover:bg-slate-800 rounded-xl cursor-pointer text-slate-400"
            >
              .
            </button>
            <button
              type="button"
              onClick={() => handleNumPress('0')}
              className="py-2.5 text-lg font-bold bg-slate-950/40 hover:bg-slate-800 rounded-xl cursor-pointer text-white"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-2.5 text-xs font-semibold bg-slate-950/40 hover:bg-rose-950/40 rounded-xl cursor-pointer text-slate-400 active:text-rose-400"
            >
              DEL
            </button>
          </div>

          {/* Save Action */}
          <button
            type="submit"
            className="w-full py-3.5 mt-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] active:scale-95 transition-all cursor-pointer text-sm"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            {t.save}
          </button>
        </form>
      </div>
    </div>
  );
}
